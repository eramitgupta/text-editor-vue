import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    watch,
} from 'vue';
import type {
    MentionCallbacks,
    MentionComposableSources,
    MentionDropdownState,
    MentionItem,
    MentionPosition,
} from '../types';
import {
    closestMentionElement,
    detectMentionQuery,
    insertMentionAtRange,
    parseMentionElement,
    removeAdjacentMention,
} from '../utils/mention';
import { getCaretRect } from '../utils/selection';

const DROPDOWN_WIDTH = 280;
const DROPDOWN_MAX_HEIGHT = 320;
const VIEWPORT_PADDING = 12;
const CARET_GAP = 6;
const HOVER_CARD_WIDTH = 240;
const HOVER_CARD_HEIGHT = 76;

export function useMentions(sources: MentionComposableSources, callbacks: MentionCallbacks) {
    const isOpen = shallowRef(false);
    const query = shallowRef('');
    const items = shallowRef<MentionItem[]>([]);
    const activeIndex = shallowRef(0);
    const state = shallowRef<MentionDropdownState>('empty');
    const position = shallowRef<MentionPosition>({ left: VIEWPORT_PADDING, top: VIEWPORT_PADDING });
    const dropdownElement = shallowRef<HTMLElement | null>(null);
    const activeItem = computed(() => items.value[activeIndex.value]);
    const hoverItem = shallowRef<MentionItem | null>(null);
    const hoverPosition = shallowRef<MentionPosition>({
        left: VIEWPORT_PADDING,
        top: VIEWPORT_PADDING,
    });
    const positionStyle = computed(() => ({
        left: `${position.value.left}px`,
        top: `${position.value.top}px`,
    }));
    const hoverPositionStyle = computed(() => ({
        left: `${hoverPosition.value.left}px`,
        top: `${hoverPosition.value.top}px`,
    }));
    const cache = new Map<string, MentionItem[]>();
    const knownItems = new Map<string, MentionItem>();
    let queryRange: Range | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let hoverResizeObserver: ResizeObserver | null = null;
    let positionFrame = 0;
    let hoverPositionFrame = 0;
    let requestSequence = 0;
    let hoveredMention: HTMLElement | null = null;
    let hoverCardElement: HTMLElement | null = null;

    function handleInput(): void {
        const match = sources.root.value ? detectMentionQuery(sources.root.value) : null;
        if (!canOpen() || !match) {
            close();
            return;
        }

        queryRange = match.range.cloneRange();
        query.value = match.query;
        if (match.query.length < sources.config.value.minimumCharacters) {
            close();
            return;
        }

        isOpen.value = true;
        state.value = 'loading';
        activeIndex.value = 0;
        updatePosition();
        scheduleSearch(match.query);
    }

    function handleSelectionChange(): void {
        if (!isOpen.value || !sources.root.value) return;
        const match = detectMentionQuery(sources.root.value);
        if (!match || match.query.length < sources.config.value.minimumCharacters) {
            close();
            return;
        }

        queryRange = match.range.cloneRange();
        if (match.query !== query.value) {
            query.value = match.query;
            state.value = 'loading';
            activeIndex.value = 0;
            scheduleSearch(match.query);
        }
        updatePosition();
    }

    function handleKeydown(event: KeyboardEvent): boolean {
        if (!isOpen.value) return false;
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return true;
        }
        if (!items.value.length) return false;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const offset = event.key === 'ArrowDown' ? 1 : -1;
            activeIndex.value =
                (activeIndex.value + offset + items.value.length) % items.value.length;
            return true;
        }
        if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault();
            activeIndex.value = event.key === 'Home' ? 0 : items.value.length - 1;
            return true;
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
            const item = activeItem.value;
            if (!item) return false;
            event.preventDefault();
            select(item);
            return true;
        }
        return false;
    }

    function handleRemoval(event: KeyboardEvent): boolean {
        if (!sources.config.value.enabled || sources.locked.value || !sources.root.value) {
            return false;
        }
        if (event.key !== 'Backspace' && event.key !== 'Delete') return false;
        const item = removeAdjacentMention(
            sources.root.value,
            event.key === 'Backspace' ? 'backward' : 'forward',
        );
        if (!item) return false;
        event.preventDefault();
        callbacks.change();
        callbacks.remove({ item });
        return true;
    }

    function setActiveIndex(index: number): void {
        if (index >= 0 && index < items.value.length) activeIndex.value = index;
    }

    function select(item: MentionItem): void {
        const root = sources.root.value;
        const range = queryRange;
        const selectedQuery = query.value;
        if (!root || !range || sources.locked.value) return;
        if (!insertMentionAtRange(root, range, item)) {
            close();
            return;
        }
        rememberItems([item]);
        close();
        callbacks.change();
        callbacks.select({ item: { ...item }, query: selectedQuery });
        root.focus({ preventScroll: true });
    }

    function retry(): void {
        cache.delete(query.value);
        clearPendingSearch();
        void loadItems(query.value);
    }

    function close(): void {
        clearPendingSearch();
        if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(positionFrame);
        isOpen.value = false;
        items.value = [];
        activeIndex.value = 0;
        queryRange = null;
        resizeObserver?.disconnect();
        resizeObserver = null;
        dropdownElement.value = null;
    }

    function setDropdownElement(element: HTMLElement | null): void {
        resizeObserver?.disconnect();
        dropdownElement.value = element;
        if (!element) return;
        resizeObserver = new ResizeObserver(updatePosition);
        resizeObserver.observe(element);
        updatePosition();
    }

    function setHoverCardElement(element: HTMLElement | null): void {
        hoverResizeObserver?.disconnect();
        hoverCardElement = element;
        if (!element) return;
        hoverResizeObserver = new ResizeObserver(updateHoverPosition);
        hoverResizeObserver.observe(element);
        updateHoverPosition();
    }

    function scheduleSearch(value: string): void {
        clearPendingSearch();
        const cached = cache.get(value);
        if (cached) {
            applyResults(cached);
            return;
        }
        debounceTimer = setTimeout(() => void loadItems(value), sources.config.value.debounce);
    }

    async function loadItems(value: string): Promise<void> {
        if (!canOpen() || value !== query.value) return;
        const sequence = ++requestSequence;
        const requestController = new AbortController();
        controller = requestController;
        state.value = 'loading';
        callbacks.search({ query: value });
        try {
            const source = sources.config.value.items;
            const results = Array.isArray(source)
                ? filterStaticItems(source, value, sources.config.value.limit)
                : source
                  ? await source(value, requestController.signal)
                  : [];
            if (
                sequence !== requestSequence ||
                requestController.signal.aborted ||
                value !== query.value
            ) {
                return;
            }
            const limited = results.slice(0, sources.config.value.limit).map((item) => ({ ...item }));
            rememberItems(limited);
            cache.set(value, limited);
            applyResults(limited);
        } catch (error: unknown) {
            if (sequence !== requestSequence || isAbortError(error)) return;
            items.value = [];
            state.value = 'error';
        }
    }

    function applyResults(results: MentionItem[]): void {
        items.value = results;
        activeIndex.value = 0;
        state.value = results.length ? 'results' : 'empty';
        void nextTick(updatePosition);
    }

    function updatePosition(): void {
        cancelAnimationFrame(positionFrame);
        positionFrame = requestAnimationFrame(() => {
            if (!isOpen.value || !queryRange) return;
            const caret = getCaretRect(queryRange);
            const dropdownRect = dropdownElement.value?.getBoundingClientRect();
            const width = Math.min(
                dropdownRect?.width || DROPDOWN_WIDTH,
                window.innerWidth - VIEWPORT_PADDING * 2,
            );
            const height = Math.min(
                dropdownRect?.height || DROPDOWN_MAX_HEIGHT,
                DROPDOWN_MAX_HEIGHT,
            );
            const spaceBelow = window.innerHeight - caret.bottom - VIEWPORT_PADDING;
            const spaceAbove = caret.top - VIEWPORT_PADDING;
            const placeAbove = spaceBelow < height && spaceAbove > spaceBelow;
            const left = Math.min(
                Math.max(VIEWPORT_PADDING, caret.left),
                Math.max(VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING),
            );
            const top = placeAbove
                ? Math.max(VIEWPORT_PADDING, caret.top - height - CARET_GAP)
                : Math.min(
                      window.innerHeight - VIEWPORT_PADDING,
                      caret.bottom + CARET_GAP,
                  );
            position.value = { left, top };
        });
    }

    function updateHoverPosition(): void {
        cancelAnimationFrame(hoverPositionFrame);
        hoverPositionFrame = requestAnimationFrame(() => {
            if (!hoverItem.value || !hoveredMention) return;
            const mentionRect = hoveredMention.getBoundingClientRect();
            const width = Math.min(HOVER_CARD_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2);
            const height = Math.min(
                hoverCardElement?.getBoundingClientRect().height || HOVER_CARD_HEIGHT,
                window.innerHeight - VIEWPORT_PADDING * 2,
            );
            const placeAbove =
                window.innerHeight - mentionRect.bottom - VIEWPORT_PADDING < height &&
                mentionRect.top > height;
            const left = Math.min(
                Math.max(VIEWPORT_PADDING, mentionRect.left),
                Math.max(VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING),
            );
            const top = placeAbove
                ? Math.max(VIEWPORT_PADDING, mentionRect.top - height - CARET_GAP)
                : Math.min(
                      window.innerHeight - height - VIEWPORT_PADDING,
                      mentionRect.bottom + CARET_GAP,
                  );
            hoverPosition.value = { left, top };
        });
    }

    function handleMentionPointerOver(event: PointerEvent): void {
        const root = sources.root.value;
        if (!root || !sources.config.value.enabled) return;
        const mention = closestMentionElement(event.target, root);
        if (!mention || mention === hoveredMention) return;
        const item = resolveMentionItem(mention);
        if (!item) return;
        hoveredMention = mention;
        hoverItem.value = item;
        updateHoverPosition();
    }

    function handleMentionPointerOut(event: PointerEvent): void {
        if (
            !hoveredMention ||
            (event.relatedTarget instanceof Node && hoveredMention.contains(event.relatedTarget))
        ) {
            return;
        }
        if (event.target instanceof Node && hoveredMention.contains(event.target)) closeHoverCard();
    }

    function closeHoverCard(): void {
        if (typeof cancelAnimationFrame !== 'undefined') {
            cancelAnimationFrame(hoverPositionFrame);
        }
        hoveredMention = null;
        hoverItem.value = null;
        hoverResizeObserver?.disconnect();
        hoverResizeObserver = null;
        hoverCardElement = null;
    }

    function resolveMentionItem(element: Element): MentionItem | null {
        const parsed = parseMentionElement(element);
        if (!parsed) return null;
        const known = knownItems.get(String(parsed.id));
        return known
            ? {
                  ...known,
                  id: parsed.id,
                  label: parsed.label,
                  ...(parsed.value !== undefined ? { value: parsed.value } : {}),
              }
            : parsed;
    }

    function rememberItems(values: MentionItem[]): void {
        for (const item of values) knownItems.set(String(item.id), { ...item });
    }

    function updateFloatingPositions(): void {
        updatePosition();
        updateHoverPosition();
    }

    function clearPendingSearch(): void {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = null;
        controller?.abort();
        controller = null;
        requestSequence += 1;
    }

    function canOpen(): boolean {
        return sources.config.value.enabled && !sources.locked.value;
    }

    function handleOutsidePointer(event: PointerEvent): void {
        if (!isOpen.value || dropdownElement.value?.contains(event.target as Node)) return;
        close();
    }

    const configuredItems = sources.config.value.items;
    if (Array.isArray(configuredItems)) rememberItems(configuredItems);

    watch(
        sources.config,
        () => {
            cache.clear();
            knownItems.clear();
            const configuredItems = sources.config.value.items;
            if (Array.isArray(configuredItems)) rememberItems(configuredItems);
            close();
            closeHoverCard();
        },
        { deep: true },
    );
    watch(sources.locked, (value) => {
        if (value) close();
    });

    onMounted(() => {
        window.addEventListener('resize', updateFloatingPositions);
        window.addEventListener('scroll', updateFloatingPositions, true);
        document.addEventListener('pointerdown', handleOutsidePointer);
        document.addEventListener('pointerover', handleMentionPointerOver);
        document.addEventListener('pointerout', handleMentionPointerOut);
    });
    onBeforeUnmount(() => {
        close();
        closeHoverCard();
        cache.clear();
        knownItems.clear();
        resizeObserver?.disconnect();
        window.removeEventListener('resize', updateFloatingPositions);
        window.removeEventListener('scroll', updateFloatingPositions, true);
        document.removeEventListener('pointerdown', handleOutsidePointer);
        document.removeEventListener('pointerover', handleMentionPointerOver);
        document.removeEventListener('pointerout', handleMentionPointerOut);
    });

    return {
        isOpen,
        query,
        items,
        activeIndex,
        state,
        positionStyle,
        hoverItem,
        hoverPositionStyle,
        handleInput,
        handleSelectionChange,
        handleKeydown,
        handleRemoval,
        setActiveIndex,
        select,
        retry,
        close,
        setDropdownElement,
        setHoverCardElement,
    };
}

function filterStaticItems(source: MentionItem[], query: string, limit: number): MentionItem[] {
    const needle = query.toLocaleLowerCase();
    return source
        .map((item, index) => ({ item, index, score: mentionMatchScore(item, needle) }))
        .filter((entry) => entry.score < 2)
        .sort((left, right) => left.score - right.score || left.index - right.index)
        .slice(0, limit)
        .map((entry) => ({ ...entry.item }));
}

function mentionMatchScore(item: MentionItem, query: string): number {
    if (!query) return 0;
    const fields = [item.label, item.description, item.value]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLocaleLowerCase());
    if (fields.some((value) => value.startsWith(query))) return 0;
    return fields.some((value) => value.includes(query)) ? 1 : 2;
}

function isAbortError(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

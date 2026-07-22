import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import type {
    MergeTagCallbacks,
    MergeTagComposableSources,
    MergeTagItem,
    MentionPosition,
} from '../types';
import {
    detectMergeTagQuery,
    insertMergeTagAtRange,
    normalizeMergeTagValue,
    removeAdjacentMergeTag,
} from '../utils/mergeTag';
import { getCaretRect } from '../utils/selection';

const DROPDOWN_WIDTH = 320;
const DROPDOWN_HEIGHT = 260;
const VIEWPORT_PADDING = 12;
const CARET_GAP = 6;

export function useMergeTags(sources: MergeTagComposableSources, callbacks: MergeTagCallbacks) {
    const isOpen = shallowRef(false);
    const query = shallowRef('');
    const items = shallowRef<MergeTagItem[]>([]);
    const activeIndex = shallowRef(0);
    const position = shallowRef<MentionPosition>({ left: VIEWPORT_PADDING, top: VIEWPORT_PADDING });
    const dropdownElement = shallowRef<HTMLElement | null>(null);
    const positionStyle = computed(() => ({
        left: `${position.value.left}px`,
        top: `${position.value.top}px`,
    }));
    let queryRange: Range | null = null;
    let observer: ResizeObserver | null = null;
    let positionFrame = 0;

    function handleInput(): void {
        const match = sources.root.value ? detectMergeTagQuery(sources.root.value) : null;
        if (!canOpen() || !match) {
            close();
            return;
        }
        queryRange = match.range.cloneRange();
        query.value = match.query;
        items.value = filterItems(match.query);
        activeIndex.value = 0;
        isOpen.value = true;
        updatePosition();
    }

    function handleSelectionChange(): void {
        const root = sources.root.value;
        if (!isOpen.value || !root) return;
        const match = detectMergeTagQuery(root);
        if (!canOpen() || !match) {
            close();
            return;
        }
        queryRange = match.range.cloneRange();
        if (match.query !== query.value) {
            query.value = match.query;
            items.value = filterItems(match.query);
            activeIndex.value = 0;
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
            const item = items.value[activeIndex.value];
            if (!item) return false;
            event.preventDefault();
            select(item);
            return true;
        }
        return false;
    }

    function handleRemoval(event: KeyboardEvent): boolean {
        if (!canOpen() || !sources.root.value) return false;
        if (event.key !== 'Backspace' && event.key !== 'Delete') return false;
        const item = removeAdjacentMergeTag(
            sources.root.value,
            event.key === 'Backspace' ? 'backward' : 'forward',
        );
        if (!item) return false;
        event.preventDefault();
        callbacks.change();
        callbacks.remove({ item });
        return true;
    }

    function select(item: MergeTagItem): void {
        const root = sources.root.value;
        const range = queryRange;
        const selectedQuery = query.value;
        if (!root || !range || sources.locked.value) return;
        if (!insertMergeTagAtRange(root, range, item)) return;
        close();
        callbacks.change();
        callbacks.select({ item: { ...item }, query: selectedQuery });
    }

    function insert(item: MergeTagItem): void {
        const root = sources.root.value;
        const selection = window.getSelection();
        if (!root || !selection?.rangeCount || sources.locked.value) return;
        const range = selection.getRangeAt(0);
        if (!root.contains(range.commonAncestorContainer)) return;
        if (!insertMergeTagAtRange(root, range.cloneRange(), item)) return;
        callbacks.change();
        callbacks.select({ item: { ...item }, query: '' });
    }

    function setActiveIndex(index: number): void {
        if (index >= 0 && index < items.value.length) activeIndex.value = index;
    }

    function setDropdownElement(element: HTMLElement | null): void {
        observer?.disconnect();
        dropdownElement.value = element;
        if (!element) return;
        observer = new ResizeObserver(updatePosition);
        observer.observe(element);
        updatePosition();
    }

    function updatePosition(): void {
        cancelAnimationFrame(positionFrame);
        positionFrame = requestAnimationFrame(() => {
            if (!queryRange || !isOpen.value) return;
            const caret = getCaretRect(queryRange);
            const rect = dropdownElement.value?.getBoundingClientRect();
            const width = Math.min(rect?.width || DROPDOWN_WIDTH, window.innerWidth - 24);
            const height = Math.min(rect?.height || DROPDOWN_HEIGHT, DROPDOWN_HEIGHT);
            const spaceBelow = window.innerHeight - caret.bottom - VIEWPORT_PADDING;
            const spaceAbove = caret.top - VIEWPORT_PADDING;
            const placeAbove = spaceBelow < height && spaceAbove > spaceBelow;
            const maximumLeft = Math.max(
                VIEWPORT_PADDING,
                window.innerWidth - width - VIEWPORT_PADDING,
            );
            const maximumTop = Math.max(
                VIEWPORT_PADDING,
                window.innerHeight - height - VIEWPORT_PADDING,
            );
            const preferredTop = placeAbove
                ? caret.top - height - CARET_GAP
                : caret.bottom + CARET_GAP;
            position.value = {
                left: Math.min(Math.max(VIEWPORT_PADDING, caret.left), maximumLeft),
                top: Math.min(Math.max(VIEWPORT_PADDING, preferredTop), maximumTop),
            };
        });
    }

    function close(): void {
        cancelAnimationFrame(positionFrame);
        isOpen.value = false;
        queryRange = null;
        query.value = '';
        items.value = [];
        activeIndex.value = 0;
        observer?.disconnect();
        observer = null;
        dropdownElement.value = null;
    }

    function filterItems(value: string): MergeTagItem[] {
        const needle = value.replace(/\s+/gu, ' ').trim().toLocaleLowerCase();
        return sources.config.value.items
            .map((item, index) => ({ item, index, score: matchScore(item, needle) }))
            .filter((entry) => entry.score < 2)
            .sort((left, right) => left.score - right.score || left.index - right.index)
            .slice(0, sources.config.value.limit)
            .map((entry) => ({ ...entry.item }));
    }

    function canOpen(): boolean {
        return sources.config.value.enabled && !sources.locked.value;
    }

    function outside(event: PointerEvent): void {
        if (!dropdownElement.value?.contains(event.target as Node)) close();
    }

    watch(sources.config, close, { deep: true });
    watch(sources.locked, (value) => {
        if (value) close();
    });
    watch(activeIndex, () => void nextTick(scrollActiveItem));
    onMounted(() => {
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        document.addEventListener('pointerdown', outside);
    });
    onBeforeUnmount(() => {
        close();
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        document.removeEventListener('pointerdown', outside);
    });

    function scrollActiveItem(): void {
        dropdownElement.value
            ?.querySelector<HTMLElement>('[aria-selected="true"]')
            ?.scrollIntoView({ block: 'nearest' });
    }

    return {
        isOpen,
        query,
        items,
        activeIndex,
        positionStyle,
        handleInput,
        handleSelectionChange,
        handleKeydown,
        handleRemoval,
        setActiveIndex,
        setDropdownElement,
        select,
        insert,
        close,
    };
}

function matchScore(item: MergeTagItem, query: string): number {
    if (!query) return 0;
    const values = [normalizeMergeTagValue(item.value), item.name, item.group]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLocaleLowerCase());
    if (values.some((value) => value.startsWith(query))) return 0;
    return values.some((value) => value.includes(query)) ? 1 : 2;
}

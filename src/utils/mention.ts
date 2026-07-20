import type { MentionItem, MentionQueryMatch } from '../types';

const MENTION_QUERY_PATTERN = /(?:^|[\s([{])@([\p{L}\p{N}._-]*)$/u;
const MENTION_SELECTOR = 'span.erag-mention[data-erag-mention="true"]';

export function closestMentionElement(
    target: EventTarget | null,
    root: HTMLElement,
): HTMLElement | null {
    if (!(target instanceof Element)) return null;
    const mention = target.closest<HTMLElement>(MENTION_SELECTOR);
    return mention && root.contains(mention) ? mention : null;
}

export function detectMentionQuery(root: HTMLElement): MentionQueryMatch | null {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return null;

    const activeRange = selection.getRangeAt(0);
    if (!root.contains(activeRange.commonAncestorContainer)) return null;
    const node = activeRange.startContainer;
    if (!(node instanceof Text)) return null;

    const parent = node.parentElement;
    if (!parent || isBlockedMentionContext(root, parent)) return null;

    const caretOffset = activeRange.startOffset;
    const prefix = node.data.slice(0, caretOffset);
    const match = prefix.match(MENTION_QUERY_PATTERN);
    const query = match?.[1];
    if (query === undefined) return null;

    const range = document.createRange();
    range.setStart(node, caretOffset - query.length - 1);
    range.setEnd(node, caretOffset);
    return { query, range };
}

export function createMentionElement(item: MentionItem): HTMLSpanElement {
    const mention = document.createElement('span');
    mention.className = 'erag-mention';
    mention.dataset.eragMention = 'true';
    mention.dataset.eragMentionId = String(item.id);
    mention.dataset.eragMentionLabel = item.label;
    if (item.value !== undefined) mention.dataset.eragMentionValue = item.value;
    mention.contentEditable = 'false';
    mention.textContent = `@${item.label}`;
    return mention;
}

export function insertMentionAtRange(
    root: HTMLElement,
    range: Range,
    item: MentionItem,
): boolean {
    if (!root.contains(range.commonAncestorContainer) || range.toString().charAt(0) !== '@') {
        return false;
    }

    root.focus({ preventScroll: true });
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);

    const mention = createMentionElement(item);
    range.deleteContents();
    const space = document.createTextNode(' ');
    range.insertNode(space);
    range.insertNode(mention);
    range.setStartAfter(space);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    root.dispatchEvent(
        new InputEvent('input', {
            bubbles: true,
            inputType: 'insertReplacementText',
            data: `@${item.label}`,
        }),
    );
    return true;
}

export function parseMentionElement(element: Element): MentionItem | null {
    if (!isValidMentionElement(element)) return null;
    const rawId = element.getAttribute('data-erag-mention-id') ?? '';
    const numericId = Number(rawId);
    const id = Number.isFinite(numericId) && String(numericId) === rawId ? numericId : rawId;
    const item: MentionItem = {
        id,
        label: element.getAttribute('data-erag-mention-label') ?? '',
    };
    const value = element.getAttribute('data-erag-mention-value');
    if (value !== null) item.value = value;
    return item;
}

export function isValidMentionElement(element: Element): boolean {
    return (
        element.matches(MENTION_SELECTOR) &&
        element.getAttribute('contenteditable') === 'false' &&
        Boolean(element.getAttribute('data-erag-mention-id')) &&
        Boolean(element.getAttribute('data-erag-mention-label'))
    );
}

export function isMentionCandidate(element: Element): boolean {
    if (element.tagName.toLowerCase() !== 'span') return false;
    return (
        [...element.classList].some((name) => name.startsWith('erag-mention')) ||
        [...element.attributes].some((attribute) =>
            attribute.name.startsWith('data-erag-mention'),
        )
    );
}

export function normalizeMentionElement(element: Element): boolean {
    const item = parseMentionElement(element);
    if (!item) return false;
    const normalized = createMentionElement(item);
    element.replaceWith(normalized);
    return true;
}

export function removeAdjacentMention(
    root: HTMLElement,
    direction: 'backward' | 'forward',
): MentionItem | null {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return null;

    const adjacent = adjacentNode(range, direction);
    const element = adjacent instanceof Element ? adjacent : adjacent?.parentElement;
    const mention = element?.matches(MENTION_SELECTOR)
        ? element
        : element?.closest(MENTION_SELECTOR);
    if (!mention || !root.contains(mention)) return null;

    const item = parseMentionElement(mention);
    if (!item) return null;

    const deletionRange = document.createRange();
    deletionRange.selectNode(mention);
    selection.removeAllRanges();
    selection.addRange(deletionRange);
    if (!document.execCommand('delete', false)) deletionRange.deleteContents();
    selection.collapseToEnd();
    return item;
}

function adjacentNode(range: Range, direction: 'backward' | 'forward'): Node | null {
    const container = range.startContainer;
    const offset = range.startOffset;
    if (container instanceof Text) {
        if (direction === 'backward' && offset === 0) return container.previousSibling;
        if (direction === 'forward' && offset === container.length) return container.nextSibling;
        return null;
    }
    if (direction === 'backward' && offset === 0) return container.previousSibling;
    return direction === 'backward'
        ? (container.childNodes.item(offset - 1) ?? null)
        : (container.childNodes.item(offset) ?? null);
}

function isBlockedMentionContext(root: HTMLElement, element: HTMLElement): boolean {
    const blocked = element.closest(
        'a,code,pre,[data-erag-mention="true"],[contenteditable="false"]',
    );
    return Boolean(blocked && blocked !== root && root.contains(blocked));
}

import type { MergeTagItem, MergeTagQueryMatch } from '../types';

const MERGE_TAG_PATTERN = /\{\{([^{}\n\r]*)$/u;
const MERGE_TAG_SELECTOR = 'span.erag-merge-tag[data-erag-merge-tag="true"]';
const MERGE_TAG_BLOCK_SELECTOR = 'p,div,li,h1,h2,h3,h4,h5,h6,blockquote,figcaption,td,th';

export function detectMergeTagQuery(root: HTMLElement): MergeTagQueryMatch | null {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return null;
    const activeRange = selection.getRangeAt(0);
    if (!root.contains(activeRange.commonAncestorContainer)) return null;
    const node = activeRange.startContainer;
    if (!(node instanceof Text) || isBlockedContext(root, node.parentElement)) return null;
    const caretOffset = activeRange.startOffset;
    const block = node.parentElement?.closest<HTMLElement>(MERGE_TAG_BLOCK_SELECTOR) ?? root;
    if (block !== root && !root.contains(block)) return null;
    const prefixRange = document.createRange();
    prefixRange.selectNodeContents(block);
    prefixRange.setEnd(node, caretOffset);
    const prefix = prefixRange.toString();
    const match = prefix.match(MERGE_TAG_PATTERN);
    if (!match?.[0] || match[1] === undefined) return null;
    const range = document.createRange();
    if (!setRangeStartBeforeCaret(block, node, caretOffset, match[0].length, range)) {
        return null;
    }
    range.setEnd(node, caretOffset);
    return { query: normalizeQuery(match[1]), range };
}

export function insertMergeTagAtRange(
    root: HTMLElement,
    range: Range,
    item: MergeTagItem,
): boolean {
    if (!root.contains(range.commonAncestorContainer)) return false;
    root.focus({ preventScroll: true });
    const selection = window.getSelection();
    if (!selection) return false;
    const tag = createMergeTagElement(item);
    range.deleteContents();
    const space = document.createTextNode(' ');
    range.insertNode(space);
    range.insertNode(tag);
    range.setStartAfter(space);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    root.dispatchEvent(
        new InputEvent('input', {
            bubbles: true,
            inputType: 'insertReplacementText',
            data: formatMergeTagValue(item.value),
        }),
    );
    return true;
}

export function createMergeTagElement(item: MergeTagItem): HTMLSpanElement {
    const element = document.createElement('span');
    element.className = 'erag-merge-tag';
    element.dataset.eragMergeTag = 'true';
    element.dataset.eragMergeTagValue = formatMergeTagValue(item.value);
    element.contentEditable = 'false';
    element.textContent = formatMergeTagValue(item.value);
    return element;
}

export function parseMergeTagElement(element: Element): MergeTagItem | null {
    if (!isValidMergeTagElement(element)) return null;
    return {
        value: element.getAttribute('data-erag-merge-tag-value') ?? '',
    };
}

export function isMergeTagCandidate(element: Element): boolean {
    return (
        element.tagName.toLowerCase() === 'span' &&
        ([...element.classList].some((name) => name.startsWith('erag-merge-tag')) ||
            [...element.attributes].some((attribute) =>
                attribute.name.startsWith('data-erag-merge-tag'),
            ))
    );
}

export function normalizeMergeTagElement(element: Element): boolean {
    const item = parseMergeTagElement(element);
    if (!item) return false;
    element.replaceWith(createMergeTagElement(item));
    return true;
}

export function removeAdjacentMergeTag(
    root: HTMLElement,
    direction: 'backward' | 'forward',
): MergeTagItem | null {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return null;
    const adjacent = adjacentNode(range, direction);
    const element = adjacent instanceof Element ? adjacent : adjacent?.parentElement;
    const tag = element?.matches(MERGE_TAG_SELECTOR)
        ? element
        : element?.closest(MERGE_TAG_SELECTOR);
    if (!tag || !root.contains(tag)) return null;
    const item = parseMergeTagElement(tag);
    if (!item) return null;
    const deletionRange = document.createRange();
    deletionRange.selectNode(tag);
    selection.removeAllRanges();
    selection.addRange(deletionRange);
    if (!document.execCommand('delete', false)) deletionRange.deleteContents();
    selection.collapseToEnd();
    return item;
}

function isValidMergeTagElement(element: Element): boolean {
    return (
        element.matches(MERGE_TAG_SELECTOR) &&
        element.getAttribute('contenteditable') === 'false' &&
        Boolean(element.getAttribute('data-erag-merge-tag-value'))
    );
}

export function normalizeMergeTagValue(value: string): string {
    const normalized = value.trim();
    if (normalized.startsWith('{{') && normalized.endsWith('}}')) {
        return normalized.slice(2, -2).trim();
    }
    if (normalized.startsWith('{') && normalized.endsWith('}')) {
        return normalized.slice(1, -1).trim();
    }
    return normalized.replace(/[{}]/gu, '').trim();
}

export function formatMergeTagValue(value: string): string {
    return `{{${normalizeMergeTagValue(value)}}}`;
}

function isBlockedContext(root: HTMLElement, element: HTMLElement | null): boolean {
    const blocked = element?.closest(
        'a,code,pre,[data-erag-mention="true"],[data-erag-merge-tag="true"],[contenteditable="false"]',
    );
    return Boolean(blocked && blocked !== root && root.contains(blocked));
}

function normalizeQuery(value: string): string {
    return value.replace(/\s+/gu, ' ').trim();
}

function setRangeStartBeforeCaret(
    block: HTMLElement,
    caretNode: Text,
    caretOffset: number,
    characterCount: number,
    range: Range,
): boolean {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
        if (current instanceof Text) nodes.push(current);
        current = walker.nextNode();
    }
    let index = nodes.indexOf(caretNode);
    let offset = caretOffset;
    let remaining = characterCount;
    while (index >= 0) {
        if (remaining <= offset) {
            range.setStart(nodes[index] ?? caretNode, offset - remaining);
            return true;
        }
        remaining -= offset;
        index -= 1;
        offset = nodes[index]?.length ?? 0;
    }
    return false;
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

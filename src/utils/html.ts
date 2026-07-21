import type { TextCountStatistics } from '../types';

const TRANSIENT_CONTENT_SELECTOR = '[data-erag-transient="true"]';

export function getPersistentHtml(root: HTMLElement): string {
    if (!root.querySelector(TRANSIENT_CONTENT_SELECTOR)) return root.innerHTML;
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(TRANSIENT_CONTENT_SELECTOR).forEach((element) => element.remove());
    return clone.innerHTML;
}

export function getPersistentText(root: HTMLElement): string {
    if (!root.querySelector(TRANSIENT_CONTENT_SELECTOR)) return root.textContent ?? '';
    const clone = root.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(TRANSIENT_CONTENT_SELECTOR).forEach((element) => element.remove());
    return clone.textContent ?? '';
}

export function getTextCounts(root: HTMLElement): { words: number; characters: number } {
    const text = getPersistentText(root)
        .replace(/\u00a0/g, ' ')
        .trim();
    return { words: text ? text.split(/\s+/u).length : 0, characters: text.length };
}
export function getDetailedTextCounts(value: string): TextCountStatistics {
    const text = value.replace(/\u00a0/g, ' ');
    const trimmed = text.trim();
    return {
        words: trimmed ? trimmed.split(/\s+/u).length : 0,
        charactersWithoutSpaces: text.replace(/\s/gu, '').length,
        characters: text.length,
    };
}
export function escapeHtml(value: string): string {
    const element = document.createElement('div');
    element.textContent = value;
    return element.innerHTML;
}
export function insertAtSelection(root: HTMLElement, html: string): boolean {
    const selection = root.ownerDocument.defaultView?.getSelection();
    if (!selection) return false;
    const selectedRange = selection.rangeCount ? selection.getRangeAt(0) : null;
    const range =
        selectedRange && root.contains(selectedRange.commonAncestorContainer)
            ? selectedRange
            : createRangeAtEnd(root);

    root.focus({ preventScroll: true });
    range.deleteContents();
    const fragment = range.createContextualFragment(html);
    const last = fragment.lastChild;
    range.insertNode(fragment);
    if (last) {
        range.setStartAfter(last);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    return true;
}

function createRangeAtEnd(root: HTMLElement): Range {
    const range = root.ownerDocument.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    return range;
}

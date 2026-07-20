export function saveSelection(root: HTMLElement): Range | null {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    const range = selection.getRangeAt(0);
    return root.contains(range.commonAncestorContainer) ? range.cloneRange() : null;
}
export function restoreSelection(range: Range | null, root: HTMLElement): boolean {
    if (!range || !root.isConnected || !root.contains(range.commonAncestorContainer)) return false;
    const selection = root.ownerDocument.defaultView?.getSelection();
    if (!selection) return false;
    try {
        root.focus({ preventScroll: true });
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
    } catch {
        return false;
    }
}
export function selectionElement(root: HTMLElement): HTMLElement | null {
    const node = window.getSelection()?.anchorNode;
    const element = node instanceof HTMLElement ? node : node?.parentElement;
    return element && root.contains(element) ? element : null;
}
export function elementPath(root: HTMLElement): string {
    const parts: string[] = [];
    let current = selectionElement(root);
    while (current && current !== root) {
        parts.unshift(current.tagName.toLowerCase());
        current = current.parentElement;
    }
    return parts.join(' > ') || 'p';
}

export function getCaretRect(range: Range): DOMRect {
    const caret = range.cloneRange();
    caret.collapse(false);
    const rect = caret.getBoundingClientRect();
    if (rect.width || rect.height) return rect;
    const clientRect = caret.getClientRects().item(0);
    if (clientRect) return clientRect;
    const element =
        caret.endContainer instanceof HTMLElement
            ? caret.endContainer
            : caret.endContainer.parentElement;
    return element?.getBoundingClientRect() ?? new DOMRect();
}

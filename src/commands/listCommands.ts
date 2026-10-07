import { closestElement, liftNestedBlocks, removeRedundantInlineStyles } from '../utils/dom';
import type { NativeEditorCommand } from '../types';

const TEXT_BLOCK_SELECTOR = 'p,li,h1,h2,h3,h4,h5,h6,pre,blockquote,div,td,th';

export function setListStyle(
    root: HTMLElement,
    type: 'ul' | 'ol',
    style: string,
    executeCommand: NativeEditorCommand,
): boolean {
    const list = closestElement(root, type);
    if (list) {
        list.style.listStyleType = style;
        return true;
    }
    toggleList(root, type, executeCommand);
    const inserted = closestElement(root, type);
    if (!inserted) return false;
    inserted.style.listStyleType = style;
    return true;
}

export function toggleList(
    root: HTMLElement,
    type: 'ul' | 'ol',
    executeCommand: NativeEditorCommand,
): boolean {
    const toggled = executeCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
    normalizeMovedBlocks(root, executeCommand);
    return toggled;
}

/**
 * Clean up after Chrome moves paragraphs in or out of a list: lift the list out of the
 * paragraph it was nested in, wrap text left directly in the editor root in a paragraph,
 * and drop the font styles copied onto the moved text.
 */
export function normalizeMovedBlocks(root: HTMLElement, executeCommand: NativeEditorCommand): void {
    liftNestedBlocks(closestElement(root, 'li')?.parentElement?.parentElement ?? null);
    const selection = window.getSelection();
    const anchor = selection?.anchorNode;
    const element = anchor instanceof Element ? anchor : anchor?.parentElement;
    if (element && root.contains(element) && element.closest(TEXT_BLOCK_SELECTOR) === root) {
        executeCommand('formatBlock', 'p');
    }
    removeRedundantInlineStyles(root, selection?.rangeCount ? selection.getRangeAt(0) : null);
}

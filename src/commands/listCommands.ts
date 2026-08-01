import { closestElement } from '../utils/dom';
import type { NativeEditorCommand } from '../types';

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
    executeCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
    const inserted = closestElement(root, type);
    if (!inserted) return false;
    inserted.style.listStyleType = style;
    return true;
}

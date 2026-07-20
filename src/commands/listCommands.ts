import { closestElement } from '../utils/dom';
export function setListStyle(root: HTMLElement, type: 'ul' | 'ol', style: string): boolean {
    const list = closestElement(root, type);
    if (list) {
        list.style.listStyleType = style;
        return true;
    }
    document.execCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList', false);
    const inserted = closestElement(root, type);
    if (!inserted) return false;
    inserted.style.listStyleType = style;
    return true;
}

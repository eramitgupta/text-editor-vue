import { closestElement } from '../utils/dom';

const CHECKLIST_SELECTOR = 'ul[data-erag-checklist="true"]';
const CHECKLIST_ITEM_SELECTOR = 'li[data-erag-checklist-item="true"]';
const CHECKBOX_SELECTOR = 'input[data-erag-checklist-checkbox="true"]';

export function insertChecklist(root: HTMLElement): boolean {
    root.focus({ preventScroll: true });

    const activeList = closestElement(root, 'ul');
    if (activeList?.matches(CHECKLIST_SELECTOR)) {
        checklistItems(activeList).forEach(clearChecklistItem);
        delete activeList.dataset.eragChecklist;
        return document.execCommand('insertUnorderedList', false);
    }

    if (!document.execCommand('insertUnorderedList', false)) return false;

    const list = closestElement(root, 'ul');
    if (!list) return false;

    list.dataset.eragChecklist = 'true';
    checklistItems(list).forEach(prepareChecklistItem);
    focusChecklistItem(closestElement(root, 'li') ?? checklistItems(list)[0] ?? null);

    return true;
}

export function handleChecklistKeydown(root: HTMLElement, event: KeyboardEvent): boolean {
    if (event.key !== 'Enter' || event.shiftKey) return false;

    const item = closestElement(root, 'li');
    const list = item?.closest<HTMLUListElement>(CHECKLIST_SELECTOR);
    if (!item || !list || !item.matches(CHECKLIST_ITEM_SELECTOR)) return false;

    event.preventDefault();

    if (!checklistItemText(item)) {
        exitChecklist(list, item);
        return true;
    }

    const nextItem = createChecklistItem(root.ownerDocument);
    item.after(nextItem);
    focusChecklistItem(nextItem);

    return true;
}

export function syncChecklistCheckbox(root: HTMLElement, event: MouseEvent): boolean {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.matches(CHECKBOX_SELECTOR)) return false;
    if (!root.contains(target)) return false;

    target.toggleAttribute('checked', target.checked);

    return true;
}

export function isChecklistActive(): boolean {
    const current = window.getSelection()?.anchorNode;
    const element = current instanceof Element ? current : current?.parentElement;

    return Boolean(element?.closest(CHECKLIST_SELECTOR));
}

function checklistItems(list: HTMLUListElement): HTMLLIElement[] {
    return [...list.children].filter(
        (child): child is HTMLLIElement => child instanceof HTMLLIElement,
    );
}

function prepareChecklistItem(item: HTMLLIElement): void {
    item.dataset.eragChecklistItem = 'true';

    if (item.querySelector(`:scope > ${CHECKBOX_SELECTOR}`)) return;

    const checkbox = item.ownerDocument.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.contentEditable = 'false';
    checkbox.dataset.eragChecklistCheckbox = 'true';
    item.prepend(checkbox, item.ownerDocument.createTextNode('\u00a0'));
}

function clearChecklistItem(item: HTMLLIElement): void {
    delete item.dataset.eragChecklistItem;
    const checkbox = item.querySelector<HTMLInputElement>(`:scope > ${CHECKBOX_SELECTOR}`);
    const spacer = checkbox?.nextSibling;
    checkbox?.remove();

    if (spacer instanceof Text && spacer.textContent?.startsWith('\u00a0')) {
        spacer.textContent = spacer.textContent.slice(1);
        if (!spacer.textContent) spacer.remove();
    }
}

function createChecklistItem(documentNode: Document): HTMLLIElement {
    const item = documentNode.createElement('li');
    item.dataset.eragChecklistItem = 'true';
    prepareChecklistItem(item);

    return item;
}

function checklistItemText(item: HTMLLIElement): string {
    const clone = item.cloneNode(true) as HTMLLIElement;
    clone.querySelectorAll(CHECKBOX_SELECTOR).forEach((checkbox) => checkbox.remove());

    return (clone.textContent ?? '').replace(/\u00a0/g, ' ').trim();
}

function exitChecklist(list: HTMLUListElement, item: HTMLLIElement): void {
    const paragraph = list.ownerDocument.createElement('p');
    paragraph.append(list.ownerDocument.createElement('br'));
    list.after(paragraph);
    item.remove();

    if (!checklistItems(list).length) list.remove();

    setCaret(paragraph, 0);
}

function focusChecklistItem(item: HTMLLIElement | null): void {
    if (!item) return;

    prepareChecklistItem(item);
    const checkbox = item.querySelector<HTMLInputElement>(`:scope > ${CHECKBOX_SELECTOR}`);
    let text = checkbox?.nextSibling;
    if (!(text instanceof Text)) {
        text = item.ownerDocument.createTextNode('\u00a0');
        checkbox?.after(text);
    }

    setCaret(text, text.textContent?.length ?? 0);
}

function setCaret(node: Node, offset: number): void {
    const documentNode = node.ownerDocument;
    if (!documentNode) return;

    const selection = documentNode.defaultView?.getSelection();
    if (!selection) return;

    const range = documentNode.createRange();
    range.setStart(node, offset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

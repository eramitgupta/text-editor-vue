import { FORMAT_COMMANDS } from '../constants/editorCommands';
import { selectionElement } from '../utils/selection';

export function executeFormatCommand(root: HTMLElement, id: string, value?: string): boolean {
    root.focus({ preventScroll: true });
    if (id === 'removeformat') return clearFormatting(root);
    if (id === 'formatBlock') return document.execCommand('formatBlock', false, value ?? 'p');
    if (id === 'fontfamily') return document.execCommand('fontName', false, value ?? 'Arial');
    if (id === 'fontsize') return applyInlineStyle(root, 'fontSize', value ?? '12pt');
    if (id === 'lineheight') return applyInlineStyle(root, 'lineHeight', value ?? '1.5');
    if (id === 'forecolor') return document.execCommand('foreColor', false, value ?? '#000000');
    if (id === 'backcolor')
        return document.execCommand('hiliteColor', false, value ?? 'transparent');
    if (id === 'inlineCode') return document.execCommand('formatBlock', false, 'pre');
    const command = FORMAT_COMMANDS[id];
    return command ? document.execCommand(command, false) : false;
}

function clearFormatting(root: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !root.contains(selection.getRangeAt(0).commonAncestorContainer))
        return false;
    const removedInlineFormatting = document.execCommand('removeFormat', false);
    const removedLink = document.execCommand('unlink', false);
    const resetBlock = document.execCommand('formatBlock', false, 'p');
    return removedInlineFormatting || removedLink || resetBlock;
}

function applyInlineStyle(
    root: HTMLElement,
    property: keyof CSSStyleDeclaration,
    value: string,
): boolean {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return false;
    if (selection.isCollapsed) {
        const element = selectionElement(root);
        if (!element) return false;
        Object.assign(element.style, { [property]: value });
        return true;
    }
    const span = document.createElement('span');
    Object.assign(span.style, { [property]: value });
    const range = selection.getRangeAt(0);
    span.append(range.extractContents());
    range.insertNode(span);
    selection.selectAllChildren(span);
    return true;
}

export function queryFormatState(id: string): boolean {
    const command = FORMAT_COMMANDS[id];
    if (!command) return false;
    try {
        return document.queryCommandState(command);
    } catch {
        return false;
    }
}

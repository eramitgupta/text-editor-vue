import { FORMAT_COMMANDS } from '../constants/editorCommands';
import type { NativeEditorCommand, TextCaseMode } from '../types';
import { selectionElement } from '../utils/selection';

export function executeFormatCommand(
    root: HTMLElement,
    id: string,
    value: string | undefined,
    executeCommand: NativeEditorCommand,
): boolean {
    root.focus({ preventScroll: true });
    if (id === 'removeformat') return clearFormatting(root, executeCommand);
    if (id === 'formatBlock') return executeCommand('formatBlock', value ?? 'p');
    if (id === 'fontfamily') return executeWithCss(executeCommand, 'fontName', value ?? 'Arial');
    if (id === 'fontsize') return applyInlineStyle(root, 'fontSize', value ?? '12pt');
    if (id === 'lineheight') return applyInlineStyle(root, 'lineHeight', value ?? '1.5');
    if (id === 'forecolor') return executeWithCss(executeCommand, 'foreColor', value ?? '#000000');
    if (id === 'backcolor') return executeCommand('hiliteColor', value ?? 'transparent');
    if (id === 'inlineCode') return toggleInlineCode(root);
    if (id === 'changeCase' && isTextCaseMode(value)) return changeSelectionCase(root, value);
    const command = FORMAT_COMMANDS[id];
    return command ? executeCommand(command) : false;
}

/**
 * Without the CSS styling flag Chrome writes `<font face>` / `<font color>`, which the
 * sanitizer strips, so the formatting would be lost the next time the HTML is loaded.
 */
function executeWithCss(
    executeCommand: NativeEditorCommand,
    command: string,
    value: string,
): boolean {
    executeCommand('styleWithCSS', 'true');
    try {
        return executeCommand(command, value);
    } finally {
        executeCommand('styleWithCSS', 'false');
    }
}

function toggleInlineCode(root: HTMLElement): boolean {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return false;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return false;
    const container = range.commonAncestorContainer;
    const code = (container instanceof Element ? container : container.parentElement)?.closest(
        'code',
    );
    if (code && root.contains(code) && !code.closest('pre')) {
        code.replaceWith(...code.childNodes);
        return true;
    }
    if (range.collapsed) return false;
    const element = document.createElement('code');
    element.textContent = range.toString();
    range.deleteContents();
    range.insertNode(element);
    selection.selectAllChildren(element);
    return true;
}

function changeSelectionCase(root: HTMLElement, mode: TextCaseMode): boolean {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return false;
    const fragment = range.extractContents();
    const first = fragment.firstChild;
    const last = fragment.lastChild;
    if (!first || !last) return false;
    const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        node.textContent = transformCase(node.textContent ?? '', mode);
        node = walker.nextNode();
    }
    range.insertNode(fragment);
    const selectedRange = document.createRange();
    selectedRange.setStartBefore(first);
    selectedRange.setEndAfter(last);
    selection.removeAllRanges();
    selection.addRange(selectedRange);
    return true;
}

function transformCase(value: string, mode: TextCaseMode): string {
    if (mode === 'lowercase') return value.toLocaleLowerCase();
    if (mode === 'uppercase') return value.toLocaleUpperCase();
    return value
        .toLocaleLowerCase()
        .replace(
            /(^|[^\p{L}\p{N}])(\p{L})/gu,
            (_, boundary: string, letter: string) => `${boundary}${letter.toLocaleUpperCase()}`,
        );
}

function isTextCaseMode(value: string | undefined): value is TextCaseMode {
    return value === 'lowercase' || value === 'uppercase' || value === 'titlecase';
}

function clearFormatting(root: HTMLElement, executeCommand: NativeEditorCommand): boolean {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !root.contains(selection.getRangeAt(0).commonAncestorContainer))
        return false;
    const removedInlineFormatting = executeCommand('removeFormat');
    const removedLink = executeCommand('unlink');
    const resetBlock = executeCommand('formatBlock', 'p');
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

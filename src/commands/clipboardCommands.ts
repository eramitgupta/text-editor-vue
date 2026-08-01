import { escapeHtml, insertAtSelection } from '../utils/html';
import type { ClipboardContent, NativeEditorCommand } from '../types';

let editorClipboard: ClipboardContent | null = null;

function selectedContent(root: HTMLElement): ClipboardContent | null {
    const selection = window.getSelection();
    if (!selection?.rangeCount || selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return null;
    const container = document.createElement('div');
    container.append(range.cloneContents());
    return { html: container.innerHTML, text: selection.toString() };
}

async function writeSelection(
    root: HTMLElement,
    cut: boolean,
    executeCommand: NativeEditorCommand,
): Promise<boolean> {
    const content = selectedContent(root);
    if (!content) return false;
    editorClipboard = content;
    if (executeCommand(cut ? 'cut' : 'copy')) return true;
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(content.text);
    if (cut) executeCommand('delete');
    return true;
}

async function readSystemClipboard(): Promise<string | null> {
    if (!navigator.clipboard?.readText) return null;
    try {
        return await navigator.clipboard.readText();
    } catch {
        return null;
    }
}

async function pasteSelection(
    root: HTMLElement,
    plainText: boolean,
    executeCommand: NativeEditorCommand,
): Promise<boolean> {
    if (executeCommand('paste')) return true;
    const systemText = await readSystemClipboard();
    if (systemText !== null) return insertAtSelection(root, escapeHtml(systemText));
    if (!editorClipboard) return false;
    const html = plainText ? escapeHtml(editorClipboard.text) : editorClipboard.html;
    return insertAtSelection(root, html);
}

export async function executeClipboardCommand(
    root: HTMLElement,
    id: 'cut' | 'copy' | 'paste' | 'pasteText',
    executeCommand: NativeEditorCommand,
): Promise<boolean> {
    try {
        if (id === 'copy' || id === 'cut') {
            return writeSelection(root, id === 'cut', executeCommand);
        }

        return pasteSelection(root, id === 'pasteText', executeCommand);
    } catch {
        return false;
    }
}

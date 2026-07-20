import { escapeHtml, insertAtSelection } from '../utils/html';
import type { ClipboardContent } from '../types';

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

async function writeSelection(root: HTMLElement, cut: boolean): Promise<boolean> {
    const content = selectedContent(root);
    if (!content) return false;
    editorClipboard = content;
    if (document.execCommand(cut ? 'cut' : 'copy', false)) return true;
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(content.text);
    if (cut) document.execCommand('delete', false);
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

async function pasteSelection(root: HTMLElement, plainText: boolean): Promise<boolean> {
    if (document.execCommand('paste', false)) return true;
    const systemText = await readSystemClipboard();
    if (systemText !== null) return insertAtSelection(root, escapeHtml(systemText));
    if (!editorClipboard) return false;
    const html = plainText ? escapeHtml(editorClipboard.text) : editorClipboard.html;
    return insertAtSelection(root, html);
}

export async function executeClipboardCommand(
    root: HTMLElement,
    id: 'cut' | 'copy' | 'paste' | 'pasteText',
): Promise<boolean> {
    try {
        if (id === 'copy' || id === 'cut') return writeSelection(root, id === 'cut');
        return pasteSelection(root, id === 'pasteText');
    } catch {
        return false;
    }
}

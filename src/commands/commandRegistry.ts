import { executeClipboardCommand } from './clipboardCommands';
import { executeFormatCommand, queryFormatState } from './formatCommands';
import { insertAtSelection } from '../utils/html';
import { executeTableCommand } from './tableCommands';
import { printEditorContent } from './printCommands';

const TABLE_COMMANDS = new Set([
    'deleteTable',
    'cellProperties',
    'mergeCells',
    'splitCell',
    'rowBefore',
    'rowAfter',
    'deleteRow',
    'columnBefore',
    'columnAfter',
    'deleteColumn',
]);
export function executeEditorCommand(root: HTMLElement, id: string, value?: string): boolean {
    if (TABLE_COMMANDS.has(id)) return executeTableCommand(root, id);
    if (id === 'hr') return insertAtSelection(root, '<hr><p><br></p>');
    if (id === 'anchor')
        return insertAtSelection(
            root,
            `<a id="${globalThis.crypto?.randomUUID?.() ?? Date.now()}" name="anchor"></a>`,
        );
    if (id === 'print') return printEditorContent(root);
    return executeFormatCommand(root, id, value);
}
export async function executeAsyncEditorCommand(root: HTMLElement, id: string): Promise<boolean> {
    return ['cut', 'copy', 'paste', 'pasteText'].includes(id)
        ? executeClipboardCommand(root, id as 'cut' | 'copy' | 'paste' | 'pasteText')
        : false;
}
export function isEditorCommandActive(id: string): boolean {
    return queryFormatState(id);
}
export function isTableCommand(id: string): boolean {
    return TABLE_COMMANDS.has(id);
}

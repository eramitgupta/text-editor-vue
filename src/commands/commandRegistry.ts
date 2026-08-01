import { executeClipboardCommand } from './clipboardCommands';
import { insertChecklist, isChecklistActive } from './checklistCommands';
import { executeFormatCommand, queryFormatState } from './formatCommands';
import { setListStyle } from './listCommands';
import { insertAtSelection } from '../utils/html';
import { executeTableCommand } from './tableCommands';
import { printEditorContent } from './printCommands';
import type { NativeEditorCommand } from '../types';

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
export function executeEditorCommand(
    root: HTMLElement,
    id: string,
    value: string | undefined,
    executeCommand: NativeEditorCommand,
): boolean {
    if (TABLE_COMMANDS.has(id)) return executeTableCommand(root, id);
    if (id === 'checklist') return insertChecklist(root, executeCommand);
    if ((id === 'bullist' || id === 'numlist') && value !== undefined)
        return setListStyle(root, id === 'bullist' ? 'ul' : 'ol', value, executeCommand);
    if (id === 'hr') return insertAtSelection(root, '<hr><p><br></p>');
    if (id === 'anchor')
        return insertAtSelection(
            root,
            `<a id="${globalThis.crypto?.randomUUID?.() ?? Date.now()}" name="anchor"></a>`,
        );
    if (id === 'print') return printEditorContent(root);
    return executeFormatCommand(root, id, value, executeCommand);
}
export async function executeAsyncEditorCommand(
    root: HTMLElement,
    id: string,
    executeCommand: NativeEditorCommand,
): Promise<boolean> {
    return ['cut', 'copy', 'paste', 'pasteText'].includes(id)
        ? executeClipboardCommand(
              root,
              id as 'cut' | 'copy' | 'paste' | 'pasteText',
              executeCommand,
          )
        : false;
}
export function isEditorCommandActive(id: string): boolean {
    if (id === 'checklist') return isChecklistActive();
    return queryFormatState(id);
}
export function isTableCommand(id: string): boolean {
    return TABLE_COMMANDS.has(id);
}

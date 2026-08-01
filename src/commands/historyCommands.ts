import type { NativeEditorCommand } from '../types';

export function executeHistoryCommand(
    id: 'undo' | 'redo',
    executeCommand: NativeEditorCommand,
): boolean {
    return executeCommand(id);
}
export function canUseHistory(id: 'undo' | 'redo'): boolean {
    try {
        return document.queryCommandEnabled(id);
    } catch {
        return true;
    }
}

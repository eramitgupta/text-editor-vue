export function executeHistoryCommand(id: 'undo' | 'redo'): boolean {
    return document.execCommand(id, false);
}
export function canUseHistory(id: 'undo' | 'redo'): boolean {
    try {
        return document.queryCommandEnabled(id);
    } catch {
        return true;
    }
}

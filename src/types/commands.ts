export type EditorCommandId = string;
export interface CommandContext {
    root: HTMLElement;
    restoreSelection: () => boolean;
    sync: () => void;
}
export interface EditorCommand {
    id: EditorCommandId;
    execute: (context: CommandContext, value?: string) => boolean;
    isActive?: () => boolean;
    canExecute?: (root: HTMLElement) => boolean;
}
export interface ClipboardContent {
    html: string;
    text: string;
}

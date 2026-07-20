import type { EditorInit } from './config';
export interface EditorProps {
    modelValue?: string;
    init?: EditorInit;
    disabled?: boolean;
    readonly?: boolean;
    id?: string;
    name?: string;
    ariaLabel?: string;
}
export interface EditorInstance {
    focus(): void;
    blur(): void;
    getHtml(): string;
    setHtml(value: string): void;
    getText(): string;
    clear(): void;
    insertHtml(value: string): void;
    insertText(value: string): void;
    selectAll(): void;
    undo(): void;
    redo(): void;
    openSourceCode(): void;
    openPreview(): void;
    getRootElement(): HTMLElement | null;
}
export interface EditorCounts {
    words: number;
    characters: number;
}
export interface EditorSelectionState {
    path: string;
    commands: Record<string, boolean>;
    insideTable: boolean;
}

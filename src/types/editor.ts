import type { EditorInit } from './config';
import type { MentionErrorSlotProps, MentionItemSlotProps, MentionQuerySlotProps } from './mention';

export interface EditorSlots {
    'toolbar-start'(): unknown;
    'toolbar-end'(): unknown;
    'menubar-end'(): unknown;
    'statusbar-start'(): unknown;
    'statusbar-end'(): unknown;
    'mention-item'(props: MentionItemSlotProps): unknown;
    'mention-loading'(props: MentionQuerySlotProps): unknown;
    'mention-empty'(props: MentionQuerySlotProps): unknown;
    'mention-error'(props: MentionErrorSlotProps): unknown;
    empty(): unknown;
}

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

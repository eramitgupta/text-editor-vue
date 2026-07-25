import type { ComputedRef } from 'vue';
import type { EditorInstance } from '../types';
import { escapeHtml, insertAtSelection } from '../utils/html';
import type { useEditor } from './useEditor';
import type { useEditorSelection } from './useEditorSelection';
import type { useInlineImageUpload } from './useInlineImageUpload';

interface EditorInstanceOptions {
    editor: ReturnType<typeof useEditor>;
    selection: ReturnType<typeof useEditorSelection>;
    inlineImageUpload: ReturnType<typeof useInlineImageUpload>;
    locked: ComputedRef<boolean>;
    syncInput: () => void;
    runCommand: (id: string) => void;
    openDialog: (name: string) => void;
}

export function useEditorInstance(options: EditorInstanceOptions): EditorInstance {
    function focus(): void {
        options.editor.root.value?.focus();
    }

    function setHtml(value: string): void {
        options.inlineImageUpload.discard();
        options.editor.setHtml(value, false);
        options.syncInput();
    }

    function insertHtml(value: string): void {
        if (!options.editor.root.value || options.locked.value) return;
        options.selection.restore();
        insertAtSelection(options.editor.root.value, options.editor.clean(value));
        options.syncInput();
    }

    function selectAll(): void {
        focus();
        document.execCommand('selectAll', false);
        options.selection.update();
    }

    return {
        focus,
        blur: () => options.editor.root.value?.blur(),
        getHtml: options.editor.sync,
        setHtml,
        getText: options.editor.getText,
        clear: () => setHtml(''),
        insertHtml,
        insertText: (value) => insertHtml(escapeHtml(value)),
        selectAll,
        undo: () => options.runCommand('undo'),
        redo: () => options.runCommand('redo'),
        openSourceCode: () => options.openDialog('source'),
        openPreview: () => options.openDialog('preview'),
        getRootElement: () => options.editor.root.value,
    };
}

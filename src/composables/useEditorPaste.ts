import type { ComputedRef } from 'vue';
import { insertImage } from '../commands/insertCommands';
import type { ResolvedEditorInit } from '../types';
import { escapeHtml, insertAtSelection } from '../utils/html';
import type { useEditor } from './useEditor';
import type { useEditorSelection } from './useEditorSelection';
import { useEditorUpload } from './useEditorUpload';

interface EditorPasteOptions {
    editor: ReturnType<typeof useEditor>;
    selection: ReturnType<typeof useEditorSelection>;
    config: ComputedRef<ResolvedEditorInit>;
    locked: ComputedRef<boolean>;
    emitPaste: (event: ClipboardEvent) => void;
    onChange: () => void;
}

export function useEditorPaste(options: EditorPasteOptions) {
    const { upload, cancel } = useEditorUpload(options.config);

    async function handlePaste(event: ClipboardEvent): Promise<void> {
        options.emitPaste(event);
        const root = options.editor.root.value;
        if (options.locked.value || !root) {
            event.preventDefault();
            return;
        }

        const image = [...(event.clipboardData?.files ?? [])].find((file) =>
            file.type.startsWith('image/'),
        );
        if (image && options.config.value.pasteImages && options.config.value.automaticUploads) {
            event.preventDefault();
            options.selection.save();
            try {
                const url = await upload(image);
                options.selection.restore();
                insertImage(
                    root,
                    { src: url, alt: image.name, width: '', height: '' },
                    options.config.value.relativeUrls,
                    options.config.value.imageDefaultWidth,
                );
                options.onChange();
            } catch {
                return;
            } finally {
                cancel();
            }
            return;
        }

        const html = event.clipboardData?.getData('text/html');
        const text = event.clipboardData?.getData('text/plain') ?? '';
        event.preventDefault();
        options.selection.restore();
        insertAtSelection(
            root,
            html ? options.editor.clean(html) : escapeHtml(text).replaceAll('\n', '<br>'),
        );
        options.onChange();
    }

    return { handlePaste };
}

import {
    computed,
    nextTick,
    onBeforeUnmount,
    shallowRef,
    watch,
    type ComputedRef,
    type Ref,
} from 'vue';
import { insertImage } from '../commands/insertCommands';
import type { ImageValue, ResolvedEditorInit } from '../types';
import { isSafeUrl } from '../utils/url';
import { useEditorUpload } from './useEditorUpload';

export function useInlineImageUpload(
    root: Ref<HTMLElement | null>,
    config: ComputedRef<ResolvedEditorInit>,
    locked: ComputedRef<boolean>,
    onChange: () => void,
) {
    const target = shallowRef<HTMLElement | null>(null);
    const error = shallowRef('');
    const { state, upload, cancel: cancelUpload } = useEditorUpload(config);
    const isOpen = computed(() => Boolean(target.value));
    const message = computed(() => error.value || state.error);
    let operation = 0;

    async function open(): Promise<void> {
        if (!root.value || locked.value) return;
        await close(false);
        const editorRoot = root.value;
        const selection = editorRoot.ownerDocument.defaultView?.getSelection();
        const selectedRange = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const range =
            selectedRange && editorRoot.contains(selectedRange.commonAncestorContainer)
                ? selectedRange
                : createRangeAtEnd(editorRoot);
        const placeholder = editorRoot.ownerDocument.createElement('span');
        placeholder.className = 'erag-inline-image-upload-anchor';
        placeholder.dataset.eragTransient = 'true';
        placeholder.contentEditable = 'false';
        placeholder.setAttribute('aria-label', 'Image upload');
        range.deleteContents();
        range.insertNode(placeholder);
        moveCaretAfter(editorRoot, placeholder);
        error.value = '';
        target.value = placeholder;
    }

    async function uploadFile(file: File): Promise<void> {
        if (!target.value || state.loading) return;
        const currentOperation = ++operation;
        error.value = '';
        try {
            const url = await upload(file);
            if (currentOperation !== operation || !target.value) return;
            await replacePlaceholder({ src: url, alt: file.name, width: '', height: '' });
        } catch (uploadError) {
            if (currentOperation === operation && !(uploadError instanceof DOMException)) {
                error.value =
                    uploadError instanceof Error ? uploadError.message : 'Image upload failed.';
            }
        }
    }

    async function insertUrl(url: string): Promise<void> {
        const normalized = url.trim();
        error.value = '';
        if (
            !isSafeUrl(normalized, {
                allowRelative: config.value.relativeUrls,
                allowDataImage: true,
            })
        ) {
            error.value = 'Enter a safe image URL.';
            return;
        }
        await replacePlaceholder({ src: normalized, alt: '', width: '', height: '' });
    }

    async function replacePlaceholder(value: ImageValue): Promise<void> {
        const editorRoot = root.value;
        const placeholder = target.value;
        if (!editorRoot || !placeholder?.isConnected) return;
        target.value = null;
        await nextTick();
        if (!placeholder.isConnected) return;
        selectNode(editorRoot, placeholder);
        const inserted = insertImage(
            editorRoot,
            value,
            config.value.relativeUrls,
            config.value.imageDefaultWidth,
        );
        if (!inserted) {
            target.value = placeholder;
            error.value = 'The image could not be inserted.';
            return;
        }
        cancelUpload();
        onChange();
    }

    async function close(restoreCaret = true): Promise<void> {
        operation += 1;
        cancelUpload();
        error.value = '';
        const editorRoot = root.value;
        const placeholder = target.value;
        target.value = null;
        if (!placeholder) return;
        await nextTick();
        if (!placeholder.isConnected) return;
        if (restoreCaret && editorRoot) moveCaretBefore(editorRoot, placeholder);
        placeholder.remove();
    }

    function discard(): void {
        operation += 1;
        cancelUpload();
        error.value = '';
        target.value?.remove();
        target.value = null;
    }

    watch(locked, (value) => {
        if (value) discard();
    });
    onBeforeUnmount(discard);

    return {
        target,
        state,
        isOpen,
        message,
        open,
        uploadFile,
        insertUrl,
        close,
        discard,
    };
}

function createRangeAtEnd(root: HTMLElement): Range {
    const range = root.ownerDocument.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    return range;
}

function selectNode(root: HTMLElement, node: Node): void {
    const selection = root.ownerDocument.defaultView?.getSelection();
    if (!selection) return;
    const range = root.ownerDocument.createRange();
    range.selectNode(node);
    selection.removeAllRanges();
    selection.addRange(range);
}

function moveCaretAfter(root: HTMLElement, node: Node): void {
    const selection = root.ownerDocument.defaultView?.getSelection();
    if (!selection) return;
    const range = root.ownerDocument.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

function moveCaretBefore(root: HTMLElement, node: Node): void {
    root.focus({ preventScroll: true });
    const selection = root.ownerDocument.defaultView?.getSelection();
    if (!selection) return;
    const range = root.ownerDocument.createRange();
    range.setStartBefore(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

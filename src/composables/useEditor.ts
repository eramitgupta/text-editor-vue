import { computed, shallowRef, type ComputedRef } from 'vue';
import { getTextCounts } from '../utils/html';
import { canSanitizeHtml, sanitizeHtml } from '../utils/sanitizer';
import { restoreSelection, saveSelection } from '../utils/selection';
import type { EditorCounts, ResolvedEditorInit } from '../types';

export function useEditor(config: ComputedRef<ResolvedEditorInit>, initialHtml: string) {
    const root = shallowRef<HTMLElement | null>(null);
    const html = shallowRef(clean(initialHtml));
    const counts = shallowRef<EditorCounts>({ words: 0, characters: 0 });
    const empty = computed(
        () =>
            !(root.value?.textContent ?? '').trim() &&
            !root.value?.querySelector('img,video,audio,iframe,table,hr'),
    );
    function clean(value: string): string {
        return config.value.sanitize && canSanitizeHtml()
            ? sanitizeHtml(value, {
                  allowedTags: config.value.allowedTags,
                  allowedAttributes: config.value.allowedAttributes,
                  allowRelativeUrls: config.value.relativeUrls,
              })
            : value;
    }
    function connect(element: HTMLElement): void {
        root.value = element;
        if (element.innerHTML !== html.value) element.innerHTML = html.value;
        updateCounts();
    }
    function sync(): string {
        if (!root.value) return html.value;
        html.value = root.value.innerHTML;
        updateCounts();
        return html.value;
    }
    function setHtml(value: string, preserve = true): void {
        const next = clean(value);
        if (next === html.value && root.value?.innerHTML === next) return;
        const range = preserve && root.value ? saveSelection(root.value) : null;
        html.value = next;
        if (root.value) {
            root.value.innerHTML = next;
            restoreSelection(range, root.value);
        }
        updateCounts();
    }
    function updateCounts(): void {
        counts.value = root.value ? getTextCounts(root.value) : { words: 0, characters: 0 };
    }
    function getText(): string {
        return root.value?.textContent ?? '';
    }
    return { root, html, counts, empty, clean, connect, sync, setHtml, getText, updateCounts };
}

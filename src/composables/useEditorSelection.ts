import { onBeforeUnmount, shallowRef, type Ref } from 'vue';
import { elementPath, restoreSelection, saveSelection, selectionElement } from '../utils/selection';
import { isEditorCommandActive } from '../commands/commandRegistry';
import type { EditorSelectionState } from '../types';

export function useEditorSelection(root: Ref<HTMLElement | null>) {
    const savedRange = shallowRef<Range | null>(null);
    const state = shallowRef<EditorSelectionState>({ path: 'p', commands: {}, insideTable: false });
    let frame = 0;
    function save(): void {
        if (!root.value) return;
        const range = saveSelection(root.value);
        if (range) savedRange.value = range;
    }
    function restore(): boolean {
        return root.value ? restoreSelection(savedRange.value, root.value) : false;
    }
    function update(): void {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            if (!root.value) return;
            const element = selectionElement(root.value);
            state.value = {
                path: elementPath(root.value),
                insideTable: Boolean(element?.closest('table')),
                commands: Object.fromEntries(
                    [
                        'bold',
                        'italic',
                        'underline',
                        'strikethrough',
                        'alignleft',
                        'aligncenter',
                        'alignright',
                        'alignjustify',
                        'bullist',
                        'numlist',
                    ].map((id) => [id, isEditorCommandActive(id)]),
                ),
            };
            save();
        });
    }
    onBeforeUnmount(() => cancelAnimationFrame(frame));
    return { savedRange, state, save, restore, update };
}

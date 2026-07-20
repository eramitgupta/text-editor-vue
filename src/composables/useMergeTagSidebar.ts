import { shallowRef, useId, watch } from 'vue';
import type {
    EditorMenuName,
    MergeTagItem,
    MergeTagSidebarCallbacks,
    MergeTagSidebarSources,
} from '../types';

export function useMergeTagSidebar(
    sources: MergeTagSidebarSources,
    callbacks: MergeTagSidebarCallbacks,
) {
    const isOpen = shallowRef(false);
    const id = `erag-merge-tag-sidebar-${useId().replaceAll(':', '')}`;

    function handleMenubarOpening(name: EditorMenuName): void {
        callbacks.saveSelection();
        if (name !== 'merge-tags') isOpen.value = false;
    }

    function toggle(): void {
        if (!sources.disabled.value) isOpen.value = !isOpen.value;
    }

    function close(): void {
        isOpen.value = false;
    }

    function select(item: MergeTagItem): void {
        if (sources.locked.value) return;
        callbacks.restoreSelection();
        callbacks.insert(item);
        callbacks.saveSelection();
    }

    watch(
        sources.config,
        (config) => {
            if (!config.enabled || config.items.length === 0) close();
        },
        { deep: true },
    );

    return { isOpen, id, handleMenubarOpening, toggle, close, select };
}

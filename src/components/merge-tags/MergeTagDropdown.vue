<script setup lang="ts">
import { computed, onMounted, useId, useTemplateRef, type CSSProperties } from 'vue';
import type { MergeTagItem } from '../../types';
import { formatMergeTagValue } from '../../utils/mergeTag';

const props = defineProps<{
    items: MergeTagItem[];
    activeIndex: number;
    query: string;
    positionStyle: CSSProperties;
}>();
const emit = defineEmits<{
    select: [item: MergeTagItem];
    activate: [index: number];
    ready: [element: HTMLElement];
}>();
const root = useTemplateRef<HTMLElement>('root');
const instanceId = useId().replaceAll(':', '');
const activeId = computed(() =>
    props.items[props.activeIndex]
        ? `erag-merge-tag-option-${instanceId}-${props.activeIndex}`
        : undefined,
);
const sections = computed(() => {
    const groupedItems = new Map<string, { item: MergeTagItem; index: number }[]>();
    props.items.forEach((item, index) => {
        const group = item.group?.trim() ?? '';
        const entries = groupedItems.get(group) ?? [];
        entries.push({ item, index });
        groupedItems.set(group, entries);
    });
    return [...groupedItems].map(([label, entries]) => ({ label, entries }));
});

onMounted(() => {
    if (root.value) emit('ready', root.value);
});
</script>

<template>
    <div
        ref="root"
        class="erag-merge-tag-dropdown"
        :style="positionStyle"
        role="listbox"
        aria-label="Merge tag suggestions"
        :aria-activedescendant="activeId"
    >
        <div
            class="erag-merge-tag-dropdown__status"
            aria-live="polite"
        >
            {{ items.length }} merge tag suggestions for {{ query }}
        </div>
        <div
            v-if="items.length"
            class="erag-merge-tag-dropdown__list"
        >
            <div
                v-for="section in sections"
                :key="section.label || 'ungrouped'"
                class="erag-merge-tag-dropdown__section"
                role="group"
                :aria-label="section.label || 'Merge tags'"
            >
                <span
                    v-if="section.label"
                    class="erag-merge-tag-dropdown__section-title"
                    >{{ section.label }}</span
                >
                <button
                    v-for="entry in section.entries"
                    :id="`erag-merge-tag-option-${instanceId}-${entry.index}`"
                    :key="`${entry.item.value}-${entry.index}`"
                    type="button"
                    class="erag-merge-tag-dropdown__item"
                    :class="{ 'erag-is-active': entry.index === activeIndex }"
                    role="option"
                    :aria-selected="entry.index === activeIndex"
                    tabindex="-1"
                    @pointerenter="emit('activate', entry.index)"
                    @pointerdown.prevent="emit('select', entry.item)"
                >
                    <span class="erag-merge-tag-dropdown__label">
                        <span
                            v-if="entry.item.name"
                            class="erag-merge-tag-dropdown__name"
                        >
                            {{ entry.item.name }}
                        </span>
                        <span class="erag-merge-tag-dropdown__value">
                            {{ formatMergeTagValue(entry.item.value) }}
                        </span>
                    </span>
                </button>
            </div>
        </div>
        <div
            v-else
            class="erag-merge-tag-dropdown__empty"
            role="status"
        >
            No merge tags found
        </div>
    </div>
</template>

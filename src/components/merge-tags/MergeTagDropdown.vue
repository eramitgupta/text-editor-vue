<script setup lang="ts">
import { computed, onMounted, useId, useTemplateRef, type CSSProperties } from 'vue';
import type { MergeTagItem } from '../../types';

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
            <button
                v-for="(item, index) in items"
                :id="`erag-merge-tag-option-${instanceId}-${index}`"
                :key="item.value"
                type="button"
                class="erag-merge-tag-dropdown__item"
                :class="{ 'erag-is-active': index === activeIndex }"
                role="option"
                :aria-selected="index === activeIndex"
                tabindex="-1"
                @pointerenter="emit('activate', index)"
                @pointerdown.prevent="emit('select', item)"
            >
                <span class="erag-merge-tag-dropdown__label">{{ item.label }}</span>
                <span
                    v-if="item.group"
                    class="erag-merge-tag-dropdown__group"
                    >{{ item.group }}</span
                >
            </button>
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

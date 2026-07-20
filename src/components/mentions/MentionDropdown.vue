<script setup lang="ts">
import { computed, nextTick, onMounted, useId, useTemplateRef, watch, type CSSProperties } from 'vue';
import type { MentionDropdownState, MentionItem } from '../../types';
import MentionResultItem from './MentionItem.vue';

const props = defineProps<{
    items: MentionItem[];
    activeIndex: number;
    state: MentionDropdownState;
    query: string;
    positionStyle: CSSProperties;
}>();
const emit = defineEmits<{
    select: [item: MentionItem];
    activate: [index: number];
    retry: [];
    ready: [element: HTMLElement];
}>();
defineSlots<{
    item(props: { item: MentionItem; active: boolean }): unknown;
    loading(props: { query: string }): unknown;
    empty(props: { query: string }): unknown;
    error(props: { query: string; retry: () => void }): unknown;
}>();
const root = useTemplateRef<HTMLElement>('root');
const instanceId = useId().replaceAll(':', '');
const activeOptionId = computed(() =>
    props.state === 'results' && props.items[props.activeIndex]
        ? optionId(props.activeIndex)
        : undefined,
);
const announcement = computed(() => {
    if (props.state === 'loading') return 'Loading mentions';
    if (props.state === 'error') return 'Unable to load mentions';
    if (props.state === 'empty') return 'No mentions found';
    return `${props.items.length} mention results available`;
});

function optionId(index: number): string {
    return `erag-mention-option-${instanceId}-${index}`;
}

function retry(): void {
    emit('retry');
}

watch(
    () => props.activeIndex,
    async () => {
        await nextTick();
        const id = activeOptionId.value;
        if (id) document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
    },
);

onMounted(() => {
    if (root.value) emit('ready', root.value);
});
</script>

<template>
    <div
        ref="root"
        class="erag-mention-dropdown"
        :class="{
            'erag-is-loading': state === 'loading',
            'erag-is-empty': state === 'empty',
            'erag-has-error': state === 'error',
        }"
        :style="positionStyle"
        role="listbox"
        aria-label="Mention suggestions"
        :aria-activedescendant="activeOptionId"
    >
        <div
            class="erag-mention-dropdown__status"
            aria-live="polite"
            aria-atomic="true"
        >
            {{ announcement }}
        </div>
        <div
            v-if="state === 'loading'"
            class="erag-mention-dropdown__loading"
        >
            <slot
                name="loading"
                :query="query"
            >
                Loading mentions…
            </slot>
        </div>
        <div
            v-else-if="state === 'error'"
            class="erag-mention-dropdown__error"
        >
            <slot
                name="error"
                :query="query"
                :retry="retry"
            >
                <span>Unable to load mentions</span>
                <button
                    type="button"
                    class="erag-mention-dropdown__retry"
                    @pointerdown.prevent="retry"
                >
                    Retry
                </button>
            </slot>
        </div>
        <div
            v-else-if="state === 'empty'"
            class="erag-mention-dropdown__empty"
        >
            <slot
                name="empty"
                :query="query"
            >
                No mentions found
            </slot>
        </div>
        <div
            v-else
            class="erag-mention-dropdown__list"
        >
            <MentionResultItem
                v-for="(item, index) in items"
                :key="item.id"
                :item="item"
                :active="index === activeIndex"
                :option-id="optionId(index)"
                @activate="emit('activate', index)"
                @select="emit('select', item)"
            >
                <template
                    v-if="$slots.item"
                    #default="slotProps"
                >
                    <slot
                        name="item"
                        v-bind="slotProps"
                    />
                </template>
            </MentionResultItem>
        </div>
    </div>
</template>

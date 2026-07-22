<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import type { MergeTagItem } from '../../types';
import { formatMergeTagValue } from '../../utils/mergeTag';
import EditorIcon from '../icons/EditorIcon.vue';

const props = defineProps<{
    id: string;
    items: MergeTagItem[];
    disabled: boolean;
}>();
const emit = defineEmits<{
    close: [];
    select: [item: MergeTagItem];
}>();
const groups = computed(() => {
    const groupedItems = new Map<string, MergeTagItem[]>();
    for (const item of props.items) {
        const group = item.group?.trim() ?? '';
        const items = groupedItems.get(group) ?? [];
        items.push(item);
        groupedItems.set(group, items);
    }
    return [...groupedItems].map(([label, items]) => ({ label, items }));
});

function keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') emit('close');
}

onMounted(() => document.addEventListener('keydown', keydown));
onBeforeUnmount(() => document.removeEventListener('keydown', keydown));
</script>

<template>
    <aside
        :id="id"
        class="erag-merge-tag-sidebar"
        aria-label="Merge tags"
    >
        <header class="erag-merge-tag-sidebar__header">
            <span class="erag-merge-tag-sidebar__title">Merge tag</span>
            <button
                type="button"
                class="erag-merge-tag-sidebar__close"
                aria-label="Close merge tags"
                @mousedown.prevent
                @click="emit('close')"
            >
                <EditorIcon
                    name="close"
                    :size="18"
                />
            </button>
        </header>
        <div class="erag-merge-tag-sidebar__body">
            <section
                v-for="group in groups"
                :key="group.label"
                class="erag-merge-tag-sidebar__group"
            >
                <h3
                    v-if="group.label"
                    class="erag-merge-tag-sidebar__group-title"
                >
                    {{ group.label }}
                </h3>
                <div class="erag-merge-tag-sidebar__list">
                    <div
                        v-for="item in group.items"
                        :key="item.value"
                        class="erag-merge-tag-sidebar__item"
                    >
                        <span
                            v-if="item.name"
                            class="erag-merge-tag-sidebar__item-name"
                        >
                            {{ item.name }}
                        </span>
                        <button
                            type="button"
                            class="erag-merge-tag-sidebar__item-value"
                            :disabled="disabled"
                            @mousedown.prevent
                            @click="emit('select', item)"
                        >
                            {{ formatMergeTagValue(item.value) }}
                        </button>
                    </div>
                </div>
            </section>
            <p
                v-if="groups.length === 0"
                class="erag-merge-tag-sidebar__empty"
            >
                No merge tags configured
            </p>
        </div>
    </aside>
</template>

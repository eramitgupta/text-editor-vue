<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import type {
    EditorTemplateItem,
    ResolvedEditorInit,
    ResolvedEditorTemplatesConfig,
} from '../../types';
import { sanitizeHtml } from '../../utils/sanitizer';
import BaseDialog from './BaseDialog.vue';

const props = defineProps<{
    templates: ResolvedEditorTemplatesConfig;
    config: ResolvedEditorInit;
}>();
const emit = defineEmits<{
    close: [];
    insert: [item: EditorTemplateItem];
}>();
const search = shallowRef('');
const selectedId = shallowRef<string | number | null>(null);
const filteredItems = computed(() => {
    const query = search.value.trim().toLocaleLowerCase();
    if (!query) return props.templates.items;
    return props.templates.items.filter((item) =>
        [item.label, item.description, item.group]
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLocaleLowerCase().includes(query)),
    );
});
const groups = computed(() => {
    const result = new Map<string, EditorTemplateItem[]>();
    for (const item of filteredItems.value) {
        const group = item.group?.trim() || 'General';
        const items = result.get(group) ?? [];
        items.push(item);
        result.set(group, items);
    }
    return [...result].map(([label, items]) => ({ label, items }));
});
const selected = computed(
    () => props.templates.items.find((item) => item.id === selectedId.value) ?? null,
);
const previewHtml = computed(() =>
    selected.value
        ? sanitizeHtml(selected.value.content, {
              allowedTags: props.config.allowedTags,
              allowedAttributes: props.config.allowedAttributes,
              allowRelativeUrls: props.config.relativeUrls,
          })
        : '',
);

watch(
    filteredItems,
    (items) => {
        if (!items.some((item) => item.id === selectedId.value)) {
            selectedId.value = items[0]?.id ?? null;
        }
    },
    { immediate: true },
);

function insert(): void {
    if (selected.value) emit('insert', selected.value);
}
</script>

<template>
    <BaseDialog
        title="Templates"
        wide
        :footer-divider="false"
        @close="emit('close')"
    >
        <div class="erag-template-dialog">
            <aside class="erag-template-dialog__sidebar">
                <label class="erag-template-dialog__search">
                    <span class="erag-template-dialog__search-label">Search templates</span>
                    <input
                        v-model="search"
                        type="search"
                        class="erag-template-dialog__search-input"
                        placeholder="Search"
                    />
                </label>
                <div class="erag-template-dialog__groups">
                    <section
                        v-for="group in groups"
                        :key="group.label"
                        class="erag-template-dialog__group"
                    >
                        <h3 class="erag-template-dialog__group-title">{{ group.label }}</h3>
                        <button
                            v-for="item in group.items"
                            :key="item.id"
                            type="button"
                            class="erag-template-dialog__item"
                            :class="{ 'erag-is-active': item.id === selectedId }"
                            @click="selectedId = item.id"
                            @dblclick="emit('insert', item)"
                        >
                            <span class="erag-template-dialog__item-label">{{ item.label }}</span>
                            <span
                                v-if="item.description"
                                class="erag-template-dialog__item-description"
                            >{{ item.description }}</span>
                        </button>
                    </section>
                    <p
                        v-if="groups.length === 0"
                        class="erag-template-dialog__empty"
                    >
                        No templates found
                    </p>
                </div>
            </aside>
            <section class="erag-template-dialog__preview" aria-label="Template preview">
                <div
                    v-if="selected"
                    class="erag-template-dialog__preview-content"
                    v-html="previewHtml"
                />
                <p
                    v-else
                    class="erag-template-dialog__empty"
                >
                    Select a template to preview it
                </p>
            </section>
        </div>
        <template #footer>
            <button
                type="button"
                class="erag-button"
                @click="emit('close')"
            >
                Cancel
            </button>
            <button
                type="button"
                class="erag-button erag-button--primary"
                :disabled="!selected"
                @click="insert"
            >
                Insert
            </button>
        </template>
    </BaseDialog>
</template>

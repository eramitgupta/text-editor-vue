<script setup lang="ts">
import type { ToolbarItemDefinition } from '../../types';
import EditorIcon from '../icons/EditorIcon.vue';
defineProps<{
    item: ToolbarItemDefinition;
    active: boolean;
    available: boolean;
    disabled: boolean;
}>();
defineEmits<{ activate: [item: ToolbarItemDefinition, event: MouseEvent] }>();
</script>
<template>
    <button
        type="button"
        class="erag-toolbar__button"
        :class="{
            'erag-toolbar__button--dropdown': item.dropdown,
            'erag-is-active': active,
            'erag-is-available': available,
            'erag-is-disabled': disabled,
        }"
        :disabled="disabled"
        :aria-label="item.label"
        :title="item.label"
        :aria-haspopup="item.dropdown ? 'menu' : undefined"
        :aria-expanded="item.dropdown ? active : undefined"
        :aria-pressed="item.dropdown ? undefined : active"
        @mousedown.prevent
        @click="$emit('activate', item, $event)"
    >
        <EditorIcon :name="item.icon ?? 'more'" />
        <EditorIcon
            v-if="item.dropdown"
            name="chevron-down"
            :size="12"
        />
    </button>
</template>

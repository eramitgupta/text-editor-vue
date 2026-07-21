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
            'erag-is-active': active,
            'erag-is-available': available,
            'erag-is-disabled': disabled,
        }"
        :disabled="disabled"
        :aria-label="item.label"
        :title="item.label"
        :aria-pressed="active"
        @mousedown.prevent
        @click="$emit('activate', item, $event)"
    >
        <EditorIcon :name="item.icon ?? 'more'" />
    </button>
</template>

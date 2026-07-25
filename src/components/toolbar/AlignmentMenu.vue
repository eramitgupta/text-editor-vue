<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef } from 'vue';
import type { TextAlignmentCommand } from '../../types';
import EditorIcon from '../icons/EditorIcon.vue';

const props = defineProps<{ selected: TextAlignmentCommand }>();
const emit = defineEmits<{
    close: [];
    select: [command: TextAlignmentCommand];
}>();
const root = useTemplateRef<HTMLElement>('root');
const options: { label: string; value: TextAlignmentCommand; icon: string }[] = [
    { label: 'Align left', value: 'alignleft', icon: 'align-left' },
    { label: 'Align center', value: 'aligncenter', icon: 'align-center' },
    { label: 'Align right', value: 'alignright', icon: 'align-right' },
    { label: 'Justify', value: 'alignjustify', icon: 'align-justify' },
];

function keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
        event.preventDefault();
        emit('close');
        return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const buttons = [...(root.value?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    if (!buttons.length) return;

    const current = Math.max(0, buttons.indexOf(document.activeElement as HTMLButtonElement));
    const next =
        event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;

    buttons[next]?.focus();
}

onMounted(async () => {
    await nextTick();
    root.value
        ?.querySelector<HTMLButtonElement>(`[data-erag-alignment="${props.selected}"]`)
        ?.focus();
});
</script>

<template>
    <div
        ref="root"
        class="erag-case-menu"
        role="menu"
        aria-label="Text alignment"
        @keydown="keydown"
    >
        <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="erag-case-menu__item"
            :class="{ 'erag-is-active': selected === option.value }"
            role="menuitemradio"
            :aria-checked="selected === option.value"
            :data-erag-alignment="option.value"
            @mousedown.prevent
            @click="emit('select', option.value)"
        >
            <EditorIcon
                class="erag-case-menu__icon"
                :name="option.icon"
                :size="16"
            />
            <span class="erag-case-menu__label">{{ option.label }}</span>
            <span
                class="erag-case-menu__check"
                aria-hidden="true"
                >{{ selected === option.value ? '✓' : '' }}</span
            >
        </button>
    </div>
</template>

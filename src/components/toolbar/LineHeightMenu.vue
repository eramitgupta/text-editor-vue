<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef } from 'vue';
import type { LineHeightOption } from '../../types';

const props = defineProps<{
    options: LineHeightOption[];
    selected: string | null;
}>();
const emit = defineEmits<{
    close: [];
    select: [value: string];
}>();
const root = useTemplateRef<HTMLElement>('root');

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
    const selector = props.selected ? `[data-erag-line-height="${props.selected}"]` : 'button';
    root.value?.querySelector<HTMLButtonElement>(selector)?.focus();
});
</script>

<template>
    <div
        ref="root"
        class="erag-case-menu"
        role="menu"
        aria-label="Line height"
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
            :data-erag-line-height="option.value"
            @mousedown.prevent
            @click="emit('select', option.value)"
        >
            <span class="erag-case-menu__label">{{ option.label }}</span>
            <span
                class="erag-case-menu__check"
                aria-hidden="true"
                >{{ selected === option.value ? '✓' : '' }}</span
            >
        </button>
    </div>
</template>

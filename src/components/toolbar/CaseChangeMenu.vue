<script setup lang="ts">
import { nextTick, onMounted, shallowRef, useTemplateRef } from 'vue';
import type { TextCaseMode } from '../../types';

const props = defineProps<{ mode: TextCaseMode | null }>();
const emit = defineEmits<{
    close: [];
    select: [mode: TextCaseMode];
}>();
const root = useTemplateRef<HTMLElement>('root');
const highlightedMode = shallowRef<TextCaseMode | null>(null);
const options: { label: string; value: TextCaseMode }[] = [
    { label: 'lowercase', value: 'lowercase' },
    { label: 'UPPERCASE', value: 'uppercase' },
    { label: 'Title Case', value: 'titlecase' },
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

function isHighlighted(mode: TextCaseMode): boolean {
    return (
        highlightedMode.value === mode || (highlightedMode.value === null && props.mode === mode)
    );
}

function restoreFocusedHighlight(): void {
    const focused = root.value?.contains(document.activeElement)
        ? (document.activeElement as HTMLElement).dataset.eragCase
        : undefined;
    highlightedMode.value = (focused as TextCaseMode | undefined) ?? null;
}

onMounted(async () => {
    await nextTick();
    const selector = props.mode ? `[data-erag-case="${props.mode}"]` : 'button';
    root.value?.querySelector<HTMLButtonElement>(selector)?.focus();
});
</script>

<template>
    <div
        ref="root"
        class="erag-case-menu"
        role="menu"
        aria-label="Change text case"
        @keydown="keydown"
        @pointerleave="restoreFocusedHighlight"
    >
        <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="erag-case-menu__item"
            :class="{ 'erag-is-active': isHighlighted(option.value) }"
            role="menuitemradio"
            :aria-checked="mode === option.value"
            :data-erag-case="option.value"
            @focus="highlightedMode = option.value"
            @pointerenter="highlightedMode = option.value"
            @mousedown.prevent
            @click="emit('select', option.value)"
        >
            <span class="erag-case-menu__label">{{ option.label }}</span>
            <span
                class="erag-case-menu__check"
                aria-hidden="true"
                >{{ mode === option.value ? '✓' : '' }}</span
            >
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, useTemplateRef } from 'vue';
import type { ListCommand } from '../../types';

interface ListStyleOption {
    label: string;
    style: string;
    markers: [string, string, string];
}

const props = defineProps<{
    command: ListCommand;
    active: boolean;
    selectedStyle: string;
}>();
const emit = defineEmits<{
    close: [];
    select: [command: ListCommand, style: string];
}>();
const root = useTemplateRef<HTMLElement>('root');
const bulletOptions: ListStyleOption[] = [
    { label: 'Default bullets', style: '', markers: ['•', '•', '•'] },
    { label: 'Circle bullets', style: 'circle', markers: ['○', '○', '○'] },
    { label: 'Disc bullets', style: 'disc', markers: ['●', '●', '●'] },
    { label: 'Square bullets', style: 'square', markers: ['▪', '▪', '▪'] },
];
const numberedOptions: ListStyleOption[] = [
    { label: 'Decimal numbers', style: 'decimal', markers: ['1.', '2.', '3.'] },
    { label: 'Lower alpha', style: 'lower-alpha', markers: ['a.', 'b.', 'c.'] },
    { label: 'Lower greek', style: 'lower-greek', markers: ['α.', 'β.', 'γ.'] },
    { label: 'Lower roman', style: 'lower-roman', markers: ['i.', 'ii.', 'iii.'] },
    { label: 'Upper alpha', style: 'upper-alpha', markers: ['A.', 'B.', 'C.'] },
    { label: 'Upper roman', style: 'upper-roman', markers: ['I.', 'II.', 'III.'] },
];
const options = computed(() => (props.command === 'bullist' ? bulletOptions : numberedOptions));
const columnCount = computed(() => (props.command === 'bullist' ? 4 : 3));

function isSelected(option: ListStyleOption): boolean {
    if (!props.active) return false;

    return option.style === props.selectedStyle;
}

function keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
        event.preventDefault();
        emit('close');
        return;
    }
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
        return;

    event.preventDefault();
    const buttons = [...(root.value?.querySelectorAll<HTMLButtonElement>('button') ?? [])];
    if (!buttons.length) return;

    const current = Math.max(0, buttons.indexOf(document.activeElement as HTMLButtonElement));
    const offset =
        event.key === 'ArrowDown'
            ? columnCount.value
            : event.key === 'ArrowUp'
              ? -columnCount.value
              : event.key === 'ArrowRight'
                ? 1
                : -1;
    const next =
        event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : (current + offset + buttons.length) % buttons.length;

    buttons[next]?.focus();
}

onMounted(async () => {
    await nextTick();
    root.value?.querySelector<HTMLButtonElement>('.erag-list-style-menu__item')?.focus();
});
</script>

<template>
    <div
        ref="root"
        class="erag-list-style-menu"
        :class="`erag-list-style-menu--${command}`"
        role="menu"
        :aria-label="command === 'bullist' ? 'Bulleted list styles' : 'Numbered list styles'"
        @keydown="keydown"
    >
        <button
            v-for="option in options"
            :key="option.label"
            type="button"
            class="erag-list-style-menu__item"
            :class="{ 'erag-is-active': isSelected(option) }"
            role="menuitemradio"
            :aria-label="option.label"
            :aria-checked="isSelected(option)"
            :title="option.label"
            @mousedown.prevent
            @click="emit('select', command, option.style)"
        >
            <span
                v-for="(marker, index) in option.markers"
                :key="`${option.label}-${index}`"
                class="erag-list-style-menu__row"
            >
                <span class="erag-list-style-menu__marker">{{ marker }}</span>
                <span class="erag-list-style-menu__line" />
            </span>
        </button>
    </div>
</template>

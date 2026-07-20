<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import BaseDialog from './BaseDialog.vue';
const emit = defineEmits<{ close: []; select: [value: string] }>();
const query = shallowRef('');
const category = shallowRef('Currency');
const categories: Record<string, string[]> = {
    Currency: ['$', '€', '£', '¥', '₹', '₩', '₽', '¢'],
    Mathematics: ['±', '×', '÷', '≈', '≠', '≤', '≥', '∞', '√', '∑', '∫'],
    Arrows: ['←', '↑', '→', '↓', '↔', '↕', '⇐', '⇒', '⇔'],
    Punctuation: ['—', '–', '…', '“', '”', '‘', '’', '•', '§', '¶'],
    Latin: ['©', '®', '™', 'æ', 'Æ', 'ø', 'Ø', 'ß', 'ñ'],
    Greek: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'φ', 'ω', 'Ω'],
    Miscellaneous: ['✓', '✕', '★', '☆', '♠', '♥', '♦', '♣', '♪', '☀'],
};
const symbols = computed(
    () =>
        categories[category.value]?.filter(
            (value) => !query.value || value.includes(query.value),
        ) ?? [],
);
</script>
<template>
    <BaseDialog
        title="Special character"
        wide
        @close="emit('close')"
        ><div class="erag-character-dialog">
            <input
                v-model="query"
                class="erag-field__input"
                type="search"
                placeholder="Search symbols"
                aria-label="Search symbols"
            />
            <div
                class="erag-character-dialog__categories"
                role="tablist"
            >
                <button
                    v-for="(_, name) in categories"
                    :key="name"
                    type="button"
                    class="erag-character-dialog__category"
                    :class="{ 'erag-is-active': category === name }"
                    @click="category = String(name)"
                >
                    {{ name }}
                </button>
            </div>
            <div class="erag-character-dialog__grid">
                <button
                    v-for="symbol in symbols"
                    :key="symbol"
                    type="button"
                    class="erag-character-dialog__symbol"
                    :aria-label="`Insert ${symbol}`"
                    @click="emit('select', symbol)"
                >
                    {{ symbol }}
                </button>
            </div>
        </div></BaseDialog
    >
</template>

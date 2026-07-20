<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import {
    ALL_SPECIAL_CHARACTERS,
    SPECIAL_CHARACTER_CATEGORIES,
} from '../../constants/specialCharacters';
import BaseDialog from './BaseDialog.vue';

const emit = defineEmits<{ close: []; select: [value: string] }>();
const query = shallowRef('');
const category = shallowRef('All');
const categories = computed(() => [
    'All',
    ...SPECIAL_CHARACTER_CATEGORIES.map((item) => item.name),
]);
const symbols = computed(() => {
    const source =
        category.value === 'All'
            ? ALL_SPECIAL_CHARACTERS
            : (SPECIAL_CHARACTER_CATEGORIES.find((item) => item.name === category.value)?.items ??
              []);
    const search = query.value.trim().toLocaleLowerCase();
    return search
        ? source.filter(
              (item) =>
                  item.value.includes(search) || item.label.toLocaleLowerCase().includes(search),
          )
        : source;
});
</script>

<template>
    <BaseDialog
        title="Special Character"
        @close="emit('close')"
    >
        <div class="erag-character-dialog">
            <div
                class="erag-character-dialog__categories"
                role="tablist"
                aria-label="Special character categories"
            >
                <button
                    v-for="name in categories"
                    :key="name"
                    type="button"
                    class="erag-character-dialog__category"
                    :class="{ 'erag-is-active': category === name }"
                    role="tab"
                    :aria-selected="category === name"
                    @click="category = name"
                >
                    {{ name }}
                </button>
            </div>
            <div class="erag-character-dialog__content">
                <label class="erag-character-dialog__search">
                    <span class="erag-character-dialog__search-label">Search</span>
                    <input
                        v-model="query"
                        class="erag-field__input"
                        type="search"
                        placeholder="Search"
                    />
                </label>
                <div
                    class="erag-character-dialog__grid"
                    role="tabpanel"
                >
                    <button
                        v-for="(symbol, index) in symbols"
                        :key="`${symbol.value}-${index}`"
                        type="button"
                        class="erag-character-dialog__symbol"
                        :aria-label="`Insert ${symbol.label}: ${symbol.value}`"
                        :title="symbol.label"
                        @click="emit('select', symbol.value)"
                    >
                        {{ symbol.value }}
                    </button>
                    <p
                        v-if="symbols.length === 0"
                        class="erag-character-dialog__empty"
                    >
                        No characters found
                    </p>
                </div>
            </div>
        </div>
        <template #footer>
            <button
                type="button"
                class="erag-button erag-button--primary"
                @click="emit('close')"
            >
                Close
            </button>
        </template>
    </BaseDialog>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { EMOJI_CATEGORIES, EMOJIS } from '../../constants/emojis';
import type { EmojiCategoryFilter } from '../../types';
import BaseDialog from './BaseDialog.vue';

const emit = defineEmits<{ close: []; select: [value: string] }>();
const query = shallowRef('');
const category = shallowRef<EmojiCategoryFilter>('All');
const visibleEmojis = computed(() => {
    const search = query.value.trim().toLocaleLowerCase();
    return EMOJIS.filter(
        (emoji) =>
            (category.value === 'All' || emoji.category === category.value) &&
            (!search || emoji.label.toLocaleLowerCase().includes(search) || emoji.value === search),
    );
});
</script>

<template>
    <BaseDialog
        title="Emojis"
        :footer-divider="false"
        @close="emit('close')"
    >
        <div class="erag-emoji-dialog">
            <nav
                class="erag-emoji-dialog__categories"
                aria-label="Emoji categories"
            >
                <button
                    v-for="name in EMOJI_CATEGORIES"
                    :key="name"
                    type="button"
                    class="erag-emoji-dialog__category"
                    :class="{ 'erag-is-active': category === name }"
                    :aria-pressed="category === name"
                    @click="category = name"
                >
                    {{ name }}
                </button>
            </nav>
            <div class="erag-emoji-dialog__content">
                <label class="erag-field">
                    <span class="erag-field__label">Search</span>
                    <input
                        v-model="query"
                        class="erag-field__input"
                        type="search"
                        autocomplete="off"
                    />
                </label>
                <div
                    v-if="visibleEmojis.length"
                    class="erag-emoji-dialog__grid"
                    role="listbox"
                    aria-label="Emojis"
                >
                    <button
                        v-for="emoji in visibleEmojis"
                        :key="`${emoji.category}-${emoji.label}`"
                        type="button"
                        class="erag-emoji-dialog__emoji"
                        role="option"
                        :aria-label="emoji.label"
                        :title="emoji.label"
                        @click="emit('select', emoji.value)"
                    >
                        {{ emoji.value }}
                    </button>
                </div>
                <p
                    v-else
                    class="erag-emoji-dialog__empty"
                    role="status"
                >
                    No emojis found
                </p>
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

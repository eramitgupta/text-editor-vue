<script setup lang="ts">
import type { WordCountData } from '../../types';
import BaseDialog from './BaseDialog.vue';

defineProps<{ counts: WordCountData }>();
defineEmits<{ close: [] }>();
</script>

<template>
    <BaseDialog
        title="Word Count"
        :footer-divider="false"
        @close="$emit('close')"
    >
        <table class="erag-word-count__table">
            <thead>
                <tr>
                    <th class="erag-word-count__heading erag-word-count__heading--label">Count</th>
                    <th class="erag-word-count__heading">Document</th>
                    <th class="erag-word-count__heading">Selection</th>
                </tr>
            </thead>
            <tbody>
                <tr class="erag-word-count__row">
                    <th class="erag-word-count__label">Words</th>
                    <td class="erag-word-count__value">{{ counts.document.words }}</td>
                    <td class="erag-word-count__value">{{ counts.selection.words }}</td>
                </tr>
                <tr class="erag-word-count__row">
                    <th class="erag-word-count__label">Characters (no spaces)</th>
                    <td class="erag-word-count__value">
                        {{ counts.document.charactersWithoutSpaces }}
                    </td>
                    <td class="erag-word-count__value">
                        {{ counts.selection.charactersWithoutSpaces }}
                    </td>
                </tr>
                <tr class="erag-word-count__row">
                    <th class="erag-word-count__label">Characters</th>
                    <td class="erag-word-count__value">{{ counts.document.characters }}</td>
                    <td class="erag-word-count__value">{{ counts.selection.characters }}</td>
                </tr>
            </tbody>
        </table>
        <template #footer>
            <button
                type="button"
                class="erag-button erag-button--primary"
                @click="$emit('close')"
            >
                Close
            </button>
        </template>
    </BaseDialog>
</template>

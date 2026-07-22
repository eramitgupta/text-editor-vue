<script setup lang="ts">
import { reactive } from 'vue';
import BaseDialog from './BaseDialog.vue';

const emit = defineEmits<{ close: []; save: [values: Record<string, string>] }>();
const form = reactive({
    width: '100%',
    cellPadding: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#d9dce1',
    backgroundColor: '#ffffff',
    alignment: 'left',
});
const propertyFields = [
    { key: 'width', label: 'Width', type: 'text' },
    { key: 'cellPadding', label: 'Cell padding', type: 'text' },
    { key: 'borderWidth', label: 'Border width', type: 'text' },
    { key: 'borderColor', label: 'Border color', type: 'color' },
    { key: 'backgroundColor', label: 'Background color', type: 'color' },
] as const;
</script>

<template>
    <BaseDialog
        title="Table properties"
        @close="emit('close')"
    >
        <div class="erag-dialog__form erag-dialog__form--grid">
            <label
                v-for="field in propertyFields"
                :key="field.key"
                class="erag-field"
            >
                <span class="erag-field__label">{{ field.label }}</span>
                <input
                    v-if="field.type === 'text'"
                    v-model="form[field.key]"
                    class="erag-field__input"
                    type="text"
                />
                <span
                    v-else
                    class="erag-color-input"
                >
                    <input
                        v-model="form[field.key]"
                        class="erag-color-input__swatch"
                        type="color"
                        :aria-label="field.label"
                    />
                    <span class="erag-color-input__value">{{ form[field.key] }}</span>
                </span>
            </label>
            <label class="erag-field">
                <span class="erag-field__label">Border style</span>
                <select
                    v-model="form.borderStyle"
                    class="erag-field__input"
                >
                    <option>solid</option>
                    <option>dashed</option>
                    <option>dotted</option>
                    <option>double</option>
                    <option>none</option>
                </select>
            </label>
            <label class="erag-field">
                <span class="erag-field__label">Alignment</span>
                <select
                    v-model="form.alignment"
                    class="erag-field__input"
                >
                    <option>left</option>
                    <option>center</option>
                    <option>right</option>
                </select>
            </label>
        </div>
        <template #footer>
            <button
                type="button"
                class="erag-button"
                @click="emit('close')"
            >
                Cancel
            </button>
            <button
                type="button"
                class="erag-button erag-button--primary"
                @click="emit('save', { ...form })"
            >
                Apply
            </button>
        </template>
    </BaseDialog>
</template>

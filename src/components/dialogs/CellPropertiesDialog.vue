<script setup lang="ts">
import { reactive } from 'vue';
import type { CellPropertiesValue } from '../../types';
import BaseDialog from './BaseDialog.vue';

const props = defineProps<{ initial: CellPropertiesValue }>();
const emit = defineEmits<{ close: []; save: [values: CellPropertiesValue] }>();
const form = reactive<CellPropertiesValue>({ ...props.initial });

function updateCellType(): void {
    if (form.cellType === 'td') form.scope = '';
}
</script>

<template>
    <BaseDialog
        title="Cell properties"
        @close="emit('close')"
    >
        <div class="erag-dialog__form erag-dialog__form--grid">
            <label class="erag-field">
                <span class="erag-field__label">Apply to</span>
                <select
                    v-model="form.target"
                    class="erag-field__input"
                >
                    <option value="cell">Selected cell</option>
                    <option value="first-row">First row</option>
                </select>
            </label>
            <label class="erag-field">
                <span class="erag-field__label">Cell type</span>
                <select
                    v-model="form.cellType"
                    class="erag-field__input"
                    @change="updateCellType"
                >
                    <option value="td">Cell</option>
                    <option value="th">Header cell</option>
                </select>
            </label>
            <label class="erag-field">
                <span class="erag-field__label">Scope</span>
                <select
                    v-model="form.scope"
                    class="erag-field__input"
                    :disabled="form.cellType === 'td'"
                >
                    <option value="">None</option>
                    <option value="row">Row</option>
                    <option value="col">Column</option>
                </select>
            </label>
            <label class="erag-field">
                <span class="erag-field__label">Horizontal align</span>
                <select
                    v-model="form.horizontalAlign"
                    class="erag-field__input"
                >
                    <option value="">None</option>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </label>
            <label class="erag-field">
                <span class="erag-field__label">Vertical align</span>
                <select
                    v-model="form.verticalAlign"
                    class="erag-field__input"
                >
                    <option value="">None</option>
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
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

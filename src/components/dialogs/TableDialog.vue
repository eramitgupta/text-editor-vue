<script setup lang="ts">
import { shallowRef } from 'vue';
import BaseDialog from './BaseDialog.vue';
const props = defineProps<{ size: number }>();
const emit = defineEmits<{ close: []; save: [rows: number, columns: number] }>();
const rows = shallowRef(2);
const columns = shallowRef(2);
</script>
<template>
    <BaseDialog
        title="Insert table"
        @close="emit('close')"
        ><div
            class="erag-table-grid"
            role="grid"
            :aria-label="`${rows} by ${columns} table`"
        >
            <button
                v-for="index in props.size * props.size"
                :key="index"
                type="button"
                class="erag-table-grid__cell"
                :class="{
                    'erag-is-active':
                        Math.ceil(index / props.size) <= rows &&
                        ((index - 1) % props.size) + 1 <= columns,
                }"
                :aria-label="`${Math.ceil(index / props.size)} rows by ${((index - 1) % props.size) + 1} columns`"
                @mouseenter="
                    rows = Math.ceil(index / props.size);
                    columns = ((index - 1) % props.size) + 1;
                "
                @click="emit('save', rows, columns)"
            />
        </div>
        <p class="erag-table-grid__label">{{ rows }} × {{ columns }}</p>
        <template #footer
            ><button
                type="button"
                class="erag-button"
                @click="emit('close')"
            >
                Cancel</button
            ><button
                type="button"
                class="erag-button erag-button--primary"
                @click="emit('save', rows, columns)"
            >
                Insert
            </button></template
        ></BaseDialog
    >
</template>

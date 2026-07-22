<script setup lang="ts">
import { shallowRef } from 'vue';
import BaseDialog from './BaseDialog.vue';
const props = defineProps<{ html: string; editable: boolean }>();
const emit = defineEmits<{ close: []; save: [html: string] }>();
const source = shallowRef(props.html);
function close(): void {
    emit('close');
}
function keydown(event: KeyboardEvent): void {
    if (!props.editable || event.key !== 'Tab') return;
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    source.value = `${source.value.slice(0, start)}    ${source.value.slice(target.selectionEnd)}`;
    requestAnimationFrame(() => target.setSelectionRange(start + 4, start + 4));
}
</script>
<template>
    <BaseDialog
        title="Source code"
        wide
        body-class="erag-dialog__body--source"
        @close="close"
    >
        <textarea
            v-model="source"
            class="erag-source-editor"
            spellcheck="false"
            aria-label="HTML source"
            :readonly="!editable"
            @keydown="keydown"
        /><template #footer
            ><button
                type="button"
                class="erag-button"
                @click="close"
            >
                {{ editable ? 'Cancel' : 'Close' }}</button
            ><button
                v-if="editable"
                type="button"
                class="erag-button erag-button--primary"
                @click="emit('save', source)"
            >
                Apply
            </button></template
        ></BaseDialog
    >
</template>

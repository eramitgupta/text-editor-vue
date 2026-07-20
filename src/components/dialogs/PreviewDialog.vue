<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { printEditorContent } from '../../commands/printCommands';
import BaseDialog from './BaseDialog.vue';
defineProps<{ html: string; contentStyle: string }>();
defineEmits<{ close: [] }>();
const preview = useTemplateRef<HTMLElement>('preview');
function print(): void {
    if (preview.value) printEditorContent(preview.value);
}
</script>
<template>
    <BaseDialog
        title="Preview"
        wide
        @close="$emit('close')"
        ><div
            ref="preview"
            class="erag-preview"
            :style="contentStyle"
            v-html="html"
        />
        <template #footer
            ><button
                type="button"
                class="erag-button"
                @click="print"
            >
                Print</button
            ><button
                type="button"
                class="erag-button erag-button--primary"
                @click="$emit('close')"
            >
                Close
            </button></template
        ></BaseDialog
    >
</template>

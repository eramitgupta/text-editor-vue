<script setup lang="ts">
import { computed, toRef, useTemplateRef } from 'vue';
import { useFloatingPosition } from '../../composables/useFloatingPosition';
import type { ResolvedEditorInit, UploadState } from '../../types';
import InlineImageUpload from './InlineImageUpload.vue';

const props = defineProps<{
    target: HTMLElement | null;
    config: ResolvedEditorInit;
    state: UploadState;
    error: string;
}>();
defineEmits<{
    file: [file: File];
    insertUrl: [url: string];
    close: [];
}>();
const panel = useTemplateRef<HTMLElement>('panel');
const target = toRef(props, 'target');
const boundary = computed<HTMLElement | null>(
    () => props.target?.closest<HTMLElement>('.erag-editor__content-wrap') ?? null,
);
const { style } = useFloatingPosition(target, panel, boundary);
</script>

<template>
    <span
        v-if="target"
        ref="panel"
        class="erag-inline-image-upload-portal"
        :style="style"
    >
        <InlineImageUpload
            :accepted-formats="config.acceptedFormats"
            :file-picker="config.imageFilePicker"
            :url-input="config.imageUrlInput"
            :loading="state.loading"
            :progress="state.progress"
            :error="error"
            @file="$emit('file', $event)"
            @insert-url="$emit('insertUrl', $event)"
            @close="$emit('close')"
        />
    </span>
</template>

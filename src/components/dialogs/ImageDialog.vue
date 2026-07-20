<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue';
import { useEditorUpload } from '../../composables/useEditorUpload';
import type { ImageValue, ResolvedEditorInit } from '../../types';
import { isSafeUrl } from '../../utils/url';
import EditorIcon from '../icons/EditorIcon.vue';
import BaseDialog from './BaseDialog.vue';
const props = defineProps<{ config: ResolvedEditorInit }>();
const emit = defineEmits<{ close: []; save: [value: ImageValue] }>();
const configRef = computed(() => props.config);
const { state, upload, cancel } = useEditorUpload(configRef);
const form = reactive<ImageValue>({ src: '', alt: '', width: '', height: '' });
const locked = shallowRef(true);
const ratio = shallowRef(1);
const error = shallowRef('');
const isDragging = shallowRef(false);
async function fileSelected(file: File | undefined): Promise<void> {
    if (!file) return;
    try {
        form.src = await upload(file);
    } catch {
        return;
    }
}
function dropFile(file: File | undefined): void {
    isDragging.value = false;
    void fileSelected(file);
}
function dimensions(event: Event): void {
    const image = event.target as HTMLImageElement;
    ratio.value = image.naturalWidth / image.naturalHeight || 1;
    if (!form.width) {
        const defaultWidth = Math.max(1, props.config.imageDefaultWidth);
        form.width = String(Math.min(image.naturalWidth, defaultWidth));
    }
    if (!form.height) form.height = String(Math.round(Number(form.width) / ratio.value));
}
function widthChanged(): void {
    if (locked.value && ratio.value)
        form.height = String(Math.round(Number(form.width) / ratio.value));
}
function heightChanged(): void {
    if (locked.value && ratio.value)
        form.width = String(Math.round(Number(form.height) * ratio.value));
}
function save(): void {
    if (!isSafeUrl(form.src, { allowRelative: props.config.relativeUrls, allowDataImage: true })) {
        error.value = 'Choose an image or enter a safe image URL.';
        return;
    }
    emit('save', { ...form });
}
function close(): void {
    cancel();
    emit('close');
}
</script>
<template>
    <BaseDialog
        title="Insert image"
        wide
        @close="close"
        ><div
            class="erag-dialog__dropzone"
            :class="{
                'erag-is-clickable': config.imageFilePicker,
                'erag-is-dragging': isDragging,
            }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent
            @dragleave.prevent="isDragging = false"
            @drop.prevent="dropFile($event.dataTransfer?.files[0])"
        >
            <input
                v-if="config.imageFilePicker"
                class="erag-field__file"
                type="file"
                aria-label="Choose or drop an image"
                :accept="config.acceptedFormats.join(',')"
                @change="fileSelected(($event.target as HTMLInputElement).files?.[0])"
            /><span class="erag-dialog__dropzone-icon">
                <EditorIcon
                    name="upload"
                    :size="18"
                /> </span
            ><span class="erag-dialog__dropzone-label">Choose or drop an image</span>
        </div>
        <div
            v-if="state.previewUrl"
            class="erag-dialog__image-preview"
        >
            <img
                :src="state.previewUrl"
                alt="Upload preview"
                @load="dimensions"
            />
        </div>
        <progress
            v-if="state.loading"
            class="erag-dialog__progress"
            max="100"
            :value="state.progress"
        >
            {{ state.progress }}%
        </progress>
        <div class="erag-dialog__form erag-dialog__form--grid erag-dialog__form--image">
            <label
                v-if="config.imageUrlInput"
                class="erag-field erag-field--wide"
                ><span class="erag-field__label">Source URL</span
                ><input
                    v-model.trim="form.src"
                    class="erag-field__input"
                    inputmode="url" /></label
            ><label class="erag-field erag-field--wide"
                ><span class="erag-field__label">Alternative description</span
                ><input
                    v-model="form.alt"
                    class="erag-field__input" /></label
            ><label class="erag-field"
                ><span class="erag-field__label">Width</span
                ><input
                    v-model="form.width"
                    class="erag-field__input"
                    type="number"
                    min="1"
                    @input="widthChanged" /></label
            ><label class="erag-field"
                ><span class="erag-field__label">Height</span
                ><input
                    v-model="form.height"
                    class="erag-field__input"
                    type="number"
                    min="1"
                    @input="heightChanged" /></label
            ><label class="erag-field__check"
                ><input
                    v-model="locked"
                    type="checkbox"
                />
                Lock aspect ratio</label
            >
        </div>
        <p
            v-if="error || state.error"
            class="erag-field__error"
            role="alert"
        >
            {{ error || state.error }}
        </p>
        <template #footer
            ><button
                type="button"
                class="erag-button"
                @click="close"
            >
                Cancel</button
            ><button
                type="button"
                class="erag-button erag-button--primary"
                :disabled="state.loading"
                @click="save"
            >
                Save
            </button></template
        ></BaseDialog
    >
</template>

<script setup lang="ts">
import { computed, nextTick, shallowRef, useId, useTemplateRef, watch } from 'vue';
import EditorIcon from '../icons/EditorIcon.vue';

const props = defineProps<{
    acceptedFormats: string[];
    filePicker: boolean;
    urlInput: boolean;
    loading: boolean;
    progress: number;
    error: string;
}>();
const emit = defineEmits<{
    file: [file: File];
    insertUrl: [url: string];
    close: [];
}>();
const fileInput = useTemplateRef<HTMLInputElement>('fileInput');
const urlField = useTemplateRef<HTMLInputElement>('urlField');
const urlInputId = useId();
const url = shallowRef('');
const mode = shallowRef<'actions' | 'url'>('actions');
const isDragging = shallowRef(false);
const accept = computed(() => props.acceptedFormats.join(','));

function chooseFile(): void {
    if (props.filePicker && !props.loading) fileInput.value?.click();
}

function selectFile(file: File | undefined): void {
    if (!file || props.loading) return;
    emit('file', file);
    if (fileInput.value) fileInput.value.value = '';
}

function drop(event: DragEvent): void {
    isDragging.value = false;
    if (props.filePicker) selectFile(event.dataTransfer?.files[0]);
}

function submitUrl(): void {
    if (url.value.trim() && !props.loading) emit('insertUrl', url.value);
}

watch(mode, (value) => {
    if (value === 'url') void nextTick(() => urlField.value?.focus());
});
</script>

<template>
    <span
        class="erag-inline-image-upload"
        :class="{
            'erag-is-dragging': isDragging,
            'erag-is-loading': loading,
            'erag-has-error': error,
        }"
        role="group"
        aria-label="Insert image"
        @keydown.esc.prevent="emit('close')"
        @dragenter.prevent="isDragging = true"
        @dragover.prevent
        @dragleave.prevent="isDragging = false"
        @drop.prevent="drop"
    >
        <input
            ref="fileInput"
            class="erag-inline-image-upload__file"
            type="file"
            :accept="accept"
            tabindex="-1"
            aria-hidden="true"
            @change="selectFile(($event.target as HTMLInputElement).files?.[0])"
        />
        <button
            v-if="mode === 'actions'"
            class="erag-inline-image-upload__dropzone"
            type="button"
            :disabled="loading || !filePicker"
            @click="chooseFile"
        >
            <span class="erag-inline-image-upload__illustration">
                <EditorIcon
                    name="image"
                    :size="34"
                />
            </span>
            <span class="erag-inline-image-upload__title">
                {{ loading ? 'Uploading image…' : 'Drop files here' }}
            </span>
            <span
                v-if="loading"
                class="erag-inline-image-upload__progress-label"
            >
                {{ Math.round(progress) }}%
            </span>
        </button>
        <form
            v-else
            class="erag-inline-image-upload__url-form"
            @submit.prevent="submitUrl"
        >
            <label
                class="erag-inline-image-upload__url-label"
                :for="urlInputId"
                >Image URL</label
            >
            <span class="erag-inline-image-upload__url-row">
                <input
                    :id="urlInputId"
                    ref="urlField"
                    v-model="url"
                    class="erag-inline-image-upload__url-input"
                    type="text"
                    inputmode="url"
                    autocomplete="url"
                    placeholder="https://example.com/image.jpg"
                />
                <button
                    class="erag-inline-image-upload__insert"
                    type="submit"
                    :disabled="loading || !url.trim()"
                >
                    Insert
                </button>
            </span>
        </form>
        <progress
            v-if="loading"
            class="erag-inline-image-upload__progress"
            max="100"
            :value="progress > 0 ? progress : undefined"
        >
            {{ progress }}%
        </progress>
        <span
            v-if="error"
            class="erag-inline-image-upload__error"
            role="alert"
        >
            {{ error }}
        </span>
        <span class="erag-inline-image-upload__actions">
            <button
                v-if="filePicker"
                class="erag-inline-image-upload__action"
                type="button"
                title="Upload from device"
                aria-label="Upload from device"
                :disabled="loading"
                @click="chooseFile"
            >
                <EditorIcon
                    name="upload"
                    :size="18"
                />
            </button>
            <button
                v-if="urlInput"
                class="erag-inline-image-upload__action"
                :class="{ 'erag-is-active': mode === 'url' }"
                type="button"
                title="Upload from URL"
                aria-label="Upload from URL"
                :disabled="loading"
                @click="mode = mode === 'url' ? 'actions' : 'url'"
            >
                <EditorIcon
                    name="link"
                    :size="18"
                />
            </button>
            <button
                class="erag-inline-image-upload__action erag-inline-image-upload__action--close"
                type="button"
                title="Cancel image upload"
                aria-label="Cancel image upload"
                @click="emit('close')"
            >
                <EditorIcon
                    name="close"
                    :size="17"
                />
            </button>
        </span>
    </span>
</template>

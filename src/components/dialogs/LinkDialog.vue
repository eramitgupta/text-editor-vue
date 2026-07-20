<script setup lang="ts">
import { reactive, shallowRef } from 'vue';
import type { LinkValue } from '../../types';
import { isSafeUrl } from '../../utils/url';
import BaseDialog from './BaseDialog.vue';
const props = defineProps<{ initial: LinkValue; allowRelative: boolean; canUnlink: boolean }>();
const emit = defineEmits<{ close: []; save: [value: LinkValue]; unlink: [] }>();
const form = reactive<LinkValue>({ ...props.initial });
const error = shallowRef('');
function save(): void {
    if (!isSafeUrl(form.url, { allowRelative: props.allowRelative })) {
        error.value = 'Enter a safe HTTP, email, telephone, anchor, or allowed relative URL.';
        return;
    }
    emit('save', { ...form });
}
</script>
<template>
    <BaseDialog
        title="Insert/edit link"
        @close="emit('close')"
        ><form
            class="erag-dialog__form"
            @submit.prevent="save"
        >
            <label class="erag-field"
                ><span class="erag-field__label">URL</span
                ><input
                    v-model.trim="form.url"
                    class="erag-field__input"
                    required
                    inputmode="url" /></label
            ><label class="erag-field"
                ><span class="erag-field__label">Text to display</span
                ><input
                    v-model="form.text"
                    class="erag-field__input" /></label
            ><label class="erag-field"
                ><span class="erag-field__label">Title</span
                ><input
                    v-model="form.title"
                    class="erag-field__input" /></label
            ><label class="erag-field"
                ><span class="erag-field__label">Open link in</span
                ><select
                    v-model="form.target"
                    class="erag-field__input"
                >
                    <option value="_self">Current window</option>
                    <option value="_blank">New window</option>
                </select></label
            >
            <p
                v-if="error"
                class="erag-field__error"
                role="alert"
            >
                {{ error }}
            </p>
        </form>
        <template #footer
            ><button
                v-if="canUnlink"
                type="button"
                class="erag-button erag-button--danger"
                @click="emit('unlink')"
            >
                Unlink</button
            ><span class="erag-dialog__spacer" /><button
                type="button"
                class="erag-button"
                @click="emit('close')"
            >
                Cancel</button
            ><button
                type="button"
                class="erag-button erag-button--primary"
                @click="save"
            >
                Save
            </button></template
        ></BaseDialog
    >
</template>

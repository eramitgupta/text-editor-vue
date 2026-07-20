<script setup lang="ts">
import { reactive, shallowRef } from 'vue';
import type { MediaValue } from '../../types';
import { isSafeUrl } from '../../utils/url';
import BaseDialog from './BaseDialog.vue';
const props = defineProps<{ allowRelative: boolean }>();
const emit = defineEmits<{ close: []; save: [value: MediaValue] }>();
const form = reactive<MediaValue>({
    type: 'video',
    src: '',
    width: '640',
    height: '360',
    poster: '',
});
const error = shallowRef('');
function save(): void {
    if (
        !isSafeUrl(form.src, { allowRelative: props.allowRelative }) ||
        (form.type === 'iframe' && !/^https:\/\//i.test(form.src))
    ) {
        error.value = 'Enter a safe media URL. Embeds must use HTTPS.';
        return;
    }
    emit('save', { ...form });
}
</script>
<template>
    <BaseDialog
        title="Insert media"
        @close="emit('close')"
        ><div class="erag-dialog__form">
            <label class="erag-field"
                ><span class="erag-field__label">Media type</span
                ><select
                    v-model="form.type"
                    class="erag-field__input"
                >
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="iframe">Secure embed</option>
                </select></label
            ><label class="erag-field"
                ><span class="erag-field__label">Source URL</span
                ><input
                    v-model.trim="form.src"
                    class="erag-field__input"
                    required
            /></label>
            <div
                v-if="form.type !== 'audio'"
                class="erag-field__row"
            >
                <label class="erag-field"
                    ><span class="erag-field__label">Width</span
                    ><input
                        v-model="form.width"
                        class="erag-field__input"
                        type="number" /></label
                ><label class="erag-field"
                    ><span class="erag-field__label">Height</span
                    ><input
                        v-model="form.height"
                        class="erag-field__input"
                        type="number"
                /></label>
            </div>
            <label
                v-if="form.type === 'video'"
                class="erag-field"
                ><span class="erag-field__label">Poster image</span
                ><input
                    v-model.trim="form.poster"
                    class="erag-field__input"
            /></label>
            <p
                v-if="error"
                class="erag-field__error"
            >
                {{ error }}
            </p>
        </div>
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
                @click="save"
            >
                Save
            </button></template
        ></BaseDialog
    >
</template>

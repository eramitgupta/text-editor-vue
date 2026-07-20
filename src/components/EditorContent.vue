<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue';

const props = defineProps<{
    id: string | undefined;
    html: string;
    disabled: boolean;
    readonly: boolean;
    placeholder: string;
    spellcheck: boolean;
    direction: 'ltr' | 'rtl';
    contentClass: string;
    contentStyle: string;
    label: string;
}>();
const emit = defineEmits<{
    click: [event: MouseEvent];
    focus: [event: FocusEvent];
    blur: [event: FocusEvent];
    input: [event: InputEvent];
    keydown: [event: KeyboardEvent];
    paste: [event: ClipboardEvent];
    selectionchange: [];
    ready: [root: HTMLElement];
}>();
const root = useTemplateRef<HTMLElement>('root');

onMounted(() => {
    if (!root.value) {
        return;
    }

    root.value.innerHTML = props.html;
    emit('ready', root.value);
});
function getRoot(): HTMLElement | null {
    return root.value;
}
defineExpose({ getRoot });
</script>
<template>
    <div class="erag-editor__canvas">
        <div
            ref="root"
            class="erag-editor__content"
            :class="contentClass"
            :id="id"
            :contenteditable="!disabled && !readonly"
            :aria-label="label"
            :aria-disabled="disabled"
            :aria-readonly="readonly"
            :data-erag-placeholder="placeholder"
            :spellcheck="spellcheck"
            :dir="direction"
            :style="contentStyle"
            role="textbox"
            aria-multiline="true"
            @click="emit('click', $event)"
            @focus="emit('focus', $event)"
            @blur="emit('blur', $event)"
            @input="emit('input', $event as InputEvent)"
            @keydown="emit('keydown', $event)"
            @keyup="emit('selectionchange')"
            @mouseup="emit('selectionchange')"
            @paste="emit('paste', $event)"
        />
    </div>
</template>

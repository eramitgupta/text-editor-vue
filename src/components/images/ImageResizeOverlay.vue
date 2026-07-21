<script setup lang="ts">
import { computed } from 'vue';
import { IMAGE_RESIZE_HANDLES } from '../../constants/imageResize';
import type { ImageResizeBox, ImageResizeHandle } from '../../types';
import EditorIcon from '../icons/EditorIcon.vue';

const props = defineProps<{
    box: ImageResizeBox;
    deleting: boolean;
    deleteError: string;
    deleteFromServer: boolean;
}>();
const emit = defineEmits<{
    resizeStart: [event: PointerEvent, handle: ImageResizeHandle];
    delete: [];
}>();
const overlayStyle = computed(() => ({
    top: `${props.box.top}px`,
    left: `${props.box.left}px`,
    width: `${props.box.width}px`,
    height: `${props.box.height}px`,
}));
const deleteLabel = computed(
    () =>
        props.deleteError ||
        (props.deleteFromServer ? 'Delete from server' : 'Delete image from editor'),
);
</script>

<template>
    <div
        class="erag-image-resize"
        :style="overlayStyle"
    >
        <button
            v-for="handle in IMAGE_RESIZE_HANDLES"
            :key="handle"
            type="button"
            class="erag-image-resize__handle"
            :class="`erag-image-resize__handle--${handle}`"
            tabindex="-1"
            :aria-label="`Resize image from ${handle.replace('-', ' ')}`"
            @pointerdown="emit('resizeStart', $event, handle)"
        />
        <button
            type="button"
            class="erag-image-resize__delete"
            :class="{ 'erag-is-loading': deleting, 'erag-has-error': deleteError }"
            :disabled="deleting"
            :aria-label="deleteLabel"
            :aria-busy="deleting"
            :data-erag-tooltip="deleteLabel"
            @pointerdown.prevent.stop
            @click.stop="emit('delete')"
        >
            <EditorIcon
                name="trash"
                :size="17"
            />
        </button>
    </div>
</template>

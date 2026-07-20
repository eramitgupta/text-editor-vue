<script setup lang="ts">
import { computed } from 'vue';
import { IMAGE_RESIZE_HANDLES } from '../../constants/imageResize';
import type { ImageResizeBox, ImageResizeHandle } from '../../types';

const props = defineProps<{ box: ImageResizeBox }>();
const emit = defineEmits<{
    resizeStart: [event: PointerEvent, handle: ImageResizeHandle];
}>();
const overlayStyle = computed(() => ({
    top: `${props.box.top}px`,
    left: `${props.box.left}px`,
    width: `${props.box.width}px`,
    height: `${props.box.height}px`,
}));
</script>

<template>
    <div
        class="erag-image-resize"
        :style="overlayStyle"
        aria-hidden="true"
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
    </div>
</template>

<script setup lang="ts">
import type { EditorCounts } from '../types';
defineProps<{
    path: string;
    counts: EditorCounts;
    resize: boolean;
    helpText: string;
    disabled: boolean;
}>();
defineEmits<{ resizeStart: [event: PointerEvent] }>();
defineSlots<{ start(): unknown; end(): unknown }>();
</script>
<template>
    <div class="erag-statusbar">
        <div
            v-if="$slots.start"
            class="erag-statusbar__slot"
        >
            <slot name="start" />
        </div>
        <span class="erag-statusbar__path">{{ path }}</span
        ><span class="erag-statusbar__count">{{ counts.words }} words</span
        ><span class="erag-statusbar__count">{{ counts.characters }} characters</span>
        <span class="erag-statusbar__help">{{ helpText }}</span>
        <div
            v-if="$slots.end"
            class="erag-statusbar__slot"
        >
            <slot name="end" />
        </div>
        <button
            v-if="resize"
            type="button"
            class="erag-statusbar__resize"
            aria-label="Resize editor"
            :disabled="disabled"
            @pointerdown="$emit('resizeStart', $event)"
        >
            <span />
        </button>
    </div>
</template>

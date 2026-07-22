<script setup lang="ts">
import { computed } from 'vue';
import type {
    TableInteractionBox,
    TableResizeHandle,
} from '../../composables/useTableInteractions';

const props = defineProps<{
    tableBox: TableInteractionBox;
    cellBoxes: TableInteractionBox[];
}>();
const emit = defineEmits<{
    resizeStart: [event: PointerEvent, handle: TableResizeHandle];
}>();
const handles: TableResizeHandle[] = ['north-west', 'north-east', 'south-west', 'south-east'];
const tableStyle = computed(() => boxStyle(props.tableBox));
</script>

<template>
    <div
        class="erag-table-selection"
        :style="tableStyle"
        aria-hidden="true"
    >
        <button
            v-for="handle in handles"
            :key="handle"
            type="button"
            class="erag-table-selection__handle"
            :class="`erag-table-selection__handle--${handle}`"
            tabindex="-1"
            :aria-label="`Resize table from ${handle.replace('-', ' ')}`"
            @pointerdown="emit('resizeStart', $event, handle)"
        />
    </div>
    <div
        v-for="(box, index) in cellBoxes"
        :key="index"
        class="erag-table-cell-selection"
        :style="boxStyle(box)"
        aria-hidden="true"
    />
</template>

<script lang="ts">
function boxStyle(box: TableInteractionBox): Record<string, string> {
    return {
        top: `${box.top}px`,
        left: `${box.left}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
    };
}
</script>

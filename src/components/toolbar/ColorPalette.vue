<script setup lang="ts">
import { shallowRef } from 'vue';
const props = defineProps<{ colors: string[]; current: string; label: string }>();
const emit = defineEmits<{ select: [color: string] }>();
const custom = shallowRef('#000000');
</script>
<template>
    <div
        class="erag-color-palette"
        role="grid"
        :aria-label="label"
    >
        <button
            type="button"
            class="erag-color-palette__remove"
            @click="emit('select', '')"
        >
            Remove color
        </button>
        <button
            v-for="color in props.colors"
            :key="color"
            type="button"
            class="erag-color-palette__swatch"
            :class="{ 'erag-is-active': current.toLowerCase() === color.toLowerCase() }"
            :style="{ backgroundColor: color }"
            :aria-label="color"
            @click="emit('select', color)"
        />
        <label class="erag-color-palette__custom"
            >Custom
            <input
                v-model="custom"
                type="color"
                @change="emit('select', custom)"
        /></label>
    </div>
</template>

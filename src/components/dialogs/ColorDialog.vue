<script setup lang="ts">
import ColorPalette from '../toolbar/ColorPalette.vue';
import BaseDialog from './BaseDialog.vue';
defineProps<{ mode: 'forecolor' | 'backcolor'; colors: string[] }>();
const emit = defineEmits<{ close: []; select: [color: string] }>();
</script>
<template>
    <BaseDialog
        :title="mode === 'forecolor' ? 'Text color' : 'Background color'"
        @close="emit('close')"
        ><ColorPalette
            :colors="colors"
            current=""
            :label="mode === 'forecolor' ? 'Text color' : 'Background color'"
            @select="emit('select', $event)"
    /></BaseDialog>
</template>

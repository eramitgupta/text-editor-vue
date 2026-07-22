<script setup lang="ts">
import { computed, nextTick, onMounted, useTemplateRef } from 'vue';
import type { TableContextMenuPosition } from '../../composables/useTableInteractions';

export type TableContextAction =
    | 'cell-properties'
    | 'table-properties'
    | 'rowBefore'
    | 'rowAfter'
    | 'deleteRow'
    | 'columnBefore'
    | 'columnAfter'
    | 'deleteColumn'
    | 'mergeCells'
    | 'splitCell'
    | 'deleteTable';

const props = defineProps<{
    position: TableContextMenuPosition;
    multipleCells: boolean;
}>();
const emit = defineEmits<{
    select: [action: TableContextAction];
}>();
const menu = useTemplateRef<HTMLElement>('menu');
const menuStyle = computed(() => ({
    top: `${Math.max(8, Math.min(props.position.y, window.innerHeight - 360))}px`,
    left: `${Math.max(8, Math.min(props.position.x, window.innerWidth - 220))}px`,
}));

onMounted(() => nextTick(() => menu.value?.focus()));
</script>

<template>
    <Teleport to="body">
        <div
            ref="menu"
            class="erag-table-context-menu"
            :style="menuStyle"
            role="menu"
            tabindex="-1"
            aria-label="Table options"
            @contextmenu.prevent
        >
            <button
                type="button"
                role="menuitem"
                @click="emit('select', 'cell-properties')"
            >
                Cell properties
            </button>
            <button
                type="button"
                role="menuitem"
                @click="emit('select', 'table-properties')"
            >
                Table properties
            </button>
            <span class="erag-table-context-menu__separator" />
            <button
                type="button"
                role="menuitem"
                @click="emit('select', 'rowBefore')"
            >
                Insert row before
            </button>
            <button
                type="button"
                role="menuitem"
                @click="emit('select', 'rowAfter')"
            >
                Insert row after
            </button>
            <button
                type="button"
                role="menuitem"
                @click="emit('select', 'deleteRow')"
            >
                Delete row
            </button>
            <span class="erag-table-context-menu__separator" />
            <button
                type="button"
                role="menuitem"
                @click="emit('select', 'columnBefore')"
            >
                Insert column before
            </button>
            <button
                type="button"
                role="menuitem"
                @click="emit('select', 'columnAfter')"
            >
                Insert column after
            </button>
            <button
                type="button"
                role="menuitem"
                @click="emit('select', 'deleteColumn')"
            >
                Delete column
            </button>
            <span class="erag-table-context-menu__separator" />
            <button
                type="button"
                role="menuitem"
                @click="emit('select', multipleCells ? 'mergeCells' : 'splitCell')"
            >
                {{ multipleCells ? 'Merge selected cells' : 'Split cell' }}
            </button>
            <button
                type="button"
                class="erag-table-context-menu__danger"
                role="menuitem"
                @click="emit('select', 'deleteTable')"
            >
                Delete table
            </button>
        </div>
    </Teleport>
</template>

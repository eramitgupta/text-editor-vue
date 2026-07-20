<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue';
import { MENU_DEFINITIONS } from '../config/menuConfig';
import type {
    DateTimeFormatOption,
    EditorMenuName,
    LineHeightOption,
    MenuItemDefinition,
    ResolvedMergeTagConfig,
    ResolvedEditorTemplatesConfig,
} from '../types';
import { formatDateTime, mergeDateTimeFormats } from '../utils/dateTime';
import EditorIcon from './icons/EditorIcon.vue';
import FloatingMenu from './menus/FloatingMenu.vue';

const props = defineProps<{
    menus: true | EditorMenuName[];
    plugins: string[];
    disabled: boolean;
    activeCommands: Record<string, boolean>;
    availableCommands: Record<string, boolean>;
    insideTable: boolean;
    lineHeightFormats: LineHeightOption[];
    dateFormats: DateTimeFormatOption[];
    timeFormats: DateTimeFormatOption[];
    mergeTags: ResolvedMergeTagConfig;
    templates: ResolvedEditorTemplatesConfig;
    mergeTagSidebarOpen: boolean;
    templateDialogOpen: boolean;
}>();
const emit = defineEmits<{
    select: [item: MenuItemDefinition];
    opening: [name: EditorMenuName];
    mergeTagToggle: [];
    templatesOpen: [];
}>();
defineSlots<{ end(): unknown }>();
const open = shallowRef<EditorMenuName | null>(null);
const root = useTemplateRef<HTMLElement>('root');
const currentDate = shallowRef(new Date());
const definitions = computed(() =>
    MENU_DEFINITIONS.filter(
        (menu) =>
            (props.menus === true || props.menus.includes(menu.name)) &&
            (menu.name !== 'merge-tags' ||
                (props.plugins.includes('merge-tags') &&
                    props.mergeTags.enabled &&
                    props.mergeTags.items.length > 0)) &&
            (menu.name !== 'templates' ||
                (props.plugins.includes('templates') &&
                    props.templates.enabled &&
                    props.templates.items.length > 0)),
    ).map((menu) => ({ ...menu, items: resolveItems(menu.items) })),
);
function resolveItems(items: MenuItemDefinition[]): MenuItemDefinition[] {
    return items
        .filter((item) => !item.plugin || props.plugins.includes(item.plugin))
        .map((item) => {
            let children = item.children;
            if (item.id === 'line-height')
                children = props.lineHeightFormats.map((option) => ({
                    id: `line-height-${option.value}`,
                    label: option.label,
                    command: 'lineheight',
                    value: option.value,
                }));
            if (item.id === 'date-time')
                children = mergeDateTimeFormats(props.dateFormats, props.timeFormats).map(
                    (option, index) => ({
                        id: `date-time-${index}`,
                        label: formatDateTime(option, currentDate.value),
                        command: 'dateTime',
                        value: String(index),
                    }),
                );
            return children ? { ...item, children: resolveItems(children) } : item;
        });
}
function toggle(name: EditorMenuName): void {
    if (props.disabled) return;
    currentDate.value = new Date();
    emit('opening', name);
    if (name === 'merge-tags') {
        open.value = null;
        emit('mergeTagToggle');
        return;
    }
    if (name === 'templates') {
        open.value = null;
        emit('templatesOpen');
        return;
    }
    open.value = open.value === name ? null : name;
}
function isOpen(name: EditorMenuName): boolean {
    if (name === 'merge-tags') return props.mergeTagSidebarOpen;
    if (name === 'templates') return props.templateDialogOpen;
    return open.value === name;
}
function select(item: MenuItemDefinition): void {
    emit('select', item);
    open.value = null;
}
function outside(event: PointerEvent): void {
    if (!root.value?.contains(event.target as Node)) open.value = null;
}
function keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') open.value = null;
}
onMounted(() => {
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keydown);
});
onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', outside);
    document.removeEventListener('keydown', keydown);
});
</script>

<template>
    <div
        ref="root"
        class="erag-menubar"
        role="menubar"
        aria-label="Editor menu"
    >
        <div
            v-for="menu in definitions"
            :key="menu.name"
            class="erag-menubar__entry"
        >
            <button
                type="button"
                class="erag-menubar__button"
                :class="{ 'erag-is-active': isOpen(menu.name) }"
                role="menuitem"
                :aria-expanded="isOpen(menu.name)"
                :disabled="disabled"
                @mousedown.prevent
                @click="toggle(menu.name)"
            >
                <EditorIcon
                    class="erag-menubar__icon"
                    :name="menu.icon"
                    :size="15"
                />
                <span class="erag-menubar__label">{{ menu.label }}</span>
            </button>
            <FloatingMenu
                v-if="!['merge-tags', 'templates'].includes(menu.name) && open === menu.name"
                :items="menu.items"
                :disabled="disabled"
                :active-commands="activeCommands"
                :available-commands="availableCommands"
                :inside-table="insideTable"
                @select="select"
                @close="open = null"
            />
        </div>
        <div
            v-if="$slots.end"
            class="erag-menubar__end"
        >
            <slot name="end" />
        </div>
    </div>
</template>

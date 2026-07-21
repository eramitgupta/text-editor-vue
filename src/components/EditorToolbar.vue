<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue';
import { TOOLBAR_ITEMS, parseToolbar } from '../config/toolbarConfig';
import { useToolbarOverflow } from '../composables/useToolbarOverflow';
import type {
    EditorToolbarGroup,
    ResolvedEditorInit,
    TextCaseMode,
    ToolbarItemDefinition,
} from '../types';
import ColorPalette from './toolbar/ColorPalette.vue';
import CaseChangeMenu from './toolbar/CaseChangeMenu.vue';
import ToolbarButton from './toolbar/ToolbarButton.vue';

const props = defineProps<{
    toolbar: boolean | string | EditorToolbarGroup[];
    config: ResolvedEditorInit;
    activeCommands: Record<string, boolean>;
    availableCommands: Record<string, boolean>;
    disabled: boolean;
    insideTable: boolean;
}>();
const emit = defineEmits<{ command: [id: string, value?: string]; dialog: [name: string] }>();
defineSlots<{ start(): unknown; end(): unknown }>();
const container = useTemplateRef<HTMLElement>('container');
const open = shallowRef<string | null>(null);
const selectedCase = shallowRef<TextCaseMode | null>(null);
const popoverAnchor = shallowRef<HTMLElement | null>(null);
const popoverLeft = shallowRef(8);
const popoverStyle = computed(() => ({ left: `${popoverLeft.value}px` }));
const groups = computed(() =>
    parseToolbar(props.toolbar)
        .map((group) => ({
            ...group,
            items: group.items.filter((name) => name !== 'more' && available(TOOLBAR_ITEMS[name])),
        }))
        .filter((group) => group.items.length > 0),
);
const count = computed(() => groups.value.length);
const layoutKey = computed(() =>
    groups.value.map((group) => `${group.name}:${group.items.join(',')}`).join('|'),
);
const { visibleCount } = useToolbarOverflow(container, count, layoutKey);
const visible = computed(() => groups.value.slice(0, visibleCount.value));
const overflow = computed(() => groups.value.slice(visibleCount.value));
function available(item: ToolbarItemDefinition): boolean {
    return !item.plugin || props.config.plugins.includes(item.plugin as never);
}
function positionPopover(): void {
    const toolbar = container.value;
    const anchor = popoverAnchor.value;
    const popover = toolbar?.querySelector<HTMLElement>('.erag-toolbar__popover');
    if (!toolbar || !anchor || !popover) return;

    const toolbarRect = toolbar.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const inset = 8;
    const preferredLeft = anchorRect.left - toolbarRect.left;
    const maximumLeft = Math.max(inset, toolbarRect.width - popover.offsetWidth - inset);
    popoverLeft.value = Math.min(Math.max(preferredLeft, inset), maximumLeft);
}
function togglePopover(name: string, event: MouseEvent): void {
    const willOpen = open.value !== name;
    open.value = willOpen ? name : null;
    popoverAnchor.value = willOpen ? (event.currentTarget as HTMLElement) : null;
    if (willOpen) void nextTick(positionPopover);
}
function activate(item: ToolbarItemDefinition, event: MouseEvent): void {
    if (isDisabled(item)) return;
    if (item.name === 'casechange') {
        togglePopover('casechange', event);
    } else if (item.command) emit('command', item.command);
    else if (item.dialog) {
        if (item.dialog === 'forecolor' || item.dialog === 'backcolor')
            togglePopover(item.dialog, event);
        else emit('dialog', item.dialog);
    } else if (item.name === 'more') open.value = open.value === 'more' ? null : 'more';
}
function chooseCase(mode: TextCaseMode): void {
    selectedCase.value = mode;
    emit('command', 'changeCase', mode);
    open.value = null;
}
function outside(event: PointerEvent): void {
    if (!container.value?.contains(event.target as Node)) open.value = null;
}
function isHistoryCommand(item: ToolbarItemDefinition): boolean {
    return item.command === 'undo' || item.command === 'redo';
}
function isAvailable(item: ToolbarItemDefinition): boolean {
    return Boolean(item.command && props.availableCommands[item.command]);
}
function isDisabled(item: ToolbarItemDefinition): boolean {
    return props.disabled || (isHistoryCommand(item) && !isAvailable(item));
}
function isActive(item: ToolbarItemDefinition): boolean {
    if (item.name === 'casechange') return open.value === 'casechange';
    return Boolean(item.command && !isDisabled(item) && props.activeCommands[item.command]);
}
function selectValue(item: ToolbarItemDefinition, event: Event): void {
    emit(
        'command',
        item.select === 'blocks' ? 'formatBlock' : (item.select ?? ''),
        (event.target as HTMLSelectElement).value,
    );
}
function options(item: ToolbarItemDefinition): { label: string; value: string }[] {
    if (item.select === 'blocks') return props.config.blockFormats;
    if (item.select === 'fontfamily') return props.config.fontFamilyFormats;
    return props.config.fontSizeFormats;
}
function chooseColor(type: string, color: string): void {
    emit('command', type, color || (type === 'forecolor' ? '#000000' : 'transparent'));
    open.value = null;
}
onMounted(() => {
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', positionPopover);
});
onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', outside);
    window.removeEventListener('resize', positionPopover);
});
</script>

<template>
    <div
        ref="container"
        class="erag-toolbar"
        role="toolbar"
        aria-label="Text formatting toolbar"
    >
        <div
            v-if="$slots.start"
            class="erag-toolbar__slot"
            data-erag-toolbar-start
        >
            <slot name="start" />
        </div>
        <div
            v-for="(group, index) in visible"
            :key="group.name"
            class="erag-toolbar__group"
            :data-erag-toolbar-group-index="index"
        >
            <template
                v-for="name in group.items"
                :key="name"
            >
                <select
                    v-if="TOOLBAR_ITEMS[name].select && available(TOOLBAR_ITEMS[name])"
                    class="erag-toolbar__select"
                    :aria-label="TOOLBAR_ITEMS[name].label"
                    :disabled="isDisabled(TOOLBAR_ITEMS[name])"
                    @mousedown="$emit('command', 'saveSelection')"
                    @change="selectValue(TOOLBAR_ITEMS[name], $event)"
                >
                    <option value="">{{ TOOLBAR_ITEMS[name].label }}</option>
                    <option
                        v-for="option in options(TOOLBAR_ITEMS[name])"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </option>
                </select>
                <ToolbarButton
                    v-else-if="available(TOOLBAR_ITEMS[name])"
                    :item="TOOLBAR_ITEMS[name]"
                    :active="isActive(TOOLBAR_ITEMS[name])"
                    :available="isAvailable(TOOLBAR_ITEMS[name])"
                    :disabled="isDisabled(TOOLBAR_ITEMS[name])"
                    @activate="activate"
                />
            </template>
        </div>
        <div
            v-if="overflow.length"
            class="erag-toolbar__overflow"
        >
            <ToolbarButton
                :item="TOOLBAR_ITEMS.more"
                :active="open === 'more'"
                :available="false"
                :disabled="disabled"
                @activate="activate"
            />
            <div
                v-if="open === 'more'"
                class="erag-toolbar__overflow-menu"
                role="menu"
                aria-label="More formatting options"
            >
                <div
                    v-for="group in overflow"
                    :key="group.name"
                    class="erag-toolbar__overflow-group"
                >
                    <template
                        v-for="name in group.items"
                        :key="name"
                    >
                        <select
                            v-if="TOOLBAR_ITEMS[name].select"
                            class="erag-toolbar__select erag-toolbar__select--overflow"
                            :aria-label="TOOLBAR_ITEMS[name].label"
                            :disabled="isDisabled(TOOLBAR_ITEMS[name])"
                            @mousedown="$emit('command', 'saveSelection')"
                            @change="selectValue(TOOLBAR_ITEMS[name], $event)"
                        >
                            <option value="">{{ TOOLBAR_ITEMS[name].label }}</option>
                            <option
                                v-for="option in options(TOOLBAR_ITEMS[name])"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
                            </option>
                        </select>
                        <ToolbarButton
                            v-else
                            :item="TOOLBAR_ITEMS[name]"
                            :active="isActive(TOOLBAR_ITEMS[name])"
                            :available="isAvailable(TOOLBAR_ITEMS[name])"
                            :disabled="isDisabled(TOOLBAR_ITEMS[name])"
                            @activate="activate"
                        />
                    </template>
                </div>
            </div>
        </div>
        <ColorPalette
            v-if="open === 'forecolor'"
            class="erag-toolbar__popover"
            :style="popoverStyle"
            :colors="config.textColors"
            current=""
            label="Text color"
            @select="chooseColor('forecolor', $event)"
        />
        <CaseChangeMenu
            v-if="open === 'casechange'"
            class="erag-toolbar__popover"
            :style="popoverStyle"
            :mode="selectedCase"
            @select="chooseCase"
            @close="open = null"
        />
        <ColorPalette
            v-if="open === 'backcolor'"
            class="erag-toolbar__popover"
            :style="popoverStyle"
            :colors="config.backgroundColors"
            current=""
            label="Background color"
            @select="chooseColor('backcolor', $event)"
        />
        <div
            v-if="$slots.end"
            class="erag-toolbar__slot erag-toolbar__slot--end"
            data-erag-toolbar-end
        >
            <slot name="end" />
        </div>
    </div>
</template>

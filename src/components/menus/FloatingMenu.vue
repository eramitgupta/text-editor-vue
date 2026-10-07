<script setup lang="ts">
import { computed, nextTick, useTemplateRef } from 'vue';
import { useFloatingPosition, VIEWPORT_PADDING } from '../../composables/useFloatingPosition';
import { resolveMenuItemIcon } from '../../config/menuIcons';
import { isReadOnlyAction } from '../../constants/editorCommands';
import type { MenuItemDefinition } from '../../types';
import EditorIcon from '../icons/EditorIcon.vue';

const props = defineProps<{
    items: MenuItemDefinition[];
    disabled: boolean;
    locked: boolean;
    activeCommands: Record<string, boolean>;
    availableCommands: Record<string, boolean>;
    insideTable: boolean;
    level?: number;
    anchor?: HTMLElement | null;
}>();
const emit = defineEmits<{ select: [item: MenuItemDefinition]; close: [] }>();
const menu = useTemplateRef<HTMLElement>('menu');
const anchor = computed(() => props.anchor ?? null);
const floatingStyle =
    (props.level ?? 0) === 0 ? useFloatingPosition(anchor, menu).style : undefined;

function isDisabled(item: MenuItemDefinition): boolean {
    const explicitlyUnavailable = Boolean(
        item.command && props.availableCommands[item.command] === false,
    );
    const readOnlyBlocked = props.locked && !item.children && !isReadOnlyAction(item);
    return (
        props.disabled ||
        readOnlyBlocked ||
        explicitlyUnavailable ||
        Boolean(item.tableOnly && !props.insideTable)
    );
}
function isActive(item: MenuItemDefinition): boolean {
    return Boolean(item.command && !isDisabled(item) && props.activeCommands[item.command]);
}
/**
 * Keep a submenu inside the viewport, opening it on the left side of the parent
 * menu when there is no room on the right.
 */
function fitNestedMenu(event: Event): void {
    const nested = (event.currentTarget as HTMLElement).querySelector<HTMLElement>(
        ':scope > .erag-menu--nested',
    );
    if (!nested || !menu.value) return;
    nested.style.transform = '';
    const rect = nested.getBoundingClientRect();
    const maxRight = window.innerWidth - VIEWPORT_PADDING;
    const maxBottom = window.innerHeight - VIEWPORT_PADDING;
    let offsetX = 0;
    if (rect.right > maxRight) {
        const flippedLeft = menu.value.getBoundingClientRect().left - rect.width + 2;
        const left =
            flippedLeft >= VIEWPORT_PADDING
                ? flippedLeft
                : Math.max(VIEWPORT_PADDING, maxRight - rect.width);
        offsetX = left - rect.left;
    }
    const offsetY =
        rect.bottom > maxBottom
            ? Math.max(VIEWPORT_PADDING, maxBottom - rect.height) - rect.top
            : 0;
    if (offsetX || offsetY) nested.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}
function select(item: MenuItemDefinition): void {
    if (!item.children && !item.separator && !isDisabled(item)) emit('select', item);
}
async function onKeydown(event: KeyboardEvent): Promise<void> {
    const target = event.target as HTMLElement;
    const buttons = menu.value
        ? [
              ...menu.value.querySelectorAll<HTMLElement>(
                  ':scope > .erag-menu__entry > .erag-menu__item:not([aria-disabled="true"])',
              ),
          ]
        : [];
    const index = buttons.indexOf(target);
    if (event.key === 'Escape') {
        emit('close');
        return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const offset = event.key === 'ArrowDown' ? 1 : -1;
        buttons[(index + offset + buttons.length) % buttons.length]?.focus();
    }
    if (event.key === 'Home') {
        event.preventDefault();
        buttons[0]?.focus();
    }
    if (event.key === 'End') {
        event.preventDefault();
        buttons.at(-1)?.focus();
    }
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        target.click();
    }
    await nextTick();
}
</script>

<template>
    <div
        ref="menu"
        class="erag-menu"
        :class="{ 'erag-menu--nested': (level ?? 0) > 0 }"
        :style="anchor ? floatingStyle : undefined"
        role="menu"
        @keydown="onKeydown"
    >
        <template
            v-for="item in items"
            :key="item.id"
        >
            <div
                v-if="item.separator"
                class="erag-menu__separator"
                role="separator"
            />
            <div
                v-else
                class="erag-menu__entry"
                @mouseenter="fitNestedMenu"
                @focusin="fitNestedMenu"
            >
                <button
                    type="button"
                    class="erag-menu__item"
                    :class="{ 'erag-is-active': isActive(item) }"
                    role="menuitem"
                    :aria-haspopup="Boolean(item.children)"
                    :aria-disabled="isDisabled(item)"
                    :tabindex="isDisabled(item) ? -1 : 0"
                    @mousedown.prevent
                    @click="select(item)"
                >
                    <span class="erag-menu__check">{{ isActive(item) ? '✓' : '' }}</span>
                    <EditorIcon
                        v-if="(level ?? 0) === 0"
                        class="erag-menu__icon"
                        :name="resolveMenuItemIcon(item)"
                        :size="16"
                    />
                    <span class="erag-menu__label">{{ item.label }}</span>
                    <span
                        v-if="item.shortcut"
                        class="erag-menu__shortcut"
                        >{{ item.shortcut }}</span
                    >
                    <span
                        v-if="item.children"
                        class="erag-menu__arrow"
                        >›</span
                    >
                </button>
                <FloatingMenu
                    v-if="item.children"
                    :items="item.children"
                    :disabled="disabled"
                    :locked="locked"
                    :active-commands="activeCommands"
                    :available-commands="availableCommands"
                    :inside-table="insideTable"
                    :level="(level ?? 0) + 1"
                    @select="emit('select', $event)"
                    @close="emit('close')"
                />
            </div>
        </template>
    </div>
</template>

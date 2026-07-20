<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue';
import { resolveMenuItemIcon } from '../../config/menuIcons';
import type { MenuItemDefinition } from '../../types';
import EditorIcon from '../icons/EditorIcon.vue';

const props = defineProps<{
    items: MenuItemDefinition[];
    disabled: boolean;
    activeCommands: Record<string, boolean>;
    availableCommands: Record<string, boolean>;
    insideTable: boolean;
    level?: number;
}>();
const emit = defineEmits<{ select: [item: MenuItemDefinition]; close: [] }>();
const menu = useTemplateRef<HTMLElement>('menu');

function isDisabled(item: MenuItemDefinition): boolean {
    const explicitlyUnavailable = Boolean(
        item.command && props.availableCommands[item.command] === false,
    );
    return props.disabled || explicitlyUnavailable || Boolean(item.tableOnly && !props.insideTable);
}
function isActive(item: MenuItemDefinition): boolean {
    return Boolean(item.command && !isDisabled(item) && props.activeCommands[item.command]);
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

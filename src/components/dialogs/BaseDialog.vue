<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef } from 'vue';
import { focusableElements } from '../../utils/dom';
const props = withDefaults(
    defineProps<{
        title: string;
        wide?: boolean;
        compact?: boolean;
        closeLabel?: string;
        footerDivider?: boolean;
    }>(),
    { closeLabel: 'Close', compact: false, footerDivider: true, wide: false },
);
const emit = defineEmits<{ close: [] }>();
defineSlots<{ default(): unknown; footer(): unknown }>();
const panel = useTemplateRef<HTMLElement>('panel');
onMounted(async () => {
    await nextTick();
    focusableElements(panel.value as HTMLElement)[0]?.focus();
});
function keydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
        emit('close');
        return;
    }
    if (event.key !== 'Tab' || !panel.value) return;
    const items = focusableElements(panel.value);
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && event.target === first) {
        event.preventDefault();
        last?.focus();
    } else if (!event.shiftKey && event.target === last) {
        event.preventDefault();
        first?.focus();
    }
}
</script>
<template>
    <Teleport to="body">
        <div
            class="erag-dialog-backdrop"
            @mousedown.self="emit('close')"
        >
            <section
                ref="panel"
                class="erag-dialog"
                :class="{
                    'erag-dialog--wide': wide,
                    'erag-dialog--compact': compact,
                }"
                role="dialog"
                aria-modal="true"
                :aria-label="title"
                @keydown="keydown"
            >
                <header class="erag-dialog__header">
                    <h2 class="erag-dialog__title">{{ title }}</h2>
                    <button
                        type="button"
                        class="erag-dialog__close"
                        :aria-label="props.closeLabel"
                        @click="emit('close')"
                    >
                        ×
                    </button>
                </header>
                <div class="erag-dialog__body"><slot /></div>
                <footer
                    v-if="$slots.footer"
                    class="erag-dialog__footer"
                    :class="{ 'erag-dialog__footer--divided': props.footerDivider }"
                >
                    <slot name="footer" />
                </footer>
            </section>
        </div>
    </Teleport>
</template>

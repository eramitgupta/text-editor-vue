<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import { replaceTextInElement } from '../../utils/dom';
import BaseDialog from './BaseDialog.vue';
const props = defineProps<{ root: HTMLElement }>();
const emit = defineEmits<{ close: []; changed: [] }>();
const find = shallowRef('');
const replacement = shallowRef('');
const matchCase = shallowRef(false);
const wholeWord = shallowRef(false);
const index = shallowRef(-1);
const matches = computed(() => {
    if (!find.value) return [];
    const flags = matchCase.value ? 'g' : 'gi';
    const source = wholeWord.value ? `\\b${escapeRegExp(find.value)}\\b` : escapeRegExp(find.value);
    return [...(props.root.textContent ?? '').matchAll(new RegExp(source, flags))];
});
function navigate(offset: number): void {
    if (!matches.value.length) return;
    index.value = (index.value + offset + matches.value.length) % matches.value.length;
    const match = matches.value[index.value];
    if (!match || match.index === undefined) return;
    selectTextOffset(props.root, match.index, match[0].length);
}
function replace(all: boolean): void {
    const flags = `${matchCase.value ? '' : 'i'}${all ? 'g' : ''}`;
    const source = wholeWord.value ? `\\b${escapeRegExp(find.value)}\\b` : escapeRegExp(find.value);
    replaceTextInElement(props.root, new RegExp(source, flags), replacement.value, all);
    emit('changed');
}
function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function selectTextOffset(root: HTMLElement, start: number, length: number): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let offset = 0;
    let node = walker.nextNode();
    while (node) {
        const end = offset + (node.textContent?.length ?? 0);
        if (start >= offset && start < end) {
            const range = document.createRange();
            range.setStart(node, start - offset);
            range.setEnd(node, Math.min(start - offset + length, node.textContent?.length ?? 0));
            const selection = window.getSelection();
            selection?.removeAllRanges();
            selection?.addRange(range);
            return;
        }
        offset = end;
        node = walker.nextNode();
    }
}
</script>
<template>
    <BaseDialog
        title="Find and replace"
        @close="emit('close')"
        ><div class="erag-dialog__form">
            <label class="erag-field"
                ><span class="erag-field__label">Find</span
                ><input
                    v-model="find"
                    class="erag-field__input" /></label
            ><label class="erag-field"
                ><span class="erag-field__label">Replace with</span
                ><input
                    v-model="replacement"
                    class="erag-field__input"
            /></label>
            <div class="erag-field__row">
                <label class="erag-field__check"
                    ><input
                        v-model="matchCase"
                        type="checkbox"
                    />
                    Match case</label
                ><label class="erag-field__check"
                    ><input
                        v-model="wholeWord"
                        type="checkbox"
                    />
                    Whole word</label
                >
            </div>
            <p class="erag-find__count">
                {{ matches.length ? `${index + 1} of ${matches.length}` : 'No matches' }}
            </p>
        </div>
        <template #footer
            ><button
                type="button"
                class="erag-button"
                @click="navigate(-1)"
            >
                Previous</button
            ><button
                type="button"
                class="erag-button"
                @click="navigate(1)"
            >
                Next</button
            ><button
                type="button"
                class="erag-button"
                @click="replace(false)"
            >
                Replace</button
            ><button
                type="button"
                class="erag-button erag-button--primary"
                @click="replace(true)"
            >
                Replace all
            </button></template
        ></BaseDialog
    >
</template>

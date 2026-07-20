import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { normalizeEditorConfig } from '../utils/config';
import type { EditorInit } from '../types';
export function useEditorConfig(init: MaybeRefOrGetter<EditorInit | undefined>) {
    return computed(() => normalizeEditorConfig(toValue(init)));
}

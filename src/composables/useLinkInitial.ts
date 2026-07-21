import { computed, type Ref } from 'vue';
import type { LinkValue } from '../types';
import { closestElement } from '../utils/dom';

export function useLinkInitial(
    root: Ref<HTMLElement | null>,
    savedRange: Readonly<Ref<Range | null>>,
) {
    function getSelectedAnchor(): HTMLAnchorElement | null {
        return root.value ? closestElement(root.value, 'a', savedRange.value) : null;
    }
    const initial = computed<LinkValue>(() => {
        const anchor = getSelectedAnchor();
        const selectedText = savedRange.value?.toString() ?? '';
        return {
            url: anchor?.getAttribute('href') ?? '',
            text: anchor?.textContent ?? selectedText,
            title: anchor?.title ?? '',
            target: anchor?.target === '_blank' ? '_blank' : '_self',
        };
    });
    return { initial, getSelectedAnchor };
}

import { computed, type Ref } from 'vue';
import type { LinkValue } from '../types';
import { closestElement } from '../utils/dom';

export function useLinkInitial(root: Ref<HTMLElement | null>) {
    function getSelectedAnchor(): HTMLAnchorElement | null {
        return root.value ? closestElement(root.value, 'a') : null;
    }
    const initial = computed<LinkValue>(() => {
        const anchor = getSelectedAnchor();
        const selectedText = typeof window === 'undefined' ? '' : (window.getSelection()?.toString() ?? '');
        return {
            url: anchor?.getAttribute('href') ?? '',
            text: anchor?.textContent ?? selectedText,
            title: anchor?.title ?? '',
            target: anchor?.target === '_blank' ? '_blank' : '_self',
        };
    });
    return { initial, getSelectedAnchor };
}

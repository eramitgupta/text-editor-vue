import { computed, type Ref } from 'vue';
import type { WordCountData } from '../types';
import { getDetailedTextCounts } from '../utils/html';

export function useWordCount(root: Ref<HTMLElement | null>, selectedRange: Ref<Range | null>) {
    return computed<WordCountData>(() => ({
        document: getDetailedTextCounts(root.value?.innerText ?? ''),
        selection: getDetailedTextCounts(selectedRange.value?.toString() ?? ''),
    }));
}

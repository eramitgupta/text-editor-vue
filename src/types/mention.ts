import type { ComputedRef, Ref } from 'vue';

export interface MentionItem {
    id: string | number;
    label: string;
    description?: string;
    avatar?: string;
    value?: string;
}

export interface MentionConfig {
    enabled?: boolean;
    minimumCharacters?: number;
    debounce?: number;
    limit?: number;
    items?:
        | MentionItem[]
        | ((query: string, signal: AbortSignal) => MentionItem[] | Promise<MentionItem[]>);
}

export interface ResolvedMentionConfig {
    enabled: boolean;
    minimumCharacters: number;
    debounce: number;
    limit: number;
    items?: MentionConfig['items'];
}

export interface MentionSearchEvent {
    query: string;
}

export interface MentionSelectEvent {
    item: MentionItem;
    query: string;
}

export interface MentionRemoveEvent {
    item: MentionItem;
}

export interface MentionQueryMatch {
    query: string;
    range: Range;
}

export interface MentionPosition {
    left: number;
    top: number;
}

export type MentionDropdownState = 'loading' | 'empty' | 'error' | 'results';

export interface MentionCallbacks {
    search(event: MentionSearchEvent): void;
    select(event: MentionSelectEvent): void;
    remove(event: MentionRemoveEvent): void;
    change(): void;
}

export interface MentionComposableSources {
    root: Ref<HTMLElement | null>;
    config: ComputedRef<ResolvedMentionConfig>;
    locked: ComputedRef<boolean>;
}

export interface MentionItemSlotProps {
    item: MentionItem;
    active: boolean;
}

export interface MentionQuerySlotProps {
    query: string;
}

export interface MentionErrorSlotProps extends MentionQuerySlotProps {
    retry: () => void;
}

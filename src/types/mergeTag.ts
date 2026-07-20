import type { ComputedRef, Ref } from 'vue';

export interface MergeTagItem {
    label: string;
    value: string;
    group?: string;
}

export interface MergeTagConfig {
    enabled?: boolean;
    limit?: number;
    items?: MergeTagItem[];
}

export interface ResolvedMergeTagConfig {
    enabled: boolean;
    limit: number;
    items: MergeTagItem[];
}

export interface MergeTagQueryMatch {
    query: string;
    range: Range;
}

export interface MergeTagSelectEvent {
    item: MergeTagItem;
    query: string;
}

export interface MergeTagRemoveEvent {
    item: MergeTagItem;
}

export interface MergeTagCallbacks {
    select(event: MergeTagSelectEvent): void;
    remove(event: MergeTagRemoveEvent): void;
    change(): void;
}

export interface MergeTagComposableSources {
    root: Ref<HTMLElement | null>;
    config: ComputedRef<ResolvedMergeTagConfig>;
    locked: ComputedRef<boolean>;
}

export interface MergeTagSidebarSources {
    config: ComputedRef<ResolvedMergeTagConfig>;
    disabled: ComputedRef<boolean>;
    locked: ComputedRef<boolean>;
}

export interface MergeTagSidebarCallbacks {
    restoreSelection(): boolean;
    saveSelection(): void;
    insert(item: MergeTagItem): void;
}

import type { MergeTagConfig, ResolvedMergeTagConfig } from '../types';

export const defaultMergeTagConfig: Required<Omit<MergeTagConfig, 'items'>> = {
    enabled: true,
    limit: 10,
};

export function normalizeMergeTagConfig(
    mergeTags: boolean | MergeTagConfig | undefined,
): ResolvedMergeTagConfig {
    const configured = typeof mergeTags === 'object' ? mergeTags : undefined;
    return {
        enabled: mergeTags === true || Boolean(configured && configured.enabled !== false),
        limit: Math.max(1, Math.floor(configured?.limit ?? defaultMergeTagConfig.limit)),
        items: configured?.items?.map((item) => ({ ...item })) ?? [],
    };
}

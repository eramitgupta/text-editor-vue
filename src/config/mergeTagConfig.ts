import type { MergeTagConfig, ResolvedMergeTagConfig } from '../types';
import { formatMergeTagValue, normalizeMergeTagValue } from '../utils/mergeTag';

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
        items:
            configured?.items
                ?.filter((item) => normalizeMergeTagValue(item.value).length > 0)
                ?.map((item) => ({
                    value: formatMergeTagValue(item.value),
                    ...(item.group?.trim() ? { group: item.group.trim() } : {}),
                })) ?? [],
    };
}

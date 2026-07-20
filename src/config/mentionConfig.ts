import type { MentionConfig, ResolvedMentionConfig } from '../types';

export const defaultMentionConfig: Required<Omit<MentionConfig, 'items'>> = {
    enabled: true,
    minimumCharacters: 0,
    debounce: 200,
    limit: 8,
};

export function normalizeMentionConfig(
    mentions: boolean | MentionConfig | undefined,
): ResolvedMentionConfig {
    const enabled =
        mentions === true || (typeof mentions === 'object' && mentions.enabled === true);
    const configured = typeof mentions === 'object' ? mentions : undefined;
    const normalized: ResolvedMentionConfig = {
        enabled,
        minimumCharacters: Math.max(
            0,
            Math.floor(configured?.minimumCharacters ?? defaultMentionConfig.minimumCharacters),
        ),
        debounce: Math.max(0, Math.floor(configured?.debounce ?? defaultMentionConfig.debounce)),
        limit: Math.max(1, Math.floor(configured?.limit ?? defaultMentionConfig.limit)),
    };

    if (configured?.items !== undefined) normalized.items = configured.items;
    return normalized;
}

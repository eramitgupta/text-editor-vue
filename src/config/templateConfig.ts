import type { EditorTemplatesConfig, ResolvedEditorTemplatesConfig } from '../types';

export function normalizeEditorTemplatesConfig(
    templates: boolean | EditorTemplatesConfig | undefined,
): ResolvedEditorTemplatesConfig {
    const configured = typeof templates === 'object' ? templates : undefined;
    return {
        enabled: templates === true || Boolean(configured && configured.enabled !== false),
        items: configured?.items?.map((item) => ({ ...item })) ?? [],
    };
}

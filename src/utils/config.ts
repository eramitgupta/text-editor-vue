import { defaultEditorConfig } from '../config/defaultConfig';
import { normalizeMentionConfig } from '../config/mentionConfig';
import { normalizeMergeTagConfig } from '../config/mergeTagConfig';
import { normalizeEditorTemplatesConfig } from '../config/templateConfig';
import type { EditorInit, ResolvedEditorInit } from '../types';

const ALIASES = {
    content_style: 'contentStyle',
    font_family_formats: 'fontFamilyFormats',
    font_size_formats: 'fontSizeFormats',
    line_height_formats: 'lineHeightFormats',
    images_upload_url: 'imagesUploadUrl',
    images_upload_handler: 'imagesUploadHandler',
    automatic_uploads: 'automaticUploads',
    relative_urls: 'relativeUrls',
    remove_script_host: 'removeScriptHost',
    convert_urls: 'convertUrls',
} as const;

export function deepMerge<T extends object>(base: T, override: Partial<T>): T {
    const result = { ...base } as Record<string, unknown>;
    for (const [key, value] of Object.entries(override)) {
        if (value === undefined) continue;
        const current = result[key];
        if (isPlainObject(current) && isPlainObject(value)) {
            result[key] = mergeRecords(current, value);
        } else {
            result[key] = Array.isArray(value) ? [...value] : value;
        }
    }
    return result as T;
}

function mergeRecords(
    base: Record<string, unknown>,
    override: Record<string, unknown>,
): Record<string, unknown> {
    const result = { ...base };
    for (const [key, value] of Object.entries(override))
        result[key] =
            isPlainObject(result[key]) && isPlainObject(value)
                ? mergeRecords(result[key], value)
                : Array.isArray(value)
                  ? [...value]
                  : value;
    return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeEditorConfig(init?: EditorInit): ResolvedEditorInit {
    if (!init) return deepMerge(defaultEditorConfig, {});
    const normalized: EditorInit = { ...init };
    for (const [alias, camel] of Object.entries(ALIASES) as [
        keyof typeof ALIASES,
        keyof EditorInit,
    ][]) {
        if (normalized[camel] === undefined && init[alias] !== undefined) {
            Object.assign(normalized, { [camel]: init[alias] });
        }
        delete normalized[alias];
    }
    return deepMerge(defaultEditorConfig, {
        ...normalized,
        mentions: normalizeMentionConfig(init.mentions),
        mergeTags: normalizeMergeTagConfig(init.mergeTags),
        templates: normalizeEditorTemplatesConfig(init.templates),
    });
}

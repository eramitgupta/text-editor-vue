export function isSafeUrl(
    value: string,
    options: { allowRelative: boolean; allowDataImage?: boolean },
): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    if (/^(javascript|vbscript):/i.test(trimmed)) return false;
    if (/^data:/i.test(trimmed))
        return Boolean(
            options.allowDataImage && /^data:image\/(png|jpeg|gif|webp);base64,/i.test(trimmed),
        );
    if (/^(https?:|mailto:|tel:|blob:|#)/i.test(trimmed)) return true;
    return options.allowRelative && !/^[a-z][a-z\d+.-]*:/i.test(trimmed);
}
export function normalizeUrl(
    value: string,
    options: { relativeUrls: boolean; removeScriptHost: boolean; convertUrls: boolean },
): string {
    const trimmed = value.trim();
    if (
        !options.convertUrls ||
        options.relativeUrls ||
        /^(data:|blob:|#|mailto:|tel:)/i.test(trimmed)
    )
        return trimmed;
    try {
        const url = new URL(trimmed, window.location.href);
        return options.removeScriptHost && url.origin === window.location.origin
            ? `${url.pathname}${url.search}${url.hash}`
            : url.href;
    } catch {
        return trimmed;
    }
}

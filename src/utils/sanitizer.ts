import { isSafeUrl } from './url';
import { isMentionCandidate, normalizeMentionElement } from './mention';
import { isMergeTagCandidate, normalizeMergeTagElement } from './mergeTag';
export interface SanitizerOptions {
    allowedTags: string[];
    allowedAttributes: Record<string, string[]>;
    allowRelativeUrls: boolean;
}

export function canSanitizeHtml(): boolean {
    return (
        typeof document !== 'undefined' &&
        typeof DOMParser !== 'undefined' &&
        typeof NodeFilter !== 'undefined'
    );
}
const SAFE_STYLES = new Set([
    'color',
    'background-color',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'text-decoration',
    'text-align',
    'line-height',
    'margin-left',
    'margin-right',
    'display',
    'list-style-type',
    'width',
    'height',
    'border',
    'border-width',
    'border-style',
    'border-color',
    'border-collapse',
    'padding',
    'background',
]);
const REMOVED_WITH_CONTENT = new Set([
    'script',
    'style',
    'noscript',
    'template',
    'object',
    'embed',
]);

export function sanitizeHtml(html: string, options: SanitizerOptions): string {
    if (!canSanitizeHtml()) return '';
    const documentNode = new DOMParser().parseFromString(html, 'text/html');
    const walker = documentNode.createTreeWalker(documentNode.body, NodeFilter.SHOW_ELEMENT);
    const elements: Element[] = [];
    let node = walker.nextNode();
    while (node) {
        elements.push(node as Element);
        node = walker.nextNode();
    }
    for (const element of elements) sanitizeElement(element, options);
    return documentNode.body.innerHTML;
}
function sanitizeElement(source: Element, options: SanitizerOptions): void {
    const element = source.tagName.toLowerCase() === 'font' ? convertFontElement(source) : source;
    const tag = element.tagName.toLowerCase();
    if (REMOVED_WITH_CONTENT.has(tag)) {
        element.remove();
        return;
    }
    if (!options.allowedTags.includes(tag)) {
        element.replaceWith(...element.childNodes);
        return;
    }
    if (
        tag === 'input' &&
        (element.getAttribute('type') !== 'checkbox' ||
            element.getAttribute('data-erag-checklist-checkbox') !== 'true')
    ) {
        element.remove();
        return;
    }
    if (isMentionCandidate(element)) {
        if (!normalizeMentionElement(element)) {
            element.replaceWith(element.ownerDocument.createTextNode(element.textContent ?? ''));
        }
        return;
    }
    if (isMergeTagCandidate(element)) {
        if (!normalizeMergeTagElement(element)) {
            element.replaceWith(element.ownerDocument.createTextNode(element.textContent ?? ''));
        }
        return;
    }
    if (tag === 'span') element.removeAttribute('contenteditable');
    if (tag === 'input') element.setAttribute('contenteditable', 'false');
    sanitizeAttributes(element, tag, options);
    if (tag === 'img' && !element.getAttribute('src')) {
        element.remove();
        return;
    }
    if (tag === 'iframe') {
        const src = element.getAttribute('src') ?? '';
        if (!/^https:\/\//i.test(src)) element.remove();
        else element.setAttribute('sandbox', 'allow-same-origin allow-presentation');
    }
}
function sanitizeAttributes(element: Element, tag: string, options: SanitizerOptions): void {
    const allowed = new Set([
        ...(options.allowedAttributes['*'] ?? []),
        ...(options.allowedAttributes[tag] ?? []),
    ]);
    for (const attribute of [...element.attributes]) {
        const name = attribute.name.toLowerCase();
        if (name.startsWith('on') || !allowed.has(name)) {
            element.removeAttribute(attribute.name);
            continue;
        }
        if (
            ['href', 'src', 'poster'].includes(name) &&
            !isSafeUrl(attribute.value, {
                allowRelative: options.allowRelativeUrls,
                allowDataImage: tag === 'img',
            })
        )
            element.removeAttribute(attribute.name);
        if (name === 'style') {
            const style = sanitizeStyle(attribute.value);
            if (style) element.setAttribute('style', style);
            else element.removeAttribute('style');
        }
    }
}
/**
 * Older content (and browsers without the CSS styling flag) store fonts and colors in
 * `<font>` tags; keep that formatting as an inline-styled span.
 */
function convertFontElement(font: Element): Element {
    const span = font.ownerDocument.createElement('span');
    const face = font.getAttribute('face');
    const color = font.getAttribute('color');
    const style = [
        font.getAttribute('style') ?? '',
        face ? `font-family:${face}` : '',
        color ? `color:${color}` : '',
    ]
        .filter(Boolean)
        .join(';');
    if (style) span.setAttribute('style', style);
    span.append(...font.childNodes);
    font.replaceWith(span);
    return span;
}
function sanitizeStyle(value: string): string {
    return value
        .split(';')
        .flatMap((rule) => {
            const separator = rule.indexOf(':');
            if (separator < 1) return [];
            const name = rule.slice(0, separator).trim().toLowerCase();
            const raw = rule.slice(separator + 1).trim();
            return SAFE_STYLES.has(name) && raw && !/url\s*\(|expression|javascript:/i.test(raw)
                ? [`${name}:${raw}`]
                : [];
        })
        .join(';');
}

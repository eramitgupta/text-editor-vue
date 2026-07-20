import { escapeHtml, insertAtSelection } from '../utils/html';
import { isSafeUrl } from '../utils/url';
import type { ImageValue, LinkValue, MediaValue } from '../types';

export function insertLink(root: HTMLElement, value: LinkValue, allowRelative: boolean): boolean {
    if (!isSafeUrl(value.url, { allowRelative })) return false;
    const selection = window.getSelection();
    const selectedText = selection?.toString() ?? '';
    const text = value.text || selectedText || value.url;
    const target = value.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
    return insertAtSelection(
        root,
        `<a href="${escapeAttribute(value.url)}" title="${escapeAttribute(value.title)}"${target}>${escapeHtml(text)}</a>`,
    );
}
export function insertImage(
    root: HTMLElement,
    value: ImageValue,
    allowRelative: boolean,
    defaultWidth?: number,
): boolean {
    if (!isSafeUrl(value.src, { allowRelative, allowDataImage: true })) return false;
    const width = numericAttribute(value.width || String(defaultWidth ?? ''), 'width');
    const height = numericAttribute(value.height, 'height');
    return insertAtSelection(
        root,
        `<img src="${escapeAttribute(value.src)}" alt="${escapeAttribute(value.alt)}"${width}${height}>`,
    );
}
export function insertMedia(root: HTMLElement, value: MediaValue, allowRelative: boolean): boolean {
    if (!isSafeUrl(value.src, { allowRelative })) return false;
    const size = `${numericAttribute(value.width, 'width')}${numericAttribute(value.height, 'height')}`;
    if (value.type === 'audio')
        return insertAtSelection(
            root,
            `<audio src="${escapeAttribute(value.src)}" controls></audio>`,
        );
    if (value.type === 'iframe') {
        if (!/^https:\/\//i.test(value.src)) return false;
        return insertAtSelection(
            root,
            `<iframe src="${escapeAttribute(value.src)}"${size} sandbox="allow-same-origin allow-presentation" title="Embedded media"></iframe>`,
        );
    }
    const poster =
        value.poster && isSafeUrl(value.poster, { allowRelative })
            ? ` poster="${escapeAttribute(value.poster)}"`
            : '';
    return insertAtSelection(
        root,
        `<video src="${escapeAttribute(value.src)}"${size}${poster} controls></video>`,
    );
}
export function insertTable(root: HTMLElement, rows: number, columns: number): boolean {
    const rowHtml = `<tr>${'<td><br></td>'.repeat(Math.max(1, columns))}</tr>`;
    return insertAtSelection(
        root,
        `<table><tbody>${rowHtml.repeat(Math.max(1, rows))}</tbody></table><p><br></p>`,
    );
}
function numericAttribute(value: string, name: string): string {
    const number = Number.parseInt(value, 10);
    return Number.isFinite(number) && number > 0 ? ` ${name}="${number}"` : '';
}
function escapeAttribute(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

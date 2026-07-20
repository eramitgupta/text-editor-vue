import { DEFAULT_ALLOWED_ATTRIBUTES, DEFAULT_ALLOWED_TAGS } from '../constants/editorDefaults';
import { PRINT_CONTENT_STYLES } from '../constants/printStyles';
import { sanitizeHtml } from '../utils/sanitizer';

export function printEditorContent(root: HTMLElement): boolean {
    const style = document.createElement('style');
    style.dataset.eragPrintStyle = 'true';
    style.textContent = PRINT_CONTENT_STYLES;
    const content = document.createElement('main');
    content.className = 'erag-print-portal erag-print-content';
    content.dir = root.dir === 'rtl' ? 'rtl' : 'ltr';
    content.innerHTML = sanitizeHtml(root.innerHTML, {
        allowedTags: DEFAULT_ALLOWED_TAGS,
        allowedAttributes: DEFAULT_ALLOWED_ATTRIBUTES,
        allowRelativeUrls: true,
    });

    document.head.append(style);
    document.body.append(content);
    document.body.classList.add('erag-is-printing');
    copyComputedTypography(root, content);
    let cleanupTimer: number | undefined;
    const cleanup = (): void => {
        if (cleanupTimer !== undefined) window.clearTimeout(cleanupTimer);
        window.removeEventListener('afterprint', cleanup);
        document.body.classList.remove('erag-is-printing');
        content.remove();
        style.remove();
    };

    window.addEventListener('afterprint', cleanup, { once: true });
    try {
        window.print();
        cleanupTimer = window.setTimeout(cleanup, 1_000);
        return true;
    } catch {
        cleanup();
        return false;
    }
}

function copyComputedTypography(source: HTMLElement, target: HTMLElement): void {
    const computed = window.getComputedStyle(source);
    target.style.fontFamily = computed.fontFamily;
    target.style.fontSize = computed.fontSize;
    target.style.lineHeight = computed.lineHeight;
    target.style.color = computed.color;
}

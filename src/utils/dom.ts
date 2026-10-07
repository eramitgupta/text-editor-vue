export function closestElement<T extends keyof HTMLElementTagNameMap>(
    root: HTMLElement,
    tag: T,
    range?: Range | null,
): HTMLElementTagNameMap[T] | null {
    const current = range?.startContainer ?? window.getSelection()?.anchorNode;
    const element = current instanceof Element ? current : current?.parentElement;
    const closest = element?.closest(tag) as HTMLElementTagNameMap[T] | null;
    return closest && root.contains(closest) ? closest : null;
}
export function focusableElements(container: HTMLElement): HTMLElement[] {
    return [
        ...container.querySelectorAll<HTMLElement>(
            'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
    ];
}
export function replaceTextInElement(
    element: HTMLElement,
    search: RegExp,
    replacement: string,
    replaceAll: boolean,
): void {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        const value = node.textContent ?? '';
        const next = value.replace(search, replacement);
        if (next !== value) {
            node.textContent = next;
            if (!replaceAll) return;
        }
        node = walker.nextNode();
    }
}

const PHRASING_BLOCK_SELECTOR = 'p,h1,h2,h3,h4,h5,h6,pre';
const BLOCK_SELECTOR =
    'address,article,aside,blockquote,details,div,dl,fieldset,figure,footer,form,h1,h2,h3,h4,h5,h6,header,hr,nav,ol,p,pre,section,table,ul';
const CONTENT_SELECTOR = 'img,video,audio,iframe,input,[contenteditable="false"]';
const REDUNDANT_STYLE_PROPERTIES = ['font-family', 'font-size', 'font-weight', 'font-style'];

interface SelectionSnapshot {
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
}

export function isBlockElement(node: Node): node is Element {
    return node instanceof Element && node.matches(BLOCK_SELECTOR);
}

export function closestPhrasingBlock(node: Node, root: HTMLElement): HTMLElement | null {
    const element = node instanceof Element ? node : node.parentElement;
    const block = element?.closest<HTMLElement>(PHRASING_BLOCK_SELECTOR);
    return block && block !== root && root.contains(block) ? block : null;
}

/**
 * Split a paragraph or heading around block children (lists, tables, paragraphs),
 * because the HTML parser breaks that nesting apart when the content is loaded again.
 */
export function liftNestedBlocks(block: Element | null): void {
    if (!block?.matches(PHRASING_BLOCK_SELECTOR) || ![...block.children].some(isBlockElement)) {
        return;
    }
    const snapshot = snapshotSelection();
    const parts: Element[] = [];
    const inlineRuns = new Set<Element>();
    let inlineRun: Element | null = null;
    for (const child of [...block.childNodes]) {
        if (isBlockElement(child)) {
            inlineRun = null;
            parts.push(child);
            continue;
        }
        if (!inlineRun) {
            inlineRun = block.cloneNode(false) as Element;
            inlineRuns.add(inlineRun);
            parts.push(inlineRun);
        }
        inlineRun.append(child);
    }
    block.replaceWith(...parts.filter((part) => !inlineRuns.has(part) || hasContent(part)));
    restoreSnapshot(snapshot);
}

/**
 * Chrome copies inherited font styles onto `<span style>` wrappers when it moves
 * paragraphs (list toggles, indent, outdent). Drop the declarations that do not change
 * the computed style of spans in the range, and unwrap spans left without attributes.
 */
export function removeRedundantInlineStyles(root: HTMLElement, range: Range | null): void {
    if (!range) return;
    const snapshot = snapshotSelection();
    for (const span of root.querySelectorAll<HTMLElement>('span[style]')) {
        if (!range.intersectsNode(span) || span.matches(CONTENT_SELECTOR)) continue;
        for (const property of REDUNDANT_STYLE_PROPERTIES) {
            const value = span.style.getPropertyValue(property);
            if (!value) continue;
            const priority = span.style.getPropertyPriority(property);
            const computed = getComputedStyle(span).getPropertyValue(property);
            span.style.removeProperty(property);
            if (getComputedStyle(span).getPropertyValue(property) !== computed) {
                span.style.setProperty(property, value, priority);
            }
        }
        if (!span.style.length) span.removeAttribute('style');
        if (!span.attributes.length) span.replaceWith(...span.childNodes);
    }
    restoreSnapshot(snapshot);
}

function hasContent(element: Element): boolean {
    return Boolean(element.textContent?.trim()) || Boolean(element.querySelector(CONTENT_SELECTOR));
}

function snapshotSelection(): SelectionSnapshot | null {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return null;
    const { startContainer, startOffset, endContainer, endOffset } = selection.getRangeAt(0);
    return { startContainer, startOffset, endContainer, endOffset };
}

function restoreSnapshot(snapshot: SelectionSnapshot | null): void {
    if (!snapshot?.startContainer.isConnected || !snapshot.endContainer.isConnected) return;
    const range = document.createRange();
    try {
        range.setStart(snapshot.startContainer, snapshot.startOffset);
        range.setEnd(snapshot.endContainer, snapshot.endOffset);
    } catch {
        return;
    }
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

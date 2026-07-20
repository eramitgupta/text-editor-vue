export function closestElement<T extends keyof HTMLElementTagNameMap>(
    root: HTMLElement,
    tag: T,
): HTMLElementTagNameMap[T] | null {
    const current = window.getSelection()?.anchorNode;
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

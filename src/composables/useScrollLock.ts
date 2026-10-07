import { onBeforeUnmount, onMounted } from 'vue';

let lockCount = 0;
let restorePageStyles: (() => void) | null = null;

/**
 * Keep the page behind an open dialog from scrolling. Locks are counted, so when several
 * dialogs are open at once (for example two editors on one page) the page is released only
 * after the last one closes. The scrollbar gap is padded so the page does not shift sideways.
 */
export function useScrollLock(): void {
    onMounted(lockPageScroll);
    onBeforeUnmount(unlockPageScroll);
}

function lockPageScroll(): void {
    lockCount += 1;
    if (lockCount > 1 || typeof document === 'undefined') return;
    const { documentElement: html, body } = document;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const previous = {
        htmlOverflow: html.style.overflow,
        bodyOverflow: body.style.overflow,
        bodyPaddingRight: body.style.paddingRight,
    };
    if (scrollbarWidth > 0) {
        const paddingRight = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${paddingRight + scrollbarWidth}px`;
    }
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    restorePageStyles = () => {
        html.style.overflow = previous.htmlOverflow;
        body.style.overflow = previous.bodyOverflow;
        body.style.paddingRight = previous.bodyPaddingRight;
    };
}

function unlockPageScroll(): void {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0) return;
    restorePageStyles?.();
    restorePageStyles = null;
}

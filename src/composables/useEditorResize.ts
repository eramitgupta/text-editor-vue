import { onBeforeUnmount, shallowRef, type ComputedRef, type Ref } from 'vue';
import type { ResolvedEditorInit } from '../types';
import { pixelValue } from '../utils/units';

export function useEditorResize(
    shell: Ref<HTMLElement | null>,
    config: ComputedRef<ResolvedEditorInit>,
    locked: ComputedRef<boolean>,
    resized: (height: number) => void,
) {
    const currentHeight = shallowRef<number | null>(null);
    let cleanup: null | (() => void) = null;

    function start(event: PointerEvent): void {
        if (!shell.value || locked.value) return;
        cleanup?.();
        event.preventDefault();
        const startY = event.clientY;
        const startHeight = shell.value.getBoundingClientRect().height;
        const minimum = pixelValue(config.value.minHeight, 120);
        const maximum = pixelValue(config.value.maxHeight, Number.POSITIVE_INFINITY);
        const move = (moveEvent: PointerEvent): void => {
            const height = Math.min(
                maximum,
                Math.max(minimum, startHeight + moveEvent.clientY - startY),
            );
            currentHeight.value = height;
            resized(height);
        };
        const end = (): void => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', end);
            window.removeEventListener('pointercancel', end);
            cleanup = null;
        };
        cleanup = end;
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
        window.addEventListener('pointercancel', end);
    }

    function reset(): void {
        currentHeight.value = null;
    }

    onBeforeUnmount(() => cleanup?.());
    return { currentHeight, start, reset };
}

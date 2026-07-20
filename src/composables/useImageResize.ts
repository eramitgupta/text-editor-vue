import {
    computed,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    watch,
    type ComputedRef,
    type Ref,
} from 'vue';
import type { ImageAlignment, ImageResizeBox, ImageResizeHandle } from '../types';

const MINIMUM_IMAGE_SIZE = 40;

export function useImageResize(
    root: Ref<HTMLElement | null>,
    container: Ref<HTMLElement | null>,
    locked: ComputedRef<boolean>,
    changed: () => void,
) {
    const selectedImage = shallowRef<HTMLImageElement | null>(null);
    const box = shallowRef<ImageResizeBox | null>(null);
    const alignment = shallowRef<ImageAlignment | null>(null);
    const activeCommands = computed<Record<string, boolean>>(() => ({
        alignleft: alignment.value === 'alignleft',
        aligncenter: alignment.value === 'aligncenter',
        alignright: alignment.value === 'alignright',
        alignjustify: false,
    }));
    let observer: ResizeObserver | null = null;
    let frame = 0;

    function selectFromEvent(event: MouseEvent): void {
        if (locked.value || !(event.target instanceof HTMLImageElement)) {
            clear();
            return;
        }
        if (!root.value?.contains(event.target)) return;
        selectedImage.value = event.target;
        alignment.value = getImageAlignment(event.target);
        observeSelectedImage();
        refresh();
    }

    function refresh(): void {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(updateBox);
    }

    function updateBox(): void {
        const image = selectedImage.value;
        const host = container.value;
        if (!image?.isConnected || !host) {
            clear();
            return;
        }
        const imageRect = image.getBoundingClientRect();
        const hostRect = host.getBoundingClientRect();
        box.value = {
            top: imageRect.top - hostRect.top,
            left: imageRect.left - hostRect.left,
            width: imageRect.width,
            height: imageRect.height,
        };
    }

    function resizeStart(event: PointerEvent, handle: ImageResizeHandle): void {
        const image = selectedImage.value;
        const editorRoot = root.value;
        if (!image || !editorRoot || locked.value) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = image.getBoundingClientRect();
        const rootRect = editorRoot.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;
        const aspectRatio = rect.width / rect.height || 1;
        const maximumWidth = Math.max(MINIMUM_IMAGE_SIZE, rootRect.width - 1);

        const move = (moveEvent: PointerEvent): void => {
            moveEvent.preventDefault();
            const horizontalDelta =
                (moveEvent.clientX - startX) * (handle.endsWith('east') ? 1 : -1);
            const verticalDelta =
                (moveEvent.clientY - startY) * (handle.startsWith('south') ? 1 : -1);
            const horizontalWidth = startWidth + horizontalDelta;
            const verticalWidth = (startHeight + verticalDelta) * aspectRatio;
            const requestedWidth =
                Math.abs(horizontalWidth - startWidth) >=
                Math.abs(verticalWidth - startWidth)
                    ? horizontalWidth
                    : verticalWidth;
            const width = Math.round(
                Math.min(
                    maximumWidth,
                    Math.max(MINIMUM_IMAGE_SIZE, requestedWidth),
                ),
            );
            image.setAttribute('width', String(width));
            image.setAttribute('height', String(Math.round(width / aspectRatio)));
            refresh();
        };
        const end = (): void => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', end);
            window.removeEventListener('pointercancel', end);
            changed();
            refresh();
        };
        window.addEventListener('pointermove', move, { passive: false });
        window.addEventListener('pointerup', end, { once: true });
        window.addEventListener('pointercancel', end, { once: true });
    }

    function executeCommand(id: string): boolean {
        const image = selectedImage.value;
        if (!image || !isImageAlignment(id)) return false;
        image.style.display = 'block';
        image.style.marginLeft = id === 'alignright' ? 'auto' : id === 'aligncenter' ? 'auto' : '0';
        image.style.marginRight = id === 'alignleft' ? 'auto' : id === 'aligncenter' ? 'auto' : '0';
        alignment.value = id;
        changed();
        refresh();
        return true;
    }

    function clear(): void {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        selectedImage.value = null;
        alignment.value = null;
        box.value = null;
    }

    function observeSelectedImage(): void {
        observer?.disconnect();
        if (selectedImage.value) observer?.observe(selectedImage.value);
        if (container.value) observer?.observe(container.value);
    }

    watch(locked, (value) => {
        if (value) clear();
    });
    onMounted(() => {
        if (typeof ResizeObserver !== 'undefined') observer = new ResizeObserver(refresh);
        window.addEventListener('resize', refresh);
        document.addEventListener('scroll', refresh, true);
    });
    onBeforeUnmount(() => {
        clear();
        window.removeEventListener('resize', refresh);
        document.removeEventListener('scroll', refresh, true);
    });

    return { box, activeCommands, selectFromEvent, resizeStart, executeCommand, refresh, clear };
}

function getImageAlignment(image: HTMLImageElement): ImageAlignment {
    const style = image.style;
    if (style.marginLeft === 'auto' && style.marginRight === 'auto') return 'aligncenter';
    if (style.marginLeft === 'auto' && style.marginRight !== 'auto') return 'alignright';
    return 'alignleft';
}

function isImageAlignment(value: string): value is ImageAlignment {
    return ['alignleft', 'aligncenter', 'alignright'].includes(value);
}

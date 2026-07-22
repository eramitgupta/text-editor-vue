import {
    computed,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    watch,
    type ComputedRef,
    type Ref,
} from 'vue';
import type {
    ImageAlignment,
    ImageDeleteInfo,
    ImageResizeBox,
    ImageResizeHandle,
    ImagesDeleteHandler,
} from '../types';

const MINIMUM_IMAGE_WIDTH = 120;
const MINIMUM_IMAGE_HEIGHT = 80;

export function useImageResize(
    root: Ref<HTMLElement | null>,
    container: Ref<HTMLElement | null>,
    locked: ComputedRef<boolean>,
    changed: () => void,
    removed: (image: ImageDeleteInfo) => void,
) {
    const selectedImage = shallowRef<HTMLImageElement | null>(null);
    const box = shallowRef<ImageResizeBox | null>(null);
    const alignment = shallowRef<ImageAlignment | null>(null);
    const deleting = shallowRef(false);
    const deleteError = shallowRef('');
    const activeCommands = computed<Record<string, boolean>>(() => ({
        alignleft: alignment.value === 'alignleft',
        aligncenter: alignment.value === 'aligncenter',
        alignright: alignment.value === 'alignright',
        alignjustify: false,
    }));
    let observer: ResizeObserver | null = null;
    let frame = 0;

    function selectFromEvent(event: MouseEvent): void {
        if (deleting.value) return;
        if (locked.value || !(event.target instanceof HTMLImageElement)) {
            clear();
            return;
        }
        if (!root.value?.contains(event.target)) return;
        selectedImage.value = event.target;
        deleteError.value = '';
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
        if (!image || !editorRoot || locked.value || deleting.value) return;
        event.preventDefault();
        event.stopPropagation();
        const rect = image.getBoundingClientRect();
        const rootRect = editorRoot.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = rect.width;
        const aspectRatio = rect.width / rect.height || 1;
        const minimumWidth = Math.max(MINIMUM_IMAGE_WIDTH, MINIMUM_IMAGE_HEIGHT * aspectRatio);
        const maximumWidth = Math.max(minimumWidth, rootRect.right - rect.left);
        const horizontalDirection = handle.endsWith('east') ? 1 : -1;
        const verticalDirection = handle.startsWith('south') ? 1 : -1;
        const diagonalHeight = 1 / aspectRatio;
        const diagonalLengthSquared = 1 + diagonalHeight * diagonalHeight;

        const move = (moveEvent: PointerEvent): void => {
            moveEvent.preventDefault();
            const horizontalDelta = (moveEvent.clientX - startX) * horizontalDirection;
            const verticalDelta = (moveEvent.clientY - startY) * verticalDirection;
            const projectedWidthDelta =
                (horizontalDelta + verticalDelta * diagonalHeight) / diagonalLengthSquared;
            const width = Math.min(
                maximumWidth,
                Math.max(minimumWidth, startWidth + projectedWidthDelta),
            );
            image.style.width = `${width}px`;
            image.style.height = `${width / aspectRatio}px`;
            refresh();
        };
        const end = (): void => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', end);
            window.removeEventListener('pointercancel', end);
            const finalRect = image.getBoundingClientRect();
            image.setAttribute('width', String(Math.round(finalRect.width)));
            image.setAttribute('height', String(Math.round(finalRect.height)));
            image.style.removeProperty('width');
            image.style.removeProperty('height');
            changed();
            refresh();
        };
        window.addEventListener('pointermove', move, { passive: false });
        window.addEventListener('pointerup', end, { once: true });
        window.addEventListener('pointercancel', end, { once: true });
    }

    function executeCommand(id: string): boolean {
        const image = selectedImage.value;
        if (!image || deleting.value || !isImageAlignment(id)) return false;
        image.style.display = 'block';
        image.style.marginLeft = id === 'alignright' ? 'auto' : id === 'aligncenter' ? 'auto' : '0';
        image.style.marginRight = id === 'alignleft' ? 'auto' : id === 'aligncenter' ? 'auto' : '0';
        alignment.value = id;
        changed();
        refresh();
        return true;
    }

    async function deleteSelected(handler?: ImagesDeleteHandler): Promise<boolean> {
        const image = selectedImage.value;
        if (!image || !image.isConnected || locked.value || deleting.value) return false;
        deleting.value = true;
        deleteError.value = '';
        const info = getDeleteInfo(image);
        try {
            if (handler) await handler(info);
            if (selectedImage.value !== image || !image.isConnected) return false;
            image.remove();
            clear();
            changed();
            removed(info);
            return true;
        } catch {
            deleteError.value = 'Unable to delete image from server';
            return false;
        } finally {
            deleting.value = false;
        }
    }

    function clear(): void {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        selectedImage.value = null;
        alignment.value = null;
        box.value = null;
        deleteError.value = '';
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

    return {
        box,
        activeCommands,
        deleting,
        deleteError,
        selectFromEvent,
        resizeStart,
        executeCommand,
        deleteSelected,
        refresh,
        clear,
    };
}

function getDeleteInfo(image: HTMLImageElement): ImageDeleteInfo {
    const rect = image.getBoundingClientRect();
    return {
        src: image.getAttribute('src') ?? '',
        alt: image.getAttribute('alt') ?? '',
        width: Math.round(rect.width),
        height: Math.round(rect.height),
    };
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

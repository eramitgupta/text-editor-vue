import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue';

const VIEWPORT_PADDING = 8;
const FLOATING_GAP = 6;

export function useFloatingPosition(
    trigger: Ref<HTMLElement | null>,
    panel: Ref<HTMLElement | null>,
    boundary?: Ref<HTMLElement | null>,
) {
    const style = shallowRef<Record<string, string>>({
        position: 'fixed',
        left: '-9999px',
        top: '-9999px',
    });
    let frame = 0;
    let resizeObserver: ResizeObserver | null = null;
    let activeTrigger: HTMLElement | null = null;
    let placeAbove: boolean | null = null;
    const boundaryRef = boundary ?? shallowRef<HTMLElement | null>(null);

    async function update(): Promise<void> {
        await nextTick();
        if (!trigger.value || !panel.value) return;
        if (activeTrigger !== trigger.value) {
            activeTrigger = trigger.value;
            placeAbove = null;
        }
        const a = trigger.value.getBoundingClientRect();
        const p = panel.value.getBoundingClientRect();
        const bounds = boundaryRef.value?.getBoundingClientRect();
        const triggerOutsideBoundary =
            bounds &&
            (a.bottom <= bounds.top ||
                a.top >= bounds.bottom ||
                a.right <= bounds.left ||
                a.left >= bounds.right);
        if (triggerOutsideBoundary) {
            style.value = {
                position: 'fixed',
                left: '-9999px',
                top: '-9999px',
                visibility: 'hidden',
                pointerEvents: 'none',
            };
            return;
        }
        const minLeft = Math.max(
            VIEWPORT_PADDING,
            bounds ? bounds.left + VIEWPORT_PADDING : VIEWPORT_PADDING,
        );
        const maxRight = Math.min(
            window.innerWidth - VIEWPORT_PADDING,
            bounds ? bounds.right - VIEWPORT_PADDING : window.innerWidth - VIEWPORT_PADDING,
        );
        const minTop = Math.max(
            VIEWPORT_PADDING,
            bounds ? bounds.top + VIEWPORT_PADDING : VIEWPORT_PADDING,
        );
        const maxBottom = Math.min(
            window.innerHeight - VIEWPORT_PADDING,
            bounds ? bounds.bottom - VIEWPORT_PADDING : window.innerHeight - VIEWPORT_PADDING,
        );
        const maxLeft = Math.max(minLeft, maxRight - p.width);
        const left = Math.max(minLeft, Math.min(a.left, maxLeft));
        const below = a.bottom + FLOATING_GAP;
        const above = a.top - p.height - FLOATING_GAP;
        if (placeAbove === null) {
            const spaceBelow = maxBottom - a.bottom - FLOATING_GAP;
            const spaceAbove = a.top - minTop - FLOATING_GAP;
            placeAbove = spaceBelow < p.height && spaceAbove > spaceBelow;
        }
        const preferredTop = placeAbove ? above : below;
        const maxTop = Math.max(minTop, maxBottom - p.height);
        const top = Math.max(minTop, Math.min(preferredTop, maxTop));
        style.value = {
            position: 'fixed',
            left: `${left}px`,
            top: `${top}px`,
        };
    }

    function scheduleUpdate(): void {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => void update());
    }

    watch(
        [trigger, panel, boundaryRef],
        () => {
            if (!trigger.value) {
                activeTrigger = null;
                placeAbove = null;
            }
            resizeObserver?.disconnect();
            resizeObserver = null;
            if (trigger.value && panel.value && typeof ResizeObserver !== 'undefined') {
                resizeObserver = new ResizeObserver(scheduleUpdate);
                resizeObserver.observe(trigger.value);
                resizeObserver.observe(panel.value);
                if (boundaryRef.value) {
                    resizeObserver.observe(boundaryRef.value);
                }
            }
            scheduleUpdate();
        },
        { flush: 'post' },
    );
    onMounted(() => {
        window.addEventListener('resize', scheduleUpdate);
        window.addEventListener('scroll', scheduleUpdate, true);
        scheduleUpdate();
    });
    onBeforeUnmount(() => {
        cancelAnimationFrame(frame);
        resizeObserver?.disconnect();
        window.removeEventListener('resize', scheduleUpdate);
        window.removeEventListener('scroll', scheduleUpdate, true);
    });

    return { style, update: scheduleUpdate };
}

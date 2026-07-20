import { nextTick, onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue';

const OVERFLOW_BUTTON_WIDTH = 34;
const OVERFLOW_GAP = 4;

export function useToolbarOverflow(
    container: Ref<HTMLElement | null>,
    itemCount: Ref<number>,
    layoutKey: Ref<string>,
) {
    const visibleCount = shallowRef(itemCount.value);
    const groupWidths: number[] = [];
    let observer: ResizeObserver | null = null;

    function horizontalSize(element: HTMLElement | null): number {
        return element?.getBoundingClientRect().width ?? 0;
    }

    async function measure(): Promise<void> {
        await nextTick();

        const element = container.value;
        if (!element) return;

        const renderedGroups = element.querySelectorAll<HTMLElement>(
            '[data-erag-toolbar-group-index]',
        );

        renderedGroups.forEach((group) => {
            const index = Number(group.dataset.eragToolbarGroupIndex);
            if (Number.isInteger(index)) {
                groupWidths[index] = group.getBoundingClientRect().width;
            }
        });

        if (groupWidths.slice(0, itemCount.value).some((width) => !width)) return;

        const styles = window.getComputedStyle(element);
        const padding =
            Number.parseFloat(styles.paddingInlineStart) +
            Number.parseFloat(styles.paddingInlineEnd);
        const startWidth = horizontalSize(
            element.querySelector<HTMLElement>('[data-erag-toolbar-start]'),
        );
        const endWidth = horizontalSize(
            element.querySelector<HTMLElement>('[data-erag-toolbar-end]'),
        );
        const availableWidth = Math.max(0, element.clientWidth - padding - startWidth - endWidth);
        const totalGroupWidth = groupWidths
            .slice(0, itemCount.value)
            .reduce((total, width) => total + width, 0);

        if (totalGroupWidth <= availableWidth) {
            visibleCount.value = itemCount.value;
            return;
        }

        const availableGroupWidth = Math.max(
            0,
            availableWidth - OVERFLOW_BUTTON_WIDTH - OVERFLOW_GAP,
        );
        let usedWidth = 0;
        let nextVisibleCount = 0;

        for (const width of groupWidths.slice(0, itemCount.value)) {
            if (usedWidth + width > availableGroupWidth) break;
            usedWidth += width;
            nextVisibleCount += 1;
        }

        visibleCount.value = nextVisibleCount;
    }

    function reset(): void {
        groupWidths.length = 0;
        visibleCount.value = itemCount.value;
        void measure();
    }

    watch([itemCount, layoutKey], reset);

    onMounted(() => {
        observer = new ResizeObserver(() => void measure());
        if (container.value) observer.observe(container.value);
        void measure();
    });

    onBeforeUnmount(() => observer?.disconnect());

    return { visibleCount, measure };
}

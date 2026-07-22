import {
    computed,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    watch,
    type ComputedRef,
    type Ref,
} from 'vue';

export type TableResizeHandle = 'north-west' | 'north-east' | 'south-west' | 'south-east';

export interface TableInteractionBox {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface TableContextMenuPosition {
    x: number;
    y: number;
}

const MINIMUM_TABLE_WIDTH = 96;
const MINIMUM_TABLE_HEIGHT = 36;

export function useTableInteractions(
    root: Ref<HTMLElement | null>,
    container: Ref<HTMLElement | null>,
    locked: ComputedRef<boolean>,
    changed: () => void,
) {
    const selectedTable = shallowRef<HTMLTableElement | null>(null);
    const selectedCell = shallowRef<HTMLTableCellElement | null>(null);
    const selectedCells = shallowRef<HTMLTableCellElement[]>([]);
    const tableBox = shallowRef<TableInteractionBox | null>(null);
    const cellBoxes = shallowRef<TableInteractionBox[]>([]);
    const contextMenu = shallowRef<TableContextMenuPosition | null>(null);
    const hasMultipleCells = computed(() => selectedCells.value.length > 1);
    let dragAnchor: HTMLTableCellElement | null = null;
    let dragged = false;
    let frame = 0;
    let observer: ResizeObserver | null = null;

    function handlePointerDown(event: PointerEvent): void {
        if (locked.value || event.button !== 0) return;
        const cell = cellFromTarget(event.target);
        if (!cell || !root.value?.contains(cell)) {
            clear();
            return;
        }

        contextMenu.value = null;
        dragAnchor = event.shiftKey && selectedCell.value ? selectedCell.value : cell;
        dragged = false;
        selectCells(dragAnchor, cell);
        saveCellRange(cell);

        const move = (moveEvent: PointerEvent): void => {
            if (!dragAnchor || moveEvent.buttons === 0) return;
            const hoveredCell = cellFromPoint(moveEvent.clientX, moveEvent.clientY);
            if (!hoveredCell || hoveredCell.closest('table') !== dragAnchor.closest('table')) return;
            if (hoveredCell !== selectedCell.value) {
                moveEvent.preventDefault();
                dragged = true;
                selectCells(dragAnchor, hoveredCell);
                saveCellRange(hoveredCell);
            }
        };
        const end = (): void => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', end);
            window.removeEventListener('pointercancel', end);
            dragAnchor = null;
            if (dragged) restoreSelection();
        };
        window.addEventListener('pointermove', move, { passive: false });
        window.addEventListener('pointerup', end, { once: true });
        window.addEventListener('pointercancel', end, { once: true });
    }

    function handleContextMenu(event: MouseEvent): void {
        if (locked.value) return;
        const cell = cellFromTarget(event.target);
        if (!cell || !root.value?.contains(cell)) return;
        event.preventDefault();
        if (!selectedCells.value.includes(cell)) selectCells(cell, cell);
        saveCellRange(cell);
        contextMenu.value = { x: event.clientX, y: event.clientY };
    }

    function handleDocumentPointerDown(event: PointerEvent): void {
        if (!(event.target instanceof Element)) return;
        if (!event.target.closest('.erag-table-context-menu')) contextMenu.value = null;
    }

    function handleEscape(event: KeyboardEvent): void {
        if (event.key === 'Escape') contextMenu.value = null;
    }

    function selectCells(anchor: HTMLTableCellElement, current: HTMLTableCellElement): void {
        const table = anchor.closest('table');
        if (!(table instanceof HTMLTableElement) || current.closest('table') !== table) return;
        const anchorRow = anchor.parentElement as HTMLTableRowElement | null;
        const currentRow = current.parentElement as HTMLTableRowElement | null;
        if (!anchorRow || !currentRow) return;

        const firstRow = Math.min(anchorRow.rowIndex, currentRow.rowIndex);
        const lastRow = Math.max(anchorRow.rowIndex, currentRow.rowIndex);
        const firstColumn = Math.min(anchor.cellIndex, current.cellIndex);
        const lastColumn = Math.max(anchor.cellIndex, current.cellIndex);
        const cells: HTMLTableCellElement[] = [];
        for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex += 1) {
            const row = table.rows.item(rowIndex);
            if (!row) continue;
            for (let columnIndex = firstColumn; columnIndex <= lastColumn; columnIndex += 1) {
                const cell = row.cells.item(columnIndex);
                if (cell) cells.push(cell);
            }
        }

        selectedTable.value = table;
        selectedCell.value = current;
        selectedCells.value = cells;
        observeTable();
        refresh();
    }

    function saveCellRange(cell: HTMLTableCellElement): void {
        const range = cell.ownerDocument.createRange();
        range.selectNodeContents(cell);
        range.collapse(true);
        const selection = cell.ownerDocument.defaultView?.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    }

    function restoreSelection(): void {
        const cell = selectedCell.value;
        if (!cell?.isConnected) return;
        root.value?.focus({ preventScroll: true });
        saveCellRange(cell);
    }

    function refresh(): void {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(updateBoxes);
    }

    function updateBoxes(): void {
        const table = selectedTable.value;
        const host = container.value;
        if (!table?.isConnected || !host) {
            clear();
            return;
        }
        const hostRect = host.getBoundingClientRect();
        tableBox.value = relativeBox(table.getBoundingClientRect(), hostRect);
        cellBoxes.value = selectedCells.value
            .filter((cell) => cell.isConnected)
            .map((cell) => relativeBox(cell.getBoundingClientRect(), hostRect));
    }

    function resizeStart(event: PointerEvent, handle: TableResizeHandle): void {
        const table = selectedTable.value;
        const editorRoot = root.value;
        if (!table || !editorRoot || locked.value) return;
        event.preventDefault();
        event.stopPropagation();
        contextMenu.value = null;
        const tableRect = table.getBoundingClientRect();
        const rootRect = editorRoot.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const horizontalDirection = handle.endsWith('east') ? 1 : -1;
        const verticalDirection = handle.startsWith('south') ? 1 : -1;
        const maximumWidth = Math.max(MINIMUM_TABLE_WIDTH, rootRect.right - tableRect.left);

        const move = (moveEvent: PointerEvent): void => {
            moveEvent.preventDefault();
            const width = Math.round(
                Math.min(
                    maximumWidth,
                    Math.max(
                        MINIMUM_TABLE_WIDTH,
                        tableRect.width + (moveEvent.clientX - startX) * horizontalDirection,
                    ),
                ),
            );
            const height = Math.round(
                Math.max(
                    MINIMUM_TABLE_HEIGHT,
                    tableRect.height + (moveEvent.clientY - startY) * verticalDirection,
                ),
            );
            table.style.width = `${width}px`;
            table.style.height = `${height}px`;
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

    function closeContextMenu(): void {
        contextMenu.value = null;
    }

    function clear(): void {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        selectedTable.value = null;
        selectedCell.value = null;
        selectedCells.value = [];
        tableBox.value = null;
        cellBoxes.value = [];
        contextMenu.value = null;
    }

    function observeTable(): void {
        observer?.disconnect();
        if (selectedTable.value) observer?.observe(selectedTable.value);
        if (container.value) observer?.observe(container.value);
    }

    function connect(element: HTMLElement | null, previous: HTMLElement | null): void {
        previous?.removeEventListener('pointerdown', handlePointerDown);
        previous?.removeEventListener('contextmenu', handleContextMenu);
        element?.addEventListener('pointerdown', handlePointerDown);
        element?.addEventListener('contextmenu', handleContextMenu);
    }

    watch(root, connect);
    watch(locked, (value) => {
        if (value) clear();
    });
    onMounted(() => {
        connect(root.value, null);
        if (typeof ResizeObserver !== 'undefined') observer = new ResizeObserver(refresh);
        window.addEventListener('resize', refresh);
        document.addEventListener('scroll', refresh, true);
        document.addEventListener('pointerdown', handleDocumentPointerDown);
        document.addEventListener('keydown', handleEscape);
    });
    onBeforeUnmount(() => {
        connect(null, root.value);
        clear();
        window.removeEventListener('resize', refresh);
        document.removeEventListener('scroll', refresh, true);
        document.removeEventListener('pointerdown', handleDocumentPointerDown);
        document.removeEventListener('keydown', handleEscape);
    });

    return {
        tableBox,
        cellBoxes,
        contextMenu,
        hasMultipleCells,
        resizeStart,
        restoreSelection,
        closeContextMenu,
        refresh,
        clear,
    };
}

function cellFromTarget(target: EventTarget | null): HTMLTableCellElement | null {
    if (!(target instanceof Element)) return null;
    const cell = target.closest('td,th');
    return cell instanceof HTMLTableCellElement ? cell : null;
}

function cellFromPoint(x: number, y: number): HTMLTableCellElement | null {
    return cellFromTarget(document.elementFromPoint(x, y));
}

function relativeBox(rect: DOMRect, hostRect: DOMRect): TableInteractionBox {
    return {
        top: rect.top - hostRect.top,
        left: rect.left - hostRect.left,
        width: rect.width,
        height: rect.height,
    };
}

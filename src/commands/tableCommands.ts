import { closestElement } from '../utils/dom';

export function executeTableCommand(root: HTMLElement, id: string): boolean {
    const cell = closestElement(root, 'td') ?? closestElement(root, 'th');
    const row = cell?.parentElement as HTMLTableRowElement | null;
    const table = closestElement(root, 'table');
    if (!table || !cell || !row) return false;
    if (id === 'deleteTable') {
        table.remove();
        return true;
    }
    if (id === 'deleteRow') {
        row.remove();
        return true;
    }
    if (id === 'rowBefore' || id === 'rowAfter') {
        const clone = emptyRow(row);
        row.parentElement?.insertBefore(clone, id === 'rowBefore' ? row : row.nextSibling);
        return true;
    }
    const index = cell.cellIndex;
    if (id === 'columnBefore' || id === 'columnAfter') {
        for (const currentRow of [...table.rows])
            currentRow.insertCell(index + (id === 'columnAfter' ? 1 : 0)).innerHTML = '<br>';
        return true;
    }
    if (id === 'deleteColumn') {
        for (const currentRow of [...table.rows])
            if (currentRow.cells[index]) currentRow.deleteCell(index);
        return true;
    }
    if (id === 'mergeCells') {
        cell.colSpan += 1;
        cell.nextElementSibling?.remove();
        return true;
    }
    if (id === 'splitCell' && cell.colSpan > 1) {
        cell.colSpan -= 1;
        const next = document.createElement(cell.tagName.toLowerCase());
        next.innerHTML = '<br>';
        cell.after(next);
        return true;
    }
    if (id === 'cellProperties') {
        cell.toggleAttribute('data-erag-selected');
        return true;
    }
    return false;
}
function emptyRow(source: HTMLTableRowElement): HTMLTableRowElement {
    const row = document.createElement('tr');
    for (const sourceCell of [...source.cells]) {
        const cell = document.createElement(sourceCell.tagName.toLowerCase());
        cell.innerHTML = '<br>';
        row.append(cell);
    }
    return row;
}

export function applyTableProperties(root: HTMLElement, values: Record<string, string>): boolean {
    const table = closestElement(root, 'table');
    if (!table) return false;
    table.style.width = values.width || '';
    table.style.borderWidth = values.borderWidth || '';
    table.style.borderStyle = values.borderStyle || '';
    table.style.borderColor = values.borderColor || '';
    table.style.backgroundColor = values.backgroundColor || '';
    table.style.marginLeft =
        values.alignment === 'center' ? 'auto' : values.alignment === 'right' ? 'auto' : '0';
    table.style.marginRight =
        values.alignment === 'left' ? 'auto' : values.alignment === 'center' ? 'auto' : '0';
    for (const cell of table.querySelectorAll<HTMLElement>('td,th'))
        cell.style.padding = values.cellPadding || '';
    return true;
}

export function navigateTableCell(root: HTMLElement, backwards: boolean): boolean {
    const cell = closestElement(root, 'td') ?? closestElement(root, 'th');
    const table = closestElement(root, 'table');
    if (!cell || !table) return false;
    const cells = [...table.querySelectorAll<HTMLElement>('td,th')];
    const index = cells.indexOf(cell);
    const next = cells[index + (backwards ? -1 : 1)];
    if (!next) return false;
    const range = document.createRange();
    range.selectNodeContents(next);
    range.collapse(true);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    next.scrollIntoView({ block: 'nearest' });
    return true;
}

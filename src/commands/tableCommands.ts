import { closestElement } from '../utils/dom';
import type { CellPropertiesValue } from '../types';

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

export function getCellProperties(
    root: HTMLElement | null,
    range: Range | null,
): CellPropertiesValue {
    const cell = root ? selectedCell(root, range) : null;

    return {
        target: 'cell',
        cellType: cell?.tagName.toLowerCase() === 'th' ? 'th' : 'td',
        scope:
            cell?.getAttribute('scope') === 'row'
                ? 'row'
                : cell?.getAttribute('scope') === 'col'
                  ? 'col'
                  : '',
        horizontalAlign:
            cell?.style.textAlign === 'left' ||
            cell?.style.textAlign === 'center' ||
            cell?.style.textAlign === 'right'
                ? cell.style.textAlign
                : '',
        verticalAlign:
            cell?.style.verticalAlign === 'top' ||
            cell?.style.verticalAlign === 'middle' ||
            cell?.style.verticalAlign === 'bottom'
                ? cell.style.verticalAlign
                : '',
    };
}

export function applyCellProperties(
    root: HTMLElement,
    range: Range | null,
    values: CellPropertiesValue,
): boolean {
    const currentCell = selectedCell(root, range);
    const table = closestElement(root, 'table', range);
    if (!currentCell || !table) return false;

    const cells =
        values.target === 'first-row' ? [...(table.rows.item(0)?.cells ?? [])] : [currentCell];
    if (cells.length === 0) return false;

    for (const cell of cells) {
        const updatedCell = replaceCellType(cell, values.cellType);
        updatedCell.style.textAlign = values.horizontalAlign;
        updatedCell.style.verticalAlign = values.verticalAlign;
        if (values.cellType === 'th' && values.scope) {
            updatedCell.setAttribute('scope', values.scope);
        } else {
            updatedCell.removeAttribute('scope');
        }
    }

    return true;
}

function selectedCell(root: HTMLElement, range: Range | null): HTMLTableCellElement | null {
    return closestElement(root, 'td', range) ?? closestElement(root, 'th', range);
}

function replaceCellType(
    cell: HTMLTableCellElement,
    cellType: CellPropertiesValue['cellType'],
): HTMLTableCellElement {
    if (cell.tagName.toLowerCase() === cellType) return cell;

    const replacement = document.createElement(cellType);
    for (const attribute of [...cell.attributes]) {
        replacement.setAttribute(attribute.name, attribute.value);
    }
    while (cell.firstChild) replacement.append(cell.firstChild);
    cell.replaceWith(replacement);

    return replacement;
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

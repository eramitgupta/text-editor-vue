import type { MenuItemDefinition } from '../types';

const COMMAND_ICONS: Record<string, string> = {
    new: 'file',
    print: 'print',
    undo: 'undo',
    redo: 'redo',
    cut: 'cut',
    copy: 'copy',
    paste: 'paste',
    pasteText: 'paste',
    selectall: 'select-all',
    fullscreen: 'fullscreen',
    hr: 'horizontal-rule',
    anchor: 'anchor',
    dateTime: 'calendar',
    bold: 'bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'strikethrough',
    superscript: 'superscript',
    subscript: 'subscript',
    inlineCode: 'code',
    changeCase: 'case-change',
    formatBlock: 'format',
    lineHeightMenu: 'format',
    lineheight: 'format',
    removeformat: 'clear-format',
    wordCount: 'count',
    insertMergeTag: 'merge-tag',
    deleteTable: 'trash',
    cellProperties: 'table',
    mergeCells: 'table',
    splitCell: 'table',
    rowBefore: 'table',
    rowAfter: 'table',
    deleteRow: 'trash',
    columnBefore: 'table',
    columnAfter: 'table',
    deleteColumn: 'trash',
    alignleft: 'alignleft',
    aligncenter: 'aligncenter',
    alignright: 'alignright',
    alignjustify: 'alignjustify',
};

const DIALOG_ICONS: Record<string, string> = {
    source: 'code',
    preview: 'preview',
    'find-replace': 'search',
    image: 'image',
    link: 'link',
    media: 'media',
    table: 'table',
    'table-properties': 'table',
    'special-character': 'special-character',
    emoji: 'emoji',
    shortcuts: 'keyboard',
    about: 'help',
};

const CATEGORY_ICONS: Record<string, string> = {
    formats: 'format',
    'format-headings': 'format',
    'format-inline': 'format',
    'format-blocks': 'format',
    'format-align': 'alignleft',
    blocks: 'format',
    alignment: 'alignleft',
    'change-case': 'case-change',
    'date-time': 'calendar',
    'merge-tag': 'merge-tag',
    cell: 'table',
    row: 'table',
    column: 'table',
};

export function resolveMenuItemIcon(item: MenuItemDefinition): string {
    if (item.icon) return item.icon;
    const commandIcon = item.command ? COMMAND_ICONS[item.command] : undefined;
    if (commandIcon) return commandIcon;
    const dialogIcon = item.dialog ? DIALOG_ICONS[item.dialog] : undefined;
    if (dialogIcon) return dialogIcon;
    return CATEGORY_ICONS[item.id] ?? 'menu-item';
}

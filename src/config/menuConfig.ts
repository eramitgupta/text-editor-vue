import type { MenuDefinition, MenuItemDefinition } from '../types';

const separator = (id: string): MenuItemDefinition => ({ id, label: '', separator: true });
const blocks: MenuItemDefinition[] = [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'pre',
    'blockquote',
].map((value) => ({
    id: `block-${value}`,
    label:
        value === 'p'
            ? 'Paragraph'
            : value === 'pre'
              ? 'Preformatted'
              : value === 'blockquote'
                ? 'Blockquote'
                : `Heading ${value.slice(1)}`,
    command: 'formatBlock',
    value,
}));
const align: MenuItemDefinition[] = [
    { id: 'align-left', label: 'Left', command: 'alignleft' },
    { id: 'align-center', label: 'Center', command: 'aligncenter' },
    { id: 'align-right', label: 'Right', command: 'alignright' },
    { id: 'align-justify', label: 'Justify', command: 'alignjustify' },
];
const inline: MenuItemDefinition[] = [
    { id: 'bold', label: 'Bold', command: 'bold', shortcut: 'Ctrl+B' },
    { id: 'italic', label: 'Italic', command: 'italic', shortcut: 'Ctrl+I' },
    { id: 'underline', label: 'Underline', command: 'underline', shortcut: 'Ctrl+U' },
    { id: 'strike', label: 'Strikethrough', command: 'strikethrough' },
    { id: 'sup', label: 'Superscript', command: 'superscript' },
    { id: 'sub', label: 'Subscript', command: 'subscript' },
    { id: 'inline-code', label: 'Inline code', command: 'inlineCode' },
];
const changeCase: MenuItemDefinition[] = [
    { id: 'case-lowercase', label: 'lowercase', command: 'changeCase', value: 'lowercase' },
    { id: 'case-uppercase', label: 'UPPERCASE', command: 'changeCase', value: 'uppercase' },
    { id: 'case-title', label: 'Title Case', command: 'changeCase', value: 'titlecase' },
];

export const MENU_DEFINITIONS: MenuDefinition[] = [
    {
        name: 'file',
        label: 'File',
        icon: 'file',
        items: [
            { id: 'new', label: 'New document', command: 'new' },
            { id: 'preview', label: 'Preview', dialog: 'preview', plugin: 'preview' },
            { id: 'print', label: 'Print', command: 'print' },
        ],
    },
    {
        name: 'edit',
        label: 'Edit',
        icon: 'edit',
        items: [
            { id: 'undo', label: 'Undo', command: 'undo', shortcut: 'Ctrl+Z' },
            { id: 'redo', label: 'Redo', command: 'redo', shortcut: 'Ctrl+Y' },
            separator('edit-1'),
            { id: 'cut', label: 'Cut', command: 'cut', shortcut: 'Ctrl+X' },
            { id: 'copy', label: 'Copy', command: 'copy', shortcut: 'Ctrl+C' },
            { id: 'paste', label: 'Paste', command: 'paste', shortcut: 'Ctrl+V' },
            { id: 'paste-text', label: 'Paste as plain text', command: 'pasteText' },
            separator('edit-2'),
            { id: 'select-all', label: 'Select all', command: 'selectall', shortcut: 'Ctrl+A' },
            {
                id: 'find',
                label: 'Find and replace',
                dialog: 'find-replace',
                shortcut: 'Ctrl+F',
                plugin: 'find-replace',
            },
        ],
    },
    {
        name: 'view',
        label: 'View',
        icon: 'view',
        items: [
            { id: 'source', label: 'Source code', dialog: 'source', plugin: 'code' },
            { id: 'view-preview', label: 'Preview', dialog: 'preview', plugin: 'preview' },
            { id: 'fullscreen', label: 'Fullscreen', command: 'fullscreen', plugin: 'fullscreen' },
        ],
    },
    {
        name: 'insert',
        label: 'Insert',
        icon: 'insert',
        items: [
            { id: 'image', label: 'Image', command: 'imageUpload', plugin: 'image' },
            { id: 'link', label: 'Link', dialog: 'link', plugin: 'link' },
            { id: 'media', label: 'Media', dialog: 'media', plugin: 'media' },
            { id: 'table', label: 'Table', dialog: 'table', plugin: 'table' },
            {
                id: 'character',
                label: 'Special character',
                dialog: 'special-character',
                plugin: 'special-character',
            },
            { id: 'emoji', label: 'Emoji', dialog: 'emoji', plugin: 'emoji' },
            { id: 'hr', label: 'Horizontal line', command: 'hr', plugin: 'horizontal-rule' },
            { id: 'anchor', label: 'Anchor', command: 'anchor', plugin: 'anchor' },
            { id: 'date-time', label: 'Date/time', plugin: 'date-time' },
        ],
    },
    {
        name: 'merge-tags',
        label: 'Merge tag',
        icon: 'merge-tag',
        items: [],
    },
    {
        name: 'templates',
        label: 'Templates',
        icon: 'template',
        items: [],
    },
    {
        name: 'format',
        label: 'Format',
        icon: 'format',
        items: [
            ...inline,
            { id: 'change-case', label: 'Change case', children: changeCase },
            separator('format-1'),
            {
                id: 'formats',
                label: 'Formats',
                children: [
                    { id: 'format-headings', label: 'Headings', children: blocks.slice(1, 7) },
                    { id: 'format-inline', label: 'Inline', children: inline },
                    { id: 'format-blocks', label: 'Blocks', children: blocks },
                    { id: 'format-align', label: 'Alignment', children: align },
                ],
            },
            { id: 'blocks', label: 'Blocks', children: blocks },
            { id: 'alignment', label: 'Alignment', children: align },
            { id: 'line-height', label: 'Line height', command: 'lineHeightMenu' },
            separator('format-2'),
            { id: 'clear', label: 'Clear formatting', command: 'removeformat' },
        ],
    },
    {
        name: 'tools',
        label: 'Tools',
        icon: 'tools',
        items: [
            { id: 'tools-source', label: 'Source code', dialog: 'source', plugin: 'code' },
            { id: 'words', label: 'Word count', command: 'wordCount' },
        ],
    },
    {
        name: 'table',
        label: 'Table',
        icon: 'table',
        items: [
            { id: 'insert-table', label: 'Insert table', dialog: 'table', plugin: 'table' },
            {
                id: 'table-properties',
                label: 'Table properties',
                dialog: 'table-properties',
                tableOnly: true,
            },
            { id: 'delete-table', label: 'Delete table', command: 'deleteTable', tableOnly: true },
            {
                id: 'cell',
                label: 'Cell',
                children: [
                    {
                        id: 'cell-properties',
                        label: 'Cell properties',
                        command: 'cellProperties',
                        tableOnly: true,
                    },
                    {
                        id: 'merge-cells',
                        label: 'Merge cells',
                        command: 'mergeCells',
                        tableOnly: true,
                    },
                    {
                        id: 'split-cell',
                        label: 'Split cell',
                        command: 'splitCell',
                        tableOnly: true,
                    },
                ],
            },
            {
                id: 'row',
                label: 'Row',
                children: [
                    {
                        id: 'row-before',
                        label: 'Insert row before',
                        command: 'rowBefore',
                        tableOnly: true,
                    },
                    {
                        id: 'row-after',
                        label: 'Insert row after',
                        command: 'rowAfter',
                        tableOnly: true,
                    },
                    {
                        id: 'delete-row',
                        label: 'Delete row',
                        command: 'deleteRow',
                        tableOnly: true,
                    },
                ],
            },
            {
                id: 'column',
                label: 'Column',
                children: [
                    {
                        id: 'column-before',
                        label: 'Insert column before',
                        command: 'columnBefore',
                        tableOnly: true,
                    },
                    {
                        id: 'column-after',
                        label: 'Insert column after',
                        command: 'columnAfter',
                        tableOnly: true,
                    },
                    {
                        id: 'delete-column',
                        label: 'Delete column',
                        command: 'deleteColumn',
                        tableOnly: true,
                    },
                ],
            },
        ],
    },
    {
        name: 'help',
        label: 'Help',
        icon: 'help',
        items: [
            {
                id: 'shortcuts',
                label: 'Shortcuts',
                dialog: 'shortcuts',
                shortcut: 'Alt+0',
            },
            { id: 'about', label: 'About', dialog: 'about' },
        ],
    },
];

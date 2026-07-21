import type { EditorToolbarGroup, EditorToolbarItemName, ToolbarItemDefinition } from '../types';

export const DEFAULT_TOOLBAR =
    'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough superscript subscript casechange | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | hr removeformat | code preview fullscreen more';

export const TOOLBAR_ITEMS: Record<EditorToolbarItemName, ToolbarItemDefinition> = {
    undo: { name: 'undo', label: 'Undo', icon: 'undo', command: 'undo' },
    redo: { name: 'redo', label: 'Redo', icon: 'redo', command: 'redo' },
    blocks: { name: 'blocks', label: 'Blocks', select: 'blocks' },
    fontfamily: {
        name: 'fontfamily',
        label: 'Font family',
        select: 'fontfamily',
    },
    fontsize: {
        name: 'fontsize',
        label: 'Font size',
        select: 'fontsize',
    },
    bold: { name: 'bold', label: 'Bold', icon: 'bold', command: 'bold' },
    italic: {
        name: 'italic',
        label: 'Italic',
        icon: 'italic',
        command: 'italic',
    },
    underline: {
        name: 'underline',
        label: 'Underline',
        icon: 'underline',
        command: 'underline',
    },
    strikethrough: {
        name: 'strikethrough',
        label: 'Strikethrough',
        icon: 'strikethrough',
        command: 'strikethrough',
    },
    superscript: {
        name: 'superscript',
        label: 'Superscript',
        icon: 'superscript',
        command: 'superscript',
    },
    subscript: {
        name: 'subscript',
        label: 'Subscript',
        icon: 'subscript',
        command: 'subscript',
    },
    casechange: {
        name: 'casechange',
        label: 'Change case',
        icon: 'case-change',
    },
    forecolor: {
        name: 'forecolor',
        label: 'Text color',
        icon: 'text-color',
        dialog: 'forecolor',
    },
    backcolor: {
        name: 'backcolor',
        label: 'Background color',
        icon: 'highlight',
        dialog: 'backcolor',
    },
    alignleft: {
        name: 'alignleft',
        label: 'Align left',
        icon: 'align-left',
        command: 'alignleft',
    },
    aligncenter: {
        name: 'aligncenter',
        label: 'Align center',
        icon: 'align-center',
        command: 'aligncenter',
    },
    alignright: {
        name: 'alignright',
        label: 'Align right',
        icon: 'align-right',
        command: 'alignright',
    },
    alignjustify: {
        name: 'alignjustify',
        label: 'Justify',
        icon: 'align-justify',
        command: 'alignjustify',
    },
    bullist: {
        name: 'bullist',
        label: 'Bulleted list',
        icon: 'list',
        command: 'bullist',
    },
    numlist: {
        name: 'numlist',
        label: 'Numbered list',
        icon: 'numbered-list',
        command: 'numlist',
    },
    outdent: {
        name: 'outdent',
        label: 'Decrease indent',
        icon: 'outdent',
        command: 'outdent',
    },
    indent: {
        name: 'indent',
        label: 'Increase indent',
        icon: 'indent',
        command: 'indent',
    },
    link: { name: 'link', label: 'Insert link', icon: 'link', dialog: 'link', plugin: 'link' },
    image: {
        name: 'image',
        label: 'Insert image',
        icon: 'image',
        command: 'imageUpload',
        plugin: 'image',
    },
    media: {
        name: 'media',
        label: 'Insert media',
        icon: 'media',
        dialog: 'media',
        plugin: 'media',
    },
    table: {
        name: 'table',
        label: 'Insert table',
        icon: 'table',
        dialog: 'table',
        plugin: 'table',
    },
    hr: {
        name: 'hr',
        label: 'Horizontal line',
        icon: 'horizontal-rule',
        command: 'hr',
        plugin: 'horizontal-rule',
    },
    removeformat: {
        name: 'removeformat',
        label: 'Clear formatting',
        icon: 'clear-format',
        command: 'removeformat',
    },
    code: { name: 'code', label: 'Source code', icon: 'code', dialog: 'source', plugin: 'code' },
    preview: {
        name: 'preview',
        label: 'Preview',
        icon: 'preview',
        dialog: 'preview',
        plugin: 'preview',
    },
    fullscreen: {
        name: 'fullscreen',
        label: 'Fullscreen',
        icon: 'fullscreen',
        command: 'fullscreen',
        plugin: 'fullscreen',
    },
    more: { name: 'more', label: 'More', icon: 'more' },
};

export function parseToolbar(value: boolean | string | EditorToolbarGroup[]): EditorToolbarGroup[] {
    if (value === false) return [];
    if (Array.isArray(value)) return value.map((group) => ({ ...group, items: [...group.items] }));
    const source = value === true ? DEFAULT_TOOLBAR : value;
    return source
        .split('|')
        .map((part, index) => ({
            name: `group-${index}`,
            items: part
                .trim()
                .split(/\s+/)
                .filter((item): item is EditorToolbarItemName => item in TOOLBAR_ITEMS),
        }))
        .filter((group) => group.items.length > 0);
}

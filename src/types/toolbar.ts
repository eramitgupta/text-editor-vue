export type EditorToolbarItemName =
    | 'undo'
    | 'redo'
    | 'blocks'
    | 'fontfamily'
    | 'fontsize'
    | 'lineheight'
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'superscript'
    | 'subscript'
    | 'casechange'
    | 'forecolor'
    | 'backcolor'
    | 'alignment'
    | 'alignleft'
    | 'aligncenter'
    | 'alignright'
    | 'alignjustify'
    | 'bullist'
    | 'numlist'
    | 'checklist'
    | 'outdent'
    | 'indent'
    | 'link'
    | 'image'
    | 'media'
    | 'table'
    | 'hr'
    | 'removeformat'
    | 'code'
    | 'preview'
    | 'fullscreen'
    | 'more';
export interface EditorToolbarGroup {
    name?: string;
    items: EditorToolbarItemName[];
}
export interface ToolbarItemDefinition {
    name: EditorToolbarItemName;
    label: string;
    icon?: string;
    command?: string;
    dialog?: string;
    select?: 'blocks' | 'fontfamily' | 'fontsize';
    dropdown?: boolean;
    plugin?: string;
}

export type TextAlignmentCommand = 'alignleft' | 'aligncenter' | 'alignright' | 'alignjustify';
export type ListCommand = 'bullist' | 'numlist';

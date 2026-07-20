export type EditorToolbarItemName =
    | 'undo'
    | 'redo'
    | 'blocks'
    | 'fontfamily'
    | 'fontsize'
    | 'bold'
    | 'italic'
    | 'underline'
    | 'strikethrough'
    | 'superscript'
    | 'subscript'
    | 'casechange'
    | 'forecolor'
    | 'backcolor'
    | 'alignleft'
    | 'aligncenter'
    | 'alignright'
    | 'alignjustify'
    | 'bullist'
    | 'numlist'
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
    plugin?: string;
}

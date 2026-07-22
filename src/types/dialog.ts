export type EditorDialogName =
    | 'link'
    | 'media'
    | 'table'
    | 'special-character'
    | 'emoji'
    | 'source'
    | 'preview'
    | 'find-replace'
    | 'shortcuts'
    | 'about'
    | 'word-count'
    | 'table-properties'
    | 'cell-properties'
    | 'templates';
export interface LinkValue {
    url: string;
    text: string;
    title: string;
    target: '_self' | '_blank';
}
export interface MediaValue {
    type: 'video' | 'audio' | 'iframe';
    src: string;
    width: string;
    height: string;
    poster: string;
}

export interface CellPropertiesValue {
    target: 'cell' | 'first-row';
    cellType: 'td' | 'th';
    scope: '' | 'row' | 'col';
    horizontalAlign: '' | 'left' | 'center' | 'right';
    verticalAlign: '' | 'top' | 'middle' | 'bottom';
}

export interface EditorDialogsProps {
    dialog: EditorDialogName | null;
    dialogMode: 'forecolor' | 'backcolor' | null;
    config: ResolvedEditorInit;
    linkInitial: LinkValue;
    html: string;
    previewHtml: string;
    root: HTMLElement | null;
    wordCountData: WordCountData;
    cellPropertiesInitial: CellPropertiesValue;
}

export interface EditorDialogsEmits {
    close: [];
    saveLink: [value: LinkValue];
    unlink: [];
    saveMedia: [value: MediaValue];
    saveTable: [rows: number, columns: number];
    selectCharacter: [value: string];
    saveSource: [value: string];
    changed: [];
    saveTableProperties: [values: Record<string, string>];
    saveCellProperties: [values: CellPropertiesValue];
    selectColor: [color: string];
    insertTemplate: [item: EditorTemplateItem];
}
import type { ResolvedEditorInit } from './config';
import type { WordCountData } from './count';
import type { EditorTemplateItem } from './template';

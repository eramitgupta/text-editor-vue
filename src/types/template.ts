export interface EditorTemplateItem {
    id: string | number;
    label: string;
    content: string;
    group?: string;
    description?: string;
}

export interface EditorTemplatesConfig {
    enabled?: boolean;
    items?: EditorTemplateItem[];
}

export interface ResolvedEditorTemplatesConfig {
    enabled: boolean;
    items: EditorTemplateItem[];
}

export interface TemplateInsertEvent {
    item: EditorTemplateItem;
}

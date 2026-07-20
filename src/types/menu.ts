import type { EditorMenuName, EditorPluginName } from './config';
export interface MenuItemDefinition {
    id: string;
    label: string;
    icon?: string;
    shortcut?: string;
    command?: string;
    value?: string;
    dialog?: string;
    plugin?: EditorPluginName;
    tableOnly?: boolean;
    separator?: boolean;
    children?: MenuItemDefinition[];
}
export interface MenuDefinition {
    name: EditorMenuName;
    label: string;
    icon: string;
    items: MenuItemDefinition[];
}

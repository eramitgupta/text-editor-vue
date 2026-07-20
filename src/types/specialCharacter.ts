export interface SpecialCharacterItem {
    value: string;
    label: string;
}

export interface SpecialCharacterCategory {
    name: string;
    items: SpecialCharacterItem[];
}

export type TextCaseMode = 'lowercase' | 'uppercase' | 'titlecase';

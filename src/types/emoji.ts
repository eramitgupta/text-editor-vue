export type EmojiCategory =
    | 'Smileys & People'
    | 'Animals & Nature'
    | 'Food & Drink'
    | 'Activity'
    | 'Travel & Places'
    | 'Objects'
    | 'Symbols'
    | 'Flags';

export type EmojiCategoryFilter = 'All' | EmojiCategory;

export interface EmojiItem {
    value: string;
    label: string;
    category: EmojiCategory;
}

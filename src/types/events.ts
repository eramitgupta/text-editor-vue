import type { MentionRemoveEvent, MentionSearchEvent, MentionSelectEvent } from './mention';
import type { MergeTagRemoveEvent, MergeTagSelectEvent } from './mergeTag';
import type { TemplateInsertEvent } from './template';
import type { ImageDeleteInfo } from './image';

export interface EditorEmits {
    (event: 'update:modelValue', value: string): void;
    (event: 'click', value: MouseEvent): void;
    (event: 'focus' | 'blur', value: FocusEvent): void;
    (event: 'input', value: InputEvent): void;
    (event: 'change', value: string): void;
    (event: 'keydown', value: KeyboardEvent): void;
    (event: 'paste', value: ClipboardEvent): void;
    (event: 'ready', value: HTMLElement): void;
    (event: 'selection-change', value: Selection): void;
    (event: 'resize', value: { height: number }): void;
    (event: 'mention-search', value: MentionSearchEvent): void;
    (event: 'mention-select', value: MentionSelectEvent): void;
    (event: 'mention-remove', value: MentionRemoveEvent): void;
    (event: 'merge-tag-select', value: MergeTagSelectEvent): void;
    (event: 'merge-tag-remove', value: MergeTagRemoveEvent): void;
    (event: 'template-insert', value: TemplateInsertEvent): void;
    (event: 'image-remove', value: ImageDeleteInfo): void;
}

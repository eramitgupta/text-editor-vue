export type EditorMenuName =
    | 'file'
    | 'edit'
    | 'view'
    | 'insert'
    | 'merge-tags'
    | 'templates'
    | 'format'
    | 'tools'
    | 'table'
    | 'help';
export type EditorPluginName =
    | 'history'
    | 'formatting'
    | 'lists'
    | 'link'
    | 'image'
    | 'media'
    | 'table'
    | 'code'
    | 'preview'
    | 'fullscreen'
    | 'find-replace'
    | 'special-character'
    | 'emoji'
    | 'horizontal-rule'
    | 'anchor'
    | 'merge-tags'
    | 'templates'
    | 'date-time';

export interface FontFamilyOption {
    label: string;
    value: string;
}
export interface FontSizeOption {
    label: string;
    value: string;
}
export interface LineHeightOption {
    label: string;
    value: string;
}
export interface BlockFormatOption {
    label: string;
    value: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'pre' | 'blockquote';
}
export interface DateTimeFormatOption {
    label: string;
    type: 'date' | 'time';
    format?: 'iso-date';
    options?: Intl.DateTimeFormatOptions;
}

import type { ImagesUploadHandler } from './upload';
import type { ImagesDeleteHandler } from './image';
import type { MentionConfig, ResolvedMentionConfig } from './mention';
import type { MergeTagConfig, ResolvedMergeTagConfig } from './mergeTag';
import type { EditorTemplatesConfig, ResolvedEditorTemplatesConfig } from './template';
import type { EditorToolbarGroup } from './toolbar';

export interface EditorInit {
    height?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    width?: number | string;
    placeholder?: string;
    menubar?: boolean | EditorMenuName[];
    toolbar?: boolean | string | EditorToolbarGroup[];
    statusbar?: boolean;
    branding?: boolean;
    promotion?: boolean;
    resize?: boolean;
    readonly?: boolean;
    autofocus?: boolean;
    spellcheck?: boolean;
    direction?: 'ltr' | 'rtl';
    contentStyle?: string;
    contentClass?: string;
    fontFamilyFormats?: FontFamilyOption[];
    fontSizeFormats?: FontSizeOption[];
    lineHeightFormats?: LineHeightOption[];
    blockFormats?: BlockFormatOption[];
    textColors?: string[];
    backgroundColors?: string[];
    plugins?: EditorPluginName[];
    acceptedFormats?: string[];
    maxImageSize?: number;
    uploadFieldName?: string;
    uploadHeaders?: Record<string, string>;
    uploadCredentials?: RequestCredentials;
    imagesUploadUrl?: string;
    imagesUploadHandler?: ImagesUploadHandler;
    imagesDeleteHandler?: ImagesDeleteHandler;
    resolveUploadedImageUrl?: (response: unknown) => string | Promise<string>;
    automaticUploads?: boolean;
    pasteImages?: boolean;
    imageFilePicker?: boolean;
    imageUrlInput?: boolean;
    imageResize?: boolean;
    imageDefaultWidth?: number;
    sanitize?: boolean;
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    relativeUrls?: boolean;
    removeScriptHost?: boolean;
    convertUrls?: boolean;
    dateFormats?: DateTimeFormatOption[];
    timeFormats?: DateTimeFormatOption[];
    tableGridSize?: number;
    helpShortcutText?: string;
    mentions?: boolean | MentionConfig;
    mergeTags?: boolean | MergeTagConfig;
    templates?: boolean | EditorTemplatesConfig;
    content_style?: string;
    font_family_formats?: FontFamilyOption[];
    font_size_formats?: FontSizeOption[];
    line_height_formats?: LineHeightOption[];
    images_upload_url?: string;
    images_upload_handler?: ImagesUploadHandler;
    images_delete_handler?: ImagesDeleteHandler;
    automatic_uploads?: boolean;
    relative_urls?: boolean;
    remove_script_host?: boolean;
    convert_urls?: boolean;
}

export type ResolvedEditorInit = Required<
    Omit<
        EditorInit,
        | 'height'
        | 'maxHeight'
        | 'width'
        | 'imagesUploadUrl'
        | 'imagesUploadHandler'
        | 'imagesDeleteHandler'
        | 'resolveUploadedImageUrl'
        | 'mentions'
        | 'mergeTags'
        | 'templates'
        | 'content_style'
        | 'font_family_formats'
        | 'font_size_formats'
        | 'line_height_formats'
        | 'images_upload_url'
        | 'images_upload_handler'
        | 'images_delete_handler'
        | 'automatic_uploads'
        | 'relative_urls'
        | 'remove_script_host'
        | 'convert_urls'
    >
> &
    Pick<
        EditorInit,
        | 'height'
        | 'maxHeight'
        | 'width'
        | 'imagesUploadUrl'
        | 'imagesUploadHandler'
        | 'imagesDeleteHandler'
        | 'resolveUploadedImageUrl'
    > & {
        mentions: ResolvedMentionConfig;
        mergeTags: ResolvedMergeTagConfig;
        templates: ResolvedEditorTemplatesConfig;
    };

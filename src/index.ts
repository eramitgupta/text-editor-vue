import './styles/editor.css';
import './styles/toolbar.css';
import './styles/menus.css';
import './styles/dialogs.css';
import './styles/mentions.css';
import './styles/image-resize.css';
import './styles/merge-tags.css';
import './styles/templates.css';

export { default as Editor } from './components/Editor.vue';
export { defaultEditorConfig } from './config/defaultConfig';
export { sanitizeHtml } from './utils/sanitizer';
export type {
    EditorEmits,
    EditorInit,
    EditorInstance,
    EditorMenuName,
    EditorPluginName,
    EditorProps,
    EditorToolbarGroup,
    ImageBlobInfo,
    ImagesUploadHandler,
    MentionConfig,
    MentionItem,
    MentionRemoveEvent,
    MentionSearchEvent,
    MentionSelectEvent,
    MergeTagConfig,
    MergeTagItem,
    MergeTagRemoveEvent,
    MergeTagSelectEvent,
    EditorTemplateItem,
    EditorTemplatesConfig,
    TemplateInsertEvent,
} from './types';

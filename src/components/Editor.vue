<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    shallowRef,
    useTemplateRef,
    watch,
} from 'vue';
import { executeAsyncEditorCommand, executeEditorCommand } from '../commands/commandRegistry';
import {
    applyCellProperties,
    applyTableProperties,
    getCellProperties,
    navigateTableCell,
} from '../commands/tableCommands';
import { insertImage, insertLink, insertMedia, insertTable } from '../commands/insertCommands';
import { KEYBOARD_SHORTCUTS } from '../constants/keyboardShortcuts';
import { useEditor } from '../composables/useEditor';
import { useEditorConfig } from '../composables/useEditorConfig';
import { useEditorHistory } from '../composables/useEditorHistory';
import { useEditorResize } from '../composables/useEditorResize';
import { useEditorSelection } from '../composables/useEditorSelection';
import { useEditorUpload } from '../composables/useEditorUpload';
import { useFullscreen } from '../composables/useFullscreen';
import { useImageResize } from '../composables/useImageResize';
import { useTableInteractions } from '../composables/useTableInteractions';
import { useInlineImageUpload } from '../composables/useInlineImageUpload';
import { useLinkInitial } from '../composables/useLinkInitial';
import { useMentions } from '../composables/useMentions';
import { useMergeTags } from '../composables/useMergeTags';
import { useMergeTagSidebar } from '../composables/useMergeTagSidebar';
import { useWordCount } from '../composables/useWordCount';
import type {
    EditorDialogName,
    EditorEmits,
    EditorInstance,
    EditorSlots,
    EditorTemplateItem,
    EditorProps,
    LinkValue,
    MediaValue,
    CellPropertiesValue,
    MenuItemDefinition,
} from '../types';
import { formatDateTime, mergeDateTimeFormats } from '../utils/dateTime';
import { escapeHtml, insertAtSelection } from '../utils/html';
import { cssUnit } from '../utils/units';
import EditorContent from './EditorContent.vue';
import EditorDialogs from './EditorDialogs.vue';
import EditorMenuBar from './EditorMenuBar.vue';
import EditorStatusBar from './EditorStatusBar.vue';
import EditorToolbar from './EditorToolbar.vue';
import MentionDropdown from './mentions/MentionDropdown.vue';
import MentionHoverCard from './mentions/MentionHoverCard.vue';
import MergeTagDropdown from './merge-tags/MergeTagDropdown.vue';
import MergeTagSidebar from './merge-tags/MergeTagSidebar.vue';
import ImageResizeOverlay from './images/ImageResizeOverlay.vue';
import InlineImageUploadPortal from './images/InlineImageUploadPortal.vue';
import TableContextMenu, { type TableContextAction } from './tables/TableContextMenu.vue';
import TableInteractionOverlay from './tables/TableInteractionOverlay.vue';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<EditorProps>(), {
    modelValue: '',
    disabled: false,
    readonly: false,
    ariaLabel: 'Rich text editor',
});
const emit = defineEmits<EditorEmits>();
defineSlots<EditorSlots>();
const config = useEditorConfig(() => props.init);
const editor = useEditor(config, props.modelValue);
const history = useEditorHistory(editor.root);
const selection = useEditorSelection(editor.root);
const shell = useTemplateRef<HTMLElement>('shell');
const contentWrap = useTemplateRef<HTMLElement>('contentWrap');
const dialog = shallowRef<EditorDialogName | null>(null);
const dialogMode = shallowRef<'forecolor' | 'backcolor' | null>(null);
const lastCommitted = shallowRef(props.modelValue);
const lastPublished = shallowRef(props.modelValue);
const { toggle: toggleFullscreen } = useFullscreen(shell);
const { upload: uploadImage, cancel: cancelImageUpload } = useEditorUpload(config);
const locked = computed(() => props.disabled || props.readonly || config.value.readonly);
const inlineImageUpload = useInlineImageUpload(editor.root, config, locked, syncInput);
const editorResize = useEditorResize(shell, config, locked, (height) => emit('resize', { height }));
const imageResizeLocked = computed(() => locked.value || !config.value.imageResize);
const imageResize = useImageResize(
    editor.root,
    contentWrap,
    imageResizeLocked,
    syncInput,
    (image) => emit('image-remove', image),
);
const tableInteractions = useTableInteractions(editor.root, contentWrap, locked, syncInput);
const menubar = computed(() => config.value.menubar);
const toolbar = computed(() => config.value.toolbar);
const statusbar = computed(() => config.value.statusbar);
const mentionConfig = computed(() => config.value.mentions);
const mergeTagConfig = computed(() => config.value.mergeTags);
const mentions = useMentions(
    { root: editor.root, config: mentionConfig, locked },
    {
        search: (event) => emit('mention-search', event),
        select: (event) => emit('mention-select', event),
        remove: (event) => emit('mention-remove', event),
        change: () => syncInput(),
    },
);
const mergeTags = useMergeTags(
    { root: editor.root, config: mergeTagConfig, locked },
    {
        select: (event) => emit('merge-tag-select', event),
        remove: (event) => emit('merge-tag-remove', event),
        change: () => syncInput(),
    },
);
const mergeTagSidebar = useMergeTagSidebar(
    { config: mergeTagConfig, disabled: computed(() => props.disabled), locked },
    {
        restoreSelection: selection.restore,
        saveSelection: selection.save,
        insert: mergeTags.insert,
    },
);
const availableCommands = computed<Record<string, boolean>>(() => ({
    undo: history.canUndo.value,
    redo: history.canRedo.value,
}));
const activeCommands = computed<Record<string, boolean>>(() => ({
    ...selection.state.value.commands,
    ...(imageResize.box.value ? imageResize.activeCommands.value : {}),
}));
const wordCountData = useWordCount(editor.root, selection.savedRange);
const cellPropertiesInitial = computed(() =>
    getCellProperties(editor.root.value, selection.savedRange.value),
);
const shellStyle = computed(() => ({
    width: cssUnit(config.value.width),
    minHeight: cssUnit(config.value.minHeight),
    maxHeight: cssUnit(config.value.maxHeight),
    '--erag-editor-height': cssUnit(editorResize.currentHeight.value ?? config.value.height),
}));
const { initial: linkInitial, getSelectedAnchor } = useLinkInitial(
    editor.root,
    selection.savedRange,
);

watch(
    () => props.modelValue,
    (value) => {
        lastPublished.value = value;
        if (value !== editor.sync()) {
            inlineImageUpload.discard();
            editor.setHtml(value, true);
            history.reset();
        }
    },
);
watch(
    config,
    (value) => {
        if (editor.root.value) {
            editor.root.value.setAttribute('dir', value.direction);
            editor.updateCounts();
        }
        editorResize.reset();
    },
    { deep: true },
);

function ready(root: HTMLElement): void {
    editor.connect(root);
    selection.update();
    history.update();
    emit('ready', root);
    if (config.value.autofocus && !locked.value) nextTick(() => root.focus());
}
function syncInput(event?: InputEvent): void {
    const value = editor.sync();
    if (value !== lastPublished.value) {
        lastPublished.value = value;
        emit('update:modelValue', value);
    }
    if (event) emit('input', event);
    selection.update();
    history.update();
    imageResize.refresh();
}
function handleInput(event: InputEvent): void {
    syncInput(event);
    mentions.handleInput();
    mergeTags.handleInput();
}
function restoreAndRun(id: string, value?: string): void {
    if (locked.value || !editor.root.value) return;
    if (id === 'saveSelection') {
        selection.save();
        return;
    }
    if (id === 'backcolor' && tableInteractions.applyCellBackground(value ?? 'transparent')) return;
    if (imageResize.executeCommand(id)) return;
    selection.restore();
    if (id === 'imageUpload') {
        void inlineImageUpload.open();
        return;
    }
    if (inlineImageUpload.isOpen.value) {
        void inlineImageUpload.close().then(() => restoreAndRun(id, value));
        return;
    }
    if (id === 'insertMergeTag') {
        const item = config.value.mergeTags.items.find((entry) => entry.value === value);
        if (item) mergeTags.insert(item);
        return;
    }
    if (id === 'fullscreen') {
        void toggleFullscreen();
        return;
    }
    if (id === 'new') {
        setHtml('');
        history.reset();
        return;
    }
    if (id === 'dateTime') {
        const formats = mergeDateTimeFormats(config.value.dateFormats, config.value.timeFormats);
        const format = formats[Number.parseInt(value ?? '0', 10)];
        if (format) insertText(formatDateTime(format, new Date()));
        return;
    }
    if (id === 'wordCount') {
        dialog.value = 'word-count';
        return;
    }
    if (['cut', 'copy', 'paste', 'pasteText'].includes(id)) {
        void executeAsyncEditorCommand(editor.root.value, id).then(() => syncInput());
        return;
    }
    if (executeEditorCommand(editor.root.value, id, value)) syncInput();
}
function openDialog(name: string): void {
    if (locked.value && !['preview', 'source', 'shortcuts', 'about'].includes(name)) return;
    if (inlineImageUpload.isOpen.value) {
        void inlineImageUpload.close().then(() => openDialog(name));
        return;
    }
    selection.save();
    if (name === 'forecolor' || name === 'backcolor') {
        dialogMode.value = name;
        return;
    }
    dialog.value = name as EditorDialogName;
}
function handleMenu(item: MenuItemDefinition): void {
    if (item.dialog) openDialog(item.dialog);
    else if (item.command) restoreAndRun(item.command, item.value);
}
function closeDialog(): void {
    dialog.value = null;
    dialogMode.value = null;
    nextTick(() => selection.restore());
}
function saveLink(value: LinkValue): void {
    if (!editor.root.value) return;
    selection.restore();
    const anchor = getSelectedAnchor();
    if (anchor) {
        anchor.href = value.url;
        anchor.textContent = value.text || value.url;
        anchor.title = value.title;
        if (value.target === '_blank') {
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
        } else {
            anchor.removeAttribute('target');
            anchor.removeAttribute('rel');
        }
    } else insertLink(editor.root.value, value, config.value.relativeUrls);
    syncInput();
    closeDialog();
}
function unlink(): void {
    selection.restore();
    document.execCommand('unlink', false);
    syncInput();
    closeDialog();
}
function saveMedia(value: MediaValue): void {
    if (editor.root.value) {
        selection.restore();
        insertMedia(editor.root.value, value, config.value.relativeUrls);
        syncInput();
    }
    closeDialog();
}
function saveTable(rows: number, columns: number): void {
    if (editor.root.value) {
        selection.restore();
        insertTable(editor.root.value, rows, columns);
        syncInput();
    }
    closeDialog();
}
function saveSource(value: string): void {
    editor.setHtml(editor.clean(value), false);
    syncInput();
    closeDialog();
}
function saveTableProperties(values: Record<string, string>): void {
    if (editor.root.value) {
        selection.restore();
        const appliedBackgroundToCells = tableInteractions.applyCellBackground(
            values.backgroundColor ?? '',
            false,
        );
        applyTableProperties(editor.root.value, {
            ...values,
            backgroundColor: appliedBackgroundToCells ? '' : (values.backgroundColor ?? ''),
        });
        syncInput();
    }
    closeDialog();
}
function saveCellProperties(values: CellPropertiesValue): void {
    if (editor.root.value) {
        applyCellProperties(editor.root.value, selection.savedRange.value, values);
        syncInput();
    }
    closeDialog();
}
function insertCharacter(value: string): void {
    insertText(value);
    closeDialog();
}
function insertTemplate(item: EditorTemplateItem): void {
    if (!editor.root.value || locked.value) return;
    selection.restore();
    insertAtSelection(editor.root.value, editor.clean(item.content));
    syncInput();
    emit('template-insert', { item: { ...item } });
    closeDialog();
}
function applyDialogColor(color: string): void {
    if (dialogMode.value)
        restoreAndRun(
            dialogMode.value,
            color || (dialogMode.value === 'forecolor' ? '#000000' : 'transparent'),
        );
    closeDialog();
}
function commandShortcut(event: KeyboardEvent): boolean {
    const prefix = event.metaKey || event.ctrlKey ? 'mod+' : '';
    const shift = event.shiftKey ? 'shift+' : '';
    const key = `${prefix}${shift}${event.key.toLowerCase()}`;
    const command = KEYBOARD_SHORTCUTS[key];
    if (!command) return false;
    event.preventDefault();
    command.includes('-') ? openDialog(command) : restoreAndRun(command);
    return true;
}
function handleKeydown(event: KeyboardEvent): void {
    emit('keydown', event);
    if (
        locked.value ||
        mentions.handleKeydown(event) ||
        mergeTags.handleKeydown(event) ||
        mentions.handleRemoval(event) ||
        mergeTags.handleRemoval(event)
    )
        return;
    if (commandShortcut(event)) return;
    if (event.altKey && event.key === '0') {
        event.preventDefault();
        openDialog('shortcuts');
    }
    if (
        event.key === 'Tab' &&
        editor.root.value &&
        navigateTableCell(editor.root.value, event.shiftKey)
    )
        event.preventDefault();
}
async function handlePaste(event: ClipboardEvent): Promise<void> {
    emit('paste', event);
    if (locked.value || !editor.root.value) {
        event.preventDefault();
        return;
    }
    const image = [...(event.clipboardData?.files ?? [])].find((file) =>
        file.type.startsWith('image/'),
    );
    if (image && config.value.pasteImages && config.value.automaticUploads) {
        event.preventDefault();
        selection.save();
        try {
            const url = await uploadImage(image);
            selection.restore();
            insertImage(
                editor.root.value,
                { src: url, alt: image.name, width: '', height: '' },
                config.value.relativeUrls,
                config.value.imageDefaultWidth,
            );
            syncInput();
            mentions.handleInput();
            mergeTags.handleInput();
        } catch {
            return;
        } finally {
            cancelImageUpload();
        }
        return;
    }
    const html = event.clipboardData?.getData('text/html');
    const text = event.clipboardData?.getData('text/plain') ?? '';
    event.preventDefault();
    selection.restore();
    insertAtSelection(
        editor.root.value,
        html ? editor.clean(html) : escapeHtml(text).replaceAll('\n', '<br>'),
    );
    syncInput();
    mentions.handleInput();
    mergeTags.handleInput();
}
function selectionChanged(): void {
    selection.update();
    mentions.handleSelectionChange();
    mergeTags.handleSelectionChange();
    const current = window.getSelection();
    if (current) emit('selection-change', current);
}
function handleBlur(event: FocusEvent): void {
    emit('blur', event);
    const value = editor.sync();
    if (value !== lastCommitted.value) {
        lastCommitted.value = value;
        emit('change', value);
    }
}
function handleEditorClick(event: MouseEvent): void {
    imageResize.selectFromEvent(event);
    emit('click', event);
}
function handleTableContextAction(action: TableContextAction): void {
    tableInteractions.restoreSelection();
    selection.save();
    tableInteractions.closeContextMenu();
    if (action === 'cell-properties' || action === 'table-properties') {
        openDialog(action);
        return;
    }
    if (action === 'mergeCells' && tableInteractions.mergeSelectedCells()) return;
    restoreAndRun(action);
    nextTick(() => tableInteractions.refresh());
}
function focus(): void {
    editor.root.value?.focus();
}
function blur(): void {
    editor.root.value?.blur();
}
function getHtml(): string {
    return editor.sync();
}
function setHtml(value: string): void {
    inlineImageUpload.discard();
    editor.setHtml(value, false);
    syncInput();
}
function getText(): string {
    return editor.getText();
}
function clear(): void {
    setHtml('');
}
function insertHtml(value: string): void {
    if (!editor.root.value || locked.value) return;
    selection.restore();
    insertAtSelection(editor.root.value, editor.clean(value));
    syncInput();
}
function insertText(value: string): void {
    insertHtml(escapeHtml(value));
}
function selectAll(): void {
    focus();
    document.execCommand('selectAll', false);
    selection.update();
}
function undo(): void {
    restoreAndRun('undo');
}
function redo(): void {
    restoreAndRun('redo');
}
function openSourceCode(): void {
    openDialog('source');
}
function openPreview(): void {
    openDialog('preview');
}
defineExpose<EditorInstance>({
    focus,
    blur,
    getHtml,
    setHtml,
    getText,
    clear,
    insertHtml,
    insertText,
    selectAll,
    undo,
    redo,
    openSourceCode,
    openPreview,
    getRootElement: () => editor.root.value,
});
onMounted(() => document.addEventListener('selectionchange', selectionChanged));
onBeforeUnmount(() => document.removeEventListener('selectionchange', selectionChanged));
</script>

<template>
    <div
        ref="shell"
        class="erag-editor"
        :class="{
            'erag-is-disabled': props.disabled,
            'erag-is-readonly': locked && !props.disabled,
            'erag-editor--toolbar-first': !menubar && Boolean(toolbar),
        }"
        :style="shellStyle"
    >
        <input
            v-if="name"
            type="hidden"
            :name="name"
            :value="editor.html.value"
        />
        <EditorMenuBar
            v-if="menubar"
            :menus="menubar === true ? true : menubar"
            :plugins="config.plugins"
            :disabled="props.disabled"
            :active-commands="activeCommands"
            :available-commands="availableCommands"
            :inside-table="selection.state.value.insideTable"
            :line-height-formats="config.lineHeightFormats"
            :date-formats="config.dateFormats"
            :time-formats="config.timeFormats"
            :merge-tags="config.mergeTags"
            :templates="config.templates"
            :merge-tag-sidebar-open="mergeTagSidebar.isOpen.value"
            :template-dialog-open="dialog === 'templates'"
            @opening="mergeTagSidebar.handleMenubarOpening"
            @merge-tag-toggle="mergeTagSidebar.toggle"
            @templates-open="openDialog('templates')"
            @select="handleMenu"
            ><template
                v-if="$slots['menubar-end']"
                #end
                ><slot name="menubar-end" /></template
        ></EditorMenuBar>
        <EditorToolbar
            v-if="toolbar"
            :toolbar="toolbar"
            :config="config"
            :disabled="props.disabled"
            :active-commands="activeCommands"
            :available-commands="availableCommands"
            :inside-table="selection.state.value.insideTable"
            @command="restoreAndRun"
            @dialog="openDialog"
            ><template
                v-if="$slots['toolbar-start']"
                #start
                ><slot name="toolbar-start" /></template
            ><template
                v-if="$slots['toolbar-end']"
                #end
                ><slot name="toolbar-end" /></template
        ></EditorToolbar>
        <div
            ref="contentWrap"
            class="erag-editor__content-wrap"
        >
            <EditorContent
                :id="props.id"
                :html="editor.html.value"
                :disabled="props.disabled"
                :readonly="locked"
                :placeholder="config.placeholder"
                :spellcheck="config.spellcheck"
                :direction="config.direction"
                :content-class="config.contentClass"
                :content-style="config.contentStyle"
                :label="props.ariaLabel"
                @ready="ready"
                @click="handleEditorClick"
                @focus="emit('focus', $event)"
                @blur="handleBlur"
                @input="handleInput"
                @keydown="handleKeydown"
                @paste="handlePaste"
                @selectionchange="selectionChanged"
            />
            <ImageResizeOverlay
                v-if="imageResize.box.value"
                :box="imageResize.box.value"
                :deleting="imageResize.deleting.value"
                :delete-error="imageResize.deleteError.value"
                :delete-from-server="Boolean(config.imagesDeleteHandler)"
                @resize-start="imageResize.resizeStart"
                @delete="imageResize.deleteSelected(config.imagesDeleteHandler)"
            />
            <TableInteractionOverlay
                v-if="tableInteractions.tableBox.value"
                :table-box="tableInteractions.tableBox.value"
                :cell-boxes="tableInteractions.cellBoxes.value"
                @resize-start="tableInteractions.resizeStart"
            />
            <div
                v-if="editor.empty.value && !inlineImageUpload.isOpen.value && $slots.empty"
                class="erag-editor__empty"
            >
                <slot name="empty" />
            </div>
            <Transition name="erag-merge-tag-sidebar">
                <MergeTagSidebar
                    v-if="mergeTagSidebar.isOpen.value"
                    :id="mergeTagSidebar.id"
                    :items="config.mergeTags.items"
                    :disabled="locked"
                    @close="mergeTagSidebar.close"
                    @select="mergeTagSidebar.select"
                />
            </Transition>
        </div>
        <TableContextMenu
            v-if="tableInteractions.contextMenu.value"
            :position="tableInteractions.contextMenu.value"
            :multiple-cells="tableInteractions.hasMultipleCells.value"
            @select="handleTableContextAction"
        />
        <InlineImageUploadPortal
            :target="inlineImageUpload.target.value"
            :config="config"
            :state="inlineImageUpload.state"
            :error="inlineImageUpload.message.value"
            @file="inlineImageUpload.uploadFile"
            @insert-url="inlineImageUpload.insertUrl"
            @close="inlineImageUpload.close"
        />
        <EditorStatusBar
            v-if="statusbar"
            :path="selection.state.value.path"
            :counts="editor.counts.value"
            :resize="config.resize"
            :help-text="config.helpShortcutText"
            :disabled="props.disabled"
            @resize-start="editorResize.start"
            ><template
                v-if="$slots['statusbar-start']"
                #start
                ><slot name="statusbar-start" /></template
            ><template
                v-if="$slots['statusbar-end']"
                #end
                ><slot name="statusbar-end" /></template
        ></EditorStatusBar>
        <MentionDropdown
            v-if="mentions.isOpen.value"
            :items="mentions.items.value"
            :active-index="mentions.activeIndex.value"
            :state="mentions.state.value"
            :query="mentions.query.value"
            :position-style="mentions.positionStyle.value"
            @activate="mentions.setActiveIndex"
            @select="mentions.select"
            @retry="mentions.retry"
            @ready="mentions.setDropdownElement"
        >
            <template
                v-if="$slots['mention-item']"
                #item="slotProps"
            >
                <slot
                    name="mention-item"
                    v-bind="slotProps"
                />
            </template>
            <template
                v-if="$slots['mention-loading']"
                #loading="slotProps"
            >
                <slot
                    name="mention-loading"
                    v-bind="slotProps"
                />
            </template>
            <template
                v-if="$slots['mention-empty']"
                #empty="slotProps"
            >
                <slot
                    name="mention-empty"
                    v-bind="slotProps"
                />
            </template>
            <template
                v-if="$slots['mention-error']"
                #error="slotProps"
            >
                <slot
                    name="mention-error"
                    v-bind="slotProps"
                />
            </template>
        </MentionDropdown>
        <MergeTagDropdown
            v-if="mergeTags.isOpen.value"
            :items="mergeTags.items.value"
            :active-index="mergeTags.activeIndex.value"
            :query="mergeTags.query.value"
            :position-style="mergeTags.positionStyle.value"
            @activate="mergeTags.setActiveIndex"
            @select="mergeTags.select"
            @ready="mergeTags.setDropdownElement"
        />
        <MentionHoverCard
            v-if="mentions.hoverItem.value"
            :item="mentions.hoverItem.value"
            :position-style="mentions.hoverPositionStyle.value"
            @ready="mentions.setHoverCardElement"
        />
    </div>
    <EditorDialogs
        :dialog="dialog"
        :dialog-mode="dialogMode"
        :config="config"
        :link-initial="linkInitial"
        :html="editor.html.value"
        :preview-html="editor.clean(editor.html.value)"
        :root="editor.root.value"
        :word-count-data="wordCountData"
        :cell-properties-initial="cellPropertiesInitial"
        @close="closeDialog"
        @save-link="saveLink"
        @unlink="unlink"
        @save-media="saveMedia"
        @save-table="saveTable"
        @select-character="insertCharacter"
        @save-source="saveSource"
        @changed="syncInput"
        @save-table-properties="saveTableProperties"
        @save-cell-properties="saveCellProperties"
        @select-color="applyDialogColor"
        @insert-template="insertTemplate"
    />
</template>

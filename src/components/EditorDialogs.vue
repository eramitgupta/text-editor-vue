<script setup lang="ts">
import type { EditorDialogsEmits, EditorDialogsProps } from '../types';
import ColorDialog from './dialogs/ColorDialog.vue';
import EmojiDialog from './dialogs/EmojiDialog.vue';
import FindReplaceDialog from './dialogs/FindReplaceDialog.vue';
import ImageDialog from './dialogs/ImageDialog.vue';
import InfoDialog from './dialogs/InfoDialog.vue';
import LinkDialog from './dialogs/LinkDialog.vue';
import MediaDialog from './dialogs/MediaDialog.vue';
import PreviewDialog from './dialogs/PreviewDialog.vue';
import SourceDialog from './dialogs/SourceDialog.vue';
import SpecialCharacterDialog from './dialogs/SpecialCharacterDialog.vue';
import TableDialog from './dialogs/TableDialog.vue';
import TablePropertiesDialog from './dialogs/TablePropertiesDialog.vue';
import TemplateDialog from './dialogs/TemplateDialog.vue';
import WordCountDialog from './dialogs/WordCountDialog.vue';

defineProps<EditorDialogsProps>();
defineEmits<EditorDialogsEmits>();
</script>

<template>
    <LinkDialog
        v-if="dialog === 'link'"
        :initial="linkInitial"
        :allow-relative="config.relativeUrls"
        :can-unlink="Boolean(linkInitial.url)"
        @close="$emit('close')"
        @save="$emit('saveLink', $event)"
        @unlink="$emit('unlink')"
    />
    <ImageDialog
        v-if="dialog === 'image'"
        :config="config"
        @close="$emit('close')"
        @save="$emit('saveImage', $event)"
    />
    <MediaDialog
        v-if="dialog === 'media'"
        :allow-relative="config.relativeUrls"
        @close="$emit('close')"
        @save="$emit('saveMedia', $event)"
    />
    <TableDialog
        v-if="dialog === 'table'"
        :size="config.tableGridSize"
        @close="$emit('close')"
        @save="(rows, columns) => $emit('saveTable', rows, columns)"
    />
    <SpecialCharacterDialog
        v-if="dialog === 'special-character'"
        @close="$emit('close')"
        @select="$emit('selectCharacter', $event)"
    />
    <EmojiDialog
        v-if="dialog === 'emoji'"
        @close="$emit('close')"
        @select="$emit('selectCharacter', $event)"
    />
    <SourceDialog
        v-if="dialog === 'source'"
        :html="html"
        @close="$emit('close')"
        @save="$emit('saveSource', $event)"
    />
    <PreviewDialog
        v-if="dialog === 'preview'"
        :html="previewHtml"
        :content-style="config.contentStyle"
        @close="$emit('close')"
    />
    <FindReplaceDialog
        v-if="dialog === 'find-replace' && root"
        :root="root"
        @close="$emit('close')"
        @changed="$emit('changed')"
    />
    <InfoDialog
        v-if="dialog === 'shortcuts' || dialog === 'about'"
        :kind="dialog"
        @close="$emit('close')"
    />
    <WordCountDialog
        v-if="dialog === 'word-count'"
        :counts="wordCountData"
        @close="$emit('close')"
    />
    <TablePropertiesDialog
        v-if="dialog === 'table-properties'"
        @close="$emit('close')"
        @save="$emit('saveTableProperties', $event)"
    />
    <TemplateDialog
        v-if="dialog === 'templates'"
        :templates="config.templates"
        :config="config"
        @close="$emit('close')"
        @insert="$emit('insertTemplate', $event)"
    />
    <ColorDialog
        v-if="dialogMode"
        :mode="dialogMode"
        :colors="dialogMode === 'forecolor' ? config.textColors : config.backgroundColors"
        @close="$emit('close')"
        @select="$emit('selectColor', $event)"
    />
</template>

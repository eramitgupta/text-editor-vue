<script setup lang="ts">
import { EDITOR_VERSION } from '../../constants/packageInfo';
import EditorIcon from '../icons/EditorIcon.vue';
import BaseDialog from './BaseDialog.vue';
defineProps<{ kind: 'shortcuts' | 'about' }>();
defineEmits<{ close: [] }>();
</script>
<template>
    <BaseDialog
        :title="kind === 'about' ? 'About' : 'Keyboard shortcuts'"
        :footer-divider="false"
        @close="$emit('close')"
        ><div
            v-if="kind === 'about'"
            class="erag-info"
        >
            <div class="erag-info__product">
                <h3 class="erag-info__heading">@erag/text-editor-vue</h3>
                <span class="erag-info__version">v{{ EDITOR_VERSION }}</span>
            </div>
            <p class="erag-info__description">
                A dependency-free Vue 3 rich text editor built with native browser APIs,
                flexible configuration, and full TypeScript support.
            </p>
            <p class="erag-info__author">Created and maintained by Er Amit Gupta.</p>
            <div class="erag-info__links">
                <a
                    class="erag-info__link"
                    href="https://github.com/eramitgupta/text-editor-vue"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <EditorIcon
                        class="erag-info__link-icon"
                        name="github"
                        :size="20"
                    />
                    <span class="erag-info__link-content">
                        <strong class="erag-info__link-label">GitHub repository</strong>
                        <span class="erag-info__link-url">github.com/eramitgupta/text-editor-vue</span>
                    </span>
                </a>
                <a
                    class="erag-info__link"
                    href="https://erag.in/text-editor-vue"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <EditorIcon
                        class="erag-info__link-icon"
                        name="documentation"
                        :size="20"
                    />
                    <span class="erag-info__link-content">
                        <strong class="erag-info__link-label">Documentation</strong>
                        <span class="erag-info__link-url">erag.in/text-editor-vue</span>
                    </span>
                </a>
            </div>
        </div>
        <dl
            v-else
            class="erag-shortcuts"
        >
            <template
                v-for="entry in [
                    ['Bold', 'Ctrl/⌘ B'],
                    ['Italic', 'Ctrl/⌘ I'],
                    ['Underline', 'Ctrl/⌘ U'],
                    ['Undo', 'Ctrl/⌘ Z'],
                    ['Redo', 'Ctrl/⌘ Shift Z'],
                    ['Link', 'Ctrl/⌘ K'],
                    ['Find', 'Ctrl/⌘ F'],
                    ['Help', 'Alt 0'],
                ]"
                :key="entry[0]"
                ><dt>{{ entry[0] }}</dt>
                <dd>{{ entry[1] }}</dd></template
            >
        </dl>
        <template #footer
            ><button
                type="button"
                class="erag-button erag-button--primary"
                @click="$emit('close')"
            >
                Close
            </button></template
        ></BaseDialog
    >
</template>

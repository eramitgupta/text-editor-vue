# @erag/text-editor-vue

A dependency-free, accessible rich text editor for Vue 3. It uses native browser editing, Selection, Range, Clipboard, Fullscreen, Fetch, DOMParser, and TreeWalker APIs. Vue is the only peer dependency.

## Installation

```bash
npm install @erag/text-editor-vue
```

Import the package stylesheet once in your application:

```ts
import '@erag/text-editor-vue/style.css';
```

## Default editor

Omitting `init` enables the complete editor configuration.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Editor } from '@erag/text-editor-vue';
import '@erag/text-editor-vue/style.css';

const content = ref('');
</script>

<template>
    <Editor v-model="content" />
</template>
```

The equivalent explicit model-value contract is:

```vue
<Editor
    :model-value="content"
    :init="editorConfig"
    :disabled="disabled"
    @update:model-value="content = $event"
    @click="handleClick"
/>
```

## Full configuration

```ts
import { computed, ref } from 'vue';
import type { EditorInit } from '@erag/text-editor-vue';

const content = ref('');
const editorConfig = computed<EditorInit>(() => ({
    height: 420,
    minHeight: 240,
    maxHeight: 800,
    placeholder: 'Write something...',
    menubar: true,
    toolbar:
        'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
        'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | link image media table | hr removeformat | ' +
        'code preview fullscreen',
    statusbar: true,
    resize: true,
    imageResize: true,
    imageDefaultWidth: 640,
    spellcheck: true,
    direction: 'ltr',
    plugins: [
        'history',
        'formatting',
        'lists',
        'link',
        'image',
        'media',
        'table',
        'code',
        'preview',
        'fullscreen',
        'find-replace',
        'special-character',
        'horizontal-rule',
        'anchor',
        'date-time',
    ],
}));
```

Common underscore aliases including `content_style`, `font_family_formats`, `images_upload_url`, `automatic_uploads`, and `relative_urls` are normalized centrally. Camel case is the primary API.

## Examples

### Minimal toolbar

```vue
<Editor
    v-model="content"
    :init="{ toolbar: 'bold italic | bullist numlist | link', menubar: false, statusbar: false }"
/>
```

Bulleted and numbered lists include package-scoped marker and indentation styles, so application
CSS resets such as Tailwind Preflight do not hide list markers inside the editor or preview.

The complete toolbar also includes superscript, subscript, and a Change Case menu. These controls
can be requested explicitly with `superscript`, `subscript`, and `casechange`:

```vue
<Editor v-model="content" :init="{ toolbar: 'bold italic | superscript subscript casechange' }" />
```

Insert → Special character provides searchable Currency, Text, Quotations, Mathematical,
Extended Latin, Symbols, Arrows, and Greek categories.

### Menubar configuration

```vue
<Editor v-model="content" :init="{ menubar: ['file', 'edit', 'insert', 'format'] }" />
```

Disable it with `:init="{ menubar: false }"`. Explicit toolbar, menubar, and plugin arrays are honored without adding excluded controls.

File → Print opens the browser print dialog for the sanitized editor content only. Consumer page
navigation, editor chrome, toolbars, menus, dialogs, and status bars are excluded.

### Disabled and readonly

```vue
<Editor v-model="content" disabled />
<Editor v-model="content" readonly />
```

Disabled mode blocks editing and all actions. Readonly mode preserves viewing, preview, source inspection, and selection while preventing content changes.

### Reactive configuration

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { Editor, type EditorInit } from '@erag/text-editor-vue';

const compact = ref(false);
const content = ref('');
const init = computed<EditorInit>(() => ({
    height: compact.value ? 260 : 500,
    menubar: !compact.value,
    toolbar: compact.value ? 'bold italic link' : true,
}));
</script>

<template>
    <Editor
        v-model="content"
        :init="init"
    />
</template>
```

### Programmatic access

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Editor, type EditorInstance } from '@erag/text-editor-vue';

const editor = useTemplateRef<EditorInstance>('editor');

function addGreeting() {
    editor.value?.focus();
    editor.value?.insertHtml('<strong>Hello</strong> ');
}
</script>

<template>
    <Editor ref="editor" /><button
        type="button"
        @click="addGreeting"
    >
        Insert greeting
    </button>
</template>
```

## Mentions

Mentions are disabled by default. Enable the fixed `@` trigger with `mentions: true`, or provide a mention configuration with `enabled: true`. The trigger cannot be changed.

### Static mention items

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Editor, type EditorInit, type MentionItem } from '@erag/text-editor-vue';

const content = ref('');
const mentionItems: MentionItem[] = [
    {
        id: 1,
        label: 'Damon Cross',
        description: 'Senior Backend Developer',
        avatar: '/avatars/damon.jpg',
        value: 'damon@example.com',
    },
    {
        id: 2,
        label: 'Daniel Long',
        description: 'Operations Manager',
        avatar: '/avatars/daniel.jpg',
        value: 'daniel@example.com',
    },
    {
        id: 3,
        label: 'Dante Romano',
        description: 'Talent Acquisition Specialist',
    },
];
const editorConfig: EditorInit = {
    mentions: {
        enabled: true,
        minimumCharacters: 0,
        debounce: 200,
        limit: 8,
        items: mentionItems,
    },
};
</script>

<template>
    <Editor
        v-model="content"
        :init="editorConfig"
    />
</template>
```

Static items are filtered case-insensitively by `label`, `description`, and `value`. Starts-with matches appear before contains matches.

### Async mentions with Fetch

```ts
import type { EditorInit, MentionItem } from '@erag/text-editor-vue';

interface UserResponse {
    id: number;
    name: string;
    designation?: string;
    avatar?: string;
    email?: string;
}

const editorConfig: EditorInit = {
    mentions: {
        enabled: true,
        minimumCharacters: 0,
        debounce: 200,
        limit: 8,
        items: async (query: string, signal: AbortSignal): Promise<MentionItem[]> => {
            const response = await fetch(`/api/users?search=${encodeURIComponent(query)}`, {
                signal,
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error('Unable to load mentions.');
            const users = (await response.json()) as UserResponse[];
            return users.map((user) => ({
                id: user.id,
                label: user.name,
                description: user.designation,
                avatar: user.avatar,
                value: user.email,
            }));
        },
    },
};
```

The editor debounces searches, passes an `AbortSignal`, aborts outdated requests, ignores stale responses, caches identical queries for the current editor session, and limits displayed results. Typing `@`, `@d`, or `@damon` searches for `''`, `'d'`, or `'damon'`. Mentions do not activate in email addresses, URL paths, links, inline code, code blocks, existing mentions, or non-editable content. A whitespace boundary closes the dropdown.

### Mention configuration

| Option              | Default                                  | Description                                                         |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `enabled`           | `true` inside an explicit mention object | Enables the feature; an omitted `mentions` option remains disabled. |
| `minimumCharacters` | `0`                                      | Characters required after `@` before searching.                     |
| `debounce`          | `200`                                    | Search delay in milliseconds.                                       |
| `limit`             | `8`                                      | Maximum displayed results.                                          |
| `items`             | none                                     | Static `MentionItem[]` or an async/synchronous query function.      |

### Mention events

```vue
<Editor
    v-model="content"
    :init="editorConfig"
    @mention-search="handleMentionSearch"
    @mention-select="handleMentionSelect"
    @mention-remove="handleMentionRemove"
/>
```

- `mention-search` receives `{ query }` when a debounced search begins.
- `mention-select` receives `{ item, query }` after insertion.
- `mention-remove` receives `{ item }` when Backspace or Delete removes a complete mention.

### Mention slots

```vue
<Editor v-model="content" :init="editorConfig">
    <template #mention-item="{ item, active }">
        <div>{{ active ? '→' : '' }} {{ item.label }}</div>
    </template>
    <template #mention-loading="{ query }">Loading {{ query }}…</template>
    <template #mention-empty="{ query }">No result for {{ query }}</template>
    <template #mention-error="{ query, retry }">
        <span>Unable to load {{ query }}</span>
        <button
            type="button"
            @click="retry"
        >
            Retry
        </button>
    </template>
</Editor>
```

The editor supplies a complete accessible default UI when these slots are omitted. Arrow Up/Down wraps through results, Home/End moves to the first/last result, Enter or Tab inserts the active result, and Escape closes the dropdown.

### Mention HTML and styling

Inserted mentions are non-editable inline elements followed by one normal space:

```html
<span
    class="erag-mention"
    data-erag-mention="true"
    data-erag-mention-id="1"
    data-erag-mention-label="Damon Cross"
    data-erag-mention-value="damon@example.com"
    contenteditable="false"
    >@Damon Cross</span
>
```

Hovering an inserted mention displays a compact user card. The card resolves the avatar,
description, and value from the configured static items or results loaded during the current
editor session. These display-only fields are not added to the saved mention HTML.

Customize the package UI without replacing its behavior:

```css
.erag-editor {
    --erag-mention-dropdown-width: 380px;
    --erag-mention-dropdown-max-height: 300px;
    --erag-mention-active-background: #0f6fdc;
    --erag-mention-active-color: #ffffff;
    --erag-mention-border-color: #d6d9de;
    --erag-mention-shadow: 0 8px 24px rgb(0 0 0 / 12%);
    --erag-mention-chip-background: #eaf2ff;
    --erag-mention-chip-color: #1659a7;
    --erag-mention-hover-card-width: 240px;
    --erag-mention-hover-card-min-height: 68px;
}
```

Persist mention HTML as editor content, and resolve stored mention IDs to current users on the backend when application behavior requires it. Client-side mention validation is defense in depth: sanitize all untrusted HTML again on the server and allow only the documented mention marker, ID, label, optional value, class, and `contenteditable="false"` attributes.

## Merge tags

Pass dynamic merge tags through `init`. Typing the fixed `{{` trigger opens a filtered dropdown
at the caret. When merge tags are enabled, a dynamic **Merge tag** entry appears in the
top menubar and opens a scrollable right sidebar grouped by the configured `group` values.
When using an explicit menubar array, include `'merge-tags'` where this entry should appear.

```ts
import { computed } from 'vue';
import type { EditorInit, MergeTagItem } from '@erag/text-editor-vue';

const mergeTagItems = computed<MergeTagItem[]>(() => [
    { label: 'Call date', value: 'call.date', group: 'Client' },
    { label: 'Client name', value: 'client.name', group: 'Client' },
    { label: 'Submission date', value: 'submission.date', group: 'Proposal' },
    { label: 'Consultant', value: 'consultant.name', group: 'Consultant' },
    { label: 'Salutation', value: 'client.salutation', group: 'Client' },
]);

const editorConfig = computed<EditorInit>(() => ({
    mergeTags: {
        enabled: true,
        limit: 10,
        items: mergeTagItems.value,
    },
}));
```

Arrow keys navigate suggestions, Enter or Tab inserts, and Escape closes the dropdown. Inserted
tags are non-editable tokens such as `{{client.name}}`; Backspace or Delete removes a complete
token. Listen to `merge-tag-select` and `merge-tag-remove` for application behavior. Persist the
HTML as template content, resolve only allowlisted tag values on the backend, and sanitize
untrusted HTML server-side.

## Templates

Templates are supplied entirely through `init`; the editor does not provide controls for creating
or changing them. Enabling the feature adds a dynamic **Templates** menubar entry. It opens a
searchable dialog that groups the configured items, shows a sanitized preview, and inserts the
selected template at the saved cursor position.

```ts
import type { EditorInit, EditorTemplateItem } from '@erag/text-editor-vue';

const templateItems: EditorTemplateItem[] = [
    {
        id: 'message-received',
        label: 'Message received',
        group: 'Quick replies',
        description: 'Confirm that a request was received.',
        content: '<p>Hi {{client.name}},</p><p>We received your message.</p>',
    },
    {
        id: 'progress-update',
        label: 'Progress update',
        group: 'Quick replies',
        content: '<p>Your request is still in progress.</p>',
    },
];

const editorConfig: EditorInit = {
    templates: {
        enabled: true,
        items: templateItems,
    },
};
```

If `menubar` is an explicit array, include `'templates'`. The `template-insert` event receives the
inserted item. Template HTML is sanitized by the editor, but untrusted content must also be
sanitized on the server.

## Image uploads

Uploads are never sent unless the consumer supplies `imagesUploadHandler` or `imagesUploadUrl`.

Inserted images default to a maximum width of `640` pixels while preserving their natural
aspect ratio. Click an image in the editable canvas to display its resize outline, then drag
any of its four corner handles. While the image is selected, the toolbar and Format menu alignment
commands move it left, center, or right. Configure resizing with `imageDefaultWidth` and
`imageResize`:

```ts
const editorConfig: EditorInit = {
    imageDefaultWidth: 480,
    imageResize: true,
};
```

### Custom upload handler

```ts
import type { EditorInit } from '@erag/text-editor-vue';

const init: EditorInit = {
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxImageSize: 5 * 1024 * 1024,
    imagesUploadHandler: async (blobInfo, progress) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        const response = await fetch('/editor/images', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Image upload failed.');
        progress(100);
        return ((await response.json()) as { url: string }).url;
    },
};
```

For a local mock, return a data URL or application-managed URL after an asynchronous delay. Revoke application-created object URLs when they are no longer needed.

### Laravel upload with Fetch

```ts
const init: EditorInit = {
    imagesUploadHandler: async (blobInfo, progress) => {
        const body = new FormData();
        body.append('file', blobInfo.blob(), blobInfo.filename());
        body.append('type', 'editor');

        const response = await fetch('/editor/images', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN':
                    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ??
                    '',
            },
            body,
        });
        if (!response.ok) throw new Error('Image upload failed.');
        progress(100);
        return ((await response.json()) as { url: string }).url;
    },
};
```

### URL-based uploader

```ts
const init: EditorInit = {
    imagesUploadUrl: '/editor/images',
    uploadFieldName: 'file',
    uploadHeaders: { Accept: 'application/json' },
    resolveUploadedImageUrl: (response) => {
        const value = response as { data?: { location?: string } };
        if (!value.data?.location) throw new Error('Upload URL missing.');
        return value.data.location;
    },
};
```

URL uploads use native Fetch and `AbortController`. A custom handler receives a progress callback; Fetch itself does not expose upload progress in current browsers, so URL uploads show an indeterminate loading state until completion.

## Events

`Editor` emits `update:modelValue`, `click`, `focus`, `blur`, `input`, `change`, `keydown`, `paste`, `ready`, `selection-change`, `resize`, `mention-search`, `mention-select`, and `mention-remove`. `change` is emitted on blur only when HTML changed; model updates are emitted only for actual editor changes.

## Exposed methods

An `EditorInstance` exposes `focus`, `blur`, `getHtml`, `setHtml`, `getText`, `clear`, `insertHtml`, `insertText`, `selectAll`, `undo`, `redo`, `openSourceCode`, `openPreview`, and `getRootElement`.

## Slots

Optional named slots are `toolbar-start`, `toolbar-end`, `menubar-end`, `statusbar-start`, `statusbar-end`, `empty`, `mention-item`, `mention-loading`, `mention-empty`, and `mention-error`.

## TypeScript exports

The package exports `EditorInit`, `EditorInstance`, `EditorProps`, `EditorEmits`, `EditorMenuName`, `EditorPluginName`, `EditorToolbarGroup`, `ImagesUploadHandler`, `ImageBlobInfo`, `MentionConfig`, `MentionItem`, `MentionSearchEvent`, `MentionSelectEvent`, and `MentionRemoveEvent`. The build emits ESM and declaration files and remains tree-shakable.

## Security

The internal allowlist sanitizer removes scripts, event-handler attributes, unsafe protocols, unsupported tags, unsafe iframe sources, unsafe style declarations, and malformed mention markup. Valid package mentions are normalized to the documented attributes; arbitrary mention attributes and embedded JSON are discarded. Preview and source workflows sanitize content when sanitization is enabled. This client-side sanitizer is defense in depth, not a complete XSS guarantee. Always sanitize untrusted HTML again on the server with a maintained, context-aware sanitizer and apply an appropriate Content Security Policy.

## Browser support

Use current evergreen browsers with Vue 3 support. Editing relies on `contenteditable` and browser editing commands, some of which are legacy APIs with browser-specific behavior. Clipboard reads/writes require permission and usually a user gesture. Fullscreen uses the Fullscreen API with a CSS fallback. `ResizeObserver`, Selection, Range, DOMParser, TreeWalker, Fetch, and `AbortController` are required.

The component is SSR-safe: browser-only sanitization, fullscreen listeners, selection handling, and
mention positioning initialize on the client. Untrusted HTML must still be sanitized on the server
before it is persisted or rendered outside the editor.

## Build and publish

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm publish --access public
```

`prepublishOnly` repeats lint, typecheck, and build. The published file whitelist includes only `dist`, this README, and the license. No playground or demo application is included.

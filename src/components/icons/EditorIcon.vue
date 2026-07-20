<script setup lang="ts">
defineProps<{ name: string; size?: number }>();
</script>

<template>
    <svg
        class="erag-icon"
        :width="size ?? 20"
        :height="size ?? 20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <template v-if="name === 'bold'">
            <path d="M7 4h6a4 4 0 0 1 0 8H7z" />
            <path d="M7 12h7a4 4 0 0 1 0 8H7z" />
        </template>
        <template v-else-if="name === 'italic'"><path d="M10 4h8M6 20h8M14 4 10 20" /></template>
        <template v-else-if="name === 'underline'">
            <path d="M6 4v7a6 6 0 0 0 12 0V4M5 21h14" />
        </template>
        <template v-else-if="name === 'strikethrough'">
            <path
                d="M5 12h14M17 7c-.8-2-2.4-3-5-3-3 0-5 1.5-5 3.5 0 1.7 1.2 2.8 5 3.5m-5 6c1 2 2.5 3 5 3 3 0 5-1.4 5-3.5 0-1.6-1-2.6-3.7-3.5"
            />
        </template>
        <template v-else-if="name === 'superscript'">
            <path
                d="m4 7 9 10M13 7 4 17M16 7c.5-1.3 1.3-2 2.5-2 1.4 0 2.5.8 2.5 2 0 1.5-1.6 2.3-4.7 4H21"
            />
        </template>
        <template v-else-if="name === 'subscript'">
            <path
                d="m4 5 9 10M13 5 4 15M16 15c.5-1.3 1.3-2 2.5-2 1.4 0 2.5.8 2.5 2 0 1.5-1.6 2.3-4.7 4H21"
            />
        </template>
        <template v-else-if="name === 'case-change'">
            <path d="M4 18 9 5l5 13M6 13h6M15 10h5M17.5 7.5 20 10l-2.5 2.5" />
        </template>
        <template v-else-if="name.includes('align')">
            <path d="M4 6h16M4 10h12M4 14h16M4 18h12" />
        </template>
        <template v-else-if="name === 'undo'">
            <path d="m9 7-5 5 5 5M5 12h8a6 6 0 0 1 6 6" />
        </template>
        <template v-else-if="name === 'redo'">
            <path d="m15 7 5 5-5 5M19 12h-8a6 6 0 0 0-6 6" />
        </template>
        <template v-else-if="name === 'file'">
            <path d="M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6" />
        </template>
        <template v-else-if="name === 'edit'">
            <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM14 7l3 3" />
        </template>
        <template v-else-if="name === 'view'">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12" />
            <circle
                cx="12"
                cy="12"
                r="2.5"
            />
        </template>
        <template v-else-if="name === 'insert'">
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="3"
            />
            <path d="M12 8v8M8 12h8" />
        </template>
        <template v-else-if="name === 'format'">
            <path d="m5 19 7-15 7 15M8 14h8M4 22h16" />
        </template>
        <template v-else-if="name === 'tools'">
            <path d="M14 7a4 4 0 0 0-5-4l2.2 2.2-3 3L6 6a4 4 0 0 0 5 5l7 7a2 2 0 0 0 3-3z" />
        </template>
        <template v-else-if="name === 'help'">
            <circle
                cx="12"
                cy="12"
                r="9"
            />
            <path d="M9.8 9a2.3 2.3 0 1 1 3.7 1.8c-1 .7-1.5 1.1-1.5 2.2M12 17h.01" />
        </template>
        <template v-else-if="name === 'print'">
            <path
                d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
            />
            <path d="M7 14h10v7H7zM17 11h.01" />
        </template>
        <template v-else-if="name === 'cut'">
            <circle
                cx="6"
                cy="7"
                r="3"
            />
            <circle
                cx="6"
                cy="17"
                r="3"
            />
            <path d="m8.5 8.5 11 7.5M8.5 15.5 19.5 8" />
        </template>
        <template v-else-if="name === 'copy'">
            <rect
                x="8"
                y="8"
                width="12"
                height="12"
                rx="2"
            />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </template>
        <template v-else-if="name === 'paste'">
            <path d="M9 5h6M9 3h6v4H9zM7 5H5v16h14V5h-2" />
        </template>
        <template v-else-if="name === 'select-all'">
            <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M8 9h8v6H8z" />
        </template>
        <template v-else-if="name === 'search'">
            <circle
                cx="11"
                cy="11"
                r="6"
            />
            <path d="m16 16 4 4" />
        </template>
        <template v-else-if="name === 'anchor'">
            <circle
                cx="12"
                cy="5"
                r="2"
            />
            <path d="M12 7v14M7 11h10M5 16c1 3 3.3 5 7 5s6-2 7-5" />
        </template>
        <template v-else-if="name === 'calendar'">
            <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
            />
            <path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </template>
        <template v-else-if="name === 'special-character'">
            <path d="M8 18h8M6 9a6 6 0 1 1 12 0c0 3-2 5-4 6v3M10 18v-3c-2-1-4-3-4-6" />
        </template>
        <template v-else-if="name === 'count'">
            <path d="M4 6h16M4 12h10M4 18h13" />
        </template>
        <template v-else-if="name === 'trash'">
            <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
        </template>
        <template v-else-if="name === 'keyboard'">
            <rect
                x="3"
                y="6"
                width="18"
                height="12"
                rx="2"
            />
            <path d="M7 10h.01M11 10h.01M15 10h.01M18 10h.01M7 14h.01M10 14h7" />
        </template>
        <template v-else-if="name === 'github'">
            <path
                d="M15 21v-4a4 4 0 0 0-1-3c3.3-.4 6-1.6 6-7a5.4 5.4 0 0 0-1.5-3.8A5 5 0 0 0 18.4 0S17.2-.4 14 1.5a13 13 0 0 0-7 0C3.8-.4 2.6 0 2.6 0a5 5 0 0 0-.1 3.2A5.4 5.4 0 0 0 1 7c0 5.4 2.7 6.6 6 7a4 4 0 0 0-1 3v4M6 18c-3 .9-3-1.5-4-2"
            />
        </template>
        <template v-else-if="name === 'documentation'">
            <path
                d="M4 4.5A2.5 2.5 0 0 1 6.5 2H11v18H6.5A2.5 2.5 0 0 0 4 22zM20 4.5A2.5 2.5 0 0 0 17.5 2H13v18h4.5A2.5 2.5 0 0 1 20 22z"
            />
        </template>
        <template v-else-if="name === 'menu-item'">
            <circle
                cx="12"
                cy="12"
                r="3"
            />
        </template>
        <template v-else-if="name === 'link'">
            <path d="m9 15 6-6M7 17H5a4 4 0 0 1 0-8h4M17 7h2a4 4 0 0 1 0 8h-4" />
        </template>
        <template v-else-if="name === 'image'">
            <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
            />
            <circle
                cx="9"
                cy="9"
                r="2"
            />
            <path d="m4 17 5-5 4 4 3-3 5 5" />
        </template>
        <template v-else-if="name === 'media'">
            <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
            />
            <path d="m10 9 5 3-5 3z" />
        </template>
        <template v-else-if="name === 'table'">
            <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="1"
            />
            <path d="M3 9h18M9 4v16M15 4v16" />
        </template>
        <template v-else-if="name === 'list' || name === 'numbered-list'">
            <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
        </template>
        <template v-else-if="name === 'indent' || name === 'outdent'">
            <path d="M10 6h10M10 12h10M10 18h10M4 8l4 4-4 4" />
        </template>
        <template v-else-if="name === 'code'">
            <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
        </template>
        <template v-else-if="name === 'preview'">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12" />
            <circle
                cx="12"
                cy="12"
                r="2.5"
            />
        </template>
        <template v-else-if="name === 'fullscreen'">
            <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
        </template>
        <template v-else-if="name === 'horizontal-rule'"><path d="M4 12h16" /></template>
        <template v-else-if="name === 'clear-format'">
            <path d="m4 20 6-6M7 4h10M12 4 8 15M14 15l6 6M20 15l-6 6" />
        </template>
        <template v-else-if="name === 'text-color'">
            <path d="m5 19 7-15 7 15M8 14h8M5 22h14" />
        </template>
        <template v-else-if="name === 'highlight'">
            <path d="m4 16 9-12 5 4-9 12H4zM3 22h18" />
        </template>
        <template v-else-if="name === 'upload'">
            <path d="M12 16V4M7.5 8.5 12 4l4.5 4.5M5 14v5h14v-5" />
        </template>
        <template v-else-if="name === 'emoji'">
            <circle
                cx="12"
                cy="12"
                r="9"
            />
            <path d="M8.5 10h.01M15.5 10h.01M8 14c1 2.5 7 2.5 8 0" />
        </template>
        <template v-else-if="name === 'merge-tag'">
            <path
                d="M8 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3M16 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3M14 5l-4 14"
            />
        </template>
        <template v-else-if="name === 'template'">
            <rect
                x="4"
                y="3"
                width="16"
                height="18"
                rx="2"
            />
            <path d="M8 8h8M8 12h8M8 16h5" />
        </template>
        <template v-else-if="name === 'close'">
            <path d="M6 6l12 12M18 6 6 18" />
        </template>
        <template v-else>
            <circle
                cx="5"
                cy="12"
                r="1"
                fill="currentColor"
                stroke="none"
            />
            <circle
                cx="12"
                cy="12"
                r="1"
                fill="currentColor"
                stroke="none"
            />
            <circle
                cx="19"
                cy="12"
                r="1"
                fill="currentColor"
                stroke="none"
            />
        </template>
    </svg>
</template>

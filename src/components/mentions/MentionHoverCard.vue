<script setup lang="ts">
import { computed, onMounted, shallowRef, useTemplateRef, watch, type CSSProperties } from 'vue';
import type { MentionItem } from '../../types';

const props = defineProps<{
    item: MentionItem;
    positionStyle: CSSProperties;
}>();
const emit = defineEmits<{ ready: [element: HTMLElement] }>();
const root = useTemplateRef<HTMLElement>('root');
const avatarVisible = shallowRef(Boolean(props.item.avatar));
const initials = computed(() =>
    props.item.label
        .split(/\s+/u)
        .slice(0, 2)
        .map((part) => part.charAt(0).toLocaleUpperCase())
        .join(''),
);

watch(
    () => props.item.avatar,
    (avatar) => {
        avatarVisible.value = Boolean(avatar);
    },
);

onMounted(() => {
    if (root.value) emit('ready', root.value);
});
</script>

<template>
    <div
        ref="root"
        class="erag-mention-hover-card"
        :style="positionStyle"
        role="tooltip"
    >
        <img
            v-if="item.avatar && avatarVisible"
            class="erag-mention-hover-card__avatar"
            :src="item.avatar"
            alt=""
            @error="avatarVisible = false"
        />
        <span
            v-else
            class="erag-mention-hover-card__avatar-fallback"
            aria-hidden="true"
        >
            {{ initials }}
        </span>
        <span class="erag-mention-hover-card__content">
            <span class="erag-mention-hover-card__label">{{ item.label }}</span>
            <span
                v-if="item.description"
                class="erag-mention-hover-card__description"
            >
                {{ item.description }}
            </span>
            <span v-if="item.value" class="erag-mention-hover-card__value">
                {{ item.value }}
            </span>
        </span>
    </div>
</template>

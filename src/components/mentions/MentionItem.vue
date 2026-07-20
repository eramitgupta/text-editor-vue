<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import type { MentionItem } from '../../types';

const props = defineProps<{
    item: MentionItem;
    active: boolean;
    optionId: string;
}>();
const emit = defineEmits<{ select: []; activate: [] }>();
defineSlots<{ default(props: { item: MentionItem; active: boolean }): unknown }>();
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
</script>

<template>
    <button
        :id="optionId"
        type="button"
        class="erag-mention-dropdown__item"
        :class="{ 'erag-is-active': active }"
        role="option"
        :aria-selected="active"
        tabindex="-1"
        @pointerenter="emit('activate')"
        @pointerdown.prevent="emit('select')"
    >
        <slot
            :item="item"
            :active="active"
        >
            <img
                v-if="item.avatar && avatarVisible"
                class="erag-mention-dropdown__avatar"
                :src="item.avatar"
                alt=""
                @error="avatarVisible = false"
            />
            <span
                v-else
                class="erag-mention-dropdown__avatar-fallback"
                aria-hidden="true"
            >
                {{ initials }}
            </span>
            <span class="erag-mention-dropdown__content">
                <span class="erag-mention-dropdown__label">{{ item.label }}</span>
                <span
                    v-if="item.description"
                    class="erag-mention-dropdown__description"
                >
                    {{ item.description }}
                </span>
            </span>
        </slot>
    </button>
</template>

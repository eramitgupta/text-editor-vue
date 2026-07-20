import { onBeforeUnmount, onMounted, shallowRef, type Ref } from 'vue';
export function useFullscreen(root: Ref<HTMLElement | null>) {
    const active = shallowRef(false);
    async function toggle(): Promise<void> {
        if (!root.value) return;
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            active.value = false;
            return;
        }
        try {
            await root.value.requestFullscreen();
            active.value = true;
        } catch {
            root.value.classList.toggle('erag-editor--fullscreen');
            active.value = root.value.classList.contains('erag-editor--fullscreen');
        }
    }
    const listener = (): void => {
        active.value =
            Boolean(document.fullscreenElement) ||
            Boolean(root.value?.classList.contains('erag-editor--fullscreen'));
    };
    onMounted(() => document.addEventListener('fullscreenchange', listener));
    onBeforeUnmount(() => document.removeEventListener('fullscreenchange', listener));
    return { active, toggle };
}

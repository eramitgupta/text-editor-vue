import { nextTick, shallowRef, type Ref } from 'vue';
export function useFloatingPosition(
    trigger: Ref<HTMLElement | null>,
    panel: Ref<HTMLElement | null>,
) {
    const style = shallowRef<Record<string, string>>({});
    async function update(): Promise<void> {
        await nextTick();
        if (!trigger.value || !panel.value) return;
        const a = trigger.value.getBoundingClientRect();
        const p = panel.value.getBoundingClientRect();
        const left = Math.max(8, Math.min(a.left, window.innerWidth - p.width - 8));
        const top = a.bottom + p.height > window.innerHeight ? a.top - p.height : a.bottom;
        style.value = { position: 'fixed', left: `${left}px`, top: `${Math.max(8, top)}px` };
    }
    return { style, update };
}

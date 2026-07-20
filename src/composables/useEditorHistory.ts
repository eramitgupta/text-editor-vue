import { onBeforeUnmount, shallowRef, type Ref } from 'vue';
import { canUseHistory } from '../commands/historyCommands';

export function useEditorHistory(root: Ref<HTMLElement | null>) {
    const canUndo = shallowRef(false);
    const canRedo = shallowRef(false);
    let frame = 0;

    function update(): void {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            if (!root.value) {
                canUndo.value = false;
                canRedo.value = false;
                return;
            }

            canUndo.value = canUseHistory('undo');
            canRedo.value = canUseHistory('redo');
        });
    }

    function reset(): void {
        cancelAnimationFrame(frame);
        canUndo.value = false;
        canRedo.value = false;
    }

    onBeforeUnmount(() => cancelAnimationFrame(frame));

    return { canUndo, canRedo, update, reset };
}

import { reactive, onBeforeUnmount, type ComputedRef } from 'vue';
import type { ImageBlobInfo, ResolvedEditorInit, UploadState } from '../types';

export function useEditorUpload(config: ComputedRef<ResolvedEditorInit>) {
    const state = reactive<UploadState>({ progress: 0, loading: false, error: '', previewUrl: '' });
    let controller: AbortController | null = null;
    let currentUrl = '';
    async function upload(file: File): Promise<string> {
        validate(file);
        cancel();
        state.loading = true;
        state.error = '';
        state.progress = 0;
        controller = new AbortController();
        setPreview(URL.createObjectURL(file));
        try {
            const created = await createBlobInfo(file);
            try {
                const url = config.value.imagesUploadHandler
                    ? await config.value.imagesUploadHandler(created.info, setProgress)
                    : await uploadWithFetch(file, controller.signal);
                state.progress = 100;
                return url;
            } finally {
                created.revoke();
            }
        } catch (error) {
            state.error = error instanceof Error ? error.message : 'Image upload failed.';
            throw error;
        } finally {
            state.loading = false;
            controller = null;
        }
    }
    async function uploadWithFetch(file: File, signal: AbortSignal): Promise<string> {
        if (!config.value.imagesUploadUrl)
            throw new Error('No image upload handler or URL was configured.');
        const body = new FormData();
        body.append(config.value.uploadFieldName, file, file.name);
        const response = await fetch(config.value.imagesUploadUrl, {
            method: 'POST',
            headers: config.value.uploadHeaders,
            credentials: config.value.uploadCredentials,
            body,
            signal,
        });
        if (!response.ok) throw new Error(`Image upload failed (${response.status}).`);
        const data: unknown = await response.json();
        if (config.value.resolveUploadedImageUrl) return config.value.resolveUploadedImageUrl(data);
        if (
            typeof data === 'object' &&
            data !== null &&
            'url' in data &&
            typeof data.url === 'string'
        )
            return data.url;
        throw new Error(
            'The upload response did not contain a URL. Configure resolveUploadedImageUrl.',
        );
    }
    function validate(file: File): void {
        if (!config.value.acceptedFormats.includes(file.type))
            throw new Error('Invalid image type.');
        if (file.size > config.value.maxImageSize)
            throw new Error(
                `Image exceeds the ${Math.round(config.value.maxImageSize / 1024 / 1024)} MB limit.`,
            );
    }
    function setProgress(value: number): void {
        state.progress = Math.min(100, Math.max(0, value));
    }
    function setPreview(url: string): void {
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = url;
        state.previewUrl = url;
    }
    function cancel(): void {
        controller?.abort();
        controller = null;
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = '';
        state.previewUrl = '';
    }
    onBeforeUnmount(cancel);
    return { state, upload, cancel, validate };
}
async function createBlobInfo(file: File): Promise<{ info: ImageBlobInfo; revoke: () => void }> {
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
        reader.onerror = () => reject(new Error('Could not read image.'));
        reader.readAsDataURL(file);
    });
    const uri = URL.createObjectURL(file);
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
    return {
        info: {
            id: () => id,
            name: () => file.name.replace(/\.[^.]+$/, ''),
            filename: () => file.name,
            blob: () => file,
            base64: () => base64,
            blobUri: () => uri,
        },
        revoke: () => URL.revokeObjectURL(uri),
    };
}

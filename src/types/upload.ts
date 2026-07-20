export interface ImageBlobInfo {
    id(): string;
    name(): string;
    filename(): string;
    blob(): Blob;
    base64(): string;
    blobUri(): string;
}
export type ImagesUploadHandler = (
    blobInfo: ImageBlobInfo,
    progress: (percentage: number) => void,
) => Promise<string>;
export interface UploadState {
    progress: number;
    loading: boolean;
    error: string;
    previewUrl: string;
}

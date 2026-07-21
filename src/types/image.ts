export interface ImageResizeBox {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface ImageValue {
    src: string;
    alt: string;
    width: string;
    height: string;
}

export interface ImageDeleteInfo {
    src: string;
    alt: string;
    width: number;
    height: number;
}

export type ImagesDeleteHandler = (image: ImageDeleteInfo) => void | Promise<void>;

export type ImageAlignment = 'alignleft' | 'aligncenter' | 'alignright';
export type ImageResizeHandle = 'north-west' | 'north-east' | 'south-west' | 'south-east';

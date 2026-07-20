export function cssUnit(value: number | string | undefined): string | undefined {
    if (value === undefined || value === '') return undefined;
    return typeof value === 'number' ? `${Math.max(0, value)}px` : value;
}
export function pixelValue(value: number | string | undefined, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}

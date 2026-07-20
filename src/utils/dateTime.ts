import type { DateTimeFormatOption } from '../types';

export function mergeDateTimeFormats(
    dateFormats: DateTimeFormatOption[],
    timeFormats: DateTimeFormatOption[],
): DateTimeFormatOption[] {
    const formats: DateTimeFormatOption[] = [];
    const length = Math.max(dateFormats.length, timeFormats.length);
    for (let index = 0; index < length; index += 1) {
        const time = timeFormats[index];
        const date = dateFormats[index];
        if (time) formats.push(time);
        if (date) formats.push(date);
    }
    return formats;
}

export function formatDateTime(option: DateTimeFormatOption, date: Date): string {
    if (option.format === 'iso-date') {
        const year = String(date.getFullYear());
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return new Intl.DateTimeFormat(undefined, option.options).format(date);
}

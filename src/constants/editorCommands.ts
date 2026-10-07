export const FORMAT_COMMANDS: Record<string, string> = {
    bold: 'bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'strikeThrough',
    superscript: 'superscript',
    subscript: 'subscript',
    alignleft: 'justifyLeft',
    aligncenter: 'justifyCenter',
    alignright: 'justifyRight',
    alignjustify: 'justifyFull',
    bullist: 'insertUnorderedList',
    numlist: 'insertOrderedList',
    outdent: 'outdent',
    indent: 'indent',
    removeformat: 'removeFormat',
    undo: 'undo',
    redo: 'redo',
    selectall: 'selectAll',
};

/** Commands and dialogs that only read the content, so they stay usable in readonly mode. */
export const READ_ONLY_COMMANDS = new Set([
    'fullscreen',
    'print',
    'wordCount',
    'copy',
    'selectall',
]);
export const READ_ONLY_DIALOGS = new Set(['preview', 'source', 'shortcuts', 'about']);

export function isReadOnlyAction(item: { command?: string; dialog?: string }): boolean {
    return Boolean(
        (item.command && READ_ONLY_COMMANDS.has(item.command)) ||
        (item.dialog && READ_ONLY_DIALOGS.has(item.dialog)),
    );
}

export const PRINT_CONTENT_STYLES = `
.erag-print-portal { display: none; }
@media print {
@page { margin: 16mm; }
body.erag-is-printing { margin: 0; padding: 0; }
body.erag-is-printing > :not(.erag-print-portal) { display: none; }
body.erag-is-printing > .erag-print-portal { display: block; }
body.erag-is-printing .erag-print-content {
    color: #111827;
    font: 14px/1.5 Arial, Helvetica, sans-serif;
    overflow-wrap: anywhere;
}
body.erag-is-printing .erag-print-content h1,
body.erag-is-printing .erag-print-content h2,
body.erag-is-printing .erag-print-content h3,
body.erag-is-printing .erag-print-content h4,
body.erag-is-printing .erag-print-content h5,
body.erag-is-printing .erag-print-content h6 { margin: 0.65em 0 0.4em; line-height: 1.25; }
body.erag-is-printing .erag-print-content p { margin: 0.5em 0; }
body.erag-is-printing .erag-print-content ul,
body.erag-is-printing .erag-print-content ol { margin: 0.5em 0; padding-inline-start: 1.75em; }
body.erag-is-printing .erag-print-content ul { list-style: disc outside; }
body.erag-is-printing .erag-print-content ol { list-style: decimal outside; }
body.erag-is-printing .erag-print-content li { display: list-item; margin: 0.2em 0; }
body.erag-is-printing .erag-print-content img,
body.erag-is-printing .erag-print-content video,
body.erag-is-printing .erag-print-content iframe { max-width: 100%; }
body.erag-is-printing .erag-print-content table {
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
}
body.erag-is-printing .erag-print-content td,
body.erag-is-printing .erag-print-content th {
    min-width: 36px;
    padding: 8px;
    border: 1px solid #94a3b8;
}
body.erag-is-printing .erag-print-content blockquote {
    margin-inline: 0;
    padding-inline-start: 16px;
    color: #475569;
    border-inline-start: 3px solid #cbd5e1;
}
body.erag-is-printing .erag-print-content pre {
    padding: 12px;
    overflow: hidden;
    white-space: pre-wrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background: #f1f5f9;
    border-radius: 5px;
}
body.erag-is-printing .erag-print-content .erag-mention {
    display: inline;
    padding: 1px 5px;
    color: #1659a7;
    white-space: nowrap;
    background: #eaf2ff;
    border-radius: 4px;
}
}
`;

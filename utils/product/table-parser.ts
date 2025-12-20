/**
 * Parses table data from clipboard (HTML or Plain Text).
 */
export const parseTableFromClipboard = (clipboardData: DataTransfer) => {
    const html = clipboardData.getData("text/html");
    const plainText = clipboardData.getData("text/plain");

    if (html && html.includes("<table")) {
        return parseHtmlTable(html);
    } else if (plainText) {
        return parsePlainTextTable(plainText);
    }

    return null;
};

const parseHtmlTable = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const table = doc.querySelector("table");

    if (!table) return null;

    const headers: string[] = [];
    const rows: string[][] = [];

    const theadRows = table.querySelectorAll("thead tr");
    const tbodyRows = table.querySelectorAll("tbody tr");
    const allRows = table.querySelectorAll("tr");

    // If we have THEAD, use it for headers
    if (theadRows.length > 0) {
        theadRows[0].querySelectorAll("th, td").forEach((cell) => {
            headers.push(cell.textContent?.trim() || "");
        });
    }

    // Process rows
    const targetRows = tbodyRows.length > 0 ? Array.from(tbodyRows) : Array.from(allRows);

    // Heuristic: Only use the first row as headers if there's a THEAD or if the first row has <th> tags.
    // Otherwise, treat everything as data and use default headers.
    let startIndex = 0;
    if (headers.length === 0 && targetRows.length > 0) {
        const firstRowTh = targetRows[0].querySelector("th");
        if (firstRowTh) {
            targetRows[0].querySelectorAll("th, td").forEach(cell => headers.push(cell.textContent?.trim() || ""));
            startIndex = 1;
        }
    }

    for (let i = startIndex; i < targetRows.length; i++) {
        const cells = targetRows[i].querySelectorAll("td, th");
        const rowData: string[] = [];
        cells.forEach((cell) => {
            rowData.push(cell.textContent?.trim() || "");
        });
        if (rowData.length > 0) rows.push(rowData);
    }

    if (headers.length === 0 && rows.length > 0) {
        const colCount = rows[0].length;
        const defaultHeaders = colCount === 2
            ? ["Specification", "Value"]
            : Array.from({ length: colCount }, (_, i) => `Header ${i + 1}`);
        return { headers: defaultHeaders, rows };
    }

    return { headers, rows };
};

const parsePlainTextTable = (text: string) => {
    // Detect delimiters: tabs (Excel/Sheets) or commas/pipes
    const lines = text.trim().split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 1) return null;

    // Try tabs first
    let rows = lines.map(line => line.split("\t"));

    // If tabs didn't work (most rows have only 1 col), try others
    const avgCols = rows.reduce((acc, r) => acc + r.length, 0) / rows.length;
    if (avgCols <= 1.1) {
        // Try pipes
        rows = lines.map(line => line.split("|").map(c => c.trim()).filter(c => c !== ""));
    }

    if (rows.length < 1 || rows[0].length < 2) return null;

    // As requested: Use default specification values as headers and treat all lines as data rows.
    const colCount = rows[0].length;
    const headers = colCount === 2
        ? ["Specification", "Value"]
        : Array.from({ length: colCount }, (_, i) => `Header ${i + 1}`);

    return { headers, rows };
};

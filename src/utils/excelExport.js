import * as XLSX from "xlsx";

const NUMERIC_COLUMN_KEYS = new Set([
    "cantidad",
    "edad",
    "total",
    "cupsRegistrados",
    "pacientes",
    "pacientesCerrados",
]);

const NUMERIC_COLUMN_LABELS = new Set([
    "Cantidad",
    "Cantidad CUPS",
    "Edad",
    "Pacientes cerrados",
    "CUPS cerrados",
]);

export function esColumnaNumericaExcel(col = {}) {
    if (col.excelType === "number") return true;
    if (col.excelType === "text") return false;
    if (NUMERIC_COLUMN_KEYS.has(col.key)) return true;
    if (NUMERIC_COLUMN_LABELS.has(col.label)) return true;
    return false;
}

export function esEtiquetaNumericaExcel(label = "") {
    return NUMERIC_COLUMN_LABELS.has(String(label || "").trim());
}

export function normalizarValorNumericoExcel(valor) {
    if (valor === null || valor === undefined) return null;
    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : null;
    }

    const texto = String(valor).trim();
    if (!texto) return null;

    // Soporta "1.234,56" / "1,234.56" / "12,5" / "12.5"
    let normalizado = texto.replace(/\s/g, "");
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(normalizado)) {
        normalizado = normalizado.replace(/\./g, "").replace(",", ".");
    } else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(normalizado)) {
        normalizado = normalizado.replace(/,/g, "");
    } else if (normalizado.includes(",") && !normalizado.includes(".")) {
        normalizado = normalizado.replace(",", ".");
    }

    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : null;
}

export function sanitizarValorExcelTexto(valor) {
    if (valor === null || valor === undefined) return "";
    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : "";
    }

    const texto = String(valor);
    if (!texto) return "";

    // Evita que Excel interprete contenido de usuario como fórmula.
    if (/^[=+\-@]/.test(texto)) {
        return `'${texto}`;
    }

    return texto;
}

export function formatearValorExcel(valor, col = {}) {
    if (esColumnaNumericaExcel(col)) {
        return normalizarValorNumericoExcel(valor);
    }
    return sanitizarValorExcelTexto(valor);
}

export function buildExcelRowsFromColumnas(filas = [], columnas = []) {
    return (filas || []).map((fila) => {
        const row = {};
        (columnas || []).forEach((col) => {
            row[col.label] = formatearValorExcel(fila?.[col.key], col);
        });
        return row;
    });
}

export function buildExcelRowsFromObjects(filas = [], options = {}) {
    const { numericLabels = [], numericKeys = [] } = options;
    const labelsNumericos = new Set([
        ...numericLabels,
        ...numericKeys.map((key) => String(key || "").trim()).filter(Boolean),
    ]);

    return (filas || []).map((fila) => {
        const row = {};
        Object.entries(fila || {}).forEach(([key, valor]) => {
            const col = {
                key,
                label: key,
                excelType: labelsNumericos.has(key) || NUMERIC_COLUMN_KEYS.has(key) ? "number" : undefined,
            };
            row[key] = formatearValorExcel(valor, col);
        });
        return row;
    });
}

export function aplicarTiposNumericosEnHoja(ws, options = {}) {
    if (!ws?.["!ref"]) return;

    const { columnas = [], numericLabels = [] } = options;
    const labelsNumericos = new Set([
        ...(columnas || []).filter((col) => esColumnaNumericaExcel(col)).map((col) => col.label),
        ...(numericLabels || []).filter(Boolean),
    ]);

    if (!labelsNumericos.size) return;

    const range = XLSX.utils.decode_range(ws["!ref"]);
    const indicePorLabel = {};

    for (let c = range.s.c; c <= range.e.c; c += 1) {
        const addr = XLSX.utils.encode_cell({ r: range.s.r, c });
        const header = ws[addr]?.v;
        if (labelsNumericos.has(header)) {
            indicePorLabel[header] = c;
        }
    }

    Object.values(indicePorLabel).forEach((colIndex) => {
        for (let r = range.s.r + 1; r <= range.e.r; r += 1) {
            const addr = XLSX.utils.encode_cell({ r, c: colIndex });
            const cell = ws[addr];
            const bruto = cell ? cell.v : undefined;
            const numero = normalizarValorNumericoExcel(bruto);
            if (numero === null) {
                if (cell) delete ws[addr];
                continue;
            }

            ws[addr] = { t: "n", v: numero, z: "0" };
        }
    });
}

export function applyWorksheetColumnWidths(ws, colWidths = [], fallbackWidth = 22) {
    if (!ws) return;

    if (Array.isArray(colWidths) && colWidths.length) {
        ws["!cols"] = colWidths.map((width) => ({ wch: width }));
        return;
    }

    if (!ws["!ref"]) return;
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const totalColumnas = range.e.c - range.s.c + 1;
    ws["!cols"] = Array.from({ length: totalColumnas }, () => ({ wch: fallbackWidth }));
}

export function createWorksheetFromRows(rows = [], options = {}) {
    // Evita que null se serialice como texto vacío ambiguo.
    const rowsLimpios = (rows || []).map((row) => {
        const next = {};
        Object.entries(row || {}).forEach(([key, value]) => {
            next[key] = value === null || value === undefined ? "" : value;
        });
        return next;
    });

    const ws = XLSX.utils.json_to_sheet(rowsLimpios, { skipHeader: false });
    aplicarTiposNumericosEnHoja(ws, options);
    return ws;
}

export function exportRowsToExcel({
    rows = [],
    columnas = [],
    numericLabels = [],
    sheetName = "Informe",
    fileName = "informe.xlsx",
    colWidth = 22,
    colWidths = [],
}) {
    if (!rows.length) {
        return false;
    }

    const ws = columnas.length
        ? createWorksheetFromRows(rows, { columnas, numericLabels })
        : createWorksheetFromRows(rows, { numericLabels });

    if (ws["!ref"]) {
        ws["!autofilter"] = { ref: ws["!ref"] };
    }

    applyWorksheetColumnWidths(ws, colWidths, colWidth);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, String(sheetName || "Informe").slice(0, 31));
    XLSX.writeFile(wb, fileName);
    return true;
}

export function appendSheetToWorkbook(wb, {
    rows = [],
    columnas = [],
    numericLabels = [],
    sheetName = "Informe",
    colWidth = 22,
    colWidths = [],
}) {
    const ws = columnas.length
        ? createWorksheetFromRows(rows, { columnas, numericLabels })
        : createWorksheetFromRows(rows, { numericLabels });

    if (ws["!ref"]) {
        ws["!autofilter"] = { ref: ws["!ref"] };
    }

    applyWorksheetColumnWidths(ws, colWidths, colWidth);

    XLSX.utils.book_append_sheet(wb, ws, String(sheetName || "Informe").slice(0, 31));
    return ws;
}

export { XLSX };

import Papa from "papaparse";

export const CSV_USER_HEADERS = [
  "Nombre",
  "Email",
  "Cargo",
  "Grupo",
  "Convenio",
  "Documento",
];

const HEADER_CANONICAL = {
  nombre: "Nombre",
  email: "Email",
  cargo: "Cargo",
  grupo: "Grupo",
  convenio: "Convenio",
  documento: "Documento",
  idips: "idips",
  ipsid: "idips",
  ips_id: "idips",
  telefono: "Telefono",
  teléfono: "Telefono",
  fechafincontrato: "FechaFinContrato",
  fecha_fin_contrato: "FechaFinContrato",
};

export function normalizeCsvHeader(header) {
  return String(header || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/^"|"$/g, "");
}

export function canonicalCsvHeader(header) {
  const cleaned = normalizeCsvHeader(header);
  if (!cleaned) return "";

  const key = cleaned
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");

  return HEADER_CANONICAL[key] || cleaned;
}

export function detectCsvDelimiter(firstLine) {
  const line = String(firstLine || "").replace(/^\uFEFF/, "");
  const counts = {
    ";": (line.match(/;/g) || []).length,
    ",": (line.match(/,/g) || []).length,
    "\t": (line.match(/\t/g) || []).length,
  };

  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] > 0 ? best[0] : ",";
}

export function scoreDecodedCsv(text) {
  const value = String(text || "");
  let score = 0;

  if (value.includes("\uFFFD")) {
    score -= 10;
  }

  const accented = value.match(/[ÁÉÍÓÚáéíóúÑñÜü]/g);
  if (accented) {
    score += accented.length;
  }

  return score;
}

export function decodeCsvArrayBuffer(arrayBuffer) {
  const utf8 = new TextDecoder("utf-8").decode(arrayBuffer);
  const windows1252 = new TextDecoder("windows-1252").decode(arrayBuffer);

  const text = scoreDecodedCsv(windows1252) > scoreDecodedCsv(utf8) ? windows1252 : utf8;
  return text.replace(/^\uFEFF/, "");
}

function remapRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    const mapped = {};
    Object.entries(row || {}).forEach(([key, value]) => {
      const canonical = canonicalCsvHeader(key);
      if (canonical) {
        mapped[canonical] = value;
      }
    });
    return mapped;
  });
}

function parseWithDelimiter(csvContent, delimiter) {
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    delimiter,
    transformHeader: (header) => canonicalCsvHeader(header),
  });

  const headers = Array.isArray(parsed.meta?.fields)
    ? parsed.meta.fields.map((h) => canonicalCsvHeader(h)).filter(Boolean)
    : [];

  return {
    headers,
    rows: remapRows(parsed.data),
    errors: parsed.errors || [],
  };
}

export function parseUsersCsvContent(csvContent, { requireIdips = false } = {}) {
  const content = String(csvContent || "").replace(/^\uFEFF/, "");
  const firstLine = content.split(/\r?\n/)[0] || "";
  const requiredHeaders = requireIdips
    ? [...CSV_USER_HEADERS, "idips"]
    : [...CSV_USER_HEADERS];

  const delimiters = [
    detectCsvDelimiter(firstLine),
    ";",
    ",",
    "\t",
  ].filter((value, index, list) => list.indexOf(value) === index);

  let bestAttempt = null;

  for (const delimiter of delimiters) {
    const attempt = parseWithDelimiter(content, delimiter);
    const faltantes = requiredHeaders.filter((h) => !attempt.headers.includes(h));

    if (!faltantes.length) {
      return {
        ok: true,
        headers: attempt.headers,
        rows: attempt.rows,
        delimiter,
        errors: attempt.errors,
      };
    }

    if (
      !bestAttempt ||
      faltantes.length < bestAttempt.faltantes.length ||
      attempt.headers.length > bestAttempt.headers.length
    ) {
      bestAttempt = {
        ...attempt,
        delimiter,
        faltantes,
      };
    }
  }

  return {
    ok: false,
    headers: bestAttempt?.headers || [],
    rows: [],
    delimiter: bestAttempt?.delimiter || detectCsvDelimiter(firstLine),
    faltantes: bestAttempt?.faltantes || requiredHeaders,
    errors: bestAttempt?.errors || [],
  };
}

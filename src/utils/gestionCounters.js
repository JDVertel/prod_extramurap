import moment from "moment";

function parseFechaGestion(value) {
  const texto = String(value || "").trim();
  if (!texto) return null;

  const matchIso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
  if (matchIso) {
    const fechaIso = moment(matchIso[1], "YYYY-MM-DD", true);
    if (fechaIso.isValid()) return fechaIso.startOf("day");
  }

  const fechaIsoCompleta = moment(texto, moment.ISO_8601, true);
  if (fechaIsoCompleta.isValid()) return fechaIsoCompleta.startOf("day");

  const fechaFlexible = moment(new Date(texto));
  if (fechaFlexible.isValid()) return fechaFlexible.startOf("day");

  return null;
}

function coincideDocumento(encuesta, documentoObjetivo, docKeys) {
  const documento = String(documentoObjetivo || "").trim();
  if (!documento) return false;

  return docKeys.some((key) => String(encuesta?.[key] || "").trim() === documento);
}

export function contarCierresPorPeriodo(encuestas = [], opciones = {}) {
  const {
    documentoObjetivo,
    docKeys = [],
    statusKey,
    fechaKey,
    fechaInicio,
    fechaFin,
    esEstadoCerrado = (valor) => valor === true,
  } = opciones;

  if (!Array.isArray(encuestas) || encuestas.length === 0) return 0;
  if (!documentoObjetivo || !statusKey || !fechaKey || !fechaInicio || !fechaFin || docKeys.length === 0) return 0;

  const inicio = moment(fechaInicio, "YYYY-MM-DD", true);
  const fin = moment(fechaFin, "YYYY-MM-DD", true);
  if (!inicio.isValid() || !fin.isValid()) return 0;

  return encuestas.filter((encuesta) => {
    if (!coincideDocumento(encuesta, documentoObjetivo, docKeys)) return false;
    if (!esEstadoCerrado(encuesta?.[statusKey])) return false;

    const fechaGestion = parseFechaGestion(encuesta?.[fechaKey]);
    return Boolean(fechaGestion && fechaGestion.isBetween(inicio, fin, "day", "[]"));
  }).length;
}
import moment from "moment";

const FECHA_FIELD_ALIASES = {
  fechagestAuxiliar: ["fechagestAuxiliar", "fecha_gest_auxiliar"],
  fechagestEnfermera: ["fechagestEnfermera", "fecha_gest_enfermera"],
  fechagestMedica: ["fechagestMedica", "fecha_gest_medica"],
  fechagestPsicologo: ["fechagestPsicologo", "fecha_gest_psicologo"],
  fechagestTsocial: ["fechagestTsocial", "fecha_gest_tsocial"],
  fechagestNutricionista: ["fechagestNutricionista", "fecha_gest_nutricionista"],
};

function getFieldValue(encuesta = {}, fieldName = "") {
  const aliases = FECHA_FIELD_ALIASES[fieldName] || [fieldName];

  for (const alias of aliases) {
    const value = encuesta?.[alias];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
}

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

    const fechaGestion = parseFechaGestion(getFieldValue(encuesta, fechaKey));
    return Boolean(fechaGestion && fechaGestion.isBetween(inicio, fin, "day", "[]"));
  }).length;
}
import { informesApi } from "@/api/informesApi";

function normalizarTexto(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cupsDesdeAsignacion(asignacion) {
  const cups = asignacion?.cups;
  if (!cups || typeof cups !== "object") return [];
  return Object.values(cups).filter(Boolean);
}

/**
 * Carga CUPS de muchas encuestas en una sola petición (evita N+1).
 * @returns {Record<string, object[]>} mapa encuestaId -> cups[]
 */
export async function cargarCupsPorEncuestaIds(encuestaIds = []) {
  const ids = Array.from(
    new Set((encuestaIds || []).map((id) => String(id || "").trim()).filter(Boolean))
  );

  if (!ids.length) return {};

  const { asignaciones } = await informesApi.getAsignacionesCupsBulk(ids);
  const mapa = {};

  ids.forEach((id) => {
    mapa[id] = cupsDesdeAsignacion(asignaciones?.[id]);
  });

  return mapa;
}

/**
 * Filtra CUPS del profesional logueado (cargo + documento/nombre).
 */
export function filtrarCupsDelProfesional(cups = [], userData = {}, options = {}) {
  const cargoActual = normalizarTexto(userData?.cargo || "");
  const nombreActual = normalizarTexto(userData?.nombre || "");
  const documentoActual = String(userData?.numDocumento || "").trim();
  const matchCargoExact = Boolean(options.matchCargoExact);
  const cargoExact = String(userData?.cargo || "").trim();

  return (cups || []).filter((cup) => {
    if (matchCargoExact) {
      const cargoCup = String(cup?.key || "").trim();
      if (!cargoExact || cargoCup !== cargoExact) return false;
    } else {
      const cargoCup = normalizarTexto(cup?.key || "");
      if (!cargoActual || cargoCup !== cargoActual) return false;
    }

    const documentoCup = String(cup?.idProf ?? cup?.idProfesional ?? "").trim();
    if (documentoActual && documentoCup) {
      return documentoCup === documentoActual;
    }

    const nombreCup = normalizarTexto(cup?.nombreProf || "");
    if (nombreActual && nombreCup) {
      return nombreCup === nombreActual;
    }

    // Médico histórico: si no hay nombre en cup, se acepta por cargo.
    return Boolean(options.allowCargoOnlyFallback);
  });
}

export function mapearActividadesDesdeCups(cups = [], obtenerNombreActividad = () => "") {
  const actividadIds = cups
    .map((cup) => cup?.actividadId ?? cup?.idActividad)
    .filter(Boolean);

  return Array.from(new Set(actividadIds))
    .map((idActividad) => obtenerNombreActividad(idActividad))
    .filter(Boolean);
}

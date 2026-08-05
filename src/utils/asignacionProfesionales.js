/**
 * Reglas de reasignación de profesionales en encuesta (auxiliar).
 * Un profesional se puede cambiar/asignar solo si aún no ha actuado.
 */

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export const ROLES_ASIGNACION = {
  medico: {
    formKey: "medico",
    label: "Médico",
    statusKeys: ["status_gest_medica"],
    fechaKeys: ["fechagestMedica", "fecha_gest_medica"],
    cupKeys: ["medico", "médico"],
    required: true,
  },
  enfermero: {
    formKey: "enfermero",
    label: "Enfermero jefe",
    statusKeys: ["status_gest_enfermera"],
    fechaKeys: ["fechagestEnfermera", "fecha_gest_enfermera"],
    cupKeys: ["enfermero", "enfermero jefe", "jefe"],
    required: true,
  },
  psicologo: {
    formKey: "psicologo",
    label: "Psicólogo",
    statusKeys: ["status_gest_psicologo"],
    fechaKeys: ["fechagestPsicologo", "fecha_gest_psicologo"],
    cupKeys: ["psicologo", "psicólogo"],
    required: false,
  },
  trabajadorSocial: {
    formKey: "trabajadorSocial",
    label: "Trabajador social",
    statusKeys: ["status_gest_tsocial"],
    fechaKeys: ["fechagestTsocial", "fecha_gest_tsocial"],
    cupKeys: ["tsocial", "trabajador social", "social"],
    required: false,
  },
  nutricionista: {
    formKey: "nutricionista",
    label: "Nutricionista",
    statusKeys: ["status_gest_nutricionista", "status_gest_nutri"],
    fechaKeys: ["fechagestNutricionista", "fecha_gest_nutricionista"],
    cupKeys: ["nutricionista", "nutricion", "nutrición"],
    required: false,
  },
  higienistaOral: {
    formKey: "higienistaOral",
    label: "Higienista oral",
    statusKeys: ["status_gest_higienista_oral"],
    fechaKeys: ["fechagestHigienistaOral", "fecha_gest_higienista_oral"],
    cupKeys: ["higienista oral", "higienista", "oral"],
    required: false,
  },
};

function leerEstadoGestion(encuesta, statusKeys = []) {
  for (const key of statusKeys) {
    if (encuesta?.[key] === undefined || encuesta?.[key] === null || encuesta?.[key] === "") continue;
    const raw = encuesta[key];
    if (raw === true) return 1;
    if (raw === false) return 0;
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
    const t = String(raw).trim().toLowerCase();
    if (["true", "si", "sí", "1", "2", "cerrado"].includes(t)) {
      return t === "2" ? 2 : 1;
    }
  }
  return 0;
}

function leerFechaGestion(encuesta, fechaKeys = []) {
  for (const key of fechaKeys) {
    const valor = String(encuesta?.[key] || "").trim();
    if (valor) return valor;
  }
  return "";
}

function cupsDelRol(cups = [], cupKeys = []) {
  const aliases = new Set(cupKeys.map((k) => normalizeText(k)).filter(Boolean));
  return (cups || []).filter((cup) => aliases.has(normalizeText(cup?.key)));
}

/**
 * @returns {{ bloqueado: boolean, motivo: string, puedeAsignar: boolean, puedeCambiar: boolean }}
 */
export function evaluarBloqueoAsignacion({
  encuesta = {},
  cups = [],
  documentoAsignado = "",
} = {}, roleConfig) {
  const doc = String(documentoAsignado || "").trim();
  const status = leerEstadoGestion(encuesta, roleConfig.statusKeys);
  const fecha = leerFechaGestion(encuesta, roleConfig.fechaKeys);
  const cupsRol = cupsDelRol(cups, roleConfig.cupKeys);

  if (status >= 1) {
    return {
      bloqueado: true,
      motivo: "Bloqueado: ya cerró gestión sobre el paciente",
      puedeAsignar: false,
      puedeCambiar: false,
    };
  }

  if (fecha) {
    return {
      bloqueado: true,
      motivo: "Bloqueado: tiene fecha de gestión registrada",
      puedeAsignar: false,
      puedeCambiar: false,
    };
  }

  if (cupsRol.length > 0) {
    return {
      bloqueado: true,
      motivo: `Bloqueado: tiene ${cupsRol.length} CUPS registrados`,
      puedeAsignar: false,
      puedeCambiar: false,
    };
  }

  if (!doc) {
    return {
      bloqueado: false,
      motivo: "Sin asignar: puede elegir un profesional",
      puedeAsignar: true,
      puedeCambiar: false,
    };
  }

  return {
    bloqueado: false,
    motivo: "Sin gestión: puede cambiar por otro profesional",
    puedeAsignar: false,
    puedeCambiar: true,
  };
}

export function construirBloqueosAsignacion(encuesta, cups, asignaciones = {}) {
  const out = {};
  Object.entries(ROLES_ASIGNACION).forEach(([key, config]) => {
    out[key] = evaluarBloqueoAsignacion(
      {
        encuesta,
        cups,
        documentoAsignado: asignaciones[config.formKey] || "",
      },
      config
    );
  });
  return out;
}

export function mergeOpcionesProfesional(lista = [], documentoActual = "", nombreFallback = "") {
  const doc = String(documentoActual || "").trim();
  const base = Array.isArray(lista) ? [...lista] : [];
  if (!doc) return base;
  const exists = base.some((item) => String(item?.numDocumento || "").trim() === doc);
  if (exists) return base;
  return [
    {
      numDocumento: doc,
      nombre: nombreFallback || `Asignado actual (${doc})`,
    },
    ...base,
  ];
}

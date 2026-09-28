import http from "./http";

const MAX_BULK_ENCUESTA_IDS = 2000;

export const informesApi = {
  getProfesionalFacturacion: async (params = {}) => {
    const { data } = await http.get("/informes/profesionales-facturacion", { params });
    return {
      rows: Array.isArray(data?.rows) ? data.rows : [],
      resumen: data?.resumen || { totalPacientes: 0, totalCups: 0 },
    };
  },

  getIndicadoresSalud: async (params = {}) => {
    const { data } = await http.get("/informes/indicadores", { params });
    return {
      totalPacientes: Number(data?.totalPacientes || 0),
      totalEncuestas: Number(data?.totalEncuestas || 0),
      totalCaracterizados: Number(data?.totalCaracterizados || 0),
      indicadores: Array.isArray(data?.indicadores) ? data.indicadores : [],
      detalle: Array.isArray(data?.detalle) ? data.detalle : [],
    };
  },

  getAsignacionesCupsBulk: async (encuestaIds = []) => {
    const ids = Array.from(
      new Set((encuestaIds || []).map((id) => String(id || "").trim()).filter(Boolean))
    );
    if (!ids.length) {
      return { asignaciones: {} };
    }

    const asignaciones = {};
    for (let i = 0; i < ids.length; i += MAX_BULK_ENCUESTA_IDS) {
      const chunk = ids.slice(i, i + MAX_BULK_ENCUESTA_IDS);
      const { data } = await http.post("/informes/asignaciones-cups", { encuestaIds: chunk });
      const parcial = data?.asignaciones && typeof data.asignaciones === "object"
        ? data.asignaciones
        : {};
      Object.assign(asignaciones, parcial);
    }

    return { asignaciones };
  },
};

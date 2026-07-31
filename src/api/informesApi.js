import http from "./http";

export const informesApi = {
  getProfesionalFacturacion: async (params = {}) => {
    const { data } = await http.get("/informes/profesionales-facturacion", { params });
    return {
      rows: Array.isArray(data?.rows) ? data.rows : [],
      resumen: data?.resumen || { totalPacientes: 0, totalCups: 0 },
    };
  },

  getAsignacionesCupsBulk: async (encuestaIds = []) => {
    const ids = Array.from(
      new Set((encuestaIds || []).map((id) => String(id || "").trim()).filter(Boolean))
    );
    if (!ids.length) {
      return { asignaciones: {} };
    }

    const { data } = await http.post("/informes/asignaciones-cups", { encuestaIds: ids });
    return {
      asignaciones: data?.asignaciones && typeof data.asignaciones === "object"
        ? data.asignaciones
        : {},
    };
  },
};

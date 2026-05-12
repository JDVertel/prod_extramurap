import http from "./http";

export const informesApi = {
  getProfesionalFacturacion: async (params = {}) => {
    const { data } = await http.get("/informes/profesionales-facturacion", { params });
    return {
      rows: Array.isArray(data?.rows) ? data.rows : [],
      resumen: data?.resumen || { totalPacientes: 0, totalCups: 0 },
    };
  },
};

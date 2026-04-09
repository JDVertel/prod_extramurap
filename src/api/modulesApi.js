import http from "./http";

function buildCrud(moduleName) {
  return {
    list: async (params = {}) => {
      const { data } = await http.get(`/${moduleName}`, { params });
      return Array.isArray(data) ? data : [];
    },
    getById: async (id) => {
      const { data } = await http.get(`/${moduleName}/${id}`);
      return data;
    },
    create: async (payload) => {
      const { data } = await http.post(`/${moduleName}`, payload);
      return data;
    },
    replace: async (id, payload) => {
      const { data } = await http.put(`/${moduleName}/${id}`, payload);
      return data;
    },
    update: async (id, payload) => {
      const { data } = await http.patch(`/${moduleName}/${id}`, payload);
      return data;
    },
    remove: async (id) => {
      const { data } = await http.delete(`/${moduleName}/${id}`);
      return data;
    },
  };
}

export const encuestasApi = buildCrud("encuestas");
export const encuestaActividadesApi = buildCrud("encuesta_actividades");
export const asignacionesApi = buildCrud("asignaciones");
export const agendasApi = buildCrud("agendas");
export const caracterizacionApi = {
  ...buildCrud("caracterizacion"),
  getByEncuestaId: async (encuestaId) => {
    const { data } = await http.get(`/caracterizacion/by-encuesta/${encuestaId}`);
    return data;
  },
};

export const comunasBarriosApi = buildCrud("comunas_barrios");
export const epsApi = buildCrud("eps");
export const ipsApi = buildCrud("ips");
export const cupsApi = buildCrud("cups");
export const actividadesExtraApi = buildCrud("actividades_extra");
export const contratosApi = buildCrud("contratos");

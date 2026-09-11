import http from "./http";

export async function getPendientesFacturacion(params = {}) {
  const { data } = await http.get("/facturacion/pendientes", { params });
  return Array.isArray(data) ? data : [];
}

export async function getHistorialFacturacion(params = {}) {
  const { data } = await http.get("/facturacion/historial", { params });
  return Array.isArray(data) ? data : [];
}

export async function getDisponiblesFacturacionPorRango(params = {}) {
  const { data } = await http.get("/facturacion/disponibles", { params });
  return Array.isArray(data) ? data : [];
}

export async function getDisponiblesFacturacionPorDocumento(params = {}) {
  const { data } = await http.get("/facturacion/disponibles-por-documento", { params });
  return Array.isArray(data) ? data : [];
}

export async function cerrarDepuracionMasiva(payload = {}) {
  const { data } = await http.post("/facturacion/cerrar-depuracion", payload);
  return data;
}

export async function getInformeCerradosFacturacion(params = {}) {
  const { data } = await http.get("/facturacion/informe-cerrados", { params });
  return {
    periodo: data?.periodo || {},
    totales: data?.totales || {
      pacientesCerrados: 0,
      cupsRegistrados: 0,
      cupsFacturados: 0,
      cantidadCups: 0,
      facturasEmitidas: 0,
    },
    detalle: Array.isArray(data?.detalle) ? data.detalle : [],
    porConvenio: Array.isArray(data?.porConvenio) ? data.porConvenio : [],
    porGrupo: Array.isArray(data?.porGrupo) ? data.porGrupo : [],
    porConvenioGrupo: Array.isArray(data?.porConvenioGrupo) ? data.porConvenioGrupo : [],
    porProfesional: Array.isArray(data?.porProfesional) ? data.porProfesional : [],
    porEps: Array.isArray(data?.porEps) ? data.porEps : [],
    porActividad: Array.isArray(data?.porActividad) ? data.porActividad : [],
    porCups: Array.isArray(data?.porCups) ? data.porCups : [],
    porDia: Array.isArray(data?.porDia) ? data.porDia : [],
  };
}

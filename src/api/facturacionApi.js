import http from "./http";

export async function getPendientesFacturacion(params = {}) {
  const { data } = await http.get("/facturacion/pendientes", { params });
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

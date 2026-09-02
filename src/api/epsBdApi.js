import http from "./http";

export async function listEpsBd() {
  const { data } = await http.get("/eps-bd");
  return Array.isArray(data) ? data : [];
}

export async function createEpsBd(payload) {
  const { data } = await http.post("/eps-bd", payload);
  return data;
}

export async function updateEpsBd(id, payload) {
  const { data } = await http.patch(`/eps-bd/${id}`, payload);
  return data;
}

export async function deleteEpsBd(id) {
  const { data } = await http.delete(`/eps-bd/${id}`);
  return data;
}

export async function listEpsBdRegistros(id, params = {}) {
  const { data } = await http.get(`/eps-bd/${id}/registros`, { params });
  return data;
}

export async function exportEpsBdRegistros(id) {
  const { data } = await http.get(`/eps-bd/${id}/registros/export`);
  return data;
}

export async function listEpsBdIndiceDocumentos() {
  const { data } = await http.get("/eps-bd/indice-documentos");
  return data;
}

export async function bulkImportEpsBdRegistros(id, payload) {
  const { data } = await http.post(`/eps-bd/${id}/registros/bulk`, payload);
  return data;
}

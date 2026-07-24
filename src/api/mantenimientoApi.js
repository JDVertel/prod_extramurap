import http from "./http";

export async function previewLimpiezaDocumentosPacientes() {
  const { data } = await http.get("/mantenimiento/documentos-pacientes/preview");
  return data;
}

export async function applyLimpiezaDocumentosPacientes(ids = []) {
  const { data } = await http.post("/mantenimiento/documentos-pacientes/aplicar", { ids });
  return data;
}

export async function previewEncuestasHuerfanas(meses = 1) {
  const { data } = await http.get("/mantenimiento/encuestas-huerfanas/preview", {
    params: { meses },
  });
  return data;
}

export async function eliminarEncuestasHuerfanas(ids = [], meses = 1) {
  const { data } = await http.post("/mantenimiento/encuestas-huerfanas/eliminar", {
    ids,
    meses,
  });
  return data;
}

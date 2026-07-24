export const CONVENIOS_PROGRAMA = [
  "Extramural",
  "E Basicos",
  "PIC",
  "Unidesa",
];

export const CONVENIO_UNIDESA = "Unidesa";

/** @deprecated Usar CONVENIO_UNIDESA */
export const CONVENIO_UNIDES = CONVENIO_UNIDESA;

export const CONVENIO_FORM_CLASS = {
  Extramural: "convenio-extramural",
  "E Basicos": "convenio-ebasicos",
  PIC: "convenio-pic",
  Unidesa: "convenio-unidesa",
};

export function esConvenioUnidesa(valor) {
  const convenio = String(valor || "").trim().toLowerCase();
  return convenio === "unidesa" || convenio === "unides";
}

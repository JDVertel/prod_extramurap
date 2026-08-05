/**
 * Contexto de sesión delegada (admin / accesos profesionales).
 * Query esperada: estadoView=1, profesionalDoc, profesionalCargo,
 * profesionalConvenio, profesionalNombre, profesionalGrupo.
 */

function normalizeDoc(value) {
  return String(value || "").trim();
}

export function isEstadoViewRoute(route, userData) {
  if (String(route?.query?.estadoView || "") !== "1") return false;
  const docSeleccionado = normalizeDoc(route?.query?.profesionalDoc);
  if (!docSeleccionado) return false;

  const cargoActual = String(userData?.cargo || "").trim().toLowerCase();
  const esAdmin =
    cargoActual === "admin" ||
    cargoActual === "administrador" ||
    cargoActual === "superusuario";
  if (esAdmin) return true;

  const accesos = Array.isArray(userData?.accesosProfesionales)
    ? userData.accesosProfesionales
    : [];
  return accesos.map((item) => normalizeDoc(item)).includes(docSeleccionado);
}

export function getEstadoViewContext(route, userData = {}) {
  const activo = isEstadoViewRoute(route, userData);
  const documentoUsuario = normalizeDoc(userData?.numDocumento);
  const convenioUsuario = String(userData?.convenio || "").trim();
  const grupoUsuario = String(userData?.grupo || "").trim();
  const cargoUsuario = String(userData?.cargo || "").trim();
  const nombreUsuario = String(userData?.nombre || "").trim();

  if (!activo) {
    return {
      activo: false,
      documento: documentoUsuario,
      convenio: convenioUsuario,
      grupo: grupoUsuario,
      cargo: cargoUsuario,
      nombre: nombreUsuario,
    };
  }

  return {
    activo: true,
    documento: normalizeDoc(route?.query?.profesionalDoc) || documentoUsuario,
    convenio: String(route?.query?.profesionalConvenio || "").trim() || convenioUsuario,
    grupo: String(route?.query?.profesionalGrupo || "").trim() || grupoUsuario,
    cargo: String(route?.query?.profesionalCargo || "").trim() || cargoUsuario,
    nombre: String(route?.query?.profesionalNombre || "").trim() || nombreUsuario,
  };
}

export function buildEstadoViewQuery(route, extras = {}) {
  if (String(route?.query?.estadoView || "") !== "1") {
    return { ...extras };
  }

  return {
    estadoView: "1",
    profesionalDoc: normalizeDoc(route?.query?.profesionalDoc),
    profesionalCargo: String(route?.query?.profesionalCargo || "").trim(),
    profesionalConvenio: String(route?.query?.profesionalConvenio || "").trim(),
    profesionalNombre: String(route?.query?.profesionalNombre || "").trim(),
    profesionalGrupo: String(route?.query?.profesionalGrupo || "").trim(),
    ...extras,
  };
}

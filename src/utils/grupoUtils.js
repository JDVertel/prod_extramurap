export const GRUPO_FACTURADOR_TODOS = "F";

export function esFacturadorCargo(cargo) {
  const value = String(cargo || "").trim().toLowerCase();
  return value === "fact" || value === "facturador";
}

export function esGrupoFacturadorTodos(valor) {
  const lower = String(valor || "").trim().toLowerCase();
  return lower === "f" || lower === "todos";
}

export function parseGruposUsuario(valor) {
  return String(valor || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function facturadorSeleccionoTodosExplicito(valor) {
  const grupos = parseGruposUsuario(valor);
  if (!grupos.length) {
    return false;
  }

  return grupos.some((grupo) => esGrupoFacturadorTodos(grupo));
}

export function validarGruposFacturador(valor) {
  const grupos = parseGruposUsuario(valor);

  if (!grupos.length) {
    return {
      valid: false,
      normalized: "",
      error: "Seleccione Todos o al menos un grupo operativo.",
    };
  }

  if (grupos.some((grupo) => esGrupoFacturadorTodos(grupo))) {
    return {
      valid: true,
      normalized: GRUPO_FACTURADOR_TODOS,
      error: "",
    };
  }

  const especificos = Array.from(new Set(grupos));
  return {
    valid: especificos.length > 0,
    normalized: especificos.join(","),
    error: especificos.length > 0 ? "" : "Seleccione Todos o al menos un grupo operativo.",
  };
}

export function normalizarGruposFacturador(valor) {
  const grupos = parseGruposUsuario(valor);
  if (!grupos.length) {
    return GRUPO_FACTURADOR_TODOS;
  }

  const lower = grupos.map((grupo) => grupo.toLowerCase());
  if (lower.some((grupo) => esGrupoFacturadorTodos(grupo))) {
    return GRUPO_FACTURADOR_TODOS;
  }

  return Array.from(new Set(grupos)).join(",");
}

export function facturadorVeTodosLosGrupos(gruposFacturador) {
  const grupos = parseGruposUsuario(gruposFacturador);
  if (!grupos.length) {
    return true;
  }

  return grupos.some((grupo) => esGrupoFacturadorTodos(grupo));
}

export function encuestaPermitidaParaFacturador(encuestaGrupo, gruposFacturador) {
  if (facturadorVeTodosLosGrupos(gruposFacturador)) {
    return true;
  }

  const grupoEncuesta = String(encuestaGrupo || "").trim();
  if (!grupoEncuesta) {
    return false;
  }

  const grupos = parseGruposUsuario(gruposFacturador);
  return grupos.includes(grupoEncuesta);
}

export function normalizarConvenioFacturador(valor) {
  return String(valor ?? "").trim().toLowerCase();
}

export function encuestaPermitidaParaConvenioFacturador(encuestaConvenio, convenioFacturador) {
  const convenioUsuario = normalizarConvenioFacturador(convenioFacturador);
  if (!convenioUsuario) {
    return true;
  }

  return normalizarConvenioFacturador(encuestaConvenio) === convenioUsuario;
}

export function encuestaVisibleParaFacturador(encuesta = {}, gruposFacturador = "", convenioFacturador = "") {
  return encuestaPermitidaParaConvenioFacturador(encuesta?.convenio, convenioFacturador)
    && encuestaPermitidaParaFacturador(encuesta?.grupo, gruposFacturador);
}

export function formatearGruposFacturador(valor) {
  if (facturadorVeTodosLosGrupos(valor)) {
    return "Todos";
  }

  const grupos = parseGruposUsuario(valor);
  return grupos.length ? grupos.join(", ") : "Todos";
}

export function obtenerGruposOperativosDesdeUsuarios(usuarios = []) {
  const grupos = new Set();
  const cargosExcluidos = new Set(["admin", "fact", "superusuario"]);

  usuarios.forEach((usuario) => {
    const cargo = String(usuario?.cargo || "").trim().toLowerCase();
    if (cargosExcluidos.has(cargo)) {
      return;
    }

    parseGruposUsuario(usuario?.grupo).forEach((grupo) => {
      if (esGrupoFacturadorTodos(grupo) || grupo === "0") {
        return;
      }
      grupos.add(grupo);
    });
  });

  return Array.from(grupos).sort((a, b) =>
    a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
  );
}

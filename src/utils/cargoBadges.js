function normalizeCargoToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function getCargoBadgeTheme(cargo) {
  const compacto = normalizeCargoToken(cargo);

  if (compacto.includes("auxiliardeenfermeria") || compacto === "auxiliar") {
    return "badge-cargo-auxiliar";
  }

  if (compacto.includes("enfermero")) {
    return "badge-cargo-enfermero";
  }

  if (compacto.includes("medico")) {
    return "badge-cargo-medico";
  }

  if (compacto.includes("facturacion") || compacto === "fact" || compacto.includes("facturador")) {
    return "badge-cargo-facturacion";
  }

  if (compacto.includes("psicolog")) {
    return "badge-cargo-psicologo";
  }

  if (
    compacto.includes("tsocial") ||
    compacto.includes("trabajadorsocial") ||
    compacto.includes("trabajadorasocial") ||
    compacto.includes("trabajosocial")
  ) {
    return "badge-cargo-tsocial";
  }

  if (compacto.includes("nutricion")) {
    return "badge-cargo-nutricionista";
  }

  if (compacto.includes("superusuario")) {
    return "badge-cargo-superusuario";
  }

  if (compacto.includes("admin") || compacto.includes("administrador")) {
    return "badge-cargo-admin";
  }

  return "badge-cargo-default";
}

export function getCargoBadgeClass(cargo) {
  return `badge-cargo ${getCargoBadgeTheme(cargo)}`;
}
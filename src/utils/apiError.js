/**
 * Extrae y traduce mensajes de error de Axios/API a texto claro en español.
 */
export function formatApiError(error, fallback = "Ocurrió un error inesperado.") {
  if (!error) return fallback;

  const status = Number(error?.response?.status || error?.statusCode || 0);
  const data = error?.response?.data;
  const apiMessage = extractApiMessage(data);
  const axiosMessage = String(error?.message || "").trim();

  const explanation = explainHttpStatus(status);
  const baseMessage = apiMessage || (isGenericAxiosMessage(axiosMessage) ? "" : axiosMessage) || fallback;

  const parts = [];
  if (baseMessage) parts.push(baseMessage);
  if (explanation && !String(baseMessage).toLowerCase().includes(explanation.toLowerCase().slice(0, 20))) {
    parts.push(explanation);
  }

  const detail = extractApiDetail(data);
  if (detail) {
    parts.push(`Detalle: ${detail}`);
  }

  if (status > 0) {
    parts.push(`Código: ${status}`);
  }

  return parts.filter(Boolean).join("\n\n") || fallback;
}

function extractApiMessage(data) {
  if (!data) return "";
  if (typeof data === "string") return data.trim();
  if (typeof data?.message === "string" && data.message.trim()) return data.message.trim();
  if (typeof data?.error === "string" && data.error.trim()) return data.error.trim();
  if (typeof data?.error?.message === "string" && data.error.message.trim()) {
    return data.error.message.trim();
  }
  return "";
}

function extractApiDetail(data) {
  const detail = data?.detail;
  if (!detail) return "";
  if (typeof detail === "string") return detail.trim();
  if (typeof detail?.message === "string") return detail.message.trim();
  if (typeof detail === "object") {
    try {
      return JSON.stringify(detail);
    } catch (_) {
      return "";
    }
  }
  return String(detail);
}

function isGenericAxiosMessage(message) {
  return /^request failed with status code \d+$/i.test(String(message || "").trim());
}

function explainHttpStatus(status) {
  switch (status) {
    case 400:
      return "No se pudo completar la operación por datos inválidos o incompletos. Revise EPS, actividad y CUPS seleccionados.";
    case 401:
      return "Su sesión expiró o no está autenticado. Inicie sesión nuevamente.";
    case 403:
      return "No tiene permisos para realizar esta acción.";
    case 404:
      return "No se encontró el registro solicitado (puede haber sido eliminado).";
    case 409:
      return "Hay un conflicto con información ya registrada (posible duplicado).";
    case 422:
      return "Los datos enviados no cumplen las reglas de validación.";
    case 423:
      return "El recurso está bloqueado temporalmente.";
    case 500:
      return "Error interno del servidor. Intente de nuevo o contacte soporte si persiste.";
    default:
      return "";
  }
}

export function throwApiError(error, fallback) {
  throw new Error(formatApiError(error, fallback));
}

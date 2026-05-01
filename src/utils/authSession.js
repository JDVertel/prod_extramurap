const AUTH_STORAGE_KEYS = ["token", "uid", "userData"];

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);

  // Si no se puede leer el token, tratarlo como invalido.
  if (!payload || typeof payload.exp !== "number") return true;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
}

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}


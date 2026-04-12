const STORAGE_KEY = "extramurapp_version_text";
const DEFAULT_VERSION_TEXT = "Version 2.6 | 25/03/2026";

export function getAppVersionText() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const value = String(raw || "").trim();
    return value || DEFAULT_VERSION_TEXT;
  } catch (_) {
    return DEFAULT_VERSION_TEXT;
  }
}

export function setAppVersionText(value) {
  const normalized = String(value || "").trim() || DEFAULT_VERSION_TEXT;
  localStorage.setItem(STORAGE_KEY, normalized);
  return normalized;
}

export function getDefaultAppVersionText() {
  return DEFAULT_VERSION_TEXT;
}

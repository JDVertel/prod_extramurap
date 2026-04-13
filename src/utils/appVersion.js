export const APP_VERSION_STORAGE_KEY = "extramurapp_version_text";
export const APP_VERSION_UPDATED_EVENT = "extramurapp:version-updated";
const DEFAULT_VERSION_TEXT = "Version 2.6 | 25/03/2026";

export function getAppVersionText() {
  try {
    const raw = localStorage.getItem(APP_VERSION_STORAGE_KEY);
    const value = String(raw || "").trim();
    return value || DEFAULT_VERSION_TEXT;
  } catch (_) {
    return DEFAULT_VERSION_TEXT;
  }
}

export function setAppVersionText(value) {
  const normalized = String(value || "").trim() || DEFAULT_VERSION_TEXT;
  localStorage.setItem(APP_VERSION_STORAGE_KEY, normalized);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(APP_VERSION_UPDATED_EVENT, {
        detail: { value: normalized },
      })
    );
  }
  return normalized;
}

export function getDefaultAppVersionText() {
  return DEFAULT_VERSION_TEXT;
}

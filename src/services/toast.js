import { reactive } from "vue";

const DEFAULT_TIMEOUT = 4500;
const MAX_TOASTS = 5;

const TYPE_CONFIG = {
  success: { title: "Exito", timeout: 4200 },
  error: { title: "Error", timeout: 6500 },
  warning: { title: "Atencion", timeout: 5200 },
  info: { title: "Informacion", timeout: 4200 },
};

const state = reactive({
  items: [],
});

let seed = 0;

function normalizeMessage(message) {
  if (message === null || message === undefined) {
    return "";
  }

  if (message instanceof Error) {
    return message.message || "Ocurrio un error inesperado.";
  }

  if (typeof message === "object") {
    try {
      return JSON.stringify(message, null, 2);
    } catch (_) {
      return String(message);
    }
  }

  return String(message);
}

function inferTypeFromMessage(message) {
  const text = normalizeMessage(message).toLowerCase();

  if (!text) return "info";

  if (/^✅|exito|exitosamente|guardado|actualizado|creado|eliminado|copiada|copiado|correctamente/.test(text)) {
    return "success";
  }

  if (/^⚠️|^advertencia|atencion|debe|debes|por favor|no se puede|bloqueado|valida|validar/.test(text)) {
    return "warning";
  }

  if (/^❌|error|incorrecta|incorrecto|fallo|falló|no fue posible|no se pudo|denegado|inactivo/.test(text)) {
    return "error";
  }

  return "info";
}

function removeToast(id) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index >= 0) {
    state.items.splice(index, 1);
  }
}

function scheduleRemoval(toast) {
  if (!toast.timeout || toast.persistent) {
    return;
  }

  toast.timer = window.setTimeout(() => {
    removeToast(toast.id);
  }, toast.timeout);
}

function createToast(message, options = {}) {
  const type = options.type || inferTypeFromMessage(message);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const toast = {
    id: `${Date.now()}_${seed += 1}`,
    type,
    title: options.title || config.title,
    message: normalizeMessage(message),
    timeout: options.timeout ?? config.timeout ?? DEFAULT_TIMEOUT,
    persistent: Boolean(options.persistent),
    timer: null,
  };

  state.items.unshift(toast);

  if (state.items.length > MAX_TOASTS) {
    const overflow = state.items.splice(MAX_TOASTS);
    overflow.forEach((item) => {
      if (item.timer) {
        window.clearTimeout(item.timer);
      }
    });
  }

  scheduleRemoval(toast);
  return toast.id;
}

function clearToasts() {
  state.items.forEach((item) => {
    if (item.timer) {
      window.clearTimeout(item.timer);
    }
  });
  state.items.splice(0, state.items.length);
}

export const toastStore = state;

export const toast = {
  show(message, options = {}) {
    return createToast(message, options);
  },
  success(message, options = {}) {
    return createToast(message, { ...options, type: "success" });
  },
  error(message, options = {}) {
    return createToast(message, { ...options, type: "error" });
  },
  warning(message, options = {}) {
    return createToast(message, { ...options, type: "warning" });
  },
  info(message, options = {}) {
    return createToast(message, { ...options, type: "info" });
  },
  remove(id) {
    removeToast(id);
  },
  clear() {
    clearToasts();
  },
};

export function installToast(app) {
  app.config.globalProperties.$toast = toast;
  app.provide("toast", toast);
}

export function installAlertInterceptor() {
  if (typeof window === "undefined" || window.__extramurappAlertPatched) {
    return;
  }

  const nativeAlert = window.alert?.bind(window);

  window.__extramurappNativeAlert = nativeAlert;
  window.alert = (message) => {
    toast.show(message, { type: inferTypeFromMessage(message) });
  };
  window.__extramurappAlertPatched = true;
}
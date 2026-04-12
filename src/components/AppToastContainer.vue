<script>
import { toast, toastStore } from "../services/toast";

const ICONS_BY_TYPE = {
    success: "bi-check-circle-fill",
    error: "bi-x-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
};

export default {
    name: "AppToastContainer",
    data() {
        return {
            store: toastStore,
        };
    },
    methods: {
        closeToast(id) {
            toast.remove(id);
        },
        getIcon(type) {
            return ICONS_BY_TYPE[type] || ICONS_BY_TYPE.info;
        },
    },
};
</script>

<template>
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
        <transition-group name="toast-fade" tag="div">
            <article
                v-for="item in store.items"
                :key="item.id"
                class="app-toast"
                :class="`toast-${item.type}`"
                role="status"
            >
                <div class="toast-icon-wrap">
                    <i class="bi" :class="getIcon(item.type)"></i>
                </div>
                <div class="toast-copy">
                    <strong class="toast-title">{{ item.title }}</strong>
                    <div class="toast-message">{{ item.message }}</div>
                </div>
                <button type="button" class="toast-close" @click="closeToast(item.id)" aria-label="Cerrar mensaje">
                    <i class="bi bi-x-lg"></i>
                </button>
            </article>
        </transition-group>
    </div>
</template>

<style scoped>
.toast-stack {
    position: fixed;
    top: 5rem;
    right: 1rem;
    z-index: 3000;
    width: min(380px, calc(100vw - 1.5rem));
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    pointer-events: none;
}

.app-toast {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.85rem;
    align-items: start;
    padding: 0.95rem 1rem;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(148, 163, 184, 0.26);
    border-left-width: 5px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
    backdrop-filter: blur(12px);
    pointer-events: auto;
}

.toast-success {
    border-left-color: #16a34a;
}

.toast-error {
    border-left-color: #dc2626;
}

.toast-warning {
    border-left-color: #d97706;
}

.toast-info {
    border-left-color: #0891b2;
}

.toast-icon-wrap {
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 1rem;
    color: #fff;
}

.toast-success .toast-icon-wrap {
    background: #16a34a;
}

.toast-error .toast-icon-wrap {
    background: #dc2626;
}

.toast-warning .toast-icon-wrap {
    background: #d97706;
}

.toast-info .toast-icon-wrap {
    background: #0891b2;
}

.toast-copy {
    min-width: 0;
}

.toast-title {
    display: block;
    color: #0f172a;
    font-size: 0.94rem;
    margin-bottom: 0.2rem;
}

.toast-message {
    color: #334155;
    font-size: 0.88rem;
    line-height: 1.45;
    white-space: pre-line;
    word-break: break-word;
}

.toast-close {
    border: none;
    background: transparent;
    color: #64748b;
    padding: 0.15rem;
    line-height: 1;
}

.toast-close:hover {
    color: #0f172a;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
    transition: opacity 0.22s ease, transform 0.22s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
    opacity: 0;
    transform: translateY(-8px) translateX(16px);
}

@media (max-width: 767px) {
    .toast-stack {
        top: 4.5rem;
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
    }

    .app-toast {
        border-radius: 14px;
        padding: 0.85rem 0.9rem;
    }
}
</style>
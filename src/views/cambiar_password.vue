<template>
    <div class="cambiar-pwd-layout">
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-12 col-sm-10 col-md-6 col-lg-5">
                    <div class="card shadow-sm border-0 rounded-4 p-4">
                        <div class="text-center mb-3">
                            <i class="bi bi-shield-lock-fill text-primary" style="font-size: 2.5rem;"></i>
                            <h4 class="mt-2 mb-0 fw-semibold">Cambiar contraseña</h4>
                        </div>

                        <!-- Alerta cuando es obligatorio (primer ingreso) -->
                        <div v-if="esPrimerIngreso" class="alert alert-warning py-2 mb-3">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            <strong>Contraseña temporal.</strong>
                            Debes asignar una contraseña permanente para continuar.
                        </div>

                        <div v-if="!esPrimerIngreso" class="mb-3">
                            <label class="form-label fw-medium">
                                <i class="bi bi-shield-lock me-1"></i> Contraseña actual
                            </label>
                            <div class="input-group">
                                <input
                                    v-model="currentPassword"
                                    :type="mostrarActual ? 'text' : 'password'"
                                    class="form-control"
                                    placeholder="Ingresa tu contraseña actual"
                                    autocomplete="current-password"
                                    @keyup.enter="handleSubmit"
                                />
                                <button class="btn btn-outline-secondary" type="button"
                                    @click="mostrarActual = !mostrarActual">
                                    <i :class="mostrarActual ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-medium">
                                <i class="bi bi-key me-1"></i> Nueva contraseña
                            </label>
                            <div class="input-group">
                                <input
                                    v-model="newPassword"
                                    :type="mostrarNew ? 'text' : 'password'"
                                    class="form-control"
                                    placeholder="Mínimo 6 caracteres"
                                    autocomplete="new-password"
                                    @keyup.enter="handleSubmit"
                                />
                                <button class="btn btn-outline-secondary" type="button"
                                    @click="mostrarNew = !mostrarNew">
                                    <i :class="mostrarNew ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                </button>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-medium">
                                <i class="bi bi-key me-1"></i> Confirmar contraseña
                            </label>
                            <div class="input-group">
                                <input
                                    v-model="confirmPassword"
                                    :type="mostrarConfirm ? 'text' : 'password'"
                                    class="form-control"
                                    placeholder="Repite la nueva contraseña"
                                    autocomplete="new-password"
                                    @keyup.enter="handleSubmit"
                                />
                                <button class="btn btn-outline-secondary" type="button"
                                    @click="mostrarConfirm = !mostrarConfirm">
                                    <i :class="mostrarConfirm ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                                </button>
                            </div>
                        </div>

                        <button
                            class="btn btn-primary w-100 py-2 fw-semibold"
                            :disabled="guardando"
                            @click="handleSubmit"
                        >
                            <span v-if="guardando">
                                <span class="spinner-border spinner-border-sm me-2"></span>
                                Guardando...
                            </span>
                            <span v-else>
                                <i class="bi bi-check-circle me-2"></i>Guardar nueva contraseña
                            </span>
                        </button>

                        <button
                            v-if="!esPrimerIngreso"
                            class="btn btn-link mt-2 w-100 text-secondary"
                            @click="$router.back()"
                        >
                            Cancelar
                        </button>

                        <div v-if="error" class="alert alert-danger mt-3 py-2 mb-0">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
                        </div>
                        <div v-if="exito" class="alert alert-success mt-3 py-2 mb-0">
                            <i class="bi bi-check-circle-fill me-2"></i>{{ exito }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { changePassword } from "@/api/authApi";

export default {
    name: "CambiarPassword",
    data() {
        return {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            mostrarActual: false,
            mostrarNew: false,
            mostrarConfirm: false,
            guardando: false,
            error: "",
            exito: "",
        };
    },
    computed: {
        esPrimerIngreso() {
            if (this.$route.query.required === "true") {
                return true;
            }

            try {
                const raw = localStorage.getItem("userData");
                const userData = raw ? JSON.parse(raw) : null;
                return Boolean(userData?.mustChangePassword);
            } catch (_) {
                return false;
            }
        },
    },
    methods: {
        async handleSubmit() {
            this.error = "";
            this.exito = "";

            if (!this.esPrimerIngreso && !this.currentPassword) {
                this.error = "Debes ingresar tu contraseña actual para cambiar la clave.";
                return;
            }

            if (!this.newPassword || this.newPassword.length < 6) {
                this.error = "La contraseña debe tener al menos 6 caracteres.";
                return;
            }
            if (this.newPassword !== this.confirmPassword) {
                this.error = "Las contraseñas no coinciden.";
                return;
            }

            this.guardando = true;
            try {
                const token = localStorage.getItem("token");
                await changePassword({
                    newPassword: this.newPassword,
                    currentPassword: this.esPrimerIngreso ? undefined : this.currentPassword,
                }, token);

                // Actualizar userData local para quitar el flag
                const raw = localStorage.getItem("userData");
                if (raw) {
                    const userData = JSON.parse(raw);
                    userData.mustChangePassword = false;
                    localStorage.setItem("userData", JSON.stringify(userData));
                    this.$store.commit("setUserData", userData);
                }

                this.exito = "Contraseña actualizada correctamente.";
                this.currentPassword = "";
                this.newPassword = "";
                this.confirmPassword = "";

                // Redirigir al home después de 1.2s
                setTimeout(() => {
                    this.$router.push("/homeviews");
                }, 1200);
            } catch (err) {
                this.error = err?.response?.data?.message || "No se pudo actualizar la contraseña. Intenta de nuevo.";
            } finally {
                this.guardando = false;
            }
        },
    },
};
</script>

<style scoped>
.cambiar-pwd-layout {
    min-height: 100vh;
    background: #f4f6fb;
}
</style>

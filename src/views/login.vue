<template>
    <div class="login-layout" :style="loginBackgroundStyle">
        <div class="login-container">
            <div class="card p-4 shadow login-card">
                <img src="@/assets/images/logo_extramurapp.png" alt="Logo Extramuralapp" class="login-logo-bg" />

                <!-- FORMULARIO DE LOGIN -->
                <template v-if="!mustChangePassword">
                    <h2 class="text-center mb-4">Iniciar Sesión</h2>
                    <form @submit.prevent="handleLogin">
                        <div class="mb-3">
                            <label for="email" class="form-label"><i class="bi bi-person-circle text-center"></i>
                                Email</label>
                            <input v-model="email" type="email" class="form-control" id="email"
                                placeholder="Ingresa tu email" autocomplete="username" required />
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label"><i class="bi bi-key"></i> Contraseña</label>
                            <input v-model="password" type="password" class="form-control" id="password"
                                placeholder="Ingresa tu contraseña" autocomplete="current-password" required />
                        </div>
                        <button type="submit" class="buttonLogin mb-3 w-100">Entrar</button>
                    </form>
                    <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
                    </div>
                
                </template>

                <!-- FORMULARIO DE CAMBIO DE CONTRASEÑA (primer ingreso) -->
                <template v-else>
                    <h2 class="text-center mb-3">Cambiar contraseña</h2>
                    <div class="alert alert-warning py-2 mb-3">
                        <i class="bi bi-shield-exclamation me-2"></i>
                        <strong>Tu contraseña es temporal.</strong><br>
                        <small>Asigna una contraseña permanente para continuar.</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-key-fill"></i> Nueva contraseña</label>
                        <input v-model="newPassword" type="password" class="form-control"
                            placeholder="Mínimo 6 caracteres" autocomplete="new-password" />
                    </div>
                    <div class="mb-3">
                        <label class="form-label"><i class="bi bi-key-fill"></i> Confirmar contraseña</label>
                        <input v-model="confirmPassword" type="password" class="form-control"
                            placeholder="Repite la nueva contraseña" autocomplete="new-password" />
                    </div>
                    <button type="button" class="buttonLogin mb-3 w-100"
                        :disabled="cambiandoPassword" @click="handleChangePassword">
                        {{ cambiandoPassword ? 'Guardando...' : 'Guardar nueva contraseña' }}
                    </button>
                    <div v-if="errorCambio" class="alert alert-danger py-2">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorCambio }}
                    </div>
                </template>
            </div>
        </div>
        <footer class="login-footer-version" role="contentinfo">
            <span class="login-footer-brand">ExtramurApp ®</span>
            <span class="login-footer-separator">|</span>
            <span>Version 3.0 - 13/04/2026</span>
        </footer>
    </div>
</template>

<script>
import { loginWithApi } from "@/api/authApi";
import { emailExists } from "@/api/usersApi";
import {
    APP_VERSION_STORAGE_KEY,
    APP_VERSION_UPDATED_EVENT,
    getAppVersionText,
} from "@/utils/appVersion";

const loginBackgroundModules = import.meta.glob("@/assets/images/ramdom/*.{jpg,jpeg,png,webp}", {
    eager: true,
    import: "default",
});

const LAST_LOGIN_BACKGROUND_KEY = "extramurapp_last_login_background";

export default {
    name: "App",
    data() {
        return {
            email: "",
            password: "",
            errorMessage: "",
            intentosRestantes: 3,
            logueado: false,
            appVersionText: "",
            loginBackgroundImages: [],
            currentBackgroundUrl: "",
            userData: {
                rol: null,
            },
        };
    },
    computed: {
        loginBackgroundStyle() {
            const fallback = new URL("../assets/images/fondo_extramurapp.jpg", import.meta.url).href;
            const imageUrl = this.currentBackgroundUrl || fallback;

            return {
                backgroundImage: `url("${imageUrl}")`,
            };
        },
    },
    methods: {
        refrescarVersionApp() {
            this.appVersionText = getAppVersionText();
        },
        onVersionStorageChange(event) {
            if (event?.key && event.key !== APP_VERSION_STORAGE_KEY) {
                return;
            }
            this.refrescarVersionApp();
        },
        initializeBackgroundImages() {
            this.loginBackgroundImages = Object.values(loginBackgroundModules).filter(Boolean);
            const count = this.loginBackgroundImages.length;
            if (count === 0) return;

            if (count === 1) {
                this.currentBackgroundUrl = this.loginBackgroundImages[0];
                localStorage.setItem(LAST_LOGIN_BACKGROUND_KEY, this.currentBackgroundUrl);
                return;
            }

            const lastBackground = localStorage.getItem(LAST_LOGIN_BACKGROUND_KEY) || "";
            const candidates = this.loginBackgroundImages.filter((img) => img !== lastBackground);
            const pool = candidates.length > 0 ? candidates : this.loginBackgroundImages;
            this.currentBackgroundUrl = pool[Math.floor(Math.random() * pool.length)];
            localStorage.setItem(LAST_LOGIN_BACKGROUND_KEY, this.currentBackgroundUrl);
        },

        async correoExisteEnBD(correo) {
            const correoNormalizado = String(correo || "").trim().toLowerCase();
            if (!correoNormalizado) return false;

            return emailExists(correoNormalizado);
        },

        async handleLogin() {
            this.errorMessage = "";

            const correo = String(this.email || "").trim();
            if (!correo) {
                this.errorMessage = "Debes ingresar un correo electrónico.";
                return;
            }

            try {
                const existeCorreo = await this.correoExisteEnBD(correo);
                if (!existeCorreo) {
                    this.errorMessage = "El correo ingresado no existe en la base de datos.";
                    return;
                }
            } catch (error) {
                this.errorMessage = "No fue posible validar el correo en la base de datos. Intenta nuevamente.";
                console.error("Error validando correo en BD:", error);
                return;
            }

            try {
                const loginResponse = await loginWithApi(correo, this.password);
                const token = loginResponse?.token;
                const uid = loginResponse?.uid;
                const userData = loginResponse?.user;

                if (!token) {
                    throw new Error("No se recibió token de autenticación");
                }

                // Login normal (si mustChangePassword=true, el guard del router redirige a /cambiar-password)
                this.$store.dispatch("login", { token, uid });
                localStorage.setItem("token", token);
                localStorage.setItem("uid", uid);
                if (userData) {
                    localStorage.setItem("userData", JSON.stringify(userData));
                    this.$store.commit("setUserData", userData);
                }
                this.intentosRestantes = 3;
                this.$router.push("/homeviews");
            } catch (error) {
                const status = error?.response?.status;
                const detail = error?.response?.data?.detail || {};
                if (status === 401) {
                    if (typeof detail?.attemptsRemaining === "number") {
                        this.intentosRestantes = detail.attemptsRemaining;
                        this.errorMessage = `Credenciales incorrectas. Verifica tu correo y contraseña. Te quedan ${detail.attemptsRemaining} intento(s); se bloqueará el usuario al agotar los 3 intentos.`;
                    } else {
                        this.intentosRestantes = Math.max(0, Number(this.intentosRestantes || 3) - 1);
                        this.errorMessage = `Credenciales incorrectas. Verifica tu correo y contraseña. Te quedan ${this.intentosRestantes} intento(s); se bloqueará el usuario al agotar los 3 intentos.`;
                    }
                } else if (status === 423) {
                    this.intentosRestantes = 0;
                    if (detail?.permanent) {
                        this.errorMessage = "Usuario bloqueado de forma permanente. Solicita desbloqueo al administrador.";
                    } else if (typeof detail?.minutesRemaining === "number") {
                        this.errorMessage = `Usuario bloqueado. Intenta nuevamente en ${detail.minutesRemaining} minuto(s) antes de que se desbloquee automáticamente.`;
                    } else {
                        this.errorMessage = error?.response?.data?.message || "Usuario bloqueado. Contacta al administrador.";
                    }
                } else if (status === 403) {
                    this.errorMessage = "Tu usuario está inactivo. Contacta al administrador.";
                } else {
                    this.errorMessage = error?.response?.data?.message || "Error al iniciar sesión. Intenta de nuevo.";
                }
                console.error("Error en login:", error);
            }
        },

    },

    mounted() {
        this.refrescarVersionApp();
        window.addEventListener(APP_VERSION_UPDATED_EVENT, this.refrescarVersionApp);
        window.addEventListener("storage", this.onVersionStorageChange);
        this.initializeBackgroundImages();
        const token = localStorage.getItem("token");
        if (token) {
            this.$router.push("/homeviews");
        }
    },
    beforeUnmount() {
        window.removeEventListener(APP_VERSION_UPDATED_EVENT, this.refrescarVersionApp);
        window.removeEventListener("storage", this.onVersionStorageChange);
    },
};
</script>

<style scoped>
html,
body {
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden !important;
}

.login-layout {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #dceaf3;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    transition: background-image 0.45s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding-bottom: 52px;
}

.login-card {
    max-width: 400px;
    width: 90%;
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 0, 0, 0.1);
    opacity: 0.8;
}

.login-card h2 {
    font-size: 1.8rem;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-card .form-label {
    font-size: 1.1rem;
    font-weight: 500;
}

.login-card .form-control {
    font-size: 1rem;
    padding: 0.75rem;
    height: auto;
}

.login-card .buttonLogin {
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.75rem;
}

.login-card p.text-danger {
    font-size: 1rem;
}

.login-logo-bg {
    display: block;
    margin: 0 auto 25px auto;
    max-width: 260px;
    width: 100%;
    height: auto;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.login-card i.bi {
    margin-right: 8px;
    font-size: 1.3rem;
}

.login-footer-version {
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: 12px;
    z-index: 9;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(148, 163, 184, 0.34);
    border-radius: 10px;
    padding: 8px 12px;
    text-align: center;
    font-size: 0.78rem;
    letter-spacing: 0.02em;
    backdrop-filter: blur(4px);
}

.login-footer-brand {
    font-weight: 700;
}

.login-footer-separator {
    margin: 0 7px;
    opacity: 0.55;
}

@media (max-width: 767px) {
    .login-layout {
        background-position: 20% center;
        align-items: flex-end;
        padding-bottom: 20px;
    }

    .login-container {
        align-items: flex-end;
        justify-content: center;
    }

    .login-card {
        width: 95%;
        max-width: 350px;
        margin: 0 20px 20px 20px;
    }

    .login-footer-version {
        left: 12px;
        right: 12px;
        bottom: 10px;
        font-size: 0.68rem;
        padding: 7px 10px;
    }
}
</style>

<script>
import Navbar from "./components/navbar.vue";
import { mapActions, mapState } from "vuex";

export default {
    components: {
        Navbar,
    },
    data() {
        return {
            isLoggedIn: !!localStorage.getItem("token")
        };
    },
    computed: {
        ...mapState(["userData"]),
        enSesionDelegada() {
            return String(this.$route?.query?.estadoView || "") === "1";
        },
        profesionalDelegadoNombre() {
            return String(this.$route?.query?.profesionalNombre || "").trim();
        }
    },
    methods: {
        ...mapActions(["getdataips", "fetchUserDataByUid"]),
        logout() {
            localStorage.removeItem("token");
            this.isLoggedIn = false;
        },
        login(token) {
            localStorage.setItem("token", token);
            this.isLoggedIn = true;
        },
        syncUserDataFromStorage() {
            // Sincronizar userData desde localStorage si el Store está vacío
            if ((!this.userData || !this.userData.numDocumento)) {
                const storedUserData = localStorage.getItem("userData");
                if (storedUserData) {
                    try {
                        const parsed = JSON.parse(storedUserData);
                        if (parsed && parsed.numDocumento) {
                            this.$store.commit("setUserData", parsed);
                            console.log('✓ userData sincronizado desde localStorage');
                        }
                    } catch (e) {
                        console.error('Error al sincronizar userData:', e);
                    }
                }
            }
        },
        async syncIpsFromDb() {
            try {
                await this.getdataips(null);
            } catch (e) {
                console.error("Error al sincronizar IPS global:", e);
            }
        },
        getRutaPropiaPorCargo() {
            const cargo = String(this.userData?.cargo || "").trim();
            const mapa = {
                Medico: "/sop_profesional",
                Enfermero: "/sop_enfermero",
                Psicologo: "/sop_psicologo",
                Tsocial: "/sop_tsocial",
                Nutricionista: "/sop_nutricionista",
                Fact: "/sop_facturacion",
                "Auxiliar de enfermeria": "/sop_aux",
            };
            return mapa[cargo] || "/homeviews";
        },
        cerrarSesionDelegada() {
            const retornoGuardado = sessionStorage.getItem("estadoViewReturnTo");
            sessionStorage.removeItem("estadoViewReturnTo");
            const destino = retornoGuardado || this.getRutaPropiaPorCargo();
            this.$router.push(destino);
        }
    },
    watch: {
        '$route'() {
            // Sincronizar userData cada vez que cambia la ruta
            this.$nextTick(async () => {
                this.syncUserDataFromStorage();
                this.syncIpsFromDb();
                const uid = localStorage.getItem("uid");
                const token = localStorage.getItem("token");
                if (uid && token) {
                    try {
                        await this.fetchUserDataByUid(uid);
                    } catch (e) {
                        console.warn("No se pudo refrescar userData en cambio de ruta:", e);
                    }
                }
            });
        }
    },
    async mounted() {
        console.log('App.vue mounted');
        this.syncUserDataFromStorage();
        this.syncIpsFromDb();
        const uid = localStorage.getItem("uid");
        const token = localStorage.getItem("token");
        if (uid && token) {
            try {
                await this.fetchUserDataByUid(uid);
            } catch (e) {
                console.warn("No se pudo refrescar userData desde la API:", e);
            }
        }
    },
    created() {
        // Sincronizar también en created para que sea más rápido
        this.syncUserDataFromStorage();
        this.syncIpsFromDb();
    }
}
</script>

<template>
     <div id="app">
        <Navbar v-if="!$route.meta.hideNavbar" />
        <router-view :key="$route.path">
        </router-view>
        <div v-if="enSesionDelegada" class="delegated-session-footer">
            <div class="delegated-session-footer-text">
                Visualizando bandeja delegada
                <strong v-if="profesionalDelegadoNombre">: {{ profesionalDelegadoNombre }}</strong>
            </div>
            <button type="button" class="btn btn-sm btn-warning" @click="cerrarSesionDelegada">
                Cerrar sesión delegada
            </button>
        </div>
    </div>
</template>

<style>
* {
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    background: #fff;
    color: #333;
    line-height: 1.6;
}

#app {
    width: 100%;
    min-height: 100vh;
    position: relative;
}

.delegated-session-footer {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 12px;
    z-index: 1055;
    background: rgba(23, 23, 23, 0.9);
    color: #fff;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.delegated-session-footer-text {
    font-size: 0.86rem;
}

/* Transiciones para cambio de rutas */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Mejoras generales para formularios */
.form-control {
    border-radius: 8px;
    border: 1px solid #e1e5e9;
    padding: 12px 15px;
    transition: all 0.2s ease;
}

.form-control:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Cards mejorados */
.card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
}

.card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* Animación para elementos que aparecen */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: fadeInUp 0.5s ease-out;
}

/* Responsive utilities */
@media (max-width: 768px) {
    .container-fluid {
        padding-left: 15px;
        padding-right: 15px;
    }

    .delegated-session-footer {
        flex-direction: column;
        align-items: stretch;
    }
}
.container,
.container-sm,
.container-md,
.container-lg,
.container-xl,
.container-xxl {
    max-width: 100% !important;
    width: 100% !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
}
</style>

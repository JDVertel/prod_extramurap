<template>
    <div>

        <div v-if="getUserData">
            <div class="container mt-1">
                <div class="col-12"> <img :src="logo" alt="Logo Extramurapp" class="img-fluid mb-3" /></div>
                <h2>{{ getUserData.convenio }}</h2>

                <div class="row">

                    <hr>
                    <h2>Bienvenid@</h2>
                    <div class="col-6 col-md-6 mb-6">
                        <h4>Usuario</h4>
                        {{ getUserData.nombre }} <br />
                        {{ getUserData.cargo }} <br />
                        Grupo: {{ getUserData.grupo }} <br />
                    </div>
                    <div class="col-6 col-md-6">

                        <ul>
                            <h4>IPS</h4>
                            <li class="list-group-item">{{ dataips.nombre }}</li>
                            <li class="list-group-item">Nit: {{ dataips.nit }}</li>
                            <li class="list-group-item">Cod Habilitacion: {{ codHabActual }}</li>
                            <li class="list-group-item">{{ dataips.dpto }}</li>
                        </ul>
                    </div>
                    <div class="col-12 mt-3">
                        <h4>Profesionales de tu grupo y convenio</h4>
                        <div v-if="cargandoProfesionales" class="text-muted">Cargando profesionales...</div>
                        <div v-else-if="profesionalesMismoGrupoConvenio.length === 0" class="text-muted">
                            No hay profesionales para tu grupo y convenio.
                        </div>
                        <ul v-else class="list-group">
                            <li v-for="profesional in profesionalesMismoGrupoConvenio" :key="profesional.id"
                                class="list-group-item d-flex justify-content-between align-items-center">
                                <span>{{ profesional.nombre }}</span>
                                <span class="badge bg-primary">{{ profesional.cargo }}</span>
                            </li>
                        </ul>
                    </div>
                    <hr>

                </div>
            </div>

        </div>
        <p v-else>Cargando...</p>

        <footer>
            <p>© 2026 BigDataManagements SAS - All rights reserved</p>
        </footer>
    </div>
</template>

<script>
import logo from "../assets/images/logo_extramurapp.png";
import {
    mapActions,
    mapGetters,
    mapState
} from "vuex";

export default {
    data() {
        return {
            logo,
            token: localStorage.getItem("token"),
            uid: localStorage.getItem("uid"),
            idips: null,
            cargandoProfesionales: false,
            profesionalesMismoGrupoConvenio: [],
            homeLoadPromise: null,
            homeLoadKey: "",
        };
    },
    methods: {
        ...mapActions(["fetchUserDataByUid", "getdataips", "consultarUsuariosApi"]),

        buildHomeLoadKey(userData = {}) {
            const grupo = String(userData?.grupo || "").trim();
            const convenio = String(userData?.convenio || "").trim();
            const ipsId = String(userData?.ipsId || userData?.ips_id || userData?.idips || "").trim();
            return [String(this.uid || "").trim(), grupo, convenio, ipsId].join("|");
        },

        async cargarDatosHome(force = false) {
            const userData = this.getUserData || {};
            if (!userData?.numDocumento) {
                return;
            }

            const nextKey = this.buildHomeLoadKey(userData);
            if (!force && this.homeLoadPromise) {
                return this.homeLoadPromise;
            }

            if (!force && nextKey && this.homeLoadKey === nextKey) {
                return;
            }

            this.homeLoadKey = nextKey;
            this.homeLoadPromise = (async () => {
                await this.cargarIpsDelUsuario();
                await this.cargarProfesionalesMismoGrupoConvenio();
            })();

            try {
                await this.homeLoadPromise;
            } finally {
                this.homeLoadPromise = null;
            }
        },

        async cargarIpsDelUsuario() {
            const ipsId = String(this.getUserData?.ipsId || "").trim();
            this.idips = ipsId || null;

            if (!ipsId) {
                this.$store.commit("setdatosips", {});
                return;
            }

            try {
                await this.getdataips(ipsId);
            } catch (error) {
                console.error("Error cargando IPS del usuario:", error);
            }
        },

        async cargarProfesionalesMismoGrupoConvenio() {
            if (!this.getUserData?.grupo || !this.getUserData?.convenio) {
                this.profesionalesMismoGrupoConvenio = [];
                return;
            }

            this.cargandoProfesionales = true;
            try {
                const usuarios = await this.consultarUsuariosApi();
                this.profesionalesMismoGrupoConvenio = (usuarios || []).filter((usuario) => {
                    const mismoGrupo = String(usuario?.grupo || "") === String(this.getUserData.grupo || "");
                    const mismoConvenio = String(usuario?.convenio || "") === String(this.getUserData.convenio || "");
                    const tieneNombre = !!usuario?.nombre;
                    const tieneCargo = !!usuario?.cargo;
                    return mismoGrupo && mismoConvenio && tieneNombre && tieneCargo;
                });
            } catch (error) {
                console.error("Error cargando profesionales del grupo/convenio:", error);
                this.profesionalesMismoGrupoConvenio = [];
            } finally {
                this.cargandoProfesionales = false;
            }
        }

    },
    computed: {
        ...mapGetters(["getUserData"]),
        ...mapState(["dataips"]),
        codHabActual() {
            return this.dataips?.codHab || this.dataips?.cod_hab || "";
        },
    },
    watch: {
        getUserData: {
            immediate: true,
            async handler(nuevoValor) {
                if (!nuevoValor?.numDocumento) {
                    return;
                }
                await this.cargarDatosHome();
            }
        }
    },
    async mounted() {
        if (this.uid) {
            if (!this.getUserData?.numDocumento) {
                await this.fetchUserDataByUid(this.uid);
            }
        } else {
            console.warn("UID no disponible para cargar datos de usuario");
        }
        await this.cargarDatosHome();
    },
};
</script>

<style>
footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #ececec;
    color: #333;
    padding: 8px 0;
    text-align: center;
    z-index: 1000;
    box-sizing: border-box;
}

footer p {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 400;
    letter-spacing: 0.5px;
}
</style>

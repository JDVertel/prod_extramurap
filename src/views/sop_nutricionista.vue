<template>
    <div>
        <div v-if="cargando" class="spinner-overlay">
            <div class="progress-card shadow">
                <div class="h5 mb-3">Cargando información</div>
                <div class="progress mb-2" role="progressbar" aria-label="Cargando información" aria-valuemin="0"
                    aria-valuemax="100" style="height: 22px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
                        Cargando...
                    </div>
                </div>
                <div class="text-muted small">Por favor espere, cargando información...</div>
            </div>
        </div>
        <div v-else-if="errorCarga" class="alert alert-danger m-3">
            <h4>Error cargando información</h4>
            <p>{{ errorCarga }}</p>
            <button class="btn btn-primary" @click="cargarEncuestas">Reintentar</button>
        </div>
        <div v-else>
            <h1 class="display-6 center">{{ cargoMostrado }}</h1>
            <p v-if="esEstadoView && nombreProfesionalSeleccionado" class="text-center text-muted mb-2">
                Visualizando estado de: <strong>{{ nombreProfesionalSeleccionado }}</strong>
            </p>

            <h4>
                Detalle de Actividades ({{ cantEncuestasFiltradasPorConvenio }}) <small>Pendientes</small>
                <span v-if="cantEncuestasEnProceso > 0" class="badge bg-warning text-dark ms-2"
                    style="cursor: pointer;"
                    @click="abrirModalEnProceso"
                    title="Encuestas asignadas pero pendientes de cierre por el auxiliar">
                    <i class="bi bi-hourglass-split"></i> {{ cantEncuestasEnProceso }} en proceso
                </span>
                <span v-if="cantCerradosHoy > 0" class="badge bg-success ms-2">
                    <i class="bi bi-check2-all"></i> {{ cantCerradosHoy }} cerrado{{ cantCerradosHoy !== 1 ? 's' : '' }} hoy
                </span>
            </h4>

            <div v-if="!encuestasFiltradasPorConvenio || encuestasFiltradasPorConvenio.length === 0"
                class="alert alert-success shadow-sm text-center" role="alert">
                <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                <h5 class="mt-3">¡Todo OK!</h5>
                <p class="mb-0">No hay registros pendientes en este momento.</p>
            </div>

            <div v-for="(encuesta, index) in encuestasFiltradasPorConvenio" :key="index"
                class="container rounded-lg p-2 mb-2">
                <div class="row paciente shadow-sm">
                    <div class="col-7 col-md-6">
                        <small class="d-block"><strong>{{ encuesta.nombre1 }} {{ encuesta.nombre2 }} {{
                            encuesta.apellido1 }} {{
                                    encuesta.apellido2 }}</strong></small>
                        <small>EPS: {{ encuesta.eps }} | Riesgo: {{ encuesta.poblacionRiesgo }}</small>
                        <small>Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha }}</small>
                    </div>

                    <div class="col-5 col-md-6 acciones-col">
                        <div class="btn-grid">
                            <div class="btn-row">
                                <div v-if="mostrarBotonCups(encuesta)">
                                    <button type="button" class="btn btn-primary agendar-btn"
                                        @click="cupsGestion(encuesta.id)">
                                        <i class="bi bi-calendar2-heart-fill"></i>
                                        <span class="agendar-label">Cups</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="mostrarModalEnProceso" class="enproceso-modal-overlay" @click="cerrarModalEnProceso">
                <div class="enproceso-modal-content" @click.stop>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0">Registros en proceso ({{ registrosEnProcesoModal.length }})</h5>
                        <button type="button" class="btn btn-sm btn-outline-secondary" @click="cerrarModalEnProceso">Cerrar</button>
                    </div>
                    <div v-if="cargandoEnProcesoModal" class="text-muted py-2">Cargando registros...</div>
                    <div v-else-if="registrosEnProcesoModal.length === 0" class="alert alert-info mb-0">
                        No hay registros en proceso para este profesional.
                    </div>
                    <div v-else class="table-responsive" style="max-height: 420px; overflow-y: auto;">
                        <table class="table table-sm table-striped table-bordered align-middle mb-0">
                            <thead class="table-light sticky-top">
                                <tr>
                                    <th>Paciente</th>
                                    <th>Convenio</th>
                                    <th>EPS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in registrosEnProcesoModal" :key="item.id">
                                    <td>{{ item.paciente }}</td>
                                    <td>{{ item.convenio }}</td>
                                    <td>{{ item.eps }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import moment from "moment";
import realtime_api from "@/api/realtimeApi";

export default {
    data() {
        return {
            cargando: true,
            fechaActual: "",
            eliminandoRegistro: null,
            rutaAnterior: null,
            errorCarga: null,
            mostrarModalEnProceso: false,
            cargandoEnProcesoModal: false,
            registrosEnProcesoModal: [],
        };
    },

    methods: {
        ...mapActions([
            "removeRegEnc",
            "getEncuestasPendientesNutricionista",
            "getAsignacionesByEncuesta",
        ]),

        async eliminarRegistro(idEncuesta) {
            if (!confirm('¿Está seguro de que desea eliminar este registro?\n\nEsta acción eliminará el registro de actividades y la encuesta asociada.')) {
                return;
            }

            this.eliminandoRegistro = idEncuesta;

            try {
                const asignaciones = await this.getAsignacionesByEncuesta(idEncuesta);

                if (asignaciones && Object.keys(asignaciones).length > 0) {
                    alert('⚠️ No se puede eliminar el registro\n\nEste registro tiene asignaciones activas. Debe eliminar primero todas las asignaciones antes de eliminar el registro principal.');
                    return;
                }

                await this.removeRegEnc(idEncuesta);
                alert('✅ Registro eliminado exitosamente\n\nSe ha eliminado el registro de actividades y la encuesta asociada.');
                await this.cargarEncuestas();

            } catch (error) {
                console.error('Error al eliminar registro:', error);
                alert('⚠️ Error al eliminar el registro\n\n' + (error.message || 'Error desconocido. Intente nuevamente.'));
            } finally {
                this.eliminandoRegistro = null;
            }
        },

        cupsGestion(id) {
            sessionStorage.setItem("rutaAnterior", "/sop_nutricionista");
            const query = String(this.$route?.query?.estadoView || "") === "1"
                ? {
                    estadoView: "1",
                    profesionalDoc: String(this.$route?.query?.profesionalDoc || this.getDocumentoObjetivo() || "").trim(),
                    profesionalCargo: String(this.$route?.query?.profesionalCargo || this.cargoMostrado || this.userData?.cargo || "").trim(),
                    profesionalConvenio: String(this.$route?.query?.profesionalConvenio || this.getConvenioObjetivo() || "").trim(),
                    profesionalNombre: String(this.$route?.query?.profesionalNombre || this.userData?.nombre || "").trim(),
                }
                : {};
            this.$router.push({
                name: "sop_cups",
                params: { idEncuesta: id },
                query,
            });
        },

        mostrarBotonCups() {
            const cargo = (this.cargoMostrado || "").toString().trim().toLowerCase();
            return cargo === "nutricionista";
        },

        cerrarModalEnProceso() {
            this.mostrarModalEnProceso = false;
        },

        async abrirModalEnProceso() {
            this.mostrarModalEnProceso = true;
            this.cargandoEnProcesoModal = true;
            this.registrosEnProcesoModal = [];

            try {
                const documentoObjetivo = this.getDocumentoObjetivo();
                const { data } = await realtime_api.get("/Encuesta.json");
                const lista = Object.entries(data || {}).map(([id, value]) => ({ id, ...value }));

                this.registrosEnProcesoModal = lista
                    .filter((e) => {
                        const esAsignada = [e.idNutricionistaAtiende, e.idNutriAtiende, e.idNutricionista, e.idNutricionAtiende]
                            .map((v) => String(v || "").trim())
                            .includes(String(documentoObjetivo || "").trim());
                        if (!esAsignada) return false;
                        if (e.status_gest_aux === true) return false;
                        return true;
                    })
                    .map((e) => ({
                        id: e.id,
                        paciente: `${e.nombre1 || ""} ${e.apellido1 || ""}`.trim() || "Sin nombre",
                        convenio: String(e.convenio || "Sin convenio").trim() || "Sin convenio",
                        eps: e.eps || "",
                    }))
                    .sort((a, b) => String(a.paciente || "").localeCompare(String(b.paciente || "")));
            } catch (error) {
                console.error("Error cargando modal de en proceso:", error);
            } finally {
                this.cargandoEnProcesoModal = false;
            }
        },

        getDocumentoObjetivo() {
            if (this.esEstadoView) {
                const docSeleccionado = String(this.$route?.query?.profesionalDoc || "").trim();
                if (docSeleccionado) {
                    return docSeleccionado;
                }
            }
            return String(this.userData?.numDocumento || "").trim();
        },

        getConvenioObjetivo() {
            if (this.esEstadoView) {
                const convenioSeleccionado = String(this.$route?.query?.profesionalConvenio || "").trim();
                if (convenioSeleccionado) return convenioSeleccionado;
            }
            return String(this.userData?.convenio || "").trim();
        },

        async cargarEncuestas() {
            this.cargando = true;
            this.errorCarga = null;

            try {
                let intentos = 0;
                while ((!this.userData || !this.userData.numDocumento) && intentos < 30) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    intentos++;
                }

                const documentoObjetivo = this.getDocumentoObjetivo();
                if (!documentoObjetivo) {
                    throw new Error('Usuario no disponible después de esperar');
                }

                await Promise.race([
                    this.getEncuestasPendientesNutricionista({
                        idUsuario: documentoObjetivo,
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout - tardó más de 10 segundos')), 10000)
                    )
                ]);
            } catch (error) {
                console.error("Error cargando encuestas:", error.message);
                this.errorCarga = error.message || 'Error al cargar encuestas';
            } finally {
                await new Promise(resolve => setTimeout(resolve, 500));
                this.cargando = false;
                this.$forceUpdate();
            }
        },

        esEstadoCerrado(valor) {
            if (valor === true || valor === 1) return true;
            if (typeof valor === "string") {
                const limpio = valor.trim().toLowerCase();
                return limpio === "true" || limpio === "1" || limpio === "2";
            }
            if (typeof valor === "number") return valor >= 1;
            return false;
        },
    },

    computed: {
        ...mapState(["encuestas", "userData", "cantEncuestas", "cantEncuestasEnProceso"]),
        esEstadoView() {
            if (String(this.$route?.query?.estadoView || "") !== "1") return false;
            const docSeleccionado = String(this.$route?.query?.profesionalDoc || "").trim();
            if (!docSeleccionado) return false;

            const cargoActual = String(this.userData?.cargo || "").trim().toLowerCase();
            const esAdmin = cargoActual === "admin" || cargoActual === "administrador";
            if (esAdmin) return true;

            const accesos = Array.isArray(this.userData?.accesosProfesionales)
                ? this.userData.accesosProfesionales
                : [];
            return accesos.map((item) => String(item || "").trim()).includes(docSeleccionado);
        },
        cargoMostrado() {
            if (this.esEstadoView) {
                return String(this.$route?.query?.profesionalCargo || "").trim() || "Profesional";
            }
            return this.userData?.cargo || "";
        },
        nombreProfesionalSeleccionado() {
            return String(this.$route?.query?.profesionalNombre || "").trim();
        },
        encuestasFiltradasPorConvenio() {
            if (!this.encuestas || this.encuestas.length === 0) return [];
            const convenioObjetivo = this.getConvenioObjetivo();

            if (!convenioObjetivo) {
                return this.encuestas.filter(encuesta => this.esEstadoCerrado(encuesta.status_gest_aux));
            }

            return this.encuestas.filter(encuesta =>
                String(encuesta.convenio || "").trim().toLowerCase() === String(convenioObjetivo || "").trim().toLowerCase() &&
                this.esEstadoCerrado(encuesta.status_gest_aux)
            );
        },
        cantEncuestasFiltradasPorConvenio() {
            return this.encuestasFiltradasPorConvenio.length;
        },
        cantCerradosHoy() {
            if (!this.encuestas || !this.fechaActual) return 0;
            const doc = this.getDocumentoObjetivo();
            return this.encuestas.filter(e =>
                String(e.idNutricionistaAtiende || "").trim() === doc &&
                e.status_gest_nutricionista === true &&
                String(e.fechagestNutricionista || "").startsWith(this.fechaActual)
            ).length;
        },
    },

    watch: {
        '$route': {
            handler: function (to, from) {
                console.log(`[sop_nutricionista watch] Ruta cambió de ${from.name} a ${to.name}`);
                if (to.name === 'sop_nutricionista') {
                    console.log('[sop_nutricionista watch] Cargando encuestas por cambio de ruta');
                    this.cargarEncuestas();
                }
            },
            deep: true
        }
    },

    async mounted() {
        this.rutaAnterior = this.$route.name;
        this.fechaActual = moment().format("YYYY-MM-DD");
        this.cargando = true;
        await this.cargarEncuestas();
    },
};
</script>

<style>
.spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.progress-card {
    width: min(560px, calc(100vw - 32px));
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #dee2e6;
}

.progreso-indeterminado {
    width: 100%;
}

.acciones-col {
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

.agendar-btn {
    width: 50px;
    height: 50px;
    padding: 0;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    line-height: 1;
    border: none;
    transition: all 0.2s ease;
}

.agendar-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.row.paciente {
    background: linear-gradient(
        90deg,
        #9a3412 0%,
        #c2410c 30%,
        #f97316 60%,
        #c2410c 80%,
        #9a3412 100%
    );
    border-radius: 10px;
    padding: 8px 10px;
    color: #ffffff;
    align-items: center;
}

.row.paciente small {
    display: block;
    color: #fff7ed;
    line-height: 1.4;
}

.row.paciente strong {
    color: #ffffff;
    font-size: 0.9rem;
}

.enproceso-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
}

.enproceso-modal-content {
    width: min(820px, 96vw);
    background: #fff;
    border-radius: 10px;
    padding: 14px;
}
</style>

<template>
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
    <div v-if="!cargando">
        <h1 class="display-6 center">{{ cargoMostrado }}</h1>
        <p v-if="esEstadoView && nombreProfesionalSeleccionado" class="text-center text-muted mb-2">
            Visualizando como admin: {{ nombreProfesionalSeleccionado }}
        </p>


        <div class="container-fluid">
            <h4>
                Detalle de Actividades ({{ cantEncuestasConCupsActivo }}) <small>Pendientes</small>
                <span v-if="cantEncuestasEnProceso > 0"
                    class="badge bg-warning text-dark ms-2"
                    title="Encuestas asignadas pero pendientes de cierre por el auxiliar">
                    <i class="bi bi-hourglass-split"></i> {{ cantEncuestasEnProceso }} en proceso
                </span>
            </h4>

            <!-- Mensaje cuando no hay registros -->
            <div v-if="!encuestasConCupsActivo || encuestasConCupsActivo.length === 0"
                class="alert alert-success shadow-sm text-center" role="alert">
                <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                <h5 class="mt-3">¡Todo OK!</h5>
                <p class="mb-0">No hay registros pendientes en este momento.</p>
            </div>

            <div v-else class="container-fluid" >
                <div v-for="(encuesta, index) in encuestasConCupsActivo" :key="index"
                    class="container rounded-lg p-2 mb-2" style="border-radius: 24px;">
                    <div class="row paciente shadow-sm">
                        <div class="col-10 col-md-10">
                            <small><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1
                                    }}</strong></small> | 
                            <small>EPS: {{ encuesta.eps }} | Riesgo: {{
                                encuesta.poblacionRiesgo }}</small>
                            <small c>Nac: {{ formatearFechaSoloDia(encuesta.fechaNac) || 'N/A' }} | Enc: {{ formatearFechaSoloDia(encuesta.fecha)
                                }}</small>
                            <!-- Mostrar actividades si existen -->

                        </div>

                        <div class="col-2 col-md-2 acciones-col ">
                            <div class="btn-grid">
                                <!-- Fila única: Visita, Caracterización y CUPS (3 botones) -->
                                <div class="btn-row">




                                    <!-- CUPS (Auxiliar de enfermeria y Medico) -->
                                    <div
                                        v-if="userData.cargo === 'Auxiliar de enfermeria' || userData.cargo === 'Medico'">
                                        <button type="button" class="btn btn-danger  agendar-btn"
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
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import moment from "moment";
export default {
    data() {
        return {
            cargando: true,
            fechaActual: "",
        };
    },
    methods: {
        ...mapActions([
            "removeRegEnc",
            "getAllRegistersByFechaStatus",
            "getAllRegistersByIduser",
            "getAllRegistersByFecha",
            " SelectExistenteAgendas",
            "getEncuestasConActividadesMedico",
        ]),

        removeRegEncuesta(id) {
            this.removeRegEnc(id);
            alert("Registro eliminado exitosamente.");
            this.getAllRegistersByFecha({
                idUsuario: this.userData.numDocumento,
                fecha: this.fechaActual,
            });
            this.getAllRegistersByFechaStatus({
                idUsuario: this.userData.numDocumento,
            });
        },
        Agendar(id, tipo) {
            this.$router.push({
                name: "sop_agendamiento",
                params: {
                    idEncuesta: id,
                    tipo: tipo,
                },
            });
        },
        Caracterizar(id) {
            this.$router.push({
                name: "sop_caracterizacion",
                params: {
                    idEncuesta: id,
                },
            });
        },

        cupsGestion(id) {
            sessionStorage.setItem("rutaAnterior", "/sop_profesional");
            this.$router.push({
                name: "sop_cups",
                params: {
                    idEncuesta: id,
                },
            });
        },

        nombresActividades(act) {
            if (!act) return [];
            const lista = Array.isArray(act) ? act : Object.values(act);
            return lista.map((a) => a?.nombre).filter(Boolean);
        },

        nombresActividadesEncuesta(actividades) {
            if (!actividades || typeof actividades !== 'object') return 'Sin actividades';

            // Revisar si hay tipoActividad
            const tipoActividad = actividades.tipoActividad;
            if (!tipoActividad || typeof tipoActividad !== 'object') return 'Sin actividades';

            const nombres = Object.values(tipoActividad)
                .map(act => act?.nombre)
                .filter(Boolean);

            return nombres.length > 0 ? nombres.join(', ') : 'Sin actividades';
        },

        formatearFechaSoloDia(valorFecha) {
            if (!valorFecha) return "";
            const texto = String(valorFecha).trim();

            const matchIso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
            if (matchIso) return matchIso[1];

            const fecha = new Date(texto);
            if (!Number.isNaN(fecha.getTime())) {
                return fecha.toISOString().slice(0, 10);
            }

            return texto;
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
    },

    computed: {
        ...mapState(["encuestas", "userData", "cantEncuestas", "cantEncuestasEnProceso"]),
        esEstadoView() {
            if (String(this.$route?.query?.estadoView || "") !== "1") {
                return false;
            }

            const docSeleccionado = String(this.$route?.query?.profesionalDoc || "").trim();
            if (!docSeleccionado) {
                return false;
            }

            const cargoActual = String(this.userData?.cargo || "").trim().toLowerCase();
            const esAdmin = cargoActual === "admin" || cargoActual === "administrador";
            if (esAdmin) {
                return true;
            }

            const accesos = Array.isArray(this.userData?.accesosProfesionales)
                ? this.userData.accesosProfesionales
                : [];
            return accesos.map((item) => String(item || "").trim()).includes(docSeleccionado);
        },
        cargoMostrado() {
            if (this.esEstadoView) {
                const cargo = String(this.$route?.query?.profesionalCargo || "").trim();
                return cargo || "Profesional";
            }
            return this.userData?.cargo || "";
        },
        nombreProfesionalSeleccionado() {
            return String(this.$route?.query?.profesionalNombre || "").trim();
        },
        encuestasFiltradasPorConvenio() {
            if (!this.encuestas || this.encuestas.length === 0) return [];
            const convenioObjetivo = this.esEstadoView
                ? String(this.$route?.query?.profesionalConvenio || "").trim()
                : String(this.userData?.convenio || "").trim();

            if (!convenioObjetivo) {
                return this.encuestas.filter(encuesta => encuesta.status_gest_aux === true);
            }

            // Filtrar encuestas donde el convenio coincida con userData.convenio
            return this.encuestas.filter(encuesta =>
                String(encuesta.convenio || "").trim() === convenioObjetivo &&
                encuesta.status_gest_aux === true
            );
        },
        encuestasConCupsActivo() {
            const cargo = this.esEstadoView
                ? String(this.$route?.query?.profesionalCargo || "").trim()
                : String(this.userData?.cargo || "").trim();

            return this.encuestasFiltradasPorConvenio.filter(
                (encuesta) =>
                    (cargo === "Auxiliar de enfermeria" || cargo === "Medico")
            );
        },
        cantEncuestasConCupsActivo() {
            return this.encuestasConCupsActivo.length;
        },
        documento() {
            return this.getDocumentoObjetivo();
        },

        totalRegisters() {
            return this.encuestas.length;
        },
    },
    async mounted() {
        this.fechaActual = moment().format("YYYY-MM-DD");
        try {
            const documentoObjetivo = this.getDocumentoObjetivo();
            if (!documentoObjetivo) {
                throw new Error("No se encontro el documento del profesional a consultar");
            }

            // Obtener encuestas con status_gest_aux = true para médico y sus actividades
            const encuestasConActividades = await this.getEncuestasConActividadesMedico({
                idUsuario: documentoObjetivo,
            });

            // Actualizar el store manualmente porque la nueva función no lo hace
            this.$store.commit('setEncuestas', encuestasConActividades);
            this.$store.commit('setcantEncuestas', encuestasConActividades.length);

            console.log("Encuestas con actividades (Médico):", encuestasConActividades);
        } catch (error) {
            console.error("Error en mounted de sop_profesional:", error);
            alert("Error cargando encuestas: " + (error?.message || error));
        } finally {
            this.cargando = false;
        }
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

/* Layout horizontal para botones */
.btn-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

/* Estilos para botones redondeados */
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

.agendar-btn i {
    font-size: 16px;
}

.agendar-label {
    font-size: 9px;
    font-weight: 600;
}

.row.paciente {
    background: linear-gradient(
        90deg,
        #0f766e 0%,
        #0d9488 30%,
        #14b8a6 60%,
        #0d9488 80%,
        #0f766e 100%
    );
    border-radius: 10px;
    padding: 8px 10px;
    color: #ffffff;
    align-items: center;
}

.row.paciente small {
    display: block;
    color: #e6fffa;
    line-height: 1.4;
}

.row.paciente strong {
    color: #ffffff;
    font-size: 0.9rem;
}
</style>

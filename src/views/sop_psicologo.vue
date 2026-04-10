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
                Visualizando estado de: {{ nombreProfesionalSeleccionado }}
            </p>


            <h4>
                Detalle de Actividades ({{ cantEncuestasFiltradasPorConvenio }}) <small>Pendientes</small>
                <span v-if="cantEncuestasEnProceso > 0"
                    class="badge bg-warning text-dark ms-2"
                    title="Encuestas asignadas pero pendientes de cierre por el auxiliar">
                    <i class="bi bi-hourglass-split"></i> {{ cantEncuestasEnProceso }} en proceso
                </span>
            </h4>

            <!-- Mensaje cuando no hay registros -->
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



                                <!-- CUPS -->
                                <div v-if="mostrarBotonCups(encuesta)">
                                    <button type="button" class="btn btn-primary  agendar-btn"
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
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
    data() {
        return {
            cargando: true,
            eliminandoRegistro: null,
            rutaAnterior: null,
            errorCarga: null,
        };
    },

    methods: {
        ...mapActions([
            "removeRegEnc",
            "getEncuestasPendientesPsicologo",
            "getAsignacionesByEncuesta",
        ]),
        getDocumentoObjetivo() {
            if (this.esEstadoView) {
                const docSeleccionado = String(this.$route?.query?.profesionalDoc || "").trim();
                if (docSeleccionado) return docSeleccionado;
            }
            return String(this.userData?.numDocumento || "").trim();
        },
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
            sessionStorage.setItem("rutaAnterior", "/sop_psicologo");
            this.$router.push({
                name: "sop_cups",
                params: { idEncuesta: id },
            });
        },

        mostrarBotonCups(encuesta) {
            const cargo = (this.cargoMostrado || "").toString().trim().toLowerCase();
            const esPsicologo = cargo === "psicologo" || cargo === "psicólogo";

            // En la bandeja de psicología el botón CUPS debe estar disponible para cada registro.
            return esPsicologo;
        },

        async cargarEncuestas() {
            this.cargando = true;
            this.errorCarga = null;

            try {
                // Esperar a que App.vue sincronice userData desde localStorage
                let intentos = 0;
                while ((!this.userData || !this.userData.numDocumento) && intentos < 30) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    intentos++;
                }

                const documentoObjetivo = this.getDocumentoObjetivo();
                if (!documentoObjetivo) {
                    throw new Error('Usuario no disponible despues de esperar');
                }

                await Promise.race([
                    this.getEncuestasPendientesPsicologo({
                        idUsuario: documentoObjetivo,
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout - tardo mas de 10 segundos')), 10000)
                    )
                ]);
            } catch (error) {
                console.error("Error cargando encuestas:", error.message);
                this.errorCarga = error.message || 'Error al cargar encuestas';
            } finally {
                // Esperar un minimo de 500ms para que se vea el spinner
                await new Promise(resolve => setTimeout(resolve, 500));
                this.cargando = false;
                this.$forceUpdate();
            }
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
        cantEncuestasFiltradasPorConvenio() {
            return this.encuestasFiltradasPorConvenio.length;
        },
    },

    watch: {
        '$route': {
            handler: function (to, from) {
                // Se dispara SIEMPRE que la ruta cambia, sin importar el nombre
                // Esto es crítico cuando presionas atrás del navegador
                console.log(`[sop_psicologo watch] Ruta cambió de ${from.name} a ${to.name}`);
                if (to.name === 'sop_psicologo') {
                    console.log('[sop_psicologo watch] Cargando encuestas por cambio de ruta');
                    this.cargarEncuestas();
                }
            },
            deep: true
        }
    },

    async mounted() {
        this.rutaAnterior = this.$route.name;
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

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
                Detalle de Actividades
                <span v-if="cantEncuestasEnProceso > 0"
                    class="badge bg-warning text-dark ms-2"
                    style="cursor: pointer;"
                    @click="abrirModalEnProceso"
                    title="Encuestas asignadas pero pendientes de cierre por el auxiliar">
                    <i class="bi bi-hourglass-split"></i> {{ cantEncuestasEnProceso }} en proceso
                </span>
                <HoverInfoBadge badge-class="bg-success ms-2" :content="tooltipCerradosHoy">
                    <i class="bi bi-check2-all"></i> {{ cantCerradosHoy }} cerrado{{ cantCerradosHoy !== 1 ? 's' : '' }} hoy
                </HoverInfoBadge>
                <span class="badge bg-primary ms-2">
                    <i class="bi bi-calendar-week"></i> {{ cantCerradosSemana }} acumulado{{ cantCerradosSemana !== 1 ? 's' : '' }} semana
                </span>
            </h4>

            <ul class="nav nav-tabs mb-3" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#prof-pendientes" type="button" role="tab">
                        Pendientes ({{ cantEncuestasPendientes }})
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#prof-devueltos" type="button" role="tab">
                        Devueltos ({{ cantEncuestasDevueltas }})
                    </button>
                </li>
            </ul>

            <div class="tab-content">
                <div class="tab-pane fade show active" id="prof-pendientes" role="tabpanel">
                    <div v-if="!encuestasPendientes || encuestasPendientes.length === 0"
                        class="alert alert-success shadow-sm text-center" role="alert">
                        <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                        <h5 class="mt-3">¡Todo OK!</h5>
                        <p class="mb-0">No hay registros pendientes en este momento.</p>
                    </div>

                    <div v-else class="container-fluid">
                        <div v-for="grupo in encuestasPendientesAgrupadas" :key="`pend-dia-${grupo.dayKey}`" class="bandeja-dia-seccion">
                            <div class="bandeja-dia-titulo">
                                <span class="bandeja-dia-badge">{{ grupo.dayLabel }}</span>
                            </div>
                            <div v-for="(encuesta, index) in grupo.items" :key="`pend-${encuesta.id || index}`"
                                class="container rounded-lg p-2 mb-2" style="border-radius: 24px;">
                                <div :class="['row', 'paciente', 'shadow-sm', pacienteClass(encuesta)]">
                                    <div class="col-10 col-md-10">
                                        <small><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1 }}</strong></small> |
                                        <small>EPS: {{ encuesta.eps }} | Riesgo: {{ encuesta.poblacionRiesgo }}</small>
                                        <small>Auxiliar: {{ obtenerNombreAuxiliar(encuesta.idEncuestador) }}</small>
                                        <small>Nac: {{ formatearFechaSoloDia(encuesta.fechaNac) || 'N/A' }} | Enc: {{ formatearFechaSoloDia(encuesta.fecha) || 'N/A' }}</small>
                                        <AssignedProfessionalsBadge :encuesta="encuesta" />
                                    </div>

                                    <div class="col-2 col-md-2 acciones-col ">
                                        <div class="btn-grid">
                                            <div class="btn-row">
                                                <div v-if="cargoMostrado === 'Auxiliar de enfermeria' || cargoMostrado === 'Medico'">
                                                    <button type="button" class="btn btn-danger agendar-btn" @click="cupsGestion(encuesta.id)">
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

                <div class="tab-pane fade" id="prof-devueltos" role="tabpanel">
                    <div v-if="!encuestasDevueltas || encuestasDevueltas.length === 0"
                        class="alert alert-success shadow-sm text-center" role="alert">
                        <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                        <h5 class="mt-3">Sin devoluciones</h5>
                        <p class="mb-0">No hay pacientes devueltos para corrección.</p>
                    </div>

                    <div v-else class="container-fluid">
                        <div v-for="grupo in encuestasDevueltasAgrupadas" :key="`dev-dia-${grupo.dayKey}`" class="bandeja-dia-seccion">
                            <div class="bandeja-dia-titulo">
                                <span class="bandeja-dia-badge">{{ grupo.dayLabel }}</span>
                            </div>
                            <div v-for="(encuesta, index) in grupo.items" :key="`dev-${encuesta.id || index}`"
                                class="container rounded-lg p-2 mb-2" style="border-radius: 24px;">
                                <div :class="['row', 'paciente', 'paciente-devuelto', 'shadow-sm']">
                                    <div class="col-10 col-md-10">
                                        <small><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1 }}</strong></small> |
                                        <small>EPS: {{ encuesta.eps }} | Riesgo: {{ encuesta.poblacionRiesgo }}</small>
                                        <small>Auxiliar: {{ obtenerNombreAuxiliar(encuesta.idEncuestador) }}</small>
                                        <small>Nac: {{ formatearFechaSoloDia(encuesta.fechaNac) || 'N/A' }} | Enc: {{ formatearFechaSoloDia(encuesta.fecha) || 'N/A' }}</small>
                                        <AssignedProfessionalsBadge :encuesta="encuesta" />
                                        <div class="devolucion-nota mt-2">
                                            <div class="devolucion-titulo"><i class="bi bi-arrow-counterclockwise me-1"></i> Paciente devuelto para corrección</div>
                                        </div>
                                    </div>

                                    <div class="col-2 col-md-2 acciones-col ">
                                        <div class="btn-grid">
                                            <div class="btn-row">
                                                <div v-if="cargoMostrado === 'Auxiliar de enfermeria' || cargoMostrado === 'Medico'">
                                                    <button type="button" class="btn btn-danger agendar-btn" @click="cupsGestion(encuesta.id)">
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
import { getAllUsers } from "@/api/usersApi";
import { construirTooltipEpsCierres } from "@/utils/gestionCounters";
import { formatBandejaShortDate, groupBandejaItemsByDay, sortBandejaItems } from "@/utils/bandejaPresentation";
import HoverInfoBadge from "@/components/HoverInfoBadge.vue";
import AssignedProfessionalsBadge from "@/components/AssignedProfessionalsBadge.vue";
export default {
    components: {
        HoverInfoBadge,
        AssignedProfessionalsBadge,
    },
    data() {
        return {
            cargando: true,
            fechaActual: "",
            mostrarModalEnProceso: false,
            cargandoEnProcesoModal: false,
            registrosEnProcesoModal: [],
            auxiliaresPorDocumento: {},
            encuestasContador: [],
            cantCerradosHoyValor: 0,
            cantCerradosSemanaValor: 0,
            errorCarga: null,
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
                params: {
                    idEncuesta: id,
                },
                query,
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
            return formatBandejaShortDate(valorFecha);
        },
        agruparEncuestasPorDia(items) {
            return groupBandejaItemsByDay(items, (encuesta) => encuesta?.fecha || encuesta?.created_at || encuesta?.updated_at);
        },
        async cargarAuxiliares() {
            try {
                const usuarios = await getAllUsers();
                const mapa = {};

                usuarios.forEach((user) => {
                    const documento = String(user?.numDocumento || "").trim();
                    if (!documento) return;
                    mapa[documento] = user?.nombre || documento;
                });

                this.auxiliaresPorDocumento = mapa;
            } catch (error) {
                console.error("Error cargando auxiliares:", error);
            }
        },
        obtenerNombreAuxiliar(idEncuestador) {
            const id = String(idEncuestador || "").trim();
            if (!id) return "Sin asignar";
            return this.auxiliaresPorDocumento[id] || id;
        },
        getStatusKeyBandeja() {
            return "status_gest_medica";
        },
        getFechaKeyBandeja() {
            return "fechagestMedica";
        },
        getFechaGestionEncuesta(encuesta, fechaKey) {
            const aliases = {
                fechagestMedica: ["fechagestMedica", "fecha_gest_medica"],
            };

            const campos = aliases[fechaKey] || [fechaKey];
            for (const campo of campos) {
                const valor = encuesta?.[campo];
                if (valor !== undefined && valor !== null && String(valor).trim() !== "") {
                    return valor;
                }
            }

            return "";
        },
        esEstadoCerrado(valor) {
            if (valor === true || valor === 1 || valor === 2) return true;
            if (typeof valor === "string") {
                const limpio = valor.trim().toLowerCase();
                return limpio === "true" || limpio === "1" || limpio === "2";
            }
            if (typeof valor === "number") return valor >= 1;
            return false;
        },
        esPacienteDevuelto(encuesta) {
            const statusKey = this.getStatusKeyBandeja();
            const fechaKey = this.getFechaKeyBandeja();
            return !this.esEstadoCerrado(encuesta?.[statusKey]) && Boolean(String(this.getFechaGestionEncuesta(encuesta, fechaKey) || "").trim());
        },
        pacienteClass(encuesta) {
            return this.esPacienteDevuelto(encuesta) ? "paciente-devuelto" : "";
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
                return String(this.$route?.query?.profesionalConvenio || "").trim();
            }
            return String(this.userData?.convenio || "").trim();
        },

        async cargarFuenteContadores() {
            const params = {
                _ts: Date.now(),
                idMedicoAtiende: this.getDocumentoObjetivo(),
            };

            const convenioObjetivo = String(this.getConvenioObjetivo() || "").trim();
            if (convenioObjetivo) {
                params.convenio = convenioObjetivo;
            }

            const { data } = await realtime_api.get("/Encuesta.json", {
                params,
            });

            this.encuestasContador = data
                ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
                : [];

            this.actualizarMetricasDesdeFuente();
        },
        actualizarMetricasDesdeFuente() {
            const documentoObjetivo = String(this.getDocumentoObjetivo() || "").trim();
            if (!documentoObjetivo) {
                this.cantCerradosHoyValor = 0;
                this.cantCerradosSemanaValor = 0;
                this.$store.commit("setCantEncuestasEnProceso", 0);
                return;
            }

            const inicioSemana = this.fechaActual
                ? moment(this.fechaActual, "YYYY-MM-DD").startOf("isoWeek").format("YYYY-MM-DD")
                : "";
            const finSemana = this.fechaActual
                ? moment(this.fechaActual, "YYYY-MM-DD").endOf("isoWeek").format("YYYY-MM-DD")
                : "";

            this.cantCerradosHoyValor = this.contarCerradosMedicoPorRango(
                this.encuestasContador,
                this.fechaActual,
                this.fechaActual
            );
            this.cantCerradosSemanaValor = this.contarCerradosMedicoPorRango(
                this.encuestasContador,
                inicioSemana,
                finSemana
            );

            const enProcesoCount = this.encuestasContador.filter((encuesta) =>
                String(encuesta?.idMedicoAtiende || "").trim() === documentoObjetivo &&
                encuesta?.status_gest_aux !== true
            ).length;
            this.$store.commit("setCantEncuestasEnProceso", enProcesoCount);
        },
        normalizarConvenioEncuesta(encuesta) {
            return String(encuesta?.convenio || "").trim().toLowerCase();
        },
        obtenerFechaGestionMedica(encuesta) {
            return this.getFechaGestionEncuesta(encuesta, "fechagestMedica");
        },
        contarCerradosMedicoPorRango(encuestas, fechaInicio, fechaFin) {
            const documentoObjetivo = String(this.getDocumentoObjetivo() || "").trim();
            const convenioObjetivo = String(this.getConvenioObjetivo() || "").trim().toLowerCase();

            if (!documentoObjetivo || !fechaInicio || !fechaFin) {
                return 0;
            }

            return (encuestas || []).filter((encuesta) => {
                if (String(encuesta?.idMedicoAtiende || "").trim() !== documentoObjetivo) {
                    return false;
                }

                if (convenioObjetivo && this.normalizarConvenioEncuesta(encuesta) !== convenioObjetivo) {
                    return false;
                }

                if (!this.esEstadoCerrado(encuesta?.status_gest_medica)) {
                    return false;
                }

                const fechaGestion = this.formatearFechaSoloDia(this.obtenerFechaGestionMedica(encuesta));
                if (!fechaGestion) {
                    return false;
                }

                return fechaGestion >= fechaInicio && fechaGestion <= fechaFin;
            }).length;
        },
        async cargarContadoresCerrados() {
            if (!this.encuestasContador.length) {
                await this.cargarFuenteContadores();
                return;
            }

            this.actualizarMetricasDesdeFuente();
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

                await this.cargarAuxiliares();
                const documentoObjetivo = this.getDocumentoObjetivo();
                if (!documentoObjetivo) {
                    throw new Error("No se encontro el documento del profesional a consultar");
                }

                const [encuestasConActividades] = await Promise.race([
                    Promise.all([
                        this.getEncuestasConActividadesMedico({
                            idUsuario: documentoObjetivo,
                        }),
                        this.cargarFuenteContadores(),
                    ]),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout - tardó más de 10 segundos")), 10000)
                    ),
                ]);

                this.$store.commit("setEncuestas", encuestasConActividades);
                this.$store.commit("setcantEncuestas", encuestasConActividades.length);
            } catch (error) {
                console.error("Error cargando encuestas en sop_profesional:", error);
                this.errorCarga = error?.message || "Error al cargar encuestas";
            } finally {
                this.cargando = false;
            }
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
                if (!this.encuestasContador.length) {
                    await this.cargarFuenteContadores();
                }

                const lista = this.encuestasContador;

                this.registrosEnProcesoModal = lista
                    .filter((e) => {
                        if (String(e.idMedicoAtiende || "").trim() !== String(documentoObjetivo || "").trim()) return false;
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
            const esAdmin = cargoActual === "admin" || cargoActual === "administrador" || cargoActual === "superusuario";
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

            return this.encuestas.filter(encuesta =>
                String(encuesta.convenio || "").trim().toLowerCase() === convenioObjetivo.toLowerCase() &&
                encuesta.status_gest_aux === true
            );
        },
        encuestasContadorFiltradasPorConvenio() {
            if (!this.encuestasContador || this.encuestasContador.length === 0) return [];

            const convenioObjetivo = this.esEstadoView
                ? String(this.$route?.query?.profesionalConvenio || "").trim()
                : String(this.userData?.convenio || "").trim();

            if (!convenioObjetivo) {
                return this.encuestasContador;
            }

            return this.encuestasContador.filter((encuesta) =>
                String(encuesta.convenio || "").trim().toLowerCase() === convenioObjetivo.toLowerCase()
            );
        },
        encuestasBaseProfesional() {
            const cargo = this.esEstadoView
                ? String(this.$route?.query?.profesionalCargo || "").trim()
                : String(this.userData?.cargo || "").trim();

            return this.encuestasFiltradasPorConvenio.filter(
                (encuesta) =>
                    (cargo === "Auxiliar de enfermeria" || cargo === "Medico")
            );
        },
        encuestasPendientes() {
            return sortBandejaItems(
                this.encuestasBaseProfesional.filter((encuesta) => !this.esPacienteDevuelto(encuesta)),
                (encuesta) => encuesta?.fecha || encuesta?.created_at || encuesta?.updated_at
            );
        },
        encuestasPendientesAgrupadas() {
            return this.agruparEncuestasPorDia(this.encuestasPendientes);
        },
        encuestasDevueltas() {
            return sortBandejaItems(
                this.encuestasBaseProfesional.filter((encuesta) => this.esPacienteDevuelto(encuesta)),
                (encuesta) => encuesta?.fecha || encuesta?.created_at || encuesta?.updated_at
            );
        },
        encuestasDevueltasAgrupadas() {
            return this.agruparEncuestasPorDia(this.encuestasDevueltas);
        },
        cantEncuestasPendientes() {
            return this.encuestasPendientes.length;
        },
        cantEncuestasDevueltas() {
            return this.encuestasDevueltas.length;
        },
        documento() {
            return this.getDocumentoObjetivo();
        },

        totalRegisters() {
            return this.encuestas.length;
        },
        cantCerradosHoy() {
            return this.cantCerradosHoyValor;
        },
        tooltipCerradosHoy() {
            return construirTooltipEpsCierres(this.encuestasContadorFiltradasPorConvenio, {
                documentoObjetivo: this.getDocumentoObjetivo(),
                docKeys: ["idMedicoAtiende"],
                statusKey: "status_gest_medica",
                fechaKey: "fechagestMedica",
                fechaInicio: this.fechaActual,
                fechaFin: this.fechaActual,
                esEstadoCerrado: this.esEstadoCerrado,
            });
        },
        cantCerradosSemana() {
            return this.cantCerradosSemanaValor;
        },
    },
    watch: {
        '$route': {
            handler: function (to) {
                if (to.name === 'sop_profesional') {
                    this.cargarEncuestas();
                }
            },
            deep: true,
        },
    },
    async mounted() {
        this.fechaActual = moment().format("YYYY-MM-DD");
        await this.cargarEncuestas();
    },
};
</script>

<style scoped>
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

.row.paciente.paciente-devuelto {
    background: linear-gradient(90deg, #7f1d1d 0%, #b91c1c 30%, #ef4444 65%, #b91c1c 85%, #7f1d1d 100%);
}

.devolucion-nota {
    margin-top: 0.5rem;
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.devolucion-titulo {
    font-weight: 700;
}

@media (max-width: 768px) {
    .acciones-col {
        margin-top: 8px;
    }

    .btn-row {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        justify-items: stretch;
    }

    .btn-row > div {
        width: 100%;
    }

    .agendar-btn {
        width: 100%;
        min-height: 44px;
        height: auto;
        border-radius: 10px;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        padding: 6px 8px;
        overflow: hidden;
    }

    .agendar-btn i {
        flex: 0 0 auto;
        text-align: center;
    }

    .agendar-label {
        font-size: 0.68rem;
        line-height: 1.1;
        width: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>

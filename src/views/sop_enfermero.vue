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
    <div v-if="!cargando" :class="['convenio-theme', convenioThemeClass, 'enfermero-page', 'container-fluid', 'px-2', 'px-md-3', 'py-2']">
        <h1 class="display-6 center">{{ cargoMostrado }}</h1>
        <ProfesionalGrupoInfo :es-estado-view="esEstadoView" />
        <p v-if="esEstadoView && nombreProfesionalSeleccionado" class="text-center text-muted mb-2">
            Visualizando como admin: {{ nombreProfesionalSeleccionado }}
        </p>
        <div class="text-center mb-2">
            <HoverInfoBadge badge-class="bg-success" :content="tooltipCerradosHoy">
                <i class="bi bi-check2-all"></i> {{ cantCerradosHoy }} cerrado{{ cantCerradosHoy !== 1 ? 's' : '' }} hoy
            </HoverInfoBadge>
            <span class="badge bg-primary ms-2">
                <i class="bi bi-calendar-week"></i> {{ cantCerradosSemana }} acumulado{{ cantCerradosSemana !== 1 ? 's' : '' }} semana
            </span>
        </div>
        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home"
                    type="button" role="tab" aria-controls="nav-home" aria-selected="true">Pendientes ({{
                        cantEncuestasPendientes }})</button>
                <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile"
                    type="button" role="tab" aria-controls="nav-profile" aria-selected="false">En proceso ({{
                        cantEncuestasEnProceso }})</button>
                <!--     <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact"
                    type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
                <button class="nav-link" id="nav-disabled-tab" data-bs-toggle="tab" data-bs-target="#nav-disabled"
                    type="button" role="tab" aria-controls="nav-disabled" aria-selected="false"
                    disabled>Disabled</button> -->
            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab"
                tabindex="0">

                <div class="container-fluid">
                    <h4>Detalle de Actividades <small>Pendientes</small></h4>

                    <!-- Mensaje cuando no hay registros -->
                    <div v-if="!encuestasPendientes || encuestasPendientes.length === 0"
                        class="alert alert-success shadow-sm text-center" role="alert">
                        <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                        <h5 class="mt-3">¡Todo OK!</h5>
                        <p class="mb-0">No hay registros pendientes en este momento.</p>
                    </div>

                    <div v-else class="container-fluid" style="max-height: 500px; overflow-y: auto ">
                        <div v-for="grupo in encuestasPendientesAgrupadas" :key="`pend-dia-${grupo.dayKey}`" class="bandeja-dia-seccion">
                            <div class="bandeja-dia-titulo">
                                <span class="bandeja-dia-badge">{{ grupo.dayLabel }}</span>
                            </div>
                            <div v-for="(encuesta, index) in grupo.items" :key="encuesta.id || index"
                                class="container p-2 mb-2">
                                <div class="row paciente shadow-sm">
                                    <div class="col-6 col-md-6">
                                        <small><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1 }}</strong> | </small>
                                        <small>EPS: {{ encuesta.eps }} | Riesgo: {{ encuesta.poblacionRiesgo }}</small>
                                        <small>Nac: {{ formatearFechaCorta(encuesta.fechaNac) || 'N/A' }} | Enc: {{ formatearFechaCorta(encuesta.fecha) || 'N/A' }}</small>
                                        <AssignedProfessionalsBadge :encuesta="encuesta" />
                                    </div>

                                    <div class="col-6 col-md-6 acciones-col ">
                                        <div class="btn-grid">
                                            <div class="btn-row">
                                                <div v-if="cargoMostrado === 'Enfermero' || cargoMostrado === 'Medico'">
                                                    <button type="button" class="btn btn-danger btn-sm agendar-btn"
                                                        @click="cupsGestion(encuesta.id)">
                                                        <i class="bi bi-calendar2-heart-fill"></i>
                                                        <span class="agendar-label">Cups</span>
                                                    </button>
                                                </div>
                                                <div
                                                    v-for="destino in obtenerDestinosRegreso(encuesta)"
                                                    :key="`${encuesta.id}-${destino.statusKey}`">
                                                    <button
                                                        type="button"
                                                        class="btn btn-sm btn-regresar-proceso"
                                                        :disabled="regresarDisabled[`${encuesta.id}_${destino.statusKey}`]"
                                                        :title="`Regresar a ${destino.rolLabel} para corrección`"
                                                        @click="regresarParaCorreccion(encuesta, destino)">
                                                        <i class="bi bi-arrow-counterclockwise"></i>
                                                        <span>{{ destino.rolShort }}</span>
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
            <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
                <div class="container-fluid px-0">
                <h4><small>En proceso</small></h4>

                <!-- Mensaje cuando no hay registros -->
                <div v-if="!encuestasEnProceso || encuestasEnProceso.length === 0"
                    class="alert alert-success shadow-sm text-center" role="alert">
                    <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
                    <h5 class="mt-3">¡Todo OK!</h5>
                    <p class="mb-0">No hay registros en proceso en este momento.</p>
                </div>

                <div v-else class="container-fluid">
                    <div class="d-flex flex-wrap gap-2 justify-content-end align-items-center mb-2">
                        <button class="btn btn-outline-success btn-sm" @click="exportarEnProcesoExcel">
                            <i class="bi bi-file-earmark-excel"></i> Exportar Excel
                        </button>
                    </div>

                    <div class="table-responsive tabla-proceso-wrap">
                        <table class="table table-sm table-hover table-striped table-bordered align-middle mb-0 tabla-proceso">
                            <thead class="table-light cabecera-proceso">
                                <tr>
                                    <th>Auxiliar</th>
                                    <th>Paciente</th>
                                    <th>EPS</th>
                                    <th>F. Encuesta</th>
                                    <th>Estados</th>
                                    <th>Devolver</th>
                                </tr>
                                <tr>
                                    <th>
                                        <select id="filtroAuxiliar" v-model="filtroAuxiliar" class="form-select form-select-sm">
                                            <option value="">Todos ({{ encuestasEnProceso.length }})</option>
                                            <option v-for="auxiliar in auxiliaresDisponibles" :key="auxiliar.id" :value="auxiliar.id">
                                                {{ auxiliar.nombre }} ({{ auxiliar.cantidad }})
                                            </option>
                                        </select>
                                    </th>
                                    <th colspan="3"></th>
                                    <th>
                                        <select id="filtroEstadoProfesional" v-model="filtroEstadoProfesional" class="form-select form-select-sm">
                                            <option value="">Estados: todos los profesionales</option>
                                            <option v-for="profesional in profesionalesDisponibles" :key="profesional.id" :value="profesional.id">
                                                {{ profesional.nombre }} ({{ profesional.cantidad }})
                                            </option>
                                        </select>
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(encuesta, index) in encuestasEnProcesoFiltradas" :key="encuesta.id || index">
                                    <td>{{ obtenerNombreAuxiliar(encuesta.idEncuestador) }}</td>
                                    <td>
                                        <div class="paciente-en-proceso">
                                            <strong>{{ nombrePacienteEnProceso(encuesta) }}</strong>
                                            <small class="text-muted d-block">
                                                Nac: {{ formatearFechaCorta(encuesta.fechaNac) || 'N/A' }}
                                                · {{ calcularEdadTexto(encuesta.fechaNac) }}
                                                · {{ documentoPaciente(encuesta) }}
                                            </small>
                                        </div>
                                    </td>
                                    <td>{{ encuesta.eps }}</td>
                                    <td>{{ formatearFechaCorta(encuesta.fecha) || 'N/A' }}</td>
                                    <td>
                                        <div class="estado-lista-compacta">
                                            <span
                                                v-for="estado in obtenerEstadosVisibles(encuesta)"
                                                :key="estado.key"
                                                class="estado-chip"
                                                :class="estado.completado ? 'estado-chip-ok' : 'estado-chip-pendiente'"
                                                :aria-label="tooltipEstadoGestion(estado)">
                                                <span class="estado-chip-rol">{{ abreviarRolEstado(estado.rol) }}</span>
                                                <i class="bi" :class="estado.completado ? 'bi-check-lg' : 'bi-x-lg'"></i>
                                                <span class="estado-chip-tooltip">{{ tooltipEstadoGestion(estado) }}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="acciones-proceso" v-if="obtenerDestinosRegreso(encuesta).length">
                                            <button
                                                v-for="destino in obtenerDestinosRegreso(encuesta)"
                                                :key="`${encuesta.id}-proc-${destino.statusKey}`"
                                                type="button"
                                                class="btn btn-sm btn-regresar-proceso"
                                                :disabled="regresarDisabled[`${encuesta.id}_${destino.statusKey}`]"
                                                :title="`Regresar a ${destino.rolLabel} para corrección`"
                                                @click="regresarParaCorreccion(encuesta, destino)">
                                                <i class="bi bi-arrow-counterclockwise"></i>
                                                <span>{{ destino.rolShort }}</span>
                                            </button>
                                        </div>
                                        <span v-else class="text-muted small">Sin acción</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="tabla-proceso-respiro" aria-hidden="true"></div>
                </div>
                </div>




            </div>
            <!--     <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab" tabindex="0">
                ...</div>
            <div class="tab-pane fade" id="nav-disabled" role="tabpanel" aria-labelledby="nav-disabled-tab"
                tabindex="0">...</div> -->
        </div>


    </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import moment from "moment";
import { getAllUsers } from "@/api/usersApi";
import { buildExcelRowsFromObjects, exportRowsToExcel } from "@/utils/excelExport";
import realtime_api from "@/api/realtimeApi";
import { encuestasApi } from "@/api/modulesApi";
import { construirTooltipEpsCierres } from "@/utils/gestionCounters";
import { formatBandejaShortDate, groupBandejaItemsByDay, sortBandejaItems } from "@/utils/bandejaPresentation";
import HoverInfoBadge from "@/components/HoverInfoBadge.vue";
import AssignedProfessionalsBadge from "@/components/AssignedProfessionalsBadge.vue";
import ProfesionalGrupoInfo from "@/components/ProfesionalGrupoInfo.vue";
import { buildEstadoViewQuery } from "@/utils/estadoViewContext";
export default {
    components: {
        HoverInfoBadge,
        AssignedProfessionalsBadge,
        ProfesionalGrupoInfo,
    },
    data() {
        return {
            cargando: true,
            fechaActual: "",
            filtroAuxiliar: "",
            filtroEstadoProfesional: "",
            auxiliaresPorDocumento: {},
            regresarDisabled: {},
            encuestasContador: [],
            cantCerradosHoyValor: 0,
            cantCerradosSemanaValor: 0,
        };
    },
    methods: {
        ...mapActions([
            "removeRegEnc",
            "getAllRegistersByFechaStatus",
            "getAllRegistersByFecha",
            "getAllRegistersByIduserEnfer",
            " SelectExistenteAgendas",
        ]),

        obtenerNivelStatusGestion(encuesta = {}, statusKey = "") {
            if (!statusKey) return 0;

            const valorCrudo = encuesta?.[`${statusKey}_valor`];
            if (valorCrudo !== undefined && valorCrudo !== null && valorCrudo !== "") {
                const parsed = Number(valorCrudo);
                if (Number.isFinite(parsed)) {
                    if (parsed >= 2) return 2;
                    if (parsed >= 1) return 1;
                    return 0;
                }
            }

            const base = encuesta?.[statusKey];
            if (typeof base === "boolean") return base ? 1 : 0;

            const parsedBase = Number(base);
            if (Number.isFinite(parsedBase)) {
                if (parsedBase >= 2) return 2;
                if (parsedBase >= 1) return 1;
                return 0;
            }

            return 0;
        },

        obtenerDefinicionesDestinoRegreso(encuesta = {}) {
            const docMedico = String(encuesta?.idMedicoAtiende || "").trim();
            const docEnfermero = String(encuesta?.idEnfermeroAtiende || "").trim();
            const docPsicologo = String(encuesta?.idPsicologoAtiende || "").trim();
            const docTsocial = String(encuesta?.idTsocialAtiende || "").trim();
            const docNutricionista = String(
                encuesta?.idNutricionistaAtiende ||
                encuesta?.idNutriAtiende ||
                encuesta?.id_nutricionista_atiende ||
                ""
            ).trim();
            const docHigienistaOral = String(encuesta?.idHigienistaOralAtiende || encuesta?.id_higienista_oral_atiende || "").trim();
            const docAux = String(encuesta?.idEncuestador || "").trim();

            return [
                { statusKey: "status_gest_aux", fechaKey: "fechagestAuxiliar", rolLabel: "Auxiliar", rolShort: "Aux", doc: docAux },
                { statusKey: "status_gest_medica", fechaKey: "fechagestMedica", rolLabel: "Médico", rolShort: "Med", doc: docMedico },
                { statusKey: "status_gest_enfermera", fechaKey: "fechagestEnfermera", rolLabel: "Enfermero", rolShort: "Enf", doc: docEnfermero },
                { statusKey: "status_gest_psicologo", fechaKey: "fechagestPsicologo", rolLabel: "Psicólogo", rolShort: "Psi", doc: docPsicologo },
                { statusKey: "status_gest_tsocial", fechaKey: "fechagestTsocial", rolLabel: "Trabajador social", rolShort: "TS", doc: docTsocial },
                { statusKey: "status_gest_nutricionista", fechaKey: "fechagestNutricionista", rolLabel: "Nutricionista", rolShort: "Nut", doc: docNutricionista },
                { statusKey: "status_gest_higienista_oral", fechaKey: "fechagestHigienistaOral", rolLabel: "Higienista oral", rolShort: "Hig", doc: docHigienistaOral },
            ].filter((item) => !!item.doc);
        },

        obtenerDestinosRegreso(encuesta) {
            if (!encuesta || !encuesta.id) return false;
            return this.obtenerDefinicionesDestinoRegreso(encuesta).filter((destino) => {
                const nivel = this.obtenerNivelStatusGestion(encuesta, destino.statusKey);
                return nivel >= 1;
            });
        },

        async regresarParaCorreccion(encuesta, destino) {
            if (!encuesta?.id || !destino?.statusKey) return;

            const nivel = this.obtenerNivelStatusGestion(encuesta, destino.statusKey);
            if (nivel < 1) {
                alert("Este registro no esta cerrado para regresar a correccion.");
                return;
            }

            const confirmar = confirm(`Este registro se regresara a ${destino.rolLabel} para corregir CUPS. ¿Desea continuar?`);
            if (!confirmar) return;

            const disabledKey = `${encuesta.id}_${destino.statusKey}`;
            this.regresarDisabled = {
                ...this.regresarDisabled,
                [disabledKey]: true,
            };

            try {
                const payload = {
                    [destino.statusKey]: 0,
                };

                await encuestasApi.update(encuesta.id, payload);

                const documentoObjetivo = this.getDocumentoObjetivo();
                const convenioObjetivo = this.getConvenioObjetivo();
                const resultado = await this.getAllRegistersByIduserEnfer({
                    idUsuario: documentoObjetivo,
                    convenio: convenioObjetivo,
                    includeSource: true,
                });
                this.encuestasContador = Array.isArray(resultado?.source) ? resultado.source : [];
                this.actualizarMetricasDesdeFuente();

                alert(`Registro regresado a ${destino.rolLabel} para correccion de CUPS.`);
            } catch (error) {
                console.error("Error al regresar registro para correccion de CUPS:", error);
                alert("No se pudo regresar el registro: " + (error?.message || error));
            } finally {
                this.regresarDisabled = {
                    ...this.regresarDisabled,
                    [disabledKey]: false,
                };
            }
        },

        async removeRegEncuesta(id) {
            try {
                await this.removeRegEnc(id);
                alert("Registro eliminado exitosamente.");
                await this.cargarEncuestas();
            } catch (error) {
                console.error("Error al eliminar registro:", error);
                alert("No se pudo eliminar el registro: " + (error?.message || error));
            }
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
            sessionStorage.setItem("rutaAnterior", "/sop_enfermero");
            this.$router.push({
                name: "sop_cups",
                params: {
                    idEncuesta: id,
                },
                query: buildEstadoViewQuery(this.$route),
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

        formatearFechaCorta(valorFecha) {
            return formatBandejaShortDate(valorFecha);
        },

        calcularEdad(fechaNacimiento) {
            if (!fechaNacimiento) return null;

            const nacimiento = moment(fechaNacimiento);
            if (!nacimiento.isValid()) return null;

            return moment().diff(nacimiento, "years");
        },

        calcularEdadTexto(fechaNacimiento) {
            const edad = this.calcularEdad(fechaNacimiento);
            return Number.isFinite(edad) ? `${edad} años` : "N/A";
        },

        documentoPaciente(encuesta = {}) {
            const documento = [encuesta.tipodoc, encuesta.numdoc]
                .map((valor) => String(valor || "").trim())
                .filter(Boolean)
                .join("-");

            return documento || "N/A";
        },

        nombrePacienteEnProceso(encuesta = {}) {
            const nombre = `${encuesta.nombre1 || ""} ${encuesta.apellido1 || ""} ${encuesta.apellido2 || ""}`.trim();
            return nombre || "Sin nombre";
        },

        textoPacienteEnProceso(encuesta = {}) {
            return {
                nombre: this.nombrePacienteEnProceso(encuesta),
                fechaNac: this.formatearFechaCorta(encuesta.fechaNac) || "N/A",
                edad: this.calcularEdadTexto(encuesta.fechaNac),
                documento: this.documentoPaciente(encuesta),
            };
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

        obtenerNombreProfesional(idDocumento) {
            const id = String(idDocumento || "").trim();
            if (!id) return "Sin asignar";
            return this.auxiliaresPorDocumento[id] || id;
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
                idEnfermeroAtiende: this.getDocumentoObjetivo(),
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
            const convenioObjetivo = String(this.getConvenioObjetivo() || "").trim().toLowerCase();

            if (!documentoObjetivo) {
                this.cantCerradosHoyValor = 0;
                this.cantCerradosSemanaValor = 0;
                return;
            }

            const fuente = Array.isArray(this.encuestasContador)
                ? this.encuestasContador.filter((encuesta) => {
                    if (!convenioObjetivo) return true;
                    return this.normalizarConvenioEncuesta(encuesta) === convenioObjetivo;
                })
                : [];

            this.cantCerradosHoyValor = this.contarCerradosEnfermeriaPorRango(fuente, this.fechaActual, this.fechaActual);

            const inicioSemana = this.fechaActual
                ? moment(this.fechaActual, "YYYY-MM-DD").startOf("isoWeek").format("YYYY-MM-DD")
                : "";
            const finSemana = this.fechaActual
                ? moment(this.fechaActual, "YYYY-MM-DD").endOf("isoWeek").format("YYYY-MM-DD")
                : "";

            this.cantCerradosSemanaValor = this.contarCerradosEnfermeriaPorRango(fuente, inicioSemana, finSemana);
        },

        normalizarConvenioEncuesta(encuesta) {
            return String(encuesta?.convenio || "").trim().toLowerCase();
        },

        obtenerFechaGestionEnfermeria(encuesta) {
            return encuesta?.fechagestEnfermera ?? encuesta?.fecha_gest_enfermera ?? "";
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

        contarCerradosEnfermeriaPorRango(encuestas, fechaInicio, fechaFin) {
            const documentoObjetivo = String(this.getDocumentoObjetivo() || "").trim();
            const convenioObjetivo = String(this.getConvenioObjetivo() || "").trim().toLowerCase();

            if (!documentoObjetivo || !fechaInicio || !fechaFin) return 0;

            return (encuestas || []).filter((encuesta) => {
                if (String(encuesta?.idEnfermeroAtiende || "").trim() !== documentoObjetivo) return false;
                if (convenioObjetivo && this.normalizarConvenioEncuesta(encuesta) !== convenioObjetivo) return false;
                if (!this.esEstadoCerrado(encuesta?.status_gest_enfermera)) return false;

                const fechaGestion = String(this.obtenerFechaGestionEnfermeria(encuesta) || "").trim().match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || "";
                if (!fechaGestion) return false;

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

            try {
                const documentoObjetivo = this.getDocumentoObjetivo();
                const convenioObjetivo = this.getConvenioObjetivo();

                if (!documentoObjetivo) {
                    throw new Error("No se encontro el documento del profesional a consultar");
                }

                const [resultadoEnfermero] = await Promise.all([
                    this.getAllRegistersByIduserEnfer({
                        idUsuario: documentoObjetivo,
                        convenio: convenioObjetivo,
                        includeSource: true,
                    }),
                    this.cargarAuxiliares(),
                ]);

                this.encuestasContador = Array.isArray(resultadoEnfermero?.source) ? resultadoEnfermero.source : [];
                this.actualizarMetricasDesdeFuente();
            } catch (error) {
                console.error("Error cargando encuestas en sop_enfermero:", error);
                alert("Error cargando encuestas: " + (error?.message || error));
            } finally {
                this.cargando = false;
            }
        },

        construirEstadosGestion(encuesta) {
            const estados = [];
            const convenio = this.getConvenioObjetivo();

            const agregarEstado = ({ keyPrefix, idProfesional, rol, statusValue, fechaValue }) => {
                const documento = String(idProfesional || "").trim();
                if (!documento) return;

                const completado = statusValue === true;
                estados.push({
                    key: `${keyPrefix}-${encuesta.id || encuesta.numdoc || encuesta.fecha || ''}`,
                    idProfesional: documento,
                    rol,
                    nombre: this.obtenerNombreProfesional(documento),
                    completado,
                    fecha: completado ? (fechaValue || '') : '',
                });
            };

            // Solo se muestran roles con profesional asignado en la encuesta.
            if ('status_gest_aux' in encuesta) {
                agregarEstado({
                    keyPrefix: 'aux',
                    idProfesional: encuesta.idEncuestador,
                    rol: 'Auxiliar',
                    statusValue: encuesta.status_gest_aux,
                    fechaValue: encuesta.fechagestAuxiliar,
                });
            }

            if ('status_gest_medica' in encuesta) {
                agregarEstado({
                    keyPrefix: 'med',
                    idProfesional: encuesta.idMedicoAtiende,
                    rol: 'Médico',
                    statusValue: encuesta.status_gest_medica,
                    fechaValue: encuesta.fechagestMedica,
                });
            }

            if ('status_gest_psicologo' in encuesta && convenio !== 'Extramural') {
                agregarEstado({
                    keyPrefix: 'psi',
                    idProfesional: encuesta.idPsicologoAtiende,
                    rol: 'Psicólogo',
                    statusValue: encuesta.status_gest_psicologo,
                    fechaValue: encuesta.fechagestPsicologo,
                });
            }

            if ('status_gest_tsocial' in encuesta && convenio !== 'Extramural') {
                agregarEstado({
                    keyPrefix: 'ts',
                    idProfesional: encuesta.idTsocialAtiende,
                    rol: 'Trabajador social',
                    statusValue: encuesta.status_gest_tsocial,
                    fechaValue: encuesta.fechagestTsocial,
                });
            }

            if (
                'status_gest_nutricionista' in encuesta &&
                convenio !== 'Extramural' &&
                convenio !== 'Unidesa' &&
                convenio !== 'Unides'
            ) {
                agregarEstado({
                    keyPrefix: 'nut',
                    idProfesional: encuesta.idNutricionistaAtiende || encuesta.idNutriAtiende,
                    rol: 'Nutricionista',
                    statusValue: encuesta.status_gest_nutricionista,
                    fechaValue: encuesta.fechagestNutricionista,
                });
            }

            if (
                'status_gest_higienista_oral' in encuesta &&
                convenio !== 'Extramural' &&
                convenio !== 'E Basicos' &&
                convenio !== 'PIC'
            ) {
                agregarEstado({
                    keyPrefix: 'hig',
                    idProfesional: encuesta.idHigienistaOralAtiende,
                    rol: 'Higienista oral',
                    statusValue: encuesta.status_gest_higienista_oral,
                    fechaValue: encuesta.fechagestHigienistaOral,
                });
            }

            return estados;
        },

        cumpleFiltroEstadoProfesional(encuesta) {
            const estados = this.construirEstadosGestion(encuesta);
            if (!estados.length) return false;

            if (!this.filtroEstadoProfesional) {
                return true;
            }

            return estados.some((estado) => {
                const idProfesional = String(estado.idProfesional || "").trim();
                return idProfesional === this.filtroEstadoProfesional && estado.completado === false;
            });
        },

        obtenerEstadosVisibles(encuesta) {
            const estados = this.construirEstadosGestion(encuesta);

            if (!this.filtroEstadoProfesional) {
                return estados;
            }

            return estados.filter((estado) => {
                const idProfesional = String(estado.idProfesional || "").trim();
                return idProfesional === this.filtroEstadoProfesional && estado.completado === false;
            });
        },

        abreviarRolEstado(rol = "") {
            const mapa = {
                Auxiliar: "Aux",
                "Médico": "Med",
                Medico: "Med",
                Enfermero: "Enf",
                "Psicólogo": "Psi",
                Psicologo: "Psi",
                "Trabajador social": "TS",
                Nutricionista: "Nut",
                "Higienista oral": "Hig",
            };

            return mapa[String(rol || "").trim()] || String(rol || "").trim().slice(0, 3) || "Rol";
        },

        tooltipEstadoGestion(estado = {}) {
            const estadoTexto = estado.completado ? "Completado" : "Pendiente";
            const fecha = estado.fecha ? ` · ${this.formatearFechaCorta(estado.fecha)}` : "";
            return `${estado.rol}: ${estado.nombre} · ${estadoTexto}${fecha}`;
        },

        escaparHtml(texto = "") {
            return String(texto)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },

        construirHtmlTablaEnProceso() {
            const headers = ["Auxiliar", "Paciente", "EPS", "F. Encuesta", "Estados"];
            const filas = this.encuestasEnProcesoFiltradas;
            const thead = `<thead><tr>${headers.map((h) => `<th>${this.escaparHtml(h)}</th>`).join("")}</tr></thead>`;
            const tbody = `<tbody>${filas.map((encuesta) => {
                const estados = this.construirEstadosGestion(encuesta)
                    .map((estado) => `${estado.rol}: ${estado.nombre} (${estado.completado ? "OK" : "Pendiente"}${estado.fecha ? ` - ${estado.fecha}` : ""})`)
                    .join(" | ");
                const paciente = this.textoPacienteEnProceso(encuesta);

                return `
                    <tr>
                        <td>${this.escaparHtml(this.obtenerNombreAuxiliar(encuesta.idEncuestador))}</td>
                        <td>${this.escaparHtml(`${paciente.nombre} | Nac: ${paciente.fechaNac} · ${paciente.edad} · ${paciente.documento}`)}</td>
                        <td>${this.escaparHtml(encuesta.eps || "")}</td>
                        <td>${this.escaparHtml(encuesta.fecha || "")}</td>
                        <td>${this.escaparHtml(estados)}</td>
                    </tr>`;
            }).join("")}</tbody>`;

            return `<table border="1">${thead}${tbody}</table>`;
        },

        exportarEnProcesoExcel() {
            const fecha = new Date().toISOString().slice(0, 10);
            const filasBase = this.encuestasEnProcesoFiltradas;
            const filasExcel = [];

            const nombreProfesionalSeleccionado = this.filtroEstadoProfesional
                ? this.obtenerNombreProfesional(this.filtroEstadoProfesional)
                : "todos_profesionales";

            const nombreArchivoProfesional = String(nombreProfesionalSeleccionado)
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "")
                .toLowerCase() || "profesional";

            filasBase.forEach((encuesta) => {
                const estados = this.obtenerEstadosVisibles(encuesta);

                if (!estados.length) return;

                estados.forEach((estado) => {
                    const paciente = this.textoPacienteEnProceso(encuesta);
                    filasExcel.push({
                        Auxiliar: this.obtenerNombreAuxiliar(encuesta.idEncuestador),
                        Paciente: paciente.nombre,
                        Documento: paciente.documento,
                        FechaNac: paciente.fechaNac,
                        Edad: this.calcularEdad(encuesta.fechaNac),
                        EPS: encuesta.eps || "",
                        FechaEncuesta: encuesta.fecha || "",
                        Profesional: estado.nombre,
                        Rol: estado.rol,
                        Estado: estado.completado ? "OK" : "Pendiente",
                        FechaEstado: estado.fecha || "",
                    });
                });
            });

            if (!filasExcel.length) {
                alert("No hay datos visibles para exportar con los filtros actuales.");
                return;
            }

            exportRowsToExcel({
                rows: buildExcelRowsFromObjects(filasExcel, { numericLabels: ["Edad"] }),
                numericLabels: ["Edad"],
                sheetName: "En_Proceso",
                fileName: `en_proceso_${nombreArchivoProfesional}_${fecha}.xlsx`,
                colWidths: [24, 26, 16, 12, 10, 16, 16, 26, 20, 12, 18],
            });
        },
    },

    computed: {
        ...mapState(["encuestas", "userData", "cantEncuestas"]),
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
        convenioThemeClass() {
            const convenio = String(this.getConvenioObjetivo() || "").trim().toLowerCase();

            if (convenio === "pic") {
                return "convenio-pic";
            }

            if (convenio === "e basicos") {
                return "convenio-ebasicos";
            }

            if (convenio === "extramural") {
                return "convenio-extramural";
            }

            return "convenio-extramural";
        },
        estadoGestionMedica() {
            return (encuesta) => {
                return encuesta?.status_gest_medica === true;
            };
        },
        estadoGestionNutricionista() {
            return (encuesta) => {
                return encuesta?.status_gest_nutricionista === true;
            };
        },
        estadoGestionHigienistaOral() {
            return (encuesta) => {
                return encuesta?.status_gest_higienista_oral === true;
            };
        },
        encuestasPendientesBase() {
            if (!this.encuestas || this.encuestas.length === 0) return [];
            const convenioObjetivo = this.getConvenioObjetivo();
            if (!convenioObjetivo) return this.encuestas;

            return this.encuestas.filter(encuesta =>
                String(encuesta.convenio || "").trim().toLowerCase() === convenioObjetivo.toLowerCase()
            );
        },
        encuestasEnProcesoBase() {
            if (!this.encuestas || this.encuestas.length === 0) return [];
            const convenioObjetivo = this.getConvenioObjetivo();
            if (!convenioObjetivo) return this.encuestas;

            return this.encuestas.filter(encuesta =>
                String(encuesta.convenio || "").trim().toLowerCase() === convenioObjetivo.toLowerCase()
            );
        },
        encuestasContadorFiltradasPorConvenio() {
            if (!this.encuestasContador || this.encuestasContador.length === 0) return [];
            const convenioObjetivo = this.getConvenioObjetivo();
            if (!convenioObjetivo) return this.encuestasContador;

            return this.encuestasContador.filter((encuesta) =>
                String(encuesta.convenio || "").trim().toLowerCase() === convenioObjetivo.toLowerCase()
            );
        },
        encuestasPendientes() {
            if (!this.encuestasPendientesBase || this.encuestasPendientesBase.length === 0) return [];

            const documento = this.getDocumentoObjetivo();
            if (!documento) return [];

            const convenio = this.getConvenioObjetivo();
            const esExtramural = convenio === 'Extramural';
            const esEBasicos = convenio === 'E Basicos';
            const esUnidesa = convenio === 'Unidesa' || convenio === 'Unides';

            return sortBandejaItems(this.encuestasPendientesBase.filter((encuesta) => {
                if (encuesta.idEnfermeroAtiende !== documento) return false;
                if (encuesta.status_gest_enfermera !== false) return false;

                if (esExtramural) {
                    return encuesta.status_gest_aux === true && this.estadoGestionMedica(encuesta);
                }

                if (esUnidesa) {
                    const requiereHigienista = !!encuesta.idHigienistaOralAtiende;
                    if (encuesta.status_gest_aux !== true) return false;
                    if (!this.estadoGestionMedica(encuesta)) return false;
                    if (requiereHigienista && !this.estadoGestionHigienistaOral(encuesta)) return false;
                    return true;
                }

                if (esEBasicos) {
                    const requiereAux = !!encuesta.idEncuestador;
                    const requiereMed = !!encuesta.idMedicoAtiende;
                    const requierePsi = !!encuesta.idPsicologoAtiende;
                    const requiereTS = !!encuesta.idTsocialAtiende;
                    const requiereNutri = !!(encuesta.idNutricionistaAtiende || encuesta.idNutriAtiende);

                    if (requiereAux && encuesta.status_gest_aux !== true) return false;
                    if (requiereMed && !this.estadoGestionMedica(encuesta)) return false;
                    if (requierePsi && encuesta.status_gest_psicologo !== true) return false;
                    if (requiereTS && encuesta.status_gest_tsocial !== true) return false;
                    if (requiereNutri && !this.estadoGestionNutricionista(encuesta)) return false;

                    return true;
                }

                const requierePsi = !!encuesta.idPsicologoAtiende;
                const requiereTS = !!encuesta.idTsocialAtiende;
                const requiereNutri = !!(encuesta.idNutricionistaAtiende || encuesta.idNutriAtiende);

                if (encuesta.status_gest_aux !== true) return false;
                if (!this.estadoGestionMedica(encuesta)) return false;
                if (requierePsi && encuesta.status_gest_psicologo !== true) return false;
                if (requiereTS && encuesta.status_gest_tsocial !== true) return false;
                if (requiereNutri && !this.estadoGestionNutricionista(encuesta)) return false;

                return true;
            }), (encuesta) => encuesta?.fecha || encuesta?.created_at || encuesta?.updated_at);
        },
        encuestasPendientesAgrupadas() {
            return this.agruparEncuestasPorDia(this.encuestasPendientes);
        },
        cantEncuestasPendientes() {
            return this.encuestasPendientes.length;
        },
        encuestasEnProceso() {
            if (!this.encuestasEnProcesoBase || this.encuestasEnProcesoBase.length === 0) return [];

            const documento = this.getDocumentoObjetivo();
            if (!documento) return [];

            const convenio = this.getConvenioObjetivo();
            const esExtramural = convenio === 'Extramural';
            const esEBasicos = convenio === 'E Basicos';
            const esUnidesa = convenio === 'Unidesa' || convenio === 'Unides';

            return this.encuestasEnProcesoBase.filter((encuesta) => {
                if (encuesta.idEnfermeroAtiende !== documento) return false;

                if (esExtramural) {
                    return encuesta.status_gest_aux === false || !this.estadoGestionMedica(encuesta);
                }

                if (esUnidesa) {
                    const requiereHigienista = !!encuesta.idHigienistaOralAtiende;
                    const estados = [encuesta.status_gest_aux, this.estadoGestionMedica(encuesta)];
                    if (requiereHigienista) estados.push(this.estadoGestionHigienistaOral(encuesta));
                    return estados.some((valor) => valor === false);
                }

                if (esEBasicos) {
                    const requiereAux = !!encuesta.idEncuestador;
                    const requiereMed = !!encuesta.idMedicoAtiende;
                    const requierePsi = !!encuesta.idPsicologoAtiende;
                    const requiereTS = !!encuesta.idTsocialAtiende;
                    const requiereNutri = !!(encuesta.idNutricionistaAtiende || encuesta.idNutriAtiende);

                    const estados = [];
                    if (requiereAux) estados.push(encuesta.status_gest_aux);
                    if (requiereMed) estados.push(this.estadoGestionMedica(encuesta));
                    if (requierePsi) estados.push(encuesta.status_gest_psicologo);
                    if (requiereTS) estados.push(encuesta.status_gest_tsocial);
                    if (requiereNutri) estados.push(this.estadoGestionNutricionista(encuesta));

                    return estados.length > 0 ? estados.some((valor) => valor === false) : false;
                }

                const estados = [encuesta.status_gest_aux, this.estadoGestionMedica(encuesta)];
                if (encuesta.idPsicologoAtiende) estados.push(encuesta.status_gest_psicologo);
                if (encuesta.idTsocialAtiende) estados.push(encuesta.status_gest_tsocial);
                if (encuesta.idNutricionistaAtiende || encuesta.idNutriAtiende) {
                    estados.push(this.estadoGestionNutricionista(encuesta));
                }

                return estados.some((valor) => valor === false);
            });
        },
        cantEncuestasEnProceso() {
            return this.encuestasEnProceso.length;
        },
        encuestasEnProcesoFiltradas() {
            return sortBandejaItems(this.encuestasEnProceso.filter((encuesta) => {
                const idAux = String(encuesta.idEncuestador || "").trim();
                const cumpleAuxiliar = !this.filtroAuxiliar || idAux === this.filtroAuxiliar;
                if (!cumpleAuxiliar) return false;

                return this.cumpleFiltroEstadoProfesional(encuesta);
            }), (encuesta) => encuesta?.fecha || encuesta?.created_at || encuesta?.updated_at);
        },
        auxiliaresDisponibles() {
            const conteoPorId = {};

            this.encuestasEnProceso.forEach((encuesta) => {
                const id = String(encuesta.idEncuestador || "").trim();
                if (!id) return;

                conteoPorId[id] = (conteoPorId[id] || 0) + 1;
            });

            return Object.keys(conteoPorId)
                .map((id) => ({
                    id,
                    nombre: this.obtenerNombreAuxiliar(id),
                    cantidad: conteoPorId[id],
                }))
                .sort((a, b) => a.nombre.localeCompare(b.nombre));
        },
        profesionalesDisponibles() {
            const conteoPorId = {};

            this.encuestasEnProceso.forEach((encuesta) => {
                const estados = this.construirEstadosGestion(encuesta);

                estados.forEach((estado) => {
                    const id = String(estado.idProfesional || "").trim();
                    if (!id || estado.completado === true) return;

                    conteoPorId[id] = (conteoPorId[id] || 0) + 1;
                });
            });

            return Object.keys(conteoPorId)
                .map((id) => ({
                    id,
                    nombre: this.obtenerNombreProfesional(id),
                    cantidad: conteoPorId[id],
                }))
                .sort((a, b) => a.nombre.localeCompare(b.nombre));
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
                docKeys: ["idEnfermeroAtiende"],
                statusKey: "status_gest_enfermera",
                fechaKey: "fechagestEnfermera",
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
                if (to.name === 'sop_enfermero') {
                    this.cargarEncuestas();
                }
            },
            deep: true,
        }
    },
    created() {
        document.body.classList.add("pagina-enfermero");
    },
    beforeUnmount() {
        document.body.classList.remove("pagina-enfermero");
    },
    async mounted() {
        this.fechaActual = moment().format("YYYY-MM-DD");
        await this.cargarEncuestas();
    },
};
</script>

<style>
.convenio-theme {
    --convenio-color-1: #0f766e;
    --convenio-color-2: #0d9488;
    --convenio-color-3: #14b8a6;
    --convenio-text-soft: #e6fffa;
}

.convenio-theme.convenio-extramural {
    --convenio-color-1: #0f766e;
    --convenio-color-2: #0d9488;
    --convenio-color-3: #14b8a6;
    --convenio-text-soft: #e6fffa;
}

.convenio-theme.convenio-ebasicos {
    --convenio-color-1: #166534;
    --convenio-color-2: #15803d;
    --convenio-color-3: #22c55e;
    --convenio-text-soft: #ecfdf5;
}

.convenio-theme.convenio-pic {
    --convenio-color-1: #9a3412;
    --convenio-color-2: #c2410c;
    --convenio-color-3: #f97316;
    --convenio-text-soft: #fff7ed;
}

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
    border-radius: 0;
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

.status-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
}

.status-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.7rem;
    line-height: 1.1;
}

.status-date {
    font-size: 0.65rem;
    opacity: 0.85;
}

.estado-lista-compacta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-content: center;
    gap: 6px;
    min-width: 0;
    width: 100%;
    max-width: none;
    min-height: 100%;
}

.estado-chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.1;
    border: 1px solid transparent;
    cursor: help;
    min-height: 28px;
}

.estado-chip:hover,
.estado-chip:focus-visible {
    z-index: 1035;
}

.estado-chip-ok {
    background-color: #d1e7dd;
    color: #0f5132;
    border-color: #badbcc;
}

.estado-chip-pendiente {
    background-color: #fce7f3;
    color: #be185d;
    border-color: #f9a8d4;
}

.estado-chip-pendiente .bi {
    color: #db2777;
}

.estado-chip-rol {
    font-size: 0.78rem;
    letter-spacing: 0.02em;
}

.estado-chip .bi {
    font-size: 0.95rem;
    line-height: 1;
}

.estado-chip-tooltip {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    left: 50%;
    top: calc(100% + 8px);
    bottom: auto;
    transform: translateX(-50%);
    min-width: max-content;
    max-width: 280px;
    padding: 8px 10px;
    border-radius: 8px;
    background: #212529;
    color: #fff;
    font-size: 0.8rem;
    font-weight: 500;
    line-height: 1.3;
    white-space: normal;
    text-align: center;
    z-index: 1040;
    pointer-events: none;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18);
    transition: opacity 0.15s ease, visibility 0.15s ease;
}

.estado-chip-tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 100%;
    top: auto;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #212529 transparent;
}

.estado-chip:hover .estado-chip-tooltip,
.estado-chip:focus-visible .estado-chip-tooltip {
    visibility: visible;
    opacity: 1;
}

.acciones-proceso {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-content: center;
    gap: 8px;
    min-width: 0;
    width: 100%;
    min-height: 100%;
}

.btn-regresar-proceso {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-width: 58px;
    padding: 6px 11px;
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1;
    color: #9a3412;
    background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%);
    border: 2px solid #ea580c;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(234, 88, 12, 0.22);
    white-space: nowrap;
    transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.btn-regresar-proceso .bi {
    font-size: 0.92rem;
    line-height: 1;
}

.btn-regresar-proceso:hover:not(:disabled),
.btn-regresar-proceso:focus-visible:not(:disabled) {
    color: #fff;
    background: linear-gradient(180deg, #fb923c 0%, #ea580c 100%);
    border-color: #c2410c;
    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.38);
    transform: translateY(-1px);
}

.btn-regresar-proceso:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(234, 88, 12, 0.28);
}

.btn-regresar-proceso:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: none;
}

.paciente-en-proceso {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    min-height: 100%;
}

.tabla-proceso-wrap {
    border-radius: 0;
    box-shadow: none;
    border: 1px solid #dee2e6;
    background: var(--bs-body-bg);
    max-height: calc(100vh - 340px);
    overflow: auto;
    padding-bottom: 72px;
    box-sizing: border-box;
}

.tabla-proceso-respiro {
    min-height: 72px;
    width: 100%;
    flex-shrink: 0;
}

.enfermero-page #nav-profile .container-fluid {
    padding-bottom: 1.5rem;
}

.tabla-proceso tbody td {
    font-size: 0.8rem;
    vertical-align: middle;
    text-align: center;
    position: relative;
    overflow: visible;
}

.cabecera-proceso {
    z-index: 1020;
}

.cabecera-proceso th {
    position: sticky;
    top: 0;
    z-index: 1020;
    background: var(--bs-table-bg, #f8f9fa);
}

.enfermero-page {
    width: 100%;
    max-width: none;
    min-height: calc(100vh - 4rem);
    box-sizing: border-box;
}

.enfermero-page .alert,
.enfermero-page .bandeja-dia-badge,
.enfermero-page .progress-card,
.enfermero-page .tabla-proceso-wrap,
.enfermero-page .row.paciente {
    border-radius: 0 !important;
}

.enfermero-page .table-responsive,
.enfermero-page .tabla-proceso-wrap,
.enfermero-page .tabla-proceso {
    width: 100%;
    max-width: 100%;
}

.tabla-proceso thead th {
    font-size: 0.78rem;
    white-space: nowrap;
    vertical-align: middle;
    text-align: center;
}

.cabecera-proceso tr:nth-child(2) th {
    background: var(--bs-body-bg);
    padding-top: 0.35rem;
    padding-bottom: 0.35rem;
    text-align: center;
    vertical-align: middle;
    top: 34px;
    z-index: 1019;
}

.cabecera-proceso .form-select {
    margin-left: auto;
    margin-right: auto;
}

/* ===== TEMA VERDE TURQUESA (estilo navbar) ===== */
h1.display-6 {
    color: var(--convenio-color-1);
}

.row.paciente {
    background: linear-gradient(
        90deg,
        var(--convenio-color-1) 0%,
        var(--convenio-color-2) 30%,
        var(--convenio-color-3) 60%,
        var(--convenio-color-2) 80%,
        var(--convenio-color-1) 100%
    );
    border-radius: 0;
    padding: 8px 10px;
    color: #ffffff;
    display: flex;
    align-items: center;
}

.row.paciente small {
    display: block;
    color: var(--convenio-text-soft);
    line-height: 1.4;
}

.row.paciente strong {
    color: #ffffff;
    font-size: 0.9rem;
}

.tabla-proceso thead th {
    background: var(--convenio-color-1) !important;
    color: #ffffff !important;
    font-size: 0.78rem;
    white-space: nowrap;
    vertical-align: middle;
}

.progreso-indeterminado {
    background-color: var(--convenio-color-3) !important;
    width: 100%;
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
        border-radius: 0;
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

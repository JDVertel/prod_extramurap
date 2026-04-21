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
    <div v-if="!cargando" :class="['convenio-theme', convenioThemeClass]">
        <h1 class="display-6 center">{{ cargoMostrado }}</h1>
        <p v-if="esEstadoView && nombreProfesionalSeleccionado" class="text-center text-muted mb-2">
            Visualizando como admin: {{ nombreProfesionalSeleccionado }}
        </p>
        <div class="text-center mb-2">
            <span class="badge bg-success">
                <i class="bi bi-check2-all"></i> {{ cantCerradosHoy }} cerrado{{ cantCerradosHoy !== 1 ? 's' : '' }} hoy
            </span>
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
                        <div v-for="(encuesta, index) in encuestasPendientes" :key="index"
                            class="container rounded-lg p-2 mb-2" style="border-radius: 24px;">
                            <div class="row paciente shadow-sm">
                                <div class="col-6 col-md-6">
                                    <small><strong>{{ encuesta.nombre1 }} {{ encuesta.apellido1
                                            }}</strong> | </small>
                                    <small>EPS: {{ encuesta.eps }} | Riesgo: {{
                                        encuesta.poblacionRiesgo }}</small>
                                    <small>Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha
                                        }}</small>
                                    <!-- Mostrar actividades si existen -->

                                </div>

                                <div class="col-6 col-md-6 acciones-col ">
                                    <div class="btn-grid">
                                        <!-- Fila única: Visita, Caracterización y CUPS (3 botones) -->
                                        <div class="btn-row">

                                            <!-- CUPS (Enfermero y Medico) -->
                                            <div
                                                v-if="cargoMostrado === 'Enfermero' || cargoMostrado === 'Medico'">
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
                                                    class="btn btn-warning btn-sm agendar-btn"
                                                    :disabled="regresarDisabled[`${encuesta.id}_${destino.statusKey}`]"
                                                    @click="regresarParaCorreccion(encuesta, destino)">
                                                    <i class="bi bi-arrow-counterclockwise"></i>
                                                    <span class="agendar-label">{{ `Reg ${destino.rolShort}` }}</span>
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
            <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">


                <h4> <small>En proceso</small></h4>

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

                    <div class="table-responsive tabla-proceso-wrap" style="max-height: 500px; overflow-y: auto;">
                        <table class="table table-sm table-hover table-striped table-bordered align-middle mb-0 tabla-proceso">
                            <thead class="table-light sticky-top cabecera-proceso">
                                <tr>
                                    <th>Convenio</th>
                                    <th>Auxiliar</th>
                                    <th>Paciente</th>
                                    <th>EPS</th>
                                    <th>Riesgo</th>
                                    <th>F. Nac</th>
                                    <th>F. Encuesta</th>
                                    <th>Estados</th>
                                    <th>Acciones</th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th>
                                        <select id="filtroAuxiliar" v-model="filtroAuxiliar" class="form-select form-select-sm">
                                            <option value="">Todos ({{ encuestasEnProceso.length }})</option>
                                            <option v-for="auxiliar in auxiliaresDisponibles" :key="auxiliar.id" :value="auxiliar.id">
                                                {{ auxiliar.nombre }} ({{ auxiliar.cantidad }})
                                            </option>
                                        </select>
                                    </th>
                                    <th colspan="5"></th>
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
                                    <td>{{ encuesta.convenio || "Sin convenio" }}</td>
                                    <td>{{ obtenerNombreAuxiliar(encuesta.idEncuestador) }}</td>
                                    <td>{{ encuesta.nombre1 }} {{ encuesta.apellido1 }}</td>
                                    <td>{{ encuesta.eps }}</td>
                                    <td>{{ encuesta.poblacionRiesgo }}</td>
                                    <td>{{ encuesta.fechaNac }}</td>
                                    <td>{{ encuesta.fecha }}</td>
                                    <td>
                                        <div class="estado-lista">
                                            <div
                                                v-for="estado in obtenerEstadosVisibles(encuesta)"
                                                :key="estado.key"
                                                class="estado-item"
                                                :class="estado.completado ? 'estado-item-ok' : 'estado-item-pendiente'">
                                                <div class="estado-item-header">
                                                    <span class="estado-rol">{{ estado.rol }}</span>
                                                    <span class="badge rounded-pill"
                                                        :class="estado.completado ? 'bg-success' : 'bg-secondary'">
                                                        {{ estado.completado ? 'OK' : 'Pendiente' }}
                                                    </span>
                                                </div>
                                                <div class="estado-profesional">{{ estado.nombre }}</div>
                                                <div class="estado-fecha" v-if="estado.fecha">{{ estado.fecha }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="acciones-proceso" v-if="obtenerDestinosRegreso(encuesta).length">
                                            <button
                                                v-for="destino in obtenerDestinosRegreso(encuesta)"
                                                :key="`${encuesta.id}-proc-${destino.statusKey}`"
                                                type="button"
                                                class="btn btn-warning btn-sm"
                                                :disabled="regresarDisabled[`${encuesta.id}_${destino.statusKey}`]"
                                                @click="regresarParaCorreccion(encuesta, destino)">
                                                {{ `Reg ${destino.rolShort}` }}
                                            </button>
                                        </div>
                                        <span v-else class="text-muted small">Sin acción</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
import * as XLSX from "xlsx";
import realtime_api from "@/api/realtimeApi";
import { encuestasApi } from "@/api/modulesApi";
export default {
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
            const docAux = String(encuesta?.idEncuestador || "").trim();

            return [
                { statusKey: "status_gest_aux", fechaKey: "fechagestAuxiliar", rolLabel: "Auxiliar", rolShort: "Aux", doc: docAux },
                { statusKey: "status_gest_medica", fechaKey: "fechagestMedica", rolLabel: "Médico", rolShort: "Med", doc: docMedico },
                { statusKey: "status_gest_enfermera", fechaKey: "fechagestEnfermera", rolLabel: "Enfermero", rolShort: "Enf", doc: docEnfermero },
                { statusKey: "status_gest_psicologo", fechaKey: "fechagestPsicologo", rolLabel: "Psicólogo", rolShort: "Psi", doc: docPsicologo },
                { statusKey: "status_gest_tsocial", fechaKey: "fechagestTsocial", rolLabel: "Trabajador social", rolShort: "TS", doc: docTsocial },
                { statusKey: "status_gest_nutricionista", fechaKey: "fechagestNutricionista", rolLabel: "Nutricionista", rolShort: "Nut", doc: docNutricionista },
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
            sessionStorage.setItem("rutaAnterior", "/sop_enfermero");
            const query = String(this.$route?.query?.estadoView || "") === "1"
                ? {
                    estadoView: "1",
                    profesionalDoc: String(this.$route?.query?.profesionalDoc || this.getDocumentoObjetivo?.() || "").trim(),
                    profesionalCargo: String(this.$route?.query?.profesionalCargo || this.cargoMostrado || this.userData?.cargo || "").trim(),
                    profesionalConvenio: String(this.$route?.query?.profesionalConvenio || this.getConvenioObjetivo?.() || this.userData?.convenio || "").trim(),
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
            const { data } = await realtime_api.get("/Encuesta.json", {
                params: { _ts: Date.now() },
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

            if ('status_gest_aux' in encuesta && (convenio !== 'E Basicos' || encuesta.idEncuestador)) {
                estados.push({
                    key: `aux-${encuesta.id || encuesta.numdoc || encuesta.fecha || ''}`,
                    idProfesional: String(encuesta.idEncuestador || "").trim(),
                    rol: 'Auxiliar',
                    nombre: this.obtenerNombreProfesional(encuesta.idEncuestador),
                    completado: encuesta.status_gest_aux === true,
                    fecha: encuesta.status_gest_aux === true ? (encuesta.fechagestAuxiliar || '') : '',
                });
            }

            if ('status_gest_medica' in encuesta && (convenio !== 'E Basicos' || encuesta.idMedicoAtiende)) {
                estados.push({
                    key: `med-${encuesta.id || encuesta.numdoc || encuesta.fecha || ''}`,
                    idProfesional: String(encuesta.idMedicoAtiende || "").trim(),
                    rol: 'Médico',
                    nombre: this.obtenerNombreProfesional(encuesta.idMedicoAtiende),
                    completado: encuesta.status_gest_medica === true,
                    fecha: encuesta.status_gest_medica === true ? (encuesta.fechagestMedica || '') : '',
                });
            }

            if ('status_gest_psicologo' in encuesta && convenio !== 'Extramural' && (convenio !== 'E Basicos' || encuesta.idPsicologoAtiende)) {
                estados.push({
                    key: `psi-${encuesta.id || encuesta.numdoc || encuesta.fecha || ''}`,
                    idProfesional: String(encuesta.idPsicologoAtiende || "").trim(),
                    rol: 'Psicólogo',
                    nombre: this.obtenerNombreProfesional(encuesta.idPsicologoAtiende),
                    completado: encuesta.status_gest_psicologo === true,
                    fecha: encuesta.status_gest_psicologo === true ? (encuesta.fechagestPsicologo || '') : '',
                });
            }

            if ('status_gest_tsocial' in encuesta && convenio !== 'Extramural' && (convenio !== 'E Basicos' || encuesta.idTsocialAtiende)) {
                estados.push({
                    key: `ts-${encuesta.id || encuesta.numdoc || encuesta.fecha || ''}`,
                    idProfesional: String(encuesta.idTsocialAtiende || "").trim(),
                    rol: 'Trabajador social',
                    nombre: this.obtenerNombreProfesional(encuesta.idTsocialAtiende),
                    completado: encuesta.status_gest_tsocial === true,
                    fecha: encuesta.status_gest_tsocial === true ? (encuesta.fechagestTsocial || '') : '',
                });
            }

            if ('status_gest_nutricionista' in encuesta && convenio !== 'Extramural' && (convenio !== 'E Basicos' || encuesta.idNutricionistaAtiende || encuesta.idNutriAtiende)) {
                const idNutricionista = String(encuesta.idNutricionistaAtiende || encuesta.idNutriAtiende || "").trim();
                estados.push({
                    key: `nut-${encuesta.id || encuesta.numdoc || encuesta.fecha || ''}`,
                    idProfesional: idNutricionista,
                    rol: 'Nutricionista',
                    nombre: this.obtenerNombreProfesional(idNutricionista),
                    completado: encuesta.status_gest_nutricionista === true,
                    fecha: encuesta.status_gest_nutricionista === true ? (encuesta.fechagestNutricionista || '') : '',
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

        escaparHtml(texto = "") {
            return String(texto)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },

        construirHtmlTablaEnProceso() {
            const headers = ["Convenio", "Auxiliar", "Paciente", "EPS", "Riesgo", "F. Nac", "F. Encuesta", "Estados"];
            const filas = this.encuestasEnProcesoFiltradas;
            const thead = `<thead><tr>${headers.map((h) => `<th>${this.escaparHtml(h)}</th>`).join("")}</tr></thead>`;
            const tbody = `<tbody>${filas.map((encuesta) => {
                const estados = this.construirEstadosGestion(encuesta)
                    .map((estado) => `${estado.rol}: ${estado.nombre} (${estado.completado ? "OK" : "Pendiente"}${estado.fecha ? ` - ${estado.fecha}` : ""})`)
                    .join(" | ");

                return `
                    <tr>
                        <td>${this.escaparHtml(encuesta.convenio || "")}</td>
                        <td>${this.escaparHtml(this.obtenerNombreAuxiliar(encuesta.idEncuestador))}</td>
                        <td>${this.escaparHtml(`${encuesta.nombre1 || ""} ${encuesta.apellido1 || ""}`.trim())}</td>
                        <td>${this.escaparHtml(encuesta.eps || "")}</td>
                        <td>${this.escaparHtml(encuesta.poblacionRiesgo || "")}</td>
                        <td>${this.escaparHtml(encuesta.fechaNac || "")}</td>
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
                    filasExcel.push({
                        Convenio: encuesta.convenio || "",
                        Auxiliar: this.obtenerNombreAuxiliar(encuesta.idEncuestador),
                        Paciente: `${encuesta.nombre1 || ""} ${encuesta.apellido1 || ""}`.trim(),
                        EPS: encuesta.eps || "",
                        Riesgo: encuesta.poblacionRiesgo || "",
                        FechaNac: encuesta.fechaNac || "",
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

            const ws = XLSX.utils.json_to_sheet(filasExcel);
            if (ws["!ref"]) {
                ws["!autofilter"] = { ref: ws["!ref"] };
            }

            ws["!cols"] = [
                { wch: 18 },
                { wch: 24 },
                { wch: 26 },
                { wch: 16 },
                { wch: 18 },
                { wch: 14 },
                { wch: 16 },
                { wch: 26 },
                { wch: 20 },
                { wch: 12 },
                { wch: 18 },
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "En_Proceso");
            XLSX.writeFile(wb, `en_proceso_${nombreArchivoProfesional}_${fecha}.xlsx`);
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

            return this.encuestasPendientesBase.filter((encuesta) => {
                if (encuesta.idEnfermeroAtiende !== documento) return false;
                if (encuesta.status_gest_enfermera !== false) return false;

                if (esExtramural) {
                    return encuesta.status_gest_aux === true && this.estadoGestionMedica(encuesta);
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
            });
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

            return this.encuestasEnProcesoBase.filter((encuesta) => {
                if (encuesta.idEnfermeroAtiende !== documento) return false;

                if (esExtramural) {
                    return encuesta.status_gest_aux === false || !this.estadoGestionMedica(encuesta);
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
            return this.encuestasEnProceso.filter((encuesta) => {
                const idAux = String(encuesta.idEncuestador || "").trim();
                const cumpleAuxiliar = !this.filtroAuxiliar || idAux === this.filtroAuxiliar;
                if (!cumpleAuxiliar) return false;

                return this.cumpleFiltroEstadoProfesional(encuesta);
            });
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

.estado-lista {
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
    min-width: 240px;
}

.estado-item {
    border-radius: 8px;
    padding: 6px 8px;
    border: 1px solid #dee2e6;
    background-color: #fff;
}

.estado-item-ok {
    background-color: #f0fff4;
}

.estado-item-pendiente {
    background-color: #f8f9fa;
}

.estado-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
}

.estado-rol {
    font-weight: 700;
    font-size: 0.78rem;
}

.estado-profesional {
    font-size: 0.76rem;
    line-height: 1.2;
}

.estado-fecha {
    font-size: 0.7rem;
    color: #6c757d;
}

.acciones-proceso {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 160px;
}

.tabla-proceso-wrap {
    border-radius: 12px;
    box-shadow: var(--bs-box-shadow-sm);
    background: var(--bs-body-bg);
}

.tabla-proceso thead th {
    font-size: 0.78rem;
    white-space: nowrap;
    vertical-align: middle;
}

.tabla-proceso tbody td {
    font-size: 0.8rem;
    vertical-align: top;
}

.cabecera-proceso tr:nth-child(2) th {
    background: var(--bs-body-bg);
    padding-top: 0.35rem;
    padding-bottom: 0.35rem;
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
    border-radius: 10px;
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
</style>

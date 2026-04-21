<template>

    <div class="mt-2 datos">
        <div v-if="cargandoInforme" class="overlay-spinner">
            <div class="progress-card shadow">
                <div class="h5 mb-3">Generando informe</div>
                <div class="progress mb-2" role="progressbar" aria-label="Progreso de generación"
                    :aria-valuenow="progresoInforme" aria-valuemin="0" aria-valuemax="100"
                    style="height: 22px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated"
                        :style="{ width: `${progresoInforme}%` }">
                        {{ progresoInforme }}%
                    </div>
                </div>
                <div class="text-muted small">{{ mensajeProgreso }}</div>
            </div>
        </div>
        <div class="container-fluid px-3 px-xl-4">


            <h1><i class="bi bi-clipboard2-data h1"></i>Informes Administrativos</h1>
            <div v-if="tieneDatosTabla" class="mb-3">
                <button type="button" class="btn btn-primary" @click="parametrizarNuevoInforme">
                    <i class="bi bi-sliders"></i> Parametrizar nuevo informe
                </button>
            </div>
            <div v-if="mostrarFormulario && !tieneDatosTabla" class="row">
                <h5>Seleccione:</h5>
                <div class="col-12 col-md-2">

                    <label class="form-label">Tipo de informe</label>
                    <select id="tipoinforme" name="tipoinforme" class="form-select" aria-label="Default select example"
                        v-model="tipoinforme" @change="clearFormInformes()">
                        <option selected value="">Seleccione</option>
                        <option value="1">Seguimiento</option>
                        <option value="2">Actividades</option>
                        <option value="3">Facturación</option>
                    </select>
                    <br>

                </div>

                <div class="col-6 col-md-2" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3'">
                    <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                    <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
                </div>
                <div class="col-6 col-md-2" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3'">
                    <label for="fechaFin" class="form-label">Fecha de Fin</label>
                    <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
                </div>
                <div class="col-12 col-md-3" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3'">
                    <label for="convenioInforme" class="form-label">Convenio</label>
                    <select id="convenioInforme" class="form-select" v-model="convenioInforme">
                        <option value="">Todos</option>
                        <option v-for="conv in conveniosDisponibles" :key="conv" :value="conv">{{ conv }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-3" v-if="tipoinforme == '3'">
                    <label for="facturadorInforme" class="form-label">Facturador</label>
                    <select id="facturadorInforme" class="form-select" v-model="facturadorInforme">
                        <option value="">Todos</option>
                        <option v-for="fact in facturadoresDisponiblesFiltrados" :key="fact.documento" :value="fact.documento">
                            {{ fact.nombre }}
                        </option>
                    </select>
                </div>
                <div class="col-12 col-md-2 mt-3" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3'">
                    <button type="button" class="btn btn-warning  mt-3" @click="generarInforme()">
                        <i class="bi bi-clipboard2-data h6"></i> Generar Informe
                    </button>
                </div>
            </div>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '1'">*Todas las encuestas cerradas por la
                enfermera entre las
                fechas seleccionadas</p>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '2'">*Todas las encuestas registradas entre las fechas seleccionadas, con sus actividades y datos del paciente</p>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '3'">*Cierres de facturación por paciente y actividades (CUPS) en el rango de fechas, filtrables por convenio y facturador</p>

        </div>
        <br>
        <div class="container-fluid px-2 px-xl-3 informe-panel">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <h5 class="mb-0">{{ tituloListado }}</h5>
                <span v-for="(parametro, idx) in parametrosConsultaEtiquetas" :key="`parametro-consulta-${idx}`"
                    class="badge bg-secondary">
                    {{ parametro }}
                </span>
            </div>

            <button v-if="tieneDatosTabla" class="btn btn-outline-success mb-2" @click="exportarExcelFiltrado">
                <i class="bi bi-file-earmark-excel"></i> Exportar Excel
            </button>
            <div v-if="tieneDatosTabla">
                <div class="top-scrollbar" ref="topScrollbar" @scroll="onTopScroll">
                    <div class="top-scrollbar-content" :style="{ width: `${anchoTabla}px` }"></div>
                </div>
                <div class="table-responsive tabla-wrapper mb-4" ref="tablaHtml" @scroll="onTableScroll">

                    <table class="table table-bordered table-striped table-sm align-middle mb-4">
                        <thead class="table-light">
                            <tr>
                                <th v-for="col in columnasTabla" :key="`head-${col.key}`" class="sticky-head sort-head"
                                    @click="ordenarPor(col.key)">
                                    {{ col.label }}
                                    <span v-if="sortKey === col.key">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
                                </th>
                            </tr>
                            <tr>
                                <th v-for="col in columnasTabla" :key="`filter-${col.key}`" class="sticky-filter">
                                    <select v-model="filtros[col.key]" class="form-select form-select-sm" @click.stop>
                                        <option value="">Todos</option>
                                        <option v-for="opcion in opcionesFiltroPorColumna[col.key] || []"
                                            :key="`${col.key}-${opcion}`" :value="opcion">
                                            {{ opcion }}
                                        </option>
                                    </select>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(fila, idx) in filasFiltradasOrdenadas" :key="fila.rowKey || idx">
                                <td v-for="col in columnasTabla" :key="`${fila.rowKey || idx}-${col.key}`">{{
                                    fila[col.key] }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div v-else class="alert alert-secondary">
                No hay datos cargados para el informe.
            </div>
        </div>

    </div>
</template>

<style>
.datos {
    width: 100%;
    max-width: 100vw;
    margin-left: 0;
    padding: 0 6px;
    overflow-x: hidden;
}

.table-responsive {
    overflow: scroll;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    scrollbar-gutter: stable both-edges;
}

.tabla-wrapper {
    height: calc(100vh - 230px);
    max-height: calc(100vh - 230px);
    overflow: scroll;
    width: 100%;
    max-width: 100%;
    scrollbar-gutter: stable both-edges;
    padding-bottom: 28px;
    box-sizing: border-box;
}

.top-scrollbar {
    width: 100%;
    max-width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    height: 18px;
    margin-bottom: 4px;
    scrollbar-gutter: stable both-edges;
    border: 1px solid #dee2e6;
    border-bottom: 0;
    background: #fff;
}

.top-scrollbar-content {
    height: 1px;
}

.tabla-wrapper table {
    width: max-content;
    min-width: 100%;
}

.tabla-wrapper th,
.tabla-wrapper td {
    white-space: nowrap;
}

.sort-head {
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
}

.sticky-head {
    position: sticky;
    top: 0;
    z-index: 3;
    background: #f8f9fa;
}

.sticky-filter {
    position: sticky;
    top: 38px;
    z-index: 2;
    background: #f8f9fa;
    min-width: 120px;
}

.overlay-spinner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.7);
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

.informe-panel {
    width: 100%;
    max-width: 100%;
}
</style>

<script>
import realtime_api from "@/api/realtimeApi.js";
import { getAllUsers } from "@/api/usersApi";
import {
    mapState,
    mapActions
} from "vuex";

const COLUMNAS_INFORME = [
    { key: "convenio", label: "Convenio" },
    { key: "grupo", label: "Grupo" },
    { key: "paciente", label: "Paciente" },
    { key: "sexo", label: "Sexo" },
    { key: "documento", label: "Documento" },
    { key: "fechaNac", label: "Fecha Nac." },
    { key: "eps", label: "EPS" },
    { key: "regimen", label: "Régimen" },
    { key: "direccion", label: "Dirección" },
    { key: "barrio", label: "Barrio" },
    { key: "comuna", label: "Comuna" },
    { key: "labVisit", label: "lab/visit" },
    { key: "gestAux", label: "Gest. Aux" },
    { key: "gestEnfermera", label: "Gest. Enfermera" },
    { key: "gestMedica", label: "Gest. Médica" },
    { key: "fechaFacturacion", label: "Fecha Facturación" },
    { key: "remision", label: "Remisión" },
    { key: "actividad", label: "Actividad" },
    { key: "procedimiento", label: "Procedimiento" },
    { key: "cupsNombre", label: "CUPS Nombre" },
    { key: "codigo", label: "Código" },
    { key: "descripcionCUP", label: "Descripción CUP" },
    { key: "cantidad", label: "Cantidad" },
    { key: "detalle", label: "Detalle" },
    { key: "grupoCUP", label: "Grupo CUP" },
    { key: "factura", label: "Factura" },
    { key: "facturador", label: "Facturador" },
    { key: "homolog", label: "Homolog" },
    { key: "profesional", label: "Profesional" },
    { key: "rol", label: "Rol" },
    { key: "fechaFactCUP", label: "Fecha Fact. CUP" },
    { key: "facturado", label: "Facturado" },
];

const COLUMNAS_ACTIVIDADES = [
    { key: "convenio", label: "Convenio" },
    { key: "grupo", label: "Grupo" },
    { key: "fecha", label: "Fecha" },
    { key: "paciente", label: "Paciente" },
    { key: "sexo", label: "Sexo" },
    { key: "documento", label: "Documento" },
    { key: "eps", label: "EPS" },
    { key: "regimen", label: "Régimen" },
    { key: "direccion", label: "Dirección" },
    { key: "barrio", label: "Barrio" },
    { key: "comuna", label: "Comuna" },
    { key: "riesgo", label: "Población Riesgo" },
    { key: "remision", label: "Remisión" },
    { key: "actividad", label: "Actividad" },
    { key: "facturador", label: "Facturador" },
    { key: "profesional", label: "Profesional" },
    { key: "rol", label: "Rol" },
    { key: "cupsNombre", label: "CUPS Nombre" },
    { key: "codigo", label: "Código" },
    { key: "descripcionCUP", label: "Descripción CUP" },
    { key: "cantidad", label: "Cantidad" },
    { key: "detalle", label: "Detalle" },
];

const COLUMNAS_FACTURACION = [
    { key: "convenio", label: "Convenio" },
    { key: "fechaCierrePaciente", label: "Fecha Cierre Factura" },
    { key: "paciente", label: "Paciente" },
    { key: "documento", label: "Documento" },
    { key: "eps", label: "EPS" },
    { key: "actividad", label: "Actividad" },
    { key: "cupsNombre", label: "CUPS Nombre" },
    { key: "codigo", label: "Código" },
    { key: "cantidad", label: "Cantidad" },
    { key: "factura", label: "Factura" },
    { key: "facturadorActividad", label: "Facturador Actividad" },
    { key: "fechaCierreActividad", label: "Fecha Asignación Factura CUPS" },
    { key: "facturado", label: "Facturado" },
];

const crearFiltrosIniciales = (columnas) => columnas.reduce((acc, col) => {
    acc[col.key] = "";
    return acc;
}, {});

export default {
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            tipoinforme: "",
            convenioInforme: "",
            facturadorInforme: "",
            conveniosDisponibles: ["Extramural", "E Basicos", "PIC"],
            facturadoresDisponibles: [],
            facturadoresMap: {},
            facturadoresConveniosMap: {},
            progresoInforme: 0,
            mensajeProgreso: "Preparando consulta...",
            detallesVisibles: [], // Para controlar la visibilidad de detalles por fila
            mostrarFormulario: true,
            cargandoInforme: false,
            encuestasInforme: [],
            actividadesExtraMap: {},
            cupsMap: {},
            columnasTabla: COLUMNAS_INFORME,
            filtros: { ...crearFiltrosIniciales(COLUMNAS_INFORME) },
            sortKey: "",
            sortDirection: "asc",
            anchoTabla: 0,
            sincronizandoScroll: false,
            consultaActual: {
                tipo: "",
                finicial: "",
                ffinal: "",
                profesional: "",
                convenio: "",
                facturador: "",
            },
        };
    },
    methods: {
        normalizarIdFacturador(valor) {
            return String(valor || "")
                .trim()
                .toLowerCase()
                .replace(/^([0-9]+)\.0+$/, "$1")
                .replace(/[^a-z0-9]/g, "");
        },

        normalizarTextoComparable(valor) {
            return String(valor || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");
        },

        extraerConveniosUsuario(valor) {
            if (Array.isArray(valor)) {
                return valor
                    .map((item) => String(item || "").trim())
                    .filter(Boolean);
            }

            if (valor && typeof valor === "object") {
                return Object.values(valor)
                    .map((item) => String(item || "").trim())
                    .filter(Boolean);
            }

            const texto = String(valor || "").trim();
            if (!texto) return [];

            // Soporta convenio almacenado como JSON string: ["PIC","E Basicos"]
            if ((texto.startsWith("[") && texto.endsWith("]")) || (texto.startsWith("{") && texto.endsWith("}"))) {
                try {
                    const parsed = JSON.parse(texto);
                    if (Array.isArray(parsed)) {
                        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
                    }
                    if (parsed && typeof parsed === "object") {
                        return Object.values(parsed).map((item) => String(item || "").trim()).filter(Boolean);
                    }
                } catch (_) {
                    // Si falla JSON.parse, continúa con split tradicional
                }
            }

            return texto
                .split(/[;,|]/)
                .map((item) => item.replace(/[\[\]"]+/g, "").trim())
                .filter(Boolean);
        },

        async cargarConveniosDisponibles() {
            try {
                const normalizar = (valor) => String(valor || "").trim();
                const convenios = new Set(["Extramural", "E Basicos", "PIC"]);

                const [respEncuestas, respAsignaciones, respUsuarios] = await Promise.all([
                    realtime_api.get("/Encuesta.json"),
                    realtime_api.get("/Asignaciones.json"),
                    realtime_api.get("/Usuarios.json"),
                ]);

                const encuestasObj = respEncuestas?.data || {};
                Object.values(encuestasObj).forEach((encuesta) => {
                    const convenio = normalizar(encuesta?.convenio);
                    if (convenio) convenios.add(convenio);
                });

                const asignacionesObj = respAsignaciones?.data || {};
                Object.values(asignacionesObj).forEach((asignacion) => {
                    const convenioAsignacion = normalizar(asignacion?.convenio);
                    if (convenioAsignacion) convenios.add(convenioAsignacion);

                    const cupsObj = asignacion?.cups;
                    if (cupsObj && typeof cupsObj === "object") {
                        Object.values(cupsObj).forEach((cup) => {
                            const convenioCup = normalizar(cup?.convenio);
                            if (convenioCup) convenios.add(convenioCup);
                        });
                    }
                });

                const usuariosObj = respUsuarios?.data || {};
                Object.values(usuariosObj).forEach((usuario) => {
                    this.extraerConveniosUsuario(usuario?.convenio || usuario?.convenios).forEach((conv) => {
                        const convenio = normalizar(conv);
                        if (convenio) convenios.add(convenio);
                    });
                });

                this.conveniosDisponibles = Array.from(convenios).sort((a, b) =>
                    a.localeCompare(b, "es", { sensitivity: "base" })
                );
            } catch (error) {
                console.error("Error cargando convenios disponibles:", error);
                this.conveniosDisponibles = ["Extramural", "E Basicos", "PIC"];
            }
        },

        async cargarFacturadoresDisponibles() {
            try {
                const usuarios = await getAllUsers();
                const esFacturador = (cargo) => {
                    const valor = String(cargo || "").trim().toLowerCase();
                    return valor === "fact" || valor === "facturador";
                };
                const construirNombreUsuario = (u = {}) => {
                    const nombreDirecto = String(u?.nombre || u?.nombres || u?.nombre_completo || u?.name || "").trim();
                    if (nombreDirecto) return nombreDirecto;

                    const nombreCompleto = [u?.nombre1, u?.nombre2, u?.apellido1, u?.apellido2]
                        .map((parte) => String(parte || "").trim())
                        .filter(Boolean)
                        .join(" ")
                        .trim();

                    return nombreCompleto || String(u?.email || u?.numDocumento || u?.num_documento || u?.documento || "").trim();
                };
                const separarConvenios = (valor) =>
                    this.extraerConveniosUsuario(valor);

                const mapa = new Map();

                usuarios.forEach((u) => {
                    const cargo = String(u?.cargo || "").trim();
                    const grupo = String(u?.grupo || "").trim().toUpperCase();
                    if (!esFacturador(cargo) && grupo !== "F") return;

                    const documento = String(u?.numDocumento || u?.num_documento || u?.documento || "").trim();
                    if (!documento) return;

                    const documentoNorm = this.normalizarIdFacturador(documento);
                    const nombre = String(construirNombreUsuario(u) || "").trim() || "Sin nombre en BD";
                    const convenios = separarConvenios(u?.convenio || u?.convenios);

                    if (!mapa.has(documentoNorm)) {
                        mapa.set(documentoNorm, {
                            documento,
                            nombre,
                            convenios: new Set(convenios),
                        });
                        return;
                    }

                    const actual = mapa.get(documentoNorm);
                    if ((!actual.nombre || actual.nombre === "Sin nombre en BD") && nombre) {
                        actual.nombre = nombre;
                    }
                    convenios.forEach((conv) => actual.convenios.add(conv));
                });

                const lista = Array.from(mapa.values())
                    .map((item) => ({
                        documento: item.documento,
                        nombre: item.nombre || "Sin nombre en BD",
                    }))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

                this.facturadoresDisponibles = lista;
                this.facturadoresMap = lista.reduce((acc, item) => {
                    acc[item.documento] = item.nombre;
                    acc[this.normalizarIdFacturador(item.documento)] = item.nombre;
                    return acc;
                }, {});
                this.facturadoresConveniosMap = Array.from(mapa.entries()).reduce((acc, [doc, item]) => {
                    acc[doc] = Array.from(item.convenios || []);
                    return acc;
                }, {});
            } catch (error) {
                console.error("Error cargando facturadores:", error);
                this.facturadoresDisponibles = [];
                this.facturadoresMap = {};
                this.facturadoresConveniosMap = {};
            }
        },

        normalizarFechaSoloDia(valorFecha) {
            if (!valorFecha) return "";
            const texto = String(valorFecha).trim();
            const matchIso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
            if (matchIso) return matchIso[1];

            const matchLatam = texto.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/);
            if (matchLatam) return `${matchLatam[3]}-${matchLatam[2]}-${matchLatam[1]}`;

            const fecha = new Date(texto);
            if (!Number.isNaN(fecha.getTime())) {
                return fecha.toISOString().slice(0, 10);
            }

            return "";
        },

        fechaDentroDeRango(valorFecha, inicio, fin) {
            const fecha = this.normalizarFechaSoloDia(valorFecha);
            const ini = this.normalizarFechaSoloDia(inicio);
            const end = this.normalizarFechaSoloDia(fin);
            if (!fecha || !ini || !end) return false;
            return fecha >= ini && fecha <= end;
        },

        obtenerNombreFacturador(documento) {
            const doc = String(documento || "").trim();
            if (!doc) return "";
            const docNorm = this.normalizarIdFacturador(doc);
            return this.facturadoresMap[doc] || this.facturadoresMap[docNorm] || "Sin nombre";
        },

        actualizarProgreso(valor, mensaje) {
            this.progresoInforme = Math.max(0, Math.min(100, Math.round(valor)));
            if (mensaje) {
                this.mensajeProgreso = mensaje;
            }
        },

        esperarRender() {
            return new Promise((resolve) => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => resolve());
                });
            });
        },

        onTopScroll() {
            if (this.sincronizandoScroll) return;
            const top = this.$refs.topScrollbar;
            const tabla = this.$refs.tablaHtml;
            if (!top || !tabla) return;

            this.sincronizandoScroll = true;
            tabla.scrollLeft = top.scrollLeft;
            requestAnimationFrame(() => {
                this.sincronizandoScroll = false;
            });
        },

        onTableScroll() {
            if (this.sincronizandoScroll) return;
            const top = this.$refs.topScrollbar;
            const tabla = this.$refs.tablaHtml;
            if (!top || !tabla) return;

            this.sincronizandoScroll = true;
            top.scrollLeft = tabla.scrollLeft;
            requestAnimationFrame(() => {
                this.sincronizandoScroll = false;
            });
        },

        actualizarAnchoTabla() {
            this.$nextTick(() => {
                const tabla = this.$refs.tablaHtml;
                if (!tabla) {
                    this.anchoTabla = 0;
                    return;
                }

                const tableEl = tabla.querySelector('table');
                this.anchoTabla = tableEl ? tableEl.scrollWidth : 0;

                const top = this.$refs.topScrollbar;
                if (top) {
                    top.scrollLeft = tabla.scrollLeft || 0;
                }
            });
        },

        escaparHtml(valor) {
            return String(valor ?? "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },

        obtenerColumnasPorTipo(tipo) {
            if (tipo === "2") return COLUMNAS_ACTIVIDADES;
            if (tipo === "3") return COLUMNAS_FACTURACION;
            return COLUMNAS_INFORME;
        },

        normalizarConvenio(valor) {
            return String(valor || "").trim().toLowerCase();
        },

        normalizarIdRelacion(valor) {
            return String(valor ?? "").trim();
        },

        filtrarEncuestasPorConvenio(encuestas = []) {
            const convenioSeleccionado = this.normalizarConvenio(this.convenioInforme);
            if (!convenioSeleccionado) return encuestas;

            return encuestas.filter((encuesta) => this.normalizarConvenio(encuesta?.convenio) === convenioSeleccionado);
        },

        construirFilasExportacion() {
            const filas = [];
            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];

            for (const paciente of encuestas) {
                const facturadorPacienteDoc = String(paciente?.asigfact || paciente?.asig_fact || "").trim();
                const base = {
                    grupo: paciente.grupo || "",
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    sexo: paciente.sexo || "",
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    fechaNac: this.formatearFechaYYYYMMDD(paciente.fechaNac),
                    eps: paciente.eps || "",
                    regimen: paciente.regimen || "",
                    direccion: paciente.direccion || "",
                    barrio: paciente.barrioVeredacomuna?.barrio || "",
                    comuna: paciente.barrioVeredacomuna?.comuna || "",
                    labVisit: `${paciente.Agenda_tomademuestras?.cita_tomamuestras ? 'Sí' : 'No'}/${paciente.Agenda_Visitamedica?.cita_visitamedica ? 'Sí' : 'No'}`,
                    gestAux: paciente.status_gest_aux ? this.formatearFechaYYYYMMDD(paciente.fechagestAuxiliar) : "No",
                    gestEnfermera: paciente.status_gest_enfermera ? this.formatearFechaYYYYMMDD(paciente.fechagestEnfermera) : "No",
                    gestMedica: paciente.status_gest_medica ? this.formatearFechaYYYYMMDD(paciente.fechagestMedica) : "No",
                    fechaFacturacion: this.formatearFechaYYYYMMDD(paciente.FechaFacturacion) || "No",
                    remision: paciente.requiereRemision || "",
                    convenio: paciente.convenio || "",
                };

                const actividades = Array.isArray(paciente.seguimientoActividades) ? paciente.seguimientoActividades : [];

                if (!actividades.length) {
                    filas.push({
                        ...base,
                        rowKey: `${paciente.id}-sin-actividad`,
                        actividad: "Sin actividades",
                        procedimiento: "",
                        cupsNombre: "",
                        codigo: "",
                        descripcionCUP: "",
                        cantidad: "",
                        detalle: "",
                        grupoCUP: "",
                        factura: "",
                        facturador: this.obtenerNombreFacturador(facturadorPacienteDoc),
                        homolog: "",
                        profesional: "",
                        rol: "",
                        convenio: base.convenio,
                        fechaFactCUP: "",
                        facturado: "",
                    });
                    continue;
                }

                for (const actividad of actividades) {
                    const asignaciones = Array.isArray(actividad.asignaciones) ? actividad.asignaciones : [];
                    if (!asignaciones.length) {
                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-sin-asignacion`,
                            actividad: actividad.nombre || "Actividad",
                            procedimiento: "Sin asignaciones",
                            cupsNombre: "",
                            codigo: "",
                            descripcionCUP: "",
                            cantidad: "",
                            detalle: "",
                            grupoCUP: "",
                            factura: "",
                            facturador: this.obtenerNombreFacturador(facturadorPacienteDoc),
                            homolog: "",
                            profesional: "",
                            rol: "",
                            convenio: base.convenio,
                            fechaFactCUP: "",
                            facturado: "",
                        });
                        continue;
                    }

                    for (let i = 0; i < asignaciones.length; i++) {
                        const asig = asignaciones[i];
                        const idActividad = String(asig?.actividadId ?? asig?.idActividad ?? actividad?.key ?? "");
                        const cupId = asig?.cupsId || asig?.id || "";
                        const facturadorDoc = String(
                            asig?.FactProf || asig?.factProf || asig?.fact_prof || facturadorPacienteDoc
                        ).trim();
                        const nombreCup = this.obtenerNombreCupDesdeId(cupId, asig?.cupsNombre || asig?.DescripcionCUP || asig?.codigo || "");
                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-${i}`,
                            actividad: actividad.nombre || "Actividad",
                            procedimiento: nombreCup,
                            cupsNombre: nombreCup,
                            codigo: asig?.codigo || "",
                            descripcionCUP: asig?.DescripcionCUP || "",
                            cantidad: asig?.cantidad ?? "",
                            detalle: asig?.detalle || "",
                            grupoCUP: asig?.Grupo || "",
                            factura: asig?.FactNum || "",
                            facturador: this.obtenerNombreFacturador(facturadorDoc),
                            homolog: asig?.Homolog || "",
                            profesional: asig?.nombreProf || "",
                            rol: asig?.key || "",
                            convenio: base.convenio,
                            fechaFactCUP: this.formatearFechaYYYYMMDD(asig?.fechaFacturacion) || "",
                            facturado: asig?.facturado === true ? "Sí" : (asig?.facturado === false ? "No" : ""),
                        });
                    }
                }
            }

            return filas;
        },

        construirFilasActividades() {
            const filas = [];
            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];

            for (const paciente of encuestas) {
                const facturadorPacienteDoc = String(paciente?.asigfact || paciente?.asig_fact || "").trim();
                const base = {
                    convenio: paciente.convenio || "",
                    grupo: paciente.grupo || "",
                    fecha: this.formatearFechaYYYYMMDD(paciente.fecha),
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    sexo: paciente.sexo || "",
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    eps: paciente.eps || "",
                    regimen: paciente.regimen || "",
                    direccion: paciente.direccion || "",
                    barrio: paciente.barrioVeredacomuna?.barrio || "",
                    comuna: paciente.barrioVeredacomuna?.comuna || "",
                    riesgo: paciente.poblacionRiesgo || "",
                    remision: paciente.requiereRemision || "",
                };

                const actividades = Array.isArray(paciente.seguimientoActividades) ? paciente.seguimientoActividades : [];

                if (!actividades.length) {
                    filas.push({
                        ...base,
                        rowKey: `${paciente.id}-sin-actividad`,
                        actividad: "Sin actividades",
                        facturador: this.obtenerNombreFacturador(facturadorPacienteDoc),
                        profesional: "",
                        rol: "",
                        cupsNombre: "",
                        codigo: "",
                        descripcionCUP: "",
                        cantidad: "",
                        detalle: "",
                    });
                    continue;
                }

                for (const actividad of actividades) {
                    const asignaciones = Array.isArray(actividad.asignaciones) ? actividad.asignaciones : [];

                    if (!asignaciones.length) {
                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-sin-asignacion`,
                            actividad: actividad.nombre || "Actividad",
                            facturador: this.obtenerNombreFacturador(facturadorPacienteDoc),
                            profesional: "",
                            rol: "",
                            cupsNombre: "",
                            codigo: "",
                            descripcionCUP: "",
                            cantidad: "",
                            detalle: "",
                        });
                        continue;
                    }

                    for (let i = 0; i < asignaciones.length; i++) {
                        const asig = asignaciones[i];
                        const cupId = asig?.cupsId || asig?.id || "";
                        const facturadorDoc = String(
                            asig?.FactProf || asig?.factProf || asig?.fact_prof || facturadorPacienteDoc
                        ).trim();
                        const nombreCup = this.obtenerNombreCupDesdeId(cupId, asig?.cupsNombre || asig?.DescripcionCUP || asig?.codigo || "");

                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-${i}`,
                            actividad: actividad.nombre || "Actividad",
                            facturador: this.obtenerNombreFacturador(facturadorDoc),
                            profesional: asig?.nombreProf || "",
                            rol: asig?.key || "",
                            cupsNombre: nombreCup,
                            codigo: asig?.codigo || "",
                            descripcionCUP: asig?.DescripcionCUP || "",
                            cantidad: asig?.cantidad ?? "",
                            detalle: asig?.detalle || "",
                        });
                    }
                }
            }

            return filas;
        },

        construirFilasFacturacion() {
            const filas = [];
            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];

            for (const paciente of encuestas) {
                const facturadorPacienteDoc = String(
                    paciente?.asigfact ||
                    paciente?.asig_fact ||
                    ""
                ).trim();
                const base = {
                    convenio: paciente.convenio || "",
                    facturadorPaciente: this.obtenerNombreFacturador(facturadorPacienteDoc),
                    fechaCierrePaciente: this.formatearFechaYYYYMMDD(
                        paciente.FechaFacturacion ||
                        paciente.fechaFacturacion ||
                        paciente.fecha_facturacion
                    ),
                    paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`.trim(),
                    documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                    eps: paciente.eps || "",
                };

                const cups = Array.isArray(paciente.cupsFacturacion) ? paciente.cupsFacturacion : [];

                if (!cups.length) {
                    filas.push({
                        ...base,
                        rowKey: `${paciente.id}-sin-cups` ,
                        actividad: "Sin actividades",
                        cupsNombre: "",
                        codigo: "",
                        cantidad: "",
                        factura: "",
                        facturadorActividad: "",
                        fechaCierreActividad: "",
                        facturado: "No",
                    });
                    continue;
                }

                for (let i = 0; i < cups.length; i++) {
                    const cup = cups[i];
                    const facturadorActividadDoc = String(
                        cup?.FactProf ||
                        cup?.factProf ||
                        cup?.fact_prof ||
                        ""
                    ).trim();
                    const cupId = String(cup?.id || cup?.cupsId || i);

                    filas.push({
                        ...base,
                        rowKey: `${paciente.id}-${cupId}-${i}`,
                        actividad: this.obtenerNombreActividadDesdeKey(cup?.actividadId || cup?.idActividad || "") || "Actividad",
                        cupsNombre: cup?.DescripcionCUP || cup?.cupsNombre || cup?.codigo || "",
                        codigo: cup?.codigo || "",
                        cantidad: cup?.cantidad ?? "",
                        factura: cup?.FactNum || cup?.factNum || cup?.fact_num || "",
                        facturadorActividad: this.obtenerNombreFacturador(facturadorActividadDoc),
                        fechaCierreActividad: this.formatearFechaYYYYMMDD(
                            cup?.fechaAsignacionFactura ||
                            cup?.fechaFacturacion ||
                            cup?.fecha_facturacion ||
                            cup?.FechaFacturacion
                        ),
                        facturado: cup?.facturado === true ? "Sí" : "No",
                    });
                }
            }

            return filas;
        },

        async actualizarDatosFacturacionInforme() {
            const paramsEncuesta = {
                status_facturacion: 1,
            };

            if (String(this.convenioInforme || "").trim()) {
                paramsEncuesta.convenio = String(this.convenioInforme || "").trim();
            }

            const [respEncuestas, respAsignaciones, respActividadesExtra] = await Promise.all([
                realtime_api.get("/Encuesta.json", { params: paramsEncuesta }),
                realtime_api.get("/Asignaciones.json"),
                realtime_api.get("/actividadesExtra.json"),
            ]);

            const encuestasObj = respEncuestas?.data || {};
            const asignacionesObj = respAsignaciones?.data || {};
            const actividadesExtraGlobal = respActividadesExtra?.data || {};

            this.actividadesExtraMap = Object.entries(actividadesExtraGlobal).reduce((acc, [id, item]) => {
                if (item && item.key !== undefined && item.key !== null) {
                    const nombreActividad = item.nombre || item.descripcion || String(item.key);
                    acc[String(item.key)] = nombreActividad;
                    acc[String(id)] = nombreActividad;
                }
                return acc;
            }, {});

            const convenioSeleccionado = this.normalizarConvenio(this.convenioInforme);
            const facturadorSeleccionado = this.normalizarIdFacturador(this.facturadorInforme);

            const encuestasLista = Object.entries(encuestasObj).map(([id, data]) => ({
                id,
                ...(data || {}),
            }));

            this.encuestasInforme = encuestasLista
                .filter((encuesta) => encuesta?.status_facturacion === true)
                .filter((encuesta) => {
                    if (!convenioSeleccionado) return true;
                    return this.normalizarConvenio(encuesta?.convenio) === convenioSeleccionado;
                })
                .map((encuesta) => {
                    const cupsObj = asignacionesObj?.[encuesta.id]?.cups;
                    const cupsLista = cupsObj && typeof cupsObj === "object"
                        ? Object.entries(cupsObj).map(([cupId, cup]) => ({ id: cupId, ...(cup || {}) }))
                        : [];

                    const cupsFacturados = cupsLista.filter((cup) => cup?.facturado === true);

                    return {
                        ...encuesta,
                        cupsFacturacion: cupsFacturados,
                    };
                })
                .filter((encuesta) => {
                    const fechaPacienteEnRango = this.fechaDentroDeRango(
                        encuesta?.FechaFacturacion || encuesta?.fechaFacturacion || encuesta?.fecha_facturacion,
                        this.fechaInicio,
                        this.fechaFin
                    );
                    const actividadEnRango = (encuesta.cupsFacturacion || []).some((cup) =>
                        this.fechaDentroDeRango(
                            cup?.fechaAsignacionFactura || cup?.fechaFacturacion || cup?.fecha_facturacion || cup?.FechaFacturacion,
                            this.fechaInicio,
                            this.fechaFin
                        )
                    );

                    return fechaPacienteEnRango || actividadEnRango;
                })
                .filter((encuesta) => {
                    if (!facturadorSeleccionado) return true;

                    const factPaciente = this.normalizarIdFacturador(encuesta?.asigfact || encuesta?.asig_fact || "");
                    if (factPaciente === facturadorSeleccionado) return true;

                    return (encuesta.cupsFacturacion || []).some((cup) =>
                        this.normalizarIdFacturador(cup?.FactProf || cup?.factProf || cup?.fact_prof || "") === facturadorSeleccionado
                    );
                });
        },

        obtenerNombreActividadDesdeKey(keyActividad) {
            const key = String(keyActividad || "");
            if (!key) return "";
            return this.actividadesExtraMap[key] || key;
        },

        obtenerNombreCupDesdeId(cupId, fallback = "") {
            const key = String(cupId || "");
            if (!key) return fallback;
            return this.cupsMap[key] || fallback || key;
        },

        construirHtmlExportacion(filas = this.filasFiltradasOrdenadas) {
            const headers = this.columnasTabla.map((col) => col.label);
            const thead = `<thead><tr>${headers.map((h) => `<th>${this.escaparHtml(h)}</th>`).join("")}</tr></thead>`;
            const tbody = `<tbody>${filas.map((f) => `
                <tr>
                    ${this.columnasTabla.map((col) => `<td>${this.escaparHtml(f[col.key])}</td>`).join("")}
                </tr>`).join("")}</tbody>`;

            return `<table border="1">${thead}${tbody}</table>`;
        },

        construirTextoExportacion(filas = this.filasFiltradasOrdenadas) {
            const headers = this.columnasTabla.map((col) => col.label);
            const lineas = [headers.join("\t")];

            for (const f of filas) {
                lineas.push(this.columnasTabla
                    .map((col) => String(f[col.key] ?? "").replace(/\t/g, " ").replace(/\n/g, " "))
                    .join("\t"));
            }

            return lineas.join("\n");
        },

        ordenarPor(key) {
            if (this.sortKey === key) {
                this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
                return;
            }
            this.sortKey = key;
            this.sortDirection = "asc";
        },

        exportarExcelFiltrado() {
            const filas = this.filasFiltradasOrdenadas;
            const html = this.construirHtmlExportacion(filas);
            const blob = new Blob([`<html><head><meta charset="UTF-8"></head><body>${html}</body></html>`], {
                type: "application/vnd.ms-excel;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const fecha = new Date().toISOString().slice(0, 10);
            link.href = url;
            link.download = `informe_filtrado_${fecha}.xls`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },

        copiarHtmlTabla() {
            const html = this.construirHtmlExportacion();
            const texto = this.construirTextoExportacion();

            if (navigator.clipboard && window.ClipboardItem) {
                const item = new window.ClipboardItem({
                    'text/html': new Blob([html], { type: 'text/html' }),
                    'text/plain': new Blob([texto], { type: 'text/plain' }),
                });

                navigator.clipboard.write([item]).then(() => {
                    this.$toast && this.$toast.success
                        ? this.$toast.success('Tabla copiada en formato Excel (columnas separadas)')
                        : alert('Tabla copiada en formato Excel (columnas separadas)');
                }).catch(() => {
                    navigator.clipboard.writeText(texto).then(() => {
                        this.$toast && this.$toast.success
                            ? this.$toast.success('Tabla copiada como texto tabulado')
                            : alert('Tabla copiada como texto tabulado');
                    }).catch(() => {
                        this.$toast && this.$toast.error
                            ? this.$toast.error('No se pudo copiar la tabla')
                            : alert('No se pudo copiar la tabla');
                    });
                });
                return;
            }

            navigator.clipboard.writeText(texto).then(() => {
                this.$toast && this.$toast.success
                    ? this.$toast.success('Tabla copiada como texto tabulado')
                    : alert('Tabla copiada como texto tabulado');
            }).catch(() => {
                this.$toast && this.$toast.error
                    ? this.$toast.error('No se pudo copiar la tabla')
                    : alert('No se pudo copiar la tabla');
            });
        },

        formatearFechaYYYYMMDD(valorFecha) {
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

        /*  */

        getActividadesPlanas(paciente) {
            // Devuelve un array plano de objetos para la tabla de actividades
            if (!paciente.tipoActividad || !Array.isArray(paciente.tipoActividad) || paciente.tipoActividad.length === 0) return [];
            const rows = [];
            for (const actividad of paciente.tipoActividad) {
                if (actividad.Profesional && Array.isArray(actividad.Profesional) && actividad.Profesional.length) {
                    for (const profesional of actividad.Profesional) {
                        if (
                            actividad.cups &&
                            actividad.cups[profesional] &&
                            Array.isArray(actividad.cups[profesional].cups) &&
                            actividad.cups[profesional].cups.length
                        ) {
                            for (const cup of actividad.cups[profesional].cups) {
                                rows.push({
                                    actividad: actividad.nombre,
                                    profesional,
                                    cup: cup.DescripcionCUP,
                                    cantidad: cup.cantidad,
                                    detalle: cup.detalle
                                });
                            }
                        } else {
                            rows.push({
                                actividad: actividad.nombre,
                                profesional,
                                cup: 'Sin CUPS registrados',
                                cantidad: '',
                                detalle: ''
                            });
                        }
                    }
                } else {
                    rows.push({
                        actividad: actividad.nombre,
                        profesional: 'Sin profesionales registrados',
                        cup: '',
                        cantidad: '',
                        detalle: ''
                    });
                }
            }
            return rows;
        },

        normalizarActividadesEncuesta(actividadesEncuesta) {
            const tipoActividad = actividadesEncuesta?.tipoActividad || actividadesEncuesta;
            if (!tipoActividad || typeof tipoActividad !== "object") return [];

            return Object.entries(tipoActividad)
                .filter(([, actividad]) => actividad && typeof actividad === "object")
                .map(([actividadId, actividad]) => {
                    const sourceId = this.normalizarIdRelacion(actividadId);
                    const actividadKey = this.normalizarIdRelacion(
                        actividad.key ?? actividad.clave ?? actividad.actividadKey ?? actividad.actividadId
                    );
                    const referenciaActividad = actividadKey || sourceId;

                    return ({
                    ...actividad,
                    id: sourceId,
                    sourceId,
                    key: actividadKey,
                    nombre: this.obtenerNombreActividadDesdeKey(referenciaActividad) || actividad.nombre || actividad.descripcion || referenciaActividad || "Actividad",
                });
                });
        },

        normalizarCupsAsignaciones(asignacionEncuesta) {
            if (!asignacionEncuesta || !asignacionEncuesta.cups) return [];

            if (Array.isArray(asignacionEncuesta.cups)) {
                return asignacionEncuesta.cups.filter(Boolean);
            }

            if (typeof asignacionEncuesta.cups === "object") {
                const cupsValores = Object.values(asignacionEncuesta.cups).filter(Boolean);

                const esEstructuraAnidada = cupsValores.some(
                    (valor) =>
                        valor &&
                        typeof valor === "object" &&
                        !("actividadId" in valor) &&
                        !("idActividad" in valor) &&
                        !("DescripcionCUP" in valor) &&
                        !("codigo" in valor)
                );

                if (esEstructuraAnidada) {
                    return cupsValores.flatMap((cupsPorActividad) =>
                        Object.values(cupsPorActividad || {}).filter(Boolean)
                    );
                }

                return cupsValores;
            }

            return [];
        },

        formatearAsignacion(assignment) {
            const descripcion = assignment?.DescripcionCUP || assignment?.cupsNombre || assignment?.codigo || "Asignación";
            const cantidad = assignment?.cantidad !== undefined && assignment?.cantidad !== null ? ` x${assignment.cantidad}` : "";
            const factura = assignment?.FactNum ? ` (Fact: ${assignment.FactNum})` : "";
            return `${descripcion}${cantidad}${factura}`;
        },

        async actualizarDatosSeguimientoInforme() {
            const encuestasBase = Array.isArray(this.EncuestasAdmin) ? this.EncuestasAdmin : [];
            const encuestas = this.filtrarEncuestasPorConvenio(encuestasBase);

            if (!encuestas.length) {
                this.encuestasInforme = [];
                return;
            }

            try {
                const [respActividades, respAsignaciones, respActividadesExtra, respCups] = await Promise.all([
                    realtime_api.get("/Actividades.json"),
                    realtime_api.get("/Asignaciones.json"),
                    realtime_api.get("/actividadesExtra.json"),
                    realtime_api.get("/cups.json"),
                ]);

                const actividadesGlobal = respActividades.data || {};
                const asignacionesGlobal = respAsignaciones.data || {};
                const actividadesExtraGlobal = respActividadesExtra.data || {};
                const cupsGlobal = respCups.data || {};

                this.actividadesExtraMap = Object.entries(actividadesExtraGlobal).reduce((acc, [id, item]) => {
                    if (item && item.key !== undefined && item.key !== null) {
                        const nombreActividad = item.nombre || item.descripcion || String(item.key);
                        acc[String(item.key)] = nombreActividad;
                        acc[String(id)] = nombreActividad;
                    }
                    return acc;
                }, {});

                this.cupsMap = Object.entries(cupsGlobal).reduce((acc, [id, item]) => {
                    if (item && typeof item === "object") {
                        acc[String(id)] = item.DescripcionCUP || item.nombre || item.codigo || String(id);
                    }
                    return acc;
                }, {});

                this.encuestasInforme = encuestas.map((paciente) => {
                    const idEncuesta = String(paciente.id || paciente.idEncuesta || "");
                    const actividades = this.normalizarActividadesEncuesta(actividadesGlobal[idEncuesta]);
                    const cupsAsignados = this.normalizarCupsAsignaciones(asignacionesGlobal[idEncuesta]);

                    const seguimientoActividades = actividades.map((actividad) => {
                        const idsActividad = new Set(
                            [actividad.key, actividad.id, actividad.sourceId]
                                .map((valor) => this.normalizarIdRelacion(valor))
                                .filter(Boolean)
                        );

                        const asignaciones = cupsAsignados.filter((cup) => {
                            const cupActividadId = this.normalizarIdRelacion(cup?.actividadId ?? cup?.idActividad ?? "");
                            return cupActividadId && idsActividad.has(cupActividadId);
                        });

                        return {
                            ...actividad,
                            asignaciones,
                        };
                    });

                    return {
                        ...paciente,
                        seguimientoActividades,
                    };
                });
            } catch (error) {
                console.error("Error cargando actividades/asignaciones para informe:", error);
                this.encuestasInforme = encuestas.map((paciente) => ({
                    ...paciente,
                    seguimientoActividades: [],
                }));
            }
        },
        /*  */
        ...mapActions(["GetRegistersbyRangeCerrados", "GetRegistersbyRangeGeneral"]),

        async generarInforme() {
            this.cargandoInforme = true;
            this.actualizarProgreso(5, "Preparando parámetros del informe...");
            this.$store.commit('setEncuestasAdmin', []);
            let consultaUsada = null;
            try {
                this.columnasTabla = this.obtenerColumnasPorTipo(this.tipoinforme);
                this.filtros = { ...crearFiltrosIniciales(this.columnasTabla) };
                this.actualizarProgreso(15, "Consultando registros...");

                if (this.fechaInicio && this.fechaFin && this.tipoinforme == "1") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin
                    };
                    await this.GetRegistersbyRangeCerrados(parametros);
                    consultaUsada = {
                        tipo: "Seguimiento",
                        finicial: parametros.finicial,
                        ffinal: parametros.ffinal,
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        facturador: "",
                    };
                } else if (this.fechaInicio && this.fechaFin && this.tipoinforme == "2") {
                    let parametros = {
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin
                    };
                    await this.GetRegistersbyRangeGeneral(parametros);
                    consultaUsada = {
                        tipo: "Actividades",
                        finicial: parametros.finicial,
                        ffinal: parametros.ffinal,
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        facturador: "",
                    };
                } else if (this.fechaInicio && this.fechaFin && this.tipoinforme == "3") {
                    await this.actualizarDatosFacturacionInforme();
                    consultaUsada = {
                        tipo: "Facturación",
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin,
                        profesional: "",
                        convenio: this.convenioInforme || "Todos",
                        facturador: this.facturadorInforme
                            ? this.obtenerNombreFacturador(this.facturadorInforme)
                            : "Todos",
                    };
                } else {
                    this.$toast.error("Debe seleccionar tipo de informe y rango de fechas");
                    this.actualizarProgreso(0, "Preparando consulta...");
                    this.cargandoInforme = false;
                    return;
                }

                if (this.tipoinforme === "3") {
                    this.actualizarProgreso(55, "Procesando cierres de facturación...");
                } else {
                    this.actualizarProgreso(55, "Procesando actividades y asignaciones...");
                    await this.actualizarDatosSeguimientoInforme();
                }
                if (consultaUsada) {
                    this.consultaActual = consultaUsada;
                }
                this.mostrarFormulario = this.filasInformeTabla.length === 0;
                this.actualizarProgreso(80, "Renderizando tabla...");
                await this.$nextTick();
                this.actualizarAnchoTabla();
                await this.$nextTick();
                await this.esperarRender();
                this.actualizarProgreso(100, "Informe generado correctamente");
                await new Promise((resolve) => setTimeout(resolve, 250));
            } catch (error) {
                console.error("Error al generar el informe:", error);
            } finally {
                this.cargandoInforme = false;
            }
        },

        parametrizarNuevoInforme() {
            this.mostrarFormulario = true;
            this.tipoinforme = "";
            this.clearFormInformes();
        },

        clearFormInformes() {
            this.$store.commit('setEncuestasAdmin', [])
            this.mostrarFormulario = true;
            this.fechaInicio = "";
            this.fechaFin = "";
            this.convenioInforme = "";
            this.facturadorInforme = "";
            this.progresoInforme = 0;
            this.mensajeProgreso = "Preparando consulta...";
            this.encuestasInforme = [];
            this.columnasTabla = this.obtenerColumnasPorTipo(this.tipoinforme);
            this.filtros = { ...crearFiltrosIniciales(this.columnasTabla) };
            this.sortKey = "";
            this.sortDirection = "asc";
            this.anchoTabla = 0;
            this.consultaActual = {
                tipo: "",
                finicial: "",
                ffinal: "",
                profesional: "",
                convenio: "",
                facturador: "",
            };
        },

        toggleDetalles(idx) {
            this.$set(this.detallesVisibles, idx, !this.detallesVisibles[idx]);

        },
    },

    computed: {
        ...mapState(["userData", "EncuestasAdmin"]),
        facturadoresDisponiblesFiltrados() {
            const convenioSel = this.normalizarTextoComparable(this.convenioInforme);
            if (!convenioSel) return this.facturadoresDisponibles;

            return (this.facturadoresDisponibles || []).filter((fact) => {
                const convenios = this.facturadoresConveniosMap?.[this.normalizarIdFacturador(fact.documento)] || [];
                return convenios.some((conv) => this.normalizarTextoComparable(conv) === convenioSel);
            });
        },
        tituloListado() {
            if (this.tipoinforme === "2") return "Listado de actividades";
            if (this.tipoinforme === "3") return "Listado de facturación";
            return "Listado de Pacientes finalizados";
        },
        filasFiltradasOrdenadas() {
            let filas = [...this.filasInformeTabla];

            filas = filas.filter((fila) => this.columnasTabla.every((col) => {
                const filtro = String(this.filtros[col.key] || "").trim();
                if (!filtro) return true;
                const valor = String(fila[col.key] ?? "").trim();
                return valor === filtro;
            }));

            if (this.sortKey) {
                const direction = this.sortDirection === "asc" ? 1 : -1;
                const key = this.sortKey;
                filas.sort((a, b) => {
                    const va = String(a[key] ?? "").toLowerCase();
                    const vb = String(b[key] ?? "").toLowerCase();

                    const na = Number(va);
                    const nb = Number(vb);
                    const ambosNumericos = !Number.isNaN(na) && !Number.isNaN(nb) && va !== "" && vb !== "";

                    if (ambosNumericos) {
                        return (na - nb) * direction;
                    }

                    if (va < vb) return -1 * direction;
                    if (va > vb) return 1 * direction;
                    return 0;
                });
            }

            return filas;
        },
        opcionesFiltroPorColumna() {
            const opciones = {};
            for (const col of this.columnasTabla) {
                const unicos = new Set(
                    this.filasInformeTabla
                        .map((fila) => String(fila[col.key] ?? "").trim())
                        .filter((valor) => valor !== "")
                );
                opciones[col.key] = Array.from(unicos).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
            }
            return opciones;
        },
        filasInformeTabla() {
            if (this.tipoinforme === "2") return this.construirFilasActividades();
            if (this.tipoinforme === "3") return this.construirFilasFacturacion();
            return this.construirFilasExportacion();
        },
        tieneDatosTabla() {
            return this.filasInformeTabla.length > 0;
        },
        parametrosConsultaEtiquetas() {
            const etiquetas = [];
            if (this.consultaActual.tipo) etiquetas.push(`Tipo: ${this.consultaActual.tipo}`);
            if (this.consultaActual.finicial && this.consultaActual.ffinal) {
                etiquetas.push(`Rango: ${this.consultaActual.finicial} a ${this.consultaActual.ffinal}`);
            }
            if (this.consultaActual.convenio) etiquetas.push(`Convenio: ${this.consultaActual.convenio}`);
            if (this.consultaActual.profesional) etiquetas.push(`Profesional: ${this.consultaActual.profesional}`);
            if (this.consultaActual.facturador) etiquetas.push(`Facturador: ${this.consultaActual.facturador}`);
            return etiquetas;
        },

    },
    watch: {
        tipoinforme(nuevoTipo) {
            if (nuevoTipo === "3" && (!this.facturadoresDisponibles || this.facturadoresDisponibles.length === 0)) {
                this.cargarFacturadoresDisponibles();
            }
        },
        convenioInforme() {
            if (!this.facturadorInforme) return;
            const existe = this.facturadoresDisponiblesFiltrados.some(
                (fact) => fact.documento === this.facturadorInforme
            );
            if (!existe) {
                this.facturadorInforme = "";
            }
        },
        tieneDatosTabla(nuevoValor) {
            if (nuevoValor) {
                this.mostrarFormulario = false;
            }
        }
    },
    onload() {
        this.$store.commit('setEncuestasAdmin', []);
        this.detallesVisibles = [];
        this.clearFormInformes();
    },

    mounted() {
        window.addEventListener('resize', this.actualizarAnchoTabla);
        this.cargarConveniosDisponibles();
        this.cargarFacturadoresDisponibles();
        // Inicializar detallesVisibles según la cantidad de pacientes
        this.$watch(
            () => this.EncuestasAdmin,
            (nuevo) => {
                this.detallesVisibles = Array.isArray(nuevo) ? Array(nuevo.length).fill(false) : [];
                if (this.tipoinforme !== "3") {
                    this.actualizarDatosSeguimientoInforme();
                }
                this.actualizarAnchoTabla();
            }, {
            immediate: true,
            deep: false
        }
        );
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.actualizarAnchoTabla);
    },
};
</script>

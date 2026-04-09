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
                    </select>
                    <br>

                </div>

                <div class="col-6 col-md-2" v-if="tipoinforme == '1' || tipoinforme == '2'">
                    <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                    <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
                </div>
                <div class="col-6 col-md-2" v-if="tipoinforme == '1' || tipoinforme == '2'">
                    <label for="fechaFin" class="form-label">Fecha de Fin</label>
                    <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
                </div>
                <div class="col-12 col-md-3" v-if="tipoinforme == '1' || tipoinforme == '2'">
                    <label for="convenioInforme" class="form-label">Convenio</label>
                    <select id="convenioInforme" class="form-select" v-model="convenioInforme">
                        <option value="">Todos</option>
                        <option v-for="conv in conveniosDisponibles" :key="conv" :value="conv">{{ conv }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-2 mt-3" v-if="tipoinforme == '1' || tipoinforme == '2'">
                    <button type="button" class="btn btn-warning  mt-3" @click="generarInforme()">
                        <i class="bi bi-clipboard2-data h6"></i> Generar Informe
                    </button>
                </div>
            </div>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '1'">*Todas las encuestas cerradas por la
                enfermera entre las
                fechas seleccionadas</p>
            <p v-if="mostrarFormulario && !tieneDatosTabla && tipoinforme == '2'">*Todas las encuestas registradas entre las fechas seleccionadas, con sus actividades y datos del paciente</p>

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
    { key: "profesional", label: "Profesional" },
    { key: "rol", label: "Rol" },
    { key: "cupsNombre", label: "CUPS Nombre" },
    { key: "codigo", label: "Código" },
    { key: "descripcionCUP", label: "Descripción CUP" },
    { key: "cantidad", label: "Cantidad" },
    { key: "detalle", label: "Detalle" },
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
            conveniosDisponibles: ["Extramural", "E Basicos"],
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
            },
        };
    },
    methods: {
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
            return tipo === "2" ? COLUMNAS_ACTIVIDADES : COLUMNAS_INFORME;
        },

        normalizarConvenio(valor) {
            return String(valor || "").trim().toLowerCase();
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
                        const nombreCup = this.obtenerNombreCupDesdeId(cupId, asig?.cupsNombre || asig?.DescripcionCUP || asig?.codigo || "");

                        filas.push({
                            ...base,
                            rowKey: `${paciente.id}-${actividad.key}-${i}`,
                            actividad: actividad.nombre || "Actividad",
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

            return Object.values(tipoActividad)
                .filter((actividad) => actividad && typeof actividad === "object")
                .map((actividad) => ({
                    ...actividad,
                    key: actividad.key !== undefined && actividad.key !== null ? String(actividad.key) : "",
                    nombre: this.obtenerNombreActividadDesdeKey(actividad.key) || actividad.nombre || actividad.descripcion || actividad.key || "Actividad",
                }));
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

                this.actividadesExtraMap = Object.values(actividadesExtraGlobal).reduce((acc, item) => {
                    if (item && item.key !== undefined && item.key !== null) {
                        acc[String(item.key)] = item.nombre || item.descripcion || String(item.key);
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
                        const idActividad = String(actividad.key || "");

                        const asignaciones = cupsAsignados.filter((cup) => {
                            const cupActividadId = String(cup?.actividadId ?? cup?.idActividad ?? "");
                            return cupActividadId && idActividad && cupActividadId === idActividad;
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
                    };
                } else {
                    this.$toast.error("Debe seleccionar tipo de informe y rango de fechas");
                    this.actualizarProgreso(0, "Preparando consulta...");
                    this.cargandoInforme = false;
                    return;
                }

                this.actualizarProgreso(55, "Procesando actividades y asignaciones...");
                await this.actualizarDatosSeguimientoInforme();
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
            };
        },

        toggleDetalles(idx) {
            this.$set(this.detallesVisibles, idx, !this.detallesVisibles[idx]);

        },
    },

    computed: {
        ...mapState(["userData", "EncuestasAdmin"]),
        tituloListado() {
            return this.tipoinforme === "2" ? "Listado de actividades" : "Listado de Pacientes finalizados";
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
            return this.tipoinforme === "2"
                ? this.construirFilasActividades()
                : this.construirFilasExportacion();
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
            return etiquetas;
        },

    },
    watch: {
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
        // Inicializar detallesVisibles según la cantidad de pacientes
        this.$watch(
            () => this.EncuestasAdmin,
            (nuevo) => {
                this.detallesVisibles = Array.isArray(nuevo) ? Array(nuevo.length).fill(false) : [];
                this.actualizarDatosSeguimientoInforme();
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

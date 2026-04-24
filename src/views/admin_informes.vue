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


            <h1><i class="bi bi-clipboard2-data h1"></i>Informe X Profesional</h1>
            <div v-if="tieneContenidoInforme" class="mb-3">
                <button type="button" class="btn btn-primary" @click="parametrizarNuevoInforme">
                    <i class="bi bi-sliders"></i> Parametrizar nuevo informe
                </button>
            </div>
            <div v-if="mostrarFormulario && !tieneContenidoInforme" class="row">
                <h5>Seleccione:</h5>
                <div class="col-12 col-md-2">

                    <label class="form-label">Tipo de informe</label>
                    <select id="tipoinforme" name="tipoinforme" class="form-select" aria-label="Default select example"
                        v-model="tipoinforme" @change="clearFormInformes()">
                        <option selected value="">Seleccione</option>
                        <option value="1">Seguimiento</option>
                        <option value="2">Actividades</option>
                        <option value="3">Facturación</option>
                        <option value="4">Profesionales</option>
                    </select>
                    <br>

                </div>

                <div class="col-6 col-md-2" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3' || tipoinforme == '4'">
                    <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                    <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
                </div>
                <div class="col-6 col-md-2" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3' || tipoinforme == '4'">
                    <label for="fechaFin" class="form-label">Fecha de Fin</label>
                    <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
                </div>
                <div class="col-12 col-md-3" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3' || tipoinforme == '4'">
                    <label for="convenioInforme" class="form-label">Convenio</label>
                    <select id="convenioInforme" class="form-select" v-model="convenioInforme">
                        <option value="">Todos</option>
                        <option v-for="conv in conveniosDisponibles" :key="conv" :value="conv">{{ conv }}</option>
                    </select>
                </div>
                <div class="col-12 col-md-3" v-if="tipoinforme == '4'">
                    <label for="profesionalInforme" class="form-label">Profesional</label>
                    <select id="profesionalInforme" class="form-select" v-model="profesionalInforme">
                        <option value="">Seleccione</option>
                        <option v-for="prof in profesionalesDisponiblesFiltrados" :key="prof.documento" :value="prof.documento">
                            {{ prof.nombre }} - {{ prof.cargo }}
                        </option>
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
                <div class="col-12 col-md-2 mt-3" v-if="tipoinforme == '1' || tipoinforme == '2' || tipoinforme == '3' || tipoinforme == '4'">
                    <button type="button" class="btn btn-warning  mt-3" @click="generarInforme()">
                        <i class="bi bi-clipboard2-data h6"></i> Generar Informe
                    </button>
                </div>
            </div>
            <p v-if="mostrarFormulario && !tieneContenidoInforme && tipoinforme == '1'">*Todas las encuestas cerradas por la
                enfermera entre las
                fechas seleccionadas</p>
            <p v-if="mostrarFormulario && !tieneContenidoInforme && tipoinforme == '2'">*Todas las encuestas registradas entre las fechas seleccionadas, con sus actividades y datos del paciente</p>
            <p v-if="mostrarFormulario && !tieneContenidoInforme && tipoinforme == '3'">*Cierres de facturación por paciente y actividades (CUPS) en el rango de fechas, filtrables por convenio y facturador</p>
            <p v-if="mostrarFormulario && !tieneContenidoInforme && tipoinforme == '4'">*Informe individual por profesional con pacientes cerrados, pacientes abiertos, CUPS diligenciados por actividad y cierres diarios en el rango.</p>

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

            <div v-if="tipoinforme === '3' && tieneDatosTabla" class="alert alert-info d-flex flex-wrap gap-3 align-items-center py-2 px-3 mb-2">
                <span><strong>Registros:</strong> {{ totalRegistrosFacturacionReporte }}</span>
                <span><strong>CUPS:</strong> {{ totalCupsFacturacionReporte }}</span>
            </div>

            <button v-if="tieneDatosTabla" class="btn btn-outline-success mb-2" @click="exportarExcelFiltrado">
                <i class="bi bi-file-earmark-excel"></i> Exportar Excel
            </button>
            <div v-if="tipoinforme !== '4' && tieneDatosTabla">
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
            <div v-if="mostrarResumenProfesionales" class="resumen-profesionales mb-4">
                <div class="resumen-head mb-3">
                    <div>
                        <div class="metric-label mb-1">Profesional analizado</div>
                        <h4 class="mb-1">{{ datasetInformeProfesionales.profesionalNombre }}</h4>
                        <div class="text-muted small">
                            {{ datasetInformeProfesionales.cargo || 'Sin cargo' }}
                            <span v-if="datasetInformeProfesionales.documento"> | {{ datasetInformeProfesionales.documento }}</span>
                        </div>
                        <div class="text-muted small mt-1">
                            Este resumen usa el profesional seleccionado en el filtro y acota los CUPS al cargo de ese profesional dentro del rango elegido.
                        </div>
                    </div>
                    <div class="insight-chip" v-if="datasetInformeProfesionales.actividadTopLabel">
                        Actividad líder: {{ datasetInformeProfesionales.actividadTopLabel }} ({{ datasetInformeProfesionales.actividadTopCantidad }} CUPS)
                    </div>
                </div>
                <div class="row g-3 mb-3">
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="metric-card">
                            <div class="metric-label">Pacientes cerrados</div>
                            <div class="metric-value">{{ datasetInformeProfesionales.totalPacientesCerrados }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="metric-card">
                            <div class="metric-label">Pacientes abiertos</div>
                            <div class="metric-value">{{ datasetInformeProfesionales.totalPacientesAbiertos }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="metric-card">
                            <div class="metric-label">Actividades con CUPS diligenciados</div>
                            <div class="metric-value">{{ datasetInformeProfesionales.totalActividadesConCups }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="metric-card">
                            <div class="metric-label">CUPS diligenciados</div>
                            <div class="metric-value">{{ datasetInformeProfesionales.totalCupsDiligenciados }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-3">
                        <div class="metric-card">
                            <div class="metric-label">CUPS ya facturados</div>
                            <div class="metric-value">{{ datasetInformeProfesionales.totalCupsFacturados }}</div>
                        </div>
                    </div>
                </div>
                <div class="row g-3">
                    <div class="col-12 col-xl-6">
                        <div class="chart-card">
                            <h6 class="mb-3">Actividades con más CUPS diligenciados</h6>
                            <div v-if="actividadChartItems.length" class="chart-list">
                                <div v-for="item in actividadChartItems" :key="`actividad-chart-${item.label}`" class="chart-row">
                                    <div class="chart-header">
                                        <span class="chart-label">{{ item.label }}</span>
                                        <span class="chart-value">{{ item.value }} CUPS</span>
                                    </div>
                                    <div class="chart-bar-track">
                                        <div class="chart-bar-fill" :style="{ width: `${item.percent}%` }"></div>
                                    </div>
                                    <div class="chart-caption">{{ item.extra }}</div>
                                </div>
                            </div>
                            <div v-else class="text-muted small">No hay actividades para graficar.</div>
                        </div>
                    </div>
                    <div class="col-12 col-xl-6">
                        <div class="chart-card">
                            <h6 class="mb-3">Cierres diarios del profesional</h6>
                            <div v-if="cierresPorDiaChartItems.length" class="chart-list">
                                <div v-for="item in cierresPorDiaChartItems" :key="`cierres-chart-${item.label}`" class="chart-row">
                                    <div class="chart-header">
                                        <span class="chart-label">{{ item.label }}</span>
                                        <span class="chart-value">{{ item.value }} pacientes</span>
                                    </div>
                                    <div class="chart-bar-track chart-bar-track-alt">
                                        <div class="chart-bar-fill chart-bar-fill-alt" :style="{ width: `${item.percent}%` }"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-muted small">No hay cierres diarios en el rango.</div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="!mostrarResumenProfesionales" class="alert alert-secondary">
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

.resumen-profesionales {
    background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
    border: 1px solid #dbe7f3;
    border-radius: 18px;
    padding: 18px;
}

.resumen-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
}

.insight-chip {
    border-radius: 999px;
    padding: 10px 14px;
    background: #e0f2fe;
    color: #075985;
    font-weight: 600;
    font-size: 0.92rem;
}

.metric-card {
    height: 100%;
    border: 1px solid #dbe7f3;
    border-radius: 16px;
    padding: 16px;
    background: #ffffff;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.metric-label {
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #64748b;
    margin-bottom: 8px;
}

.metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1;
}

.chart-card {
    height: 100%;
    border: 1px solid #dbe7f3;
    border-radius: 16px;
    padding: 16px;
    background: #ffffff;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.chart-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.chart-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.88rem;
}

.chart-label {
    color: #0f172a;
    font-weight: 600;
}

.chart-value {
    color: #334155;
    font-weight: 700;
}

.chart-caption {
    color: #64748b;
    font-size: 0.78rem;
}

.chart-bar-track {
    width: 100%;
    height: 12px;
    border-radius: 999px;
    background: #dbeafe;
    overflow: hidden;
}

.chart-bar-track-alt {
    background: #dcfce7;
}

.chart-bar-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #2563eb 0%, #38bdf8 100%);
}

.chart-bar-fill-alt {
    background: linear-gradient(90deg, #16a34a 0%, #4ade80 100%);
}
</style>

<script>
import realtime_api from "@/api/realtimeApi.js";
import { getAllUsers } from "@/api/usersApi";
import * as XLSX from "xlsx";
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
    { key: "aprovisionado", label: "Aprovisionado" },
    { key: "cantidad", label: "Cantidad CUPS" },
    { key: "fechaFacturacionCup", label: "Fecha Facturacion CUPS" },
    { key: "fechaCierreFactura", label: "Fecha Cierre Factura" },
    { key: "numeroFactura", label: "Numero Factura" },
    { key: "convenio", label: "Convenio" },
    { key: "paciente", label: "Paciente" },
    { key: "documento", label: "Documento" },
    { key: "eps", label: "EPS" },
    { key: "actividad", label: "Actividad" },
    { key: "cupsNombre", label: "CUPS Nombre" },
    { key: "codigo", label: "Código" },
    { key: "facturadorActividad", label: "Facturador Actividad" },
    { key: "facturado", label: "Facturado" },
];

const COLUMNAS_PROFESIONALES = [
    { key: "paciente", label: "Paciente" },
    { key: "documentoPaciente", label: "Documento" },
    { key: "fechaCierre", label: "Fecha cierre" },
    { key: "actividad", label: "Actividad" },
    { key: "codigo", label: "Codigo" },
    { key: "cupsNombre", label: "Descripcion CUPS" },
    { key: "cantidad", label: "Cantidad" },
    { key: "detalle", label: "Detalle" },
    { key: "profesional", label: "Profesional" },
    { key: "rol", label: "Rol" },
    { key: "facturado", label: "Facturado" },
    { key: "convenio", label: "Convenio" },
];

const CARGO_CANONICO_POR_NORMALIZADO = {
    auxiliardeenfermeria: "Auxiliar de enfermeria",
    auxiliar: "Auxiliar de enfermeria",
    medico: "Medico",
    enfermero: "Enfermero",
    psicologo: "Psicologo",
    tsocial: "Tsocial",
    trabajadorsocial: "Tsocial",
    trabajadorasocial: "Tsocial",
    nutricionista: "Nutricionista",
};

const ROL_REPORTE_POR_CARGO = {
    "Auxiliar de enfermeria": "Auxiliar",
    Medico: "Medico",
    Enfermero: "Enfermero",
    Psicologo: "Psicologo",
    Tsocial: "Trabajador social",
    Nutricionista: "Nutricionista",
};

const ALIASES_ROL_POR_CARGO = {
    "Auxiliar de enfermeria": ["Auxiliar", "Auxiliar de enfermeria"],
    Medico: ["Medico"],
    Enfermero: ["Enfermero"],
    Psicologo: ["Psicologo"],
    Tsocial: ["Tsocial", "Trabajador social", "Trabajadora social"],
    Nutricionista: ["Nutricionista"],
};

const CONFIG_REPORTE_PROFESIONALES = [
    {
        cargo: "Auxiliar de enfermeria",
        docKeys: ["idEncuestador"],
        statusKey: "status_gest_aux",
        fechaKeys: ["fechagestAuxiliar", "fecha_gest_auxiliar"],
    },
    {
        cargo: "Medico",
        docKeys: ["idMedicoAtiende"],
        statusKey: "status_gest_medica",
        fechaKeys: ["fechagestMedica", "fecha_gest_medica"],
    },
    {
        cargo: "Enfermero",
        docKeys: ["idEnfermeroAtiende"],
        statusKey: "status_gest_enfermera",
        fechaKeys: ["fechagestEnfermera", "fecha_gest_enfermera"],
    },
    {
        cargo: "Psicologo",
        docKeys: ["idPsicologoAtiende"],
        statusKey: "status_gest_psicologo",
        fechaKeys: ["fechagestPsicologo", "fecha_gest_psicologo"],
    },
    {
        cargo: "Tsocial",
        docKeys: ["idTsocialAtiende"],
        statusKey: "status_gest_tsocial",
        fechaKeys: ["fechagestTsocial", "fecha_gest_tsocial"],
    },
    {
        cargo: "Nutricionista",
        docKeys: ["idNutricionistaAtiende", "idNutriAtiende", "idNutricionista", "idNutricionAtiende"],
        statusKey: "status_gest_nutricionista",
        fechaKeys: ["fechagestNutricionista", "fecha_gest_nutricionista"],
    },
];

const crearFiltrosIniciales = (columnas) => columnas.reduce((acc, col) => {
    acc[col.key] = "";
    return acc;
}, {});

const normalizarCargoReporte = (valor) => String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

const obtenerCargoCanonicoReporte = (valor) => CARGO_CANONICO_POR_NORMALIZADO[normalizarCargoReporte(valor)] || "";

const esCargoProfesionalReporte = (valor) => Boolean(obtenerCargoCanonicoReporte(valor));

export default {
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            tipoinforme: "",
            convenioInforme: "",
            profesionalInforme: "",
            facturadorInforme: "",
            conveniosDisponibles: ["Extramural", "E Basicos", "PIC"],
            facturadoresDisponibles: [],
            facturadoresMap: {},
            facturadoresConveniosMap: {},
            profesionalesDisponibles: [],
            profesionalesMap: {},
            profesionalesConveniosMap: {},
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

        async cargarProfesionalesDisponibles() {
            try {
                const usuarios = await getAllUsers();
                const mapa = new Map();

                usuarios.forEach((usuario) => {
                    const cargoCanonico = obtenerCargoCanonicoReporte(usuario?.cargo);
                    if (!cargoCanonico || !esCargoProfesionalReporte(usuario?.cargo)) return;

                    const documento = String(usuario?.numDocumento || usuario?.num_documento || usuario?.documento || "").trim();
                    if (!documento) return;

                    const documentoNorm = this.normalizarIdFacturador(documento);
                    const nombre = [usuario?.nombre1, usuario?.nombre2, usuario?.apellido1, usuario?.apellido2]
                        .map((parte) => String(parte || "").trim())
                        .filter(Boolean)
                        .join(" ") || String(usuario?.nombre || documento).trim();
                    const aliasUsuario = [
                        nombre,
                        usuario?.nombre,
                        usuario?.name,
                        usuario?.username,
                        usuario?.usuario,
                        usuario?.nombrePtof,
                    ]
                        .map((item) => String(item || "").trim())
                        .filter(Boolean);
                    const convenios = this.extraerConveniosUsuario(usuario?.convenio || usuario?.convenios);

                    if (!mapa.has(documentoNorm)) {
                        mapa.set(documentoNorm, {
                            documento,
                            nombre,
                            cargo: cargoCanonico,
                            convenios: new Set(convenios),
                            aliases: new Set(aliasUsuario),
                        });
                        return;
                    }

                    const actual = mapa.get(documentoNorm);
                    if ((!actual.nombre || actual.nombre === actual.documento) && nombre) {
                        actual.nombre = nombre;
                    }
                    if (!actual.cargo && cargoCanonico) {
                        actual.cargo = cargoCanonico;
                    }
                    convenios.forEach((conv) => actual.convenios.add(conv));
                    aliasUsuario.forEach((alias) => actual.aliases.add(alias));
                });

                const lista = Array.from(mapa.values())
                    .map((item) => ({
                        documento: item.documento,
                        nombre: item.nombre,
                        cargo: item.cargo,
                    }))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

                this.profesionalesDisponibles = lista;
                this.profesionalesMap = Array.from(mapa.entries()).reduce((acc, [doc, item]) => {
                    acc[doc] = {
                        documento: item.documento,
                        nombre: item.nombre,
                        cargo: item.cargo,
                        aliases: Array.from(item.aliases || []),
                    };
                    return acc;
                }, {});
                this.profesionalesConveniosMap = Array.from(mapa.entries()).reduce((acc, [doc, item]) => {
                    acc[doc] = Array.from(item.convenios || []);
                    return acc;
                }, {});
            } catch (error) {
                console.error("Error cargando profesionales:", error);
                this.profesionalesDisponibles = [];
                this.profesionalesMap = {};
                this.profesionalesConveniosMap = {};
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
            if (tipo === "4") return COLUMNAS_PROFESIONALES;
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

        obtenerDocumentoEncuestaPorClaves(encuesta = {}, docKeys = []) {
            for (const key of docKeys) {
                const valor = String(encuesta?.[key] || "").trim();
                if (valor) return valor;
            }
            return "";
        },

        obtenerFechaEncuestaPorClaves(encuesta = {}, fechaKeys = []) {
            for (const key of fechaKeys) {
                const valor = String(encuesta?.[key] || "").trim();
                if (valor) return valor;
            }
            return "";
        },

        obtenerFechaBaseEncuesta(encuesta = {}) {
            return String(
                encuesta?.fecha ||
                encuesta?.Fecha ||
                encuesta?.fechaRegistro ||
                encuesta?.fecha_registro ||
                encuesta?.createdAt ||
                encuesta?.fechaCreacion ||
                ""
            ).trim();
        },

        obtenerCantidadCupReporte(cup = {}) {
            const cantidad = Number(cup?.cantidad);
            if (Number.isFinite(cantidad) && cantidad > 0) return cantidad;
            return 1;
        },

        obtenerRolReportePorCargo(cargo = "") {
            return ROL_REPORTE_POR_CARGO[cargo] || cargo;
        },

        coincideRolCupConCargo(cup = {}, cargo = "", nombreProfesional = "", documentoProfesional = "") {
            const rolEsperado = this.normalizarTextoComparable(this.obtenerRolReportePorCargo(cargo));
            if (!rolEsperado) return true;

            const rolCup = this.normalizarTextoComparable(cup?.key || "");
            if (rolCup && rolCup !== rolEsperado) return false;

            const documentoEsperado = this.normalizarIdFacturador(documentoProfesional);
            const documentoCup = this.normalizarIdFacturador(cup?.idProf ?? cup?.idProfesional ?? "");
            if (documentoEsperado && documentoCup) {
                return documentoEsperado === documentoCup;
            }

            const aliasesEsperados = (Array.isArray(nombreProfesional) ? nombreProfesional : [nombreProfesional])
                .map((alias) => this.normalizarTextoComparable(alias))
                .filter(Boolean);
            if (!aliasesEsperados.length) return true;

            const nombreCup = this.normalizarTextoComparable(cup?.nombreProf || "");
            if (!nombreCup) return true;

            return aliasesEsperados.some((alias) =>
                nombreCup === alias ||
                nombreCup.includes(alias) ||
                alias.includes(nombreCup)
            );
        },

        construirNombrePacienteReporte(encuesta = {}) {
            return [encuesta?.nombre1, encuesta?.nombre2, encuesta?.apellido1, encuesta?.apellido2]
                .map((parte) => String(parte || "").trim())
                .filter(Boolean)
                .join(" ") || "Sin nombre";
        },

        construirDocumentoPacienteReporte(encuesta = {}) {
            const tipo = String(encuesta?.tipodoc || "").trim();
            const numero = String(encuesta?.numdoc || "").trim();
            return [tipo, numero].filter(Boolean).join("-");
        },

        resolverNombreActividadCup(encuesta = {}, cup = {}) {
            const actividadId = String(cup?.actividadId ?? cup?.idActividad ?? "").trim();
            const actividades = Array.isArray(encuesta?.seguimientoActividades) ? encuesta.seguimientoActividades : [];

            if (actividadId) {
                const actividad = actividades.find((item) => {
                    const candidatos = [item?.key, item?.id, item?.sourceId]
                        .map((valor) => this.normalizarIdRelacion(valor))
                        .filter(Boolean);
                    return candidatos.includes(actividadId);
                });
                if (actividad?.nombre) return actividad.nombre;
            }

            return this.obtenerNombreActividadDesdeKey(actividadId) || "Sin actividad";
        },

        esEstadoCerradoGestion(valor) {
            if (valor === true || valor === 1 || valor === 2) return true;
            if (typeof valor === "string") {
                const limpio = valor.trim().toLowerCase();
                return limpio === "true" || limpio === "1" || limpio === "2" || limpio === "cerrado";
            }
            if (typeof valor === "number") return valor >= 1;
            return false;
        },

        obtenerNombreProfesional(documento = "", cargoFallback = "") {
            const documentoNorm = this.normalizarIdFacturador(documento);
            const profesional = this.profesionalesMap?.[documentoNorm];
            if (profesional) {
                return {
                    nombre: profesional.nombre,
                    cargo: profesional.cargo || cargoFallback,
                    aliases: Array.isArray(profesional.aliases) ? profesional.aliases : [profesional.nombre],
                };
            }

            return {
                nombre: String(documento || "Sin profesional").trim() || "Sin profesional",
                cargo: cargoFallback,
                aliases: [String(documento || "Sin profesional").trim() || "Sin profesional"],
            };
        },

        async actualizarDatosProfesionalesInforme() {
            const paramsEncuesta = {};

            if (String(this.convenioInforme || "").trim()) {
                paramsEncuesta.convenio = String(this.convenioInforme || "").trim();
            }

            const [respEncuestas, respActividades, respAsignaciones, respActividadesExtra] = await Promise.all([
                realtime_api.get("/Encuesta.json", { params: paramsEncuesta }),
                realtime_api.get("/Actividades.json"),
                realtime_api.get("/Asignaciones.json"),
                realtime_api.get("/actividadesExtra.json"),
            ]);

            const encuestasObj = respEncuestas?.data || {};
            const actividadesGlobal = respActividades?.data || {};
            const asignacionesGlobal = respAsignaciones?.data || {};
            const actividadesExtraGlobal = respActividadesExtra?.data || {};

            this.actividadesExtraMap = Object.entries(actividadesExtraGlobal).reduce((acc, [id, item]) => {
                if (item && item.key !== undefined && item.key !== null) {
                    const nombreActividad = item.nombre || item.descripcion || String(item.key);
                    acc[String(item.key)] = nombreActividad;
                    acc[String(id)] = nombreActividad;
                }
                return acc;
            }, {});

            const encuestasLista = Object.entries(encuestasObj).map(([id, data]) => ({
                id,
                ...(data || {}),
            }));

            this.encuestasInforme = encuestasLista.map((paciente) => {
                const idEncuesta = String(paciente.id || paciente.idEncuesta || "");
                const cupsAsignados = this.normalizarCupsAsignaciones(asignacionesGlobal[idEncuesta]);
                const actividades = this.normalizarActividadesEncuesta(actividadesGlobal[idEncuesta], cupsAsignados);

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
                    cupsAsignadosRaw: cupsAsignados,
                };
            });
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
                    aprovisionado: facturadorPacienteDoc ? "Sí" : "No",
                    convenio: paciente.convenio || "",
                    facturadorPaciente: this.obtenerNombreFacturador(facturadorPacienteDoc),
                    fechaCierreFactura: this.formatearFechaCorta(
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
                        cantidad: "",
                        fechaFacturacionCup: "",
                        fechaCierreFactura: base.fechaCierreFactura,
                        numeroFactura: "",
                        actividad: "Sin actividades",
                        cupsNombre: "",
                        codigo: "",
                        facturadorActividad: "",
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
                        cantidad: cup?.cantidad ?? "",
                        fechaFacturacionCup: this.formatearFechaCorta(
                            cup?.fechaFacturacion ||
                            cup?.fecha_facturacion ||
                            cup?.FechaFacturacion
                        ),
                        fechaCierreFactura: base.fechaCierreFactura,
                        numeroFactura: cup?.FactNum || cup?.factNum || cup?.fact_num || "",
                        actividad: this.obtenerNombreActividadDesdeKey(cup?.actividadId || cup?.idActividad || "") || "Actividad",
                        cupsNombre: cup?.DescripcionCUP || cup?.cupsNombre || cup?.codigo || "",
                        codigo: cup?.codigo || "",
                        facturadorActividad: this.obtenerNombreFacturador(facturadorActividadDoc),
                        facturado: cup?.facturado === true ? "Sí" : "No",
                    });
                }
            }

            return filas;
        },

        async actualizarDatosFacturacionInforme() {
            const paramsEncuesta = {};

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
                .filter((encuesta) => {
                    if (!convenioSeleccionado) return true;
                    return this.normalizarConvenio(encuesta?.convenio) === convenioSeleccionado;
                })
                .map((encuesta) => {
                    const cupsObj = asignacionesObj?.[encuesta.id]?.cups;
                    const cupsLista = cupsObj && typeof cupsObj === "object"
                        ? Object.entries(cupsObj).map(([cupId, cup]) => ({ id: cupId, ...(cup || {}) }))
                        : [];

                    const cupsRelacionados = cupsLista.filter((cup) => {
                        const tieneFactura = String(cup?.FactNum || cup?.factNum || cup?.fact_num || "").trim().length > 0;
                        const fueFacturado = cup?.facturado === true;
                        const tieneFacturador = String(
                            cup?.FactProf || cup?.factProf || cup?.fact_prof || ""
                        ).trim().length > 0;
                        return tieneFactura || fueFacturado || tieneFacturador;
                    });

                    const pacienteAprovisionado = String(
                        encuesta?.asigfact || encuesta?.asig_fact || ""
                    ).trim().length > 0;
                    const pacienteCerrado = encuesta?.status_facturacion === true;

                    return {
                        ...encuesta,
                        cupsFacturacion: cupsRelacionados,
                        includeInFacturacion: pacienteCerrado || pacienteAprovisionado || cupsRelacionados.length > 0,
                    };
                })
                .filter((encuesta) => encuesta.includeInFacturacion)
                .filter((encuesta) => {
                    const fechaPacienteEnRango = this.fechaDentroDeRango(
                        encuesta?.FechaFacturacion || encuesta?.fechaFacturacion || encuesta?.fecha_facturacion,
                        this.fechaInicio,
                        this.fechaFin
                    );
                    const fechaAprovisionamientoEnRango = this.fechaDentroDeRango(
                        encuesta?.fechagestEnfermera || encuesta?.fecha_gest_enfermera,
                        this.fechaInicio,
                        this.fechaFin
                    );
                    const actividadEnRango = (encuesta.cupsFacturacion || []).some((cup) =>
                        this.fechaDentroDeRango(
                            cup?.fechaAsignacionFactura ||
                            cup?.fechaFacturacion ||
                            cup?.fecha_facturacion ||
                            cup?.FechaFacturacion,
                            this.fechaInicio,
                            this.fechaFin
                        )
                    );

                    return fechaPacienteEnRango || fechaAprovisionamientoEnRango || actividadEnRango;
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

        sanitizarValorExcel(valor) {
            const texto = String(valor ?? "");
            if (!texto) return "";

            // Evita que Excel interprete contenido de usuario como fórmula.
            if (/^[=+\-@]/.test(texto)) {
                return `'${texto}`;
            }

            return texto;
        },

        limpiarNombreArchivo(valor = "") {
            return String(valor || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_-]/g, "")
                .replace(/_+/g, "_")
                .replace(/^_+|_+$/g, "") || "informe";
        },

        construirNombreArchivoExcel() {
            const fecha = new Date().toISOString().slice(0, 10);

            if (this.tipoinforme === "4") {
                const profesionalNombre = this.obtenerNombreProfesional(this.profesionalInforme)?.nombre || this.profesionalInforme || "profesional";
                const profesionalSlug = this.limpiarNombreArchivo(profesionalNombre);
                const rango = [this.fechaInicio, this.fechaFin].filter(Boolean).join("_a_") || fecha;
                return `informe_${profesionalSlug}_${rango}.xlsx`;
            }

            const tipoSlug = this.limpiarNombreArchivo(this.consultaActual?.tipo || this.tipoinforme || "filtrado");
            const convenioSlug = this.convenioInforme ? this.limpiarNombreArchivo(this.convenioInforme) : "todos";
            const rango = [this.fechaInicio, this.fechaFin].filter(Boolean).join("_a_") || fecha;
            return `informe_${tipoSlug}_${convenioSlug}_${rango}.xlsx`;
        },

        exportarExcelFiltrado() {
            const filas = this.filasFiltradasOrdenadas;
            if (!filas.length) {
                this.$toast?.error
                    ? this.$toast.error("No hay datos para exportar.")
                    : alert("No hay datos para exportar.");
                return;
            }

            const filasExcel = filas.map((fila) => {
                const row = {};
                this.columnasTabla.forEach((col) => {
                    row[col.label] = this.sanitizarValorExcel(fila[col.key] ?? "");
                });
                return row;
            });

            const ws = XLSX.utils.json_to_sheet(filasExcel);
            if (ws["!ref"]) {
                ws["!autofilter"] = { ref: ws["!ref"] };
            }

            ws["!cols"] = this.columnasTabla.map(() => ({ wch: 22 }));

            const wb = XLSX.utils.book_new();
            const nombreHoja = String(this.consultaActual?.tipo || "Informe").slice(0, 31) || "Informe";
            XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
            XLSX.writeFile(wb, this.construirNombreArchivoExcel());
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

        formatearFechaCorta(valorFecha) {
            const fechaIso = this.formatearFechaYYYYMMDD(valorFecha);
            const matchIso = String(fechaIso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (matchIso) {
                return `${matchIso[3]}-${matchIso[2]}-${matchIso[1]}`;
            }
            return fechaIso || "";
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

        normalizarActividadesEncuesta(actividadesEncuesta, cupsAsignados = []) {
            const tipoActividad = actividadesEncuesta?.tipoActividad || actividadesEncuesta;
            const listaCups = Array.isArray(cupsAsignados) ? cupsAsignados.filter(Boolean) : [];

            if (!tipoActividad || typeof tipoActividad !== "object") {
                const actividadesDerivadas = new Map();

                listaCups.forEach((cup) => {
                    const actividadId = this.normalizarIdRelacion(cup?.actividadId ?? cup?.idActividad ?? "");
                    if (!actividadId) return;

                    const actual = actividadesDerivadas.get(actividadId) || {
                        id: actividadId,
                        sourceId: actividadId,
                        key: actividadId,
                        nombre: this.obtenerNombreActividadDesdeKey(actividadId) || actividadId,
                        asignaciones: [],
                    };

                    actual.asignaciones.push(cup);
                    actividadesDerivadas.set(actividadId, actual);
                });

                return Array.from(actividadesDerivadas.values());
            }

            return Object.entries(tipoActividad)
                .filter(([, actividad]) => actividad && typeof actividad === "object")
                .map(([actividadId, actividad]) => {
                    const sourceId = this.normalizarIdRelacion(actividadId);
                    const actividadKey = this.normalizarIdRelacion(
                        actividad.key ?? actividad.clave ?? actividad.actividadKey ?? actividad.actividadId
                    );
                    const referenciaActividad = actividadKey || sourceId;

                    const idsActividad = new Set(
                        [actividadKey, sourceId, referenciaActividad]
                            .map((valor) => this.normalizarIdRelacion(valor))
                            .filter(Boolean)
                    );
                    const asignacionesActividad = listaCups.filter((cup) => {
                        const cupActividadId = this.normalizarIdRelacion(cup?.actividadId ?? cup?.idActividad ?? "");
                        return cupActividadId && idsActividad.has(cupActividadId);
                    });

                    return ({
                        ...actividad,
                        id: sourceId,
                        sourceId,
                        key: actividadKey,
                        nombre: this.obtenerNombreActividadDesdeKey(referenciaActividad) || actividad.nombre || actividad.descripcion || referenciaActividad || "Actividad",
                        asignaciones: asignacionesActividad,
                    });
                });
        },

        normalizarCupsAsignaciones(asignacionEncuesta) {
            if (!asignacionEncuesta || typeof asignacionEncuesta !== "object") return [];

            const cupsOut = [];
            const registrarCup = (cupId, cup, extras = {}) => {
                if (!cup || typeof cup !== "object") return;
                cupsOut.push({
                    id: cup?.id ?? cup?.cupsId ?? cupId,
                    ...extras,
                    ...cup,
                });
            };

            const cupsDirectos = asignacionEncuesta?.cups;
            if (Array.isArray(cupsDirectos)) {
                cupsDirectos.forEach((cup, index) => registrarCup(index, cup));
            } else if (cupsDirectos && typeof cupsDirectos === "object") {
                Object.entries(cupsDirectos).forEach(([cupId, cup]) => {
                    if (
                        cup &&
                        typeof cup === "object" &&
                        !("actividadId" in cup) &&
                        !("idActividad" in cup) &&
                        !("DescripcionCUP" in cup) &&
                        !("codigo" in cup)
                    ) {
                        Object.entries(cup || {}).forEach(([nestedId, nestedCup]) => {
                            registrarCup(nestedId, nestedCup);
                        });
                        return;
                    }

                    registrarCup(cupId, cup);
                });
            }

            const tipoActividad = asignacionEncuesta?.tipoActividad;
            if (tipoActividad && typeof tipoActividad === "object") {
                Object.entries(tipoActividad).forEach(([actividadId, actividadNode]) => {
                    if (!actividadNode || typeof actividadNode !== "object") return;

                    const cupsPorRol = actividadNode?.cups;
                    if (!cupsPorRol || typeof cupsPorRol !== "object") return;

                    Object.entries(cupsPorRol).forEach(([rolKey, rolNode]) => {
                        if (!rolNode || typeof rolNode !== "object") return;

                        const cupsNodo = rolNode?.cups;
                        if (!cupsNodo || typeof cupsNodo !== "object") return;

                        Object.entries(cupsNodo).forEach(([cupId, cup]) => {
                            registrarCup(cupId, cup, {
                                actividadId: cup?.actividadId ?? actividadId,
                                key: cup?.key ?? rolKey,
                                nombreProf: cup?.nombreProf ?? rolNode?.nombreProf ?? rolKey,
                            });
                        });
                    });
                });
            }

            return cupsOut;
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
                    const cupsAsignados = this.normalizarCupsAsignaciones(asignacionesGlobal[idEncuesta]);
                    const actividades = this.normalizarActividadesEncuesta(actividadesGlobal[idEncuesta], cupsAsignados);

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
                } else if (this.fechaInicio && this.fechaFin && this.tipoinforme == "4") {
                    if (!String(this.profesionalInforme || "").trim()) {
                        this.$toast.error("Debe seleccionar un profesional para este informe");
                        this.actualizarProgreso(0, "Preparando consulta...");
                        this.cargandoInforme = false;
                        return;
                    }
                    await this.actualizarDatosProfesionalesInforme();
                    consultaUsada = {
                        tipo: "Profesionales",
                        finicial: this.fechaInicio,
                        ffinal: this.fechaFin,
                        profesional: this.profesionalInforme
                            ? this.obtenerNombreProfesional(this.profesionalInforme).nombre
                            : "Todos",
                        convenio: this.convenioInforme || "Todos",
                        facturador: "",
                    };
                } else {
                    this.$toast.error("Debe seleccionar tipo de informe y rango de fechas");
                    this.actualizarProgreso(0, "Preparando consulta...");
                    this.cargandoInforme = false;
                    return;
                }

                if (this.tipoinforme === "3") {
                    this.actualizarProgreso(55, "Procesando cierres de facturación...");
                } else if (this.tipoinforme === "4") {
                    this.actualizarProgreso(55, "Construyendo resumen de profesionales...");
                } else {
                    this.actualizarProgreso(55, "Procesando actividades y asignaciones...");
                    await this.actualizarDatosSeguimientoInforme();
                }
                if (consultaUsada) {
                    this.consultaActual = consultaUsada;
                }
                this.mostrarFormulario = this.tipoinforme === "4"
                    ? !this.datasetInformeProfesionales.hasData
                    : this.filasInformeTabla.length === 0;
                this.actualizarProgreso(80, this.tipoinforme === "4" ? "Renderizando resumen..." : "Renderizando tabla...");
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
            this.profesionalInforme = "";
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
        profesionalesDisponiblesFiltrados() {
            const convenioSel = this.normalizarTextoComparable(this.convenioInforme);
            if (!convenioSel) return this.profesionalesDisponibles;

            return (this.profesionalesDisponibles || []).filter((prof) => {
                const convenios = this.profesionalesConveniosMap?.[this.normalizarIdFacturador(prof.documento)] || [];
                return convenios.some((conv) => this.normalizarTextoComparable(conv) === convenioSel);
            });
        },
        tablaInformeProfesionalesRows() {
            if (this.tipoinforme !== "4") return [];

            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];
            const profesionalSeleccionado = this.normalizarIdFacturador(this.profesionalInforme);
            const profesionalMeta = profesionalSeleccionado ? this.profesionalesMap?.[profesionalSeleccionado] : null;
            if (!profesionalSeleccionado || !profesionalMeta?.cargo) return [];

            const configs = profesionalMeta?.cargo
                ? CONFIG_REPORTE_PROFESIONALES.filter((config) => config.cargo === profesionalMeta.cargo)
                : CONFIG_REPORTE_PROFESIONALES;

            const rows = [];

            encuestas.forEach((encuesta) => {
                const encuestaId = String(encuesta?.id || encuesta?.idEncuesta || "sin-id");
                const fechaBaseEncuesta = this.obtenerFechaBaseEncuesta(encuesta);
                let perteneceAlProfesional = false;
                let fechaCierreProfesional = "";

                configs.forEach((config) => {
                    const documento = this.obtenerDocumentoEncuestaPorClaves(encuesta, config.docKeys);
                    if (!documento) return;

                    const documentoNorm = this.normalizarIdFacturador(documento);
                    if (documentoNorm !== profesionalSeleccionado) return;

                    perteneceAlProfesional = true;

                    if (!fechaCierreProfesional) {
                        const fechaCierre = this.obtenerFechaEncuestaPorClaves(encuesta, config.fechaKeys);
                        fechaCierreProfesional = this.normalizarFechaSoloDia(fechaCierre);
                    }
                });

                const actividadesPaciente = Array.isArray(encuesta?.seguimientoActividades) ? encuesta.seguimientoActividades : [];
                const cupsRolPaciente = [];

                actividadesPaciente.forEach((actividad) => {
                    const asignacionesActividad = Array.isArray(actividad?.asignaciones) ? actividad.asignaciones : [];
                    asignacionesActividad.forEach((cup) => {
                        if (!this.coincideRolCupConCargo(
                            cup,
                            profesionalMeta?.cargo,
                            profesionalMeta?.aliases || profesionalMeta?.nombre,
                            profesionalMeta?.documento
                        )) return;

                        cupsRolPaciente.push({
                            ...cup,
                            actividadNombre: actividad?.nombre || this.resolverNombreActividadCup(encuesta, cup),
                        });
                    });
                });

                if (!cupsRolPaciente.length) {
                    const cupsPaciente = Array.isArray(encuesta?.cupsAsignadosRaw) ? encuesta.cupsAsignadosRaw : [];
                    cupsPaciente.forEach((cup) => {
                        const tieneDatosCup = Boolean(
                            cup?.codigo ||
                            cup?.DescripcionCUP ||
                            cup?.cupsNombre ||
                            cup?.detalle ||
                            cup?.actividadId ||
                            cup?.idActividad
                        );
                        if (!tieneDatosCup || !perteneceAlProfesional) return;

                        cupsRolPaciente.push(cup);
                    });
                }

                if (!perteneceAlProfesional && !cupsRolPaciente.length) return;

                const encuestaEnRango =
                    this.fechaDentroDeRango(fechaBaseEncuesta, this.fechaInicio, this.fechaFin) ||
                    this.fechaDentroDeRango(fechaCierreProfesional, this.fechaInicio, this.fechaFin);

                if (!encuestaEnRango) return;

                const fechaReferencia = this.formatearFechaYYYYMMDD(fechaCierreProfesional)
                    || this.formatearFechaYYYYMMDD(fechaBaseEncuesta)
                    || fechaCierreProfesional
                    || fechaBaseEncuesta
                    || "";

                if (!cupsRolPaciente.length) {
                    rows.push({
                        rowKey: `${encuestaId}-sin-cups-profesional`,
                        paciente: this.construirNombrePacienteReporte(encuesta),
                        documentoPaciente: this.construirDocumentoPacienteReporte(encuesta),
                        fechaCierre: fechaReferencia,
                        actividad: "Sin CUPS diligenciados",
                        codigo: "",
                        cupsNombre: "",
                        cantidad: "",
                        detalle: "",
                        profesional: profesionalMeta?.nombre || "",
                        profesionalDocumento: this.normalizarIdFacturador(profesionalMeta?.documento || this.profesionalInforme || ""),
                        rol: this.obtenerRolReportePorCargo(profesionalMeta?.cargo) || "",
                        facturado: "",
                        convenio: encuesta?.convenio || "",
                    });
                    return;
                }

                cupsRolPaciente.forEach((cup, index) => {
                    rows.push({
                        rowKey: `${encuestaId}-${cup?.id || cup?.cupsId || cup?.codigo || index}`,
                        paciente: this.construirNombrePacienteReporte(encuesta),
                        documentoPaciente: this.construirDocumentoPacienteReporte(encuesta),
                        fechaCierre: fechaReferencia,
                        actividad: cup?.actividadNombre || this.resolverNombreActividadCup(encuesta, cup),
                        codigo: cup?.codigo || "",
                        cupsNombre: cup?.DescripcionCUP || cup?.cupsNombre || this.obtenerNombreCupDesdeId(cup?.cupsId || cup?.id || "", "") || "",
                        cantidad: this.obtenerCantidadCupReporte(cup),
                        detalle: cup?.detalle || "",
                        profesional: cup?.nombreProf || profesionalMeta?.nombre || "",
                        profesionalDocumento: this.normalizarIdFacturador(cup?.idProf ?? cup?.idProfesional ?? profesionalMeta?.documento ?? this.profesionalInforme ?? ""),
                        rol: cup?.key || this.obtenerRolReportePorCargo(profesionalMeta?.cargo) || "",
                        facturado: cup?.facturado === true ? "Si" : "No",
                        convenio: cup?.convenio || encuesta?.convenio || "",
                    });
                });
            });

            return rows.sort((a, b) => {
                const porPaciente = String(a.paciente || "").localeCompare(String(b.paciente || ""), "es", { sensitivity: "base" });
                if (porPaciente !== 0) return porPaciente;
                const porActividad = String(a.actividad || "").localeCompare(String(b.actividad || ""), "es", { sensitivity: "base" });
                if (porActividad !== 0) return porActividad;
                return String(a.codigo || "").localeCompare(String(b.codigo || ""), "es", { sensitivity: "base" });
            });
        },
        datasetInformeProfesionales() {
            if (this.tipoinforme !== "4") {
                return {
                    rows: [],
                    hasData: false,
                    profesionalNombre: "",
                    cargo: "",
                    documento: "",
                    totalPacientesCerrados: 0,
                    totalPacientesAbiertos: 0,
                    totalActividadesConCups: 0,
                    totalCupsDiligenciados: 0,
                    totalCupsFacturados: 0,
                    actividadTopLabel: "",
                    actividadTopCantidad: 0,
                    rankingActividades: [],
                    cierresPorDia: [],
                    desglosePacientes: [],
                };
            }

            const encuestas = Array.isArray(this.encuestasInforme) ? this.encuestasInforme : [];
            const profesionalSeleccionado = this.normalizarIdFacturador(this.profesionalInforme);
            const profesionalMeta = profesionalSeleccionado ? this.profesionalesMap?.[profesionalSeleccionado] : null;
            if (!profesionalSeleccionado || !profesionalMeta?.cargo) {
                return {
                    rows: [],
                    hasData: false,
                    profesionalNombre: profesionalMeta?.nombre || "",
                    cargo: profesionalMeta?.cargo || "",
                    documento: profesionalMeta?.documento || this.profesionalInforme || "",
                    totalPacientesCerrados: 0,
                    totalPacientesAbiertos: 0,
                    totalActividadesConCups: 0,
                    totalCupsDiligenciados: 0,
                    totalCupsFacturados: 0,
                    actividadTopLabel: "",
                    actividadTopCantidad: 0,
                    rankingActividades: [],
                    cierresPorDia: [],
                    desglosePacientes: [],
                };
            }

            const configs = profesionalMeta?.cargo
                ? CONFIG_REPORTE_PROFESIONALES.filter((config) => config.cargo === profesionalMeta.cargo)
                : CONFIG_REPORTE_PROFESIONALES;

            const actividadRankingMap = new Map();
            const pacientesCerrados = new Set();
            const pacientesAbiertos = new Set();
            const actividadesConCups = new Set();
            const cierresPorDiaMap = new Map();
            const desglosePacientes = [];
            const rows = [];
            let totalCupsFacturados = 0;

            encuestas.forEach((encuesta) => {
                const encuestaId = String(encuesta?.id || encuesta?.idEncuesta || "sin-id");
                let perteneceAlProfesional = false;
                let cierreValidoEnRango = false;
                let fechaCierreValida = "";

                configs.forEach((config) => {
                    const documento = this.obtenerDocumentoEncuestaPorClaves(encuesta, config.docKeys);
                    if (!documento) return;

                    const documentoNorm = this.normalizarIdFacturador(documento);
                    if (documentoNorm !== profesionalSeleccionado) return;

                    perteneceAlProfesional = true;

                    if (!this.esEstadoCerradoGestion(encuesta?.[config.statusKey])) return;

                    const fechaCierre = this.obtenerFechaEncuestaPorClaves(encuesta, config.fechaKeys);
                    if (!this.fechaDentroDeRango(fechaCierre, this.fechaInicio, this.fechaFin)) return;

                    cierreValidoEnRango = true;
                    fechaCierreValida = this.normalizarFechaSoloDia(fechaCierre);
                });

                if (!perteneceAlProfesional) return;

                if (cierreValidoEnRango) {
                    pacientesCerrados.add(encuestaId);
                    cierresPorDiaMap.set(fechaCierreValida, (cierresPorDiaMap.get(fechaCierreValida) || 0) + 1);

                    const cupsPaciente = Array.isArray(encuesta?.cupsAsignadosRaw) ? encuesta.cupsAsignadosRaw : [];
                    const cupsRolPaciente = cupsPaciente.filter((cup) =>
                        this.coincideRolCupConCargo(
                            cup,
                            profesionalMeta?.cargo,
                            profesionalMeta?.aliases || profesionalMeta?.nombre,
                            profesionalMeta?.documento
                        )
                    );
                    const cupsRolPacienteFinal = cupsRolPaciente.length
                        ? cupsRolPaciente
                        : (perteneceAlProfesional
                            ? cupsPaciente.filter((cup) =>
                                cup?.codigo ||
                                cup?.DescripcionCUP ||
                                cup?.cupsNombre ||
                                cup?.detalle ||
                                cup?.actividadId ||
                                cup?.idActividad
                            )
                            : []);

                    const actividadesPaciente = [];
                    let totalCupsPaciente = 0;
                    let totalFacturadosPaciente = 0;
                    const actividadPacienteMap = new Map();

                    cupsRolPacienteFinal.forEach((cup) => {
                        const nombreActividad = this.resolverNombreActividadCup(encuesta, cup);
                        const facturado = cup?.facturado === true;

                        rows.push({
                            rowKey: `${encuestaId}-${cup?.id || cup?.cupsId || cup?.codigo || Math.random()}`,
                            paciente: this.construirNombrePacienteReporte(encuesta),
                            documentoPaciente: this.construirDocumentoPacienteReporte(encuesta),
                            fechaCierre: this.formatearFechaYYYYMMDD(fechaCierreValida) || fechaCierreValida,
                            actividad: nombreActividad,
                            codigo: cup?.codigo || "",
                            cupsNombre: cup?.DescripcionCUP || cup?.cupsNombre || "",
                            cantidad: cup?.cantidad ?? 1,
                            detalle: cup?.detalle || "",
                            profesional: cup?.nombreProf || profesionalMeta?.nombre || "",
                            rol: cup?.key || this.obtenerRolReportePorCargo(profesionalMeta?.cargo) || "",
                            facturado: facturado ? "Si" : "No",
                            convenio: cup?.convenio || encuesta?.convenio || "",
                        });

                        if (!actividadPacienteMap.has(nombreActividad)) {
                            actividadPacienteMap.set(nombreActividad, {
                                nombre: nombreActividad,
                                cups: 0,
                                facturados: 0,
                            });
                        }

                        const actividadPaciente = actividadPacienteMap.get(nombreActividad);
                        actividadPaciente.cups += 1;
                        if (facturado) {
                            actividadPaciente.facturados += 1;
                        }
                    });

                    actividadPacienteMap.forEach((actividad) => {
                        const nombreActividad = actividad.nombre;
                        const totalCupsFacturadosActividad = actividad.facturados;

                        if (!actividadRankingMap.has(nombreActividad)) {
                            actividadRankingMap.set(nombreActividad, {
                                label: nombreActividad,
                                value: 0,
                                pacientes: new Set(),
                                registros: 0,
                                facturados: 0,
                            });
                        }

                        const agregadoActividad = actividadRankingMap.get(nombreActividad);
                        agregadoActividad.value += actividad.cups;
                        agregadoActividad.registros += actividad.cups;
                        agregadoActividad.facturados += totalCupsFacturadosActividad;
                        agregadoActividad.pacientes.add(encuestaId);
                        actividadesConCups.add(this.normalizarTextoComparable(nombreActividad));
                        totalCupsFacturados += totalCupsFacturadosActividad;

                        totalCupsPaciente += actividad.cups;
                        totalFacturadosPaciente += totalCupsFacturadosActividad;
                        actividadesPaciente.push({
                            nombre: nombreActividad,
                            cups: actividad.cups,
                            facturados: totalCupsFacturadosActividad,
                        });
                    });

                    desglosePacientes.push({
                        id: encuestaId,
                        nombre: this.construirNombrePacienteReporte(encuesta),
                        documento: this.construirDocumentoPacienteReporte(encuesta),
                        fechaCierre: this.formatearFechaYYYYMMDD(fechaCierreValida) || fechaCierreValida,
                        totalCups: totalCupsPaciente,
                        totalFacturados: totalFacturadosPaciente,
                        actividades: actividadesPaciente.sort((a, b) => b.cups - a.cups),
                    });
                    return;
                }

                const fechaBaseEncuesta = this.obtenerFechaBaseEncuesta(encuesta);
                if (this.fechaDentroDeRango(fechaBaseEncuesta, this.fechaInicio, this.fechaFin)) {
                    pacientesAbiertos.add(encuestaId);
                }
            });

            const rankingActividades = Array.from(actividadRankingMap.entries())
                .map(([, value]) => ({
                    label: value.label,
                    value: value.value,
                    extra: `${value.facturados} facturados, ${value.pacientes.size} pacientes`,
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 8);

            const cierresPorDia = Array.from(cierresPorDiaMap.entries())
                .map(([label, value]) => ({ label, value }))
                .sort((a, b) => String(a.label).localeCompare(String(b.label), "es", { sensitivity: "base" }));

            const rolesEsperados = new Set(
                (ALIASES_ROL_POR_CARGO[profesionalMeta?.cargo] || [
                    this.obtenerRolReportePorCargo(profesionalMeta?.cargo),
                    profesionalMeta?.cargo,
                ])
                    .map((rol) => normalizarCargoReporte(rol))
                    .filter(Boolean)
            );
            const rowsRolProfesional = rows.filter((row) => {
                const rolFila = normalizarCargoReporte(row?.rol || "");
                if (!rolesEsperados.size) return true;
                return rolesEsperados.has(rolFila);
            });
            const actividadesRolProfesional = new Set(
                rowsRolProfesional
                    .map((row) => this.normalizarTextoComparable(row?.actividad || ""))
                    .filter(Boolean)
            );

            const topActividad = rankingActividades[0] || null;
            const totalCupsDiligenciados = rowsRolProfesional.length;
            const totalActividadesConCups = actividadesRolProfesional.size;
            const hasData = pacientesCerrados.size > 0 || pacientesAbiertos.size > 0 || totalCupsDiligenciados > 0;

            return {
                rows: rows.sort((a, b) => {
                    const porPaciente = String(a.paciente || "").localeCompare(String(b.paciente || ""), "es", { sensitivity: "base" });
                    if (porPaciente !== 0) return porPaciente;
                    const porActividad = String(a.actividad || "").localeCompare(String(b.actividad || ""), "es", { sensitivity: "base" });
                    if (porActividad !== 0) return porActividad;
                    return String(a.codigo || "").localeCompare(String(b.codigo || ""), "es", { sensitivity: "base" });
                }),
                hasData,
                profesionalNombre: profesionalMeta?.nombre || "Sin profesional",
                cargo: profesionalMeta?.cargo || "",
                documento: profesionalMeta?.documento || this.profesionalInforme || "",
                totalPacientesCerrados: pacientesCerrados.size,
                totalPacientesAbiertos: pacientesAbiertos.size,
                totalActividadesConCups,
                totalCupsDiligenciados,
                totalCupsFacturados,
                actividadTopLabel: topActividad?.label || "",
                actividadTopCantidad: topActividad?.value || 0,
                rankingActividades,
                cierresPorDia,
                desglosePacientes: desglosePacientes.sort((a, b) => b.totalCups - a.totalCups),
            };
        },
        mostrarResumenProfesionales() {
            return this.tipoinforme === "4" && this.datasetInformeProfesionales.hasData;
        },
        actividadChartItems() {
            const maximo = Math.max(...this.datasetInformeProfesionales.rankingActividades.map((item) => item.value), 0);
            if (!maximo) return [];
            return this.datasetInformeProfesionales.rankingActividades.map((item) => ({
                ...item,
                percent: Math.max(8, Math.round((item.value / maximo) * 100)),
            }));
        },
        cierresPorDiaChartItems() {
            const maximo = Math.max(...this.datasetInformeProfesionales.cierresPorDia.map((item) => item.value), 0);
            if (!maximo) return [];
            return this.datasetInformeProfesionales.cierresPorDia.map((item) => ({
                ...item,
                percent: Math.max(8, Math.round((item.value / maximo) * 100)),
            }));
        },
        tituloListado() {
            if (this.tipoinforme === "2") return "Listado de actividades";
            if (this.tipoinforme === "3") return "Listado de facturación";
            if (this.tipoinforme === "4") return "Informe individual de profesional";
            return "Listado de Pacientes finalizados";
        },
        filasFiltradasOrdenadas() {
            let filas = [...this.filasInformeTabla];

            if (this.tipoinforme === "4") {
                const profesionalSeleccionado = this.normalizarIdFacturador(this.profesionalInforme);
                const profesionalMeta = profesionalSeleccionado ? this.profesionalesMap?.[profesionalSeleccionado] : null;
                const rolesEsperados = new Set(
                    (ALIASES_ROL_POR_CARGO[profesionalMeta?.cargo] || [
                        this.obtenerRolReportePorCargo(profesionalMeta?.cargo),
                        profesionalMeta?.cargo,
                    ])
                        .map((rol) => normalizarCargoReporte(rol))
                        .filter(Boolean)
                );
                const aliasesProfesional = new Set(
                    [
                        profesionalMeta?.nombre,
                        ...(Array.isArray(profesionalMeta?.aliases) ? profesionalMeta.aliases : []),
                    ]
                        .map((alias) => this.normalizarTextoComparable(alias))
                        .filter(Boolean)
                );

                filas = filas.filter((fila) => {
                    const documentoFila = this.normalizarIdFacturador(fila?.profesionalDocumento || "");
                    if (profesionalSeleccionado && documentoFila) {
                        const rolFilaDocumento = normalizarCargoReporte(fila?.rol || "");
                        const coincideDocumento = documentoFila === profesionalSeleccionado;
                        const coincideRol = !rolesEsperados.size || rolesEsperados.has(rolFilaDocumento);
                        return coincideDocumento && coincideRol;
                    }

                    const rolFila = normalizarCargoReporte(fila?.rol || "");
                    if (!rolFila || (rolesEsperados.size && !rolesEsperados.has(rolFila))) {
                        return false;
                    }

                    if (!aliasesProfesional.size) return false;

                    const nombreFila = this.normalizarTextoComparable(fila?.profesional || "");
                    if (!nombreFila) return false;

                    return Array.from(aliasesProfesional).some((alias) =>
                        nombreFila === alias ||
                        nombreFila.includes(alias) ||
                        alias.includes(nombreFila)
                    );
                });
            }

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
            if (this.tipoinforme === "4") return this.tablaInformeProfesionalesRows;
            return this.construirFilasExportacion();
        },
        tieneDatosTabla() {
            return this.filasInformeTabla.length > 0;
        },
        totalCupsFacturacionReporte() {
            if (this.tipoinforme !== "3") return 0;
            return this.filasFiltradasOrdenadas.filter((fila) => {
                return String(fila?.cupsNombre || "").trim() || String(fila?.codigo || "").trim();
            }).length;
        },
        totalRegistrosFacturacionReporte() {
            if (this.tipoinforme !== "3") return 0;
            return this.filasFiltradasOrdenadas.length;
        },
        tieneContenidoInforme() {
            if (this.tipoinforme === "4") return this.mostrarResumenProfesionales || this.tieneDatosTabla;
            return this.tieneDatosTabla;
        },
        parametrosConsultaEtiquetas() {
            const etiquetas = [];
            if (this.consultaActual.tipo) etiquetas.push(`Tipo: ${this.consultaActual.tipo}`);
            if (this.consultaActual.finicial && this.consultaActual.ffinal) {
                etiquetas.push(`Rango: ${this.formatearFechaCorta(this.consultaActual.finicial)} a ${this.formatearFechaCorta(this.consultaActual.ffinal)}`);
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
            if (nuevoTipo === "4" && (!this.profesionalesDisponibles || this.profesionalesDisponibles.length === 0)) {
                this.cargarProfesionalesDisponibles();
            }
        },
        convenioInforme() {
            if (this.facturadorInforme) {
                const existe = this.facturadoresDisponiblesFiltrados.some(
                    (fact) => fact.documento === this.facturadorInforme
                );
                if (!existe) {
                    this.facturadorInforme = "";
                }
            }
            if (this.profesionalInforme) {
                const existeProfesional = this.profesionalesDisponiblesFiltrados.some(
                    (prof) => prof.documento === this.profesionalInforme
                );
                if (!existeProfesional) {
                    this.profesionalInforme = "";
                }
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
        // Inicializar detallesVisibles según la cantidad de pacientes
        this.$watch(
            () => this.EncuestasAdmin,
            (nuevo) => {
                this.detallesVisibles = Array.isArray(nuevo) ? Array(nuevo.length).fill(false) : [];
                if (this.tipoinforme === "1" || this.tipoinforme === "2") {
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

<template>
    <div class="informes-page w-100 px-2 px-md-4 py-3">

        <div class="w-100">
            <h2>{{ tituloInforme }}</h2>

            <div class="row g-3">
                <div class="col-12 col-lg-3 col-xl-2" v-if="!activacion">
                    <div class="container-fluid p-0 informe-filter-card">
                        <h5>Seleccione el rango de fechas a mostrar</h5>
                        <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                        <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
                        <label for="fechaFin" class="form-label">Fecha de Fin</label>
                        <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
                        <label for="tipoInformeAux" class="form-label mt-2">Tipo de informe</label>
                        <select id="tipoInformeAux" v-model="tipoInforme" class="form-select">
                            <option value="1">Pacientes cerrados</option>
                            <option value="2">Actividades</option>
                            <option value="3">Pacientes facturados/CUPS</option>
                        </select>
                        <button type="button" class="btn btn-warning mt-4 w-100" @click="generarInforme()">
                            Generar Informe
                        </button>
                    </div>

                </div>
                <div :class="activacion ? 'col-12' : 'col-12 col-lg-9 col-xl-10'">
                    <!-- Barra de acciones -->
                    <div v-if="activacion" class="informe-toolbar d-flex flex-wrap gap-2 mb-3">
                        <button class="btn btn-danger" @click="exportarPdfInforme">
                            <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                        </button>
                        <button class="btn btn-secondary" @click="resetInforme">
                            Nuevo informe
                        </button>
                        <span class="text-muted align-self-center small">
                            Total registros: {{ totalRegistros }}
                        </span>
                    </div>

                    <div v-if="activacion && informeSinDatos" class="alert alert-warning border py-4 text-center">
                        <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                        <strong>{{ mensajeRangoSinDatos }}</strong>
                    </div>

                    <template v-if="activacion && !informeSinDatos">
                        <!-- Tarjetas resumen -->
                        <div class="row g-3 mb-4">
                            <div class="col-6 col-md-4 col-xl-3">
                                <div class="card kpi-card h-100 border-0 shadow-sm">
                                    <div class="card-body py-3">
                                        <div class="kpi-label">Total registros</div>
                                        <div class="kpi-value">{{ totalRegistros }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 col-xl-3" v-if="tipoInforme === '2'">
                                <div class="card kpi-card h-100 border-0 shadow-sm">
                                    <div class="card-body py-3">
                                        <div class="kpi-label">Total actividades</div>
                                        <div class="kpi-value">{{ resumenActividades.totalActividades }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 col-xl-3">
                                <div class="card kpi-card h-100 border-0 shadow-sm">
                                    <div class="card-body py-3">
                                        <div class="kpi-label">Total CUPS</div>
                                        <div class="kpi-value">{{ tipoInforme === '3' ? resumenFacturacion.totalCups : resumenActividades.totalCups }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-6 col-md-4 col-xl-3" v-if="tipoInforme === '3'">
                                <div class="card kpi-card h-100 border-0 shadow-sm">
                                    <div class="card-body py-3">
                                        <div class="kpi-label">Pacientes únicos</div>
                                        <div class="kpi-value">{{ resumenFacturacion.totalPacientes }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Info general -->
                        <div class="card shadow-sm mb-4">
                            <div class="card-header bg-light py-2"><strong>Información del informe</strong></div>
                            <div class="card-body py-3">
                                <div class="row g-2">
                                    <div class="col-12 col-md-4"><span class="text-muted">Tipo:</span> <strong class="ms-1">{{ tipoInformeLabel }}</strong></div>
                                    <div class="col-12 col-md-4"><span class="text-muted">Rango:</span> <strong class="ms-1">{{ fechaInicio || "-" }} a {{ fechaFin || "-" }}</strong></div>
                                    <div class="col-12 col-md-4"><span class="text-muted">Usuario:</span> <strong class="ms-1">{{ userData?.nombre || "-" }}</strong></div>
                                    <div class="col-12 col-md-4"><span class="text-muted">Cargo:</span> <strong class="ms-1">{{ userData?.cargo || "-" }}</strong></div>
                                    <div class="col-12 col-md-4"><span class="text-muted">Convenio:</span> <strong class="ms-1">{{ userData?.convenio || "-" }}</strong></div>
                                    <div class="col-12 col-md-4"><span class="text-muted">IPS:</span> <strong class="ms-1">{{ dataips?.nombre || "-" }}</strong></div>
                                </div>
                            </div>
                        </div>

                        <!-- Tipo 1: Pacientes cerrados — resumen por actividad y población -->
                        <div v-if="tipoInforme === '1'" class="row g-3">
                            <div class="col-12 col-xl-6">
                                <div class="card shadow-sm h-100">
                                    <div class="card-header bg-light py-2"><strong>Actividades realizadas</strong></div>
                                    <div class="card-body p-0">
                                        <div v-if="resumenActividades.actividades.length === 0" class="text-muted text-center py-4">Sin datos</div>
                                        <div v-for="item in resumenActividades.actividades" :key="`ra-${item.nombre}`" class="chart-row px-3 py-1 border-bottom">
                                            <div class="chart-label" :title="item.nombre">{{ item.nombre }}</div>
                                            <div class="chart-track">
                                                <div class="chart-bar chart-bar-pacientes"
                                                    :style="{ width: `${porcentajeBarra(item.cantidad, resumenActividades.totalActividades)}%` }">
                                                </div>
                                            </div>
                                            <div class="chart-meta-single"><strong>{{ item.cantidad }}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-xl-6">
                                <div class="card shadow-sm h-100">
                                    <div class="card-header bg-light py-2"><strong>Población de riesgo</strong></div>
                                    <div class="card-body p-0">
                                        <div v-if="resumenPoblacionRiesgo.length === 0" class="text-muted text-center py-4">Sin datos</div>
                                        <div v-for="item in resumenPoblacionRiesgo" :key="`pr-${item.nombre}`" class="chart-row px-3 py-1 border-bottom">
                                            <div class="chart-label" :title="item.nombre">{{ item.nombre }}</div>
                                            <div class="chart-track">
                                                <div class="chart-bar chart-bar-cups"
                                                    :style="{ width: `${porcentajeBarra(item.cantidad, totalRegistros)}%` }">
                                                </div>
                                            </div>
                                            <div class="chart-meta-single"><strong>{{ item.cantidad }}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-xl-6">
                                <div class="card shadow-sm">
                                    <div class="card-header bg-light py-2"><strong>CUPS aplicados</strong></div>
                                    <div class="table-responsive">
                                        <table class="table table-sm table-striped mb-0">
                                            <thead><tr><th>CUPS</th><th class="text-end">Cantidad</th></tr></thead>
                                            <tbody>
                                                <tr v-for="item in resumenActividades.cups" :key="`cup-${item.nombre}`">
                                                    <td>{{ item.nombre }}</td>
                                                    <td class="text-end">{{ item.cantidad }}</td>
                                                </tr>
                                                <tr v-if="resumenActividades.cups.length === 0"><td colspan="2" class="text-center text-muted">Sin datos</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-xl-6">
                                <div class="card shadow-sm">
                                    <div class="card-header bg-light py-2"><strong>Remisión a procedimientos</strong></div>
                                    <div class="card-body py-3">
                                        <div class="row g-2">
                                            <div class="col-6">
                                                <div class="kpi-label">Requieren remisión</div>
                                                <div class="kpi-value text-warning">{{ resumenRemision.si }}</div>
                                            </div>
                                            <div class="col-6">
                                                <div class="kpi-label">No requieren</div>
                                                <div class="kpi-value text-success">{{ resumenRemision.no }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tipo 2: Actividades — resumen -->
                        <div v-if="tipoInforme === '2'" class="row g-3">
                            <div class="col-12 col-xl-6">
                                <div class="card shadow-sm h-100">
                                    <div class="card-header bg-light py-2"><strong>Actividades aplicadas</strong></div>
                                    <div class="card-body p-0">
                                        <div v-if="resumenActividades.actividades.length === 0" class="text-muted text-center py-4">Sin datos</div>
                                        <div v-for="item in resumenActividades.actividades" :key="`a2-${item.nombre}`" class="chart-row px-3 py-1 border-bottom">
                                            <div class="chart-label" :title="item.nombre">{{ item.nombre }}</div>
                                            <div class="chart-track">
                                                <div class="chart-bar chart-bar-pacientes"
                                                    :style="{ width: `${porcentajeBarra(item.cantidad, resumenActividades.totalActividades)}%` }">
                                                </div>
                                            </div>
                                            <div class="chart-meta-single"><strong>{{ item.cantidad }}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-xl-6">
                                <div class="card shadow-sm h-100">
                                    <div class="card-header bg-light py-2"><strong>CUPS vs cantidad aplicada</strong></div>
                                    <div class="table-responsive">
                                        <table class="table table-sm table-striped mb-0">
                                            <thead><tr><th>CUPS</th><th class="text-end">Cantidad</th></tr></thead>
                                            <tbody>
                                                <tr v-for="item in resumenActividades.cups" :key="`c2-${item.nombre}`">
                                                    <td>{{ item.nombre }}</td>
                                                    <td class="text-end">{{ item.cantidad }}</td>
                                                </tr>
                                                <tr v-if="resumenActividades.cups.length === 0"><td colspan="2" class="text-center text-muted">Sin datos</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tipo 3: Facturación — resumen por EPS y convenio -->
                        <div v-if="tipoInforme === '3'" class="row g-3">
                            <div class="col-12 col-xl-6">
                                <div class="card shadow-sm h-100">
                                    <div class="card-header bg-light py-2"><strong>CUPS por EPS</strong></div>
                                    <div class="card-body p-0">
                                        <div v-if="resumenFacturacionPorEps.length === 0" class="text-muted text-center py-4">Sin datos</div>
                                        <div v-for="item in resumenFacturacionPorEps" :key="`eps-${item.nombre}`" class="chart-row px-3 py-1 border-bottom">
                                            <div class="chart-label" :title="item.nombre">{{ item.nombre }}</div>
                                            <div class="chart-track">
                                                <div class="chart-bar chart-bar-pacientes"
                                                    :style="{ width: `${porcentajeBarra(item.cantidad, resumenFacturacion.totalCups)}%` }">
                                                </div>
                                            </div>
                                            <div class="chart-meta-single"><strong>{{ item.cantidad }}</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-xl-6">
                                <div class="card shadow-sm h-100">
                                    <div class="card-header bg-light py-2"><strong>CUPS más aplicados</strong></div>
                                    <div class="table-responsive">
                                        <table class="table table-sm table-striped mb-0">
                                            <thead><tr><th>Código - Nombre</th><th class="text-end">Cant.</th></tr></thead>
                                            <tbody>
                                                <tr v-for="item in resumenCupsFact" :key="`cf-${item.nombre}`">
                                                    <td>{{ item.nombre }}</td>
                                                    <td class="text-end">{{ item.cantidad }}</td>
                                                </tr>
                                                <tr v-if="resumenCupsFact.length === 0"><td colspan="2" class="text-center text-muted">Sin datos</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.informes-page {
    max-width: 100vw;
    overflow-x: hidden;
}

.informe-filter-card {
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    padding: 16px;
}

.alert-light {
    background: transparent;
}

.informe-table-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}

.kpi-card {
    background: linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%);
}
.kpi-label {
    font-size: 0.78rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.kpi-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
}
.chart-row {
    display: grid;
    grid-template-columns: minmax(110px, 32%) 1fr minmax(48px, 12%);
    gap: 0.5rem;
    align-items: center;
}
.chart-label {
    font-size: 0.82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.chart-track {
    position: relative;
    height: 16px;
    background: #eef2f7;
    border-radius: 999px;
    overflow: hidden;
}
.chart-bar {
    position: absolute;
    left: 0; top: 0;
    height: 100%;
    border-radius: 999px;
    min-width: 2px;
}
.chart-bar-pacientes { background: rgba(14,165,233,0.55); }
.chart-bar-cups { background: rgba(34,197,94,0.75); }
.chart-meta-single {
    font-size: 0.82rem;
    color: #475569;
    text-align: right;
}

@media (max-width: 575.98px) {
    .informes-page h2 {
        font-size: 1.35rem;
    }

    .informe-toolbar .btn,
    .informe-page-size select {
        width: 100% !important;
    }

    .informe-count {
        align-self: flex-start;
        font-size: 0.9rem;
    }

    .informe-filter-card {
        padding: 12px;
    }
}
</style>

<script>
import {
    mapState,
    mapActions
} from "vuex";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import appLogoUrl from "@/assets/images/logo_extramurapp.png";
import esebLogoUrl from "@/assets/images/logo_eseb.png";
import {
    cargarCupsPorEncuestaIds,
    filtrarCupsDelProfesional,
    mapearActividadesDesdeCups,
} from "@/utils/informesAsignaciones";
import { sliceVistaPreviaInforme } from "@/utils/informesPreview";
import {
    MENSAJE_RANGO_SIN_DATOS,
    buildPdfContentResumenProfesional,
} from "@/utils/informeProfesionalPdf";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || {};
export default {
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            tipoInforme: "1",
            idips: null,
            activacion: false,
            actividadesPorEncuesta: {},
            cupsPorEncuesta: {},
            paginaActual: 1,
            itemsPorPagina: 25,
            columnasTipoActividad: [
                "Consulta PYMS",
                "Consulta Morbilidad",
                "VPS",
                "Toma lab PYMS",
                "Toma lab Morbilidad",
                "Vacunacion",
                "Realizacion de tamizajes",
                "Realizacion Test",
                "IEC",
                "Remision IPS",
                "Otro",
            ],
            columnasPoblacionRiesgo: [
                "Gestante",
                "Menor a 5 años",
                "Discapacidad",
                "Adulto mayor",
                "Orientacion sexual diversa",
                "Grupo etnico",
            ],
        };
    },
    methods: {
        ...mapActions(["GetAllRegistersbyRangeAux", "GetInformeFacturacionProfesional", "getAllActividadesExtra", "getdataips"]),

        async cargarDatosIps() {
            try {
                await this.getdataips(this.idips || null);
            } catch (error) {
                console.error("Error cargando datos IPS en informe auxiliar:", error);
            }
        },

        /* metodo para cargar los datos del profesional, y los datos de la ips */
        async generarInforme() {
            try {
                if (!this.fechaInicio || !this.fechaFin) {
                    alert("Debe seleccionar fecha de inicio y fecha fin.");
                    return;
                }

                if (this.fechaInicio > this.fechaFin) {
                    alert("La fecha de inicio no puede ser mayor que la fecha fin.");
                    return;
                }

                const rango = {
                    fechaInicio: this.fechaInicio,
                    fechaFin: this.fechaFin,
                    idempleado: this.userData.numDocumento,
                    cargo: this.userData.cargo,
                    nombre: this.userData.nombre,
                };

                await this.cargarDatosIps();
                if (this.tipoInforme === "3") {
                    await this.GetInformeFacturacionProfesional(rango);
                    this.actividadesPorEncuesta = {};
                    this.cupsPorEncuesta = {};
                } else {
                    await this.GetAllRegistersbyRangeAux(rango);
                    await this.getAllActividadesExtra();
                    await this.cargarActividadesPorEncuesta();
                }
                this.paginaActual = 1;
                this.activacion = true;
            } catch (error) {
                console.error("Error al generar informe auxiliar:", error);
                alert("No fue posible generar el informe. " + (error?.message || ""));
            }
        },
        resetInforme() {
            this.fechaInicio = "";
            this.fechaFin = "";
            this.paginaActual = 1;
            this.itemsPorPagina = 25;
            this.actividadesPorEncuesta = {};
            this.cupsPorEncuesta = {};
            this.tipoInforme = "1";
            this.activacion = false;
            this.$store.commit("setEncuestasfiltradas", []);
        },
        cambiarPagina(pagina) {
            if (pagina >= 1 && pagina <= this.totalPaginas) {
                this.paginaActual = pagina;
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        },
        porcentajeBarra(valor, maximo) {
            const base = Number(maximo || 0);
            if (!base) return 0;
            return Math.max(4, Math.round((Number(valor || 0) / base) * 100));
        },
        getGeneratedAtLabel() {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const dd = String(now.getDate()).padStart(2, "0");
            const hh = String(now.getHours()).padStart(2, "0");
            const mi = String(now.getMinutes()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
        },
        getLogoSourcesForPdf() {
            return [
                appLogoUrl,
                this.dataips?.logoUrl,
                this.dataips?.logo_url,
                this.dataips?.logo,
                this.dataips?.logoIps,
                this.dataips?.logo_ips,
                this.userData?.logoUrl,
                this.userData?.logo_url,
            ]
                .map((logo) => String(logo || "").trim())
                .filter(Boolean)
                .filter((logo, index, arr) => arr.indexOf(logo) === index);
        },
        decodeSvgDataUrl(dataUrl = "") {
            const [, metadata = "", payload = ""] = dataUrl.match(/^data:image\/svg\+xml([^,]*),(.*)$/i) || [];
            if (!payload) return "";
            try {
                return metadata.includes(";base64") ? atob(payload) : decodeURIComponent(payload);
            } catch (_error) {
                return "";
            }
        },
        async loadPdfLogoFromSource(source) {
            if (!source) return null;
            if (/^data:image\/svg\+xml/i.test(source)) {
                const svg = this.decodeSvgDataUrl(source);
                return svg ? { svg } : null;
            }
            if (/^data:image\//i.test(source)) {
                return { image: source };
            }
            try {
                const response = await fetch(source);
                if (!response.ok) return null;
                const contentType = String(response.headers.get("content-type") || "").toLowerCase();
                if (contentType.includes("svg") || String(source).toLowerCase().includes(".svg")) {
                    const svg = await response.text();
                    return svg ? { svg } : null;
                }
                const blob = await response.blob();
                const image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ""));
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                return image ? { image } : null;
            } catch (_error) {
                return null;
            }
        },
        async getLogoForPdf() {
            for (const source of this.getLogoSourcesForPdf()) {
                const logo = await this.loadPdfLogoFromSource(source);
                if (logo) return logo;
            }
            return null;
        },
        async getEsebLogoForPdf() {
            return this.loadPdfLogoFromSource(esebLogoUrl);
        },
        buildPdfLogoNode(logo, fit, extra = {}) {
            if (!logo) return null;
            return {
                ...(logo.svg ? { svg: logo.svg } : { image: logo.image }),
                fit,
                ...extra,
            };
        },
        async buildPdfHeaderSection(logoData = null) {
            const ipsNombre = String(
                this.dataips?.nombre ||
                this.userData?.ipsNombre ||
                "Empresa Social del Estado Barrancabermeja"
            ).trim() || "Empresa Social del Estado Barrancabermeja";
            const logo = logoData || await this.getLogoForPdf();
            const esebLogo = await this.getEsebLogoForPdf();
            const headerLogo = esebLogo || logo;
            return [
                {
                    stack: [
                        headerLogo ? this.buildPdfLogoNode(headerLogo, [72, 72], { alignment: "center", margin: [0, 0, 0, 4] }) : { text: "" },
                        { text: ipsNombre, style: "ipsHeaderName", alignment: "center", margin: [0, 0, 0, 8] },
                        {
                            canvas: [{ type: "line", x1: 0, y1: 0, x2: 540, y2: 0, lineWidth: 1, lineColor: "#9ca3af" }],
                            margin: [0, 0, 0, 10],
                        },
                    ],
                },
            ];
        },
        buildPdfWatermark(logoData) {
            if (!logoData) return null;
            return (_currentPage, pageSize) => {
                const tiles = [];
                const tileWidth = 160;
                const gapX = 135;
                const gapY = 115;
                let rowIndex = 0;
                for (let y = -90; y < pageSize.height + gapY; y += gapY) {
                    const rowOffset = rowIndex % 2 === 0 ? 0 : tileWidth / 2;
                    for (let x = -85 + rowOffset; x < pageSize.width + gapX; x += gapX) {
                        tiles.push({
                            ...this.buildPdfLogoNode(logoData, [tileWidth, tileWidth], { opacity: 0.07, angle: 45 }),
                            absolutePosition: { x, y },
                        });
                    }
                    rowIndex += 1;
                }
                return { stack: tiles };
            };
        },
        async exportarPdfInforme() {
            const logoData = await this.getLogoForPdf();
            const metaRows = [
                ["Tipo de informe", this.tipoInformeLabel],
                ["Rango de fechas", `${this.fechaInicio || "-"} a ${this.fechaFin || "-"}`],
                ["Usuario", this.userData?.nombre || "-"],
                ["Cargo", this.userData?.cargo || "-"],
                ["Convenio", this.userData?.convenio || "-"],
                ["Grupo", this.userData?.grupo || "-"],
                ["Generado", this.getGeneratedAtLabel()],
            ];

            const content = [
                ...(await this.buildPdfHeaderSection(logoData)),
                { text: "Informe de actividades", style: "header" },
                {
                    table: { widths: [130, "*"], body: metaRows },
                    layout: "lightHorizontalLines",
                    margin: [0, 0, 0, 12],
                },
                ...buildPdfContentResumenProfesional({
                    tipoInforme: this.tipoInforme,
                    totalRegistros: this.totalRegistros,
                    resumenActividades: this.resumenActividades,
                    resumenFacturacion: this.resumenFacturacion,
                    resumenPoblacionRiesgo: this.resumenPoblacionRiesgo,
                    resumenRemision: this.resumenRemision,
                    resumenFacturacionPorEps: this.resumenFacturacionPorEps,
                    resumenCupsFact: this.resumenCupsFact,
                }),
            ];

            const tipoArchivo = this.tipoInforme === "2"
                ? "actividades"
                : this.tipoInforme === "3"
                    ? "pacientes_facturados_cups"
                    : "pacientes_cerrados";
            const usuarioArchivo = String(this.userData?.nombre || "usuario")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "") || "usuario";
            const rangoArchivo = `${this.fechaInicio || "sin_inicio"}_a_${this.fechaFin || "sin_fin"}`;

            const docDefinition = {
                pageSize: "A4",
                pageOrientation: "portrait",
                pageMargins: [26, 26, 26, 26],
                ...(logoData ? { background: this.buildPdfWatermark(logoData) } : {}),
                content,
                styles: {
                    header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
                    subheader: { fontSize: 12, bold: true, margin: [0, 6, 0, 6] },
                    ipsHeaderName: { fontSize: 13, bold: true },
                    emptyMessage: { fontSize: 12, italics: true, color: "#b45309", alignment: "center" },
                },
                defaultStyle: { fontSize: 9 },
            };

            pdfMake.createPdf(docDefinition).download(`${tipoArchivo}_${usuarioArchivo}_${rangoArchivo}.pdf`);
        },
        async cargarActividadesPorEncuesta() {
            const mapa = {};
            const cupsMap = {};
            const encuestas = this.encuestasFiltradas || [];
            const ids = encuestas.map((encuesta) => encuesta.id).filter(Boolean);

            try {
                const cupsPorId = await cargarCupsPorEncuestaIds(ids);
                encuestas.forEach((encuesta) => {
                    const cupsDelProfesional = filtrarCupsDelProfesional(
                        cupsPorId[encuesta.id] || [],
                        this.userData
                    );
                    cupsMap[encuesta.id] = cupsDelProfesional;
                    mapa[encuesta.id] = mapearActividadesDesdeCups(
                        cupsDelProfesional,
                        (idActividad) => this.obtenerNombreActividadExtra(idActividad)
                    );
                });
            } catch (error) {
                console.error("Error cargando asignaciones del informe:", error);
                encuestas.forEach((encuesta) => {
                    mapa[encuesta.id] = [];
                    cupsMap[encuesta.id] = [];
                });
            }

            this.actividadesPorEncuesta = mapa;
            this.cupsPorEncuesta = cupsMap;
        },
        obtenerEtiquetaCup(cup = {}) {
            const codigo = String(cup?.codigo || cup?.cupsId || cup?.codcups || "").trim();
            const nombre = String(cup?.DescripcionCUP || cup?.cupsNombre || cup?.descripcion || "").trim();
            return [codigo, nombre].filter(Boolean).join(" - ") || "CUPS sin nombre";
        },
        obtenerCantidadCup(cup = {}) {
            const cantidad = Number(cup?.cantidad);
            return Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1;
        },
        obtenerCantidadCupsPaciente(encuesta = {}) {
            const cups = this.cupsPorEncuesta?.[encuesta.id] || [];
            return cups.reduce((total, cup) => total + this.obtenerCantidadCup(cup), 0);
        },
        obtenerNombresTipoActividad(encuesta) {
            return this.actividadesPorEncuesta[encuesta.id] || [];
        },
        obtenerNombreActividadExtra(key) {
            if (!key || !this.actividadesExtra) return "";
            const encontrada = this.actividadesExtra.find(
                (act) => String(act.key) === String(key) || String(act.id) === String(key)
            );
            return encontrada ? encontrada.nombre : "";
        },
        normalizarTexto(texto) {
            return String(texto || "")
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        },
        actividadRealizada(encuesta, nombreColumna) {
            const objetivo = this.normalizarTexto(nombreColumna);
            return this.obtenerNombresTipoActividad(encuesta)
                .map((nombre) => this.normalizarTexto(nombre))
                .includes(objetivo);
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
        nombrePaciente(row = {}) {
            return String(
                row.pacienteNombre ||
                `${row.nombre1 || ""} ${row.nombre2 || ""} ${row.apellido1 || ""} ${row.apellido2 || ""}`
            ).trim();
        }

    },
    computed: {
        ...mapState(["encuestasFiltradas", "dataips", "userData", "actividadesExtra"]),
        tituloInforme() {
            const cargo = String(this.userData?.cargo || "").trim();
            if (!cargo) return "Informes";
            return `${cargo} Informes`;
        },
        tipoInformeLabel() {
            const labels = {
                1: "Pacientes cerrados",
                2: "Actividades",
                3: "Pacientes facturados/CUPS",
            };
            return labels[this.tipoInforme] || "Pacientes cerrados";
        },

        totalRegistros() {
            return this.encuestasFiltradas?.length || 0;
        },
        informeSinDatos() {
            return this.totalRegistros === 0;
        },
        mensajeRangoSinDatos() {
            return MENSAJE_RANGO_SIN_DATOS;
        },
        totalPaginas() {
            return Math.ceil(this.totalRegistros / this.itemsPorPagina);
        },
        encuestasPaginadas() {
            return sliceVistaPreviaInforme(this.encuestasFiltradas);
        },
        registroInicio() {
            if (this.totalRegistros === 0) return 0;
            return (this.paginaActual - 1) * this.itemsPorPagina + 1;
        },
        registroFin() {
            const fin = this.paginaActual * this.itemsPorPagina;
            return fin > this.totalRegistros ? this.totalRegistros : fin;
        },
        paginasVisibles() {
            const paginas = [];
            const rango = 2; // Mostrar 2 páginas antes y después de la actual
            let inicio = Math.max(1, this.paginaActual - rango);
            let fin = Math.min(this.totalPaginas, this.paginaActual + rango);
            if (this.paginaActual <= rango) {
                fin = Math.min(this.totalPaginas, rango * 2 + 1);
            }

            if (this.paginaActual > this.totalPaginas - rango) {
                inicio = Math.max(1, this.totalPaginas - rango * 2);
            }

            for (let i = inicio; i <= fin; i++) {
                paginas.push(i);
            }

            return paginas;
        },
        resumenActividades() {
            const actividadCounter = new Map();
            const cupsCounter = new Map();
            let totalCups = 0;

            (this.encuestasFiltradas || []).forEach((encuesta) => {
                const actividades = this.obtenerNombresTipoActividad(encuesta);
                actividades.forEach((nombre) => {
                    const key = String(nombre || "").trim();
                    if (!key) return;
                    actividadCounter.set(key, (actividadCounter.get(key) || 0) + 1);
                });

                const cups = this.cupsPorEncuesta?.[encuesta.id] || [];
                cups.forEach((cup) => {
                    const etiqueta = this.obtenerEtiquetaCup(cup);
                    const cantidad = this.obtenerCantidadCup(cup);
                    cupsCounter.set(etiqueta, (cupsCounter.get(etiqueta) || 0) + cantidad);
                    totalCups += cantidad;
                });
            });

            const actividades = Array.from(actividadCounter.entries())
                .map(([nombre, cantidad]) => ({ nombre, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre));

            const cups = Array.from(cupsCounter.entries())
                .map(([nombre, cantidad]) => ({ nombre, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre));

            return {
                totalPacientes: this.totalRegistros,
                totalActividades: actividades.reduce((acc, item) => acc + item.cantidad, 0),
                totalCups,
                actividades,
                cups,
            };
        },
        resumenFacturacion() {
            const pacientes = new Set(
                (this.encuestasFiltradas || [])
                    .map((row) => String(row.encuestaId || row.id || "").trim())
                    .filter(Boolean)
            );
            return {
                totalPacientes: pacientes.size,
                totalCups: (this.encuestasFiltradas || []).length,
            };
        },
        resumenPoblacionRiesgo() {
            const counter = new Map();
            (this.encuestasFiltradas || []).forEach((enc) => {
                this.columnasPoblacionRiesgo.forEach((col) => {
                    if (enc.poblacionRiesgo && String(enc.poblacionRiesgo).includes(col)) {
                        counter.set(col, (counter.get(col) || 0) + 1);
                    }
                });
            });
            return Array.from(counter.entries())
                .map(([nombre, cantidad]) => ({ nombre, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad);
        },
        resumenRemision() {
            let si = 0, no = 0;
            (this.encuestasFiltradas || []).forEach((enc) => {
                const v = String(enc.requiereRemision || "").toLowerCase();
                if (v === "si" || v === "sí") si++;
                else no++;
            });
            return { si, no };
        },
        resumenFacturacionPorEps() {
            const counter = new Map();
            (this.encuestasFiltradas || []).forEach((row) => {
                const eps = String(row.eps || "Sin EPS").trim();
                counter.set(eps, (counter.get(eps) || 0) + Number(row.cantidad || 1));
            });
            return Array.from(counter.entries())
                .map(([nombre, cantidad]) => ({ nombre, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad);
        },
        resumenCupsFact() {
            const counter = new Map();
            (this.encuestasFiltradas || []).forEach((row) => {
                const key = [row.cupsCodigo, row.cupsNombre].filter(Boolean).join(" - ") || "Sin CUPS";
                counter.set(key, (counter.get(key) || 0) + Number(row.cantidad || 1));
            });
            return Array.from(counter.entries())
                .map(([nombre, cantidad]) => ({ nombre, cantidad }))
                .sort((a, b) => b.cantidad - a.cantidad);
        },
    },
    watch: {
        itemsPorPagina() {
            this.paginaActual = 1;
        }
    },
    async mounted() {
        this.$store.commit("setEncuestasfiltradas", []);
        await this.cargarDatosIps();
    },

};
</script>

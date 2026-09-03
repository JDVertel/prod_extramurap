<template>
    <div class="informes-page informe-cuentas w-100 px-2 px-md-4 py-3">
        <h1><i class="bi bi-pie-chart-fill"></i> Informe de actividades - Facturación</h1>
        <p class="text-muted mb-0">Pacientes y CUPS cerrados en el rango seleccionado, desglosados por convenio y EPS.</p>
        <hr>

        <div class="row g-3">
            <div class="col-12 col-lg-3 col-xl-2" v-if="!activacion">
                <div class="container-fluid p-0 informe-filter-card">
                    <h5>Rango de fechas</h5>
                    <label for="fechaInicio" class="form-label">Fecha de inicio</label>
                    <input id="fechaInicio" v-model="fechaInicio" type="date" class="form-control" required />
                    <label for="fechaFin" class="form-label mt-2">Fecha de fin</label>
                    <input id="fechaFin" v-model="fechaFin" type="date" class="form-control" required />
                    <button type="button" class="btn btn-warning mt-4 w-100" :disabled="cargando" @click="generarInforme">
                        {{ cargando ? "Generando..." : "Generar informe" }}
                    </button>
                </div>
            </div>

            <div :class="activacion ? 'col-12' : 'col-12 col-lg-9 col-xl-10'">
                <div v-if="activacion" class="informe-toolbar d-flex flex-wrap gap-2 mb-3">
                    <button type="button" class="btn btn-outline-success" :disabled="informeSinDatos" @click="exportarExcel">
                        <i class="bi bi-file-earmark-spreadsheet"></i> Exportar Excel
                    </button>
                    <button type="button" class="btn btn-danger" @click="exportarPdfInforme">
                        <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                    </button>
                    <button type="button" class="btn btn-secondary" @click="resetInforme">
                        Nuevo informe
                    </button>
                    <span class="text-muted align-self-center small">
                        Periodo: {{ fechaInicio }} a {{ fechaFin }}
                    </span>
                </div>

                <div v-if="activacion && informeSinDatos" class="alert alert-warning border mb-0 py-4 text-center">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    <strong>{{ mensajeRangoSinDatos }}</strong>
                    <p class="mb-0 mt-2 text-muted">
                        No se encontraron pacientes cerrados ni CUPS cerrados entre
                        {{ fechaInicio }} y {{ fechaFin }}.
                    </p>
                </div>

                <template v-if="activacion && !informeSinDatos">
                <div class="card shadow-sm mb-4">
                    <div class="card-header bg-light py-2">
                        <strong>Información general</strong>
                    </div>
                    <div class="card-body py-3">
                        <div class="row g-2 g-md-3">
                            <div class="col-12 col-md-6 col-xl-4" v-for="item in informacionUsuario" :key="item.label">
                                <span class="text-muted">{{ item.label }}:</span>
                                <strong class="ms-1">{{ item.valor }}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-6 col-md-4 col-xl" v-for="kpi in tarjetasResumen" :key="kpi.key">
                        <div class="card kpi-card h-100 border-0 shadow-sm">
                            <div class="card-body py-3">
                                <div class="kpi-label">{{ kpi.label }}</div>
                                <div class="kpi-value">{{ kpi.valor }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-12 col-xl-6" v-for="grafica in graficas" :key="grafica.titulo">
                        <div class="card h-100 shadow-sm">
                            <div class="card-header bg-light py-2">
                                <strong>{{ grafica.titulo }}</strong>
                                <span class="text-muted small ms-2">Top {{ limiteVista }}</span>
                            </div>
                            <div class="card-body">
                                <div v-if="grafica.items.length === 0" class="text-muted text-center py-3">
                                    Sin datos en el periodo.
                                </div>
                                <div v-for="item in grafica.items" :key="`${grafica.titulo}-${item.clave}`" class="chart-row mb-2">
                                    <div class="chart-label" :title="item.etiqueta">{{ item.etiqueta }}</div>
                                    <div class="chart-track">
                                        <div class="chart-bar chart-bar-pacientes"
                                            :style="{ width: `${porcentajeBarra(item.pacientes, grafica.maxPacientes)}%` }"
                                            :title="`Pacientes: ${item.pacientes}`"></div>
                                        <div class="chart-bar chart-bar-cups"
                                            :style="{ width: `${porcentajeBarra(item.cupsCerrados, grafica.maxCups)}%` }"
                                            :title="`CUPS cerrados: ${item.cupsCerrados}`"></div>
                                    </div>
                                    <div class="chart-meta">
                                        <span>P: {{ item.pacientes }}</span>
                                        <span>C: {{ item.cupsCerrados }}</span>
                                    </div>
                                </div>
                                <div class="chart-legend small text-muted mt-2">
                                    <span class="legend-pacientes">Pacientes cerrados</span>
                                    <span class="legend-cups ms-3">CUPS cerrados</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-12 col-xl-6" v-for="tabla in tablasResumen" :key="tabla.titulo">
                        <div class="card shadow-sm h-100">
                            <div class="card-header bg-light py-2">
                                <strong>{{ tabla.titulo }}</strong>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-sm table-striped mb-0 align-middle">
                                    <thead>
                                        <tr>
                                            <th>{{ tabla.columnaEtiqueta }}</th>
                                            <th class="text-end">Pacientes cerrados</th>
                                            <th class="text-end">CUPS cerrados</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="fila in tabla.filasVisibles" :key="`${tabla.titulo}-${fila.clave}`">
                                            <td>{{ fila.etiqueta }}</td>
                                            <td class="text-end">{{ fila.pacientes }}</td>
                                            <td class="text-end">{{ fila.cupsCerrados }}</td>
                                        </tr>
                                        <tr v-if="tabla.total === 0">
                                            <td colspan="3" class="text-center text-muted py-3">Sin registros</td>
                                        </tr>
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
</template>

<script>
import { mapState } from "vuex";
import * as XLSX from "xlsx";
import {
    appendSheetToWorkbook,
    buildExcelRowsFromObjects,
    formatearValorExcel,
} from "@/utils/excelExport";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import appLogoUrl from "@/assets/images/logo_extramurapp.png";
import esebLogoUrl from "@/assets/images/logo_eseb.png";
import { getInformeCerradosFacturacion } from "@/api/facturacionApi.js";
import { normalizarGruposFacturador } from "@/utils/grupoUtils.js";
import { MENSAJE_RANGO_SIN_DATOS } from "@/utils/informeProfesionalPdf";

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || {};

const LIMITE_VISTA = 10;

export default {
    name: "FacturadorInformes",
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            activacion: false,
            cargando: false,
            limiteVista: LIMITE_VISTA,
            informe: {
                totales: {
                    pacientesCerrados: 0,
                    cupsRegistrados: 0,
                },
                porConvenio: [],
                porEps: [],
            },
        };
    },
    computed: {
        ...mapState(["userData", "dataips"]),
        convenioUsuario() {
            return String(this.userData?.convenio || "").trim();
        },
        gruposFacturadorUsuario() {
            return normalizarGruposFacturador(this.userData?.grupo);
        },
        documentoUsuario() {
            return String(
                this.userData?.numDocumento ||
                this.userData?.num_documento ||
                this.userData?.documento ||
                ""
            ).trim();
        },
        informacionUsuario() {
            return [
                { label: "Facturador", valor: this.userData?.nombre || "-" },
                { label: "Documento", valor: this.documentoUsuario || "-" },
                { label: "Convenio", valor: this.convenioUsuario || "-" },
                { label: "Grupo", valor: this.userData?.grupo || "-" },
                {
                    label: "IPS",
                    valor: String(this.dataips?.nombre || this.userData?.ipsNombre || "-").trim() || "-",
                },
                { label: "Periodo", valor: `${this.fechaInicio} a ${this.fechaFin}` },
                { label: "Generado", valor: this.getGeneratedAtLabel() },
            ];
        },
        tarjetasResumen() {
            const t = this.informe.totales || {};
            return [
                { key: "pacientes", label: "Pacientes cerrados", valor: t.pacientesCerrados || 0 },
                { key: "cups", label: "CUPS cerrados", valor: t.cupsRegistrados || 0 },
            ];
        },
        graficas() {
            return [
                this.crearGrafica("Pacientes y CUPS por convenio", this.informe.porConvenio),
                this.crearGrafica("Pacientes y CUPS por EPS", this.informe.porEps),
            ];
        },
        tablasResumen() {
            return [
                this.crearTabla("Resumen por convenio", "Convenio", this.informe.porConvenio),
                this.crearTabla("Resumen por EPS", "EPS", this.informe.porEps),
            ];
        },
        informeSinDatos() {
            const t = this.informe?.totales || {};
            return (t.pacientesCerrados || 0) === 0 && (t.cupsRegistrados || 0) === 0;
        },
        mensajeRangoSinDatos() {
            return MENSAJE_RANGO_SIN_DATOS;
        },
    },
    methods: {
        crearGrafica(titulo, filas = []) {
            const items = (filas || []).slice(0, this.limiteVista).map((item) => ({
                ...item,
                cupsCerrados: item.cupsRegistrados || 0,
            }));
            const maxPacientes = Math.max(...items.map((item) => item.pacientes || 0), 1);
            const maxCups = Math.max(...items.map((item) => item.cupsCerrados || 0), 1);
            return { titulo, items, maxPacientes, maxCups };
        },
        crearTabla(titulo, columnaEtiqueta, filas = []) {
            const lista = (Array.isArray(filas) ? filas : []).map((fila) => ({
                ...fila,
                cupsCerrados: fila.cupsRegistrados || 0,
            }));
            return {
                titulo,
                columnaEtiqueta,
                total: lista.length,
                filasVisibles: lista,
            };
        },
        porcentajeBarra(valor, maximo) {
            const base = Number(maximo || 0);
            if (!base) return 0;
            return Math.max(4, Math.round((Number(valor || 0) / base) * 100));
        },
        async generarInforme() {
            if (!this.fechaInicio || !this.fechaFin) {
                this.$toast?.error?.("Debe seleccionar fecha inicio y fecha fin");
                return;
            }
            if (this.fechaInicio > this.fechaFin) {
                this.$toast?.error?.("La fecha inicio no puede ser mayor que la fecha fin");
                return;
            }
            if (!this.documentoUsuario) {
                this.$toast?.error?.("No se encontró el documento del facturador");
                return;
            }

            this.cargando = true;
            try {
                const resultado = await getInformeCerradosFacturacion({
                    idFacturador: this.documentoUsuario,
                    fechaInicio: this.fechaInicio,
                    fechaFin: this.fechaFin,
                    convenio: this.convenioUsuario || "",
                    gruposFacturador: this.gruposFacturadorUsuario || "",
                });

                this.informe = {
                    totales: resultado.totales || {},
                    porConvenio: resultado.porConvenio || [],
                    porEps: resultado.porEps || [],
                };
                this.activacion = true;

                if (this.informeSinDatos) {
                    this.$toast?.info?.("No hay datos para el informe en el rango seleccionado");
                }
            } catch (error) {
                console.error("Error generando informe de cuentas:", error);
                this.$toast?.error?.("No se pudo generar el informe");
            } finally {
                this.cargando = false;
            }
        },
        resetInforme() {
            this.activacion = false;
            this.informe = {
                totales: {
                    pacientesCerrados: 0,
                    cupsRegistrados: 0,
                },
                porConvenio: [],
                porEps: [],
            };
        },
        filasExportables(filas = []) {
            return buildExcelRowsFromObjects(
                (filas || []).map((fila) => ({
                    Etiqueta: fila.etiqueta,
                    "Pacientes cerrados": fila.pacientes,
                    "CUPS cerrados": fila.cupsRegistrados || 0,
                })),
                {
                    numericLabels: ["Pacientes cerrados", "CUPS cerrados"],
                }
            );
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
                esebLogoUrl,
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
                        headerLogo
                            ? this.buildPdfLogoNode(headerLogo, [72, 72], { alignment: "center", margin: [0, 0, 0, 4] })
                            : { text: "" },
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
        buildResumenPdfTable(titulo, columnaEtiqueta, filas = []) {
            const body = [
                [columnaEtiqueta, "Pacientes cerrados", "CUPS cerrados"],
                ...(filas || []).map((fila) => [
                    String(fila.etiqueta || ""),
                    String(fila.pacientes || 0),
                    String(fila.cupsRegistrados || 0),
                ]),
            ];

            return [
                { text: titulo, style: "subheader" },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", 90, 90],
                        body,
                    },
                    layout: "lightHorizontalLines",
                    margin: [0, 0, 0, 12],
                },
            ];
        },
        async exportarPdfInforme() {
            if (!this.activacion) {
                this.$toast?.error?.("Debe generar el informe antes de exportar PDF");
                return;
            }

            const logoData = await this.getLogoForPdf();
            const t = this.informe.totales || {};
            const metaRows = this.informacionUsuario.map((item) => [item.label, item.valor]);

            const content = [
                ...(await this.buildPdfHeaderSection(logoData)),
                { text: "Informe de actividades - Facturacion", style: "header" },
                {
                    table: { widths: [130, "*"], body: metaRows },
                    layout: "lightHorizontalLines",
                    margin: [0, 0, 0, 12],
                },
            ];

            if (this.informeSinDatos) {
                content.push({
                    text: MENSAJE_RANGO_SIN_DATOS,
                    style: "emptyMessage",
                    margin: [0, 12, 0, 0],
                });
            } else {
                content.push(
                    { text: "Totales del periodo", style: "subheader" },
                    {
                        table: {
                            widths: ["*", 80],
                            body: [
                                ["Indicador", "Valor"],
                                ["Pacientes cerrados", String(t.pacientesCerrados || 0)],
                                ["CUPS cerrados", String(t.cupsRegistrados || 0)],
                            ],
                        },
                        layout: "lightHorizontalLines",
                        margin: [0, 0, 0, 12],
                    },
                    ...this.buildResumenPdfTable("Resumen por convenio", "Convenio", this.informe.porConvenio),
                    ...this.buildResumenPdfTable("Resumen por EPS", "EPS", this.informe.porEps),
                );
            }

            const usuarioArchivo = String(this.userData?.nombre || "facturador")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "") || "facturador";
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

            pdfMake.createPdf(docDefinition).download(`informe_actividades_${usuarioArchivo}_${rangoArchivo}.pdf`);
        },
        exportarExcel() {
            if (this.informeSinDatos) {
                this.$toast?.error?.("No hay datos para el informe");
                return;
            }

            const t = this.informe.totales || {};
            const libro = XLSX.utils.book_new();
            const resumenRows = [
                ...this.informacionUsuario.map((item) => ({
                    Campo: item.label,
                    Valor: formatearValorExcel(item.valor, { key: "texto", label: "Valor", excelType: "text" }),
                })),
                {
                    Campo: "Pacientes cerrados",
                    Valor: formatearValorExcel(t.pacientesCerrados || 0, {
                        key: "pacientesCerrados",
                        label: "Valor",
                        excelType: "number",
                    }),
                },
                {
                    Campo: "CUPS cerrados",
                    Valor: formatearValorExcel(t.cupsRegistrados || 0, {
                        key: "cupsRegistrados",
                        label: "Valor",
                        excelType: "number",
                    }),
                },
            ];

            appendSheetToWorkbook(libro, {
                rows: resumenRows,
                sheetName: "Resumen",
            });

            const hojas = [
                ["Por convenio", this.informe.porConvenio],
                ["Por EPS", this.informe.porEps],
            ];

            hojas.forEach(([nombre, filas]) => {
                appendSheetToWorkbook(libro, {
                    rows: this.filasExportables(filas),
                    numericLabels: ["Pacientes cerrados", "CUPS cerrados"],
                    sheetName: nombre.slice(0, 31),
                });
            });

            XLSX.writeFile(libro, `informe_actividades_facturacion_${this.fechaInicio}_${this.fechaFin}.xlsx`);
        },
    },
};
</script>

<style scoped>
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
    grid-template-columns: minmax(90px, 28%) 1fr minmax(72px, 18%);
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
    height: 18px;
    background: #eef2f7;
    border-radius: 999px;
    overflow: hidden;
}

.chart-bar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    border-radius: 999px;
    min-width: 2px;
}

.chart-bar-pacientes {
    background: rgba(14, 165, 233, 0.55);
    z-index: 1;
}

.chart-bar-cups {
    background: rgba(34, 197, 94, 0.75);
    z-index: 2;
    mix-blend-mode: multiply;
}

.chart-meta {
    display: flex;
    flex-direction: column;
    font-size: 0.72rem;
    color: #475569;
    line-height: 1.2;
}

.legend-pacientes::before,
.legend-cups::before {
    content: "";
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 0.35rem;
    vertical-align: middle;
}

.legend-pacientes::before {
    background: rgba(14, 165, 233, 0.8);
}

.legend-cups::before {
    background: rgba(34, 197, 94, 0.85);
}
</style>

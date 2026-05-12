<template>
    <div class="informes-page w-100 px-2 px-md-4 py-3">
        <h1>Medico Informes</h1>

        <hr>

        <div class="row g-3">
            <div class="col-12 col-lg-3 col-xl-2" v-if="!activacion">
                <div class="container-fluid p-0 informe-filter-card">
                    <h5>Seleccione el rango de fechas a mostrar</h5>
                    <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                    <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
                    <label for="fechaFin" class="form-label">Fecha de Fin</label>
                    <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
                    <label for="tipoInformeMed" class="form-label mt-2">Tipo de informe</label>
                    <select id="tipoInformeMed" v-model="tipoInforme" class="form-select">
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
                <div v-if="activacion" class="informe-toolbar d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-2 mb-2">
                    <div class="informe-actions d-flex flex-column flex-sm-row flex-wrap gap-2 align-items-stretch align-items-sm-center">
                        <button class="btn btn-primary" @click="copiarTabla">
                            <i class="bi bi-clipboard"></i> Copiar tabla
                        </button>
                        <button class="btn btn-danger" @click="exportarPdfInforme">
                            <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                        </button>
                        <button class="btn btn-secondary" @click="resetInforme">
                            Nuevo informe
                        </button>
                        <span class="text-muted informe-count">
                            Mostrando {{ registroInicio }} - {{ registroFin }} de {{ totalRegistros }} registros
                        </span>
                    </div>
                    <div class="informe-page-size d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                        <label class="me-2 mb-0">Registros por pagina:</label>
                        <select v-model.number="itemsPorPagina" class="form-select form-select-sm" style="width: auto;">
                            <option :value="10">10</option>
                            <option :value="25">25</option>
                            <option :value="50">50</option>
                            <option :value="100">100</option>
                            <option :value="totalRegistros">Todos</option>
                        </select>
                    </div>
                </div>
                <div v-if="activacion" class="alert alert-light border mb-3">
                    <h5 class="mb-1">{{ tipoInformeLabel }}</h5>
                    <div><strong>Tipo:</strong> {{ tipoInformeLabel }}</div>
                    <div><strong>Rango:</strong> {{ fechaInicio || "-" }} a {{ fechaFin || "-" }}</div>
                    <div><strong>Usuario:</strong> {{ userData?.nombre || "-" }}</div>
                    <div><strong>Convenio:</strong> {{ userData?.convenio || "-" }}</div>
                    <div><strong>Grupo:</strong> {{ userData?.grupo || "-" }}</div>
                </div>
                <div class="table-responsive informe-table-scroll" v-if="activacion && tipoInforme === '1'" style="max-height: 60vh; overflow-y: auto;">
                    <table class="table table-bordered table-striped table-sm informe-wide-table"
                        style="border-collapse: collapse; width: 100%">
                        <thead>
                            <tr>
                                <th colspan="5" style="background: #d0e6f7">DATOS DE IPS</th>
                                <th colspan="7" style="background: #d0e6f7">DATOS DEL USUARIO</th>
                                <th colspan="11" style="background: #4aed31ff">TIPO ACTIVIDAD REALIZADA</th>
                                <th colspan="6" style="background: #d0e6f7">POBLACION DE RIESGO</th>
                                <th colspan="1" style="background: #d0e6f7">REQUIERE REMISION</th>
                                <th colspan="3" style="background: #d0e6f7">ENCUESTADOR</th>
                            </tr>
                            <tr>
                                <th>DPTO</th>
                                <th>MUNICIPIO</th>
                                <th>NOMBRE</th>
                                <th>CODIGO</th>
                                <th>FECHA</th>
                                <th>NOMBRE DEL USUARIO</th>
                                <th>TIPO ID</th>
                                <th>NUMERO ID</th>
                                <th>DIRECCION DEL USUARIO</th>
                                <th>TELEFONO DE USUARIO</th>
                                <th>BARRIO/VEREDA</th>
                                <th>DESPLAZAMIENTO EFECTIVO (Si/No)</th>
                                <th v-for="col in columnasTipoActividad" :key="col" style="writing-mode: vertical-lr">
                                    {{ col }}
                                </th>
                                <th v-for="col in columnasPoblacionRiesgo" :key="col" style="writing-mode: vertical-lr">
                                    {{ col }}
                                </th>
                                <th style="writing-mode: vertical-lr">
                                    REQUIERE REMISION A PROCEDIMIENTOS (Si/No)
                                </th>
                                <th style="writing-mode: vertical-lr">NOMBRE</th>
                                <th style="writing-mode: vertical-lr">CARGO</th>
                                <th style="writing-mode: vertical-lr">DOCUMENTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="usuario in encuestasPaginadas" :key="usuario.id">
                                <td>{{ dataips.dpto }}</td>
                                <td>{{ dataips.municipio }}</td>
                                <td>{{ dataips.nombre }}</td>
                                <td>{{ dataips.codHab }}</td>
                                <td>{{ formatearFechaYYYYMMDD(usuario.fecha) }}</td>
                                <td>
                                    {{ usuario.nombre1 }} {{ usuario.nombre2 }} {{ usuario.apellido1 }}
                                    {{ usuario.apellido2 }}
                                </td>
                                <td>{{ usuario.tipodoc }}</td>
                                <td>{{ usuario.numdoc }}</td>
                                <td>{{ usuario.direccion }}</td>
                                <td>{{ usuario.telefono }}</td>
                                <td>{{ usuario.barrioVeredacomuna?.barrio }}</td>
                                <td>{{ usuario.desplazamiento }}</td>
                                <td v-for="col in columnasTipoActividad" :key="col" style="text-align: center">
                                    <span v-if="actividadRealizada(usuario, col)">X</span>
                                </td>
                                <td v-for="col in columnasPoblacionRiesgo" :key="col" style="text-align: center">
                                    <span
                                        v-if="usuario.poblacionRiesgo && usuario.poblacionRiesgo.includes(col)">X</span>
                                </td>
                                <td style="text-align: center">{{ usuario.requiereRemision }}</td>
                                <td>{{ userData.nombre }}</td>
                                <td>{{ userData.cargo }}</td>
                                <td>{{ userData.numDocumento }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-if="activacion && tipoInforme === '2'" class="mt-3">
                    <div class="row g-3 mb-3">
                        <div class="col-12 col-md-3"><div class="alert alert-primary mb-0"><strong>Total pacientes:</strong> {{ resumenActividades.totalPacientes }}</div></div>
                        <div class="col-12 col-md-3"><div class="alert alert-info mb-0"><strong>Total actividades:</strong> {{ resumenActividades.totalActividades }}</div></div>
                        <div class="col-12 col-md-3"><div class="alert alert-success mb-0"><strong>Total CUPS:</strong> {{ resumenActividades.totalCups }}</div></div>
                    </div>
                    <div class="row g-3">
                        <div class="col-12 col-lg-6">
                            <h6>Actividades aplicadas (cantidad)</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-bordered">
                                    <thead><tr><th>Actividad</th><th>Cantidad</th></tr></thead>
                                    <tbody>
                                        <tr v-for="item in resumenActividades.actividades" :key="`act-${item.nombre}`">
                                            <td>{{ item.nombre }}</td>
                                            <td>{{ item.cantidad }}</td>
                                        </tr>
                                        <tr v-if="resumenActividades.actividades.length === 0"><td colspan="2">Sin datos</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <h6>CUPS vs cantidad aplicada</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-bordered">
                                    <thead><tr><th>CUPS</th><th>Cantidad</th></tr></thead>
                                    <tbody>
                                        <tr v-for="item in resumenActividades.cups" :key="`cup-${item.nombre}`">
                                            <td>{{ item.nombre }}</td>
                                            <td>{{ item.cantidad }}</td>
                                        </tr>
                                        <tr v-if="resumenActividades.cups.length === 0"><td colspan="2">Sin datos</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="activacion && tipoInforme === '3'" class="mt-3">
                    <div class="row g-3 mb-3">
                        <div class="col-12 col-md-3"><div class="alert alert-primary mb-0"><strong>Total pacientes:</strong> {{ resumenFacturacion.totalPacientes }}</div></div>
                        <div class="col-12 col-md-3"><div class="alert alert-success mb-0"><strong>Total CUPS:</strong> {{ resumenFacturacion.totalCups }}</div></div>
                    </div>
                    <div class="table-responsive informe-table-scroll" style="max-height: 60vh; overflow-y: auto;">
                        <table class="table table-bordered table-striped table-sm informe-facturacion-table" style="border-collapse: collapse; width: 100%">
                            <thead>
                                <tr>
                                    <th>Fecha cierre facturacion</th>
                                    <th>Tipo ID</th>
                                    <th>Numero ID</th>
                                    <th>Paciente</th>
                                    <th>EPS</th>
                                    <th>Convenio</th>
                                    <th>Codigo CUPS</th>
                                    <th>Nombre CUPS</th>
                                    <th>Cantidad</th>
                                    <th>Numero factura</th>
                                    <th>Profesional CUPS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in encuestasPaginadas" :key="row.asignacionCupId || `${row.encuestaId}-${row.cupsId}-${row.numeroFactura}`">
                                    <td>{{ formatearFechaYYYYMMDD(row.fechaCierreFacturacion) }}</td>
                                    <td>{{ row.tipodoc }}</td>
                                    <td>{{ row.numdoc }}</td>
                                    <td>{{ nombrePaciente(row) }}</td>
                                    <td>{{ row.eps }}</td>
                                    <td>{{ row.convenio }}</td>
                                    <td>{{ row.cupsCodigo }}</td>
                                    <td>{{ row.cupsNombre }}</td>
                                    <td>{{ row.cantidad || 1 }}</td>
                                    <td>{{ row.numeroFactura }}</td>
                                    <td>{{ row.profesionalNombreCup || userData?.nombre }}</td>
                                </tr>
                                <tr v-if="encuestasPaginadas.length === 0">
                                    <td colspan="11" class="text-center">Sin datos</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <nav v-if="activacion && ['1', '3'].includes(tipoInforme) && totalPaginas > 1" aria-label="Paginacion" class="mt-3">
                    <ul class="pagination justify-content-center flex-wrap gap-1">
                        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(1)">
                                <i class="bi bi-chevron-double-left"></i>
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual - 1)">
                                <i class="bi bi-chevron-left"></i>
                            </a>
                        </li>
                        <li v-for="pagina in paginasVisibles" :key="pagina" class="page-item"
                            :class="{ active: pagina === paginaActual }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(pagina)">{{ pagina }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(paginaActual + 1)">
                                <i class="bi bi-chevron-right"></i>
                            </a>
                        </li>
                        <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
                            <a class="page-link" href="#" @click.prevent="cambiarPagina(totalPaginas)">
                                <i class="bi bi-chevron-double-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
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

.informe-wide-table {
    min-width: 1180px;
}

.informe-facturacion-table {
    min-width: 980px;
}

.informe-count {
    align-self: center;
}

@media (max-width: 575.98px) {
    .informes-page h1 {
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
import realtime_api from "@/api/realtimeApi";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import appLogoUrl from "@/assets/images/logo_extramurapp.png";
import esebLogoUrl from "@/assets/images/logo_eseb.png";

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
                "Menor a 5 anos",
                "Discapacidad",
                "Adulto mayor",
                "Orientacion sexual diversa",
                "Grupo etnico",
            ],
        };
    },
    methods: {
        copiarTabla() {
            const tabla = this.$el.querySelector("table");
            if (!tabla) return;
            let texto = '';
            const filas = tabla.querySelectorAll('tr');
            filas.forEach(fila => {
                let celdas = Array.from(fila.querySelectorAll('th,td'));
                texto += celdas.map(celda => celda.innerText.replace(/\n/g, ' ')).join('\t') + '\n';
            });
            if (navigator.clipboard) {
                navigator.clipboard.writeText(texto).then(() => {
                    alert('Tabla copiada al portapapeles');
                });
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = texto;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert('Tabla copiada al portapapeles');
            }
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
        buildPacientesCerradosPdfTable() {
            const headers = [
                "DPTO",
                "MUNICIPIO",
                "NOMBRE",
                "CODIGO",
                "FECHA",
                "NOMBRE DEL USUARIO",
                "TIPO ID",
                "NUMERO ID",
                "DIRECCION DEL USUARIO",
                "TELEFONO DE USUARIO",
                "BARRIO/VEREDA",
                "DESPLAZAMIENTO EFECTIVO (Si/No)",
                ...this.columnasTipoActividad,
                ...this.columnasPoblacionRiesgo,
                "REQUIERE REMISION A PROCEDIMIENTOS (Si/No)",
                "NOMBRE",
                "CARGO",
                "DOCUMENTO",
            ];

            const body = [
                [
                    { text: "DATOS DE IPS", colSpan: 5, fillColor: "#d0e6f7", bold: true }, {}, {}, {}, {},
                    { text: "DATOS DEL USUARIO", colSpan: 7, fillColor: "#d0e6f7", bold: true }, {}, {}, {}, {}, {}, {},
                    { text: "TIPO ACTIVIDAD REALIZADA", colSpan: this.columnasTipoActividad.length, fillColor: "#4aed31", bold: true },
                    ...Array(Math.max(this.columnasTipoActividad.length - 1, 0)).fill({}),
                    { text: "POBLACION DE RIESGO", colSpan: this.columnasPoblacionRiesgo.length, fillColor: "#d0e6f7", bold: true },
                    ...Array(Math.max(this.columnasPoblacionRiesgo.length - 1, 0)).fill({}),
                    { text: "REQUIERE REMISION", fillColor: "#d0e6f7", bold: true },
                    { text: "ENCUESTADOR", colSpan: 3, fillColor: "#d0e6f7", bold: true }, {}, {},
                ],
                headers,
                ...(this.encuestasFiltradas || []).map((row) => [
                    this.dataips?.dpto || "",
                    this.dataips?.municipio || "",
                    this.dataips?.nombre || "",
                    this.dataips?.codHab || "",
                    this.formatearFechaYYYYMMDD(row?.fecha),
                    this.nombrePaciente(row),
                    row?.tipodoc || "",
                    row?.numdoc || "",
                    row?.direccion || "",
                    row?.telefono || "",
                    row?.barrioVeredacomuna?.barrio || row?.barrioVeredacomuna || "",
                    row?.desplazamiento || "",
                    ...this.columnasTipoActividad.map((col) => this.actividadRealizada(row, col) ? "X" : ""),
                    ...this.columnasPoblacionRiesgo.map((col) => row?.poblacionRiesgo && String(row.poblacionRiesgo).includes(col) ? "X" : ""),
                    row?.requiereRemision || "",
                    this.userData?.nombre || "",
                    this.userData?.cargo || "",
                    this.userData?.numDocumento || "",
                ]),
            ];

            const widths = headers.map((_, index) => {
                const header = headers[index];
                if (["NOMBRE DEL USUARIO", "DIRECCION DEL USUARIO", "BARRIO/VEREDA"].includes(header)) return 52;
                if ([...this.columnasTipoActividad, ...this.columnasPoblacionRiesgo].includes(header)) return 24;
                return 38;
            });

            return {
                table: { headerRows: 2, widths, body },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 8],
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
            ];

            if (this.tipoInforme === "2") {
                content.push(
                    { text: `Total pacientes: ${this.resumenActividades.totalPacientes}`, margin: [0, 0, 0, 3] },
                    { text: `Total actividades: ${this.resumenActividades.totalActividades}`, margin: [0, 0, 0, 3] },
                    { text: `Total CUPS: ${this.resumenActividades.totalCups}`, margin: [0, 0, 0, 10] },
                    { text: "Actividades aplicadas", style: "subheader" },
                    {
                        table: {
                            headerRows: 1,
                            widths: ["*", 90],
                            body: [["Actividad", "Cantidad"], ...this.resumenActividades.actividades.map((item) => [item.nombre, String(item.cantidad)])],
                        },
                        layout: "lightHorizontalLines",
                        margin: [0, 0, 0, 10],
                    },
                    { text: "CUPS vs cantidad aplicada", style: "subheader" },
                    {
                        table: {
                            headerRows: 1,
                            widths: ["*", 90],
                            body: [["CUPS", "Cantidad"], ...this.resumenActividades.cups.map((item) => [item.nombre, String(item.cantidad)])],
                        },
                        layout: "lightHorizontalLines",
                    }
                );
            } else if (this.tipoInforme === "3") {
                content.push(
                    { text: "Pacientes facturados/CUPS", style: "subheader" },
                    { text: `Total pacientes: ${this.resumenFacturacion.totalPacientes}`, margin: [0, 0, 0, 3] },
                    { text: `Total CUPS: ${this.resumenFacturacion.totalCups}`, margin: [0, 0, 0, 10] },
                    {
                        table: {
                            headerRows: 1,
                            widths: [50, 32, 45, "*", 50, 55, 45, "*", 32, 50, 60],
                            body: [
                                ["Fecha cierre facturacion", "Tipo ID", "Numero ID", "Paciente", "EPS", "Convenio", "Codigo CUPS", "Nombre CUPS", "Cantidad", "Numero factura", "Profesional CUPS"],
                                ...(this.encuestasFiltradas || []).map((row) => [
                                    this.formatearFechaYYYYMMDD(row?.fechaCierreFacturacion),
                                    String(row?.tipodoc || ""),
                                    String(row?.numdoc || ""),
                                    this.nombrePaciente(row),
                                    String(row?.eps || ""),
                                    String(row?.convenio || ""),
                                    String(row?.cupsCodigo || ""),
                                    String(row?.cupsNombre || ""),
                                    String(row?.cantidad || 1),
                                    String(row?.numeroFactura || ""),
                                    String(row?.profesionalNombreCup || this.userData?.nombre || ""),
                                ]),
                            ],
                        },
                        layout: "lightHorizontalLines",
                    }
                );
            } else {
                content.push(
                    { text: "Pacientes cerrados", style: "subheader" },
                    { text: `Total pacientes: ${this.totalRegistros}`, margin: [0, 0, 0, 3] },
                    { text: `Total CUPS: ${this.resumenActividades.totalCups}`, margin: [0, 0, 0, 10] },
                    this.buildPacientesCerradosPdfTable()
                );
            }

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
                pageSize: ["1", "3"].includes(this.tipoInforme) ? "A3" : "A4",
                pageOrientation: ["1", "3"].includes(this.tipoInforme) ? "landscape" : "portrait",
                pageMargins: ["1", "3"].includes(this.tipoInforme) ? [18, 18, 18, 18] : [26, 26, 26, 26],
                ...(logoData ? { background: this.buildPdfWatermark(logoData) } : {}),
                content,
                styles: {
                    header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
                    subheader: { fontSize: 12, bold: true, margin: [0, 6, 0, 6] },
                    ipsHeaderName: { fontSize: 13, bold: true },
                },
                defaultStyle: { fontSize: ["1", "3"].includes(this.tipoInforme) ? 5 : 9 },
            };

            pdfMake.createPdf(docDefinition).download(`${tipoArchivo}_${usuarioArchivo}_${rangoArchivo}.pdf`);
        },
        ...mapActions(["GetAllRegistersbyRangeMed", "GetInformeFacturacionProfesional", "getAllActividadesExtra", "getdataips"]),

        async cargarDatosIps() {
            try {
                await this.getdataips(this.idips || null);
            } catch (error) {
                console.error("Error cargando datos IPS en informe medico:", error);
            }
        },

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
                    await this.GetAllRegistersbyRangeMed(rango);
                    await this.getAllActividadesExtra();
                    await this.cargarActividadesPorEncuesta();
                }
                this.paginaActual = 1;
                this.activacion = true;
            } catch (error) {
                console.error("Error al generar informe medico:", error);
                alert("No fue posible generar el informe. " + (error?.message || ""));
            }
        },
        resetInforme() {
            this.fechaInicio = "";
            this.fechaFin = "";
            this.paginaActual = 1;
            this.itemsPorPagina = 25;
            this.activacion = false;
            this.cupsPorEncuesta = {};
            this.tipoInforme = "1";
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
        async cargarActividadesPorEncuesta() {
            const mapa = {};
            const cupsMap = {};
            const encuestas = this.encuestasFiltradas || [];
            const cargoActual = String(this.userData?.cargo || "").trim();
            const nombreActual = String(this.userData?.nombre || "").trim().toLowerCase();

            await Promise.all(
                encuestas.map(async (encuesta) => {
                    try {
                        const { data } = await realtime_api.get(`/Asignaciones/${encuesta.id}.json`, {
                            params: { _ts: Date.now() },
                            headers: {
                                "Cache-Control": "no-cache, no-store, must-revalidate",
                                Pragma: "no-cache",
                                Expires: "0",
                            },
                        });
                        const cups = data?.cups && typeof data.cups === "object"
                            ? Object.values(data.cups).filter(Boolean)
                            : [];

                        // Solo considerar CUPS agregados por este médico.
                        const cupsDelMedico = cups.filter((cup) => {
                            const cargoCup = String(cup?.key || "").trim();
                            if (cargoCup !== cargoActual) return false;

                            const nombreCup = String(cup?.nombreProf || "").trim().toLowerCase();
                            if (!nombreActual || !nombreCup) return true;

                            return nombreCup === nombreActual;
                        });
                        cupsMap[encuesta.id] = cupsDelMedico;

                        const actividadIds = cupsDelMedico
                            .map((cup) => cup?.actividadId ?? cup?.idActividad)
                            .filter(Boolean);

                        const nombresActividades = Array.from(new Set(actividadIds))
                            .map((idActividad) => this.obtenerNombreActividadExtra(idActividad))
                            .filter(Boolean);

                        mapa[encuesta.id] = nombresActividades;
                    } catch (error) {
                        mapa[encuesta.id] = [];
                        cupsMap[encuesta.id] = [];
                    }
                })
            );

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
        ...mapState(["encuestasFiltradas", "dataips", "userData", "uid", "actividadesExtra"]),
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
        totalPaginas() {
            return Math.ceil(this.totalRegistros / this.itemsPorPagina);
        },
        encuestasPaginadas() {
            const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
            const fin = inicio + this.itemsPorPagina;
            return this.encuestasFiltradas?.slice(inicio, fin) || [];
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
            const rango = 2;
            let inicio = Math.max(1, this.paginaActual - rango);
            let fin = Math.min(this.totalPaginas, this.paginaActual + rango);

            if (this.paginaActual <= rango) {
                fin = Math.min(this.totalPaginas, rango * 2 + 1);
            }
            if (this.paginaActual >= this.totalPaginas - rango) {
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
    },
    watch: {
        itemsPorPagina() {
            this.paginaActual = 1;
        }
    },
    async mounted() {
        this.$store.commit("setEncuestasfiltradas", []);
        await this.cargarDatosIps();
    }
};
</script>

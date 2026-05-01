<template>
    <div class="container-fluid">

        <h1>Informes Enfermero</h1>

        <hr>

        <h5>Seleccione el rango de fechas a mostrar</h5>
        <div class="row">
            <div class="col-6 col-md-4">
                <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                <input type="date" id="fechaInicio" class="form-control" v-model="fechaInicio" required />
            </div>
            <div class="col-6 col-md-4">
                <label for="fechaFin" class="form-label">Fecha de Fin</label>
                <input type="date" id="fechaFin" class="form-control" v-model="fechaFin" required />
            </div>
            <div class="col-6 col-md-4">
                <label for="tipoInformeEnf" class="form-label">Tipo de informe</label>
                <select id="tipoInformeEnf" v-model="tipoInforme" class="form-select">
                    <option value="1">Pacientes cerrados</option>
                    <option value="2">Actividades</option>
                </select>
            </div>
            <div class="col-12 col-md-4">
                <button type="button" class="btn btn-warning mt-4" @click="generarInforme()">
                    Generar Informe
                </button>
            </div>
        </div>

        <button class="btn btn-primary mb-2" v-if="activacion" @click="copiarTabla">
            <i class="bi bi-clipboard"></i> Copiar tabla
        </button>
        <button class="btn btn-danger mb-2 ms-2" v-if="activacion" @click="exportarPdfInforme">
            <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
        </button>
        <br />
        <div v-if="activacion" class="alert alert-light border mb-3">
            <h5 class="mb-1">Informe de actividades</h5>
            <div><strong>Tipo:</strong> {{ tipoInformeLabel }}</div>
            <div><strong>Rango:</strong> {{ fechaInicio || "-" }} a {{ fechaFin || "-" }}</div>
            <div><strong>Usuario:</strong> {{ userData?.nombre || "-" }}</div>
            <div><strong>Convenio:</strong> {{ userData?.convenio || "-" }}</div>
            <div><strong>Grupo:</strong> {{ userData?.grupo || "-" }}</div>
        </div>
        <div class="table-responsive" v-if="activacion && tipoInforme === '1'" style="max-height: 70vh; overflow-y: auto;">
            <table class="table table-bordered table-striped table-sm" style="border-collapse: collapse; width: 100%">
                <thead>
                    <tr>
                        <th colspan="5" style="background: #d0e6f7">DATOS DE IPS</th>
                        <th colspan="7" style="background: #d0e6f7">DATOS DEL USUARIO</th>
                        <th colspan="11" style="background: #4aed31ff">TIPO ACTIVIDAD REALIZADA</th>
                        <th colspan="6" style="background: #d0e6f7">POBLACIÓN DE RIESGO</th>
                        <th colspan="1" style="background: #d0e6f7">REQUIERE REMISION</th>
                        <th colspan="3" style="background: #d0e6f7">ENCUESTADOR</th>
                    </tr>
                    <tr>
                        <th>DPTO</th>
                        <th>MUNICIPIO</th>
                        <th>NOMBRE</th>
                        <th>CODIGO</th>
                        <th>FECHA</th>
                        <!--  -->
                        <th>NOMBRE DEL USUARIO</th>
                        <th>TIPO ID</th>
                        <th>NUMERO ID</th>
                        <th>DIRECCION DEL USUARIO</th>
                        <th>TELEFONO DE USUARIO</th>
                        <th>BARRIO/VEREDA</th>
                        <th>DESPLAZAMIENTO EFECTIVO (Si/No)</th>
                        <!-- TIPO ACTIVIDAD -->
                        <th v-for="col in columnasTipoActividad" :key="col" style="writing-mode: vertical-lr">
                            {{ col }}
                        </th>
                        <!-- POBLACIÓN DE RIESGO -->
                        <th v-for="col in columnasPoblacionRiesgo" :key="col" style="writing-mode: vertical-lr">
                            {{ col }}
                        </th>
                        <!-- REMISION -->
                        <th style="writing-mode: vertical-lr">
                            REQUIERE REMISION A PROCEDIMIENTOS (Si/No)
                        </th>
                        <th style="writing-mode: vertical-lr">NOMBRE</th>
                        <th style="writing-mode: vertical-lr">CARGO</th>
                        <th style="writing-mode: vertical-lr">DOCUMENTO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="usuario in encuestasFiltradas" :key="usuario.id">
                        <td>{{ dataips.dpto }}</td>
                        <td>{{ dataips.municipio }}</td>
                        <td>{{ dataips.nombre }}</td>
                        <td>{{ dataips.codHab }}</td>
                        <td>{{ formatearFechaYYYYMMDD(usuario.fecha) }}</td>
                        <!-- DATOS DEL USUARIO -->
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
                        <!-- TIPO ACTIVIDAD REALIZADA -->
                        <td v-for="col in columnasTipoActividad" :key="col" style="text-align: center">
                            <span v-if="actividadRealizada(usuario, col)">X</span>
                        </td>
                        <!-- POBLACIÓN DE RIESGO -->
                        <td v-for="col in columnasPoblacionRiesgo" :key="col" style="text-align: center">
                            <span v-if="usuario.poblacionRiesgo && usuario.poblacionRiesgo.includes(col)">X</span>
                        </td>
                        <!-- REMISION -->
                        <td style="text-align: center">{{ usuario.requiereRemision }}</td>
                        <!-- ENCUESTADOR -->
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
    </div>
</template>

<script>
import {
    mapState,
    mapActions
} from "vuex";
import realtime_api from "@/api/realtimeApi";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

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
        ...mapActions(["GetAllRegistersbyRangeEnf", "getAllActividadesExtra", "getdataips"]),

        copiarTabla() {
            // Selecciona la tabla por referencia
            const tabla = this.$el.querySelector("table");
            if (!tabla) return;
            let texto = '';
            // Encabezados
            const filas = tabla.querySelectorAll('tr');
            filas.forEach(fila => {
                let celdas = Array.from(fila.querySelectorAll('th,td'));
                texto += celdas.map(celda => celda.innerText.replace(/\n/g, ' ')).join('\t') + '\n';
            });
            // Copiar al portapapeles
            if (navigator.clipboard) {
                navigator.clipboard.writeText(texto).then(() => {
                    alert('Tabla copiada al portapapeles');
                });
            } else {
                // Fallback para navegadores antiguos
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
        async getLogoDataUrlForPdf() {
            const logo = String(this.dataips?.logoUrl || this.dataips?.logo_url || "").trim();
            if (!logo) return null;
            if (logo.startsWith("data:image/")) return logo;
            try {
                const response = await fetch(logo);
                if (!response.ok) return null;
                const blob = await response.blob();
                return await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result || ""));
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (_error) {
                return null;
            }
        },
        async buildPdfHeaderSection() {
            const ipsNombre = String(this.dataips?.nombre || this.userData?.ipsNombre || "IPS").trim() || "IPS";
            const logoDataUrl = await this.getLogoDataUrlForPdf();
            const leftColumn = logoDataUrl
                ? { image: logoDataUrl, fit: [44, 44], margin: [0, 0, 8, 0] }
                : { text: " ", width: 0 };
            return [
                {
                    columns: [
                        { width: 52, ...leftColumn },
                        { width: "*", text: ipsNombre, style: "ipsHeaderName", margin: [0, 10, 0, 0] },
                    ],
                    margin: [0, 0, 0, 8],
                },
            ];
        },
        async exportarPdfInforme() {
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
                ...(await this.buildPdfHeaderSection()),
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
            } else {
                content.push(
                    { text: "Pacientes cerrados", style: "subheader" },
                    {
                        table: {
                            headerRows: 1,
                            widths: [70, "*", 90],
                            body: [
                                ["Documento", "Paciente", "Fecha"],
                                ...(this.encuestasFiltradas || []).map((row) => [
                                    String(row?.numdoc || ""),
                                    `${row?.nombre1 || ""} ${row?.nombre2 || ""} ${row?.apellido1 || ""} ${row?.apellido2 || ""}`.trim(),
                                    this.formatearFechaYYYYMMDD(row?.fecha),
                                ]),
                            ],
                        },
                        layout: "lightHorizontalLines",
                    }
                );
            }

            const tipoArchivo = this.tipoInforme === "2" ? "actividades" : "pacientes_cerrados";
            const usuarioArchivo = String(this.userData?.nombre || "usuario")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "") || "usuario";
            const rangoArchivo = `${this.fechaInicio || "sin_inicio"}_a_${this.fechaFin || "sin_fin"}`;

            pdfMake.createPdf({
                pageSize: "A4",
                pageMargins: [26, 26, 26, 26],
                content,
                styles: {
                    header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
                    subheader: { fontSize: 12, bold: true, margin: [0, 6, 0, 6] },
                    ipsHeaderName: { fontSize: 13, bold: true },
                },
                defaultStyle: { fontSize: 9 },
            }).download(`${tipoArchivo}_${usuarioArchivo}_${rangoArchivo}.pdf`);
        },

        async cargarDatosIps() {
            try {
                await this.getdataips(this.idips || null);
            } catch (error) {
                console.error("Error cargando datos IPS en informe enfermero:", error);
            }
        },

        /* metodo para cargar los datos del profesional, y los datos de la ips */
        async generarInforme() {
            let rango = {
                fechaInicio: this.fechaInicio,
                fechaFin: this.fechaFin,
                idempleado: this.userData.numDocumento,
                cargo: this.userData.cargo,
            };
            await this.cargarDatosIps();
            await this.GetAllRegistersbyRangeEnf(rango);
            await this.getAllActividadesExtra();
            await this.cargarActividadesPorEncuesta();
            this.activacion = true;
        },
        async cargarActividadesPorEncuesta() {
            const mapa = {};
            const cupsMap = {};
            const encuestas = this.encuestasFiltradas || [];
            const cargoActual = this.normalizarTexto(this.userData?.cargo || "");
            const nombreActual = this.normalizarTexto(this.userData?.nombre || "");
            const documentoActual = String(this.userData?.numDocumento || "").trim();

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

                        const cupsDelProfesional = cups.filter((cup) => {
                            const cargoCup = this.normalizarTexto(cup?.key || "");
                            if (!cargoActual || cargoCup !== cargoActual) return false;

                            const documentoCup = String(cup?.idProf ?? cup?.idProfesional ?? "").trim();
                            if (documentoActual && documentoCup) return documentoCup === documentoActual;

                            const nombreCup = this.normalizarTexto(cup?.nombreProf || "");
                            if (nombreActual && nombreCup) return nombreCup === nombreActual;

                            return false;
                        });

                        cupsMap[encuesta.id] = cupsDelProfesional;

                        const actividadIds = cupsDelProfesional
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
        }

    },
    computed: {
        ...mapState(["encuestasFiltradas", "dataips", "userData", "actividadesExtra"]),
        tipoInformeLabel() {
            return this.tipoInforme === "2" ? "Actividades" : "Pacientes cerrados";
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
                totalPacientes: (this.encuestasFiltradas || []).length,
                totalActividades: actividades.reduce((acc, item) => acc + item.cantidad, 0),
                totalCups,
                actividades,
                cups,
            };
        },
    },

    async mounted() {
        this.$store.commit("setEncuestasfiltradas", []);
        await this.cargarDatosIps();
    },

};
</script>

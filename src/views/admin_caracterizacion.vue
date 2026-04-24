<template>
    <div class="container-fluid mt-3 admin-caracterizacion">
        <h4><i class="bi bi-card-checklist"></i> Informe de caracterización</h4>
        <hr>

        <div class="row g-3 align-items-end mb-3 formulario-informe">
            <div class="col-12 col-md-3">
                <label for="fechaInicio" class="form-label">Fecha de Inicio</label>
                <input id="fechaInicio" v-model="fechaInicio" type="date" class="form-control" required />
            </div>
            <div class="col-12 col-md-3">
                <label for="fechaFin" class="form-label">Fecha de Fin</label>
                <input id="fechaFin" v-model="fechaFin" type="date" class="form-control" required />
            </div>
            <div class="col-12 col-md-3">
                <label for="convenioInforme" class="form-label">Convenio</label>
                <select id="convenioInforme" v-model="convenioInforme" class="form-select">
                    <option value="">Todos</option>
                    <option v-for="convenio in conveniosDisponibles" :key="convenio" :value="convenio">
                        {{ convenio }}
                    </option>
                </select>
            </div>
            <div class="col-12 col-md-3 d-flex gap-2">
                <button type="button" class="btn btn-warning w-100" :disabled="cargando" @click="generarInforme">
                    <i class="bi bi-clipboard2-data"></i> Generar Informe
                </button>
                <button
                    v-if="tieneResultados"
                    type="button"
                    class="btn btn-outline-success"
                    :disabled="cargando"
                    @click="exportarExcel">
                    <i class="bi bi-file-earmark-excel"></i>
                </button>
            </div>
        </div>

        <div v-if="cargando" class="progress-card shadow-sm mb-3">
            <div class="h6 mb-3">Generando informe de caracterización</div>
            <div class="progress mb-2" role="progressbar" aria-label="Generando informe de caracterización"
                aria-valuemin="0" aria-valuemax="100" style="height: 18px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
                    Procesando...
                </div>
            </div>
            <div class="text-muted small">Consultando y organizando la información del reporte.</div>
        </div>

        <div v-if="tieneResultados" class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge bg-primary">Registros: {{ filasInforme.length }}</span>
            <span class="badge bg-secondary">Rango: {{ fechaInicio }} a {{ fechaFin }}</span>
            <span class="badge bg-secondary">Convenio: {{ convenioInforme || 'Todos' }}</span>
        </div>

        <div v-if="tieneResultados" class="table-responsive tabla-informe-wrap">
            <table class="table table-sm table-bordered table-striped align-middle mb-0 tabla-informe">
                <thead class="table-light sticky-top">
                    <tr>
                        <th v-for="col in columnasTabla" :key="col.key">{{ col.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="fila in filasInforme" :key="fila.rowKey">
                        <td v-for="col in columnasTabla" :key="`${fila.rowKey}-${col.key}`">
                            {{ fila[col.key] }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else-if="consultado && !cargando" class="alert alert-secondary shadow-sm">
            No se encontraron caracterizaciones en el rango y convenio seleccionados.
        </div>
    </div>
</template>

<script>
import realtime_api from "@/api/realtimeApi";
import * as XLSX from "xlsx";

const COLUMNAS_BASE = [
    { key: "fecha", label: "Fecha" },
    { key: "convenio", label: "Convenio" },
    { key: "grupo", label: "Grupo" },
    { key: "paciente", label: "Paciente" },
    { key: "documento", label: "Documento" },
    { key: "eps", label: "EPS" },
    { key: "telefono", label: "Teléfono" },
    { key: "direccion", label: "Dirección" },
    { key: "idEncuesta", label: "ID Encuesta" },
];

const CAMPOS_EXCLUIDOS = new Set(["convenio"]);

export default {
    name: "AdminCaracterizacion",
    data() {
        return {
            fechaInicio: "",
            fechaFin: "",
            convenioInforme: "",
            conveniosDisponibles: [],
            cargando: false,
            consultado: false,
            registrosCaracterizacion: [],
        };
    },
    computed: {
        columnasCaracterizacion() {
            const keys = new Set();

            this.registrosCaracterizacion.forEach((registro) => {
                Object.keys(registro.caracterizacion || {}).forEach((key) => {
                    if (!CAMPOS_EXCLUIDOS.has(key)) {
                        keys.add(key);
                    }
                });
            });

            return Array.from(keys).map((key) => ({
                key,
                label: this.formatearClave(key),
            }));
        },
        columnasTabla() {
            return [...COLUMNAS_BASE, ...this.columnasCaracterizacion];
        },
        filasInforme() {
            return this.registrosCaracterizacion.map((registro) => {
                const encuesta = registro.encuesta || {};
                const caracterizacion = registro.caracterizacion || {};
                const fila = {
                    rowKey: registro.id,
                    fecha: registro.fecha || "",
                    convenio: registro.convenio || "",
                    grupo: encuesta.grupo || "",
                    paciente: `${encuesta.nombre1 || ""} ${encuesta.nombre2 || ""} ${encuesta.apellido1 || ""} ${encuesta.apellido2 || ""}`.replace(/\s+/g, " ").trim(),
                    documento: `${encuesta.tipodoc || ""}-${encuesta.numdoc || ""}`.replace(/^-$/, ""),
                    eps: encuesta.eps || "",
                    telefono: encuesta.telefono || "",
                    direccion: encuesta.direccion || "",
                    idEncuesta: caracterizacion.idEncuesta || "",
                };

                this.columnasCaracterizacion.forEach((col) => {
                    fila[col.key] = this.formatearValor(caracterizacion[col.key]);
                });

                return fila;
            });
        },
        tieneResultados() {
            return this.filasInforme.length > 0;
        },
    },
    methods: {
        normalizarFechaSoloDia(valor) {
            if (valor === null || valor === undefined) return null;

            const raw = String(valor).trim();
            if (!raw) return null;

            const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (iso) {
                return `${iso[1]}-${iso[2]}-${iso[3]}`;
            }

            const latam = raw.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/);
            if (latam) {
                return `${latam[3]}-${latam[2]}-${latam[1]}`;
            }

            const parsed = new Date(raw);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed.toISOString().slice(0, 10);
            }

            return null;
        },

        normalizarConvenio(valor) {
            return String(valor || "").trim().toLowerCase();
        },

        formatearClave(clave) {
            return String(clave || "")
                .replace(/([A-Z])/g, " $1")
                .replace(/_/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .replace(/^./, (match) => match.toUpperCase());
        },

        formatearValor(valor) {
            if (valor === null || valor === undefined) return "";
            if (Array.isArray(valor)) {
                return valor.map((item) => this.formatearValor(item)).filter(Boolean).join(", ");
            }
            if (typeof valor === "object") {
                return Object.entries(valor)
                    .map(([key, value]) => `${this.formatearClave(key)}: ${this.formatearValor(value)}`)
                    .join(" | ");
            }
            if (typeof valor === "boolean") {
                return valor ? "Sí" : "No";
            }
            return String(valor);
        },

        obtenerFechaRegistro(caracterizacion, encuesta) {
            return (
                caracterizacion?.fechaCaracterizacion ||
                caracterizacion?.fecha ||
                caracterizacion?.created_at ||
                caracterizacion?.createdAt ||
                encuesta?.fecha ||
                ""
            );
        },

        coincideRango(fecha) {
            const fechaNormalizada = this.normalizarFechaSoloDia(fecha);
            const inicio = this.normalizarFechaSoloDia(this.fechaInicio);
            const fin = this.normalizarFechaSoloDia(this.fechaFin);

            if (!fechaNormalizada || !inicio || !fin) return false;
            return fechaNormalizada >= inicio && fechaNormalizada <= fin;
        },

        coincideConvenio(caracterizacion, encuesta) {
            if (!this.convenioInforme) return true;
            const convenio = this.normalizarConvenio(caracterizacion?.convenio || encuesta?.convenio || "");
            return convenio === this.normalizarConvenio(this.convenioInforme);
        },

        actualizarConveniosDisponibles(...colecciones) {
            const convenios = new Map();

            colecciones.forEach((coleccion) => {
                (Array.isArray(coleccion) ? coleccion : []).forEach((item) => {
                    const valor = String(item || "").trim();
                    if (!valor) return;

                    const clave = valor.toLowerCase();
                    if (!convenios.has(clave)) {
                        convenios.set(clave, valor);
                    }
                });
            });

            this.conveniosDisponibles = Array.from(convenios.values())
                .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

            if (
                this.convenioInforme &&
                !this.conveniosDisponibles.some(
                    (convenio) => this.normalizarConvenio(convenio) === this.normalizarConvenio(this.convenioInforme)
                )
            ) {
                this.convenioInforme = "";
            }
        },

        async cargarConveniosDisponibles() {
            try {
                const [caracterizacionResp, encuestaResp] = await Promise.all([
                    realtime_api.get("/caracterizacion.json"),
                    realtime_api.get("/Encuesta.json"),
                ]);

                const conveniosCaracterizacion = Object.values(caracterizacionResp?.data || {})
                    .map((item) => item?.convenio);
                const conveniosEncuesta = Object.values(encuestaResp?.data || {})
                    .map((item) => item?.convenio);

                this.actualizarConveniosDisponibles(conveniosCaracterizacion, conveniosEncuesta);
            } catch (error) {
                console.error("Error cargando convenios de caracterización:", error);
                this.actualizarConveniosDisponibles();
            }
        },

        async generarInforme() {
            if (!this.fechaInicio || !this.fechaFin) {
                alert("Debe seleccionar fecha de inicio y fecha fin.");
                return;
            }

            if (this.fechaInicio > this.fechaFin) {
                alert("La fecha de inicio no puede ser mayor que la fecha fin.");
                return;
            }

            this.cargando = true;
            this.consultado = true;

            try {
                const paramsEncuesta = {};
                const paramsCaracterizacion = {};

                if (String(this.convenioInforme || "").trim()) {
                    paramsEncuesta.convenio = String(this.convenioInforme || "").trim();
                    paramsCaracterizacion.convenio = String(this.convenioInforme || "").trim();
                }

                const [caracterizacionResp, encuestaResp] = await Promise.all([
                    realtime_api.get("/caracterizacion.json", { params: paramsCaracterizacion }),
                    realtime_api.get("/Encuesta.json", { params: paramsEncuesta }),
                ]);

                const caracterizaciones = caracterizacionResp.data || {};
                const encuestas = encuestaResp.data || {};

                this.actualizarConveniosDisponibles(
                    Object.values(caracterizaciones).map((item) => item?.convenio),
                    Object.values(encuestas).map((item) => item?.convenio)
                );

                const encuestasMap = Object.entries(encuestas).reduce((acc, [id, value]) => {
                    acc[String(id)] = { id, ...value };
                    return acc;
                }, {});

                const registros = Object.entries(caracterizaciones)
                    .map(([id, value]) => {
                        const caracterizacion = value || {};
                        const encuestaId = String(
                            caracterizacion.idEncuesta ?? caracterizacion.encuestaId ?? caracterizacion.encuesta_id ?? ""
                        );
                        const encuesta = encuestasMap[encuestaId] || {};
                        const fecha = this.obtenerFechaRegistro(caracterizacion, encuesta);
                        const convenio = caracterizacion.convenio || encuesta.convenio || "";

                        return {
                            id,
                            fecha,
                            convenio,
                            encuestaId,
                            caracterizacion,
                            encuesta,
                        };
                    })
                    .filter((registro) => this.coincideRango(registro.fecha))
                    .filter((registro) => this.coincideConvenio(registro.caracterizacion, registro.encuesta))
                    .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")));

                this.registrosCaracterizacion = registros;
            } catch (error) {
                console.error("Error generando informe de caracterización:", error);
                alert("Ocurrió un error al generar el informe de caracterización.");
                this.registrosCaracterizacion = [];
            } finally {
                this.cargando = false;
            }
        },

        exportarExcel() {
            const filas = this.filasInforme.map((fila) => {
                const row = {};
                this.columnasTabla.forEach((col) => {
                    row[col.label] = fila[col.key] ?? "";
                });
                return row;
            });

            if (!filas.length) {
                alert("No hay datos para exportar.");
                return;
            }

            const ws = XLSX.utils.json_to_sheet(filas);
            if (ws["!ref"]) {
                ws["!autofilter"] = { ref: ws["!ref"] };
            }

            ws["!cols"] = this.columnasTabla.map(() => ({ wch: 22 }));

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Caracterizacion");

            const convenio = this.convenioInforme
                ? this.convenioInforme.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase()
                : "todos";

            XLSX.writeFile(wb, `informe_caracterizacion_${convenio}_${this.fechaInicio}_${this.fechaFin}.xlsx`);
        },
    },
    async mounted() {
        await this.cargarConveniosDisponibles();
    },
};
</script>

<style>
.admin-caracterizacion {
    width: 100%;
    max-width: 100%;
}

.formulario-informe {
    background: #fff;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.tabla-informe-wrap {
    max-height: calc(100vh - 250px);
    overflow: auto;
    border-radius: 12px;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    background: #fff;
}

.tabla-informe th,
.tabla-informe td {
    white-space: nowrap;
    font-size: 0.82rem;
}

.progress-card {
    width: min(560px, 100%);
    background: #fff;
    border-radius: 16px;
    padding: 20px 24px;
    border: 1px solid #dee2e6;
}

.progreso-indeterminado {
    width: 100%;
}
</style>

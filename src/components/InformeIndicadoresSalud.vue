<template>
    <div class="informe-indicadores">
        <form class="row g-3 align-items-end mb-3" @submit.prevent="generar">
            <div class="col-12 col-md-4">
                <label for="indicadoresIps" class="form-label fw-bold">IPS</label>
                <select id="indicadoresIps" v-model="ipsId" class="form-select">
                    <option value="">Todas las IPS</option>
                    <option v-for="ips in ipsList" :key="ips.id" :value="ips.id">
                        {{ ips.nombre || ips.id }}
                    </option>
                </select>
            </div>
            <div class="col-6 col-md-2">
                <label for="indicadoresInicio" class="form-label fw-bold">Fecha inicio <span class="text-danger">*</span></label>
                <input id="indicadoresInicio" v-model="fechaInicio" type="date" class="form-control" required />
            </div>
            <div class="col-6 col-md-2">
                <label for="indicadoresFin" class="form-label fw-bold">Fecha fin <span class="text-danger">*</span></label>
                <input id="indicadoresFin" v-model="fechaFin" type="date" class="form-control" required />
            </div>
            <div class="col-12 col-md-2">
                <label for="indicadoresConvenio" class="form-label fw-bold">Convenio</label>
                <select id="indicadoresConvenio" v-model="convenio" class="form-select">
                    <option value="">Todos</option>
                    <option v-for="conv in convenios" :key="conv" :value="conv">{{ conv }}</option>
                </select>
            </div>
            <div class="col-12 col-md-2 d-grid">
                <button type="submit" class="btn btn-primary" :disabled="cargando">
                    <span v-if="cargando" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi bi-bar-chart-line me-1"></i>
                    {{ cargando ? "Calculando..." : "Generar" }}
                </button>
            </div>
        </form>

        <p v-if="!consultado" class="text-muted small mb-0">
            Indicadores de salud (gestantes, cursos de vida, tamizajes de cáncer y vacunación) calculados con los
            pacientes atendidos entre las fechas, a partir de los CUPS registrados y la caracterización.
        </p>

        <div v-else-if="!informe.totalPacientes" class="alert alert-warning text-center py-4 mb-0">
            <i class="bi bi-inbox fs-3 d-block mb-2"></i>
            <strong>No hay pacientes atendidos con los parámetros seleccionados.</strong>
        </div>

        <template v-else>
            <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
                <button type="button" class="btn btn-outline-success" @click="exportarExcel">
                    <i class="bi bi-file-earmark-excel"></i> Exportar a Excel
                </button>
                <span v-for="(parametro, idx) in parametrosConsulta" :key="`param-${idx}`" class="badge bg-secondary fs-6 py-2 px-3">
                    {{ parametro }}
                </span>
                <span class="badge bg-primary fs-6 py-2 px-3">Pacientes atendidos: {{ informe.totalPacientes }}</span>
                <span class="badge bg-info text-dark fs-6 py-2 px-3">Con caracterización: {{ informe.totalCaracterizados }}</span>
            </div>

            <div class="table-responsive">
                <table class="table table-sm table-striped table-bordered align-middle tabla-indicadores">
                    <thead class="table-light">
                        <tr>
                            <th>Código</th>
                            <th>Nombre del indicador</th>
                            <th>Población (denominador)</th>
                            <th>Criterio (numerador)</th>
                            <th class="text-end">Numerador</th>
                            <th class="text-end">Por CUPS</th>
                            <th class="text-end">Por caracterización</th>
                            <th class="text-end">Denominador</th>
                            <th class="text-end">Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="ind in informe.indicadores" :key="ind.codigo">
                            <td>{{ ind.codigo }}</td>
                            <td class="indicador-nombre">{{ ind.nombre }}</td>
                            <td>{{ ind.poblacion }}</td>
                            <td class="text-muted small">{{ ind.criterio }}</td>
                            <td class="text-end">{{ ind.numerador }}</td>
                            <td class="text-end text-muted">{{ ind.numeradorCups || 0 }}</td>
                            <td class="text-end text-muted">{{ ind.numeradorCaracterizacion || 0 }}</td>
                            <td class="text-end">{{ ind.denominador }}</td>
                            <td class="text-end fw-semibold">
                                {{ ind.denominador ? `${ind.porcentaje}%` : "Sin población" }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="alert alert-info nota-indicadores mt-3 mb-0">
                <div class="fw-semibold mb-2"><i class="bi bi-info-circle"></i> ¿Cómo leer este informe?</div>
                <ul class="mb-2">
                    <li v-for="punto in notaPuntos" :key="punto.titulo">
                        <strong>{{ punto.titulo }}:</strong> {{ punto.texto }}
                    </li>
                </ul>
                <div v-if="ejemploNota" class="small">
                    <strong>Ejemplo con este informe:</strong> {{ ejemploNota }}
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { informesApi } from "@/api/informesApi";
import { CONVENIOS_PROGRAMA } from "@/constants/convenios";
import {
    NOTA_INDICADORES_PUNTOS,
    construirEjemploNotaIndicadores,
    crearIndicadoresInformeVacio,
    exportarExcelIndicadoresSalud,
} from "@/utils/indicadoresSalud";

const formatearFechaInput = (fecha) => {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const limpiarNombreArchivo = (valor) => String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

export default {
    name: "InformeIndicadoresSalud",
    props: {
        ipsList: {
            type: Array,
            default: () => [],
        },
    },
    emits: ["error"],
    data() {
        const hoy = new Date();
        return {
            ipsId: "",
            fechaInicio: formatearFechaInput(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
            fechaFin: formatearFechaInput(hoy),
            convenio: "",
            convenios: [...CONVENIOS_PROGRAMA],
            cargando: false,
            consultado: false,
            consultaUsada: null,
            informe: crearIndicadoresInformeVacio(),
            notaPuntos: NOTA_INDICADORES_PUNTOS,
        };
    },
    computed: {
        ejemploNota() {
            return construirEjemploNotaIndicadores(this.informe.indicadores || []);
        },
        parametrosConsulta() {
            const consulta = this.consultaUsada;
            if (!consulta) return [];
            return [
                `IPS: ${consulta.ipsNombre}`,
                `${consulta.fechaInicio} a ${consulta.fechaFin}`,
                `Convenio: ${consulta.convenio || "Todos"}`,
            ];
        },
    },
    methods: {
        nombreIps(ipsId) {
            if (!ipsId) return "Todas las IPS";
            const ips = this.ipsList.find((item) => item.id === ipsId);
            return ips?.nombre || ipsId;
        },
        async generar() {
            if (!this.fechaInicio || !this.fechaFin) {
                this.$emit("error", "Selecciona la fecha de inicio y la fecha fin.");
                return;
            }
            if (this.fechaInicio > this.fechaFin) {
                this.$emit("error", "La fecha de inicio no puede ser mayor que la fecha fin.");
                return;
            }

            this.cargando = true;
            try {
                const params = {
                    fechaInicio: this.fechaInicio,
                    fechaFin: this.fechaFin,
                    convenio: this.convenio || "",
                };
                if (this.ipsId) params.ipsId = this.ipsId;

                this.informe = await informesApi.getIndicadoresSalud(params);
                this.consultaUsada = {
                    ...params,
                    ipsId: this.ipsId,
                    ipsNombre: this.nombreIps(this.ipsId),
                };
                this.consultado = true;
            } catch (error) {
                this.$emit("error", "No se pudo generar el informe: " + (error?.response?.data?.message || error.message));
            } finally {
                this.cargando = false;
            }
        },
        exportarExcel() {
            const consulta = this.consultaUsada;
            if (!consulta || !this.informe.indicadores?.length) return;

            const ipsSlug = consulta.ipsId ? limpiarNombreArchivo(consulta.ipsNombre) : "todas_ips";
            const convenioSlug = consulta.convenio ? limpiarNombreArchivo(consulta.convenio) : "todos";
            exportarExcelIndicadoresSalud({
                indicadores: this.informe.indicadores,
                detalle: this.informe.detalle || [],
                nombreArchivo: `indicadores_salud_${ipsSlug}_${convenioSlug}_${consulta.fechaInicio}_a_${consulta.fechaFin}.xlsx`,
                encabezado: [
                    ["IPS", consulta.ipsNombre],
                    ["Periodo", `${consulta.fechaInicio} a ${consulta.fechaFin}`],
                    ["Convenio", consulta.convenio || "Todos"],
                    ["Pacientes atendidos", this.informe.totalPacientes],
                    ["Con caracterización", this.informe.totalCaracterizados],
                ],
            });
        },
    },
};
</script>

<style scoped>
.tabla-indicadores .indicador-nombre {
    min-width: 320px;
    white-space: normal;
}

.nota-indicadores ul {
    padding-left: 1.2rem;
}
</style>

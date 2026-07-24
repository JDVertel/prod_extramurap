<template>
  <div class="container-fluid mt-4 pt-2 mantenimiento-bd">
    <div class="mb-3">
      <h3 class="mb-1">
        <i class="bi bi-database-gear"></i> Mantenimiento BD
      </h3>
      <p class="text-muted mb-0">
        Herramientas administrativas para depurar datos. Primero se analiza el impacto y luego usted elige qué cambios aplicar.
      </p>
    </div>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button
          class="nav-link"
          type="button"
          :class="{ active: tabActiva === 'documentos' }"
          @click="cambiarTab('documentos')"
        >
          <i class="bi bi-card-text me-1"></i> Documentos pacientes
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link"
          type="button"
          :class="{ active: tabActiva === 'huerfanos' }"
          @click="cambiarTab('huerfanos')"
        >
          <i class="bi bi-diagram-3 me-1"></i> Encuestas huérfanas
        </button>
      </li>
    </ul>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="mensajeExito" class="alert alert-success">{{ mensajeExito }}</div>

    <!-- TAB: DOCUMENTOS -->
    <div v-show="tabActiva === 'documentos'">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div class="alert alert-info mb-0 flex-grow-1">
          <strong>Alcance:</strong> limpia caracteres especiales en documentos de pacientes
          (<code>encuestas.numdoc</code>), dejando solo letras y números.
          No modifica documentos de profesionales.
        </div>
        <button class="btn btn-primary" type="button" :disabled="cargandoPreviewDocs" @click="analizarDocumentos">
          <span v-if="cargandoPreviewDocs" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-search me-1"></i>
          {{ cargandoPreviewDocs ? "Analizando..." : "Analizar documentos" }}
        </button>
      </div>

      <div v-if="previewDocs" class="row g-3 mb-3">
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-label">Analizados</div>
            <div class="stat-value">{{ previewDocs.totalAnalizados }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-label">Con cambios</div>
            <div class="stat-value text-primary">{{ previewDocs.totalAfectados }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-label">Seleccionables</div>
            <div class="stat-value text-success">{{ previewDocs.totalSeleccionables }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-label">Con colisión</div>
            <div class="stat-value text-warning">{{ previewDocs.totalConColision }}</div>
          </div>
        </div>
      </div>

      <div v-if="cambiosDocs.length" class="card shadow-sm">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <strong>Cambios detectados</strong>
            <span class="text-muted ms-2">{{ seleccionadosDocsCount }} seleccionados</span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="seleccionarTodosDocs(true)">
              Seleccionar seguros
            </button>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="seleccionarTodosDocs(false)">
              Quitar selección
            </button>
            <button
              class="btn btn-sm btn-success"
              type="button"
              :disabled="!seleccionadosDocsCount || aplicandoDocs"
              @click="aplicarDocumentosSeleccionados"
            >
              <span v-if="aplicandoDocs" class="spinner-border spinner-border-sm me-1"></span>
              Aplicar seleccionados
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th class="text-center" style="width: 48px;">Sel.</th>
                  <th>Paciente</th>
                  <th>Tipo</th>
                  <th>Documento actual</th>
                  <th>Documento limpio</th>
                  <th>Convenio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in cambiosDocs" :key="item.id" :class="{ 'table-warning': item.colision }">
                  <td class="text-center">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="item.seleccionado"
                      :disabled="item.colision"
                      @change="toggleSeleccionDocs(item, $event.target.checked)"
                    />
                  </td>
                  <td>
                    <div class="fw-semibold">{{ item.nombre }}</div>
                    <small class="text-muted">{{ item.id }}</small>
                  </td>
                  <td>{{ item.tipodoc || "—" }}</td>
                  <td><code>{{ item.numdocActual }}</code></td>
                  <td><code class="text-success">{{ item.numdocNuevo }}</code></td>
                  <td>{{ item.convenio || "—" }}</td>
                  <td>
                    <span v-if="item.colision" class="badge text-bg-warning">Colisión</span>
                    <span v-else class="badge text-bg-success">Listo</span>
                    <div v-if="item.motivoColision" class="small text-muted mt-1">{{ item.motivoColision }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="previewDocs && !cargandoPreviewDocs" class="alert alert-success mt-3">
        No hay documentos de pacientes con caracteres especiales pendientes de limpieza.
      </div>

      <div v-if="resultadoDocs" class="card shadow-sm mt-3">
        <div class="card-header"><strong>Resultado de la aplicación</strong></div>
        <div class="card-body">
          <p class="mb-2">
            Aplicados: <strong>{{ resultadoDocs.totalAplicados }}</strong>
            · Omitidos: <strong>{{ resultadoDocs.totalOmitidos }}</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- TAB: HUÉRFANOS -->
    <div v-show="tabActiva === 'huerfanos'">
      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div class="alert alert-warning mb-0 flex-grow-1">
          <strong>Alcance:</strong> encuestas sin caracterización con más de
          <strong>{{ mesesHuerfanos }} mes(es)</strong> de antigüedad
          (según fecha de encuesta o creación).
          Puede revisar, seleccionar y eliminar.
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-end">
          <div>
            <label class="form-label mb-1 small" for="mesesHuerfanos">Antigüedad mínima (meses)</label>
            <input
              id="mesesHuerfanos"
              v-model.number="mesesHuerfanos"
              type="number"
              min="1"
              class="form-control form-control-sm"
              style="width: 110px;"
            />
          </div>
          <button class="btn btn-primary" type="button" :disabled="cargandoPreviewHuerfanos" @click="analizarHuerfanos">
            <span v-if="cargandoPreviewHuerfanos" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-search me-1"></i>
            {{ cargandoPreviewHuerfanos ? "Buscando..." : "Buscar huérfanos" }}
          </button>
        </div>
      </div>

      <div v-if="previewHuerfanos" class="row g-3 mb-3">
        <div class="col-6 col-md-4">
          <div class="stat-card">
            <div class="stat-label">Huérfanos encontrados</div>
            <div class="stat-value text-danger">{{ previewHuerfanos.totalHuerfanos }}</div>
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div class="stat-card">
            <div class="stat-label">Seleccionados</div>
            <div class="stat-value">{{ seleccionadosHuerfanosCount }}</div>
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div class="stat-card">
            <div class="stat-label">Criterio</div>
            <div class="stat-value" style="font-size: 1.1rem;">≥ {{ previewHuerfanos.criterioMeses }} mes(es)</div>
          </div>
        </div>
      </div>

      <div v-if="huerfanos.length" class="card shadow-sm">
        <div class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <strong>Encuestas sin caracterización</strong>
            <span class="text-muted ms-2">{{ seleccionadosHuerfanosCount }} seleccionados</span>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="seleccionarTodosHuerfanos(true)">
              Seleccionar todos
            </button>
            <button class="btn btn-sm btn-outline-secondary" type="button" @click="seleccionarTodosHuerfanos(false)">
              Quitar selección
            </button>
            <button
              class="btn btn-sm btn-danger"
              type="button"
              :disabled="!seleccionadosHuerfanosCount || eliminandoHuerfanos"
              @click="eliminarHuerfanosSeleccionados"
            >
              <span v-if="eliminandoHuerfanos" class="spinner-border spinner-border-sm me-1"></span>
              Eliminar seleccionados
            </button>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th class="text-center" style="width: 48px;">Sel.</th>
                  <th>Paciente</th>
                  <th>Documento</th>
                  <th>Convenio</th>
                  <th>Fecha</th>
                  <th>Antigüedad</th>
                  <th>Estados</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in huerfanos" :key="item.id">
                  <td class="text-center">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :checked="item.seleccionado"
                      @change="toggleSeleccionHuerfanos(item, $event.target.checked)"
                    />
                  </td>
                  <td>
                    <div class="fw-semibold">{{ item.nombre }}</div>
                    <small class="text-muted">{{ item.id }}</small>
                  </td>
                  <td>
                    <span class="badge bg-secondary-subtle text-dark border me-1">{{ item.tipodoc || "-" }}</span>
                    <code>{{ item.numdoc || "—" }}</code>
                  </td>
                  <td>{{ item.convenio || "—" }}</td>
                  <td>{{ formatearFecha(item.fecha || item.createdAt) }}</td>
                  <td>
                    <span class="badge text-bg-warning">{{ item.diasAntiguedad ?? "—" }} días</span>
                  </td>
                  <td class="small">
                    Visita: {{ item.statusVisita ? "Sí" : "No" }} ·
                    Fact.: {{ item.statusFacturacion ? "Sí" : "No" }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else-if="previewHuerfanos && !cargandoPreviewHuerfanos" class="alert alert-success mt-3">
        No se encontraron encuestas huérfanas con ese criterio.
      </div>

      <div v-if="resultadoHuerfanos" class="card shadow-sm mt-3">
        <div class="card-header"><strong>Resultado de eliminación</strong></div>
        <div class="card-body">
          <p class="mb-2">
            Eliminados: <strong>{{ resultadoHuerfanos.totalEliminados }}</strong>
            · Omitidos: <strong>{{ resultadoHuerfanos.totalOmitidos }}</strong>
          </p>
          <div v-if="resultadoHuerfanos.omitidos?.length" class="small text-muted">
            <div v-for="omitido in resultadoHuerfanos.omitidos" :key="omitido.id">
              {{ omitido.id }}: {{ omitido.motivo }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  applyLimpiezaDocumentosPacientes,
  eliminarEncuestasHuerfanas,
  previewEncuestasHuerfanas,
  previewLimpiezaDocumentosPacientes,
} from "@/api/mantenimientoApi";

export default {
  name: "AdminMantenimientoBd",
  data() {
    return {
      tabActiva: "documentos",
      error: "",
      mensajeExito: "",

      // Documentos
      cargandoPreviewDocs: false,
      aplicandoDocs: false,
      previewDocs: null,
      cambiosDocs: [],
      resultadoDocs: null,

      // Huérfanos
      mesesHuerfanos: 1,
      cargandoPreviewHuerfanos: false,
      eliminandoHuerfanos: false,
      previewHuerfanos: null,
      huerfanos: [],
      resultadoHuerfanos: null,
    };
  },
  computed: {
    seleccionadosDocsCount() {
      return this.cambiosDocs.filter((item) => item.seleccionado && !item.colision).length;
    },
    seleccionadosHuerfanosCount() {
      return this.huerfanos.filter((item) => item.seleccionado).length;
    },
  },
  methods: {
    cambiarTab(tab) {
      this.tabActiva = tab;
      this.error = "";
      this.mensajeExito = "";
    },

    formatearFecha(valor) {
      if (!valor) return "—";
      const text = String(valor);
      if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
      const parsed = new Date(valor);
      if (Number.isNaN(parsed.getTime())) return text;
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const dd = String(parsed.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },

    // ---- Documentos ----
    async analizarDocumentos() {
      this.error = "";
      this.mensajeExito = "";
      this.resultadoDocs = null;
      this.cargandoPreviewDocs = true;
      try {
        const data = await previewLimpiezaDocumentosPacientes();
        this.previewDocs = data;
        this.cambiosDocs = Array.isArray(data?.cambios)
          ? data.cambios.map((item) => ({
              ...item,
              seleccionado: Boolean(item.seleccionado) && !item.colision,
            }))
          : [];
        if (!this.cambiosDocs.length) {
          this.mensajeExito = "Análisis completado: no hay cambios pendientes.";
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo analizar la limpieza de documentos.";
        this.previewDocs = null;
        this.cambiosDocs = [];
      } finally {
        this.cargandoPreviewDocs = false;
      }
    },

    toggleSeleccionDocs(item, checked) {
      if (item.colision) return;
      item.seleccionado = Boolean(checked);
    },

    seleccionarTodosDocs(marcar) {
      this.cambiosDocs.forEach((item) => {
        item.seleccionado = Boolean(marcar) && !item.colision;
      });
    },

    async aplicarDocumentosSeleccionados() {
      const ids = this.cambiosDocs
        .filter((item) => item.seleccionado && !item.colision)
        .map((item) => item.id);

      if (!ids.length) {
        this.error = "Seleccione al menos un cambio seguro para aplicar.";
        return;
      }

      const confirmar = confirm(
        `Se actualizarán ${ids.length} documento(s) de pacientes.\n\n¿Desea continuar?`
      );
      if (!confirmar) return;

      this.error = "";
      this.mensajeExito = "";
      this.aplicandoDocs = true;
      try {
        const resultado = await applyLimpiezaDocumentosPacientes(ids);
        this.resultadoDocs = resultado;
        this.mensajeExito = `Se aplicaron ${resultado.totalAplicados} cambio(s).`;
        await this.analizarDocumentos();
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron aplicar los cambios seleccionados.";
      } finally {
        this.aplicandoDocs = false;
      }
    },

    // ---- Huérfanos ----
    async analizarHuerfanos() {
      this.error = "";
      this.mensajeExito = "";
      this.resultadoHuerfanos = null;
      this.cargandoPreviewHuerfanos = true;
      try {
        const meses = Math.max(1, Number(this.mesesHuerfanos) || 1);
        this.mesesHuerfanos = meses;
        const data = await previewEncuestasHuerfanas(meses);
        this.previewHuerfanos = data;
        this.huerfanos = Array.isArray(data?.huerfanos)
          ? data.huerfanos.map((item) => ({
              ...item,
              seleccionado: false,
            }))
          : [];
        if (!this.huerfanos.length) {
          this.mensajeExito = "Búsqueda completada: no hay encuestas huérfanas con ese criterio.";
        }
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron buscar las encuestas huérfanas.";
        this.previewHuerfanos = null;
        this.huerfanos = [];
      } finally {
        this.cargandoPreviewHuerfanos = false;
      }
    },

    toggleSeleccionHuerfanos(item, checked) {
      item.seleccionado = Boolean(checked);
    },

    seleccionarTodosHuerfanos(marcar) {
      this.huerfanos.forEach((item) => {
        item.seleccionado = Boolean(marcar);
      });
    },

    async eliminarHuerfanosSeleccionados() {
      const ids = this.huerfanos.filter((item) => item.seleccionado).map((item) => item.id);
      if (!ids.length) {
        this.error = "Seleccione al menos una encuesta huérfana para eliminar.";
        return;
      }

      const confirmar = confirm(
        `Se eliminarán ${ids.length} encuesta(s) sin caracterización.\n` +
          "También se eliminarán actividades/asignaciones asociadas por cascada.\n\n¿Desea continuar?"
      );
      if (!confirmar) return;

      this.error = "";
      this.mensajeExito = "";
      this.eliminandoHuerfanos = true;
      try {
        const resultado = await eliminarEncuestasHuerfanas(ids, this.mesesHuerfanos);
        this.resultadoHuerfanos = resultado;
        this.mensajeExito = `Se eliminaron ${resultado.totalEliminados} encuesta(s) huérfana(s).`;
        await this.analizarHuerfanos();
      } catch (error) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "No se pudieron eliminar las encuestas seleccionadas.";
      } finally {
        this.eliminandoHuerfanos = false;
      }
    },
  },
};
</script>

<style scoped>
.mantenimiento-bd .nav-tabs .nav-link {
  color: #475569;
}

.mantenimiento-bd .nav-tabs .nav-link.active {
  font-weight: 600;
  color: #0f172a;
}

.mantenimiento-bd .stat-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.9rem 1rem;
}

.mantenimiento-bd .stat-label {
  font-size: 0.8rem;
  color: #64748b;
}

.mantenimiento-bd .stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
}

.mantenimiento-bd code {
  font-size: 0.85rem;
}
</style>

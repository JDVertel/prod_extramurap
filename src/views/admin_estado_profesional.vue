<template>
  <div class="container py-4">
    <h2 class="mb-3">Profesionales delegados</h2>
    <p class="text-muted mb-4">
      Selecciona un profesional para abrir su vista de trabajo y revisar su estado actual.
    </p>

    <div class="card shadow-sm">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-lg-4">
            <label for="filtroNombre" class="form-label">Buscar profesional</label>
            <input
              id="filtroNombre"
              v-model="filtroNombre"
              type="text"
              class="form-control"
              placeholder="Nombre o documento"
            />
          </div>

          <div class="col-12 col-lg-4">
            <label for="filtroConvenio" class="form-label">Filtrar por convenio</label>
            <select id="filtroConvenio" v-model="filtroConvenio" class="form-select">
              <option value="">Todos los convenios</option>
              <option v-for="convenio in conveniosDisponibles" :key="convenio" :value="convenio">
                {{ convenio }}
              </option>
            </select>
          </div>

          <div class="col-12 col-lg-4">
            <label for="filtroCargo" class="form-label">Filtrar por cargo</label>
            <select id="filtroCargo" v-model="filtroCargo" class="form-select">
              <option value="">Todos los cargos</option>
              <option v-for="cargo in cargosDisponibles" :key="cargo" :value="cargo">
                {{ cargo }}
              </option>
            </select>
          </div>

        </div>

        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-outline-secondary btn-sm" @click="cargarProfesionales">
            Recargar
          </button>
          <button class="btn btn-outline-dark btn-sm" @click="limpiarFiltros">
            Limpiar filtros
          </button>
        </div>

        <div class="mt-3 text-muted small">
          Mostrando {{ profesionalesFiltrados.length }} de {{ profesionales.length }} profesionales.
        </div>

        <div v-if="cargando" class="mt-3 text-muted">Cargando profesionales...</div>
        <div v-if="error" class="alert alert-danger mt-3 mb-0">{{ error }}</div>

        <div v-if="!cargando && profesionalesFiltrados.length === 0 && profesionales.length > 0" class="mt-3 text-muted small">
          No hay profesionales que coincidan con los filtros aplicados.
        </div>
        <div
          v-if="!cargando && profesionales.length === 0 && !isAdminUser"
          class="alert alert-warning mt-3 mb-0"
        >
          No hay profesionales delegados visibles para tu convenio o aún no tienes asignaciones activas.
        </div>

        <ul v-if="!cargando && profesionalesFiltrados.length > 0" class="list-group mt-3">
          <li
            v-for="profesional in profesionalesFiltrados"
            :key="profesional.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            style="cursor: pointer"
            @click="irAEstadoProfesional(profesional)"
          >
            <div>
              <span class="fw-semibold">{{ profesional.nombre }}</span>
              <span class="text-muted ms-2 small">{{ profesional.numDocumento }}</span>
            </div>
            <div class="d-flex gap-2 align-items-center">
              <span class="badge bg-secondary">{{ profesional.cargo }}</span>
              <span class="badge bg-light text-dark border">{{ profesional.convenio }}</span>
              <i class="bi bi-chevron-right text-muted"></i>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getDelegatedProfessionals } from "@/api/usersApi";
import { mapState } from "vuex";

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

const RUTA_POR_CARGO_CANONICO = {
  "Auxiliar de enfermeria": "/sop_aux",
  Medico: "/sop_profesional",
  Enfermero: "/sop_enfermero",
  Psicologo: "/sop_psicologo",
  Tsocial: "/sop_tsocial",
  Nutricionista: "/sop_nutricionista",
};

function normalizarCargo(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function obtenerCargoCanonico(valor) {
  return CARGO_CANONICO_POR_NORMALIZADO[normalizarCargo(valor)] || "";
}

function esCargoProfesional(valor) {
  return Boolean(obtenerCargoCanonico(valor));
}

export default {
  name: "AdminEstadoProfesional",
  data() {
    return {
      cargando: false,
      error: "",
      filtroNombre: "",
      filtroConvenio: "",
      filtroCargo: "",
        profesionales: [],
    };
  },
  computed: {
    ...mapState(["userData"]),
    isAdminUser() {
      const cargo = String(this.userData?.cargo || "").trim().toLowerCase();
      return cargo === "admin" || cargo === "administrador";
    },
    accesosPermitidosSet() {
      const accesos = Array.isArray(this.userData?.accesosProfesionales)
        ? this.userData.accesosProfesionales
        : [];
      return new Set(accesos.map((item) => String(item || "").trim()).filter(Boolean));
    },
    convenioUsuarioLogueado() {
      return String(this.userData?.convenio || "").trim().toLowerCase();
    },
    conveniosDisponibles() {
      const unicos = new Set(
        (this.profesionales || [])
          .map((item) => String(item?.convenio || "").trim())
          .filter(Boolean)
      );

      return Array.from(unicos).sort((a, b) => a.localeCompare(b));
    },
    cargosDisponibles() {
      const unicos = new Set(
        (this.profesionales || [])
          .map((item) => String(item?.cargo || "").trim())
          .filter(Boolean)
      );

      return Array.from(unicos).sort((a, b) => a.localeCompare(b));
    },
    profesionalesFiltrados() {
      const termino = String(this.filtroNombre || "").trim().toLowerCase();
      const cargoFiltro = String(this.filtroCargo || "").trim();
      const convenioFiltro = String(this.filtroConvenio || "").trim();

      return (this.profesionales || []).filter((item) => {
        const nombre = String(item?.nombre || "").toLowerCase();
        const documento = String(item?.numDocumento || "").toLowerCase();
        const cargo = String(item?.cargo || "").trim();
        const convenio = String(item?.convenio || "").trim();

        const cumpleBusqueda = !termino || nombre.includes(termino) || documento.includes(termino);
        const cumpleCargo = !cargoFiltro || cargo === cargoFiltro;
        const cumpleConvenio = !convenioFiltro || convenio === convenioFiltro;

        return cumpleBusqueda && cumpleCargo && cumpleConvenio;
      });
    },
  },
  methods: {
    limpiarFiltros() {
      this.filtroNombre = "";
      this.filtroConvenio = "";
      this.filtroCargo = "";
    },
    async cargarProfesionales() {
      this.cargando = true;
      this.error = "";

      try {
        const usuarios = await getDelegatedProfessionals();

        this.profesionales = (usuarios || [])
          .filter((user) => {
            const cargo = String(user?.cargo || "").trim();
            return esCargoProfesional(cargo);
          })
          .sort((a, b) => String(a?.nombre || "").localeCompare(String(b?.nombre || "")));
      } catch (err) {
        this.error = "No fue posible cargar los profesionales.";
        console.error("Error cargando profesionales:", err);
      } finally {
        this.cargando = false;
      }
    },
    irAEstadoProfesional(profesional) {
      if (!profesional) return;

      const cargo = String(profesional.cargo || "").trim();
      const cargoCanonico = obtenerCargoCanonico(cargo);
      const ruta = RUTA_POR_CARGO_CANONICO[cargoCanonico];

      if (!ruta) {
        this.error = "El cargo seleccionado no tiene una vista de estado disponible.";
        return;
      }

      sessionStorage.setItem("estadoViewReturnTo", this.$route.fullPath || "/admin_estado_profesional");

      this.$router.push({
        path: ruta,
        query: {
          estadoView: "1",
          profesionalDoc: String(profesional.numDocumento || ""),
          profesionalCargo: cargoCanonico || cargo,
          profesionalConvenio: String(profesional.convenio || ""),
          profesionalNombre: String(profesional.nombre || ""),
        },
      });
    },
  },

  mounted() {
    this.cargarProfesionales();
  },
};
</script>

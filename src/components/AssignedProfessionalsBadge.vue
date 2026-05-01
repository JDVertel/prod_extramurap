<template>
  <div class="assigned-row">
    <small class="assigned-label">Profesionales asignados:</small>
    <button type="button" class="badge bg-info text-dark border-0 assigned-btn" @click="openModal">
      {{ badgeText }}
    </button>
  </div>

  <div v-if="modalOpen" class="assigned-modal-overlay" @click="closeModal">
    <div class="assigned-modal-content" @click.stop>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">Profesionales asignados</h6>
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="closeModal">Cerrar</button>
      </div>
      <ul v-if="assignedProfessionals.length > 0" class="list-group list-group-flush">
        <li v-for="item in assignedProfessionals" :key="`${item.role}-${item.document}`"
          class="list-group-item d-flex justify-content-between align-items-center">
          <span>{{ item.role }}</span>
          <span class="text-muted">{{ item.document }}</span>
        </li>
      </ul>
      <div v-else class="text-muted small">Sin profesionales asignados.</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AssignedProfessionalsBadge",
  props: {
    encuesta: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      modalOpen: false,
    };
  },
  computed: {
    assignedProfessionals() {
      const row = this.encuesta || {};
      const entries = [
        { role: "Auxiliar", document: String(row?.idEncuestador || "").trim() },
        { role: "Medico", document: String(row?.idMedicoAtiende || "").trim() },
        { role: "Enfermero", document: String(row?.idEnfermeroAtiende || "").trim() },
        { role: "Psicologo", document: String(row?.idPsicologoAtiende || "").trim() },
        { role: "Trabajador social", document: String(row?.idTsocialAtiende || "").trim() },
        {
          role: "Nutricionista",
          document: String(
            row?.idNutricionistaAtiende ||
              row?.idNutriAtiende ||
              row?.idNutricionista ||
              row?.idNutricionAtiende ||
              ""
          ).trim(),
        },
      ];

      return entries.filter((item) => item.document);
    },
    badgeText() {
      const total = this.assignedProfessionals.length;
      return `${total} asignado${total === 1 ? "" : "s"}`;
    },
  },
  methods: {
    openModal() {
      this.modalOpen = true;
    },
    closeModal() {
      this.modalOpen = false;
    },
  },
};
</script>

<style scoped>
.assigned-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.assigned-label {
  color: inherit;
}

.assigned-btn {
  cursor: pointer;
}

.assigned-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.assigned-modal-content {
  width: min(560px, 95vw);
  max-height: 70vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
  padding: 12px;
}
</style>

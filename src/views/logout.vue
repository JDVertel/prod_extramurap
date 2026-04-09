<template>
  <div class="container text-center py-4">
    <div v-if="!logoutComplete">
      <div class="progress-card shadow-sm mx-auto">
        <div class="h5 mb-3">Cerrando sesión</div>
        <div class="progress mb-2" role="progressbar" aria-label="Cerrando sesión" aria-valuemin="0"
          aria-valuemax="100" style="height: 22px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
            Cerrando...
          </div>
        </div>
        <div class="text-muted small">Finalizando la sesión del usuario...</div>
      </div>
    </div>
    <div v-else>
      <i class="bi bi-fingerprint"></i>
      <h4 class="mt-3">Sesión cerrada correctamente</h4>
      <router-link to="/login">
        <button class="btn btn-success mt-3">Ir a Login</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  data() {
    return {
      logoutComplete: false
    };
  },
  methods: {
    ...mapActions(["userLogout"])
  },
  async mounted() {
    try {
      // Ejecutar el logout real
      await this.userLogout();
      this.logoutComplete = true;
    } catch (error) {
      console.error("Error en logout:", error);
      // Igual mostrar el mensaje de logout completado
      setTimeout(() => {
        this.logoutComplete = true;
      }, 1000);
    }
  }
};
</script>

<style scoped>
.bi-fingerprint {
  font-size: 150px;
  color: #198754;
  /* color verde bootstrap success */
}

.container {
  max-width: 400px;
  margin: 0 auto;
}

.progress-card {
  width: min(420px, calc(100vw - 32px));
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #dee2e6;
}

.progreso-indeterminado {
  width: 100%;
}
</style>

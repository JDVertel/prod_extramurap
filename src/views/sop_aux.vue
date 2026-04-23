<template>
  <div>
    <div v-if="cargando" class="spinner-overlay">
      <div class="progress-card shadow">
        <div class="h5 mb-3">Cargando información</div>
        <div class="progress mb-2" role="progressbar" aria-label="Cargando información" aria-valuemin="0"
          aria-valuemax="100" style="height: 22px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
            Cargando...
          </div>
        </div>
        <div class="text-muted small">Por favor espere, cargando información...</div>
      </div>
    </div>
    <div v-else-if="errorCarga" class="alert alert-danger m-3">
      <h4>Error cargando información</h4>
      <p>{{ errorCarga }}</p>
      <button class="btn btn-primary" @click="cargarEncuestas">Reintentar</button>
    </div>
    <div v-else>
      <h1 class="display-6 center">{{ cargoMostrado }}</h1>
      <p v-if="esEstadoView && nombreProfesionalSeleccionado" class="text-center text-muted mb-2">
        Visualizando como admin: {{ nombreProfesionalSeleccionado }}
      </p>
      <div class="alert alert-warning shadow-sm d-flex justify-content-between align-items-center" role="alert">
        Realizar nueva encuesta <RouterLink class="btn btn-warning" to="/sop_encuesta">
          <i class="bi bi-file-earmark-plus-fill"></i>
        </RouterLink>
      </div>

      <h4>Detalle de Actividades
        <HoverInfoBadge badge-class="bg-success ms-2" :content="tooltipCerradosHoy">
          <i class="bi bi-check2-all"></i> {{ cantCerradosHoy }} cerrado{{ cantCerradosHoy !== 1 ? 's' : '' }} hoy
        </HoverInfoBadge>
        <span class="badge bg-primary ms-2">
          <i class="bi bi-calendar-week"></i> {{ cantCerradosSemana }} acumulado{{ cantCerradosSemana !== 1 ? 's' : '' }} semana
        </span>
      </h4>

      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#aux-pendientes" type="button" role="tab">
            Pendientes ({{ cantEncuestasPendientes }})
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" data-bs-toggle="tab" data-bs-target="#aux-devueltos" type="button" role="tab">
            Devueltos ({{ cantEncuestasDevueltas }})
          </button>
        </li>
      </ul>

      <div class="tab-content">
        <div class="tab-pane fade show active" id="aux-pendientes" role="tabpanel">
          <div v-if="!encuestasPendientes || encuestasPendientes.length === 0"
            class="alert alert-success shadow-sm text-center" role="alert">
            <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
            <h5 class="mt-3">¡Todo OK!</h5>
            <p class="mb-0">No hay registros pendientes en este momento.</p>
          </div>

          <div v-for="(encuesta, index) in encuestasPendientes" :key="`pend-${encuesta.id || index}`"
            class="container rounded-lg p-2 mb-2">
            <div :class="['row', 'paciente', 'shadow-sm', pacienteClass(encuesta)]">
              <div class="col-7 col-md-6">
                <small class="d-block"><strong>{{ encuesta.nombre1 }} {{ encuesta.nombre2 }} {{ encuesta.apellido1 }} {{ encuesta.apellido2 }}</strong></small>
                <small>EPS: {{ encuesta.eps }} | Riesgo: {{ encuesta.poblacionRiesgo }}</small>
                <small>Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha }}</small>
              </div>

              <div class="col-5 col-md-6 acciones-col">
                <div class="btn-grid">
                  <div class="btn-row">
                    <template v-if="esAuxiliarMostrado">
                      <template v-if="esConvenioExtramural(encuesta.convenio)">
                        <div v-if="!tieneVisitaAgendada(encuesta)">
                          <button type="button" class="btn btn-info agendar-btn" @click="Agendar(encuesta.id, 'visitamedica')">
                            <i class="bi bi-houses"></i>
                            <span class="agendar-label">Visita</span>
                          </button>
                        </div>
                        <div v-else>
                          <button type="button" class="btn btn-secondary agendar-btn" disabled>
                            <i class="bi bi-check2-circle"></i>
                            <span class="agendar-label">Visita</span>
                          </button>
                        </div>
                      </template>
                    </template>

                    <template v-if="esAuxiliarMostrado">
                      <div v-if="encuesta.status_caracterizacion === false">
                        <button type="button" class="btn btn-warning agendar-btn" @click="Caracterizar(encuesta.id)">
                          <i class="bi bi-calendar2-check"></i>
                          <span class="agendar-label">Caract</span>
                        </button>
                      </div>
                      <div v-else>
                        <button type="button" class="btn btn-secondary agendar-btn" disabled>
                          <i class="bi bi-check2-circle"></i>
                          <span class="agendar-label">Caract</span>
                        </button>
                      </div>
                    </template>

                    <div v-if="esAuxiliarMostrado || esMedicoMostrado">
                      <button type="button" class="btn btn-primary agendar-btn" @click="cupsGestion(encuesta.id)">
                        <i class="bi bi-calendar2-heart-fill"></i>
                        <span class="agendar-label">Cups</span>
                      </button>
                    </div>

                    <template v-if="esAuxiliarMostrado">
                      <div>
                        <button type="button" class="btn btn-danger agendar-btn" @click="eliminarRegistro(encuesta.id)"
                          :disabled="eliminandoRegistro === encuesta.id" :title="'Eliminar registro'">
                          <i class="bi bi-trash" v-if="eliminandoRegistro !== encuesta.id"></i>
                          <i class="bi bi-hourglass-split" v-else></i>
                          <span class="agendar-label">{{ eliminandoRegistro === encuesta.id ? 'Verif' : 'Elim' }}</span>
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-pane fade" id="aux-devueltos" role="tabpanel">
          <div v-if="!encuestasDevueltas || encuestasDevueltas.length === 0"
            class="alert alert-success shadow-sm text-center" role="alert">
            <i class="bi bi-check-circle-fill" style="font-size: 3rem;"></i>
            <h5 class="mt-3">Sin devoluciones</h5>
            <p class="mb-0">No hay pacientes devueltos para corrección.</p>
          </div>

          <div v-for="(encuesta, index) in encuestasDevueltas" :key="`dev-${encuesta.id || index}`"
            class="container rounded-lg p-2 mb-2">
            <div class="row paciente paciente-devuelto shadow-sm">
              <div class="col-7 col-md-6">
                <small class="d-block"><strong>{{ encuesta.nombre1 }} {{ encuesta.nombre2 }} {{ encuesta.apellido1 }} {{ encuesta.apellido2 }}</strong></small>
                <small>EPS: {{ encuesta.eps }} | Riesgo: {{ encuesta.poblacionRiesgo }}</small>
                <small>Nac: {{ encuesta.fechaNac }} | Enc: {{ encuesta.fecha }}</small>
                <div class="devolucion-nota mt-2">
                  <div class="devolucion-titulo"><i class="bi bi-arrow-counterclockwise me-1"></i> Paciente devuelto para corrección</div>
                </div>
              </div>

              <div class="col-5 col-md-6 acciones-col">
                <div class="btn-grid">
                  <div class="btn-row">
                    <div v-if="esAuxiliarMostrado || esMedicoMostrado">
                      <button type="button" class="btn btn-primary agendar-btn" @click="cupsGestion(encuesta.id)">
                        <i class="bi bi-calendar2-heart-fill"></i>
                        <span class="agendar-label">Cups</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import moment from "moment";
import { construirTooltipEpsCierres, contarCierresPorPeriodo } from "@/utils/gestionCounters";
import realtime_api from "@/api/realtimeApi";
import HoverInfoBadge from "@/components/HoverInfoBadge.vue";

export default {
  components: {
    HoverInfoBadge,
  },
  data() {
    return {
      cargando: true,
      fechaActual: "",
      eliminandoRegistro: null,
      rutaAnterior: null,
      errorCarga: null,
      encuestasContador: [],
    };
  },

  methods: {
    ...mapActions([
      "removeRegEnc",
      "getAllRegistersByFechaStatus",
      "getAsignacionesByEncuesta",
    ]),

    async eliminarRegistro(idEncuesta) {
      if (!confirm('¿Está seguro de que desea eliminar este registro?\n\nEsta acción eliminará el registro de actividades y la encuesta asociada.')) {
        return;
      }

      this.eliminandoRegistro = idEncuesta;

      try {
        const asignaciones = await this.getAsignacionesByEncuesta(idEncuesta);

        // Validar específicamente si hay CUPS (no solo propiedades del objeto)
        const hayCups = asignaciones && asignaciones.cups && 
          ((Array.isArray(asignaciones.cups) && asignaciones.cups.length > 0) ||
           (typeof asignaciones.cups === 'object' && Object.keys(asignaciones.cups).length > 0));

        if (hayCups) {
          alert('⚠️ No se puede eliminar el registro\n\nEste registro tiene CUPS asignados. Debe eliminar primero todos los CUPS antes de eliminar el registro principal.');
          return;
        }

        await this.removeRegEnc(idEncuesta);
        alert('✅ Registro eliminado exitosamente\n\nSe ha eliminado el registro de actividades y la encuesta asociada.');
        await this.cargarEncuestas();

      } catch (error) {
        console.error('Error al eliminar registro:', error);
        alert('⚠️ Error al eliminar el registro\n\n' + (error.message || 'Error desconocido. Intente nuevamente.'));
      } finally {
        this.eliminandoRegistro = null;
      }
    },

    Agendar(id, tipo) {
      this.$router.push({
        name: "sop_agendamiento",
        params: { idEncuesta: id, tipo },
      });
    },

    Caracterizar(id) {
      this.$router.push({
        name: "sop_caracterizacion",
        params: { idEncuesta: id },
      });
    },

    esConvenioExtramural(convenio) {
      return String(convenio || "").trim().toLowerCase() === "extramural";
    },

    tieneVisitaAgendada(encuesta) {
      const agendaVisita = encuesta?.Agenda_Visitamedica
        ?? encuesta?.agendaVisitaMedica
        ?? encuesta?.agenda_visita_medica;

      return agendaVisita?.cita_visitamedica === true;
    },

    cupsGestion(id) {
      sessionStorage.setItem("rutaAnterior", "/sop_aux");
      const query = this.esEstadoView
        ? {
            estadoView: "1",
            profesionalDoc: this.documentoObjetivo,
            profesionalCargo: this.cargoMostrado,
            profesionalConvenio: this.convenioObjetivo,
            profesionalNombre: this.nombreProfesionalSeleccionado || this.userData?.nombre || "",
          }
        : {};

      this.$router.push({
        name: "sop_cups",
        params: { idEncuesta: id },
        query,
      });
    },
    getStatusKeyBandeja() {
      return this.esMedicoMostrado ? "status_gest_medica" : "status_gest_aux";
    },
    getFechaKeyBandeja() {
      return this.esMedicoMostrado ? "fechagestMedica" : "fechagestAuxiliar";
    },
    getDocKeysBandeja() {
      return this.esMedicoMostrado ? ["idMedicoAtiende"] : ["idEncuestador"];
    },
    esEstadoCerrado(valor) {
      if (valor === true || valor === 1 || valor === 2) return true;
      if (typeof valor === "string") {
        const limpio = valor.trim().toLowerCase();
        return limpio === "true" || limpio === "1" || limpio === "2";
      }
      if (typeof valor === "number") return valor >= 1;
      return false;
    },
    esPacienteDevuelto(encuesta) {
      const statusKey = this.getStatusKeyBandeja();
      const fechaKey = this.getFechaKeyBandeja();
      return !this.esEstadoCerrado(encuesta?.[statusKey]) && Boolean(String(encuesta?.[fechaKey] || "").trim());
    },
    pacienteClass(encuesta) {
      return this.esPacienteDevuelto(encuesta) ? "paciente-devuelto" : "";
    },

    async cargarFuenteContadores() {
      const docKey = this.esMedicoMostrado ? "idMedicoAtiende" : "idEncuestador";
      const params = {
        _ts: Date.now(),
        [docKey]: this.documentoObjetivo,
      };

      const convenioObjetivo = String(this.convenioObjetivo || "").trim();
      if (convenioObjetivo) {
        params.convenio = convenioObjetivo;
      }

      const { data } = await realtime_api.get("/Encuesta.json", {
        params,
      });

      this.encuestasContador = data
        ? Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }))
        : [];
    },

    async cargarEncuestas() {
      this.cargando = true;
      this.errorCarga = null;

      try {
        // Esperar a que App.vue sincronice userData desde localStorage
        let intentos = 0;
        while ((!this.userData || !this.userData.numDocumento) && intentos < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          intentos++;
        }

        const documentoObjetivo = String(this.documentoObjetivo || "").trim();
        if (!documentoObjetivo) {
          throw new Error('Usuario no disponible después de esperar');
        }

        await Promise.race([
          Promise.all([
            this.getAllRegistersByFechaStatus({
              idUsuario: documentoObjetivo,
            }),
            this.cargarFuenteContadores(),
          ]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout - tardó más de 10 segundos')), 10000)
          )
        ]);
      } catch (error) {
        console.error("Error cargando encuestas:", error.message);
        this.errorCarga = error.message || 'Error al cargar encuestas';
      } finally {
        // Esperar un mínimo de 500ms para que se vea el spinner
        await new Promise(resolve => setTimeout(resolve, 500));
        this.cargando = false;
        this.$forceUpdate();
      }
    },
  },

  computed: {
    ...mapState(["encuestas", "userData", "cantEncuestas"]),
    esEstadoView() {
      if (String(this.$route?.query?.estadoView || "") !== "1") return false;
      const docSeleccionado = String(this.$route?.query?.profesionalDoc || "").trim();
      if (!docSeleccionado) return false;

      const cargoActual = String(this.userData?.cargo || "").trim().toLowerCase();
      const esAdmin = cargoActual === "admin" || cargoActual === "administrador" || cargoActual === "superusuario";
      if (esAdmin) return true;

      const accesos = Array.isArray(this.userData?.accesosProfesionales)
        ? this.userData.accesosProfesionales
        : [];
      return accesos.map((item) => String(item || "").trim()).includes(docSeleccionado);
    },
    cargoMostrado() {
      if (this.esEstadoView) {
        const cargo = String(this.$route?.query?.profesionalCargo || "").trim();
        return cargo || "Auxiliar de enfermeria";
      }
      return this.userData?.cargo || "";
    },
    esAuxiliarMostrado() {
      return String(this.cargoMostrado || "").trim() === "Auxiliar de enfermeria";
    },
    esMedicoMostrado() {
      return String(this.cargoMostrado || "").trim() === "Medico";
    },
    nombreProfesionalSeleccionado() {
      return String(this.$route?.query?.profesionalNombre || "").trim();
    },
    documentoObjetivo() {
      if (this.esEstadoView) {
        const doc = String(this.$route?.query?.profesionalDoc || "").trim();
        if (doc) return doc;
      }
      return String(this.userData?.numDocumento || "").trim();
    },
    convenioObjetivo() {
      if (this.esEstadoView) {
        const convenio = String(this.$route?.query?.profesionalConvenio || "").trim();
        if (convenio) return convenio;
      }
      return String(this.userData?.convenio || "").trim();
    },
    encuestasFiltradasPorConvenio() {
      if (!this.encuestas || this.encuestas.length === 0) return [];
      if (!this.convenioObjetivo) return this.encuestas;

      const convenioUsuario = String(this.convenioObjetivo || "").trim().toLowerCase();
      // Filtrar encuestas donde el convenio coincida (normalizado)
      return this.encuestas.filter((encuesta) =>
        String(encuesta.convenio || "").trim().toLowerCase() === convenioUsuario
      );
    },
    encuestasContadorFiltradasPorConvenio() {
      if (!this.encuestasContador || this.encuestasContador.length === 0) return [];
      if (!this.convenioObjetivo) return this.encuestasContador;

      const convenioUsuario = String(this.convenioObjetivo || "").trim().toLowerCase();
      return this.encuestasContador.filter((encuesta) =>
        String(encuesta.convenio || "").trim().toLowerCase() === convenioUsuario
      );
    },
    encuestasPendientes() {
      return this.encuestasFiltradasPorConvenio.filter((encuesta) => !this.esPacienteDevuelto(encuesta));
    },
    encuestasDevueltas() {
      return this.encuestasFiltradasPorConvenio.filter((encuesta) => this.esPacienteDevuelto(encuesta));
    },
    cantEncuestasPendientes() {
      return this.encuestasPendientes.length;
    },
    cantEncuestasDevueltas() {
      return this.encuestasDevueltas.length;
    },
    cantEncuestasFiltradasPorConvenio() {
      return this.encuestasFiltradasPorConvenio.length;
    },
    cantCerradosHoy() {
      return contarCierresPorPeriodo(this.encuestasContadorFiltradasPorConvenio, {
        documentoObjetivo: this.documentoObjetivo,
        docKeys: this.getDocKeysBandeja(),
        statusKey: this.getStatusKeyBandeja(),
        fechaKey: this.getFechaKeyBandeja(),
        fechaInicio: this.fechaActual,
        fechaFin: this.fechaActual,
        esEstadoCerrado: this.esEstadoCerrado,
      });
    },
    tooltipCerradosHoy() {
      return construirTooltipEpsCierres(this.encuestasContadorFiltradasPorConvenio, {
        documentoObjetivo: this.documentoObjetivo,
        docKeys: this.getDocKeysBandeja(),
        statusKey: this.getStatusKeyBandeja(),
        fechaKey: this.getFechaKeyBandeja(),
        fechaInicio: this.fechaActual,
        fechaFin: this.fechaActual,
        esEstadoCerrado: this.esEstadoCerrado,
      });
    },
    cantCerradosSemana() {
      if (!this.fechaActual) return 0;
      return contarCierresPorPeriodo(this.encuestasContadorFiltradasPorConvenio, {
        documentoObjetivo: this.documentoObjetivo,
        docKeys: this.getDocKeysBandeja(),
        statusKey: this.getStatusKeyBandeja(),
        fechaKey: this.getFechaKeyBandeja(),
        fechaInicio: moment(this.fechaActual, "YYYY-MM-DD").startOf("isoWeek").format("YYYY-MM-DD"),
        fechaFin: moment(this.fechaActual, "YYYY-MM-DD").endOf("isoWeek").format("YYYY-MM-DD"),
        esEstadoCerrado: this.esEstadoCerrado,
      });
    },
  },

  watch: {
    '$route': {
      handler: function (to, from) {
        // Se dispara SIEMPRE que la ruta cambia, sin importar el nombre
        // Esto es crítico cuando presionas atrás del navegador
        console.log(`[sop_aux watch] Ruta cambió de ${from.name} a ${to.name}`);
        if (to.name === 'sop_aux') {
          console.log('[sop_aux watch] Cargando encuestas por cambio de ruta');
          this.cargarEncuestas();
        }
      },
      deep: true
    }
  },

  async mounted() {
    this.rutaAnterior = this.$route.name;
    this.fechaActual = moment().format("YYYY-MM-DD");
    this.cargando = true;
    await this.cargarEncuestas();
  },
};
</script>

<style scoped>
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-card {
  width: min(560px, calc(100vw - 32px));
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #dee2e6;
}

.progreso-indeterminado {
  width: 100%;
}

.acciones-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.agendar-btn {
  width: 50px;
  height: 50px;
  padding: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  line-height: 1;
  border: none;
  transition: all 0.2s ease;
}

.agendar-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.agendar-btn i {
  font-size: 16px;
}

.agendar-label {
  font-size: 9px;
  font-weight: 600;
}

.row.paciente {
  background: linear-gradient(
    90deg,
    #0f766e 0%,
    #0d9488 30%,
    #14b8a6 60%,
    #0d9488 80%,
    #0f766e 100%
  );
  border-radius: 10px;
  padding: 8px 10px;
  color: #ffffff;
  align-items: center;
}

.row.paciente small {
  display: block;
  color: #e6fffa;
  line-height: 1.4;
}

.row.paciente strong {
  color: #ffffff;
  font-size: 0.9rem;
}

.row.paciente.paciente-devuelto {
  background: linear-gradient(90deg, #7f1d1d 0%, #b91c1c 30%, #ef4444 65%, #b91c1c 85%, #7f1d1d 100%);
}

.devolucion-nota {
  margin-top: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.devolucion-titulo {
  font-weight: 700;
}
</style>

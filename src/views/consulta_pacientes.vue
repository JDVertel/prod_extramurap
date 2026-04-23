<template>
  <div class="container-fluid mt-5 pt-3">
    <h3 class="mb-4"><i class="bi bi-search"></i> Consulta de Pacientes</h3>
  

    <!-- FORMULARIO DE BÚSQUEDA -->
    <form class="row mb-3" @submit.prevent="consultarP">
      <div class="col-6 col-md-3 mb-3">
        <label for="tipodoc" class="form-label">Tipo de Documento</label>
        <select id="tipodoc" v-model="tipodoc" class="form-select" required>
          <option value="">Seleccione</option>
          <option v-for="doc in tipoDocumentoOptions" :key="doc.value" :value="doc.value">{{ doc.label }}</option>
        </select>
      </div>
      <div class="col-6 col-md-3 mb-3">
        <label for="numdoc" class="form-label">Número de Documento</label>
        <input type="text" id="numdoc" v-model="numdoc" class="form-control" required />
      </div>
      <div class="col-6 col-md-2">
        <button class="btn btn-sm btn-primary mt-4" type="submit" :disabled="cargandoPacientes">
          <i class="bi bi-search"></i> Consultar
        </button>
      </div>
    </form>

    <!-- Spinner de consulta -->
    <div class="mt-2">
      <div v-if="cargandoPacientes" class="progress-card progress-card-sm shadow-sm">
        <div class="small fw-semibold mb-2">Consultando pacientes</div>
        <div class="progress mb-2" role="progressbar" aria-label="Consultando pacientes" aria-valuemin="0"
          aria-valuemax="100" style="height: 14px;">
          <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
            Consultando...
          </div>
        </div>
        <div class="text-muted small">Buscando información del paciente solicitado.</div>
      </div>
    </div>

    <div class="container-fluid">
      <div v-if="
        !cargandoPacientes &&
        searchPerformed &&
        (!datosPaciente || datosPaciente.length === 0)
      " class="alert alert-warning">
        No hay registros para esa consulta.
      </div>

      <!-- VISTA DETALLADA DE PACIENTES -->
      <div v-if="datosPaciente && datosPaciente.length > 0">
        <div v-for="(paciente, index) in datosPaciente" :key="paciente.id" class="card mb-4">
          <div class="card-header bg-primary text-white">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ paciente.nombre1 }} {{ paciente.nombre2 }} {{ paciente.apellido1 }} {{ paciente.apellido2
                }}</strong>
                <span class="badge bg-light text-dark ms-2">{{ paciente.tipodoc }}-{{ paciente.numdoc }}</span>
                <span class="badge bg-light text-dark ms-2">{{ paciente.eps }}</span>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-warning" type="button" @click="iniciarEdicionEncuesta(paciente)">
                  <i class="bi bi-pencil-square"></i> Editar encuesta
                </button>
                <button v-if="esAdministrador" class="btn btn-sm btn-danger" type="button"
                  @click="eliminarPaciente(paciente.id)">
                  <i class="bi bi-trash"></i> Eliminar
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div v-if="pacienteEditandoId === paciente.id" class="alert alert-light border mb-3">
              <h6 class="mb-3"><i class="bi bi-pencil"></i> Editar datos de la encuesta</h6>
              <div class="row g-2">
                <div class="col-6 col-md-3">
                  <label class="form-label">Tipo Documento</label>
                  <select v-model="encuestaEdit.tipodoc" class="form-select form-select-sm">
                    <option value="">Seleccione</option>
                    <option v-for="doc in tipoDocumentoOptions" :key="`edit-${doc.value}`" :value="doc.value">{{ doc.label }}</option>
                  </select>
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Número Documento</label>
                  <input v-model="encuestaEdit.numdoc" class="form-control form-control-sm" type="text" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Primer Nombre</label>
                  <input v-model="encuestaEdit.nombre1" class="form-control form-control-sm" type="text" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Segundo Nombre</label>
                  <input v-model="encuestaEdit.nombre2" class="form-control form-control-sm" type="text" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Primer Apellido</label>
                  <input v-model="encuestaEdit.apellido1" class="form-control form-control-sm" type="text" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Segundo Apellido</label>
                  <input v-model="encuestaEdit.apellido2" class="form-control form-control-sm" type="text" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Fecha Nacimiento</label>
                  <input v-model="encuestaEdit.fechaNac" class="form-control form-control-sm" type="date" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Sexo</label>
                  <select v-model="encuestaEdit.sexo" class="form-select form-select-sm">
                    <option value="">Seleccione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Teléfono</label>
                  <input v-model="encuestaEdit.telefono" class="form-control form-control-sm" type="text" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">EPS</label>
                  <input v-model="encuestaEdit.eps" class="form-control form-control-sm" type="text" disabled />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label">Dirección</label>
                  <input v-model="encuestaEdit.direccion" class="form-control form-control-sm" type="text" />
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Régimen</label>
                  <select v-model="encuestaEdit.regimen" class="form-select form-select-sm">
                    <option value="">Seleccione</option>
                    <option v-for="reg in regimenOptions" :key="reg" :value="reg">{{ reg }}</option>
                  </select>
                </div>
                <div class="col-6 col-md-3">
                  <label class="form-label">Convenio</label>
                  <select v-model="encuestaEdit.convenio" class="form-select form-select-sm" disabled>
                    <option value="">Seleccione</option>
                    <option v-for="conv in convenioOptions" :key="conv" :value="conv">{{ conv }}</option>
                  </select>
                </div>
                <div class="col-12 d-flex gap-2 mt-2">
                  <button class="btn btn-sm btn-success" type="button" :disabled="guardandoEdicion"
                    @click="guardarEdicionEncuesta()">
                    <i class="bi bi-check-circle"></i>
                    {{ guardandoEdicion ? 'Guardando...' : 'Guardar cambios' }}
                  </button>
                  <button class="btn btn-sm btn-secondary" type="button" @click="cancelarEdicionEncuesta()">
                    <i class="bi bi-x-circle"></i> Cancelar
                  </button>
                </div>
              </div>
            </div>

            <!-- PESTAÑAS -->
            <ul class="nav nav-tabs mb-3" :id="'tabs-' + index" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" :id="'tab-encuesta-' + index" data-bs-toggle="tab"
                  :data-bs-target="'#content-encuesta-' + index" type="button" role="tab"
                  :aria-controls="'content-encuesta-' + index" aria-selected="true">
                  <i class="bi bi-file-earmark-text"></i> Encuesta
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :id="'tab-caracteres-' + index" data-bs-toggle="tab"
                  :data-bs-target="'#content-caracteres-' + index" type="button" role="tab"
                  :aria-controls="'content-caracteres-' + index" aria-selected="false">
                  <i class="bi bi-card-checklist"></i> Caracterización
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :id="'tab-asignaciones-' + index" data-bs-toggle="tab"
                  :data-bs-target="'#content-asignaciones-' + index" type="button" role="tab"
                  :aria-controls="'content-asignaciones-' + index" aria-selected="false">
                  <i class="bi bi-clipboard-check"></i> Asignaciones (CUPS)
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" :id="'tab-profesionales-' + index" data-bs-toggle="tab"
                  :data-bs-target="'#content-profesionales-' + index" type="button" role="tab"
                  :aria-controls="'content-profesionales-' + index" aria-selected="false">
                  <i class="bi bi-person-badge"></i> Profesionales
                </button>
              </li>
            </ul>

            <!-- CONTENIDO DE PESTAÑAS -->
            <div class="tab-content" :id="'tabContent-' + index">
              <!-- TAB: ENCUESTA -->
              <div :id="'content-encuesta-' + index" class="tab-pane fade show active" role="tabpanel"
                :aria-labelledby="'tab-encuesta-' + index">
                <div class="table-responsive">
                  <table class="table table-sm table-striped">
                    <tbody>
                      <tr>
                        <th style="width: 30%;">ID Encuesta</th>
                        <td><code>{{ paciente.id }}</code></td>
                      </tr>
                      <tr>
                        <th>Nombre</th>
                        <td>{{ paciente.nombre1 }} {{ paciente.nombre2 }} {{ paciente.apellido1 }} {{ paciente.apellido2
                        }}</td>
                      </tr>
                      <tr>
                        <th>Documento</th>
                        <td>{{ paciente.tipodoc }} - {{ paciente.numdoc }}</td>
                      </tr>
                      <tr>
                        <th>Fecha Nacimiento</th>
                        <td>{{ formatearFechaSoloDia(paciente.fechaNac) || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Sexo</th>
                        <td>{{ paciente.sexo }}</td>
                      </tr>
                      <tr>
                        <th>Dirección</th>
                        <td>{{ paciente.direccion }}</td>
                      </tr>
                      <tr>
                        <th>Comuna</th>
                        <td>{{ paciente.barrioVeredacomuna?.comuna || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Barrio</th>
                        <td>{{ paciente.barrioVeredacomuna?.barrio || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>EPS</th>
                        <td><strong>{{ paciente.eps }}</strong></td>
                      </tr>
                      <tr>
                        <th>Régimen</th>
                        <td>{{ paciente.regimen || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Población de Riesgo</th>
                        <td>{{ paciente.poblacionRiesgo || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Convenio</th>
                        <td>{{ paciente.convenio || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <th>Fecha Encuesta</th>
                        <td>{{ formatearFechaSoloDia(paciente.fecha) || 'N/A' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TAB: CARACTERIZACIÓN -->
              <div :id="'content-caracteres-' + index" class="tab-pane fade" role="tabpanel"
                :aria-labelledby="'tab-caracteres-' + index">
                <div v-if="paciente.caracterizacion && Object.keys(paciente.caracterizacion).length > 0"
                  class="table-responsive">
                  <table class="table table-sm table-striped">
                    <tbody>
                      <tr v-for="(valor, clave) in paciente.caracterizacion" :key="clave">
                        <th style="width: 30%;">{{ formatearClave(clave) }}</th>
                        <td>{{ formatearValor(valor) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="alert alert-info">
                  <i class="bi bi-info-circle"></i> No hay datos de caracterización registrados para esta encuesta.
                  <br>
                  <small class="text-muted">ID Encuesta: {{ paciente.id }}</small>
                </div>
              </div>

              <!-- TAB: ASIGNACIONES (CUPS) -->
              <div :id="'content-asignaciones-' + index" class="tab-pane fade" role="tabpanel"
                :aria-labelledby="'tab-asignaciones-' + index">

                <div
                  v-if="paciente.asignaciones && paciente.asignaciones.cups && Object.keys(paciente.asignaciones.cups).length > 0">
                  <div class="small text-muted mb-2">
                    Haz clic en una cabecera para agrupar/ordenar.
                  </div>
                  <table class="table table-sm table-striped table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th role="button" @click="setOrdenAsignaciones('codigo')">
                          Código {{ indicadorOrdenAsignaciones('codigo') }}
                        </th>
                        <th role="button" @click="setOrdenAsignaciones('descripcion')">
                          Descripción CUPS {{ indicadorOrdenAsignaciones('descripcion') }}
                        </th>
                        <th role="button" @click="setOrdenAsignaciones('actividad')">
                          Actividad {{ indicadorOrdenAsignaciones('actividad') }}
                        </th>
                        <th role="button" @click="setOrdenAsignaciones('profesional')">
                          Profesional {{ indicadorOrdenAsignaciones('profesional') }}
                        </th>
                        <th role="button" @click="setOrdenAsignaciones('cantidad')">
                          Cantidad {{ indicadorOrdenAsignaciones('cantidad') }}
                        </th>
                        <th>Detalle</th>
                        <th role="button" @click="setOrdenAsignaciones('grupo')">
                          Grupo {{ indicadorOrdenAsignaciones('grupo') }}
                        </th>
                        <th role="button" @click="setOrdenAsignaciones('convenio')">
                          Convenio {{ indicadorOrdenAsignaciones('convenio') }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(cup, idxCup) in obtenerCupsOrdenados(paciente.asignaciones.cups)"
                        :key="`${paciente.id}-cup-${idxCup}`">
                        <td>{{ cup.codigo || cup.cupsId || '-' }}</td>
                        <td><strong>{{ cup.DescripcionCUP || cup.cupsNombre || 'Sin descripción' }}</strong></td>
                        <td>{{ getNombreActividad(cup.actividadId) }}</td>
                        <td><span class="badge bg-info">{{ formatearProfesionalesCup(cup.nombreProf || cup.key) || 'N/A' }}</span></td>
                        <td class="text-center">{{ cup.cantidad || 1 }}</td>
                        <td>{{ cup.detalle || '-' }}</td>
                        <td>{{ cup.Grupo || '-' }}</td>
                        <td>{{ cup.convenio || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="alert alert-success mt-2">
                    <i class="bi bi-check-circle"></i> Total de CUPS: <strong>{{
                      Object.keys(paciente.asignaciones.cups).length }}</strong>
                  </div>
                </div>
                <div v-else class="alert alert-info">
                  <i class="bi bi-info-circle"></i> No hay CUPS asignados para esta encuesta.
                  <br>
                  <small class="text-muted">ID Encuesta: {{ paciente.id }}</small>
                </div>
              </div>

              <!-- TAB: PROFESIONALES -->
              <div :id="'content-profesionales-' + index" class="tab-pane fade" role="tabpanel"
                :aria-labelledby="'tab-profesionales-' + index">
                <div v-if="obtenerAsignacionesProfesionales(paciente).length > 0" class="table-responsive">
                  <table class="table table-sm table-striped table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Rol</th>
                        <th>Documento</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Fecha de cierre</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(prof, idxProf) in obtenerAsignacionesProfesionales(paciente)"
                        :key="`${paciente.id}-prof-${idxProf}`">
                        <td>{{ prof.rol }}</td>
                        <td>{{ prof.documento || '-' }}</td>
                        <td>{{ prof.nombre || '-' }}</td>
                        <td>
                          <span class="badge" :class="prof.cerrado ? 'bg-success' : 'bg-warning text-dark'">
                            {{ prof.cerrado ? 'Cerrado' : 'Pendiente' }}
                          </span>
                        </td>
                        <td>{{ prof.fechaCierre || 'Sin cierre' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="alert alert-info">
                  <i class="bi bi-info-circle"></i> No hay profesionales asignados para esta encuesta.
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
import { mapState, mapActions, mapMutations } from "vuex";
import { encuestasApi } from "@/api/modulesApi";
import { getAllUsers } from "@/api/usersApi";

export default {
  name: "ConsultaPacientes",
  data() {
    return {
      cargandoPacientes: false,
      guardandoEdicion: false,
      searchPerformed: false,
      tipodoc: "",
      numdoc: "",
      pacienteEditandoId: null,
      encuestaEdit: {
        tipodoc: "",
        numdoc: "",
        nombre1: "",
        nombre2: "",
        apellido1: "",
        apellido2: "",
        fechaNac: "",
        sexo: "",
        direccion: "",
        telefono: "",
        eps: "",
        regimen: "",
        convenio: "",
      },
      tipoDocumentoOptions: [
        { value: "RC", label: "Registro Civil" },
        { value: "TI", label: "Tarjeta de Identidad" },
        { value: "CC", label: "Cédula de Ciudadanía" },
        { value: "CE", label: "Cédula de Extranjería" },
        { value: "NV", label: "Certificado nacido vivo" },
        { value: "PA", label: "Pasaporte" },
        { value: "PE", label: "Permiso Especial de Permanencia" },
        { value: "MS", label: "Menor sin identificación" },
        { value: "AS", label: "Adulto sin identificación" },
        { value: "PT", label: "Permiso por protección temporal" },
      ],
      regimenOptions: ["Contributivo", "Subsidiado", "Especial", "PPNA"],
      usuariosPorDocumento: {},
      ordenAsignacionesPor: "actividad",
      ordenAsignacionesDir: "asc",
    };
  },
  computed: {
    ...mapState(["datosPaciente", "userData", "actividadesExtra"]),
    esAdministrador() {
      return this.userData && (this.userData.cargo === "Administrador" || this.userData.cargo === "admin");
    },
    convenioOptions() {
      const opciones = new Set();
      const convenioUsuario = String(this.userData?.convenio || "").trim();
      const convenioEdit = String(this.encuestaEdit?.convenio || "").trim();

      if (convenioUsuario) opciones.add(convenioUsuario);
      if (convenioEdit) opciones.add(convenioEdit);

      (this.datosPaciente || []).forEach((paciente) => {
        const convenio = String(paciente?.convenio || "").trim();
        if (convenio) opciones.add(convenio);
      });

      return Array.from(opciones);
    }
  },
  methods: {
    ...mapMutations(["setDatosPaciente"]),
    ...mapActions([
      "getAllByPacientesID",
      "deletePaciente",
      "deleteActividadesByPacienteId",
      "deleteAsignacionesByPacienteId",
      "getAllActividadesExtra",
    ]),

    limpiarConsultaPacientes() {
      this.setDatosPaciente([]);
      this.pacienteEditandoId = null;
      this.tipodoc = "";
      this.numdoc = "";
      this.searchPerformed = false;
    },

    async consultarP() {
      if (this.tipodoc === "" || this.numdoc === "") {
        alert("Por favor, complete todos los campos.");
        return;
      }
      this.cargandoPacientes = true;
      this.searchPerformed = true;
      try {
        await this.getAllByPacientesID({
          tipodoc: this.tipodoc,
          numdoc: this.numdoc,
        });
      } catch (error) {
        console.error("[consultarP] Error:", error);
        alert("Error al consultar pacientes: " + error?.message || error);
      } finally {
        this.cargandoPacientes = false;
      }
    },

    getNombreActividad(actividadKey) {
      // Buscar el nombre de la actividad en actividadesExtra por su key
      const actividad = this.actividadesExtra?.find(act => act.key === actividadKey);
      return actividad?.nombre || actividadKey || 'Actividad sin nombre';
    },

    setOrdenAsignaciones(campo) {
      if (this.ordenAsignacionesPor === campo) {
        this.ordenAsignacionesDir = this.ordenAsignacionesDir === "asc" ? "desc" : "asc";
        return;
      }

      this.ordenAsignacionesPor = campo;
      this.ordenAsignacionesDir = "asc";
    },

    indicadorOrdenAsignaciones(campo) {
      if (this.ordenAsignacionesPor !== campo) return "↕";
      return this.ordenAsignacionesDir === "asc" ? "↑" : "↓";
    },

    obtenerCupsOrdenados(cupsData) {
      const lista = Array.isArray(cupsData) ? cupsData : Object.values(cupsData || {});

      const valorOrden = (cup) => {
        switch (this.ordenAsignacionesPor) {
          case "actividad":
            return this.getNombreActividad(cup?.actividadId);
          case "profesional":
            return this.formatearProfesionalesCup(cup?.nombreProf || cup?.key);
          case "codigo":
            return cup?.codigo || cup?.cupsId || "";
          case "descripcion":
            return cup?.DescripcionCUP || cup?.cupsNombre || "";
          case "cantidad":
            return Number(cup?.cantidad || 1);
          case "grupo":
            return cup?.Grupo || "";
          case "convenio":
            return cup?.convenio || "";
          default:
            return this.getNombreActividad(cup?.actividadId);
        }
      };

      return [...lista].sort((a, b) => {
        const va = valorOrden(a);
        const vb = valorOrden(b);

        let resultado = 0;
        if (typeof va === "number" || typeof vb === "number") {
          resultado = Number(va || 0) - Number(vb || 0);
        } else {
          resultado = String(va || "").localeCompare(String(vb || ""), "es", { sensitivity: "base" });
        }

        return this.ordenAsignacionesDir === "desc" ? -resultado : resultado;
      });
    },

    formatearClave(clave) {
      return clave
        .replace(/([A-Z])/g, ' $1')
        .replace(/(_)/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    },

    formatearValor(valor) {
      if (typeof valor === 'boolean') {
        return valor ? '✓ Sí' : '✗ No';
      }
      if (Array.isArray(valor)) {
        return valor
          .map((item) => {
            if (item && typeof item === 'object') {
              return Object.entries(item)
                .filter(([, itemValor]) => itemValor !== undefined && itemValor !== null && String(itemValor).trim() !== '')
                .map(([itemClave, itemValor]) => `${this.formatearClave(itemClave)}: ${itemValor}`)
                .join(' | ');
            }

            return String(item ?? '').trim();
          })
          .filter(Boolean)
          .join(' ; ') || 'N/A';
      }
      if (typeof valor === 'object' && valor !== null) {
        return Object.entries(valor)
          .filter(([, itemValor]) => itemValor !== undefined && itemValor !== null && String(itemValor).trim() !== '')
          .map(([itemClave, itemValor]) => `${this.formatearClave(itemClave)}: ${itemValor}`)
          .join(' | ') || 'N/A';
      }
      return valor || 'N/A';
    },

    formatearProfesionalesCup(profesionales) {
      return Array.from(new Set(
        (Array.isArray(profesionales) ? profesionales : [profesionales])
          .map((item) => String(item || '').trim())
          .filter(Boolean)
      )).join(', ');
    },

    formatearFechaSoloDia(valorFecha) {
      if (!valorFecha) return "";
      const texto = String(valorFecha).trim();

      // Si viene en ISO u otro formato con hora, conservar solo YYYY-MM-DD.
      const matchIso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
      if (matchIso) return matchIso[1];

      const fecha = new Date(texto);
      if (!Number.isNaN(fecha.getTime())) {
        return fecha.toISOString().slice(0, 10);
      }

      return texto;
    },

    formatearFechaConHora(valorFecha) {
      if (!valorFecha) return "";
      const texto = String(valorFecha).trim();

      // Si viene sin zona horaria, mantener la hora literal y solo formatear AM/PM.
      const matchIsoLocal = texto.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/);
      if (matchIsoLocal) {
        const fecha = matchIsoLocal[1];
        let hNum = Number(matchIsoLocal[2]);
        const mm = String(matchIsoLocal[3] || "00").padStart(2, "0");
        const ss = String(matchIsoLocal[4] || "00").padStart(2, "0");
        const periodo = hNum >= 12 ? "PM" : "AM";
        hNum = hNum % 12;
        if (hNum === 0) hNum = 12;
        const hh = String(hNum).padStart(2, "0");
        return `${fecha} ${hh}:${mm}:${ss} ${periodo}`;
      }

      const fecha = new Date(texto);
      if (!Number.isNaN(fecha.getTime())) {
        const partes = new Intl.DateTimeFormat("es-CO", {
          timeZone: "America/Bogota",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).formatToParts(fecha);

        const tomar = (tipo) => partes.find((p) => p.type === tipo)?.value || "";
        const dd = tomar("day");
        const mm = tomar("month");
        const yyyy = tomar("year");
        const hh = tomar("hour");
        const mi = tomar("minute");
        const ss = tomar("second");
        const dayPeriod = String(tomar("dayPeriod") || "").toUpperCase();

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} ${dayPeriod}`.trim();
      }

      return texto;
    },

    normalizarDocumento(valor) {
      return String(valor ?? "").trim();
    },

    esEstadoCerrado(valor) {
      if (valor === true || valor === 1) return true;
      if (typeof valor === "string") {
        const limpio = valor.trim().toLowerCase();
        return limpio === "true" || limpio === "1" || limpio === "2" || limpio === "cerrado";
      }
      if (typeof valor === "number") return valor >= 1;
      return false;
    },

    obtenerNombreProfesional(documento) {
      const doc = this.normalizarDocumento(documento);
      if (!doc) return "";
      const persona = this.usuariosPorDocumento[doc];
      if (!persona) return doc;

      const nombre = [persona.nombre1, persona.nombre2, persona.apellido1, persona.apellido2]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .join(" ");

      return nombre || persona.nombre || persona.usuario || doc;
    },

    obtenerAsignacionesProfesionales(paciente) {
      if (!paciente) return [];

      const roles = [
        {
          rol: "Auxiliar",
          documento: paciente.idEncuestador,
          estado: paciente.status_gest_aux,
          fecha: paciente.fechagestAuxiliar,
        },
        {
          rol: "Médico",
          documento: paciente.idMedicoAtiende,
          estado: paciente.status_gest_medica,
          fecha: paciente.fechagestMedica,
        },
        {
          rol: "Enfermero",
          documento: paciente.idEnfermeroAtiende,
          estado: paciente.status_gest_enfermera,
          fecha: paciente.fechagestEnfermera,
        },
        {
          rol: "Psicólogo",
          documento: paciente.idPsicologoAtiende,
          estado: paciente.status_gest_psicologo,
          fecha: paciente.fechagestPsicologo,
        },
        {
          rol: "Trabajador social",
          documento: paciente.idTsocialAtiende,
          estado: paciente.status_gest_tsocial,
          fecha: paciente.fechagestTsocial,
        },
        {
          rol: "Nutricionista",
          documento: paciente.idNutricionistaAtiende || paciente.idNutriAtiende,
          estado: paciente.status_gest_nutricionista,
          fecha: paciente.fechagestNutricionista,
        },
        {
          rol: "Facturación",
          documento: paciente.asigfact || paciente.asig_fact,
          estado: paciente.status_facturacion,
          fecha: paciente.fechaFacturacion || paciente.FechaFacturacion,
        },
      ];

      return roles
        .map((item) => {
          const documento = this.normalizarDocumento(item.documento);
          if (!documento) return null;

          const cerrado = this.esEstadoCerrado(item.estado);
          return {
            rol: item.rol,
            documento,
            nombre: this.obtenerNombreProfesional(documento),
            cerrado,
            fechaCierre: cerrado ? (this.formatearFechaConHora(item.fecha) || "") : "",
          };
        })
        .filter(Boolean);
    },

    iniciarEdicionEncuesta(paciente) {
      this.pacienteEditandoId = paciente.id;
      this.encuestaEdit = {
        tipodoc: paciente.tipodoc || "",
        numdoc: paciente.numdoc || "",
        nombre1: paciente.nombre1 || "",
        nombre2: paciente.nombre2 || "",
        apellido1: paciente.apellido1 || "",
        apellido2: paciente.apellido2 || "",
        fechaNac: this.formatearFechaSoloDia(paciente.fechaNac) || "",
        sexo: paciente.sexo || "",
        direccion: paciente.direccion || "",
        telefono: paciente.telefono || "",
        eps: paciente.eps || "",
        regimen: paciente.regimen || "",
        convenio: paciente.convenio || "",
      };
    },

    cancelarEdicionEncuesta() {
      this.pacienteEditandoId = null;
    },

    async guardarEdicionEncuesta() {
      if (!this.pacienteEditandoId) return;
      this.guardandoEdicion = true;

      try {
        await encuestasApi.update(this.pacienteEditandoId, {
          ...this.encuestaEdit,
        });

        alert("✅ Datos de encuesta actualizados correctamente.");
        this.limpiarConsultaPacientes();
      } catch (error) {
        console.error("[guardarEdicionEncuesta] Error:", error);
        alert("❌ Error al guardar cambios: " + (error?.message || error));
      } finally {
        this.guardandoEdicion = false;
      }
    },

    async eliminarPaciente(idEncuesta) {
      if (!idEncuesta) return;

      // Validar que sea administrador
      if (!this.esAdministrador) {
        alert("⚠️ Solo los administradores pueden eliminar pacientes.");
        return;
      }

      const mensaje = `⚠️ ACCIÓN ADMINISTRATIVA: Esta acción eliminará PERMANENTEMENTE:
      
✓ La encuesta del paciente
✓ Todos los registros de Actividades
✓ Todos los CUPS asignados (Asignaciones)
✓ Toda la Caracterización asociada

¿Está seguro de que desea continuar? 
Esta acción NO se puede deshacer.`;

      const confirmed = confirm(mensaje);
      if (!confirmed) return;

      // Confirmación adicional para mayor seguridad
      const confirmacionFinal = confirm(`⚠️ ÚLTIMA OPORTUNIDAD: ¿Desea eliminar este paciente?\n\nEsta acción NO se puede deshacer.`);
      if (!confirmacionFinal) return;

      try {
        console.log(`[eliminarPaciente] Iniciando eliminación para: ${idEncuesta}`);

        // Eliminar en cascada sin validaciones (modo administrador)
        console.log(`[eliminarPaciente] Modo ADMINISTRADOR - Eliminación cascada sin validación`);

        // 1. Eliminar Asignaciones
        try {
          console.log(`[eliminarPaciente] Paso 1: Eliminando asignaciones...`);
          await this.deleteAsignacionesByPacienteId(idEncuesta);
          console.log(`[eliminarPaciente] Asignaciones eliminadas con éxito`);
        } catch (err) {
          console.warn(`[eliminarPaciente] Advertencia al eliminar asignaciones:`, err?.message || err);
        }

        // 2. Eliminar Actividades
        try {
          console.log(`[eliminarPaciente] Paso 2: Eliminando actividades...`);
          await this.deleteActividadesByPacienteId(idEncuesta);
          console.log(`[eliminarPaciente] Actividades eliminadas con éxito`);
        } catch (err) {
          console.warn(`[eliminarPaciente] Advertencia al eliminar actividades:`, err?.message || err);
        }

        // 3. Eliminar Encuesta
        try {
          console.log(`[eliminarPaciente] Paso 3: Eliminando encuesta...`);
          await this.deletePaciente(idEncuesta);
          console.log(`[eliminarPaciente] Encuesta eliminada con éxito`);
        } catch (err) {
          console.warn(`[eliminarPaciente] Advertencia al eliminar encuesta:`, err?.message || err);
        }

        alert("✅ Registro eliminado exitosamente\n\nSe ha eliminado la encuesta y todos sus datos asociados.");
        this.limpiarConsultaPacientes();

      } catch (error) {
        console.error(`[eliminarPaciente] Error general:`, error);
        alert("❌ Error al eliminar el registro: " + (error?.message || error));
      }
    },
  },
  async mounted() {
    try {
      await this.getAllActividadesExtra();

      const usuarios = await getAllUsers();
      this.usuariosPorDocumento = (usuarios || []).reduce((acc, item) => {
        const documento = this.normalizarDocumento(item?.numDocumento || item?.numdoc || item?.documento);
        if (documento) acc[documento] = item;
        return acc;
      }, {});
    } catch (error) {
      console.error("[ConsultaPacientes] Error al cargar catálogos:", error);
    }
  }
};
</script>

<style scoped>
.card {
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table-responsive {
  border-radius: 0.25rem;
}

code {
  background-color: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
}

.progress-card {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 16px;
  padding: 16px 18px;
  border: 1px solid #dee2e6;
}

.progress-card-sm {
  max-width: 420px;
}

.progreso-indeterminado {
  width: 100%;
}
</style>

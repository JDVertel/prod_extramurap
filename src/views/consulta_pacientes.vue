<template>
  <div class="container-fluid mt-5 pt-3">
    <h3 class="mb-4"><i class="bi bi-search"></i> Consulta de Pacientes</h3>
  

    <!-- FORMULARIO DE BÚSQUEDA -->
    <form class="row mb-3" @submit.prevent="consultarP">
      <div class="col-12 col-md-6 col-lg-5 mb-3">
        <label for="numdoc" class="form-label">Número de Documento</label>
        <input
          type="text"
          id="numdoc"
          v-model="numdoc"
          class="form-control"
          required
          placeholder="Ej: 10203040 o solo una parte del documento"
          autocomplete="off"
        />
      </div>
      <div class="col-12 col-md-2">
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

      <!-- LISTADO DE PACIENTES ENCONTRADOS (ACORDEÓN) -->
      <div v-if="datosPaciente && datosPaciente.length > 0">
        <div class="card consulta-resultados-card mb-3">
          <div class="card-header consulta-resultados-header">
            <div>
              <span class="consulta-eyebrow">Resultados de búsqueda</span>
              <strong>Pacientes encontrados para: {{ numdoc }}</strong>
            </div>
            <span class="consulta-resultados-count">{{ datosPaciente.length }} registro(s)</span>
          </div>

          <div class="accordion consulta-acordeon" id="acordeonConsultaPacientes">
            <div
              v-for="(paciente, index) in datosPacienteOrdenados"
              :key="`acordeon-${paciente.id}`"
              class="accordion-item consulta-acordeon-item">
              <h2 class="accordion-header" :id="`heading-consulta-${index}`">
                <button
                  class="accordion-button consulta-acordeon-btn"
                  type="button"
                  :class="{ collapsed: pacienteDetalleAbiertoId !== paciente.id }"
                  :aria-expanded="pacienteDetalleAbiertoId === paciente.id ? 'true' : 'false'"
                  :aria-controls="`collapse-consulta-${index}`"
                  @click="togglePanelPaciente(paciente.id)">
                  <div class="consulta-acordeon-resumen">
                    <div class="consulta-acordeon-col">
                      <span class="consulta-acordeon-label">Fecha intervención</span>
                      <span class="consulta-acordeon-valor">{{ formatearFechaIntervencion(paciente) || 'N/A' }}</span>
                    </div>
                    <div class="consulta-acordeon-col">
                      <span class="consulta-acordeon-label">Convenio</span>
                      <span class="consulta-acordeon-valor">{{ paciente.convenio || 'N/A' }}</span>
                    </div>
                    <div class="consulta-acordeon-col">
                      <span class="consulta-acordeon-label">Documento</span>
                      <span class="consulta-acordeon-valor">{{ paciente.tipodoc || '-' }}-{{ paciente.numdoc || '-' }}</span>
                    </div>
                    <div class="consulta-acordeon-col">
                      <span class="consulta-acordeon-label">Nombres</span>
                      <span class="consulta-acordeon-valor">{{ nombresPaciente(paciente) || '-' }}</span>
                    </div>
                    <div class="consulta-acordeon-col">
                      <span class="consulta-acordeon-label">Apellidos</span>
                      <span class="consulta-acordeon-valor">{{ apellidosPaciente(paciente) || '-' }}</span>
                    </div>
                    <div class="consulta-acordeon-col">
                      <span class="consulta-acordeon-label">Fecha de nacimiento</span>
                      <span class="consulta-acordeon-valor">{{ formatearFechaSoloDia(paciente.fechaNac) || 'N/A' }}</span>
                    </div>
                    <div class="consulta-acordeon-col">
                      <span class="consulta-acordeon-label">EPS</span>
                      <span class="consulta-acordeon-valor">{{ paciente.eps || 'N/A' }}</span>
                    </div>
                  </div>
                </button>
              </h2>

              <div
                :id="`collapse-consulta-${index}`"
                class="accordion-collapse collapse"
                :class="{ show: pacienteDetalleAbiertoId === paciente.id }"
                :aria-labelledby="`heading-consulta-${index}`">
                <div class="accordion-body consulta-acordeon-body">
                  <div class="consulta-detalle-toolbar">
                    <div class="consulta-detalle-titulo">
                      <strong>Detalle del registro</strong>
                      <span v-if="paciente.grupo">Grupo {{ paciente.grupo }}</span>
                    </div>
                    <div class="consulta-detalle-actions d-flex flex-wrap gap-2">
                      <button
                        v-if="!tieneActividadesFacturadas(paciente)"
                        class="btn btn-sm btn-warning"
                        type="button"
                        @click="iniciarEdicionEncuesta(paciente)">
                        <i class="bi bi-pencil-square"></i> Editar encuesta
                      </button>
                      <button
                        v-if="puedeEliminarPaciente(paciente)"
                        class="btn btn-sm btn-danger"
                        type="button"
                        @click="eliminarPaciente(paciente)">
                        <i class="bi bi-trash"></i> Eliminar
                      </button>
                      <small
                        v-if="tieneActividadesFacturadas(paciente)"
                        class="text-danger align-self-center">
                        No se puede editar ni eliminar: hay actividades facturadas
                      </small>
                    </div>
                  </div>

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
              <li class="nav-item" role="presentation">
                <button class="nav-link" :id="'tab-facturados-' + index" data-bs-toggle="tab"
                  :data-bs-target="'#content-facturados-' + index" type="button" role="tab"
                  :aria-controls="'content-facturados-' + index" aria-selected="false">
                  <i class="bi bi-receipt"></i> Facturados
                  <span
                    v-if="obtenerResumenFacturados(paciente).totalActividades > 0"
                    class="badge bg-success ms-1">
                    {{ obtenerResumenFacturados(paciente).totalActividades }}
                  </span>
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
                        <td>{{ paciente.tipodoc || '-' }}-{{ paciente.numdoc || '-' }}</td>
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
                        <th>Fecha intervención</th>
                        <td>{{ formatearFechaIntervencion(paciente) || 'N/A' }}</td>
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

              <!-- TAB: FACTURADOS -->
              <div :id="'content-facturados-' + index" class="tab-pane fade" role="tabpanel"
                :aria-labelledby="'tab-facturados-' + index">
                <div v-if="obtenerResumenFacturados(paciente).profesionales.length > 0">
                  <div class="alert alert-success py-2 mb-3">
                    <i class="bi bi-receipt"></i>
                    Total actividades facturadas:
                    <strong>{{ obtenerResumenFacturados(paciente).totalActividades }}</strong>
                    · CUPS facturados:
                    <strong>{{ obtenerResumenFacturados(paciente).totalCups }}</strong>
                  </div>
                  <div class="table-responsive">
                    <table class="table table-sm table-striped table-bordered">
                      <thead class="table-light">
                        <tr>
                          <th>Profesional</th>
                          <th>Rol</th>
                          <th class="text-center">Actividades</th>
                          <th class="text-center">CUPS</th>
                          <th>Facturas</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, idxFact) in obtenerResumenFacturados(paciente).profesionales"
                          :key="`${paciente.id}-fact-${idxFact}`">
                          <td>
                            <strong>{{ item.nombre || 'Sin nombre' }}</strong>
                            <small v-if="item.documento" class="text-muted d-block">{{ item.documento }}</small>
                          </td>
                          <td><span class="badge bg-info">{{ item.rol || 'N/A' }}</span></td>
                          <td class="text-center">
                            <span class="badge bg-success rounded-pill">{{ item.cantidadActividades }}</span>
                          </td>
                          <td class="text-center">{{ item.cantidadCups }}</td>
                          <td>{{ item.facturas || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else class="alert alert-info">
                  <i class="bi bi-info-circle"></i> No hay actividades facturadas para esta encuesta.
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
      numdoc: "",
      pacienteDetalleAbiertoId: null,
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
      const cargo = this.normalizarTexto(this.userData?.cargo);
      return cargo === "administrador" || cargo === "admin" || cargo === "superusuario";
    },
    esJefe() {
      const cargo = this.normalizarTexto(this.userData?.cargo);
      return cargo === "jefe" || cargo === "jefe de enfermeria" || cargo === "enfermero" || cargo === "enfermera";
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
    },
    datosPacienteOrdenados() {
      const lista = Array.isArray(this.datosPaciente) ? [...this.datosPaciente] : [];

      return lista.sort((a, b) => {
        const fechaB = this.timestampFechaIntervencion(b);
        const fechaA = this.timestampFechaIntervencion(a);

        if (fechaB !== fechaA) {
          return fechaB - fechaA;
        }

        return String(b?.id || "").localeCompare(String(a?.id || ""), "es", {
          numeric: true,
          sensitivity: "base",
        });
      });
    },
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
      this.pacienteDetalleAbiertoId = null;
      this.numdoc = "";
      this.searchPerformed = false;
    },

    async consultarP() {
      if (this.numdoc === "") {
        alert("Por favor, ingrese el número de documento.");
        return;
      }
      this.cargandoPacientes = true;
      this.searchPerformed = true;
      this.pacienteDetalleAbiertoId = null;
      try {
        await this.getAllByPacientesID({
          numdoc: this.numdoc,
          parcial: true,
        });
      } catch (error) {
        console.error("[consultarP] Error:", error);
        alert("Error al consultar pacientes: " + error?.message || error);
      } finally {
        this.cargandoPacientes = false;
      }
    },

    nombresPaciente(paciente = {}) {
      return [paciente.nombre1, paciente.nombre2]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .join(" ");
    },

    apellidosPaciente(paciente = {}) {
      return [paciente.apellido1, paciente.apellido2]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .join(" ");
    },

    obtenerValorFechaIntervencion(paciente = {}) {
      return paciente.fecha ?? paciente.Fecha ?? paciente.fecha_encuesta ?? paciente.fechaEncuesta ?? "";
    },

    formatearFechaIntervencion(paciente = {}) {
      return this.formatearFechaSoloDia(this.obtenerValorFechaIntervencion(paciente));
    },

    timestampFechaIntervencion(paciente = {}) {
      const ymd = this.formatearFechaIntervencion(paciente);
      if (!ymd) return 0;

      const timestamp = Date.parse(`${ymd}T00:00:00`);
      return Number.isNaN(timestamp) ? 0 : timestamp;
    },

    abrirPanelPaciente(pacienteId) {
      this.pacienteDetalleAbiertoId = pacienteId;
    },

    togglePanelPaciente(pacienteId) {
      this.pacienteDetalleAbiertoId =
        this.pacienteDetalleAbiertoId === pacienteId ? null : pacienteId;
    },

    normalizarTexto(valor) {
      return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
    },

    normalizarGrupo(valor) {
      return String(valor ?? "").trim().toLowerCase();
    },

    pacientePerteneceAlGrupoDelUsuario(paciente = {}) {
      const grupoUsuario = this.normalizarGrupo(this.userData?.grupo);
      const grupoPaciente = this.normalizarGrupo(paciente?.grupo || paciente?.Grupo);
      return Boolean(grupoUsuario && grupoPaciente && grupoUsuario === grupoPaciente);
    },

    puedeVerBotonEliminar(paciente = {}) {
      return this.esAdministrador || (this.esJefe && this.pacientePerteneceAlGrupoDelUsuario(paciente));
    },

    puedeEliminarPaciente(paciente = {}) {
      return this.puedeVerBotonEliminar(paciente) && !this.tieneActividadesFacturadas(paciente);
    },

    motivoBloqueoEliminar(paciente = {}) {
      if (!this.puedeVerBotonEliminar(paciente)) {
        return "Solo administradores o la jefe del grupo pueden eliminar.";
      }
      if (this.tieneActividadesFacturadas(paciente)) {
        return "No se puede eliminar: el paciente tiene actividades facturadas.";
      }
      return "Eliminar paciente";
    },

    obtenerListaCupsPaciente(paciente = {}) {
      const cups = paciente?.asignaciones?.cups;
      if (!cups) return [];
      return Array.isArray(cups) ? cups.filter(Boolean) : Object.values(cups).filter(Boolean);
    },

    esCupFacturado(cup = {}) {
      if (cup?.facturado === true || cup?.facturado === 1 || cup?.facturado === "1") return true;
      return String(cup?.FactNum || cup?.factNum || cup?.fact_num || "").trim().length > 0;
    },

    tieneActividadesFacturadas(paciente = {}) {
      return this.obtenerListaCupsPaciente(paciente).some((cup) => this.esCupFacturado(cup));
    },

    obtenerResumenFacturados(paciente = {}) {
      const mapa = new Map();
      let totalCups = 0;
      const actividadesGlobales = new Set();

      this.obtenerListaCupsPaciente(paciente).forEach((cup) => {
        if (!this.esCupFacturado(cup)) return;

        totalCups += 1;
        const actividadId = String(cup?.actividadId || cup?.idActividad || "").trim() || "sin-actividad";
        actividadesGlobales.add(actividadId);

        const rol = String(cup?.key || "").trim() || "Sin rol";
        const documento = String(cup?.idProf ?? cup?.idProfesional ?? "").trim();
        const nombre = String(cup?.nombreProf || "").trim()
          || (documento ? this.obtenerNombreProfesional(documento) : "")
          || rol;
        const clave = `${this.normalizarTexto(rol)}::${this.normalizarTexto(documento || nombre)}`;

        if (!mapa.has(clave)) {
          mapa.set(clave, {
            rol,
            documento,
            nombre,
            actividades: new Set(),
            cantidadCups: 0,
            facturas: new Set(),
          });
        }

        const item = mapa.get(clave);
        item.actividades.add(actividadId);
        item.cantidadCups += 1;
        const factura = String(cup?.FactNum || cup?.factNum || cup?.fact_num || "").trim();
        if (factura) item.facturas.add(factura);
      });

      const profesionales = Array.from(mapa.values())
        .map((item) => ({
          rol: item.rol,
          documento: item.documento,
          nombre: item.nombre,
          cantidadActividades: item.actividades.size,
          cantidadCups: item.cantidadCups,
          facturas: Array.from(item.facturas).join(", "),
        }))
        .sort((a, b) => {
          const porNombre = String(a.nombre || "").localeCompare(String(b.nombre || ""), "es", {
            sensitivity: "base",
          });
          if (porNombre !== 0) return porNombre;
          return String(a.rol || "").localeCompare(String(b.rol || ""), "es", { sensitivity: "base" });
        });

      return {
        profesionales,
        totalActividades: actividadesGlobales.size,
        totalCups,
      };
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
      if (typeof valor === 'string') {
        const texto = valor.trim();
        if (!texto) {
          return 'N/A';
        }

        if ((texto.startsWith('[') && texto.endsWith(']')) || (texto.startsWith('{') && texto.endsWith('}'))) {
          try {
            return this.formatearValor(JSON.parse(texto));
          } catch (_) {
            return texto;
          }
        }

        return texto;
      }
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
          .map(([itemClave, itemValor]) => `${this.formatearClave(itemClave)}: ${this.formatearValor(itemValor)}`)
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
          rol: "Higienista oral",
          documento: paciente.idHigienistaOralAtiende,
          estado: paciente.status_gest_higienista_oral,
          fecha: paciente.fechagestHigienistaOral,
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
      if (this.tieneActividadesFacturadas(paciente)) {
        alert("⚠️ No se puede editar: el paciente tiene actividades facturadas.");
        return;
      }
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

    async eliminarPaciente(paciente) {
      const idEncuesta = typeof paciente === "object" ? paciente?.id : paciente;
      if (!idEncuesta) return;

      const pacienteObj = typeof paciente === "object" ? paciente : {};
      if (!this.puedeEliminarPaciente(pacienteObj)) {
        alert(`⚠️ ${this.motivoBloqueoEliminar(pacienteObj)}`);
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
  border-radius: 0;
  box-shadow: none;
}

.consulta-resultados-card {
  border: 1px solid #c8d6c8;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
}

.consulta-detalle-card {
  border: 1px solid #ced4da;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
}

.consulta-resultados-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #198754;
  color: #fff;
  border-bottom: 1px solid #146c43;
  padding: 12px 16px;
}

.consulta-resultados-header strong {
  color: #fff;
  font-weight: 600;
}

.consulta-eyebrow {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2px;
}

.consulta-resultados-count {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: transparent;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.consulta-acordeon {
  border: 0;
  border-radius: 0;
}

.consulta-acordeon-item {
  border: 0;
  border-top: 1px solid #c8d6c8;
  border-radius: 0;
}

.consulta-acordeon-btn {
  padding: 12px 16px;
  background: #fff;
  color: #212529;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.consulta-acordeon-btn:not(.collapsed) {
  background: #e9f5ee;
  color: #146c43;
}

.consulta-acordeon-btn:focus {
  box-shadow: none;
  border-color: transparent;
}

.consulta-acordeon-btn::after {
  margin-left: 12px;
  flex-shrink: 0;
}

.consulta-acordeon-resumen {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px 12px;
  width: 100%;
  text-align: left;
}

.consulta-acordeon-col {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.consulta-acordeon-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #6c757d;
}

.consulta-acordeon-valor {
  font-size: 0.88rem;
  font-weight: 500;
  color: #212529;
  word-break: break-word;
}

.consulta-acordeon-body {
  background: #fbfdff;
  border-top: 1px solid #c8d6c8;
  padding: 16px;
}

.consulta-detalle-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #dee2e6;
}

.consulta-detalle-titulo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.consulta-detalle-titulo span {
  font-size: 0.85rem;
  color: #6c757d;
}

.consulta-detalle-actions {
  width: 100%;
}

@media (min-width: 992px) {
  .consulta-detalle-actions {
    width: auto;
  }
}

@media (max-width: 992px) {
  .consulta-acordeon-resumen {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .consulta-resultados-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .consulta-acordeon-resumen {
    grid-template-columns: 1fr;
  }

  .consulta-detalle-actions .btn {
    width: 100%;
  }
}

.table-responsive {
  border-radius: 0;
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

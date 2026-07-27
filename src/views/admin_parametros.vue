<template>
  <div class="container-fluid">
    <h3>Admin Parametros</h3>
    <br />
    <nav>
      <div class="nav nav-tabs" id="nav-tab" role="tablist">
        <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button"
          role="tab" aria-controls="nav-home" aria-selected="true">
          COMUNAS Y BARRIOS <span class="badge bg-secondary ms-1">{{ comunasBarrios.length }}</span>
        </button>
        <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button"
          role="tab" aria-controls="nav-profile" aria-selected="false">
          EPS <span class="badge bg-secondary ms-1">{{ epss.length }}</span>
        </button>
        <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button"
          role="tab" aria-controls="nav-contact" aria-selected="false">
          CUPS <span class="badge bg-secondary ms-1">{{ cups.length }}</span>
        </button>
        <button class="nav-link" id="nav-actividades-tab" data-bs-toggle="tab" data-bs-target="#nav-actividades"
          type="button" role="tab" aria-controls="nav-actividades" aria-selected="false">
          ACTIVIDADES <span class="badge bg-secondary ms-1">{{ actividadesExtra.length }}</span>
        </button>
        <button class="nav-link" id="nav-contratos-tab" data-bs-toggle="tab" data-bs-target="#nav-contratos"
          type="button" role="tab" aria-controls="nav-contratos" aria-selected="false">
          CONTRATOS <span class="badge bg-secondary ms-1">{{ contratos.length }}</span>
        </button>
      </div>
    </nav>
    <div v-if="csvImport.visible" class="alert mt-3 mb-2" :class="csvImport.inProgress ? 'alert-info' : 'alert-success'">
      <div class="d-flex align-items-center gap-2">
        <span v-if="csvImport.inProgress" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <strong>{{ csvImport.modulo }}</strong>
        <span>{{ csvImport.mensaje }}</span>
      </div>
      <div class="progress mt-2" style="height: 18px;">
        <div
          class="progress-bar progress-bar-striped"
          :class="{ 'progress-bar-animated': csvImport.inProgress }"
          role="progressbar"
          :style="{ width: `${csvImport.porcentaje}%` }"
          :aria-valuenow="csvImport.porcentaje"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {{ csvImport.porcentaje }}%
        </div>
      </div>
      <small class="d-block mt-1">
        Procesados: {{ csvImport.procesados }}/{{ csvImport.total }}
        | Exitosos: {{ csvImport.exitosos }}
        | Errores: {{ csvImport.errores }}
      </small>
    </div>
    <div class="tab-content" id="nav-tabContent">
      <!-- ========== TAB: COMUNAS Y BARRIOS ========== -->
      <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab" tabindex="0">
        <br />
        <div class="container-fluid">
          <h5 class="mb-3">Comunas y barrios</h5>

          <div class="row g-3">
            <div class="col-12 col-lg-7">
              <div class="card parametros-panel h-100">
                <div class="card-header">
                  <strong>
                    <i class="bi bi-pencil-square me-1"></i>
                    {{ comunaBarrioEditId ? 'Editar comuna/barrio' : 'Crear comuna/barrio' }}
                  </strong>
                </div>
                <div class="card-body">
                  <div class="row g-2 mb-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label">Comuna</label>
                      <input type="number" id="comuna" name="comuna" class="form-control form-control-sm" placeholder="Comuna"
                        v-model="comuna" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label">Barrio</label>
                      <input type="text" id="barrio" name="barrio" class="form-control form-control-sm" placeholder="Barrio"
                        v-model="barrio" />
                    </div>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-sm btn-warning" @click="saveComunaBarrio">
                      {{ comunaBarrioEditId ? 'Actualizar' : '+ Guardar' }}
                    </button>
                    <button v-if="comunaBarrioEditId" type="button" class="btn btn-sm btn-secondary"
                      @click="clearFormComunaBarrio">
                      Cancelar edición
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-lg-5">
              <div class="card parametros-panel h-100 border-secondary-subtle">
                <div class="card-header bg-light">
                  <strong><i class="bi bi-upload me-1"></i> Importación masiva CSV</strong>
                </div>
                <div class="card-body">
                  <p class="text-muted small mb-3">Columnas requeridas: <code>comuna, barrio</code></p>
                  <input type="file" ref="csvComunas" accept=".csv" style="display:none" @change="importarCsvComunas">
                  <button type="button" class="btn btn-sm btn-outline-secondary w-100" :disabled="csvImport.inProgress" @click="$refs.csvComunas.click()">
                    <i class="bi bi-upload"></i> Importar CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card parametros-panel mt-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong><i class="bi bi-table me-1"></i> Listado</strong>
              <span class="badge bg-secondary">{{ comunasBarrios?.length || 0 }}</span>
            </div>
            <div class="card-body p-0">
              <div style="max-height: 600px; overflow-y: auto">
                <table class="table table-bordered table-sm mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Editar</th>
                      <th scope="col">Comuna</th>
                      <th scope="col">Barrio</th>
                      <th scope="col">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(comuna, index) in comunasBarrios" :key="comuna.id || index">
                      <td><button class="btn btn-sm btn-warning" @click="editBarrio(comuna.id)" aria-label="Editar barrio"
                          type="button">
                          <i class="bi bi-pencil"></i>
                        </button></td>
                      <td>{{ comuna.comuna }}</td>
                      <td>{{ comuna.barrio }}</td>
                      <td>
                        <button class="btn btn-sm btn-danger" @click="deleteBarrio(comuna.id)" aria-label="Eliminar barrio"
                          type="button">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="p-2 border-top">
                <small class="text-muted">Total: <strong>{{ comunasBarrios.length }}</strong> registros</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== TAB: EPS ========== -->
      <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab" tabindex="0">
        <br />
        <div class="container-fluid">
          <h5 class="mb-3">EPS disponibles en Demanda Inducida</h5>

          <div class="row g-3">
            <div class="col-12 col-lg-7">
              <div class="card parametros-panel h-100">
                <div class="card-header">
                  <strong>
                    <i class="bi bi-pencil-square me-1"></i>
                    {{ epsEditId ? 'Editar EPS' : 'Crear EPS' }}
                  </strong>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Nombre de la EPS</label>
                    <input type="text" id="epsname-di" name="epsname-di" class="form-control form-control-sm"
                      placeholder="Nombre de la Eps" v-model="epsname" />
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-sm btn-warning" @click="saveEps">
                      {{ epsEditId ? 'Actualizar' : 'Guardar' }}
                    </button>
                    <button v-if="epsEditId" type="button" class="btn btn-sm btn-secondary"
                      @click="clearFormEps">
                      Cancelar edición
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-lg-5">
              <div class="card parametros-panel h-100 border-secondary-subtle">
                <div class="card-header bg-light">
                  <strong><i class="bi bi-upload me-1"></i> Importación masiva CSV</strong>
                </div>
                <div class="card-body">
                  <p class="text-muted small mb-3">Columna requerida: <code>eps</code></p>
                  <input type="file" ref="csvEps" accept=".csv" style="display:none" @change="importarCsvEps">
                  <button type="button" class="btn btn-sm btn-outline-secondary w-100" :disabled="csvImport.inProgress" @click="$refs.csvEps.click()">
                    <i class="bi bi-upload"></i> Importar CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card parametros-panel mt-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong><i class="bi bi-table me-1"></i> Listado de EPS</strong>
              <span class="badge bg-secondary">{{ epss?.length || 0 }}</span>
            </div>
            <div class="card-body p-0">
              <div style="max-height: 420px; overflow-y: auto">
                <table class="table table-bordered table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Editar</th>
                      <th>Nombre de EPS</th>
                      <th>Opciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(ot, index) in epss" :key="ot.id || index">
                      <td><button class="btn btn-sm btn-warning" @click="editEps(ot.id)" aria-label="Editar EPS"
                          type="button">
                          <i class="bi bi-pencil"></i>
                        </button></td>
                      <td>{{ ot.eps }}</td>
                      <td>
                        <button class="btn btn-sm btn-danger" @click="EpsDelete(ot.id)" aria-label="Eliminar EPS"
                          type="button">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="p-2 border-top">
                <small class="text-muted">Total: <strong>{{ epss.length }}</strong> EPS registradas</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== TAB: CUPS ========== -->
      <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab" tabindex="0">
        <br />
        <div class="container-fluid">
          <h5 class="mb-3">CUPS del sistema</h5>

          <div class="row g-3">
            <div class="col-12 col-lg-7">
              <div class="card parametros-panel h-100">
                <div class="card-header">
                  <strong><i class="bi bi-plus-circle me-1"></i> Crear / editar CUPS</strong>
                </div>
                <div class="card-body">
                  <p class="text-muted small mb-3">Use este módulo para registrar un CUPS nuevo o buscar uno existente para editarlo.</p>

                  <div class="mb-3">
                    <label class="form-label">Buscar CUPS existente</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text"><i class="bi bi-search"></i></span>
                      <input
                        type="text"
                        class="form-control"
                        v-model.trim="busquedaCupsAdmin"
                        placeholder="Código, nombre, grupo o profesional..."
                      />
                      <button
                        v-if="busquedaCupsAdmin"
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="busquedaCupsAdmin = ''"
                        title="Limpiar búsqueda"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                    <small class="text-muted">
                      {{ busquedaCupsAdmin ? `${cupsFiltradosAdmin.length} coincidencia(s)` : `${cups?.length || 0} CUPS en el listado` }}
                    </small>
                  </div>

                  <div v-if="busquedaCupsAdmin" class="cups-busqueda-resultados border rounded mb-3">
                    <div v-if="cupsFiltradosAdmin.length === 0" class="p-2 text-muted small">
                      No se encontraron CUPS con ese criterio.
                    </div>
                    <button
                      v-for="cup in cupsFiltradosAdmin.slice(0, 30)"
                      :key="`busq-cup-${cup.id}`"
                      type="button"
                      class="cups-busqueda-item"
                      data-bs-toggle="modal"
                      data-bs-target="#staticBackdrop"
                      @click="editCups(cup.id)"
                    >
                      <div class="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <strong class="d-block">{{ cup.codigo }}</strong>
                          <span class="small">{{ cup.DescripcionCUP }}</span>
                          <div class="text-muted small mt-1">
                            {{ formatProfesionales(cup.profesional) }}
                            <span v-if="cup.Grupo"> · Grupo {{ cup.Grupo }}</span>
                          </div>
                        </div>
                        <span class="badge bg-warning text-dark align-self-center">Editar</span>
                      </div>
                    </button>
                    <div v-if="cupsFiltradosAdmin.length > 30" class="p-2 border-top text-muted small">
                      Mostrando 30 de {{ cupsFiltradosAdmin.length }}. Refine la búsqueda para ver más precisos.
                    </div>
                  </div>

                  <button type="button" class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop" @click="clearFormCups">
                    + Nuevo CUPS
                  </button>
                </div>
              </div>
            </div>

            <div class="col-12 col-lg-5">
              <div class="card parametros-panel h-100 border-secondary-subtle">
                <div class="card-header bg-light">
                  <strong><i class="bi bi-upload me-1"></i> Importación masiva CSV</strong>
                </div>
                <div class="card-body">
                  <p class="text-muted small mb-2">
                    Columnas: <code>descripcionCups, codigo, grupo, profesional</code>
                  </p>
                  <p class="text-muted small mb-3">
                    Profesional múltiple: <code>Medico|Enfermero|Higienista oral</code>
                  </p>
                  <input type="file" ref="csvCups" accept=".csv" style="display:none" @change="importarCsvCups">
                  <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="csvImport.inProgress" @click="$refs.csvCups.click()">
                    <i class="bi bi-upload"></i> Importar CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

        <!-- modal  crear editar CUPS-->
        <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
          aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="staticBackdropLabel">
                  {{ cupsEditId ? "Editar" : "Crear" }} CUPS
                </h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  @click="clearFormCups"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-6">
                    <div class="mb-3">
                      <label class="form-label">Nombre del Cup</label>
                      <input type="text" id="cupsNombre" v-model="cupNombre" class="form-control"
                        placeholder="Nombre del procedimiento" required />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mb-3">
                      <label class="form-label">Codigo CUPS</label>
                      <input type="text" id="cupsCodigo" v-model="cupCodigo" class="form-control"
                        placeholder="Código CUPS" required />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mb-3">
                      <label class="form-label">Profesionales</label>
                      <div class="profesionales-checklist border rounded p-2">
                        <div
                          v-for="prof in profesionalesActividadOpciones"
                          :key="`cup-check-${prof}`"
                          class="form-check"
                        >
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :id="`cup-prof-${prof}`"
                            :value="prof"
                            v-model="cupProfesional"
                          />
                          <label class="form-check-label" :for="`cup-prof-${prof}`">{{ prof }}</label>
                        </div>
                      </div>
                      <small class="text-muted">Seleccione uno o varios profesionales</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="mb-3">
                      <label class="form-label">Grupo</label>
                      <input type="text" id="cupsGrupo" v-model="cupsGrupo" class="form-control" placeholder="Grupo"
                        required />
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal" @click="clearFormCups">
                  Cerrar
                </button>
                <button type="button" class="btn btn-sm btn-primary" @click="saveCups">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- Fin modal crear editar CUPS -->

        <div class="card parametros-panel mt-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <strong><i class="bi bi-table me-1"></i> Listado de CUPS</strong>
            <span class="badge bg-secondary">{{ cupsFiltradosAdmin?.length || 0 }}{{ busquedaCupsAdmin ? ` / ${cups?.length || 0}` : '' }}</span>
          </div>
          <div class="card-body p-0">
            <div v-if="cupsFiltradosAdmin && cupsFiltradosAdmin.length > 0" style="overflow-x: auto; width: 100%">
              <table class="table table-bordered table-sm mb-0">
                <thead>
                  <tr>
                    <th>Editar</th>
                    <th>CupHomologado</th>
                    <th>CUP Nombre</th>
                    <th>Profesional</th>
                    <th>Grupo</th>
                    <th>Eliminar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cup in cupsFiltradosAdmin" :key="cup.id" :class="getColorClassByProfesional(cup.profesional)">
                    <td>
                      <button type="button" class="btn btn-sm btn-warning" data-bs-toggle="modal"
                        data-bs-target="#staticBackdrop" @click="editCups(cup.id)">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </td>
                    <td>{{ cup.codigo }}</td>
                    <td>{{ cup.DescripcionCUP }}</td>
                    <td>
                      <strong>{{ formatProfesionales(cup.profesional) }}</strong>
                    </td>
                    <td>{{ cup.Grupo }}</td>
                    <td>
                      <button type="button" class="btn btn-sm btn-danger" @click="deleteCups(cup.id)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="p-3 text-muted small">
              {{ busquedaCupsAdmin ? 'No hay CUPS que coincidan con la búsqueda.' : 'No hay CUPS registrados.' }}
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- ========== TAB: ACTIVIDADES EXTRA ========== -->
      <div class="tab-pane fade" id="nav-actividades" role="tabpanel" aria-labelledby="nav-actividades-tab"
        tabindex="0">
        <br />
        <div class="container-fluid">
          <h5 class="mb-3">Actividades extra del sistema</h5>

          <div class="row g-3">
            <div class="col-12 col-xl-8">
              <div class="card parametros-panel h-100">
                <div class="card-header">
                  <strong>
                    <i class="bi bi-pencil-square me-1"></i>
                    {{ actividadExtraEditId ? 'Editar actividad' : 'Crear nueva actividad' }}
                  </strong>
                </div>
                <div class="card-body">
                  <div class="row g-2 mb-3">
                    <div class="col-12 col-md-4">
                      <label class="form-label">Clave</label>
                      <input type="text" class="form-control form-control-sm" placeholder="Ej: TAMIZAJE"
                        v-model="actividadClave" />
                    </div>
                    <div class="col-12 col-md-4">
                      <label class="form-label">Nombre</label>
                      <input type="text" class="form-control form-control-sm" placeholder="Nombre actividad"
                        v-model="actividadNombre" />
                    </div>
                    <div class="col-12 col-md-4">
                      <label class="form-label">Profesionales</label>
                      <div class="profesionales-checklist border rounded p-2">
                        <div
                          v-for="prof in profesionalesActividadOpciones"
                          :key="`act-check-${prof}`"
                          class="form-check"
                        >
                          <input
                            class="form-check-input"
                            type="checkbox"
                            :id="`act-prof-${prof}`"
                            :value="prof"
                            v-model="actividadProfesionales"
                          />
                          <label class="form-check-label" :for="`act-prof-${prof}`">{{ prof }}</label>
                        </div>
                      </div>
                      <small class="text-muted">Puede seleccionar varios</small>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-sm btn-warning" @click="saveActividadExtra">
                      {{ actividadExtraEditId ? 'Actualizar actividad' : '+ Guardar actividad' }}
                    </button>
                    <button v-if="actividadExtraEditId" type="button" class="btn btn-sm btn-secondary"
                      @click="clearFormActividadExtra">
                      Cancelar edición
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 col-xl-4">
              <div class="card parametros-panel h-100 border-secondary-subtle">
                <div class="card-header bg-light">
                  <strong><i class="bi bi-upload me-1"></i> Importación masiva CSV</strong>
                </div>
                <div class="card-body">
                  <p class="text-muted small mb-2">
                    Este módulo es independiente de la creación manual.
                  </p>
                  <p class="text-muted small mb-2">
                    Columnas: <code>clave, nombre, profesionales</code>
                  </p>
                  <p class="text-muted small mb-3">
                    Profesionales múltiples con <code>|</code>
                    (Ej: <code>Auxiliar de enfermeria|Higienista oral</code>).
                  </p>
                  <input type="file" ref="csvActividades" accept=".csv" style="display:none" @change="importarCsvActividades">
                  <button type="button" class="btn btn-sm btn-outline-secondary w-100" :disabled="csvImport.inProgress" @click="$refs.csvActividades.click()">
                    <i class="bi bi-upload"></i> Importar CSV de actividades
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card parametros-panel mt-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong><i class="bi bi-table me-1"></i> Listado de actividades</strong>
              <span class="badge bg-secondary">{{ actividadesExtra?.length || 0 }}</span>
            </div>
            <div class="card-body p-0">
              <div style="max-height: 420px; overflow-y: auto">
                <table class="table table-bordered table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Editar</th>
                      <th>Clave</th>
                      <th>Nombre</th>
                      <th>Profesionales</th>
                      <th>Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(actividad, index) in actividadesExtra" :key="actividad.id || index">
                      <td>
                        <button class="btn btn-sm btn-warning" @click="editActividadExtra(actividad.id)"
                          aria-label="Editar actividad" type="button">
                          <i class="bi bi-pencil"></i>
                        </button>
                      </td>
                      <td>{{ actividad.key }}</td>
                      <td>{{ actividad.nombre }}</td>
                      <td>{{ (actividad.Profesional || []).join(', ') }}</td>
                      <td>
                        <button class="btn btn-sm btn-danger" @click="deleteActividadExtraById(actividad.id)"
                          aria-label="Eliminar actividad" type="button">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="p-2 border-top">
                <small class="text-muted">Total: <strong>{{ actividadesExtra.length }}</strong> actividades registradas</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== TAB: CONTRATOS ========== -->
      <div class="tab-pane fade" id="nav-contratos" role="tabpanel" aria-labelledby="nav-contratos-tab" tabindex="0">
        <h5>Gestion CONTRATOS</h5>

        <div class="alert alert-warning" role="alert">
          <div class="row">
            <div class="col-8">Crear un nuevo contrato</div>
            <div class="col-2">
              <button class="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#crearcontratos">
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Modal crear contratos -->
        <div class="modal fade" id="crearcontratos" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
          aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div class="modal-dialog modal-xl modal-dialog-scrollable" style="max-height: 95vh;">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="staticBackdropLabel">
                  {{ modoEdicionContratoExistente ? 'Agregar CUPS a contrato existente' : 'Crear contrato(s) EPS-CUPS'
                  }}
                  <span v-if="!modoEdicionContratoExistente && contratosTemporalesAgrupados.length > 0"
                    class="badge bg-primary ms-2">
                    {{ contratosTemporalesAgrupados.length }} EPS
                  </span>
                </h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                  @click="clearFormContratos"></button>
              </div>
              <div class="modal-body" style="max-height: 85vh; overflow-y: auto;">
                <!-- Sección de selección de opciones -->
                <div class="card mb-4 sticky-top" style="top: 0; z-index: 10;">
                  <div class="card-body">
                    <h6 class="card-title mb-3">Configurar Contrato</h6>
                    <div class="row g-2">
                      <div class="col-12 col-md-6">
                        <label class="form-label fw-bold">Seleccione EPS</label>
                        <select class="form-select form-select-sm" aria-label="Seleccionar EPS" v-model="Seps"
                          :disabled="modoEdicionContratoExistente">
                          <option value="">Seleccione...</option>
                          <option :value="eps.id" v-for="(eps, index) in epss" :key="index">
                            {{ eps.eps }}
                          </option>
                        </select>
                      </div>
                      <div class="col-12 col-md-6">
                        <label class="form-label fw-bold">Actividad Extra</label>
                        <select class="form-select form-select-sm" aria-label="Seleccionar Actividad"
                          v-model="Sactividad">
                          <option value="">Seleccione...</option>
                          <option :value="actividad.id" v-for="(actividad, index) in actividadesExtra" :key="index">
                            {{ actividad.nombre }}
                          </option>
                        </select>
                      </div>
                      <div class="col-12 col-md-12">
                        <label class="form-label fw-bold">CUPS Habilitados</label>
                        <div class="row g-2 mb-2">
                          <div class="col-12 col-md-5">
                            <select
                              class="form-select form-select-sm"
                              v-model="SprofesionalFiltro"
                              :disabled="!Sactividad"
                              aria-label="Filtrar por profesional"
                            >
                              <option value="">Todos los profesionales</option>
                              <option
                                v-for="prof in profesionalesActividadOpciones"
                                :key="`filtro-prof-${prof}`"
                                :value="prof"
                              >
                                {{ prof }}
                              </option>
                            </select>
                          </div>
                          <div class="col-12 col-md-7">
                            <input
                              type="text"
                              class="form-control form-control-sm"
                              v-model.trim="SbusquedaCup"
                              :disabled="!Sactividad"
                              placeholder="Buscar CUPS por codigo, nombre, grupo o profesional"
                            />
                          </div>
                        </div>
                        <select class="form-select form-select-sm" aria-label="Seleccione varios CUPS" v-model="Scups"
                          :key="`cups-${Seps}-${Sactividad}-${SprofesionalFiltro}-${modoEdicionContratoExistente ? 'edit' : 'new'}`"
                          multiple style="height: 280px;" :disabled="!Sactividad">
                          <optgroup v-for="grupo in cupsDisponiblesAgrupados" :key="`cups-grupo-${grupo.clave}`"
                            :label="`${grupo.profesional} — ${grupo.grupo} (${grupo.items.length})`">
                            <option :value="cup.id" v-for="cup in grupo.items" :key="cup.id">
                              {{ cup.DescripcionCUP }}
                            </option>
                          </optgroup>
                        </select>
                        <small v-if="!Sactividad" class="text-muted d-block mt-1">Seleccione primero una actividad.</small>
                        <small v-else-if="cupsDisponiblesFiltrados.length === 0" class="text-danger d-block mt-1">
                          No hay CUPS disponibles
                          <span v-if="SprofesionalFiltro"> para {{ SprofesionalFiltro }}</span>
                          con el filtro actual.
                        </small>
                        <small v-else class="text-muted d-block mt-1">
                          {{ cupsDisponiblesFiltrados.length }} CUPS
                          <span v-if="SprofesionalFiltro"> · filtro: {{ SprofesionalFiltro }}</span>
                          · CTRL+Click para múltiples
                        </small>
                      </div>
                    </div>
                    <button class="btn btn-sm btn-warning mt-3 w-100" @click="addCupsContrato"
                      :disabled="!Seps || !Sactividad || Scups.length === 0">
                      <i class="bi bi-plus-circle"></i> Agregar CUPS al Contrato
                    </button>
                  </div>
                </div>

                <!-- Tabla de CUPS para la EPS seleccionada -->
                <div class="card mb-4">
                  <div class="card-header bg-secondary text-white">
                    <h6 class="mb-0">CUPS Agregados a <strong>{{Seps ? (epss.find(e => e.id === Seps)?.eps || 'EPS') :
                      'la EPS seleccionada'}}</strong></h6>
                  </div>
                  <div class="card-body" style="max-height: 350px; overflow-y: auto; padding: 0.75rem;">
                    <div v-if="!Seps" class="alert alert-warning mb-0 small" style="font-size: 0.85rem;">
                      <i class="bi bi-info-circle"></i> Por favor, seleccione una EPS primero
                    </div>
                    <div v-else-if="contratosFiltrados.length === 0" class="alert alert-info mb-0 small"
                      style="font-size: 0.85rem;">
                      <i class="bi bi-inbox"></i> No hay CUPS agregados a esta EPS. Seleccione CUPS y presione el botón
                      + Agregar
                    </div>
                    <div v-else>
                      <div v-for="(grupo, gIndex) in contratosFiltradosAgrupados" :key="`tmp-prof-${gIndex}`" class="mb-3">
                        <div class="bg-light text-dark p-2 rounded small fw-bold border d-flex justify-content-between align-items-center">
                          <span><i class="bi bi-person-badge"></i> {{ grupo.profesional }}</span>
                          <span class="badge bg-primary">{{ grupo.cups.length }} CUPS</span>
                        </div>
                        <table class="table table-sm table-hover mb-0" style="font-size: 0.85rem;">
                          <thead class="table-light">
                            <tr style="font-size: 0.8rem;">
                              <th style="width: 16%;">Grupo</th>
                              <th style="width: 24%;">Actividad</th>
                              <th style="width: 45%;">CUPS</th>
                              <th class="text-center" style="width: 15%;">Acción</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(contrato, index) in grupo.cups" :key="`tmp-prof-row-${gIndex}-${index}`">
                              <td>{{ obtenerGrupoCups(contrato.cupsId, contrato.cupsGrupo) || '-' }}</td>
                              <td><span class="badge bg-info text-dark" style="font-size: 0.75rem;">{{
                                obtenerNombreActividadPorId(contrato.actividadId, contrato.actividadNombre) ||
                                sinEspecificar }}</span></td>
                              <td><strong>{{ obtenerNombreCups(contrato.cupsId, contrato.cupsNombre) }}</strong></td>
                              <td class="text-center">
                                <button class="btn btn-sm btn-outline-danger" @click="removeContrato(contrato)"
                                  title="Eliminar este CUPS" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                  <i class="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Resumen de todos los contratos que se guardarán -->
                <div v-if="contratosTemporalesAgrupados.length > 0" class="card border-success">
                  <div class="card-header bg-success text-white">
                    <h6 class="mb-0"><i class="bi bi-clipboard-check"></i> Resumen de Contratos a Guardar</h6>
                  </div>
                  <div class="card-body"
                    style="max-height: 300px; overflow-y: auto; padding: 0.75rem; font-size: 0.85rem;">
                    <div v-for="grupo in contratosTemporalesAgrupados" :key="grupo.epsId" class="mb-2">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <strong style="font-size: 0.9rem;">{{ grupo.epsNombre }}</strong>
                        <span class="badge bg-primary" style="font-size: 0.75rem;">{{ grupo.cups.length }} CUPS</span>
                      </div>
                      <div v-for="(cupsProf, profesional) in agruparPorProfesional(grupo.cups)" :key="`${grupo.epsId}-${profesional}`" class="mb-2">
                        <div class="bg-light text-dark p-2 rounded small fw-bold border d-flex justify-content-between align-items-center">
                          <span><i class="bi bi-person-badge"></i> {{ profesional }}</span>
                          <span class="badge bg-primary">{{ cupsProf.length }} CUPS</span>
                        </div>
                        <ul class="mb-1 mt-1" style="font-size: 0.8rem; padding-left: 1.2rem;">
                          <li v-for="(cup, idx) in cupsProf" :key="`${grupo.epsId}-${profesional}-${idx}`">
                            <span class="badge bg-light text-dark" style="font-size: 0.7rem;">{{
                              obtenerNombreActividadPorId(cup.actividadId,
                                cup.actividadNombre) || sinEspecificar }}</span>
                            <strong>{{ obtenerNombreCups(cup.cupsId, cup.cupsNombre) }}</strong>
                          </li>
                        </ul>
                      </div>
                      <hr class="my-1"
                        v-if="grupo !== contratosTemporalesAgrupados[contratosTemporalesAgrupados.length - 1]" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal"
                  @click="clearFormContratos">
                  Cerrar
                </button>
                <button type="button" class="btn btn-sm btn-primary" @click="saveContrato">
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Listado de contratos guardados -->
        <div class="mt-4">
          <h6>Contratos Guardados</h6>
          <div v-if="!contratos || contratos.length === 0" class="alert alert-warning">
            No hay contratos guardados.
          </div>
          <div v-else>
            <div class="accordion" id="contratosAccordion">
              <div v-for="(grupo, index) in contratosAgrupadosPorEps" :key="grupo.epsId" class="accordion-item">
                <h2 class="accordion-header" :id="'heading' + index">
                  <button class="accordion-button collapsed" type="button"
                    data-bs-toggle="collapse" :data-bs-target="'#collapse' + index"
                    aria-expanded="false" :aria-controls="'collapse' + index">
                    <strong>EPS:</strong> {{ obtenerNombreEps(grupo.epsId, grupo.epsNombre) }}
                    <span class="badge bg-primary ms-2">{{ grupo.cups.length }} CUPS</span>
                    <span class="badge bg-secondary ms-1">{{ grupo.contratoIds.length }} registro(s)</span>
                  </button>
                </h2>
                <div :id="'collapse' + index" class="accordion-collapse collapse"
                  :aria-labelledby="'heading' + index" data-bs-parent="#contratosAccordion">
                  <div class="accordion-body p-3">
                    <div class="text-end mb-2">
                      <button class="btn btn-sm btn-outline-primary me-2" @click="abrirModalAgregarCupsExistente(grupo)">
                        <i class="bi bi-plus-circle"></i> Agregar CUPS
                      </button>
                      <button class="btn btn-sm btn-outline-danger"
                        @click="confirmarEliminarContratos(grupo.contratoIds)">
                        <i class="bi bi-trash"></i> Eliminar Todos
                      </button>
                    </div>

                    <template v-if="listarCupsPorProfesional(grupo.cups).length">
                      <ul class="nav nav-tabs nav-tabs-contratos flex-wrap" :id="`contrato-tabs-${index}`" role="tablist">
                        <li
                          v-for="(profTab, pIndex) in listarCupsPorProfesional(grupo.cups)"
                          :key="`tab-nav-${index}-${profTab.slug}`"
                          class="nav-item"
                          role="presentation"
                        >
                          <button
                            class="nav-link"
                            :class="{ active: pIndex === 0 }"
                            :id="`contrato-tab-${index}-${profTab.slug}`"
                            data-bs-toggle="tab"
                            :data-bs-target="`#contrato-pane-${index}-${profTab.slug}`"
                            type="button"
                            role="tab"
                            :aria-controls="`contrato-pane-${index}-${profTab.slug}`"
                            :aria-selected="pIndex === 0 ? 'true' : 'false'"
                          >
                            <i class="bi bi-person-badge me-1"></i>{{ profTab.profesional }}
                            <span class="badge bg-primary ms-1">{{ profTab.items.length }}</span>
                          </button>
                        </li>
                      </ul>

                      <div class="tab-content border border-top-0 rounded-bottom p-2 bg-white">
                        <div
                          v-for="(profTab, pIndex) in listarCupsPorProfesional(grupo.cups)"
                          :key="`tab-pane-${index}-${profTab.slug}`"
                          class="tab-pane fade"
                          :class="{ show: pIndex === 0, active: pIndex === 0 }"
                          :id="`contrato-pane-${index}-${profTab.slug}`"
                          role="tabpanel"
                          :aria-labelledby="`contrato-tab-${index}-${profTab.slug}`"
                          tabindex="0"
                        >
                          <div
                            v-for="actGrupo in profTab.actividades"
                            :key="`act-${index}-${profTab.slug}-${actGrupo.key}`"
                            class="mb-3"
                          >
                            <div class="contrato-actividad-header">
                              <div>
                                <i class="bi bi-clipboard2-pulse me-1"></i>
                                <strong>Actividad:</strong> {{ actGrupo.nombre }}
                              </div>
                              <span class="badge bg-secondary">{{ actGrupo.items.length }} CUPS</span>
                            </div>
                            <div class="table-responsive">
                              <table class="table table-sm table-bordered mb-0 small">
                                <thead class="table-light">
                                  <tr>
                                    <th>Código</th>
                                    <th>CUPS incluido</th>
                                    <th>Grupo</th>
                                    <th style="width: 80px;">Eliminar</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(cup, idx) in actGrupo.items" :key="`${index}-${profTab.slug}-${actGrupo.key}-${idx}`">
                                    <td>{{ obtenerCodigoCups(cup.cupsId, cup.cupsCodigo) || '-' }}</td>
                                    <td>{{ obtenerNombreCups(cup.cupsId, cup.cupsNombre) }}</td>
                                    <td>{{ obtenerGrupoCups(cup.cupsId, cup.cupsGrupo) || '-' }}</td>
                                    <td class="text-center">
                                      <button class="btn btn-sm btn-danger"
                                        @click="eliminarCupsDeContrato(cup.contratoId, cup.cupsId)" title="Eliminar este CUPS">
                                        <i class="bi bi-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                    <div v-else class="alert alert-info mb-0 small">
                      No hay CUPS asociados a este contrato.
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
import { mapState, mapActions } from "vuex";
import { formatApiError } from "@/utils/apiError.js";
export default {
  data() {
    return {
      // ===== COMUNAS Y BARRIOS =====
      comuna: "",
      barrio: "",
      comunaBarrioEditId: null,

      // ===== EPS =====
      epsnameDemanndaInducida: "",
      epsname: "",
      epsEditId: null,

      // ===== ACTIVIDADES EXTRA =====
      actividadClave: "",
      actividadNombre: "",
      actividadProfesionales: [],
      actividadExtraEditId: null,
      profesionalesActividadOpciones: [
        "Auxiliar de enfermeria",
        "Enfermero",
        "Medico",
        "Psicologo",
        "Tsocial",
        "Nutricionista",
        "Higienista oral",
      ],

      // ===== CUPS =====
      cupNombre: "",
      cupCodigo: "",
      cupProfesional: [],
      cupsEditId: null,
      cupsGrupo: "",
      cupsEps: [],
      busquedaCupsAdmin: "",

      // ===== CONTRATOS =====
      Seps: "",
      Scargo: "",
      Scups: [], // Array para selección múltiple de CUPS
      Sactividad: "", // Nueva variable para actividad seleccionada
      SbusquedaCup: "",
      SprofesionalFiltro: "",
      contratosTemp: [], // Array temporal para CUPS antes de guardar
      modoEdicionContratoExistente: false,
      contratoEdicionId: null,
      sinEspecificar: "Sin especificar",
      csvImport: {
        visible: false,
        inProgress: false,
        modulo: "",
        mensaje: "",
        total: 0,
        procesados: 0,
        exitosos: 0,
        errores: 0,
        porcentaje: 0,
      },
    };
  },
  computed: {
    ...mapState(["comunasBarrios", "epss", "cups", "contratos", "actividadesExtra", "userData"]),
    cupsFiltradosAdmin() {
      const lista = Array.isArray(this.cups) ? this.cups : [];
      const termino = String(this.busquedaCupsAdmin || "").toLowerCase().trim();
      if (!termino) return lista;

      return lista.filter((cup) => {
        const codigo = String(cup?.codigo || "").toLowerCase();
        const nombre = String(cup?.DescripcionCUP || "").toLowerCase();
        const grupo = String(cup?.Grupo || "").toLowerCase();
        const profesional = String(this.formatProfesionales(cup?.profesional) || "").toLowerCase();
        return (
          codigo.includes(termino) ||
          nombre.includes(termino) ||
          grupo.includes(termino) ||
          profesional.includes(termino)
        );
      });
    },
    // Filtrar contratos por EPS seleccionada
    contratosFiltrados() {
      if (!this.Seps) {
        return [];
      }
      // Mostrar solo los CUPS temporales que se están agregando
      return this.contratosTemp.filter(contrato => contrato.epsId === this.Seps);
    },

    contratosFiltradosAgrupados() {
      if (!this.contratosFiltrados || this.contratosFiltrados.length === 0) {
        return [];
      }

      const grouped = {};
      this.contratosFiltrados.forEach((contrato) => {
        const profesionales = this.obtenerListaProfesionalesCups(contrato);
        const lista = profesionales.length ? profesionales : [this.sinEspecificar];
        lista.forEach((profesional) => {
          if (!grouped[profesional]) {
            grouped[profesional] = {
              profesional,
              cups: [],
            };
          }
          grouped[profesional].cups.push(contrato);
        });
      });

      return Object.values(grouped).sort((a, b) => a.profesional.localeCompare(b.profesional));
    },

    // Agrupar contratos temporales por EPS para visualización previa antes de guardar
    contratosTemporalesAgrupados() {
      if (!this.contratosTemp || this.contratosTemp.length === 0) {
        return [];
      }

      const agrupados = {};

      this.contratosTemp.forEach(contrato => {
        if (!agrupados[contrato.epsId]) {
          agrupados[contrato.epsId] = {
            epsId: contrato.epsId,
            epsNombre: this.obtenerNombreEps(contrato.epsId, contrato.epsNombre),
            cups: []
          };
        }
        agrupados[contrato.epsId].cups.push(contrato);
      });

      return Object.values(agrupados);
    },

    // Agrupar contratos por EPS para la visualización
    contratosAgrupadosPorEps() {
      if (!this.contratos || this.contratos.length === 0) {
        return [];
      }

      const agrupados = {};

      this.contratos.forEach(contrato => {
        const epsId = contrato.epsId;

        if (!agrupados[epsId]) {
          agrupados[epsId] = {
            epsId: contrato.epsId,
            epsNombre: this.obtenerNombreEps(contrato.epsId, contrato.epsNombre),
            cups: [],
            contratoIds: [],
            fechas: []
          };
        }

        // Agregar los CUPS de este contrato
        if (contrato.cups && Array.isArray(contrato.cups)) {
          contrato.cups.forEach(cup => {
            // Agregar cada CUPS con la referencia del contrato
            agrupados[epsId].cups.push({
              ...cup,
              contratoId: contrato.id // Mantener referencia del contrato original
            });
          });
        }

        // Guardar el ID del contrato para poder eliminarlo
        agrupados[epsId].contratoIds.push(contrato.id);
        agrupados[epsId].fechas.push(contrato.fechaCreacion);
      });

      return Object.values(agrupados);
    },
    // Filtrar CUPS disponibles
    cupsDisponibles() {
      return this.cups || [];
    },

    actividadSeleccionada() {
      return this.actividadesExtra?.find((act) => String(act.id) === String(this.Sactividad)) || null;
    },

    profesionalesActividadSeleccionada() {
      const actividad = this.actividadSeleccionada || {};
      const profesionalesRaw =
        actividad.Profesional ??
        actividad.profesionales ??
        actividad.profesional ??
        [];

      const lista = Array.isArray(profesionalesRaw)
        ? profesionalesRaw
        : String(profesionalesRaw || "")
          .split(/[|,;/]/)
          .map((item) => String(item || "").trim())
          .filter(Boolean);

      return this.normalizarProfesionales(lista);
    },

    cupsDisponiblesFiltrados() {
      if (!this.Sactividad) {
        return [];
      }

      let cups = this.cupsDisponibles || [];
      const profesionalFiltro = String(this.SprofesionalFiltro || "").trim();

      if (profesionalFiltro) {
        cups = cups.filter((cup) => {
          const profesionales = this.normalizarProfesionales(cup?.profesional);
          return profesionales.includes(profesionalFiltro);
        });
      }

      const termino = String(this.SbusquedaCup || "").toLowerCase().trim();
      if (!termino) {
        return cups;
      }

      return cups.filter((cup) => {
        const codigo = String(cup?.codigo || "").toLowerCase();
        const nombre = String(cup?.DescripcionCUP || "").toLowerCase();
        const grupo = String(cup?.Grupo || "").toLowerCase();
        const profesional = String(this.formatProfesionales(cup?.profesional) || "").toLowerCase();
        return (
          codigo.includes(termino) ||
          nombre.includes(termino) ||
          grupo.includes(termino) ||
          profesional.includes(termino)
        );
      });
    },

    cupsDisponiblesAgrupados() {
      const grouped = {};
      const profesionalFiltro = String(this.SprofesionalFiltro || "").trim();

      (this.cupsDisponiblesFiltrados || []).forEach((cup) => {
        let profesionales = this.normalizarProfesionales(cup?.profesional);
        if (profesionalFiltro) {
          profesionales = profesionales.filter((prof) => prof === profesionalFiltro);
        }
        const listaProf = profesionales.length ? profesionales : (profesionalFiltro ? [] : [this.sinEspecificar]);
        if (!listaProf.length) return;

        const grupoNombre = String(cup?.Grupo || this.sinEspecificar).trim() || this.sinEspecificar;

        listaProf.forEach((profesional) => {
          const clave = `${profesional}|${grupoNombre}`;
          if (!grouped[clave]) {
            grouped[clave] = { profesional, grupo: grupoNombre, items: [] };
          }
          // Evitar duplicar el mismo CUPS dentro del mismo optgroup
          if (!grouped[clave].items.some((item) => String(item.id) === String(cup.id))) {
            grouped[clave].items.push(cup);
          }
        });
      });

      return Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b))
        .map((clave) => ({
          clave,
          profesional: grouped[clave].profesional,
          grupo: grouped[clave].grupo,
          items: grouped[clave].items.slice().sort((a, b) =>
            String(a?.DescripcionCUP || "").localeCompare(String(b?.DescripcionCUP || ""))
          ),
        }));
    },
  },
  watch: {
    Sactividad() {
      this.sincronizarSeleccionCupsDisponibles();
    },
    SprofesionalFiltro() {
      this.sincronizarSeleccionCupsDisponibles();
    },
    SbusquedaCup() {
      this.sincronizarSeleccionCupsDisponibles();
    },
  },
  methods: {
    ...mapActions([
      "getAllComunaBarrios",
      "crearComunaBarrio",
      "actualizarComunaBarrio",
      "deleteComunaBarrio",
      "crearEps",
      "actualizarEps",
      "getAllEps",
      "deleteEps",
      "getAllCups",
      "crearCups",
      "editarCups",
      "eliminarCups",
      "crearContrato",
      "getAllContratos",
      "eliminarContrato",
      "actualizarContrato",
      "getAllActividadesExtra",
      "crearActividadExtra",
      "actualizarActividadExtra",
      "deleteActividadExtra",
    ]),

    sincronizarSeleccionCupsDisponibles() {
      const cupsPermitidos = new Set((this.cupsDisponiblesFiltrados || []).map((cup) => cup.id));
      this.Scups = (this.Scups || []).filter((id) => cupsPermitidos.has(id));
    },

    // ===== FUNCIÓN PARA COLORES DE EPS =====
    getColorClassByEps(index) {
      const colors = [
        'border-primary bg-primary text-white',
        'border-success bg-success text-white',
        'border-warning bg-warning text-dark',
        'border-info bg-info text-white',
        'border-danger bg-danger text-white',
        'border-secondary bg-secondary text-white',
        'border-dark bg-dark text-white'
      ];
      return colors[index % colors.length];
    },

    // ===== COMUNAS Y BARRIOS =====
    async saveComunaBarrio() {
      if (this.comuna === "" || this.barrio === "") {
        alert("Por favor, complete todos los campos.");
        return;
      }
      try {
        if (this.comunaBarrioEditId) {
          // Edición
          const data = {
            id: this.comunaBarrioEditId,
            comuna: this.comuna,
            barrio: this.barrio
          };
          await this.actualizarComunaBarrio(data);
          alert("Comuna y barrio actualizados exitosamente.");
        } else {
          // Creación
          let data = {
            comuna: this.comuna,
            barrio: this.barrio,
            bd: "comunasybarrios",
          };
          await this.crearComunaBarrio(data);
          alert("Comuna y barrio creados exitosamente.");
        }
        await this.getAllComunaBarrios();
        this.clearFormComunaBarrio();
      } catch (error) {
        console.error("Error al guardar comuna/barrio:", error);
        alert("Error al guardar: " + (error?.message || error));
      }
    },

    editBarrio(id) {
      const comunaBarrio = this.comunasBarrios.find(cb => cb.id === id);
      if (comunaBarrio) {
        this.comunaBarrioEditId = id;
        this.comuna = comunaBarrio.comuna;
        this.barrio = comunaBarrio.barrio;
      }
    },

    async deleteBarrio(index) {
      await this.deleteComunaBarrio(index);
      alert("Comuna y barrio eliminados exitosamente.");
      this.getAllComunaBarrios();
    },

    clearFormComunaBarrio() {
      this.comuna = "";
      this.barrio = "";
      this.comunaBarrioEditId = null;
    },

    // ===== EPS =====
    async saveEps() {
      if (this.epsname === "") {
        alert("Por favor, complete todos los campos.");
        return;
      }
      try {
        if (this.epsEditId) {
          // Edición
          const data = {
            id: this.epsEditId,
            eps: this.epsname
          };
          await this.actualizarEps(data);
          alert("EPS actualizada exitosamente.");
        } else {
          // Creación
          let data = {
            eps: this.epsname,
            bd: "eps",
          };
          await this.crearEps(data);
          alert("EPS creada exitosamente.");
        }
        await this.getAllEps({ force: true });
        this.clearFormEps();
      } catch (error) {
        console.error("Error al guardar EPS:", error);
        alert("Error al guardar: " + (error?.message || error));
      }
    },

    editEps(id) {
      const eps = this.epss.find(e => e.id === id);
      if (eps) {
        this.epsEditId = id;
        this.epsname = eps.eps;
      }
    },

    async EpsDelete(epsId) {
      // Verificar si existen contratos con esta EPS
      const tieneContratos = this.contratos.some(contrato => contrato.epsId === epsId);

      if (tieneContratos) {
        alert("No se puede eliminar esta EPS porque tiene contratos asociados. Primero elimine los contratos de esta EPS.");
        return;
      }

      if (!confirm("¿Está seguro que desea eliminar esta EPS?")) {
        return;
      }

      await this.deleteEps(epsId);
      alert("EPS eliminado exitosamente.");
      await this.getAllEps({ force: true });
    },

    clearFormEps() {
      this.epsname = "";
      this.epsEditId = null;
    },

    // ===== ACTIVIDADES EXTRA =====
    async saveActividadExtra() {
      if (!this.actividadNombre || !this.actividadNombre.trim()) {
        alert("El nombre de la actividad es obligatorio.");
        return;
      }

      try {
        const profesionalesUnicos = Array.from(
          new Set(
            (Array.isArray(this.actividadProfesionales) ? this.actividadProfesionales : [])
              .map((item) => String(item || "").trim())
              .filter((item) => this.profesionalesActividadOpciones.includes(item))
          )
        );

        const payload = {
          key: this.actividadClave.trim(),
          nombre: this.actividadNombre.trim(),
          Profesional: profesionalesUnicos,
        };

        if (this.actividadExtraEditId) {
          await this.actualizarActividadExtra({
            id: this.actividadExtraEditId,
            ...payload,
          });
          alert("Actividad actualizada exitosamente.");
        } else {
          await this.crearActividadExtra(payload);
          alert("Actividad creada exitosamente.");
        }

        await this.getAllActividadesExtra({ force: true });
        this.clearFormActividadExtra();
      } catch (error) {
        console.error("Error al guardar actividad:", error);
        alert("Error al guardar la actividad: " + (error?.message || error));
      }
    },

    editActividadExtra(id) {
      const actividad = this.actividadesExtra.find((item) => item.id === id);
      if (!actividad) return;

      this.actividadExtraEditId = id;
      this.actividadClave = actividad.key || "";
      this.actividadNombre = actividad.nombre || "";
      const profesionales = Array.isArray(actividad.Profesional)
        ? actividad.Profesional
        : [];
      this.actividadProfesionales = Array.from(
        new Set(
          profesionales
            .map((item) => String(item || "").trim())
            .filter((item) => this.profesionalesActividadOpciones.includes(item))
        )
      );
    },

    async deleteActividadExtraById(id) {
      if (!confirm("¿Desea eliminar esta actividad extra?")) return;

      try {
        await this.deleteActividadExtra(id);
        alert("Actividad eliminada exitosamente.");
        await this.getAllActividadesExtra({ force: true });

        if (this.actividadExtraEditId === id) {
          this.clearFormActividadExtra();
        }
      } catch (error) {
        console.error("Error al eliminar actividad:", error);
        alert("Error al eliminar la actividad: " + (error?.message || error));
      }
    },

    clearFormActividadExtra() {
      this.actividadExtraEditId = null;
      this.actividadClave = "";
      this.actividadNombre = "";
      this.actividadProfesionales = [];
    },

    normalizarProfesionales(profesionales) {
      const partes = [];
      const agregar = (valor) => {
        if (valor == null || valor === "") return;
        if (Array.isArray(valor)) {
          valor.forEach(agregar);
          return;
        }
        const texto = String(valor).trim();
        if (!texto) return;
        if (texto.startsWith("[") && texto.endsWith("]")) {
          try {
            const parsed = JSON.parse(texto);
            if (Array.isArray(parsed)) {
              parsed.forEach(agregar);
              return;
            }
          } catch (_) {
            /* continuar como texto */
          }
        }
        texto.split(/[|,;/]/).forEach((parte) => {
          const limpio = String(parte || "").trim();
          if (limpio) partes.push(limpio);
        });
      };
      agregar(profesionales);

      return Array.from(
        new Set(
          partes
            .map((item) => this.canonizarNombreProfesional(item))
            .filter(Boolean)
        )
      );
    },

    canonizarNombreProfesional(nombre) {
      const texto = String(nombre || "").trim();
      if (!texto) return null;
      if (this.profesionalesActividadOpciones.includes(texto)) return texto;

      const porCase = this.profesionalesActividadOpciones.find(
        (opcion) => opcion.toLowerCase() === texto.toLowerCase()
      );
      if (porCase) return porCase;

      const normalizarTexto = (txt) => String(txt || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const mapaCanonico = [
        { key: "Auxiliar de enfermeria", match: ["auxiliar"] },
        { key: "Enfermero", match: ["enfermero"] },
        { key: "Medico", match: ["medico"] },
        { key: "Psicologo", match: ["psicologo"] },
        { key: "Tsocial", match: ["tsocial", "trabajo social"] },
        { key: "Nutricionista", match: ["nutricion"] },
        { key: "Higienista oral", match: ["higienista"] },
      ];

      const normalizado = normalizarTexto(texto);
      const encontrado = mapaCanonico.find((def) =>
        def.match.every((token) => normalizado.includes(token))
      );
      return encontrado ? encontrado.key : null;
    },

    normalizarProfesionalesCsvActividades(valor) {
      return this.normalizarProfesionales(
        String(valor || "")
          .split("|")
          .map((p) => p.trim())
          .filter(Boolean)
      );
    },

    formatProfesionales(profesionales, fallback = "") {
      const lista = this.normalizarProfesionales(profesionales);
      return lista.length ? lista.join(", ") : fallback;
    },

    // ===== CUPS =====
    async saveCups() {
      // Validar que los campos obligatorios tengan valores válidos
      if (!this.cupNombre || !this.cupNombre.trim()) {
        alert("El Nombre del CUPS es obligatorio.");
        return;
      }
      if (!this.cupCodigo || !this.cupCodigo.trim()) {
        alert("El Código CUPS es obligatorio.");
        return;
      }
      const profesionalesUnicos = this.normalizarProfesionales(this.cupProfesional);
      if (profesionalesUnicos.length === 0) {
        alert("Debe seleccionar al menos un profesional.");
        return;
      }
      if (!this.cupsGrupo || !this.cupsGrupo.trim()) {
        alert("El Grupo es obligatorio.");
        return;
      }

      try {
        // Si es edición o creación
        if (this.cupsEditId) {
          // Implementar edición
          const data = {
            bd: "cups",
            id: this.cupsEditId,
            nombre: this.cupNombre.trim(),
            codigo: this.cupCodigo.trim(),
            profesional: profesionalesUnicos,
            grupo: this.cupsGrupo,
            eps: this.cupsEps,
          };
          console.log("Data para editar:", data);

          await this.editarCups(data);
          console.log("CUPS editado exitosamente");

          // Pequeño delay
          await new Promise(resolve => setTimeout(resolve, 300));

          // Recargar lista desde API
          await this.getAllCups({ force: true });
          console.log("Lista de CUPS actualizada después de editar:", this.cups);

          alert("CUP editado exitosamente.");
          this.clearFormCups();

          // Cerrar modal de forma robusta
          this.closeModal("staticBackdrop");
        } else {
          // Implementar creación
          const data = {
            nombre: this.cupNombre.trim(),
            codigo: this.cupCodigo.trim(),
            profesional: profesionalesUnicos,
            grupo: this.cupsGrupo.trim(),
            bd: "cups",
          };
          console.log("Data para crear:", data);

          await this.crearCups(data);
          console.log("CUPS creado exitosamente");

          // Pequeño delay
          await new Promise(resolve => setTimeout(resolve, 300));

          // Recargar lista desde API
          await this.getAllCups({ force: true });
          console.log("Lista de CUPS actualizada después de crear:", this.cups);

          alert("CUP guardado exitosamente.");
          this.clearFormCups();

          this.closeModal("staticBackdrop");
        }
      } catch (error) {
        console.error("Error al guardar CUPS:", error);
        alert("Error al guardar el CUPS: " + (error?.message || error));
      }
    },

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        const bsModal = window.bootstrap?.Modal?.getInstance(modal);
        if (bsModal) {
          bsModal.hide();
        }

        // Limpieza defensiva para evitar backdrops huérfanos.
        setTimeout(() => {
          document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('padding-right');
          document.body.style.removeProperty('overflow');
        }, 300);
      }
    },

    editCups(cupsId) {
      // Buscar el CUPS en la lista y cargar en el formulario
      const cups = this.cups.find((c) => c.id === cupsId);
      if (cups) {
        this.cupsEditId = cupsId;
        this.cupNombre = cups.DescripcionCUP || "";
        this.cupCodigo = cups.codigo || "";
        this.cupProfesional = this.normalizarProfesionales(cups.profesional);
        this.cupsGrupo = cups.Grupo || "";
        this.cupsEps = Array.isArray(cups.Eps) ? cups.Eps : [];
      }
    },

    async deleteCups(cupsId) {
      if (!confirm("¿Desea eliminar este CUPS?")) return;

      try {
        console.log("Iniciando eliminación del CUPS:", cupsId);

        // Primero eliminar desde API
        await this.eliminarCups(cupsId);
        console.log("CUPS eliminado desde API:", cupsId);

        // Pequeño delay para asegurar que API procese
        await new Promise(resolve => setTimeout(resolve, 500));

        // Luego recargar la lista desde API
        await this.getAllCups({ force: true });
        console.log("Lista de CUPS actualizada después de eliminar");
        console.log("CUPS en store después de cargar:", this.cups);

        alert("CUPS eliminado exitosamente.");
      } catch (error) {
        console.error("Error al eliminar CUPS:", error);
        alert("Error al eliminar el CUPS: " + (error?.message || error));
      }
    },

    clearFormCups() {
      this.cupNombre = "";
      this.cupCodigo = "";
      this.cupProfesional = [];
      this.cupsEditId = null;
      this.cupsGrupo = "";
      this.cupsEps = [];
    },

    clearFormContratos() {
      this.Seps = "";
      this.Scups = [];
      this.Sactividad = "";
      this.SbusquedaCup = "";
      this.SprofesionalFiltro = "";
      this.contratosTemp = [];
      this.modoEdicionContratoExistente = false;
      this.contratoEdicionId = null;
    },

    abrirModalAgregarCupsExistente(grupo) {
      if (!grupo?.epsId) {
        alert("No se pudo identificar la EPS del contrato.");
        return;
      }

      const contratosEps = (this.contratos || [])
        .filter((item) => String(item.epsId) === String(grupo.epsId));

      if (contratosEps.length === 0) {
        alert("No se encontró contrato para la EPS seleccionada.");
        return;
      }

      const contratoObjetivo = contratosEps
        .slice()
        .sort((a, b) => new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0))[0];

      this.clearFormContratos();
      this.modoEdicionContratoExistente = true;
      this.contratoEdicionId = contratoObjetivo.id;
      this.Seps = grupo.epsId;

      this.$nextTick(() => {
        const modal = document.getElementById("crearcontratos");
        if (!modal) return;

        let bsModal = window.bootstrap.Modal.getInstance(modal);
        if (!bsModal) {
          bsModal = new window.bootstrap.Modal(modal);
        }
        bsModal.show();
      });
    },

    // ===== CONTRATOS =====


    addCupsContrato() {
      if (!this.Seps || !this.Sactividad || this.Scups.length === 0) {
        alert("Por favor, seleccione EPS, actividad y al menos un CUPS.");
        return;
      }

      // Buscar los datos completos de EPS
      const epsSeleccionada = this.epss.find(eps => eps.id === this.Seps);

      if (!epsSeleccionada) {
        alert("Error: No se encontró la EPS seleccionada.");
        return;
      }

      let contadosAgregados = 0;
      let contadosDuplicados = 0;

      // Procesar cada CUPS seleccionado
      this.Scups.forEach(cupsId => {
        const cupSeleccionado = this.cups.find(cup => cup.id === cupsId);
        const actividadSeleccionada = this.actividadesExtra?.find(act => act.id === this.Sactividad);

        if (!cupSeleccionado) {
          console.warn("CUPS no encontrado:", cupsId);
          return;
        }

        // Verificar si ya existe en temporales PARA ESTA EPS específicamente
        const existeEnTemp = this.contratosTemp.some(
          (contrato) =>
            String(contrato.epsId) === String(this.Seps) &&
            String(contrato.cupsId) === String(cupsId) &&
            String(contrato.actividadId || "") === String(this.Sactividad || "")
        );

        if (existeEnTemp) {
          contadosDuplicados++;
          return;
        }

        // Agregar al array temporal con valores de texto en lugar de IDs
        const nuevoContrato = {
          epsId: this.Seps,  // Mantener ID para compatibilidad interna
          epsNombre: epsSeleccionada.eps,
          cupsId: cupsId,  // Mantener ID para compatibilidad interna
          cupsNombre: cupSeleccionado.DescripcionCUP,
          actividadId: this.Sactividad || null,
          actividadNombre: actividadSeleccionada ? actividadSeleccionada.nombre : null,
          cupsProfesional: this.normalizarProfesionales(cupSeleccionado.profesional),
          cupsGrupo: cupSeleccionado.Grupo
        };

        this.contratosTemp.push(nuevoContrato);
        contadosAgregados++;
      });

      // Mostrar resumen
      let mensaje = `Se agregaron ${contadosAgregados} CUPS al contrato.`;
      if (contadosDuplicados > 0) {
        mensaje += ` (${contadosDuplicados} CUPS ya existían en el contrato.)`;
      }
      alert(mensaje);

      console.log("CUPS agregados a temporal. Temporales actuales:", this.contratosTemp);

      // Limpiar campos
      this.Scups = [];
    },

    removeContrato(contrato) {
      if (confirm("\u00bfDesea eliminar este CUPS del contrato temporal?")) {
        // Buscar en temporales para esta EPS específicamente usando nombres
        const indexTemp = this.contratosTemp.findIndex(
          (c) =>
            String(c.epsId) === String(contrato.epsId) &&
            String(c.cupsId) === String(contrato.cupsId) &&
            String(c.actividadId || "") === String(contrato.actividadId || "")
        );

        if (indexTemp !== -1) {
          // Eliminar de temporales
          this.contratosTemp.splice(indexTemp, 1);
          console.log("CUPS eliminado de temporal. Temporales restantes:", this.contratosTemp);
          alert("CUPS eliminado del contrato temporal.");
        } else {
          alert("Error: No se encontró el CUPS en la lista temporal.");
        }
      }
    },

    async saveContrato() {
      if (this.contratosTemp.length === 0) {
        alert("Por favor, agregue al menos un CUPS a un contrato.");
        return;
      }

      try {
        console.log("Iniciando guardado de contratos. contratosTemp:", this.contratosTemp);

        if (this.modoEdicionContratoExistente) {
          if (!this.contratoEdicionId) {
            throw new Error("No se encontró el contrato objetivo para agregar CUPS.");
          }

          const contratosEps = (this.contratos || []).filter(
            (item) => String(item.epsId) === String(this.Seps)
          );
          const contratoActual =
            contratosEps.find((item) => String(item.id) === String(this.contratoEdicionId)) ||
            contratosEps[0];

          if (!contratoActual) {
            throw new Error("El contrato seleccionado no existe o fue eliminado.");
          }

          // Unifica CUPS de todos los contratos de la misma EPS para no perder actividades ya habilitadas.
          const cupsActuales = [];
          const existentes = new Set();
          contratosEps.forEach((contrato) => {
            (Array.isArray(contrato.cups) ? contrato.cups : []).forEach((item) => {
              const key = `${String(item.cupsId)}::${String(item.actividadId || "")}`;
              if (existentes.has(key)) return;
              existentes.add(key);
              cupsActuales.push({ ...item });
            });
          });

          const nuevos = this.contratosTemp.filter((item) => String(item.epsId) === String(this.Seps));

          let agregados = 0;
          let duplicados = 0;
          const rechazados = [];

          nuevos.forEach((item) => {
            const cupsId = String(item.cupsId || "").trim();
            const cupsNombre = String(item.cupsNombre || "").trim();
            const actividadId = String(item.actividadId || "").trim();
            if (!cupsId || !cupsNombre) {
              rechazados.push(item.cupsNombre || item.cupsId || "CUPS sin nombre");
              return;
            }

            const key = `${cupsId}::${actividadId}`;
            if (existentes.has(key)) {
              duplicados++;
              return;
            }

            cupsActuales.push({
              epsId: item.epsId,
              epsNombre: item.epsNombre || this.obtenerNombreEps(item.epsId),
              cupsId,
              cupsNombre,
              actividadId: item.actividadId || null,
              actividadNombre: item.actividadNombre || null,
              cupsProfesional: this.normalizarProfesionales(item.cupsProfesional),
              cupsGrupo: item.cupsGrupo || "",
            });
            existentes.add(key);
            agregados++;
          });

          if (agregados === 0) {
            let mensaje = "No se agregaron CUPS nuevos al contrato.";
            if (duplicados > 0) {
              mensaje += ` ${duplicados} ya existían para la misma actividad.`;
            }
            if (rechazados.length > 0) {
              mensaje += ` ${rechazados.length} tenían datos incompletos.`;
            }
            alert(mensaje);
            return;
          }

          const epsNombre =
            contratoActual.epsNombre ||
            this.obtenerNombreEps(contratoActual.epsId, this.Seps) ||
            "";

          if (!epsNombre) {
            throw new Error(
              "No se puede guardar el contrato porque falta el nombre de la EPS. Seleccione de nuevo la EPS e intente otra vez."
            );
          }

          const contratoData = {
            epsId: contratoActual.epsId,
            epsNombre,
            cups: cupsActuales,
            fechaCreacion: contratoActual.fechaCreacion,
          };

          await this.actualizarContrato({ contratoId: this.contratoEdicionId, contratoData });
          await this.getAllContratos({ force: true });

          let mensaje = `Se agregaron ${agregados} CUPS al contrato existente.`;
          if (duplicados > 0) {
            mensaje += ` (${duplicados} ya existían.)`;
          }
          if (rechazados.length > 0) {
            mensaje += ` (${rechazados.length} omitidos por datos incompletos.)`;
          }
          alert(mensaje);

          this.clearFormContratos();
          this.closeModal("crearcontratos");
          return;
        }

        // Agrupar contratosTemp por epsId
        const contratosPorEps = {};

        this.contratosTemp.forEach(contrato => {
          if (!contratosPorEps[contrato.epsId]) {
            contratosPorEps[contrato.epsId] = {
              epsId: contrato.epsId,
              epsNombre: contrato.epsNombre || this.obtenerNombreEps(contrato.epsId),
              cups: []
            };
          }
          // Agregar el CUPS a la lista de esta EPS con toda la información requerida
          contratosPorEps[contrato.epsId].cups.push({
            epsId: contrato.epsId,                  // eps.id (para compatibilidad)
            epsNombre: contrato.epsNombre || this.obtenerNombreEps(contrato.epsId),
            cupsId: contrato.cupsId,                // cup.id (para compatibilidad)
            cupsNombre: contrato.cupsNombre,        // cup.DescripcionCUP (valor de pantalla)
            actividadId: contrato.actividadId,      // actividad.id (para compatibilidad)
            actividadNombre: contrato.actividadNombre, // actividad.nombre (valor de pantalla)
            cupsProfesional: this.normalizarProfesionales(contrato.cupsProfesional),
            cupsGrupo: contrato.cupsGrupo           // cup.Grupo (valor adicional)
          });
        });

        console.log("Contratos agrupados por EPS:", contratosPorEps);

        // Guardar un contrato para cada EPS
        const epsArray = Object.keys(contratosPorEps);
        for (const epsId of epsArray) {
          const contratoData = contratosPorEps[epsId];
          if (!contratoData.epsNombre) {
            throw new Error(
              `No se puede guardar el contrato de la EPS (${epsId}): falta el nombre. Seleccione nuevamente la EPS.`
            );
          }
          if (!contratoData.cups.length) {
            throw new Error(
              `No se puede guardar el contrato de ${contratoData.epsNombre}: no hay CUPS para guardar.`
            );
          }
          console.log(`Guardando contrato para EPS ${epsId}:`, contratoData);

          await this.crearContrato(contratoData);
        }

        alert(`Se guardaron ${epsArray.length} contrato(s) exitosamente.`);

        // Recargar contratos
        await this.getAllContratos({ force: true });

        // Limpiar formulario
        this.clearFormContratos();

        // Cerrar modal de forma robusta
        this.closeModal("crearcontratos");
      } catch (error) {
        console.error("Error al guardar contrato:", error);
        alert(
          "No se pudo guardar el contrato\n\n" +
          formatApiError(error, "Revise EPS, actividad y CUPS e intente nuevamente.")
        );
      }
    },

    async eliminarCupsDeContrato(contratoId, cupsId) {
      if (!confirm("¿Desea eliminar este CUPS del contrato?")) return;

      try {
        // Buscar el contrato actual
        const contratoActual = this.contratos.find(c => c.id === contratoId);

        if (!contratoActual) {
          alert("Error: No se encontró el contrato.");
          return;
        }

        // Filtrar el CUPS a eliminar
        const cupsActualizados = contratoActual.cups.filter(cup => cup.cupsId !== cupsId);

        // Si no quedan CUPS, eliminar todo el contrato
        if (cupsActualizados.length === 0) {
          await this.eliminarContrato(contratoId);
          alert("CUPS eliminado. El contrato se eliminó porque no quedaban más CUPS.");
        } else {
          // Actualizar el contrato con los CUPS restantes
          const contratoData = {
            epsId: contratoActual.epsId,
            cups: cupsActualizados,
            fechaCreacion: contratoActual.fechaCreacion
          };

          await this.actualizarContrato({ contratoId, contratoData });
          alert("CUPS eliminado exitosamente.");
        }

        // Recargar contratos
        await this.getAllContratos({ force: true });
      } catch (error) {
        console.error("Error al eliminar CUPS:", error);
        alert(
          "No se pudo eliminar el CUPS del contrato\n\n" +
          formatApiError(error, "Intente nuevamente o recargue la página.")
        );
      }
    },

    // Agrupar CUPS por profesional (un CUPS con varios profesionales aparece en cada pestaña)
    agruparPorProfesional(cups) {
      if (!cups || !Array.isArray(cups)) return {};

      const grouped = {};
      cups.forEach((cup) => {
        const profesionales = this.obtenerListaProfesionalesCups(cup);
        const lista = profesionales.length ? profesionales : [this.sinEspecificar];
        lista.forEach((profesional) => {
          if (!grouped[profesional]) {
            grouped[profesional] = [];
          }
          grouped[profesional].push(cup);
        });
      });

      return grouped;
    },
    listarCupsPorActividad(cups) {
      const grouped = {};
      (cups || []).forEach((cup) => {
        const nombre =
          this.obtenerNombreActividadPorId(cup.actividadId, cup.actividadNombre) || this.sinEspecificar;
        const key = String(cup.actividadId || nombre);
        if (!grouped[key]) {
          grouped[key] = {
            key,
            nombre,
            items: [],
          };
        }
        grouped[key].items.push(cup);
      });

      return Object.values(grouped).sort((a, b) => a.nombre.localeCompare(b.nombre));
    },
    listarCupsPorProfesional(cups) {
      return Object.entries(this.agruparPorProfesional(cups))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([profesional, items]) => ({
          profesional,
          items,
          actividades: this.listarCupsPorActividad(items),
          slug: String(profesional || "sin-especificar")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "sin-especificar",
        }));
    },
    obtenerListaProfesionalesCups(cup) {
      const cupCatalogo = this.obtenerCupPorId(cup?.cupsId || cup?.id);
      const raw =
        cupCatalogo?.profesional ??
        cup?.cupsProfesional ??
        cup?.profesional ??
        [];
      return this.normalizarProfesionales(raw);
    },
    obtenerNombreEps(epsId, fallback = "") {
      const eps = this.epss?.find((item) => String(item.id) === String(epsId));
      return eps?.eps || fallback || "";
    },
    obtenerNombreActividadPorId(actividadId, fallback = "") {
      const actividad = this.actividadesExtra?.find(
        (item) => String(item.id) === String(actividadId)
      );
      return actividad?.nombre || fallback || "";
    },
    obtenerCupPorId(cupsId) {
      return this.cups?.find((cup) => String(cup.id) === String(cupsId)) || null;
    },
    obtenerNombreCups(cupsId, fallback = "") {
      const cup = this.obtenerCupPorId(cupsId);
      return cup?.DescripcionCUP || fallback || "";
    },
    obtenerCodigoCups(cupsId, fallback = "") {
      const cup = this.obtenerCupPorId(cupsId);
      return cup?.codigo || fallback || "";
    },
    obtenerProfesionalCups(cupsId, fallback = "") {
      const cup = this.obtenerCupPorId(cupsId);
      return this.formatProfesionales(
        cup?.profesional,
        this.formatProfesionales(fallback, fallback || "")
      );
    },
    obtenerGrupoCups(cupsId, fallback = "") {
      const cup = this.obtenerCupPorId(cupsId);
      return cup?.Grupo || fallback || "";
    },

    confirmarEliminarContratos(contratoIds) {
      if (!contratoIds || contratoIds.length === 0) return;

      const cantidadContratos = contratoIds.length;
      const mensaje = cantidadContratos === 1
        ? "⚠️ ¿Está seguro de que desea eliminar este contrato con todos sus CUPS? Esta acción no se puede deshacer."
        : `⚠️ ¿Está seguro de que desea eliminar los ${cantidadContratos} contratos de esta EPS con todos sus CUPS? Esta acción no se puede deshacer.`;

      if (confirm(mensaje)) {
        this.eliminarContratosPorEps(contratoIds);
      }
    },

    async eliminarContratosPorEps(contratoIds) {
      if (!contratoIds || contratoIds.length === 0) return;

      const mensaje = contratoIds.length === 1
        ? "¿Desea eliminar este contrato con todos sus CUPS?"
        : `¿Desea eliminar los ${contratoIds.length} contratos de esta EPS con todos sus CUPS?`;

      if (!confirm(mensaje)) return;

      try {
        // Eliminar todos los contratos uno por uno
        for (const contratoId of contratoIds) {
          await this.eliminarContrato(contratoId);
        }

        alert(`${contratoIds.length} contrato(s) eliminado(s) exitosamente.`);

        // Recargar contratos
        await this.getAllContratos({ force: true });
      } catch (error) {
        console.error("Error al eliminar contratos:", error);
        alert(
          "No se pudieron eliminar los contratos\n\n" +
          formatApiError(error, "Intente nuevamente o recargue la página.")
        );
      }
    },

    getCupsInfo(cupsId) {
      // Buscar información del CUPS en el estado
      const cup = this.cups?.find(c => c.id === cupsId || c.codigo === cupsId);
      return cup || { codigo: cupsId, DescripcionCUP: 'CUPS no encontrado' };
    },

    // ===== IMPORTAR CSV =====
    _parsearLineaCSV(linea, separador = ",") {
      const resultado = [];
      let campo = "";
      let enComillas = false;
      for (let i = 0; i < linea.length; i++) {
        const c = linea[i];
        if (c === '"') {
          if (enComillas && linea[i + 1] === '"') {
            campo += '"';
            i++;
          } else {
            enComillas = !enComillas;
          }
        } else if (c === separador && !enComillas) {
          resultado.push(campo);
          campo = "";
        } else {
          campo += c;
        }
      }
      resultado.push(campo);
      return resultado;
    },

    _normalizarEncabezadoCSV(texto) {
      return String(texto || "")
        .replace(/^\uFEFF/, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/^"|"$/g, "")
        .replace(/\s+/g, "");
    },

    _detectarSeparadorCSV(lineaCabecera) {
      const porComa = this._parsearLineaCSV(lineaCabecera, ",").length;
      const porPuntoComa = this._parsearLineaCSV(lineaCabecera, ";").length;
      return porPuntoComa > porComa ? ";" : ",";
    },

    parsearCSV(texto) {
      const lineas = String(texto || "").trim().split(/\r?\n/);
      if (lineas.length < 2) return [];
      const separador = this._detectarSeparadorCSV(lineas[0]);
      const encabezados = this._parsearLineaCSV(lineas[0], separador).map((h) => this._normalizarEncabezadoCSV(h));
      const filas = [];
      for (let i = 1; i < lineas.length; i++) {
        if (!lineas[i].trim()) continue;
        const valores = this._parsearLineaCSV(lineas[i], separador);
        const fila = {};
        encabezados.forEach((enc, idx) => {
          fila[enc] = valores[idx] !== undefined ? String(valores[idx]).trim() : "";
        });
        filas.push(fila);
      }
      return filas;
    },

    iniciarProgresoCsv(modulo, total) {
      this.csvImport = {
        visible: true,
        inProgress: true,
        modulo,
        mensaje: "Iniciando importacion...",
        total,
        procesados: 0,
        exitosos: 0,
        errores: 0,
        porcentaje: 0,
      };
    },

    actualizarProgresoCsv({ procesados, exitosos, errores, mensaje = "Procesando..." }) {
      const total = Number(this.csvImport.total || 0);
      const porcentaje = total > 0
        ? Math.min(100, Math.round((Number(procesados || 0) / total) * 100))
        : 0;
      this.csvImport = {
        ...this.csvImport,
        procesados,
        exitosos,
        errores,
        porcentaje,
        mensaje,
      };
    },

    finalizarProgresoCsv(mensajeFinal = "Importacion finalizada") {
      this.csvImport = {
        ...this.csvImport,
        inProgress: false,
        procesados: this.csvImport.total,
        porcentaje: 100,
        mensaje: mensajeFinal,
      };
    },

    async importarCsvComunas(event) {
      const archivo = event.target.files[0];
      if (!archivo) return;
      const texto = await archivo.text();
      const filas = this.parsearCSV(texto);
      const validas = filas.filter((f) => f.comuna && f.barrio);
      if (validas.length === 0) {
        alert('No se encontraron filas válidas. El CSV debe tener columnas "comuna" y "barrio".');
        event.target.value = "";
        return;
      }
      const omitidas = filas.length - validas.length;
      const msg = omitidas > 0
        ? `Se importarán ${validas.length} registros (${omitidas} omitidos por datos incompletos). ¿Continuar?`
        : `Se importarán ${validas.length} registros de Comunas/Barrios. ¿Continuar?`;
      if (!confirm(msg)) { event.target.value = ""; return; }

      this.iniciarProgresoCsv("Importando CSV de Comunas/Barrios", validas.length);
      let errores = 0;
      let exitosos = 0;
      for (let i = 0; i < validas.length; i++) {
        const fila = validas[i];
        try {
          await this.crearComunaBarrio({ comuna: fila.comuna, barrio: fila.barrio, bd: "comunasybarrios" });
          exitosos++;
        } catch (e) { errores++; }
        this.actualizarProgresoCsv({
          procesados: i + 1,
          exitosos,
          errores,
          mensaje: `Procesando registro ${i + 1} de ${validas.length}`,
        });
      }
      await this.getAllComunaBarrios();
      this.finalizarProgresoCsv("Importacion de Comunas/Barrios finalizada");
      event.target.value = "";
      alert(`Importación completada: ${validas.length - errores} registros importados${errores > 0 ? `, ${errores} con error` : ""}.`);
    },

    async importarCsvEps(event) {
      const archivo = event.target.files[0];
      if (!archivo) return;
      const texto = await archivo.text();
      const filas = this.parsearCSV(texto);
      const validas = filas.filter((f) => f.eps && f.eps.trim());
      if (validas.length === 0) {
        alert('No se encontraron filas válidas. El CSV debe tener la columna "eps".');
        event.target.value = "";
        return;
      }
      if (!confirm(`Se importarán ${validas.length} registros de EPS. ¿Continuar?`)) {
        event.target.value = ""; return;
      }

      this.iniciarProgresoCsv("Importando CSV de EPS", validas.length);
      let errores = 0;
      let exitosos = 0;
      let primerError = "";
      for (let i = 0; i < validas.length; i++) {
        const fila = validas[i];
        try {
          await this.crearEps({ eps: fila.eps.trim(), bd: "eps" });
          exitosos++;
        } catch (e) {
          errores++;
          if (!primerError) {
            primerError =
              e?.response?.data?.detail ||
              e?.response?.data?.message ||
              e?.message ||
              "Error desconocido";
          }
        }
        this.actualizarProgresoCsv({
          procesados: i + 1,
          exitosos,
          errores,
          mensaje: `Procesando registro ${i + 1} de ${validas.length}`,
        });
      }
      await this.getAllEps({ force: true });
      this.finalizarProgresoCsv("Importacion de EPS finalizada");
      event.target.value = "";
      const resumen = `Importación completada: ${validas.length - errores} EPS importadas${errores > 0 ? `, ${errores} con error` : ""}.`;
      alert(errores > 0 ? `${resumen}\nPrimer error: ${primerError}` : resumen);
    },

    async importarCsvCups(event) {
      const archivo = event.target.files[0];
      if (!archivo) return;
      const texto = await archivo.text();
      const filas = this.parsearCSV(texto);
      const validas = filas.filter((f) => f.descripcioncups && f.codigo && f.profesional && f.grupo);
      if (validas.length === 0) {
        alert('No se encontraron filas válidas. El CSV debe tener columnas: descripcionCups, codigo, grupo, profesional\nPara múltiples profesionales use el separador "|", por ejemplo: Medico|Enfermero');
        event.target.value = "";
        return;
      }
      const omitidas = filas.length - validas.length;
      const msg = omitidas > 0
        ? `Se importarán ${validas.length} CUPS (${omitidas} omitidos por datos incompletos). ¿Continuar?`
        : `Se importarán ${validas.length} CUPS. ¿Continuar?`;
      if (!confirm(msg)) { event.target.value = ""; return; }

      this.iniciarProgresoCsv("Importando CSV de CUPS", validas.length);
      let errores = 0;
      let exitosos = 0;
      for (let i = 0; i < validas.length; i++) {
        const fila = validas[i];
        try {
          const profesionales = this.normalizarProfesionales(fila.profesional.split("|").map((p) => p.trim()));
          if (profesionales.length === 0) {
            errores++;
            this.actualizarProgresoCsv({
              procesados: i + 1,
              exitosos,
              errores,
              mensaje: `Procesando registro ${i + 1} de ${validas.length}`,
            });
            continue;
          }
          await this.crearCups({
            nombre: fila.descripcioncups.trim(),
            codigo: fila.codigo.trim(),
            profesional: profesionales,
            grupo: fila.grupo.trim(),
            bd: "cups",
          });
          exitosos++;
        } catch (e) { errores++; }
        this.actualizarProgresoCsv({
          procesados: i + 1,
          exitosos,
          errores,
          mensaje: `Procesando registro ${i + 1} de ${validas.length}`,
        });
      }
      await this.getAllCups({ force: true });
      this.finalizarProgresoCsv("Importacion de CUPS finalizada");
      event.target.value = "";
      alert(`Importación completada: ${validas.length - errores} CUPS importados${errores > 0 ? `, ${errores} con error` : ""}.`);
    },

    async importarCsvActividades(event) {
      const archivo = event.target.files[0];
      if (!archivo) return;
      const texto = await archivo.text();
      const filas = this.parsearCSV(texto);
      const validas = filas.filter((f) => {
        const profesionalesRaw = f.profesionales || f.profesional || "";
        return f.nombre && f.nombre.trim() && String(profesionalesRaw).trim();
      });
      if (validas.length === 0) {
        alert('No se encontraron filas válidas. El CSV debe tener columnas: clave, nombre, profesionales.\n"profesionales" es obligatorio y debe venir separado por "|" (ej: Auxiliar de enfermeria|Enfermero).');
        event.target.value = "";
        return;
      }
      const omitidas = filas.length - validas.length;
      const msg = omitidas > 0
        ? `Se importarán ${validas.length} actividades (${omitidas} omitidas por nombre/profesionales vacíos). ¿Continuar?`
        : `Se importarán ${validas.length} actividades. ¿Continuar?`;
      if (!confirm(msg)) { event.target.value = ""; return; }

      this.iniciarProgresoCsv("Importando CSV de Actividades", validas.length);
      let errores = 0;
      let exitosos = 0;
      for (let i = 0; i < validas.length; i++) {
        const fila = validas[i];
        try {
          const profesionalesRaw = fila.profesionales || fila.profesional || "";
          const profesionales = this.normalizarProfesionalesCsvActividades(profesionalesRaw);
          if (profesionales.length === 0) {
            errores++;
            this.actualizarProgresoCsv({
              procesados: i + 1,
              exitosos,
              errores,
              mensaje: `Procesando registro ${i + 1} de ${validas.length}`,
            });
            continue;
          }
          await this.crearActividadExtra({
            key: (fila.clave || "").trim(),
            nombre: fila.nombre.trim(),
            Profesional: profesionales,
          });
          exitosos++;
        } catch (e) { errores++; }
        this.actualizarProgresoCsv({
          procesados: i + 1,
          exitosos,
          errores,
          mensaje: `Procesando registro ${i + 1} de ${validas.length}`,
        });
      }
      await this.getAllActividadesExtra({ force: true });
      this.finalizarProgresoCsv("Importacion de Actividades finalizada");
      event.target.value = "";
      alert(`Importación completada: ${validas.length - errores} actividades importadas${errores > 0 ? `, ${errores} con error` : ""}.`);
    },

    getColorClassByProfesional(profesional) {
      const prof = this.normalizarProfesionales(profesional)[0];
      if (!prof) return "";
      const valor = prof.toLowerCase().trim();

      if (valor.includes("medico") || valor.includes("médico")) {
        return "bg-medico";
      } else if (valor.includes("enfermero") || valor.includes("enfermera")) {
        return "bg-enfermero";
      } else if (valor.includes("auxiliar")) {
        return "bg-auxiliar";
      } else if (valor.includes("higienista")) {
        return "bg-higienista";
      }
      return "bg-otro";
    },
  },
  mounted() {
    this.getAllComunaBarrios();
    this.getAllEps();
    this.getAllCups();
    this.getAllContratos();
    this.getAllActividadesExtra();
    /* traer  grupos, profesionales ,epsApp */
    /* crear epsApp autorizadas en las caracterizacion */
  },
};
</script>

<style scoped>
.profesionales-checklist {
  max-height: 220px;
  overflow-y: auto;
  background: #fff;
}

.profesionales-checklist .form-check {
  margin-bottom: 0.25rem;
}

.parametros-panel {
  border: 1px solid #dee2e6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.parametros-panel .card-header {
  background: #f8f9fa;
  font-size: 0.95rem;
}

.nav-tabs-contratos .nav-link {
  font-size: 0.85rem;
  padding: 0.4rem 0.7rem;
  color: #495057;
}

.nav-tabs-contratos .nav-link.active {
  font-weight: 600;
  color: #0d6efd;
}

.contrato-actividad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-bottom: 0;
  border-radius: 0.25rem 0.25rem 0 0;
  padding: 0.45rem 0.65rem;
  font-size: 0.85rem;
}

.cups-busqueda-resultados {
  max-height: 240px;
  overflow-y: auto;
  background: #fff;
}

.cups-busqueda-item {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  border-bottom: 1px solid #eee;
  background: transparent;
  padding: 0.55rem 0.75rem;
}

.cups-busqueda-item:hover {
  background: #f8f9fa;
}

.cups-busqueda-item:last-child {
  border-bottom: 0;
}

/* Colores de agrupación por profesional */
.bg-medico {
  background-color: #e3f2fd !important;
  /* Azul claro */
}

.bg-enfermero {
  background-color: #f3e5f5 !important;
  /* Púrpura claro */
}

.bg-auxiliar {
  background-color: #fff3e0 !important;
  /* Naranja claro */
}

.bg-higienista {
  background-color: #e0f7fa !important;
}

.bg-otro {
  background-color: #f5f5f5 !important;
  /* Gris claro */
}

/* Hover effects para mejor UX */
.bg-medico:hover {
  background-color: #bbdefb !important;
}

.bg-enfermero:hover {
  background-color: #e1bee7 !important;
}

.bg-auxiliar:hover {
  background-color: #ffe0b2 !important;
}

.bg-otro:hover {
  background-color: #eeeeee !important;
}
</style>

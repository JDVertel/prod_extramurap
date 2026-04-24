<template>
    <div class="container-fluid">
        <h1> Facturación</h1>
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
        <div v-if="!cargando">

            <nav>
                <div class="nav nav-tabs" id="nav-tab" role="tablist">
                    <button class="nav-link" :class="{ active: activeTab === 'pendientes' }"
                        @click="activeTab = 'pendientes'" type="button" :aria-selected="activeTab === 'pendientes'">
                        Pendientes
                    </button>
                    <button class="nav-link" :class="{ active: activeTab === 'aprovisionar' }"
                        @click="activeTab = 'aprovisionar'" type="button" :aria-selected="activeTab === 'aprovisionar'">
                        Aprovisionar
                    </button>
                </div>
            </nav>
            <div class="tab-content" id="nav-tabContent">
                <div v-if="activeTab === 'pendientes'" class="tab-pane show active" id="nav-home" role="tabpanel"
                    tabindex="0">

                    <div class="d-flex justify-content-between align-items-center mb-2 mt-2 gap-2 flex-wrap">
                        <div class="small text-muted">
                            Mostrando {{ encuestasPendientesProcesadas.length }} de {{ totalPendientesCargados }} pendientes cargados
                        </div>
                        <button type="button" class="btn btn-outline-secondary btn-sm"
                            @click="limpiarFiltrosPendientes">
                            Limpiar filtros
                        </button>
                    </div>
                    <div class="table-responsive tabla-scroll" ref="tablaHtml">
                        <table class="table table-bordered table-striped table-sm align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th @click="ordenarPendientes('id')" role="button">id {{
                                        indicadorOrdenPendientes('id') }}</th>
                                    <th @click="ordenarPendientes('grupo')" role="button">Grupo {{
                                        indicadorOrdenPendientes('grupo') }}</th>
                                    <th @click="ordenarPendientes('paciente')" role="button">Paciente {{
                                        indicadorOrdenPendientes('paciente') }}</th>
                                    <th @click="ordenarPendientes('sexo')" role="button">Sexo {{
                                        indicadorOrdenPendientes('sexo') }}</th>
                                    <th @click="ordenarPendientes('documento')" role="button">Documento {{
                                        indicadorOrdenPendientes('documento') }}</th>
                                    <th @click="ordenarPendientes('fechaNac')" role="button">Fecha Nac. {{
                                        indicadorOrdenPendientes('fechaNac') }}</th>
                                    <th @click="ordenarPendientes('edad')" role="button">Edad {{
                                        indicadorOrdenPendientes('edad') }}</th>
                                    <th @click="ordenarPendientes('eps')" role="button">EPS {{
                                        indicadorOrdenPendientes('eps') }}</th>
                                    <th @click="ordenarPendientes('convenio')" role="button">Convenio {{
                                        indicadorOrdenPendientes('convenio') }}</th>
                                    <th @click="ordenarPendientes('regimen')" role="button">Régimen {{
                                        indicadorOrdenPendientes('regimen') }}</th>
                                    <th @click="ordenarPendientes('direccion')" role="button">Dirección {{
                                        indicadorOrdenPendientes('direccion') }}</th>
                                    <th @click="ordenarPendientes('barrio')" role="button">Barrio {{
                                        indicadorOrdenPendientes('barrio') }}</th>
                                    <th @click="ordenarPendientes('comuna')" role="button">Comuna {{
                                        indicadorOrdenPendientes('comuna') }}</th>
                                    <th @click="ordenarPendientes('fecha')" role="button">Fecha Demanda {{
                                        indicadorOrdenPendientes('fecha') }}</th>
                                    <th @click="ordenarPendientes('fechagestEnfermera')" role="button">Fecha cierre {{
                                        indicadorOrdenPendientes('fechagestEnfermera') }}</th>
                                    <th>Acciones</th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th>
                                        <select v-model="filtrosPendientes.grupo" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.grupo"
                                                :key="`pend-grupo-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th>
                                        <select v-model="filtrosPendientes.sexo" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.sexo"
                                                :key="`pend-sexo-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th>
                                        <select v-model="filtrosPendientes.eps" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.eps"
                                                :key="`pend-eps-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select v-model="filtrosPendientes.convenio" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.convenio"
                                                :key="`pend-convenio-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select v-model="filtrosPendientes.regimen" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.regimen"
                                                :key="`pend-regimen-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th>
                                        <select v-model="filtrosPendientes.barrio" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.barrio"
                                                :key="`pend-barrio-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select v-model="filtrosPendientes.comuna" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.comuna"
                                                :key="`pend-comuna-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="paciente in encuestasPendientesProcesadas" :key="paciente.id">
                                    <td>{{ paciente.id }}</td>
                                    <td>{{ paciente.grupo }}</td>
                                    <td>
                                        {{ paciente.nombre1 }} {{ paciente.apellido1 }}
                                        {{ paciente.apellido2 }}
                                    </td>
                                    <td>{{ paciente.sexo }}</td>
                                    <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                    <td>{{ paciente.fechaNac }}</td>
                                    <td>{{ calcularEdad(paciente.fechaNac) }}</td>
                                    <td>{{ paciente.eps }}</td>
                                    <td>{{ paciente.convenio }}</td>
                                    <td>{{ paciente.regimen }}</td>
                                    <td>{{ paciente.direccion }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                    <td>{{ paciente.fecha }}</td>
                                    <td>{{ paciente.fechagestEnfermera }}</td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                                                data-bs-target="#staticBackdrop" @click="setPacienteId(paciente.id)">
                                                <i class="bi bi-bookmark-check-fill"></i>
                                            </button>
                                            <button v-if="paciente.allFacturasVacias" type="button"
                                                class="btn btn-outline-danger" :disabled="devolverDisabled[paciente.id]"
                                                @click="devolverARegistroInicial(paciente.id)">
                                                <i class="bi bi-arrow-counterclockwise"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="encuestasPendientesProcesadas.length === 0">
                                    <td colspan="16" class="text-center text-muted py-4">
                                        No hay pacientes visibles en la bandeja.
                                        <span v-if="totalPendientesCargados > 0">Hay registros cargados, pero quedaron ocultos por filtros o por la pestaña actual.</span>
                                        <span v-else>No se cargaron pendientes para este facturador.</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-if="activeTab === 'aprovisionar'" class="tab-pane show active" id="nav-profile"
                    role="tabpanel" tabindex="0">
                    <div class="container mt-3">

                        <ul class="nav nav-tabs" id="myTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="home-tab" data-bs-toggle="tab"
                                    data-bs-target="#home-tab-pane" type="button" role="tab"
                                    aria-controls="home-tab-pane" aria-selected="true">Consulta x Fechas</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="profile-tab" data-bs-toggle="tab"
                                    data-bs-target="#profile-tab-pane" type="button" role="tab"
                                    aria-controls="profile-tab-pane" aria-selected="false">Consulta x Documento</button>
                            </li>

                        </ul>
                        <div class="tab-content" id="myTabContent">
                            <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel"
                                aria-labelledby="home-tab" tabindex="0">
                                <form class="row mt-3" @submit.prevent="getdataEncuestas(fechaInicio, fechaFin, convenioFiltro)">
                                    <div class="col-4">
                                        <div class="input-group">
                                            <span class="input-group-text">Convenio</span>
                                            <select v-model="convenioFiltro" class="form-select"
                                                :disabled="convenioBloqueado" required>
                                                <option value="">Seleccione</option>
                                                <option v-for="opcion in convenioOpciones" :key="opcion"
                                                    :value="opcion">{{ opcion }}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-8">
                                        <div class="input-group">
                                            <span class="input-group-text">Rango de fechas de la consulta</span>
                                            <input type="date" id="fechaInicio" name="fechaInicio"
                                                aria-label="First name" class="form-control" v-model="fechaInicio" />
                                            <input type="date" id="fechaFin" name="fechaFin" aria-label="Last name"
                                                class="form-control" v-model="fechaFin" />
                                        </div>
                                    </div>
                                    <div class="col-4">
                                        <button type="submit" class="btn btn-warning">
                                            Buscar
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel"
                                aria-labelledby="profile-tab" tabindex="0">
                                <form class="row mt-3" @submit.prevent="getdataEncuestasById(tipodoc, numdoc)">
                                    <div class="col-4"> <label for="tipodoc" class="form-label">Tipo de
                                            Documento</label> <select id="tipodoc" v-model="tipodoc" class="form-select"
                                            required>
                                            <option value="">Seleccione</option>
                                            <option value="RC">Registro Civil</option>
                                            <option value="TI">Tarjeta de Identidad</option>
                                            <option value="CC">Cédula de Ciudadanía</option>
                                            <option value="CE">Cédula de Extranjería</option>
                                            <option value="NV">Certificado nacido vivo</option>
                                            <option value="PA">Pasaporte</option>
                                            <option value="PE">Permiso Especial de Permanencia</option>
                                            <option value="MS">Menos sin identificacion</option>
                                            <option value="AS">Adulto sin identificacion</option>
                                            <option value="PT">Permiso por proteccion temporal</option>
                                        </select></div>
                                    <div class="col-4"> <label for="numdocFact" class="form-label">Número de
                                            Documento</label> <input type="text" id="numdocFact" name="numdocFact"
                                            aria-label="First name" class="form-control" v-model="numdoc" /></div>
                                    <div class="col-4"><button type="submit" class="btn btn-warning mt-5">
                                            Buscar
                                        </button></div>
                                </form>
                            </div>

                        </div>

                        <br>

                    </div>
                    <br />
                    <p>Registro</p>
                    <div class="d-flex justify-content-end mb-2">
                        <button type="button" class="btn btn-outline-secondary btn-sm" @click="limpiarFiltrosRegistro">
                            Limpiar filtros
                        </button>
                    </div>
                    <div class="table-responsive tabla-scroll" ref="tablaHtml">
                        <table class="table table-bordered table-striped table-sm align-middle table-success">
                            <thead class="table-light">
                                <tr>
                                    <!--  <th>id</th> -->
                                    <th @click="ordenarRegistro('grupo')" role="button">Grupo {{ indicadorOrden('grupo')
                                        }}</th>
                                    <th @click="ordenarRegistro('paciente')" role="button">Paciente {{
                                        indicadorOrden('paciente') }}</th>
                                    <th @click="ordenarRegistro('sexo')" role="button">Sexo {{ indicadorOrden('sexo') }}
                                    </th>
                                    <th @click="ordenarRegistro('documento')" role="button">Documento {{
                                        indicadorOrden('documento') }}</th>
                                    <th @click="ordenarRegistro('fechaNac')" role="button">Fecha Nac. {{
                                        indicadorOrden('fechaNac') }}</th>
                                    <th @click="ordenarRegistro('eps')" role="button">EPS {{ indicadorOrden('eps') }}
                                    </th>
                                    <th @click="ordenarRegistro('regimen')" role="button">Régimen {{
                                        indicadorOrden('regimen') }}</th>
                                    <th @click="ordenarRegistro('direccion')" role="button">Dirección {{
                                        indicadorOrden('direccion') }}</th>
                                    <th @click="ordenarRegistro('barrio')" role="button">Barrio {{
                                        indicadorOrden('barrio') }}</th>
                                    <th @click="ordenarRegistro('comuna')" role="button">Comuna {{
                                        indicadorOrden('comuna') }}</th>
                                    <th @click="ordenarRegistro('fecha')" role="button">Fecha Demanda {{
                                        indicadorOrden('fecha') }}</th>
                                    <th @click="ordenarRegistro('fechagestEnfermera')" role="button">Fecha cierre Enf {{
                                        indicadorOrden('fechagestEnfermera') }}</th>
                                    <th @click="ordenarRegistro('remision')" role="button">Remisión {{
                                        indicadorOrden('remision') }}</th>
                                    <th>Opciones</th>
                                </tr>
                                <tr>
                                    <th>
                                        <select v-model="filtrosRegistro.grupo" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.grupo" :key="`grupo-${item}`"
                                                :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th>
                                        <select v-model="filtrosRegistro.sexo" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.sexo" :key="`sexo-${item}`"
                                                :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th></th>
                                    <th>
                                        <select v-model="filtrosRegistro.eps" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.eps" :key="`eps-${item}`"
                                                :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select v-model="filtrosRegistro.regimen" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.regimen"
                                                :key="`regimen-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th>
                                        <select v-model="filtrosRegistro.barrio" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.barrio"
                                                :key="`barrio-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select v-model="filtrosRegistro.comuna" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.comuna"
                                                :key="`comuna-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                    <th></th>
                                    <th>
                                        <select v-model="filtrosRegistro.remision" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.remision"
                                                :key="`remision-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="paciente in encuestasFactProcesadas" :key="paciente.id">
                                    <!-- <td>{{paciente.id }}</td> -->
                                    <td>{{ paciente.grupo }}</td>
                                    <td>
                                        {{ paciente.nombre1 }} {{ paciente.nombre2 }}
                                        {{ paciente.apellido1 }} {{ paciente.apellido2 }}
                                    </td>
                                    <td>{{ paciente.sexo }}</td>
                                    <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                    <td>{{ paciente.fechaNac }}</td>
                                    <td>{{ paciente.eps }}</td>
                                    <td>{{ paciente.regimen }}</td>
                                    <td>{{ paciente.direccion }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                    <td>{{ paciente.fecha }}</td>
                                    <td>{{ paciente.fechagestEnfermera }}</td>
                                    <td>{{ paciente.requiereRemision }}</td>
                                    <td>
                                        <button type="button" class="btn btn-warning"
                                            :disabled="aprovDisabled[paciente.id]" @click="
                                                AprovisionarPaciente(
                                                    (idEncuesta = paciente.id),
                                                    (idProf = userData.numDocumento)
                                                )
                                                ">
                                            <i class="bi bi-person-plus"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade modal-dialog-scrollable" id="staticBackdrop" data-bs-backdrop="static"
            data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel">
                            <i class="bi bi-clipboard-check"></i> Facturar CUPS
                        </h1>

                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="container-fluid">
                        <table class="table table-bordered table-striped table-sm align-middle table-success">
                            <thead class="table-light">
                                <tr>
                                    <!-- <th>idEnc</th> -->
                                    <th>Grupo</th>
                                    <th>Paciente</th>
                                    <th>Sexo</th>
                                    <th>Documento</th>
                                    <th>Fecha Nac.</th>
                                    <th>Edad</th>
                                    <th>EPS</th>
                                    <th>Régimen</th>
                                    <th>Dirección</th>
                                    <th>Barrio</th>
                                    <th>Comuna</th>
                                    <th>lab/visit</th>
                                    <th>Gest. Aux</th>

                                    <th>Gest. Médica</th>
                                    <th>Gest. Enfermera</th>
                                    <th>Teléfono</th>
                                </tr>
                            </thead>
                            <tbody class="table-group-divider">
                                <tr v-for="paciente in InfoEncuestasById" :key="paciente.id">
                                    <!-- Campos principales del paciente -->
                                    <!-- <td>{{ pacienteIdModal}}</td> -->
                                    <td>{{ paciente.grupo }}</td>
                                    <td>
                                        {{ paciente.nombre1 }} {{ paciente.apellido1 }}
                                        {{ paciente.apellido2 }}
                                    </td>
                                    <td>{{ paciente.sexo }}</td>
                                    <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                    <td>{{ paciente.fechaNac }}</td>
                                    <td>{{ calcularEdad(paciente.fechaNac) }}</td>
                                    <td>{{ paciente.eps }}</td>
                                    <td>{{ paciente.regimen }}</td>
                                    <td>{{ paciente.direccion }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                    <td>
                                        {{
                                            paciente.Agenda_tomademuestras?.cita_tomamuestras
                                                ? "Sí"
                                                : "No"
                                        }}/{{
                                            paciente.Agenda_Visitamedica?.cita_visitamedica
                                                ? "Sí"
                                                : "No"
                                        }}
                                    </td>
                                    <td>
                                        {{
                                            paciente.status_gest_aux
                                                ? paciente.fechagestAuxiliar
                                                : "No"
                                        }}
                                    </td>

                                    <td>
                                        {{
                                            paciente.status_gest_medica
                                                ? paciente.fechagestMedica
                                                : "No"
                                        }}
                                    </td>
                                    <td>
                                        {{
                                            paciente.status_gest_enfermera
                                                ? paciente.fechagestEnfermera
                                                : "No"
                                        }}
                                    </td>
                                    <td>{{ paciente.telefono }}</td>
                                    <!-- Renderiza cada resultado de procedimiento como una fila individual -->
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-body">

                        <!--    <div class="alert alert-info">
                        ID Paciente seleccionado: <strong>{{ pacienteIdModal }}</strong>
                    </div> -->

                        <div class="table-responsive" ref="tablaHtml">

                            <!-- *************************************************************************************************************** -->

                            <table class="table table-bordered table-striped table-sm align-middle">
                                <!--  {{ conteoCupsFactNum }} -->
                                <thead class="table-light table-bordered">
                                    <tr>
                                        <th>
                                            <h3>Procedimientos y Actividades</h3>
                                        </th>
                                    </tr>

                                </thead>
                                <tbody>
                                    <tr v-for="paciente in InfoEncuestasById" :key="paciente.id">
                                        <td>
                                            <table class="table table-bordered table-striped table-sm align-middle">
                                                <thead>
                                                    <tr>

                                                        <th @click="ordenarCups('actividad')" role="button">
                                                            Actividad {{ indicadorOrdenCups('actividad') }}</th>
                                                        <th @click="ordenarCups('rol')" role="button">Rol {{
                                                            indicadorOrdenCups('rol') }}</th>
                                                        <th @click="ordenarCups('profesional')" role="button">
                                                            Profesional {{ indicadorOrdenCups('profesional') }}</th>
                                                        <th @click="ordenarCups('cantidad')" role="button">Cantidad
                                                            {{ indicadorOrdenCups('cantidad') }}</th>
                                                        <th @click="ordenarCups('codigo')" role="button">Homolog {{
                                                            indicadorOrdenCups('codigo') }}</th>
                                                        <th @click="ordenarCups('descripcion')" role="button">
                                                            Descripción CUP {{ indicadorOrdenCups('descripcion') }}
                                                        </th>
                                                        <th @click="ordenarCups('detalle')" role="button">Detalle {{
                                                            indicadorOrdenCups('detalle') }}</th>
                                                        <th @click="ordenarCups('grupo')" role="button">Grupo {{
                                                            indicadorOrdenCups('grupo') }}</th>
                                                        <th>Factura</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="([cupId, cup]) in getCupsOrdenados(paciente)"
                                                        :key="cupId">
                                                        <td>{{ obtenerNombreActividad(cup.actividadId) }}</td>
                                                        <td>{{ cup.nombreProf || '-' }}</td>
                                                        <td>{{ formatearProfesionales(cup.key) || '-' }}</td>
                                                        <td>{{ cup.cantidad || '-' }}</td>
                                                        <td>{{ cup.codigo || '-' }}</td>
                                                        <td>{{ cup.DescripcionCUP || cup.cupsNombre || '-' }}</td>
                                                        <td>{{ cup.detalle || '-' }}</td>
                                                        <td>{{ cup.Grupo || '-' }}</td>
                                                        <td>
                                                            <template v-if="cup.facturado && !modoEdicion">
                                                                {{ cup.FactNum }}
                                                            </template>
                                                            <template v-if="cup.facturado && modoEdicion">
                                                                <div class="input-group mb-3">
                                                                    <input type="text" :id="`editar-factura-${cupId}`"
                                                                        class="form-control"
                                                                        v-model="facturaEditables[cupId]"
                                                                        placeholder="#factura">
                                                                </div>
                                                            </template>
                                                            <template v-if="!cup.facturado">
                                                                <div class="input-group mb-3">
                                                                    <input type="text" :id="`factura-${cupId}`"
                                                                        class="form-control"
                                                                        :disabled="facturaDisabled[cupId]"
                                                                        v-model="facturaInputs[cupId]"
                                                                        placeholder="#factura">
                                                                    <button
                                                                        :class="['btn', (facturaInputs[cupId] && facturaInputs[cupId].length >= 5) || facturaDisabled[cupId] ? 'btn-success' : 'btn-outline-secondary']"
                                                                        type="button"
                                                                        :disabled="!facturaInputs[cupId] || facturaInputs[cupId].length < 5 || facturaDisabled[cupId]"
                                                                        @click="regFactCup(cupId, facturaInputs[cupId], cup)">
                                                                        <i class="bi bi-bookmark-check-fill"></i>
                                                                    </button>
                                                                </div>
                                                            </template>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                        <!--  -->

                        <hr />

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                            @click="modoEdicion = false">
                            Cerrar
                        </button>

                        <button v-if="!modoEdicion && (allCupsWithFactura)" class="btn btn-info"
                            @click="iniciarEdicionCodigos">
                            <i class="bi bi-pencil-square"></i> Editar Código
                        </button>

                        <button v-if="modoEdicion" class="btn btn-warning" @click="cancelarEdicion">
                            <i class="bi bi-x-circle"></i> Cancelar
                        </button>

                        <button v-if="modoEdicion" class="btn btn-success" @click="guardarEdicionCodigos">
                            <i class="bi bi-check-circle"></i> Guardar Cambios
                        </button>

                        <button v-if="!modoEdicion && (allCupsWithFactura || noCupsRenderizados)" class="btn btn-danger"
                            @click="cerrarfact(pacienteIdModal)" data-bs-dismiss="modal">
                            <i class="bi bi-check2-circle"></i> Cerrar Paciente
                        </button>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    mapActions,
    mapState
} from "vuex";
import { nextTick } from "vue";

export default {
    data() {
        return {
            fechaFin: "",
            fechaInicio: "",
            convenioFiltro: "",
            cargando: false,
            activeTab: "pendientes", // Control de pestaña activa
            aprovDisabled: {}, // Estado de desactivación por paciente
            devolverDisabled: {}, // Estado de desactivación para devolver en pendientes
            pacienteIdModal: null,
            facturaDisabled: {}, // Estado de desactivación por cupId
            facturaInputs: {}, // Valores de factura por cupId
            cupl: null,
            tipodoc: "",
            numdoc: "",
            modoEdicion: false, // Control para modo edición de códigos
            facturaEditables: {}, // Almacena valores editables de facturas
            filtrosRegistro: {
                grupo: "",
                sexo: "",
                eps: "",
                regimen: "",
                barrio: "",
                comuna: "",
                remision: "",
            },
            ordenRegistro: {
                campo: "",
                direccion: "asc",
            },
            filtrosPendientes: {
                grupo: "",
                sexo: "",
                eps: "",
                convenio: "",
                regimen: "",
                barrio: "",
                comuna: "",
            },
            ordenPendientes: {
                campo: "",
                direccion: "asc",
            },
            ordenCups: {
                campo: "profesional",
                direccion: "asc",
            },
        }
    },
    computed: {
        ...mapState([
            "EncuestasFact",
            "userData",
            "EncuestasFactAprov",
            "InfoEncuestasById",
            "actividadesExtra",
        ]),

        conteoCupsFactNum() {
            let totalCups = 0;
            let totalFactNum = 0;

            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) {
                return { totalCups, totalFactNum };
            }

            this.InfoEncuestasById.forEach(paciente => {
                if (!paciente.cups || typeof paciente.cups !== 'object') return;

                const cups = Object.values(paciente.cups);
                totalCups += cups.length;

                cups.forEach(cup => {
                    if (cup && cup.facturado) {
                        totalFactNum++;
                    }
                });
            });

            return { totalCups, totalFactNum };
        },
        allCupsWithFactura() {
            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) return false;
            let allWithFactura = true;
            let anyCup = false;

            this.InfoEncuestasById.forEach(paciente => {
                if (!paciente.cups || typeof paciente.cups !== 'object') return;

                const cups = Object.values(paciente.cups);
                if (cups.length > 0) anyCup = true;

                cups.forEach(cup => {
                    if (!cup.facturado) allWithFactura = false;
                });
            });

            return allWithFactura && anyCup;
        },
        noCupsRenderizados() {
            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) return true;

            let anyCup = false;
            this.InfoEncuestasById.forEach(paciente => {
                if (paciente.cups && typeof paciente.cups === 'object') {
                    if (Object.keys(paciente.cups).length > 0) {
                        anyCup = true;
                    }
                }
            });

            return !anyCup;
        },
        convenioUsuario() {
            return String(this.userData?.convenio || "").trim();
        },
        documentoUsuarioActual() {
            return String(
                this.userData?.numDocumento ||
                this.userData?.num_documento ||
                this.userData?.documento ||
                ""
            ).trim();
        },
        convenioBloqueado() {
            return !!this.convenioUsuario;
        },
        convenioOpciones() {
            const opciones = new Set(["Extramural", "E Basicos"]);
            if (this.convenioUsuario) opciones.add(this.convenioUsuario);
            return Array.from(opciones);
        },
        opcionesFiltroRegistro() {
            const filas = Array.isArray(this.EncuestasFact) ? this.EncuestasFact : [];
            const generarOpciones = extractor => {
                const unicos = new Set();
                filas.forEach(p => {
                    const valor = String(extractor(p) || "").trim();
                    if (valor) unicos.add(valor);
                });
                return Array.from(unicos).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
            };

            return {
                grupo: generarOpciones(p => p.grupo),
                sexo: generarOpciones(p => p.sexo),
                eps: generarOpciones(p => p.eps),
                regimen: generarOpciones(p => p.regimen),
                barrio: generarOpciones(p => p.barrioVeredacomuna?.barrio),
                comuna: generarOpciones(p => p.barrioVeredacomuna?.comuna),
                remision: generarOpciones(p => p.requiereRemision),
            };
        },
        encuestasFactProcesadas() {
            const filas = Array.isArray(this.EncuestasFact) ? [...this.EncuestasFact] : [];

            const filtradas = filas.filter(paciente => {
                const cumpleGrupo = !this.filtrosRegistro.grupo || String(paciente.grupo || "").trim() === this.filtrosRegistro.grupo;
                const cumpleSexo = !this.filtrosRegistro.sexo || String(paciente.sexo || "").trim() === this.filtrosRegistro.sexo;
                const cumpleEps = !this.filtrosRegistro.eps || String(paciente.eps || "").trim() === this.filtrosRegistro.eps;
                const cumpleRegimen = !this.filtrosRegistro.regimen || String(paciente.regimen || "").trim() === this.filtrosRegistro.regimen;
                const cumpleBarrio = !this.filtrosRegistro.barrio || String(paciente.barrioVeredacomuna?.barrio || "").trim() === this.filtrosRegistro.barrio;
                const cumpleComuna = !this.filtrosRegistro.comuna || String(paciente.barrioVeredacomuna?.comuna || "").trim() === this.filtrosRegistro.comuna;
                const cumpleRemision = !this.filtrosRegistro.remision || String(paciente.requiereRemision || "").trim() === this.filtrosRegistro.remision;

                return cumpleGrupo && cumpleSexo && cumpleEps && cumpleRegimen && cumpleBarrio && cumpleComuna && cumpleRemision;
            });

            if (!this.ordenRegistro.campo) return filtradas;

            const direccion = this.ordenRegistro.direccion === "desc" ? -1 : 1;
            return filtradas.sort((a, b) => {
                const valorA = this.obtenerValorColumnaRegistro(a, this.ordenRegistro.campo);
                const valorB = this.obtenerValorColumnaRegistro(b, this.ordenRegistro.campo);
                return valorA.localeCompare(valorB, "es", { numeric: true, sensitivity: "base" }) * direccion;
            });
        },
        opcionesFiltroPendientes() {
            const filas = Array.isArray(this.EncuestasFactAprov) ? this.EncuestasFactAprov : [];
            const generarOpciones = extractor => {
                const unicos = new Set();
                filas.forEach(p => {
                    const valor = String(extractor(p) || "").trim();
                    if (valor) unicos.add(valor);
                });
                return Array.from(unicos).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
            };

            return {
                grupo: generarOpciones(p => p.grupo),
                sexo: generarOpciones(p => p.sexo),
                eps: generarOpciones(p => p.eps),
                convenio: generarOpciones(p => p.convenio),
                regimen: generarOpciones(p => p.regimen),
                barrio: generarOpciones(p => p.barrioVeredacomuna?.barrio),
                comuna: generarOpciones(p => p.barrioVeredacomuna?.comuna),
            };
        },
        totalPendientesCargados() {
            return Array.isArray(this.EncuestasFactAprov) ? this.EncuestasFactAprov.length : 0;
        },
        encuestasPendientesProcesadas() {
            const filas = Array.isArray(this.EncuestasFactAprov) ? [...this.EncuestasFactAprov] : [];

            const filtradas = filas.filter(paciente => {
                const cumpleGrupo = !this.filtrosPendientes.grupo || String(paciente.grupo || "").trim() === this.filtrosPendientes.grupo;
                const cumpleSexo = !this.filtrosPendientes.sexo || String(paciente.sexo || "").trim() === this.filtrosPendientes.sexo;
                const cumpleEps = !this.filtrosPendientes.eps || String(paciente.eps || "").trim() === this.filtrosPendientes.eps;
                const cumpleConvenio = !this.filtrosPendientes.convenio || String(paciente.convenio || "").trim() === this.filtrosPendientes.convenio;
                const cumpleRegimen = !this.filtrosPendientes.regimen || String(paciente.regimen || "").trim() === this.filtrosPendientes.regimen;
                const cumpleBarrio = !this.filtrosPendientes.barrio || String(paciente.barrioVeredacomuna?.barrio || "").trim() === this.filtrosPendientes.barrio;
                const cumpleComuna = !this.filtrosPendientes.comuna || String(paciente.barrioVeredacomuna?.comuna || "").trim() === this.filtrosPendientes.comuna;

                return cumpleGrupo && cumpleSexo && cumpleEps && cumpleConvenio && cumpleRegimen && cumpleBarrio && cumpleComuna;
            });

            if (!this.ordenPendientes.campo) return filtradas;

            const direccion = this.ordenPendientes.direccion === "desc" ? -1 : 1;
            return filtradas.sort((a, b) => {
                const valorA = this.obtenerValorColumnaPendientes(a, this.ordenPendientes.campo);
                const valorB = this.obtenerValorColumnaPendientes(b, this.ordenPendientes.campo);
                return valorA.localeCompare(valorB, "es", { numeric: true, sensitivity: "base" }) * direccion;
            });
        }

    },
    watch: {
        async activeTab(nuevaTab) {
            if (nuevaTab !== "pendientes") {
                return;
            }

            await this.getPendientes();
        },
        "userData.numDocumento": {
            immediate: true,
            async handler() {
                if (!String(this.documentoUsuarioActual || "").trim()) {
                    return;
                }

                if (this.activeTab === "pendientes") {
                    await this.getPendientes();
                }
            },
        },
        documentoUsuarioActual: {
            immediate: true,
            async handler(nuevoDocumento, documentoAnterior) {
                if (!String(nuevoDocumento || "").trim()) {
                    return;
                }

                if (this.isFacturacionPendientesDebugEnabled()) {
                    console.info("[facturacion:pendientes] cambio-documento-usuario", {
                        documentoAnterior: String(documentoAnterior || "").trim() || null,
                        nuevoDocumento,
                        activeTab: this.activeTab,
                    });
                }

                if (this.activeTab === "pendientes") {
                    await this.getPendientes();
                }
            },
        },
        "userData.convenio": {
            immediate: true,
            handler(nuevoConvenio) {
                const convenioNormalizado = String(nuevoConvenio || "").trim();

                // Si el usuario tiene convenio asignado, siempre se fija y se bloquea el campo.
                if (convenioNormalizado) {
                    this.convenioFiltro = convenioNormalizado;
                    return;
                }

                if (!this.convenioFiltro) {
                    this.convenioFiltro = "";
                }
            },
        },
    },
    methods: {
        ...mapActions([
            "GetRegistersbyRangeGeneralFact",
            "GetRegistersbyRangeGeneralFactAprov",
            "GetRegistersbyRangeGeneralFactByID",
            "aprovicionarP",
            "revertirAprovisionFacturacion",
            "getEncuestaById",
            "asigFacturacion",
            "cerrarFacturacion",
            "getAllActividadesExtra"
        ]),
        /*  */

        /*  */
        obtenerDocumentoUsuarioActual() {
            return this.documentoUsuarioActual;
        },
        isFacturacionPendientesDebugEnabled() {
            try {
                const flag = String(localStorage.getItem("debugFacturacionPendientes") || "").trim().toLowerCase();
                return window.__DEBUG_FACTURACION_PENDIENTES__ === true || flag === "1" || flag === "true";
            } catch (_) {
                return window.__DEBUG_FACTURACION_PENDIENTES__ === true;
            }
        },
        async esperarUsuarioDisponible() {
            let intentos = 0;

            while (!this.obtenerDocumentoUsuarioActual() && intentos < 30) {
                await new Promise(resolve => setTimeout(resolve, 100));
                intentos++;
            }

            const documento = this.obtenerDocumentoUsuarioActual();
            if (!documento) {
                throw new Error("Usuario no disponible después de esperar");
            }

            return documento;
        },
        async getPendientes() {
            this.cargando = true;
            try {
                const documento = await this.esperarUsuarioDisponible();
                if (this.isFacturacionPendientesDebugEnabled()) {
                    console.info("[facturacion:pendientes] inicio-getPendientes", {
                        documento,
                        activeTab: this.activeTab,
                        userData: {
                            numDocumento: this.userData?.numDocumento,
                            num_documento: this.userData?.num_documento,
                            documento: this.userData?.documento,
                        },
                    });
                }
                const resultados = await this.GetRegistersbyRangeGeneralFactAprov(documento);

                if (this.isFacturacionPendientesDebugEnabled()) {
                    console.info("[facturacion:pendientes] vista-getPendientes", {
                        documento,
                        uid: this.uid,
                        total: Array.isArray(resultados) ? resultados.length : 0,
                        ids: Array.isArray(resultados) ? resultados.map(item => item.id) : [],
                        userData: {
                            numDocumento: this.userData?.numDocumento,
                            num_documento: this.userData?.num_documento,
                            documento: this.userData?.documento,
                        },
                    });

                    await nextTick();
                    const filasRenderizadas = this.$el?.querySelectorAll?.("#nav-home tbody tr")?.length || 0;
                    console.info("[facturacion:pendientes] render-tabla", {
                        totalPendientesCargados: this.totalPendientesCargados,
                        totalPendientesVisibles: this.encuestasPendientesProcesadas.length,
                        filasRenderizadas,
                        activeTab: this.activeTab,
                    });
                }
            } finally {
                this.cargando = false;
            }
        },
        async getdataEncuestas(fechaInicio, fechaFin, convenio) {
            this.cargando = true;
            try {
                if (!fechaInicio || !fechaFin) {
                    alert("Debe seleccionar fecha inicial y fecha final.");
                    return;
                }

                let parametros = {
                    finicial: fechaInicio,
                    ffinal: fechaFin,
                    convenio: convenio,
                };
                await this.GetRegistersbyRangeGeneralFact(parametros);
            } catch (error) {
                console.error("Error al consultar encuestas:", error);
            } finally {
                this.cargando = false;
            }
        },

        async getdataEncuestasById(tipodoc, numdoc) {
            this.cargando = true;
            try {
                let parametros = {
                    tipodoc: tipodoc,
                    numdoc: numdoc,
                };
                await this.GetRegistersbyRangeGeneralFactByID(parametros);
            } catch (error) {
                console.error("Error al consultar encuestas:", error);
            } finally {
                this.cargando = false;
            }
        },
        AprovisionarPaciente(id) {
            this.aprovDisabled[id] = true;
            let data = {
                idEnc: id,
                idProf: this.obtenerDocumentoUsuarioActual(),
            };
            this.aprovicionarP(data);
        },
        async devolverARegistroInicial(id) {
            const confirmar = confirm("Este registro se devolverá a la tabla inicial. ¿Desea continuar?");
            if (!confirmar) return;

            this.devolverDisabled[id] = true;
            this.cargando = true;
            try {
                await this.revertirAprovisionFacturacion(id);

                await this.GetRegistersbyRangeGeneralFactAprov(this.obtenerDocumentoUsuarioActual());

                if (this.fechaInicio && this.fechaFin) {
                    await this.getdataEncuestas(this.fechaInicio, this.fechaFin, this.convenioFiltro);
                } else if (this.tipodoc && this.numdoc) {
                    await this.getdataEncuestasById(this.tipodoc, this.numdoc);
                }

                alert("Registro devuelto a la tabla inicial correctamente.");
            } catch (error) {
                console.error("Error al devolver registro:", error);
                alert("No se pudo devolver el registro: " + (error?.message || error));
            } finally {
                this.devolverDisabled[id] = false;
                this.cargando = false;
            }
        },
        obtenerValorColumnaRegistro(paciente, campo) {
            const mapaValores = {
                grupo: paciente.grupo,
                paciente: `${paciente.nombre1 || ""} ${paciente.nombre2 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`,
                sexo: paciente.sexo,
                documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                fechaNac: paciente.fechaNac,
                eps: paciente.eps,
                regimen: paciente.regimen,
                direccion: paciente.direccion,
                barrio: paciente.barrioVeredacomuna?.barrio,
                comuna: paciente.barrioVeredacomuna?.comuna,
                fecha: paciente.fecha,
                fechagestEnfermera: paciente.fechagestEnfermera,
                remision: paciente.requiereRemision,
            };

            return String(mapaValores[campo] || "").trim();
        },
        ordenarRegistro(campo) {
            if (this.ordenRegistro.campo === campo) {
                this.ordenRegistro.direccion = this.ordenRegistro.direccion === "asc" ? "desc" : "asc";
                return;
            }

            this.ordenRegistro.campo = campo;
            this.ordenRegistro.direccion = "asc";
        },
        indicadorOrden(campo) {
            if (this.ordenRegistro.campo !== campo) return "";
            return this.ordenRegistro.direccion === "asc" ? "▲" : "▼";
        },
        limpiarFiltrosRegistro() {
            this.filtrosRegistro = {
                grupo: "",
                sexo: "",
                eps: "",
                regimen: "",
                barrio: "",
                comuna: "",
                remision: "",
            };
            this.ordenRegistro = {
                campo: "",
                direccion: "asc",
            };
        },
        obtenerValorColumnaPendientes(paciente, campo) {
            const mapaValores = {
                id: paciente.id,
                grupo: paciente.grupo,
                paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`,
                sexo: paciente.sexo,
                documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                fechaNac: paciente.fechaNac,
                edad: this.calcularEdad(paciente.fechaNac),
                eps: paciente.eps,
                convenio: paciente.convenio,
                regimen: paciente.regimen,
                direccion: paciente.direccion,
                barrio: paciente.barrioVeredacomuna?.barrio,
                comuna: paciente.barrioVeredacomuna?.comuna,
                fecha: paciente.fecha,
                fechagestEnfermera: paciente.fechagestEnfermera,
            };

            return String(mapaValores[campo] || "").trim();
        },
        ordenarPendientes(campo) {
            if (this.ordenPendientes.campo === campo) {
                this.ordenPendientes.direccion = this.ordenPendientes.direccion === "asc" ? "desc" : "asc";
                return;
            }

            this.ordenPendientes.campo = campo;
            this.ordenPendientes.direccion = "asc";
        },
        indicadorOrdenPendientes(campo) {
            if (this.ordenPendientes.campo !== campo) return "";
            return this.ordenPendientes.direccion === "asc" ? "▲" : "▼";
        },
        limpiarFiltrosPendientes() {
            this.filtrosPendientes = {
                grupo: "",
                sexo: "",
                eps: "",
                convenio: "",
                regimen: "",
                barrio: "",
                comuna: "",
            };
            this.ordenPendientes = {
                campo: "",
                direccion: "asc",
            };
        },
        normalizarProfesionales(profesionales) {
            return Array.from(new Set(
                (Array.isArray(profesionales) ? profesionales : [profesionales])
                    .map((item) => String(item || "").trim())
                    .filter(Boolean)
            ));
        },
        formatearProfesionales(profesionales) {
            return this.normalizarProfesionales(profesionales).join(", ");
        },
        obtenerValorColumnaCup(cup, campo) {
            const mapaValores = {
                actividad: this.obtenerNombreActividad(cup?.actividadId),
                rol: cup?.nombreProf,
                profesional: this.formatearProfesionales(cup?.key),
                cantidad: cup?.cantidad,
                codigo: cup?.codigo,
                descripcion: cup?.DescripcionCUP || cup?.cupsNombre,
                detalle: cup?.detalle,
                grupo: cup?.Grupo,
            };

            return String(mapaValores[campo] || "").trim();
        },
        ordenarCups(campo) {
            if (this.ordenCups.campo === campo) {
                this.ordenCups.direccion = this.ordenCups.direccion === "asc" ? "desc" : "asc";
                return;
            }

            this.ordenCups.campo = campo;
            this.ordenCups.direccion = "asc";
        },
        indicadorOrdenCups(campo) {
            if (this.ordenCups.campo !== campo) return "";
            return this.ordenCups.direccion === "asc" ? "▲" : "▼";
        },
        getCupsOrdenados(paciente) {
            if (!paciente?.cups || typeof paciente.cups !== "object") return [];

            const lista = Object.entries(paciente.cups);
            const campo = this.ordenCups.campo || "profesional";
            const direccion = this.ordenCups.direccion === "desc" ? -1 : 1;

            return lista.sort(([, cupA], [, cupB]) => {
                const valorA = this.obtenerValorColumnaCup(cupA, campo);
                const valorB = this.obtenerValorColumnaCup(cupB, campo);
                return valorA.localeCompare(valorB, "es", { numeric: true, sensitivity: "base" }) * direccion;
            });
        },
        desactivarInput(cupId) {
            this.facturaDisabled[cupId] = true;
        },
        setPacienteId(id) {
            this.pacienteIdModal = id;
            this.facturaInputs = {};
            this.facturaDisabled = {};
            this.cargando = false;

            this.getEncuestaById(id).then(() => {
                if (this.InfoEncuestasById && Array.isArray(this.InfoEncuestasById)) {
                    this.InfoEncuestasById.forEach(paciente => {
                        if (paciente.cups && typeof paciente.cups === 'object') {
                            Object.entries(paciente.cups).forEach(([cupId, cup]) => {
                                // Si ya está facturado, inicializar como deshabilitado (verde)
                                if (cup.facturado) {
                                    this.facturaInputs[cupId] = cup.FactNum;
                                    this.facturaDisabled[cupId] = true;
                                } else {
                                    this.facturaInputs[cupId] = '';
                                    this.facturaDisabled[cupId] = false;
                                }
                            });
                        }
                    });
                }
            });
        },
        async regFactCup(cupId, numfact, cupActual = {}) {
            this.cargando = true;
            let timeoutDisparado = false;
            let spinnerTimeout = setTimeout(() => {
                if (this.cargando) {
                    timeoutDisparado = true;
                    this.cargando = false;
                    this.facturaDisabled[cupId] = false;
                    alert('Error: El proceso de guardado está tardando demasiado. Intente nuevamente.');
                    console.warn('[regFactCup] Timeout: spinner forzado a false');
                }
            }, 10000);

            console.log('[regFactCup] INICIO', {
                cupId,
                numfact
            });

            let guardadoExitoso = false;
            try {
                // Asegurar reactividad antes de guardar
                if (!(cupId in this.facturaInputs)) {
                    this.facturaInputs[cupId] = numfact;
                }
                if (!(cupId in this.facturaDisabled)) {
                    this.facturaDisabled[cupId] = false;
                }

                const datafact = {
                    cupId: cupId,
                    numFactura: numfact,
                    facturado: true,
                    idFacturador: this.obtenerDocumentoUsuarioActual(),
                    idEncuesta: this.pacienteIdModal,
                    cup: cupActual,
                };

                console.log('[regFactCup] Antes de asigFacturacion', datafact);
                const res = await this.asigFacturacion(datafact);

                if (res && res.success === false) {
                    throw new Error(res.message || 'No se pudo guardar el registro.');
                }

                guardadoExitoso = true;
                console.log('[regFactCup] Guardado exitoso en asigFacturacion');

                await this.getEncuestaById(this.pacienteIdModal);
                console.log('[regFactCup] Datos recargados con getEncuestaById');

                // Solo bloquear el campo tras guardar
                this.facturaDisabled[cupId] = true;
                console.log('[regFactCup] Campo bloqueado tras guardar');
            } catch (error) {
                console.error('[regFactCup] ERROR:', error);
                this.facturaDisabled[cupId] = false;
                this.cargando = false;
                if (!timeoutDisparado) {
                    alert('Error al guardar: ' + (error?.message || error));
                }
            } finally {
                this.cargando = false;
                clearTimeout(spinnerTimeout);
                if (!guardadoExitoso && !timeoutDisparado) {
                    this.facturaDisabled[cupId] = false;
                    alert('No se pudo guardar el registro. Intente nuevamente.');
                }
                console.log('[regFactCup] FIN, cargando:', this.cargando);
            }
        },

        async cerrarfact(id) {
            try {
                this.cargando = true;
                // Esperar a que la acción de cerrar en el store termine si retorna promesa
                if (this.cerrarFacturacion) {
                    await this.cerrarFacturacion(id);
                }
                alert("Factura cerrada");
                // Recargar la lista y esperar a que termine
                if (this.GetRegistersbyRangeGeneralFactAprov) {
                    await this.GetRegistersbyRangeGeneralFactAprov(
                        this.obtenerDocumentoUsuarioActual()
                    );
                }
                // Forzar reflow / re-evaluación del DOM y restaurar desplazamiento si aplica
                await this.$nextTick();
                const tabla = this.$refs.tablaHtml;
                if (tabla) {
                    // ref puede ser array si hay múltiples elementos con el mismo ref
                    const restoreScroll = el => {
                        try {
                            if (el && el.scrollTop !== undefined) el.scrollTop = 0;
                        } catch (e) {
                            // ignore
                        }
                    };
                    if (Array.isArray(tabla)) {
                        tabla.forEach(restoreScroll);
                    } else {
                        restoreScroll(tabla);
                    }
                }
                // Disparar resize para que cualquier plugin o CSS recalcule
                try { window.dispatchEvent(new Event('resize')); } catch (e) { }
            } catch (error) {
                console.error('[cerrarfact] Error:', error);
                alert('Error al cerrar factura: ' + (error?.message || error));
            } finally {
                this.cargando = false;
            }
        },

        calcularEdad(fechaNacimiento) {
            const hoy = new Date();
            const nacimiento = new Date(fechaNacimiento);
            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mes = hoy.getMonth() - nacimiento.getMonth();
            const dia = hoy.getDate() - nacimiento.getDate();

            if (mes < 0 || (mes === 0 && dia < 0)) {
                edad--;
            }
            return edad;
        },
        obtenerNombreActividad(actividadId) {
            if (!actividadId || !this.actividadesExtra) return actividadId || '-';
            const actividad = this.actividadesExtra.find(act => String(act.key) === String(actividadId));
            return actividad ? actividad.nombre : actividadId;
        },

        iniciarEdicionCodigos() {
            // Copiar los valores actuales de FactNum a facturaEditables
            this.facturaEditables = {};
            if (this.InfoEncuestasById && Array.isArray(this.InfoEncuestasById)) {
                this.InfoEncuestasById.forEach(paciente => {
                    if (paciente.cups && typeof paciente.cups === 'object') {
                        Object.entries(paciente.cups).forEach(([cupId, cup]) => {
                            if (cup && cup.facturado && cup.FactNum) {
                                this.facturaEditables[cupId] = cup.FactNum;
                            }
                        });
                    }
                });
            }
            this.modoEdicion = true;
        },

        cancelarEdicion() {
            this.facturaEditables = {};
            this.modoEdicion = false;
        },

        async guardarEdicionCodigos() {
            try {
                this.cargando = true;
                // Actualizar los valores en InfoEncuestasById
                if (this.InfoEncuestasById && Array.isArray(this.InfoEncuestasById)) {
                    this.InfoEncuestasById.forEach(paciente => {
                        if (paciente.cups && typeof paciente.cups === 'object') {
                            Object.entries(paciente.cups).forEach(([cupId, cup]) => {
                                if (this.facturaEditables[cupId]) {
                                    cup.FactNum = this.facturaEditables[cupId];
                                }
                            });
                        }
                    });
                }
                alert("Códigos de factura actualizados correctamente");
                this.facturaEditables = {};
                this.modoEdicion = false;
            } catch (error) {
                console.error('Error al guardar cambios:', error);
                alert('Error al guardar cambios: ' + (error?.message || error));
            } finally {
                this.cargando = false;
            }
        }
    },
    async mounted() {
        this.cargando = true
        try {
            await this.getAllActividadesExtra();
            await this.getPendientes();
        } catch (error) {
            console.error("[facturacion:pendientes] error-mounted", {
                message: error?.message || String(error),
                userData: this.userData,
                documentoUsuarioActual: this.documentoUsuarioActual,
            });
        } finally {
            this.cargando = false
        }
    }
}
</script>

<style>
/* Spinner overlay universal para evitar problemas en pantalla completa */
.spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.7);
    z-index: 20000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
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

.tabla-scroll {
    max-height: 600px;
    /* Ajusta la altura según tu necesidad */
    overflow-y: auto;
}
</style>

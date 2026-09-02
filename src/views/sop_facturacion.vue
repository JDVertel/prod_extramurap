<template>
    <div class="facturacion-page px-2 px-md-3 py-2">
        <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-1">
            <h1 class="mb-0 d-flex align-items-center gap-2">
                Facturación
                <span
                    v-if="refrescoSilenciosoEnCurso"
                    class="badge text-bg-light border fw-normal small"
                    title="Actualizando bandejas…">
                    <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Actualizando
                </span>
            </h1>
            <button
                type="button"
                class="btn btn-outline-info btn-sm"
                title="Guía de colores e iconos"
                @click="mostrarGuiaFacturacion = true">
                <i class="bi bi-info-circle me-1"></i> Guía de interfaz
            </button>
        </div>
        <FacturacionGuiaModal
            :visible="mostrarGuiaFacturacion"
            :tiene-registros-eps-bd="tieneRegistrosEpsBd"
            @close="mostrarGuiaFacturacion = false" />
        <ProfesionalGrupoInfo />
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
            <div v-if="pacienteIdModal" class="facturacion-cups-panel">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <h2 class="mb-0">
                        <i class="bi bi-clipboard-check"></i>
                        {{ facturacionReabiertaHistorial ? 'Editar facturación reabierta' : 'Facturar CUPS' }}
                    </h2>
                    <button type="button" class="btn btn-outline-secondary" @click="cerrarModalFacturacion">
                        <i class="bi bi-arrow-left"></i> Volver al listado
                    </button>
                </div>

                <div v-if="facturacionReabiertaHistorial" class="alert alert-info py-2 mb-3">
                    Paciente reabierto desde el historial de hoy. Puede agregar o corregir números de factura y
                    luego presionar <strong>Cerrar Paciente</strong> para finalizar nuevamente.
                </div>

                <div class="container-fluid px-0">
                    <div class="table-responsive mb-3">
                        <table class="table table-bordered table-striped table-sm align-middle table-success mb-0">
                            <thead class="table-light">
                                <tr>
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
                                    <td>{{ paciente.grupo }}</td>
                                    <td>
                                        {{ paciente.nombre1 }} {{ paciente.apellido1 }}
                                        {{ paciente.apellido2 }}
                                    </td>
                                    <td>{{ paciente.sexo }}</td>
                                    <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                    <td>{{ formatearFechaYYYYMMDD(paciente.fechaNac) }}</td>
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
                                                ? formatearFechaYYYYMMDD(paciente.fechagestAuxiliar)
                                                : "No"
                                        }}
                                    </td>
                                    <td>
                                        {{
                                            paciente.status_gest_medica
                                                ? formatearFechaYYYYMMDD(paciente.fechagestMedica)
                                                : "No"
                                        }}
                                    </td>
                                    <td>
                                        {{
                                            paciente.status_gest_enfermera
                                                ? formatearFechaYYYYMMDD(paciente.fechagestEnfermera)
                                                : "No"
                                        }}
                                    </td>
                                    <td>{{ paciente.telefono }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="facturacion-cups-body position-relative">
                    <div v-if="cargandoModal" class="facturacion-loading-overlay">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <div class="small text-muted mt-2">Cargando procedimientos...</div>
                    </div>

                    <div v-if="errorModalFacturacion" class="alert alert-danger py-2">
                        {{ errorModalFacturacion }}
                    </div>

                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                        <div>
                            <h3 class="mb-0">Procedimientos y Actividades</h3>
                            <div v-if="modoEdicion" class="small text-muted">
                                Mínimo {{ minFacturaChars }} caracteres. Válido en verde, inválido en rojo.
                            </div>
                        </div>
                        <button
                            v-if="!modoEdicion && pacienteIdModal && hayFacturasParaEditar"
                            type="button"
                            class="btn btn-info btn-sm"
                            :disabled="guardandoFactura || cargandoModal"
                            @click="iniciarEdicionCodigos">
                            <i class="bi bi-pencil-square"></i> Editar facturas
                        </button>
                    </div>

                    <div
                        v-if="modoEdicion && mensajeEdicionFacturas"
                        class="alert py-2 mb-3"
                        :class="claseAlertaEdicionFacturas">
                        {{ mensajeEdicionFacturas }}
                    </div>

                    <div v-if="!hayCupsEnModal && !cargandoModal" class="alert alert-warning mb-0">
                        No hay procedimientos CUPS asignados para este paciente.
                    </div>

                    <template v-else-if="pacienteModalActual">
                        <ul class="nav nav-tabs mb-3" role="tablist">
                            <li v-for="rol in rolesFacturacionModal" :key="`rol-tab-${rol}`" class="nav-item" role="presentation">
                                <button
                                    type="button"
                                    class="nav-link"
                                    :class="{ active: rolFacturacionActivo === rol }"
                                    @click="rolActivoFacturacion = rol">
                                    {{ etiquetaRolFacturacion(rol) }}
                                    <span
                                        class="badge ms-1"
                                        :class="claseBadgeDiligenciaRol(pacienteModalActual, rol)">
                                        {{ contarCupsPorRol(pacienteModalActual, rol) }}
                                    </span>
                                </button>
                            </li>
                        </ul>

                        <div class="table-responsive tabla-scroll" ref="tablaHtml">
                            <table class="table table-bordered table-striped table-sm align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th @click="ordenarCups('actividad')" role="button">
                                            Actividad {{ indicadorOrdenCups('actividad') }}
                                        </th>
                                        <th @click="ordenarCups('rol')" role="button">
                                            Rol {{ indicadorOrdenCups('rol') }}
                                        </th>
                                        <th @click="ordenarCups('profesional')" role="button">
                                            Profesional {{ indicadorOrdenCups('profesional') }}
                                        </th>
                                        <th @click="ordenarCups('cantidad')" role="button">
                                            Cantidad {{ indicadorOrdenCups('cantidad') }}
                                        </th>
                                        <th @click="ordenarCups('codigo')" role="button">
                                            Homolog {{ indicadorOrdenCups('codigo') }}
                                        </th>
                                        <th @click="ordenarCups('descripcion')" role="button">
                                            Descripción CUP {{ indicadorOrdenCups('descripcion') }}
                                        </th>
                                        <th @click="ordenarCups('detalle')" role="button">
                                            Detalle {{ indicadorOrdenCups('detalle') }}
                                        </th>
                                        <th @click="ordenarCups('grupo')" role="button">
                                            Grupo {{ indicadorOrdenCups('grupo') }}
                                        </th>
                                        <th>Factura</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="([cupId, cup]) in getCupsPorRol(pacienteModalActual, rolFacturacionActivo)"
                                        :key="cupId">
                                        <td>{{ obtenerNombreActividad(cup.actividadId) }}</td>
                                        <td>{{ etiquetaRolFacturacion(cup.key) || '-' }}</td>
                                        <td>{{ cup.nombreProf || '-' }}</td>
                                        <td>{{ cup.cantidad || '-' }}</td>
                                        <td>{{ cup.codigo || '-' }}</td>
                                        <td>{{ cup.DescripcionCUP || cup.cupsNombre || '-' }}</td>
                                        <td>{{ cup.detalle || '-' }}</td>
                                        <td>{{ cup.Grupo || '-' }}</td>
                                        <td style="min-width: 220px;">
                                            <template v-if="modoEdicion">
                                                <input
                                                    type="text"
                                                    :id="`editar-factura-${cupId}`"
                                                    class="form-control form-control-sm"
                                                    :class="claseValidacionFacturaEdicion(cupId, cup)"
                                                    v-model="facturaEditables[cupId]"
                                                    :placeholder="`#factura (mín. ${minFacturaChars} caracteres)`"
                                                    autocomplete="off">
                                            </template>
                                            <template v-else-if="cup.facturado">
                                                <span class="badge bg-success">{{ cup.FactNum || 'Facturado' }}</span>
                                            </template>
                                            <template v-else>
                                                <div class="input-group input-group-sm">
                                                    <input
                                                        type="text"
                                                        :id="`factura-${cupId}`"
                                                        class="form-control"
                                                        :class="claseValidacionFactura(facturaInputs[cupId])"
                                                        :disabled="facturaDisabled[cupId] || guardandoFactura"
                                                        v-model="facturaInputs[cupId]"
                                                        :placeholder="`#factura (mín. ${minFacturaChars} caracteres)`"
                                                        autocomplete="off">
                                                    <button
                                                        :class="['btn', facturaCumpleMinimo(facturaInputs[cupId]) || facturaDisabled[cupId] ? 'btn-success' : 'btn-outline-secondary']"
                                                        type="button"
                                                        :disabled="!facturaCumpleMinimo(facturaInputs[cupId]) || facturaDisabled[cupId] || guardandoFactura"
                                                        @click="regFactCup(cupId, facturaInputs[cupId], cup)">
                                                        <i class="bi bi-bookmark-check-fill"></i>
                                                    </button>
                                                </div>
                                            </template>
                                        </td>
                                    </tr>
                                    <tr v-if="getCupsPorRol(pacienteModalActual, rolFacturacionActivo).length === 0">
                                        <td colspan="9" class="text-center text-muted py-3">
                                            No hay procedimientos para {{ etiquetaRolFacturacion(rolFacturacionActivo) }}.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>
                </div>

                <div class="d-flex flex-wrap gap-2 justify-content-end mt-3 pt-3 border-top">
                    <button type="button" class="btn btn-secondary" @click="cerrarModalFacturacion">
                        Volver al listado
                    </button>

                    <button v-if="modoEdicion" class="btn btn-warning" :disabled="guardandoFactura"
                        @click="cancelarEdicion">
                        <i class="bi bi-x-circle"></i> Cancelar edición
                    </button>

                    <button v-if="modoEdicion" class="btn btn-success"
                        :disabled="guardandoFactura || !puedeGuardarEdicionFacturas"
                        @click="guardarEdicionCodigos">
                        <i class="bi bi-check-circle"></i>
                        {{ guardandoFactura ? 'Guardando...' : 'Guardar cambios' }}
                    </button>

                    <button v-if="!modoEdicion && (allCupsWithFactura || noCupsRenderizados)" class="btn btn-danger"
                        :disabled="guardandoFactura || cargandoModal"
                        @click="cerrarfact(pacienteIdModal)">
                        <i class="bi bi-check2-circle"></i> Cerrar Paciente
                    </button>
                </div>
            </div>

            <template v-else>
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
                    <button class="nav-link" :class="{ active: activeTab === 'historial' }"
                        @click="activeTab = 'historial'" type="button" :aria-selected="activeTab === 'historial'">
                        Historial
                    </button>
                </div>
            </nav>
            <div class="tab-content" id="nav-tabContent">
                <div v-if="activeTab === 'pendientes'" class="tab-pane show active" id="nav-home" role="tabpanel"
                    tabindex="0">

                    <div class="d-flex justify-content-between align-items-center mb-2 mt-2 gap-2 flex-wrap">
                        <div class="small text-muted">
                            Mostrando {{ encuestasPendientesProcesadas.length }} de {{ totalPendientesCargados }} pendientes cargados
                            <template v-if="tieneRegistrosEpsBd">
                                · {{ totalSeleccionadosDepuracionPendientes }} no facturable(s) seleccionado(s)
                            </template>
                            <template v-else-if="!cargando">
                                · BDS_EPS sin registros cargados
                            </template>
                        </div>
                        <div class="d-flex gap-2 flex-wrap">
                            <button
                                v-if="tieneRegistrosEpsBd"
                                type="button"
                                class="btn btn-outline-danger btn-sm"
                                :disabled="totalSeleccionadosDepuracionPendientes === 0 || cerrandoDepuracionPendientes || cargando"
                                @click="cerrarDepuracionSeleccionados">
                                <i class="bi bi-x-octagon"></i>
                                {{ cerrandoDepuracionPendientes ? 'Cerrando...' : `Cerrar depuración (${totalSeleccionadosDepuracionPendientes})` }}
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-sm"
                                @click="limpiarFiltrosPendientes">
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive tabla-scroll" ref="tablaHtml">
                        <table
                            :key="`pendientes-${revisionBandejasFacturacion}`"
                            class="table table-bordered table-striped table-sm align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Acciones</th>
                                    <th
                                        v-if="tieneRegistrosEpsBd"
                                        style="width: 42px;"
                                        class="text-center"
                                        title="Solo pacientes no facturables">
                                        <input
                                            type="checkbox"
                                            class="form-check-input m-0"
                                            :checked="todosSeleccionadosDepuracionPendientes"
                                            :disabled="idsSeleccionablesDepuracionPendientes.length === 0 || cerrandoDepuracionPendientes || cargando"
                                            @change="toggleSeleccionarTodosDepuracionPendientes">
                                    </th>
                                    <th
                                        v-if="tieneRegistrosEpsBd"
                                        class="text-center"
                                        role="button"
                                        @click="ordenarPendientes('facturable')">
                                        Facturable {{ indicadorOrdenPendientes('facturable') }}
                                    </th>
                                    <th @click="ordenarPendientes('estado')" role="button" class="text-center">
                                        Estado {{ indicadorOrdenPendientes('estado') }}
                                    </th>
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
                                </tr>
                                <tr class="fila-filtros-tabla">
                                    <th class="filtro-sin-control"></th>
                                    <th v-if="tieneRegistrosEpsBd" class="filtro-sin-control"></th>
                                    <th v-if="tieneRegistrosEpsBd" class="filtro-sin-control"></th>
                                    <th class="filtro-sin-control"></th>
                                    <th>
                                        <select v-model="filtrosPendientes.grupo" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.grupo"
                                                :key="`pend-grupo-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <input
                                            v-model="filtrosPendientes.paciente"
                                            type="text"
                                            class="form-control form-control-sm"
                                            placeholder="Buscar paciente"
                                        />
                                    </th>
                                    <th>
                                        <select v-model="filtrosPendientes.sexo" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.sexo"
                                                :key="`pend-sexo-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <input
                                            v-model="filtrosPendientes.numdoc"
                                            type="text"
                                            class="form-control form-control-sm"
                                            placeholder="N° documento"
                                        />
                                    </th>
                                    <th>
                                        <input v-model="filtrosPendientes.fechaNac" type="date"
                                            class="form-control form-control-sm" title="Filtrar fecha nacimiento" />
                                    </th>
                                    <th class="filtro-sin-control"></th>
                                    <th>
                                        <select v-model="filtrosPendientes.eps" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.eps"
                                                :key="`pend-eps-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select v-model="filtrosPendientes.regimen" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroPendientes.regimen"
                                                :key="`pend-regimen-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th class="filtro-sin-control"></th>
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
                                    <th>
                                        <input v-model="filtrosPendientes.fecha" type="date"
                                            class="form-control form-control-sm" title="Filtrar fecha demanda" />
                                    </th>
                                    <th>
                                        <input v-model="filtrosPendientes.fechagestEnfermera" type="date"
                                            class="form-control form-control-sm" title="Filtrar fecha cierre" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="paciente in encuestasPendientesProcesadas"
                                    :key="paciente.id"
                                    :class="{
                                        'pendiente-facturable': tieneRegistrosEpsBd && paciente.facturableInfo?.estado === 'si',
                                        'pendiente-reabierto': esPacienteReabierto(paciente) && !(tieneRegistrosEpsBd && paciente.facturableInfo?.estado === 'si'),
                                        'pendiente-gestion-incompleta': debeResaltarPendienteAmarillo(paciente) && !(tieneRegistrosEpsBd && paciente.facturableInfo?.estado === 'si')
                                    }">
                                    <td>
                                        <div class="d-flex gap-1">
                                            <button type="button" class="btn btn-primary btn-sm btn-icono-tabla"
                                                @click="setPacienteId(paciente.id)">
                                                <i class="bi bi-bookmark-check-fill"></i>
                                            </button>
                                            <button
                                                v-if="puedeDevolverPacientePendiente(paciente)"
                                                type="button"
                                                class="btn btn-outline-danger btn-sm btn-icono-tabla"
                                                :disabled="devolverDisabled[paciente.id]"
                                                @click="devolverARegistroInicial(paciente.id)"
                                                title="Devolver a registro inicial">
                                                <i class="bi bi-arrow-counterclockwise"></i>
                                            </button>
                                            <span
                                                v-else-if="tieneCupsDiligenciados(paciente)"
                                                class="btn btn-warning btn-sm btn-icono-tabla disabled opacity-100"
                                                :title="textoEstadoFacturacionPendiente(paciente)">
                                                <i class="bi bi-exclamation-triangle-fill"></i>
                                            </span>
                                        </div>
                                    </td>
                                    <td v-if="tieneRegistrosEpsBd" class="text-center">
                                        <input
                                            v-if="esSeleccionableDepuracionPendiente(paciente)"
                                            type="checkbox"
                                            class="form-check-input m-0"
                                            :checked="estaSeleccionadoDepuracionPendiente(paciente.id)"
                                            :disabled="cerrandoDepuracionPendientes || cargando"
                                            @change="toggleSeleccionDepuracionPendiente(paciente.id)">
                                        <span v-else class="text-muted small">—</span>
                                    </td>
                                    <td
                                        v-if="tieneRegistrosEpsBd"
                                        class="text-center col-facturable"
                                        :title="paciente.facturableInfo?.tooltip || 'No registrado en BDS_EPS'">
                                        <span v-if="paciente.facturableInfo?.estado === 'no'" class="text-muted">No</span>
                                        <div v-else class="facturable-cell">
                                            <i
                                                v-if="paciente.facturableInfo?.estado === 'si'"
                                                class="bi bi-check-circle-fill text-success"
                                                aria-label="Facturable"></i>
                                            <i
                                                v-else
                                                class="bi bi-exclamation-triangle-fill text-warning"
                                                aria-label="Documento en BD con datos diferentes"></i>
                                            <small class="d-block text-muted mt-1">{{ paciente.facturableInfo?.epsNombre }}</small>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <span
                                            v-if="esPacienteReabierto(paciente)"
                                            class="estado-facturacion-devuelta"
                                            title="Reabierto desde el historial de hoy. Debe cerrar nuevamente al terminar.">
                                            <i class="bi bi-arrow-counterclockwise"></i>
                                            <span class="small d-block">Devuelto</span>
                                        </span>
                                        <span
                                            v-else-if="esPacienteFacturacionIncompleta(paciente)"
                                            class="estado-facturacion-incompleta"
                                            :title="textoEstadoFacturacionPendiente(paciente)">
                                            <i class="bi bi-exclamation-triangle-fill"></i>
                                            <span class="small d-block">Incompleto</span>
                                        </span>
                                        <span
                                            v-else-if="esPacienteFacturacionEnProceso(paciente)"
                                            class="estado-facturacion-en-proceso"
                                            :title="textoEstadoFacturacionPendiente(paciente)">
                                            <i class="bi bi-hourglass-split"></i>
                                            <span class="small d-block">En proceso</span>
                                        </span>
                                        <span v-else class="text-muted small">Sin gestión</span>
                                    </td>
                                    <td>{{ paciente.grupo }}</td>
                                    <td>
                                        {{ paciente.nombre1 }} {{ paciente.apellido1 }}
                                        {{ paciente.apellido2 }}
                                    </td>
                                    <td>{{ paciente.sexo }}</td>
                                    <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                    <td>{{ formatearFechaYYYYMMDD(paciente.fechaNac) }}</td>
                                    <td>{{ calcularEdad(paciente.fechaNac) }}</td>
                                    <td>{{ paciente.eps }}</td>
                                    <td>{{ paciente.regimen }}</td>
                                    <td>{{ paciente.direccion }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                    <td>{{ formatearFechaHora(obtenerFechaDemandaPaciente(paciente)) }}</td>
                                    <td>{{ formatearFechaHora(obtenerFechaCierreEnfermeraPaciente(paciente)) }}</td>
                                </tr>
                                <tr v-if="encuestasPendientesProcesadas.length === 0">
                                    <td :colspan="columnasPendientesTabla" class="text-center text-muted py-4">
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
                    <div class="container-fluid px-0 mt-3">

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
                    <div v-if="mensajeAprovisionamientoLote" class="alert py-2"
                        :class="mensajeAprovisionamientoLote.includes('Fallidos') ? 'alert-warning' : 'alert-success'">
                        {{ mensajeAprovisionamientoLote }}
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                        <div class="small text-muted">
                            {{ encuestasFactProcesadas.length }} visible(s) ·
                            {{ totalSeleccionadosAprovisionamiento }} seleccionado(s)
                        </div>
                        <div class="d-flex gap-2 flex-wrap">
                            <button
                                type="button"
                                class="btn btn-warning btn-sm"
                                :disabled="totalSeleccionadosAprovisionamiento === 0 || aprovisionandoLote || cargando"
                                @click="aprovisionarSeleccionados">
                                <i class="bi bi-people-fill"></i>
                                {{ aprovisionandoLote ? 'Aprovisionando...' : `Aprovisionar seleccionados (${totalSeleccionadosAprovisionamiento})` }}
                            </button>
                            <button
                                v-if="totalSeleccionadosAprovisionamiento > 0"
                                type="button"
                                class="btn btn-outline-secondary btn-sm"
                                :disabled="aprovisionandoLote || cargando"
                                @click="limpiarSeleccionAprovision">
                                Quitar selección
                            </button>
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="limpiarFiltrosRegistro">
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive tabla-scroll" ref="tablaHtml">
                        <table
                            :key="`aprovisionar-${revisionBandejasFacturacion}`"
                            class="table table-bordered table-striped table-sm align-middle table-success">
                            <thead class="table-light">
                                <tr>
                                    <th>Opciones</th>
                                    <th style="width: 42px;" class="text-center">
                                        <input
                                            type="checkbox"
                                            class="form-check-input m-0"
                                            :checked="todosSeleccionadosAprovisionamiento"
                                            :disabled="idsSeleccionablesAprovisionamiento.length === 0 || aprovisionandoLote || cargando"
                                            @change="toggleSeleccionarTodosAprovision"
                                            title="Seleccionar todos los visibles">
                                    </th>
                                    <!--  <th>id</th> -->
                                    <th @click="ordenarRegistro('grupo')" role="button">Grupo {{ indicadorOrden('grupo')
                                        }}</th>
                                    <th @click="ordenarRegistro('profesional')" role="button">Profesional {{
                                        indicadorOrden('profesional') }}</th>
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
                                </tr>
                                <tr class="fila-filtros-tabla">
                                    <th class="filtro-sin-control"></th>
                                    <th class="filtro-sin-control"></th>
                                    <th>
                                        <select v-model="filtrosRegistro.grupo" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.grupo" :key="`grupo-${item}`"
                                                :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th class="filtro-sin-control"></th>
                                    <th>
                                        <input
                                            v-model="filtrosRegistro.paciente"
                                            type="text"
                                            class="form-control form-control-sm"
                                            placeholder="Buscar paciente"
                                        />
                                    </th>
                                    <th>
                                        <select v-model="filtrosRegistro.sexo" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.sexo" :key="`sexo-${item}`"
                                                :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                    <th>
                                        <input
                                            v-model="filtrosRegistro.numdoc"
                                            type="text"
                                            class="form-control form-control-sm"
                                            placeholder="N° documento"
                                        />
                                    </th>
                                    <th>
                                        <input v-model="filtrosRegistro.fechaNac" type="date"
                                            class="form-control form-control-sm" title="Filtrar fecha nacimiento" />
                                    </th>
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
                                    <th class="filtro-sin-control"></th>
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
                                    <th>
                                        <input v-model="filtrosRegistro.fecha" type="date"
                                            class="form-control form-control-sm" title="Filtrar fecha demanda" />
                                    </th>
                                    <th>
                                        <input v-model="filtrosRegistro.fechagestEnfermera" type="date"
                                            class="form-control form-control-sm" title="Filtrar fecha cierre" />
                                    </th>
                                    <th>
                                        <select v-model="filtrosRegistro.remision" class="form-select form-select-sm">
                                            <option value="">Todos</option>
                                            <option v-for="item in opcionesFiltroRegistro.remision"
                                                :key="`remision-${item}`" :value="item">{{ item }}</option>
                                        </select>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="paciente in encuestasFactProcesadas" :key="paciente.id">
                                    <td>
                                        <button type="button" class="btn btn-warning btn-sm btn-icono-tabla"
                                            :disabled="aprovDisabled[paciente.id] || aprovisionandoLote"
                                            @click="AprovisionarPaciente(paciente.id)">
                                            <i class="bi bi-person-plus"></i>
                                        </button>
                                    </td>
                                    <td class="text-center">
                                        <input
                                            type="checkbox"
                                            class="form-check-input m-0"
                                            :checked="estaSeleccionadoAprovision(paciente.id)"
                                            :disabled="aprovDisabled[paciente.id] || aprovisionandoLote || cargando"
                                            @change="toggleSeleccionAprovision(paciente.id)">
                                    </td>
                                    <!-- <td>{{paciente.id }}</td> -->
                                    <td>{{ paciente.grupo }}</td>
                                    <td>{{ obtenerProfesionalAprovisionamiento(paciente) }}</td>
                                    <td>
                                        {{ paciente.nombre1 }} {{ paciente.nombre2 }}
                                        {{ paciente.apellido1 }} {{ paciente.apellido2 }}
                                    </td>
                                    <td>{{ paciente.sexo }}</td>
                                    <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                    <td>{{ formatearFechaYYYYMMDD(paciente.fechaNac) }}</td>
                                    <td>{{ paciente.eps }}</td>
                                    <td>{{ paciente.regimen }}</td>
                                    <td>{{ paciente.direccion }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.barrio }}</td>
                                    <td>{{ paciente.barrioVeredacomuna?.comuna }}</td>
                                    <td>{{ formatearFechaHora(obtenerFechaDemandaPaciente(paciente)) }}</td>
                                    <td>{{ formatearFechaHora(obtenerFechaCierreEnfermeraPaciente(paciente)) }}</td>
                                    <td>{{ paciente.requiereRemision }}</td>
                                </tr>
                                <tr v-if="encuestasFactProcesadas.length === 0">
                                    <td colspan="16" class="text-center text-muted py-4">
                                        No hay registros visibles. Realice una búsqueda o ajuste los filtros.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-if="activeTab === 'historial'" class="tab-pane show active" id="nav-historial" role="tabpanel"
                    tabindex="0">
                    <div class="d-flex justify-content-between align-items-center mb-2 mt-2 gap-2 flex-wrap">
                        <div class="btn-group btn-group-sm" role="group" aria-label="Periodo historial">
                            <button type="button" class="btn"
                                :class="periodoHistorial === 'hoy' ? 'btn-primary' : 'btn-outline-primary'"
                                @click="cambiarPeriodoHistorial('hoy')">
                                Hoy
                            </button>
                            <button type="button" class="btn"
                                :class="periodoHistorial === 'ayer' ? 'btn-primary' : 'btn-outline-primary'"
                                @click="cambiarPeriodoHistorial('ayer')">
                                Ayer
                            </button>
                            <button type="button" class="btn"
                                :class="periodoHistorial === 'semana' ? 'btn-primary' : 'btn-outline-primary'"
                                @click="cambiarPeriodoHistorial('semana')">
                                Última semana
                            </button>
                        </div>
                        <div class="small text-muted">
                            {{ etiquetaResumenHistorial }}
                        </div>
                    </div>
                    <div v-if="historialPermiteReapertura" class="alert alert-light border py-2 mb-2 small">
                        <i class="bi bi-info-circle"></i>
                        Los pacientes cerrados <strong>hoy</strong> pueden reabrirse para editar o agregar números de factura.
                    </div>
                    <div class="table-responsive tabla-scroll">
                        <table
                            :key="`historial-${revisionBandejasFacturacion}`"
                            class="table table-bordered table-striped table-sm align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th v-if="historialPermiteReapertura">Acciones</th>
                                    <th @click="ordenarHistorial('grupo')" role="button">Grupo {{
                                        indicadorOrdenHistorial('grupo') }}</th>
                                    <th @click="ordenarHistorial('paciente')" role="button">Paciente {{
                                        indicadorOrdenHistorial('paciente') }}</th>
                                    <th @click="ordenarHistorial('documento')" role="button">Documento {{
                                        indicadorOrdenHistorial('documento') }}</th>
                                    <th @click="ordenarHistorial('eps')" role="button">EPS {{
                                        indicadorOrdenHistorial('eps') }}</th>
                                    <th @click="ordenarHistorial('fecha')" role="button">Fecha Demanda {{
                                        indicadorOrdenHistorial('fecha') }}</th>
                                    <th @click="ordenarHistorial('fechagestEnfermera')" role="button">Fecha cierre clínico {{
                                        indicadorOrdenHistorial('fechagestEnfermera') }}</th>
                                    <th @click="ordenarHistorial('fechaFacturacion')" role="button">Fecha cierre facturación {{
                                        indicadorOrdenHistorial('fechaFacturacion') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="paciente in encuestasHistorialProcesadas" :key="`hist-${paciente.id}`">
                                    <td v-if="historialPermiteReapertura">
                                        <button
                                            v-if="puedeReabrirPacienteHistorial(paciente)"
                                            type="button"
                                            class="btn btn-outline-primary btn-sm btn-icono-tabla"
                                            :disabled="reabriendoPacienteId === paciente.id || cargando"
                                            @click="reabrirPacienteHistorial(paciente)">
                                            <i class="bi bi-arrow-counterclockwise"></i>
                                            {{ reabriendoPacienteId === paciente.id ? 'Reabriendo...' : 'Reabrir' }}
                                        </button>
                                        <span v-else class="text-muted small">—</span>
                                    </td>
                                    <td>{{ paciente.grupo }}</td>
                                    <td>
                                        {{ paciente.nombre1 }} {{ paciente.apellido1 }}
                                        {{ paciente.apellido2 }}
                                    </td>
                                    <td>{{ paciente.tipodoc }}-{{ paciente.numdoc }}</td>
                                    <td>{{ paciente.eps }}</td>
                                    <td>{{ formatearFechaHora(obtenerFechaDemandaPaciente(paciente)) }}</td>
                                    <td>{{ formatearFechaHora(obtenerFechaCierreEnfermeraPaciente(paciente)) }}</td>
                                    <td>{{ formatearFechaHora(paciente.fechaFacturacion || paciente.FechaFacturacion) }}</td>
                                </tr>
                                <tr v-if="encuestasHistorialProcesadas.length === 0">
                                    <td :colspan="historialPermiteReapertura ? 8 : 7" class="text-center text-muted py-4">
                                        No hay pacientes cerrados en facturación para {{ etiquetaPeriodoHistorial }}.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </template>
        </div>
    </div>
</template>

<script>
import {
    mapActions,
    mapMutations,
    mapState
} from "vuex";
import { nextTick } from "vue";
import { CONVENIOS_PROGRAMA } from "@/constants/convenios";
import ProfesionalGrupoInfo from "@/components/ProfesionalGrupoInfo.vue";
import FacturacionGuiaModal from "@/components/FacturacionGuiaModal.vue";
import { encuestaVisibleParaFacturador, normalizarGruposFacturador } from "@/utils/grupoUtils.js";
import { listEpsBdIndiceDocumentos } from "@/api/epsBdApi.js";
import { cerrarDepuracionMasiva } from "@/api/facturacionApi.js";

function normalizarTextoFacturable(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

function construirClaveDocumentoFacturable(tipodoc, numdoc) {
    const tipo = String(tipodoc || "").trim().toUpperCase();
    const num = String(numdoc || "").trim().replace(/\s+/g, "");
    if (!tipo || !num) return "";
    return `${tipo}-${num}`;
}

function nombresCoincidenFacturable(paciente, registro) {
    const n1 = normalizarTextoFacturable(paciente?.nombre1);
    const a1 = normalizarTextoFacturable(paciente?.apellido1);
    const rn1 = normalizarTextoFacturable(registro?.nombre1);
    const ra1 = normalizarTextoFacturable(registro?.apellido1);
    return n1 === rn1 && a1 === ra1;
}

function evaluarFacturablePaciente(paciente, indice = {}) {
    const docKey = construirClaveDocumentoFacturable(paciente?.tipodoc, paciente?.numdoc);
    const coincidencias = docKey ? (indice[docKey] || []) : [];
    if (!coincidencias.length) {
        return { estado: "no", epsNombre: "", tooltip: "No registrado en BDS_EPS" };
    }

    const matchNombre = coincidencias.find((item) => nombresCoincidenFacturable(paciente, item));
    if (matchNombre) {
        return {
            estado: "si",
            epsNombre: matchNombre.epsNombre || "",
            tooltip: `Facturable — EPS BD: ${matchNombre.epsNombre || "N/D"}`,
        };
    }

    const epsNombres = [...new Set(coincidencias.map((item) => item.epsNombre).filter(Boolean))].join(", ");
    return {
        estado: "alerta",
        epsNombre: epsNombres,
        tooltip: `Documento en BDS_EPS (${epsNombres}), pero nombre/apellido no coinciden`,
    };
}

export default {
    components: {
        ProfesionalGrupoInfo,
        FacturacionGuiaModal,
    },
    data() {
        return {
            fechaFin: "",
            fechaInicio: "",
            convenioFiltro: "",
            cargando: false,
            activeTab: "pendientes", // Control de pestaña activa
            aprovDisabled: {}, // Estado de desactivación por paciente
            seleccionAprovisionamiento: {},
            seleccionPendientesDepuracion: {},
            cerrandoDepuracionPendientes: false,
            aprovisionandoLote: false,
            mensajeAprovisionamientoLote: "",
            devolverDisabled: {}, // Estado de desactivación para devolver en pendientes
            pacienteIdModal: null,
            facturacionReabiertaHistorial: false,
            reabriendoPacienteId: null,
            pacientesReabiertos: {},
            pacientesReabiertosSnapshot: {},
            facturaDisabled: {}, // Estado de desactivación por cupId
            facturaInputs: {}, // Valores de factura por cupId
            cupl: null,
            tipodoc: "",
            numdoc: "",
            modoEdicion: false, // Control para modo edición de códigos
            facturaEditables: {}, // Almacena valores editables de facturas
            minFacturaChars: 5,
            cargandoModal: false,
            guardandoFactura: false,
            errorModalFacturacion: "",
            rolActivoFacturacion: "",
            ordenRolesFacturacion: [
                "Medico",
                "Enfermero",
                "Psicologo",
                "Tsocial",
                "Nutricionista",
                "Higienista oral",
                "Auxiliar de enfermeria",
            ],
            etiquetasRolFacturacion: {
                Medico: "Médico",
                Enfermero: "Enfermero jefe",
                Psicologo: "Psicólogo",
                Tsocial: "T. social",
                Nutricionista: "Nutricionista",
                "Higienista oral": "Higienista oral",
                "Auxiliar de enfermeria": "Auxiliar",
            },
            filtrosRegistro: {
                grupo: "",
                paciente: "",
                sexo: "",
                numdoc: "",
                fechaNac: "",
                eps: "",
                regimen: "",
                barrio: "",
                comuna: "",
                fecha: "",
                fechagestEnfermera: "",
                remision: "",
            },
            ordenRegistro: {
                campo: "",
                direccion: "asc",
            },
            filtrosPendientes: {
                grupo: "",
                paciente: "",
                sexo: "",
                numdoc: "",
                fechaNac: "",
                eps: "",
                regimen: "",
                barrio: "",
                comuna: "",
                fecha: "",
                fechagestEnfermera: "",
            },
            ordenPendientes: {
                campo: "",
                direccion: "asc",
            },
            periodoHistorial: "hoy",
            ordenHistorial: {
                campo: "fechaFacturacion",
                direccion: "desc",
            },
            ordenCups: {
                campo: "profesional",
                direccion: "asc",
            },
            epsBdIndicePorDocumento: {},
            epsBdTotalRegistrosIndice: 0,
            mostrarGuiaFacturacion: false,
            intervaloRefrescoFacturacionMs: 30000,
            timerRefrescoFacturacion: null,
            refrescoSilenciosoEnCurso: false,
            revisionBandejasFacturacion: 0,
        }
    },
    computed: {
        ...mapState([
            "EncuestasFact",
            "userData",
            "EncuestasFactAprov",
            "EncuestasFactHistorial",
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
        pacienteModalActual() {
            if (!Array.isArray(this.InfoEncuestasById) || !this.InfoEncuestasById.length) {
                return null;
            }
            return this.InfoEncuestasById[0];
        },
        rolesFacturacionModal() {
            const paciente = this.pacienteModalActual;
            if (!paciente?.cups || typeof paciente.cups !== "object") {
                return [];
            }

            const roles = new Set();
            Object.values(paciente.cups).forEach((cup) => {
                roles.add(String(cup?.key || "Sin rol").trim() || "Sin rol");
            });

            const ordenados = this.ordenRolesFacturacion.filter((rol) => roles.has(rol));
            const restantes = Array.from(roles)
                .filter((rol) => !this.ordenRolesFacturacion.includes(rol))
                .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));

            return [...ordenados, ...restantes];
        },
        rolFacturacionActivo() {
            if (this.rolActivoFacturacion && this.rolesFacturacionModal.includes(this.rolActivoFacturacion)) {
                return this.rolActivoFacturacion;
            }
            return this.rolesFacturacionModal[0] || "";
        },
        hayCupsEnModal() {
            return this.rolesFacturacionModal.length > 0;
        },
        hayFacturasParaEditar() {
            const paciente = this.pacienteModalActual;
            if (!paciente?.cups || typeof paciente.cups !== "object") return false;

            return Object.values(paciente.cups).some((cup) => {
                if (!cup?.facturado) return false;
                return this.normalizarFactura(cup.FactNum ?? cup.fact_num).length > 0;
            });
        },
        puedeGuardarEdicionFacturas() {
            if (!this.modoEdicion) return false;
            if (this.contarInvalidasEdicion() > 0) return false;
            return this.contarCambiosValidosEdicion() > 0;
        },
        edicionFacturasTieneInvalidas() {
            return this.contarInvalidasEdicion() > 0;
        },
        mensajeEdicionFacturas() {
            if (!this.modoEdicion) return "";

            const invalidas = this.contarInvalidasEdicion();
            const cambios = this.contarCambiosValidosEdicion();

            if (invalidas > 0) {
                return `Hay ${invalidas} factura(s) con error. Los campos modificados deben tener al menos ${this.minFacturaChars} caracteres.`;
            }
            if (cambios === 0) {
                return "Modifique al menos un número de factura para habilitar Guardar cambios.";
            }
            return `${cambios} cambio(s) listo(s) para guardar.`;
        },
        claseAlertaEdicionFacturas() {
            if (this.contarInvalidasEdicion() > 0) return "alert-danger";
            if (this.contarCambiosValidosEdicion() > 0) return "alert-success";
            return "alert-warning";
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
            const opciones = new Set([...CONVENIOS_PROGRAMA]);
            if (this.convenioUsuario) opciones.add(this.convenioUsuario);
            return Array.from(opciones);
        },
        gruposFacturadorUsuario() {
            return normalizarGruposFacturador(this.userData?.grupo);
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
                const convenioFila = String(paciente?.convenio || "").trim();
                const cumpleAccesoFacturador = !convenioFila
                    ? encuestaVisibleParaFacturador(
                        { ...paciente, convenio: this.convenioUsuario || paciente?.convenio },
                        this.gruposFacturadorUsuario,
                        ""
                      )
                    : encuestaVisibleParaFacturador(
                        paciente,
                        this.gruposFacturadorUsuario,
                        this.convenioUsuario
                      );
                const cumpleGrupo = !this.filtrosRegistro.grupo || String(paciente.grupo || "").trim() === this.filtrosRegistro.grupo;
                const cumplePaciente = this.cumpleFiltroPaciente(paciente, this.filtrosRegistro.paciente);
                const cumpleSexo = !this.filtrosRegistro.sexo || String(paciente.sexo || "").trim() === this.filtrosRegistro.sexo;
                const cumpleNumdoc = this.cumpleFiltroNumdoc(paciente, this.filtrosRegistro.numdoc);
                const cumpleFechaNac = this.cumpleFiltroFecha(paciente.fechaNac ?? paciente.fecha_nac, this.filtrosRegistro.fechaNac);
                const cumpleEps = !this.filtrosRegistro.eps || String(paciente.eps || "").trim() === this.filtrosRegistro.eps;
                const cumpleRegimen = !this.filtrosRegistro.regimen || String(paciente.regimen || "").trim() === this.filtrosRegistro.regimen;
                const cumpleBarrio = !this.filtrosRegistro.barrio || String(paciente.barrioVeredacomuna?.barrio || "").trim() === this.filtrosRegistro.barrio;
                const cumpleComuna = !this.filtrosRegistro.comuna || String(paciente.barrioVeredacomuna?.comuna || "").trim() === this.filtrosRegistro.comuna;
                const cumpleFecha = this.cumpleFiltroFecha(this.obtenerFechaDemandaPaciente(paciente), this.filtrosRegistro.fecha);
                const cumpleFechaCierre = this.cumpleFiltroFecha(this.obtenerFechaCierreEnfermeraPaciente(paciente), this.filtrosRegistro.fechagestEnfermera);
                const cumpleRemision = !this.filtrosRegistro.remision || String(paciente.requiereRemision || "").trim() === this.filtrosRegistro.remision;

                return cumpleAccesoFacturador && cumpleGrupo && cumplePaciente && cumpleSexo && cumpleNumdoc && cumpleFechaNac && cumpleEps && cumpleRegimen && cumpleBarrio && cumpleComuna && cumpleFecha && cumpleFechaCierre && cumpleRemision;
            });

            if (!this.ordenRegistro.campo) return filtradas;

            const direccion = this.ordenRegistro.direccion === "desc" ? -1 : 1;
            return filtradas.sort((a, b) => {
                const valorA = this.obtenerValorColumnaRegistro(a, this.ordenRegistro.campo);
                const valorB = this.obtenerValorColumnaRegistro(b, this.ordenRegistro.campo);
                return valorA.localeCompare(valorB, "es", { numeric: true, sensitivity: "base" }) * direccion;
            });
        },
        idsSeleccionablesAprovisionamiento() {
            return (this.encuestasFactProcesadas || [])
                .map((paciente) => String(paciente?.id || "").trim())
                .filter((id) => id && !this.aprovDisabled[id]);
        },
        totalSeleccionadosAprovisionamiento() {
            return this.idsSeleccionablesAprovisionamiento.filter(
                (id) => this.seleccionAprovisionamiento[id]
            ).length;
        },
        todosSeleccionadosAprovisionamiento() {
            const ids = this.idsSeleccionablesAprovisionamiento;
            return ids.length > 0 && ids.every((id) => this.seleccionAprovisionamiento[id]);
        },
        idsSeleccionablesDepuracionPendientes() {
            if (!this.tieneRegistrosEpsBd) return [];
            return (this.encuestasPendientesProcesadas || [])
                .filter((paciente) => this.esSeleccionableDepuracionPendiente(paciente))
                .map((paciente) => String(paciente?.id || "").trim())
                .filter(Boolean);
        },
        totalSeleccionadosDepuracionPendientes() {
            return this.idsSeleccionablesDepuracionPendientes.filter(
                (id) => this.seleccionPendientesDepuracion[id]
            ).length;
        },
        todosSeleccionadosDepuracionPendientes() {
            const ids = this.idsSeleccionablesDepuracionPendientes;
            return ids.length > 0 && ids.every((id) => this.seleccionPendientesDepuracion[id]);
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
                regimen: generarOpciones(p => p.regimen),
                barrio: generarOpciones(p => p.barrioVeredacomuna?.barrio),
                comuna: generarOpciones(p => p.barrioVeredacomuna?.comuna),
            };
        },
        totalPendientesCargados() {
            return Array.isArray(this.EncuestasFactAprov) ? this.EncuestasFactAprov.length : 0;
        },
        tieneConsultaAprovisionCargada() {
            return Boolean(
                (this.fechaInicio && this.fechaFin) ||
                (this.tipodoc && this.numdoc)
            );
        },
        tieneRegistrosEpsBd() {
            return Number(this.epsBdTotalRegistrosIndice || 0) > 0;
        },
        columnasPendientesTabla() {
            return this.tieneRegistrosEpsBd ? 17 : 15;
        },
        encuestasPendientesProcesadas() {
            const filas = Array.isArray(this.EncuestasFactAprov) ? [...this.EncuestasFactAprov] : [];

            const filtradas = filas.filter(paciente => this.pacienteCumpleFiltrosPendientes(paciente));

            const idsVisibles = new Set(filtradas.map((paciente) => String(paciente?.id || "").trim()).filter(Boolean));
            const enriquecerReabierto = (paciente) => {
                const idPaciente = String(paciente?.id || "").trim();
                if (!idPaciente) return paciente;
                if (paciente.reabiertoDesdeHistorial || this.pacientesReabiertos[idPaciente]) {
                    return { ...paciente, reabiertoDesdeHistorial: true };
                }
                return paciente;
            };

            let resultado = filtradas.map(enriquecerReabierto);

            Object.entries(this.pacientesReabiertosSnapshot || {}).forEach(([id, paciente]) => {
                if (!id || idsVisibles.has(id)) return;
                const filaReabierta = {
                    ...paciente,
                    id,
                    reabiertoDesdeHistorial: true,
                    status_facturacion: false,
                };
                if (!this.pacienteCumpleFiltrosPendientes(filaReabierta, { omitirAcceso: true })) return;
                resultado.unshift(filaReabierta);
            });

            if (!this.ordenPendientes.campo) {
                return resultado.map((paciente) => ({
                    ...paciente,
                    ...(this.tieneRegistrosEpsBd
                        ? { facturableInfo: evaluarFacturablePaciente(paciente, this.epsBdIndicePorDocumento) }
                        : {}),
                }));
            }

            const direccion = this.ordenPendientes.direccion === "desc" ? -1 : 1;
            return resultado.sort((a, b) => {
                const valorA = this.obtenerValorColumnaPendientes(a, this.ordenPendientes.campo);
                const valorB = this.obtenerValorColumnaPendientes(b, this.ordenPendientes.campo);
                return valorA.localeCompare(valorB, "es", { numeric: true, sensitivity: "base" }) * direccion;
            }).map((paciente) => ({
                ...paciente,
                ...(this.tieneRegistrosEpsBd
                    ? { facturableInfo: evaluarFacturablePaciente(paciente, this.epsBdIndicePorDocumento) }
                    : {}),
            }));
        },
        rangoHistorialActual() {
            return this.calcularRangoHistorial(this.periodoHistorial);
        },
        etiquetaPeriodoHistorial() {
            const { inicio, fin } = this.rangoHistorialActual;
            if (this.periodoHistorial === "hoy") {
                return `hoy (${this.formatearFechaDisplay(inicio)})`;
            }
            if (this.periodoHistorial === "ayer") {
                return `ayer (${this.formatearFechaDisplay(inicio)})`;
            }
            return `la última semana (${this.formatearFechaDisplay(inicio)} - ${this.formatearFechaDisplay(fin)})`;
        },
        etiquetaResumenHistorial() {
            const total = this.encuestasHistorialProcesadas.length;
            const cargados = Array.isArray(this.EncuestasFactHistorial) ? this.EncuestasFactHistorial.length : 0;
            return `Mostrando ${total} de ${cargados} pacientes cerrados — ${this.etiquetaPeriodoHistorial}`;
        },
        encuestasHistorialProcesadas() {
            const filas = Array.isArray(this.EncuestasFactHistorial) ? [...this.EncuestasFactHistorial] : [];
            const direccion = this.ordenHistorial.direccion === "desc" ? -1 : 1;
            const campo = this.ordenHistorial.campo || "fechaFacturacion";

            return filas.sort((a, b) => {
                const valorA = this.obtenerValorColumnaHistorial(a, campo);
                const valorB = this.obtenerValorColumnaHistorial(b, campo);
                return valorA.localeCompare(valorB, "es", { numeric: true, sensitivity: "base" }) * direccion;
            });
        },
        historialPermiteReapertura() {
            return this.periodoHistorial === "hoy";
        },

    },
    watch: {
        async activeTab(nuevaTab) {
            if (nuevaTab === "pendientes") {
                await this.getPendientes();
                return;
            }

            if (nuevaTab === "historial") {
                await this.getHistorial();
                return;
            }

            if (nuevaTab === "aprovisionar") {
                await this.refrescarBandejaActiva({ force: true });
            }
        },
        documentoUsuarioActual: {
            immediate: true,
            async handler(nuevoDocumento) {
                if (!String(nuevoDocumento || "").trim()) {
                    return;
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
            "GetHistorialFacturacion",
            "GetRegistersbyRangeGeneralFactByID",
            "aprovicionarP",
            "revertirAprovisionFacturacion",
            "getEncuestaById",
            "asigFacturacion",
            "cerrarFacturacion",
            "reabrirFacturacion",
            "getAllActividadesExtra"
        ]),
        ...mapMutations([
            "upsertEncuestaFactAprov",
        ]),
        /*  */

        /*  */
        obtenerDocumentoUsuarioActual() {
            return this.documentoUsuarioActual;
        },
        isFacturacionPendientesDebugEnabled() {
            try {
                const query = new URLSearchParams(window.location.search);
                const queryFlag = String(query.get("debugFacturacionPendientes") || "").trim().toLowerCase();
                const queryFilter = String(query.get("debugFacturacionPendientesFiltro") || "").trim();
                const flag = String(localStorage.getItem("debugFacturacionPendientes") || "").trim().toLowerCase();
                return window.__DEBUG_FACTURACION_PENDIENTES__ === true || queryFlag === "1" || queryFlag === "true" || flag === "1" || flag === "true" || !!queryFilter;
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
        async cargarIndiceEpsBd() {
            try {
                const respuesta = await listEpsBdIndiceDocumentos();
                const indice = {};
                (respuesta?.registros || []).forEach((registro) => {
                    const docKey = construirClaveDocumentoFacturable(registro.tipoDocumento, registro.numdoc);
                    if (!docKey) return;
                    if (!indice[docKey]) indice[docKey] = [];
                    indice[docKey].push(registro);
                });
                this.epsBdIndicePorDocumento = indice;
                this.epsBdTotalRegistrosIndice = Number(respuesta?.total || 0);
                if (!this.epsBdTotalRegistrosIndice) {
                    this.limpiarSeleccionDepuracionPendientes();
                }
            } catch (error) {
                console.error("[facturacion:pendientes] error-cargar-indice-eps-bd", error);
                this.epsBdIndicePorDocumento = {};
                this.epsBdTotalRegistrosIndice = 0;
                this.limpiarSeleccionDepuracionPendientes();
            }
        },
        puedeRefrescarFacturacionSilencioso({ permitirConModal = false } = {}) {
            return !this.cargando
                && !this.refrescoSilenciosoEnCurso
                && !this.guardandoFactura
                && !this.cargandoModal
                && !this.cerrandoDepuracionPendientes
                && !this.aprovisionandoLote
                && !this.reabriendoPacienteId
                && (permitirConModal || !this.pacienteIdModal);
        },
        marcarRevisionBandejasFacturacion() {
            this.revisionBandejasFacturacion += 1;
        },
        async refrescarBandejaActiva({ silencioso = false, force = true, recargarIndiceEpsBd = false, permitirConModal = false } = {}) {
            if (silencioso && !this.puedeRefrescarFacturacionSilencioso({ permitirConModal })) {
                return;
            }

            if (this.activeTab === "pendientes") {
                await this.getPendientes({ silencioso, force, recargarIndiceEpsBd, permitirConModal });
                return;
            }

            if (this.activeTab === "historial") {
                await this.getHistorial({ silencioso, force });
                return;
            }

            if (this.activeTab === "aprovisionar" && this.tieneConsultaAprovisionCargada()) {
                if (this.fechaInicio && this.fechaFin) {
                    await this.getdataEncuestas(this.fechaInicio, this.fechaFin, this.convenioFiltro, {
                        silencioso,
                        limpiarSeleccion: false,
                        force,
                    });
                    return;
                }

                if (this.tipodoc && this.numdoc) {
                    await this.getdataEncuestasById(this.tipodoc, this.numdoc, {
                        silencioso,
                        limpiarSeleccion: false,
                        force,
                    });
                }
            }
        },
        iniciarRefrescoAutomaticoFacturacion() {
            this.detenerRefrescoAutomaticoFacturacion();
            this.timerRefrescoFacturacion = setInterval(() => {
                this.refrescarBandejaActiva({ silencioso: true, force: true });
            }, this.intervaloRefrescoFacturacionMs);
        },
        detenerRefrescoAutomaticoFacturacion() {
            if (this.timerRefrescoFacturacion) {
                clearInterval(this.timerRefrescoFacturacion);
                this.timerRefrescoFacturacion = null;
            }
        },
        manejarVisibilidadFacturacion() {
            if (document.visibilityState === "visible") {
                this.refrescarBandejaActiva({ silencioso: true, force: true });
            }
        },
        async getPendientes({ silencioso = false, force = true, recargarIndiceEpsBd = !silencioso, permitirConModal = false } = {}) {
            if (silencioso) {
                if (!this.puedeRefrescarFacturacionSilencioso({ permitirConModal })) return;
                this.refrescoSilenciosoEnCurso = true;
            } else {
                this.cargando = true;
            }
            try {
                if (recargarIndiceEpsBd) {
                    await this.cargarIndiceEpsBd();
                }
                const documento = await this.esperarUsuarioDisponible();
                if (this.isFacturacionPendientesDebugEnabled()) {
                    console.warn("[facturacion:pendientes] inicio-getPendientes", {
                        documento,
                        activeTab: this.activeTab,
                        userData: {
                            numDocumento: this.userData?.numDocumento,
                            num_documento: this.userData?.num_documento,
                            documento: this.userData?.documento,
                        },
                    });
                }
                const resultados = await this.GetRegistersbyRangeGeneralFactAprov({
                    force,
                    iduser: documento,
                    gruposFacturador: this.gruposFacturadorUsuario,
                    convenio: this.convenioUsuario,
                });
                this.marcarRevisionBandejasFacturacion();

                if (this.isFacturacionPendientesDebugEnabled()) {
                    console.warn("[facturacion:pendientes] vista-getPendientes", {
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
                    console.warn("[facturacion:pendientes] render-tabla", {
                        totalPendientesCargados: this.totalPendientesCargados,
                        totalPendientesVisibles: this.encuestasPendientesProcesadas.length,
                        filasRenderizadas,
                        activeTab: this.activeTab,
                    });
                }
            } finally {
                if (silencioso) {
                    this.refrescoSilenciosoEnCurso = false;
                } else {
                    this.cargando = false;
                }
            }
        },
        calcularRangoHistorial(periodo = "hoy") {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const formatear = (fecha) => {
                const y = fecha.getFullYear();
                const m = String(fecha.getMonth() + 1).padStart(2, "0");
                const d = String(fecha.getDate()).padStart(2, "0");
                return `${y}-${m}-${d}`;
            };

            if (periodo === "ayer") {
                const ayer = new Date(hoy);
                ayer.setDate(ayer.getDate() - 1);
                const valor = formatear(ayer);
                return { inicio: valor, fin: valor };
            }

            if (periodo === "semana") {
                const inicioSemana = new Date(hoy);
                inicioSemana.setDate(inicioSemana.getDate() - 6);
                return { inicio: formatear(inicioSemana), fin: formatear(hoy) };
            }

            const valorHoy = formatear(hoy);
            return { inicio: valorHoy, fin: valorHoy };
        },
        async getHistorial({ silencioso = false, force = true } = {}) {
            if (silencioso) {
                if (!this.puedeRefrescarFacturacionSilencioso()) return;
                this.refrescoSilenciosoEnCurso = true;
            } else {
                this.cargando = true;
            }
            try {
                const documento = await this.esperarUsuarioDisponible();
                const { inicio, fin } = this.rangoHistorialActual;

                await this.GetHistorialFacturacion({
                    force,
                    iduser: documento,
                    fechaInicio: inicio,
                    fechaFin: fin,
                    gruposFacturador: this.gruposFacturadorUsuario,
                    convenio: this.convenioUsuario,
                });
                this.marcarRevisionBandejasFacturacion();
            } finally {
                if (silencioso) {
                    this.refrescoSilenciosoEnCurso = false;
                } else {
                    this.cargando = false;
                }
            }
        },
        async cambiarPeriodoHistorial(periodo) {
            if (this.periodoHistorial === periodo) {
                await this.getHistorial();
                return;
            }

            this.periodoHistorial = periodo;
            await this.getHistorial();
        },
        async getdataEncuestas(fechaInicio, fechaFin, convenio, { limpiarSeleccion = true, silencioso = false, force = true } = {}) {
            if (silencioso) {
                if (!this.puedeRefrescarFacturacionSilencioso()) return;
                this.refrescoSilenciosoEnCurso = true;
            } else {
                this.cargando = true;
            }
            if (limpiarSeleccion) {
                this.limpiarSeleccionAprovision();
                this.mensajeAprovisionamientoLote = "";
            }
            try {
                if (!fechaInicio || !fechaFin) {
                    if (!silencioso) {
                        alert("Debe seleccionar fecha inicial y fecha final.");
                    }
                    return;
                }

                let parametros = {
                    finicial: fechaInicio,
                    ffinal: fechaFin,
                    convenio: convenio || this.convenioUsuario,
                    gruposFacturador: this.gruposFacturadorUsuario,
                    force,
                };
                await this.GetRegistersbyRangeGeneralFact(parametros);
                this.marcarRevisionBandejasFacturacion();
            } catch (error) {
                console.error("Error al consultar encuestas:", error);
            } finally {
                if (silencioso) {
                    this.refrescoSilenciosoEnCurso = false;
                } else {
                    this.cargando = false;
                }
            }
        },

        async getdataEncuestasById(tipodoc, numdoc, { limpiarSeleccion = true, silencioso = false, force = true } = {}) {
            if (silencioso) {
                if (!this.puedeRefrescarFacturacionSilencioso()) return;
                this.refrescoSilenciosoEnCurso = true;
            } else {
                this.cargando = true;
            }
            if (limpiarSeleccion) {
                this.limpiarSeleccionAprovision();
                this.mensajeAprovisionamientoLote = "";
            }
            try {
                let parametros = {
                    tipodoc: tipodoc,
                    numdoc: numdoc,
                    gruposFacturador: this.gruposFacturadorUsuario,
                    convenio: this.convenioUsuario,
                    force,
                };
                await this.GetRegistersbyRangeGeneralFactByID(parametros);
                this.marcarRevisionBandejasFacturacion();
            } catch (error) {
                console.error("Error al consultar encuestas:", error);
            } finally {
                if (silencioso) {
                    this.refrescoSilenciosoEnCurso = false;
                } else {
                    this.cargando = false;
                }
            }
        },
        limpiarSeleccionAprovision() {
            this.seleccionAprovisionamiento = {};
        },
        limpiarSeleccionDepuracionPendientes() {
            this.seleccionPendientesDepuracion = {};
        },
        esSeleccionableDepuracionPendiente(paciente = {}) {
            return this.tieneRegistrosEpsBd && paciente?.facturableInfo?.estado !== "si";
        },
        estaSeleccionadoDepuracionPendiente(id) {
            return !!this.seleccionPendientesDepuracion[String(id || "").trim()];
        },
        toggleSeleccionDepuracionPendiente(id) {
            const key = String(id || "").trim();
            if (!key) return;

            if (this.seleccionPendientesDepuracion[key]) {
                delete this.seleccionPendientesDepuracion[key];
                return;
            }

            this.seleccionPendientesDepuracion[key] = true;
        },
        toggleSeleccionarTodosDepuracionPendientes() {
            const ids = this.idsSeleccionablesDepuracionPendientes;
            if (!ids.length) return;

            if (this.todosSeleccionadosDepuracionPendientes) {
                ids.forEach((id) => {
                    delete this.seleccionPendientesDepuracion[id];
                });
                return;
            }

            ids.forEach((id) => {
                this.seleccionPendientesDepuracion[id] = true;
            });
        },
        async cerrarDepuracionSeleccionados() {
            if (!this.tieneRegistrosEpsBd) return;

            const ids = this.idsSeleccionablesDepuracionPendientes.filter(
                (id) => this.seleccionPendientesDepuracion[id]
            );

            if (!ids.length) {
                alert("Seleccione al menos un paciente no facturable.");
                return;
            }

            const confirmar = confirm(
                `¿Cerrar ${ids.length} paciente(s) en depuración?\n\n` +
                "Se colocará 0000 en todas las facturas de CUPS y el paciente saldrá de Pendientes y Aprovisionar.\n" +
                "Esta acción no se puede deshacer desde esta pantalla."
            );
            if (!confirmar) return;

            this.cerrandoDepuracionPendientes = true;
            try {
                const resultado = await cerrarDepuracionMasiva({
                    encuestaIds: ids,
                    idFacturador: this.obtenerDocumentoUsuarioActual(),
                });

                const cerrados = Number(resultado?.cerrados || 0);
                const errores = Array.isArray(resultado?.errores) ? resultado.errores : [];

                (resultado?.cerradosIds || []).forEach((id) => {
                    const key = String(id || "").trim();
                    delete this.seleccionPendientesDepuracion[key];
                    delete this.pacientesReabiertos[key];
                    delete this.pacientesReabiertosSnapshot[key];
                });
                this.persistirPacientesReabiertos();

                await this.recargarBandejasFacturacion();

                if (errores.length) {
                    alert(`Cerrados: ${cerrados}. No procesados: ${errores.length}.`);
                    return;
                }

                alert(`${cerrados} paciente(s) cerrado(s) en depuración.`);
            } catch (error) {
                console.error("Error al cerrar depuración masiva:", error);
                alert(
                    "No se pudo completar el cierre en depuración.\n\n" +
                    (error?.response?.data?.message || error?.message || "Error desconocido")
                );
            } finally {
                this.cerrandoDepuracionPendientes = false;
            }
        },
        estaSeleccionadoAprovision(id) {
            return !!this.seleccionAprovisionamiento[String(id || "").trim()];
        },
        toggleSeleccionAprovision(id) {
            const key = String(id || "").trim();
            if (!key) return;

            if (this.seleccionAprovisionamiento[key]) {
                delete this.seleccionAprovisionamiento[key];
                return;
            }

            this.seleccionAprovisionamiento[key] = true;
        },
        toggleSeleccionarTodosAprovision() {
            const ids = this.idsSeleccionablesAprovisionamiento;
            if (!ids.length) return;

            if (this.todosSeleccionadosAprovisionamiento) {
                ids.forEach((id) => {
                    delete this.seleccionAprovisionamiento[id];
                });
                return;
            }

            ids.forEach((id) => {
                this.seleccionAprovisionamiento[id] = true;
            });
        },
        obtenerParametrosRecargaBandejas() {
            return {
                force: true,
                iduser: this.obtenerDocumentoUsuarioActual(),
                gruposFacturador: this.gruposFacturadorUsuario,
                convenio: this.convenioUsuario,
            };
        },
        async recargarBandejasFacturacion() {
            await this.GetRegistersbyRangeGeneralFactAprov({
                ...this.obtenerParametrosRecargaBandejas(),
                force: true,
            });
            this.marcarRevisionBandejasFacturacion();

            if (this.fechaInicio && this.fechaFin) {
                await this.GetRegistersbyRangeGeneralFact({
                    finicial: this.fechaInicio,
                    ffinal: this.fechaFin,
                    convenio: this.convenioFiltro || this.convenioUsuario,
                    gruposFacturador: this.gruposFacturadorUsuario,
                    force: true,
                });
            } else if (this.tipodoc && this.numdoc) {
                await this.GetRegistersbyRangeGeneralFactByID({
                    tipodoc: this.tipodoc,
                    numdoc: this.numdoc,
                    gruposFacturador: this.gruposFacturadorUsuario,
                    convenio: this.convenioUsuario,
                    force: true,
                });
            }
            this.marcarRevisionBandejasFacturacion();
        },
        AprovisionarPaciente(id) {
            return this.ejecutarAprovisionamiento(id);
        },
        async aprovisionarSeleccionados() {
            const ids = this.idsSeleccionablesAprovisionamiento.filter(
                (id) => this.seleccionAprovisionamiento[id]
            );

            if (!ids.length) {
                alert("Seleccione al menos un paciente del listado.");
                return;
            }

            const confirmar = confirm(
                `¿Aprovisionar ${ids.length} paciente(s) seleccionado(s) a su bandeja de pendientes?`
            );
            if (!confirmar) return;

            this.aprovisionandoLote = true;
            this.mensajeAprovisionamientoLote = "";
            const errores = [];
            let exitos = 0;
            const idProf = this.obtenerDocumentoUsuarioActual();

            for (const id of ids) {
                this.aprovDisabled[id] = true;
                try {
                    await this.aprovicionarP({ idEnc: id, idProf });
                    delete this.seleccionAprovisionamiento[id];
                    exitos += 1;
                } catch (error) {
                    console.error(`Error al aprovisionar paciente ${id}:`, error);
                    errores.push({
                        id,
                        message: error?.response?.data?.message || error?.message || String(error),
                    });
                    this.aprovDisabled[id] = false;
                }
            }

            try {
                await this.recargarBandejasFacturacion();
            } catch (error) {
                console.error("Error al recargar bandejas tras aprovisionamiento:", error);
            } finally {
                this.aprovisionandoLote = false;
            }

            if (errores.length) {
                this.mensajeAprovisionamientoLote =
                    `Aprovisionados: ${exitos}. Fallidos: ${errores.length}. Revise los registros no marcados.`;
                alert(this.mensajeAprovisionamientoLote);
                return;
            }

            this.mensajeAprovisionamientoLote = `${exitos} paciente(s) aprovisionado(s) correctamente.`;
        },
        async ejecutarAprovisionamiento(id) {
            this.aprovDisabled[id] = true;
            this.cargando = true;
            try {
                await this.aprovicionarP({
                    idEnc: id,
                    idProf: this.obtenerDocumentoUsuarioActual(),
                });

                delete this.seleccionAprovisionamiento[id];
                await this.recargarBandejasFacturacion();
                this.mensajeAprovisionamientoLote = "Paciente aprovisionado correctamente.";
            } catch (error) {
                console.error("Error al aprovisionar paciente:", error);
                alert("No se pudo aprovisionar el paciente: " + (error?.message || error));
                this.aprovDisabled[id] = false;
            } finally {
                this.cargando = false;
            }
        },
        async devolverARegistroInicial(id) {
            const idNormalizado = String(id || "").trim();
            const paciente = (this.EncuestasFactAprov || []).find(
                (item) => String(item?.id || "").trim() === idNormalizado
            ) || this.pacientesReabiertosSnapshot?.[idNormalizado] || { id: idNormalizado };

            if (!this.puedeDevolverPacientePendiente(paciente)) {
                alert("No se puede devolver este paciente: ya tiene CUPS con número de factura registrado.");
                return;
            }

            const confirmar = confirm("Este registro se devolverá a la tabla inicial. ¿Desea continuar?");
            if (!confirmar) return;

            this.devolverDisabled[id] = true;
            this.cargando = true;
            try {
                await this.revertirAprovisionFacturacion(id);

                await this.GetRegistersbyRangeGeneralFactAprov({
                    force: true,
                    iduser: this.obtenerDocumentoUsuarioActual(),
                    gruposFacturador: this.gruposFacturadorUsuario,
                    convenio: this.convenioUsuario,
                });

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
                profesional: this.obtenerProfesionalAprovisionamiento(paciente),
                paciente: `${paciente.nombre1 || ""} ${paciente.nombre2 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`,
                sexo: paciente.sexo,
                documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                fechaNac: paciente.fechaNac,
                eps: paciente.eps,
                regimen: paciente.regimen,
                direccion: paciente.direccion,
                barrio: paciente.barrioVeredacomuna?.barrio,
                comuna: paciente.barrioVeredacomuna?.comuna,
                fecha: this.obtenerFechaDemandaPaciente(paciente),
                fechagestEnfermera: this.obtenerFechaCierreEnfermeraPaciente(paciente),
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
                paciente: "",
                sexo: "",
                numdoc: "",
                fechaNac: "",
                eps: "",
                regimen: "",
                barrio: "",
                comuna: "",
                fecha: "",
                fechagestEnfermera: "",
                remision: "",
            };
            this.ordenRegistro = {
                campo: "",
                direccion: "asc",
            };
        },
        obtenerValorColumnaPendientes(paciente, campo) {
            if (campo === "facturable") {
                return this.obtenerValorOrdenFacturablePendiente(paciente);
            }

            const mapaValores = {
                id: paciente.id,
                grupo: paciente.grupo,
                paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`,
                sexo: paciente.sexo,
                documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                fechaNac: paciente.fechaNac,
                edad: this.calcularEdad(paciente.fechaNac),
                eps: paciente.eps,
                regimen: paciente.regimen,
                direccion: paciente.direccion,
                barrio: paciente.barrioVeredacomuna?.barrio,
                comuna: paciente.barrioVeredacomuna?.comuna,
                fecha: this.obtenerFechaDemandaPaciente(paciente),
                fechagestEnfermera: this.obtenerFechaCierreEnfermeraPaciente(paciente),
                estado: this.obtenerEtiquetaEstadoFacturacionPendiente(paciente),
            };

            return String(mapaValores[campo] || "").trim();
        },
        obtenerValorOrdenFacturablePendiente(paciente) {
            const info = paciente?.facturableInfo
                || evaluarFacturablePaciente(paciente, this.epsBdIndicePorDocumento);
            const pesoPorEstado = { si: "1", alerta: "2", no: "3" };
            const peso = pesoPorEstado[info?.estado] || "9";
            const eps = normalizarTextoFacturable(info?.epsNombre || "");
            return `${peso}-${eps}-${info?.estado || ""}`;
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
                paciente: "",
                sexo: "",
                numdoc: "",
                fechaNac: "",
                eps: "",
                regimen: "",
                barrio: "",
                comuna: "",
                fecha: "",
                fechagestEnfermera: "",
            };
            this.ordenPendientes = {
                campo: "",
                direccion: "asc",
            };
        },
        obtenerValorColumnaHistorial(paciente, campo) {
            const mapaValores = {
                grupo: paciente.grupo,
                paciente: `${paciente.nombre1 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`,
                documento: `${paciente.tipodoc || ""}-${paciente.numdoc || ""}`,
                eps: paciente.eps,
                fecha: this.obtenerFechaDemandaPaciente(paciente),
                fechagestEnfermera: this.obtenerFechaCierreEnfermeraPaciente(paciente),
                fechaFacturacion: paciente.fechaFacturacion || paciente.FechaFacturacion,
            };

            return String(mapaValores[campo] || "").trim();
        },
        ordenarHistorial(campo) {
            if (this.ordenHistorial.campo === campo) {
                this.ordenHistorial.direccion = this.ordenHistorial.direccion === "asc" ? "desc" : "asc";
                return;
            }

            this.ordenHistorial.campo = campo;
            this.ordenHistorial.direccion = campo === "fechaFacturacion" ? "desc" : "asc";
        },
        indicadorOrdenHistorial(campo) {
            if (this.ordenHistorial.campo !== campo) return "";
            return this.ordenHistorial.direccion === "asc" ? "▲" : "▼";
        },
        normalizarTextoBusqueda(valor) {
            return String(valor || "")
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        },
        normalizarDocumentoBusqueda(valor) {
            return this.normalizarTextoBusqueda(valor).replace(/[^a-z0-9]/g, "");
        },
        obtenerNombrePaciente(paciente = {}) {
            return `${paciente.nombre1 || ""} ${paciente.nombre2 || ""} ${paciente.apellido1 || ""} ${paciente.apellido2 || ""}`
                .replace(/\s+/g, " ")
                .trim();
        },
        cumpleFiltroPaciente(paciente, filtro) {
            if (!String(filtro || "").trim()) return true;
            const nombre = this.obtenerNombrePaciente(paciente);
            return this.normalizarTextoBusqueda(nombre).includes(this.normalizarTextoBusqueda(filtro));
        },
        cumpleFiltroNumdoc(paciente, filtro) {
            if (!String(filtro || "").trim()) return true;
            const busqueda = this.normalizarDocumentoBusqueda(filtro);
            const numdoc = this.normalizarDocumentoBusqueda(paciente?.numdoc);
            const documentoCompleto = this.normalizarDocumentoBusqueda(`${paciente?.tipodoc || ""}-${paciente?.numdoc || ""}`);
            return numdoc.includes(busqueda) || documentoCompleto.includes(busqueda);
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
        facturaCumpleMinimo(valor) {
            return this.normalizarFactura(valor).length >= this.minFacturaChars;
        },
        normalizarFactura(valor) {
            return String(valor ?? "").trim();
        },
        obtenerValorOriginalFactura(cupId, cup = {}) {
            if (cup?.facturado) {
                return this.normalizarFactura(cup.FactNum);
            }
            return this.normalizarFactura(this.facturaInputs[cupId]);
        },
        campoEdicionFacturaModificado(cupId, cup = {}) {
            if (!Object.prototype.hasOwnProperty.call(this.facturaEditables, cupId)) {
                return false;
            }
            const actual = this.normalizarFactura(this.facturaEditables[cupId]);
            const original = this.obtenerValorOriginalFactura(cupId, cup);
            return actual !== original;
        },
        campoEdicionFacturaInvalido(cupId, cup = {}) {
            if (!Object.prototype.hasOwnProperty.call(this.facturaEditables, cupId)) {
                return false;
            }

            const actual = this.normalizarFactura(this.facturaEditables[cupId]);
            const original = this.obtenerValorOriginalFactura(cupId, cup);
            const modificado = actual !== original;

            if (!modificado) {
                return false;
            }

            if (!actual) {
                return cup?.facturado === true;
            }

            return !this.facturaCumpleMinimo(actual);
        },
        claseValidacionFactura(valor) {
            const normalizado = this.normalizarFactura(valor);
            if (!normalizado) return "";
            return this.facturaCumpleMinimo(normalizado) ? "factura-input-valid" : "factura-input-invalid";
        },
        claseValidacionFacturaEdicion(cupId, cup = {}) {
            if (!Object.prototype.hasOwnProperty.call(this.facturaEditables, cupId)) {
                return "";
            }

            const actual = this.normalizarFactura(this.facturaEditables[cupId]);
            const original = this.obtenerValorOriginalFactura(cupId, cup);

            if (actual === original) {
                if (actual && this.facturaCumpleMinimo(actual)) return "factura-input-valid";
                return "";
            }

            if (this.campoEdicionFacturaInvalido(cupId, cup)) {
                return "factura-input-invalid";
            }

            return "factura-input-valid";
        },
        contarInvalidasEdicion() {
            let invalidas = 0;

            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) {
                return invalidas;
            }

            this.InfoEncuestasById.forEach((paciente) => {
                if (!paciente.cups || typeof paciente.cups !== "object") return;

                Object.entries(paciente.cups).forEach(([cupId, cup]) => {
                    if (this.campoEdicionFacturaInvalido(cupId, cup)) {
                        invalidas += 1;
                    }
                });
            });

            return invalidas;
        },
        contarCambiosValidosEdicion() {
            let cambios = 0;

            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) {
                return cambios;
            }

            this.InfoEncuestasById.forEach((paciente) => {
                if (!paciente.cups || typeof paciente.cups !== "object") return;

                Object.entries(paciente.cups).forEach(([cupId, cup]) => {
                    if (!this.campoEdicionFacturaModificado(cupId, cup)) return;

                    const nuevoValor = this.normalizarFactura(this.facturaEditables[cupId]);
                    if (!this.facturaCumpleMinimo(nuevoValor)) return;

                    cambios += 1;
                });
            });

            return cambios;
        },
        recorrerCamposEdicionFactura(callback) {
            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) {
                return;
            }

            this.InfoEncuestasById.forEach((paciente) => {
                if (!paciente.cups || typeof paciente.cups !== "object") return;

                Object.entries(paciente.cups).forEach(([cupId, cup]) => {
                    callback(cupId, cup);
                });
            });
        },
        construirCambiosEdicionFactura() {
            const cambios = [];

            this.recorrerCamposEdicionFactura((cupId, cup) => {
                if (!this.campoEdicionFacturaModificado(cupId, cup)) return;

                const nuevoValor = this.normalizarFactura(this.facturaEditables[cupId]);
                if (!this.facturaCumpleMinimo(nuevoValor)) return;

                cambios.push({
                    cupId,
                    cup,
                    numFactura: nuevoValor,
                    facturado: true,
                });
            });

            return cambios;
        },
        obtenerValorColumnaCup(cup, campo) {
            const mapaValores = {
                actividad: this.obtenerNombreActividad(cup?.actividadId),
                rol: this.etiquetaRolFacturacion(cup?.key),
                profesional: cup?.nombreProf,
                cantidad: cup?.cantidad,
                codigo: cup?.codigo,
                descripcion: cup?.DescripcionCUP || cup?.cupsNombre,
                detalle: cup?.detalle,
                grupo: cup?.Grupo,
            };

            return String(mapaValores[campo] || "").trim();
        },
        etiquetaRolFacturacion(rol) {
            const key = String(rol || "").trim();
            if (!key) return "Sin rol";
            return this.etiquetasRolFacturacion[key] || key;
        },
        contarCupsPorRol(paciente, rol) {
            if (!paciente?.cups || typeof paciente.cups !== "object") return 0;
            const rolBuscado = String(rol || "").trim();
            return Object.values(paciente.cups).filter((cup) =>
                String(cup?.key || "Sin rol").trim() === rolBuscado
            ).length;
        },
        cupEstaDiligenciado(cup = {}) {
            if (!cup?.facturado) return false;
            return this.facturaCumpleMinimo(cup.FactNum ?? cup.fact_num ?? "");
        },
        obtenerEstadoDiligenciaRol(paciente, rol) {
            const cups = this.getCupsPorRol(paciente, rol);
            if (!cups.length) return "ninguno";

            const diligenciados = cups.filter(([, cup]) => this.cupEstaDiligenciado(cup)).length;
            if (diligenciados === 0) return "ninguno";
            if (diligenciados === cups.length) return "completo";
            return "parcial";
        },
        claseBadgeDiligenciaRol(paciente, rol) {
            const estado = this.obtenerEstadoDiligenciaRol(paciente, rol);
            if (estado === "completo") return "bg-primary";
            if (estado === "parcial") return "bg-warning text-dark";
            return "bg-secondary";
        },
        getCupsPorRol(paciente, rol) {
            if (!paciente?.cups || typeof paciente.cups !== "object") return [];
            const rolBuscado = String(rol || "").trim();
            const lista = Object.entries(paciente.cups).filter(([, cup]) =>
                String(cup?.key || "Sin rol").trim() === rolBuscado
            );
            const campo = this.ordenCups.campo || "profesional";
            const direccion = this.ordenCups.direccion === "desc" ? -1 : 1;

            return lista.sort(([, cupA], [, cupB]) => {
                const valorA = this.obtenerValorColumnaCup(cupA, campo);
                const valorB = this.obtenerValorColumnaCup(cupB, campo);
                return valorA.localeCompare(valorB, "es", { numeric: true, sensitivity: "base" }) * direccion;
            });
        },
        sincronizarEstadoFacturasModal() {
            this.facturaInputs = {};
            this.facturaDisabled = {};

            if (!this.InfoEncuestasById || !Array.isArray(this.InfoEncuestasById)) {
                return;
            }

            this.InfoEncuestasById.forEach((paciente) => {
                if (!paciente.cups || typeof paciente.cups !== "object") return;

                Object.entries(paciente.cups).forEach(([cupId, cup]) => {
                    if (cup?.facturado) {
                        this.facturaInputs[cupId] = cup.FactNum || "";
                        this.facturaDisabled[cupId] = true;
                    } else {
                        this.facturaInputs[cupId] = "";
                        this.facturaDisabled[cupId] = false;
                    }
                });
            });

            if (!this.rolActivoFacturacion && this.rolesFacturacionModal.length) {
                this.rolActivoFacturacion = this.rolesFacturacionModal[0];
            }
        },
        async cerrarModalFacturacion() {
            const fueReabierto = this.facturacionReabiertaHistorial;
            this.pacienteIdModal = null;
            this.facturacionReabiertaHistorial = false;
            this.modoEdicion = false;
            this.facturaEditables = {};
            this.errorModalFacturacion = "";
            this.rolActivoFacturacion = "";

            await this.getPendientes({ silencioso: true, force: true });
            if (fueReabierto) {
                await this.getHistorial({ silencioso: true, force: true });
                this.activeTab = "pendientes";
            }
        },
        async cargarPacienteModal(id) {
            this.cargandoModal = true;
            this.errorModalFacturacion = "";
            this.modoEdicion = false;
            this.facturaEditables = {};
            this.rolActivoFacturacion = "";

            try {
                await this.getEncuestaById(id);
                this.sincronizarEstadoFacturasModal();
            } catch (error) {
                console.error("[facturacion:modal] error-carga", error);
                this.errorModalFacturacion = "No se pudo cargar la información del paciente. Intente nuevamente.";
            } finally {
                this.cargandoModal = false;
            }
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
            this.cargarPacienteModal(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        async regFactCup(cupId, numfact, cupActual = {}) {
            const numFactura = String(numfact || "").trim();
            if (!this.facturaCumpleMinimo(numFactura)) {
                alert(`El número de factura debe tener al menos ${this.minFacturaChars} caracteres.`);
                return;
            }

            this.guardandoFactura = true;
            this.errorModalFacturacion = "";
            let refrescarPendientesTrasGuardar = false;

            try {
                if (!(cupId in this.facturaInputs)) {
                    this.facturaInputs[cupId] = numFactura;
                }

                const datafact = {
                    cupId,
                    numFactura,
                    facturado: true,
                    idFacturador: this.obtenerDocumentoUsuarioActual(),
                    idEncuesta: this.pacienteIdModal,
                    cup: cupActual,
                };

                await this.asigFacturacion(datafact);
                await this.getEncuestaById(this.pacienteIdModal);
                this.sincronizarEstadoFacturasModal();
                this.facturaDisabled[cupId] = true;
                refrescarPendientesTrasGuardar = true;
            } catch (error) {
                console.error("[regFactCup] ERROR:", error);
                this.facturaDisabled[cupId] = false;
                this.errorModalFacturacion = "Error al guardar la factura: " + (error?.response?.data?.message || error?.message || error);
                alert(this.errorModalFacturacion);
            } finally {
                this.guardandoFactura = false;
                if (refrescarPendientesTrasGuardar) {
                    await this.getPendientes({
                        silencioso: true,
                        force: true,
                        recargarIndiceEpsBd: false,
                        permitirConModal: true,
                    });
                }
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
                    await this.GetRegistersbyRangeGeneralFactAprov({
                        force: true,
                        iduser: this.obtenerDocumentoUsuarioActual(),
                        gruposFacturador: this.gruposFacturadorUsuario,
                        convenio: this.convenioUsuario,
                    });
                }
                if (this.activeTab === "historial") {
                    await this.getHistorial();
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
                this.limpiarPacienteReabierto(id);
                await this.cerrarModalFacturacion();
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
        formatearFechaYYYYMMDD(valorFecha) {
            if (valorFecha === null || valorFecha === undefined || valorFecha === "") return "";

            if (valorFecha instanceof Date && !Number.isNaN(valorFecha.getTime())) {
                const yyyy = valorFecha.getFullYear();
                const mm = String(valorFecha.getMonth() + 1).padStart(2, "0");
                const dd = String(valorFecha.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
            }

            const texto = String(valorFecha).trim();
            if (!texto) return "";

            const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s]|$)/);
            if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

            const latam = texto.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/);
            if (latam) return `${latam[3]}-${latam[2]}-${latam[1]}`;

            const fecha = new Date(texto);
            if (!Number.isNaN(fecha.getTime())) {
                const yyyy = fecha.getFullYear();
                const mm = String(fecha.getMonth() + 1).padStart(2, "0");
                const dd = String(fecha.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
            }

            return texto;
        },
        obtenerFechaDemandaPaciente(paciente = {}) {
            return paciente.fecha ?? paciente.fechavisita ?? paciente.fecha_visita ?? "";
        },
        obtenerFechaCierreEnfermeraPaciente(paciente = {}) {
            return paciente.fechagestEnfermera ?? paciente.fecha_gest_enfermera ?? "";
        },
        cumpleFiltroFecha(valorPaciente, filtro) {
            if (!String(filtro || "").trim()) return true;
            const fechaPaciente = this.formatearFechaYYYYMMDD(valorPaciente);
            if (!fechaPaciente) return false;
            return fechaPaciente === String(filtro).trim();
        },
        pacienteCumpleFiltrosPendientes(paciente = {}, opciones = {}) {
            const { omitirAcceso = false } = opciones;
            const idPaciente = String(paciente?.id || "").trim();
            const esReabierto = !!(idPaciente && this.pacientesReabiertos[idPaciente]);

            if (!omitirAcceso && !esReabierto) {
                const docActual = String(this.documentoUsuarioActual || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
                const asig = String(paciente?.asigfact ?? paciente?.asig_fact ?? "")
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "");
                const asignadoAMi = !!docActual && !!asig && asig === docActual;
                const cumpleAccesoFacturador = asignadoAMi || encuestaVisibleParaFacturador(
                    paciente,
                    this.gruposFacturadorUsuario,
                    this.convenioUsuario
                );
                if (!cumpleAccesoFacturador) return false;
            }

            const cumpleGrupo = !this.filtrosPendientes.grupo || String(paciente.grupo || "").trim() === this.filtrosPendientes.grupo;
            const cumplePaciente = this.cumpleFiltroPaciente(paciente, this.filtrosPendientes.paciente);
            const cumpleSexo = !this.filtrosPendientes.sexo || String(paciente.sexo || "").trim() === this.filtrosPendientes.sexo;
            const cumpleNumdoc = this.cumpleFiltroNumdoc(paciente, this.filtrosPendientes.numdoc);
            const cumpleFechaNac = this.cumpleFiltroFecha(paciente.fechaNac ?? paciente.fecha_nac, this.filtrosPendientes.fechaNac);
            const cumpleEps = !this.filtrosPendientes.eps || String(paciente.eps || "").trim() === this.filtrosPendientes.eps;
            const cumpleRegimen = !this.filtrosPendientes.regimen || String(paciente.regimen || "").trim() === this.filtrosPendientes.regimen;
            const cumpleBarrio = !this.filtrosPendientes.barrio || String(paciente.barrioVeredacomuna?.barrio || "").trim() === this.filtrosPendientes.barrio;
            const cumpleComuna = !this.filtrosPendientes.comuna || String(paciente.barrioVeredacomuna?.comuna || "").trim() === this.filtrosPendientes.comuna;
            const cumpleFecha = this.cumpleFiltroFecha(this.obtenerFechaDemandaPaciente(paciente), this.filtrosPendientes.fecha);
            const cumpleFechaCierre = this.cumpleFiltroFecha(this.obtenerFechaCierreEnfermeraPaciente(paciente), this.filtrosPendientes.fechagestEnfermera);

            return cumpleGrupo && cumplePaciente && cumpleSexo && cumpleNumdoc && cumpleFechaNac
                && cumpleEps && cumpleRegimen && cumpleBarrio && cumpleComuna
                && cumpleFecha && cumpleFechaCierre;
        },
        formatearFechaDisplay(valorFecha) {
            const ymd = this.formatearFechaYYYYMMDD(valorFecha);
            if (!ymd) return "";
            const partes = ymd.split("-");
            if (partes.length !== 3) return ymd;
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        },
        formatearFechaHora(valorFecha) {
            if (valorFecha === null || valorFecha === undefined || valorFecha === "") return "";

            if (valorFecha instanceof Date && !Number.isNaN(valorFecha.getTime())) {
                return this.formatearFechaHoraDesdeDate(valorFecha);
            }

            const texto = String(valorFecha).trim();
            if (!texto) return "";

            const conHoraLocal = texto.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
            const tieneZonaHoraria = /[zZ]$|[+-]\d{2}:\d{2}$/.test(texto);
            if (conHoraLocal && !tieneZonaHoraria) {
                const [, y, m, d, hh, mi] = conHoraLocal;
                return `${d}/${m}/${y} ${hh}:${mi}`;
            }

            const normalizado = texto.includes(" ") && !texto.includes("T")
                ? texto.replace(" ", "T")
                : texto;
            const fecha = new Date(normalizado);
            if (!Number.isNaN(fecha.getTime())) {
                return this.formatearFechaHoraDesdeDate(fecha);
            }

            const ymd = this.formatearFechaYYYYMMDD(texto);
            return ymd ? `${this.formatearFechaDisplay(texto)} 00:00` : texto;
        },
        formatearFechaHoraDesdeDate(fecha) {
            const y = fecha.getFullYear();
            const m = String(fecha.getMonth() + 1).padStart(2, "0");
            const d = String(fecha.getDate()).padStart(2, "0");
            const hh = String(fecha.getHours()).padStart(2, "0");
            const mi = String(fecha.getMinutes()).padStart(2, "0");
            return `${d}/${m}/${y} ${hh}:${mi}`;
        },
        obtenerConteoCupsFacturacion(paciente = {}) {
            const cupsTotal = Number(paciente?.cupsTotal ?? paciente?.cups_total ?? 0);
            const cupsConFactura = Number(paciente?.cupsConFactura ?? paciente?.cups_con_factura ?? 0);
            return { cupsTotal, cupsConFactura };
        },
        tieneCupsDiligenciados(paciente = {}) {
            const { cupsTotal, cupsConFactura } = this.obtenerConteoCupsFacturacion(paciente);
            if (cupsConFactura > 0) return true;
            if (cupsTotal > 0) return false;
            return paciente?.allFacturasVacias === false;
        },
        puedeDevolverPacientePendiente(paciente = {}) {
            if (this.esPacienteReabierto(paciente)) return false;
            return !this.tieneCupsDiligenciados(paciente);
        },
        esPacienteFacturacionEnProceso(paciente = {}) {
            if (this.esPacienteReabierto(paciente)) return false;
            if (!this.tieneCupsDiligenciados(paciente)) return false;
            return !this.esPacienteFacturacionIncompleta(paciente);
        },
        esPacienteFacturacionIncompleta(paciente = {}) {
            if (this.esPacienteReabierto(paciente)) return false;

            const { cupsTotal, cupsConFactura } = this.obtenerConteoCupsFacturacion(paciente);

            if (cupsTotal > 0) {
                return cupsConFactura > 0 && cupsConFactura < cupsTotal;
            }

            return paciente?.allFacturasVacias === false;
        },
        obtenerEtiquetaEstadoFacturacionPendiente(paciente = {}) {
            if (this.esPacienteReabierto(paciente)) return "Devuelto";
            if (this.esPacienteFacturacionIncompleta(paciente)) return "Incompleto";
            if (this.esPacienteFacturacionEnProceso(paciente)) return "En proceso";
            return "Sin gestión";
        },
        debeResaltarPendienteAmarillo(paciente = {}) {
            if (this.esPacienteReabierto(paciente)) return false;
            return this.tieneCupsDiligenciados(paciente);
        },
        textoEstadoFacturacionPendiente(paciente = {}) {
            const { cupsTotal, cupsConFactura } = this.obtenerConteoCupsFacturacion(paciente);
            const etiqueta = this.obtenerEtiquetaEstadoFacturacionPendiente(paciente);

            if (etiqueta === "Devuelto") {
                return "Reabierto desde el historial de hoy. Debe cerrar nuevamente al terminar.";
            }

            if (cupsTotal > 0) {
                if (etiqueta === "Incompleto") {
                    return `Facturación incompleta: ${cupsConFactura} de ${cupsTotal} procedimiento(s) con número de factura.`;
                }
                if (etiqueta === "En proceso") {
                    return `Facturación en proceso: ${cupsConFactura} de ${cupsTotal} procedimiento(s) con número de factura. Debe cerrar el paciente al terminar.`;
                }
            }

            if (etiqueta === "En proceso" || etiqueta === "Incompleto") {
                return "Ya tiene al menos un número de factura registrado. No puede devolverse a registro inicial.";
            }

            return "Sin gestión de facturación iniciada.";
        },
        obtenerProfesionalAprovisionamiento(paciente = {}) {
            const candidatos = [
                { rol: "Jefe/Enf", documento: paciente.idEnfermeroAtiende },
                { rol: "Medico", documento: paciente.idMedicoAtiende },
                { rol: "Auxiliar", documento: paciente.idEncuestador },
                { rol: "Psicologo", documento: paciente.idPsicologoAtiende },
                { rol: "T. Social", documento: paciente.idTsocialAtiende },
                { rol: "Nutricionista", documento: paciente.idNutricionistaAtiende || paciente.idNutriAtiende },
                { rol: "Higienista oral", documento: paciente.idHigienistaOralAtiende },
            ];

            const profesional = candidatos.find((item) => String(item.documento || "").trim());
            if (!profesional) return "-";

            return `${profesional.rol}: ${String(profesional.documento).trim()}`;
        },
        obtenerNombreActividad(actividadId) {
            if (!actividadId || !this.actividadesExtra) return actividadId || '-';
            const actividad = this.actividadesExtra.find(act => String(act.key) === String(actividadId));
            return actividad ? actividad.nombre : actividadId;
        },

        debeResaltarPendiente(paciente = {}) {
            return this.esPacienteReabierto(paciente) || this.debeResaltarPendienteAmarillo(paciente);
        },
        esPacienteReabierto(paciente = {}) {
            const id = String(paciente?.id || "").trim();
            if (paciente?.reabiertoDesdeHistorial === true) return true;
            return !!(id && this.pacientesReabiertos[id]);
        },
        clavePacientesReabiertosStorage() {
            const doc = String(this.obtenerDocumentoUsuarioActual() || "").trim();
            return doc ? `facturacion-reabiertos-${doc}` : "facturacion-reabiertos";
        },
        persistirPacientesReabiertos() {
            try {
                sessionStorage.setItem(this.clavePacientesReabiertosStorage(), JSON.stringify({
                    marcados: this.pacientesReabiertos,
                    snapshot: this.pacientesReabiertosSnapshot,
                }));
            } catch (_error) {
                // Ignorar fallos de almacenamiento local.
            }
        },
        restaurarPacientesReabiertos() {
            try {
                const raw = sessionStorage.getItem(this.clavePacientesReabiertosStorage());
                if (!raw) return;

                const data = JSON.parse(raw);
                this.pacientesReabiertos = data?.marcados && typeof data.marcados === "object"
                    ? data.marcados
                    : {};
                this.pacientesReabiertosSnapshot = data?.snapshot && typeof data.snapshot === "object"
                    ? data.snapshot
                    : {};

                Object.values(this.pacientesReabiertosSnapshot).forEach((paciente) => {
                    this.upsertEncuestaFactAprov({
                        ...paciente,
                        reabiertoDesdeHistorial: true,
                    });
                });
            } catch (_error) {
                this.pacientesReabiertos = {};
                this.pacientesReabiertosSnapshot = {};
            }
        },
        marcarPacienteReabierto(paciente = {}) {
            const id = String(paciente?.id || "").trim();
            if (!id) return;

            this.pacientesReabiertos = {
                ...this.pacientesReabiertos,
                [id]: true,
            };
            this.pacientesReabiertosSnapshot = {
                ...this.pacientesReabiertosSnapshot,
                [id]: {
                    ...paciente,
                    id,
                    reabiertoDesdeHistorial: true,
                    status_facturacion: false,
                    FechaFacturacion: null,
                    fechaFacturacion: null,
                    asigfact: paciente.asigfact ?? paciente.asig_fact ?? this.obtenerDocumentoUsuarioActual(),
                    asig_fact: paciente.asig_fact ?? paciente.asigfact ?? this.obtenerDocumentoUsuarioActual(),
                },
            };
            this.upsertEncuestaFactAprov(this.pacientesReabiertosSnapshot[id]);
            this.persistirPacientesReabiertos();
        },
        limpiarPacienteReabierto(id) {
            const key = String(id || "").trim();
            if (!key) return;

            if (this.pacientesReabiertos[key]) {
                const copiaMarcados = { ...this.pacientesReabiertos };
                delete copiaMarcados[key];
                this.pacientesReabiertos = copiaMarcados;
            }

            if (this.pacientesReabiertosSnapshot[key]) {
                const copiaSnapshot = { ...this.pacientesReabiertosSnapshot };
                delete copiaSnapshot[key];
                this.pacientesReabiertosSnapshot = copiaSnapshot;
            }

            this.persistirPacientesReabiertos();
        },
        esPacienteCerradoHoy(paciente = {}) {
            const fechaCierre = this.formatearFechaYYYYMMDD(
                paciente.fechaFacturacion || paciente.FechaFacturacion
            );
            const { inicio } = this.calcularRangoHistorial("hoy");
            return !!fechaCierre && fechaCierre === inicio;
        },
        puedeReabrirPacienteHistorial(paciente = {}) {
            return this.historialPermiteReapertura && this.esPacienteCerradoHoy(paciente);
        },
        async reabrirPacienteHistorial(paciente = {}) {
            const id = paciente?.id;
            if (!id || !this.puedeReabrirPacienteHistorial(paciente)) {
                return;
            }

            const nombre = [paciente.nombre1, paciente.apellido1, paciente.apellido2]
                .filter(Boolean)
                .join(" ")
                .trim() || "este paciente";

            const confirmar = confirm(
                `¿Desea reabrir la facturación de ${nombre}?\n\nPodrá agregar o corregir números de factura y deberá cerrar el paciente nuevamente al terminar.`
            );
            if (!confirmar) return;

            this.reabriendoPacienteId = id;
            this.errorModalFacturacion = "";

            try {
                const documento = this.obtenerDocumentoUsuarioActual();
                await this.reabrirFacturacion({
                    idEnc: id,
                    idFacturador: documento,
                });

                const pacienteReabierto = {
                    ...paciente,
                    id,
                    reabiertoDesdeHistorial: true,
                    status_facturacion: false,
                    FechaFacturacion: null,
                    fechaFacturacion: null,
                    asigfact: documento,
                    asig_fact: documento,
                };

                this.marcarPacienteReabierto(pacienteReabierto);
                this.facturacionReabiertaHistorial = true;
                await this.setPacienteId(id);
                await this.getPendientes();
            } catch (error) {
                console.error("[reabrirPacienteHistorial] Error:", error);
                alert("No se pudo reabrir la facturación: " + (error?.response?.data?.message || error?.message || error));
            } finally {
                this.reabriendoPacienteId = null;
            }
        },

        iniciarEdicionCodigos() {
            this.facturaEditables = {};
            this.errorModalFacturacion = "";

            if (this.InfoEncuestasById && Array.isArray(this.InfoEncuestasById)) {
                this.InfoEncuestasById.forEach((paciente) => {
                    if (!paciente.cups || typeof paciente.cups !== "object") return;

                    Object.entries(paciente.cups).forEach(([cupId, cup]) => {
                        this.facturaEditables[cupId] = this.obtenerValorOriginalFactura(cupId, cup);
                    });
                });
            }

            this.modoEdicion = true;
        },

        cancelarEdicion() {
            this.facturaEditables = {};
            this.modoEdicion = false;
            this.errorModalFacturacion = "";
        },

        async guardarEdicionCodigos() {
            if (this.contarInvalidasEdicion() > 0) {
                this.errorModalFacturacion = this.mensajeEdicionFacturas;
                return;
            }

            const cambios = this.construirCambiosEdicionFactura();

            if (!cambios.length) {
                this.errorModalFacturacion = this.mensajeEdicionFacturas;
                return;
            }

            const idEncuesta = this.pacienteIdModal;
            const documentoFacturador = this.obtenerDocumentoUsuarioActual();

            this.guardandoFactura = true;
            this.errorModalFacturacion = "";

            try {
                for (const cambio of cambios) {
                    await this.asigFacturacion({
                        cupId: cambio.cupId,
                        numFactura: cambio.numFactura,
                        idFacturador: documentoFacturador,
                        idEncuesta,
                        cup: cambio.cup,
                        facturado: cambio.facturado,
                    });
                }

                await this.getEncuestaById(idEncuesta);
                this.sincronizarEstadoFacturasModal();
                alert("Códigos de factura actualizados correctamente");
                this.facturaEditables = {};
                this.modoEdicion = false;
            } catch (error) {
                console.error("Error al guardar cambios:", error);
                this.errorModalFacturacion = "Error al guardar cambios: " + (error?.response?.data?.message || error?.message || error);
                await this.cargarPacienteModal(idEncuesta);
            } finally {
                this.guardandoFactura = false;
            }
        }
    },
    created() {
        document.body.classList.add("pagina-facturacion");
    },
    async mounted() {
        this.restaurarPacientesReabiertos();
        this.cargando = true
        try {
            await this.getAllActividadesExtra();
            await this.cargarIndiceEpsBd();
            // getPendientes ya se dispara por el watcher immediate de documentoUsuarioActual
            if (!String(this.documentoUsuarioActual || "").trim()) {
                await this.getPendientes();
            }
        } catch (error) {
            console.error("[facturacion:pendientes] error-mounted", {
                message: error?.message || String(error),
                userData: this.userData,
                documentoUsuarioActual: this.documentoUsuarioActual,
            });
        } finally {
            this.cargando = false
        }

        this.iniciarRefrescoAutomaticoFacturacion();
        document.addEventListener("visibilitychange", this.manejarVisibilidadFacturacion);
    },
    beforeUnmount() {
        document.body.classList.remove("pagina-facturacion");
        this.detenerRefrescoAutomaticoFacturacion();
        document.removeEventListener("visibilitychange", this.manejarVisibilidadFacturacion);
    },
}
</script>

<style>
.facturacion-page {
    width: 100%;
    max-width: none;
    min-height: calc(100vh - 4rem);
    box-sizing: border-box;
}

.facturacion-page .table-responsive,
.facturacion-page .tabla-scroll,
.facturacion-page .table {
    width: 100%;
    max-width: 100%;
}

.facturacion-page .nav-tabs {
    flex-wrap: wrap;
}

.facturacion-page thead tr.fila-filtros-tabla th {
    vertical-align: middle;
    padding: 0.3rem 0.35rem;
    font-weight: normal;
    background-color: #f8f9fa;
}

.facturacion-page thead tr.fila-filtros-tabla .form-control,
.facturacion-page thead tr.fila-filtros-tabla .form-select {
    width: 100%;
    min-width: 5.5rem;
}

.facturacion-page thead tr.fila-filtros-tabla th.filtro-sin-control {
    background-color: #eef1f4;
}

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
    max-height: calc(100vh - 260px);
    overflow-y: auto;
    overflow-x: auto;
}

.facturacion-cups-panel {
    width: 100%;
}

.facturacion-cups-body {
    min-height: 240px;
}

.facturacion-loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.82);
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.factura-input-valid {
    border-color: #198754 !important;
    color: #146c43;
    background-color: #f0fdf4;
}

.factura-input-valid:focus {
    border-color: #198754;
    box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.2);
}

.factura-input-invalid {
    border-color: #dc3545 !important;
    color: #b02a37;
    background-color: #fff5f5;
}

.factura-input-invalid:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.2);
}

.pendiente-reabierto > td {
    background-color: #cfe2ff !important;
}

.pendiente-reabierto:hover > td {
    background-color: #b6d4fe !important;
}

.pendiente-gestion-incompleta > td {
    background-color: #fff3cd !important;
}

.pendiente-gestion-incompleta:hover > td {
    background-color: #ffe69c !important;
}

.pendiente-facturable > td {
    background-color: #d1e7dd !important;
}

.pendiente-facturable:hover > td {
    background-color: #badbcc !important;
}

.facturacion-page .col-facturable {
    min-width: 110px;
    vertical-align: middle;
}

.facturacion-page .facturable-cell {
    line-height: 1.1;
}

.estado-facturacion-devuelta {
    color: #084298;
    font-weight: 600;
    line-height: 1.1;
}

.estado-facturacion-incompleta {
    color: #997404;
    font-weight: 600;
    line-height: 1.1;
}

.estado-facturacion-en-proceso {
    color: #997404;
    font-weight: 600;
    line-height: 1.1;
}

.facturacion-page h2 .bi,
.facturacion-page h3 .bi {
    font-size: 1em;
    vertical-align: -0.1em;
}

.facturacion-page .tabla-scroll .btn-icono-tabla {
    padding: 0.15rem 0.4rem;
    line-height: 1.2;
}

.facturacion-page .tabla-scroll .btn-icono-tabla .bi {
    font-size: 1em;
}

.facturacion-page .estado-facturacion-devuelta .bi,
.facturacion-page .estado-facturacion-incompleta .bi,
.facturacion-page .estado-facturacion-en-proceso .bi {
    font-size: 1em;
}

.facturacion-page .estado-facturacion-devuelta .small,
.facturacion-page .estado-facturacion-incompleta .small,
.facturacion-page .estado-facturacion-en-proceso .small {
    font-size: 0.875em;
}
</style>

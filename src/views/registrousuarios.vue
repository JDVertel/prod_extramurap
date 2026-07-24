<template>
    <div>
        <!-- Modal de mensajes con estilo -->
        <div v-if="message" class="modal-overlay" @click="closeMessage">
            <div class="modal-message" :class="messageType" @click.stop>
                <div class="modal-header-custom">
                    <i
                        :class="messageType === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'"></i>
                    <h5>{{ messageType === 'success' ? '¡Éxito!' : 'Atención' }}</h5>
                </div>
                <div class="modal-body-custom">
                    <p>{{ message }}</p>
                    <p v-if="messagePassword" class="mb-0"><strong>{{ messagePassword }}</strong></p>
                </div>
                <div class="modal-footer-custom">
                    <button class="btn-close-modal" @click="closeMessage">
                        <i class="bi bi-x-circle"></i> Cerrar
                    </button>
                </div>
            </div>
        </div>

        <div class="container">
            <nav>
                <div class="nav nav-tabs" id="nav-tab" role="tablist">
                    <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home"
                        type="button" role="tab" aria-controls="nav-home" aria-selected="true">
                        <i class="bi bi-people-fill me-1"></i> Gestionar
                    </button>
                    <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile"
                        type="button" role="tab" aria-controls="nav-profile" aria-selected="false">
                        <i class="bi bi-person-plus-fill me-1"></i> Crear
                    </button>
                </div>
            </nav>
            <div class="tab-content" id="nav-tabContent">
                <div class="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab"
                    tabindex="0">
                    <h1 class="display-6"><i class="bi bi-people-fill display-6"></i> Listado de usuarios del sistema
                    </h1>

                    <!-- Filtro por IPS (solo superusuario) -->
                    <div v-if="isSuperUser" class="filter-section mb-3 p-3 border border-primary rounded bg-light">
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            <label class="fw-bold mb-0"><i class="bi bi-hospital me-1"></i> IPS:</label>
                            <input
                                v-model="filtroIpsSearch"
                                type="text"
                                class="form-control form-control-sm"
                                style="max-width:220px"
                                placeholder="Buscar IPS..."
                                autocomplete="off"
                            />
                            <select v-model="filtroIpsId" class="form-select form-select-sm" style="max-width:280px">
                                <option value="">— Todas las IPS —</option>
                                <option v-for="ips in ipsListFiltradaParaFiltro" :key="ips.id" :value="ips.id">
                                    {{ ips.nombre || ips.name || ips.id }}
                                </option>
                            </select>
                            <button v-if="filtroIpsId" @click="filtroIpsId = ''; filtroIpsSearch = ''" class="btn btn-sm btn-outline-secondary">
                                <i class="bi bi-x-circle"></i> Limpiar
                            </button>
                            <span v-if="filtroIpsId" class="badge bg-primary">
                                {{ ipsNombreFiltro }}
                            </span>
                        </div>
                    </div>

                    <!-- Buscar + tabs por convenio -->
                    <div class="filter-section mb-3">
                        <div class="mb-3">
                            <label for="busquedaUsuario" class="form-label mb-1"><strong>Buscar:</strong></label>
                            <input id="busquedaUsuario" v-model="busquedaUsuario" type="text" class="form-control"
                                placeholder="Correo o número de documento" />
                        </div>

                        <ul v-if="conveniosTabs.length" class="nav nav-tabs convenios-usuarios-tabs flex-wrap" role="tablist">
                            <li
                                v-for="conv in conveniosTabs"
                                :key="`tab-conv-${conv}`"
                                class="nav-item"
                                role="presentation"
                            >
                                <button
                                    type="button"
                                    class="nav-link"
                                    :class="{ active: convenioSeleccionado === conv }"
                                    @click="seleccionarConvenioTab(conv)"
                                >
                                    <i
                                        :class="conv === 'sin-convenio' ? 'bi bi-shield-check' : 'bi bi-building'"
                                        class="me-1"
                                    ></i>
                                    {{ etiquetaConvenioTab(conv) }}
                                    <span
                                        class="badge rounded-pill ms-1"
                                        :class="convenioSeleccionado === conv ? 'bg-primary' : 'bg-secondary'"
                                    >
                                        {{ contarUsuariosTabConvenio(conv) }}
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    <!-- Acciones masivas -->
                    <div v-if="usuariosSeleccionadosIds.length > 0" class="bulk-actions-bar mb-3 p-3 border rounded">
                        <div class="d-flex flex-wrap align-items-center gap-2 justify-content-between">
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <span class="badge bg-primary">
                                    {{ usuariosSeleccionadosIds.length }} seleccionado{{ usuariosSeleccionadosIds.length === 1 ? '' : 's' }}
                                </span>
                                <button type="button" class="btn btn-sm btn-outline-secondary" @click="limpiarSeleccionUsuarios">
                                    Limpiar selección
                                </button>
                            </div>
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    class="btn btn-sm btn-warning"
                                    :disabled="loadingBulk"
                                    @click="aplicarAccionMasivaActivo(false)"
                                    title="Deshabilitar usuarios seleccionados"
                                >
                                    <i class="bi bi-person-x-fill"></i> Deshabilitar
                                </button>
                                <button
                                    type="button"
                                    class="btn btn-sm btn-success"
                                    :disabled="loadingBulk"
                                    @click="aplicarAccionMasivaActivo(true)"
                                    title="Habilitar usuarios seleccionados"
                                >
                                    <i class="bi bi-person-check-fill"></i> Habilitar
                                </button>
                                <div class="input-group input-group-sm bulk-grupo-input">
                                    <input
                                        v-model="bulkGrupoValor"
                                        type="text"
                                        class="form-control"
                                        placeholder="Nuevo grupo (ej: 1 o 1,2)"
                                        :disabled="loadingBulk"
                                        @keyup.enter="aplicarAccionMasivaGrupo"
                                    />
                                    <button
                                        type="button"
                                        class="btn btn-outline-primary"
                                        :disabled="loadingBulk || !String(bulkGrupoValor || '').trim()"
                                        @click="aplicarAccionMasivaGrupo"
                                    >
                                        <i class="bi bi-people-fill"></i> Cambiar grupo
                                    </button>
                                </div>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-2" v-if="loadingBulk">
                            Procesando {{ bulkProgresoActual }} de {{ bulkProgresoTotal }}...
                        </small>
                    </div>

                    <div class="usuarios-container">
                        <!-- Spinner de carga -->
                        <div v-if="loadingUsers" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p class="text-muted mt-2">Cargando usuarios...</p>
                        </div>

                        <!-- Mostrar mensaje si no hay usuarios -->
                        <div v-else-if="!users || users.length === 0" class="alert alert-warning">
                            No hay usuarios registrados en el sistema.
                        </div>

                        <!-- Contenido del convenio activo -->
                        <div v-else-if="!loadingUsers" class="convenio-tab-content">
                            <div v-if="!convenioSeleccionado || !gruposConvenioActivo" class="alert alert-info">
                                Seleccione un convenio para ver sus usuarios.
                            </div>
                            <div v-else-if="Object.keys(gruposConvenioActivo).length === 0" class="alert alert-info">
                                No se encontraron usuarios en
                                <strong>{{ etiquetaConvenioTab(convenioSeleccionado) }}</strong>
                                con el correo o documento ingresado.
                            </div>
                            <template v-else>
                            <div class="convenio-section mb-4">
                                <div class="convenio-header">
                                    <span class="convenio-title">
                                        <i :class="convenioSeleccionado === 'sin-convenio' ? 'bi bi-shield-check' : 'bi bi-building'"
                                            class="me-2"></i>
                                        {{ etiquetaConvenioTab(convenioSeleccionado) }}
                                    </span>
                                    <span class="convenio-count">{{ contarUsuariosConvenio(gruposConvenioActivo) }}</span>
                                </div>

                                <!-- Acordeón con grupos colapsables -->
                                <div class="accordion" :id="'accordion-' + sanitizeId(convenioSeleccionado)">
                                    <div v-for="grupo in ordenarGruposConvenio(gruposConvenioActivo)"
                                        :key="`${convenioSeleccionado}-${grupo}`"
                                        class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button
                                                class="accordion-button collapsed"
                                                type="button"
                                                data-bs-toggle="collapse"
                                                :data-bs-parent="'#accordion-' + sanitizeId(convenioSeleccionado)"
                                                :data-bs-target="'#collapse-' + sanitizeId(convenioSeleccionado) + '-' + sanitizeId(grupo)"
                                                :aria-controls="'collapse-' + sanitizeId(convenioSeleccionado) + '-' + sanitizeId(grupo)"
                                                aria-expanded="false"
                                            >
                                                <i class="bi bi-people-fill me-2"></i>
                                                <span class="grupo-title-text">
                                                    {{ etiquetaGrupoListado(grupo) }}
                                                </span>
                                                <span class="ms-auto grupo-count">{{ gruposConvenioActivo[grupo].length }}</span>
                                            </button>
                                        </h2>
                                        <div
                                            :id="'collapse-' + sanitizeId(convenioSeleccionado) + '-' + sanitizeId(grupo)"
                                            class="accordion-collapse collapse"
                                            :data-bs-parent="'#accordion-' + sanitizeId(convenioSeleccionado)"
                                        >
                                            <div class="accordion-body p-0">
                                                <div class="tabla-usuarios">
                                                    <table class="table table-sm table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th class="text-center col-check">
                                                                    <input
                                                                        type="checkbox"
                                                                        class="form-check-input"
                                                                        :checked="grupoEstaSeleccionadoCompleto(gruposConvenioActivo[grupo])"
                                                                        :indeterminate="grupoEstaParcialmenteSeleccionado(gruposConvenioActivo[grupo])"
                                                                        @change="toggleSeleccionGrupo(gruposConvenioActivo[grupo], $event.target.checked)"
                                                                        :title="'Seleccionar grupo ' + grupo"
                                                                    />
                                                                </th>
                                                                <th>Nombre</th>
                                                                <th>Cargo</th>
                                                                <th>Email</th>
                                                                <th>Documento</th>
                                                                <th>Fin contrato</th>
                                                                <th>Grupos</th>
                                                                <th title="Tiene profesionales delegados">Delegados</th>
                                                                <th>Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="user in gruposConvenioActivo[grupo]" :key="user.uid || user.id || user.numDocumento"
                                                                :class="[
                                                                    'cargo-' + getCargoClass(user.cargo),
                                                                    { 'usuario-inactivo': esUsuarioInactivo(user), 'usuario-seleccionado': estaUsuarioSeleccionado(user) }
                                                                ]">
                                                                <td class="text-center col-check">
                                                                    <input
                                                                        type="checkbox"
                                                                        class="form-check-input"
                                                                        :checked="estaUsuarioSeleccionado(user)"
                                                                        @change="toggleSeleccionUsuario(user, $event.target.checked)"
                                                                    />
                                                                </td>
                                                                <td>
                                                                    {{ user.nombre }}
                                                                    <span v-if="esUsuarioInactivo(user)" class="badge bg-secondary ms-1">Inactivo</span>
                                                                </td>
                                                                <td>
                                                                    <span class="badge"
                                                                        :class="getCargoColorClass(user.cargo)">
                                                                        {{ getCargoShortName(user.cargo) }}
                                                                    </span>
                                                                </td>
                                                                <td class="small">{{ user.email }}</td>
                                                                <td class="small text-muted">{{ user.numDocumento ||
                                                                    'N/A' }}
                                                                </td>
                                                                <td class="small">{{ formatearFechaFinContrato(user.fechaFinContrato) }}</td>
                                                                <td class="small">
                                                                    <span
                                                                        v-if="esFacturadorCargo(user.cargo)"
                                                                        class="badge bg-info-subtle text-dark border"
                                                                        :title="'Grupos asignados: ' + mostrarGruposUsuario(user)"
                                                                    >
                                                                        {{ mostrarGruposUsuario(user) }}
                                                                    </span>
                                                                    <span v-else-if="mostrarGruposUsuario(user) !== '—'">
                                                                        {{ mostrarGruposUsuario(user) }}
                                                                    </span>
                                                                    <span v-else class="text-muted">—</span>
                                                                </td>
                                                                <td class="text-center">
                                                                    <span
                                                                        v-if="!esFacturadorCargo(user.cargo) && Array.isArray(user.accesosProfesionales) && user.accesosProfesionales.length > 0"
                                                                        class="badge bg-success"
                                                                        :title="user.accesosProfesionales.length + ' profesional(es) delegado(s)'"
                                                                    >
                                                                        <i class="bi bi-people-fill me-1"></i>{{ user.accesosProfesionales.length }}
                                                                    </span>
                                                                    <span v-else class="text-muted small">—</span>
                                                                </td>
                                                                <td class="acciones-cell text-nowrap">
                                                                    <button class="btn btn-sm btn-primary me-1"
                                                                        @click="abrirModalEdicion(user)"
                                                                        title="Editar usuario">
                                                                        <i class="bi bi-pencil-fill"></i>
                                                                    </button>
                                                                    <button
                                                                        v-if="isAdmin || isSuperUser"
                                                                        :class="['btn btn-sm me-1', estaUsuarioBloqueado(user) ? 'btn-danger' : 'btn-success']"
                                                                        @click="resetPassword(user)"
                                                                        :title="estaUsuarioBloqueado(user) ? 'Desbloquear y generar contraseña temporal' : 'Generar contraseña temporal'"
                                                                    >
                                                                        <i :class="estaUsuarioBloqueado(user) ? 'bi bi-lock-fill' : 'bi bi-unlock-fill'"></i>
                                                                    </button>
                                                                    <button class="btn btn-sm btn-danger"
                                                                        @click="deleteUser(user)"
                                                                        title="Eliminar usuario">
                                                                        <i class="bi bi-trash-fill"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Modal de Edición de Usuario -->
                <div v-if="mostrarModalEdicion" class="modal-overlay" @click="cerrarModalEdicion">
                    <div class="modal-content" @click.stop>
                        <div class="modal-header-custom">
                            <h5>Editar Usuario</h5>
                            <button type="button" class="btn-close" @click="cerrarModalEdicion"></button>
                        </div>
                        <div class="modal-body-custom">
                            <div v-if="editError" class="alert alert-danger py-2">{{ editError }}</div>
                            <form @submit.prevent="guardarCambiosUsuario">
                                <div class="row">
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editConvenio">IPS / Programa</label>
                                        <select id="editConvenio" v-model="editConvenio" class="form-select">
                                            <option v-for="conv in conveniosPrograma" :key="`edit-conv-${conv}`" :value="conv">
                                                {{ conv }}
                                            </option>
                                            <option value="sin-convenio">Usuarios Administrativos</option>
                                        </select>
                                    </div>
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editCargo">Cargo</label>
                                        <select id="editCargo" v-model="editCargo" class="form-select">
                                            <option value="Auxiliar de enfermeria">Auxiliar</option>
                                            <option value="Medico">Medico</option>
                                            <option value="Enfermero">Enfermero</option>
                                            <option v-if="editConvenio === 'E Basicos'" value="Psicologo">Psicologo</option>
                                            <option v-if="editConvenio === 'E Basicos'" value="Tsocial">Trabajador social</option>
                                            <option v-if="editConvenio === 'PIC'" value="Psicologo">Psicologo</option>
                                            <option v-if="editConvenio === 'PIC'" value="Tsocial">Trabajador social</option>
                                            <option v-if="editConvenio === 'PIC'" value="Nutricionista">Nutricionista</option>
                                            <option v-if="editConvenio === 'Unidesa'" value="Higienista oral">Higienista oral</option>
                                            <option value="Fact">Facturador</option>
                                            <option value="admin">--Administrador--</option>
                                        </select>
                                    </div>
                                    <div class="col col-12 mb-3">
                                        <label for="editNombre">Nombre Completo</label>
                                        <input type="text" id="editNombre" v-model="editNombre" class="form-control"
                                            required />
                                    </div>
                                    <div class="col col-12 mb-3">
                                        <label for="editEmail">Email</label>
                                        <input type="email" id="editEmail" v-model="editEmail" class="form-control"
                                            disabled readonly />
                                    </div>
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editNumDocumento">Número de Documento</label>
                                        <input type="text" id="editNumDocumento" v-model="editNumDocumento"
                                            class="form-control" disabled readonly />
                                    </div>
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editTelefono">Número de teléfono</label>
                                        <input type="tel" id="editTelefono" v-model="editTelefono"
                                            class="form-control" placeholder="Ej: 3001234567" />
                                    </div>
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editFechaFinContrato">Fecha de finalización de contrato</label>
                                        <input
                                            type="date"
                                            id="editFechaFinContrato"
                                            v-model="editFechaFinContrato"
                                            class="form-control"
                                            :disabled="editSinFechaFinContrato"
                                            @input="onEditFechaFinContratoInput"
                                        />
                                        <div class="form-check mt-2">
                                            <input
                                                class="form-check-input"
                                                type="checkbox"
                                                id="editSinFechaFinContrato"
                                                v-model="editSinFechaFinContrato"
                                                @change="onToggleSinFechaFinContrato"
                                            />
                                            <label class="form-check-label" for="editSinFechaFinContrato">
                                                Sin fecha de finalización (dejar vacío)
                                            </label>
                                        </div>
                                        <small class="text-muted d-block mt-1">
                                            Si marca esta opción, el usuario podrá ingresar sin validar vigencia de contrato.
                                        </small>
                                    </div>
                                    <div class="col col-12 col-md-6 mb-3" v-if="
                                        editCargo === 'Auxiliar de enfermeria' ||
                                        editCargo === 'Enfermero' ||
                                        editCargo === 'Medico' ||
                                        editCargo === 'Psicologo' ||
                                        editCargo === 'Tsocial' ||
                                        editCargo === 'Nutricionista' ||
                                        editCargo === 'Higienista oral'
                                    ">
                                        <label for="editGrupo"># Grupo(s)</label>
                                        <input type="text" id="editGrupo" v-model="editGrupo" class="form-control"
                                            placeholder="Ej: 1,2,F" />
                                    </div>
                                    <div class="col col-12 mb-3" v-if="editCargo === 'Fact'">
                                        <label class="form-label">Grupos asignados</label>
                                        <div class="grupos-facturador-panel border rounded p-2">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="editGrupoFactTodos"
                                                    :checked="facturadorSeleccionoTodos(editGrupo)"
                                                    @change="toggleGrupoFacturador('todos', 'edit')" />
                                                <label class="form-check-label" for="editGrupoFactTodos">Todos</label>
                                            </div>
                                            <p v-if="gruposFacturadorDisponibles('edit').length === 0" class="small text-muted mb-2">
                                                No hay grupos operativos en el convenio seleccionado. Desmarque "Todos" solo cuando existan profesionales con grupo en ese convenio.
                                            </p>
                                            <div v-for="grupoItem in gruposFacturadorDisponibles('edit')" :key="`edit-fact-grupo-${grupoItem}`"
                                                class="form-check">
                                                <input class="form-check-input" type="checkbox"
                                                    :id="`edit-fact-grupo-${grupoItem}`"
                                                    :checked="gruposFacturadorSeleccionados(editGrupo).includes(grupoItem)"
                                                    :disabled="facturadorSeleccionoTodos(editGrupo)"
                                                    @change="toggleGrupoFacturador(grupoItem, 'edit')" />
                                                <label class="form-check-label" :for="`edit-fact-grupo-${grupoItem}`">
                                                    Grupo {{ grupoItem }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="isAdmin && editCargo !== 'Fact'" class="col col-12 mb-3">
                                        <div class="accordion accordion-delegados" id="accordion-delegados-edit">
                                            <div class="accordion-item">
                                                <h2 class="accordion-header">
                                                    <button
                                                        class="accordion-button collapsed"
                                                        type="button"
                                                        data-bs-toggle="collapse"
                                                        data-bs-target="#collapse-delegados-edit"
                                                        data-bs-parent="#accordion-delegados-edit"
                                                        aria-expanded="false"
                                                        aria-controls="collapse-delegados-edit"
                                                    >
                                                        <i class="bi bi-people-fill me-2"></i>
                                                        Profesionales Delegados
                                                        <span
                                                            v-if="editAccesosProfesionales.length"
                                                            class="badge bg-primary ms-2"
                                                        >
                                                            {{ editAccesosProfesionales.length }}
                                                        </span>
                                                    </button>
                                                </h2>
                                                <div
                                                    id="collapse-delegados-edit"
                                                    class="accordion-collapse collapse"
                                                    data-bs-parent="#accordion-delegados-edit"
                                                >
                                                    <div class="accordion-body pt-2">
                                        <div class="row g-2 mb-2">
                                            <div class="col-12 col-md-4">
                                                <label class="form-label mb-1">Filtrar por convenio</label>
                                                <select v-model="filtroAccesoConvenio" class="form-select form-select-sm">
                                                    <option value="">Todos los convenios</option>
                                                    <option v-for="conv in conveniosDisponiblesAcceso" :key="`conv-acceso-${conv}`" :value="conv">
                                                        {{ conv }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col-12 col-md-4">
                                                <label class="form-label mb-1">Filtrar por cargo</label>
                                                <select v-model="filtroAccesoCargo" class="form-select form-select-sm">
                                                    <option value="">Todos los cargos</option>
                                                    <option v-for="cargo in cargosDisponiblesAcceso" :key="`cargo-acceso-${cargo}`" :value="cargo">
                                                        {{ cargo }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col-12 col-md-4">
                                                <label class="form-label mb-1">Buscar</label>
                                                <input
                                                    v-model="filtroAccesoTexto"
                                                    type="text"
                                                    class="form-control form-control-sm"
                                                    placeholder="Nombre o documento"
                                                />
                                            </div>
                                        </div>
                                        <div class="d-flex gap-2 mb-2">
                                            <button type="button" class="btn btn-sm btn-outline-primary" @click="seleccionarTodosAccesosFiltrados">
                                                Seleccionar filtrados
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-secondary" @click="limpiarSeleccionAccesosFiltrados">
                                                Quitar filtrados
                                            </button>
                                            <span class="small text-muted align-self-center">
                                                {{ profesionalesDisponiblesParaAccesoFiltrados.length }} visibles / {{ profesionalesDisponiblesParaAcceso.length }} totales
                                            </span>
                                        </div>
                                        <ul class="list-group" style="max-height: 280px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 0.375rem;">
                                            <li
                                                v-if="profesionalesDisponiblesParaAccesoFiltrados.length === 0"
                                                class="list-group-item text-muted small text-center py-3"
                                            >
                                                Sin profesionales para mostrar
                                            </li>
                                            <li
                                                v-for="prof in profesionalesDisponiblesParaAccesoFiltrados"
                                                :key="`prof-acceso-${prof.id}`"
                                                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3"
                                                style="cursor: pointer;"
                                                :class="{ 'list-group-item-primary': editAccesosProfesionales.includes(String(prof.numDocumento || '').trim()) }"
                                                @click="toggleAccesoProfesional(String(prof.numDocumento || '').trim())"
                                            >
                                                <div>
                                                    <span class="fw-semibold">{{ prof.nombre }}</span>
                                                    <small class="text-muted ms-2">{{ prof.numDocumento }}</small>
                                                </div>
                                                <div class="d-flex align-items-center gap-2">
                                                    <span class="badge" :class="getCargoColorClass(prof.cargo)">{{ prof.cargo }}</span>
                                                    <i
                                                        class="bi"
                                                        :class="editAccesosProfesionales.includes(String(prof.numDocumento || '').trim()) ? 'bi-check-circle-fill text-primary' : 'bi-circle text-muted'"
                                                    ></i>
                                                </div>
                                            </li>
                                        </ul>
                                        <div class="mt-3">
                                            <label class="form-label mb-1">Profesionales asignados actualmente</label>
                                            <ul class="list-group" style="max-height: 180px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 0.375rem;">
                                                <li
                                                    v-if="profesionalesAsignadosAcceso.length === 0"
                                                    class="list-group-item text-muted small text-center py-2"
                                                >
                                                    No hay profesionales asignados
                                                </li>
                                                <li
                                                    v-for="prof in profesionalesAsignadosAcceso"
                                                    :key="`prof-asignado-${prof.id}`"
                                                    class="list-group-item d-flex justify-content-between align-items-center py-2"
                                                >
                                                    <div>
                                                        <span class="fw-semibold">{{ prof.nombre }}</span>
                                                        <small class="text-muted ms-2">{{ prof.numDocumento }} - {{ prof.cargo }}</small>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        class="btn btn-sm btn-outline-danger"
                                                        @click="quitarAccesoProfesional(String(prof.numDocumento || '').trim())"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <small class="text-muted d-block mt-1">
                                            Este usuario solo podrá ver el estado de los profesionales marcados.
                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="alert alert-info mt-3">
                                    <small><strong>Nota:</strong> El correo no es editable desde este formulario. Solo
                                        se actualizarán los demás datos.</small>
                                </div>
                                <button type="submit" :disabled="loading" class="btn btn-primary">
                                    {{ loading ? "Guardando..." : "Guardar Cambios" }}
                                </button>
                                <button type="button" @click="cerrarModalEdicion" class="btn btn-secondary ms-2">
                                    Cancelar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab"
                    tabindex="0">
                    <div class="crear-usuarios-panel mt-3">
                        <ul class="nav nav-tabs crear-subtabs mb-3" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button
                                    type="button"
                                    class="nav-link"
                                    :class="{ active: crearSubTab === 'individual' }"
                                    @click="crearSubTab = 'individual'"
                                >
                                    <i class="bi bi-person-plus me-1"></i> Individual
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button
                                    type="button"
                                    class="nav-link"
                                    :class="{ active: crearSubTab === 'masiva' }"
                                    @click="crearSubTab = 'masiva'"
                                >
                                    <i class="bi bi-filetype-csv me-1"></i> Carga masiva
                                </button>
                            </li>
                        </ul>

                        <!-- Subtab: creación individual -->
                        <div v-show="crearSubTab === 'individual'" class="crear-subpanel">
                            <form @submit.prevent="createUserByAdmin" :class="['form-convenio-wrapper', convenioFormClass]">
                                <h1 class="display-6 mb-2">Crear usuario</h1>
                                <p class="text-muted mb-3">
                                    Registra un usuario a la vez. Completa los campos obligatorios y verifica documento y correo antes de guardar.
                                </p>

                                <!-- Selector de IPS (solo visible para el superusuario) -->
                                <div v-if="isSuperUser" class="alert alert-primary border border-primary mb-3">
                                    <label class="form-label fw-bold mb-1">
                                        <i class="bi bi-hospital me-1"></i> IPS a la que pertenecerá el usuario
                                    </label>
                                    <input
                                        type="text"
                                        v-model="ipsSearch"
                                        class="form-control mb-2"
                                        placeholder="Filtrar IPS por nombre o ID..."
                                        autocomplete="off"
                                    />
                                    <select v-model="selectedIpsId" class="form-select" :class="{ 'is-invalid': isAdmin && !selectedIpsId && formularioIntentado }">
                                        <option value="" disabled>— Seleccione una IPS —</option>
                                        <option v-for="ips in ipsListFiltrada" :key="ips.id" :value="ips.id">
                                            {{ ips.nombre || ips.name || ips.id }}
                                        </option>
                                    </select>
                                    <div class="invalid-feedback" v-if="isAdmin && !selectedIpsId && formularioIntentado">
                                        Debes seleccionar una IPS para el nuevo usuario.
                                    </div>
                                    <small class="text-muted mt-1 d-block" v-if="!selectedIpsId">
                                        Campo obligatorio — el usuario quedará asociado a la IPS seleccionada.
                                    </small>
                                    <small class="text-success mt-1 d-block" v-else>
                                        <i class="bi bi-check-circle-fill"></i>
                                        IPS seleccionada: <strong>{{ ipsNombreSeleccionada }}</strong>
                                    </small>
                                </div>

                                <div class="row">
                                    <div class="col col-12 col-md-4 mb-3">
                                        <label for="convenio">IPS / Programa</label>
                                        <select id="convenio" v-model="convenio" class="form-select" required @change="onConvenioChange">
                                            <option value="">Seleccione una opción</option>
                                            <option v-for="conv in conveniosPrograma" :key="`create-conv-${conv}`" :value="conv">
                                                {{ conv }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col col-12 col-md-4 mb-3">
                                        <label for="ips">Cargo</label>
                                        <select id="rol" v-model="cargo" class="form-select" required>
                                            <option value="Auxiliar de enfermeria">Auxiliar</option>
                                            <option value="Enfermero">Enfermero</option>
                                            <option value="Medico">Medico</option>
                                            <option value="Fact">Facturador</option>
                                            <option v-if="convenio === 'E Basicos'" value="Psicologo">Psicologo</option>
                                            <option v-if="convenio === 'E Basicos'" value="Tsocial">Trabajador social</option>
                                            <option v-if="convenio === 'PIC'" value="Psicologo">Psicologo</option>
                                            <option v-if="convenio === 'PIC'" value="Tsocial">Trabajador social</option>
                                            <option v-if="convenio === 'PIC'" value="Nutricionista">Nutricionista</option>
                                            <option v-if="convenio === 'Unidesa'" value="Higienista oral">Higienista oral</option>
                                        </select>
                                    </div>
                                    <div class="col col-12 col-md-4 mb-3">
                                        <label for="numDocumento">Número de Documento:</label>
                                        <div class="input-group">
                                            <input type="text" id="numDocumento" v-model="numDocumento"
                                                @blur="verificarDocumento" class="form-control"
                                                :class="{ 'is-valid': documentoValido === true, 'is-invalid': documentoValido === false }"
                                                required />
                                            <span class="input-group-text" v-if="verificandoDocumento">
                                                <span class="mini-progress" role="progressbar" aria-label="Verificando documento">
                                                    <span class="mini-progress-bar"></span>
                                                </span>
                                            </span>
                                            <span class="input-group-text" v-else-if="documentoValido === true">
                                                <i class="bi bi-check-circle-fill text-success"></i>
                                            </span>
                                            <span class="input-group-text" v-else-if="documentoValido === false">
                                                <i class="bi bi-x-circle-fill text-danger"></i>
                                            </span>
                                        </div>
                                        <div class="valid-feedback" v-if="documentoValido === true">
                                            Documento disponible
                                        </div>
                                        <div class="invalid-feedback" v-if="documentoValido === false">
                                            Este documento ya está registrado
                                        </div>
                                    </div>
                                    <div class="col col-12 col-md-4 mb-3">
                                        <label for="email">Email del Usuario:</label>
                                        <div class="input-group">
                                            <input type="email" id="email" v-model="userEmail" @blur="verificarEmail"
                                                class="form-control"
                                                :class="{ 'is-valid': emailValido === true, 'is-invalid': emailValido === false }"
                                                required />
                                            <span class="input-group-text" v-if="verificandoEmail">
                                                <span class="mini-progress" role="progressbar" aria-label="Verificando correo">
                                                    <span class="mini-progress-bar"></span>
                                                </span>
                                            </span>
                                            <span class="input-group-text" v-else-if="emailValido === true">
                                                <i class="bi bi-check-circle-fill text-success"></i>
                                            </span>
                                            <span class="input-group-text" v-else-if="emailValido === false">
                                                <i class="bi bi-x-circle-fill text-danger"></i>
                                            </span>
                                        </div>
                                        <div class="valid-feedback" v-if="emailValido === true">
                                            Email disponible
                                        </div>
                                        <div class="invalid-feedback" v-if="emailValido === false">
                                            Este email ya está registrado
                                        </div>
                                    </div>
                                    <div class="col col-12 col-md-4">
                                        <label for="nombre">Nombre Completo:</label>
                                        <input type="text" id="nombre" v-model="nombre" required />
                                    </div>
                                    <div class="col col-12 col-md-4 mb-3">
                                        <label for="telefono">Número de teléfono:</label>
                                        <input type="tel" id="telefono" v-model="telefono" class="form-control"
                                            placeholder="Ej: 3001234567" />
                                    </div>
                                    <div class="col col-12 col-md-4 mb-3">
                                        <label for="fechaFinContrato">Fecha de finalización de contrato:</label>
                                        <input type="date" id="fechaFinContrato" v-model="fechaFinContrato" class="form-control" />
                                    </div>

                                    <div class="col col-12 col-md-4 mb-3" v-if="
                                        cargo === 'Auxiliar de enfermeria' ||
                                        cargo === 'Enfermero' ||
                                        cargo === 'Medico' ||
                                        cargo === 'Psicologo' ||
                                        cargo === 'Tsocial' ||
                                        cargo === 'Nutricionista' ||
                                        cargo === 'Higienista oral'
                                    ">
                                        <label for="grupo"># Grupo(s)</label>
                                        <input type="text" id="grupo" v-model="grupo" placeholder="Ej: 1,2,F" required />
                                    </div>
                                    <div class="col col-12 mb-3" v-if="cargo === 'Fact'">
                                        <label class="form-label">Grupos asignados</label>
                                        <div class="grupos-facturador-panel border rounded p-2">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="grupoFactTodos"
                                                    :checked="facturadorSeleccionoTodos(grupo)"
                                                    @change="toggleGrupoFacturador('todos', 'create')" />
                                                <label class="form-check-label" for="grupoFactTodos">Todos</label>
                                            </div>
                                            <p v-if="gruposFacturadorDisponibles('create').length === 0" class="small text-muted mb-2">
                                                No hay grupos operativos en el convenio seleccionado. Puede dejar "Todos" o crear profesionales con grupo en ese convenio.
                                            </p>
                                            <div v-for="grupoItem in gruposFacturadorDisponibles('create')" :key="`fact-grupo-${grupoItem}`"
                                                class="form-check">
                                                <input class="form-check-input" type="checkbox" :id="`fact-grupo-${grupoItem}`"
                                                    :checked="gruposFacturadorSeleccionados(grupo).includes(grupoItem)"
                                                    :disabled="facturadorSeleccionoTodos(grupo)"
                                                    @change="toggleGrupoFacturador(grupoItem, 'create')" />
                                                <label class="form-check-label" :for="`fact-grupo-${grupoItem}`">
                                                    Grupo {{ grupoItem }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" :disabled="loading || !formularioValido" class="btn btn-warning">
                                    {{ loading ? "Creando..." : "Crear Usuario y Enviar Enlace de Contraseña" }}
                                </button>
                                <small class="text-muted ms-2" v-if="!formularioValido">
                                    * Completa todos los campos requeridos y verifica que documento y email sean válidos
                                </small>
                            </form>
                        </div>

                        <!-- Subtab: carga masiva CSV -->
                        <div v-show="crearSubTab === 'masiva'" class="crear-subpanel">
                            <div class="p-3 p-md-4 border rounded bg-light">
                                <h2 class="h4 mb-2">
                                    <i class="bi bi-upload"></i> Carga masiva de usuarios por CSV
                                </h2>
                                <p class="text-muted mb-3">
                                    Ideal para registrar varios usuarios de una sola vez. Descarga o arma un CSV con los encabezados indicados, cárgalo y revisa la vista previa antes de confirmar.
                                </p>

                                <div class="mb-3">
                                    <label class="form-label fw-bold mb-1">
                                        {{ isSuperUser
                                            ? 'Superusuario: cada fila debe indicar su IPS en la columna idips.'
                                            : 'Los usuarios cargados quedarán asociados a la IPS de tu sesión:' }}
                                        <span v-if="!isSuperUser" class="text-primary">
                                            {{ $store?.state?.userData?.ipsId ? $store.state.userData.ipsId : 'No disponible' }}
                                        </span>
                                    </label>
                                    <div v-if="!isSuperUser && !$store?.state?.userData?.ipsId" class="alert alert-danger mt-2 mb-0">
                                        No se detectó una IPS válida en tu sesión. No podrás cargar usuarios masivamente.
                                    </div>
                                </div>

                                <div class="alert alert-info small mb-3">
                                    <strong>Instrucciones rápidas</strong>
                                    <ul class="mb-0 mt-2">
                                        <li>
                                            Encabezados exactos requeridos:
                                            <code>Nombre</code>, <code>Email</code>, <code>Cargo</code>,
                                            <code>Grupo</code>, <code>Convenio</code>, <code>Documento</code>.
                                        </li>
                                        <li>
                                            Opcionales: <code>Telefono</code>, <code>FechaFinContrato</code>
                                            (<span v-if="isSuperUser">; <code>idips</code> es <strong>obligatorio</strong></span>
                                            <span v-else>; <code>idips</code> es opcional (se usa la IPS de sesión)</span>.
                                        </li>
                                        <li>Separador recomendado: coma (<code>,</code>). Codificación UTF-8 o Windows-1252.</li>
                                        <li>La contraseña inicial del usuario será su número de documento.</li>
                                        <li>Si el documento o el email ya existen, el registro se <strong>salta</strong> y queda en el informe final.</li>
                                    </ul>
                                </div>

                                <h3 class="h6 mb-2">Valores aceptados</h3>
                                <ul class="small text-muted mb-3">
                                    <li><strong>Cargo:</strong> Auxiliar de enfermeria, Enfermero, Medico, Fact, Psicologo, Tsocial, Nutricionista, Higienista oral.</li>
                                    <li><strong>Convenio:</strong> Extramural, E Basicos, PIC, Unidesa.</li>
                                    <li><strong>Grupo:</strong> número(s) operativos (<code>1</code> o <code>1,2</code>). Para facturadores use <code>F</code> (todos) o grupos específicos.</li>
                                    <li><strong>FechaFinContrato:</strong> <code>YYYY-MM-DD</code> o <code>DD/MM/YYYY</code>.</li>
                                </ul>

                                <h3 class="h6 mb-2">Ejemplo de columnas</h3>
                                <div class="table-responsive mb-3">
                                    <table class="table table-bordered table-sm align-middle mb-0 bg-white">
                                        <thead class="table-secondary">
                                            <tr>
                                                <th>Nombre <span class="text-danger">*</span></th>
                                                <th>Email <span class="text-danger">*</span></th>
                                                <th>Cargo <span class="text-danger">*</span></th>
                                                <th>Grupo <span class="text-danger">*</span></th>
                                                <th>Convenio <span class="text-danger">*</span></th>
                                                <th>Documento <span class="text-danger">*</span></th>
                                                <th>Telefono</th>
                                                <th>FechaFinContrato</th>
                                                <th v-if="isSuperUser">idips <span class="text-danger">*</span></th>
                                                <th v-else>idips <span class="text-muted">(opcional)</span></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Juan Pérez</td>
                                                <td>juan@email.com</td>
                                                <td>Medico</td>
                                                <td>1</td>
                                                <td>PIC</td>
                                                <td>12345678</td>
                                                <td>3001234567</td>
                                                <td>2026-12-31</td>
                                                <td>{{ isSuperUser ? 'ips_001' : '—' }}</td>
                                            </tr>
                                            <tr>
                                                <td>Ana Gómez</td>
                                                <td>ana@email.com</td>
                                                <td>Fact</td>
                                                <td>F</td>
                                                <td>Unidesa</td>
                                                <td>87654321</td>
                                                <td>3109876543</td>
                                                <td>31/12/2026</td>
                                                <td>{{ isSuperUser ? 'ips_001' : '—' }}</td>
                                            </tr>
                                            <tr>
                                                <td>Luis Rojas</td>
                                                <td>luis@email.com</td>
                                                <td>Higienista oral</td>
                                                <td>2</td>
                                                <td>Unidesa</td>
                                                <td>11223344</td>
                                                <td>3201112233</td>
                                                <td>2027-06-30</td>
                                                <td>{{ isSuperUser ? 'ips_002' : '—' }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <label class="form-label fw-semibold">Archivo CSV</label>
                                <input type="file" accept=".csv" @change="handleCsvUpload" class="form-control mb-2" />
                                <button
                                    class="btn btn-success"
                                    type="button"
                                    :disabled="!(csvUsers && csvUsers.length) || loadingCsv || (!isSuperUser && !$store?.state?.userData?.ipsId)"
                                    @click="enviarCsvUsuarios"
                                >
                                    <i class="bi bi-person-plus-fill"></i>
                                    {{ loadingCsv ? 'Procesando...' : 'Crear usuarios masivamente' }}
                                </button>

                                <div v-if="csvError" class="alert alert-danger mt-3 mb-0">{{ csvError }}</div>
                                <div v-if="csvSuccess" class="alert alert-success mt-3 mb-0">{{ csvSuccess }}</div>

                                <div v-if="csvInformeNoCreados && csvInformeNoCreados.length" class="mt-3">
                                    <div class="alert alert-warning mb-2">
                                        <strong>Informe de usuarios no creados:</strong>
                                        {{ csvInformeNoCreados.length }} registro(s) no se crearon (saltados o con error).
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table table-sm table-bordered align-middle bg-white">
                                            <thead class="table-warning">
                                                <tr>
                                                    <th>Fila</th>
                                                    <th>Nombre</th>
                                                    <th>Email</th>
                                                    <th>Documento</th>
                                                    <th>Estado</th>
                                                    <th>Descripción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(item, idx) in csvInformeNoCreados" :key="`csv-nocreado-${idx}`">
                                                    <td>{{ item.fila || '—' }}</td>
                                                    <td>{{ item.nombre || '—' }}</td>
                                                    <td>{{ item.email || '—' }}</td>
                                                    <td>{{ item.documento || '—' }}</td>
                                                    <td>
                                                        <span
                                                            class="badge"
                                                            :class="item.status === 'saltado' ? 'bg-warning text-dark' : 'bg-danger'"
                                                        >
                                                            {{ item.status === 'saltado' ? 'Saltado' : 'Error' }}
                                                        </span>
                                                    </td>
                                                    <td class="small">{{ item.motivo || item.error || 'Sin detalle' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div v-if="csvPreview && csvPreview.length" class="mt-3">
                                    <h6 class="mb-2">Vista previa de los primeros registros</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm table-striped bg-white mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Email</th>
                                                    <th>Cargo</th>
                                                    <th>Grupo</th>
                                                    <th>Convenio</th>
                                                    <th>Documento</th>
                                                    <th v-if="isSuperUser">idips</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(row, idx) in csvPreview" :key="idx">
                                                    <td>{{ row.Nombre }}</td>
                                                    <td>{{ row.Email }}</td>
                                                    <td>{{ row.Cargo }}</td>
                                                    <td>{{ row.Grupo }}</td>
                                                    <td>{{ row.Convenio }}</td>
                                                    <td>{{ row.Documento }}</td>
                                                    <td v-if="isSuperUser">{{ row.idips || '—' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
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
import Papa from "papaparse";
import { getCargoBadgeClass as getSharedCargoBadgeClass } from "@/utils/cargoBadges";
import {
    GRUPO_FACTURADOR_TODOS,
    normalizarGruposFacturador,
    obtenerGruposOperativosDesdeUsuarios,
    parseGruposUsuario,
    formatearGruposFacturador,
    facturadorSeleccionoTodosExplicito,
    facturadorVeTodosLosGrupos,
    validarGruposFacturador,
    esFacturadorCargo as esCargoFacturador,
} from "@/utils/grupoUtils";
import {
    bulkCreateUsers,
    createUser,
    deleteUserById,
    documentExists,
    emailExists,
    getAllUsers,
    unlockUserById,
    updateUserPasswordById,
    updateUser,
} from "@/api/usersApi";
import { formatApiError } from "@/utils/apiError";
import {
    mapActions
} from "vuex";
import { CONVENIOS_PROGRAMA, CONVENIO_FORM_CLASS } from "@/constants/convenios";

export default {
    data() {
        return {
            /*  Creación de usuario */
            userEmail: "",
            nombre: "",
            numDocumento: "",
            telefono: "",
            fechaFinContrato: "",
            grupo: "",
            cargo: "",
            convenio: "",
            conveniosPrograma: CONVENIOS_PROGRAMA,

            /* Modal de edición */
            mostrarModalEdicion: false,
            editError: "",
            usuarioEditando: null,
            editEmail: "",
            editNombre: "",
            editNumDocumento: "",
            editTelefono: "",
            editFechaFinContrato: "",
            editSinFechaFinContrato: false,
            editGrupo: "",
            editCargo: "",
            editConvenio: "",
            editAccesosProfesionales: [],
            filtroAccesoConvenio: "",
            filtroAccesoCargo: "",
            filtroAccesoTexto: "",

            /*  */
            loading: false,
            loadingUsers: false,
            message: "",
            messageType: "",
            messagePassword: "",
            users: [],
            ips: null,
            convenioSeleccionado: "",
            busquedaUsuario: "",

            /* Validación documento */
            verificandoDocumento: false,
            documentoValido: null,

            /* Validación email */
            verificandoEmail: false,
            emailValido: null,

            /* Multi-IPS: selector para el superusuario */
            isSuperUser: false,
            isAdmin: false,
            ipsList: [],
            ipsSearch: "",
            selectedIpsId: "",
            formularioIntentado: false,

            /* Filtro de IPS en el listado */
            filtroIpsId: "",
            filtroIpsSearch: "",

            /* Carga masiva de usuarios por CSV */
            crearSubTab: "individual",
            csvUsers: [],
            csvPreview: [],
            csvError: "",
            csvSuccess: "",
            csvInformeNoCreados: [],
            loadingCsv: false,

            /* Selección múltiple / acciones masivas */
            usuariosSeleccionadosIds: [],
            bulkGrupoValor: "",
            loadingBulk: false,
            bulkProgresoActual: 0,
            bulkProgresoTotal: 0,
        };
    },
    computed: {
        usuariosSeleccionados() {
            const ids = new Set(this.usuariosSeleccionadosIds);
            return (this.users || []).filter((user) => ids.has(this.obtenerIdUsuario(user)));
        },
        convenioFormClass() {
            return CONVENIO_FORM_CLASS[this.convenio] || "";
        },
        convenios() {
            if (!this.users || this.users.length === 0) return [];
            const convSet = new Set(this.users.map(u => u.convenio || 'sin-convenio'));
            return Array.from(convSet).sort();
        },

        conveniosTabs() {
            const presentes = new Set((this.users || []).map((u) => u.convenio || 'sin-convenio'));
            const ordenados = [];

            (this.conveniosPrograma || CONVENIOS_PROGRAMA).forEach((conv) => {
                if (presentes.has(conv)) ordenados.push(conv);
            });

            Array.from(presentes)
                .filter((conv) => conv !== 'sin-convenio' && !ordenados.includes(conv))
                .sort((a, b) => a.localeCompare(b, 'es'))
                .forEach((conv) => ordenados.push(conv));

            if (presentes.has('sin-convenio')) {
                ordenados.push('sin-convenio');
            }

            return ordenados;
        },

        gruposConvenioActivo() {
            if (!this.convenioSeleccionado) return null;
            return this.usuariosAgrupadosPorConvenioYGrupoFiltrado[this.convenioSeleccionado] || {};
        },

        usuariosPorConvenio() {
            if (!this.users || this.users.length === 0) return {};
            const resultado = {};
            this.users.forEach(user => {
                const conv = user.convenio || 'sin-convenio';
                resultado[conv] = (resultado[conv] || 0) + 1;
            });
            return resultado;
        },

        usuariosAgrupadosPorGrupo() {
            if (!this.users || this.users.length === 0) return {};

            const grupos = {};

            this.users.forEach(user => {
                const gruposUsuario = this.obtenerGruposUsuario(user);
                gruposUsuario.forEach((grupoKey) => {
                    if (!grupos[grupoKey]) {
                        grupos[grupoKey] = [];
                    }
                    grupos[grupoKey].push(user);
                });
            });

            // Ordenar usuarios dentro de cada grupo por nombre
            Object.keys(grupos).forEach(key => {
                grupos[key].sort((a, b) => a.nombre.localeCompare(b.nombre));
            });

            return grupos;
        },

        usuariosAgrupadosPorConvenioYGrupo() {
            if (!this.users || this.users.length === 0) return {};

            const resultado = {};

            // Agrupar usuarios por convenio y luego por grupo
            this.users.forEach(user => {
                const convenio = user.convenio || 'sin-convenio';
                const gruposUsuario = this.obtenerGruposUsuario(user);

                // Crear objeto de convenio si no existe
                if (!resultado[convenio]) {
                    resultado[convenio] = {};
                }

                gruposUsuario.forEach((grupo) => {
                    // Crear array de grupo si no existe
                    if (!resultado[convenio][grupo]) {
                        resultado[convenio][grupo] = [];
                    }

                    // Agregar usuario al grupo
                    resultado[convenio][grupo].push(user);
                });
            });

            // Ordenar usuarios dentro de cada grupo por nombre
            Object.keys(resultado).forEach(convenio => {
                Object.keys(resultado[convenio]).forEach(grupo => {
                    resultado[convenio][grupo].sort((a, b) => a.nombre.localeCompare(b.nombre));
                });
            });

            return resultado;
        },

        usuariosAgrupadosPorConvenioYGrupoFiltrado() {
            if (!this.users || this.users.length === 0) return {};

            const busqueda = (this.busquedaUsuario || '').trim().toLowerCase();

            const usuariosFiltrados = this.users.filter((user) => {
                // Filtro por IPS (solo para el superusuario)
                if (this.isSuperUser && this.filtroIpsId) {
                    const userIpsId = user.ipsId ?? user.ips_id ?? user.idips ?? null;
                    if (String(userIpsId || '').trim() !== this.filtroIpsId) return false;
                }

                if (!busqueda) return true;

                const email = (user.email || '').toLowerCase();
                const documento = (user.numDocumento || '').toString().toLowerCase();

                return email.includes(busqueda) || documento.includes(busqueda);
            });

            const resultado = {};

            usuariosFiltrados.forEach(user => {
                const convenio = user.convenio || 'sin-convenio';
                const gruposUsuario = this.obtenerGruposUsuario(user);

                if (!resultado[convenio]) {
                    resultado[convenio] = {};
                }

                gruposUsuario.forEach((grupo) => {
                    if (!resultado[convenio][grupo]) {
                        resultado[convenio][grupo] = [];
                    }

                    resultado[convenio][grupo].push(user);
                });
            });

            Object.keys(resultado).forEach(convenio => {
                Object.keys(resultado[convenio]).forEach(grupo => {
                    resultado[convenio][grupo].sort((a, b) => a.nombre.localeCompare(b.nombre));
                });
            });

            return resultado;
        },

        formularioValido() {
            const convenio = (this.convenio || '').trim();
            const cargo = (this.cargo || '').trim();
            const documento = (this.numDocumento || '').trim();
            const email = (this.userEmail || '').trim();
            const nombre = (this.nombre || '').trim();
            const grupo = this.normalizarGrupos(this.grupo);

            const requiereGrupo = this.cargoRequiereGrupo(cargo);
            const grupoFacturadorValido = !esCargoFacturador(cargo) || validarGruposFacturador(this.grupo).valid;

            // Verificar campos obligatorios básicos sin espacios en blanco
            const camposBasicos = convenio && cargo && documento && email && nombre;
            const grupoValido = (!requiereGrupo && !esCargoFacturador(cargo)) || (esCargoFacturador(cargo) ? grupoFacturadorValido : !!grupo);

            // El superusuario debe haber seleccionado una IPS
            const ipsValida = !this.isSuperUser || !!this.selectedIpsId;

            // Validación de unicidad contra listado local de usuarios
            const documentoDisponibleLista = !this.users?.some((user) =>
                String(user?.numDocumento ?? '').trim() === documento
            );
            const emailDisponibleLista = !this.users?.some((user) =>
                String(user?.email ?? '').trim().toLowerCase() === email.toLowerCase()
            );

            // Verificar validaciones de documento y email
            const validaciones = this.documentoValido === true &&
                this.emailValido === true;

            return !!(camposBasicos && grupoValido && ipsValida && documentoDisponibleLista && emailDisponibleLista && validaciones);
        },

        ipsListFiltrada() {
            const q = (this.ipsSearch || '').trim().toLowerCase();
            if (!q) return this.ipsList;
            return this.ipsList.filter((ips) => {
                const nombre = (ips.nombre || ips.name || '').toLowerCase();
                const id = (ips.id || '').toLowerCase();
                return nombre.includes(q) || id.includes(q);
            });
        },

        ipsNombreSeleccionada() {
            if (!this.selectedIpsId) return '';
            const found = this.ipsList.find((ips) => ips.id === this.selectedIpsId);
            return found ? (found.nombre || found.name || found.id) : this.selectedIpsId;
        },

        ipsListFiltradaParaFiltro() {
            const q = (this.filtroIpsSearch || '').trim().toLowerCase();
            if (!q) return this.ipsList;
            return this.ipsList.filter((ips) => {
                const nombre = (ips.nombre || ips.name || '').toLowerCase();
                const id = (ips.id || '').toLowerCase();
                return nombre.includes(q) || id.includes(q);
            });
        },

        ipsNombreFiltro() {
            if (!this.filtroIpsId) return '';
            const found = this.ipsList.find((ips) => ips.id === this.filtroIpsId);
            return found ? (found.nombre || found.name || found.id) : this.filtroIpsId;
        },
        cargosDisponiblesAcceso() {
            const cargos = new Set((this.profesionalesDisponiblesParaAcceso || []).map((u) => String(u?.cargo || '').trim()).filter(Boolean));
            return Array.from(cargos).sort((a, b) => a.localeCompare(b));
        },
        conveniosDisponiblesAcceso() {
            const convenios = new Set((this.profesionalesDisponiblesParaAcceso || [])
                .map((u) => String(u?.convenio || '').trim())
                .filter(Boolean));
            return Array.from(convenios).sort((a, b) => a.localeCompare(b));
        },
        gruposOperativosDisponibles() {
            return obtenerGruposOperativosDesdeUsuarios(this.users || [], this.convenio);
        },
        gruposOperativosDisponiblesEdicion() {
            return obtenerGruposOperativosDesdeUsuarios(this.users || [], this.editConvenio);
        },
        profesionalesDisponiblesParaAcceso() {
            const cargos = new Set(['Auxiliar de enfermeria', 'Medico', 'Enfermero', 'Psicologo', 'Tsocial', 'Nutricionista', 'Higienista oral']);
            const idEditando = this.usuarioEditando?.uid;

            const mapaPorDocumento = new Map();

            (this.users || [])
                .forEach((u) => {
                    const cargo = String(u?.cargo || '').trim();
                    const documento = String(u?.numDocumento || '').trim();

                    if (!cargos.has(cargo) || !documento) return;
                    if (idEditando && u.uid === idEditando) return;

                    if (!mapaPorDocumento.has(documento)) {
                        mapaPorDocumento.set(documento, u);
                    }
                });

            return Array.from(mapaPorDocumento.values())
                .sort((a, b) => String(a?.nombre || '').localeCompare(String(b?.nombre || '')));
        },
        profesionalesDisponiblesParaAccesoFiltrados() {
            const convenioFiltro = String(this.filtroAccesoConvenio || '').trim().toLowerCase();
            const cargoFiltro = String(this.filtroAccesoCargo || '').trim();
            const texto = String(this.filtroAccesoTexto || '').trim().toLowerCase();

            return (this.profesionalesDisponiblesParaAcceso || [])
                .filter((u) => {
                    const documento = String(u?.numDocumento || '').trim();
                    const nombre = String(u?.nombre || '').trim().toLowerCase();
                    const cargo = String(u?.cargo || '').trim();
                    const convenio = String(u?.convenio || '').trim().toLowerCase();

                    const cumpleConvenio = !convenioFiltro || convenio === convenioFiltro;
                    const cumpleCargo = !cargoFiltro || cargo === cargoFiltro;
                    const cumpleTexto = !texto || nombre.includes(texto) || documento.toLowerCase().includes(texto);

                    return cumpleConvenio && cumpleCargo && cumpleTexto;
                });
        },
        profesionalesAsignadosAcceso() {
            const docsAsignados = new Set(
                (this.editAccesosProfesionales || []).map((doc) => String(doc || '').trim()).filter(Boolean)
            );

            if (docsAsignados.size === 0) return [];

            const cargos = new Set(['Auxiliar de enfermeria', 'Medico', 'Enfermero', 'Psicologo', 'Tsocial', 'Nutricionista', 'Higienista oral']);
            const idEditando = this.usuarioEditando?.uid;

            return (this.users || [])
                .filter((u) => {
                    const doc = String(u?.numDocumento || '').trim();
                    const cargo = String(u?.cargo || '').trim();
                    if (!doc || !docsAsignados.has(doc)) return false;
                    if (!cargos.has(cargo)) return false;
                    if (idEditando && u.uid === idEditando) return false;
                    return true;
                })
                .sort((a, b) => String(a?.nombre || '').localeCompare(String(b?.nombre || '')));
        },
    },
    watch: {
        cargo(newVal) {
            if (newVal === 'admin') {
                this.grupo = '0';
            } else if (newVal === 'Fact') {
                if (!this.grupo || String(this.grupo).trim().toUpperCase() === 'F') {
                    this.grupo = GRUPO_FACTURADOR_TODOS;
                } else {
                    this.grupo = normalizarGruposFacturador(this.grupo);
                }
                this.sincronizarGruposFacturadorConConvenio('create');
            }
        },
        editCargo(newVal) {
            if (newVal === 'admin') {
                this.editGrupo = '0';
            } else if (newVal === 'Fact') {
                if (!String(this.editGrupo || '').trim()) {
                    this.editGrupo = GRUPO_FACTURADOR_TODOS;
                } else if (this.facturadorSeleccionoTodos(this.editGrupo)) {
                    this.editGrupo = GRUPO_FACTURADOR_TODOS;
                }
                this.editAccesosProfesionales = [];
                this.sincronizarGruposFacturadorConConvenio('edit');
            }
        },
        editConvenio() {
            if (esCargoFacturador(this.editCargo)) {
                this.sincronizarGruposFacturadorConConvenio('edit');
            }
        },
        numDocumento() {
            this.documentoValido = null;
        },
        userEmail() {
            this.emailValido = null;
        },
        conveniosTabs(nuevos) {
            if (!Array.isArray(nuevos) || !nuevos.length) {
                this.convenioSeleccionado = '';
                return;
            }
            if (!nuevos.includes(this.convenioSeleccionado)) {
                this.convenioSeleccionado = nuevos[0];
            }
        },
    },
    methods: {
        seleccionarConvenioTab(conv) {
            this.convenioSeleccionado = conv;
        },

        etiquetaConvenioTab(conv) {
            return conv === 'sin-convenio' ? 'Administrativos' : conv;
        },

        contarUsuariosTabConvenio(conv) {
            const grupos = this.usuariosAgrupadosPorConvenioYGrupoFiltrado?.[conv];
            if (!grupos) return 0;
            return this.contarUsuariosConvenio(grupos);
        },

        puntuarTextoCsv(texto) {
            const valor = String(texto || '');
            let puntaje = 0;

            if (valor.includes('\uFFFD')) {
                puntaje -= 10;
            }

            const coincidencias = valor.match(/[ÁÉÍÓÚáéíóúÑñÜü]/g);
            if (coincidencias) {
                puntaje += coincidencias.length;
            }

            return puntaje;
        },

        decodificarCsv(arrayBuffer) {
            const utf8 = new TextDecoder('utf-8').decode(arrayBuffer);
            const windows1252 = new TextDecoder('windows-1252').decode(arrayBuffer);

            return this.puntuarTextoCsv(windows1252) > this.puntuarTextoCsv(utf8)
                ? windows1252
                : utf8;
        },

        async handleCsvUpload(e) {
            this.csvError = "";
            this.csvSuccess = "";
            this.csvInformeNoCreados = [];
            this.csvUsers = [];
            this.csvPreview = [];
            const file = e.target.files[0];
            if (!file) return;
            try {
                const arrayBuffer = await file.arrayBuffer();
                const csvContent = this.decodificarCsv(arrayBuffer);

                Papa.parse(csvContent, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const headers = Array.isArray(results.meta?.fields) ? results.meta.fields : [];
                        const expectedHeaders = ["Nombre", "Email", "Cargo", "Grupo", "Convenio", "Documento"];
                        const requiredHeaders = this.isSuperUser ? [...expectedHeaders, "idips"] : expectedHeaders;
                        if (!expectedHeaders.every(h => headers.includes(h))) {
                            this.csvError = "El archivo CSV no tiene los encabezados requeridos: " + requiredHeaders.join(", ");
                            return;
                        }
                        if (this.isSuperUser && !headers.includes("idips")) {
                            this.csvError = "Como superusuario, el CSV debe incluir la columna idips.";
                            return;
                        }
                        this.csvUsers = results.data;
                        this.csvPreview = this.csvUsers.slice(0, 5);
                    },
                    error: (err) => {
                        this.csvError = "Error al leer el archivo: " + err.message;
                    }
                });
            } catch (err) {
                this.csvError = "Error al leer el archivo: " + (err?.message || err);
            }
        },

        async enviarCsvUsuarios() {
            if (!this.csvUsers.length) return;
            if (!this.isSuperUser && !this.$store?.state?.userData?.ipsId) {
                this.csvError = "No se detectó una IPS válida en tu sesión.";
                return;
            }
            this.loadingCsv = true;
            this.csvError = "";
            this.csvSuccess = "";
            this.csvInformeNoCreados = [];
            try {
                const res = await bulkCreateUsers(this.csvUsers);
                const noCreados = Array.isArray(res?.noCreados)
                    ? res.noCreados
                    : (Array.isArray(res?.detalles)
                        ? res.detalles.filter((d) => d.status === 'saltado' || d.status === 'error')
                        : []);

                this.csvInformeNoCreados = noCreados.map((item) => ({
                    fila: item.fila || '',
                    nombre: item.nombre || '',
                    email: item.email || '',
                    documento: item.documento || '',
                    status: item.status || 'error',
                    motivo: item.motivo || item.error || 'Sin detalle',
                }));

                const creados = Number(res?.creados || 0);
                const saltados = Number(res?.saltados || this.csvInformeNoCreados.filter((i) => i.status === 'saltado').length || 0);
                const errores = Number(res?.errores || this.csvInformeNoCreados.filter((i) => i.status === 'error').length || 0);

                this.csvSuccess = `Proceso finalizado. Creados: ${creados}. Saltados: ${saltados}. Errores: ${errores}.`;
                this.csvUsers = [];
                this.csvPreview = [];
                await this.fetchUsers?.();
            } catch (err) {
                this.csvError = err?.response?.data?.message || err.message || "Error al crear usuarios";
            } finally {
                this.loadingCsv = false;
            }
        },
        normalizarGrupos(valor) {
            return Array.from(
                new Set(
                    String(valor || '')
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                )
            ).join(',');
        },

        facturadorSeleccionoTodos(grupoValor) {
            return facturadorSeleccionoTodosExplicito(grupoValor);
        },

        gruposFacturadorSeleccionados(grupoValor) {
            return parseGruposUsuario(grupoValor).filter((grupo) => {
                const lower = grupo.toLowerCase();
                return lower !== GRUPO_FACTURADOR_TODOS.toLowerCase() && lower !== 'f' && lower !== 'todos';
            });
        },

        gruposFacturadorDisponibles(modo = 'create') {
            const base = modo === 'edit'
                ? this.gruposOperativosDisponiblesEdicion
                : this.gruposOperativosDisponibles;
            const valor = modo === 'edit' ? this.editGrupo : this.grupo;
            const asignados = this.gruposFacturadorSeleccionados(valor)
                .filter((grupo) => base.includes(grupo));

            return Array.from(new Set([...base, ...asignados])).sort((a, b) =>
                a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })
            );
        },

        sincronizarGruposFacturadorConConvenio(modo = 'create') {
            const campo = modo === 'edit' ? 'editGrupo' : 'grupo';
            const valorActual = this[campo];

            if (this.facturadorSeleccionoTodos(valorActual) || !String(valorActual || '').trim()) {
                this[campo] = GRUPO_FACTURADOR_TODOS;
                return;
            }

            const disponibles = new Set(
                modo === 'edit'
                    ? this.gruposOperativosDisponiblesEdicion
                    : this.gruposOperativosDisponibles
            );
            const filtrados = this.gruposFacturadorSeleccionados(valorActual)
                .filter((grupo) => disponibles.has(grupo));

            this[campo] = filtrados.length ? filtrados.join(',') : GRUPO_FACTURADOR_TODOS;
        },

        toggleGrupoFacturador(grupoItem, modo = 'create') {
            const campo = modo === 'edit' ? 'editGrupo' : 'grupo';

            if (grupoItem === 'todos') {
                this[campo] = this.facturadorSeleccionoTodos(this[campo])
                    ? ''
                    : GRUPO_FACTURADOR_TODOS;
                return;
            }

            let seleccionados = this.gruposFacturadorSeleccionados(this[campo]);
            if (seleccionados.includes(grupoItem)) {
                seleccionados = seleccionados.filter((grupo) => grupo !== grupoItem);
            } else {
                seleccionados.push(grupoItem);
            }

            this[campo] = seleccionados.length ? seleccionados.join(',') : '';
        },

        obtenerGruposUsuario(user) {
            const cargo = String(user?.cargo || '').trim();

            if (esCargoFacturador(cargo)) {
                if (facturadorVeTodosLosGrupos(user?.grupo)) {
                    return [GRUPO_FACTURADOR_TODOS];
                }
                const grupos = parseGruposUsuario(user?.grupo);
                return grupos.length ? grupos : [GRUPO_FACTURADOR_TODOS];
            }

            const grupos = parseGruposUsuario(user?.grupo);
            return grupos.length ? grupos : ['sin-grupo'];
        },

        ordenarGruposConvenio(gruposPorConvenio) {
            if (!gruposPorConvenio || typeof gruposPorConvenio !== 'object') {
                return [];
            }

            return Object.keys(gruposPorConvenio).sort((a, b) => {
                if (a === 'F') return -1;
                if (b === 'F') return 1;
                if (a === 'sin-grupo') return 1;
                if (b === 'sin-grupo') return -1;
                return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
            });
        },

        etiquetaGrupoListado(grupo) {
            if (grupo === 'sin-grupo') return 'Sin Grupo';
            if (grupo === 'F' || String(grupo).toLowerCase() === 'todos') return 'Todos';
            return `Grupo ${grupo}`;
        },

        mostrarGruposUsuario(user) {
            if (esCargoFacturador(user?.cargo)) {
                return formatearGruposFacturador(user?.grupo);
            }

            const grupos = parseGruposUsuario(user?.grupo);
            return grupos.length ? grupos.join(', ') : '—';
        },

        normalizarFechaInput(valor) {
            if (valor === null || valor === undefined || valor === "") return "";

            if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
                const yyyy = valor.getFullYear();
                const mm = String(valor.getMonth() + 1).padStart(2, "0");
                const dd = String(valor.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
            }

            const text = String(valor).trim();
            if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
                return text.slice(0, 10);
            }

            // ISO con hora: 2026-12-31T05:00:00.000Z
            const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})[T\s]/);
            if (isoMatch) {
                return isoMatch[1];
            }

            const match = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (match) {
                return `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
            }

            const parsed = new Date(text);
            if (!Number.isNaN(parsed.getTime())) {
                const yyyy = parsed.getFullYear();
                const mm = String(parsed.getMonth() + 1).padStart(2, "0");
                const dd = String(parsed.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
            }

            return "";
        },

        resolverFechaFinContratoUsuario(user = {}) {
            return this.normalizarFechaInput(
                user.fechaFinContrato ?? user.fecha_fin_contrato ?? null
            );
        },

        resolverFechaFinContratoEdicion() {
            if (this.editSinFechaFinContrato) {
                return null;
            }
            return this.normalizarFechaInput(this.editFechaFinContrato) || null;
        },

        formatearFechaFinContrato(valor) {
            const fecha = this.normalizarFechaInput(valor);
            if (!fecha) return "—";
            const [yyyy, mm, dd] = fecha.split("-");
            if (!yyyy || !mm || !dd) return fecha;
            return `${dd}/${mm}/${yyyy}`;
        },

        esCargoOculto(cargo) {
            return String(cargo || '').trim().toLowerCase() === 'superusuario';
        },

        esFacturadorCargo(cargo) {
            return esCargoFacturador(cargo);
        },

        obtenerIdUsuario(user) {
            return String(user?.uid || user?.id || '').trim();
        },

        esUsuarioInactivo(user) {
            return user?.activo === false || user?.activo === 0 || user?.activo === '0';
        },

        estaUsuarioSeleccionado(user) {
            const id = this.obtenerIdUsuario(user);
            return !!id && this.usuariosSeleccionadosIds.includes(id);
        },

        grupoEstaSeleccionadoCompleto(usuariosGrupo = []) {
            const lista = Array.isArray(usuariosGrupo) ? usuariosGrupo : [];
            if (!lista.length) return false;
            return lista.every((user) => this.estaUsuarioSeleccionado(user));
        },

        grupoEstaParcialmenteSeleccionado(usuariosGrupo = []) {
            const lista = Array.isArray(usuariosGrupo) ? usuariosGrupo : [];
            if (!lista.length) return false;
            const seleccionados = lista.filter((user) => this.estaUsuarioSeleccionado(user)).length;
            return seleccionados > 0 && seleccionados < lista.length;
        },

        toggleSeleccionUsuario(user, checked) {
            const id = this.obtenerIdUsuario(user);
            if (!id) return;

            if (checked) {
                if (!this.usuariosSeleccionadosIds.includes(id)) {
                    this.usuariosSeleccionadosIds = [...this.usuariosSeleccionadosIds, id];
                }
                return;
            }

            this.usuariosSeleccionadosIds = this.usuariosSeleccionadosIds.filter((item) => item !== id);
        },

        toggleSeleccionGrupo(usuariosGrupo = [], checked) {
            const lista = Array.isArray(usuariosGrupo) ? usuariosGrupo : [];
            const idsGrupo = lista.map((user) => this.obtenerIdUsuario(user)).filter(Boolean);
            if (!idsGrupo.length) return;

            if (checked) {
                this.usuariosSeleccionadosIds = Array.from(new Set([
                    ...this.usuariosSeleccionadosIds,
                    ...idsGrupo,
                ]));
                return;
            }

            const quitar = new Set(idsGrupo);
            this.usuariosSeleccionadosIds = this.usuariosSeleccionadosIds.filter((id) => !quitar.has(id));
        },

        limpiarSeleccionUsuarios() {
            this.usuariosSeleccionadosIds = [];
            this.bulkGrupoValor = "";
        },

        async aplicarAccionMasivaActivo(activo) {
            const seleccionados = this.usuariosSeleccionados;
            if (!seleccionados.length) return;

            const accion = activo ? 'habilitar' : 'deshabilitar';
            if (!confirm(`¿Desea ${accion} ${seleccionados.length} usuario(s) seleccionado(s)?`)) {
                return;
            }

            this.loadingBulk = true;
            this.bulkProgresoActual = 0;
            this.bulkProgresoTotal = seleccionados.length;
            let ok = 0;
            let fail = 0;

            try {
                for (const user of seleccionados) {
                    this.bulkProgresoActual += 1;
                    try {
                        await updateUser(this.obtenerIdUsuario(user), { activo: !!activo });
                        ok += 1;
                    } catch (error) {
                        fail += 1;
                        console.error(`Error al ${accion} usuario ${user?.email || user?.nombre}:`, error);
                    }
                }

                await this.fetchUsers();
                this.message = fail
                    ? `Proceso completado: ${ok} ok, ${fail} con error.`
                    : `${ok} usuario(s) ${activo ? 'habilitado(s)' : 'deshabilitado(s)'} correctamente.`;
                this.messageType = fail ? 'error' : 'success';
                this.limpiarSeleccionUsuarios();
            } finally {
                this.loadingBulk = false;
                this.bulkProgresoActual = 0;
                this.bulkProgresoTotal = 0;
            }
        },

        async aplicarAccionMasivaGrupo() {
            const seleccionados = this.usuariosSeleccionados;
            if (!seleccionados.length) return;

            const grupoIngresado = String(this.bulkGrupoValor || '').trim();
            if (!grupoIngresado) {
                this.message = 'Ingrese el nuevo grupo para aplicar a los seleccionados.';
                this.messageType = 'error';
                return;
            }

            if (!confirm(`¿Desea cambiar el grupo de ${seleccionados.length} usuario(s) a "${grupoIngresado}"?`)) {
                return;
            }

            this.loadingBulk = true;
            this.bulkProgresoActual = 0;
            this.bulkProgresoTotal = seleccionados.length;
            let ok = 0;
            let fail = 0;

            try {
                for (const user of seleccionados) {
                    this.bulkProgresoActual += 1;
                    try {
                        const cargo = String(user?.cargo || '').trim();
                        let grupoFinal = grupoIngresado;

                        if (esCargoFacturador(cargo)) {
                            const validacion = validarGruposFacturador(grupoIngresado);
                            if (!validacion.valid) {
                                fail += 1;
                                continue;
                            }
                            grupoFinal = validacion.normalized;
                        } else if (this.cargoRequiereGrupo(cargo)) {
                            grupoFinal = this.normalizarGrupos(grupoIngresado);
                            if (!grupoFinal) {
                                fail += 1;
                                continue;
                            }
                        } else if (cargo === 'admin') {
                            grupoFinal = '0';
                        } else {
                            grupoFinal = this.normalizarGrupos(grupoIngresado);
                        }

                        await updateUser(this.obtenerIdUsuario(user), { grupo: grupoFinal });
                        ok += 1;
                    } catch (error) {
                        fail += 1;
                        console.error(`Error al cambiar grupo de ${user?.email || user?.nombre}:`, error);
                    }
                }

                await this.fetchUsers();
                this.message = fail
                    ? `Cambio de grupo: ${ok} ok, ${fail} con error.`
                    : `Grupo actualizado en ${ok} usuario(s).`;
                this.messageType = fail ? 'error' : 'success';
                this.limpiarSeleccionUsuarios();
            } finally {
                this.loadingBulk = false;
                this.bulkProgresoActual = 0;
                this.bulkProgresoTotal = 0;
            }
        },

        cargoRequiereGrupo(cargo) {
            return [
                'Auxiliar de enfermeria',
                'Enfermero',
                'Medico',
                'Psicologo',
                'Tsocial',
                'Nutricionista',
                'Higienista oral'
            ].includes(String(cargo || '').trim());
        },

        validarGrupoFacturadorParaGuardar(valor, usarEditError = false) {
            const resultado = validarGruposFacturador(valor);
            if (!resultado.valid) {
                if (usarEditError) {
                    this.editError = resultado.error;
                } else {
                    this.message = resultado.error;
                    this.messageType = "error";
                }
                return false;
            }

            if (usarEditError) {
                this.editError = "";
            }

            return resultado.normalized;
        },

        async verificarDocumento() {
            const documento = String(this.numDocumento || '').trim();
            if (!documento) {
                this.documentoValido = null;
                return;
            }

            this.verificandoDocumento = true;
            this.documentoValido = null;

            try {
                this.documentoValido = !(await documentExists(documento));
            } catch (error) {
                console.error("Error al verificar documento:", error);
                this.documentoValido = null;
            } finally {
                this.verificandoDocumento = false;
            }
        },

        async verificarEmail() {
            const email = String(this.userEmail || '').trim().toLowerCase();
            if (!email) {
                this.emailValido = null;
                return;
            }

            this.verificandoEmail = true;
            this.emailValido = null;

            try {
                this.emailValido = !(await emailExists(email));
            } catch (error) {
                console.error("Error al verificar email:", error);
                this.emailValido = null;
            } finally {
                this.verificandoEmail = false;
            }
        },

        sanitizeId(str) {
            // Reemplaza espacios y caracteres especiales con guiones para crear IDs válidos
            return str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
        },

        contarUsuariosConvenio(gruposPorConvenio) {
            if (!gruposPorConvenio || typeof gruposPorConvenio !== 'object') return 0;
            let total = 0;
            Object.keys(gruposPorConvenio).forEach(grupo => {
                total += Array.isArray(gruposPorConvenio[grupo]) ? gruposPorConvenio[grupo].length : 0;
            });
            return total;
        },

        getColorIndexByGrupo(grupo) {
            if (grupo === 'sin-grupo') {
                return 6;
            }
            if (grupo === 'F') {
                return 5;
            }
            const grupoNum = parseInt(grupo) || 0;
            return grupoNum % 7;
        },

        getCargoClass(cargo) {
            const cargoMap = {
                'Auxiliar de enfermeria': 'aux',
                'Enfermero': 'enf',
                'Medico': 'med',
                'Fact': 'fact',
                'Facturador': 'fact',
                'fact': 'fact',
                'facturador': 'fact',
                'admin': 'admin',
                'Psicologo': 'psi',
                'Nutricionista': 'nut',
                'Higienista oral': 'hig',
                'Tsocial': 'ts'
            };
            return cargoMap[cargo] || 'default';
        },

        getColorClassByGrupo(grupo) {
            const colors = [
                'bg-primary', // Azul
                'bg-success', // Verde
                'bg-warning', // Amarillo
                'bg-info', // Cyan
                'bg-danger', // Rojo
                'bg-secondary', // Gris
                'bg-dark' // Negro
            ];

            if (grupo === 'sin-grupo') {
                return 'bg-secondary';
            }
            if (grupo === 'F') {
                return 'bg-warning text-dark';
            }

            // Usar el número del grupo para determinar el color
            const grupoNum = parseInt(grupo) || 0;
            return colors[grupoNum % colors.length];
        },

        getCargoColorClass(cargo) {
            return getSharedCargoBadgeClass(cargo);
        },

        getCargoShortName(cargo) {
            const shortNames = {
                'Auxiliar de enfermeria': 'AUX',
                'Enfermero': 'ENFE',
                'Medico': 'MEDI',
                'Fact': 'FACT',
                'admin': 'ADMIN',
                'Psicologo': 'PSICO',
                'Nutricionista': 'NUTRI',
                'Higienista oral': 'HIGOR',
                'Tsocial': 'TSOCIAL'
            };

            return shortNames[cargo] || cargo.substring(0, 3).toUpperCase();
        },

        // Eliminar usuario de la base de datos
        async deleteUser(user) {
            if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.nombre}?

Esta acción eliminará el usuario de la base de datos.`)) {
                return;
            }

            this.loading = true;

            try {
                await deleteUserById(user.uid);
                this.message = `Usuario ${user.nombre} eliminado exitosamente.`;
                this.messageType = "success";

                // Recargar lista de usuarios
                await this.fetchUsers();

            } catch (error) {
                this.message = `Error al eliminar usuario: ${error.message}`;
                this.messageType = "error";
                console.error("Error al eliminar usuario:", error);
            } finally {
                this.loading = false;
            }
        },

        abrirModalEdicion(user) {
            if (this.esCargoOculto(user?.cargo)) {
                this.message = "El rol superusuario no se gestiona desde esta vista.";
                this.messageType = "error";
                return;
            }

            this.usuarioEditando = user;
            this.editEmail = user.email;
            this.editNombre = user.nombre;
            this.editNumDocumento = user.numDocumento;
            this.editTelefono = user.telefono || "";
            const fechaFin = this.resolverFechaFinContratoUsuario(user);
            this.editFechaFinContrato = fechaFin;
            this.editSinFechaFinContrato = !fechaFin;
            this.editGrupo = esCargoFacturador(user?.cargo)
                ? String(user.grupo || GRUPO_FACTURADOR_TODOS).trim()
                : (user.grupo || '');
            this.editCargo = user.cargo;
            this.editConvenio = user.convenio || '';
            this.editAccesosProfesionales = esCargoFacturador(user?.cargo)
                ? []
                : (Array.isArray(user.accesosProfesionales) ? [...user.accesosProfesionales] : []);
            this.filtroAccesoConvenio = "";
            this.filtroAccesoCargo = "";
            this.filtroAccesoTexto = "";
            this.editError = "";
            this.mostrarModalEdicion = true;
        },

        onToggleSinFechaFinContrato() {
            if (this.editSinFechaFinContrato) {
                this.editFechaFinContrato = "";
            }
        },

        onEditFechaFinContratoInput() {
            if (String(this.editFechaFinContrato || "").trim()) {
                this.editSinFechaFinContrato = false;
            }
        },

        cerrarModalEdicion() {
            this.mostrarModalEdicion = false;
            this.usuarioEditando = null;
            this.editAccesosProfesionales = [];
            this.editSinFechaFinContrato = false;
            this.editFechaFinContrato = "";
            this.filtroAccesoConvenio = "";
            this.filtroAccesoCargo = "";
            this.filtroAccesoTexto = "";
            this.editError = "";
        },

        toggleAccesoProfesional(doc) {
            if (!doc) return;
            const idx = this.editAccesosProfesionales.indexOf(doc);
            if (idx === -1) {
                this.editAccesosProfesionales = [...this.editAccesosProfesionales, doc];
            } else {
                this.editAccesosProfesionales = this.editAccesosProfesionales.filter((d) => d !== doc);
            }
        },

        quitarAccesoProfesional(doc) {
            if (!doc) return;
            this.editAccesosProfesionales = (this.editAccesosProfesionales || [])
                .filter((d) => String(d || '').trim() !== doc);
        },

        seleccionarTodosAccesosFiltrados() {
            const actuales = new Set((this.editAccesosProfesionales || []).map((d) => String(d || '').trim()).filter(Boolean));
            (this.profesionalesDisponiblesParaAccesoFiltrados || []).forEach((prof) => {
                const doc = String(prof?.numDocumento || '').trim();
                if (doc) actuales.add(doc);
            });
            this.editAccesosProfesionales = Array.from(actuales);
        },

        limpiarSeleccionAccesosFiltrados() {
            const quitar = new Set((this.profesionalesDisponiblesParaAccesoFiltrados || []).map((prof) => String(prof?.numDocumento || '').trim()).filter(Boolean));
            this.editAccesosProfesionales = (this.editAccesosProfesionales || []).filter((doc) => !quitar.has(String(doc || '').trim()));
        },

        async guardarCambiosUsuario() {
            this.editError = "";

            if (!this.editNombre || !this.editNumDocumento || !this.editCargo) {
                this.editError = "Por favor, completa todos los campos obligatorios.";
                return;
            }

            const grupoFacturador = esCargoFacturador(this.editCargo)
                ? this.validarGrupoFacturadorParaGuardar(this.editGrupo, true)
                : null;
            const grupoNormalizado = esCargoFacturador(this.editCargo)
                ? grupoFacturador
                : this.normalizarGrupos(this.editGrupo);

            if (esCargoFacturador(this.editCargo) && grupoFacturador === false) {
                return;
            }

            this.editGrupo = grupoNormalizado;

            if (this.cargoRequiereGrupo(this.editCargo) && !this.editGrupo) {
                this.editError = "El campo # Grupo(s) es obligatorio para el cargo seleccionado.";
                return;
            }

            const accesosNormalizados = esCargoFacturador(this.editCargo)
                ? []
                : Array.from(
                    new Set(
                        (this.editAccesosProfesionales || [])
                            .map((doc) => String(doc || '').trim())
                            .filter(Boolean)
                    )
                );

            this.loading = true;
            this.message = "";
            this.messageType = "";

            try {
                const userId = this.obtenerIdUsuario(this.usuarioEditando);
                const fechaFinContrato = this.resolverFechaFinContratoEdicion();

                await updateUser(userId, {
                    nombre: this.editNombre,
                    grupo: this.editGrupo,
                    cargo: this.editCargo,
                    ipsId: this.ips || null,
                    convenio: this.editConvenio,
                    telefono: String(this.editTelefono || "").trim() || null,
                    fechaFinContrato,
                    accesosProfesionales: accesosNormalizados,
                });

                // Reflejar de inmediato en el listado local
                const idx = (this.users || []).findIndex((u) => this.obtenerIdUsuario(u) === userId);
                if (idx >= 0) {
                    this.users[idx] = {
                        ...this.users[idx],
                        nombre: this.editNombre,
                        grupo: this.editGrupo,
                        cargo: this.editCargo,
                        convenio: this.editConvenio,
                        telefono: String(this.editTelefono || "").trim() || null,
                        fechaFinContrato,
                        accesosProfesionales: accesosNormalizados,
                    };
                }

                // Si el usuario editado es el usuario logueado, reflejar de inmediato los accesos en la sesión.
                const uidLogueado = String(this.$store?.state?.uid || '').trim();
                const uidEditado = userId;
                if (uidLogueado && uidEditado && uidLogueado === uidEditado) {
                    const userDataActual = this.$store?.state?.userData || {};
                    this.$store.commit('setUserData', {
                        ...userDataActual,
                        accesosProfesionales: accesosNormalizados,
                    });
                }

                this.message = `Usuario actualizado exitosamente.`;
                this.messageType = "success";

                this.cerrarModalEdicion();
                await this.fetchUsers();
            } catch (error) {
                this.message = formatApiError(error, "No se pudo actualizar el usuario.");
                this.messageType = "error";
                console.error("Error al actualizar usuario:", error);
            } finally {
                this.loading = false;
            }
        },

        closeMessage() {
            this.message = "";
            this.messageType = "";
            this.messagePassword = "";
        },
        //crear el usuario en la bd
        async createUserByAdmin() {
            this.formularioIntentado = true;

            // Normalizar entradas para evitar blancos o espacios residuales
            this.userEmail = String(this.userEmail || '').trim().toLowerCase();
            this.nombre = String(this.nombre || '').trim();
            this.numDocumento = String(this.numDocumento || '').trim();
            this.cargo = String(this.cargo || '').trim();
            this.convenio = String(this.convenio || '').trim();
            this.grupo = esCargoFacturador(this.cargo)
                ? this.validarGrupoFacturadorParaGuardar(this.grupo)
                : this.normalizarGrupos(this.grupo);
            if (esCargoFacturador(this.cargo) && this.grupo === false) {
                return;
            }

            if (!this.convenio || !this.userEmail || !this.nombre || !this.numDocumento || !this.cargo) {
                this.message = "Por favor, completa todos los campos obligatorios.";
                this.messageType = "error";
                return;
            }

            if (this.cargoRequiereGrupo(this.cargo) && !this.grupo) {
                this.message = "El campo # Grupo(s) es obligatorio para el cargo seleccionado.";
                this.messageType = "error";
                return;
            }

            // El superusuario debe seleccionar una IPS
            const effectiveIpsId = this.isSuperUser ? this.selectedIpsId : this.ips;
            if (!effectiveIpsId) {
                this.message = "Debes seleccionar la IPS a la que pertenecerá el usuario.";
                this.messageType = "error";
                return;
            }

            // Validar nuevamente contra base de datos antes de crear
            await Promise.all([this.verificarDocumento(), this.verificarEmail()]);
            if (this.documentoValido !== true) {
                this.message = "Este documento ya está registrado. Verifica la información.";
                this.messageType = "error";
                return;
            }

            if (this.emailValido !== true) {
                this.message = "Este email ya está registrado. Verifica la información.";
                this.messageType = "error";
                return;
            }

            // Doble validación en memoria para evitar condiciones de carrera en UI
            const documentoDuplicado = this.users?.some((u) =>
                String(u?.numDocumento || '').trim() === this.numDocumento
            );
            if (documentoDuplicado) {
                this.message = "Este documento ya existe en el listado de usuarios registrados.";
                this.messageType = "error";
                this.documentoValido = false;
                return;
            }

            this.loading = true;
            this.message = "";
            this.messageType = "";

            try {
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
                const tempPassword = Array.from({ length: 8 }, () =>
                    chars[Math.floor(Math.random() * chars.length)]
                ).join('');

                await createUser({
                    email: this.userEmail,
                    password: tempPassword,
                    nombre: this.nombre,
                    cargo: this.cargo,
                    ipsId: effectiveIpsId,
                    convenio: this.convenio,
                    grupo: this.grupo,
                    numDocumento: this.numDocumento,
                    telefono: String(this.telefono || "").trim() || null,
                    fechaFinContrato: this.normalizarFechaInput(this.fechaFinContrato) || null,
                    accesosProfesionales: esCargoFacturador(this.cargo) ? [] : undefined,
                });

                this.message = `Usuario ${this.userEmail} creado exitosamente.\nContraseña temporal: ${tempPassword}\nEl usuario deberá cambiarla en su primer ingreso.`;
                this.messageType = "success";

                // Limpiar campos
                this.userEmail = "";
                this.nombre = "";
                this.grupo = "";
                this.numDocumento = "";
                this.telefono = "";
                this.fechaFinContrato = "";
                this.cargo = "";
                this.convenio = "";
                this.documentoValido = null;
                this.emailValido = null;
                this.formularioIntentado = false;
                if (this.isSuperUser) {
                    this.selectedIpsId = "";
                    this.ipsSearch = "";
                }
                await this.fetchUsers();
            } catch (error) {
                this.message = formatApiError(error, "No se pudo crear el usuario.");
                this.messageType = "error";
                console.error("Error al crear usuario:", error);
            } finally {
                this.loading = false;
            }
        },
        generarPasswordTemporal(longitud = 10) {
            const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
            return Array.from({ length: longitud }, () =>
                caracteres[Math.floor(Math.random() * caracteres.length)]
            ).join('');
        },

        estaUsuarioBloqueado(user) {
            const lockedUntil = user?.lockedUntil ? new Date(user.lockedUntil) : null;
            const tieneBloqueoTemporal = lockedUntil && !Number.isNaN(lockedUntil.getTime()) && lockedUntil.getTime() > Date.now();
            const tieneBloqueoPermanente = Number(user?.lockLevel || 0) >= 3;
            return Boolean(user?.isLocked) || tieneBloqueoTemporal || tieneBloqueoPermanente;
        },

        /*  resetear password con clave temporal */
        async resetPassword(user) {
            const userId = user?.uid || user?.id;
            if (!userId) {
                this.message = "No se pudo identificar el usuario para restablecer la contraseña.";
                this.messageType = "error";
                this.messagePassword = "";
                return;
            }

            const temporalPassword = this.generarPasswordTemporal(10);

            try {
                this.loading = true;
                await updateUserPasswordById(userId, temporalPassword, true);
                if (this.isAdmin || this.isSuperUser) {
                    await unlockUserById(userId);
                }
                this.message = this.estaUsuarioBloqueado(user)
                    ? `Usuario desbloqueado y contraseña temporal generada para ${user?.email || 'el usuario'}:`
                    : `Contraseña temporal generada para ${user?.email || 'el usuario'}:`;
                this.messagePassword = temporalPassword;
                this.messageType = "success";
                await this.fetchUsers();
            } catch (error) {
                this.message = `Error al generar contraseña temporal: ${error.message}`;
                this.messageType = "error";
                this.messagePassword = "";
                console.error(error);
            } finally {
                this.loading = false;
            }
        },

        //consultar los datos del usuario
        async fetchUsers() {
            this.loadingUsers = true;
            try {
                const users = await getAllUsers({ forceRefresh: true });
                this.users = users
                    .filter((u) => !this.esCargoOculto(u?.cargo))
                    .map((u) => ({
                        uid: u.id,
                        ...u,
                    }));
            } catch (error) {
                this.message = `Error al cargar usuarios: ${error.message}`;
                this.messageType = "error";
                console.error("Error fetchUsers:", error);
            } finally {
                this.loadingUsers = false;
            }
        },
        onConvenioChange() {
            const soloEBasicos = ['Psicologo', 'Tsocial'];
            const soloPIC = ['Nutricionista'];
            const soloUnidesa = ['Higienista oral'];

            if (this.convenio !== 'E Basicos' && soloEBasicos.includes(this.cargo)) {
                this.cargo = '';
            }

            if (this.convenio !== 'PIC' && soloPIC.includes(this.cargo)) {
                this.cargo = '';
            }

            if (this.convenio !== 'Unidesa' && soloUnidesa.includes(this.cargo)) {
                this.cargo = '';
            }

            if (esCargoFacturador(this.cargo)) {
                this.sincronizarGruposFacturadorConConvenio('create');
            }
        },

        async fetchIpsList() {
            try {
                const { ipsApi } = await import('@/api/modulesApi');
                this.ipsList = await ipsApi.list();
            } catch (e) {
                console.error('Error al cargar lista de IPS:', e);
            }
        },
    },
    mounted() {
        try {
            const raw = localStorage.getItem('userData');
            const parsed = raw ? JSON.parse(raw) : null;
            const ipsValue = parsed?.ipsId ?? parsed?.idips ?? parsed?.ips;
            this.ips = String(ipsValue || "").trim() || null;
            this.isSuperUser = parsed?.cargo === 'superusuario';
            this.isAdmin = parsed?.cargo === 'admin';
        } catch (_) {
            this.ips = null;
            this.isSuperUser = false;
            this.isAdmin = false;
        }
        this.fetchUsers();
        if (this.isSuperUser) {
            this.fetchIpsList();
        }
    },
};
</script>

<style scoped>
.crear-usuarios-panel .crear-subtabs .nav-link {
    color: #495057;
}

.crear-usuarios-panel .crear-subtabs .nav-link.active {
    font-weight: 600;
    color: #0d6efd;
}

.crear-usuarios-panel .crear-subpanel {
    min-height: 180px;
}

.convenios-usuarios-tabs .nav-link {
    color: #495057;
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
}

.convenios-usuarios-tabs .nav-link.active {
    font-weight: 600;
    color: #0d6efd;
}

.convenio-tab-content {
    margin-top: 0.75rem;
}

/* Formulario de creación de usuario: coloración por convenio */
.grupos-facturador-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.35rem 1rem;
    background: #f8fafc;
}

.form-convenio-wrapper {
    padding: 20px;
    border-radius: 14px;
    border: 2px solid #dee2e6;
    margin-bottom: 24px;
    transition: background 0.3s ease, border-color 0.3s ease;
}

.form-convenio-wrapper.convenio-extramural {
    background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
    border-color: #a855f7;
}

.form-convenio-wrapper.convenio-extramural h1,
.form-convenio-wrapper.convenio-extramural label {
    color: #6b21a8;
}

.form-convenio-wrapper.convenio-ebasicos {
    background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
    border-color: #16a34a;
}

.form-convenio-wrapper.convenio-ebasicos h1,
.form-convenio-wrapper.convenio-ebasicos label {
    color: #14532d;
}

.form-convenio-wrapper.convenio-pic {
    background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
    border-color: #ea580c;
}

.form-convenio-wrapper.convenio-pic h1,
.form-convenio-wrapper.convenio-pic label {
    color: #9a3412;
}

.form-convenio-wrapper.convenio-unidesa {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-color: #3b82f6;
}

.form-convenio-wrapper.convenio-unidesa h1,
.form-convenio-wrapper.convenio-unidesa label {
    color: #1e40af;
}

/* Sección de Convenio */
.convenio-section {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    padding: 15px;
    margin-bottom: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.convenio-header {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #212529;
    font-weight: 700;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.convenio-title {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
}

.convenio-count {
    background: rgba(33, 37, 41, 0.15);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #212529;
}

.grupos-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Filtro de Convenios */
.filter-section {
    padding: 15px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 8px;
    margin-top: 20px;
}

/* Contenedor de usuarios */
.usuarios-container {
    padding: 10px 0;
}

.mini-progress {
    display: inline-flex;
    width: 44px;
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    background: #dbe8ff;
}

.mini-progress-bar {
    width: 100%;
    background: linear-gradient(90deg, #0d6efd 0%, #5aa3ff 50%, #0d6efd 100%);
    background-size: 200% 100%;
    animation: miniProgressShift 1.2s linear infinite;
}

@keyframes miniProgressShift {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

.accordion-delegados .accordion-item {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    overflow: hidden;
}

.accordion-delegados .accordion-button {
    font-size: 0.95rem;
    font-weight: 600;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
}

.accordion-delegados .accordion-button:not(.collapsed) {
    background: #eef4ff;
    color: #0d6efd;
    box-shadow: none;
}

.accordion-delegados .accordion-body {
    background: #fff;
}

/* Sección de Grupo */
.grupo-section {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    background: white;
}

.grupo-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    font-weight: 600;
    border-radius: 8px 8px 0 0;
}

.grupo-title {
    display: flex;
    align-items: center;
    font-size: 0.95rem;
}

.grupo-count {
    background: rgba(255, 255, 255, 0.3);
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 700;
}

/* Estilos para Acordeón de Grupos */
.accordion {
    gap: 12px;
}

.accordion-item {
    border: none;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    margin-bottom: 12px;
}

.accordion-button {
    padding: 12px 16px;
    font-weight: 600;
    font-size: 0.95rem;
    color: white;
    border: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
}

.accordion-button:not(.collapsed) {
    box-shadow: none;
    background: inherit;
}

.accordion-button::after {
    margin-left: auto;
}

.grupo-title-text {
    display: flex;
    align-items: center;
}

.accordion-item:nth-child(odd) .accordion-button {
    background: linear-gradient(135deg, #4facfe 0%, #fcffff 100%);
    color: #212529 !important;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.accordion-item:nth-child(even) .accordion-button {
    background: linear-gradient(135deg, #d7e51a 0%, #f6f7f6 100%);
    color: #212529 !important;
    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

.accordion-button.collapsed {
    color: inherit;
}

.accordion-button:focus {
    box-shadow: none;
    border-color: transparent;
}

/* Colores para grupos (7 colores rotantes) */
.color-0 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Púrpura */
.color-1 {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Rosa-Rojo */
.color-2 {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* Cyan */
.color-3 {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

/* Verde */
.color-4 {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

/* Naranja */
.color-5 {
    background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
}

/* Azul-Morado */
.color-6 {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

/* Suave */

/* Tabla de usuarios */
.tabla-usuarios {
    background: white;
    border-radius: 0 0 8px 8px;
    overflow-x: auto;
}

.tabla-usuarios .table {
    margin: 0;
    font-size: 0.9rem;
    table-layout: fixed;
    width: 100%;
}

.tabla-usuarios .table th,
.tabla-usuarios .table td {
    padding: 0.4rem 0.5rem;
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Distribución equilibrada del ancho */
.tabla-usuarios th:nth-child(1),
.tabla-usuarios td:nth-child(1) {
    width: 3.5%;
    text-align: center;
    overflow: visible;
}

.tabla-usuarios th:nth-child(2),
.tabla-usuarios td:nth-child(2) {
    width: 18%;
}

.tabla-usuarios th:nth-child(3),
.tabla-usuarios td:nth-child(3) {
    width: 11%;
}

.tabla-usuarios th:nth-child(4),
.tabla-usuarios td:nth-child(4) {
    width: 20%;
}

.tabla-usuarios th:nth-child(5),
.tabla-usuarios td:nth-child(5) {
    width: 11%;
}

.tabla-usuarios th:nth-child(6),
.tabla-usuarios td:nth-child(6) {
    width: 11%;
}

.tabla-usuarios th:nth-child(7),
.tabla-usuarios td:nth-child(7) {
    width: 9%;
    text-align: center;
}

.tabla-usuarios th:nth-child(8),
.tabla-usuarios td:nth-child(8) {
    width: 7%;
    text-align: center;
}

.tabla-usuarios th:nth-child(9),
.tabla-usuarios td:nth-child(9) {
    width: 9.5%;
}

.tabla-usuarios td.acciones-cell {
    overflow: visible;
    text-overflow: clip;
    white-space: nowrap;
}

.tabla-usuarios tr.usuario-inactivo {
    opacity: 0.65;
    background: #f8f9fa;
}

.tabla-usuarios tr.usuario-seleccionado {
    background: #e7f1ff !important;
}

.bulk-actions-bar {
    background: #f8fbff;
    border-color: #bcd0f7 !important;
    box-shadow: 0 1px 4px rgba(13, 110, 253, 0.08);
}

.bulk-grupo-input {
    width: min(320px, 100%);
}

.tabla-usuarios thead {
    background: #f8f9fa;
    border-bottom: 2px solid #dee2e6;
}

.tabla-usuarios thead th {
    padding: 10px 12px;
    font-weight: 600;
    color: #495057;
    border: none;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tabla-usuarios tbody tr {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s ease;
}

.tabla-usuarios tbody tr:hover {
    background: #f8f9fa;
}

.tabla-usuarios tbody td {
    padding: 10px 12px;
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tabla-usuarios tbody td.fw-bold {
    white-space: normal;
}

/* Colores de fondo suave por cargo */
.tabla-usuarios tr.cargo-aux {
    --accent-color: #d4edda;
}

.tabla-usuarios tr.cargo-enf {
    --accent-color: #d1ecf1;
}

.tabla-usuarios tr.cargo-med {
    --accent-color: #cfe2ff;
}

.tabla-usuarios tr.cargo-fact {
    --accent-color: #fff3cd;
}

.tabla-usuarios tr.cargo-admin {
    --accent-color: #f8d7da;
}

.tabla-usuarios tr.cargo-psi {
    --accent-color: #e2e2f0;
}

.tabla-usuarios tr.cargo-nut {
    --accent-color: #f0e6ff;
}

.tabla-usuarios tr.cargo-ts {
    --accent-color: #e0f7fa;
}

/* Badge de cargo */
.badge {
    font-size: 0.75rem;
    padding: 4px 8px;
    font-weight: 600;
    border-radius: 4px;
    text-transform: uppercase;
    white-space: nowrap;
}

/* Botones de acción compactos */
.btn-sm {
    padding: 4px 8px;
    font-size: 0.8rem;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* Modal Message Box */
.modal-message {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    min-width: 400px;
    max-width: 600px;
    animation: slideDown 0.4s ease-out;
    overflow: hidden;
}

@keyframes slideDown {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Header */
.modal-header-custom {
    padding: 20px 25px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 2px solid #f0f0f0;
}

.modal-message.success .modal-header-custom {
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    color: #155724;
}

.modal-message.error .modal-header-custom {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    color: #721c24;
}

.modal-header-custom i {
    font-size: 2rem;
}

.modal-header-custom h5 {
    margin: 0;
    font-weight: 600;
    font-size: 1.3rem;
}

/* Body */
.modal-body-custom {
    padding: 25px;
    font-size: 1rem;
    line-height: 1.6;
    color: #333;
}

.modal-body-custom p {
    margin: 0;
}

/* Footer */
.modal-footer-custom {
    padding: 15px 25px;
    text-align: right;
    background: #f8f9fa;
    border-top: 1px solid #dee2e6;
}

/* Modal de Edición */
.modal-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideDown 0.4s ease-out;
}

.modal-content .modal-header-custom {
    padding: 20px 25px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #e9ecef;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
}

.modal-content .modal-header-custom h5 {
    margin: 0;
    font-weight: 600;
    font-size: 1.3rem;
    color: white;
}

.modal-content .btn-close {
    background: transparent;
    color: white;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.modal-content .btn-close:hover {
    opacity: 1;
}

.modal-body-custom {
    padding: 25px;
}

.modal-body-custom .alert {
    margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 1200px) {

    .tabla-usuarios thead th:nth-child(3),
    .tabla-usuarios tbody td:nth-child(3) {
        font-size: 0.8rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .convenio-title {
        font-size: 0.95rem;
    }

    .convenio-count {
        padding: 2px 8px;
        font-size: 0.8rem;
    }
}

/* Tablets */
@media (max-width: 992px) {
    h1.display-6 {
        font-size: 1.75rem;
    }

    .filter-section {
        padding: 12px;
    }

    .filter-section label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.95rem;
    }

    .filter-section button {
        font-size: 0.8rem;
        margin-right: 8px;
        margin-bottom: 6px;
    }

    .convenio-section {
        padding: 12px;
    }

    .convenio-header {
        padding: 10px 12px;
        flex-wrap: wrap;
        gap: 8px;
    }

    .convenio-title {
        font-size: 0.9rem;
    }

    .convenio-count {
        font-size: 0.75rem;
    }

    .grupo-header {
        padding: 10px 12px;
    }

    .grupo-title {
        font-size: 0.9rem;
    }

    .grupo-count {
        font-size: 0.8rem;
    }

    .tabla-usuarios .table {
        font-size: 0.85rem;
    }

    .tabla-usuarios thead th {
        padding: 8px 10px;
        font-size: 0.75rem;
    }

    .tabla-usuarios tbody td {
        padding: 8px 10px;
    }
}

/* Móviles grandes (landscape) */
@media (max-width: 768px) {
    .modal-message {
        min-width: 90%;
        margin: 20px;
    }

    h1.display-6 {
        font-size: 1.5rem;
        margin-bottom: 15px;
    }

    .filter-section {
        padding: 12px 10px;
        margin-top: 15px;
        margin-bottom: 15px;
    }

    .filter-section label {
        display: block;
        margin-bottom: 10px;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .filter-section button {
        font-size: 0.75rem;
        padding: 5px 10px;
        margin-right: 6px;
        margin-bottom: 8px;
        display: inline-block;
    }

    .usuarios-container {
        padding: 0;
    }

    .convenio-section {
        padding: 8px 0;
        margin-bottom: 10px;
    }

    .convenio-header {
        padding: 8px 8px;
        font-size: 0.9rem;
    }

    .convenio-title {
        font-size: 0.85rem;
    }

    .convenio-title i {
        font-size: 0.95rem;
    }

    .convenio-count {
        padding: 2px 6px;
        font-size: 0.7rem;
    }

    .grupos-wrapper {
        gap: 0;
    }

    .grupo-section {
        border-radius: 6px;
    }

    .grupo-header {
        padding: 6px 8px;
        border-radius: 6px 6px 0 0;
    }

    .grupo-title {
        font-size: 0.8rem;
    }

    .grupo-title i {
        font-size: 0.9rem;
    }

    .grupo-count {
        padding: 1px 6px;
        font-size: 0.7rem;
    }

    /* Tabla responsiva en móvil */
    .tabla-usuarios {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        display: block;
    }

    .tabla-usuarios .table {
        font-size: 0.8rem;
        min-width: 760px;
        width: 100%;
        table-layout: fixed;
    }

    .tabla-usuarios th:nth-child(1),
    .tabla-usuarios td:nth-child(1) {
        width: 3.5%;
    }

    .tabla-usuarios th:nth-child(2),
    .tabla-usuarios td:nth-child(2) {
        width: 17%;
    }

    .tabla-usuarios th:nth-child(3),
    .tabla-usuarios td:nth-child(3) {
        width: 11%;
    }

    .tabla-usuarios th:nth-child(4),
    .tabla-usuarios td:nth-child(4) {
        width: 20%;
    }

    .tabla-usuarios th:nth-child(5),
    .tabla-usuarios td:nth-child(5) {
        width: 11%;
    }

    .tabla-usuarios th:nth-child(6),
    .tabla-usuarios td:nth-child(6) {
        width: 11%;
    }

    .tabla-usuarios th:nth-child(7),
    .tabla-usuarios td:nth-child(7) {
        width: 9%;
    }

    .tabla-usuarios th:nth-child(8),
    .tabla-usuarios td:nth-child(8) {
        width: 7%;
    }

    .tabla-usuarios th:nth-child(9),
    .tabla-usuarios td:nth-child(9) {
        width: 10.5%;
    }

    .tabla-usuarios td.acciones-cell {
        overflow: visible;
    }

    .tabla-usuarios thead {
        background: #f0f0f0;
    }

    .tabla-usuarios thead th {
        padding: 5px 4px;
        font-size: 0.7rem;
        border: none;
        text-transform: capitalize;
        font-weight: 600;
        line-height: 1.2;
    }

    .tabla-usuarios tbody tr {
        border-bottom: 1px solid #e0e0e0;
    }

    .tabla-usuarios tbody td {
        padding: 5px 4px;
        font-size: 0.8rem;
        word-break: break-word;
    }

    .tabla-usuarios tbody td.fw-bold {
        font-weight: 600;
        max-width: 120px;
        white-space: normal;
    }

    .tabla-usuarios tbody td.small {
        font-size: 0.75rem;
        color: #666;
    }

    /* Badges responsivos */
    .badge {
        font-size: 0.65rem;
        padding: 2px 5px;
        border-radius: 3px;
    }

    /* Botones responsivos */
    .btn-sm {
        padding: 1px 3px;
        font-size: 0.55rem;
        height: auto;
        line-height: 1;
        margin-right: 1px;
        min-width: auto;
    }

    .btn-sm i {
        font-size: 0.6rem;
    }

    .btn-warning,
    .btn-danger {
        margin-right: 1px;
    }

    /* Modal responsivo */
    .modal-message {
        min-width: 85%;
        max-width: 95%;
    }

    .modal-header-custom {
        padding: 15px 15px;
        gap: 10px;
    }

    .modal-header-custom i {
        font-size: 1.5rem;
    }

    .modal-header-custom h5 {
        font-size: 1.1rem;
    }

    .modal-body-custom {
        padding: 15px;
        font-size: 0.95rem;
    }

    .modal-footer-custom {
        padding: 10px 15px;
    }
}

/* Móviles pequeños */
@media (max-width: 480px) {
    h1.display-6 {
        font-size: 1.25rem;
        margin-bottom: 12px;
    }

    .filter-section {
        padding: 10px 8px;
        margin-top: 10px;
        margin-bottom: 12px;
        background: linear-gradient(135deg, #f0f2f5 0%, #c3cfe2 100%);
    }

    .filter-section label {
        font-size: 0.85rem;
        margin-bottom: 8px;
    }

    .filter-section button {
        font-size: 0.7rem;
        padding: 4px 8px;
        margin-right: 4px;
        margin-bottom: 6px;
        width: calc(50% - 3px);
    }

    .usuarios-container {
        padding: 0;
    }

    .convenio-section {
        padding: 8px 6px;
        margin-bottom: 12px;
        border-radius: 6px;
    }

    .convenio-header {
        padding: 8px 8px;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }

    .convenio-title {
        font-size: 0.8rem;
        width: 100%;
    }

    .convenio-count {
        align-self: flex-end;
        padding: 1px 5px;
        font-size: 0.65rem;
    }

    .grupo-header {
        padding: 7px 8px;
    }

    .grupo-title {
        font-size: 0.75rem;
    }

    .grupo-count {
        padding: 1px 5px;
        font-size: 0.65rem;
    }

    /* Tabla horizontal scroll en móvil pequeño */
    .tabla-usuarios {
        overflow-x: auto;
        display: block;
        -webkit-overflow-scrolling: touch;
    }

    .tabla-usuarios .table {
        font-size: 0.75rem;
        margin-bottom: 0;
        table-layout: fixed;
        min-width: 720px;
        width: 100%;
    }

    .tabla-usuarios th:nth-child(1),
    .tabla-usuarios td:nth-child(1) {
        width: 3.5%;
    }

    .tabla-usuarios th:nth-child(2),
    .tabla-usuarios td:nth-child(2) {
        width: 16%;
    }

    .tabla-usuarios th:nth-child(3),
    .tabla-usuarios td:nth-child(3) {
        width: 11%;
    }

    .tabla-usuarios th:nth-child(4),
    .tabla-usuarios td:nth-child(4) {
        width: 19%;
    }

    .tabla-usuarios th:nth-child(5),
    .tabla-usuarios td:nth-child(5) {
        width: 11%;
    }

    .tabla-usuarios th:nth-child(6),
    .tabla-usuarios td:nth-child(6) {
        width: 11%;
    }

    .tabla-usuarios th:nth-child(7),
    .tabla-usuarios td:nth-child(7) {
        width: 9%;
    }

    .tabla-usuarios th:nth-child(8),
    .tabla-usuarios td:nth-child(8) {
        width: 7%;
    }

    .tabla-usuarios th:nth-child(9),
    .tabla-usuarios td:nth-child(9) {
        width: 12.5%;
    }

    .tabla-usuarios td.acciones-cell {
        overflow: visible;
    }

    .tabla-usuarios thead th {
        padding: 4px 3px;
        font-size: 0.6rem;
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        background: #f5f5f5;
        line-height: 1.2;
    }

    .tabla-usuarios tbody td {
        padding: 4px 3px;
        font-size: 0.75rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .tabla-usuarios tbody td.fw-bold {
        max-width: 100px;
        font-size: 0.8rem;
    }

    .tabla-usuarios tbody td.small {
        font-size: 0.7rem;
    }

    .badge {
        font-size: 0.6rem;
        padding: 2px 4px;
    }

    .btn-sm {
        padding: 2px 3px;
        font-size: 0.6rem;
        margin-right: 1px;
    }

    .btn-sm i {
        font-size: 0.7rem;
    }

    .btn-sm.me-1 {
        margin-right: 1px !important;
    }

    /* Modal para móvil pequeño */
    .modal-message {
        min-width: 90%;
        max-width: 100%;
        margin: 10px;
    }

    .modal-header-custom {
        padding: 12px 12px;
    }

    .modal-body-custom {
        padding: 12px;
        font-size: 0.9rem;
    }

    .modal-footer-custom {
        padding: 8px 12px;
    }
}

/* Ultra pequeños (less de 380px) */
@media (max-width: 380px) {
    h1.display-6 {
        font-size: 1.1rem;
    }

    .filter-section button {
        width: 100%;
        margin-right: 0;
        margin-bottom: 4px;
    }

    .convenio-header {
        flex-direction: column;
    }

    .tabla-usuarios thead th {
        padding: 3px 2px;
        font-size: 0.55rem;
        line-height: 1.1;
    }

    .tabla-usuarios tbody td {
        padding: 3px 2px;
        font-size: 0.65rem;
    }

    .tabla-usuarios {
        overflow-x: auto;
        display: block;
    }

    .tabla-usuarios .table {
        table-layout: fixed;
        min-width: 720px;
    }

    .btn-sm {
        padding: 1px 2px;
        font-size: 0.55rem;
        margin-right: 1px;
    }
}

/* Clases legacy por compatibilidad */
.error {
    color: red;
}

.success {
    color: green;
}

/* Colores personalizados para cargos adicionales */
.bg-fuchsia {
    background-color: #c2185b !important;
}

.bg-orange {
    background-color: #fd7e14 !important;
}

.bg-emerald-deep {
    background-color: #0f766e !important;
}

/* Estilos para validación de documento */
.input-group-text {
    background-color: transparent;
    border-left: none;
}

.form-control.is-valid {
    border-color: #198754;
}

.form-control.is-invalid {
    border-color: #dc3545;
}

.valid-feedback,
.invalid-feedback {
    display: block;
}
</style>

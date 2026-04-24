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
                        Gestionar
                    </button>
                    <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile"
                        type="button" role="tab" aria-controls="nav-profile" aria-selected="false">
                        + Crear
                    </button>
                    <!-- <button class="nav-link" id="nav-contact-tab" data-bs-toggle="tab" data-bs-target="#nav-contact" type="button" role="tab" aria-controls="nav-contact" aria-selected="false">Contact</button>
        <button class="nav-link" id="nav-disabled-tab" data-bs-toggle="tab" data-bs-target="#nav-disabled" type="button" role="tab" aria-controls="nav-disabled" aria-selected="false" disabled>Disabled</button> -->
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

                    <!-- Filtro por Convenio -->
                    <div class="filter-section mb-3">
                        <label class="me-2"><strong>Filtrar por Convenio:</strong></label>
                        <button v-for="conv in convenios" :key="conv"
                            @click="convenioSeleccionado = convenioSeleccionado === conv ? '' : conv"
                            :class="['btn btn-sm me-2 mb-2', convenioSeleccionado === conv ? 'btn-primary' : 'btn-outline-primary']">
                            {{ conv === 'sin-convenio' ? 'Usuarios Administrativos' : conv }} ({{
                                usuariosPorConvenio[conv] || 0 }})
                        </button>
                        <div class="mt-2">
                            <label for="busquedaUsuario" class="me-2"><strong>Buscar:</strong></label>
                            <input id="busquedaUsuario" v-model="busquedaUsuario" type="text" class="form-control"
                                placeholder="Correo o número de documento" />
                        </div>
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

                        <!-- Tabla compacta agrupada por convenio y luego por grupo -->
                        <div v-else-if="!loadingUsers">
                            <div v-if="Object.keys(usuariosAgrupadosPorConvenioYGrupoFiltrado).length === 0"
                                class="alert alert-info">
                                No se encontraron usuarios con el correo o documento ingresado.
                            </div>
                            <!-- Convenios -->
                            <div v-for="(gruposPorConvenio, convenio) in usuariosAgrupadosPorConvenioYGrupoFiltrado"
                                :key="convenio" class="convenio-section mb-4">
                                <div class="convenio-header">
                                    <span class="convenio-title">
                                        <i :class="convenio === 'sin-convenio' ? 'bi bi-shield-check' : 'bi bi-building'"
                                            class="me-2"></i>
                                        {{ convenio === 'sin-convenio' ? 'Usuarios Administrativos' : convenio }}
                                    </span>
                                    <span class="convenio-count">{{ contarUsuariosConvenio(gruposPorConvenio) }}</span>
                                </div>

                                <!-- Acordeón con grupos colapsables -->
                                <div class="accordion" :id="'accordion-' + sanitizeId(convenio)">
                                    <div v-for="(usuariosGrupo, grupo) in gruposPorConvenio" :key="grupo"
                                        class="accordion-item">
                                        <h2 class="accordion-header">
                                            <button class="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse"
                                                :data-bs-target="'#collapse-' + sanitizeId(convenio) + '-' + grupo"
                                                :aria-controls="'collapse-' + sanitizeId(convenio) + '-' + grupo">
                                                <i class="bi bi-people-fill me-2"></i>
                                                <span class="grupo-title-text">
                                                    {{ grupo === 'sin-grupo' ? 'Sin Grupo' : `Grupo ${grupo}` }}
                                                </span>
                                                <span class="ms-auto grupo-count">{{ usuariosGrupo.length }}</span>
                                            </button>
                                        </h2>
                                        <div :id="'collapse-' + sanitizeId(convenio) + '-' + grupo"
                                            class="accordion-collapse collapse">
                                            <div class="accordion-body p-0">
                                                <div class="tabla-usuarios">
                                                    <table class="table table-sm table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>Nombre</th>
                                                                <th>Cargo</th>
                                                                <th>Email</th>
                                                                <th>Documento</th>
                                                                <th title="Tiene profesionales delegados">Delegados</th>
                                                                <th>Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="(user, index) in usuariosGrupo" :key="index"
                                                                :class="'cargo-' + getCargoClass(user.cargo)">
                                                                <td>{{ user.nombre }}</td>
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
                                                                <td class="text-center">
                                                                    <span
                                                                        v-if="Array.isArray(user.accesosProfesionales) && user.accesosProfesionales.length > 0"
                                                                        class="badge bg-success"
                                                                        :title="user.accesosProfesionales.length + ' profesional(es) delegado(s)'"
                                                                    >
                                                                        <i class="bi bi-people-fill me-1"></i>{{ user.accesosProfesionales.length }}
                                                                    </span>
                                                                    <span v-else class="text-muted small">—</span>
                                                                </td>
                                                                <td>
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
                            <form @submit.prevent="guardarCambiosUsuario">
                                <div class="row">
                                    <div class="col col-12 col-md-6 mb-3">
                                        <label for="editConvenio">IPS / Programa</label>
                                        <select id="editConvenio" v-model="editConvenio" class="form-select">
                                            <option value="Extramural">Extramural</option>
                                            <option value="E Basicos">E Basicos</option>
                                            <option value="PIC">PIC</option>
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
                                    <div class="col col-12 col-md-6 mb-3" v-if="
                                        editCargo === 'Auxiliar de enfermeria' ||
                                        editCargo === 'Enfermero' ||
                                        editCargo === 'Medico' ||
                                        editCargo === 'Psicologo' ||
                                        editCargo === 'Tsocial' ||
                                        editCargo === 'Nutricionista'
                                    ">
                                        <label for="editGrupo"># Grupo(s)</label>
                                        <input type="text" id="editGrupo" v-model="editGrupo" class="form-control"
                                            placeholder="Ej: 1,2,F" />
                                    </div>
                                    <hr v-if="isAdmin">
                                    <div v-if="isAdmin" class="col col-12 mb-3">
                                        <label class="form-label mb-2"><h4>Profesionales Delegados</h4></label>
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
                    <!-- Carga masiva de usuarios por CSV -->
                    <div class="mt-5 p-4 border rounded bg-light">
                        <!-- La IPS efectiva depende del perfil autenticado -->
                        <div class="mb-3">
                            <label class="form-label fw-bold">
                                {{ isSuperUser ? 'Superusuario: cada fila debe indicar su IPS en la columna idips.' : 'Los usuarios cargados quedarán asociados a la IPS de tu sesión:' }}
                                <span v-if="!isSuperUser" class="text-primary">
                                    {{ $store?.state?.userData?.ipsId ? $store.state.userData.ipsId : 'No disponible' }}
                                </span>
                            </label>
                            <div v-if="!isSuperUser && !$store?.state?.userData?.ipsId" class="alert alert-danger mt-2">
                                No se detectó una IPS válida en tu sesión. No podrás cargar usuarios masivamente.
                            </div>
                        </div>
                        <h2 class="h5 mb-3"><i class="bi bi-upload"></i> Carga masiva de usuarios por CSV</h2>
                        <p>
                            Sube un archivo CSV con la siguiente estructura de columnas.
                            <strong v-if="isSuperUser">El campo <span class="text-primary">idips</span> es obligatorio para indicar la IPS de cada fila.</strong>
                            <strong v-else>La columna <span class="text-primary">idips</span> es opcional y se ignorará; se usará la IPS de tu sesión.</strong>
                            La columna <span class="text-primary">Rol</span> es opcional y no afecta la creación actual.
                        </p>
                        <p class="small text-muted mb-3">
                            En la columna <span class="text-primary">Cargo</span>, para el convenio <span class="text-primary">PIC</span> puedes cargar
                            <strong>Medico</strong>, <strong>Enfermero</strong>, <strong>Psicologo</strong>, <strong>Tsocial</strong> y <strong>Nutricionista</strong>.
                        </p>
                        <div class="table-responsive mb-2">
                            <table class="table table-bordered table-sm align-middle mb-0">
                                <thead class="table-secondary">
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Cargo</th>
                                        <th>Grupo</th>
                                        <th>Convenio</th>
                                        <th>Documento</th>
                                        <th>idips</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Juan Pérez</td>
                                        <td>juan@email.com</td>
                                        <td>admin</td>
                                        <td>Psicologo</td>
                                        <td>1</td>
                                        <td>PIC</td>
                                        <td>12345678</td>
                                        <td>ips_001</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <input type="file" accept=".csv" @change="handleCsvUpload" class="form-control mb-2" />
                        <button class="btn btn-success mt-2" :disabled="!(csvUsers && csvUsers.length) || loadingCsv || (!isSuperUser && !$store?.state?.userData?.ipsId)" @click="enviarCsvUsuarios">
                            <i class="bi bi-person-plus-fill"></i> Crear usuarios masivamente
                        </button>
                        <div v-if="csvError" class="alert alert-danger mt-2">{{ csvError }}</div>
                        <div v-if="csvSuccess" class="alert alert-success mt-2">{{ csvSuccess }}</div>
                        <div v-if="csvPreview && csvPreview.length">
                            <h6 class="mt-3">Vista previa de los primeros registros:</h6>
                            <table class="table table-sm table-striped">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Cargo</th>
                                        <th>Grupo</th>
                                        <th>Convenio</th>
                                        <th>Documento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, idx) in csvPreview" :key="idx">
                                        <td>{{ row.Nombre }}</td>
                                        <td>{{ row.Email }}</td>
                                        <td>{{ row.Rol }}</td>
                                        <td>{{ row.Cargo }}</td>
                                        <td>{{ row.Grupo }}</td>
                                        <td>{{ row.Convenio }}</td>
                                        <td>{{ row.Documento }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <form @submit.prevent="createUserByAdmin" :class="['form-convenio-wrapper', convenio === 'Extramural' ? 'convenio-extramural' : convenio === 'E Basicos' ? 'convenio-ebasicos' : convenio === 'PIC' ? 'convenio-pic' : '']">
                    <h1 class="display-6 mb-3">Crear Usuario</h1>

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
                                // Agregar bulkCreateUsers si lo creas en usersApi.js
                                <option v-for="ips in ipsListFiltrada" :key="ips.id" :value="ips.id">
                                    {{ ips.nombre || ips.name || ips.id }}
                                </option>
                            </select>

                            // Importar papaparse para parsear CSV
                            import Papa from "papaparse";
                            <div class="invalid-feedback" v-if="isAdmin && !selectedIpsId && formularioIntentado">
                                Debes seleccionar una IPS para el nuevo usuario.
                            </div>
                            <small class="text-muted mt-1 d-block" v-if="!selectedIpsId">
                                        csvUsers: [],
                                        csvPreview: [],
                                        csvError: "",
                                        csvSuccess: "",
                                        loadingCsv: false,
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
                                    <option value="Extramural">Extramural</option>
                                    <option value="E Basicos">E Basicos</option>
                                     <option value="PIC">PIC</option>
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

                            <div class="col col-12 col-md-4 mb-3" v-if="
                                cargo === 'Auxiliar de enfermeria' ||
                                cargo === 'Enfermero' ||
                                cargo === 'Medico' ||
                                cargo === 'Psicologo' ||
                                cargo === 'Tsocial' ||
                                cargo === 'Nutricionista'
                            ">
                                <label for="grupo"># Grupo(s)</label>
                                <input type="text" id="grupo" v-model="grupo" placeholder="Ej: 1,2,F" required />
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
                <div class="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab"
                    tabindex="0">
                    ...
                </div>
                <div class="tab-pane fade" id="nav-disabled" role="tabpanel" aria-labelledby="nav-disabled-tab"
                    tabindex="0">
                    ...
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Papa from "papaparse";
import { getCargoBadgeClass as getSharedCargoBadgeClass } from "@/utils/cargoBadges";
import {
    createUser,
    deleteUserById,
    documentExists,
    emailExists,
    getAllUsers,
    unlockUserById,
    updateUserPasswordById,
    updateUser,
} from "@/api/usersApi";
import {
    mapActions
} from "vuex";

export default {
    data() {
        return {
            /*  Creación de usuario */
            userEmail: "",
            nombre: "",
            numDocumento: "",
            grupo: "",
            cargo: "",
            convenio: "",

            /* Modal de edición */
            mostrarModalEdicion: false,
            usuarioEditando: null,
            editEmail: "",
            editNombre: "",
            editNumDocumento: "",
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
            csvUsers: [],
            csvPreview: [],
            csvError: "",
            csvSuccess: "",
            loadingCsv: false,
        };
    },
    computed: {
        convenios() {
            if (!this.users || this.users.length === 0) return [];
            const convSet = new Set(this.users.map(u => u.convenio || 'sin-convenio'));
            return Array.from(convSet).sort();
        },

        usuariosPorConvenio() {
            if (!this.users | this.users.length === 0) return {};
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

                const convenioUser = user.convenio || 'sin-convenio';
                const cumpleConvenio = !this.convenioSeleccionado || convenioUser === this.convenioSeleccionado;

                if (!cumpleConvenio) return false;

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

            // Verificar campos obligatorios básicos sin espacios en blanco
            const camposBasicos = convenio && cargo && documento && email && nombre;
            const grupoValido = !requiereGrupo || !!grupo;

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
        profesionalesDisponiblesParaAcceso() {
            const cargos = new Set(['Auxiliar de enfermeria', 'Medico', 'Enfermero', 'Psicologo', 'Tsocial', 'Nutricionista']);
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

            const cargos = new Set(['Auxiliar de enfermeria', 'Medico', 'Enfermero', 'Psicologo', 'Tsocial', 'Nutricionista']);
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
            // Asignar grupo automáticamente según el cargo
            if (newVal === 'admin') {
                this.grupo = '0';
            } else if (newVal === 'Fact') {
                this.grupo = 'F';
            }
        },
        editCargo(newVal) {
            // Asignar grupo automáticamente en edición
            if (newVal === 'admin') {
                this.editGrupo = '0';
            } else if (newVal === 'Fact') {
                this.editGrupo = 'F';
            }
        },
        numDocumento() {
            this.documentoValido = null;
        },
        userEmail() {
            this.emailValido = null;
        }
    },
    methods: {
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
            try {
                const res = await this.$api.bulkCreateUsers(this.csvUsers);
                let detallesErrores = '';
                if (res.detalles && Array.isArray(res.detalles) && res.detalles.length > 0) {
                    const errores = res.detalles.filter(d => d.status === 'error');
                    if (errores.length > 0) {
                        detallesErrores = '\nErrores:\n' + errores.map(e => `- ${e.email || ''}: ${e.error || ''}`).join('\n');
                    }
                }
                this.csvSuccess = `Usuarios creados: ${res.creados || 0}. Errores: ${res.errores || 0}${detallesErrores}`;
                this.csvUsers = [];
                this.csvPreview = [];
                // Opcional: recargar usuarios
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

        obtenerGruposUsuario(user) {
            const grupos = String(user?.grupo || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            return grupos.length ? grupos : ['sin-grupo'];
        },

        esCargoOculto(cargo) {
            return String(cargo || '').trim().toLowerCase() === 'superusuario';
        },

        cargoRequiereGrupo(cargo) {
            return [
                'Auxiliar de enfermeria',
                'Enfermero',
                'Medico',
                'Psicologo',
                'Tsocial',
                'Nutricionista'
            ].includes(String(cargo || '').trim());
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
            const grupoNum = parseInt(grupo) || 0;
            return grupoNum % 7;
        },

        getCargoClass(cargo) {
            const cargoMap = {
                'Auxiliar de enfermeria': 'aux',
                'Enfermero': 'enf',
                'Medico': 'med',
                'Fact': 'fact',
                'admin': 'admin',
                'Psicologo': 'psi',
                'Nutricionista': 'nut',
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
            this.editGrupo = user.grupo || '';
            this.editCargo = user.cargo;
            this.editConvenio = user.convenio || '';
            this.editAccesosProfesionales = Array.isArray(user.accesosProfesionales)
                ? [...user.accesosProfesionales]
                : [];
            this.filtroAccesoConvenio = "";
            this.filtroAccesoCargo = "";
            this.filtroAccesoTexto = "";
            this.mostrarModalEdicion = true;
        },

        cerrarModalEdicion() {
            this.mostrarModalEdicion = false;
            this.usuarioEditando = null;
            this.editAccesosProfesionales = [];
            this.filtroAccesoConvenio = "";
            this.filtroAccesoCargo = "";
            this.filtroAccesoTexto = "";
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
            if (!this.editNombre || !this.editNumDocumento || !this.editCargo) {
                this.message = "Por favor, completa todos los campos obligatorios.";
                this.messageType = "error";
                return;
            }

            this.editGrupo = this.normalizarGrupos(this.editGrupo);
            if (this.cargoRequiereGrupo(this.editCargo) && !this.editGrupo) {
                this.message = "El campo # Grupo(s) es obligatorio para el cargo seleccionado.";
                this.messageType = "error";
                return;
            }

            const accesosNormalizados = Array.from(
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
                await updateUser(this.usuarioEditando.uid, {
                    nombre: this.editNombre,
                    grupo: this.editGrupo,
                    cargo: this.editCargo,
                    ipsId: this.ips || null,
                    convenio: this.editConvenio,
                    accesosProfesionales: accesosNormalizados,
                });

                // Si el usuario editado es el usuario logueado, reflejar de inmediato los accesos en la sesión.
                const uidLogueado = String(this.$store?.state?.uid || '').trim();
                const uidEditado = String(this.usuarioEditando?.uid || '').trim();
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
                // Manejo mejorado de errores
                if (error.code === 'auth/email-already-in-use') {
                    this.message = "El email ya está en uso. Por favor utiliza otro email.";
                } else if (error.code === 'auth/invalid-email') {
                    this.message = "El email no es válido.";
                } else {
                    this.message = `Error al actualizar usuario: ${error.message}`;
                }
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
            this.grupo = this.normalizarGrupos(this.grupo);

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
                });

                this.message = `Usuario ${this.userEmail} creado exitosamente.\nContraseña temporal: ${tempPassword}\nEl usuario deberá cambiarla en su primer ingreso.`;
                this.messageType = "success";

                // Limpiar campos
                this.userEmail = "";
                this.nombre = "";
                this.grupo = "";
                this.numDocumento = "";
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
                if (error?.response?.status === 409) {
                    this.message = "El email ya está en uso. Por favor utiliza otro email.";
                } else if (error?.response?.status === 400) {
                    this.message = "El email no es válido.";
                } else {
                    this.message = `Error al crear usuario: ${error.message}`;
                }
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
                const users = await getAllUsers();
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

            if (this.convenio !== 'E Basicos' && soloEBasicos.includes(this.cargo)) {
                this.cargo = '';
            }

            if (this.convenio !== 'PIC' && soloPIC.includes(this.cargo)) {
                this.cargo = '';
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
/* Formulario de creación de usuario: coloración por convenio */
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
    overflow: hidden;
}

.tabla-usuarios .table {
    margin: 0;
    font-size: 0.9rem;
    table-layout: fixed;
}

/* Anchos de columnas */
.tabla-usuarios th:nth-child(1),
.tabla-usuarios td:nth-child(1) {
    width: 28%;
}

.tabla-usuarios th:nth-child(2),
.tabla-usuarios td:nth-child(2) {
    width: 10%;
}

.tabla-usuarios th:nth-child(3),
.tabla-usuarios td:nth-child(3) {
    width: 26%;
}

.tabla-usuarios th:nth-child(4),
.tabla-usuarios td:nth-child(4) {
    width: 13%;
}

.tabla-usuarios th:nth-child(5),
.tabla-usuarios td:nth-child(5) {
    width: 9%;
    text-align: center;
}

.tabla-usuarios th:nth-child(6),
.tabla-usuarios td:nth-child(6) {
    width: 14%;
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
        min-width: 550px;
        width: 100%;
        table-layout: auto;
    }

    .tabla-usuarios th:nth-child(1),
    .tabla-usuarios td:nth-child(1) {
        width: auto;
        min-width: 120px;
    }

    .tabla-usuarios th:nth-child(2),
    .tabla-usuarios td:nth-child(2) {
        width: auto;
        min-width: 70px;
    }

    .tabla-usuarios th:nth-child(3),
    .tabla-usuarios td:nth-child(3) {
        width: auto;
        min-width: 150px;
    }

    .tabla-usuarios th:nth-child(4),
    .tabla-usuarios td:nth-child(4) {
        width: auto;
        min-width: 70px;
    }

    .tabla-usuarios th:nth-child(5),
    .tabla-usuarios td:nth-child(5) {
        width: auto;
        min-width: 85px;
        white-space: nowrap;
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
        table-layout: auto;
        min-width: 600px;
        width: 100%;
    }

    .tabla-usuarios th:nth-child(1),
    .tabla-usuarios td:nth-child(1) {
        width: auto;
        min-width: 110px;
    }

    .tabla-usuarios th:nth-child(2),
    .tabla-usuarios td:nth-child(2) {
        width: auto;
        min-width: 65px;
    }

    .tabla-usuarios th:nth-child(3),
    .tabla-usuarios td:nth-child(3) {
        width: auto;
        min-width: 140px;
    }

    .tabla-usuarios th:nth-child(4),
    .tabla-usuarios td:nth-child(4) {
        width: auto;
        min-width: 65px;
    }

    .tabla-usuarios th:nth-child(5),
    .tabla-usuarios td:nth-child(5) {
        width: auto;
        min-width: 130px;
        white-space: nowrap;
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
        table-layout: auto;
        min-width: 600px;
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

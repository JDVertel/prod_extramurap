<template>
    <div>
        <div v-if="enviando" class="overlay-guardando active">
            <div class="progress-card shadow">
                <div class="h5 mb-3">Guardando registro</div>
                <div class="progress mb-2" role="progressbar" aria-label="Guardando registro" aria-valuemin="0"
                    aria-valuemax="100" style="height: 22px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
                        Guardando...
                    </div>
                </div>
                <div class="text-muted small">Guardando registro, por favor espere...</div>
            </div>
        </div>
        <div class="container-fluid" :aria-busy="enviando">
            <h4 class="center mt-2">
                <i class="bi bi-journal-medical"></i> Registro de Demanda Inducida
            </h4>
            <ProfesionalGrupoInfo :es-estado-view="esEstadoView" :grupo-override="grupoOperativo" />
            <br />
            <!-- FORMULARIO -->

            <form novalidate @submit.prevent="addRegistroEncuesta">
                <!-- SECCIÓN BÚSQUEDA -->
                <div class="row mb-4">
                    <div class="col-6 col-md-3 mb-3">
                        <label for="tipodoc" class="form-label campo-obligatorio">Tipo de Documento</label>
                        <select id="tipodoc" v-model="tipodoc" class="form-select" required>
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
                        </select>
                    </div>
                    <div class="col-6 col-md-3 mb-3">
                        <label for="numdoc" class="form-label campo-obligatorio">Número de Documento</label>
                        <input
                            type="text"
                            id="numdoc"
                            :value="numdoc"
                            class="form-control"
                            required
                            autocomplete="off"
                            inputmode="text"
                            pattern="[A-Za-z0-9]+"
                            title="Solo letras y números, sin signos ni caracteres especiales"
                            placeholder="Solo letras y números"
                            @input="onNumdocInput"
                        />
                        <div class="form-text">Solo alfanumérico (A-Z, 0-9). Sin puntos, guiones ni espacios.</div>
                    </div>
                    <div class="col-6 col-md-3 mb-4">
                        <button type="button" class="btn btn-primary mt-4" @click="consultar">
                            <i class="bi bi-search"></i> Consultar
                        </button>
                    </div>
                </div>

                <!-- ESTADO CONSULTA -->
                <div class="mb-4">

                    <div v-if="estadoConsulta === 'encuestado'" class="alert alert-danger" role="alert">
                        <i class="bi bi-x-circle"></i> Paciente encuestado previamente
                        <div class="mt-3" v-if="pacienteEncontrado">
                            <strong>Información de la encuesta existente:</strong>
                            <ul class="mt-2">
                                <li><strong>Fecha de encuesta:</strong> {{ pacienteEncontrado.fecha }}</li>
                                <li><strong>Encuestador:</strong> {{ nombreEncuestador || 'Cargando...' }}</li>
                                <li><strong>Convenio:</strong> {{ pacienteEncontrado.convenio }}</li>
                            </ul>
                        </div>
                    </div>
                    <div v-if="estadoConsulta === 'seguimiento'" class="alert alert-warning" role="alert">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <strong>Paciente ya registrado.</strong>
                        Se cargaron sus datos del paciente (incluida la información adicional); puede corregirlos antes de guardar el nuevo registro.
                        Equipos Básicos permite registros repetidos. En la caracterización podrá indicar si es
                        <strong>control</strong> o <strong>seguimiento</strong>.
                        <div class="mt-3" v-if="pacienteEncontrado">
                            <strong>Información del registro previo:</strong>
                            <ul class="mt-2 mb-0">
                                <li><strong>Fecha de encuesta:</strong> {{ pacienteEncontrado.fecha }}</li>
                                <li><strong>Encuestador:</strong> {{ nombreEncuestador || 'Cargando...' }}</li>
                                <li><strong>Convenio:</strong> {{ pacienteEncontrado.convenio }}</li>
                            </ul>
                        </div>
                    </div>
                    <div v-if="estadoConsulta === 'disponible'" class="alert alert-success" role="alert">
                        <i class="bi bi-check-circle-fill"></i> Paciente disponible para encuestar
                        <div class="mt-3" v-if="pacienteEncontrado && pacienteEncontrado.convenioDiferente">
                            <p class="mb-2">
                                <strong>Nota:</strong>
                                Este paciente fue encuestado previamente en el convenio
                                <strong>{{ pacienteEncontrado.convenio }}</strong>.
                                Se cargaron sus datos del paciente (incluida la información adicional);
                                puede corregirlos en este nuevo registro.
                            </p>
                            <ul class="mt-2 mb-0">
                                <li><strong>Fecha de encuesta:</strong> {{ pacienteEncontrado.fecha }}</li>
                                <li><strong>Encuestador:</strong> {{ nombreEncuestador || 'Cargando...' }}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- FORMULARIO PACIENTE -->
                <div v-if="mostrarFormularioEncuesta" class="form-section">

                    <div class="row mt-3">
                        <h2> <i class="bi bi-person-circle h2"></i> Datos del paciente</h2>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="eps" class="form-label campo-obligatorio">EPS del paciente</label>
                            <select id="eps" v-model="epsId" class="form-select" required>
                                <option value="">Seleccione</option>
                                <option v-for="(ep, index) in epssConContrato" :key="index" :value="ep.id">
                                    {{ ep.eps }}
                                </option>
                            </select>
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="regimen" class="form-label campo-obligatorio">Régimen del paciente</label>
                            <select id="regimen" v-model="regimen" class="form-select" required>
                                <option value="">Seleccione</option>
                                <option v-for="(regimen, index) in Dregimen" :key="index" :value="regimen.nombre">
                                    {{ regimen.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="nombre1" class="form-label campo-obligatorio">Primer Nombre</label>
                            <input type="text" id="nombre1" v-model="nombre1" class="form-control" required />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="nombre2" class="form-label">Segundo Nombre</label>
                            <input type="text" id="nombre2" v-model="nombre2" class="form-control" />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="apellido1" class="form-label campo-obligatorio">Primer Apellido</label>
                            <input type="text" id="apellido1" v-model="apellido1" class="form-control" required />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="apellido2" class="form-label">Segundo Apellido</label>
                            <input type="text" id="apellido2" v-model="apellido2" class="form-control" />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="fechaNac" class="form-label campo-obligatorio">Fecha de nacimiento</label>
                            <input type="date" id="fechaNac" v-model="fechaNac" class="form-control" :max="fechaActual"
                                required />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="sexo" class="form-label campo-obligatorio">Sexo</label>
                            <select id="sexo" v-model="sexo" class="form-select" required>
                                <option value="">---Seleccione---</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                        <div class="col-12 mb-3">
                            <div class="datos-paciente-extra">
                                <h6 class="datos-paciente-extra-titulo">
                                    <i class="bi bi-card-list"></i> Información adicional del paciente
                                </h6>
                                <div class="row">
                                    <div class="col-6 col-md-3 mb-3 mb-md-0">
                                        <label for="municipioNacimiento" class="form-label campo-obligatorio">Municipio de nacimiento</label>
                                        <input type="text" id="municipioNacimiento" v-model="municipioNacimiento" class="form-control" required />
                                    </div>
                                    <div class="col-6 col-md-3 mb-3 mb-md-0">
                                        <label for="departamentoNacimiento" class="form-label campo-obligatorio">Departamento de nacimiento</label>
                                        <select id="departamentoNacimiento" v-model="departamentoNacimiento" class="form-select" required>
                                            <option value="">---Seleccione---</option>
                                            <option v-for="(depto, index) in departamentosColombia" :key="`depto-${index}`" :value="depto">
                                                {{ depto }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-6 col-md-3 mb-3 mb-md-0">
                                        <label for="identidadGenero" class="form-label campo-obligatorio">Identidad de género</label>
                                        <select id="identidadGenero" v-model="identidadGenero" class="form-select" required>
                                            <option value="">---Seleccione---</option>
                                            <option v-for="(opcion, index) in identidadGeneroOptions" :key="`genero-${index}`" :value="opcion">
                                                {{ opcion }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-6 col-md-3 mb-3 mb-md-0">
                                        <label for="ocupacion" class="form-label campo-obligatorio">Ocupación</label>
                                        <select id="ocupacion" v-model="ocupacion" class="form-select" required>
                                            <option value="">---Seleccione---</option>
                                            <option v-for="(opcion, index) in ocupacionOptions" :key="`ocupacion-${index}`" :value="opcion">
                                                {{ opcion }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <label for="nivelOcupacion" class="form-label campo-obligatorio">Nivel ocupacional / Condición laboral</label>
                                        <select id="nivelOcupacion" v-model="nivelOcupacion" class="form-select" required>
                                            <option value="">---Seleccione---</option>
                                            <option
                                                v-for="(opcion, index) in nivelOcupacionOptions"
                                                :key="`nivel-${index}`"
                                                :value="opcion.value"
                                                :title="opcion.label"
                                            >
                                                {{ opcion.value }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-6 col-md-3 mb-3">
                            <label for="direccion" class="form-label campo-obligatorio">Dirección</label>
                            <input type="text" id="direccion" v-model="direccion" class="form-control" required />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="telefono" class="form-label campo-obligatorio">Teléfono</label>
                            <input type="number" id="telefono" v-model="telefono" class="form-control" required />
                        </div>

                        <div class="col-6 col-md-3 mb-3">
                            <label for="barrioVeredacomuna" class="form-label campo-obligatorio">Barrio-vereda/comuna</label>
                            <div class="position-relative barrio-autocomplete">
                                <input id="barrioVeredacomuna" v-model="barrioVeredacomunaSearch" type="text"
                                    class="form-control" placeholder="Clic para ver listado o escribe para filtrar"
                                    autocomplete="off"
                                    required @input="onBarrioInput" @focus="openBarrioDropdown = true"
                                    @blur="onBarrioInputBlur" />
                                <div v-if="openBarrioDropdown" class="barrio-dropdown-list">
                                    <button type="button" class="barrio-dropdown-item"
                                        v-for="(option, index) in filteredComunasBarrios" :key="`barrio-${index}`"
                                        @mousedown.prevent="selectBarrioOption(option)">
                                        {{ option.barrio }} ({{ option.comuna }})
                                    </button>
                                    <div v-if="filteredComunasBarrios.length === 0" class="barrio-dropdown-empty">
                                        Sin coincidencias
                                    </div>
                                    <div v-else-if="!barrioVeredacomunaSearch.trim()" class="barrio-dropdown-hint">
                                        Mostrando listado. Escribe para filtrar.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 ">
                            <label for="poblacionRiesgo" class="form-label">Población de Riesgo</label>
                            <div class="row g-2">
                                <div class="col-9">
                                    <select id="poblacionRiesgo" v-model="poblacionRiesgo" class="form-select">
                                        <option value="">---Seleccione---</option>
                                        <option :value="option2.nombre"
                                            v-for="(option2, index) in poblacionRiesgoDisponibles" :key="index">
                                            {{ option2.nombre }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-2">
                                    <button type="button" class="btn btn-warning w-100 mt-2"
                                        v-if="poblacionRiesgo !== ''" @click="addRiesgo">+ Agregar</button>
                                </div>
                            </div>
                            <div class="mt-2">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between align-items-center"
                                        v-for="(list, index) in ListpoblacionRiesgo" :key="index">
                                        <span>{{ list }}</span>
                                        <button type="button" class="btn btn-danger  btn-sm rounded-circle"
                                            @click="removeRiesgo(index)">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- DATOS DE ATENCIÓN -->
                        <div class="col-12">
                            <h2 class="mt-4 mb-3"> <i class="bi bi-clipboard-check h2"></i> Datos de Atención</h2>

                        </div>

                        <div class="col-12 col-md-6 mb-3">
                            <label for="tipoActividad" class="form-label campo-obligatorio">Tipo de Actividad (Proyectada)</label>
                            <div class="mt-2">
                                <ul class="list-group list-group-flush actividad-lista actividad-grid">
                                    <li class="list-group-item actividad-lista-item"
                                        v-for="(list, index) in ListtipoActividad" :key="index">
                                        <i class="bi bi-check-circle-fill actividad-check-icon"></i>
                                        <span>{{ list.nombre }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="col-6 ">
                            <label for="desplazamiento" class="form-label campo-obligatorio">¿Desplazamiento efectivo?</label>
                            <select id="desplazamiento" v-model="desplazamiento" class="form-select" required>
                                <option value="" disabled>---Seleccione---</option>
                                <option value="si">Sí</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="col-6 ">
                            <label for="requiereRemision" class="form-label campo-obligatorio">¿Requiere remisión a procedimiento?</label>
                            <select id="requiereRemision" v-model="requiereRemision" class="form-select" required>
                                <option value="" disabled>---Seleccione---</option>
                                <option value="si">Sí</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="col-12">
                            <h2 class="mt-4 mb-3"> <i class="bi bi-heart-pulse-fill h2"></i> Asignacion de profesionales
                            </h2>
                        </div>



                        <div class="col-6 col-md-3 mb-3">
                            <label for="medico" class="form-label campo-obligatorio">Médico</label>
                            <select id="medico" v-model="medico" class="form-select" required>
                                <option value="">---Seleccione---</option>
                                <option v-for="medico in medicosByGrupo" :key="medico.numDocumento"
                                    :value="medico.numDocumento">
                                    {{ medico.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="enfermero" class="form-label campo-obligatorio">Enfermero Jefe </label>
                            <select id="enfermero" v-model="enfermero" class="form-select" required>
                                <option value="">---Seleccione---</option>
                                <option v-for="enfermero in enfermerosByGrupo" :key="enfermero.numDocumento"
                                    :value="enfermero.numDocumento">
                                    {{ enfermero.nombre }}
                                </option>
                            </select>
                        </div>

                        <div v-if="mostrarPsicoTs" class="col-6 col-md-3 mb-3">
                            <label for="psicologo" class="form-label">Psicologo</label>
                            <select id="psicologo" v-model="psicologo" class="form-select">
                                <option value="">---Seleccione---</option>
                                <option v-for="psicologo in psicologosByGrupo" :key="psicologo.numDocumento"
                                    :value="psicologo.numDocumento">
                                    {{ psicologo.nombre }}
                                </option>
                            </select>
                        </div>

                        <div v-if="mostrarPsicoTs" class="col-6 col-md-3 mb-3">
                            <label for="trabajadorSocial" class="form-label">T social </label>
                            <select id="trabajadorSocial" v-model="trabajadorSocial" class="form-select">
                                <option value="">---Seleccione---</option>
                                <option v-for="trabajador in tsocialesByGrupo" :key="trabajador.numDocumento"
                                    :value="trabajador.numDocumento">
                                    {{ trabajador.nombre }}
                                </option>
                            </select>
                        </div>

                        <div v-if="requiereNutricionista" class="col-6 col-md-3 mb-3">
                            <label for="nutricionista" class="form-label">Nutricionista</label>
                            <select id="nutricionista" v-model="nutricionista" class="form-select">
                                <option value="">---Seleccione---</option>
                                <option v-for="nutricionistaUser in nutricionistasByGrupo" :key="nutricionistaUser.numDocumento"
                                    :value="nutricionistaUser.numDocumento">
                                    {{ nutricionistaUser.nombre }}
                                </option>
                            </select>
                        </div>

                        <div v-if="requiereHigienistaOral" class="col-6 col-md-3 mb-3">
                            <label for="higienistaOral" class="form-label">Higienista oral</label>
                            <select id="higienistaOral" v-model="higienistaOral" class="form-select">
                                <option value="">---Seleccione---</option>
                                <option v-for="higienista in higienistasOralByGrupo" :key="higienista.numDocumento"
                                    :value="higienista.numDocumento">
                                    {{ higienista.nombre }}
                                </option>
                            </select>
                        </div>

                        <!-- BOTÓN SUBMIT -->
                        <div class="col-12 mb-4">
                            <button type="submit" class="btn btn-primary" v-if="userData" :disabled="enviando">
                                <i class="bi bi-floppy"></i> Guardar Demanda inducida
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import {
    mapState,
    mapActions
} from "vuex";
import moment from "moment";
import { getAllUsers } from "@/api/usersApi";
import ProfesionalGrupoInfo from "@/components/ProfesionalGrupoInfo.vue";
import {
    buildEstadoViewQuery,
    getEstadoViewContext,
    isEstadoViewRoute,
} from "@/utils/estadoViewContext";

export default {
    components: {
        ProfesionalGrupoInfo,
    },
    data: () => ({
        epsId: "",
        regimen: "",
        fechaActual: moment().format("YYYY-MM-DD"),
        nombre1: "",
        nombre2: "",
        apellido1: "",
        apellido2: "",
        tipodoc: "",
        numdoc: "",
        sexo: "",
        departamentoNacimiento: "",
        municipioNacimiento: "",
        identidadGenero: "",
        ocupacion: "",
        nivelOcupacion: "",
        fechaNac: "",
        direccion: "",
        barrioVeredacomuna: "",
        barrioVeredacomunaSearch: "",
        openBarrioDropdown: false,
        telefono: "",
        desplazamiento: "",
        tipoActividad: "",
        poblacionRiesgo: "",
        requiereRemision: "",
        medico: "",
        enfermero: "",
        psicologo: "",
        trabajadorSocial: "",
        nutricionista: "",
        higienistaOral: "",
        enviando: false,
        estadoConsulta: null, // 'encuestado', 'disponible', 'seguimiento' o null
        pacienteEncontrado: null,
        nombreEncuestador: "",

        poblacionRiesgoOptions: [{
            nombre: "Gestante",
        },
        {
            nombre: "Menor a 5 años",
        },
        {
            nombre: "Discapacidad",
        },
        {
            nombre: "Adulto mayor",
        },
        {
            nombre: "Orientacion sexual diversa",
        },
        {
            nombre: "Grupo etnico",
        },
        ],

        Dregimen: [{
            nombre: "Contributivo",
        },
        {
            nombre: "Subsidiado",
        },
        {
            nombre: "Especial",
        },
        {
            nombre: "PPNA",
        },
        ],
        departamentosColombia: [
            "Amazonas",
            "Antioquia",
            "Arauca",
            "Atlántico",
            "Bogotá D.C.",
            "Bolívar",
            "Boyacá",
            "Caldas",
            "Caquetá",
            "Casanare",
            "Cauca",
            "Cesar",
            "Chocó",
            "Córdoba",
            "Cundinamarca",
            "Guainía",
            "Guaviare",
            "Huila",
            "La Guajira",
            "Magdalena",
            "Meta",
            "Nariño",
            "Norte de Santander",
            "Putumayo",
            "Quindío",
            "Risaralda",
            "San Andrés y Providencia",
            "Santander",
            "Sucre",
            "Tolima",
            "Valle del Cauca",
            "Vaupés",
            "Vichada",
        ],
        identidadGeneroOptions: [
            "Masculino / Hombre",
            "Femenino / Mujer",
            "Transgénero / Trans (Mujer trans, Hombre trans)",
            "No binario",
            "Otra",
            "Sin información / Prefiere no responder",
        ],
        ocupacionOptions: [
            "Estudiante",
            "Hogar / Labores de cuidado no remunerado",
            "Empleado / Trabajador dependiente (sector formal)",
            "Trabajador independiente / Cuenta propia",
            "Informal / Oficios varios",
            "Agricultor / Campesino / Jornalero",
            "Desempleado / Cesante (buscando empleo)",
            "Jubilado / Pensionado",
            "Incapacitado permanente para trabajar",
            "Oficios tradicionales / Sabedor ancestral (pesca, artesanía, medicina tradicional)",
        ],
        nivelOcupacionOptions: [
            {
                value: "Directivo / Directiva / Gerencial",
                label: "Directivo / Directiva / Gerencial: Cargos de alta dirección, toma de decisiones o grandes empleadores.",
            },
            {
                value: "Profesional / Especializado",
                label: "Profesional / Especializado: Labores que requieren título universitario o postgrado.",
            },
            {
                value: "Técnico / Tecnólogo",
                label: "Técnico / Tecnólogo: Ocupaciones que requieren formación técnica o tecnológica intermedia.",
            },
            {
                value: "Auxiliar / Operativo",
                label: "Auxiliar / Operativo: Personal de apoyo administrativo, ventas, servicios básicos o conducción.",
            },
            {
                value: "Operario / Mano de obra no calificada",
                label: "Operario / Mano de obra no calificada: Labores operativas directas, del campo, construcción o servicios generales sin requerimiento de titulación previa.",
            },
            {
                value: "Sin nivel ocupacional",
                label: "Sin nivel ocupacional: Personas en situación de desempleo, dedicadas exclusivamente al hogar, estudiantes o menores de edad.",
            },
        ],
        ListpoblacionRiesgo: [],
        ListtipoActividad: [],
    }),
    methods: {
        sanitizarDocumento(valor) {
            return String(valor ?? "").replace(/[^A-Za-z0-9]/g, "");
        },

        onNumdocInput(event) {
            const limpio = this.sanitizarDocumento(event?.target?.value);
            this.numdoc = limpio;
            if (event?.target && event.target.value !== limpio) {
                event.target.value = limpio;
            }
        },

        estaVacio(valor) {
            if (Array.isArray(valor)) return valor.length === 0;
            if (valor && typeof valor === "object") return Object.keys(valor).length === 0;
            return String(valor ?? "").trim() === "";
        },

        obtenerCamposObligatoriosFaltantes() {
            const campos = [
                { label: "EPS del paciente", value: this.epsId, id: "eps" },
                { label: "Régimen del paciente", value: this.regimen, id: "regimen" },
                { label: "Primer Nombre", value: this.nombre1, id: "nombre1" },
                { label: "Primer Apellido", value: this.apellido1, id: "apellido1" },
                { label: "Fecha de nacimiento", value: this.fechaNac, id: "fechaNac" },
                { label: "Sexo", value: this.sexo, id: "sexo" },
                { label: "Municipio de nacimiento", value: this.municipioNacimiento, id: "municipioNacimiento" },
                { label: "Departamento de nacimiento", value: this.departamentoNacimiento, id: "departamentoNacimiento" },
                { label: "Identidad de género", value: this.identidadGenero, id: "identidadGenero" },
                { label: "Ocupación", value: this.ocupacion, id: "ocupacion" },
                { label: "Nivel ocupacional / Condición laboral", value: this.nivelOcupacion, id: "nivelOcupacion" },
                { label: "Tipo de Documento", value: this.tipodoc, id: "tipodoc" },
                { label: "Número de Documento", value: this.numdoc, id: "numdoc" },
                { label: "Dirección", value: this.direccion, id: "direccion" },
                { label: "Teléfono", value: this.telefono, id: "telefono" },
                { label: "Barrio-vereda/comuna", value: this.barrioVeredacomuna, id: "barrioVeredacomuna" },
                { label: "Tipo de Actividad (Proyectada)", value: this.ListtipoActividad },
                { label: "Desplazamiento efectivo", value: this.desplazamiento, id: "desplazamiento" },
                { label: "Requiere remisión a procedimiento", value: this.requiereRemision, id: "requiereRemision" },
                { label: "Documento del encuestador", value: this.documentoOperativo },
                { label: "Médico", value: this.medico, id: "medico" },
                { label: "Enfermero Jefe", value: this.enfermero, id: "enfermero" },
            ];

            return campos.filter((campo) => this.estaVacio(campo.value));
        },

        enfocarCampoObligatorio(campo) {
            if (!campo?.id) return;
            this.$nextTick(() => {
                const elemento = this.$el.querySelector(`#${campo.id}`);
                if (!elemento) return;
                elemento.focus();
                elemento.scrollIntoView({ behavior: "smooth", block: "center" });
            });
        },

        async addRegistroEncuesta() {
            if (this.enviando) return;
            this.enviando = true;
            this.numdoc = this.sanitizarDocumento(this.numdoc);

            // Validar que el paciente haya sido consultado
            if (this.estadoConsulta === null) {
                alert("Por favor, consulte primero si el paciente está disponible para encuestar.");
                this.enviando = false;
                return;
            }

            // Validar que el paciente no haya sido encuestado previamente
            // (excepto Equipos Básicos: permite seguimiento)
            if (this.estadoConsulta === "encuestado") {
                alert("Este paciente ya fue encuestado previamente. No se puede guardar el registro.");
                this.enviando = false;
                return;
            }

            if (this.estadoConsulta !== "disponible" && this.estadoConsulta !== "seguimiento") {
                alert("Por favor, consulte primero si el paciente está disponible para encuestar.");
                this.enviando = false;
                return;
            }

            if (this.estadoConsulta === "seguimiento") {
                const confirmarSeguimiento = confirm(
                    "Este paciente ya existe en Equipos Básicos.\n\nSe creará un nuevo registro. En la caracterización podrá seleccionar control o seguimiento. ¿Desea continuar?"
                );
                if (!confirmarSeguimiento) {
                    this.enviando = false;
                    return;
                }
            }

            const requierePsicoTs = this.mostrarPsicoTs;
            const requiereNutricionista = this.requiereNutricionista;
            const requiereHigienistaOral = this.requiereHigienistaOral;

            // Validación de campos obligatorios
            const camposFaltantes = this.obtenerCamposObligatoriosFaltantes();
            if (camposFaltantes.length) {
                const listadoCampos = camposFaltantes.map((campo) => `- ${campo.label}`).join("\n");
                alert(`Faltan campos obligatorios por completar:\n${listadoCampos}`);
                this.enfocarCampoObligatorio(camposFaltantes[0]);
                this.enviando = false;
                return;
            }

            // Validación especial para Psicólogo y Trabajador Social en E Basicos
            if (requierePsicoTs || requiereNutricionista || requiereHigienistaOral) {
                let mensajeAdvertencia = "";
                const faltaPsicologo = !this.psicologo;
                const faltaTSocial = !this.trabajadorSocial;
                const faltaNutricionista = !this.nutricionista;
                const faltaHigienistaOral = !this.higienistaOral;

                if (requierePsicoTs && requiereNutricionista && requiereHigienistaOral && faltaPsicologo && faltaTSocial && faltaNutricionista && faltaHigienistaOral) {
                    mensajeAdvertencia = "No ha seleccionado Psicólogo, Trabajador Social, Nutricionista ni Higienista oral.";
                } else if (requierePsicoTs && requiereNutricionista && faltaPsicologo && faltaTSocial && faltaNutricionista) {
                    mensajeAdvertencia = "No ha seleccionado Psicólogo, Trabajador Social ni Nutricionista.";
                } else if (requierePsicoTs && faltaPsicologo) {
                    mensajeAdvertencia = "No ha seleccionado Psicólogo.";
                } else if (requierePsicoTs && faltaTSocial) {
                    mensajeAdvertencia = "No ha seleccionado Trabajador Social.";
                } else if (requiereNutricionista && faltaNutricionista) {
                    mensajeAdvertencia = "No ha seleccionado Nutricionista.";
                } else if (requiereHigienistaOral && faltaHigienistaOral) {
                    mensajeAdvertencia = "No ha seleccionado Higienista oral.";
                }

                if (mensajeAdvertencia) {
                    const confirmar = confirm(
                        mensajeAdvertencia + "\n\n¿Desea cancelar para corregir o continuar de todas formas?"
                    );
                    if (!confirmar) {
                        this.enviando = false;
                        return;
                    }
                }
            }

            const registro = {
                tipoRegistro: this.convenioOperativo || "Extramural",
                fechavisita: "",
                idMedicoAtiende: this.medico,
                idEnfermeroAtiende: this.enfermero,
                ...(requierePsicoTs && this.psicologo
                    ? { idPsicologoAtiende: this.psicologo }
                    : {}),
                ...(requierePsicoTs && this.trabajadorSocial
                    ? { idTsocialAtiende: this.trabajadorSocial }
                    : {}),
                ...(requiereNutricionista && this.nutricionista
                    ? { idNutricionistaAtiende: this.nutricionista }
                    : {}),
                ...(requiereHigienistaOral && this.higienistaOral
                    ? { idHigienistaOralAtiende: this.higienistaOral }
                    : {}),
                status_gest_aux: false,
                status_gest_medica: false,
                status_gest_enfermera: false,
                status_gest_psicologo: false,
                status_gest_tsocial: false,
                status_gest_nutricionista: false,
                status_gest_higienista_oral: false,
                status_caracterizacion: false,
                status_visita: false,
                idEncuesta: 1,
                grupo: this.grupoOperativo,
                convenio: this.convenioOperativo,
                idEncuestador: this.documentoOperativo,
                bd: "Encuesta",
                fecha: moment().format("YYYY-MM-DD"),
                fechaNac: this.fechaNac,
                epsId: this.epsId,
                eps: this.epsSeleccionada ? this.epsSeleccionada.eps : "",
                regimen: this.regimen,
                nombre1: this.nombre1,
                nombre2: this.nombre2,
                apellido1: this.apellido1,
                apellido2: this.apellido2,
                tipodoc: this.tipodoc,
                numdoc: this.sanitizarDocumento(this.numdoc),
                sexo: this.sexo,
                departamentoNacimiento: this.departamentoNacimiento,
                municipioNacimiento: this.municipioNacimiento,
                identidadGenero: this.identidadGenero,
                ocupacion: this.ocupacion,
                nivelOcupacion: this.nivelOcupacion,
                direccion: this.direccion,
                telefono: this.telefono,
                barrioVeredacomuna: this.barrioVeredacomuna,
                desplazamiento: this.desplazamiento,
                poblacionRiesgo: this.ListpoblacionRiesgo,
                requiereRemision: this.requiereRemision,
                /*  */
                tipoActividad: this.ListtipoActividad,
            };
            try {
                await this.createNewRegister(registro);
                alert("Registro creado exitosamente");
                this.resetForm();
                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
                this.$router.push({
                    path: "/sop_aux",
                    query: buildEstadoViewQuery(this.$route),
                });
            } catch (error) {
                console.error("Error al crear el registro:", error);
                const detail = error?.response?.data?.detail || error?.response?.data?.message || error?.message;
                alert(`Error al crear el registro: ${detail}`);
            } finally {
                this.enviando = false;
            }
        },

        // Método para asegurar que la página se pueda desplazar
        ensureScrollability() {
            // Remover cualquier clase que pueda estar bloqueando el scroll
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';

            // Asegurar que el documento sea desplazable
            if (document.body.scrollHeight <= window.innerHeight) {
                document.body.style.minHeight = (window.innerHeight + 100) + 'px';
            }
        },

        ...mapActions([
            "createNewRegister",
            "getAllComunaBarrios",
            "getAllMedicosbyGrupo",
            "getAllEnfermerosbyGrupo",
            "getAllPsicologosbyGrupo",
            "getAllTsocialesbyGrupo",
            "getAllNutricionistasbyGrupo",
            "getAllHigienistasOralbyGrupo",
            "getAllEps",
            "getAllContratos",
            "getAllActividadesExtra",
        ]),

        async consultar() {
            const tipodocNormalizado = String(this.tipodoc ?? "").trim();
            const numdocNormalizado = this.sanitizarDocumento(this.numdoc);
            this.numdoc = numdocNormalizado;

            // Validar datos mínimos de búsqueda
            if (!tipodocNormalizado) {
                alert("Por favor, seleccione el tipo de documento.");
                return;
            }

            if (!numdocNormalizado) {
                alert("Por favor, ingrese el número de documento (solo letras y números).");
                return;
            }

            if (!/^[A-Za-z0-9]+$/.test(numdocNormalizado)) {
                alert("El número de documento solo puede contener letras y números, sin signos ni caracteres especiales.");
                return;
            }

            const convenioUsuario = String(this.convenioOperativo || "").trim();
            const esConvenioEBasicos = convenioUsuario === "E Basicos";

            try {
                // Si el usuario es E Basicos, consultar por tipo + número + convenio
                // En otros convenios, consultar por tipo + número para evitar falsos disponibles
                const resultado = esConvenioEBasicos
                    ? await this.$store.dispatch('getAllByPacientesIDEB', {
                        tipodoc: tipodocNormalizado,
                        numdoc: numdocNormalizado,
                        convenio: "E Basicos",
                    })
                    : await this.$store.dispatch('getAllByPacientesID', {
                        tipodoc: tipodocNormalizado,
                        numdoc: numdocNormalizado,
                    });

                // Si hay resultados, verificar convenio
                if (resultado && Array.isArray(resultado) && resultado.length > 0) {
                    // Buscar si alguno de los registros tiene el mismo convenio que el usuario logueado
                    const pacienteMismoConvenio = resultado.find(
                        (r) => String(r.convenio || "").trim().toLowerCase() === convenioUsuario.toLowerCase()
                    );
                    if (pacienteMismoConvenio) {
                        // Equipos Básicos: permite repetir como seguimiento
                        if (esConvenioEBasicos) {
                            this.estadoConsulta = "seguimiento";
                            this.pacienteEncontrado = pacienteMismoConvenio;
                            this.precargarDatosPaciente(pacienteMismoConvenio);
                            await this.obtenerNombreEncuestador(this.pacienteEncontrado.idEncuestador);
                        } else {
                            this.estadoConsulta = "encuestado";
                            this.pacienteEncontrado = pacienteMismoConvenio;
                            await this.obtenerNombreEncuestador(this.pacienteEncontrado.idEncuestador);
                        }
                    } else {
                        // Si no hay registro en el mismo convenio, precargar solo datos del paciente
                        this.estadoConsulta = "disponible";
                        const otroConvenio = resultado[0];
                        this.pacienteEncontrado = {
                            ...otroConvenio,
                            convenioDiferente: true
                        };
                        this.precargarDatosPaciente(otroConvenio);
                        await this.obtenerNombreEncuestador(otroConvenio.idEncuestador);
                    }
                } else {
                    this.estadoConsulta = "disponible";
                    this.pacienteEncontrado = null;
                    this.nombreEncuestador = "";
                }
            } catch (error) {
                console.error("Error al consultar paciente:", error);
                // Si no encuentra la acción en el store, mostrar mensaje amigable
                console.warn("Verificar que las acciones de consulta estén definidas en el store");
                alert("Error al consultar el paciente. Por favor, intente nuevamente.");
            }
        },

        async obtenerNombreEncuestador(idEncuestador) {
            try {
                const usuarios = await getAllUsers();
                const usuario = usuarios.find(
                    (u) => String(u.numDocumento || "").trim() === String(idEncuestador || "").trim()
                );

                if (usuario) {
                    this.nombreEncuestador = usuario.nombre || "Nombre no disponible";
                } else {
                    this.nombreEncuestador = "Usuario no encontrado";
                }
            } catch (error) {
                console.error("Error al obtener encuestador:", error);
                this.nombreEncuestador = "Error al cargar nombre";
            }
        },

        normalizarFechaCampo(valor) {
            if (valor === null || valor === undefined || valor === "") return "";
            if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
                const yyyy = valor.getFullYear();
                const mm = String(valor.getMonth() + 1).padStart(2, "0");
                const dd = String(valor.getDate()).padStart(2, "0");
                return `${yyyy}-${mm}-${dd}`;
            }
            const text = String(valor).trim();
            if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
            const match = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
            if (match) {
                return `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
            }
            return "";
        },

        normalizarTextoComparable(valor) {
            return String(valor ?? "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");
        },

        coincidirOpcionLista(valor, opciones = []) {
            const buscado = this.normalizarTextoComparable(valor);
            if (!buscado) return null;
            const lista = Array.isArray(opciones) ? opciones : [];
            const exacta = lista.find((op) => this.normalizarTextoComparable(op) === buscado);
            if (exacta !== undefined) return exacta;
            const parcial = lista.find((op) => {
                const actual = this.normalizarTextoComparable(op);
                return actual.includes(buscado) || buscado.includes(actual);
            });
            return parcial !== undefined ? parcial : null;
        },

        coincidirNivelOcupacion(valor) {
            const buscado = this.normalizarTextoComparable(valor);
            if (!buscado) return null;
            const opciones = Array.isArray(this.nivelOcupacionOptions) ? this.nivelOcupacionOptions : [];
            const porValor = opciones.find((op) => this.normalizarTextoComparable(op.value) === buscado);
            if (porValor) return porValor.value;
            const porLabel = opciones.find((op) => this.normalizarTextoComparable(op.label).includes(buscado)
                || buscado.includes(this.normalizarTextoComparable(op.value)));
            return porLabel ? porLabel.value : null;
        },

        /** Precarga solo datos del paciente (editables). No carga actividades ni profesionales. */
        precargarDatosPaciente(paciente = {}) {
            if (!paciente || typeof paciente !== "object") return;

            const pick = (...vals) => {
                for (const val of vals) {
                    if (val === null || val === undefined) continue;
                    const text = typeof val === "string" ? val.trim() : val;
                    if (text === "") continue;
                    return text;
                }
                return null;
            };

            const nombre1 = pick(paciente.nombre1);
            const nombre2 = pick(paciente.nombre2);
            const apellido1 = pick(paciente.apellido1);
            const apellido2 = pick(paciente.apellido2);
            const fechaNac = this.normalizarFechaCampo(paciente.fechaNac ?? paciente.fecha_nac);
            const sexo = pick(paciente.sexo);
            const departamentoNacimiento = this.coincidirOpcionLista(
                pick(paciente.departamentoNacimiento, paciente.departamento_nacimiento),
                this.departamentosColombia
            );
            const municipioNacimiento = pick(
                paciente.municipioNacimiento,
                paciente.municipio_nacimiento
            );
            const identidadGenero = this.coincidirOpcionLista(
                pick(paciente.identidadGenero, paciente.identidad_genero),
                this.identidadGeneroOptions
            );
            const ocupacion = this.coincidirOpcionLista(
                pick(paciente.ocupacion),
                this.ocupacionOptions
            );
            const nivelOcupacion = this.coincidirNivelOcupacion(
                pick(paciente.nivelOcupacion, paciente.nivel_ocupacion)
            );
            const direccion = pick(paciente.direccion);
            const telefono = pick(paciente.telefono);
            const regimen = pick(paciente.regimen);

            if (nombre1 !== null) this.nombre1 = nombre1;
            if (nombre2 !== null) this.nombre2 = nombre2;
            if (apellido1 !== null) this.apellido1 = apellido1;
            if (apellido2 !== null) this.apellido2 = apellido2;
            if (fechaNac) this.fechaNac = fechaNac;
            if (sexo !== null) this.sexo = sexo;
            if (departamentoNacimiento !== null) this.departamentoNacimiento = departamentoNacimiento;
            if (municipioNacimiento !== null) this.municipioNacimiento = municipioNacimiento;
            if (identidadGenero !== null) this.identidadGenero = identidadGenero;
            if (ocupacion !== null) this.ocupacion = ocupacion;
            if (nivelOcupacion !== null) this.nivelOcupacion = nivelOcupacion;
            if (direccion !== null) this.direccion = direccion;
            if (telefono !== null) this.telefono = telefono;
            if (regimen !== null) this.regimen = regimen;

            const epsId = pick(paciente.epsId, paciente.eps_id);
            if (epsId !== null) {
                this.epsId = epsId;
            } else {
                const epsNombre = pick(paciente.eps);
                if (epsNombre && Array.isArray(this.epssConContrato)) {
                    const epsMatch = this.epssConContrato.find(
                        (ep) => this.normalizarTextoComparable(ep?.eps) === this.normalizarTextoComparable(epsNombre)
                    );
                    if (epsMatch?.id) this.epsId = epsMatch.id;
                }
            }

            const barrioRaw = paciente.barrioVeredacomuna ?? paciente.barrio_vereda_comuna;
            if (barrioRaw && typeof barrioRaw === "object") {
                this.barrioVeredacomuna = barrioRaw;
                const barrio = barrioRaw.barrio || "";
                const comuna = barrioRaw.comuna || "";
                this.barrioVeredacomunaSearch = [barrio, comuna].filter(Boolean).join(" - ");
            } else if (typeof barrioRaw === "string" && barrioRaw.trim()) {
                try {
                    const parsed = JSON.parse(barrioRaw);
                    if (parsed && typeof parsed === "object") {
                        this.barrioVeredacomuna = parsed;
                        this.barrioVeredacomunaSearch = [parsed.barrio, parsed.comuna]
                            .filter(Boolean)
                            .join(" - ");
                    }
                } catch (_) {
                    this.barrioVeredacomunaSearch = barrioRaw.trim();
                }
            }

            const riesgos = paciente.poblacionRiesgo ?? paciente.poblacion_riesgo;
            if (Array.isArray(riesgos)) {
                this.ListpoblacionRiesgo = [...riesgos];
            } else if (typeof riesgos === "string" && riesgos.trim()) {
                try {
                    const parsed = JSON.parse(riesgos);
                    if (Array.isArray(parsed)) this.ListpoblacionRiesgo = [...parsed];
                } catch (_) {
                    // ignore
                }
            }
        },

        // Compatibilidad con llamadas previas
        precargarDatosPacienteSeguimiento(paciente = {}) {
            this.precargarDatosPaciente(paciente);
        },

        addRiesgo() {
            if (
                this.poblacionRiesgo !== "" &&
                this.poblacionRiesgo !== null &&
                this.poblacionRiesgo !== undefined
            ) {
                // Verifica si el elemento ya existe en el array
                if (!this.ListpoblacionRiesgo.includes(this.poblacionRiesgo)) {
                    this.ListpoblacionRiesgo.push(this.poblacionRiesgo);
                    this.$nextTick(() => {
                        const items = this.$el.querySelectorAll(".comb_B .list-group-item");
                        if (items.length > 0) {
                            items[items.length - 1].scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                        }
                    });
                } else {
                    alert("Este elemento ya fue agregado.");
                }
                this.poblacionRiesgo = "";
            } else {
                alert("Seleccione una opción válida.");
            }
        },

        addActividad() {
            if (
                this.tipoActividad !== "" &&
                this.tipoActividad !== null &&
                this.tipoActividad !== undefined
            ) {
                if (this.tipoActividad === "__ALL__") {
                    const existentes = new Set(this.ListtipoActividad.map((item) => item.key));
                    this.tipoActividadDisponibles.forEach((actividad) => {
                        if (!existentes.has(actividad.key)) {
                            this.ListtipoActividad.push(actividad);
                        }
                    });
                    this.$nextTick(() => {
                        const items = this.$el.querySelectorAll(".comb_A .list-group-item");
                        if (items.length > 0) {
                            items[items.length - 1].scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                        }
                    });
                } else {
                    // Verifica si el elemento ya existe en el array
                    if (!this.ListtipoActividad.includes(this.tipoActividad)) {
                        this.ListtipoActividad.push(this.tipoActividad);
                        this.$nextTick(() => {
                            const items = this.$el.querySelectorAll(".comb_A .list-group-item");
                            if (items.length > 0) {
                                items[items.length - 1].scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                });
                            }
                        });
                    } else {
                        alert("Este elemento ya fue agregado.");
                    }
                }
                this.tipoActividad = "";
            } else {
                alert("Seleccione una opción válida.");
            }
        },

        removeActividad(index) {
            this.ListtipoActividad.splice(index, 1);
        },
        getBarrioComunaLabel(option) {
            if (!option) return "";
            return `${option.barrio || ""} (${option.comuna || ""})`;
        },
        onBarrioInput() {
            const texto = String(this.barrioVeredacomunaSearch || "").trim().toLowerCase();
            this.openBarrioDropdown = true;

            if (!texto) {
                this.barrioVeredacomuna = "";
                return;
            }

            const coincideSeleccionActual = this.getBarrioComunaLabel(this.barrioVeredacomuna)
                .trim()
                .toLowerCase() === texto;

            if (!coincideSeleccionActual) {
                this.barrioVeredacomuna = "";
            }
        },
        selectBarrioOption(option) {
            this.barrioVeredacomuna = option;
            this.barrioVeredacomunaSearch = this.getBarrioComunaLabel(option);
            this.openBarrioDropdown = false;
        },
        onBarrioInputBlur() {
            // Espera breve para permitir click en opcion antes de ocultar.
            setTimeout(() => {
                this.openBarrioDropdown = false;
            }, 120);
        },
        removeRiesgo(index) {
            this.ListpoblacionRiesgo.splice(index, 1);
        },
        primerDocumentoDisponible(lista = []) {
            if (!Array.isArray(lista) || lista.length === 0) return "";
            const primero = lista.find((item) => item && item.numDocumento);
            return primero ? String(primero.numDocumento) : "";
        },
        aplicarProfesionalesPorDefecto() {
            if (!this.medico) {
                this.medico = this.primerDocumentoDisponible(this.medicosByGrupo);
            }

            if (!this.enfermero) {
                this.enfermero = this.primerDocumentoDisponible(this.enfermerosByGrupo);
            }

            if (this.mostrarPsicoTs) {
                if (!this.psicologo) {
                    this.psicologo = this.primerDocumentoDisponible(this.psicologosByGrupo);
                }
                if (!this.trabajadorSocial) {
                    this.trabajadorSocial = this.primerDocumentoDisponible(this.tsocialesByGrupo);
                }
            }

            if (this.requiereNutricionista) {
                if (!this.nutricionista) {
                    this.nutricionista = this.primerDocumentoDisponible(this.nutricionistasByGrupo);
                }
            }

            if (this.requiereHigienistaOral) {
                if (!this.higienistaOral) {
                    this.higienistaOral = this.primerDocumentoDisponible(this.higienistasOralByGrupo);
                }
            }
        },
        cargarActividadesPorDefecto() {
            if (!Array.isArray(this.actividadesExtra) || this.actividadesExtra.length === 0) {
                this.ListtipoActividad = [];
                return;
            }

            const mapa = new Map();

            this.actividadesExtra.forEach((actividad, index) => {
                const key = String(
                    actividad?.key ||
                    actividad?.clave ||
                    actividad?.id ||
                    actividad?.actividadId ||
                    `actividad_${index + 1}`
                ).trim();

                if (!key || mapa.has(key)) return;

                mapa.set(key, {
                    ...actividad,
                    key,
                    nombre: actividad?.nombre || actividad?.descripcion || key,
                });
            });

            this.ListtipoActividad = Array.from(mapa.values());
        },
        updateBarrios() {
            this.getAllComunaBarrios()
                .then(() => {
                    alert("Barrios actualizados correctamente");
                })
                .catch((error) => {
                    console.error("Error al actualizar barrios:", error);
                    alert("Error al actualizar barrios");
                });
        },
        resetForm() {
            this.regimen = "";
            this.epsId = "";
            this.nombre1 = "";
            this.nombre2 = "";
            this.apellido1 = "";
            this.apellido2 = "";
            this.tipodoc = "";
            this.numdoc = "";
            this.direccion = "";
            this.fechaNac = "";
            this.sexo = "";
            this.departamentoNacimiento = "";
            this.municipioNacimiento = "";
            this.identidadGenero = "";
            this.ocupacion = "";
            this.nivelOcupacion = "";
            this.telefono = "";
            this.barrioVeredacomuna = "";
            this.barrioVeredacomunaSearch = "";
            this.openBarrioDropdown = false;
            this.desplazamiento = "";
            this.tipoActividad = "";
            this.poblacionRiesgo = "";
            this.requiereRemision = "";
            this.ListpoblacionRiesgo = [];
            this.ListtipoActividad = [];
            this.enfermero = "";
            this.medico = "";
            this.psicologo = "";
            this.trabajadorSocial = "";
            this.nutricionista = "";
            this.higienistaOral = "";
            this.estadoConsulta = null;
            this.pacienteEncontrado = null;
            this.nombreEncuestador = "";

            this.$nextTick(() => {
                this.aplicarProfesionalesPorDefecto();
            });
        },

        /*      AllMedicosbyGrupo() {
                     this.getAllMedicosbyGrupo();
                 } */
    },

    computed: {
        ...mapState([
            "contador",
            "comunasBarrios",
            "userData",
            "medicosByGrupo",
            "enfermerosByGrupo",
            "psicologosByGrupo",
            "tsocialesByGrupo",
            "nutricionistasByGrupo",
            "higienistasOralByGrupo",
            "epss",
            "contratos",
            "actividadesExtra",
        ]),
        contextoDelegado() {
            return getEstadoViewContext(this.$route, this.userData);
        },
        esEstadoView() {
            return isEstadoViewRoute(this.$route, this.userData);
        },
        grupoOperativo() {
            return this.contextoDelegado.grupo;
        },
        convenioOperativo() {
            return this.contextoDelegado.convenio;
        },
        documentoOperativo() {
            return this.contextoDelegado.documento;
        },
        esConvenioEBasicos() {
            return String(this.convenioOperativo || "").trim() === "E Basicos";
        },
        mostrarFormularioEncuesta() {
            return this.estadoConsulta === "disponible" || this.estadoConsulta === "seguimiento";
        },
        esConvenioPIC() {
            return String(this.convenioOperativo || "").trim() === "PIC";
        },
        esConvenioUnidesa() {
            const convenioUsuario = String(this.convenioOperativo || "").trim().toLowerCase();
            return convenioUsuario === "unidesa" || convenioUsuario === "unides";
        },
        mostrarPsicoTs() {
            return this.esConvenioEBasicos || this.esConvenioPIC;
        },
        requiereNutricionista() {
            return this.esConvenioPIC;
        },
        requiereHigienistaOral() {
            return this.esConvenioUnidesa;
        },
        epssConContrato() {
            if (!this.epss) return [];

            // Mostrar todas las EPS excepto las que contengan asterisco
            return this.epss.filter(eps => !String(eps.eps || '').includes('*'));
        },
        epsSeleccionada() {
            if (!this.epsId || !this.epss) return null;
            return this.epss.find(e => e.id === this.epsId);
        },
        tipoActividadDisponibles() {
            if (!this.actividadesExtra || this.actividadesExtra.length === 0) return [];
            const seleccionadas = new Set(this.ListtipoActividad.map((item) => item.key));
            return this.actividadesExtra.filter(
                (actividad) => !seleccionadas.has(actividad.key)
            );
        },
        poblacionRiesgoDisponibles() {
            const seleccionadas = new Set(this.ListpoblacionRiesgo);
            return this.poblacionRiesgoOptions.filter(
                (riesgo) => !seleccionadas.has(riesgo.nombre)
            );
        },
        filteredComunasBarrios() {
            const lista = Array.isArray(this.comunasBarrios) ? this.comunasBarrios : [];
            const texto = String(this.barrioVeredacomunaSearch || "").trim().toLowerCase();

            // Sin texto: mostrar listado completo (desplazable hacia abajo).
            if (!texto) {
                return lista.slice(0, 200);
            }

            return lista
                .filter((option) => {
                    const barrio = String(option?.barrio || "").toLowerCase();
                    const comuna = String(option?.comuna || "").toLowerCase();
                    return barrio.includes(texto) || comuna.includes(texto);
                })
                .slice(0, 80);
        },
    },
    watch: {
        numdoc(nuevoValor) {
            const limpio = this.sanitizarDocumento(nuevoValor);
            if (limpio !== String(nuevoValor ?? "")) {
                this.numdoc = limpio;
                return;
            }
            this.estadoConsulta = null;
            this.pacienteEncontrado = null;
            this.nombreEncuestador = "";
        },
        tipodoc() {
            this.estadoConsulta = null;
            this.pacienteEncontrado = null;
            this.nombreEncuestador = "";
        },
        mostrarPsicoTs(valor) {
            if (!valor) {
                this.psicologo = "";
                this.trabajadorSocial = "";
                return;
            }

            this.aplicarProfesionalesPorDefecto();
        },
        requiereNutricionista(valor) {
            if (!valor) {
                this.nutricionista = "";
                return;
            }

            this.aplicarProfesionalesPorDefecto();
        },
        requiereHigienistaOral(valor) {
            if (!valor) {
                this.higienistaOral = "";
                return;
            }

            this.aplicarProfesionalesPorDefecto();
        },
        medicosByGrupo() {
            this.aplicarProfesionalesPorDefecto();
        },
        enfermerosByGrupo() {
            this.aplicarProfesionalesPorDefecto();
        },
        psicologosByGrupo() {
            this.aplicarProfesionalesPorDefecto();
        },
        tsocialesByGrupo() {
            this.aplicarProfesionalesPorDefecto();
        },
        nutricionistasByGrupo() {
            this.aplicarProfesionalesPorDefecto();
        },
        higienistasOralByGrupo() {
            this.aplicarProfesionalesPorDefecto();
        },
        actividadesExtra() {
            this.cargarActividadesPorDefecto();
        },
    },
    async mounted() {
        await this.getAllComunaBarrios();
        await this.getAllEps();
        await this.getAllContratos();
        await this.getAllActividadesExtra();
        const grupo = this.grupoOperativo;
        const convenio = this.convenioOperativo;
        await this.getAllMedicosbyGrupo({ grupo, convenio });
        await this.getAllEnfermerosbyGrupo({ grupo, convenio });
        if (this.mostrarPsicoTs) {
            await this.getAllPsicologosbyGrupo({ grupo, convenio });
            await this.getAllTsocialesbyGrupo({ grupo, convenio });
        }
        if (this.requiereNutricionista) {
            await this.getAllNutricionistasbyGrupo({ grupo, convenio });
        }
        if (this.requiereHigienistaOral) {
            await this.getAllHigienistasOralbyGrupo({ grupo, convenio });
        }

        this.aplicarProfesionalesPorDefecto();
        this.cargarActividadesPorDefecto();
        // Asegurar que la página sea desplazable al montar el componente
        this.ensureScrollability();
    },

    beforeUnmount() {
        // Limpiar cualquier estilo que pueda interferir al salir del componente
        this.ensureScrollability();
    },
};
</script>

<style scoped>
html,
body,
#app {
    height: auto;
}

.container-fluid {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

.container-fluid[aria-busy="true"] {
    opacity: 0.7;
    pointer-events: none;
}

.container-fluid[aria-busy="false"],
.container-fluid:not([aria-busy]) {
    opacity: 1;
    pointer-events: auto;
}

form {
    display: flex;
    flex-direction: column;
}

/* Asegurar que el formulario no se quede pegado */
body.modal-open {
    overflow: auto !important;
    padding-right: 0 !important;
}

.form-label.campo-obligatorio::after {
    content: " *";
    color: #dc3545;
    font-weight: 700;
}

.form-section {
    background-color: #f2e6ff;
    border-radius: 5px;
    border: 1px solid #ccc;
    padding: 1.5rem;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
}

.datos-paciente-extra {
    background-color: #d9f2ee;
    border: 1px solid #1a8a7c;
    border-left: 5px solid #0b6b5f;
    border-radius: 8px;
    padding: 1rem 1.25rem 0.25rem;
}

.datos-paciente-extra-titulo {
    color: #063f39;
    font-size: 0.98rem;
    font-weight: 700;
    margin-bottom: 0.85rem;
}

.datos-paciente-extra .form-label {
    color: #124740;
    font-size: 0.92rem;
    font-weight: 600;
}

.datos-paciente-extra .form-control,
.datos-paciente-extra .form-select {
    background-color: #ffffff;
    border-color: #7eb8af;
    color: #102925;
}

.datos-paciente-extra .form-control:focus,
.datos-paciente-extra .form-select:focus {
    background-color: #fff;
    border-color: #0b6b5f;
    box-shadow: 0 0 0 0.2rem rgba(11, 107, 95, 0.25);
}

.row {
    display: flex;
    flex-wrap: wrap;
    margin-right: -0.5rem;
    margin-left: -0.5rem;
}

.col-6 {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
}

.col-12 {
    width: 100%;
}

.g-2 {
    gap: 0.5rem;
}

.overlay-guardando {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.9);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.overlay-guardando.active {
    pointer-events: all;
    opacity: 1;
    visibility: visible;
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

.center {
    text-align: center;
}

/* Mejorar listados */
.list-group-item {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    padding: 0.75rem 1rem;
}

.list-group-item:hover {
    background-color: #e9ecef;
}

/* Scroll suave en navegadores */
html {
    scroll-behavior: smooth;
}

/* Asegurar que el formulario sea responsivo */
@media (max-width: 768px) {
    .col-md-3 {
        width: 50%;
    }

    .col-md-6 {
        width: 100%;
    }

    .form-section {
        padding: 1rem;
    }
}

/* Estilos para botones redondeados */
.btn.rounded-circle {
    width: 40px;
    height: 40px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn.rounded-circle:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.barrio-autocomplete {
    z-index: 5;
}

.barrio-dropdown-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    max-height: 280px;
    overflow-y: auto;
    z-index: 30;
}

.barrio-dropdown-item {
    width: 100%;
    text-align: left;
    background: #fff;
    border: 0;
    border-bottom: 1px solid #f1f3f5;
    padding: 9px 12px;
    font-size: 0.95rem;
}

.barrio-dropdown-item:hover {
    background: #f8f9fa;
}

.barrio-dropdown-empty {
    padding: 10px 12px;
    color: #6c757d;
    font-size: 0.92rem;
}

.barrio-dropdown-hint {
    padding: 8px 12px;
    color: #6c757d;
    font-size: 0.8rem;
    border-top: 1px solid #f1f3f5;
    background: #fafafa;
}

.actividad-lista-item {
    padding: 0.45rem 0.7rem;
    font-size: 0.84rem;
    line-height: 1.2;
}

.actividad-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
}

.actividad-grid .actividad-lista-item {
    border: 1px solid #d9dee3;
    border-radius: 6px;
    margin: 0;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    gap: 8px;
}

.actividad-check-icon {
    color: #198754;
    font-size: 0.9rem;
    flex-shrink: 0;
}

@media (max-width: 768px) {
    .actividad-grid {
        grid-template-columns: 1fr;
    }
}
</style>

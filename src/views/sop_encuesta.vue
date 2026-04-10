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
            <br />
            <!-- FORMULARIO -->

            <form @submit.prevent="addRegistroEncuesta">
                <!-- SECCIÓN BÚSQUEDA -->
                <div class="row mb-4">
                    <div class="col-6 col-md-3 mb-3">
                        <label for="tipodoc" class="form-label">Tipo de Documento</label>
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
                        <label for="numdoc" class="form-label">Número de Documento</label>
                        <input type="text" id="numdoc" v-model="numdoc" class="form-control" required />
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
                    <div v-if="estadoConsulta === 'disponible'" class="alert alert-success" role="alert">
                        <i class="bi bi-check-circle-fill"></i> Paciente disponible para encuestar
                        <div class="mt-3" v-if="pacienteEncontrado && pacienteEncontrado.convenioDiferente">
                            <div style="display: flex; align-items: stretch; justify-content: space-between;">
                                <span style="display: flex; align-items: center;">
                                    <strong>Nota:</strong> Este paciente fue encuestado previamente en el convenio <b>{{ pacienteEncontrado.convenio }}</b>.
                                </span>
                                <span style="display: flex; align-items: center; height: 100%;">
                                    <span style="display: flex; align-items: center; justify-content: center; height: 60px; width: 60px; background: rgba(13,110,253,0.12); border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                                        <i class="bi bi-info-circle-fill" style="color: #0d6efd; font-size: 2.5em;"></i>
                                    </span>
                                </span>
                            </div>
                            <ul class="mt-2">
                                <li><strong>Fecha de encuesta:</strong> {{ pacienteEncontrado.fecha }}</li>
                                <li><strong>Encuestador:</strong> {{ nombreEncuestador || 'Cargando...' }}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- FORMULARIO PACIENTE -->
                <div v-if="estadoConsulta === 'disponible'" class="form-section">

                    <div class="row mt-3">
                        <h2> <i class="bi bi-person-circle h2"></i> Datos del paciente</h2>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="eps" class="form-label">EPS del paciente</label>
                            <select id="eps" v-model="epsId" class="form-select" required>
                                <option value="">Seleccione</option>
                                <option v-for="(ep, index) in epssConContrato" :key="index" :value="ep.id">
                                    {{ ep.eps }}
                                </option>
                            </select>
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="regimen" class="form-label">Regimen del paciente</label>
                            <select id="regimen" v-model="regimen" class="form-select" required>
                                <option value="">Seleccione</option>
                                <option v-for="(regimen, index) in Dregimen" :key="index" :value="regimen.nombre">
                                    {{ regimen.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="nombre1" class="form-label">Primer Nombre</label>
                            <input type="text" id="nombre1" v-model="nombre1" class="form-control" required />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="nombre2" class="form-label">Segundo Nombre</label>
                            <input type="text" id="nombre2" v-model="nombre2" class="form-control" />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="apellido1" class="form-label">Primer Apellido</label>
                            <input type="text" id="apellido1" v-model="apellido1" class="form-control" required />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="apellido2" class="form-label">Segundo Apellido</label>
                            <input type="text" id="apellido2" v-model="apellido2" class="form-control" />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="fechaNac" class="form-label">Fecha de nacimiento</label>
                            <input type="date" id="fechaNac" v-model="fechaNac" class="form-control" :max="fechaActual"
                                required />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="sexo" class="form-label">Sexo</label>
                            <select id="sexo" v-model="sexo" class="form-select" required>
                                <option value="">---Seleccione---</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        <div class="col-6 col-md-3 mb-3">
                            <label for="direccion" class="form-label">Dirección</label>
                            <input type="text" id="direccion" v-model="direccion" class="form-control" required />
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="telefono" class="form-label">Teléfono</label>
                            <input type="number" id="telefono" v-model="telefono" class="form-control" required />
                        </div>

                        <div class="col-6 col-md-3 mb-3">
                            <label for="barrioVeredacomuna" class="form-label">Barrio-vereda/comuna</label>
                            <select id="barrioVeredacomuna" v-model="barrioVeredacomuna" class="form-select" required>
                                <option value="">---Seleccione---</option>
                                <option :value="option" v-for="(option, index) in comunasBarrios" :key="index">
                                    {{ option.barrio }} ({{ option.comuna }})
                                </option>
                            </select>
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
                            <label for="tipoActividad" class="form-label">Tipo de Actividad (Proyectada)</label>
                            <div class="row g-2">
                                <div class="col-9">
                                    <select id="tipoActividad" v-model="tipoActividad" class="form-select">
                                        <option value="">Seleccione</option>
                                        <option value="__ALL__">Todas</option>
                                        <option :value="option" v-for="(option, index) in tipoActividadDisponibles"
                                            :key="index">
                                            {{ option.nombre }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-2">
                                    <button type="button" class="btn btn-warning w-100 mt-2" v-if="tipoActividad !== ''"
                                        @click="addActividad">+ Agregar</button>
                                </div>
                            </div>

                            <div class="mt-2">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between align-items-center"
                                        v-for="(list, index) in ListtipoActividad" :key="index">
                                        <span>{{ list.nombre }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="col-6 ">
                            <label for="desplazamiento" class="form-label">¿Desplazamiento efectivo?</label>
                            <select id="desplazamiento" v-model="desplazamiento" class="form-select" required>
                                <option value="" disabled>---Seleccione---</option>
                                <option value="si">Sí</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                        <div class="col-6 ">
                            <label for="requiereRemision" class="form-label">¿Requiere remisión a procedimiento?</label>
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
                            <label for="medico" class="form-label">Médico</label>
                            <select id="medico" v-model="medico" class="form-select" required>
                                <option value="">---Seleccione---</option>
                                <option v-for="medico in medicosByGrupo" :key="medico.numDocumento"
                                    :value="medico.numDocumento">
                                    {{ medico.nombre }}
                                </option>
                            </select>
                        </div>
                        <div class="col-6 col-md-3 mb-3">
                            <label for="enfermero" class="form-label">Enfermero Jefe </label>
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

export default {
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
        fechaNac: "",
        direccion: "",
        barrioVeredacomuna: "",
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
        enviando: false,
        estadoConsulta: null, // 'encuestado', 'disponible' o null
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
        ListpoblacionRiesgo: [],
        ListtipoActividad: [],
    }),
    methods: {
        async addRegistroEncuesta() {
            if (this.enviando) return;
            this.enviando = true;

            // Validar que el paciente haya sido consultado
            if (this.estadoConsulta === null) {
                alert("Por favor, consulte primero si el paciente está disponible para encuestar.");
                this.enviando = false;
                return;
            }

            // Validar que el paciente no haya sido encuestado previamente
            if (this.estadoConsulta === "encuestado") {
                alert("Este paciente ya fue encuestado previamente. No se puede guardar el registro.");
                this.enviando = false;
                return;
            }

            const requierePsicoTs = this.mostrarPsicoTs;
            const requiereNutricionista = this.requiereNutricionista;

            // Validación de campos obligatorios
            if (
                !this.epsId ||
                !this.regimen ||
                !this.nombre1 ||
                !this.apellido1 ||
                !this.fechaNac ||
                !this.sexo ||
                !this.tipodoc ||
                !this.numdoc ||
                !this.direccion ||
                !this.telefono ||
                !this.barrioVeredacomuna ||
                this.ListtipoActividad.length === 0 ||
                !this.desplazamiento ||
                !this.requiereRemision ||
                !this.userData.numDocumento ||
                !this.medico ||
                !this.enfermero
            ) {
                alert("Por favor, complete todos los campos obligatorios o logeate nuevamente.");
                this.enviando = false;
                return;
            }

            // Validación especial para Psicólogo y Trabajador Social en E Basicos
            if (requierePsicoTs || requiereNutricionista) {
                let mensajeAdvertencia = "";
                const faltaPsicologo = !this.psicologo;
                const faltaTSocial = !this.trabajadorSocial;
                const faltaNutricionista = !this.nutricionista;

                if (requierePsicoTs && requiereNutricionista && faltaPsicologo && faltaTSocial && faltaNutricionista) {
                    mensajeAdvertencia = "No ha seleccionado Psicólogo, Trabajador Social ni Nutricionista.";
                } else if (requierePsicoTs && faltaPsicologo) {
                    mensajeAdvertencia = "No ha seleccionado Psicólogo.";
                } else if (requierePsicoTs && faltaTSocial) {
                    mensajeAdvertencia = "No ha seleccionado Trabajador Social.";
                } else if (requiereNutricionista && faltaNutricionista) {
                    mensajeAdvertencia = "No ha seleccionado Nutricionista.";
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
                tipoRegistro: "Extramural",
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
                status_gest_aux: false,
                status_gest_medica: false,
                status_gest_enfermera: false,
                status_gest_psicologo: false,
                status_gest_tsocial: false,
                status_gest_nutricionista: false,
                status_caracterizacion: false,
                status_visita: false,
                idEncuesta: 1,
                grupo: this.userData.grupo,
                convenio: this.userData.convenio,
                idEncuestador: this.userData.numDocumento,
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
                numdoc: this.numdoc,
                sexo: this.sexo,
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
                this.$router.push("/sop_aux");
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
            "getAllEps",
            "getAllContratos",
            "getAllActividadesExtra",
        ]),

        async consultar() {
            const tipodocNormalizado = String(this.tipodoc ?? "").trim();
            const numdocNormalizado = String(this.numdoc ?? "").trim();

            // Validar datos mínimos de búsqueda
            if (!tipodocNormalizado) {
                alert("Por favor, seleccione el tipo de documento.");
                return;
            }

            if (!numdocNormalizado) {
                alert("Por favor, ingrese el número de documento.");
                return;
            }

            const convenioUsuario = String(this.userData?.convenio ?? "").trim();
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
                        this.estadoConsulta = "encuestado";
                        this.pacienteEncontrado = pacienteMismoConvenio;
                        await this.obtenerNombreEncuestador(this.pacienteEncontrado.idEncuestador);
                    } else {
                        // Si no hay registro en el mismo convenio, mostrar info del otro convenio
                        this.estadoConsulta = "disponible";
                        const otroConvenio = resultado[0];
                        this.pacienteEncontrado = {
                            ...otroConvenio,
                            convenioDiferente: true
                        };
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
            this.telefono = "";
            this.barrioVeredacomuna = "";
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
            "epss",
            "contratos",
            "actividadesExtra",
        ]),
        esConvenioEBasicos() {
            const convenioUsuario = String(this.userData?.convenio ?? "").trim();
            return convenioUsuario === "E Basicos";
        },
        esConvenioPIC() {
            const convenioUsuario = String(this.userData?.convenio ?? "").trim();
            return convenioUsuario === "PIC";
        },
        mostrarPsicoTs() {
            return this.esConvenioEBasicos || this.esConvenioPIC;
        },
        requiereNutricionista() {
            return this.esConvenioPIC;
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
    },
    watch: {
        numdoc() {
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
        actividadesExtra() {
            this.cargarActividadesPorDefecto();
        },
    },
    async mounted() {
        await this.getAllComunaBarrios();
        await this.getAllEps();
        await this.getAllContratos();
        await this.getAllActividadesExtra();
        await this.getAllMedicosbyGrupo({
            grupo: this.userData.grupo,
            convenio: this.userData.convenio,
        });
        await this.getAllEnfermerosbyGrupo({
            grupo: this.userData.grupo,
            convenio: this.userData.convenio,
        });
        if (this.mostrarPsicoTs) {
            await this.getAllPsicologosbyGrupo({
                grupo: this.userData.grupo,
                convenio: this.userData.convenio,
            });
            await this.getAllTsocialesbyGrupo({
                grupo: this.userData.grupo,
                convenio: this.userData.convenio,
            });
        }
        if (this.requiereNutricionista) {
            await this.getAllNutricionistasbyGrupo({
                grupo: this.userData.grupo,
                convenio: this.userData.convenio,
            });
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

.form-section {
    background-color: #f2e6ff;
    border-radius: 5px;
    border: 1px solid #ccc;
    padding: 1.5rem;
    margin-bottom: 2rem;
    position: relative;
    z-index: 1;
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
</style>

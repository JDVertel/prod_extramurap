<template>
  <div v-if="visible" class="gestionar-overlay" @click.self="cerrar">
    <div class="gestionar-modal shadow-lg" role="dialog" aria-modal="true" aria-labelledby="gestionarTitulo">
      <div class="gestionar-header">
        <h5 id="gestionarTitulo" class="mb-0">
          <i class="bi bi-gear-fill me-2"></i>Gestionar registro
        </h5>
        <button type="button" class="btn-close btn-close-white" aria-label="Cerrar" :disabled="guardando" @click="cerrar"></button>
      </div>

      <div class="gestionar-body">
        <div v-if="cargando" class="text-center py-5 text-muted">
          <div class="spinner-border text-teal mb-2" role="status"></div>
          <div>Cargando datos del paciente...</div>
        </div>

        <div v-else-if="errorCarga" class="alert alert-danger">
          {{ errorCarga }}
        </div>

        <form v-else class="row g-2" @submit.prevent="guardar">
          <div class="col-12">
            <h6 class="seccion-titulo">Documento</h6>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Tipo documento</label>
            <select v-model="form.tipodoc" class="form-select form-select-sm" required @change="onDocumentoChange">
              <option value="">Seleccione</option>
              <option value="RC">RC</option>
              <option value="TI">TI</option>
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="NV">NV</option>
              <option value="PA">PA</option>
              <option value="PE">PE</option>
              <option value="MS">MS</option>
              <option value="AS">AS</option>
              <option value="PT">PT</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Número documento</label>
            <input
              :value="form.numdoc"
              type="text"
              class="form-control form-control-sm"
              required
              autocomplete="off"
              @input="onNumdocInput"
            />
          </div>
          <div class="col-12" v-if="documentoModificado && estadoDocumento">
            <div v-if="estadoDocumento === 'encuestado'" class="alert alert-danger py-2 mb-1" role="alert">
              <i class="bi bi-x-circle"></i>
              Este documento ya tiene encuesta en el convenio <strong>{{ convenioActual }}</strong>.
              No se puede guardar con este tipo/número.
              <div v-if="pacienteDocumentoEncontrado" class="small mt-1">
                Fecha: {{ pacienteDocumentoEncontrado.fecha || "N/A" }}
                | Encuestador: {{ pacienteDocumentoEncontrado.idEncuestador || "N/A" }}
              </div>
            </div>
            <div v-else-if="estadoDocumento === 'seguimiento'" class="alert alert-warning py-2 mb-1" role="alert">
              <i class="bi bi-exclamation-triangle-fill"></i>
              Este documento ya existe en Equipos Básicos. Al guardar se pedirá confirmación (seguimiento/control).
            </div>
            <div v-else-if="estadoDocumento === 'disponible'" class="alert alert-success py-2 mb-1" role="alert">
              <i class="bi bi-check-circle-fill"></i>
              Documento disponible
              <span v-if="pacienteDocumentoEncontrado?.convenioDiferente">
                (existe en otro convenio: {{ pacienteDocumentoEncontrado.convenio }}).
              </span>
            </div>
          </div>

          <div class="col-12 mt-2">
            <h6 class="seccion-titulo">Datos del paciente</h6>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">EPS</label>
            <input
              type="text"
              class="form-control form-control-sm"
              :value="epsNombreMostrada"
              disabled
              readonly
              title="La EPS no se puede modificar desde esta gestión"
            />
            <small class="text-muted">La EPS no se puede cambiar</small>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Régimen</label>
            <select v-model="form.regimen" class="form-select form-select-sm" required>
              <option value="">Seleccione</option>
              <option v-for="item in regimenOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Primer nombre</label>
            <input v-model="form.nombre1" type="text" class="form-control form-control-sm" required />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Segundo nombre</label>
            <input v-model="form.nombre2" type="text" class="form-control form-control-sm" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Primer apellido</label>
            <input v-model="form.apellido1" type="text" class="form-control form-control-sm" required />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Segundo apellido</label>
            <input v-model="form.apellido2" type="text" class="form-control form-control-sm" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Fecha nacimiento</label>
            <input v-model="form.fechaNac" type="date" class="form-control form-control-sm" required />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Sexo</label>
            <select v-model="form.sexo" class="form-select form-select-sm" required>
              <option value="">Seleccione</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Teléfono</label>
            <input v-model="form.telefono" type="text" class="form-control form-control-sm" required />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Dirección</label>
            <input v-model="form.direccion" type="text" class="form-control form-control-sm" required />
          </div>

          <div class="col-6 col-md-3">
            <label class="form-label">Municipio nacimiento</label>
            <input v-model="form.municipioNacimiento" type="text" class="form-control form-control-sm" required />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Departamento nacimiento</label>
            <select v-model="form.departamentoNacimiento" class="form-select form-select-sm" required>
              <option value="">Seleccione</option>
              <option v-for="depto in departamentosColombia" :key="depto" :value="depto">{{ depto }}</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Identidad de género</label>
            <select v-model="form.identidadGenero" class="form-select form-select-sm" required>
              <option value="">Seleccione</option>
              <option v-for="opcion in identidadGeneroOptions" :key="opcion" :value="opcion">{{ opcion }}</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Ocupación</label>
            <select v-model="form.ocupacion" class="form-select form-select-sm" required>
              <option value="">Seleccione</option>
              <option v-for="opcion in ocupacionOptions" :key="opcion" :value="opcion">{{ opcion }}</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Nivel ocupacional</label>
            <select v-model="form.nivelOcupacion" class="form-select form-select-sm" required>
              <option value="">Seleccione</option>
              <option v-for="opcion in nivelOcupacionOptions" :key="opcion.value" :value="opcion.value">
                {{ opcion.value }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Barrio / vereda - comuna</label>
            <input
              v-model="barrioSearch"
              type="text"
              class="form-control form-control-sm"
              placeholder="Escribe barrio o comuna"
              autocomplete="off"
              @input="onBarrioInput"
              @focus="openBarrioDropdown = true"
              @blur="onBarrioBlur"
            />
            <div v-if="openBarrioDropdown && barrioSearch.trim()" class="barrio-dropdown-list">
              <button
                v-for="(option, index) in filteredComunasBarrios"
                :key="`barrio-${index}`"
                type="button"
                class="barrio-dropdown-item"
                @mousedown.prevent="selectBarrio(option)"
              >
                {{ option.barrio }} ({{ option.comuna }})
              </button>
              <div v-if="filteredComunasBarrios.length === 0" class="barrio-dropdown-empty">Sin coincidencias</div>
            </div>
          </div>

          <div class="col-6 col-md-3">
            <label class="form-label">Desplazamiento efectivo</label>
            <select v-model="form.desplazamiento" class="form-select form-select-sm" required>
              <option value="">Seleccione</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Requiere remisión</label>
            <select v-model="form.requiereRemision" class="form-select form-select-sm" required>
              <option value="">Seleccione</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>

          <div class="col-12 mt-2">
            <h6 class="seccion-titulo">Población de riesgo</h6>
          </div>
          <div class="col-9 col-md-6">
            <select v-model="riesgoSeleccionado" class="form-select form-select-sm">
              <option value="">Seleccione</option>
              <option v-for="item in riesgosDisponibles" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div class="col-3 col-md-2">
            <button type="button" class="btn btn-warning btn-sm w-100" :disabled="!riesgoSeleccionado" @click="agregarRiesgo">
              + Agregar
            </button>
          </div>
          <div class="col-12">
            <div class="d-flex flex-wrap gap-2">
              <span v-for="(riesgo, index) in form.poblacionRiesgo" :key="`riesgo-${index}`" class="badge text-bg-light border">
                {{ riesgo }}
                <button type="button" class="btn-close btn-close-sm ms-1" aria-label="Quitar" @click="quitarRiesgo(index)"></button>
              </span>
              <span v-if="!form.poblacionRiesgo.length" class="text-muted small">Sin población de riesgo</span>
            </div>
          </div>

          <div class="col-12 mt-2">
            <h6 class="seccion-titulo">Profesionales asignados</h6>
            <p class="small text-muted mb-2">
              Puede completar vacantes y cambiar solo a quienes aún no hayan gestionado ni registrado CUPS.
              Las opciones se limitan a profesionales del <strong>mismo grupo y convenio</strong> del paciente.
              Si el profesional ya actuó, queda bloqueado para conservar el historial.
            </p>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Médico</label>
            <select
              v-model="form.medico"
              class="form-select form-select-sm"
              required
              :disabled="bloqueosAsignacion.medico?.bloqueado"
            >
              <option value="">Seleccione</option>
              <option v-for="item in opcionesMedico" :key="item.numDocumento" :value="item.numDocumento">
                {{ item.nombre }}
              </option>
            </select>
            <small class="d-block mt-1" :class="claseAyudaAsignacion('medico')">
              {{ bloqueosAsignacion.medico?.motivo || "" }}
            </small>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">Enfermero jefe</label>
            <select
              v-model="form.enfermero"
              class="form-select form-select-sm"
              required
              :disabled="bloqueosAsignacion.enfermero?.bloqueado"
            >
              <option value="">Seleccione</option>
              <option v-for="item in opcionesEnfermero" :key="item.numDocumento" :value="item.numDocumento">
                {{ item.nombre }}
              </option>
            </select>
            <small class="d-block mt-1" :class="claseAyudaAsignacion('enfermero')">
              {{ bloqueosAsignacion.enfermero?.motivo || "" }}
            </small>
          </div>
          <div v-if="mostrarPsicoTs" class="col-6 col-md-3">
            <label class="form-label">Psicólogo</label>
            <select
              v-model="form.psicologo"
              class="form-select form-select-sm"
              :disabled="bloqueosAsignacion.psicologo?.bloqueado"
            >
              <option value="">Seleccione</option>
              <option v-for="item in opcionesPsicologo" :key="item.numDocumento" :value="item.numDocumento">
                {{ item.nombre }}
              </option>
            </select>
            <small class="d-block mt-1" :class="claseAyudaAsignacion('psicologo')">
              {{ bloqueosAsignacion.psicologo?.motivo || "" }}
            </small>
          </div>
          <div v-if="mostrarPsicoTs" class="col-6 col-md-3">
            <label class="form-label">Trabajador social</label>
            <select
              v-model="form.trabajadorSocial"
              class="form-select form-select-sm"
              :disabled="bloqueosAsignacion.trabajadorSocial?.bloqueado"
            >
              <option value="">Seleccione</option>
              <option v-for="item in opcionesTsocial" :key="item.numDocumento" :value="item.numDocumento">
                {{ item.nombre }}
              </option>
            </select>
            <small class="d-block mt-1" :class="claseAyudaAsignacion('trabajadorSocial')">
              {{ bloqueosAsignacion.trabajadorSocial?.motivo || "" }}
            </small>
          </div>
          <div v-if="requiereNutricionista" class="col-6 col-md-3">
            <label class="form-label">Nutricionista</label>
            <select
              v-model="form.nutricionista"
              class="form-select form-select-sm"
              :disabled="bloqueosAsignacion.nutricionista?.bloqueado"
            >
              <option value="">Seleccione</option>
              <option v-for="item in opcionesNutricionista" :key="item.numDocumento" :value="item.numDocumento">
                {{ item.nombre }}
              </option>
            </select>
            <small class="d-block mt-1" :class="claseAyudaAsignacion('nutricionista')">
              {{ bloqueosAsignacion.nutricionista?.motivo || "" }}
            </small>
          </div>
          <div v-if="requiereHigienistaOral" class="col-6 col-md-3">
            <label class="form-label">Higienista oral</label>
            <select
              v-model="form.higienistaOral"
              class="form-select form-select-sm"
              :disabled="bloqueosAsignacion.higienistaOral?.bloqueado"
            >
              <option value="">Seleccione</option>
              <option v-for="item in opcionesHigienista" :key="item.numDocumento" :value="item.numDocumento">
                {{ item.nombre }}
              </option>
            </select>
            <small class="d-block mt-1" :class="claseAyudaAsignacion('higienistaOral')">
              {{ bloqueosAsignacion.higienistaOral?.motivo || "" }}
            </small>
          </div>
        </form>
      </div>

      <div class="gestionar-footer">
        <button type="button" class="btn btn-outline-secondary" :disabled="guardando" @click="cerrar">Cancelar</button>
        <button type="button" class="btn btn-primary" :disabled="cargando || guardando || validandoDocumento || !!errorCarga" @click="guardar">
          <span v-if="guardando || validandoDocumento" class="spinner-border spinner-border-sm me-1" role="status"></span>
          Guardar cambios
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { encuestasApi } from "@/api/modulesApi";
import { informesApi } from "@/api/informesApi";
import { getAllUsers } from "@/api/usersApi";
import { esConvenioUnidesa } from "@/constants/convenios";
import {
  construirBloqueosAsignacion,
  mergeOpcionesProfesional,
} from "@/utils/asignacionProfesionales";

const FORM_VACIO = () => ({
  tipodoc: "",
  numdoc: "",
  epsId: "",
  regimen: "",
  nombre1: "",
  nombre2: "",
  apellido1: "",
  apellido2: "",
  fechaNac: "",
  sexo: "",
  telefono: "",
  direccion: "",
  municipioNacimiento: "",
  departamentoNacimiento: "",
  identidadGenero: "",
  ocupacion: "",
  nivelOcupacion: "",
  barrioVeredacomuna: "",
  desplazamiento: "",
  requiereRemision: "",
  poblacionRiesgo: [],
  medico: "",
  enfermero: "",
  psicologo: "",
  trabajadorSocial: "",
  nutricionista: "",
  higienistaOral: "",
});

export default {
  name: "GestionarEncuestaModal",
  props: {
    visible: { type: Boolean, default: false },
    encuestaId: { type: [String, Number], default: "" },
  },
  emits: ["close", "saved"],
  data() {
    return {
      cargando: false,
      guardando: false,
      errorCarga: "",
      form: FORM_VACIO(),
      documentoOriginal: { tipodoc: "", numdoc: "" },
      estadoDocumento: null, // null | disponible | encuestado | seguimiento
      pacienteDocumentoEncontrado: null,
      validandoDocumento: false,
      barrioSearch: "",
      openBarrioDropdown: false,
      riesgoSeleccionado: "",
      convenioEncuesta: "",
      encuestaSnapshot: null,
      cupsAsignados: [],
      asignacionesOriginales: {
        medico: "",
        enfermero: "",
        psicologo: "",
        trabajadorSocial: "",
        nutricionista: "",
        higienistaOral: "",
      },
      nombresProfesionales: {},
      regimenOptions: ["Contributivo", "Subsidiado", "Especial", "PPNA"],
      riesgosOptions: [
        "Gestante",
        "Menor a 5 años",
        "Discapacidad",
        "Adulto mayor",
        "Orientacion sexual diversa",
        "Grupo etnico",
      ],
      departamentosColombia: [
        "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá", "Caldas",
        "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía",
        "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander",
        "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre",
        "Tolima", "Valle del Cauca", "Vaupés", "Vichada",
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
        "Lactante",
        "Preescolar",
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
        { value: "Directivo / Directiva / Gerencial" },
        { value: "Profesional / Especializado" },
        { value: "Técnico / Tecnólogo" },
        { value: "Auxiliar / Operativo" },
        { value: "Operario / Mano de obra no calificada" },
        { value: "Sin nivel ocupacional" },
      ],
    };
  },
  computed: {
    ...mapState([
      "userData",
      "epss",
      "contratos",
      "comunasBarrios",
      "medicosByGrupo",
      "enfermerosByGrupo",
      "psicologosByGrupo",
      "tsocialesByGrupo",
      "nutricionistasByGrupo",
      "higienistasOralByGrupo",
    ]),
    convenioActual() {
      return String(this.convenioEncuesta || this.userData?.convenio || "").trim();
    },
    mostrarPsicoTs() {
      const c = this.convenioActual;
      return c === "E Basicos" || c === "PIC";
    },
    requiereNutricionista() {
      return this.convenioActual === "PIC";
    },
    requiereHigienistaOral() {
      return esConvenioUnidesa(this.convenioActual);
    },
    epssConContrato() {
      if (!Array.isArray(this.epss)) return [];
      return this.epss.filter((eps) => !String(eps.eps || "").includes("*"));
    },
    riesgosDisponibles() {
      const seleccionados = new Set(this.form.poblacionRiesgo || []);
      return this.riesgosOptions.filter((item) => !seleccionados.has(item));
    },
    filteredComunasBarrios() {
      const texto = String(this.barrioSearch || "").trim().toLowerCase();
      if (!texto) return [];
      return (this.comunasBarrios || [])
        .filter((option) => {
          const barrio = String(option?.barrio || "").toLowerCase();
          const comuna = String(option?.comuna || "").toLowerCase();
          return barrio.includes(texto) || comuna.includes(texto);
        })
        .slice(0, 12);
    },
    epsSeleccionada() {
      return (this.epssConContrato || []).find((ep) => String(ep.id) === String(this.form.epsId)) || null;
    },
    epsNombreMostrada() {
      if (this.epsSeleccionada?.eps) return this.epsSeleccionada.eps;
      const desdeEncuesta = String(this.encuestaSnapshot?.eps || "").trim();
      if (desdeEncuesta) return desdeEncuesta;
      return "Sin EPS";
    },
    documentoModificado() {
      const tipodoc = String(this.form.tipodoc || "").trim().toUpperCase();
      const numdoc = this.sanitizarDocumento(this.form.numdoc);
      const tipodocOrig = String(this.documentoOriginal.tipodoc || "").trim().toUpperCase();
      const numdocOrig = this.sanitizarDocumento(this.documentoOriginal.numdoc);
      return tipodoc !== tipodocOrig || numdoc !== numdocOrig;
    },
    esConvenioEBasicos() {
      return this.convenioActual === "E Basicos";
    },
    bloqueosAsignacion() {
      return construirBloqueosAsignacion(
        this.encuestaSnapshot || {},
        this.cupsAsignados || [],
        this.asignacionesOriginales
      );
    },
    opcionesMedico() {
      return mergeOpcionesProfesional(
        this.medicosByGrupo,
        this.form.medico,
        this.nombresProfesionales[String(this.form.medico || "").trim()]
      );
    },
    opcionesEnfermero() {
      return mergeOpcionesProfesional(
        this.enfermerosByGrupo,
        this.form.enfermero,
        this.nombresProfesionales[String(this.form.enfermero || "").trim()]
      );
    },
    opcionesPsicologo() {
      return mergeOpcionesProfesional(
        this.psicologosByGrupo,
        this.form.psicologo,
        this.nombresProfesionales[String(this.form.psicologo || "").trim()]
      );
    },
    opcionesTsocial() {
      return mergeOpcionesProfesional(
        this.tsocialesByGrupo,
        this.form.trabajadorSocial,
        this.nombresProfesionales[String(this.form.trabajadorSocial || "").trim()]
      );
    },
    opcionesNutricionista() {
      return mergeOpcionesProfesional(
        this.nutricionistasByGrupo,
        this.form.nutricionista,
        this.nombresProfesionales[String(this.form.nutricionista || "").trim()]
      );
    },
    opcionesHigienista() {
      return mergeOpcionesProfesional(
        this.higienistasOralByGrupo,
        this.form.higienistaOral,
        this.nombresProfesionales[String(this.form.higienistaOral || "").trim()]
      );
    },
  },
  watch: {
    visible: {
      immediate: true,
      handler(valor) {
        if (valor && this.encuestaId) {
          this.abrir();
        }
      },
    },
    encuestaId(valor) {
      if (this.visible && valor) {
        this.abrir();
      }
    },
  },
  methods: {
    ...mapActions([
      "updateRegister",
      "getAllComunaBarrios",
      "getAllEpss",
      "getAllContratos",
      "getAllMedicosbyGrupo",
      "getAllEnfermerosbyGrupo",
      "getAllPsicologosbyGrupo",
      "getAllTsocialesbyGrupo",
      "getAllNutricionistasbyGrupo",
      "getAllHigienistasOralbyGrupo",
      "getAllByPacientesID",
      "getAllByPacientesIDEB",
    ]),

    sanitizarDocumento(valor) {
      return String(valor ?? "").replace(/[^A-Za-z0-9]/g, "");
    },

    onNumdocInput(event) {
      const limpio = this.sanitizarDocumento(event?.target?.value);
      this.form.numdoc = limpio;
      if (event?.target && event.target.value !== limpio) {
        event.target.value = limpio;
      }
      this.onDocumentoChange();
    },

    onDocumentoChange() {
      this.estadoDocumento = null;
      this.pacienteDocumentoEncontrado = null;
    },

    async validarDocumento() {
      const tipodocNormalizado = String(this.form.tipodoc || "").trim().toUpperCase();
      const numdocNormalizado = this.sanitizarDocumento(this.form.numdoc);

      if (!tipodocNormalizado) {
        alert("Seleccione el tipo de documento.");
        return false;
      }
      if (!numdocNormalizado) {
        alert("Ingrese el número de documento (solo letras y números).");
        return false;
      }
      if (!/^[A-Za-z0-9]+$/.test(numdocNormalizado)) {
        alert("El número de documento solo puede contener letras y números, sin signos ni caracteres especiales.");
        return false;
      }

      if (!this.documentoModificado) {
        this.estadoDocumento = "disponible";
        this.pacienteDocumentoEncontrado = null;
        return true;
      }

      this.validandoDocumento = true;
      this.estadoDocumento = null;
      this.pacienteDocumentoEncontrado = null;

      try {
        const convenioUsuario = this.convenioActual;
        const resultado = this.esConvenioEBasicos
          ? await this.getAllByPacientesIDEB({
              tipodoc: tipodocNormalizado,
              numdoc: numdocNormalizado,
              convenio: "E Basicos",
            })
          : await this.getAllByPacientesID({
              tipodoc: tipodocNormalizado,
              numdoc: numdocNormalizado,
            });

        const idActual = String(this.encuestaId || "").trim();
        const otros = (Array.isArray(resultado) ? resultado : []).filter(
          (item) => String(item?.id || "").trim() !== idActual
        );

        if (!otros.length) {
          this.estadoDocumento = "disponible";
          this.pacienteDocumentoEncontrado = null;
          return true;
        }

        const pacienteMismoConvenio = otros.find(
          (r) => String(r.convenio || "").trim().toLowerCase() === convenioUsuario.toLowerCase()
        );

        if (pacienteMismoConvenio) {
          if (this.esConvenioEBasicos) {
            this.estadoDocumento = "seguimiento";
            this.pacienteDocumentoEncontrado = pacienteMismoConvenio;
          } else {
            this.estadoDocumento = "encuestado";
            this.pacienteDocumentoEncontrado = pacienteMismoConvenio;
          }
          return this.estadoDocumento !== "encuestado";
        }

        this.estadoDocumento = "disponible";
        this.pacienteDocumentoEncontrado = {
          ...otros[0],
          convenioDiferente: true,
        };
        return true;
      } catch (error) {
        console.error("[GestionarEncuestaModal] Error validando documento:", error);
        alert("Error al consultar el documento. Intente nuevamente.");
        this.estadoDocumento = null;
        return false;
      } finally {
        this.validandoDocumento = false;
      }
    },

    normalizarFecha(valor) {
      const texto = String(valor || "").trim();
      if (!texto) return "";
      if (/^\d{4}-\d{2}-\d{2}/.test(texto)) return texto.slice(0, 10);
      const match = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      if (match) {
        return `${match[3]}-${String(match[2]).padStart(2, "0")}-${String(match[1]).padStart(2, "0")}`;
      }
      return "";
    },

    getBarrioLabel(option) {
      if (!option || typeof option !== "object") return "";
      return `${option.barrio || ""} (${option.comuna || ""})`.replace(/\(\s*\)/, "").trim();
    },

    onBarrioInput() {
      const texto = String(this.barrioSearch || "").trim().toLowerCase();
      this.openBarrioDropdown = true;
      if (!texto) {
        this.form.barrioVeredacomuna = "";
        return;
      }
      const actual = this.getBarrioLabel(this.form.barrioVeredacomuna).toLowerCase();
      if (actual !== texto) {
        this.form.barrioVeredacomuna = "";
      }
    },

    selectBarrio(option) {
      this.form.barrioVeredacomuna = option;
      this.barrioSearch = this.getBarrioLabel(option);
      this.openBarrioDropdown = false;
    },

    onBarrioBlur() {
      setTimeout(() => {
        this.openBarrioDropdown = false;
      }, 120);
    },

    agregarRiesgo() {
      if (!this.riesgoSeleccionado) return;
      if (!this.form.poblacionRiesgo.includes(this.riesgoSeleccionado)) {
        this.form.poblacionRiesgo.push(this.riesgoSeleccionado);
      }
      this.riesgoSeleccionado = "";
    },

    quitarRiesgo(index) {
      this.form.poblacionRiesgo.splice(index, 1);
    },

    cerrar() {
      if (this.guardando) return;
      this.$emit("close");
    },

    claseAyudaAsignacion(rol) {
      const bloqueo = this.bloqueosAsignacion?.[rol];
      if (!bloqueo) return "text-muted";
      if (bloqueo.bloqueado) return "text-danger";
      if (bloqueo.puedeAsignar) return "text-success";
      return "text-primary";
    },

    nombreProfesionalPorDocumento(documento) {
      const doc = String(documento || "").trim();
      if (!doc) return "";
      return this.nombresProfesionales[doc] || "";
    },

    valorAsignacionParaGuardar(rol, visible = true) {
      const original = String(this.asignacionesOriginales?.[rol] || "").trim() || null;
      if (!visible) return original;
      if (this.bloqueosAsignacion?.[rol]?.bloqueado) return original;
      const actual = String(this.form?.[rol] || "").trim();
      return actual || null;
    },

    async cargarProfesionales(grupo, convenio) {
      const grupoFiltro = String(grupo || "").trim();
      const convenioFiltro = String(convenio || "").trim();
      if (!grupoFiltro || !convenioFiltro) {
        console.warn("[GestionarEncuestaModal] Falta grupo o convenio para filtrar profesionales.", {
          grupo: grupoFiltro,
          convenio: convenioFiltro,
        });
      }

      // Solo profesionales del mismo grupo y convenio del paciente/auxiliar.
      const params = { grupo: grupoFiltro, convenio: convenioFiltro };
      await Promise.all([
        this.getAllMedicosbyGrupo(params),
        this.getAllEnfermerosbyGrupo(params),
      ]);
      if (this.mostrarPsicoTs) {
        await Promise.all([
          this.getAllPsicologosbyGrupo(params),
          this.getAllTsocialesbyGrupo(params),
        ]);
      }
      if (this.requiereNutricionista) {
        await this.getAllNutricionistasbyGrupo(params);
      }
      if (this.requiereHigienistaOral) {
        await this.getAllHigienistasOralbyGrupo(params);
      }
    },

    async abrir() {
      this.cargando = true;
      this.errorCarga = "";
      this.form = FORM_VACIO();
      this.documentoOriginal = { tipodoc: "", numdoc: "" };
      this.estadoDocumento = null;
      this.pacienteDocumentoEncontrado = null;
      this.barrioSearch = "";
      this.riesgoSeleccionado = "";
      this.encuestaSnapshot = null;
      this.cupsAsignados = [];
      this.asignacionesOriginales = {
        medico: "",
        enfermero: "",
        psicologo: "",
        trabajadorSocial: "",
        nutricionista: "",
        higienistaOral: "",
      };
      this.nombresProfesionales = {};

      try {
        await Promise.all([
          this.getAllEpss(),
          this.getAllContratos(),
          this.getAllComunaBarrios(),
        ]);

        const encuesta = await encuestasApi.getById(this.encuestaId);
        if (!encuesta) {
          throw new Error("No se encontró la encuesta.");
        }

        this.convenioEncuesta = String(encuesta.convenio || this.userData?.convenio || "").trim();
        const grupoEncuesta = String(
          encuesta.grupo ||
          this.$route?.query?.profesionalGrupo ||
          this.userData?.grupo ||
          ""
        ).trim();
        await this.cargarProfesionales(grupoEncuesta, this.convenioEncuesta);

        const [bulkCups, usuarios] = await Promise.all([
          informesApi.getAsignacionesCupsBulk([this.encuestaId]),
          getAllUsers().catch(() => []),
        ]);

        const cupsObj = bulkCups?.asignaciones?.[String(this.encuestaId)]?.cups;
        this.cupsAsignados =
          cupsObj && typeof cupsObj === "object"
            ? Object.values(cupsObj).filter(Boolean)
            : [];

        this.nombresProfesionales = (Array.isArray(usuarios) ? usuarios : []).reduce((acc, user) => {
          const doc = String(user?.numDocumento || "").trim();
          if (doc) acc[doc] = String(user?.nombre || "").trim();
          return acc;
        }, {});

        let barrio = encuesta.barrioVeredacomuna ?? encuesta.barrio_vereda_comuna ?? "";
        if (typeof barrio === "string" && barrio.trim().startsWith("{")) {
          try {
            barrio = JSON.parse(barrio);
          } catch (_) {
            barrio = "";
          }
        }

        let riesgos = encuesta.poblacionRiesgo ?? encuesta.poblacion_riesgo ?? [];
        if (typeof riesgos === "string" && riesgos.trim()) {
          try {
            const parsed = JSON.parse(riesgos);
            riesgos = Array.isArray(parsed) ? parsed : [];
          } catch (_) {
            riesgos = [];
          }
        }
        if (!Array.isArray(riesgos)) riesgos = [];

        let epsId = encuesta.epsId || encuesta.eps_id || "";
        if (!epsId && encuesta.eps) {
          const match = this.epssConContrato.find(
            (ep) => String(ep.eps || "").trim().toLowerCase() === String(encuesta.eps || "").trim().toLowerCase()
          );
          epsId = match?.id || "";
        }

        const asignaciones = {
          medico: String(encuesta.idMedicoAtiende || encuesta.id_medico_atiende || "").trim(),
          enfermero: String(encuesta.idEnfermeroAtiende || encuesta.id_enfermero_atiende || "").trim(),
          psicologo: String(encuesta.idPsicologoAtiende || encuesta.id_psicologo_atiende || "").trim(),
          trabajadorSocial: String(encuesta.idTsocialAtiende || encuesta.id_tsocial_atiende || "").trim(),
          nutricionista: String(encuesta.idNutricionistaAtiende || encuesta.id_nutricionista_atiende || "").trim(),
          higienistaOral: String(encuesta.idHigienistaOralAtiende || encuesta.id_higienista_oral_atiende || "").trim(),
        };

        this.encuestaSnapshot = { ...encuesta };
        this.asignacionesOriginales = { ...asignaciones };

        this.form = {
          tipodoc: encuesta.tipodoc || "",
          numdoc: this.sanitizarDocumento(encuesta.numdoc),
          epsId,
          regimen: encuesta.regimen || "",
          nombre1: encuesta.nombre1 || "",
          nombre2: encuesta.nombre2 || "",
          apellido1: encuesta.apellido1 || "",
          apellido2: encuesta.apellido2 || "",
          fechaNac: this.normalizarFecha(encuesta.fechaNac || encuesta.fecha_nac),
          sexo: encuesta.sexo || "",
          telefono: encuesta.telefono || "",
          direccion: encuesta.direccion || "",
          municipioNacimiento: encuesta.municipioNacimiento || encuesta.municipio_nacimiento || "",
          departamentoNacimiento: encuesta.departamentoNacimiento || encuesta.departamento_nacimiento || "",
          identidadGenero: encuesta.identidadGenero || encuesta.identidad_genero || "",
          ocupacion: encuesta.ocupacion || "",
          nivelOcupacion: encuesta.nivelOcupacion || encuesta.nivel_ocupacion || "",
          barrioVeredacomuna: barrio && typeof barrio === "object" ? barrio : "",
          desplazamiento: encuesta.desplazamiento || "",
          requiereRemision: encuesta.requiereRemision || encuesta.requiere_remision || "",
          poblacionRiesgo: [...riesgos],
          medico: asignaciones.medico,
          enfermero: asignaciones.enfermero,
          psicologo: asignaciones.psicologo,
          trabajadorSocial: asignaciones.trabajadorSocial,
          nutricionista: asignaciones.nutricionista,
          higienistaOral: asignaciones.higienistaOral,
        };

        this.documentoOriginal = {
          tipodoc: this.form.tipodoc,
          numdoc: this.form.numdoc,
        };
        this.estadoDocumento = null;
        this.pacienteDocumentoEncontrado = null;
        this.barrioSearch = this.getBarrioLabel(this.form.barrioVeredacomuna);
      } catch (error) {
        console.error("[GestionarEncuestaModal] Error cargando:", error);
        this.errorCarga = error?.response?.data?.message || error?.message || "Error al cargar el registro.";
      } finally {
        this.cargando = false;
      }
    },

    async guardar() {
      if (this.guardando || this.cargando) return;

      if (!this.form.tipodoc || !this.form.numdoc) {
        alert("Tipo y número de documento son obligatorios.");
        return;
      }

      const medicoFinal = this.valorAsignacionParaGuardar("medico", true);
      const enfermeroFinal = this.valorAsignacionParaGuardar("enfermero", true);
      if (!medicoFinal || !enfermeroFinal) {
        alert("Médico y enfermero jefe son obligatorios.");
        return;
      }
      if (!this.form.barrioVeredacomuna) {
        alert("Seleccione un barrio/vereda-comuna válido de la lista.");
        return;
      }

      // Evitar cambios sobre profesionales ya gestionados.
      const rolesVisibles = [
        ["medico", true],
        ["enfermero", true],
        ["psicologo", this.mostrarPsicoTs],
        ["trabajadorSocial", this.mostrarPsicoTs],
        ["nutricionista", this.requiereNutricionista],
        ["higienistaOral", this.requiereHigienistaOral],
      ];
      for (const [rol, visible] of rolesVisibles) {
        if (!visible) continue;
        const bloqueo = this.bloqueosAsignacion?.[rol];
        if (!bloqueo?.bloqueado) continue;
        const original = String(this.asignacionesOriginales?.[rol] || "").trim();
        const actual = String(this.form?.[rol] || "").trim();
        if (actual !== original) {
          alert(`No se puede cambiar ${rol}: ${bloqueo.motivo}`);
          this.form[rol] = original;
          return;
        }
      }

      if (this.documentoModificado) {
        const okDocumento = await this.validarDocumento();

        if (this.estadoDocumento === "encuestado") {
          alert("Este paciente ya fue encuestado previamente. No se puede guardar con ese documento.");
          return;
        }

        if (!okDocumento || (this.estadoDocumento !== "disponible" && this.estadoDocumento !== "seguimiento")) {
          alert("No fue posible validar el documento. Intente nuevamente.");
          return;
        }

        if (this.estadoDocumento === "seguimiento") {
          const confirmarSeguimiento = confirm(
            "Este documento ya existe en Equipos Básicos.\n\nAl guardar se actualizará este registro con ese documento (seguimiento/control). ¿Desea continuar?"
          );
          if (!confirmarSeguimiento) return;
        }
      }

      this.guardando = true;
      try {
        await this.updateRegister({
          idEncuesta: this.encuestaId,
          entradasE: {
            tipodoc: this.form.tipodoc,
            numdoc: this.sanitizarDocumento(this.form.numdoc),
            eps: String(this.encuestaSnapshot?.eps || this.epsSeleccionada?.eps || "").trim(),
            regimen: this.form.regimen,
            nombre1: this.form.nombre1,
            nombre2: this.form.nombre2,
            apellido1: this.form.apellido1,
            apellido2: this.form.apellido2,
            fechaNac: this.form.fechaNac,
            sexo: this.form.sexo,
            telefono: this.form.telefono,
            direccion: this.form.direccion,
            municipioNacimiento: this.form.municipioNacimiento,
            departamentoNacimiento: this.form.departamentoNacimiento,
            identidadGenero: this.form.identidadGenero,
            ocupacion: this.form.ocupacion,
            nivelOcupacion: this.form.nivelOcupacion,
            barrioVeredacomuna: this.form.barrioVeredacomuna,
            desplazamiento: this.form.desplazamiento,
            requiereRemision: this.form.requiereRemision,
            poblacionRiesgo: this.form.poblacionRiesgo,
            idMedicoAtiende: medicoFinal,
            idEnfermeroAtiende: enfermeroFinal,
            idPsicologoAtiende: this.valorAsignacionParaGuardar("psicologo", this.mostrarPsicoTs),
            idTsocialAtiende: this.valorAsignacionParaGuardar("trabajadorSocial", this.mostrarPsicoTs),
            idNutricionistaAtiende: this.valorAsignacionParaGuardar("nutricionista", this.requiereNutricionista),
            idHigienistaOralAtiende: this.valorAsignacionParaGuardar("higienistaOral", this.requiereHigienistaOral),
          },
        });

        alert("Registro actualizado correctamente.");
        this.$emit("saved");
        this.$emit("close");
      } catch (error) {
        console.error("[GestionarEncuestaModal] Error guardando:", error);
        alert(error?.response?.data?.message || error?.message || "Error al guardar cambios.");
      } finally {
        this.guardando = false;
      }
    },
  },
};
</script>

<style scoped>
.gestionar-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.gestionar-modal {
  width: min(980px, 100%);
  max-height: min(92vh, 900px);
  background: #fff;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.gestionar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.1rem;
  background: linear-gradient(90deg, #0f766e, #14b8a6);
  color: #fff;
}

.gestionar-body {
  padding: 1rem 1.1rem;
  overflow-y: auto;
  flex: 1 1 auto;
}

.gestionar-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.seccion-titulo {
  margin: 0.35rem 0 0.15rem;
  font-weight: 700;
  color: #0f766e;
  font-size: 0.92rem;
}

.form-label {
  font-size: 0.78rem;
  margin-bottom: 0.15rem;
  font-weight: 600;
}

.barrio-dropdown-list {
  position: absolute;
  z-index: 30;
  width: calc(100% - 1.5rem);
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.col-12.col-md-6 {
  position: relative;
}

.barrio-dropdown-item {
  width: 100%;
  text-align: left;
  border: 0;
  background: #fff;
  border-bottom: 1px solid #f1f3f5;
  padding: 8px 10px;
  font-size: 0.86rem;
}

.barrio-dropdown-item:hover {
  background: #f8f9fa;
}

.barrio-dropdown-empty {
  padding: 8px 10px;
  color: #6c757d;
  font-size: 0.84rem;
}

.badge .btn-close {
  width: 0.45em;
  height: 0.45em;
  vertical-align: middle;
}

.text-teal {
  color: #0f766e;
}
</style>

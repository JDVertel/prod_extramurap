<template>
    <!-- {{ InfoEncuestasById }} -->
    <!-- {{ dataencuesta.eps }} -->
    <div class="sop-cups-auxiliar-view">
        <!-- SPINNER SIEMPRE VISIBLE MIENTRAS CARGA -->
        <div v-if="cargandoDatos && !modalAbierto" class="overlay-guardando">
            <div class="progress-card shadow">
                <div class="h5 mb-3">Cargando datos</div>
                <div class="progress mb-2" role="progressbar" aria-label="Cargando datos" aria-valuemin="0"
                    aria-valuemax="100" style="height: 22px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
                        Cargando...
                    </div>
                </div>
                <div class="text-muted small">Cargando datos...</div>
            </div>
        </div>

        <!-- OVERLAY DE GUARDANDO -->
        <div v-if="guardando && !cargandoDatos && !modalAbierto" class="overlay-guardando">
            <div class="progress-card shadow">
                <div class="h5 mb-3">Guardando listado</div>
                <div class="progress mb-2" role="progressbar" aria-label="Guardando listado" aria-valuemin="0"
                    aria-valuemax="100" style="height: 22px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
                        Guardando...
                    </div>
                </div>
                <div class="text-muted small">Guardando listado, por favor espere...</div>
            </div>
        </div>
    <h5 class="fw-bold text-success mb-1">
                            <i class="bi bi-person-fill"></i> Informacion del Paciente
                        </h5>
        <!-- CONTENIDO VISIBLE SOLO CUANDO NO ESTÁ CARGANDO -->
        <template v-if="!cargandoDatos">
            <div class="container-fluid rounded shadow-sm mt-1 mb-1 paciente p-1" v-if="userEncuesta">
                <div class="row">
                    <div class="col-12 col-md-1 align-self-center text-center">
                        <i class="bi bi-person-circle h1 texto-sombra"></i>
                    </div>
                    
                    <div class="col-12 col-md-11 align-self-center">
                        <div class="row g-1">
                            <div class="col-12 col-md-4 texto-sombra">
                                <strong>Paciente:</strong>
                                {{ userEncuestaNormalizada.nombre1 }} {{ userEncuestaNormalizada.nombre2 }}
                                {{ userEncuestaNormalizada.apellido1 }} {{ userEncuestaNormalizada.apellido2 }}
                                <br>
                                <strong>Documento:</strong>
                                {{ userEncuestaNormalizada.tipodoc || "N/A" }} - {{ userEncuestaNormalizada.numdoc || "N/A" }}
                                <br>
                                <strong>Teléfono:</strong> {{ userEncuestaNormalizada.telefono || "N/A" }}
                            </div>
                            <div class="col-12 col-md-4 texto-sombra">
                                <strong>EPS:</strong> {{ userEncuestaNormalizada.eps || "N/A" }} <br>
                                <strong>Régimen:</strong> {{ userEncuestaNormalizada.regimen || "N/A" }} <br>
                                <strong>Convenio:</strong> {{ userEncuestaNormalizada.convenio || "N/A" }}
                            </div>
                            <div class="col-12 col-md-4 texto-sombra">
                                <strong>Sexo:</strong> {{ userEncuestaNormalizada.sexo || "N/A" }}<br />
                                <strong>Edad:</strong> {{ edadActual(userEncuestaNormalizada.fechaNac) ?? "N/A" }}<br />
                                <strong>Fecha Nac.:</strong> {{ userEncuestaNormalizada.fechaNac || "N/A" }}
                            </div>
                            <div class="col-12 col-md-4 texto-sombra">
                                <strong>Dirección:</strong> {{ userEncuestaNormalizada.direccion || "N/A" }}
                            </div>
                            <div class="col-12 col-md-4 texto-sombra">
                                <strong>Comuna:</strong> {{ userEncuestaNormalizada.comuna || "N/A" }}<br>
                                <strong>Barrio:</strong> {{ userEncuestaNormalizada.barrio || "N/A" }}
                            </div>
                            <div class="col-12 col-md-4 texto-sombra">
                                <strong>Pob. riesgo:</strong> {{ userEncuestaNormalizada.poblacionRiesgo || "N/A" }}
                            </div>
                            <div class="col-12 mt-1">
                                <button class="btn btn-outline-light btn-sm rounded-pill" type="button"
                                    @click="toggleCaracterizacionInfo">
                                    <i class="bi" :class="mostrarCaracterizacion ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                                    {{ mostrarCaracterizacion ? 'Ocultar información de caracterización' : 'Ver informacion de caracterizacion' }}
                                </button>
                            </div>
                            <template v-if="mostrarCaracterizacion">
                                <div v-if="cargandoCaracterizacion" class="col-12 texto-sombra small mt-1">
                                    Cargando información de caracterización...
                                </div>
                                <template v-else>
                                    <hr />
                                    <div class="col-12 col-md-4 texto-sombra">
                                        <strong>Peso:</strong> {{ formatearDatoCaracterizacion(caracterizacionEncuesta.peso, "kg") }}<br>
                                        <strong>Talla:</strong> {{ formatearDatoCaracterizacion(caracterizacionEncuesta.talla, "m") }}<br>
                                        <strong>IMC:</strong> {{ formatearDatoCaracterizacion(caracterizacionEncuesta.imc) }}
                                    </div>
                                    <div class="col-12 col-md-4 texto-sombra">
                                        <strong>Clasif. IMC:</strong> {{ formatearDatoCaracterizacion(caracterizacionEncuesta.clasificacionImc) }}<br>
                                        <strong>Tensión sistólica:</strong> {{ formatearDatoCaracterizacion(caracterizacionEncuesta.tensionSistolica, "mmHg") }}<br>
                                        <strong>Tensión diastólica:</strong> {{ formatearDatoCaracterizacion(caracterizacionEncuesta.tensionDiastolica, "mmHg") }}
                                    </div>
                                    <div class="col-12 col-md-4 texto-sombra">
                                        <strong>Per. abdominal:</strong> {{ formatearDatoCaracterizacion(caracterizacionEncuesta.perimetroAbdominal, "cm") }}<br>
                                        <strong>Per. braquial:</strong> {{ formatearDatoCaracterizacion(caracterizacionEncuesta.perimetroBranquial, "cm") }}<br>
                                        <strong>Oximetría/Temp:</strong>
                                        {{ formatearDatoCaracterizacion(caracterizacionEncuesta.oximetria, "%") }} /
                                        {{ formatearDatoCaracterizacion(caracterizacionEncuesta.temperatura, "°C") }}
                                    </div>
                                    <div class="col-12 col-md-4 texto-sombra">
                                        <strong>Antecedentes:</strong>
                                        {{ formatearListaCaracterizacion(caracterizacionEncuesta.seleccionadosAntecedentes) }}
                                    </div>
                                    <div class="col-12 col-md-4 texto-sombra">
                                        <strong>Factores de riesgo:</strong>
                                        {{ formatearListaCaracterizacion(caracterizacionEncuesta.seleccionadosFactoresRiesgo) }}
                                    </div>
                                    <div class="col-12 col-md-4 texto-sombra">
                                        <strong>Presencia de animales:</strong>
                                        {{ formatearListaCaracterizacion(caracterizacionEncuesta.seleccionadosPresenciaAnimales) }}
                                    </div>
                                    <div class="col-12 col-md-4 texto-sombra">
                                        <strong>Servicios públicos:</strong>
                                        {{ formatearListaCaracterizacion(caracterizacionEncuesta.seleccionadosServPublic) }}
                                    </div>
                                </template>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="userEncuesta" class="mb-1" :aria-busy="guardando">
                <div>
                    <div class="cups-main-scroll">
                    <div class="container-fluid bg-light rounded shadow-sm p-2" style="min-width: 700px;">
                        <h5 class="fw-bold text-success mb-1">
                            <i class="bi bi-person-check-fill"></i> Actividades del Paciente
                        </h5>

                        <table class="table table-striped table-bordered" style="min-width: 680px;">
                            <thead class="thead-dark">
                                <tr>
                                    <th scope="col">Opc</th>
                                    <th scope="col">Actividad</th>
                                    <th scope="col">Cups</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, key) in actividadesPaciente" :key="`${item.key}-${key}`">
                                        <td> <button class="btn btn-primary btn-sm"
                                            v-if="item && puedeMostrarActividad(item) && tieneCupsDisponiblesActividad(item.key)" type="button"
                                            @click="abrirModalCups(item)">
                                            <i class="bi bi-plus-circle"></i>
                                        </button>
                                    </td>
                                    <td>{{ obtenerNombreActividadDelContrato(item.key) }}</td>
                                    <td>
                                        <div v-if="obtenerCupsArrayPorActividad(item.key).length > 0">
                                            <div v-for="(cup, idx) in obtenerCupsArrayPorActividad(item.key)" :key="idx"
                                                class="d-flex align-items-center justify-content-between mb-1 p-1 border-bottom">
                                                <div style="flex: 1; min-width: 0;">
                                                    <div class="cup-texto-completo">
                                                        <span class="cantidad-cups-circulo">{{ cup.cantidad }}</span>
                                                        <span v-if="cup.cupsNombre" class="nombre-cups">{{ cup.cupsNombre }}</span>
                                                        <span v-if="cup.detalle" class="detalle-cups"> - {{ cup.detalle }}</span>
                                                    </div>
                                                    <small class="text-muted">
                                                        <i class="bi bi-person-fill"></i> {{ cup.nombreProf || 'N/D' }}
                                                        <span class="badge ms-1" :class="getCargoBadgeClass(cup.key)">{{ cup.key || 'Rol desconocido' }}</span>
                                                    </small>
                                                </div>
                                                <button v-if="puedeEliminarCups(cup)" class="btn btn-danger btn-sm ms-2"
                                                    @click="eliminarCupsAsignado(cup, item.key)" title="Eliminar CUPS">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                                <span v-else class="badge bg-secondary ms-2"
                                                    title="Solo el creador puede eliminar">
                                                    <i class="bi bi-lock"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <span v-else class="text-muted">Sin CUPS</span>
                                    </td>

                                </tr>
                                <tr v-if="actividadesPaciente.length === 0">
                                    <td colspan="3" class="text-center py-4">
                                        <div class="text-muted mb-3">La encuesta no tiene actividades disponibles.</div>
                                        <button
                                            v-if="puedeDevolverEncuestaCorrupta"
                                            class="btn btn-outline-danger rounded-pill"
                                            @click="devolverEncuestaCorruptaAAuxiliar"
                                            :disabled="guardando"
                                        >
                                            <i class="bi bi-exclamation-triangle"></i> Encuesta corrupta, devolver a auxiliar
                                        </button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>

                    </div>
                    </div><!-- /cups-main-scroll -->
                </div>
                <div class="footer footer-cerrar-visita">
                    <button class="btn btn-secondary rounded-pill" @click="redirigirPostCierre(cargoMostrado)">
                        <i class="bi bi-arrow-left-circle"></i> Volver al listado
                    </button>
                    <button class="btn btn-success rounded-pill" @click="cerrarVisita()"
                        v-if="userEncuesta">
                        <i class="bi bi-clipboard2-check"></i> Cerrar Visita
                    </button>
                </div>
                <!-- El modal queda igual, puedes mejorar clase 'modal-content' por 'shadow-lg' si gustas -->
                <div class="modal fade" id="cupsModal" data-bs-backdrop="false" tabindex="-1" aria-labelledby="cupsModalLabel">
                    <div class="modal-dialog modal-xl modal-dialog-scrollable">
                        <div class="modal-content shadow-lg">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="cupsModalLabel">
                                    <i class="bi bi-plus-circle-fill me-2"></i>
                                    Añadir CUPS a la actividad
                                </h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    Seleccione los CUPS que desea asignar a
                                    <strong>{{ actividadSeleccionadaNombre }}</strong>
                                    <div class="row">
                                        <div class="mb-3">
                                            <br />
                                            <input
                                                v-model.trim="filtroTextoCups"
                                                type="text"
                                                class="form-control form-control-sm mb-2"
                                                placeholder="Buscar CUPS por código, nombre o profesional (mínimo 3 caracteres)"
                                            />
                                            <div class="cups-resultados-lista" id="cupSelect">
                                                <label
                                                    v-for="cup in cupsDisponiblesFiltradasTexto"
                                                    :key="cup.id"
                                                    class="cups-resultado-item"
                                                    :class="{ active: String(CupsSeleccionadoId) === String(cup.id) }"
                                                >
                                                    <input
                                                        v-model="CupsSeleccionadoId"
                                                        class="form-check-input me-2"
                                                        type="radio"
                                                        name="cupsResultado"
                                                        :value="String(cup.id)"
                                                    />
                                                    <div>
                                                        <div class="fw-semibold">[{{ cup.codigo }}] {{ cup.DescripcionCUP }}</div>
                                                    </div>
                                                </label>
                                            </div>
                                            <small v-if="filtroTextoCups && filtroTextoCups.length > 0 && filtroTextoCups.length < 3"
                                                class="text-muted d-block mt-1">
                                                Escriba al menos 3 caracteres para filtrar el listado.
                                            </small>
                                            <small v-if="cupsDisponiblesFiltradasTexto.length === 0"
                                                class="text-muted d-block mt-1">
                                                No hay CUPS disponibles para esta actividad, EPS y profesional.
                                            </small>
                                            <div class="row mt-2 align-items-center">
                                                <div class="col-3 col-md-2 col-lg-1">
                                                    Cantidad
                                                    <input type="number" id="cupCantidad" name="cupCantidad"
                                                        class="form-control" aria-label="Cantidad" v-model="cantidad" />
                                                </div>
                                                <div class="col-9 col-md-7 col-lg-8">
                                                    <div class="input-group input-group-sm mb-0">
                                                        <span class="input-group-text">Detalle</span>
                                                        <textarea id="cupDetalle" name="cupDetalle" class="form-control"
                                                            aria-label="With textarea" v-model="detalle"></textarea>
                                                    </div>
                                                </div>
                                                <div class="col-12 col-md-3 d-grid align-self-center">
                                                    <button v-if="cupsDisponiblesFiltradasTexto.length > 0"
                                                        class="btn btn-warning rounded-pill mt-1 mt-md-0"
                                                        @click="addCups(CupsSeleccionadoId, cantidad, detalle)"
                                                        :disabled="!CupsSeleccionadoId || cantidad < 1 || !detalle.trim()">
                                                        <i class="bi bi-plus-circle-dotted"></i> Agregar al listado
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <h6>Listado de CUPS:</h6>
                                <hr />
                                <div class="cups-listado-scroll" v-if="cupsArray.length > 0">
                                    <div class="table-responsive-wrapper">
                                        <table class="table table-sm table-hover table-striped table-bordered mb-0">
                                            <thead class="thead-dark">
                                                <tr>
                                                    <th scope="col" class="col-cups col-cups-wide">CUPS</th>
                                                    <th scope="col" class="col-detalle">Detalle Ingresado</th>
                                                    <th scope="col" class="col-cantidad text-center">Cantidad</th>
                                                    <th scope="col" class="col-grupo">Grupo</th>
                                                    <th scope="col" class="col-accion text-center">Opción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(cup, index) in cupsArray" :key="index">
                                                    <td class="col-cups col-cups-wide" data-label="CUPS">
                                                        <span class="cup-texto-completo" :title="cup.cupsNombre">
                                                            {{ cup.cupsNombre }}
                                                        </span>
                                                    </td>
                                                    <td class="col-detalle" data-label="Detalle">
                                                        <span class="d-inline-block text-truncate" :title="cup.detalle">
                                                            {{ truncarTexto(cup.detalle, 12) }}
                                                        </span>
                                                    </td>
                                                    <td class="col-cantidad text-center" data-label="Cantidad">{{
                                                        cup.cantidad }}</td>
                                                    <td class="col-grupo" data-label="Grupo">{{ cup.Grupo }}</td>
                                                    <td class="col-accion text-center" data-label="Opción">
                                                        <button v-if="puedeEliminarCupEnModal(cup)"
                                                            class="btn btn-danger btn-sm rounded-circle"
                                                            @click="eliminarDelListado(index, cup)" title="Eliminar CUPS">
                                                            <i class="bi bi-trash"></i>
                                                        </button>
                                                        <span v-else class="badge bg-secondary"
                                                            title="Solo el profesional que agrego el CUPS puede quitarlo">
                                                            <i class="bi bi-lock"></i>
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div v-if="cupsArray.length === 0">No hay CUPS seleccionados.</div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger rounded-pill" data-bs-dismiss="modal">
                                    <i class="bi bi-x-square"></i> Cancelar
                                </button>
                                <button type="button" class="btn btn-primary rounded-pill"
                                    @click="confirmarSeleccion(userEncuesta?.id)" data-bs-dismiss="modal"
                                    v-if="cupsArray.length !== 0">
                                    <i class="bi bi-floppy"></i> Guardar Listado
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import {
    mapActions,
    mapState
} from "vuex";
import { caracterizacionApi } from "@/api/modulesApi";
import realtime_api from "@/api/realtimeApi.js";

/* ----------------------------------------------------------------------------------------------- */
export default {
    data() {
        return {
            idEncuesta: null,
            CupsSeleccionadoId: "",
            cupsArray: [], // Esta propiedad se usará para almacenar los cups seleccionados
            asignaciones: {}, // Para almacenar las asignaciones cargadas
            keyActividad: "",
            idItem: "",
            cantidad: 1, // Valor por defecto para la cantidad
            detalle: "", // Detalle del cup seleccionado
            guardando: false, // Para mostrar el overlay/spinner
            cargandoDatos: true, // Para mostrar spinner mientras carga datos iniciales
            actividadSeleccionadaNombre: "",
            modalEl: null,
            modalShownHandler: null,
            modalHideHandler: null,
            modalHiddenHandler: null,
            modalScrollRescueTimeout: null,
            modalAbierto: false,
            caracterizacionEncuesta: {},
            mostrarCaracterizacion: false,
            cargandoCaracterizacion: false,
            caracterizacionCargada: false,
            isComponentActive: true, // Bandera para cancelar operaciones al desmontar
            filtroTextoCups: "",

            /*  */
            tipoActividadExtramural: [{
                nombre: "Consulta PYMS",
                Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
                key: "Proc1",
            },
            {
                nombre: "Consulta Morbilidad",
                Profesional: ["Medico"],
                key: "Proc2",
            },
            {
                nombre: "VPS",
                Profesional: ["Enfermero", "Medico"],
                key: "Proc3",
            },
            {
                nombre: "Toma lab PYMS",
                Profesional: ["Enfermero", "Auxiliar de enfermeria"],
                key: "Proc4",
            },
            {
                nombre: "Toma lab Morbilidad",
                Profesional: ["Enfermero", "Auxiliar de enfermeria"],
                key: "Proc5",
            },
            {
                nombre: "Vacunacion",
                Profesional: ["Enfermero", "Auxiliar de enfermeria"],
                key: "Proc6",
            },
            {
                nombre: "Realizacion de tamizajes",
                Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
                key: "Proc7",
            },
            {
                nombre: "Realizacion Test",
                Profesional: ["Enfermero", "Medico"],
                key: "Proc8",
            },
            {
                nombre: "IEC",
                Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
                key: "Proc9",
            },
            {
                nombre: "Remision IPS",
                Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
                key: "Proc10",
            },
            {
                nombre: "Otro",
                Profesional: ["Auxiliar de enfermeria", "Enfermero", "Medico"],
                key: "Proc11",
            },
            ],
        };
    },

    /* ----------------------------------------------------------------------------------------------- */
    computed: {
        ...mapState([
            "InfoEncuestasById",
            "userData",
            "cups",
            "encuestas",
            "contratos",
            "epss",
            "actividades",
            "actividadesExtra",
        ]),

        esEstadoView() {
            if (String(this.$route?.query?.estadoView || "") !== "1") return false;
            const docSeleccionado = String(this.$route?.query?.profesionalDoc || "").trim();
            if (!docSeleccionado) return false;

            const cargoActual = String(this.userData?.cargo || "").trim().toLowerCase();
            const esAdmin = cargoActual === "admin" || cargoActual === "administrador" || cargoActual === "superusuario";
            if (esAdmin) return true;

            const accesos = Array.isArray(this.userData?.accesosProfesionales)
                ? this.userData.accesosProfesionales
                : [];
            return accesos.map((item) => String(item || "").trim()).includes(docSeleccionado);
        },

        cargoMostrado() {
            if (this.esEstadoView) {
                const cargo = String(this.$route?.query?.profesionalCargo || "").trim();
                if (cargo) return cargo;
            }
            return String(this.userData?.cargo || "").trim();
        },

        documentoObjetivo() {
            if (this.esEstadoView) {
                const doc = String(this.$route?.query?.profesionalDoc || "").trim();
                if (doc) return doc;
            }
            return String(this.userData?.numDocumento || "").trim();
        },

        convenioObjetivo() {
            if (this.esEstadoView) {
                const convenio = String(this.$route?.query?.profesionalConvenio || "").trim();
                if (convenio) return convenio;
            }
            return String(this.userData?.convenio || "").trim();
        },

        nombreProfesionalObjetivo() {
            if (this.esEstadoView) {
                const nombre = String(this.$route?.query?.profesionalNombre || "").trim();
                if (nombre) return nombre;
            }
            return String(this.userData?.nombre || "").trim();
        },

        //logica para obtener los cups filtrados por EPS y profesional
        dataencuesta() {
            return this.userEncuesta;
        },

        userEncuesta() {
            const infoEncuesta = this.InfoEncuestasById && this.InfoEncuestasById.length > 0
                ? this.InfoEncuestasById[0]
                : null;
            const encuestaStore = (this.encuestas || []).find(
                (enc) => String(enc.id) === String(this.idEncuesta)
            ) || null;

            if (!infoEncuesta && !encuestaStore) {
                return null;
            }

            const tipoActividadInfo = infoEncuesta?.tipoActividad;
            const tipoActividadStore = encuestaStore?.tipoActividad
                || encuestaStore?.actividades?.tipoActividad;
            const actividadesInfo = infoEncuesta?.actividades;
            const actividadesStore = encuestaStore?.actividades;

            return {
                ...(encuestaStore || {}),
                ...(infoEncuesta || {}),
                actividades: actividadesInfo || actividadesStore || {},
                tipoActividad: tipoActividadInfo || tipoActividadStore || {},
            };
        },

        userEncuestaNormalizada() {
            const src = this.userEncuesta || {};
            const barrioRaw = src.barrioVeredacomuna ?? src.barrio_vereda_comuna ?? null;

            const valorTextoSeguro = (valor, depth = 0) => {
                if (depth > 4 || valor === null || valor === undefined) return "";

                if (typeof valor === "string") {
                    const txt = valor.trim();
                    if (!txt || txt === "[object Object]") return "";

                    // Si llega serializado como JSON string, intentarlo como objeto.
                    if ((txt.startsWith("{") && txt.endsWith("}")) || (txt.startsWith("[") && txt.endsWith("]"))) {
                        try {
                            const parsed = JSON.parse(txt);
                            return valorTextoSeguro(parsed, depth + 1);
                        } catch {
                            return txt;
                        }
                    }

                    return txt;
                }

                if (typeof valor === "number" || typeof valor === "boolean") {
                    return String(valor);
                }

                if (Array.isArray(valor)) {
                    const candidatos = valor
                        .map((item) => valorTextoSeguro(item, depth + 1))
                        .filter(Boolean);
                    return candidatos.length ? candidatos.join(", ") : "";
                }

                if (typeof valor === "object") {
                    const clavesPreferidas = ["nombre", "label", "texto", "text", "value", "descripcion", "comuna", "barrio"];
                    for (const key of clavesPreferidas) {
                        if (valor[key] !== undefined) {
                            const out = valorTextoSeguro(valor[key], depth + 1);
                            if (out) return out;
                        }
                    }

                    for (const v of Object.values(valor)) {
                        const out = valorTextoSeguro(v, depth + 1);
                        if (out) return out;
                    }
                }

                return "";
            };

            let comuna = "";
            let barrio = "";

            if (barrioRaw && typeof barrioRaw === "object") {
                comuna = valorTextoSeguro(barrioRaw.comuna || barrioRaw.Comuna);
                barrio = valorTextoSeguro(barrioRaw.barrio || barrioRaw.Barrio);
            } else if (typeof barrioRaw === "string") {
                // Muchos registros guardan este campo como string único; en ese caso no mostrar N/A.
                comuna = barrioRaw.trim();
                barrio = barrioRaw.trim();
            }

            const poblacion = src.poblacionRiesgo ?? src.poblacion_riesgo;
            const poblacionRiesgo = Array.isArray(poblacion)
                ? poblacion.map((item) => String(item || "").trim()).filter(Boolean).join(", ")
                : String(poblacion || "").trim();

            return {
                nombre1: src.nombre1 || "",
                nombre2: src.nombre2 || "",
                apellido1: src.apellido1 || "",
                apellido2: src.apellido2 || "",
                tipodoc: src.tipodoc || "",
                numdoc: src.numdoc || "",
                telefono: src.telefono || "",
                eps: src.eps || "",
                regimen: src.regimen || "",
                convenio: src.convenio || "",
                sexo: src.sexo || "",
                fechaNac: this.formatearFechaSoloDia(src.fechaNac || src.fecha_nac || ""),
                direccion: src.direccion || "",
                comuna,
                barrio,
                poblacionRiesgo,
            };
        },

        actividadesPaciente() {
            const desdeInfoEncuesta = this.InfoEncuestasById?.[0]?.tipoActividad;
            const desdeInfoActividades = this.InfoEncuestasById?.[0]?.actividades?.tipoActividad || this.InfoEncuestasById?.[0]?.actividades;
            const desdeUserEncuesta = this.userEncuesta?.tipoActividad;
            const desdeUserActividades = this.userEncuesta?.actividades?.tipoActividad || this.userEncuesta?.actividades;
            const desdeStore = this.actividades?.tipoActividad || this.actividades;

            const convertirALista = (fuente) => {
                const lista = Array.isArray(fuente)
                    ? fuente.map((actividad, index) => [String(index), actividad])
                    : (fuente && typeof fuente === 'object' ? Object.entries(fuente) : []);

                return lista
                    .map(([sourceKey, actividad]) => {
                        const sourceKeyNormalizado = String(sourceKey || '').trim();

                        if (typeof actividad === 'string') {
                            const key = actividad.trim() || sourceKeyNormalizado;
                            return key ? { key, nombre: this.obtenerNombreActividadDelContrato(key), Profesional: this.obtenerProfesionalesActividad(key) } : null;
                        }

                        if (typeof actividad === 'boolean') {
                            if (!actividad || !sourceKeyNormalizado) return null;
                            return {
                                key: sourceKeyNormalizado,
                                nombre: this.obtenerNombreActividadDelContrato(sourceKeyNormalizado),
                                Profesional: this.obtenerProfesionalesActividad(sourceKeyNormalizado),
                            };
                        }

                        if (actividad && typeof actividad === 'object') {
                            const key = String(
                                actividad.key ||
                                actividad.clave ||
                                actividad.id ||
                                actividad.actividadId ||
                                sourceKeyNormalizado
                            ).trim();

                            if (!key) return null;

                            return {
                                ...actividad,
                                key,
                                nombre: actividad.nombre || actividad.descripcion || this.obtenerNombreActividadDelContrato(key),
                                Profesional: Array.isArray(actividad.Profesional) && actividad.Profesional.length > 0
                                    ? actividad.Profesional
                                    : this.obtenerProfesionalesActividad(key),
                            };
                        }

                        if (!actividad && sourceKeyNormalizado) {
                            return {
                                key: sourceKeyNormalizado,
                                nombre: this.obtenerNombreActividadDelContrato(sourceKeyNormalizado),
                                Profesional: this.obtenerProfesionalesActividad(sourceKeyNormalizado),
                            };
                        }

                        return null;
                    })
                    .filter((actividad) => actividad && actividad.key);
            };

            const listaInfoEncuesta = convertirALista(desdeInfoEncuesta);
            const listaInfoActividades = convertirALista(desdeInfoActividades);
            const listaUserEncuesta = convertirALista(desdeUserEncuesta);
            const listaUserActividades = convertirALista(desdeUserActividades);
            const listaStore = convertirALista(desdeStore);

            const mapa = new Map();
            [
                ...listaStore,
                ...listaInfoEncuesta,
                ...listaInfoActividades,
                ...listaUserEncuesta,
                ...listaUserActividades,
            ].forEach((actividad) => {
                if (!actividad?.key) return;
                if (!mapa.has(actividad.key)) {
                    mapa.set(actividad.key, actividad);
                }
            });

            return Array.from(mapa.values());
        },

        // CUPS disponibles filtrados por contrato según profesional, EPS y actividad
        cupsDisponiblesPorContrato() {
            if (!this.userEncuesta || !this.contratos || !this.cargoMostrado || !this.idItem || !Array.isArray(this.cups)) {
                return [];
            }

            const idsPermitidos = this.obtenerIdsCupsPermitidosPorActividad(this.idItem);
            if (!idsPermitidos.size) {
                return [];
            }

            return this.cups.filter(cup => idsPermitidos.has(cup.id));
        },

        cupsDisponiblesFiltradas() {
            const disponibles = this.cupsDisponiblesPorContrato || [];
            if (!this.idItem) return disponibles;

            const idsBloqueados = new Set();

            // Locales en el modal
            this.cupsArray.forEach((cup) => {
                if (cup && cup.actividadId === this.idItem) {
                    idsBloqueados.add(this.obtenerIdCup(cup));
                }
            });

            // Guardados en API
            if (this.asignaciones && this.asignaciones.cups) {
                const cupsGuardados = Array.isArray(this.asignaciones.cups)
                    ? this.asignaciones.cups
                    : Object.values(this.asignaciones.cups);

                cupsGuardados.forEach((cup) => {
                    if (cup && cup.actividadId === this.idItem) {
                        idsBloqueados.add(this.obtenerIdCup(cup));
                    }
                });
            }

            return disponibles.filter((cup) => !idsBloqueados.has(String(cup.id)));
        },

        cupsDisponiblesFiltradasTexto() {
            const disponibles = this.cupsDisponiblesFiltradas || [];
            const texto = this.normalizarTextoComparacion(this.filtroTextoCups);

            if (!texto || texto.length < 3) {
                return disponibles;
            }

            return disponibles.filter((cup) => {
                const codigo = this.normalizarTextoComparacion(cup?.codigo);
                const descripcion = this.normalizarTextoComparacion(cup?.DescripcionCUP);
                const profesionales = this.normalizarTextoComparacion(this.formatProfesionales(cup?.profesional));

                return (
                    codigo.includes(texto) ||
                    descripcion.includes(texto) ||
                    profesionales.includes(texto)
                );
            });
        },

        puedeDevolverEncuestaCorrupta() {
            return !!this.userEncuesta
                && String(this.cargoMostrado || "").trim() !== "Auxiliar de enfermeria"
                && this.actividadesPaciente.length === 0;
        },
    },
    /* ----------------------------------------------------------------------------------------------- */
    methods: {
        ...mapActions([
            "getEncuestaById",
            "getActividadesById",
            "getAllCups",
            "getAllContratos",
            "getAllEpss",
            "getAllActividadesExtra",
            "adicionarCups",
            "selectCupsByActividad",
            "cerrarEncuesta",
            "getAsignacionesByEncuesta",
        ]),

        async obtenerCatalogoActividadesPorDefecto() {
            let catalogo = Array.isArray(this.actividadesExtra) ? this.actividadesExtra.filter(Boolean) : [];

            if (!catalogo.length) {
                try {
                    const cargadas = await this.getAllActividadesExtra();
                    catalogo = Array.isArray(cargadas) ? cargadas.filter(Boolean) : [];
                } catch (error) {
                    console.warn("No se pudo cargar el catálogo de actividades extra:", error);
                }
            }

            if (!catalogo.length) {
                catalogo = Array.isArray(this.tipoActividadExtramural)
                    ? this.tipoActividadExtramural.filter(Boolean)
                    : [];
            }

            const mapa = new Map();
            catalogo.forEach((actividad, index) => {
                const key = String(
                    actividad?.key ||
                    actividad?.clave ||
                    actividad?.id ||
                    actividad?.actividadId ||
                    `actividad_${index + 1}`
                ).trim();

                if (!key || mapa.has(key)) {
                    return;
                }

                mapa.set(key, {
                    ...actividad,
                    key,
                    nombre: actividad?.nombre || actividad?.descripcion || key,
                });
            });

            return Array.from(mapa.values());
        },

        async sembrarActividadesPorDefectoParaAuxiliar() {
            const esAuxiliar = String(this.cargoMostrado || "").trim() === "Auxiliar de enfermeria";
            if (!esAuxiliar || !this.idEncuesta || this.actividadesPaciente.length > 0) {
                return;
            }

            const catalogo = await this.obtenerCatalogoActividadesPorDefecto();
            if (!catalogo.length) {
                return;
            }

            for (const actividad of catalogo) {
                await realtime_api.post(`/Actividades/${this.idEncuesta}/tipoActividad.json`, {
                    key: actividad.key,
                });
            }

            await this.getActividadesById(this.idEncuesta);
            await this.getEncuestaById(this.idEncuesta);
        },

        async devolverEncuestaCorruptaAAuxiliar() {
            if (!this.puedeDevolverEncuestaCorrupta || !this.idEncuesta) {
                return;
            }

            const confirmar = confirm("Se eliminarán las actividades y los CUPS asignados para devolver la encuesta al auxiliar. El auxiliar volverá a cargar las actividades por defecto y reasignará los CUPS desde cero. ¿Desea continuar?");
            if (!confirmar) {
                return;
            }

            this.guardando = true;
            try {
                await Promise.all([
                    realtime_api.delete(`/Asignaciones/${this.idEncuesta}.json`),
                    realtime_api.delete(`/Actividades/${this.idEncuesta}.json`),
                ]);

                await realtime_api.patch(`/Encuesta/${this.idEncuesta}.json`, {
                    status_gest_aux: 0,
                });

                alert("La encuesta se devolvió al auxiliar. Se limpiaron actividades y CUPS para reasignar el caso desde cero.");
                await this.redirigirPostCierre(this.cargoMostrado);
            } catch (error) {
                console.error("No se pudo devolver la encuesta corrupta al auxiliar:", error);
                alert("No se pudo devolver la encuesta al auxiliar.");
            } finally {
                this.guardando = false;
            }
        },

        normalizarTextoComparacion(valor) {
            return String(valor || "")
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, " ");
        },

        getCargoBadgeClass(cargo) {
            const normalizado = this.normalizarTextoComparacion(cargo);
            const compacto = normalizado.replace(/[^a-z0-9]/g, "");

            if (compacto.includes("auxiliardeenfermeria")) return "bg-success text-white";
            if (compacto.includes("enfermero")) return "bg-warning text-dark";
            if (compacto.includes("medico")) return "bg-primary text-white";
            if (compacto.includes("psicolog")) return "bg-cargo-psicologo text-white";
            if (
                compacto.includes("tsocial") ||
                compacto.includes("trabajadorsocial") ||
                compacto.includes("trabajadorasocial") ||
                compacto.includes("trabajosocial")
            ) return "bg-cargo-tsocial text-white";
            if (compacto.includes("nutricion")) return "bg-cargo-nutricionista text-white";

            return "bg-secondary text-white";
        },

        obtenerCupsDeContrato(contrato) {
            if (!contrato || !contrato.cups) return [];
            return Array.isArray(contrato.cups)
                ? contrato.cups.filter(Boolean)
                : Object.values(contrato.cups).filter(Boolean);
        },

        contratoCorrespondeAEps(contrato, epsObjetivoNorm) {
            if (!contrato || !epsObjetivoNorm) return false;

            const epsContratoNorm = this.normalizarTextoComparacion(contrato.epsNombre);
            if (epsContratoNorm && epsContratoNorm === epsObjetivoNorm) {
                return true;
            }

            const epsIdContrato = String(contrato.epsId || "").trim();
            if (epsIdContrato && Array.isArray(this.epss)) {
                const epsRelacionado = this.epss.find((eps) => String(eps?.id || "").trim() === epsIdContrato);
                const epsRelacionadoNorm = this.normalizarTextoComparacion(epsRelacionado?.eps);
                if (epsRelacionadoNorm && epsRelacionadoNorm === epsObjetivoNorm) {
                    return true;
                }
            }

            const cupsContrato = this.obtenerCupsDeContrato(contrato);
            return cupsContrato.some((cupContrato) => {
                const epsCupNorm = this.normalizarTextoComparacion(cupContrato?.epsNombre);
                return epsCupNorm && epsCupNorm === epsObjetivoNorm;
            });
        },

        resolverContextoContratosPaciente() {
            if (!this.userEncuesta || !Array.isArray(this.contratos)) {
                return { contratos: [], epsObjetivoNorm: "" };
            }

            const epsPacienteNorm = this.normalizarTextoComparacion(this.userEncuesta.eps);
            const epsDefaultNorm = this.normalizarTextoComparacion("*ESEBARRANCABERMEJA");

            if (!epsPacienteNorm) {
                return { contratos: [], epsObjetivoNorm: "" };
            }

            let contratosDelPaciente = this.contratos.filter((contrato) =>
                this.contratoCorrespondeAEps(contrato, epsPacienteNorm)
            );

            let epsObjetivoNorm = epsPacienteNorm;

            // El default solo aplica cuando NO existe contrato para la EPS real del paciente.
            if (!contratosDelPaciente.length) {
                const contratosDefault = this.contratos.filter((contrato) =>
                    this.contratoCorrespondeAEps(contrato, epsDefaultNorm)
                );

                if (contratosDefault.length) {
                    contratosDelPaciente = contratosDefault;
                    epsObjetivoNorm = epsDefaultNorm;
                }
            }

            return {
                contratos: contratosDelPaciente,
                epsObjetivoNorm,
            };
        },

        coincideActividadContrato(cupContrato, actividadId, nombreActividadSeleccionada) {
            const actividadContratoId = String(cupContrato?.actividadId ?? cupContrato?.idActividad ?? "").trim();
            const actividadContratoNombre = this.normalizarTextoComparacion(cupContrato?.actividadNombre);
            const actividadSeleccionadaId = String(actividadId || "").trim();
            const actividadSeleccionadaNombre = this.normalizarTextoComparacion(nombreActividadSeleccionada);

            if (!actividadContratoId || actividadContratoId === "0") {
                return true;
            }

            if (actividadContratoId === actividadSeleccionadaId) {
                return true;
            }

            if (actividadContratoNombre && actividadContratoNombre === actividadSeleccionadaNombre) {
                return true;
            }

            return false;
        },

        obtenerIdsCupsPermitidosPorActividad(actividadId) {
            const { contratos, epsObjetivoNorm } = this.resolverContextoContratosPaciente();
            if (!contratos.length || !epsObjetivoNorm || !Array.isArray(this.cups)) {
                return new Set();
            }

            const cargoUsuario = this.cargoMostrado;
            const nombreActividadSeleccionada = this.obtenerNombreActividadDelContrato(actividadId);
            const idsPermitidos = new Set();

            contratos.forEach((contrato) => {
                const cupsContrato = this.obtenerCupsDeContrato(contrato);

                cupsContrato.forEach((cupContrato) => {
                    const epsCupNorm = this.normalizarTextoComparacion(cupContrato?.epsNombre);
                    const coincideEps = !epsCupNorm || epsCupNorm === epsObjetivoNorm;
                    const coincideProfesional = this.profesionalesIncluyen(cupContrato?.cupsProfesional, cargoUsuario);
                    const coincideActividad = this.coincideActividadContrato(
                        cupContrato,
                        actividadId,
                        nombreActividadSeleccionada
                    );

                    if (!coincideEps || !coincideProfesional || !coincideActividad) {
                        return;
                    }

                    const cupContratoId = String(cupContrato?.cupsId ?? cupContrato?.id ?? "").trim();
                    const cupContratoNombre = this.normalizarTextoComparacion(cupContrato?.cupsNombre);

                    const cupEnCatalogo = this.cups.find((cup) => {
                        const coincideId = cupContratoId && String(cup?.id || "").trim() === cupContratoId;
                        const coincideNombre = cupContratoNombre &&
                            this.normalizarTextoComparacion(cup?.DescripcionCUP) === cupContratoNombre;
                        if (!coincideId && !coincideNombre) {
                            return false;
                        }

                        return this.profesionalesCoinciden(cup?.profesional, cupContrato?.cupsProfesional);
                    });

                    if (cupEnCatalogo?.id) {
                        idsPermitidos.add(cupEnCatalogo.id);
                    }
                });
            });

            return idsPermitidos;
        },

        tieneCupsDisponiblesActividad(actividadId) {
            if (!this.userEncuesta || !this.contratos || !this.cargoMostrado || !actividadId || !Array.isArray(this.cups)) {
                return false;
            }
            const idsPermitidos = this.obtenerIdsCupsPermitidosPorActividad(actividadId);
            return idsPermitidos.size > 0;
        },

        truncarTexto(texto, max = 28) {
            const valor = String(texto || "").trim();
            if (valor.length <= max) return valor;
            return `${valor.slice(0, max)}...`;
        },

        formatearFechaSoloDia(valorFecha) {
            if (!valorFecha) return "";
            const texto = String(valorFecha).trim();

            const matchIso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
            if (matchIso) return matchIso[1];

            const fecha = new Date(texto);
            if (!Number.isNaN(fecha.getTime())) {
                return fecha.toISOString().slice(0, 10);
            }

            return texto;
        },

        formatearDatoCaracterizacion(valor, unidad = "") {
            if (valor === 0 || valor === "0") {
                return unidad ? `0 ${unidad}` : "0";
            }

            if (valor === null || valor === undefined || String(valor).trim() === "") {
                return "N/A";
            }

            const valorTexto = String(valor).trim();
            return unidad ? `${valorTexto} ${unidad}` : valorTexto;
        },

        formatearListaCaracterizacion(valor) {
            if (!Array.isArray(valor) || valor.length === 0) {
                return "N/A";
            }

            return valor
                .map((item) => String(item || "").trim())
                .filter(Boolean)
                .join(", ");
        },

        async cargarCaracterizacionEncuesta() {
            if (!this.idEncuesta) {
                this.caracterizacionEncuesta = {};
                this.caracterizacionCargada = false;
                return;
            }

            if (this.caracterizacionCargada) {
                return;
            }

            this.cargandoCaracterizacion = true;
            try {
                const {
                    default: realtime_api
                } = await import('../api/realtimeApi.js');

                const { data } = await realtime_api.get('/caracterizacion.json');

                if (!data) {
                    this.caracterizacionEncuesta = {};
                    this.caracterizacionCargada = true;
                    return;
                }

                const registros = Object.entries(data)
                    .map(([id, value]) => ({ id, ...(value || {}) }))
                    .filter((item) => String(item.idEncuesta) === String(this.idEncuesta));

                if (registros.length === 0) {
                    this.caracterizacionEncuesta = {};
                    this.caracterizacionCargada = true;
                    return;
                }

                const ordenados = registros.sort((a, b) => {
                    const fechaA = new Date(a.fechaCaracterizacion || a.fecha || 0).getTime() || 0;
                    const fechaB = new Date(b.fechaCaracterizacion || b.fecha || 0).getTime() || 0;

                    if (fechaA !== fechaB) {
                        return fechaB - fechaA;
                    }

                    return String(b.id).localeCompare(String(a.id));
                });

                this.caracterizacionEncuesta = ordenados[0] || {};
                this.caracterizacionCargada = true;
            } catch (error) {
                console.error('Error al cargar caracterización por encuesta:', error);
                this.caracterizacionEncuesta = {};
                this.caracterizacionCargada = false;
            } finally {
                this.cargandoCaracterizacion = false;
            }
        },

        async toggleCaracterizacionInfo() {
            this.mostrarCaracterizacion = !this.mostrarCaracterizacion;

            if (this.mostrarCaracterizacion && !this.caracterizacionCargada && !this.cargandoCaracterizacion) {
                await this.cargarCaracterizacionEncuesta();
            }
        },

        onModalShown() {
            this.modalAbierto = true;

            // Remover aria-hidden cuando el modal se muestra para solucionar problemas de accesibilidad
            const modal = document.getElementById('cupsModal');
            if (modal) {
                modal.removeAttribute('aria-hidden');
            }

            // Si había un rescate pendiente de scroll, cancelarlo al abrir de nuevo
            if (this.modalScrollRescueTimeout) {
                clearTimeout(this.modalScrollRescueTimeout);
                this.modalScrollRescueTimeout = null;
            }
        },

        restablecerEstadoModalScroll(forceHideModal = false) {
            // Limpieza defensiva para evitar que la página quede sin scroll por estados huérfanos del modal
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            const backdrops = document.querySelectorAll('.modal-backdrop');
            backdrops.forEach((backdrop) => backdrop.remove());

            const modal = document.getElementById('cupsModal');
            if (modal) {
                modal.classList.remove('show');
                modal.removeAttribute('aria-modal');
                modal.setAttribute('aria-hidden', 'true');
                if (forceHideModal) {
                    modal.style.display = 'none';
                }
            }
        },

        programarRescateScroll() {
            // Si por cualquier razón no dispara hidden.bs.modal, forzamos limpieza breve después
            if (this.modalScrollRescueTimeout) {
                clearTimeout(this.modalScrollRescueTimeout);
            }

            this.modalScrollRescueTimeout = setTimeout(() => {
                const hayModalAbierto = !!document.querySelector('.modal.show');
                if (!hayModalAbierto) {
                    this.restablecerEstadoModalScroll(false);
                }
                this.modalScrollRescueTimeout = null;
            }, 250);
        },

        onModalHidden() {
            this.modalAbierto = false;

            // Restaurar aria-hidden y limpiar focus cuando el modal se oculta
            const modal = document.getElementById('cupsModal');
            if (modal) {
                modal.setAttribute('aria-hidden', 'true');
            }

            this.restablecerEstadoModalScroll(false);

            this.$nextTick(() => {
                if (document.activeElement && document.activeElement.classList.contains('btn-close')) {
                    document.activeElement.blur();
                }
            });
        },

        onModalHide() {
            this.modalAbierto = false;

            // Respaldo cuando hidden.bs.modal no se dispara por cierres abruptos.
            this.programarRescateScroll();
        },

        registrarEventosModal() {
            if (!this.modalEl) {
                const modal = document.getElementById('cupsModal');
                if (!modal) return;
                this.modalEl = modal;
            }

            if (!this.modalShownHandler) {
                this.modalShownHandler = this.onModalShown.bind(this);
            }
            if (!this.modalHiddenHandler) {
                this.modalHiddenHandler = this.onModalHidden.bind(this);
            }
            if (!this.modalHideHandler) {
                this.modalHideHandler = this.onModalHide.bind(this);
            }

            // Vincular con métodos de la instancia para poder removerlos después
            this.modalEl.addEventListener('shown.bs.modal', this.modalShownHandler);
            this.modalEl.addEventListener('hide.bs.modal', this.modalHideHandler);
            this.modalEl.addEventListener('hidden.bs.modal', this.modalHiddenHandler);
        },

        quitarEventosModal() {
            // Forzar a Bootstrap a cerrar el modal si está abierto
            try {
                const modalRef = this.modalEl || document.getElementById('cupsModal');
                const bootstrapModal = modalRef ? window.bootstrap?.Modal?.getInstance(modalRef) : null;
                if (bootstrapModal) {
                    bootstrapModal.hide();
                }
            } catch (e) {
                // Ignorar errores si Bootstrap no está disponible
            }

            // Remover event listeners
            if (this.modalEl && this.modalShownHandler) {
                this.modalEl.removeEventListener('shown.bs.modal', this.modalShownHandler);
            }
            if (this.modalEl && this.modalHiddenHandler) {
                this.modalEl.removeEventListener('hidden.bs.modal', this.modalHiddenHandler);
            }
            if (this.modalEl && this.modalHideHandler) {
                this.modalEl.removeEventListener('hide.bs.modal', this.modalHideHandler);
            }

            this.restablecerEstadoModalScroll(true);

            if (this.modalScrollRescueTimeout) {
                clearTimeout(this.modalScrollRescueTimeout);
                this.modalScrollRescueTimeout = null;
            }

            this.modalEl = null;
            this.modalShownHandler = null;
            this.modalHideHandler = null;
            this.modalHiddenHandler = null;
            this.modalAbierto = false;
        },

        edadActual(x) {
            if (!x) return null; // valida que haya fecha

            let nacimiento;

            // Manejar diferentes tipos de entrada
            if (typeof x === "string" || x instanceof String) {
                nacimiento = new Date(x);
            } else if (x instanceof Date) {
                nacimiento = x;
            } else if (typeof x === "object" && x !== null) {
                // Si es un objeto, intenta extraer una propiedad con la fecha (ajusta según tu estructura)
                if (x.date) {
                    nacimiento = new Date(x.date);
                } else {
                    console.warn("Formato de fecha no soportado:", x);
                    return null;
                }
            } else {
                console.warn("Formato de fecha no soportado:", x);
                return null;
            }

            // Validar que la fecha sea válida
            if (isNaN(nacimiento.getTime())) {
                console.warn("Fecha inválida:", x);
                return null;
            }

            const hoy = new Date();

            let edad = hoy.getFullYear() - nacimiento.getFullYear();
            const mesDiff = hoy.getMonth() - nacimiento.getMonth();
            const diaDiff = hoy.getDate() - nacimiento.getDate();

            // Si aún no ha pasado el cumpleaños este año, resta 1
            if (mesDiff < 0 || (mesDiff === 0 && diaDiff < 0)) {
                edad--;
            }

            return edad;
        },

        clear() {
            this.keyActividad = "";
            this.CupsSeleccionadoId = "";
            this.cantidad = 1;
            this.detalle = "";
            this.cupsArray = [];
            this.filtroTextoCups = "";
        },
        //elimina un cup del listado por indice
        eliminarDelListado(index, cup = null) {
            if (cup && !this.puedeEliminarCupEnModal(cup)) {
                alert('No tienes permisos para quitar CUPS de otros profesionales.');
                return;
            }
            this.cupsArray.splice(index, 1);
        },
        //adiciona los cups al listado que se va guardando
        obtenerIdCup(cup) {
            return cup?.id || cup?.Homolog || cup?.cupsId || "";
        },
        addCups(cupsId, cant, detalle) {
            const cupSeleccionado = this.cupsDisponiblesPorContrato.find(
                (cup) => String(cup.id) === String(cupsId)
            );

            if (cupSeleccionado) {
                const cupId = cupSeleccionado.id;

                const existeEnActividad = this.cupsArray.some(
                    (cup) => cup.id === cupId && cup.actividadId === this.idItem
                );

                let existeEnAsignaciones = false;
                if (this.asignaciones && this.asignaciones.cups) {
                    const cupsGuardados = Array.isArray(this.asignaciones.cups)
                        ? this.asignaciones.cups
                        : Object.values(this.asignaciones.cups);

                    existeEnAsignaciones = cupsGuardados.some(
                        (cup) => cup && cup.id === cupId && cup.actividadId === this.idItem
                    );
                }

                if (existeEnActividad || existeEnAsignaciones) {
                    alert("Este CUPS ya fue agregado a esta actividad.");
                    this.CupsSeleccionadoId = "";
                    this.cantidad = 1;
                    this.detalle = "";
                    return;
                }

                this.cupsArray.push({
                    ...cupSeleccionado,
                    id: cupId,
                    cupsId: cupId,
                    cupsNombre: cupSeleccionado.DescripcionCUP,
                    cantidad: cant,
                    detalle: detalle,
                    actividadId: this.idItem,
                    key: this.cargoMostrado || "",
                    nombreProf: this.nombreProfesionalObjetivo || "",
                    idProf: this.documentoObjetivo || "",
                    idProfesional: this.documentoObjetivo || "",
                    localDraft: true,
                });
                this.CupsSeleccionadoId = "";
                this.cantidad = 1;
            } else {
                alert("Seleccione una opción válida.");
            }
            this.cantidad = 1;
            this.detalle = "";
        },
        //gestiona los parametros de la ruta de almacenamiento
        async integrarCup(obj) {
            if (!obj || !obj.key) return;

            // Establecer idItem PRIMERO
            this.idItem = obj.key;
            this.actividadSeleccionadaNombre = this.obtenerNombreActividadDelContrato(obj.key);

            // Luego limpiar el resto
            this.clear();

            if (this.cargoMostrado) {
                this.keyActividad = this.cargoMostrado;
            } else {
                this.keyActividad = "";
            }

            await this.cargarCupsGuardados(this.idItem);
        },

        async abrirModalCups(item) {
            try {
                await this.integrarCup(item);

                this.restablecerEstadoModalScroll(false);

                await this.$nextTick();
                this.registrarEventosModal();

                const modalRef = this.modalEl || document.getElementById('cupsModal');
                if (!modalRef || !window.bootstrap?.Modal) return;

                // Si existe una instancia previa con backdrop=true, desecharla para aplicar configuración limpia.
                const instanciaExistente = window.bootstrap.Modal.getInstance(modalRef);
                if (instanciaExistente) {
                    instanciaExistente.dispose();
                }

                const instancia = new window.bootstrap.Modal(modalRef, {
                    backdrop: false,
                    keyboard: true,
                    focus: true,
                });
                instancia.show();
            } catch (error) {
                console.error('Error al abrir modal de CUPS:', error);
            }
        },
        async cargarCupsGuardados(idActividad) {
            try {
                const response = await this.selectCupsByActividad({
                    enc: this.idEncuesta,
                    act: idActividad,
                });
                this.cupsArray = Array.isArray(response)
                    ? response.map((cup) => ({ ...cup, localDraft: false }))
                    : [];
            } catch (error) {
                console.error("Error al cargar CUPS guardados:", error);
                this.cupsArray = [];
            }
        },
        async cargarAsignaciones() {
            try {
                const asignacionesData = await this.getAsignacionesByEncuesta(this.idEncuesta);
                this.asignaciones = asignacionesData || {};
            } catch (error) {
                console.error("Error al cargar asignaciones:", error);
                this.asignaciones = {};
            }
        },
        obtenerCupsPorActividad(actividadId) {
            if (!this.asignaciones || !this.asignaciones.cups) {
                return "Sin CUPS";
            }

            const cupsArray = Array.isArray(this.asignaciones.cups) ?
                this.asignaciones.cups :
                Object.values(this.asignaciones.cups);

            const cupsFiltrados = cupsArray.filter(cup => {
                return cup && cup.actividadId === actividadId;
            });

            if (cupsFiltrados.length === 0) {
                return "Sin CUPS";
            }

            return cupsFiltrados
                .map(cup => cup.cupsNombre || cup.DescripcionCUP || "")
                .filter(Boolean)
                .join(", ");
        },
        obtenerCupsArrayPorActividad(actividadId) {
            if (!this.asignaciones || !this.asignaciones.cups) {
                return [];
            }

            const cupsArray = Array.isArray(this.asignaciones.cups) ?
                this.asignaciones.cups :
                Object.values(this.asignaciones.cups);

            return cupsArray.filter(cup => cup && cup.actividadId === actividadId);
        },
        async eliminarCupsAsignado(cup, actividadId) {
            if (!this.esAutorDelCup(cup)) {
                alert('No tienes permisos para eliminar CUPS de otros profesionales.');
                return;
            }

            if (!confirm(`¿Estás seguro de eliminar "${cup.cupsNombre || cup.DescripcionCUP}" de esta actividad?`)) {
                return;
            }

            try {
                this.guardando = true;

                const {
                    default: realtime_api
                } = await import('../api/realtimeApi.js');

                const cupsOrigen = this.asignaciones?.cups;
                const cupsActuales = Array.isArray(cupsOrigen)
                    ? [...cupsOrigen]
                    : (cupsOrigen && typeof cupsOrigen === 'object' ? Object.values(cupsOrigen) : []);

                if (cupsActuales.length === 0) {
                    alert('No hay CUPS para eliminar en esta actividad.');
                    return;
                }

                const cupId = this.obtenerIdCup(cup);

                // Eliminar solo el CUPS exacto del mismo autor, no los de otros profesionales.
                let indiceCup = cupsActuales.findIndex((c) => {
                    if (!c) return false;
                    const mismoCupId = this.obtenerIdCup(c) === cupId;
                    const mismaActividad = String(c.actividadId || '') === String(actividadId || '');
                    const mismoAutor = this.esMismoAutorRegistro(c, cup);
                    const mismoDetalle = String(c.detalle || '') === String(cup.detalle || '');
                    const mismaCantidad = String(c.cantidad ?? '') === String(cup.cantidad ?? '');
                    return mismoCupId && mismaActividad && mismoAutor && mismoDetalle && mismaCantidad;
                });

                if (indiceCup === -1) {
                    indiceCup = cupsActuales.findIndex((c) => {
                        if (!c) return false;
                        const mismoCupId = this.obtenerIdCup(c) === cupId;
                        const mismaActividad = String(c.actividadId || '') === String(actividadId || '');
                        const mismoAutor = this.esMismoAutorRegistro(c, cup);
                        return mismoCupId && mismaActividad && mismoAutor;
                    });
                }

                if (indiceCup === -1) {
                    alert('No se encontro un CUPS propio para eliminar en esta actividad.');
                    return;
                }

                const cupsActualizados = [...cupsActuales];
                cupsActualizados.splice(indiceCup, 1);

                const datosActualizados = {
                    ...this.asignaciones,
                    cups: cupsActualizados,
                    key: this.cargoMostrado,
                    nombreProf: this.nombreProfesionalObjetivo,
                };

                await realtime_api.put(`/Asignaciones/${this.idEncuesta}.json`, datosActualizados);

                await this.cargarAsignaciones();
                alert('CUPS eliminado correctamente');
            } catch (error) {
                console.error('Error al eliminar CUPS:', error);
                alert('Error al eliminar el CUPS. Intente nuevamente.');
            } finally {
                this.guardando = false;
            }
        },
        //confirma la seleccion de cups arma paquete para entregar al storage
        async confirmarSeleccion(encuestasId) {
            this.guardando = true;
            const idEncuesta = encuestasId || this.idEncuesta;

            const cupsNuevos = this.cupsArray.filter((cup) => cup?.localDraft === true);
            if (cupsNuevos.length === 0) {
                this.guardando = false;
                alert('No hay CUPS nuevos para guardar.');
                return;
            }

            const cupsConActividad = cupsNuevos.map(cup => {
                const cupId = this.obtenerIdCup(cup);
                return {
                    ...cup,
                    id: cupId,
                    cupsId: cupId,
                    actividadId: this.idItem,
                    key: this.keyActividad,
                    nombreProf: this.nombreProfesionalObjetivo,
                    idProf: this.documentoObjetivo || "",
                    idProfesional: this.documentoObjetivo || "",
                    convenio: this.convenioObjetivo || "",
                    localDraft: undefined,
                };
            });

            let data = {
                key: this.keyActividad,
                cups: cupsConActividad,
                idEncuesta: this.idEncuesta,
                nombreProf: this.nombreProfesionalObjetivo,
                idProf: this.documentoObjetivo || "",
                idProfesional: this.documentoObjetivo || "",
                convenio: this.convenioObjetivo || "",
            };

            try {
                await this.adicionarCups(data);
                this.clear();
                await this.recargar();
            } finally {
                this.guardando = false;
                this.programarRescateScroll();
            }
        },

        actividadesConMedico(tipoActividad) {
            if (!tipoActividad || !this.cargoMostrado) return [];
            return Object.values(tipoActividad).filter(
                (actividad) =>
                    actividad.Profesional && actividad.Profesional.includes(this.cargoMostrado)
            );
        },

        actividadExisteEnContrato(actividadId) {
            // Verifica si la actividad existe en el contrato de la EPS del paciente
            if (!this.userEncuesta || !this.contratos || !this.epss) {
                return false;
            }

            const epsDelPaciente = this.userEncuesta.eps;
            const epsEncontrada = this.epss.find((eps) => eps.eps === epsDelPaciente);

            if (!epsEncontrada) {
                return false;
            }

            // Búsqueda mejorada del contrato - primero por ID de EPS
            let contratoDelPaciente = this.contratos.find(
                (contrato) => String(contrato.epsId) === String(epsEncontrada.id)
            );

            // Si no encuentra por ID, intentar búsqueda por nombre de EPS
            if (!contratoDelPaciente) {
                const contratasPorNombre = this.contratos.filter((contrato) => {
                    const epsDelContrato = this.epss.find((eps) => String(eps.id) === String(contrato.epsId));
                    return epsDelContrato && epsDelContrato.eps === epsDelPaciente;
                });

                if (contratasPorNombre.length > 0) {
                    contratoDelPaciente = contratasPorNombre[0];
                }
            }

            if (!contratoDelPaciente || !contratoDelPaciente.cups) {
                return false;
            }

            // Verificar si existe al menos un CUPS con este actividadId en el contrato
            // Si el actividadId es '0', el contrato tiene CUPS disponibles para todas las actividades
            return Object.values(contratoDelPaciente.cups).some(
                (cupContrato) => cupContrato && (cupContrato.actividadId === '0' || cupContrato.actividadId === actividadId)
            );
        },
        /* ---------------------------------------------------------------------------- */

        /* --------------------------------------------------------------------- */
        async cupsAsignados(idAct) {
            try {
                const response = await this.selectCupsByActividad({
                    enc: this.idEncuesta,
                    act: idAct,
                });
                if (response && response.length > 0) {
                    return response.map((cup) => cup.DescripcionCUP).join(", ");
                } else {
                    return "No hay CUPS asignados";
                }
            } catch (error) {
                console.error("Error al obtener los CUPS asignados:", error);
                return "Error al cargar CUPS";
            }
        },

        eliminarCUP(idEncuesta, idActividad, idCup) {
            if (confirm("¿Estás seguro de que deseas eliminar este CUP?")) {
                /*    console.log("Eliminar cup con id:", idx); */
                this.$store
                    .dispatch("deleteCUPS", {
                        idEncuesta: this.idEncuesta,
                        idActividad: idActividad,
                        idCup: idCup,
                        rol: this.userData.cargo,
                    })
                    .then(() => {
                        this.recargar();
                    })
                    .catch((error) => {
                        console.error("Error al eliminar el CUP:", error);
                    });
            }
        },

        obtenerNombreActividad(key) {
            const actividad = this.tipoActividadExtramural.find((act) => act.key === key);
            return actividad ? actividad.nombre : key;
        },

        obtenerNombreActividadDelContrato(actividadId) {
            // Obtiene el nombre de la actividad basado en el actividadId del contrato
            const actividad = this.tipoActividadExtramural.find((act) => act.key === actividadId);
            if (actividad) return actividad.nombre;

            const actividadExtra = Array.isArray(this.actividadesExtra)
                ? this.actividadesExtra.find((act) => String(act.key || "").trim() === String(actividadId || "").trim())
                : null;

            if (actividadExtra?.nombre) return actividadExtra.nombre;

            return actividadId;
        },

        obtenerProfesionalesActividad(key) {
            const actividadExtra = Array.isArray(this.actividadesExtra)
                ? this.actividadesExtra.find((act) => act.key === key)
                : null;

            if (actividadExtra && Array.isArray(actividadExtra.Profesional) && actividadExtra.Profesional.length > 0) {
                return actividadExtra.Profesional;
            }

            const actividad = this.tipoActividadExtramural.find((act) => act.key === key);
            return actividad ? actividad.Profesional : [];
        },

        puedeMostrarActividad(actividad) {
            const key = typeof actividad === 'string' ? actividad : actividad?.key;

            const profesionales =
                Array.isArray(actividad?.Profesional) && actividad.Profesional.length > 0
                    ? actividad.Profesional
                    : this.obtenerProfesionalesActividad(key);

            const cargo = this.cargoMostrado || "";

            return Array.isArray(profesionales) && profesionales.includes(cargo);
        },

        obtenerActividadesPendientesPorCups() {
            return (this.actividadesPaciente || []).filter((actividad) => {
                if (!actividad?.key) return false;
                if (!this.puedeMostrarActividad(actividad)) return false;
                if (!this.tieneCupsDisponiblesActividad(actividad.key)) return false;
                return this.obtenerCupsArrayPorActividad(actividad.key).length === 0;
            });
        },

        normalizarProfesionales(profesionales) {
            return Array.from(new Set(
                (Array.isArray(profesionales) ? profesionales : [profesionales])
                    .map((item) => String(item || "").trim())
                    .filter(Boolean)
            ));
        },

        profesionalesIncluyen(profesionales, cargo) {
            return this.normalizarProfesionales(profesionales).includes(String(cargo || "").trim());
        },

        profesionalesCoinciden(profesionalesA, profesionalesB) {
            const listaA = this.normalizarProfesionales(profesionalesA);
            const listaB = this.normalizarProfesionales(profesionalesB);
            return listaA.some((item) => listaB.includes(item));
        },

        formatProfesionales(profesionales) {
            return this.normalizarProfesionales(profesionales).join(", ");
        },

        normalizarNombreProfesional(nombre) {
            return String(nombre || "")
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, " ");
        },

        obtenerIdAutorCup(cup) {
            return String(cup?.idProf ?? cup?.idProfesional ?? cup?.numDocumento ?? "").trim();
        },

        esMismoAutorRegistro(cupA, cupB) {
            const idAutorA = this.obtenerIdAutorCup(cupA);
            const idAutorB = this.obtenerIdAutorCup(cupB);
            if (idAutorA && idAutorB) {
                return idAutorA === idAutorB;
            }

            const cargoA = String(cupA?.key || "").trim();
            const cargoB = String(cupB?.key || "").trim();
            if (cargoA !== cargoB) return false;

            const nombreA = this.normalizarNombreProfesional(cupA?.nombreProf);
            const nombreB = this.normalizarNombreProfesional(cupB?.nombreProf);
            if (nombreA && nombreB) {
                return nombreA === nombreB;
            }

            return false;
        },

        esAutorDelCup(cup) {
            if (!cup) return false;

            const cargoActual = String(this.cargoMostrado || "").trim();
            const cargoCup = String(cup.key || "").trim();
            if (!cargoActual || cargoCup !== cargoActual) return false;

            const idActual = String(this.documentoObjetivo || "").trim();
            const idCup = this.obtenerIdAutorCup(cup);
            if (idActual && idCup) {
                return idActual === idCup;
            }

            const nombreActual = this.normalizarNombreProfesional(this.nombreProfesionalObjetivo);
            const nombreCup = this.normalizarNombreProfesional(cup.nombreProf);
            if (nombreActual && nombreCup) {
                return nombreActual === nombreCup;
            }

            return false;
        },

        puedeEliminarCupEnModal(cup) {
            if (!cup) return false;
            return cup.localDraft === true;
        },

        puedeEliminarCups(cup) {
            return this.esAutorDelCup(cup);
        },

        async recargar() {
            if (!this.isComponentActive) return;

            try {
                await this.getEncuestaById(this.idEncuesta);
                if (!this.isComponentActive) return;

                await this.getActividadesById(this.idEncuesta);
                if (!this.isComponentActive) return;

                await this.cargarAsignaciones();
                await this.sembrarActividadesPorDefectoParaAuxiliar();
            } catch (error) {
                console.error("Error en recargar:", error);
            }
        },

        resolverRutaDestino(cargo) {
            const rutaAnterior = sessionStorage.getItem("rutaAnterior");
            const rutasValidas = [
                "/sop_aux",
                "/sop_enfermero",
                "/sop_profesional",
                "/sop_psicologo",
                "/sop_tsocial",
                "/sop_nutricionista",
            ];

            if (rutaAnterior && rutasValidas.includes(rutaAnterior)) {
                return rutaAnterior;
            }

            if (rutaAnterior && !rutaAnterior.startsWith("/")) {
                const rutaNormalizada = `/${rutaAnterior}`;
                if (rutasValidas.includes(rutaNormalizada)) {
                    return rutaNormalizada;
                }
            }

            if (cargo === "Medico") return "/sop_profesional";
            if (cargo === "Enfermero") return "/sop_enfermero";
            if (cargo === "Psicologo") return "/sop_psicologo";
            if (cargo === "Tsocial") return "/sop_tsocial";
            if (cargo === "Nutricionista") return "/sop_nutricionista";
            return "/sop_aux";
        },

        async redirigirPostCierre(cargo) {
            const rutaDestino = this.resolverRutaDestino(cargo);
            sessionStorage.removeItem("rutaAnterior");

            const queryDestino = this.esEstadoView
                ? {
                    estadoView: "1",
                    profesionalDoc: this.documentoObjetivo,
                    profesionalCargo: this.cargoMostrado,
                    profesionalConvenio: this.convenioObjetivo,
                    profesionalNombre: this.nombreProfesionalObjetivo,
                }
                : null;

            await this.$nextTick();
            if (queryDestino) {
                await this.$router.replace({ path: rutaDestino, query: queryDestino });
                return;
            }
            await this.$router.replace(rutaDestino);
        },

        async cerrarVisita() {
            // Confirmar que el usuario quiere cerrar la visita
            if (confirm("¿Estás seguro de que deseas cerrar las actividades de la visita?")) {
                if (!this.actividadesPaciente.length) {
                    alert("No se puede cerrar la visita sin actividades asignadas.");
                    return;
                }

                if (this.cargoMostrado === "Auxiliar de enfermeria") {
                    const actividadesPendientes = this.obtenerActividadesPendientesPorCups();
                    if (actividadesPendientes.length > 0) {
                        const nombresPendientes = actividadesPendientes
                            .map((actividad) => this.obtenerNombreActividadDelContrato(actividad.key))
                            .filter(Boolean)
                            .join(", ");

                        alert(
                            `No se puede cerrar la gestión del auxiliar mientras existan actividades sin CUPS asignados. Pendientes: ${nombresPendientes}`
                        );
                        return;
                    }
                }

                try {
                    await caracterizacionApi.getByEncuestaId(this.idEncuesta);
                } catch (_error) {
                    alert("La visita solo podrá cerrarse cuando se realice la caracterización.");
                    return;
                }

                const cargo = this.cargoMostrado;

                try {

                    // Si el usuario es Auxiliar de enfermería, Médico, Psicólogo o Trabajador Social, cerrar directamente
                    if (cargo === "Auxiliar de enfermeria" || cargo === "Medico" || cargo === "Psicologo" || cargo === "Tsocial" || cargo === "Nutricionista") {
                        await this.cerrarEncuesta({
                            id: this.idEncuesta,
                            cargo: cargo,
                        });
                        await this.redirigirPostCierre(cargo);
                    }
                    // Si el usuario es Enfermero, verificar que las actividades de Auxiliar y Médico ya estén cerradas
                    else if (cargo === "Enfermero") {
                        const normalizarEstado = (valor) => {
                            if (valor === true || valor === 1) return true;
                            if (typeof valor === "string") {
                                const limpio = valor.trim().toLowerCase();
                                return limpio === "true" || limpio === "1";
                            }
                            return false;
                        };

                        let statusAux = null;
                        let statusMedica = null;

                        try {
                            const { default: realtime_api } = await import('../api/realtimeApi.js');
                            const { data: encuestaActual } = await realtime_api.get(`/Encuesta/${this.idEncuesta}.json`);
                            statusAux = encuestaActual?.status_gest_aux;
                            statusMedica = encuestaActual?.status_gest_medica;
                        } catch (error) {
                            const encuestaBase = this.InfoEncuestasById?.[0] || this.userEncuesta || null;
                            statusAux = encuestaBase?.status_gest_aux;
                            statusMedica = encuestaBase?.status_gest_medica;
                            console.warn('No se pudo leer Encuesta actualizada, usando datos locales:', error);
                        }

                        const auxCerrado = normalizarEstado(statusAux);
                        const medicoCerrado = normalizarEstado(statusMedica);

                        if (auxCerrado && medicoCerrado) {
                            await this.cerrarEncuesta({
                                id: this.idEncuesta,
                                cargo: cargo,
                            });
                            await this.redirigirPostCierre(cargo);
                        } else {
                            alert(
                                "Deben estar cerradas las actividades por todos los profesionales antes de cerrar la visita..."
                            );
                        }
                    }
                } catch (error) {
                    console.error("Error al cerrar la visita:", error);
                    alert("Hubo un error al cerrar la visita. Intente nuevamente.");
                }
            }
        },
    },
    /*    console.log(this.idEncuesta, this.userData.cargo); */

    watch: {
        "$route.params.idEncuesta"(newId) {
            this.idEncuesta = newId;
            this.caracterizacionEncuesta = {};
            this.caracterizacionCargada = false;
            this.cargandoCaracterizacion = false;
            this.mostrarCaracterizacion = false;
            this.recargar();
        },

        InfoEncuestasById() {
            // El modal vive dentro de un v-if, así que puede aparecer después de mounted.
            this.$nextTick(() => {
                this.registrarEventosModal();
            });
        },
    },

    /* ----------------------------------------------------------------------------------------------- */
    async mounted() {
        // Reiniciar la bandera cuando el componente se monta
        this.isComponentActive = true;
        this.cargandoDatos = true;

        try {
            await Promise.all([
                this.getEncuestaById(this.idEncuesta),
                this.getActividadesById(this.idEncuesta),
                this.getAllCups(),
                this.getAllContratos(),
                this.getAllEpss(),
                this.getAllActividadesExtra(),
                this.cargarAsignaciones()
            ]);

            await this.sembrarActividadesPorDefectoParaAuxiliar();
            this.cargandoDatos = false;
        } catch (error) {
            console.error("Error en mounted:", error);
            this.cargandoDatos = false;
        }

        this.$nextTick(() => {
            this.registrarEventosModal();
        });
    },

    beforeUnmount() {
        // Marcar como inactivo para cancelar operaciones pendientes
        this.isComponentActive = false;

        // Limpiar event listeners del modal
        this.quitarEventosModal();

        // Limpieza defensiva final
        this.restablecerEstadoModalScroll(true);
    },
    /* ----------------------------------------------------------------------------------------------- */
    created() {
        this.idEncuesta = this.$route.params.idEncuesta;
    },
};
</script>

<style>
.sop-cups-auxiliar-view {
    font-size: 0.8rem;
    padding-bottom: 10px;
}

.sop-cups-auxiliar-view h5 {
    font-size: 1rem;
}

/* Botón Cerrar Visita fijo al fondo de la pantalla */
.footer-cerrar-visita {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(4px);
    border-top: 1px solid #dee2e6;
    padding: 10px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
}

/* En sesión delegada, elevar el footer de cerrar visita para que no choque con el footer global. */
#app.is-delegated-session .footer-cerrar-visita {
    bottom: 86px;
}

/* Scroll forzado del contenido principal de actividades */
.cups-main-scroll {
    width: 100%;
    overflow-x: scroll;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable;
    padding-bottom: 70px;
}

#app.is-delegated-session .cups-main-scroll {
    padding-bottom: 156px;
}

@media (max-width: 768px) {
    #app.is-delegated-session .footer-cerrar-visita {
        bottom: 124px;
    }

    #app.is-delegated-session .cups-main-scroll {
        padding-bottom: 210px;
    }
}

/* Forzar que las barras de scroll siempre sean visibles (Webkit) */
.cups-main-scroll::-webkit-scrollbar,
.cups-listado-scroll::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}

.cups-main-scroll::-webkit-scrollbar-track,
.cups-listado-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.cups-main-scroll::-webkit-scrollbar-thumb,
.cups-listado-scroll::-webkit-scrollbar-thumb {
    background: #adb5bd;
    border-radius: 4px;
}

.cups-main-scroll::-webkit-scrollbar-thumb:hover,
.cups-listado-scroll::-webkit-scrollbar-thumb:hover {
    background: #6c757d;
}

.cups-main-scroll::-webkit-scrollbar-corner,
.cups-listado-scroll::-webkit-scrollbar-corner {
    background: #f1f1f1;
}

/* Lista de CUPS en modal */
.cups-listado-scroll {
    max-height: 260px;
    overflow-x: scroll;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable;
}

.table-responsive-wrapper {
    width: 100%;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}

.cups-listado-scroll .table {
    min-width: 100%;
    margin-bottom: 0;
    width: 100%;
}

.cups-listado-scroll .table thead {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #f8f9fa;
}

.cups-listado-scroll .table th {
    padding: 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    border-color: #dee2e6;
}

.cups-listado-scroll .table td {
    padding: 0.5rem;
    font-size: 0.75rem;
    word-break: break-word;
    border-color: #dee2e6;
}

/* Ancho mínimo de columnas para evitar colapso */
.col-cups {
    min-width: 80px;
}

.col-detalle {
    min-width: 100px;
}

.col-cantidad {
    min-width: 60px;
}

.col-grupo {
    min-width: 70px;
}

.col-accion {
    min-width: 50px;
    text-align: center;
}

/* Hover effect en filas */
.cups-listado-scroll .table tbody tr:hover {
    background-color: #f9f9f9;
}

/* Botones en tabla responsivos */
.cups-listado-scroll .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
}

.cups-listado-scroll .rounded-circle {
    width: 28px;
    height: 28px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* Responsive para tablets (768px y superior) */
@media (min-width: 768px) {
    .cups-listado-scroll .table th {
        font-size: 0.8rem;
        padding: 0.875rem;
    }

    .cups-listado-scroll .table td {
        font-size: 0.8rem;
        padding: 0.75rem;
    }

    .col-cups {
        min-width: 100px;
    }

    .col-detalle {
        min-width: 120px;
    }

    .col-cantidad {
        min-width: 70px;
    }

    .col-grupo {
        min-width: 80px;
    }

    .cups-listado-scroll .btn-sm {
        padding: 0.375rem 0.75rem;
        font-size: 0.7rem;
    }

    .cups-listado-scroll .rounded-circle {
        width: 32px;
        height: 32px;
    }
}

/* Responsive para desktop (992px y superior) */
@media (min-width: 992px) {
    .cups-listado-scroll .table th {
        font-size: 0.9rem;
        padding: 1rem;
    }

    .cups-listado-scroll .table td {
        font-size: 0.85rem;
        padding: 0.875rem;
    }

    .col-cups {
        min-width: 120px;
    }

    .col-detalle {
        min-width: 150px;
    }

    .col-cantidad {
        min-width: 80px;
    }

    .col-grupo {
        min-width: 100px;
    }

    .cups-listado-scroll .btn-sm {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
    }

    .cups-listado-scroll .rounded-circle {
        width: 36px;
        height: 36px;
    }
}

.sop-cups-auxiliar-view .table {
    font-size: 0.8rem;
}

.sop-cups-auxiliar-view .thead-dark th {
    background-color: #343a40;
    color: #ffffff;
    border-color: #454d55;
}

.sop-cups-auxiliar-view .modal-body {
    font-size: 0.85rem;
    max-height: 70vh;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
}

.texto-guardando {
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #333;
}

/* Evitar bloqueo de scroll cuando Bootstrap deja modal-open activo */
body.modal-open {
    overflow: auto !important;
    padding-right: 0 !important;
}

.modal {
    overflow-y: auto;
}

#cupsModal.modal {
    z-index: 2600 !important;
}

.modal-backdrop.show {
    z-index: 2500 !important;
}

select {
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#cupSelect {
    width: 100%;
}

.cups-resultados-lista {
    width: 100%;
    max-height: 220px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
}

.cups-resultados-lista .list-group-item {
    border: 0;
    border-bottom: 1px solid #e9ecef;
    text-align: left;
}

.cups-resultados-lista .list-group-item:last-child {
    border-bottom: 0;
}

.cups-resultado-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.55rem 0.75rem;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    background: #fff;
}

.cups-resultado-item:last-child {
    border-bottom: 0;
}

.cups-resultado-item.active {
    background: #e9f3ff;
}

#cupCantidad {
    max-width: 72px;
}

.cabecera {
    background-color: #e9e9e9;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 20px;
    border-radius: 15px;
}

.overlay-guardando {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255, 255, 255, 0.7);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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

/* Estilos mejorados para el modal */
.sop-cups-auxiliar-view {
    font-size: 0.9rem;
}

.sop-cups-auxiliar-view h5 {
    font-size: 1rem;
}

.sop-cups-auxiliar-view .table {
    font-size: 0.8rem;
}

.sop-cups-auxiliar-view .modal-body {
    font-size: 0.85rem;
    max-height: 70vh;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
}

.modal-header {
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    border-bottom: none;
}

.modal-header .modal-title {
    color: white;
    font-weight: 600;
}

.modal-content {
    border: none;
    border-radius: 15px;
    overflow: visible;
}

/* Estilos para botones redondeados */
.btn.rounded-circle {
    width: 32px;
    height: 32px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.2s ease;
    font-size: 0.75rem;
}

.btn.rounded-circle:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.btn.rounded-pill {
    border-radius: 50px;
    padding: 8px 16px;
    transition: all 0.2s ease;
}

.btn.rounded-pill:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.texto-sombra {
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.sop-cups-auxiliar-view .paciente {
    background: #14B7A5;
    border-radius: 10px;
    padding: 8px 10px !important;
    color: #ffffff;
    align-items: center;
}

.sop-cups-auxiliar-view .paciente strong {
    color: #ffffff;
}

.cup-texto-corto {
    display: inline-block;
    font-size: 0.75rem;
}

.cup-texto-completo {
    font-size: 0.78rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    line-height: 1.4;
    margin-bottom: 4px;
}

.cantidad-cups-circulo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #dc3545;
    color: white;
    font-size: 0.68rem;
    margin-right: 6px;
    flex-shrink: 0;
}

.nombre-cups {
    color: #0d6efd;
    font-size: 0.78rem;
}

.separador-cups {
    color: #6c757d;
}

.descripcion-cups {
    color: #6f42c1;
}

.detalle-cups {
    color: #198754;
    font-style: italic;
    font-size: 0.76rem;
}

.bg-cargo-psicologo {
    background-color: #c2185b !important;
}

.bg-cargo-tsocial {
    background-color: #1fdf0d !important;
}

.bg-cargo-nutricionista {
    background-color: #fd7e14 !important;
}

@media (max-width: 767.98px) {
    .sop-cups-auxiliar-view .paciente .row.g-1 > .texto-sombra {
        flex: 0 0 50% !important;
        width: 50% !important;
        max-width: 50% !important;
    }

    .sop-cups-auxiliar-view .paciente .row.g-1 > .small,
    .sop-cups-auxiliar-view .paciente .row.g-1 > .mt-1,
    .sop-cups-auxiliar-view .paciente .row.g-1 > hr {
        flex: 0 0 100% !important;
        width: 100% !important;
        max-width: 100% !important;
    }
}

</style>

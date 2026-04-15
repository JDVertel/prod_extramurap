<template>
    <div class="container-fluid">
        <h5><i class="bi bi-calendar2-check"></i> Agendamiento de visita</h5>
        <hr>


        <span v-if="encuestaFiltrada">
            <div class="alert alert-success" role="alert">
                Paciente: {{ encuestaFiltrada.nombre1 }} {{ encuestaFiltrada.nombre2 }} {{ encuestaFiltrada.apellido1 }}
                {{
                    encuestaFiltrada.apellido2 }}
            </div>
        </span>
        <span v-else class="text-danger">No hay datos de paciente disponibles</span>
        <hr>
        <div class="container mb-4">
            <div class="container-fluid tomademuestras">
                <div class="row" v-if="this.tipo === 'tomamuestras'">
                    <div class="col-12 col-md-6">
                        <h5 class="mt-2"><i class="bi bi-prescription2"></i> Toma de laboratorios</h5>
                        <hr />
                        <div class="row mb-4">
                            <div class="col-6">
                                <div>
                                    <label for="dateconsulta" class="form-label">Fecha</label>
                                    <select id="dateconsulta" name="dateconsulta" class="form-select"
                                        aria-label="Default select example" v-model="dateIDAgenda"
                                        @change="agendaActualTomaLab(dateIDAgenda)">
                                        <option value="">Disponibles</option>
                                        <option v-for="(fecha, index) in agendas"
                                            :value="{ id: fecha.id, fecha: fecha.fecha }" :key="index">
                                            {{ fecha.grupo }} - {{ formatFechaCorta(fecha.fecha) }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="col-6">
                                <label for="horalab" class="form-label">Hora:</label>
                                <input class="form-control" id="horalab" v-model="horalab" type="time" step="1800" min="06:00" max="08:30" />
                                <small v-if="horalab" class="text-white d-block mt-1">{{ formatHora12(horalab) }}</small>
                            </div>

                            <button class="btn btn-warning mb-3 mt-3" @click="guardarAgendamientoTomaLab"
                                v-if="userData.grupo && dateIDAgenda && horalab !== ''" :disabled="guardando">
                                {{ guardando ? 'Guardando...' : 'Guardar Agendamiento' }}
                            </button>
                        </div>
                    </div>
                    <div class="col-12 col-md-6" v-if="dateIDAgenda !== '' && encuestasFiltradasLabById.length !== 0">
                        <h6 class="mt-2">Agenda del dia Toma de Laboratorio</h6>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Hora Lab</th>
                                    <th>Grupo</th>
                                    <th>Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(item, index) in encuestasFiltradasLabById"
                                    :key="item?.id + '-' + index">
                                    <tr v-for="(muestra, i) in (item?.tomademuestras || [])" :key="i">
                                        <td>{{ i }}</td>
                                        <td>{{ formatHora12(muestra?.horalab) || '-' }}</td>
                                        <td>{{ muestra?.grupo || '-' }}</td>
                                        <td>
                                            <button class="btn btn-danger rounded-circle"
                                                @click="eliminarItemAgenda({ indice: i, encuestaID: item.id, lista: 'tomademuestras' })"
                                                v-if="
                                                    userData &&
                                                    userData.grupo &&
                                                    muestra?.grupo === userData.grupo
                                                ">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <br />
            <div class="container-fluid visitas" v-if="this.tipo === 'visitamedica'">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <h5 class="mt-2"><i class="bi bi-people-fill"></i> Visita Medica y Enfermeria</h5>
                        <hr />
                        <div class="row mb-4">
                            <div class="col-6">
                                <div>
                                    <label for="datevisita" class="form-label">Fecha</label>
                                    <select id="datevisita" name="datevisita" class="form-select"
                                        aria-label="Default select example" v-model="dateIDvisita"
                                        @change="agendaActualVisita(dateIDvisita)">
                                        <option value="">Disponibles</option>
                                        <option v-for="(fecha, index) in FechasVisitasGrupo"
                                            :value="{ id: fecha.id, fecha: fecha.fecha }" :key="index">
                                            {{ fecha.grupo }} - {{ formatFechaCorta(fecha.fecha) }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="col-6">
                                <label for="horaconsulta" class="form-label">Hora</label>
                                <input class="form-control" id="horavisita" v-model="horavisita" type="time" step="1800" min="09:00" max="11:30" />
                                <small v-if="horavisita" class="text-white d-block mt-1">{{ formatHora12(horavisita) }}</small>
                            </div>
                            <button class="btn btn-warning mb-3 mt-3" @click="guardarAgendamientoVisitas"
                                v-if="userData.grupo && dateIDvisita && horavisita !== ''" :disabled="guardando">
                                {{ guardando ? 'Guardando...' : 'Guardar Agendamiento' }}
                            </button>
                        </div>
                    </div>
                    <div class="col-12 col-md-6" v-if="dateIDvisita">
                        <h6 class="mt-2">Agenda del dia Visita medica y enfermeria</h6>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Hora Visita</th>
                                    <th>Grupo</th>
                                    <th>Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(iten, index) in encuestasFiltradasVisitaById"
                                    :key="iten?.id + '-' + index">
                                    <tr v-for="(muestras, i) in (iten?.visitamedica || [])" :key="i">
                                        <td>{{ i }}</td>
                                        <td>{{ formatHora12(muestras?.horavisita) || '-' }}</td>
                                        <td>{{ muestras?.grupo || '-' }}</td>
                                        <td>
                                            <button class="btn btn-danger rounded-circle"
                                                @click="eliminarItemAgenda({ indice: i, encuestaID: iten.id, lista: 'visitamedica' })"
                                                v-if="
                                                    userData &&
                                                    userData.grupo &&
                                                    muestras?.grupo === userData.grupo
                                                "><i class="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <router-link to="/sop_home">Volver</router-link>
    </div>
</template>

<script>
import moment from "moment";
import {
    mapState,
    mapActions
} from "vuex";
export default {
    data: () => {
        return {
            tipo: "",
            dateIDAgenda: "",
            dateIDvisita: "",
            idEncuesta: "",
            fechaActual: "",

            dateIDlab: "",
            horalab: "",
            dateIDvisita: "",
            horavisita: "",
            guardando: false, // Flag para evitar clics múltiples
        };
    },
    methods: {
        ...mapActions([
            "getListAgendas",
            "getTomamuestras",
            "guardarAgendaT",
            "guardarAgendaV",
            "getAgendasTomaLabById",
            "getAgendasVisitaById",
            "eliminarAgenda",

        ]),

        formatFechaCorta(valor) {
            if (!valor) return "";
            const parsed = moment(valor, ["YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss", moment.ISO_8601], true);
            return parsed.isValid() ? parsed.format("DD/MM/YYYY") : String(valor);
        },
        formatHora12(valor) {
            if (!valor) return "";
            const parsed = moment(String(valor), ["HH:mm", "HH:mm:ss", moment.ISO_8601], true);
            return parsed.isValid() ? parsed.format("hh:mm A") : String(valor);
        },
        horaEnRango(hora, min, max) {
            if (!hora) return false;
            const actual = moment(hora, ["HH:mm", "HH:mm:ss"], true);
            const minimo = moment(min, "HH:mm", true);
            const maximo = moment(max, "HH:mm", true);
            return actual.isValid() && minimo.isValid() && maximo.isValid() && actual.isBetween(minimo, maximo, undefined, "[]");
        },
        obtenerPacienteNombre() {
            if (!this.encuestaFiltrada) return "";
            return [this.encuestaFiltrada.nombre1, this.encuestaFiltrada.nombre2, this.encuestaFiltrada.apellido1, this.encuestaFiltrada.apellido2]
                .map((item) => String(item || "").trim())
                .filter(Boolean)
                .join(" ");
        },
        obtenerBarrio() {
            const barrio = this.encuestaFiltrada?.barrioVeredacomuna?.barrio
                ?? this.encuestaFiltrada?.barrio
                ?? this.encuestaFiltrada?.barrioVeredacomuna;
            return String(barrio || "Sin barrio").trim();
        },
        /* --------------------------------------------------------------------------------------------------------- */

        async guardarAgendamientoTomaLab() {
            // Prevenir clics múltiples
            if (this.guardando) {
                alert("Por favor espere, se está guardando el agendamiento...");
                return;
            }

            if (
                this.dateIDAgenda === "" ||
                this.horalab === "" ||
                this.userData.grupo === ""
            ) {
                alert("Error en los datos, loguearse nuevamente.");
                return;
            }

            if (!this.horaEnRango(this.horalab, "06:00", "08:30")) {
                alert("La hora de laboratorio debe estar entre 06:00 AM y 08:30 AM.");
                return;
            }

            // Validación: verificar si ya existe un agendamiento idéntico
            const agendamientoExistente = this.encuestasFiltradasLabById.some(item => {
                return (item?.tomademuestras || []).some(muestra =>
                    muestra?.horalab === this.horalab &&
                    muestra?.grupo === this.userData.grupo &&
                    item.id === this.idEncuesta
                );
            });

            if (agendamientoExistente) {
                alert("Ya existe un agendamiento con esta hora y grupo para este paciente.");
                return;
            }

            this.guardando = true; // Activar flag
            try {
                const agendaSeleccionada = { ...this.dateIDAgenda };
                let datos = {
                    idAgenda: agendaSeleccionada.id,
                    fechaAgenda: agendaSeleccionada.fecha,
                    idEncuesta: this.idEncuesta,
                    horalab: this.horalab,
                    grupo: this.userData.grupo,
                    paciente: this.obtenerPacienteNombre(),
                    encuestador: this.userData.nombre,
                    barrio: this.obtenerBarrio(),
                    direccion: String(this.encuestaFiltrada?.direccion || "Sin dirección").trim(),
                };
                console.log("Guardando agendamiento de laboratorio:", datos);
                await this.guardarAgendaT(datos);
                alert("Agendamiento de laboratorio guardado exitosamente");

                // Limpiar formulario y estado completamente
                this.clearformlab();
                this.dateIDAgenda = "";
                this.horalab = "";

                // Esperar a que API procese
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Recargar datos desde API
                console.log("Recargando agendas desde API...");
                await this.getListAgendas(this.fechaActual);
                await this.getAgendasTomaLabById({ id: agendaSeleccionada.id });

                // Volver
                await this.$router.push("/sop_aux");
            } catch (error) {
                console.error("Error al guardar agendamiento:", error);
                alert("Error al guardar el agendamiento: " + (error?.message || error));
            } finally {
                this.guardando = false; // Desactivar flag
            }
        },

        async guardarAgendamientoVisitas() {
            // Prevenir clics múltiples
            if (this.guardando) {
                alert("Por favor espere, se está guardando el agendamiento...");
                return;
            }

            if (
                this.dateIDvisita === "" ||
                this.horavisita === "" ||
                this.userData.grupo === ""
            ) {
                alert("Error en los datos, loguearse nuevamente.");
                return;
            }

            if (!this.horaEnRango(this.horavisita, "09:00", "11:30")) {
                alert("La hora de visita debe estar entre 09:00 AM y 11:30 AM.");
                return;
            }

            // Validación: verificar si ya existe un agendamiento idéntico
            const agendamientoExistente = this.encuestasFiltradasVisitaById.some(iten => {
                return (iten?.visitamedica || []).some(muestras =>
                    muestras?.horavisita === this.horavisita &&
                    muestras?.grupo === this.userData.grupo &&
                    iten.id === this.idEncuesta
                );
            });

            if (agendamientoExistente) {
                alert("Ya existe un agendamiento con esta hora y grupo para este paciente.");
                return;
            }

            this.guardando = true; // Activar flag
            try {
                const agendaSeleccionada = { ...this.dateIDvisita };
                let datos = {
                    idAgenda: agendaSeleccionada.id,
                    fechaAgenda: agendaSeleccionada.fecha,
                    idEncuesta: this.idEncuesta,
                    horavisita: this.horavisita,
                    grupo: this.userData.grupo,
                    paciente: this.obtenerPacienteNombre(),
                    encuestador: this.userData.nombre,
                    barrio: this.obtenerBarrio(),
                    direccion: String(this.encuestaFiltrada?.direccion || "Sin dirección").trim(),
                };
                console.log("Guardando agendamiento de visita:", datos);
                await this.guardarAgendaV(datos);
                alert("Agendamiento visita guardado exitosamente");

                // Limpiar formulario y estado completamente
                this.clearformvisita();
                this.dateIDvisita = "";
                this.horavisita = "";

                // Esperar a que API procese
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Recargar datos desde API
                console.log("Recargando agendas desde API...");
                await this.getListAgendas(this.fechaActual);
                await this.getAgendasVisitaById({ id: agendaSeleccionada.id });

                // Volver
                await this.$router.push("/sop_aux");
            } catch (error) {
                console.error("Error al guardar agendamiento:", error);
                alert("Error al guardar el agendamiento: " + (error?.message || error));
            } finally {
                this.guardando = false; // Desactivar flag
            }
        },
        /* ---------------------------------------------------------------------------------------------------------- */
        clearformvisita() {
            console.log("Limpiando formulario de visita...");
            this.dateIDvisita = "";
            this.horavisita = "";
            console.log("Formulario de visita limpiado");
        },
        /* ------------------------------------------------- */
        //consulta las citas  de toma de muestra del dia seleccionado
        agendaActualTomaLab(id) {
            console.log("Cargando agendas de toma de laboratorio para:", id);
            if (!id || !id.id) {
                return;
            }
            this.getAgendasTomaLabById({ id: id.id });
        },
        //consulta las citas de visita del dia seleccionado
        //se usa el id de la agenda seleccionada para consultar las citas de visita
        agendaActualVisita(id) {
            console.log("Cargando agendas de visita para:", id);
            if (!id || !id.id) {
                return;
            }
            this.getAgendasVisitaById({ id: id.id });
        },

        eliminarItemAgenda(indice, encuestaID, lista) {
            if (indice === "") {
                alert("Error al eliminar, intente nuevamente.");
                return;
            }
            console.log("Eliminando item:", { indice, encuestaID, lista });
            this.eliminarAgenda(indice, encuestaID, lista);
            this.clearformVisita();
            this.clearformlab();
        },
        clearformVisita() {
            console.log("Limpiando formulario de visita...");
            this.dateIDvisita = "";
            this.horavisita = "";
        },
        clearformlab() {
            console.log("Limpiando formulario de laboratorio...");
            this.dateIDAgenda = "";
            this.horalab = "";
        },
    },
    computed: {
        ...mapState([
            "agendas",
            "userData",
            "encuestas",
            "encuestasFiltradasLabById",
            "encuestasFiltradasVisitaById",
        ]),

        encuestaFiltrada() {
            if (!this.encuestas || !this.idEncuesta) return null;

            // Si encuestas es un array
            if (Array.isArray(this.encuestas)) {
                return this.encuestas.find(encuesta => encuesta.id === this.idEncuesta);
            }

            // Si encuestas es un objeto
            return this.encuestas.id === this.idEncuesta ? this.encuestas : null;
        },

        FechasVisitasGrupo() {
            return this.agendas.filter((item) => item.grupo == this.userData.grupo);
        },

        getAllAgendasbyDate(datelab) {
            return this.agendas.filter((item) => item.fecha == this.dateConsulta);
        },
    },
    mounted() {
        this.idEncuesta = this.$route.params.idEncuesta;
        this.tipo = this.$route.params.tipo;
        console.log(this.tipo);
        console.log(this.idEncuesta);
        this.fechaActual = moment().format("YYYY-MM-DD");
        this.getListAgendas(this.fechaActual);
    },
};
</script>

<style>
.tomademuestras {
    background-color: #A388D2;
    border-radius: 5px;
    color: white;
}

.visitas {
    background-color: #5F24BD;
    border-radius: 5px;
    color: white;
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

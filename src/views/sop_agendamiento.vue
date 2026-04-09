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
                                            {{ fecha.grupo }} - {{ fecha.fecha }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="col-6">
                                <label for="horalab" class="form-label">Hora:</label>
                                <select class="form-control" id="horalab" v-model="horalab">
                                    <option value="">Disponibles</option>
                                    <option v-for="hora in horasValidasLab" :key="hora" :value="hora">
                                        {{ hora }}
                                    </option>
                                </select>
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
                                        <td>{{ muestra?.horalab || '-' }}</td>
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
                                            {{ fecha.grupo }} - {{ fecha.fecha }}
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div class="col-6">
                                <label for="horaconsulta" class="form-label">Hora</label>
                                <select class="form-control" id="horavisita" v-model="horavisita">
                                    <option value="">Disponibles</option>
                                    <option v-for="hora in horasValidasVisita" :key="hora" :value="hora">
                                        {{ hora }}
                                    </option>
                                </select>
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
                                        <td>{{ muestras?.horavisita || '-' }}</td>
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

        generarHorasValidasLab() {
            const horas = [];
            for (let i = 6; i <= 8; i++) {
                for (let j = 0; j < 60; j += 30) {
                    // Incrementos de 30 minutos
                    const hora = `${String(i).padStart(2, "0")}:${String(j).padStart(2, "0")}`;
                    horas.push(hora);
                }
            }
            return horas;
        },

        generarHorasValidasVisita() {
            const horas = [];
            for (let i = 9; i <= 11; i++) {
                for (let j = 0; j < 60; j += 30) {
                    // Incrementos de 30 minutos
                    const hora = `${String(i).padStart(2, "0")}:${String(j).padStart(2, "0")}`;
                    horas.push(hora);
                }
            }
            return horas;
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
                let datos = {
                    idAgenda: this.dateIDAgenda.id,
                    fechaAgenda: this.dateIDAgenda.fecha,
                    idEncuesta: this.idEncuesta,
                    horalab: this.horalab,
                    grupo: this.userData.grupo,
                    paciente: this.encuestaFiltrada.nombre1 + " " + this.encuestaFiltrada.apellido1,
                    encuestador: this.userData.nombre,
                    barrio: this.encuestaFiltrada.barrioVeredacomuna.barrio,
                    direccion: this.encuestaFiltrada.direccion,
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
                await this.getAgendasTomaLabById(this.dateIDAgenda);

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
                let datos = {
                    idAgenda: this.dateIDvisita.id,
                    fechaAgenda: this.dateIDvisita.fecha,
                    idEncuesta: this.idEncuesta,
                    horavisita: this.horavisita,
                    grupo: this.userData.grupo,
                    paciente: this.encuestaFiltrada.nombre1 + " " + this.encuestaFiltrada.apellido1,
                    encuestador: this.userData.nombre,
                    barrio: this.encuestaFiltrada.barrioVeredacomuna.barrio,
                    direccion: this.encuestaFiltrada.direccion,
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
                await this.getAgendasVisitaById(this.dateIDvisita);

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
            this.getAgendasTomaLabById(id);
        },
        //consulta las citas de visita del dia seleccionado
        //se usa el id de la agenda seleccionada para consultar las citas de visita
        agendaActualVisita(id) {
            console.log("Cargando agendas de visita para:", id);
            this.getAgendasVisitaById(id);
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
        horasValidasLab() {
            return this.generarHorasValidasLab();
        },

        horasValidasVisita() {
            return this.generarHorasValidasVisita();
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

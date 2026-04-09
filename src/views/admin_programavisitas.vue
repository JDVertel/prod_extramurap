<template>
<div class="container-fluid">
 
        <h1>Programador de visitas</h1>
    
          


    
                <div class="container">
                    <div class="row">
                        <div class="col-4 col-md-1"> <i class="bi bi-calendar-week" style="font-size: 5rem;"></i></div>
                        <div class="col-8 col-md-11">
                            <h3>Asignacion de Agendamiento</h3>
                            <div class="col-12 col-md-6">
                                <p class="lh-1">
                                    Seleccione el grupo extramural y fecha para la cual que desea asignarle la
                                    programacion de visita
                                </p>
                                <div class="row">
                                    <div class="col-12 col-md-6">
                                        <div class="mb-3">
                                            <label for="fechaVisita" class="form-label">Fecha de visita</label>
                                            <input type="date" class="form-control" id="fechaVisita" placeholder="name@example.com" v-model="fechaagenda" />
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label for="gruposdetrabajo" class="form-label">Grupo de trabajo</label>
                                        <input type="number" class="form-control" id="gruposdetrabajo" placeholder="#grupo" v-model="grupotrabajo" />
                                    </div>

                                    <div class="col-1">
                                        <button type="button" class="btn btn-primary" @click="asignar">
                                            Asignar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h4>Detalle de Agenda <small class="text-muted fs-6">(desde hoy en adelante)</small></h4>
                <hr />
                <div class="agenda-table-scroll">
                    <table class="table table-bordered table-sm">
                        <thead class="table-dark sticky-header">
                            <tr>
                                <th scope="col">Fecha</th>
                                <th scope="col">Grupo</th>
                               <!--  <th scope="col">Toma de muestras</th> -->
                                <th scope="col">Visitas</th>
                                <th scope="col">Eliminar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(agenda, index) in agendas" :key="index">
                                <td>{{ agenda.fecha }}</td>
                                <td>{{ agenda.grupo }}</td>
                           <!--      <td>
                                    <table class="table table-bordered table-sm table-warning">
                                        <thead>
                                            <tr>
                                                <th scope="col">Hora</th>
                                                <th scope="col">Paciente</th>
                                                <th scope="col">(grupo)Auxiliar</th>
                                                <th scope="col">Barrio</th>
                                                <th scope="col">Direccion</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template v-if="agenda.tomademuestras && agenda.tomademuestras.length">
                                                <tr v-for="(muestra, i) in agenda.tomademuestras" :key="i">
                                                    <td>{{ muestra.horalab || '-' }}</td>
                                                    <td>{{ muestra.paciente || '-' }}</td>
                                                    <td>({{ muestra.grupo || '-' }})-{{ muestra.encuestador || '-' }}</td>
                                                    <td>{{ muestra.barrio || '-' }}</td>
                                                    <td>{{ muestra.direccion || '-' }}</td>
                                                </tr>
                                            </template>
                                            <template v-else>
                                                <tr>
                                                    <td colspan="3" class="text-center text-muted">Sin registros</td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </td> -->
                                <td>
                                    <table class="table table-bordered table-sm table-success">
                                        <thead>
                                            <tr>
                                                <th scope="col">Hora</th>
                                                <th scope="col">Paciente</th>
                                                <th scope="col">(grupo)Auxiliar</th>
                                                <th scope="col">Barrio</th>
                                                <th scope="col">Direccion</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <template v-if="agenda.visitamedica && agenda.visitamedica.length">
                                                <tr v-for="(visita, i) in agenda.visitamedica" :key="i">
                                                    <td>{{ visita.horavisita || '-' }}</td>
                                                    <td>{{ visita.paciente || '-' }}</td>
                                                    <td>({{ visita.grupo || '-' }})-{{ visita.encuestador || '-' }}</td>
                                                    <td>{{ visita.barrio || '-' }}</td>
                                                    <td>{{ visita.direccion || '-' }}</td>
                                                </tr>
                                            </template>
                                            <template v-else>
                                                <tr>
                                                    <td colspan="3" class="text-center text-muted">Sin registros</td>
                                                </tr>
                                            </template>
                                        </tbody>
                                    </table>
                                </td>
                                <td>
                                    <button v-if="(!agenda.tomademuestras || agenda.tomademuestras.length === 0) && (!agenda.visitamedica || agenda.visitamedica.length === 0)" class="btn btn-danger">eliminar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
</div>
</template>

<script>
import moment from 'moment';
import {
    mapState,
    mapActions
} from "vuex";
export default {
    data: () => {
        return {
            fechaActual: "",
            fechaagenda: "",
            grupotrabajo: "",
        };
    },
    methods: {
        ...mapActions(["addreserva", "getListAgendas"]),

        async asignar() {
            try {
                let datosreserva = {
                    bd: "agendas",
                    fecha: this.fechaagenda,
                    grupo: this.grupotrabajo,
                };
                await this.addreserva(datosreserva);
                this.clearform();
                await this.getListAgendas(this.fechaActual);
            } catch (error) {
                console.error("Error al asignar la reserva:", error);
                // Aquí puedes agregar mensajes de error para el usuario si lo deseas
            }
        },

        clearform() {
            this.fechaagenda = "";
            this.grupotrabajo = "";
        },
    },
    computed: {
        ...mapState(["agendas"]),
    },
    mounted() {
        this.fechaActual = moment().format('YYYY-MM-DD');
        this.getListAgendas(this.fechaActual);
    },
};
</script>

<style>
.agenda-table-scroll {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
}
.sticky-header th {
  position: sticky;
  top: 0;
  background: #212529;
  color: #fff;
  z-index: 2;
}
</style>

<template>
<div class="container-fluid">
    <div>

        <h4>Detalle de Agendas</h4>
        <hr />
        <div style="max-height: 700px; overflow-y: auto;">
            <table class="table table-sm agenda-sticky">
                <thead>
                    <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Grupo</th>
                
                        <th scope="col">Visitas</th>

                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(agenda, index) in agendas" :key="index">
                        <td>{{ agenda.fecha }}</td>
                        <td>{{ agenda.grupo }}</td>
                  
                        <td>
                            <table class="table table-sm table-success">
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

                    </tr>
                    <!-- Eliminar fila extra de botón eliminar -->
                </tbody>
            </table>
        </div>
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

<style scoped>
.tabla-scroll {
  max-height: 400px;
  overflow-y: auto;
}
.agenda-sticky thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #212529;
  color: #fff;
}
.agenda-sticky thead {
  z-index: 2;
}
</style>

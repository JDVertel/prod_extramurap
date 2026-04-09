<template>
<div class="container-fluid">
    <div class="py-3">
        <h1>IPS</h1>
        <p class="text-muted mb-3">Aqui puede ver los datos guardados en BD, editar una IPS existente o crear una nueva.</p>

        <div v-if="mensaje" class="alert" :class="tipoMensaje === 'ok' ? 'alert-success' : 'alert-danger'">
            {{ mensaje }}
        </div>

        <div class="row g-3">
            <div class="col-12 col-lg-6">
                <div class="card shadow-sm h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <strong>IPS registradas en BD</strong>
                        <button class="btn btn-sm btn-outline-secondary" @click="recargarIps">Recargar</button>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive" style="max-height: 360px; overflow-y: auto;">
                            <table class="table table-sm table-hover mb-0">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>NIT</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="ipsDisponibles.length === 0">
                                        <td colspan="4" class="text-center text-muted py-3">No hay IPS registradas.</td>
                                    </tr>
                                    <tr v-for="ips in ipsDisponibles" :key="ips.id" :class="String(ips.id) === String(idips) ? 'table-primary' : ''">
                                        <td>{{ ips.id }}</td>
                                        <td>{{ ips.nombre || 'IPS sin nombre' }}</td>
                                        <td>{{ ips.nit || 'N/A' }}</td>
                                        <td class="text-end">
                                            <button class="btn btn-sm btn-primary" @click="seleccionarIps(ips.id)">Editar</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-12 col-lg-6">
                <div class="card shadow-sm h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <strong>{{ idips ? 'Editar IPS' : 'Nueva IPS' }}</strong>
                        <button class="btn btn-sm btn-outline-primary" @click="nuevaIps">Nueva</button>
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label">Nombre</label>
                                <input v-model="form.nombre" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label">NIT</label>
                                <input v-model="form.nit" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label">Codigo habilitacion</label>
                                <input v-model="form.codHab" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label">Departamento</label>
                                <input v-model="form.dpto" type="text" class="form-control" />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label">Municipio</label>
                                <input v-model="form.municipio" type="text" class="form-control" />
                            </div>
                        </div>

                        <div class="mt-3 d-flex gap-2">
                            <button class="btn btn-success" :disabled="guardando" @click="guardarIps">
                                {{ guardando ? 'Guardando...' : 'Guardar' }}
                            </button>
                            <button class="btn btn-secondary" @click="restaurarDesdeStore">
                                Restaurar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-3 card shadow-sm">
            <div class="card-header"><strong>Datos IPS activos en la app</strong></div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item">ID: {{ dataips.id || 'N/A' }}</li>
                <li class="list-group-item">Nombre: {{ dataips.nombre || 'N/A' }}</li>
                <li class="list-group-item">Nit: {{ dataips.nit || 'N/A' }}</li>
                <li class="list-group-item">Cod Habilitacion: {{ dataips.codHab || 'N/A' }}</li>
                <li class="list-group-item">Dpto Ubicacion: {{ dataips.dpto || 'N/A' }}</li>
                <li class="list-group-item">Municipio: {{ dataips.municipio || 'N/A' }}</li>
            </ul>
        </div>
    </div>
</div>
</template>

<script>
import {
    mapState,
    mapActions
} from 'vuex'
export default {
    data() {
        return {
            idips: "",
            guardando: false,
            mensaje: "",
            tipoMensaje: "ok",
            ipsDisponibles: [],
            form: {
                nombre: "",
                nit: "",
                codHab: "",
                dpto: "",
                municipio: "",
            },
        }
    },
    methods: {
        ...mapActions(['getdataips', 'getAllDataIps', 'guardarDataIps']),

        notificar(tipo, texto) {
            this.tipoMensaje = tipo;
            this.mensaje = texto;
        },

        syncForm(data = {}) {
            this.form = {
                nombre: data?.nombre || "",
                nit: data?.nit || "",
                codHab: data?.codHab || "",
                dpto: data?.dpto || "",
                municipio: data?.municipio || "",
            };
        },

        async recargarIps() {
            try {
                const lista = await this.getAllDataIps();
                this.ipsDisponibles = lista;

                if (!this.idips && lista.length > 0) {
                    this.idips = String(lista[0].id);
                }

                if (this.idips) {
                    await this.cargarIpsSeleccionada();
                }
            } catch (error) {
                this.notificar('error', 'No fue posible cargar el listado de IPS desde BD.');
            }
        },

        async seleccionarIps(id) {
            this.idips = String(id);
            await this.cargarIpsSeleccionada();
        },

        async cargarIpsSeleccionada() {
            try {
                const data = await this.getdataips(this.idips || null);

                if (!this.idips && data?.id) {
                    this.idips = String(data.id);
                }

                this.syncForm(data || this.dataips || {});
            } catch (error) {
                this.notificar('error', 'No fue posible cargar la IPS seleccionada.');
            }
        },

        restaurarDesdeStore() {
            this.syncForm(this.dataips || {});
        },

        nuevaIps() {
            this.idips = "";
            this.syncForm({});
            this.mensaje = "";
        },

        async guardarIps() {
            this.guardando = true;
            try {
                const guardado = await this.guardarDataIps({
                    id: this.idips || null,
                    datos: this.form,
                });

                if (guardado?.id) {
                    this.idips = String(guardado.id);
                }

                await this.recargarIps();
                this.notificar('ok', 'Datos IPS guardados correctamente.');
            } catch (error) {
                console.error("Error guardando IPS:", error);
                this.notificar('error', "No fue posible guardar la IPS. " + (error?.message || ""));
            } finally {
                this.guardando = false;
            }
        },
    },
    computed: {
        ...mapState(['dataips']),
    },
    async mounted() {
        await this.recargarIps();
    }

}
</script>

<style>

</style>

<template>
    <div>
        <!-- ...contenido existente... -->
        <div v-if="guardando" class="overlay-guardando">
            <div class="progress-card shadow">
                <div class="h5 mb-3">Guardando caracterización</div>
                <div class="progress mb-2" role="progressbar" aria-label="Guardando caracterización"
                    aria-valuemin="0" aria-valuemax="100" style="height: 22px;">
                    <div class="progress-bar progress-bar-striped progress-bar-animated progreso-indeterminado">
                        Guardando...
                    </div>
                </div>
                <div class="text-muted small">Guardando datos, por favor espere...</div>
            </div>
        </div>
        <div class="container" :aria-busy="guardando">
            <h1 class="text-center">Caracterización de la visita</h1>
            <div class="row">
                <hr />
                <h4>Visita</h4>
                <div class="col-6">
                    <select id="visita" name="visita" class="form-select" aria-label="Default select example"
                        v-model="visita">
                        <option selected value="">Seleccione</option>
                        <option value="efectiva">Efectiva</option>
                        <option value="no_efectiva">No Efectiva</option>
                    </select>
                </div>
                <div class="col-6" v-if="visita == 'efectiva'">
                    <select id="tipovisita" name="tipovisita" class="form-select" aria-label="Default select example"
                        v-model="tipovisita">
                        <option selected value="">Tipo Visita</option>
                        <option value="1">primera visita</option>
                        <option value="2">control</option>
                        <option value="3">seguimiento</option>
                    </select>
                </div>
            </div>

            <br />

            <div class="row">
                <hr />
                <h4>Vivienda</h4>
                <div class="col-6">
                    <div class="form-floating mb-3">
                        <select id="tipoVivienda" class="form-select" v-model="tipovivienda"
                            aria-label="Tipo de vivienda">
                            <option value="" selected>Seleccione tipo de vivienda</option>
                            <option value="propia">Vivienda propia</option>
                            <option value="arriendo">Arriendo</option>
                            <option value="familiar">Familiar</option>
                        </select>
                        <label for="tipoVivienda">Tipo de vivienda</label>
                    </div>

                    <br />
                    <p>Estado Actual</p>
                    <div>
                        <div class="form-floating">
                            <select class="form-select" id="iluminacionSelect" v-model="EstActual_Iluminacion"
                                aria-label="Iluminacion">
                                <option value="" selected>Seleccione</option>
                                <option value="Bueno">Bueno</option>
                                <option value="Regular">Regular</option>
                                <option value="Malo">Malo</option>
                            </select>
                            <label for="iluminacionSelect">Iluminación</label>
                        </div>

                        <div class="form-floating mb-3">
                            <select class="form-select" id="selectVentilacion" v-model="EstActual_Ventilacion"
                                aria-label="Ventilacion">
                                <option value="" selected>Seleccione</option>
                                <option value="Bueno">Bueno</option>
                                <option value="Regular">Regular</option>
                                <option value="Malo">Malo</option>
                            </select>
                            <label for="selectVentilacion">Ventilación</label>
                        </div>

                        <div class="form-floating mb-3">
                            <select class="form-select" id="selectParedes" v-model="EstActual_Paredes"
                                aria-label="Paredes">
                                <option value="" selected>Seleccione</option>
                                <option value="Bueno">Bueno</option>
                                <option value="Regular">Regular</option>
                                <option value="Malo">Malo</option>
                            </select>
                            <label for="selectParedes">Paredes</label>
                        </div>

                        <div class="form-floating mb-3">
                            <select class="form-select" id="selectPisos" v-model="EstActual_Pisos" aria-label="Pisos">
                                <option value="" selected>Seleccione</option>
                                <option value="Bueno">Bueno</option>
                                <option value="Regular">Regular</option>
                                <option value="Malo">Malo</option>
                            </select>
                            <label for="selectPisos">Pisos</label>
                        </div>

                        <div class="form-floating mb-3">
                            <select class="form-select" id="selectTecho" v-model="EstActual_Techo" aria-label="Techo">
                                <option value="" selected>Seleccione</option>
                                <option value="Bueno">Bueno</option>
                                <option value="Regular">Regular</option>
                                <option value="Malo">Malo</option>
                            </select>
                            <label for="selectTecho">Techo</label>
                        </div>
                    </div>
                </div>
                <div class="col-6">
                    <p>Servicios Publicos</p>
                    <div class="form-check" v-for="opcion in opcionesServPublicos" :key="opcion.id">
                        <input class="form-check-input" type="checkbox" :id="'check-' + opcion.id" :value="opcion.valor"
                            v-model="seleccionadosServPublic" />
                        <label class="form-check-label" :for="'check-' + opcion.id">
                            {{ opcion.texto }}
                        </label>
                    </div>
                    <!--   {{ seleccionadosServPublic }} -->
                </div>
            </div>
        </div>

        <br />
        <div class="container">
            <div class="row">
                <hr />
                <h4>Factores de Riesgo</h4>
                <div class="col-6">
                    <p>Entorno</p>
                    <div class="form-check" v-for="opcionr in factoresRiesgo" :key="opcionr.id">
                        <input class="form-check-input" type="checkbox" :id="'check-' + opcionr.id"
                            :value="opcionr.valor" v-model="seleccionadosFactoresRiesgo" />
                        <label class="form-check-label" :for="'check-' + opcionr.id">
                            {{ opcionr.texto }}
                        </label>
                    </div>
                    <!-- {{ seleccionadosFactoresRiesgo }} -->
                </div>
                <div class="col-6">
                    <p>Presencia de Animales</p>
                    <div class="form-check" v-for="opcion in OpcionesPresenciaAnimales" :key="opcion.id">
                        <input class="form-check-input" type="checkbox" :id="'check-' + opcion.id" :value="opcion.valor"
                            v-model="seleccionadosPresenciaAnimales" />
                        <label class="form-check-label" :for="'check-' + opcion.id">
                            {{ opcion.texto }}
                        </label>
                    </div>
                    <!-- {{ seleccionadosPresenciaAnimales }} -->
                </div>
            </div>
        </div>
        <br />
        <div class="container">
            <hr />
            <div class="row p-1">
                <div class="col-6 p-1">
                    <h4>
                        Grupo Familiar
                        <span class="badge bg-info text-dark ms-1">{{ grupoFamiliar.length }}</span>
                    </h4>
                    <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                        <i class="bi bi-person-plus"></i> Agregar
                    </button>
                </div>
            </div>
            <hr />
            <!-- inicio modal -->
            <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                aria-labelledby="staticBackdropLabel">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h1 class="modal-title fs-5" id="staticBackdropLabel">
                                Agregar miembro del grupo familiar
                            </h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-6">
                                    <label for="nombres" class="form-label">Nombres</label>
                                    <input type="text" class="form-control" id="nombres"
                                        v-model="nuevoMiembro.nombres" />
                                </div>
                                <div class="col-6">
                                    <label for="apellidos" class="form-label">Apellidos</label>
                                    <input type="text" class="form-control" id="apellidos"
                                        v-model="nuevoMiembro.apellidos" />
                                </div>
                                <div class="col-6">
                                    <label for="parentesco" class="form-label">Parentesco</label>
                                    <select class="form-select" id="parentesco" v-model="nuevoMiembro.parentesco">
                                        <option :value="parentesco" v-for="(parentesco, index) in parentescos"
                                            :key="index">
                                            {{ parentesco }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label for="tipodoc" class="form-label">Tipo de Documento</label>
                                    <select class="form-select" id="tipodoc" v-model="nuevoMiembro.tipodoc">
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
                                <div class="col-6">
                                    <label for="numeroDocumento" class="form-label">Numero de documento</label>
                                    <input type="text" class="form-control" id="numeroDocumento"
                                        v-model="nuevoMiembro.numeroDocumento" />
                                </div>
                                <div class="col-6">
                                    <label for="fnacimiento" class="form-label">Fnacimiento</label>
                                    <input type="date" class="form-control" id="fnacimiento"
                                        :max="new Date().toISOString().split('T')[0]"
                                        v-model="nuevoMiembro.fnacimiento" />
                                </div>
                                <div class="col-6">
                                    <label for="genero" class="form-label">Género</label>
                                    <select class="form-select" id="genero" v-model="nuevoMiembro.genero">
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                    </select>
                                </div>

                                <div class="col-6">
                                    <label for="eps" class="form-label">Eps</label>
                                    <div class="horizontal">
                                        <select class="form-select" id="eps" v-model="nuevoMiembro.eps">
                                            <option :value="eps" v-for="(eps, index) in epss" :key="index">
                                                {{ eps.eps }}
                                            </option>
                                        </select>
                                        <button class="btn btn-warning" @click="updateEps" :disabled="cargandoEps">
                                            <i class="bi bi-arrow-repeat"></i>
                                            <span v-if="cargandoEps">Cargando...</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <label for="regimen" class="form-label">Regimen</label>
                                    <select class="form-select" id="regimen" v-model="nuevoMiembro.regimen">
                                        <option value="Subsididiado">Subsididiado</option>
                                        <option value="Contributivo">Contributivo</option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label for="cursodevida" class="form-label">Curso de vida</label>
                                    <select class="form-select" id="cursodevida" v-model="nuevoMiembro.cursoVida">
                                        <option value="primera infancia">primera infancia</option>
                                        <option value="infancia">infancia</option>
                                        <option value="adolescencia">adolescencia</option>
                                        <option value="juventud">juventud</option>
                                        <option value="adultez">adultez</option>
                                        <option value="vejez">vejez</option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label for="ocupacion" class="form-label">Ocupacion</label>
                                    <select class="form-select" id="ocupacion" v-model="nuevoMiembro.ocupacion">
                                        <option value="menor de edad">Menor de edad</option>
                                        <option value="emplead@">Emplead@</option>
                                        <option value="estudiante">Estudiante</option>
                                        <option value="ama de casa">Ama de casa</option>
                                        <option value="pensionad@">Pensionad@</option>
                                        <option value="independiente">Independiente</option>
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label for="viveenvivienda" class="form-label">Vive en vivienda</label>
                                    <select class="form-select" id="viveenvivienda"
                                        v-model="nuevoMiembro.viveEnVivienda">
                                        <option value="si">Si</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="clearform">
                                Close
                            </button>
                            <button type="button" class="btn btn-primary" @click="addmiembro">
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- fin modal -->
            <div class="container">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Parentesco</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(miembro, index) in grupoFamiliar" :key="index">
                            <td>{{ miembro.parentesco }}</td>
                            <td>{{ miembro.nombres }} {{ miembro.apellidos }}</td>
                            <td>
                                <button class="btn btn-danger rounded-circle" @click="eliminarMiembro(index)">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <br />
        <div class="container">
            <div class="row">
                <hr />
                <h4>Antecedentes personales</h4>
                <div class="form-check" v-for="opcion in opcionesAntecedentes" :key="opcion.id">
                    <input class="form-check-input" type="checkbox" :id="'check-' + opcion.id" :value="opcion.valor"
                        v-model="seleccionadosAntecedentes" />
                    <label class="form-check-label" :for="'check-' + opcion.id">
                        {{ opcion.texto }}
                    </label>
                </div>
                <br />
                <!--  {{ seleccionadosAntecedentes }} -->
            </div>
        </div>
        <br />
        <div class="container">
            <div class="row">
                <hr />
                <h4>Riesgos</h4>
                <div class="row">
                    <div class="col-6">
                        <div class="form-check" v-for="opcion in OpcionesRiesgos" :key="opcion.id">
                            <input class="form-check-input" type="checkbox" :id="'check-' + opcion.id"
                                :value="opcion.valor" v-model="seleccionadosRiesgos" />
                            <label class="form-check-label" :for="'check-' + opcion.id">
                                {{ opcion.texto }}
                            </label>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="col">
                            <!-- Segunda pregunta seleccionado sedentarismo -->
                            <div v-if="seleccionadosRiesgos.includes('sedentarismo')">
                                <label for="Pregunta2">
                                    Ejercicios: Cantidad semanal de actividad fisica (90min X act):</label>

                                <input type="number" id="Pregunta2" v-model="detalleSedentarismo" class="form-control"
                                    placeholder="# Cantidad" />
                            </div>
                            <!-- Segunda pregunta seleccionado alcohol-->
                            <div v-if="seleccionadosRiesgos.includes('consumeAlcohol')">
                                <label for="Pregunta3">Alcohol: Frecuencia de consumo:</label>

                                <select class="form-select" id="Pregunta3" v-model="detalleConsumoAlcohol">
                                    <option value="Frecuentemente">frecuentemente</option>
                                    <option value="Ocasionalmente">ocasionalmente</option>
                                </select>
                            </div>
                            <!-- Segunda pregunta seleccionado cigarrillos -->
                            <div v-if="seleccionadosRiesgos.includes('consumeCigarrillo')">
                                <label for="segundaPregunta"> Cigarrillo: frecuencia Diaria</label>

                                <input type="number" id="segundaPregunta" v-model="detalleConsumoCigarrillo"
                                    class="form-control" placeholder="Escriba aquí..." />
                            </div>
                            <!-- Segunda pregunta seleccionado alimentacion poco saludable -->
                            <div v-if="seleccionadosRiesgos.includes('alimentacionPocoSaludable')">
                                <label for="segundaPregunta">Consumo de frutas y verduras: Consumo minimo diaria 5
                                    porciones
                                </label>
                                <input type="text" id="segundaPregunta" v-model="AlimentacionPocoSaludable"
                                    class="form-control" placeholder="Escriba aquí..." />
                            </div>
                        </div>
                    </div>
                    <!--  {{ seleccionadosRiesgos }} -->
                </div>
            </div>
        </div>
        <br />
        <div class="container">
            <div class="row">
                <hr />
                <h4>Tamizaje</h4>
                <div class="row">
                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="floatingInput1" v-model="peso"
                                placeholder="" />
                            <label for="floatingInput1">Peso (Kg)</label>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="floatingInput2" v-model="talla"
                                placeholder="" />
                            <label for="floatingInput2">Talla (m)</label>
                        </div>
                    </div>

                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="floatingInput3" v-model="tensionSistolica"
                                placeholder="" />
                            <label for="floatingInput3">Tension Sistolica (mmHg)</label>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="floatingInput4" v-model="tensionDiastolica"
                                placeholder="" />
                            <label for="floatingInput4">Tension Diastolica (mmHg)</label>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="floatingInput5" v-model="perimetroAbdominal"
                                placeholder="" />
                            <label for="floatingInput5">Perimetro Abdominal (cm)</label>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="floatingInput6" v-model="perimetroBranquial"
                                placeholder="" />
                            <label for="floatingInput6">Perimetro Branquial (cm)</label>
                        </div>
                    </div>

                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="floatingInput7" v-model="oximetria"
                                placeholder="" />
                            <label for="floatingInput7">Oximetria (%)</label>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="number" class="form-control" id="floatingInput8" v-model="temperatura"
                                placeholder="" />
                            <label for="floatingInput8">Temperatura (°C)</label>
                        </div>
                    </div>
                    <div class="container">
                        <div class="row">
                            <div class="col-6">
                                <div class="form-floating mb-3">
                                    <input type="number" class="form-control" id="floatingInput9" v-model="Calimc"
                                        placeholder="" readonly />
                                    <label for="floatingInput9">IMC</label>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-floating mb-3">
                                    <input type="text" class="form-control" id="floatingInput10" placeholder=""
                                        v-model="CalclasificacionImc" readonly />
                                    <label for="floatingInput10">Clasificacion IMC </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br />
        <div class="container">
            <div class="row">
                <hr />
                <h4>Tamizaje Visual (f de Snellen)</h4>
                <div class="row">
                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="floatingInput" v-model="Oizquierdo"
                                placeholder="" />
                            <label for="floatingInput">Ojo Izquierdo</label>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="form-floating mb-3">
                            <input type="text" class="form-control" id="floatingInput" v-model="Oderecho"
                                placeholder="" />
                            <label for="floatingInput">Ojo Derecho </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <br />
        <div class="container">
            <div class="row">
                <hr />
                <h4>Estado del esquema vacunal</h4>
                <select id="evacunal" name="evacunal" class="form-select" aria-label="Default select example"
                    v-model="Evacunal">
                    <option selected value="">Seleccione</option>
                    <option value="Completo">Completo</option>
                    <option value="Incompleto">Incompleto</option>
                </select>
            </div>
            <div>
                <br />
                <button class="btn btn-primary" @click="guardarDatosCaracterizacion">
                    Guardar Datos
                </button>
            </div>
        </div>
        <br />
    </div>
</template>

<script>
import {
    mapActions,
    mapState
} from "vuex";
export default {
    name: "SopCaracterizacion",
    data() {
        return {
            idEncuesta: "",
            visita: "",
            tipovisita: "",
            tipovivienda: "",
            EstActual_Iluminacion: "",
            EstActual_Ventilacion: "",
            EstActual_Paredes: "",
            EstActual_Pisos: "",
            EstActual_Techo: "",
            peso: "",
            talla: "",
            tensionSistolica: "",
            tensionDiastolica: "",
            perimetroAbdominal: "",
            perimetroBranquial: "",
            oximetria: "",
            temperatura: "",
            imc: "",
            clasificacionImc: "",
            Oizquierdo: "",
            Oderecho: "",
            Evacunal: "",
            detalleSedentarismo: "",
            detalleConsumoAlcohol: "",
            detalleConsumoCigarrillo: "",
            AlimentacionPocoSaludable: "",
            guardando: false,
            cargandoEps: false,
            seleccionadosServPublic: [],
            opcionesServPublicos: [{
                id: 1,
                valor: "acueducto",
                texto: "acueducto",
            },
            {
                id: 2,
                valor: "energia electrica",
                texto: "energia electrica",
            },
            {
                id: 3,
                valor: "gas natural",
                texto: "gas natural",
            },
            {
                id: 4,
                valor: "carbon",
                texto: "carbon",
            },
            {
                id: 5,
                valor: "leña",
                texto: "leña",
            },
            {
                id: 6,
                valor: "gasolina",
                texto: "gasolina",
            },
            {
                id: 7,
                valor: "internet",
                texto: "internet",
            },
            {
                id: 8,
                valor: "television",
                texto: "television",
            },
            {
                id: 9,
                valor: "alcantarillado",
                texto: "alcantarillado",
            },
            {
                id: 10,
                valor: "aseo",
                texto: "aseo",
            },
            ],

            seleccionadosFactoresRiesgo: [],

            factoresRiesgo: [{
                id: 11,
                valor: "Droga",
                texto: "Droga",
            },
            {
                id: 12,
                valor: "Prostitucion",
                texto: "Prostitucion",
            },
            {
                id: 13,
                texto: "Aguas Negras",
                valor: "Aguas Negras",
            },
            {
                id: 14,
                valor: "Deslizamientos",
                texto: "Deslizamientos",
            },
            {
                id: 15,
                valor: "Basureros",
                texto: "Basureros",
            },
            {
                id: 16,
                valor: "Inundaciones",
                texto: "Inundaciones",
            },
            ],
            seleccionadosPresenciaAnimales: [],
            OpcionesPresenciaAnimales: [{
                id: 17,
                valor: "Vectores",
                texto: "Vectores",
            },
            {
                id: 18,
                valor: "Perros",
                texto: "Perros",
            },
            {
                id: 19,
                valor: "Gatos",
                texto: "Gatos",
            },
            {
                id: 20,
                valor: "Vacas",
                texto: "Vacas",
            },
            {
                id: 21,
                valor: "Cerdos",
                texto: "Cerdos",
            },
            {
                id: 22,
                valor: "Equinos",
                texto: "Equinos",
            },
            {
                id: 23,
                valor: "Salvajes",
                texto: "Salvajes",
            },
            {
                id: 24,
                valor: "Roedores",
                texto: "Roedores",
            },
            ],
            seleccionadosAntecedentes: [],
            opcionesAntecedentes: [{
                id: 25,
                valor: "Hipertencion Arterial",
                texto: "Hipertencion Arterial",
            },
            {
                id: 26,
                valor: "Diabetes",
                texto: "Diabetes",
            },
            {
                id: 27,
                valor: "Enfermedad Renal",
                texto: "Enfermedad Renal",
            },
            {
                id: 28,
                valor: "Eventos coronarios",
                texto: "Eventos coronarios",
            },
            {
                id: 29,
                valor: "Hemofilia",
                texto: "Hemofilia",
            },
            {
                id: 30,
                valor: "Artritis",
                texto: "Artritis",
            },
            {
                id: 31,
                valor: "Otros",
                texto: "Otros",
            },
            ],

            nuevoMiembro: {
                nombres: "",
                apellidos: "",
                parentesco: "",
                tipodoc: "",
                numeroDocumento: "",
                fnacimiento: "",
                genero: "",
                eps: "",
                regimen: "",
                cursoVida: "",
                ocupacion: "",
                viveEnVivienda: "",
            },
            grupoFamiliar: [],
            parentescos: [
                "Abuel@",
                "Ahij@",
                "Bisabuel@",
                "Bisniet@",
                "Cuñad@",
                "Herman@",
                "Hij@",
                "Madre",
                "Niet@",
                "Nuera",
                "Prim@",
                "Sobrin@",
                "Suegr@",
                "Ti@",
                "Yern@",
                "Espos@",
                "Padre",
            ],

            OpcionesRiesgos: [{
                id: 32,
                valor: "sedentarismo",
                texto: "Sedentarismo",
            },
            {
                id: 33,
                valor: "alimentacionPocoSaludable",
                texto: "Alimentacion poco saludable",
            },
            {
                id: 34,
                valor: "consumeAlcohol",
                texto: "Consume alcohol frecuentemente",
            },
            {
                id: 35,
                valor: "consumeCigarrillo",
                texto: "Consume cigarrillo",
            },
            {
                id: 36,
                valor: "sintomaticoRespiratorio",
                texto: "Sintomatico respiratorio",
            },
            {
                id: 37,
                valor: "sintomaticoPiel",
                texto: "Sintomatico de piel",
            },
            {
                id: 38,
                valor: "contactoPacienteTBC",
                texto: "Contacto con paciente TBC",
            },
            {
                id: 39,
                valor: "consumoSustanciaPsicoactivas",
                texto: "Consumo de sustancia psicoactivas",
            },
            {
                id: 40,
                valor: "hacinamiento",
                texto: "Hacinamiento",
            },

            {
                id: 41,
                valor: "violenciaIntraFamiliar",
                texto: "Violencia intrafamiliar",
            },
            ],
            seleccionadosRiesgos: [],
        };
    },
    methods: {
        ...mapActions(["guardarCaracterizacion", "getAllEpss"]),
        addmiembro() {
            if (
                this.nuevoMiembro.nombres &&
                this.nuevoMiembro.apellidos &&
                this.nuevoMiembro.parentesco &&
                this.nuevoMiembro.tipodoc &&
                this.nuevoMiembro.numeroDocumento &&
                this.nuevoMiembro.fnacimiento &&
                this.nuevoMiembro.genero &&
                this.nuevoMiembro.eps &&
                this.nuevoMiembro.regimen &&
                this.nuevoMiembro.cursoVida &&
                this.nuevoMiembro.ocupacion &&
                this.nuevoMiembro.viveEnVivienda
            ) {
                this.grupoFamiliar.push({
                    ...this.nuevoMiembro,
                });
                this.clearform();
                // Cerrar modal solo si la validación pasó
                const modalEl = document.getElementById('staticBackdrop');
                if (modalEl) {
                    const modal = window.bootstrap?.Modal?.getInstance(modalEl);
                    if (modal) modal.hide();
                }
            } else {
                alert("Por favor, complete todos los campos requeridos.");
            }
        },
        eliminarMiembro(index) {
            this.grupoFamiliar.splice(index, 1);
        },
        clearform() {
            this.nuevoMiembro = {
                nombres: "",
                apellidos: "",
                parentesco: "",
                tipodoc: "",
                numeroDocumento: "",
                fnacimiento: "",
                genero: "",
                eps: "",
                regimen: "",
                cursoVida: "",
                ocupacion: "",
                viveEnVivienda: "",
            };
            // Limpia scroll solo si es necesario
            if (document.body.classList.contains("modal-open")) {
                document.body.classList.remove("modal-open");
                document.body.style.overflow = "";
                const backdrop = document.querySelector(".modal-backdrop");
                if (backdrop) backdrop.remove();
            }
        },
        //requiero  que se pregunte si se desea guardar la informaicon antes de realizar el guardado

        async guardarDatosCaracterizacion() {
            const campos = [{
                valor: this.idEncuesta,
                nombre: "ID Encuesta",
            },
            {
                valor: this.visita,
                nombre: "Visita",
            },
            {
                valor: this.tipovisita,
                nombre: "Tipo de Visita",
            },
            {
                valor: this.tipovivienda,
                nombre: "Tipo de Vivienda",
            },
            {
                valor: this.EstActual_Iluminacion,
                nombre: "Iluminación",
            },
            {
                valor: this.EstActual_Ventilacion,
                nombre: "Ventilación",
            },
            {
                valor: this.EstActual_Paredes,
                nombre: "Paredes",
            },
            {
                valor: this.EstActual_Pisos,
                nombre: "Pisos",
            },
            {
                valor: this.EstActual_Techo,
                nombre: "Techo",
            },
            {
                valor: this.peso,
                nombre: "Peso",
            },
            {
                valor: this.talla,
                nombre: "Talla",
            },
            {
                valor: this.tensionSistolica,
                nombre: "Tensión Sistólica",
            },
            {
                valor: this.tensionDiastolica,
                nombre: "Tensión Diastólica",
            },
            {
                valor: this.perimetroAbdominal,
                nombre: "Perímetro Abdominal",
            },
            {
                valor: this.perimetroBranquial,
                nombre: "Perímetro Branquial",
            },
            {
                valor: this.oximetria,
                nombre: "Oximetría",
            },
            {
                valor: this.temperatura,
                nombre: "Temperatura",
            },
            {
                valor: this.Oizquierdo,
                nombre: "Oído Izquierdo",
            },
            {
                valor: this.Oderecho,
                nombre: "Oído Derecho",
            },
            {
                valor: this.Evacunal,
                nombre: "Estado Vacunal",
            },
            {
                valor: this.seleccionadosServPublic,
                nombre: "Servicios Públicos",
            },
            {
                valor: this.seleccionadosFactoresRiesgo,
                nombre: "Factores de Riesgo",
            },
            {
                valor: this.seleccionadosPresenciaAnimales,
                nombre: "Presencia de Animales",
            },
            {
                valor: this.seleccionadosAntecedentes,
                nombre: "Antecedentes Personales",
            },

            {
                valor: this.seleccionadosRiesgos,
                nombre: "Riesgos",
            },
            ];
            let camposFaltantes = campos.filter((c) => !c.valor).map((c) => c.nombre);
            if (this.seleccionadosServPublic.length === 0)
                camposFaltantes.push("Servicios Públicos");
            if (this.seleccionadosPresenciaAnimales.length === 0)
                camposFaltantes.push("Presencia de Animales");
            if (camposFaltantes.length > 0) {
                alert(
                    "!!Falta diligenciar los siguientes campos:\n" + camposFaltantes.join(", ")
                );
                return;
            }
            const confirmado = window.confirm("¿Está seguro que desea guardar la información?");
            if (!confirmado) return;
            const DatosGuardados = {
                estadoCaracterizacion: true,
                idEncuesta: this.idEncuesta,
                convenio: this.userData?.convenio || "",
                visita: this.visita,
                tipovisita: this.tipovisita,
                tipovivienda: this.tipovivienda,
                EstActual_Iluminacion: this.EstActual_Iluminacion,
                EstActual_Ventilacion: this.EstActual_Ventilacion,
                EstActual_Paredes: this.EstActual_Paredes,
                EstActual_Pisos: this.EstActual_Pisos,
                EstActual_Techo: this.EstActual_Techo,
                peso: this.peso,
                talla: this.talla,
                tensionSistolica: this.tensionSistolica,
                tensionDiastolica: this.tensionDiastolica,
                perimetroAbdominal: this.perimetroAbdominal,
                perimetroBranquial: this.perimetroBranquial,
                oximetria: this.oximetria,
                temperatura: this.temperatura,
                imc: this.Calimc,
                clasificacionImc: this.CalclasificacionImc,
                Oizquierdo: this.Oizquierdo,
                Oderecho: this.Oderecho,
                Evacunal: this.Evacunal,
                seleccionadosServPublic: this.seleccionadosServPublic,
                seleccionadosFactoresRiesgo: this.seleccionadosFactoresRiesgo,
                seleccionadosPresenciaAnimales: this.seleccionadosPresenciaAnimales,
                seleccionadosAntecedentes: this.seleccionadosAntecedentes,
                grupoFamiliar: this.grupoFamiliar,
                seleccionadosRiesgos: this.seleccionadosRiesgos,
            };
            this.guardando = true;
            try {
                await this.guardarCaracterizacion(DatosGuardados);
                this.$router.push("/sop_aux");
            } catch (error) {
                alert("Error al guardar los datos");
            } finally {
                this.guardando = false;
            }
        },

        updateEps() {
            this.cargandoEps = true;
            this.getAllEpss()
                .then(() => {
                    alert("Eps actualizados correctamente");
                })
                .catch((error) => {
                    console.error("Error al actualizar Eps:", error);
                    alert("Error al actualizar Eps");
                })
                .finally(() => {
                    this.cargandoEps = false;
                });
        },
    },
    computed: {
        ...mapState(["usuario", "epss", "userData"]),

        Calimc() {
            // Validar que peso y talla estén definidos y talla > 0 para evitar división por cero
            if (!this.peso || !this.talla || this.talla <= 0) return null;

            // Calcular IMC: peso / (talla^2)
            const imcCalc = this.peso / (this.talla * this.talla);

            // Retornar con dos decimales
            return imcCalc.toFixed(2);
        },
        CalclasificacionImc() {
            if (this.Calimc === null) return "";
            const imc = this.Calimc;
            if (imc < 18.5) return "Bajo peso";
            else if (imc < 25) return "Peso normal";
            else if (imc < 30) return "Sobrepeso";
            else if (imc < 35) return "Obesidad grado I";
            else if (imc < 40) return "Obesidad grado II";
            else return "Obesidad grado III";
        },
    },
    async mounted() {
        this.idEncuesta = this.$route.params.idEncuesta;
        try {
            await this.getAllEpss();
        } catch (e) {
            // Maneja el error si es necesario
        }
        // Limpia posibles restos de modales
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) backdrop.remove();
    },
};
</script>

<style>
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

/* ===== COMPACTACIÓN DEL FORMULARIO ===== */

/* Título principal */
.container h1.text-center {
    font-size: 1.3rem;
    margin-bottom: 0.4rem;
    margin-top: 0.5rem;
}

/* Separadores de sección */
.container hr,
.container > .row > hr {
    margin-top: 0.4rem;
    margin-bottom: 0.3rem;
}

/* Títulos de sección */
.container h4 {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.3rem;
    color: #0f766e;
}

/* Párrafos de subsección */
.container p {
    font-size: 0.82rem;
    margin-bottom: 0.25rem;
    font-weight: 500;
}

/* Espaciado entre bloques — reemplaza los <br /> */
.container + br + .container,
.container {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

/* Form-floating compacto */
.form-floating {
    margin-bottom: 0.3rem !important;
}

.form-floating > .form-control,
.form-floating > .form-select {
    height: 46px !important;
    min-height: 46px !important;
    padding-top: 1rem !important;
    padding-bottom: 0.25rem !important;
    font-size: 0.82rem !important;
}

.form-floating > label {
    font-size: 0.75rem !important;
    padding-top: 0.55rem !important;
    padding-bottom: 0 !important;
}

/* mb-3 reducido en el formulario */
.container .mb-3 {
    margin-bottom: 0.3rem !important;
}

/* Selects normales */
.container .form-select:not(.form-floating .form-select) {
    font-size: 0.82rem;
    padding: 0.28rem 0.6rem;
    height: auto;
}

/* Checkboxes en grilla 2 columnas responsive */
.container .form-check {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    width: 48%;
    margin-bottom: 0.15rem;
    font-size: 0.8rem;
    padding-left: 1.4rem;
}

@media (max-width: 480px) {
    .container .form-check {
        width: 100%;
    }
}

.form-check-input {
    margin-top: 0 !important;
    flex-shrink: 0;
}

/* Tabla grupo familiar compacta */
.container .table {
    font-size: 0.8rem;
    margin-bottom: 0.4rem;
}

.container .table th,
.container .table td {
    padding: 0.25rem 0.4rem;
}

/* Row reducida */
.container .row {
    row-gap: 0.1rem;
}

/* Botón guardar */
.container .btn-primary {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
</style>

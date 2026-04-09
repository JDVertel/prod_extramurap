<template>
<div class="container-fluid">

    <h1>Admin Encuestas</h1>
    <ul class="nav nav-tabs" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">
                Encuestas
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">
                + Nueva
            </button>
        </li>


    </ul>
    <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
            <br>
            <h6>Proyectos gestionado en HelpDesk</h6>
            <table class="table table-bordered table-striped table-sm">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Sedes</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">1</th>
                        <td>Mark</td>
                        <td>Otto</td>
                    </tr>

                </tbody>
            </table>
        </div>
        <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
            <br />
            <div class="container">
                <div class="row">
                    <div class="col-12 col-md-4">
                        <div class="mb-3">
                            <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="Nombre de proyecto" />
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <div class="mb-3">
                                    <label class="form-label">Fecha Inicial</label>
                                    <input type="date" class="form-control" id="exampleFormControlInput1" />
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="mb-3">
                                    <label class="form-label">Fecha Final</label>
                                    <input type="date" class="form-control" id="exampleFormControlInput1" placeholder="Fecha Fin" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="mb-3">
                            <textarea placeholder="Descripcion" class="form-control" id="exampleFormControlTextarea1" rows="4"></textarea>
                        </div>
                    </div>
                    <div class="col-4">
                        <button type="button" class="btn btn-primary">Crear</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="tab-pane fade" id="contact-tab-pane" role="tabpanel" aria-labelledby="contact-tab" tabindex="0">
            <h1>Sedes </h1>
            <br>
            <div class="row">
                <div class="col-6">
                    <div class="mb-3">

                        <select id="proyectoSede" name="proyectoSede" class="form-select form-select-sm" aria-label="Small select example">
                            <option selected>--Seleccione Proyecto--</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </select>
                    </div>
                </div>
                <div class="col-6">
                    <div class="mb-3">
                        <input type="text" class="form-control form-control-sm" id="exampleFormControlInput1" placeholder="Nombre de la sede">
                    </div>
                </div>
            </div>

            <div class="mb-3">

                <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder="Descripcion o detalle de la sede"></textarea>
            </div>
            <button type="button" class="btn btn-primary">Guardar</button>
        </div>

    </div>

</div>
</template>

<script>
</script>

<style>

</style>

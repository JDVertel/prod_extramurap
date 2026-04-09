<template>
  <div class="container-fluid mt-5 pt-3 info-page">
    <div class="header-card mb-3">
      <h3 class="mb-1"><i class="bi bi-info-circle-fill"></i> Centro de Informacion</h3>
      <p class="mb-0 text-muted">
        Aqui encuentras informacion general del aplicativo, preguntas frecuentes y los ajustes recientes.
      </p>
    </div>

    <ul class="nav nav-tabs" id="infoTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="info-tab"
          data-bs-toggle="tab"
          data-bs-target="#info"
          type="button"
          role="tab"
          aria-controls="info"
          aria-selected="true"
        >
          Informacion
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="faq-tab"
          data-bs-toggle="tab"
          data-bs-target="#faq"
          type="button"
          role="tab"
          aria-controls="faq"
          aria-selected="false"
        >
          Preguntas frecuentes
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="updates-tab"
          data-bs-toggle="tab"
          data-bs-target="#updates"
          type="button"
          role="tab"
          aria-controls="updates"
          aria-selected="false"
        >
          Actualizaciones
        </button>
      </li>
    </ul>

    <div class="tab-content p-3 border border-top-0 rounded-bottom bg-white" id="infoTabContent">
      <div
        class="tab-pane fade show active"
        id="info"
        role="tabpanel"
        aria-labelledby="info-tab"
      >
        <h5>Informacion</h5>
        <p>
          Extramurapp es una plataforma para gestion operativa de encuestas, caracterizacion, asignaciones CUPS,
          agendas y seguimiento de usuarios por convenio y grupo.
        </p>
        <ul>
          <li>Propiedad de BDM Systems.SAS </li>

        </ul>
        <div class="mt-3">
          <a
            href="https://www.youtube.com/watch?v=oi8qijV6ngI"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-danger btn-sm"
          >
            <i class="bi bi-play-btn-fill"></i> Ver video informativo
          </a>
        </div>
      </div>

      <div class="tab-pane fade" id="faq" role="tabpanel" aria-labelledby="faq-tab">
        <h5>Preguntas frecuentes</h5>
        <div class="accordion" id="faqAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header" id="faq1-h">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1" aria-expanded="true" aria-controls="faq1">
                Como recupero mi contrasena?
              </button>
            </h2>
            <div id="faq1" class="accordion-collapse collapse show" aria-labelledby="faq1-h" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                En la pantalla de login, abre la opcion de recuperacion, completa tu correo y valida el captcha.
                Recibiras un enlace con validez de 1 hora.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="faq2-h">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2" aria-expanded="false" aria-controls="faq2">
                No encuentro el correo de recuperacion
              </button>
            </h2>
            <div id="faq2" class="accordion-collapse collapse" aria-labelledby="faq2-h" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Revisa la carpeta de SPAM o correo no deseado. Si no llega, verifica que el correo exista en la base de datos.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="faq3-h">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3" aria-expanded="false" aria-controls="faq3">
                Por que no me deja crear un usuario?
              </button>
            </h2>
            <div id="faq3" class="accordion-collapse collapse" aria-labelledby="faq3-h" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                El sistema valida campos obligatorios y evita duplicados de documento y correo.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="faq4-h">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4" aria-expanded="false" aria-controls="faq4">
                Como cambiar tipo de documento o numero de documento de un paciente?
              </button>
            </h2>
            <div id="faq4" class="accordion-collapse collapse" aria-labelledby="faq4-h" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Ingresa a Pacientes, consulta el registro por documento, selecciona Editar encuesta y actualiza los campos
                Tipo Documento y Numero Documento. Guarda los cambios para que quede actualizado en la ficha del paciente.
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="faq5-h">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq5" aria-expanded="false" aria-controls="faq5">
                Como selecciono EPS si un paciente no tiene afiliacion?
              </button>
            </h2>
            <div id="faq5" class="accordion-collapse collapse" aria-labelledby="faq5-h" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                Para estos casos se crearon dos opciones de EPS: PPNA y OTRO REGIMEN.
                Selecciona PPNA cuando la poblacion no se encuentre afiliada.
                Selecciona OTRO REGIMEN cuando la poblacion pertenezca a EPS que estan por fuera de las EPS con contrato
                con la ESEB.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-pane fade" id="updates" role="tabpanel" aria-labelledby="updates-tab">
        <h5>Actualizaciones recientes</h5>
        <ul class="list-group list-group-flush mt-2">
          <li class="list-group-item">
            <strong>20/03/2026:</strong> Edicion de tipo y numero de documento en consulta de pacientes.
          </li>
          <li class="list-group-item">
            <strong>20/03/2026:</strong> Limpieza de estado/cache visual al terminar edicion o eliminacion de pacientes.
          </li>
          <li class="list-group-item">
            <strong>20/03/2026:</strong> Recuperacion de contrasena con mensajes de envio, validez de 1 hora y aviso de SPAM.
          </li>
          <li class="list-group-item">
            <strong>20/03/2026:</strong> Captcha agregado al modulo de recuperacion de contrasena.
          </li>
          <li class="list-group-item">
            <strong>20/03/2026:</strong> Validacion de existencia de correo en base de datos antes de login y recuperacion.
          </li>
          <li class="list-group-item">
            <strong>20/03/2026:</strong> Validaciones reforzadas en registro de usuarios para campos en blanco y documento duplicado.
          </li>
          <li class="list-group-item">
           <strong>25/03/2026:</strong>
  - Validación de convenio en consulta de pacientes: solo se marca como "encuestado" si el registro previo es del mismo convenio que el usuario logueado. Si fue encuestado en otro convenio, queda como "disponible" y se muestra una nota informativa.
  - Mensaje informativo de convenio diferente: se muestra el convenio, fecha y encuestador, con icono de información grande y sombreado a la derecha.
  - Todas las actividades proyectadas se agregan por defecto al formulario y ya no pueden eliminarse manualmente.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InfoView",
};
</script>

<style scoped>
.info-page {
  max-width: 1000px;
}

.header-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 16px;
}
</style>

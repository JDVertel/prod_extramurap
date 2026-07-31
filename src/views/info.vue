<template>
  <div class="container-fluid mt-5 pt-3 info-page">
    <div class="header-card mb-3">
      <h3 class="mb-1"><i class="bi bi-info-circle-fill"></i> Centro de Informacion</h3>
      <p class="mb-0 text-muted">
        Aqui encuentras informacion general del aplicativo y los ajustes recientes.
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
        <h5>Que es ExtramurApp</h5>
        <p>
          <strong>ExtramurApp</strong> es una plataforma web de gestion operativa para la atencion
          extramural en salud. Fue disenada para organizar, registrar y dar trazabilidad a la demanda
          inducida y a las visitas de equipos en territorio, desde el primer contacto con el paciente
          hasta el cierre de gestiones clinicas y administrativas.
        </p>
        <p>
          El sistema centraliza en un solo entorno el trabajo diario de auxiliares, profesionales de
          salud y perfiles administrativos, respetando la estructura organizacional de cada
          <strong>IPS</strong>, el <strong>convenio</strong> contractual y el <strong>grupo</strong>
          operativo al que pertenece cada usuario.
        </p>
        <p>
          Su proposito es reducir la dispersion de informacion, estandarizar los formularios de
          captura, facilitar la asignacion de actividades y permitir seguimiento en tiempo casi real
          de lo pendiente, lo devuelto y lo ya cerrado.
        </p>

        <h6 class="mt-4">Para que sirve</h6>
        <p>
          ExtramurApp apoya el ciclo completo de atencion extramural: identifica o registra pacientes,
          captura datos sociodemograficos y clinicos basicos, caracteriza la visita, proyecta
          actividades, asigna CUPS, agenda cuando aplica, permite la intervencion de cada profesional
          del equipo y deja evidencia de cierres, devoluciones y facturacion operativa.
        </p>
        <ul>
          <li>Unifica la captura de demanda inducida por documento y convenio.</li>
          <li>Ordena el trabajo por bandejas (pendientes, devueltos, cerrados).</li>
          <li>Adapta formularios y validaciones segun el convenio y el perfil del usuario.</li>
          <li>Mantiene trazabilidad de quien atiende, cuando cierra y que actividades quedaron asociadas.</li>
          <li>Facilita supervision administrativa, parametros e informes de gestion.</li>
        </ul>

        <h6 class="mt-4">Convenios soportados</h6>
        <p>
          La aplicacion opera por convenio. Cada convenio puede habilitar campos, profesionales y
          reglas distintas:
        </p>
        <ul>
          <li>
            <strong>Extramural:</strong> flujo clasico de demanda inducida, caracterizacion completa,
            agenda de visita medica cuando corresponde y gestion de CUPS.
          </li>
          <li>
            <strong>Equipos Basicos (E Basicos):</strong> permite registros repetidos del mismo paciente
            como control o seguimiento; incorpora perfiles de psicologia y trabajo social cuando aplica.
          </li>
          <li>
            <strong>PIC:</strong> incluye requerimientos adicionales del equipo (por ejemplo nutricion)
            y validaciones propias del programa.
          </li>
          <li>
            <strong>Unidesa:</strong> caracterizacion simplificada (visita, tamizaje, tamizaje visual y
            esquema vacunal). Si el paciente es de sexo femenino, tambien captura antecedentes
            ginecobstetricos (FUM, menarquia y planifica).
          </li>
        </ul>

        <h6 class="mt-4">Quienes la usan</h6>
        <p>
          ExtramurApp esta pensada para equipos multidisciplinarios. Segun el cargo, cada usuario ve
          solo los modulos y acciones que le corresponden:
        </p>
        <ul>
          <li><strong>Auxiliar de enfermeria:</strong> registra demanda inducida, caracteriza, gestiona CUPS iniciales y puede corregir datos del paciente antes de cerrar.</li>
          <li><strong>Medico:</strong> atiende bandeja medica, gestiona actividades/CUPS y cierra su intervencion.</li>
          <li><strong>Enfermero(a) jefe:</strong> gestiona su bandeja y actividades asignadas.</li>
          <li><strong>Psicologo / Trabajador social / Nutricionista / Higienista oral:</strong> intervienen cuando el convenio y la asignacion lo requieren.</li>
          <li><strong>Facturacion / Administracion / Superusuario:</strong> parametros, usuarios, informes, caracterizaciones y supervision transversal.</li>
        </ul>

        <h6 class="mt-4">Flujo tipico de atencion</h6>
        <ol>
          <li>
            <strong>Login y contexto:</strong> el usuario ingresa y el sistema carga su IPS, convenio,
            grupo y cargo. Desde ahi se delimitan permisos y catalogos.
          </li>
          <li>
            <strong>Demanda inducida:</strong> se consulta el documento del paciente. El sistema indica
            si esta disponible, ya encuestado en el mismo convenio, o si puede abrirse seguimiento
            (especialmente en E Basicos). Tambien puede precargar datos si el paciente existe en otro convenio.
          </li>
          <li>
            <strong>Registro:</strong> se capturan datos del paciente, poblacion de riesgo, desplazamiento,
            remision y se asignan profesionales del grupo.
          </li>
          <li>
            <strong>Caracterizacion:</strong> se diligencia la visita y los hallazgos clinicos basicos.
            El formulario cambia segun convenio (completo o simplificado).
          </li>
          <li>
            <strong>Agenda (si aplica):</strong> en Extramural se puede agendar visita medica.
          </li>
          <li>
            <strong>CUPS / actividades:</strong> se proyectan y asignan actividades clinicas asociadas al paciente.
          </li>
          <li>
            <strong>Gestion profesional:</strong> cada rol atiende su bandeja, completa lo pendiente y cierra
            su gestion. Si hay inconsistencias, el caso puede devolverse para correccion.
          </li>
          <li>
            <strong>Correccion auxiliar:</strong> con el boton Gestionar (engranaje) el auxiliar puede editar
            datos del paciente y profesionales asignados sin salir de la bandeja. Si cambia tipo o numero
            de documento, al guardar se validan automaticamente las mismas reglas de la encuesta.
          </li>
          <li>
            <strong>Seguimiento e informes:</strong> administracion y facturacion consultan estados,
            cierres, parametros y reportes de gestion.
          </li>
        </ol>

        <h6 class="mt-4">Modulos principales</h6>
        <ul>
          <li><strong>Home:</strong> resumen del usuario, IPS y profesionales del mismo grupo/convenio.</li>
          <li><strong>Encuesta / Demanda inducida:</strong> alta y consulta de pacientes.</li>
          <li><strong>Bandeja auxiliar:</strong> pendientes, devoluciones, caracterizacion, CUPS y gestion del registro.</li>
          <li><strong>Bandejas profesionales:</strong> trabajo clinico por rol con contadores de cierres.</li>
          <li><strong>Agendas:</strong> programacion de visitas cuando el convenio lo habilita.</li>
          <li><strong>Facturacion:</strong> revision operativa de registros disponibles o pendientes de facturar.</li>
          <li><strong>Consulta de pacientes:</strong> busqueda y edicion administrativa de fichas.</li>
          <li><strong>Registro de usuarios:</strong> alta, vigencia, grupos y accesos.</li>
          <li><strong>Parametros / Informes / Caracterizacion admin:</strong> configuracion, supervision y analisis.</li>
          <li><strong>Centro de Informacion:</strong> descripcion del sistema y bitacora de actualizaciones.</li>
        </ul>

        <h6 class="mt-4">Organizacion de la informacion</h6>
        <p>
          Cada registro queda asociado a una IPS, un convenio y un grupo. Eso permite que un mismo
          paciente pueda existir en contextos distintos sin mezclar reglas, y que los equipos solo
          vean lo que les corresponde. Las actividades proyectadas, los profesionales asignados y los
          estados de gestion (auxiliar, medico, enfermeria y demas roles) quedan vinculados al
          identificador de la encuesta para mantener la trazabilidad.
        </p>
        <p>
          La caracterizacion guarda variables clinicas y sociales de la visita. En Unidesa, los
          antecedentes ginecobstetricos se almacenan dentro del campo JSON de antecedentes, sin
          exigir cambios de esquema de base de datos.
        </p>

        <h6 class="mt-4">Seguridad y control de acceso</h6>
        <ul>
          <li>Acceso autenticado por usuario; el perfil define que pantallas y acciones estan disponibles.</li>
          <li>Validaciones de documento, correo y campos obligatorios en registro y edicion.</li>
          <li>Recuperacion de contrasena con captcha y enlace de vigencia limitada.</li>
          <li>En el primer ingreso con clave temporal, el sistema exige cambio de contrasena.</li>
          <li>Las consultas de existencia de paciente respetan el convenio para evitar duplicados indebidos.</li>
        </ul>

        <h6 class="mt-4">Beneficios esperados</h6>
        <ul>
          <li>Menor retrabajo por formularios incompletos o inconsistentes.</li>
          <li>Mejor coordinacion entre auxiliar y profesionales del equipo.</li>
          <li>Mayor claridad de lo pendiente frente a lo cerrado o devuelto.</li>
          <li>Adaptacion real a distintos programas (Extramural, E Basicos, PIC, Unidesa).</li>
          <li>Base unica para supervision, parametros e informes de gestion.</li>
        </ul>

        <h6 class="mt-4">Propiedad y soporte</h6>
        <p>
          ExtramurApp es propiedad de <strong>BDM Systems S.A.S.</strong>
          (BigDataManagements SAS). El desarrollo y la evolucion funcional se orientan a las
          necesidades operativas de las IPS y equipos de atencion extramural que la utilizan.
        </p>
        <p class="text-muted small mb-2">
          Este centro de informacion describe el proposito general del aplicativo. Para el detalle
          de cambios recientes, consulta la pestana <strong>Actualizaciones</strong>.
        </p>

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

      <div class="tab-pane fade" id="updates" role="tabpanel" aria-labelledby="updates-tab">
        <h5>Actualizaciones recientes</h5>
        <ul class="list-group list-group-flush mt-2">
          <li class="list-group-item">
            <strong>31/07/2026:</strong> Caracterizacion Unidesa simplificada: Visita, Tamizaje, Tamizaje visual y esquema vacunal.
            Antecedentes ginecobstetricos (FUM, menarquia, planifica) solo si el sexo es femenino; se guardan en el JSON de antecedentes.
          </li>
          <li class="list-group-item">
            <strong>31/07/2026:</strong> Auxiliar: el boton Eliminar se reemplazo por Gestionar (engranaje). Abre un modal para editar
            datos del paciente y profesionales asignados sin salir de la bandeja.
          </li>
          <li class="list-group-item">
            <strong>31/07/2026:</strong> Al cambiar tipo/numero de documento en Gestionar, la validacion se ejecuta automaticamente
            al guardar con las mismas reglas de la encuesta (disponible / encuestado / seguimiento E Basicos).
          </li>
          <li class="list-group-item">
            <strong>31/07/2026:</strong> Ajuste visual del login: card opaco y de mayor tamano.
          </li>
          <li class="list-group-item">
            <strong>25/03/2026:</strong> Validacion de convenio en consulta de pacientes: solo se marca como "encuestado"
            si el registro previo es del mismo convenio. Si fue encuestado en otro convenio, queda disponible con nota informativa.
          </li>
          <li class="list-group-item">
            <strong>25/03/2026:</strong> Actividades proyectadas se agregan por defecto y ya no pueden eliminarse manualmente.
          </li>
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

#info h6 {
  color: #0f766e;
  font-weight: 700;
}

#info p,
#info li {
  line-height: 1.55;
}

#info ul,
#info ol {
  margin-bottom: 0.85rem;
}
</style>

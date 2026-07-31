export function normalizeCargoKey(cargo) {
  return String(cargo || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function resolveManualRoleKey(cargo) {
  const key = normalizeCargoKey(cargo);

  if (key.includes("auxiliardeenfermeria") || key === "auxiliar") return "auxiliar";
  if (key.includes("medico")) return "medico";
  if (key.includes("enfermero")) return "enfermero";
  if (key.includes("psicolog")) return "psicologo";
  if (key.includes("tsocial") || key.includes("trabajadorsocial") || key.includes("trabajadorasocial")) {
    return "tsocial";
  }
  if (key.includes("nutricion")) return "nutricionista";
  if (key.includes("higienista") && key.includes("oral")) return "higienista";
  if (key.includes("facturacion") || key === "fact" || key.includes("facturador")) return "fact";
  if (key.includes("superusuario")) return "superusuario";
  if (key.includes("admin") || key.includes("administrador")) return "admin";
  return "general";
}

const comun = {
  inicio: {
    titulo: "1. Como empezar",
    icono: "bi-door-open",
    color: "#0f766e",
    pasos: [
      {
        titulo: "Inicia sesion",
        texto: "Ingresa correo y contraseña. Si la clave es temporal, el sistema obliga a cambiarla antes de continuar.",
        icono: "bi-box-arrow-in-right",
      },
      {
        titulo: "Verifica tu contexto en Home",
        texto: "Confirma nombre, cargo, convenio, grupo e IPS. Si algo esta mal, avisa al administrador antes de registrar pacientes.",
        icono: "bi-house-door",
      },
      {
        titulo: "Abre el menu",
        texto: "Usa el menu lateral: solo aparecen los modulos de tu rol. Home esta arriba; Info y Tutorial al final.",
        icono: "bi-list",
      },
    ],
  },
};

const profesionalBase = (nombreRol, rutaBandeja, rutaInformes) => ({
  seccionesExtra: [
    {
      titulo: "2. Flujo de trabajo de tu rol",
      icono: "bi-diagram-3",
      color: "#1d4ed8",
      imagenKey: "flujo",
      pasos: [
        {
          titulo: "Recibes el caso asignado",
          texto: `El auxiliar registra la demanda inducida y te asigna como ${nombreRol}. El paciente aparece en tu bandeja cuando corresponde tu intervencion.`,
          icono: "bi-person-check",
        },
        {
          titulo: "Abre tu bandeja",
          texto: `Entra a ${rutaBandeja} y revisa Pendientes. Usa Devueltos si un caso regreso para correccion.`,
          icono: "bi-inbox",
        },
        {
          titulo: "Revisa la ficha clinica operativa",
          texto: "Antes de actuar, confirma identidad del paciente, convenio, caracterizacion (si aplica) y actividades/CUPS proyectados.",
          icono: "bi-file-earmark-medical",
          detalle: [
            "Nombre completo y documento",
            "EPS / regimen",
            "Poblacion de riesgo",
            "Profesionales asignados",
            "Estado de caracterizacion y CUPS",
          ],
        },
        {
          titulo: "Gestiona actividades / CUPS",
          texto: "Abre Cups del paciente, selecciona las actividades de tu competencia, guardalas y verifica que queden asociadas al caso.",
          icono: "bi-heart-pulse",
          detalle: [
            "Selecciona la actividad del paciente",
            "Elige los CUPS correspondientes",
            "Guarda el listado",
            "Confirma que no falten CUPS obligatorios de tu rol",
          ],
        },
        {
          titulo: "Cierra tu gestion",
          texto: "Cuando completes lo requerido, cierra la visita/gestion de tu rol. Si falta informacion critica, no cierres: coordina devolucion al auxiliar.",
          icono: "bi-check2-circle",
          alerta: "Cerrar sin revisar puede dejar el caso incompleto para facturacion o para otros profesionales.",
        },
      ],
    },
    {
      titulo: "3. Como diligenciar tu atencion",
      icono: "bi-pencil-square",
      color: "#0f766e",
      pasos: [
        {
          titulo: "Orden recomendado",
          texto: "Sigue siempre esta secuencia para evitar devoluciones.",
          icono: "bi-list-ol",
          detalle: [
            "1) Identificar paciente en bandeja",
            "2) Revisar caracterizacion y antecedentes relevantes",
            "3) Asignar/completar CUPS de tu rol",
            "4) Verificar guardado",
            "5) Cerrar gestion",
          ],
        },
        {
          titulo: "Si el caso esta incompleto",
          texto: "Devuelve o solicita correccion al auxiliar. Ejemplos: documento incorrecto, profesional mal asignado, caracterizacion faltante, CUPS incoherentes.",
          icono: "bi-arrow-counterclockwise",
        },
        {
          titulo: "Seguimiento",
          texto: `Usa ${rutaInformes} para ver cerrados del dia/semana y detectar rezagos.`,
          icono: "bi-bar-chart",
        },
      ],
    },
  ],
});

export const MANUALES_POR_ROL = {
  auxiliar: {
    titulo: "Manual del Auxiliar de enfermeria",
    resumen:
      "Tu rol abre el ciclo de atencion: consultas el documento, diligencias la demanda inducida, caracterizas, agendas (si aplica), asignas CUPS y puedes corregir el registro con Gestionar antes de cerrar.",
    color: "#0d9488",
    icono: "bi-person-heart",
    flujoResumen: [
      "Consultar documento",
      "Registrar encuesta",
      "Caracterizar",
      "Agendar (Extramural)",
      "Asignar CUPS",
      "Gestionar / corregir",
      "Cerrar gestion auxiliar",
    ],
    modulos: [
      { nombre: "Auxiliar", ruta: "/sop_aux", icono: "bi-clipboard2-pulse", desc: "Bandeja pendientes y devoluciones" },
      { nombre: "Encuesta", ruta: "/sop_encuesta", icono: "bi-journal-medical", desc: "Nueva demanda inducida" },
      { nombre: "Agendas", ruta: "/sop_agendas", icono: "bi-calendar2-date", desc: "Solo Extramural" },
      { nombre: "Informes", ruta: "/aux_informes", icono: "bi-bar-chart", desc: "Cierres y productividad" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
      { nombre: "Tutorial", ruta: "/tutorial", icono: "bi-mortarboard", desc: "Esta guia" },
    ],
    secciones: [
      comun.inicio,
      {
        titulo: "2. Flujo completo de trabajo (auxiliar)",
        icono: "bi-diagram-3",
        color: "#0f766e",
        imagenKey: "flujo",
        intro:
          "Este es el orden correcto de punta a punta. No saltes pasos: la mayoria de devoluciones ocurren por caracterizacion incompleta, CUPS faltantes o profesionales mal asignados.",
        pasos: [
          {
            titulo: "Paso A — Consultar paciente",
            texto: "En Encuesta, selecciona tipo y numero de documento (solo letras y numeros) y pulsa Consultar. El sistema decide si puedes continuar.",
            icono: "bi-search",
            detalle: [
              "Disponible: puedes diligenciar y guardar",
              "Encuestado (mismo convenio): NO puedes crear otro registro",
              "Seguimiento (E Basicos): puedes crear otro registro (control/seguimiento)",
              "Existe en otro convenio: puedes registrar en el tuyo; se pueden precargar datos",
            ],
          },
          {
            titulo: "Paso B — Diligenciar demanda inducida",
            texto: "Completa todos los campos obligatorios del formulario y asigna profesionales del grupo.",
            icono: "bi-journal-plus",
          },
          {
            titulo: "Paso C — Guardar encuesta",
            texto: "Al guardar, el paciente entra a tu bandeja Auxiliar como pendiente.",
            icono: "bi-floppy",
          },
          {
            titulo: "Paso D — Caracterizar la visita",
            texto: "Desde la bandeja, entra a Caract y completa el formulario segun convenio.",
            icono: "bi-clipboard2-check",
          },
          {
            titulo: "Paso E — Agendar (solo Extramural)",
            texto: "Si tu convenio es Extramural y aun no hay visita agendada, usa Visita/Agendas.",
            icono: "bi-calendar2-plus",
          },
          {
            titulo: "Paso F — Asignar CUPS",
            texto: "En Cups selecciona actividades y CUPS, guarda el listado y cierra la gestion auxiliar cuando corresponda.",
            icono: "bi-heart-pulse",
          },
          {
            titulo: "Paso G — Corregir con Gestionar",
            texto: "Si hay error de datos o profesionales, usa el engranaje Gest. No elimines el caso.",
            icono: "bi-gear-fill",
          },
        ],
      },
      {
        titulo: "3. Como diligenciar la encuesta (campo por campo)",
        icono: "bi-ui-checks-grid",
        color: "#0891b2",
        intro: "Marca mentalmente estos bloques. Los campos con * son obligatorios para guardar.",
        pasos: [
          {
            titulo: "Bloque documento",
            texto: "Tipo y numero de documento. El numero solo admite A-Z y 0-9 (sin puntos, guiones ni espacios).",
            icono: "bi-card-text",
            detalle: ["Tipo documento *", "Numero documento *", "Boton Consultar (obligatorio antes de guardar)"],
          },
          {
            titulo: "Bloque datos del paciente",
            texto: "Informacion basica de identificacion y contacto.",
            icono: "bi-person-vcard",
            detalle: [
              "EPS * y Regimen *",
              "Primer nombre * y Primer apellido * (segundo nombre/apellido opcionales)",
              "Fecha de nacimiento * y Sexo * (M/F)",
              "Telefono * y Direccion *",
              "Barrio-vereda/comuna * (elige de la lista sugerida)",
            ],
          },
          {
            titulo: "Bloque informacion adicional",
            texto: "Datos sociodemograficos obligatorios.",
            icono: "bi-card-list",
            detalle: [
              "Municipio de nacimiento *",
              "Departamento de nacimiento *",
              "Identidad de genero *",
              "Ocupacion *",
              "Nivel ocupacional / condicion laboral *",
            ],
          },
          {
            titulo: "Bloque atencion",
            texto: "Define el contexto de la visita proyectada.",
            icono: "bi-clipboard-check",
            detalle: [
              "Poblacion de riesgo (opcional, se pueden agregar varias)",
              "Tipo de actividad proyectada * (se cargan por defecto segun convenio)",
              "Desplazamiento efectivo * (si/no)",
              "Requiere remision a procedimiento * (si/no)",
            ],
          },
          {
            titulo: "Bloque profesionales",
            texto: "Asigna el equipo que atendera el caso. Deben existir en tu mismo grupo/convenio.",
            icono: "bi-people",
            detalle: [
              "Medico *",
              "Enfermero jefe *",
              "Psicologo / T. Social (E Basicos y PIC, recomendados)",
              "Nutricionista (PIC)",
              "Higienista oral (Unidesa)",
            ],
            alerta: "Si dejas vacios profesionales opcionales del convenio, el sistema puede pedirte confirmacion antes de guardar.",
          },
        ],
      },
      {
        titulo: "4. Como diligenciar la caracterizacion",
        icono: "bi-clipboard2-pulse",
        color: "#059669",
        imagenKey: "caracterizacion",
        intro: "La caracterizacion depende del convenio. Completa siempre Visita + Tamizaje + Tamizaje visual + Esquema vacunal.",
        pasos: [
          {
            titulo: "Visita",
            texto: "Selecciona Efectiva o No efectiva. Si es Efectiva, elige tipo: primera visita, control o seguimiento.",
            icono: "bi-house-check",
            detalle: [
              "En E Basicos, si el paciente ya tuvo primera visita, el sistema oculta esa opcion",
              "Usa control o seguimiento segun corresponda",
            ],
          },
          {
            titulo: "Convenios generales (Extramural / E Basicos / PIC)",
            texto: "Ademas del tamizaje, diligencia vivienda, servicios, factores de riesgo, animales, grupo familiar, antecedentes personales y riesgos.",
            icono: "bi-building",
            detalle: [
              "Tipo de vivienda y estado (iluminacion, ventilacion, paredes, pisos, techo)",
              "Servicios publicos (al menos una opcion)",
              "Factores de riesgo del entorno",
              "Presencia de animales",
              "Grupo familiar (si aplica)",
              "Antecedentes personales (checkboxes)",
              "Riesgos y sus detalles (sedentarismo, alcohol, cigarrillo, alimentacion)",
            ],
          },
          {
            titulo: "Tamizaje (todos los convenios)",
            texto: "Captura signos vitales y antropometria.",
            icono: "bi-heart-pulse",
            detalle: [
              "Peso (kg) *",
              "Talla (m) *",
              "Tension sistolica y diastolica *",
              "Perimetro abdominal *",
              "Perimetro branquial (opcional)",
              "Oximetria * y Temperatura *",
              "IMC y clasificacion (calculados automaticamente)",
            ],
          },
          {
            titulo: "Tamizaje visual y vacunas",
            texto: "Agudeza visual y estado vacunal.",
            icono: "bi-eye",
            detalle: ["Ojo izquierdo *", "Ojo derecho *", "Estado del esquema vacunal * (Completo/Incompleto)"],
          },
          {
            titulo: "Unidesa (formulario reducido)",
            texto: "En Unidesa NO se piden vivienda, riesgos, grupo familiar ni antecedentes personales clasicos.",
            icono: "bi-funnel",
            detalle: [
              "Si sexo = Femenino: diligencia Antecedentes ginecobstetricos *",
              "Fecha ultima menstruacion (FUM) *",
              "Fecha de menarquia *",
              "Planifica (SI / NO / NA) *",
              "Si sexo = Masculino: esa seccion no aparece ni se exige",
            ],
            alerta: "Los datos ginecobstetricos se guardan dentro del JSON de antecedentes; no requieren campos nuevos en base de datos.",
          },
        ],
      },
      {
        titulo: "5. Bandeja auxiliar: botones y significado",
        icono: "bi-kanban",
        color: "#7c3aed",
        imagenKey: "bandeja",
        pasos: [
          {
            titulo: "Pestanas Pendientes / Devueltos",
            texto: "Pendientes: casos abiertos. Devueltos: un profesional regreso el caso para correccion.",
            icono: "bi-layout-text-window-reverse",
          },
          {
            titulo: "Visita",
            texto: "Solo Extramural. Agenda la visita medica si aun no esta agendada.",
            icono: "bi-houses",
          },
          {
            titulo: "Caract",
            texto: "Abre caracterizacion. Queda deshabilitado cuando ya fue diligenciada.",
            icono: "bi-calendar2-check",
          },
          {
            titulo: "Cups",
            texto: "Asigna actividades/CUPS del paciente y cierra la gestion cuando este completo.",
            icono: "bi-calendar2-heart-fill",
            detalle: [
              "Selecciona actividad",
              "Agrega CUPS al listado",
              "Guarda listado",
              "Cierra visita/gestion auxiliar",
            ],
          },
          {
            titulo: "Gest (engranaje)",
            texto: "Abre el modal de edicion del registro completo.",
            icono: "bi-gear-fill",
            detalle: [
              "Puedes editar documento, datos del paciente y profesionales",
              "Si cambias tipo/numero de documento, al Guardar se valida automaticamente",
              "Misma regla de encuesta: bloquea si ya esta encuestado en tu convenio",
              "En E Basicos puede pedir confirmacion de seguimiento",
            ],
          },
        ],
      },
      {
        titulo: "6. Errores frecuentes y como evitarlos",
        icono: "bi-exclamation-triangle",
        color: "#b45309",
        tips: [
          "No guardes encuesta sin pulsar Consultar.",
          "No uses signos en el documento (puntos, comas, guiones).",
          "No dejes medico o enfermero vacios.",
          "En Unidesa, si es mujer, no olvides FUM, menarquia y planifica.",
          "No cierres CUPS sin actividades asignadas.",
          "Si el caso vuelve en Devueltos, corrige con Gest o Cups antes de reenviar.",
          "Si el paciente ya existe en tu convenio (no E Basicos), no intentes duplicarlo.",
        ],
      },
      {
        titulo: "7. Checklist final antes de cerrar",
        icono: "bi-check2-all",
        color: "#047857",
        tips: [
          "Documento consultado y valido",
          "Encuesta guardada con profesionales correctos",
          "Caracterizacion completa segun convenio",
          "Agenda hecha si Extramural lo requiere",
          "CUPS asignados y guardados",
          "Bandeja sin pendientes criticos del dia",
        ],
      },
    ],
  },

  medico: {
    titulo: "Manual del Medico",
    resumen:
      "Recibes pacientes asignados por el auxiliar, revisas la ficha, gestionas CUPS medicos y cierras tu intervencion. Tambien puedes devolver casos incompletos.",
    color: "#2563eb",
    icono: "bi-heart-pulse",
    flujoResumen: [
      "Ver bandeja medica",
      "Revisar ficha/caracterizacion",
      "Gestionar CUPS",
      "Cerrar o devolver",
      "Revisar informes",
    ],
    modulos: [
      { nombre: "Medico", ruta: "/sop_profesional", icono: "bi-person-badge", desc: "Bandeja de atencion" },
      { nombre: "Informes", ruta: "/medico_informes", icono: "bi-bar-chart", desc: "Productividad y cierres" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
    ],
    secciones: [
      comun.inicio,
      ...profesionalBase("medico", "Medico", "Informes").seccionesExtra,
      {
        titulo: "4. Que revisar antes de cerrar",
        icono: "bi-clipboard2-check",
        color: "#1e40af",
        tips: [
          "Identidad del paciente correcta",
          "Caracterizacion diligenciada",
          "CUPS medicos guardados",
          "Sin inconsistencias clinicas evidentes",
          "Si falta algo del auxiliar: devolver, no improvisar datos",
        ],
      },
    ],
  },

  enfermero: {
    titulo: "Manual de Enfermeria",
    resumen:
      "Atiendes la bandeja de enfermeria: revisas el caso asignado, completas actividades/CUPS de tu rol y cierras o devuelves segun calidad del registro.",
    color: "#7c3aed",
    icono: "bi-clipboard2-pulse",
    flujoResumen: [
      "Abrir bandeja",
      "Revisar asignacion",
      "Completar CUPS de enfermeria",
      "Cerrar gestion",
      "Seguir en informes",
    ],
    modulos: [
      { nombre: "Enfermer@", ruta: "/sop_enfermero", icono: "bi-person-badge", desc: "Bandeja de enfermeria" },
      { nombre: "Informes", ruta: "/enfermero_informes", icono: "bi-bar-chart", desc: "Cierres y seguimiento" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
    ],
    secciones: [
      comun.inicio,
      ...profesionalBase("enfermero jefe", "Enfermer@", "Informes").seccionesExtra,
      {
        titulo: "4. Checklist de diligenciamiento",
        icono: "bi-ui-checks",
        color: "#6d28d9",
        tips: [
          "Confirmar que tu documento este como enfermero asignado",
          "Revisar signos vitales de caracterizacion si impactan tu atencion",
          "Guardar CUPS antes de cerrar",
          "Devolver si faltan datos de identificacion o actividades base",
        ],
      },
    ],
  },

  psicologo: {
    titulo: "Manual del Psicologo",
    resumen:
      "Intervienes cuando el convenio y la asignacion lo requieren (frecuente en E Basicos y PIC). Tu flujo es bandeja → revision → CUPS/actividades → cierre.",
    color: "#db2777",
    icono: "bi-emoji-smile",
    flujoResumen: ["Bandeja psicologia", "Revisar caso", "Gestionar actividades", "Cerrar"],
    modulos: [
      { nombre: "Psicologo", ruta: "/sop_psicologo", icono: "bi-person-badge", desc: "Bandeja de psicologia" },
      { nombre: "Informes", ruta: "/psicologo_informes", icono: "bi-bar-chart", desc: "Cierres y seguimiento" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
    ],
    secciones: [
      comun.inicio,
      ...profesionalBase("psicologo", "Psicologo", "Informes").seccionesExtra,
      {
        titulo: "4. Particularidades",
        icono: "bi-info-circle",
        color: "#be185d",
        tips: [
          "Solo ves pacientes donde el auxiliar te asigno",
          "Si no aparece un caso esperado, verifica asignacion con el auxiliar",
          "No cierres si la ficha base esta incompleta",
        ],
      },
    ],
  },

  tsocial: {
    titulo: "Manual de Trabajo Social",
    resumen:
      "Gestionas intervenciones sociales en pacientes asignados. El flujo operativo es el mismo de bandeja profesional: revisar, diligenciar actividades y cerrar.",
    color: "#ea580c",
    icono: "bi-people",
    flujoResumen: ["Bandeja T. Social", "Revisar caso", "Actividades/CUPS", "Cerrar"],
    modulos: [
      { nombre: "Trabajador Social", ruta: "/sop_tsocial", icono: "bi-person-badge", desc: "Bandeja de trabajo social" },
      { nombre: "Informes", ruta: "/tsocial_informes", icono: "bi-bar-chart", desc: "Cierres y seguimiento" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
    ],
    secciones: [
      comun.inicio,
      ...profesionalBase("trabajador social", "Trabajador Social", "Informes").seccionesExtra,
      {
        titulo: "4. Particularidades",
        icono: "bi-info-circle",
        color: "#c2410c",
        tips: [
          "Tu participacion depende del convenio (E Basicos/PIC)",
          "Valida datos sociodemograficos del paciente antes de cerrar",
          "Coordina devoluciones con auxiliar cuando falte informacion familiar o de contacto",
        ],
      },
    ],
  },

  nutricionista: {
    titulo: "Manual del Nutricionista",
    resumen:
      "Atiendes casos asignados a nutricion (especialmente PIC). Revisa ficha, completa actividades y cierra tu gestion.",
    color: "#16a34a",
    icono: "bi-apple",
    flujoResumen: ["Bandeja nutricion", "Revisar antropometria/ficha", "CUPS", "Cerrar"],
    modulos: [
      { nombre: "Nutricionista", ruta: "/sop_nutricionista", icono: "bi-person-badge", desc: "Bandeja de nutricion" },
      { nombre: "Informes", ruta: "/nutricionista_informes", icono: "bi-bar-chart", desc: "Cierres y seguimiento" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
    ],
    secciones: [
      comun.inicio,
      ...profesionalBase("nutricionista", "Nutricionista", "Informes").seccionesExtra,
      {
        titulo: "4. Que revisar en diligenciamiento",
        icono: "bi-clipboard-data",
        color: "#15803d",
        tips: [
          "Peso, talla e IMC de caracterizacion",
          "Clasificacion IMC",
          "Poblacion de riesgo relevante (gestante, menor, adulto mayor, etc.)",
          "Guardar CUPS de nutricion antes del cierre",
        ],
      },
    ],
  },

  higienista: {
    titulo: "Manual de Higienista oral",
    resumen:
      "Intervienes en pacientes asignados a higiene oral (clave en Unidesa). Flujo: bandeja → revision → actividades → cierre.",
    color: "#0891b2",
    icono: "bi-emoji-laughing",
    flujoResumen: ["Bandeja higiene oral", "Revisar caso", "CUPS", "Cerrar"],
    modulos: [
      { nombre: "Higienista oral", ruta: "/sop_higienista_oral", icono: "bi-person-badge", desc: "Bandeja de higiene oral" },
      { nombre: "Informes", ruta: "/higienista_oral_informes", icono: "bi-bar-chart", desc: "Cierres y seguimiento" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
    ],
    secciones: [
      comun.inicio,
      ...profesionalBase("higienista oral", "Higienista oral", "Informes").seccionesExtra,
      {
        titulo: "4. Particularidades Unidesa",
        icono: "bi-info-circle",
        color: "#0e7490",
        tips: [
          "En Unidesa tu asignacion es frecuente y requerida",
          "Confirma que el auxiliar te haya seleccionado en la encuesta",
          "No cierres si faltan CUPS de tu competencia",
        ],
      },
    ],
  },

  fact: {
    titulo: "Manual de Facturacion",
    resumen:
      "Tu trabajo empieza cuando el flujo clinico esta avanzado. Revisas pendientes/disponibles, filtras, validas completitud y marcas el avance de facturacion.",
    color: "#4f46e5",
    icono: "bi-receipt",
    flujoResumen: [
      "Abrir Facturador",
      "Filtrar pendientes/disponibles",
      "Validar completitud del caso",
      "Procesar facturacion",
      "Verificar avance",
    ],
    modulos: [
      { nombre: "Facturador", ruta: "/sop_facturacion", icono: "bi-cash-coin", desc: "Pendientes y disponibles" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
    ],
    secciones: [
      comun.inicio,
      {
        titulo: "2. Flujo de trabajo de facturacion",
        icono: "bi-diagram-3",
        color: "#4338ca",
        pasos: [
          {
            titulo: "Entra a Facturador",
            texto: "Abre el modulo y distingue pestanas o listados de pendientes frente a disponibles.",
            icono: "bi-inbox",
          },
          {
            titulo: "Filtra con precision",
            texto: "Usa fechas, documento, sexo, EPS u otros filtros para acotar el universo.",
            icono: "bi-funnel",
            detalle: ["Fecha inicio/fin", "Documento", "Sexo", "Otros filtros disponibles en pantalla"],
          },
          {
            titulo: "Valida que el caso este facturable",
            texto: "Antes de procesar, confirma que el registro clinico este completo.",
            icono: "bi-shield-check",
            detalle: [
              "Encuesta existente",
              "Caracterizacion realizada",
              "CUPS/actividades asociadas",
              "Estados de gestion coherentes",
            ],
            alerta: "Si falta caracterizacion o CUPS, regresa el caso al equipo clinico; no fuerces facturacion.",
          },
          {
            titulo: "Procesa y verifica",
            texto: "Ejecuta la accion de facturacion/registro y confirma el cambio de estado en el listado.",
            icono: "bi-check2-square",
          },
        ],
      },
      {
        titulo: "3. Checklist de diligenciamiento operativo",
        icono: "bi-ui-checks",
        color: "#3730a3",
        tips: [
          "No procesar sin filtro de fechas cuando el volumen es alto",
          "Validar identidad del paciente (tipo/numero documento)",
          "Revisar convenio e IPS del registro",
          "Confirmar que no este duplicado o inconsistente",
          "Dejar trazabilidad clara del avance",
        ],
      },
    ],
  },

  admin: {
    titulo: "Manual de Administracion",
    resumen:
      "Supervisas la operacion: usuarios, parametros, informes y calidad de registros. Tu flujo no atiende pacientes uno a uno, pero sostiene que el resto del equipo pueda diligenciar bien.",
    color: "#b45309",
    icono: "bi-sliders",
    flujoResumen: [
      "Configurar usuarios/grupos",
      "Mantener parametros",
      "Monitorear informes",
      "Auditar caracterizaciones",
      "Corregir bloqueos operativos",
    ],
    modulos: [
      { nombre: "Usuarios", ruta: "/registrousuarios", icono: "bi-people", desc: "Alta, vigencia y grupos" },
      { nombre: "Parametros", ruta: "/admin_parametros", icono: "bi-sliders", desc: "Catalogos del sistema" },
      { nombre: "Informes", ruta: "/admin_informes", icono: "bi-file-earmark-medical", desc: "Reportes de gestion" },
      { nombre: "Reg. Caracterizacion", ruta: "/admin_caracterizacion", icono: "bi-file-person", desc: "Auditoria de caracterizaciones" },
      { nombre: "Prog. Visitas", ruta: "/admin_programavisitas", icono: "bi-car-front", desc: "Programacion" },
      { nombre: "Mant. BD", ruta: "/admin_mantenimiento_bd", icono: "bi-database-gear", desc: "Herramientas tecnicas" },
    ],
    secciones: [
      comun.inicio,
      {
        titulo: "2. Flujo administrativo recomendado",
        icono: "bi-diagram-3",
        color: "#92400e",
        pasos: [
          {
            titulo: "Prepara el equipo",
            texto: "Crea usuarios con cargo, convenio, grupo, IPS y vigencia correctos. Sin esto, no aparecen en listas de asignacion.",
            icono: "bi-person-gear",
            detalle: [
              "Cargo exacto (Auxiliar, Medico, Enfermero, etc.)",
              "Convenio y grupo alineados al equipo de terreno",
              "Fecha fin de contrato / vigencia",
              "Correo valido para login y recuperacion",
            ],
          },
          {
            titulo: "Mantén parametros vivos",
            texto: "EPS, CUPS, actividades y demas catalogos deben estar actualizados para que el diligenciamiento no se bloquee.",
            icono: "bi-sliders",
          },
          {
            titulo: "Monitorea operacion",
            texto: "Con informes y caracterizaciones detectas rezagos, devoluciones y fallas de calidad.",
            icono: "bi-graph-up",
          },
          {
            titulo: "Interven si hay bloqueo",
            texto: "Usuarios sin grupo, profesionales no listados, parametros vacios o datos inconsistentes se corrigen desde admin.",
            icono: "bi-tools",
          },
        ],
      },
      {
        titulo: "3. Como apoyar un buen diligenciamiento",
        icono: "bi-hand-thumbs-up",
        color: "#b45309",
        tips: [
          "Capacita auxiliares en Consultar antes de guardar",
          "Verifica que cada grupo tenga medico y enfermero activos",
          "En Unidesa, confirma que exista higienista oral en el grupo",
          "Revisa devoluciones frecuentes: suelen indicar mala caracterizacion o CUPS incompletos",
          "Usa profesionales delegados para auditar bandejas sin cambiar de usuario",
        ],
      },
    ],
  },

  superusuario: {
    titulo: "Manual de Superusuario",
    resumen:
      "Controlas configuracion global y soporte de segundo nivel. Tu prioridad es estabilidad del sistema y habilitar la operacion de todas las IPS/convenios.",
    color: "#7f1d1d",
    icono: "bi-shield-lock",
    flujoResumen: [
      "Revisar panel super",
      "Gestionar usuarios globales",
      "Atender bloqueos criticos",
      "Mantenimiento controlado",
    ],
    modulos: [
      { nombre: "Panel Super", ruta: "/superusuario", icono: "bi-shield-lock", desc: "Configuracion avanzada" },
      { nombre: "Usuarios", ruta: "/registrousuarios", icono: "bi-people", desc: "Administracion de usuarios" },
      { nombre: "Mant. BD", ruta: "/admin_mantenimiento_bd", icono: "bi-database-gear", desc: "Mantenimiento de datos" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta global" },
    ],
    secciones: [
      comun.inicio,
      {
        titulo: "2. Flujo de soporte",
        icono: "bi-diagram-3",
        color: "#991b1b",
        pasos: [
          {
            titulo: "Diagnostica el rol afectado",
            texto: "Identifica si el problema es de auxiliar (diligenciamiento), profesional (cierre/CUPS), facturacion o administracion.",
            icono: "bi-search",
          },
          {
            titulo: "Verifica maestro de usuarios",
            texto: "Cargo, convenio, grupo, IPS y vigencia suelen explicar por que alguien no ve pacientes o no aparece para asignacion.",
            icono: "bi-person-lines-fill",
          },
          {
            titulo: "Usa mantenimiento con cuidado",
            texto: "Las herramientas de BD son potentes. Confirma impacto antes de eliminar o depurar.",
            icono: "bi-exclamation-triangle",
            alerta: "Nunca ejecutes limpieza masiva sin validar una muestra y sin acuerdo operativo.",
          },
        ],
      },
      {
        titulo: "3. Guia rapida de incidencias comunes",
        icono: "bi-life-preserver",
        color: "#b91c1c",
        tips: [
          "No aparece profesional en encuesta: revisar grupo/convenio/vigencia",
          "No deja guardar encuesta: faltan obligatorios o no consulto documento",
          "No deja caracterizar Unidesa mujer: faltan FUM/menarquia/planifica",
          "No deja facturar: faltan caracterizacion o CUPS",
          "Usuario no entra: clave temporal, correo inexistente o bloqueo",
        ],
      },
    ],
  },

  general: {
    titulo: "Manual general de ExtramurApp",
    resumen: "Guia basica de navegacion. Si tu cargo tiene bandeja propia, pide al administrador validar el perfil para ver el tutorial completo.",
    color: "#0f766e",
    icono: "bi-book",
    flujoResumen: ["Login", "Home", "Menu de tu rol", "Trabajo diario"],
    modulos: [
      { nombre: "Home", ruta: "/homeviews", icono: "bi-house", desc: "Resumen de sesion" },
      { nombre: "Pacientes", ruta: "/consulta_pacientes", icono: "bi-search", desc: "Consulta de fichas" },
      { nombre: "Info", ruta: "/info", icono: "bi-info-circle", desc: "Informacion del sistema" },
    ],
    secciones: [
      comun.inicio,
      {
        titulo: "Flujo general del sistema",
        icono: "bi-diagram-3",
        color: "#0f766e",
        pasos: [
          {
            titulo: "Auxiliar registra y caracteriza",
            texto: "Abre el caso, completa demanda inducida y caracterizacion, asigna profesionales y CUPS.",
            icono: "bi-journal-plus",
          },
          {
            titulo: "Profesionales atienden",
            texto: "Cada rol gestiona su bandeja, completa actividades y cierra.",
            icono: "bi-people",
          },
          {
            titulo: "Facturacion y admin supervisan",
            texto: "Se valida completitud, se factura y se monitorean indicadores.",
            icono: "bi-clipboard-data",
          },
        ],
      },
    ],
  },
};

export function getManualForCargo(cargo) {
  const roleKey = resolveManualRoleKey(cargo);
  return {
    roleKey,
    ...(MANUALES_POR_ROL[roleKey] || MANUALES_POR_ROL.general),
  };
}

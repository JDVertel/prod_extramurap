# Actualizaciones recientes

- **31/07/2026:**
  - Caracterización Unidesa simplificada: solo Visita, Tamizaje, Tamizaje visual y Estado del esquema vacunal.
  - Antecedentes ginecobstétricos (FUM, menarquia, planifica) visibles solo si el sexo del paciente es femenino; se almacenan en el JSON `antecedentes` sin cambiar el esquema de BD.
  - Auxiliar: botón Eliminar reemplazado por Gestionar (engranaje). Abre un modal con documento y datos del paciente para editar, incluyendo profesionales asignados.
  - Validación automática al guardar si cambia tipo/número de documento, con las mismas reglas de la encuesta (disponible / encuestado / seguimiento E Básicos).
  - Login: card opaco y de mayor tamaño.

- **25/03/2026:**
  - Validación de convenio en consulta de pacientes: solo se marca como "encuestado" si el registro previo es del mismo convenio que el usuario logueado. Si fue encuestado en otro convenio, queda como "disponible" y se muestra una nota informativa.
  - Mensaje informativo de convenio diferente: se muestra el convenio, fecha y encuestador, con icono de información grande y sombreado a la derecha.
  - Todas las actividades proyectadas se agregan por defecto al formulario y ya no pueden eliminarse manualmente.

- **20/03/2026:**
  - Edición de tipo y número de documento en consulta de pacientes.
  - Limpieza de estado/cache visual al terminar edición o eliminación de pacientes.
  - Recuperación de contraseña con mensajes de envío, validez de 1 hora y aviso de SPAM.
  - Captcha agregado al módulo de recuperación de contraseña.
  - Validación de existencia de correo en base de datos antes de login y recuperación.
  - Validaciones reforzadas en registro de usuarios para campos en blanco y documento duplicado.

---
Responsable: Cursor Agent

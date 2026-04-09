# Cambios realizados en sop_encuesta.vue

## 1. Validación de convenio en consulta
- Ahora, al consultar un paciente, solo se marca como "encuestado" si el registro previo es del mismo convenio que el usuario logueado ("Extramural" o "E Basicos").
- Si el paciente fue encuestado en otro convenio, queda como "disponible" y se muestra una nota informativa.

## 2. Mensaje informativo de convenio diferente
- Si el paciente fue encuestado en otro convenio, se muestra un mensaje en el estado "disponible" indicando:
  - El convenio donde fue encuestado
  - La fecha de la encuesta
  - El nombre del encuestador
- Se añadió un icono de información grande y sombreado, alineado a la derecha del mensaje.

## 3. Actividades agregadas por defecto
- Al cargar el formulario, todas las actividades disponibles se agregan automáticamente a la lista de actividades proyectadas (`ListtipoActividad`).
- El usuario ya no puede eliminar actividades de la lista (se eliminó el botón de eliminar).
- Al guardar el registro, se almacenan todas las actividades como si hubieran sido seleccionadas manualmente.

## 4. Otros
- Se mantuvo la validación de campos obligatorios y la lógica de consulta previa.
- No se modificó la lógica de riesgos ni de otros campos del formulario.

---
**Fecha de actualización:** 25 de marzo de 2026
**Responsable:** GitHub Copilot

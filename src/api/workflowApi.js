import http from "./http";

function toApiCaracterizacion(payload = {}) {
  return {
    id: payload.id,
    encuestaId: payload.idEncuesta ?? payload.encuesta_id,
    convenio: payload.convenio,
    visita: payload.visita,
    tipoVisita: payload.tipovisita ?? payload.tipo_visita,
    tipoVivienda: payload.tipovivienda ?? payload.tipo_vivienda,
    estado: payload.estadoCaracterizacion ?? payload.estado,
    estIluminacion: payload.EstActual_Iluminacion ?? payload.est_iluminacion,
    estVentilacion: payload.EstActual_Ventilacion ?? payload.est_ventilacion,
    estParedes: payload.EstActual_Paredes ?? payload.est_paredes,
    estPisos: payload.EstActual_Pisos ?? payload.est_pisos,
    estTecho: payload.EstActual_Techo ?? payload.est_techo,
    peso: payload.peso,
    talla: payload.talla,
    tensionSistolica: payload.tensionSistolica ?? payload.tension_sistolica,
    tensionDiastolica: payload.tensionDiastolica ?? payload.tension_diastolica,
    perimetroAbdominal: payload.perimetroAbdominal ?? payload.perimetro_abdominal,
    perimetroBranquial: payload.perimetroBranquial ?? payload.perimetro_branquial,
    oximetria: payload.oximetria,
    temperatura: payload.temperatura,
    imc: payload.imc,
    clasificacionImc: payload.clasificacionImc ?? payload.clasificacion_imc,
    oIzquierdo: payload.Oizquierdo ?? payload.o_izquierdo,
    oDerecho: payload.Oderecho ?? payload.o_derecho,
    evacunal: payload.Evacunal ?? payload.evacunal,
    servPublicos: payload.seleccionadosServPublic ?? payload.serv_publicos,
    factoresRiesgo: payload.seleccionadosFactoresRiesgo ?? payload.factores_riesgo,
    presenciaAnimales: payload.seleccionadosPresenciaAnimales ?? payload.presencia_animales,
    antecedentes: payload.seleccionadosAntecedentes ?? payload.antecedentes,
    grupoFamiliar: payload.grupoFamiliar ?? payload.grupo_familiar,
    riesgos: payload.seleccionadosRiesgos ?? payload.riesgos,
    detalleSedentarismo: payload.detalleSedentarismo ?? payload.detalle_sedentarismo,
    detalleConsumoAlcohol: payload.detalleConsumoAlcohol ?? payload.detalle_consumo_alcohol,
    detalleConsumoCigarrillo: payload.detalleConsumoCigarrillo ?? payload.detalle_consumo_cigarrillo,
    detalleAlimentacionPocoSaludable:
      payload.AlimentacionPocoSaludable ??
      payload.detalleAlimentacionPocoSaludable ??
      payload.detalle_alimentacion_poco_saludable,
  };
}

export const workflowApi = {
  saveCaracterizacion: async (payload) => {
    const { data } = await http.post("/workflow/caracterizacion/guardar", toApiCaracterizacion(payload || {}));
    return data;
  },
  returnEncuestaToAuxiliar: async (encuestaId) => {
    const { data } = await http.post(`/workflow/encuestas/${encuestaId}/devolver-auxiliar`);
    return data;
  },
};
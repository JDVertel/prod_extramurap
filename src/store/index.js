// ============================================================================
// STORE VUEX - EXTRAMURAPP
// ============================================================================

// ============================================================================
// IMPORTS
// ============================================================================
import realtime_api from "@/api/realtimeApi.js";
import { caracterizacionApi, encuestasApi, encuestaActividadesApi } from "@/api/modulesApi";
import { workflowApi } from "@/api/workflowApi";
import persistedState from "./persistedstate";
import { createStore } from "vuex";
import { getAllUsers, getUserById } from "@/api/usersApi";
import router from "../router/index.js";
import moment from "moment";

// ============================================================================
// UTILIDADES
// ============================================================================
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function resolveCurrentIpsId(userData = {}, fallbackDataips = {}) {
  const raw =
    userData?.ipsId ??
    userData?.ips_id ??
    userData?.idips ??
    userData?.ips ??
    fallbackDataips?.id ??
    fallbackDataips?.ipsId ??
    fallbackDataips?.ips_id ??
    fallbackDataips?.idips ??
    fallbackDataips?.ips;

  const normalized = String(raw ?? "").trim();
  if (normalized) {
    return normalized;
  }

  // Fallback para sesiones donde el store aun no hidrata userData/dataips.
  if (typeof localStorage !== "undefined") {
    try {
      const rawUser = localStorage.getItem("userData");
      const fromUser = rawUser ? JSON.parse(rawUser) : null;
      const userIps = String(
        fromUser?.ipsId ?? fromUser?.ips_id ?? fromUser?.idips ?? fromUser?.ips ?? ""
      ).trim();
      if (userIps) {
        return userIps;
      }

      const rawIps = localStorage.getItem("dataips");
      const fromDataips = rawIps ? JSON.parse(rawIps) : null;
      const dataIps = String(
        fromDataips?.id ?? fromDataips?.ipsId ?? fromDataips?.ips_id ?? fromDataips?.idips ?? fromDataips?.ips ?? ""
      ).trim();
      if (dataIps) {
        return dataIps;
      }
    } catch (_) {
      // Ignorar errores de parseo de localStorage y seguir con null.
    }
  }

  return null;
}

function resolveRequiredIpsId(state = {}, contextLabel = "operacion") {
  const ipsId = resolveCurrentIpsId(state?.userData, state?.dataips);
  if (!ipsId) {
    throw new Error(`No se detectó IPS en la sesión para ${contextLabel}. Recarga la app e inicia sesión de nuevo.`);
  }
  return ipsId;
}

function getNoCacheRequestConfig() {
  return {
    params: {
      _ts: Date.now(),
    },
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  };
}

function buildNoCacheRequestConfig(extraParams = {}) {
  const base = getNoCacheRequestConfig();
  return {
    ...base,
    params: {
      ...(base.params || {}),
      ...(extraParams || {}),
    },
  };
}

function userBelongsToGroup(userGroupValue, targetGroup) {
  const target = String(targetGroup || "").trim();
  if (!target) return false;

  const groups = String(userGroupValue || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return groups.includes(target);
}

function normalizeComparableDocument(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^([0-9]+)\.0+$/, "$1")
    .replace(/[^a-z0-9]/g, "");
}

function normalizarFechaSoloDia(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }

  const raw = String(valor).trim();
  if (!raw) {
    return null;
  }

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  const latam = raw.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/);
  if (latam) {
    return `${latam[3]}-${latam[2]}-${latam[1]}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return null;
}

function toDateStart(yyyyMmDd) {
  const parsed = new Date(`${yyyyMmDd}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function toDateEnd(yyyyMmDd) {
  const parsed = new Date(`${yyyyMmDd}T23:59:59.999`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function estaFechaEnRango(valor, inicio, fin) {
  const fechaNormalizada = normalizarFechaSoloDia(valor);
  const inicioNormalizado = normalizarFechaSoloDia(inicio);
  const finNormalizado = normalizarFechaSoloDia(fin);

  if (!fechaNormalizada || !inicioNormalizado || !finNormalizado) {
    return false;
  }

  const fechaTs = toDateStart(fechaNormalizada);
  const inicioTs = toDateStart(inicioNormalizado);
  const finTs = toDateEnd(finNormalizado);

  if (fechaTs === null || inicioTs === null || finTs === null) {
    return false;
  }

  return fechaTs >= inicioTs && fechaTs <= finTs;
}

function getEncuestaDateFieldValue(encuesta = {}, legacyField = "") {
  const fieldMap = {
    fechagestEnfermera: "fecha_gest_enfermera",
    fechagestMedica: "fecha_gest_medica",
    fechagestPsicologo: "fecha_gest_psicologo",
    fechagestTsocial: "fecha_gest_tsocial",
    fechagestNutricionista: "fecha_gest_nutricionista",
    fechagestAuxiliar: "fecha_gest_auxiliar",
  };

  const apiField = fieldMap[legacyField] || legacyField;
  return encuesta?.[legacyField] ?? encuesta?.[apiField] ?? "";
}

function filterCierresMedicoPorRango(encuestas = [], { fechaInicio, fechaFin, idempleado, cargo } = {}) {
  return encuestas.filter((encuesta) => {
    const fechaNormalizada = normalizarFechaSoloDia(getEncuestaDateFieldValue(encuesta, "fechagestMedica"));
    const estadoGestion = Number(encuesta.status_gest_medica);
    const gestionCerrada = encuesta.status_gest_medica === true || estadoGestion >= 1;

    if (!fechaNormalizada) return false;
    if (!(fechaNormalizada >= fechaInicio && fechaNormalizada <= fechaFin)) return false;

    if (
      idempleado &&
      String(encuesta.idMedicoAtiende || "").trim() !== String(idempleado || "").trim()
    ) {
      return false;
    }

    if (cargo && !gestionCerrada) return false;
    if (cargo && encuesta.status_gest_aux !== true) return false;

    if (encuesta.tipoActividad && typeof encuesta.tipoActividad === "object") {
      encuesta.actividadesRealizadas = Object.values(encuesta.tipoActividad).filter(
        (act) => act.Profesional && act.Profesional.includes(cargo)
      );
    } else {
      encuesta.actividadesRealizadas = [];
    }

    return true;
  });
}

function getActividadKey(row = {}) {
  return String(row?.actividad_key ?? row?.actividadKey ?? row?.key ?? "").trim();
}

// ============================================================================
// STORE CONFIGURATION
// ============================================================================
export default createStore({
  // ========================================================================
  // STATE
  // ========================================================================
  state: {
    // Autenticación y usuario
    token: localStorage.getItem("token") || null,
    uid: localStorage.getItem("uid") || null,
    userData: (() => {
      try {
        const data = localStorage.getItem("userData");
        return data ? JSON.parse(data) : {};
      } catch (e) {
        return {};
      }
    })(),
    user: null,
    accessToken: null,

    // Encuestas
    encuestas: [],
    encuestasFiltradas: [],
    encuestasFiltradasLabById: [],
    encuestasFiltradasVisitaById: [],
    encuestasToday: [],
    InfoEncuestasById: [],
    cantEncuestas: "",
    EncuestasProf: [],
    EncuestasFact: [],
    EncuestasFactAprov: [],

    // Usuarios y personal
    usuarios: [],
    medicosByGrupo: [],
    enfermerosByGrupo: [],
    psicologosByGrupo: [],
    tsocialesByGrupo: [],
    nutricionistasByGrupo: [],

    // Parámetros
    comunasBarrios: [],
    epss: [],
    dataips: {},

    // Agendas
    agendas: [],

    // CUPS y actividades
    cups: [],
    cupsbyActividad: {},
    actividades: [],
    actividadesExtra: [],
    contratos: [],

    // Datos de paciente
    datosPaciente: [],

    // Contador de encuestas en proceso (aux no ha cerrado) para la vista del profesional activo
    cantEncuestasEnProceso: 0,
  },
  // plugins: [persistedState],

  // ========================================================================
  // ACTIONS
  // ========================================================================
  actions: {
    // ====================================================================
    // ENCUESTAS - CREACIÓN Y REGISTRO
    // ====================================================================

    /**
     * Crea un nuevo registro de encuesta con actividades
     */
    createNewRegister: async ({ commit }, entradasE) => {
      let mainId = null;
      try {
        const {
          bd,
          tiporegistro,
          tipoRegistro,
          idMedicoAtiende,
          idEnfermeroAtiende,
          idPsicologoAtiende,
          idTsocialAtiende,
          idNutricionistaAtiende,
          fechavisita,
          status_gest_aux,
          status_gest_medica,
          status_gest_enfermera,
          status_gest_psicologo,
          status_gest_tsocial,
          status_gest_nutricionista,
          status_caracterizacion,
          status_visita,
          idEncuesta,
          grupo,
          idEncuestador,
          convenio,
          eps,
          regimen,
          fecha,
          nombre1,
          nombre2,
          apellido1,
          apellido2,
          tipodoc,
          numdoc,
          sexo,
          fechaNac,
          direccion,
          telefono,
          barrioVeredacomuna,
          desplazamiento,
          poblacionRiesgo,
          requiereRemision,
          tipoActividad,
        } = entradasE;

        const poblacionRiesgoNormalizada = Array.isArray(poblacionRiesgo)
          ? poblacionRiesgo.map((item) => String(item || "").trim()).filter(Boolean)
          : [];

        const actividadesNormalizadas = (() => {
          if (!Array.isArray(tipoActividad)) return [];

          const mapa = new Map();
          tipoActividad.forEach((actividad, index) => {
            if (!actividad || typeof actividad !== "object") return;

            const key = String(
              actividad.key ||
              actividad.clave ||
              actividad.id ||
              actividad.actividadId ||
              `actividad_${index + 1}`
            ).trim();

            if (!key || mapa.has(key)) return;
            mapa.set(key, { ...actividad, key });
          });

          return Array.from(mapa.values());
        })();

        if (!actividadesNormalizadas.length) {
          throw new Error("La encuesta debe tener al menos una actividad válida antes de guardarse.");
        }

        const DataToSaveE = {
          tiporegistro: tiporegistro || tipoRegistro,
          idMedicoAtiende,
          idEnfermeroAtiende,
          idPsicologoAtiende,
          idTsocialAtiende,
          idNutricionistaAtiende,
          fechavisita,
          status_gest_aux,
          status_gest_medica,
          status_gest_enfermera,
          status_gest_psicologo,
          status_gest_tsocial,
          status_gest_nutricionista,
          status_caracterizacion,
          status_visita,
          idEncuesta,
          grupo,
          idEncuestador,
          convenio,
          eps,
          regimen,
          fecha,
          nombre1,
          nombre2,
          apellido1,
          apellido2,
          tipodoc,
          numdoc,
          sexo,
          fechaNac,
          direccion,
          telefono,
          barrioVeredacomuna,
          desplazamiento,
          poblacionRiesgo:
            poblacionRiesgoNormalizada.length > 0 ? poblacionRiesgoNormalizada : undefined,
          requiereRemision,
        };

        // 1. Guardar registro principal
        const created = await encuestasApi.create(DataToSaveE);
        mainId = created?.id || null;

        if (!mainId) {
          throw new Error("No se pudo generar el identificador de la encuesta.");
        }

        // 2. Guardar actividades
        const esperadas = actividadesNormalizadas.map((actividad) => actividad.key);

        for (const actividad of actividadesNormalizadas) {
          try {
            await encuestaActividadesApi.create({ encuestaId: mainId, actividadKey: actividad.key });
          } catch (errorActividad) {
            console.warn(
              `No fue posible guardar actividad ${actividad.key} para encuesta ${mainId}`,
              errorActividad
            );
          }
        }

        const leerKeysPersistidas = async () => {
          const actividadesPersistidas = await encuestaActividadesApi.list({
            encuestaId: mainId,
            limit: 200,
            offset: 0,
          });

          if (!Array.isArray(actividadesPersistidas) || !actividadesPersistidas.length) {
            return [];
          }

          return Array.from(new Set(
            actividadesPersistidas
              .map((item) => getActividadKey(item))
              .filter(Boolean)
          ));
        };

        let persistidas = await leerKeysPersistidas();
        let faltantes = esperadas.filter((key) => !persistidas.includes(key));

        // Reintento controlado para actividades faltantes
        if (faltantes.length > 0) {
          for (const keyActividad of faltantes) {
            try {
              await encuestaActividadesApi.create({ encuestaId: mainId, actividadKey: keyActividad });
            } catch (errorReintento) {
              console.warn(
                `Fallo reintento de actividad ${keyActividad} para encuesta ${mainId}`,
                errorReintento
              );
            }
          }

          persistidas = await leerKeysPersistidas();
          faltantes = esperadas.filter((key) => !persistidas.includes(key));
        }

        if (faltantes.length > 0) {
          throw new Error(
            `No se guardaron todas las actividades. Faltantes: ${faltantes.join(", ")}`
          );
        }

        const actividadesGuardadas = esperadas.length;

        return {
          mainId,
          actividadesGuardadas,
          actividadesFallidas: [],
        };
      } catch (error) {
        // Rollback: evitar encuestas "fantasma" si el proceso falla a mitad.
        if (mainId) {
          try {
            await encuestasApi.remove(mainId);
          } catch (rollbackMainError) {
            console.error("No se pudo revertir registro principal tras fallo:", rollbackMainError);
          }

          try {
            const actividades = await encuestaActividadesApi.list({ encuestaId: mainId, limit: 200, offset: 0 });
            await Promise.all(
              actividades.map((actividad) => encuestaActividadesApi.remove(actividad.id))
            );
          } catch (rollbackActivitiesError) {
            console.error("No se pudieron revertir actividades tras fallo:", rollbackActivitiesError);
          }
        }

        console.error("Error en Action_createNewRegister:", error);
        throw error;
      }
    },

    /**
     * Elimina un paciente/encuesta por ID
     */
    deletePaciente: async ({ commit }, id) => {
      try {
        if (!id) throw new Error("ID inválido para eliminar");
        return await encuestasApi.remove(id);
      } catch (error) {
        console.error("Error en Action deletePaciente:", error);
        throw error;
      }
    },

    /**
     * Elimina un registro de encuesta
     */
    removeRegEnc: async ({ commit }, id) => {
      try {
        return await encuestasApi.remove(id);
      } catch (error) {
        console.error("Error en Action_removeRegEnc:", error);
        throw error;
      }
    },

    /**
     * Cierra una encuesta según el cargo del profesional
     */
    cerrarEncuesta: async ({ commit }, { id, cargo, fecha = Date.now() }) => {
      let varStatus = "";
      let dateStatus = "";
      let cargoTexto = "";

      if (cargo === "Enfermero") {
        varStatus = "status_gest_enfermera";
        dateStatus = "fechagestEnfermera";
        cargoTexto = "enfermera";
      } else if (cargo === "Medico") {
        varStatus = "status_gest_medica";
        dateStatus = "fechagestMedica";
        cargoTexto = "médico";
      } else if (cargo === "Psicologo") {
        varStatus = "status_gest_psicologo";
        dateStatus = "fechagestPsicologo";
        cargoTexto = "psicologo";
      } else if (cargo === "Tsocial") {
        varStatus = "status_gest_tsocial";
        dateStatus = "fechagestTsocial";
        cargoTexto = "trabajador social";
      } else if (cargo === "Nutricionista") {
        varStatus = "status_gest_nutricionista";
        dateStatus = "fechagestNutricionista";
        cargoTexto = "nutricionista";
      } else {
        varStatus = "status_gest_aux";
        dateStatus = "fechagestAuxiliar";
        cargoTexto = "auxiliar";
      }

      try {
        const encuestaActual = await encuestasApi.getById(id);
        const estadoActualRaw = encuestaActual?.[varStatus];
        const estadoActual = Number(estadoActualRaw);
        const fechaActual = String(getEncuestaDateFieldValue(encuestaActual, dateStatus) || "").trim();
        const tieneCierrePrevio = !!fechaActual;

        // Flujo solicitado:
        // - primer cierre: status 1
        // - si fue devuelto a 0 para corrección y vuelve a cerrar: status 2
        const nuevoEstado = Number.isFinite(estadoActual) && estadoActual === 0 && tieneCierrePrevio
          ? 2
          : (tieneCierrePrevio && estadoActual >= 1 ? 2 : 1);

        const data = await encuestasApi.update(id, {
          [varStatus]: nuevoEstado,
          [dateStatus]: moment(fecha).format("YYYY-MM-DD HH:mm:ss"),
        });

        alert(`La visita ha sido cerrada exitosamente por ${cargoTexto}.`);
        return data;
      } catch (error) {
        console.error("Error al cerrar encuesta:", error);
        throw error;
      }
    },

    // ====================================================================
    // ENCUESTAS - CONSULTAS Y FILTROS
    // ====================================================================

    /**
     * Obtiene todos los registros de un usuario específico
     */
    getAllRegisters: async ({ commit }, idUsuario) => {
      try {
        const { data } = await realtime_api.get("/Encuesta.json", getNoCacheRequestConfig());
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) => encuesta.idUsuario === idUsuario
        );

        commit("setEncuestas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_getAllRegisters:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por fecha y estado para auxiliar
     */
    getAllRegistersByFechaStatus: async ({ commit }, { idUsuario }) => {
      console.log("parametro de consulta abiertas aux", idUsuario);
      try {
        const { data } = await realtime_api.get(
          "/Encuesta.json",
          buildNoCacheRequestConfig({
            idEncuestador: idUsuario,
          })
        );

        if (!data) {
          commit("setEncuestas", []);
          commit("setcantEncuestas", 0);
          alert("No hay datos para mostrar.");
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => {
          if (encuesta.idEncuestador !== idUsuario) return false;
          if (encuesta.status_gest_aux !== false) return false;

          const yaHabiaCierreAuxiliar = Boolean(String(encuesta.fechagestAuxiliar || "").trim());

          return encuesta.status_visita === false || yaHabiaCierreAuxiliar;
        });

        const cantidad = encuestasFiltradas.length;
        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", cantidad);

        if (cantidad === 0) {
          alert("No hay datos para mostrar.");
        }

        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAllRegistersByFechaStatus:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros pendientes para psicologo
     */
    getEncuestasPendientesPsicologo: async ({ commit }, { idUsuario, includeSource = false } = {}) => {
      console.log("Obteniendo encuestas pendientes para psicologo:", idUsuario);
      try {
        const { data } = await realtime_api.get(
          "/Encuesta.json",
          buildNoCacheRequestConfig({
            idPsicologoAtiende: idUsuario,
          })
        );

        if (!data) {
          commit("setEncuestas", []);
          commit("setcantEncuestas", 0);
          return includeSource ? { filtered: [], source: [] } : [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.idPsicologoAtiende === idUsuario &&
            encuesta.status_gest_aux === true &&
            encuesta.status_gest_psicologo !== true
        );

        const enProcesoCount = encuestas.filter(
          (encuesta) =>
            encuesta.idPsicologoAtiende === idUsuario &&
            encuesta.status_gest_aux !== true
        ).length;

        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", encuestasFiltradas.length);
        commit("setCantEncuestasEnProceso", enProcesoCount);

        if (includeSource) {
          return {
            filtered: encuestasFiltradas,
            source: encuestas,
          };
        }

        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getEncuestasPendientesPsicologo:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros pendientes para trabajador social
     */
    getEncuestasPendientesTsocial: async ({ commit }, { idUsuario, includeSource = false } = {}) => {
      console.log("Obteniendo encuestas pendientes para trabajador social:", idUsuario);
      try {
        const { data } = await realtime_api.get(
          "/Encuesta.json",
          buildNoCacheRequestConfig({
            idTsocialAtiende: idUsuario,
          })
        );

        if (!data) {
          commit("setEncuestas", []);
          commit("setcantEncuestas", 0);
          return includeSource ? { filtered: [], source: [] } : [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.idTsocialAtiende === idUsuario &&
            encuesta.status_gest_aux === true &&
            encuesta.status_gest_tsocial !== true
        );

        const enProcesoCount = encuestas.filter(
          (encuesta) =>
            encuesta.idTsocialAtiende === idUsuario &&
            encuesta.status_gest_aux !== true
        ).length;

        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", encuestasFiltradas.length);
        commit("setCantEncuestasEnProceso", enProcesoCount);

        if (includeSource) {
          return {
            filtered: encuestasFiltradas,
            source: encuestas,
          };
        }

        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getEncuestasPendientesTsocial:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros pendientes para nutricionista
     */
    getEncuestasPendientesNutricionista: async ({ commit }, { idUsuario, includeSource = false } = {}) => {
      console.log("Obteniendo encuestas pendientes para nutricionista:", idUsuario);
      try {
        const { data } = await realtime_api.get(
          "/Encuesta.json",
          buildNoCacheRequestConfig({
            idNutricionistaAtiende: idUsuario,
          })
        );

        if (!data) {
          commit("setEncuestas", []);
          commit("setcantEncuestas", 0);
          return includeSource ? { filtered: [], source: [] } : [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const esAsignadaANutricionista = (encuesta) => {
          const candidatos = [
            encuesta.idNutricionistaAtiende,
            encuesta.idNutriAtiende,
            encuesta.idNutricionista,
            encuesta.idNutricionAtiende,
          ]
            .map((valor) => String(valor || "").trim())
            .filter(Boolean);

          return candidatos.includes(String(idUsuario || "").trim());
        };

        const estadoCerrado = (valor) => {
          if (valor === true || valor === 1) return true;
          if (typeof valor === "string") {
            const limpio = valor.trim().toLowerCase();
            return limpio === "true" || limpio === "1" || limpio === "2";
          }
          if (typeof valor === "number") {
            return valor >= 1;
          }
          return false;
        };

        const estaCerradaPorNutricionista = (encuesta) =>
          estadoCerrado(encuesta.status_gest_nutricionista) || estadoCerrado(encuesta.status_gest_nutri);

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            esAsignadaANutricionista(encuesta) &&
            estadoCerrado(encuesta.status_gest_aux) &&
            !estaCerradaPorNutricionista(encuesta)
        );

        const enProcesoCount = encuestas.filter(
          (encuesta) =>
            esAsignadaANutricionista(encuesta) &&
            !estadoCerrado(encuesta.status_gest_aux)
        ).length;

        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", encuestasFiltradas.length);
        commit("setCantEncuestasEnProceso", enProcesoCount);

        if (includeSource) {
          return {
            filtered: encuestasFiltradas,
            source: encuestas,
          };
        }

        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getEncuestasPendientesNutricionista:", error);
        throw error;
      }
    },

    /**
     * Obtiene encuestas con status_gest_aux = true y sus actividades asociadas
     */
    getEncuestasConActividadesAux: async ({ commit }, { idUsuario }) => {
      console.log("Obteniendo encuestas con actividades para auxiliar:", idUsuario);
      try {
        const construirActividadesDesdeAsignaciones = (asignacion = {}) => {
          const cups = asignacion?.cups;
          const cupsLista = Array.isArray(cups)
            ? cups
            : (cups && typeof cups === "object" ? Object.values(cups) : []);

          const tipoActividad = {};
          cupsLista.forEach((cup) => {
            const actividadId = String(cup?.actividadId ?? cup?.idActividad ?? "").trim();
            if (!actividadId || tipoActividad[actividadId]) return;
            tipoActividad[actividadId] = { key: actividadId };
          });

          return Object.keys(tipoActividad).length ? { tipoActividad } : {};
        };

        // Obtener todas las encuestas
        const { data: encuestasData } = await realtime_api.get(
          "/Encuesta.json",
          buildNoCacheRequestConfig({
            idEncuestador: idUsuario,
          })
        );
        const [{ data: actividadesGlobal }, { data: asignacionesGlobal }] = await Promise.all([
          realtime_api.get("/Actividades.json", getNoCacheRequestConfig()).catch(() => ({ data: {} })),
          realtime_api.get("/Asignaciones.json", getNoCacheRequestConfig()).catch(() => ({ data: {} })),
        ]);

        if (!encuestasData) {
          return [];
        }

        // Filtrar encuestas con status_gest_aux = true para este auxiliar
        const encuestas = Object.entries(encuestasData)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter(
            (encuesta) =>
              encuesta.idEncuestador === idUsuario &&
              encuesta.status_gest_aux === true
          );

        // Para cada encuesta, obtener sus actividades
        const encuestasConActividades = await Promise.all(
          encuestas.map(async (encuesta) => {
            try {
              let { data: actividadesData } = await realtime_api.get(
                `/Actividades/${encuesta.id}.json`,
                getNoCacheRequestConfig()
              );

              if (!actividadesData && actividadesGlobal && typeof actividadesGlobal === "object") {
                actividadesData = actividadesGlobal[encuesta.id] || null;
              }

              if (!actividadesData && asignacionesGlobal && typeof asignacionesGlobal === "object") {
                actividadesData = construirActividadesDesdeAsignaciones(asignacionesGlobal[encuesta.id] || {});
              }

              return {
                ...encuesta,
                actividades: actividadesData || {},
                tipoActividad: actividadesData?.tipoActividad || actividadesData || {},
              };
            } catch (error) {
              console.warn(`No se encontraron actividades para encuesta ${encuesta.id}`);
              const actividadesFallback = (actividadesGlobal && typeof actividadesGlobal === "object"
                ? actividadesGlobal[encuesta.id]
                : null) || construirActividadesDesdeAsignaciones(
                asignacionesGlobal && typeof asignacionesGlobal === "object"
                  ? (asignacionesGlobal[encuesta.id] || {})
                  : {}
              );
              return {
                ...encuesta,
                actividades: actividadesFallback || {},
                tipoActividad: actividadesFallback?.tipoActividad || actividadesFallback || {},
              };
            }
          })
        );

        return encuestasConActividades;
      } catch (error) {
        console.error("Error en getEncuestasConActividadesAux:", error);
        throw error;
      }
    },

    /**
     * Obtiene encuestas para medico y sus actividades asociadas
     */
    getEncuestasConActividadesMedico: async ({ commit }, { idUsuario }) => {
      console.log("Obteniendo encuestas con actividades para médico:", idUsuario);
      try {
        const construirActividadesDesdeAsignaciones = (asignacion = {}) => {
          const cups = asignacion?.cups;
          const cupsLista = Array.isArray(cups)
            ? cups
            : (cups && typeof cups === "object" ? Object.values(cups) : []);

          const tipoActividad = {};
          cupsLista.forEach((cup) => {
            const actividadId = String(cup?.actividadId ?? cup?.idActividad ?? "").trim();
            if (!actividadId || tipoActividad[actividadId]) return;
            tipoActividad[actividadId] = { key: actividadId };
          });

          return Object.keys(tipoActividad).length ? { tipoActividad } : {};
        };

        // Obtener todas las encuestas
        const { data: encuestasData } = await realtime_api.get(
          "/Encuesta.json",
          buildNoCacheRequestConfig({
            idMedicoAtiende: idUsuario,
          })
        );
        const [{ data: actividadesGlobal }, { data: asignacionesGlobal }] = await Promise.all([
          realtime_api.get("/Actividades.json").catch(() => ({ data: {} })),
          realtime_api.get("/Asignaciones.json").catch(() => ({ data: {} })),
        ]);

        if (!encuestasData) {
          return [];
        }

        // Filtrar encuestas con status_gest_medica = false para este medico
        const encuestas = Object.entries(encuestasData)
          .map(([key, value]) => ({
            id: key,
            ...value,
          }))
          .filter(
            (encuesta) =>
              encuesta.idMedicoAtiende === idUsuario &&
              encuesta.status_gest_aux === true &&
              encuesta.status_gest_medica === false
          );

        // Contar encuestas en proceso (aux no ha cerrado)
        const todasEncuestas = Object.entries(encuestasData).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        const enProcesoCount = todasEncuestas.filter(
          (encuesta) =>
            encuesta.idMedicoAtiende === idUsuario &&
            encuesta.status_gest_aux !== true
        ).length;
        commit("setCantEncuestasEnProceso", enProcesoCount);

        const encuestasConActividades = encuestas.map((encuesta) => {
          const actividadesDirectas =
            actividadesGlobal && typeof actividadesGlobal === "object"
              ? actividadesGlobal[encuesta.id] || null
              : null;
          const actividadesFallback = actividadesDirectas || construirActividadesDesdeAsignaciones(
            asignacionesGlobal && typeof asignacionesGlobal === "object"
              ? (asignacionesGlobal[encuesta.id] || {})
              : {}
          );

          return {
            ...encuesta,
            actividades: actividadesFallback || {},
            tipoActividad: actividadesFallback?.tipoActividad || actividadesFallback || {},
          };
        });

        return encuestasConActividades;
      } catch (error) {
        console.error("Error en getEncuestasConActividadesMedico:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por profesional y fecha
     */
    getAllRegistersByFechaProf: async ({ commit }, { doc, fecha }) => {
      console.log("grupo consultado", doc, fecha);
      try {
        const { data } = await realtime_api.get("/Encuesta.json", getNoCacheRequestConfig());
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.status_visita === true &&
            encuesta.idProfesionalAtiende == doc &&
            encuesta.fechavisita === fecha
        );

        commit("setEncuestasToday", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAllRegistersByFechaProf", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por ID de usuario profesional (médico)
     */
    getAllRegistersByIduserProf: async ({ commit }, { idUsuario }) => {
      console.log("datos que entran medico", idUsuario);
      try {
        const { data } = await realtime_api.get(
          "/Encuesta.json",
          buildNoCacheRequestConfig({
            idMedicoAtiende: idUsuario,
          })
        );
        if (!data) {
          commit("setcantEncuestas", 0);
          return 0;
        }

        const encuestas = Object.entries(data)
          .filter(
            ([_, value]) =>
              value.idMedicoAtiende === idUsuario && value.status_gest_medica === false
          )
          .map(([key, value]) => ({
            id: key,
            ...value,
          }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.idMedicoAtiende === idUsuario &&
            encuesta.status_gest_medica === false &&
            encuesta.status_gest_aux === true
        );

        console.log(encuestasFiltradas);
        const cantidad = encuestasFiltradas.length;
        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", cantidad);

        return cantidad;
      } catch (error) {
        console.error("Error en getAllRegistersByIduserProf:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por ID de usuario enfermero
     */
    getAllRegistersByIduserEnfer: async ({ commit }, { idUsuario, convenio, includeSource = false } = {}) => {
      console.log("datos que entran enfermero", idUsuario, convenio);
      try {
        const params = {
          idEnfermeroAtiende: idUsuario,
        };

        if (String(convenio ?? "").trim()) {
          params.convenio = String(convenio ?? "").trim();
        }

        const { data } = await realtime_api.get(
          "/Encuesta.json",
          buildNoCacheRequestConfig(params)
        );
        if (!data) {
          commit("setcantEncuestas", 0);
          return includeSource ? { filtered: [], source: [] } : 0;
        }

        const convenioNormalizado = String(convenio ?? "").trim();

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => {
          if (encuesta.idEnfermeroAtiende !== idUsuario) return false;
          if (encuesta.status_gest_enfermera !== false) return false;

          if (convenioNormalizado) {
            return String(encuesta.convenio ?? "").trim() === convenioNormalizado;
          }

          return true;
        });

        console.log(encuestasFiltradas);
        const cantidad = encuestasFiltradas.length;
        commit("setEncuestas", encuestasFiltradas);
        commit("setcantEncuestas", cantidad);

        if (includeSource) {
          return {
            filtered: encuestasFiltradas,
            source: encuestas,
          };
        }

        return cantidad;
      } catch (error) {
        console.error("Error en getAllRegistersByIduserProf:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por rango de fechas - Auxiliar
     */
    GetAllRegistersbyRangeAux: async ({ commit }, rango) => {
      const { fechaInicio, fechaFin, idempleado, cargo } = rango;
      console.log("data que entra", fechaFin, fechaInicio, idempleado, cargo);
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error("Debes proporcionar ambas fechas para el filtro.");
        }

        const cargoNormalizado = String(cargo || "").trim().toLowerCase();
        const documentoEmpleado = String(idempleado || "").trim();
        const params = {};

        if (documentoEmpleado && cargoNormalizado === "auxiliar de enfermeria") {
          params.idEncuestador = documentoEmpleado;
          params.status_gest_aux = 1;
        }

        if (documentoEmpleado && (cargoNormalizado === "psicologo" || cargoNormalizado === "psicólogo")) {
          params.idPsicologoAtiende = documentoEmpleado;
          params.status_gest_psicologo = 1;
        }

        if (documentoEmpleado && (cargoNormalizado === "tsocial" || cargoNormalizado === "trabajador social")) {
          params.idTsocialAtiende = documentoEmpleado;
          params.status_gest_tsocial = 1;
        }

        const { data } = await realtime_api.get("/Encuesta.json", buildNoCacheRequestConfig(params));
        if (!data) {
          commit("setEncuestasfiltradas", []);
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => {
          const fecha = String(encuesta.fecha || "").trim();
          if (!fecha) return false;

          const fechaNormalizada = fecha.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || fecha;

          if (!(fechaNormalizada >= fechaInicio && fechaNormalizada <= fechaFin)) return false;

          if (
            documentoEmpleado &&
            cargoNormalizado === "auxiliar de enfermeria" &&
            String(encuesta.idEncuestador || "").trim() !== documentoEmpleado
          ) {
            return false;
          }

          // Filtros por profesional para reutilizar la vista de informes en psicologia/tsocial.
          if (cargoNormalizado === "psicologo" || cargoNormalizado === "psicólogo") {
            if (documentoEmpleado && String(encuesta.idPsicologoAtiende || "").trim() !== documentoEmpleado) {
              return false;
            }
            if (encuesta.status_gest_psicologo !== true) return false;
            return true;
          }

          if (cargoNormalizado === "tsocial" || cargoNormalizado === "trabajador social") {
            if (documentoEmpleado && String(encuesta.idTsocialAtiende || "").trim() !== documentoEmpleado) {
              return false;
            }
            if (encuesta.status_gest_tsocial !== true) return false;
            return true;
          }

          // Por defecto: incluir pacientes cerrados por el auxiliar (cierre de CUPS/paciente).
          if (encuesta.status_gest_aux !== true) return false;

          return true;
        });

        commit("setEncuestasfiltradas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en GetAllRegistersbyRangeAux:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por rango de fechas - Médico
     */
    GetAllRegistersbyRangeMed: async ({ commit }, rango) => {
      const { fechaInicio, fechaFin, idempleado, cargo } = rango;
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error("Debes proporcionar ambas fechas para el filtro.");
        }

        const params = {};
        if (String(idempleado || "").trim()) {
          params.idMedicoAtiende = String(idempleado || "").trim();
        }
        if (cargo) {
          params.status_gest_medica = 1;
          params.status_gest_aux = 1;
        }

        const { data } = await realtime_api.get("/Encuesta.json", buildNoCacheRequestConfig(params));
        if (!data) {
          commit("setEncuestasfiltradas", []);
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = filterCierresMedicoPorRango(encuestas, {
          fechaInicio,
          fechaFin,
          idempleado,
          cargo,
        });

        commit("setEncuestasfiltradas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en GetAllRegistersbyRangeMed:", error);
        throw error;
      }
    },

    getConteoCierresMedicoPorRango: async (_ctx, rango) => {
      const { fechaInicio, fechaFin, idempleado, cargo } = rango || {};
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error("Debes proporcionar ambas fechas para el filtro.");
        }

        const params = {};
        if (String(idempleado || "").trim()) {
          params.idMedicoAtiende = String(idempleado || "").trim();
        }
        if (cargo) {
          params.status_gest_medica = 1;
          params.status_gest_aux = 1;
        }

        const { data } = await realtime_api.get("/Encuesta.json", buildNoCacheRequestConfig(params));
        if (!data) {
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        return filterCierresMedicoPorRango(encuestas, rango);
      } catch (error) {
        console.error("Error en getConteoCierresMedicoPorRango:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros por rango de fechas - Enfermero
     */
    GetAllRegistersbyRangeEnf: async ({ commit }, rango) => {
      const { fechaInicio, fechaFin, idempleado, cargo } = rango;
      console.log("data que entra", fechaFin, fechaInicio, idempleado, cargo);
      try {
        if (!fechaInicio || !fechaFin) {
          throw new Error("Debes proporcionar ambas fechas para el filtro.");
        }

        const params = {};
        if (String(idempleado || "").trim()) {
          params.idEnfermeroAtiende = String(idempleado || "").trim();
        }
        if (cargo) {
          params.status_gest_medica = 1;
          params.status_gest_aux = 1;
          params.status_gest_enfermera = 1;
        }

        const { data } = await realtime_api.get("/Encuesta.json", buildNoCacheRequestConfig(params));
        if (!data) {
          commit("setEncuestasfiltradas", []);
          return [];
        }

        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => {
          const fecha = encuesta.fechagestEnfermera;
          if (!fecha) return false;

          if (!(fecha >= fechaInicio && fecha <= fechaFin)) return false;

          if (idempleado && encuesta.idEnfermeroAtiende !== idempleado) return false;

          if (cargo && encuesta.status_gest_medica !== true) return false;
          if (cargo && encuesta.status_gest_aux !== true) return false;
          if (cargo && encuesta.status_gest_enfermera !== true) return false;

          return true;
        });

        commit("setEncuestasfiltradas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en GetAllRegistersbyRangeEnf:", error);
        throw error;
      }
    },

    /**
     * Obtiene encuesta por ID
     */
    getEncuestaById: async ({ commit }, idEncuesta) => {
      try {
        const safeGet = async (url) => {
          try {
            const response = await realtime_api.get(url);
            return response.data;
          } catch (errorGet) {
            if (errorGet?.response?.status === 404) {
              return null;
            }
            throw errorGet;
          }
        };

        const resolverEncuestaFallback = async (encuestaId) => {
          const encuestasGlobal = await safeGet(`/Encuesta.json`);
          if (!encuestasGlobal || typeof encuestasGlobal !== "object") {
            return null;
          }

          const encontrada = encuestasGlobal[String(encuestaId)];
          if (encontrada && typeof encontrada === "object") {
            return encontrada;
          }

          return null;
        };

        const resolverActividadesFallback = async (encuestaId) => {
          const actividadesGlobal = await safeGet(`/Actividades.json`);
          if (!actividadesGlobal || typeof actividadesGlobal !== "object") {
            return null;
          }

          const encontradas = actividadesGlobal[String(encuestaId)];
          if (encontradas && typeof encontradas === "object") {
            return encontradas;
          }

          return null;
        };

        // Consultar asignaciones, datos de encuesta y actividades (tolerando 404 por recurso inexistente)
        let [asignacionesData, encuestaData, actividadesData] = await Promise.all([
          safeGet(`/Asignaciones/${idEncuesta}.json`),
          safeGet(`/Encuesta/${idEncuesta}.json`),
          safeGet(`/Actividades/${idEncuesta}.json`),
        ]);

        if (!encuestaData) {
          encuestaData = await resolverEncuestaFallback(idEncuesta);
        }

        if (!actividadesData) {
          actividadesData = await resolverActividadesFallback(idEncuesta);
        }

        if (!encuestaData) {
          console.warn(`Encuesta ${idEncuesta} no encontrada`);
          commit("setEncuesta", {});
          return {};
        }

        // Extraer cups del objeto de asignaciones (soporta shape nuevo y legacy).
        const extraerCupsAsignaciones = (asignaciones = {}) => {
          const cupsOut = {};

          const cupsDirectos = asignaciones?.cups;
          if (cupsDirectos && typeof cupsDirectos === "object") {
            Object.entries(cupsDirectos).forEach(([cupId, cup]) => {
              if (!cup || typeof cup !== "object") return;
              cupsOut[String(cupId)] = { ...cup };
            });
          }

          const tipoActividad = asignaciones?.tipoActividad;
          if (tipoActividad && typeof tipoActividad === "object") {
            Object.entries(tipoActividad).forEach(([actividadId, actividadNode]) => {
              if (!actividadNode || typeof actividadNode !== "object") return;

              const cupsPorRol = actividadNode?.cups;
              if (!cupsPorRol || typeof cupsPorRol !== "object") return;

              Object.entries(cupsPorRol).forEach(([rolKey, rolNode]) => {
                if (!rolNode || typeof rolNode !== "object") return;

                const cupsNodo = rolNode?.cups;
                if (!cupsNodo || typeof cupsNodo !== "object") return;

                Object.entries(cupsNodo).forEach(([cupId, cup]) => {
                  if (!cup || typeof cup !== "object") return;

                  cupsOut[String(cupId)] = {
                    ...cup,
                    actividadId: cup.actividadId ?? actividadId,
                    key: cup.key ?? rolKey,
                    nombreProf: cup.nombreProf ?? rolNode?.nombreProf ?? rolKey,
                  };
                });
              });
            });
          }

          return cupsOut;
        };

        let cupsPaciente = extraerCupsAsignaciones(asignacionesData || {});

        // Fallback: en algunos registros legacy la lectura puntual puede venir vacía,
        // pero el nodo global sí contiene la asignación.
        if (!Object.keys(cupsPaciente).length) {
          const asignacionesGlobal = await safeGet(`/Asignaciones.json`);
          const asignacionFallback = asignacionesGlobal?.[idEncuesta] || {};
          cupsPaciente = extraerCupsAsignaciones(asignacionFallback);
        }
        const tipoActividadActividades = actividadesData?.tipoActividad;
        const tipoActividadEncuesta = encuestaData?.tipoActividad;
        const tipoActividad = {
          ...(tipoActividadEncuesta && typeof tipoActividadEncuesta === "object"
            ? tipoActividadEncuesta
            : {}),
          ...(tipoActividadActividades && typeof tipoActividadActividades === "object"
            ? tipoActividadActividades
            : {}),
        };

        let resultData = {};

        // Estructurar los datos
        if (encuestaData) {
          resultData = {
            id: idEncuesta,
            ...encuestaData,
            cups: cupsPaciente,
            actividades: actividadesData || (Object.keys(tipoActividad).length ? { tipoActividad } : {}),
            tipoActividad,
          };
        }

        commit("setEncuesta", resultData);
        return resultData;
      } catch (error) {
        console.error("Error en getEncuestaById:", error);
        throw error;
      }
    },

    /**
     * Obtiene actividades por ID
     */
    getActividadesById: async ({ commit }, idEncuesta) => {
      try {
        const construirActividadesDesdeAsignaciones = (asignacion = {}) => {
          const cups = asignacion?.cups;
          const cupsLista = Array.isArray(cups)
            ? cups
            : (cups && typeof cups === "object" ? Object.values(cups) : []);

          const tipoActividad = {};
          cupsLista.forEach((cup) => {
            const actividadId = String(cup?.actividadId ?? cup?.idActividad ?? "").trim();
            if (!actividadId || tipoActividad[actividadId]) return;
            tipoActividad[actividadId] = { key: actividadId };
          });

          return Object.keys(tipoActividad).length ? { tipoActividad } : null;
        };

        let { data } = await realtime_api.get(`/Actividades/${idEncuesta}.json`);

        if (!data) {
          const { data: actividadesGlobal } = await realtime_api.get(`/Actividades.json`);
          if (actividadesGlobal && typeof actividadesGlobal === "object") {
            data = actividadesGlobal[String(idEncuesta)] || null;
          }
        }

        if (!data) {
          const { data: asignacionDirecta } = await realtime_api
            .get(`/Asignaciones/${idEncuesta}.json`, getNoCacheRequestConfig())
            .catch(() => ({ data: null }));

          data = construirActividadesDesdeAsignaciones(asignacionDirecta || {});
        }

        if (!data) {
          const { data: asignacionesGlobal } = await realtime_api
            .get(`/Asignaciones.json`, getNoCacheRequestConfig())
            .catch(() => ({ data: {} }));

          if (asignacionesGlobal && typeof asignacionesGlobal === "object") {
            data = construirActividadesDesdeAsignaciones(asignacionesGlobal[String(idEncuesta)] || {});
          }
        }

        commit("setActividades", data);
        return data;
      } catch (error) {
        console.error("Error en getActividadesById:", error);
        throw error;
      }
    },

    // ====================================================================
    // PACIENTES
    // ====================================================================

    /**
     * Obtiene datos de paciente por tipodoc y numdoc
     * Busca el paciente en Encuesta y luego carga datos relacionados
     */
    getAllByPacientesID: async ({ commit }, { tipodoc, numdoc }) => {
      try {
        const normalizarIdRelacion = (valor) => String(valor ?? "").trim();
        const extraerCupsAsignaciones = (asignaciones = {}) => {
          const cupsOut = {};

          const cupsDirectos = asignaciones?.cups;
          if (cupsDirectos && typeof cupsDirectos === "object") {
            Object.entries(cupsDirectos).forEach(([cupId, cup]) => {
              if (!cup || typeof cup !== "object") return;
              cupsOut[String(cupId)] = { ...cup };
            });
          }

          const tipoActividad = asignaciones?.tipoActividad;
          if (tipoActividad && typeof tipoActividad === "object") {
            Object.entries(tipoActividad).forEach(([actividadId, actividadNode]) => {
              if (!actividadNode || typeof actividadNode !== "object") return;

              const cupsPorRol = actividadNode?.cups;
              if (!cupsPorRol || typeof cupsPorRol !== "object") return;

              Object.entries(cupsPorRol).forEach(([rolKey, rolNode]) => {
                if (!rolNode || typeof rolNode !== "object") return;

                const cupsNodo = rolNode?.cups;
                if (!cupsNodo || typeof cupsNodo !== "object") return;

                Object.entries(cupsNodo).forEach(([cupId, cup]) => {
                  if (!cup || typeof cup !== "object") return;

                  cupsOut[String(cupId)] = {
                    ...cup,
                    actividadId: cup.actividadId ?? actividadId,
                    key: cup.key ?? rolKey,
                    nombreProf: cup.nombreProf ?? rolNode?.nombreProf ?? rolKey,
                  };
                });
              });
            });
          }

          return cupsOut;
        };

        const normalizarActividadesEncuesta = (actividadesEncuesta = {}, cupsAsignados = {}) => {
          const tipoActividad = actividadesEncuesta?.tipoActividad || actividadesEncuesta;
          const listaCups = Object.values(cupsAsignados || {}).filter(
            (cup) => cup && typeof cup === "object"
          );

          if (!tipoActividad || typeof tipoActividad !== "object") {
            const actividadesDerivadas = new Map();

            listaCups.forEach((cup) => {
              const actividadId = normalizarIdRelacion(cup?.actividadId ?? cup?.idActividad ?? "");
              if (!actividadId) return;

              const actual = actividadesDerivadas.get(actividadId) || {
                id: actividadId,
                sourceId: actividadId,
                key: actividadId,
                nombre: actividadId,
                asignaciones: [],
              };

              actual.asignaciones.push(cup);
              actividadesDerivadas.set(actividadId, actual);
            });

            return Array.from(actividadesDerivadas.values());
          }

          return Object.entries(tipoActividad)
            .filter(([, actividad]) => actividad && typeof actividad === "object")
            .map(([actividadId, actividad]) => {
              const sourceId = normalizarIdRelacion(actividadId);
              const actividadKey = normalizarIdRelacion(
                actividad.key ?? actividad.clave ?? actividad.actividadKey ?? actividad.actividadId
              );
              const referenciaActividad = actividadKey || sourceId;
              const idsActividad = new Set(
                [actividadKey, sourceId, referenciaActividad]
                  .map((valor) => normalizarIdRelacion(valor))
                  .filter(Boolean)
              );
              const asignacionesActividad = listaCups.filter((cup) => {
                const cupActividadId = normalizarIdRelacion(cup?.actividadId ?? cup?.idActividad ?? "");
                return cupActividadId && idsActividad.has(cupActividadId);
              });

              return {
                ...actividad,
                id: sourceId,
                sourceId,
                key: actividadKey,
                nombre:
                  actividad.nombre ||
                  actividad.descripcion ||
                  referenciaActividad ||
                  "Actividad",
                asignaciones: asignacionesActividad,
              };
            });
        };

        // Obtener todas las encuestas (contienen datos básicos del paciente)
        const paramsEncuesta = {
          numdoc,
        };

        if (String(tipodoc ?? "").trim()) {
          paramsEncuesta.tipodoc = String(tipodoc ?? "").trim();
        }

        const { data } = await realtime_api.get("/Encuesta.json", buildNoCacheRequestConfig(paramsEncuesta));

        if (!data || data === null) {
          commit("setDatosPaciente", []);
          return [];
        }

        const tipodocNormalizado = String(tipodoc ?? "").trim();
        const numdocNormalizado = String(numdoc ?? "").trim();

        // Convertir a array con IDs y buscar por numdoc (y tipodoc cuando se envía)
        const pacientesEncontrados = [];

        for (const [encuestaId, encuesta] of Object.entries(data)) {
          const tipodocEncuesta = String(encuesta?.tipodoc ?? "").trim();
          const numdocEncuesta = String(encuesta?.numdoc ?? "").trim();
          const coincideTipodoc = tipodocNormalizado
            ? tipodocEncuesta === tipodocNormalizado
            : true;

          if (coincideTipodoc && numdocEncuesta === numdocNormalizado) {
            pacientesEncontrados.push({
              id: encuestaId,
              ...encuesta,
            });
          }
        }

        if (pacientesEncontrados.length === 0) {
          commit("setDatosPaciente", []);
          return [];
        }

        // Para cada paciente encontrado, cargar datos relacionados
        const pacientesConDatos = await Promise.all(
          pacientesEncontrados.map(async (paciente) => {
            const encuestaId = paciente.id; // ID interno usado como parámetro

            try {
              const [caracterizacionResp, asignResp, actividadesResp] = await Promise.allSettled([
                caracterizacionApi.getByEncuestaId(encuestaId),
                realtime_api.get(`/Asignaciones/${encuestaId}.json`),
                realtime_api.get(`/Actividades/${encuestaId}.json`),
              ]);

              let caracterizacion = {};
              if (caracterizacionResp.status === "fulfilled") {
                caracterizacion = caracterizacionResp.value || {};
              } else if (caracterizacionResp.reason?.response?.status !== 404) {
                throw caracterizacionResp.reason;
              }

              const asignaciones = asignResp.status === "fulfilled" ? (asignResp.value.data || {}) : {};
              const cupsAsignados = extraerCupsAsignaciones(asignaciones);
              const seguimientoActividades = normalizarActividadesEncuesta(
                actividadesResp.status === "fulfilled" ? (actividadesResp.value.data || {}) : {},
                cupsAsignados
              );
              const asignacionesNormalizadas = {
                ...(asignaciones && typeof asignaciones === "object" ? asignaciones : {}),
                cups: cupsAsignados,
              };

              // Crear un nuevo objeto con todas las propiedades para garantizar reactividad
              const pacienteCompleto = {
                ...paciente,
                caracterizacion,
                asignaciones: asignacionesNormalizadas,
                cupsAsignados,
                seguimientoActividades,
              };
              return pacienteCompleto;
            } catch (err) {
              return paciente;
            }
          })
        );

        commit("setDatosPaciente", pacientesConDatos);
        return pacientesConDatos;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Obtiene datos de paciente por tipo, número y convenio (exclusivo E Basicos)
     */
    getAllByPacientesIDEB: async ({ commit }, { tipodoc, numdoc, convenio }) => {
      console.log("datos que entran EB - tipodoc, numdoc, convenio:", tipodoc, numdoc, convenio);
      try {
        // Obtener todas las encuestas
        const paramsEncuesta = {
          tipodoc: String(tipodoc ?? "").trim(),
          numdoc: String(numdoc ?? "").trim(),
          convenio: String(convenio ?? "").trim(),
        };

        const { data } = await realtime_api.get("/Encuesta.json", buildNoCacheRequestConfig(paramsEncuesta));

        if (!data || data === null) {
          console.log("No hay encuestas registradas");
          return [];
        }

        const tipodocNormalizado = String(tipodoc ?? "").trim();
        const numdocNormalizado = String(numdoc ?? "").trim();
        const convenioNormalizado = String(convenio ?? "").trim();

        // Buscar en las encuestas por tipodoc, numdoc y convenio
        const datospaciente = [];

        for (const [encuestaId, encuesta] of Object.entries(data)) {
          if (
            String(encuesta?.tipodoc ?? "").trim() === tipodocNormalizado &&
            String(encuesta?.numdoc ?? "").trim() === numdocNormalizado &&
            String(encuesta?.convenio ?? "").trim() === convenioNormalizado
          ) {
            datospaciente.push({
              id: encuestaId,
              ...encuesta,
            });
          }
        }

        commit("setDatosPaciente", datospaciente);
        return datospaciente;
      } catch (error) {
        console.error("Error en getAllByPacientesIDEB:", error);
        throw error;
      }
    },

    // ====================================================================
    // CARACTERIZACIÓN
    // ====================================================================

    /**
     * Guarda datos de caracterización
     */
    guardarCaracterizacion: async ({ commit }, entradasC) => {
      const caracterizacion = {
        estadoCaracterizacion: entradasC.estadoCaracterizacion,
        idEncuesta: entradasC.idEncuesta,
        convenio: entradasC.convenio,
        visita: entradasC.visita,
        tipovisita: entradasC.tipovisita,
        tipovivienda: entradasC.tipovivienda,
        EstActual_Iluminacion: entradasC.EstActual_Iluminacion,
        EstActual_Ventilacion: entradasC.EstActual_Ventilacion,
        EstActual_Paredes: entradasC.EstActual_Paredes,
        EstActual_Pisos: entradasC.EstActual_Pisos,
        EstActual_Techo: entradasC.EstActual_Techo,
        peso: entradasC.peso,
        talla: entradasC.talla,
        tensionSistolica: entradasC.tensionSistolica,
        tensionDiastolica: entradasC.tensionDiastolica,
        perimetroAbdominal: entradasC.perimetroAbdominal,
        perimetroBranquial: entradasC.perimetroBranquial,
        oximetria: entradasC.oximetria,
        temperatura: entradasC.temperatura,
        imc: entradasC.imc,
        clasificacionImc: entradasC.clasificacionImc,
        Oizquierdo: entradasC.Oizquierdo,
        Oderecho: entradasC.Oderecho,
        Evacunal: entradasC.Evacunal,
        seleccionadosServPublic: entradasC.seleccionadosServPublic,
        seleccionadosFactoresRiesgo: entradasC.seleccionadosFactoresRiesgo,
        seleccionadosPresenciaAnimales: entradasC.seleccionadosPresenciaAnimales,
        seleccionadosAntecedentes: entradasC.seleccionadosAntecedentes,
        grupoFamiliar: entradasC.grupoFamiliar,
        seleccionadosRiesgos: entradasC.seleccionadosRiesgos,
        detalleSedentarismo: entradasC.detalleSedentarismo,
        detalleConsumoAlcohol: entradasC.detalleConsumoAlcohol,
        detalleConsumoCigarrillo: entradasC.detalleConsumoCigarrillo,
        AlimentacionPocoSaludable: entradasC.AlimentacionPocoSaludable,
      };

      try {
        return await workflowApi.saveCaracterizacion(caracterizacion);
      } catch (error) {
        console.error("Error al guardar caracterización:", error);
        throw error;
      }
    },

    // ====================================================================
    // AGENDAS
    // ====================================================================

    /**
     * Guarda agenda de toma de muestras
     */
    guardarAgendaT: async ({ commit }, datos) => {
      if (
        !datos ||
        !datos.idAgenda ||
        !datos.idEncuesta ||
        !datos.fechaAgenda ||
        !datos.horalab ||
        !datos.grupo ||
        !datos.encuestador ||
        !datos.paciente ||
        !datos.barrio ||
        !datos.direccion
      ) {
        console.error("guardarAgendaT: Faltan datos obligatorios", datos);
        throw new Error(
          "Faltan datos obligatorios para guardar la agenda de toma de muestras"
        );
      }

      const agenda = {
        idAgenda: datos.idAgenda,
        idEncuesta: datos.idEncuesta,
        tomademuestras: {
          fechaAgenda: datos.fechaAgenda,
          horalab: datos.horalab,
          idEncuesta: datos.idEncuesta,
          grupo: datos.grupo,
          encuestador: datos.encuestador,
          paciente: datos.paciente,
          barrio: datos.barrio,
          direccion: datos.direccion,
        },
      };
      const key = agenda.idAgenda;

      try {
        const response = await realtime_api.get(`/agendas/${key}.json`);
        let tomademuestrasExistentes = [];
        let visitasExistentes = null;

        if (response.data && response.data.tomademuestras) {
          tomademuestrasExistentes = response.data.tomademuestras;
          if (!Array.isArray(tomademuestrasExistentes)) {
            tomademuestrasExistentes = [tomademuestrasExistentes];
          }
        }

        if (response.data && response.data.visitamedica) {
          visitasExistentes = Array.isArray(response.data.visitamedica)
            ? response.data.visitamedica
            : [response.data.visitamedica];
        }

        const existe = tomademuestrasExistentes.some(
          (item) =>
            item.horalab === agenda.tomademuestras.horalab &&
            item.paciente === agenda.tomademuestras.paciente &&
            item.idEncuesta === agenda.tomademuestras.idEncuesta
        );

        if (!existe) {
          tomademuestrasExistentes.push(agenda.tomademuestras);
        } else {
          console.warn("Cita de toma de muestras duplicada detectada, no se agrega.");
        }

        await realtime_api.put(`/agendas/${key}.json`, {
          idAgenda: agenda.idAgenda,
          idEncuesta: agenda.idEncuesta,
          fecha: agenda.tomademuestras.fechaAgenda,
          grupo: agenda.tomademuestras.grupo,
          tomademuestras: tomademuestrasExistentes,
          visitamedica: visitasExistentes,
        });
        console.log(response.data ? "Agenda actualizada:" : "Agenda creada:", key, tomademuestrasExistentes);

        await realtime_api.patch(`/Encuesta/${agenda.idEncuesta}.json`, {
          Agenda_tomademuestras: {
            cita_tomamuestras: true,
            idAgendaT: agenda.idAgenda,
          },
        });
        console.log(
          "Estado de toma de muestras actualizado en Encuesta:",
          agenda.idEncuesta
        );

        return {
          message: "Toma de muestras guardada y estado actualizado correctamente",
          agenda: agenda,
          tomademuestras: tomademuestrasExistentes,
        };
      } catch (error) {
        console.error(
          "Error al guardar toma de muestras y actualizar estado:",
          error,
          datos
        );
        throw error;
      }
    },

    /**
     * Guarda agenda de visita médica
     */
    guardarAgendaV: async ({ commit }, data) => {
      if (
        !data ||
        !data.idAgenda ||
        !data.idEncuesta ||
        !data.fechaAgenda ||
        !data.horavisita ||
        !data.grupo ||
        !data.encuestador ||
        !data.paciente ||
        !data.barrio ||
        !data.direccion
      ) {
        console.error("guardarAgendaV: Faltan datos obligatorios", data);
        throw new Error(
          "Faltan datos obligatorios para guardar la agenda de visita médica"
        );
      }

      const agenda = {
        idAgenda: data.idAgenda,
        idEncuesta: data.idEncuesta,
        visitamedica: {
          fechaAgenda: data.fechaAgenda,
          horavisita: data.horavisita,
          idEncuesta: data.idEncuesta,
          grupo: data.grupo,
          encuestador: data.encuestador,
          paciente: data.paciente,
          barrio: data.barrio,
          direccion: data.direccion,
        },
      };
      console.log("Estos son los datos de la agenda:", agenda.visitamedica);
      const key = agenda.idAgenda;

      try {
        const response = await realtime_api.get(`/agendas/${key}.json`);
        let visitamedicaExistentes = [];
        let tomademuestrasExistentes = null;

        if (response.data && response.data.visitamedica) {
          visitamedicaExistentes = response.data.visitamedica;
          if (!Array.isArray(visitamedicaExistentes)) {
            visitamedicaExistentes = [visitamedicaExistentes];
          }
        }

        if (response.data && response.data.tomademuestras) {
          tomademuestrasExistentes = Array.isArray(response.data.tomademuestras)
            ? response.data.tomademuestras
            : [response.data.tomademuestras];
        }

        const existe = visitamedicaExistentes.some(
          (item) =>
            item.horavisita === agenda.visitamedica.horavisita &&
            item.paciente === agenda.visitamedica.paciente &&
            item.idEncuesta === agenda.visitamedica.idEncuesta
        );

        if (!existe) {
          visitamedicaExistentes.push(agenda.visitamedica);
        } else {
          console.warn("Cita de visita médica duplicada detectada, no se agrega.");
        }

        await realtime_api.put(`/agendas/${key}.json`, {
          idAgenda: agenda.idAgenda,
          idEncuesta: agenda.idEncuesta,
          fecha: agenda.visitamedica.fechaAgenda,
          grupo: agenda.visitamedica.grupo,
          tomademuestras: tomademuestrasExistentes,
          visitamedica: visitamedicaExistentes,
        });
        console.log(
          response.data ? "Agenda de visita médica actualizada:" : "Agenda de visita médica creada:",
          key,
          visitamedicaExistentes
        );

        await realtime_api.patch(`/Encuesta/${agenda.idEncuesta}.json`, {
          Agenda_Visitamedica: {
            cita_visitamedica: true,
            idAgendaV: agenda.idAgenda,
          },
        });
        console.log(
          "Estado de visita médica actualizado en Encuesta:",
          agenda.idEncuesta
        );

        return {
          message: "Visita médica guardada y estado actualizado correctamente",
          agenda: agenda,
          visitamedica: visitamedicaExistentes,
        };
      } catch (error) {
        console.error("Error al guardar visita médica:", error, data);
        throw error;
      }
    },

    /**
     * Obtiene listado de agendas por fecha
     */
    getListAgendas: async ({ commit }, fecha) => {
      console.log("consultando agendas desde:", fecha);
      try {
        // Obtener todas las agendas y filtrar en el cliente
        const { data } = await realtime_api.get("/agendas.json");

        const agendas = data
          ? Object.entries(data)
            .map(([key, value]) => ({
              id: key,
              ...value,
            }))
            .filter((agenda) => agenda.fecha >= fecha)
            .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")))
          : [];

        commit("setAgendas", agendas);
        return agendas;
      } catch (error) {
        console.error("Error en getListagendas:", error);
        throw error;
      }
    },

    /**
     * Obtiene agendas de toma de laboratorio
     */
    getAgendasTomaLab: async ({ commit }, dataidlab) => {
      console.log("datos que entran", dataidlab);
      try {
        const { data } = await realtime_api.get("/agendas.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.tomademuestras &&
            encuesta.tomademuestras.dateIDlab &&
            encuesta.tomademuestras.dateIDlab.id === dataidlab
        );

        commit("setEncuestasfiltradas", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_getAgendasTomaLab:", error);
        throw error;
      }
    },

    /**
     * Obtiene agendas de toma de laboratorio por ID
     */
    getAgendasTomaLabById: async ({ commit }, { id }) => {
      console.log("datos que entran", id);
      try {
        const { data } = await realtime_api.get("/agendas.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => encuesta.id === id);

        commit("setEncuestaslabbyId", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAgendasLabById:", error);
        throw error;
      }
    },

    /**
     * Obtiene agendas de visita por ID
     */
    getAgendasVisitaById: async ({ commit }, { id }) => {
      console.log("datos que entran", id);
      try {
        const { data } = await realtime_api.get("/agendas.json");
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter((encuesta) => encuesta.id === id);

        commit("setEncuestasvisitaById", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAgendasVisitaById:", error);
        throw error;
      }
    },

    /**
     * Elimina una agenda
     */
    eliminarAgenda: async ({ commit }, { indice, encuestaID, lista }) => {
      console.log("Eliminando agenda con índice:", indice, "y encuestaID:", encuestaID);

      if (indice === undefined || indice === null || indice === "") {
        throw new Error("Índice inválido para eliminar");
      }
      if (!encuestaID) {
        throw new Error("encuestaID inválido para eliminar");
      }

      try {
        await realtime_api.delete(`/agendas/${encuestaID}/${lista}/${indice}.json`);
        console.log("Registro eliminado correctamente");
        return true;
      } catch (error) {
        console.error("Error en Action eliminarAgenda:", error);
        throw error;
      }
    },

    // ====================================================================
    // USUARIOS Y PROFESIONALES
    // ====================================================================

    /**
     * Crea un nuevo usuario
     */
    createUser: async ({ commit }, entradasU) => {
      try {
        const {
          bd,
          nombres,
          documento,
          email,
          cargo,
          password,
          estado,
          rol,
          grupo,
        } = entradasU;

        const DataToSaveE = {
          nombres,
          documento,
          email,
          cargo,
          password,
          estado,
          rol,
          grupo,
        };

        const Ruta = `/${bd}.json`;
        const { data } = await realtime_api.post(Ruta, DataToSaveE);
        return data;
      } catch (error) {
        console.error("Error en Action_createUser:", error);
        throw error;
      }
    },

    /**
     * Elimina un usuario
     */
    deleteUser: async ({ commit }, id) => {
      try {
        const { data } = await realtime_api.delete(`/usuarios/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action_deleteUser:", error);
        throw error;
      }
    },

    /**
     * Consulta usuarios del API
     */
    async consultarUsuariosApi({ commit }) {
      try {
        return await getAllUsers();
      } catch (error) {
        console.error("Error consultando usuarios:", error);
        throw error;
      }
    },

    /**
     * Obtiene médicos por grupo y convenio
     */
    getAllMedicosbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllMedicosbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const usuarios = await getAllUsers();
        const encuestasFiltradas = usuarios.filter(
          (u) => userBelongsToGroup(u.grupo, grupo) &&
            String(u.convenio || "") === String(convenio || "") &&
            String(u.cargo || "") === "Medico"
        );

        commit("setMedicosByGrupo", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAllMedicosbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Obtiene enfermeros por grupo y convenio
     */
    getAllEnfermerosbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllEnfermerosbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const usuarios = await getAllUsers();
        const encuestasFiltradas = usuarios.filter(
          (u) => userBelongsToGroup(u.grupo, grupo) &&
            String(u.convenio || "") === String(convenio || "") &&
            String(u.cargo || "") === "Enfermero"
        );

        commit("setEnfermerosByGrupo", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en getAllEnfermerosbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Obtiene psicólogos por grupo y convenio
     */
    getAllPsicologosbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllPsicologosbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const usuarios = await getAllUsers();
        const psicologosFiltrados = usuarios.filter(
          (u) => userBelongsToGroup(u.grupo, grupo) &&
            String(u.convenio || "") === String(convenio || "") &&
            String(u.cargo || "") === "Psicologo"
        );

        commit("setPsicologosByGrupo", psicologosFiltrados);
        return psicologosFiltrados;
      } catch (error) {
        console.error("Error en getAllPsicologosbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Obtiene trabajadores sociales por grupo y convenio
     */
    getAllTsocialesbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllTsocialesbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const usuarios = await getAllUsers();
        const tsocialesFiltrados = usuarios.filter(
          (u) => userBelongsToGroup(u.grupo, grupo) &&
            String(u.convenio || "") === String(convenio || "") &&
            String(u.cargo || "") === "Tsocial"
        );

        commit("setTsocialesByGrupo", tsocialesFiltrados);
        return tsocialesFiltrados;
      } catch (error) {
        console.error("Error en getAllTsocialesbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Obtiene nutricionistas por grupo y convenio
     */
    getAllNutricionistasbyGrupo: async ({ commit }, { grupo, convenio }) => {
      console.log("datos que entran en getAllNutricionistasbyGrupo - grupo:", grupo, "convenio:", convenio);
      try {
        const usuarios = await getAllUsers();
        const nutricionistasFiltrados = usuarios.filter(
          (u) => userBelongsToGroup(u.grupo, grupo) &&
            String(u.convenio || "") === String(convenio || "") &&
            String(u.cargo || "") === "Nutricionista"
        );

        commit("setNutricionistasByGrupo", nutricionistasFiltrados);
        return nutricionistasFiltrados;
      } catch (error) {
        console.error("Error en getAllNutricionistasbyGrupo:", error);
        throw error;
      }
    },

    /**
     * Resetea contraseña a valor por defecto
     */
    resetPassword: async ({ commit }, id) => {
      console.log("ID:", id);
      try {
        const { data } = await realtime_api.patch(`/usuarios/${id}.json`, {
          password: "12345",
        });
        return data;
      } catch (error) {
        console.error("Error en Action_updateUser:", error);
        throw error;
      }
    },

    /**
     * Establece nueva contraseña
     */
    NewPassword: async ({ commit }, { id, newPassword }) => {
      try {
        const { data } = await realtime_api.patch(`/usuarios/${id}.json`, {
          password: newPassword,
        });
        return data;
      } catch (error) {
        console.error("Error en Action_updateUser:", error);
        throw error;
      }
    },

    // ====================================================================
    // PARÁMETROS DEL SISTEMA
    // ====================================================================

    /**
     * Crea comuna y barrio
     */
    crearComunaBarrio: async ({ commit, state }, entradasC) => {
      try {
        const { bd, comuna, barrio } = entradasC;
        const ipsId = resolveCurrentIpsId(state.userData);

        const DataToSaveC = { comuna, barrio, ipsId };

        const Ruta = `/${bd}.json`;
        const { data } = await realtime_api.post(Ruta, DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_crearComunaBarrio:", error);
        throw error;
      }
    },

    /**
     * Obtiene todas las comunas y barrios
     */
    getAllComunaBarrios: async ({ commit }) => {
      try {
        const { data } = await realtime_api.get("/comunasybarrios.json");
        if (!data || typeof data !== "object") {
          commit("setComunasBarrios", []);
          return [];
        }
        const comunasBarrios = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        commit("setComunasBarrios", comunasBarrios);
        return comunasBarrios;
      } catch (error) {
        console.error("Error en Action_getAllComunaBarrios:", error);
        throw error;
      }
    },

    /**
     * Actualiza una comuna y barrio
     */
    actualizarComunaBarrio: async ({ commit, state }, { id, comuna, barrio }) => {
      try {
        if (!id) throw new Error("ID inválido para actualizar");
        const ipsId = resolveCurrentIpsId(state.userData);
        const DataToSaveC = { comuna, barrio, ipsId };
        const { data } = await realtime_api.put(`/comunasybarrios/${id}.json`, DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_actualizarComunaBarrio:", error);
        throw error;
      }
    },

    /**
     * Elimina comuna y barrio
     */
    deleteComunaBarrio: async ({ commit }, id) => {
      try {
        if (!id) throw new Error("ID inválido para eliminar");
        const { data } = await realtime_api.delete(`/comunasybarrios/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action deleteComunaBarrio:", error);
        throw error;
      }
    },

    /**
     * Crea EPS
     */
    crearEps: async ({ commit, state }, entradaseps) => {
      try {
        const { bd, eps } = entradaseps;
        const ipsId = resolveRequiredIpsId(state, "crear EPS");

        const DataToSaveC = { eps, ipsId };

        const Ruta = `/${bd}.json`;
        const { data } = await realtime_api.post(Ruta, DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_crearEps:", error);
        throw error;
      }
    },

    /**
     * Obtiene todas las EPS
     */
    getAllEps: async ({ commit }) => {
      try {
        const { data } = await realtime_api.get("/eps.json");
        if (!data || typeof data !== "object") {
          commit("setEps", []);
          return [];
        }
        const eps = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        commit("setEps", eps);
        return eps;
      } catch (error) {
        console.error("Error en Action_getAllEps:", error);
        throw error;
      }
    },

    /**
     * Obtiene todas las EPS (método alternativo)
     */
    getAllEpss: async ({ commit }) => {
      try {
        const { data } = await realtime_api.get("/eps.json");
        if (!data || typeof data !== "object") {
          commit("setEps", []);
          return [];
        }
        const eps = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        commit("setEps", eps);
        return eps;
      } catch (error) {
        console.error("Error en Action_getAllEps:", error);
        throw error;
      }
    },

    /**
     * Actualiza una EPS
     */
    actualizarEps: async ({ commit, state }, { id, eps }) => {
      try {
        if (!id) throw new Error("ID inválido para actualizar");
        const ipsId = resolveRequiredIpsId(state, "actualizar EPS");
        const DataToSave = { eps, ipsId };
        const { data } = await realtime_api.put(`/eps/${id}.json`, DataToSave);
        return data;
      } catch (error) {
        console.error("Error en Action_actualizarEps:", error);
        throw error;
      }
    },

    /**
     * Elimina EPS
     */
    deleteEps: async ({ commit }, id) => {
      try {
        if (!id) throw new Error("ID inválido para eliminar");
        const { data } = await realtime_api.delete(`/eps/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action deleteEps:", error);
        throw error;
      }
    },

    // ====================================================================
    // CONTRATOS - GESTIÓN
    // ====================================================================

    /**
     * Crea un nuevo contrato
     */
    crearContrato: async ({ commit, state }, contratoData) => {
      try {
        const { epsId, epsNombre, cups } = contratoData;
        const ipsId = resolveCurrentIpsId(state.userData);

        const DataToSave = {
          ipsId,
          epsId,
          epsNombre,
          cups,
          fechaCreacion: new Date().toISOString()
        };

        const { data } = await realtime_api.post("/contratos.json", DataToSave);
        return data;
      } catch (error) {
        console.error("Error en Action_crearContrato:", error);
        throw error;
      }
    },

    /**
     * Obtiene todos los contratos
     */
    getAllContratos: async ({ commit }) => {
      try {
        const { data } = await realtime_api.get("/contratos.json");
        if (!data) {
          commit("setContratos", []);
          return [];
        }
        const contratos = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        commit("setContratos", contratos);
        return contratos;
      } catch (error) {
        console.error("Error en Action_getAllContratos:", error);
        throw error;
      }
    },

    /**
     * Elimina un contrato
     */
    eliminarContrato: async ({ commit }, contratoId) => {
      try {
        if (!contratoId) throw new Error("ID inválido para eliminar");
        const { data } = await realtime_api.delete(`/contratos/${contratoId}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action_eliminarContrato:", error);
        throw error;
      }
    },

    /**
     * Actualiza un contrato existente
     */
    actualizarContrato: async ({ commit, state }, { contratoId, contratoData }) => {
      try {
        if (!contratoId) throw new Error("ID inválido para actualizar");
        const ipsId = resolveCurrentIpsId(state.userData);
        const payload = {
          ...(contratoData || {}),
          ipsId,
        };
        const { data } = await realtime_api.put(`/contratos/${contratoId}.json`, payload);
        return data;
      } catch (error) {
        console.error("Error en Action_actualizarContrato:", error);
        throw error;
      }
    },

    /**
     * Obtiene datos de IPS
     */
    getdataips: async ({ commit }, id) => {
      try {
        const idSolicitado = id !== undefined && id !== null && String(id).trim() !== ""
          ? String(id).trim()
          : null;

        let data = null;
        let idResuelto = idSolicitado;

        if (idSolicitado) {
          const respuesta = await realtime_api.get(`/ips/${idSolicitado}.json`);
          data = respuesta?.data || null;
        }

        // Si no existe el id solicitado, usar la primera IPS disponible.
        if (!data || Object.keys(data).length === 0) {
          const { data: mapaIps } = await realtime_api.get(`/ips.json`);
          if (mapaIps && typeof mapaIps === "object" && Object.keys(mapaIps).length > 0) {
            const [primerId, primerRegistro] = Object.entries(mapaIps)[0];
            idResuelto = String(primerId);
            data = primerRegistro || {};
          }
        }

        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          const payload = { id: idResuelto || String(id || ""), ...data };
          commit("setdatosips", payload);
          return payload;
        }

        commit("setdatosips", {});
        return {};
      } catch (error) {
        console.error("Error en Action_getdataips:", error);
        throw error;
      }
    },

    /**
     * Lista IPS disponibles
     */
    getAllDataIps: async () => {
      try {
        const { data } = await realtime_api.get(`/ips.json`);
        if (!data || typeof data !== "object") return [];

        return Object.entries(data)
          .map(([ipsId, datos]) => ({
            id: String(ipsId),
            ...(datos || {}),
          }))
          .sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || "")));
      } catch (error) {
        console.error("Error en Action_getAllDataIps:", error);
        throw error;
      }
    },

    /**
     * Crea o actualiza datos de IPS
     */
    guardarDataIps: async ({ dispatch, commit }, { id, datos }) => {
      try {
        const payload = {
          nombre: String(datos?.nombre || "").trim(),
          nit: String(datos?.nit || "").trim(),
          codHab: String(datos?.codHab || "").trim(),
          dpto: String(datos?.dpto || "").trim(),
          municipio: String(datos?.municipio || "").trim(),
        };

        if (!payload.nombre) {
          throw new Error("El nombre de la IPS es obligatorio.");
        }

        const targetId = id !== undefined && id !== null && String(id).trim() !== ""
          ? String(id).trim()
          : null;

        let idGuardado = targetId;

        if (targetId) {
          await realtime_api.put(`/ips/${targetId}.json`, payload);
        } else {
          const creado = await realtime_api.post(`/ips.json`, payload);
          idGuardado = String(creado?.data?.name || "").trim();
        }

        const recargado = await dispatch("getdataips", idGuardado || targetId);
        commit("setdatosips", recargado || { id: idGuardado || targetId || "", ...payload });

        return recargado || { id: idGuardado || targetId || "", ...payload };
      } catch (error) {
        console.error("Error en Action_guardarDataIps:", error);
        throw error;
      }
    },

    /**
     * Crea CUPS
     */
    crearCups: async ({ commit, state }, entradasCups) => {
      try {
        const { bd, nombre, codigo, profesional, grupo } = entradasCups;
        const ipsId = resolveCurrentIpsId(state.userData);

        const profesionales = Array.from(new Set(
          (Array.isArray(profesional) ? profesional : [profesional])
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        ));

        const DataToSaveC = {
          ipsId,
          DescripcionCUP: nombre,
          profesional: profesionales,
          codigo: codigo,
          Grupo: grupo || ""
        };

        const Ruta = `/${bd}.json`;
        const { data } = await realtime_api.post(Ruta, DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_crearCups:", error);
        throw error;
      }
    },

    /**
     * Edita CUPS
     */
    editarCups: async ({ commit, state }, entradasCups) => {
      try {
        const { bd, id, nombre, codigo, profesional, eps } = entradasCups;
        const ipsId = resolveCurrentIpsId(state.userData);

        if (!id) throw new Error("ID inválido para editar");

        const profesionales = Array.from(new Set(
          (Array.isArray(profesional) ? profesional : [profesional])
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        ));

        // Construir objeto con solo los campos que tienen valores
        const DataToSaveC = {
          ipsId,
          DescripcionCUP: nombre,
          codigo: codigo,
          profesional: profesionales,
        };

        // Agregar campos opcionales solo si tienen valores
        if (entradasCups.grupo) DataToSaveC.Grupo = entradasCups.grupo;
        if (eps && Array.isArray(eps) && eps.length > 0) DataToSaveC.Eps = eps;

        const Ruta = `/${bd}/${id}.json`;
        const { data } = await realtime_api.put(Ruta, DataToSaveC);
        console.log("CUPS editado exitosamente, datos guardados:", DataToSaveC);
        return data;
      } catch (error) {
        console.error("Error en Action_editarCups:", error);
        throw error;
      }
    },

    /**
     * Elimina un CUPS
     */
    eliminarCups: async ({ commit }, cupsId) => {
      try {
        if (!cupsId) throw new Error("ID inválido para eliminar");
        const { data } = await realtime_api.delete(`/cups/${cupsId}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action_eliminarCups:", error);
        throw error;
      }
    },

    /**
     * Agrega reserva
     */
    addreserva: async ({ commit }, entradasr) => {
      try {
        const { bd, fecha, grupo } = entradasr;

        const DataToSaver = { fecha, grupo };

        const Ruta = `/${bd}.json`;
        const { data } = await realtime_api.post(Ruta, DataToSaver);
        return data;
      } catch (error) {
        console.error("Error en Action_addreserva:", error);
        throw error;
      }
    },

    // ====================================================================
    // CUPS Y ACTIVIDADES
    // ====================================================================

    /**
     * Obtiene CUPS por actividad
     */
    selectCupsByActividad: async ({ commit }, { enc, act }) => {
      console.log("ejecutando procesos, esto entra ", enc, act);

      try {
        let ruta = `/cupsActividades/${enc}/tipoActividad/${act}.json`;

        const { data } = await realtime_api.get(ruta);
        commit("setCupsbyActividad", data);
        return data;
      } catch (error) {
        console.error("Error en Action_selectCupsByActividad:", error);
        throw error;
      }
    },

    /**
     * Obtiene CUPS asignados por actividad y rol
     */
    selectCupsAsignadosByActividad: async ({ commit }, { enc, act, rol }) => {
      try {
        if (!enc || !act || !rol) return null;
        const ruta = `/Asignaciones/${enc}/tipoActividad/${act}/cups/${rol}.json`;
        const { data } = await realtime_api.get(ruta);
        return data;
      } catch (error) {
        console.error("Error en Action_selectCupsAsignadosByActividad:", error);
        throw error;
      }
    },

    /**
     * Obtiene asignaciones de una encuesta
     */
    getAsignacionesByEncuesta: async ({ commit }, idEncuesta) => {
      try {
        if (!idEncuesta) return null;
        const ruta = `/Asignaciones/${idEncuesta}.json`;
        const { data } = await realtime_api.get(ruta);
        return data;
      } catch (error) {
        console.error("Error en Action_getAsignacionesByEncuesta:", error);
        return null;
      }
    },

    /**
     * Obtiene todas las actividades extra
     */
    getAllActividadesExtra: async ({ commit }) => {
      try {
        const { data } = await realtime_api.get("/actividadesExtra.json");

        // Manejar caso cuando no hay registros (data es null)
        if (!data || data === null) {
          commit("setActividadesExtra", []);
          return [];
        }

        // Mapear actividades extra
        const actividadesExtra = Object.entries(data)
          .filter(([key, value]) => {
            return value !== null &&
              typeof value === 'object' &&
              value.nombre;
          })
          .map(([key, value]) => ({
            id: key,
            key: String(value.key || value.clave || key || "").trim(),
            nombre: value.nombre || "",
            descripcion: value.descripcion || "",
            Profesional: value.Profesional || [],
          }));

        console.log("Actividades Extra cargadas correctamente:", actividadesExtra);
        commit("setActividadesExtra", actividadesExtra);
        return actividadesExtra;
      } catch (error) {
        console.error("Error en Action_getAllActividadesExtra:", error);
        // Si la tabla no existe, retornar array vacío
        commit("setActividadesExtra", []);
        return [];
      }
    },

    /**
     * Crea una actividad extra
     */
    crearActividadExtra: async ({ commit, state }, entradaActividad) => {
      try {
        const { key, nombre, descripcion, Profesional } = entradaActividad;
        const ipsId = resolveCurrentIpsId(state.userData);
        const dataToSave = {
          ipsId,
          key: key || "",
          nombre,
          descripcion: descripcion || "",
          Profesional: Array.isArray(Profesional) ? Profesional : [],
        };

        const { data } = await realtime_api.post("/actividadesExtra.json", dataToSave);
        return data;
      } catch (error) {
        console.error("Error en Action_crearActividadExtra:", error);
        throw error;
      }
    },

    /**
     * Actualiza una actividad extra
     */
    actualizarActividadExtra: async ({ commit, state }, { id, key, nombre, descripcion, Profesional }) => {
      try {
        if (!id) throw new Error("ID invalido para actualizar");
        const ipsId = resolveCurrentIpsId(state.userData);

        const dataToSave = {
          ipsId,
          key: key || "",
          nombre,
          descripcion: descripcion || "",
          Profesional: Array.isArray(Profesional) ? Profesional : [],
        };

        const { data } = await realtime_api.put(`/actividadesExtra/${id}.json`, dataToSave);
        return data;
      } catch (error) {
        console.error("Error en Action_actualizarActividadExtra:", error);
        throw error;
      }
    },

    /**
     * Elimina una actividad extra
     */
    deleteActividadExtra: async ({ commit }, id) => {
      try {
        if (!id) throw new Error("ID invalido para eliminar");
        const { data } = await realtime_api.delete(`/actividadesExtra/${id}.json`);
        return data;
      } catch (error) {
        console.error("Error en Action_deleteActividadExtra:", error);
        throw error;
      }
    },

    /**
     * Obtiene todos los CUPS
     */
    getAllCups: async ({ commit }) => {
      try {
        const { data } = await realtime_api.get("/cups.json");

        // Manejar caso cuando no hay registros (data es null)
        if (!data || data === null) {
          commit("setCups", []);
          return [];
        }

        // Mapear y filtrar solo registros válidos y completos
        const cups = Object.entries(data)
          .filter(([key, value]) => {
            // Filtrar registros null o incompletos
            return value !== null &&
              typeof value === 'object' &&
              (value.DescripcionCUP || value.codigo || value.profesional);
          })
          .map(([key, value]) => ({
            id: key,
            codigo: value.codigo || "",
            DescripcionCUP: value.DescripcionCUP || "",
            profesional: Array.from(new Set(
              (Array.isArray(value.profesional)
                ? value.profesional
                : (value.profesional ? [value.profesional] : []))
                .map((item) => String(item || "").trim())
                .filter(Boolean)
            )),
            Grupo: value.Grupo || value.grupo || value.group || "",
            Eps: Array.isArray(value.Eps) ? value.Eps : [],
          }));

        console.log("CUPS cargados correctamente:", cups);
        commit("setCups", cups);
        return cups;
      } catch (error) {
        console.error("Error en Action_getAllCups:", error);
        throw error;
      }
    },

    /**
     * Adiciona CUPS a una actividad
     */
    adicionarCups: async ({ commit }, entradasC) => {
      try {
        const {
          key,
          cups: nuevosCups,
          idEncuesta,
          nombreProf,
          nombrePtof,
          convenio,
        } = entradasC;

        if (!key) throw new Error("El identificador 'key' es obligatorio");
        if (!idEncuesta) throw new Error("El identificador 'idEncuesta' es obligatorio");

        const Ruta = `/Asignaciones/${idEncuesta}.json`;

        await realtime_api.patch(Ruta, {
          key,
          nombreProf: nombreProf ?? nombrePtof ?? "",
          nombrePtof: nombrePtof ?? nombreProf ?? "",
          idEncuesta,
          convenio: convenio ?? "",
        });

        for (const cup of Array.isArray(nuevosCups) ? nuevosCups : []) {
          const cupId = cup?.id || generarId();
          const cupKey = generarId();
          await realtime_api.patch(`/Asignaciones/${idEncuesta}/cups/${cupKey}.json`, {
            ...cup,
            id: cupId,
            cupsId: cup?.cupsId || cupId,
            convenio: cup?.convenio ?? convenio ?? "",
          });
        }

        const { data } = await realtime_api.get(Ruta);
        return data;
      } catch (error) {
        console.error("Error en Action_adicionarCups:", error);
        throw error;
      }
    },

    /**
     * Elimina un CUPS
     */
    deleteCUPS: async ({ commit }, { idEncuesta, idActividad, idCup, rol }) => {
      try {
        if (!idEncuesta || !idActividad) throw new Error("ID inválido para eliminar");
        const { data } = await realtime_api.delete(
          `/Asignaciones/${idEncuesta}/tipoActividad/${idActividad}/cups/${rol}/cups/${idCup}.json`
        );
        return data;
      } catch (error) {
        console.error("Error en Action deleteCUPS:", error);
        throw error;
      }
    },

    /**
     * Genera ID único
     */
    generarId() {
      return generarId();
    },

    // ====================================================================
    // FACTURACIÓN
    // ====================================================================

    /**
     * Aprovisiona paciente para facturación
     */
    aprovicionarP: async ({ commit }, data) => {
      const { idEnc, idProf } = data;
      try {
        const response = await realtime_api.patch(`/Encuesta/${data.idEnc}.json`, {
          asigfact: idProf,
          status_facturacion: false,
        });
        console.log("Paciente aprovisionado:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al aprovisionar paciente:", error);
        throw error;
      }
    },

    /**
     * Revierte aprovisionamiento de facturación
     */
    revertirAprovisionFacturacion: async ({ commit }, idEnc) => {
      try {
        const response = await realtime_api.patch(`/Encuesta/${idEnc}.json`, {
          asigfact: null,
          status_facturacion: false,
        });
        console.log("Aprovisionamiento revertido:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al revertir aprovisionamiento:", error);
        throw error;
      }
    },

    /**
     * Cierra la facturación de una encuesta
     */
    cerrarFacturacion: async ({ commit }, idEnc) => {
      try {
        const response = await realtime_api.patch(`/Encuesta/${idEnc}.json`, {
          status_facturacion: true,
          FechaFacturacion: new Date().toISOString(),
        });
        console.log("Facturación cerrada:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error al cerrar facturación:", error);
        throw error;
      }
    },

    /**
     * Asigna facturación a un CUPS
     */
    asigFacturacion: async ({ commit }, datafact) => {
      const {
        cup,
        idEncuesta,
        idFacturador,
        numFactura,
        cupId,
        facturado,
      } = datafact;

      const hoy = new Date();
      const fechaFacturacion = hoy.toISOString();

      const payloadCup = {
        ...(cup && typeof cup === "object" ? cup : {}),
        FactNum: numFactura,
        FactProf: idFacturador,
        facturado: facturado || true,
        fechaFacturacion: fechaFacturacion,
        fechaAsignacionFactura: fechaFacturacion,
      };

      await realtime_api.patch(
        `/Asignaciones/${idEncuesta}/cups/${cupId}.json`,
        payloadCup
      );
    },

    /**
     * Obtiene registros generales para facturación
     */
    GetRegistersbyRangeGeneralFact: async ({ commit }, parametros) => {
      try {
        const { finicial, ffinal, convenio } = parametros;
        const normalizarTexto = (valor) =>
          String(valor ?? "")
            .trim()
            .toLowerCase();

        const normalizarFechaSoloDia = (valor) => {
          if (valor === null || valor === undefined) {
            return null;
          }

          const raw = String(valor).trim();
          if (!raw) {
            return null;
          }

          // YYYY-MM-DD (o prefijo de ISO)
          const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (iso) {
            return `${iso[1]}-${iso[2]}-${iso[3]}`;
          }

          // DD/MM/YYYY o DD-MM-YYYY
          const latam = raw.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})/);
          if (latam) {
            return `${latam[3]}-${latam[2]}-${latam[1]}`;
          }

          const parsed = new Date(raw);
          if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().slice(0, 10);
          }

          return null;
        };

        const toDateStart = (yyyyMmDd) => {
          const parsed = new Date(`${yyyyMmDd}T00:00:00`);
          return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
        };

        const toDateEnd = (yyyyMmDd) => {
          const parsed = new Date(`${yyyyMmDd}T23:59:59.999`);
          return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
        };

        const inicio = String(finicial ?? "").trim();
        const fin = String(ffinal ?? "").trim();
        const convenioFiltro = normalizarTexto(convenio);

        if (!inicio || !fin) {
          console.warn("⚠️ Filtro inválido: fechas vacías en facturación");
          commit("setEncuestasFact", []);
          return [];
        }

        const inicioNormalizado = normalizarFechaSoloDia(inicio);
        const finNormalizado = normalizarFechaSoloDia(fin);
        const inicioTs = inicioNormalizado ? toDateStart(inicioNormalizado) : null;
        const finTs = finNormalizado ? toDateEnd(finNormalizado) : null;

        if (!inicioTs || !finTs) {
          console.warn("⚠️ Filtro inválido: no se pudieron normalizar las fechas del rango", {
            inicio,
            fin,
            inicioNormalizado,
            finNormalizado,
          });
          commit("setEncuestasFact", []);
          return [];
        }

        // Obtener actividades, encuestas y asignaciones (CUPS)
        const { data: actividades } = await realtime_api.get("/Actividades.json");
        const { data: encuestas } = await realtime_api.get("/Encuesta.json");
        const { data: asignaciones } = await realtime_api.get("/Asignaciones.json");

        if (!encuestas) {
          console.warn("⚠️ No hay datos en /Encuesta.json");
          commit("setEncuestasFact", []);
          return [];
        }

        const actividadesMap = actividades && typeof actividades === "object" ? actividades : {};

        // Mapear encuestas
        const encuestasMap = Object.entries(encuestas).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        // Función auxiliar para extraer convenio de CUPS
        const obtenerConvenioDelCUPS = (idEncuesta, encuestaBase = {}) => {
          if (!asignaciones || !asignaciones[idEncuesta]) {
            return normalizarTexto(encuestaBase?.convenio);
          }

          const asignacionData = asignaciones[idEncuesta];

          // Si la asignación tiene directamente convenio, usarlo
          if (asignacionData.convenio) {
            return normalizarTexto(asignacionData.convenio);
          }

          // Si tiene cups, extraer convenio del primer CUPS disponible
          if (asignacionData.cups && typeof asignacionData.cups === 'object') {
            const cupsArray = Object.values(asignacionData.cups);
            for (let cup of cupsArray) {
              if (cup && cup.convenio) {
                return normalizarTexto(cup.convenio);
              }
            }
          }

          return normalizarTexto(encuestaBase?.convenio);
        };

        // Filtrar directamente sobre encuestas; Actividades es dato opcional de apoyo.
        const resultados = [];
        encuestasMap.forEach((encuestaAsociada) => {
          const idActividad = encuestaAsociada?.id;
          if (!idActividad) {
            return;
          }

          const fechaBD = encuestaAsociada.fechagestEnfermera;
          const fechaBDSolo = normalizarFechaSoloDia(fechaBD);
          const fechaBdTs = fechaBDSolo ? toDateStart(fechaBDSolo) : null;

          // Obtener convenio del CUPS; fallback a convenio de la encuesta.
          const conveniodelCUPS = obtenerConvenioDelCUPS(idActividad, encuestaAsociada);

          const cumpleFecha =
            !!fechaBdTs && fechaBdTs >= inicioTs && fechaBdTs <= finTs;
          const cumpleConvenio =
            !convenioFiltro || conveniodelCUPS === convenioFiltro;
          const sinFacturar = encuestaAsociada.status_facturacion !== true;
          const noAsignado = !String(encuestaAsociada.asigfact ?? "").trim();

          if (cumpleFecha && sinFacturar && cumpleConvenio && noAsignado) {
            resultados.push({
              id: idActividad,
              ...encuestaAsociada,
              tipoActividad: actividadesMap[idActividad] || { tipoActividad: {} },
            });
          }
        });

        commit("setEncuestasFact", resultados);
        return resultados;
      } catch (error) {
        console.error("❌ Error en Action_GetRegistersbyRangeGeneralFact:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros para facturación por ID de paciente
     */
    GetRegistersbyRangeGeneralFactByID: async ({ commit }, parametros) => {
      try {
        const { data: actividades } = await realtime_api.get("/Actividades.json");
        const { data: encuestas } = await realtime_api.get("/Encuesta.json");

        const normalizarTexto = (valor) =>
          String(valor ?? "")
            .trim()
            .toLowerCase();

        const numdocBuscado = normalizarTexto(parametros?.numdoc);
        const tipodocBuscado = normalizarTexto(parametros?.tipodoc);

        if (!encuestas) {
          commit("setEncuestasFact", []);
          return [];
        }

        const actividadesMap = actividades && typeof actividades === "object" ? actividades : {};

        const encuestasMap = Object.entries(encuestas).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const resultados = [];
        encuestasMap.forEach((encuestaAsociada) => {
          const idActividad = encuestaAsociada?.id;
          if (!idActividad) {
            return;
          }

          const sinAsignar = !String(encuestaAsociada.asigfact ?? "").trim();

          if (
            normalizarTexto(encuestaAsociada?.numdoc) === numdocBuscado &&
            normalizarTexto(encuestaAsociada?.tipodoc) === tipodocBuscado &&
            sinAsignar
          ) {
            resultados.push({
              id: idActividad,
              ...encuestaAsociada,
              tipoActividad: actividadesMap[idActividad] || { tipoActividad: {} },
            });
          }
        });

        commit("setEncuestasFact", resultados);
        return resultados;
      } catch (error) {
        console.error("Error en Action_GetRegistersbyRangeGeneralFactByID:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros aprobados para facturación
     */
    GetRegistersbyRangeGeneralFactAprov: async ({ commit }, iduser) => {
      try {
        const { data: actividades } = await realtime_api.get("/Actividades.json");
        const { data: encuestas } = await realtime_api.get("/Encuesta.json");
        const { data: asignaciones } = await realtime_api.get("/Asignaciones.json");

        const idUsuarioNormalizado = normalizeComparableDocument(iduser);

        if (!encuestas) {
          commit("setEncuestasFactAprov", []);
          return [];
        }

        const actividadesMap = actividades && typeof actividades === "object" ? actividades : {};

        const encuestasMap = Object.entries(encuestas).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const resultados = [];
        encuestasMap.forEach((encuestaAsociada) => {
          const idActividad = encuestaAsociada?.id;
          if (!idActividad) {
            return;
          }

          const cups = asignaciones?.[idActividad]?.cups;
          const listaCups = cups && typeof cups === "object" ? Object.values(cups) : [];
          const coincideFacturadorPaciente =
            normalizeComparableDocument(encuestaAsociada?.asigfact ?? encuestaAsociada?.asig_fact) === idUsuarioNormalizado;
          const coincideFacturadorEnCups = listaCups.some((cup) => {
            return normalizeComparableDocument(cup?.FactProf ?? cup?.factProf ?? cup?.fact_prof) === idUsuarioNormalizado;
          });

          if (
            (coincideFacturadorPaciente || coincideFacturadorEnCups) &&
            encuestaAsociada.status_facturacion !== true
          ) {
            const allFacturasVacias = listaCups.length === 0 || listaCups.every(cup => {
              const fact = String(cup?.FactNum ?? "").trim();
              return !fact;
            });

            resultados.push({
              id: idActividad,
              ...encuestaAsociada,
              tipoActividad: actividadesMap[idActividad] || { tipoActividad: {} },
              allFacturasVacias,
            });
          }
        });

        commit("setEncuestasFactAprov", resultados);
        return resultados;
      } catch (error) {
        console.error("Error en Action_GetRegistersbyRangeGeneralFactAprov:", error);
        throw error;
      }
    },

    // ====================================================================
    // INFORMES Y REPORTES
    // ====================================================================

    /**
     * Obtiene registros por rango - General (Admin)
     */
    GetRegistersbyRangeGeneral: async ({ commit }, parametros) => {
      try {
        const { data } = await realtime_api.get("/Encuesta.json", getNoCacheRequestConfig());
        const encuestas = Object.entries(data || {}).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) => estaFechaEnRango(encuesta.fecha, parametros.finicial, parametros.ffinal)
        );

        commit("setEncuestasAdmin", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_GetRegistersbyRangeGeneral:", error);
        throw error;
      }
    },

    /**
     * Obtiene registros cerrados por rango (Admin)
     */
    GetRegistersbyRangeCerrados: async ({ commit }, parametros) => {
      try {
        const { data } = await realtime_api.get("/Encuesta.json", getNoCacheRequestConfig());
        const encuestas = Object.entries(data || {}).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            estaFechaEnRango(encuesta.fechagestEnfermera, parametros.finicial, parametros.ffinal) &&
            encuesta.status_gest_enfermera === true
        );

        commit("setEncuestasAdmin", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_GetRegistersbyRangeCerrados:", error);
        throw error;
      }
    },

    /**
     * Obtiene todos los registros por rango y profesional
     */
    GetAllRegistersbyRangeAndProf: async ({ commit }, parametros) => {
      try {
        const { data } = await realtime_api.get("/Encuesta.json", getNoCacheRequestConfig());
        const encuestas = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));

        const encuestasFiltradas = encuestas.filter(
          (encuesta) =>
            encuesta.fecha >= parametros.finicial &&
            encuesta.fecha <= parametros.ffinal &&
            (encuesta.idEnfermeroAtiende === parametros.idprof ||
              encuesta.idMedicoAtiende === parametros.idprof ||
              encuesta.idEncuestador === parametros.idprof)
        );

        commit("setEncuestasAdmin", encuestasFiltradas);
        return encuestasFiltradas;
      } catch (error) {
        console.error("Error en Action_GetAllRegistersbyRangeAndProf:", error);
        throw error;
      }
    },

    // ====================================================================
    // AUTENTICACIÓN
    // ====================================================================

    /**
     * Login de usuario
     */
    login({ commit }, { token, uid }) {
      commit("setToken", token);
      commit("setUid", uid);
      localStorage.setItem("token", token);
      localStorage.setItem("uid", uid);
    },

    /**
     * Logout de usuario
     */
    async userLogout({ commit }) {
      commit("CLEAR_ALL_STATE");
      // Limpiar solo datos de autenticación/sesión para evitar borrar configuraciones globales.
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      localStorage.removeItem("userData");
      sessionStorage.clear();
      commit("clearAuth");
      commit("clearUserData");
    },

    /**
     * Obtiene datos de usuario por UID
     */
    async fetchUserDataByUid({ commit }, uid) {
      try {
        const userData = await getUserById(uid);
        if (userData) {
          commit("setUserData", userData);
          localStorage.setItem("userData", JSON.stringify(userData));
        } else {
          console.log("No existe usuario para este UID");
          commit("clearUserData");
          localStorage.removeItem("userData");
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        commit("clearUserData");
        localStorage.removeItem("userData");
      }
    },

    /**
     * Elimina todas las actividades asociadas a un paciente
     * @param {string} pacienteId - ID del paciente
     */
    deleteActividadesByPacienteId: async ({ commit }, pacienteId) => {
      try {
        if (!pacienteId) {
          throw new Error("ID de paciente inválido");
        }

        console.log(`[deleteActividadesByPacienteId] Eliminando actividades para paciente: ${pacienteId}`);

        // Eliminar la rama completa de actividades para este paciente
        const { data } = await realtime_api.delete(`/Actividades/${pacienteId}.json`);

        console.log(`[deleteActividadesByPacienteId] Actividades eliminadas correctamente para paciente: ${pacienteId}`);
        return data;
      } catch (error) {
        console.error(`[deleteActividadesByPacienteId] Error: ${error.message}`);
        // No lanzar error para permitir continuidad en cascada
        return null;
      }
    },

    /**
     * Elimina todas las asignaciones asociadas a un paciente
     * @param {string} pacienteId - ID del paciente
     */
    deleteAsignacionesByPacienteId: async ({ commit }, pacienteId) => {
      try {
        if (!pacienteId) {
          throw new Error("ID de paciente inválido");
        }

        console.log(`[deleteAsignacionesByPacienteId] Eliminando asignaciones para paciente: ${pacienteId}`);

        // Eliminar la rama completa de asignaciones para este paciente
        const { data } = await realtime_api.delete(`/Asignaciones/${pacienteId}.json`);

        console.log(`[deleteAsignacionesByPacienteId] Asignaciones eliminadas correctamente para paciente: ${pacienteId}`);
        return data;
      } catch (error) {
        console.error(`[deleteAsignacionesByPacienteId] Error: ${error.message}`);
        // No lanzar error para permitir continuidad en cascada
        return null;
      }
    },
  },

  // ========================================================================
  // MUTATIONS
  // ========================================================================
  mutations: {
    // Actividades
    setActividades(state, actividades) {
      state.actividades = actividades;
    },

    setActividadesExtra(state, actividadesExtra) {
      state.actividadesExtra = actividadesExtra;
    },

    // Usuarios
    setUsuarios(state, usuarios) {
      state.usuarios = usuarios;
    },

    // Encuestas
    setEncuestas(state, encuestas) {
      state.encuestas = encuestas;
    },
    setEncuestasfiltradas(state, encuestasf) {
      state.encuestasFiltradas = encuestasf;
    },
    setEncuestasToday(state, encuestas) {
      state.encuestasToday = encuestas;
    },
    setEncuestaslabbyId(state, encuestas) {
      state.encuestasFiltradasLabById = encuestas;
    },
    setEncuestasvisitaById(state, encuestas) {
      state.encuestasFiltradasVisitaById = encuestas;
    },
    setEncuesta(state, encuesta) {
      if (encuesta && typeof encuesta === "object" && Object.keys(encuesta).length > 0) {
        state.InfoEncuestasById = [encuesta];
      } else {
        state.InfoEncuestasById = [];
      }
    },
    setcantEncuestas(state, cantidad) {
      state.cantEncuestas = cantidad;
    },
    setCantEncuestasEnProceso(state, count) {
      state.cantEncuestasEnProceso = count;
    },
    setEncuestasProf(state, encuestas) {
      state.EncuestasProf = encuestas;
    },
    setEncuestasAdmin(state, encuestas) {
      state.EncuestasAdmin = encuestas;
    },
    setEncuestasFact(state, encuestas) {
      state.EncuestasFact = encuestas;
    },
    setEncuestasFactAprov(state, encuestas) {
      state.EncuestasFactAprov = encuestas;
    },

    // Parámetros
    setComunasBarrios(state, comunasBarrios) {
      state.comunasBarrios = comunasBarrios;
    },
    setEps(state, eps) {
      state.epss = eps;
    },
    setdatosips(state, datosips) {
      state.dataips = datosips;
    },

    // Agendas
    setAgendas(state, agendas) {
      state.agendas = agendas;
    },

    // CUPS
    setCups(state, cups) {
      state.cups = cups;
    },
    setCupsbyActividad(state, cups) {
      state.cupsbyActividad = cups;
    },
    setContratos(state, contratos) {
      state.contratos = contratos;
    },

    // Profesionales
    setMedicosByGrupo(state, medicos) {
      state.medicosByGrupo = medicos;
    },
    setEnfermerosByGrupo(state, enfermeros) {
      state.enfermerosByGrupo = enfermeros;
    },
    setPsicologosByGrupo(state, psicologos) {
      state.psicologosByGrupo = psicologos;
    },
    setTsocialesByGrupo(state, tsociales) {
      state.tsocialesByGrupo = tsociales;
    },
    setNutricionistasByGrupo(state, nutricionistas) {
      state.nutricionistasByGrupo = nutricionistas;
    },

    // Pacientes
    setDatosPaciente(state, datos) {
      state.datosPaciente = datos;
    },

    // Autenticación
    setToken(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },
    setUid(state, uid) {
      state.uid = uid;
      if (uid) {
        localStorage.setItem("uid", uid);
      } else {
        localStorage.removeItem("uid");
      }
    },
    clearAuth(state) {
      state.token = null;
      state.uid = null;
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
    },
    setUserData(state, data) {
      state.userData = data;
      if (data) {
        localStorage.setItem("userData", JSON.stringify(data));
      } else {
        localStorage.removeItem("userData");
      }
    },
    clearUserData(state) {
      state.userData = {};
      localStorage.removeItem("userData");
    },
    CLEAR_ALL_STATE(state) {
      state.accessToken = null;
      state.userData = {};
    },
  },

  // ========================================================================
  // GETTERS
  // ========================================================================
  getters: {
    getUserData: (state) => state.userData,
    getAllEpss: (state) => state.epss,
    getInfoEncuestasById: (state) => state.InfoEncuestasById,
  },
});

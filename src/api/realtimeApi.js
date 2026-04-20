import axios from 'axios';
import {
    actividadesExtraApi,
    agendasApi,
    asignacionesApi,
    caracterizacionApi,
    comunasBarriosApi,
    contratosApi,
    cupsApi,
    encuestaActividadesApi,
    encuestasApi,
    epsApi,
    ipsApi,
} from './modulesApi';
import {
    createUser as createUserByApi,
    deleteUserById,
    getAllUsers,
    getUserById,
    updateUser,
    updateUserPasswordById,
} from './usersApi';

const realtime_api2 = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/realtime`,
    headers: {
        'Content-Type': 'application/json'
    }
});

const rawGet = realtime_api2.get.bind(realtime_api2);
const rawPost = realtime_api2.post.bind(realtime_api2);
const rawPut = realtime_api2.put.bind(realtime_api2);
const rawPatch = realtime_api2.patch.bind(realtime_api2);
const rawDelete = realtime_api2.delete.bind(realtime_api2);

function splitPath(url = '') {
    const clean = String(url || '').replace(/^\//, '').replace(/\.json$/, '');
    return clean.split('/').filter(Boolean);
}

function parseBarrioVeredaComuna(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        const barrio = String(value.barrio ?? value.Barrio ?? '').trim();
        const comuna = String(value.comuna ?? value.Comuna ?? '').trim();
        if (!barrio && !comuna) {
            return null;
        }
        return { barrio, comuna };
    }

    const raw = String(value).trim();
    if (!raw || raw === '[object Object]') {
        return null;
    }

    if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
        try {
            const parsed = JSON.parse(raw);
            return parseBarrioVeredaComuna(parsed);
        } catch {
            // Si no es JSON válido, continuar como texto plano.
        }
    }

    const groupedMatch = raw.match(/^(.*)\((.*)\)$/);
    if (groupedMatch) {
        return {
            barrio: String(groupedMatch[1] || '').trim(),
            comuna: String(groupedMatch[2] || '').trim(),
        };
    }

    return { barrio: raw, comuna: '' };
}

function serializeBarrioVeredaComuna(value) {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }

    if (typeof value === 'string') {
        const txt = value.trim();
        return txt && txt !== '[object Object]' ? txt : undefined;
    }

    const normalized = parseBarrioVeredaComuna(value);
    if (!normalized) {
        return undefined;
    }

    // Se guarda como JSON string en VARCHAR para preservar barrio y comuna.
    return JSON.stringify(normalized);
}

function parsePoblacionRiesgo(value) {
    if (value === null || value === undefined || value === '') {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    }

    const raw = String(value).trim();
    if (!raw || raw === '[object Object]') {
        return [];
    }

    if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
        try {
            return parsePoblacionRiesgo(JSON.parse(raw));
        } catch {
            // Si no es JSON valido, continuar con separadores de texto.
        }
    }

    if (raw.includes('|')) {
        return raw.split('|').map((item) => item.trim()).filter(Boolean);
    }

    if (raw.includes(',')) {
        return raw.split(',').map((item) => item.trim()).filter(Boolean);
    }

    return [raw];
}

function serializePoblacionRiesgo(value) {
    const items = parsePoblacionRiesgo(value);
    if (!items.length) {
        return undefined;
    }

    // Evita enviar arreglos al backend SQL y respeta el limite VARCHAR(100).
    let serialized = items.join(' | ');
    if (serialized.length <= 100) {
        return serialized;
    }

    const fitted = [];
    for (const item of items) {
        const next = fitted.length ? `${fitted.join(' | ')} | ${item}` : item;
        if (next.length > 100) {
            break;
        }
        fitted.push(item);
    }

    return fitted.length ? fitted.join(' | ') : items[0].slice(0, 100);
}

function toBooleanStatus(value) {
    if (value === true || value === false) {
        return value;
    }

    if (value === 1 || value === '1') {
        return true;
    }

    if (value === 0 || value === '0' || value === null || value === undefined || value === '') {
        return false;
    }

    const raw = String(value).trim().toLowerCase();
    if (['true', 'si', 'sí', 'yes'].includes(raw)) {
        return true;
    }
    if (['false', 'no'].includes(raw)) {
        return false;
    }

    return Boolean(value);
}

function normalizeStatusGestionLevel(value) {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    const raw = String(value).trim().toLowerCase();
    if (!raw) {
        return 0;
    }

    if (['true', 'si', 'sí', 'yes'].includes(raw)) {
        return 1;
    }

    if (['false', 'no'].includes(raw)) {
        return 0;
    }

    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
        if (parsed >= 2) return 2;
        if (parsed >= 1) return 1;
        return 0;
    }

    return Boolean(value) ? 1 : 0;
}

function buildEncuestasMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.id) {
            const barrioVeredaComuna = parseBarrioVeredaComuna(row.barrio_vereda_comuna ?? row.barrioVeredacomuna);
            out[row.id] = {
                ...row,
                idEncuestador: row.id_encuestador ?? row.idEncuestador,
                idMedicoAtiende: row.id_medico_atiende ?? row.idMedicoAtiende,
                idEnfermeroAtiende: row.id_enfermero_atiende ?? row.idEnfermeroAtiende,
                idPsicologoAtiende: row.id_psicologo_atiende ?? row.idPsicologoAtiende,
                idTsocialAtiende: row.id_tsocial_atiende ?? row.idTsocialAtiende,
                idNutricionistaAtiende: row.id_nutricionista_atiende ?? row.idNutricionistaAtiende ?? row.idNutriAtiende,
                idEncuesta: row.id_encuesta ?? row.idEncuesta,
                fechaNac: row.fecha_nac ?? row.fechaNac,
                barrioVeredacomuna: barrioVeredaComuna,
                poblacionRiesgo: parsePoblacionRiesgo(row.poblacion_riesgo ?? row.poblacionRiesgo),
                requiereRemision: row.requiere_remision ?? row.requiereRemision,
                fechavisita: row.fecha_visita ?? row.fechavisita,
                fechagestEnfermera: row.fecha_gest_enfermera ?? row.fechagestEnfermera,
                fechagestMedica: row.fecha_gest_medica ?? row.fechagestMedica,
                fechagestPsicologo: row.fecha_gest_psicologo ?? row.fechagestPsicologo,
                fechagestTsocial: row.fecha_gest_tsocial ?? row.fechagestTsocial,
                fechagestNutricionista: row.fecha_gest_nutricionista ?? row.fechagestNutricionista,
                fechagestAuxiliar: row.fecha_gest_auxiliar ?? row.fechagestAuxiliar,
                FechaFacturacion: row.fecha_facturacion ?? row.fechaFacturacion ?? row.FechaFacturacion,
                fechaFacturacion: row.fecha_facturacion ?? row.fechaFacturacion ?? row.FechaFacturacion,
                asigfact: row.asig_fact ?? row.asigfact,
                status_gest_aux: toBooleanStatus(row.status_gest_aux),
                status_gest_medica: toBooleanStatus(row.status_gest_medica),
                status_gest_enfermera: toBooleanStatus(row.status_gest_enfermera),
                status_gest_psicologo: toBooleanStatus(row.status_gest_psicologo),
                status_gest_tsocial: toBooleanStatus(row.status_gest_tsocial),
                status_gest_nutricionista: toBooleanStatus(row.status_gest_nutricionista ?? row.status_gest_nutri),
                status_gest_aux_valor: normalizeStatusGestionLevel(row.status_gest_aux),
                status_gest_medica_valor: normalizeStatusGestionLevel(row.status_gest_medica),
                status_gest_enfermera_valor: normalizeStatusGestionLevel(row.status_gest_enfermera),
                status_gest_psicologo_valor: normalizeStatusGestionLevel(row.status_gest_psicologo),
                status_gest_tsocial_valor: normalizeStatusGestionLevel(row.status_gest_tsocial),
                status_gest_nutricionista_valor: normalizeStatusGestionLevel(row.status_gest_nutricionista ?? row.status_gest_nutri),
                status_visita: toBooleanStatus(row.status_visita),
                status_caracterizacion: toBooleanStatus(row.status_caracterizacion),
                status_facturacion: toBooleanStatus(row.status_facturacion),
            };
        }
    });
    return out;
}

function buildActividadesMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (!row || !row.encuesta_id) {
            return;
        }

        if (!out[row.encuesta_id]) {
            out[row.encuesta_id] = { tipoActividad: {} };
        }

        out[row.encuesta_id].tipoActividad[String(row.id)] = {
            key: row.actividad_key,
        };
    });
    return out;
}

function buildActividadesNode(rows = []) {
    const map = buildActividadesMap(rows);
    const encuestaIds = Object.keys(map);
    if (!encuestaIds.length) {
        return null;
    }
    return map[encuestaIds[0]] || null;
}

function buildAsignacionesMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.encuesta_id) {
            out[row.encuesta_id] = toLegacyAsignacionPayload(row);
        }
    });
    return out;
}

function toLegacyAsignacionPayload(row = {}) {
    if (!row) {
        return {};
    }

    if (row.datos && typeof row.datos === 'object') {
        return row.datos;
    }

    return {
        key: row.key ?? row.key_ref ?? null,
        nombrePtof: row.nombrePtof ?? row.nombreProf ?? row.nombre_prof ?? null,
        convenio: row.convenio ?? null,
        idEncuesta: row.idEncuesta ?? row.encuesta_id ?? null,
        cups: row.cups ?? {},
    };
}

function toLegacyIpsPayload(row = {}) {
    if (!row) {
        return {};
    }

    const source = row.datos && typeof row.datos === 'object' ? row.datos : row;
    return {
        nombre: source.nombre ?? '',
        nit: source.nit ?? '',
        codHab: source.codHab ?? source.cod_hab ?? '',
        dpto: source.dpto ?? '',
        municipio: source.municipio ?? '',
    };
}

function toApiIpsPayload(data = {}) {
    const source = data && typeof data === 'object' && data.datos && typeof data.datos === 'object'
        ? data.datos
        : (data || {});

    return {
        nombre: String(source.nombre ?? '').trim(),
        nit: String(source.nit ?? '').trim(),
        codHab: String(source.codHab ?? source.cod_hab ?? '').trim(),
        dpto: String(source.dpto ?? '').trim(),
        municipio: String(source.municipio ?? '').trim(),
    };
}

function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(target, source) {
    if (!isObject(target) || !isObject(source)) {
        return source;
    }

    const output = { ...target };
    Object.keys(source).forEach((key) => {
        if (isObject(source[key]) && isObject(output[key])) {
            output[key] = deepMerge(output[key], source[key]);
        } else {
            output[key] = source[key];
        }
    });
    return output;
}

function getBySegments(obj, segments = []) {
    let current = obj;
    for (const segment of segments) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[segment];
    }
    return current;
}

function setBySegments(obj, segments = [], value = null) {
    if (!segments.length) {
        return value;
    }
    const output = isObject(obj) ? { ...obj } : {};
    let current = output;

    for (let i = 0; i < segments.length - 1; i += 1) {
        const segment = segments[i];
        const next = current[segment];
        current[segment] = isObject(next) ? { ...next } : {};
        current = current[segment];
    }

    current[segments[segments.length - 1]] = value;
    return output;
}

function deleteBySegments(obj, segments = []) {
    if (!isObject(obj) || !segments.length) {
        return obj;
    }

    const output = { ...obj };
    let current = output;

    for (let i = 0; i < segments.length - 1; i += 1) {
        const segment = segments[i];
        if (!isObject(current[segment])) {
            return output;
        }
        current[segment] = { ...current[segment] };
        current = current[segment];
    }

    delete current[segments[segments.length - 1]];
    return output;
}

function getCurrentUserIpsId() {
    try {
        const raw = localStorage.getItem('userData');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const value = parsed?.ipsId ?? parsed?.idips ?? parsed?.ips;
        const normalized = String(value ?? '').trim();
        return normalized || null;
    } catch {
        return null;
    }
}

function withCurrentIpsId(payload = {}) {
    const currentIpsId = getCurrentUserIpsId();
    const source = isObject(payload) ? { ...payload } : {};

    if (!currentIpsId) {
        return source;
    }

    if (source.ipsId || source.idips || source.ips_id) {
        return source;
    }

    return {
        ...source,
        ipsId: currentIpsId,
    };
}

function buildCaracterizacionMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (!row || !row.id) {
            return;
        }

        out[row.id] = {
            ...row,
            idEncuesta: row.encuesta_id ?? row.idEncuesta,
            tipovisita: row.tipo_visita ?? row.tipovisita,
            tipovivienda: row.tipo_vivienda ?? row.tipovivienda,
            EstActual_Iluminacion: row.est_iluminacion ?? row.EstActual_Iluminacion,
            EstActual_Ventilacion: row.est_ventilacion ?? row.EstActual_Ventilacion,
            EstActual_Paredes: row.est_paredes ?? row.EstActual_Paredes,
            EstActual_Pisos: row.est_pisos ?? row.EstActual_Pisos,
            EstActual_Techo: row.est_techo ?? row.EstActual_Techo,
            peso: row.peso,
            talla: row.talla,
            tensionSistolica: row.tension_sistolica ?? row.tensionSistolica,
            tensionDiastolica: row.tension_diastolica ?? row.tensionDiastolica,
            perimetroAbdominal: row.perimetro_abdominal ?? row.perimetroAbdominal,
            perimetroBranquial: row.perimetro_branquial ?? row.perimetroBranquial,
            oximetria: row.oximetria,
            temperatura: row.temperatura,
            imc: row.imc,
            clasificacionImc: row.clasificacion_imc ?? row.clasificacionImc,
            Oizquierdo: row.o_izquierdo ?? row.Oizquierdo,
            Oderecho: row.o_derecho ?? row.Oderecho,
            Evacunal: row.evacunal ?? row.Evacunal,
            seleccionadosServPublic: row.serv_publicos ?? row.seleccionadosServPublic,
            seleccionadosFactoresRiesgo: row.factores_riesgo ?? row.seleccionadosFactoresRiesgo,
            seleccionadosPresenciaAnimales: row.presencia_animales ?? row.seleccionadosPresenciaAnimales,
            seleccionadosAntecedentes: row.antecedentes ?? row.seleccionadosAntecedentes,
            seleccionadosRiesgos: row.riesgos ?? row.seleccionadosRiesgos,
        };
    });
    return out;
}

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
    };
}

function toBit(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    const raw = String(value).trim().toLowerCase();
    if (!raw) {
        return undefined;
    }

    if (['1', 'true', 'si', 'sí', 'yes'].includes(raw)) {
        return 1;
    }

    if (['0', 'false', 'no'].includes(raw)) {
        return 0;
    }

    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
        return parsed ? 1 : 0;
    }

    return undefined;
}

function toStatusGestValue(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    const raw = String(value).trim().toLowerCase();
    if (!raw) {
        return undefined;
    }

    if (['true', 'si', 'sí', 'yes'].includes(raw)) {
        return 1;
    }

    if (['false', 'no'].includes(raw)) {
        return 0;
    }

    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
        if (parsed >= 2) return 2;
        if (parsed >= 1) return 1;
        return 0;
    }

    return undefined;
}

function cleanObject(payload = {}) {
    const out = {};
    Object.entries(payload || {}).forEach(([key, value]) => {
        // Para devolver en facturación necesitamos enviar null explícito en asig_fact.
        if (value === null && key === 'asig_fact') {
            out[key] = null;
            return;
        }

        if (value === undefined || value === null) {
            return;
        }

        if (typeof value === 'string' && value.trim() === '') {
            return;
        }

        out[key] = value;
    });
    return out;
}

function normalizeDateValue(value) {
    if (value === undefined || value === null) {
        return undefined;
    }

    const raw = String(value).trim();
    if (!raw) {
        return undefined;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return raw;
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    return parsed.toISOString().slice(0, 10);
}

function normalizeDateTimeValue(value) {
    if (value === undefined || value === null) {
        return undefined;
    }

    const raw = String(value).trim();
    if (!raw) {
        return undefined;
    }

    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
        return raw.replace('T', ' ');
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }

    return parsed.toISOString().slice(0, 19).replace('T', ' ');
}

function toApiEncuesta(payload = {}) {
    const mapped = {
        id: payload.id,
        tiporegistro: payload.tiporegistro ?? payload.tipoRegistro,
        idEncuestador: payload.idEncuestador ?? payload.id_encuestador,
        idMedicoAtiende: payload.idMedicoAtiende ?? payload.id_medico_atiende,
        idEnfermeroAtiende: payload.idEnfermeroAtiende ?? payload.id_enfermero_atiende,
        idPsicologoAtiende: payload.idPsicologoAtiende ?? payload.id_psicologo_atiende,
        idTsocialAtiende: payload.idTsocialAtiende ?? payload.id_tsocial_atiende,
        idNutricionistaAtiende: payload.idNutricionistaAtiende ?? payload.idNutriAtiende ?? payload.id_nutricionista_atiende,
        convenio: payload.convenio,
        eps: payload.eps,
        regimen: payload.regimen,
        grupo: payload.grupo,
        idEncuesta: payload.idEncuesta ?? payload.id_encuesta,
        nombre1: payload.nombre1,
        nombre2: payload.nombre2,
        apellido1: payload.apellido1,
        apellido2: payload.apellido2,
        tipodoc: payload.tipodoc,
        numdoc: payload.numdoc,
        sexo: payload.sexo,
        fechaNac: normalizeDateValue(payload.fechaNac ?? payload.fecha_nac),
        direccion: payload.direccion,
        telefono: payload.telefono,
        barrioVeredacomuna: serializeBarrioVeredaComuna(payload.barrioVeredacomuna ?? payload.barrio_vereda_comuna),
        desplazamiento: payload.desplazamiento,
        poblacionRiesgo: serializePoblacionRiesgo(payload.poblacionRiesgo ?? payload.poblacion_riesgo),
        requiereRemision: payload.requiereRemision ?? payload.requiere_remision,
        fecha: normalizeDateValue(payload.fecha),
        fechavisita: normalizeDateValue(payload.fechavisita ?? payload.fecha_visita),
        status_gest_aux: toStatusGestValue(payload.status_gest_aux),
        status_gest_medica: toStatusGestValue(payload.status_gest_medica),
        status_gest_enfermera: toStatusGestValue(payload.status_gest_enfermera),
        status_gest_psicologo: toStatusGestValue(payload.status_gest_psicologo),
        status_gest_tsocial: toStatusGestValue(payload.status_gest_tsocial),
        status_gest_nutricionista: toStatusGestValue(payload.status_gest_nutricionista ?? payload.status_gest_nutri),
        status_visita: toBit(payload.status_visita),
        status_caracterizacion: toBit(payload.status_caracterizacion),
        status_facturacion: toBit(payload.status_facturacion),
        fechagestEnfermera: normalizeDateTimeValue(payload.fechagestEnfermera ?? payload.fecha_gest_enfermera),
        fechagestMedica: normalizeDateTimeValue(payload.fechagestMedica ?? payload.fecha_gest_medica),
        fechagestPsicologo: normalizeDateTimeValue(payload.fechagestPsicologo ?? payload.fecha_gest_psicologo),
        fechagestTsocial: normalizeDateTimeValue(payload.fechagestTsocial ?? payload.fecha_gest_tsocial),
        fechagestNutricionista: normalizeDateTimeValue(payload.fechagestNutricionista ?? payload.fecha_gest_nutricionista),
        fechagestAuxiliar: normalizeDateTimeValue(payload.fechagestAuxiliar ?? payload.fecha_gest_auxiliar),
        fechaFacturacion: normalizeDateTimeValue(payload.fechaFacturacion ?? payload.FechaFacturacion ?? payload.fecha_facturacion),
        asig_fact: payload.asig_fact ?? payload.asigfact,
        agendaTomamuestra: payload.agendaTomamuestra ?? payload.Agenda_tomademuestras ?? payload.agenda_tomamuestra,
        agendaVisitaMedica: payload.agendaVisitaMedica ?? payload.Agenda_Visitamedica ?? payload.agenda_visita_medica,
    };

    return cleanObject(mapped);
}

function fromApiAgenda(row = {}) {
    return {
        id: row.id,
        idAgenda: row.id,
        idEncuesta: row.encuesta_id,
        fecha: row.fecha,
        grupo: row.grupo,
        tomademuestras: row.toma_muestras ?? null,
        visitamedica: row.visita_medica ?? null,
    };
}

function toApiAgenda(id, payload = {}, currentApi = null) {
    const currentLegacy = currentApi ? fromApiAgenda(currentApi) : {};
    const merged = {
        ...currentLegacy,
        ...payload,
        id: id || payload.id || payload.idAgenda || currentLegacy.id,
        idAgenda: id || payload.id || payload.idAgenda || currentLegacy.id,
        idEncuesta: payload.idEncuesta ?? payload.encuesta_id ?? currentLegacy.idEncuesta,
    };

    return {
        id: merged.id,
        encuestaId: merged.idEncuesta,
        fecha: merged.fecha
            ?? (Array.isArray(merged.tomademuestras) ? merged.tomademuestras[0]?.fechaAgenda : merged.tomademuestras?.fechaAgenda)
            ?? (Array.isArray(merged.visitamedica) ? merged.visitamedica[0]?.fechaAgenda : merged.visitamedica?.fechaAgenda)
            ?? null,
        grupo: merged.grupo
            ?? (Array.isArray(merged.tomademuestras) ? merged.tomademuestras[0]?.grupo : merged.tomademuestras?.grupo)
            ?? (Array.isArray(merged.visitamedica) ? merged.visitamedica[0]?.grupo : merged.visitamedica?.grupo)
            ?? null,
        tomaMuestras: merged.tomademuestras ?? null,
        visitaMedica: merged.visitamedica ?? null,
    };
}

function buildAgendasMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.id) {
            out[row.id] = fromApiAgenda(row);
        }
    });
    return out;
}

function buildComunasBarriosMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.id) {
            out[row.id] = {
                comuna: row.comuna ?? '',
                barrio: row.barrio ?? '',
            };
        }
    });
    return out;
}

function buildEpsMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.id) {
            out[row.id] = {
                eps: row.eps ?? '',
            };
        }
    });
    return out;
}

function fromApiContrato(row = {}) {
    return {
        epsId: row.eps_id ?? row.epsId ?? null,
        epsNombre: row.eps_nombre ?? row.epsNombre ?? '',
        cups: row.cups ?? [],
        fechaCreacion: row.fecha_creacion ?? row.fechaCreacion ?? null,
    };
}

function toApiContrato(payload = {}, id = null) {
    return {
        id: id || payload.id,
        ipsId: payload.ipsId ?? payload.ips_id ?? null,
        epsId: payload.epsId ?? payload.eps_id ?? null,
        epsNombre: payload.epsNombre ?? payload.eps_nombre ?? '',
        cups: payload.cups ?? [],
        fechaCreacion: payload.fechaCreacion ?? payload.fecha_creacion ?? null,
    };
}

function buildContratosMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.id) {
            out[row.id] = fromApiContrato(row);
        }
    });
    return out;
}

function fromApiCup(row = {}) {
    const profesionales = Array.from(new Set(
        (Array.isArray(row.profesional)
            ? row.profesional
            : (Array.isArray(row.roles)
                ? row.roles
                : (Array.isArray(row.Roles)
                    ? row.Roles
                    : (row.profesional ? [row.profesional] : []))))
            .map((item) => String(item || '').trim())
            .filter(Boolean)
    ));

    return {
        codigo: row.codigo ?? '',
        DescripcionCUP: row.descripcion_cup ?? row.DescripcionCUP ?? '',
        profesional: profesionales,
        Grupo: row.grupo ?? row.Grupo ?? '',
        Eps: Array.isArray(row.eps_ids) ? row.eps_ids : (Array.isArray(row.Eps) ? row.Eps : []),
    };
}

function toApiCup(payload = {}, id = null) {
    const profesionales = Array.from(new Set(
        (Array.isArray(payload.profesional)
            ? payload.profesional
            : (Array.isArray(payload.roles)
                ? payload.roles
                : (Array.isArray(payload.Roles)
                    ? payload.Roles
                    : (payload.profesional ? [payload.profesional] : []))))
            .map((item) => String(item || '').trim())
            .filter(Boolean)
    ));

    return {
        id: id || payload.id,
        ipsId: payload.ipsId ?? payload.ips_id ?? null,
        codigo: payload.codigo ?? '',
        descripcion_cup: payload.descripcion_cup ?? payload.DescripcionCUP ?? payload.nombre ?? '',
        profesional: profesionales[0] ?? '',
        grupo: payload.grupo ?? payload.Grupo ?? '',
        roles: profesionales,
        eps_ids: Array.isArray(payload.eps_ids) ? payload.eps_ids : (Array.isArray(payload.Eps) ? payload.Eps : []),
    };
}

function buildCupsMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.id) {
            out[row.id] = fromApiCup(row);
        }
    });
    return out;
}

function fromApiActividadExtra(row = {}) {
    return {
        key: row.clave ?? row.key ?? '',
        nombre: row.nombre ?? '',
        descripcion: row.descripcion ?? '',
        Profesional: Array.isArray(row.profesionales)
            ? row.profesionales
            : (Array.isArray(row.Profesional) ? row.Profesional : []),
    };
}

function toApiActividadExtra(payload = {}, id = null) {
    return {
        id: id || payload.id,
        ipsId: payload.ipsId ?? payload.ips_id ?? null,
        clave: payload.clave ?? payload.key ?? '',
        nombre: payload.nombre ?? '',
        descripcion: payload.descripcion ?? '',
        profesionales: Array.isArray(payload.profesionales)
            ? payload.profesionales
            : (Array.isArray(payload.Profesional) ? payload.Profesional : []),
    };
}

function buildActividadesExtraMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.id) {
            out[row.id] = fromApiActividadExtra(row);
        }
    });
    return out;
}

function fromApiUser(row = {}) {
    return {
        uid: row.id,
        id: row.id,
        ipsId: row.ipsId ?? row.idips ?? row.ips_id ?? null,
        nombres: row.nombre ?? row.nombres ?? '',
        documento: row.numDocumento ?? row.documento ?? '',
        email: row.email ?? '',
        cargo: row.cargo ?? '',
        estado: row.activo ?? row.estado ?? true,
        grupo: row.grupo ?? '',
        convenio: row.convenio ?? null,
    };
}

function toApiUser(payload = {}) {
    const estado = payload.estado;
    const activo = typeof estado === 'boolean'
        ? estado
        : !['false', '0', 'inactivo', 'inactive'].includes(String(estado ?? '').trim().toLowerCase());

    return {
        nombre: payload.nombre ?? payload.nombres ?? '',
        numDocumento: payload.numDocumento ?? payload.documento ?? null,
        email: payload.email ?? '',
        cargo: payload.cargo ?? payload.rol ?? '',
        ipsId: payload.ipsId ?? payload.idips ?? payload.ips ?? null,
        password: payload.password,
        grupo: payload.grupo ?? '',
        convenio: payload.convenio ?? null,
        activo,
    };
}

function buildUsersMap(rows = []) {
    const out = {};
    rows.forEach((row) => {
        if (row && row.id) {
            out[row.id] = fromApiUser(row);
        }
    });
    return out;
}

function resolveCupsByActividad(datosAsignaciones, actividadId = null) {
    const cupsRaw = datosAsignaciones?.cups;
    if (!cupsRaw) {
        return actividadId ? [] : {};
    }

    const cupsArray = Array.isArray(cupsRaw)
        ? cupsRaw
        : (typeof cupsRaw === 'object'
            ? Object.entries(cupsRaw).map(([rowKey, cup]) => (
                cup && typeof cup === 'object'
                    ? { ...cup, _rowKey: cup._rowKey ?? rowKey }
                    : cup
            ))
            : []);

    if (actividadId) {
        return cupsArray.filter((cup) => cup && String(cup.actividadId) === String(actividadId));
    }

    const grouped = {};
    cupsArray.forEach((cup) => {
        if (!cup) {
            return;
        }
        const key = String(cup.actividadId ?? 'sin-actividad');
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(cup);
    });

    return grouped;
}

realtime_api2.get = async (url, config) => {
    const segments = splitPath(url);
    const [root, id, ...rest] = segments;

    if (root === 'Encuesta') {
        if (!id) {
            const rows = await encuestasApi.list({ limit: 5000, offset: 0 });
            return { data: buildEncuestasMap(rows) };
        }
        const row = await encuestasApi.getById(id);
        const mapped = buildEncuestasMap([row]);
        return { data: mapped[id] || null };
    }

    if (root === 'Actividades') {
        if (!id) {
            const rows = await encuestaActividadesApi.list({ limit: 10000, offset: 0 });
            const map = buildActividadesMap(rows);
            return { data: map };
        }
        const rows = await encuestaActividadesApi.list({ encuestaId: id, limit: 200, offset: 0 });
        const encuestaNode = buildActividadesNode(rows) || { tipoActividad: {} };
        if (!rest.length) {
            return { data: rows.length ? encuestaNode : null };
        }
        const nested = getBySegments(encuestaNode, rest);
        return { data: nested === undefined ? null : nested };
    }

    if (root === 'Asignaciones') {
        if (!id) {
            const rows = await asignacionesApi.list({ limit: 5000, offset: 0 });
            const map = buildAsignacionesMap(rows);
            return { data: map };
        }

        const row = await asignacionesApi.getById(id).catch(() => null);
        const mapped = row ? toLegacyAsignacionPayload(row) : null;

        if (!rest.length) {
            return { data: mapped };
        }

        const nested = getBySegments(mapped || {}, rest);
        return { data: nested === undefined ? null : nested };
    }

    if (root === 'caracterizacion') {
        if (!id) {
            const rows = await caracterizacionApi.list({ limit: 5000, offset: 0 });
            return { data: buildCaracterizacionMap(rows) };
        }

        const row = await caracterizacionApi.getById(id);
        const mapped = buildCaracterizacionMap([row]);
        if (!rest.length) {
            return { data: mapped[id] || null };
        }
        const nested = getBySegments(mapped[id] || {}, rest);
        return { data: nested === undefined ? null : nested };
    }

    if (root === 'agendas') {
        if (!id) {
            const rows = await agendasApi.list({ limit: 5000, offset: 0 });
            return { data: buildAgendasMap(rows) };
        }

        const row = await agendasApi.getById(id).catch(() => null);
        if (!row) {
            return { data: null };
        }

        const mapped = fromApiAgenda(row);
        if (!rest.length) {
            return { data: mapped };
        }
        const nested = getBySegments(mapped, rest);
        return { data: nested === undefined ? null : nested };
    }

    if (root === 'comunasybarrios') {
        if (!id) {
            const rows = await comunasBarriosApi.list({ limit: 5000, offset: 0 });
            return { data: buildComunasBarriosMap(rows) };
        }
        const row = await comunasBarriosApi.getById(id).catch(() => null);
        return { data: row ? { comuna: row.comuna ?? '', barrio: row.barrio ?? '' } : null };
    }

    if (root === 'eps') {
        if (!id) {
            const rows = await epsApi.list({ limit: 5000, offset: 0 });
            return { data: buildEpsMap(rows) };
        }
        const row = await epsApi.getById(id).catch(() => null);
        return { data: row ? { eps: row.eps ?? '' } : null };
    }

    if (root === 'contratos') {
        if (!id) {
            const rows = await contratosApi.list({ limit: 5000, offset: 0 });
            return { data: buildContratosMap(rows) };
        }
        const row = await contratosApi.getById(id).catch(() => null);
        return { data: row ? fromApiContrato(row) : null };
    }

    if (root === 'cups') {
        if (!id) {
            const rows = await cupsApi.list({ limit: 5000, offset: 0 });
            return { data: buildCupsMap(rows) };
        }
        const row = await cupsApi.getById(id).catch(() => null);
        return { data: row ? fromApiCup(row) : null };
    }

    if (root === 'ips') {
        if (!id) {
            const rows = await ipsApi.list({ limit: 5000, offset: 0 });
            const out = {};
            rows.forEach((row) => {
                if (row && row.id) {
                    out[row.id] = toLegacyIpsPayload(row);
                }
            });
            return { data: out };
        }

        const row = await ipsApi.getById(id).catch(() => null);
        return { data: row ? toLegacyIpsPayload(row) : null };
    }

    if (root === 'actividadesExtra') {
        if (!id) {
            const rows = await actividadesExtraApi.list({ limit: 5000, offset: 0 });
            return { data: buildActividadesExtraMap(rows) };
        }
        const row = await actividadesExtraApi.getById(id).catch(() => null);
        return { data: row ? fromApiActividadExtra(row) : null };
    }

    if (root === 'usuarios') {
        if (!id) {
            const rows = await getAllUsers();
            return { data: buildUsersMap(rows) };
        }

        const row = await getUserById(id).catch(() => null);
        if (!row) {
            return { data: null };
        }

        const mapped = fromApiUser(row);
        if (!rest.length) {
            return { data: mapped };
        }

        const nested = getBySegments(mapped, rest);
        return { data: nested === undefined ? null : nested };
    }

    if (root === 'cupsActividades' && id) {
        const asignacion = await asignacionesApi.getById(id).catch(() => null);
        if (!asignacion) {
            return { data: null };
        }

        const datosAsignacion = toLegacyAsignacionPayload(asignacion);

        if (rest[0] === 'tipoActividad' && rest[1]) {
            return { data: resolveCupsByActividad(datosAsignacion, rest[1]) };
        }

        return { data: resolveCupsByActividad(datosAsignacion, null) };
    }

    return rawGet(url, config);
};

realtime_api2.post = async (url, data, config) => {
    const segments = splitPath(url);
    const [root, id, child] = segments;

    if (root === 'Encuesta' && !id) {
        const created = await encuestasApi.create(toApiEncuesta(withCurrentIpsId(data || {})));
        return { data: { name: created?.id } };
    }

    if (root === 'Actividades' && id && child === 'tipoActividad') {
        const created = await encuestaActividadesApi.create(withCurrentIpsId({
            encuestaId: id,
            actividadKey: data?.key || null,
        }));
        return { data: { name: created?.id } };
    }

    if (root === 'caracterizacion' && !id) {
        const created = await caracterizacionApi.create(toApiCaracterizacion(withCurrentIpsId(data || {})));
        return { data: { name: created?.id } };
    }

    if (root === 'agendas' && !id) {
        const created = await agendasApi.create(withCurrentIpsId({
            id: data?.id ?? data?.idAgenda,
            encuestaId: data?.idEncuesta ?? null,
            fecha: data?.fecha ?? null,
            grupo: data?.grupo ?? null,
            tomaMuestras: data?.tomademuestras ?? null,
            visitaMedica: data?.visitamedica ?? null,
        }));
        return { data: { name: created?.id } };
    }

    if (root === 'comunasybarrios' && !id) {
        const created = await comunasBarriosApi.create(withCurrentIpsId({ comuna: data?.comuna ?? '', barrio: data?.barrio ?? '' }));
        return { data: { name: created?.id } };
    }

    if (root === 'eps' && !id) {
        const created = await epsApi.create(withCurrentIpsId({ eps: data?.eps ?? '' }));
        return { data: { name: created?.id } };
    }

    if (root === 'contratos' && !id) {
        const created = await contratosApi.create(toApiContrato(withCurrentIpsId(data || {})));
        return { data: { name: created?.id } };
    }

    if (root === 'cups' && !id) {
        const created = await cupsApi.create(toApiCup(withCurrentIpsId(data || {})));
        return { data: { name: created?.id } };
    }

    if (root === 'ips' && !id) {
        const created = await ipsApi.create({ id: data?.id, ...toApiIpsPayload(data || {}) });
        return { data: { name: created?.id } };
    }

    if (root === 'actividadesExtra' && !id) {
        const created = await actividadesExtraApi.create(toApiActividadExtra(withCurrentIpsId(data || {})));
        return { data: { name: created?.id } };
    }

    if (root === 'usuarios' && !id) {
        const created = await createUserByApi(toApiUser(data || {}));
        return { data: { name: created?.id } };
    }

    return rawPost(url, data, config);
};

realtime_api2.put = async (url, data, config) => {
    const segments = splitPath(url);
    const [root, id, ...rest] = segments;

    if (root === 'Encuesta' && id && !rest.length) {
        const saved = await encuestasApi.replace(id, toApiEncuesta(withCurrentIpsId(data || {})));
        return { data: saved };
    }

    if (root === 'Asignaciones' && id && !rest.length) {
        const saved = await asignacionesApi.replace(id, withCurrentIpsId({ encuestaId: id, ...(data || {}) }));
        return { data: toLegacyAsignacionPayload(saved) };
    }

    if (root === 'agendas' && id && !rest.length) {
        const current = await agendasApi.getById(id).catch(() => null);
        const payload = withCurrentIpsId(toApiAgenda(id, data || {}, current));
        const saved = await agendasApi.replace(id, payload);
        return { data: fromApiAgenda(saved) };
    }

    if (root === 'comunasybarrios' && id && !rest.length) {
        const saved = await comunasBarriosApi.replace(id, withCurrentIpsId({ comuna: data?.comuna ?? '', barrio: data?.barrio ?? '' }));
        return { data: { comuna: saved?.comuna ?? '', barrio: saved?.barrio ?? '' } };
    }

    if (root === 'eps' && id && !rest.length) {
        const saved = await epsApi.replace(id, withCurrentIpsId({ eps: data?.eps ?? '' }));
        return { data: { eps: saved?.eps ?? '' } };
    }

    if (root === 'contratos' && id && !rest.length) {
        const saved = await contratosApi.replace(id, toApiContrato(withCurrentIpsId(data || {}), id));
        return { data: fromApiContrato(saved) };
    }

    if (root === 'cups' && id && !rest.length) {
        const saved = await cupsApi.replace(id, toApiCup(withCurrentIpsId(data || {}), id));
        return { data: fromApiCup(saved) };
    }

    if (root === 'ips' && id && !rest.length) {
        const saved = await ipsApi.replace(id, { id, ...toApiIpsPayload(data || {}) });
        return { data: toLegacyIpsPayload(saved) };
    }

    if (root === 'actividadesExtra' && id && !rest.length) {
        const saved = await actividadesExtraApi.replace(id, toApiActividadExtra(withCurrentIpsId(data || {}), id));
        return { data: fromApiActividadExtra(saved) };
    }

    if (root === 'usuarios' && id && !rest.length) {
        const saved = await updateUser(id, toApiUser(data || {}));
        return { data: fromApiUser({ id, ...(data || {}), ...saved }) };
    }

    return rawPut(url, data, config);
};

realtime_api2.patch = async (url, data, config) => {
    const segments = splitPath(url);
    const [root, id, ...rest] = segments;

    if (root === 'Encuesta' && id && !rest.length) {
        const saved = await encuestasApi.update(id, toApiEncuesta(withCurrentIpsId(data || {})));
        return { data: saved };
    }

    if (root === 'Asignaciones' && id) {
        const current = await asignacionesApi.getById(id).catch(() => null);
        const currentDatos = toLegacyAsignacionPayload(current || {});

        if (!rest.length) {
            const merged = deepMerge(currentDatos, data || {});
            const saved = await asignacionesApi.replace(id, withCurrentIpsId({ encuestaId: id, ...merged }));
            return { data: toLegacyAsignacionPayload(saved) };
        }

        const nestedCurrent = getBySegments(currentDatos, rest);
        const nextNested = isObject(nestedCurrent)
            ? deepMerge(nestedCurrent, data || {})
            : (data || {});

        const nextDatos = setBySegments(currentDatos, rest, nextNested);
        const saved = await asignacionesApi.replace(id, withCurrentIpsId({ encuestaId: id, ...nextDatos }));
        return { data: getBySegments(toLegacyAsignacionPayload(saved), rest) || null };
    }

    if (root === 'agendas' && id) {
        const current = await agendasApi.getById(id).catch(() => null);

        if (!current) {
            const createdPayload = withCurrentIpsId(toApiAgenda(id, data || {}, null));
            const created = await agendasApi.replace(id, createdPayload);
            return { data: fromApiAgenda(created) };
        }

        const currentLegacy = fromApiAgenda(current);

        if (!rest.length) {
            const nextLegacy = deepMerge(currentLegacy, data || {});
            const payload = withCurrentIpsId(toApiAgenda(id, nextLegacy, current));
            const saved = await agendasApi.replace(id, payload);
            return { data: fromApiAgenda(saved) };
        }

        const nestedCurrent = getBySegments(currentLegacy, rest);
        const nextNested = isObject(nestedCurrent)
            ? deepMerge(nestedCurrent, data || {})
            : (data || {});
        const nextLegacy = setBySegments(currentLegacy, rest, nextNested);
        const payload = withCurrentIpsId(toApiAgenda(id, nextLegacy, current));
        const saved = await agendasApi.replace(id, payload);
        const nextSavedLegacy = fromApiAgenda(saved);
        return { data: getBySegments(nextSavedLegacy, rest) || null };
    }

    if (root === 'caracterizacion' && id && !rest.length) {
        const saved = await caracterizacionApi.update(id, toApiCaracterizacion(withCurrentIpsId(data || {})));
        const mapped = buildCaracterizacionMap([saved]);
        return { data: mapped[id] || null };
    }

    if (root === 'comunasybarrios' && id && !rest.length) {
        const saved = await comunasBarriosApi.update(id, withCurrentIpsId({ comuna: data?.comuna, barrio: data?.barrio }));
        return { data: { comuna: saved?.comuna ?? '', barrio: saved?.barrio ?? '' } };
    }

    if (root === 'eps' && id && !rest.length) {
        const saved = await epsApi.update(id, withCurrentIpsId({ eps: data?.eps }));
        return { data: { eps: saved?.eps ?? '' } };
    }

    if (root === 'contratos' && id && !rest.length) {
        const saved = await contratosApi.update(id, toApiContrato(withCurrentIpsId(data || {})));
        return { data: fromApiContrato(saved) };
    }

    if (root === 'cups' && id && !rest.length) {
        const saved = await cupsApi.update(id, toApiCup(withCurrentIpsId(data || {})));
        return { data: fromApiCup(saved) };
    }

    if (root === 'ips' && id && !rest.length) {
        const saved = await ipsApi.update(id, toApiIpsPayload(data || {}));
        return { data: toLegacyIpsPayload(saved) };
    }

    if (root === 'actividadesExtra' && id && !rest.length) {
        const saved = await actividadesExtraApi.update(id, toApiActividadExtra(withCurrentIpsId(data || {})));
        return { data: fromApiActividadExtra(saved) };
    }

    if (root === 'usuarios' && id && !rest.length) {
        if (Object.prototype.hasOwnProperty.call(data || {}, 'password')) {
            const saved = await updateUserPasswordById(
                id,
                data.password,
                data.password === '12345'
            );
            return { data: saved };
        }

        const saved = await updateUser(id, toApiUser(data || {}));
        return { data: fromApiUser({ id, ...(data || {}), ...saved }) };
    }

    return rawPatch(url, data, config);
};

realtime_api2.delete = async (url, config) => {
    const segments = splitPath(url);
    const [root, id, ...rest] = segments;

    if (root === 'Encuesta' && id && !rest.length) {
        await encuestasApi.remove(id);
        return { data: null };
    }

    if (root === 'Actividades' && id && !rest.length) {
        const related = await encuestaActividadesApi.list({ encuestaId: id, limit: 200, offset: 0 });
        await Promise.all(related.map((r) => encuestaActividadesApi.remove(r.id)));
        return { data: null };
    }

    if (root === 'Asignaciones' && id) {
        if (!rest.length) {
            await asignacionesApi.remove(id);
            return { data: null };
        }

        const current = await asignacionesApi.getById(id).catch(() => null);
        if (!current) {
            return { data: null };
        }

        const nextDatos = deleteBySegments(toLegacyAsignacionPayload(current), rest);
        await asignacionesApi.replace(id, { encuestaId: id, ...nextDatos });
        return { data: null };
    }

    if (root === 'agendas' && id) {
        if (!rest.length) {
            await agendasApi.remove(id);
            return { data: null };
        }

        const current = await agendasApi.getById(id).catch(() => null);
        if (!current) {
            return { data: null };
        }

        const currentLegacy = fromApiAgenda(current);
        const nextLegacy = deleteBySegments(currentLegacy, rest);
        const payload = toApiAgenda(id, nextLegacy, current);
        await agendasApi.replace(id, payload);
        return { data: null };
    }

    if (root === 'caracterizacion' && id && !rest.length) {
        await caracterizacionApi.remove(id);
        return { data: null };
    }

    if (root === 'comunasybarrios' && id && !rest.length) {
        await comunasBarriosApi.remove(id);
        return { data: null };
    }

    if (root === 'eps' && id && !rest.length) {
        await epsApi.remove(id);
        return { data: null };
    }

    if (root === 'contratos' && id && !rest.length) {
        await contratosApi.remove(id);
        return { data: null };
    }

    if (root === 'cups' && id && !rest.length) {
        await cupsApi.remove(id);
        return { data: null };
    }

    if (root === 'ips' && id && !rest.length) {
        await ipsApi.remove(id);
        return { data: null };
    }

    if (root === 'actividadesExtra' && id && !rest.length) {
        await actividadesExtraApi.remove(id);
        return { data: null };
    }

    if (root === 'usuarios' && id && !rest.length) {
        await deleteUserById(id);
        return { data: null };
    }

    return rawDelete(url, config);
};

// Interceptor para agregar el token a todas las peticiones
realtime_api2.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores 401 (token expirado)
realtime_api2.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('uid');
            
            // Redirigir al login
            window.location.href = '/login';
            
            return Promise.reject(new Error('Token expirado. Por favor inicia sesión nuevamente.'));
        }
        return Promise.reject(error);
    }
);

export default realtime_api2;

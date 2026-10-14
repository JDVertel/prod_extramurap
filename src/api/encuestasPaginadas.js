import realtime_api from "@/api/realtimeApi.js";

/** Debe coincidir con el máximo que acepta la API por petición (module.service: maxLimit). */
export const TAMANO_PAGINA_ENCUESTAS = 5000;
const MAX_PAGINAS = 200;

/**
 * Lee una colección realtime (/Encuesta.json, /caracterizacion.json) página por página.
 * Una sola petición devuelve como máximo 5000 filas y descarta el resto.
 * Devuelve el mismo mapa { id: registro } que la ruta original.
 */
async function obtenerColeccionPaginada(ruta, filtros = {}) {
    const registros = {};

    for (let pagina = 0; pagina < MAX_PAGINAS; pagina += 1) {
        const { data } = await realtime_api.get(ruta, {
            params: {
                ...filtros,
                limit: TAMANO_PAGINA_ENCUESTAS,
                offset: pagina * TAMANO_PAGINA_ENCUESTAS,
            },
        });

        const lote = data && typeof data === "object" ? data : {};
        const cantidad = Object.keys(lote).length;
        Object.assign(registros, lote);

        if (cantidad < TAMANO_PAGINA_ENCUESTAS) break;
    }

    return registros;
}

/** Trae todas las encuestas que cumplen los filtros. */
export function obtenerEncuestasPaginadas(filtros = {}) {
    return obtenerColeccionPaginada("/Encuesta.json", { ...filtros, orden: "id" });
}

/** Une varias consultas (p. ej. distintos campos de fecha) sin duplicar encuestas. */
export async function obtenerEncuestasPaginadasUnion(listaFiltros = []) {
    const resultados = await Promise.all(listaFiltros.map((filtros) => obtenerEncuestasPaginadas(filtros)));
    return Object.assign({}, ...resultados);
}

/** Trae todas las caracterizaciones que cumplen los filtros. */
export function obtenerCaracterizacionesPaginadas(filtros = {}) {
    return obtenerColeccionPaginada("/caracterizacion.json", filtros);
}

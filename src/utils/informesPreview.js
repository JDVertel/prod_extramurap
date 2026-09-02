export const INFORME_VISTA_PREVIA_FILAS = 10;

export function sliceVistaPreviaInforme(filas = [], limite = INFORME_VISTA_PREVIA_FILAS) {
    return (Array.isArray(filas) ? filas : []).slice(0, limite);
}

export function conteoVistaPreviaInforme(total = 0, limite = INFORME_VISTA_PREVIA_FILAS) {
    const totalRegistros = Number(total) || 0;
    const visibles = Math.min(limite, totalRegistros);
    return { visibles, totalRegistros };
}

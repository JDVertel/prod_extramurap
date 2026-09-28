import * as XLSX from "xlsx";
import {
    buildExcelRowsFromColumnas,
    createWorksheetFromRows,
    aplicarTiposNumericosEnHoja,
} from "@/utils/excelExport";

export const COLUMNAS_INDICADORES = [
    { key: "codigo", label: "Código", excelType: "text" },
    { key: "nombre", label: "Nombre del indicador" },
    { key: "poblacion", label: "Población (denominador)" },
    { key: "criterio", label: "Criterio (numerador)" },
    { key: "numerador", label: "Numerador", excelType: "number" },
    { key: "numeradorCups", label: "Numerador por CUPS", excelType: "number" },
    { key: "numeradorCaracterizacion", label: "Numerador por caracterización", excelType: "number" },
    { key: "denominador", label: "Denominador", excelType: "number" },
    { key: "porcentaje", label: "Resultado (%)", excelType: "number" },
];

export const COLUMNAS_INDICADORES_DETALLE = [
    { key: "codigo", label: "Código", excelType: "text" },
    { key: "indicador", label: "Indicador" },
    { key: "paciente", label: "Paciente" },
    { key: "documento", label: "Documento", excelType: "text" },
    { key: "sexo", label: "Sexo" },
    { key: "edad", label: "Edad" },
    { key: "convenio", label: "Convenio" },
    { key: "eps", label: "EPS" },
    { key: "fechaAtencion", label: "Fecha atención" },
    { key: "cumple", label: "Cumple" },
    { key: "fuente", label: "Fuente" },
    { key: "esquemaVacunal", label: "Esquema vacunal (caracterización)" },
    { key: "evidencia", label: "Evidencia (CUPS / caracterización)" },
];

export const NOTA_INDICADORES_PUNTOS = [
    { titulo: "Denominador", texto: "Total de personas que deberían recibir la atención o el procedimiento (población objetivo del indicador), según edad, sexo o condición de gestante, entre los pacientes atendidos en el rango de fechas." },
    { titulo: "Numerador", texto: "De las personas del denominador, cuántas sí lo recibieron (tienen registrado el CUPS o la condición del criterio)." },
    { titulo: "Fuentes", texto: "Primero se buscan los CUPS registrados; si no hay CUPS de la vacuna, se toma el esquema vacunal \"Completo\" registrado en la caracterización (para pentavalente, solo desde los 6 meses). La FUM de la caracterización se usa para la captación temprana de gestantes. Las columnas \"por CUPS\" y \"por caracterización\" muestran cuánto aporta cada fuente." },
    { titulo: "Resultado", texto: "Numerador ÷ Denominador × 100." },
    { titulo: "Sin población", texto: "El denominador fue 0: en el rango consultado no hubo personas del grupo objetivo, por lo que no se puede calcular el porcentaje." },
    { titulo: "Detalle por paciente", texto: "En el Excel, cada fila es una persona del denominador; las marcadas con \"Sí\" son las que suman al numerador, con los CUPS que lo evidencian." },
];

export const construirEjemploNotaIndicadores = (indicadores = []) => {
    const ind = indicadores.find((item) => item.denominador > 0 && item.numerador > 0)
        || indicadores.find((item) => item.denominador > 0);
    if (!ind) return "";
    return `${ind.codigo} (${ind.poblacion}): ${ind.numerador} / ${ind.denominador} = ${ind.porcentaje}%. `
        + `De ${ind.denominador} personas de la población objetivo, ${ind.numerador} cumplen el criterio (${ind.criterio}).`;
};

export const crearIndicadoresInformeVacio = () => ({
    totalPacientes: 0,
    totalEncuestas: 0,
    totalCaracterizados: 0,
    indicadores: [],
    detalle: [],
});

/**
 * Genera el Excel de indicadores: hoja resumen, detalle por paciente y nota explicativa.
 * `encabezado` son pares [etiqueta, valor] que se muestran al inicio de la nota (IPS, periodo, etc.).
 */
export function exportarExcelIndicadoresSalud({ indicadores = [], detalle = [], nombreArchivo, encabezado = [] }) {
    const wb = XLSX.utils.book_new();
    const hojas = [
        ["Indicadores", indicadores, COLUMNAS_INDICADORES, [10, 70, 32, 45, 12, 16, 20, 12, 14]],
        ["Detalle por paciente", detalle, COLUMNAS_INDICADORES_DETALLE, [10, 60, 32, 18, 8, 16, 18, 22, 14, 9, 16, 18, 60]],
    ];

    hojas.forEach(([nombre, filas, columnas, anchos]) => {
        const ws = createWorksheetFromRows(buildExcelRowsFromColumnas(filas, columnas), { columnas });
        if (ws["!ref"]) {
            ws["!autofilter"] = { ref: ws["!ref"] };
        }
        aplicarTiposNumericosEnHoja(ws, { columnas });
        ws["!cols"] = anchos.map((wch) => ({ wch }));
        XLSX.utils.book_append_sheet(wb, ws, nombre);
    });

    const ejemplo = construirEjemploNotaIndicadores(indicadores);
    const filasNota = [["¿Cómo leer este informe?", ""], ["", ""]];
    if (encabezado.length) {
        filasNota.push(...encabezado, ["", ""]);
    }
    filasNota.push(
        ["Concepto", "Explicación"],
        ...NOTA_INDICADORES_PUNTOS.map((punto) => [punto.titulo, punto.texto]),
    );
    if (ejemplo) {
        filasNota.push(["", ""], ["Ejemplo con este informe", ejemplo]);
    }
    const wsNota = XLSX.utils.aoa_to_sheet(filasNota);
    wsNota["!cols"] = [{ wch: 26 }, { wch: 120 }];
    XLSX.utils.book_append_sheet(wb, wsNota, "Nota explicativa");

    XLSX.writeFile(wb, nombreArchivo);
}

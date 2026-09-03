export const MENSAJE_RANGO_SIN_DATOS =
    "El rango seleccionado no contiene información para generar informe.";

function tablaSimple(headers, rows, widths) {
    const body = [
        headers,
        ...(rows.length
            ? rows
            : [headers.map((_, index) => (index === 0 ? "Sin datos" : ""))]),
    ];
    return {
        table: {
            headerRows: 1,
            widths: widths || headers.map((_, index) => (index === headers.length - 1 ? 90 : "*")),
            body,
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 10],
    };
}

export function buildPdfContentResumenProfesional(ctx = {}) {
    const {
        tipoInforme = "1",
        totalRegistros = 0,
        resumenActividades = {},
        resumenFacturacion = {},
        resumenPoblacionRiesgo = [],
        resumenRemision = { si: 0, no: 0 },
        resumenFacturacionPorEps = [],
        resumenCupsFact = [],
    } = ctx;

    const sinDatos = Number(totalRegistros || 0) === 0;
    if (sinDatos) {
        return [
            {
                text: MENSAJE_RANGO_SIN_DATOS,
                style: "emptyMessage",
                margin: [0, 12, 0, 0],
            },
        ];
    }

    if (tipoInforme === "2") {
        return [
            { text: `Total pacientes: ${resumenActividades.totalPacientes || 0}`, margin: [0, 0, 0, 3] },
            { text: `Total actividades: ${resumenActividades.totalActividades || 0}`, margin: [0, 0, 0, 3] },
            { text: `Total CUPS: ${resumenActividades.totalCups || 0}`, margin: [0, 0, 0, 10] },
            { text: "Actividades aplicadas", style: "subheader" },
            tablaSimple(
                ["Actividad", "Cantidad"],
                (resumenActividades.actividades || []).map((item) => [item.nombre, String(item.cantidad)])
            ),
            { text: "CUPS vs cantidad aplicada", style: "subheader" },
            tablaSimple(
                ["CUPS", "Cantidad"],
                (resumenActividades.cups || []).map((item) => [item.nombre, String(item.cantidad)])
            ),
        ];
    }

    if (tipoInforme === "3") {
        return [
            { text: "Pacientes facturados/CUPS", style: "subheader" },
            { text: `Total pacientes: ${resumenFacturacion.totalPacientes || 0}`, margin: [0, 0, 0, 3] },
            { text: `Total CUPS: ${resumenFacturacion.totalCups || 0}`, margin: [0, 0, 0, 10] },
            { text: "CUPS por EPS", style: "subheader" },
            tablaSimple(
                ["EPS", "Cantidad"],
                (resumenFacturacionPorEps || []).map((item) => [item.nombre, String(item.cantidad)])
            ),
            { text: "CUPS más aplicados", style: "subheader" },
            tablaSimple(
                ["Código - Nombre", "Cantidad"],
                (resumenCupsFact || []).map((item) => [item.nombre, String(item.cantidad)])
            ),
        ];
    }

    return [
        { text: "Pacientes cerrados", style: "subheader" },
        { text: `Total pacientes: ${totalRegistros}`, margin: [0, 0, 0, 3] },
        { text: `Total CUPS: ${resumenActividades.totalCups || 0}`, margin: [0, 0, 0, 10] },
        { text: "Actividades realizadas", style: "subheader" },
        tablaSimple(
            ["Actividad", "Cantidad"],
            (resumenActividades.actividades || []).map((item) => [item.nombre, String(item.cantidad)])
        ),
        { text: "Población de riesgo", style: "subheader" },
        tablaSimple(
            ["Población", "Cantidad"],
            (resumenPoblacionRiesgo || []).map((item) => [item.nombre, String(item.cantidad)])
        ),
        { text: "CUPS aplicados", style: "subheader" },
        tablaSimple(
            ["CUPS", "Cantidad"],
            (resumenActividades.cups || []).map((item) => [item.nombre, String(item.cantidad)])
        ),
        { text: "Remisión a procedimientos", style: "subheader" },
        tablaSimple(
            ["Indicador", "Cantidad"],
            [
                ["Requieren remisión", String(resumenRemision.si || 0)],
                ["No requieren", String(resumenRemision.no || 0)],
            ]
        ),
    ];
}

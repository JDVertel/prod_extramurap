import {
    buildExcelRowsFromObjects,
    exportRowsToExcel,
} from "@/utils/excelExport";

function formatearFechaYYYYMMDD(valorFecha) {
    if (!valorFecha) return "";
    const texto = String(valorFecha).trim();
    const matchIso = texto.match(/^(\d{4}-\d{2}-\d{2})/);
    if (matchIso) return matchIso[1];

    const fecha = new Date(texto);
    if (!Number.isNaN(fecha.getTime())) {
        return fecha.toISOString().slice(0, 10);
    }

    return texto;
}

function nombrePaciente(row = {}) {
    return String(
        row.pacienteNombre ||
        `${row.nombre1 || ""} ${row.nombre2 || ""} ${row.apellido1 || ""} ${row.apellido2 || ""}`
    ).trim();
}

function barrioPaciente(row = {}) {
    const barrio = row?.barrioVeredacomuna;
    if (barrio && typeof barrio === "object") {
        return String(barrio.barrio || barrio.vereda || barrio.comuna || "").trim();
    }
    return String(barrio || "").trim();
}

function slugArchivo(texto = "") {
    return String(texto || "usuario")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "usuario";
}

function cantidadCup(cup = {}) {
    const cantidad = Number(cup?.cantidad);
    return Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1;
}

function etiquetaCup(cup = {}) {
    const codigo = String(cup?.codigo || cup?.cupsCodigo || cup?.cupsId || cup?.codcups || "").trim();
    const nombre = String(
        cup?.DescripcionCUP || cup?.cupsNombre || cup?.descripcion || ""
    ).trim();
    return [codigo, nombre].filter(Boolean).join(" - ");
}

function facturadoLabel(cup = {}) {
    if (cup?.facturado === true || cup?.facturado === 1 || cup?.facturado === "1") return "Si";
    if (cup?.facturado === false || cup?.facturado === 0 || cup?.facturado === "0") return "No";
    const factura = String(cup?.FactNum || cup?.factNum || cup?.fact_num || cup?.numeroFactura || "").trim();
    return factura ? "Si" : "No";
}

/**
 * Tabla de trabajo completa (la que antes se copiaba):
 * paciente + actividades + CUPS + facturación + profesional.
 * Una fila por CUPS; si el paciente no tiene CUPS, una fila con esos campos vacíos.
 * Incluye TODOS los registros, no la vista previa.
 */
export function construirFilasTablaTrabajoProfesional({
    filas = [],
    dataips = {},
    userData = {},
    columnasTipoActividad = [],
    columnasPoblacionRiesgo = [],
    actividadRealizada = () => false,
    cupsPorEncuesta = {},
    obtenerNombreActividad = () => "",
} = {}) {
    const rows = [];

    (Array.isArray(filas) ? filas : []).forEach((usuario) => {
        const base = {
            DPTO: dataips?.dpto || "",
            MUNICIPIO: dataips?.municipio || "",
            "NOMBRE IPS": dataips?.nombre || "",
            CODIGO: dataips?.codHab || "",
            FECHA: formatearFechaYYYYMMDD(usuario?.fecha || usuario?.fechaCierreFacturacion),
            "NOMBRE DEL USUARIO": nombrePaciente(usuario),
            "TIPO ID": usuario?.tipodoc || "",
            "NUMERO ID": usuario?.numdoc || "",
            "DIRECCION DEL USUARIO": usuario?.direccion || "",
            "TELEFONO DE USUARIO": usuario?.telefono || "",
            "BARRIO/VEREDA": barrioPaciente(usuario),
            "DESPLAZAMIENTO EFECTIVO (Si/No)": usuario?.desplazamiento || "",
            EPS: usuario?.eps || "",
            CONVENIO: usuario?.convenio || "",
        };

        columnasTipoActividad.forEach((col) => {
            base[col] = actividadRealizada(usuario, col) ? "X" : "";
        });

        columnasPoblacionRiesgo.forEach((col) => {
            const poblacion = String(usuario?.poblacionRiesgo || "");
            base[col] = poblacion.includes(col) ? "X" : "";
        });

        base["REQUIERE REMISION"] = usuario?.requiereRemision || "";
        base["ENCUESTADOR NOMBRE"] = userData?.nombre || "";
        base["ENCUESTADOR CARGO"] = userData?.cargo || "";
        base["ENCUESTADOR DOCUMENTO"] = userData?.numDocumento || "";

        const cups = cupsPorEncuesta?.[usuario?.id] || [];
        const listaCups = Array.isArray(cups) && cups.length ? cups : [null];

        listaCups.forEach((cup) => {
            const actividadId = cup?.actividadId ?? cup?.idActividad;
            rows.push({
                ...base,
                "ACTIVIDAD CUPS": cup
                    ? String(obtenerNombreActividad(actividadId) || cup?.actividadNombre || "").trim()
                    : "",
                "CODIGO CUPS": cup
                    ? String(cup?.codigo || cup?.cupsCodigo || cup?.cupsId || "").trim()
                    : "",
                "NOMBRE CUPS": cup
                    ? String(cup?.DescripcionCUP || cup?.cupsNombre || cup?.descripcion || "").trim()
                    : "",
                "CANTIDAD CUPS": cup ? cantidadCup(cup) : "",
                "DETALLE CUPS": cup ? String(cup?.detalle || "").trim() : "",
                "NUMERO FACTURA": cup
                    ? String(cup?.FactNum || cup?.factNum || cup?.fact_num || cup?.numeroFactura || "").trim()
                    : "",
                FACTURADO: cup ? facturadoLabel(cup) : "",
                "PROFESIONAL CUPS": cup
                    ? String(cup?.nombreProf || cup?.profesionalNombreCup || userData?.nombre || "").trim()
                    : String(userData?.nombre || "").trim(),
                "DOCUMENTO PROFESIONAL CUPS": cup
                    ? String(cup?.idProf ?? cup?.idProfesional ?? userData?.numDocumento ?? "").trim()
                    : String(userData?.numDocumento || "").trim(),
                "ROL CUPS": cup ? String(cup?.key || userData?.cargo || "").trim() : String(userData?.cargo || "").trim(),
            });
        });
    });

    return rows;
}

/**
 * Tabla tipo facturación (una fila por CUPS facturado), todos los registros.
 */
export function construirFilasFacturacionCupsExcel({
    filas = [],
    userData = {},
} = {}) {
    return (Array.isArray(filas) ? filas : []).map((row) => ({
        "Fecha cierre facturacion": formatearFechaYYYYMMDD(row?.fechaCierreFacturacion),
        "Tipo ID": row?.tipodoc || "",
        "Numero ID": row?.numdoc || "",
        Paciente: nombrePaciente(row),
        EPS: row?.eps || "",
        Convenio: row?.convenio || "",
        "Codigo CUPS": row?.cupsCodigo || "",
        "Nombre CUPS": row?.cupsNombre || "",
        Cantidad: Number(row?.cantidad || 1),
        "Numero factura": row?.numeroFactura || "",
        "Profesional CUPS": row?.profesionalNombreCup || userData?.nombre || "",
        "Documento profesional": row?.profesionalDocumentoCup || userData?.numDocumento || "",
        "Rol CUPS": row?.profesionalCargoCup || userData?.cargo || "",
    }));
}

export function exportarInformeProfesionalExcel({
    tipoInforme = "1",
    filas = [],
    dataips = {},
    userData = {},
    columnasTipoActividad = [],
    columnasPoblacionRiesgo = [],
    actividadRealizada = () => false,
    cupsPorEncuesta = {},
    obtenerNombreActividad = () => "",
    fechaInicio = "",
    fechaFin = "",
} = {}) {
    const usuarioArchivo = slugArchivo(userData?.nombre);
    const rangoArchivo = `${fechaInicio || "sin_inicio"}_a_${fechaFin || "sin_fin"}`;
    const lista = Array.isArray(filas) ? filas : [];

    if (!lista.length) return false;

    if (tipoInforme === "3") {
        const rows = construirFilasFacturacionCupsExcel({ filas: lista, userData });
        if (!rows.length) return false;
        return exportRowsToExcel({
            rows: buildExcelRowsFromObjects(rows, { numericLabels: ["Cantidad"] }),
            numericLabels: ["Cantidad"],
            sheetName: "Facturados CUPS",
            fileName: `informe_pacientes_facturados_cups_${usuarioArchivo}_${rangoArchivo}.xlsx`,
            colWidth: 20,
        });
    }

    const rows = construirFilasTablaTrabajoProfesional({
        filas: lista,
        dataips,
        userData,
        columnasTipoActividad,
        columnasPoblacionRiesgo,
        actividadRealizada,
        cupsPorEncuesta,
        obtenerNombreActividad,
    });

    if (!rows.length) return false;

    const tipoArchivo = tipoInforme === "2" ? "actividades" : "pacientes_cerrados";
    return exportRowsToExcel({
        rows: buildExcelRowsFromObjects(rows, {
            numericLabels: ["CANTIDAD CUPS"],
        }),
        numericLabels: ["CANTIDAD CUPS"],
        sheetName: "Informe completo",
        fileName: `informe_${tipoArchivo}_${usuarioArchivo}_${rangoArchivo}.xlsx`,
        colWidth: 18,
    });
}

export { etiquetaCup };

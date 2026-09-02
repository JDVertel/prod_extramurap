<template>
    <div
        v-if="visible"
        class="modal fade show d-block facturacion-guia-modal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="facturacionGuiaTitulo"
        aria-modal="true"
        @click.self="cerrar">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 id="facturacionGuiaTitulo" class="modal-title">
                        <i class="bi bi-info-circle-fill text-primary me-2"></i>
                        Guía de la interfaz de Facturación
                    </h5>
                    <button type="button" class="btn-close" aria-label="Cerrar" @click="cerrar"></button>
                </div>
                <div class="modal-body">
                    <div v-if="!tieneRegistrosEpsBd" class="alert alert-light border mb-3 small">
                        <i class="bi bi-database-x me-1"></i>
                        No hay registros cargados en <strong>Parámetros → BDS_EPS</strong>.
                        Las columnas <strong>Facturable</strong>, la selección masiva y <strong>Cerrar depuración</strong>
                        solo aparecen cuando existen datos en esa base.
                    </div>
                    <div class="guia-visual-panel mb-4">
                        <p class="guia-visual-caption mb-2">
                            <i class="bi bi-image me-1"></i> Vista de referencia — Pendientes
                        </p>
                        <div class="guia-mock-interface" aria-hidden="true">
                            <div class="guia-mock-tabs">
                                <span class="guia-mock-tab active">Pendientes</span>
                                <span class="guia-mock-tab">Aprovisionar</span>
                                <span class="guia-mock-tab">Historial</span>
                            </div>
                            <div class="guia-mock-toolbar" v-if="tieneRegistrosEpsBd">
                                <span class="guia-mock-btn-outline danger">
                                    <i class="bi bi-x-octagon"></i> Cerrar depuración (2)
                                </span>
                                <span class="guia-mock-hint">Solo pacientes no facturables</span>
                            </div>
                            <div class="guia-mock-table-wrap">
                                <table class="guia-mock-table">
                                    <thead>
                                        <tr>
                                            <th>Acc.</th>
                                            <th v-if="tieneRegistrosEpsBd">Sel.</th>
                                            <th v-if="tieneRegistrosEpsBd">Fact.</th>
                                            <th>Estado</th>
                                            <th>Paciente</th>
                                            <th>Documento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr class="guia-row-facturable">
                                            <td><span class="guia-icon-btn primary"><i class="bi bi-bookmark-check-fill"></i></span></td>
                                            <td v-if="tieneRegistrosEpsBd" class="text-center text-muted">—</td>
                                            <td v-if="tieneRegistrosEpsBd"><i class="bi bi-check-circle-fill text-success"></i></td>
                                            <td><span class="guia-estado muted">Sin gestión</span></td>
                                            <td>Ana Pérez</td>
                                            <td>CC-123</td>
                                        </tr>
                                        <tr v-if="tieneRegistrosEpsBd" class="guia-row-depuracion">
                                            <td><span class="guia-icon-btn primary"><i class="bi bi-bookmark-check-fill"></i></span></td>
                                            <td class="text-center"><input type="checkbox" class="form-check-input m-0" checked disabled></td>
                                            <td><span class="text-muted">No</span></td>
                                            <td><span class="guia-estado muted">Sin gestión</span></td>
                                            <td>Carlos Díaz</td>
                                            <td>CC-999</td>
                                        </tr>
                                        <tr class="guia-row-reabierto">
                                            <td><span class="guia-icon-btn primary"><i class="bi bi-bookmark-check-fill"></i></span></td>
                                            <td v-if="tieneRegistrosEpsBd" class="text-center"><input type="checkbox" class="form-check-input m-0" disabled></td>
                                            <td v-if="tieneRegistrosEpsBd">No</td>
                                            <td><span class="guia-estado devuelto"><i class="bi bi-arrow-counterclockwise"></i> Devuelto</span></td>
                                            <td>Luis Gómez</td>
                                            <td>CC-456</td>
                                        </tr>
                                        <tr class="guia-row-incompleta">
                                            <td>
                                                <span class="guia-icon-btn primary"><i class="bi bi-bookmark-check-fill"></i></span>
                                                <span class="guia-icon-btn warning"><i class="bi bi-exclamation-triangle-fill"></i></span>
                                            </td>
                                            <td v-if="tieneRegistrosEpsBd" class="text-center"><input type="checkbox" class="form-check-input m-0" disabled></td>
                                            <td v-if="tieneRegistrosEpsBd"><i class="bi bi-exclamation-triangle-fill text-warning"></i></td>
                                            <td><span class="guia-estado incompleto"><i class="bi bi-exclamation-triangle-fill"></i> Incompleto</span></td>
                                            <td>María Ruiz</td>
                                            <td>CC-789</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="row g-3">
                        <div class="col-12 col-lg-6">
                            <section class="guia-seccion">
                                <h6><i class="bi bi-layout-text-window me-1"></i> Pestañas principales</h6>
                                <ul class="guia-lista">
                                    <li><strong>Pendientes:</strong> pacientes asignados al facturador, pendientes de facturar o cerrar.</li>
                                    <li><strong>Aprovisionar:</strong> consulta encuestas cerradas clínicamente y las envía a la bandeja del facturador.</li>
                                    <li><strong>Historial:</strong> pacientes ya cerrados en facturación; los de hoy pueden reabrirse.</li>
                                </ul>
                            </section>

                            <section v-if="tieneRegistrosEpsBd" class="guia-seccion">
                                <h6><i class="bi bi-palette me-1"></i> Colores de fila (Pendientes)</h6>
                                <ul class="guia-lista guia-lista-colores">
                                    <li>
                                        <span class="guia-muestra-color guia-color-verde"></span>
                                        <strong>Verde:</strong> paciente facturable según BDS_EPS (documento y nombres coinciden).
                                    </li>
                                    <li>
                                        <span class="guia-muestra-color guia-color-azul"></span>
                                        <strong>Azul:</strong> paciente reabierto desde el historial de hoy.
                                    </li>
                                    <li>
                                        <span class="guia-muestra-color guia-color-amarillo"></span>
                                        <strong>Amarillo:</strong> facturación iniciada (tiene al menos un número de factura).
                                    </li>
                                    <li>
                                        <span class="guia-muestra-color guia-color-blanco"></span>
                                        <strong>Blanco / rayado:</strong> sin gestión de facturación iniciada (puede ser candidato a depuración si no es facturable).
                                    </li>
                                </ul>
                            </section>

                            <section v-else class="guia-seccion">
                                <h6><i class="bi bi-palette me-1"></i> Colores de fila (Pendientes)</h6>
                                <ul class="guia-lista guia-lista-colores">
                                    <li>
                                        <span class="guia-muestra-color guia-color-azul"></span>
                                        <strong>Azul:</strong> paciente reabierto desde el historial de hoy.
                                    </li>
                                    <li>
                                        <span class="guia-muestra-color guia-color-amarillo"></span>
                                        <strong>Amarillo:</strong> facturación iniciada (tiene al menos un número de factura).
                                    </li>
                                    <li>
                                        <span class="guia-muestra-color guia-color-blanco"></span>
                                        <strong>Blanco / rayado:</strong> sin gestión de facturación iniciada.
                                    </li>
                                </ul>
                            </section>

                            <section v-if="tieneRegistrosEpsBd" class="guia-seccion">
                                <h6><i class="bi bi-check2-square me-1"></i> Columna Facturable (BDS_EPS)</h6>
                                <ul class="guia-lista">
                                    <li>Compara el documento <code>tipodoc-numdoc</code> contra las BD cargadas en <strong>Parámetros → BDS_EPS</strong>.</li>
                                    <li><strong>No:</strong> el documento no aparece en ninguna BD EPS.</li>
                                    <li>
                                        <i class="bi bi-check-circle-fill text-success me-1"></i>
                                        <strong>Check verde + EPS:</strong> documento encontrado y coinciden 1er nombre y 1er apellido. La fila se pinta <strong>verde</strong>.
                                    </li>
                                    <li>
                                        <i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>
                                        <strong>Alerta + EPS:</strong> documento en BDS_EPS, pero nombre o apellido no coinciden.
                                    </li>
                                    <li>Pase el mouse sobre la celda para ver el detalle en el tooltip.</li>
                                </ul>
                            </section>

                            <section v-if="tieneRegistrosEpsBd" class="guia-seccion">
                                <h6><i class="bi bi-x-octagon me-1"></i> Cierre en depuración (masivo)</h6>
                                <ul class="guia-lista">
                                    <li>Use el <strong>checkbox</strong> (columna Sel.) para marcar pacientes <strong>no facturables</strong>.</li>
                                    <li>Los facturables (check verde) muestran <strong>—</strong> y no pueden seleccionarse.</li>
                                    <li>El encabezado permite seleccionar o deseleccionar todos los visibles no facturables.</li>
                                    <li>
                                        <span class="guia-mock-btn-outline danger inline"><i class="bi bi-x-octagon"></i> Cerrar depuración</span>
                                        — cierra los seleccionados tras confirmación.
                                    </li>
                                    <li>Coloca <strong>0000</strong> en la factura de todos los CUPS del paciente y lo marca como cerrado en facturación.</li>
                                    <li>El registro sale de <strong>Pendientes</strong> y de <strong>Aprovisionar</strong>; queda en Historial.</li>
                                    <li class="text-danger"><strong>Acción irreversible</strong> desde esta pantalla. Use solo para depurar registros que no serán facturados.</li>
                                </ul>
                            </section>
                        </div>

                        <div class="col-12 col-lg-6">
                            <section class="guia-seccion">
                                <h6><i class="bi bi-ui-checks me-1"></i> Columna Estado</h6>
                                <ul class="guia-lista">
                                    <li><span class="guia-estado devuelto inline"><i class="bi bi-arrow-counterclockwise"></i> Devuelto</span> — reabierto; debe cerrarse nuevamente.</li>
                                    <li><span class="guia-estado incompleto inline"><i class="bi bi-exclamation-triangle-fill"></i> Incompleto</span> — faltan números de factura en algunos CUPS.</li>
                                    <li><span class="guia-estado proceso inline"><i class="bi bi-hourglass-split"></i> En proceso</span> — todos los CUPS tienen factura; falta cerrar paciente.</li>
                                    <li><span class="guia-estado muted inline">Sin gestión</span> — aún no se ha registrado facturación.</li>
                                </ul>
                            </section>

                            <section class="guia-seccion">
                                <h6><i class="bi bi-hand-index me-1"></i> Botones de acción (Pendientes)</h6>
                                <ul class="guia-lista">
                                    <li>
                                        <span class="guia-icon-btn primary sm"><i class="bi bi-bookmark-check-fill"></i></span>
                                        <strong>Azul (marcador):</strong> abrir facturación de CUPS del paciente.
                                    </li>
                                    <li>
                                        <span class="guia-icon-btn danger sm"><i class="bi bi-arrow-counterclockwise"></i></span>
                                        <strong>Rojo (flecha):</strong> devolver a registro inicial (solo si no tiene facturas).
                                    </li>
                                    <li>
                                        <span class="guia-icon-btn warning sm"><i class="bi bi-exclamation-triangle-fill"></i></span>
                                        <strong>Amarillo (triángulo):</strong> ya tiene CUPS con factura; no puede devolverse.
                                    </li>
                                </ul>
                            </section>

                            <section class="guia-seccion">
                                <h6><i class="bi bi-box-arrow-in-down me-1"></i> Aprovisionar</h6>
                                <ul class="guia-lista">
                                    <li>Tabla con fondo <strong>verde claro</strong>: encuestas elegibles para asignar al facturador.</li>
                                    <li><strong>Checkbox:</strong> selección individual o masiva de pacientes.</li>
                                    <li><strong>Aprovisionar seleccionados:</strong> envía los marcados a Pendientes.</li>
                                </ul>
                            </section>

                            <section class="guia-seccion">
                                <h6><i class="bi bi-clock-history me-1"></i> Historial y facturación CUPS</h6>
                                <ul class="guia-lista">
                                    <li><strong>Hoy / Ayer / Última semana:</strong> filtra pacientes cerrados en facturación.</li>
                                    <li><strong>Reabrir:</strong> disponible solo para cierres de hoy; vuelve el paciente a Pendientes.</li>
                                    <li><strong>Factura (verde):</strong> número válido (mín. 5 caracteres). <strong>Outline:</strong> pendiente o inválido.</li>
                                    <li><strong>Cerrar Paciente (rojo):</strong> finaliza la facturación cuando todos los CUPS están diligenciados.</li>
                                    <li>Badges en roles: <span class="badge bg-primary">azul</span> completo,
                                        <span class="badge bg-warning text-dark">amarillo</span> parcial,
                                        <span class="badge bg-secondary">gris</span> sin diligenciar.
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="cerrar">Entendido</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "FacturacionGuiaModal",
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        tieneRegistrosEpsBd: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["close"],
    watch: {
        visible(activo) {
            document.body.classList.toggle("modal-open", activo);
        },
    },
    beforeUnmount() {
        document.body.classList.remove("modal-open");
    },
    methods: {
        cerrar() {
            this.$emit("close");
        },
    },
};
</script>

<style scoped>
.facturacion-guia-modal {
    background-color: rgba(0, 0, 0, 0.45);
}

.guia-visual-panel {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1rem;
    background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.guia-visual-caption {
    font-size: 0.875rem;
    color: #6c757d;
    font-weight: 600;
}

.guia-mock-interface {
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    overflow: hidden;
    background: #fff;
}

.guia-mock-tabs {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem 0;
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.guia-mock-tab {
    font-size: 0.75rem;
    padding: 0.35rem 0.65rem;
    border: 1px solid transparent;
    border-radius: 0.25rem 0.25rem 0 0;
    color: #6c757d;
}

.guia-mock-tab.active {
    background: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
    color: #0d6efd;
    font-weight: 600;
}

.guia-mock-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.45rem 0.75rem;
    background: #fff;
    border-bottom: 1px solid #eee;
    flex-wrap: wrap;
}

.guia-mock-btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.72rem;
    padding: 0.2rem 0.45rem;
    border-radius: 0.25rem;
    border: 1px solid;
}

.guia-mock-btn-outline.danger {
    color: #dc3545;
    border-color: #dc3545;
    background: #fff;
}

.guia-mock-btn-outline.inline {
    font-size: 0.8rem;
    padding: 0.15rem 0.35rem;
    vertical-align: middle;
}

.guia-mock-hint {
    font-size: 0.68rem;
    color: #6c757d;
}

.guia-mock-table-wrap {
    padding: 0.5rem;
}

.guia-mock-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
}

.guia-mock-table th,
.guia-mock-table td {
    border: 1px solid #dee2e6;
    padding: 0.35rem 0.45rem;
    vertical-align: middle;
}

.guia-mock-table th {
    background: #f8f9fa;
}

.guia-row-facturable td {
    background: #d1e7dd;
}

.guia-row-reabierto td {
    background: #cfe2ff;
}

.guia-row-incompleta td {
    background: #fff3cd;
}

.guia-row-depuracion td {
    background: #fff;
}

.guia-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.4rem;
    border-radius: 0.25rem;
    margin-right: 0.15rem;
    font-size: 0.75rem;
}

.guia-icon-btn.sm {
    width: 1.45rem;
    height: 1.25rem;
}

.guia-icon-btn.primary {
    background: #0d6efd;
    color: #fff;
}

.guia-icon-btn.danger {
    background: transparent;
    color: #dc3545;
    border: 1px solid #dc3545;
}

.guia-icon-btn.warning {
    background: #ffc107;
    color: #212529;
}

.guia-estado {
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1.1;
}

.guia-estado.inline {
    display: inline-block;
    margin-right: 0.25rem;
}

.guia-estado.devuelto { color: #084298; }
.guia-estado.incompleto,
.guia-estado.proceso { color: #997404; }
.guia-estado.muted { color: #6c757d; font-weight: 400; }

.guia-seccion {
    margin-bottom: 1rem;
}

.guia-seccion h6 {
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #212529;
}

.guia-lista {
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.875rem;
}

.guia-lista li {
    margin-bottom: 0.45rem;
}

.guia-lista-colores li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
}

.guia-muestra-color {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.2rem;
    border: 1px solid #adb5bd;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.guia-color-verde { background: #d1e7dd; }
.guia-color-azul { background: #cfe2ff; }
.guia-color-amarillo { background: #fff3cd; }
.guia-color-blanco { background: #fff; }
</style>

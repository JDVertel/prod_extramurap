<template>
  <div class="container-fluid py-3">

    <div class="d-flex align-items-center gap-3 mb-4">
      <i class="bi bi-shield-lock-fill fs-2 text-danger"></i>
      <div>
        <h1 class="h3 mb-0">Panel Superusuario</h1>
        <small class="text-muted">Gestión global de IPS y administradores</small>
      </div>
    </div>

    <!-- Alerta de mensajes -->
    <div v-if="mensaje" class="alert" :class="tipoMensaje === 'ok' ? 'alert-success' : 'alert-danger'" role="alert">
      <i :class="tipoMensaje === 'ok' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-triangle-fill'" class="me-2"></i>
      {{ mensaje }}
      <button type="button" class="btn-close float-end" @click="mensaje = ''"></button>
    </div>

    <!-- Pestañas principales -->
    <nav>
      <div class="nav nav-tabs mb-3" role="tablist">
        <button class="nav-link" :class="{ active: tab === 'ips' }" @click="tab = 'ips'" type="button">
          <i class="bi bi-hospital me-1"></i> Gestionar IPS
        </button>
        <button class="nav-link" :class="{ active: tab === 'admins' }" @click="tab = 'admins'" type="button">
          <i class="bi bi-person-badge me-1"></i> Administradores
        </button>
        <button class="nav-link" :class="{ active: tab === 'bandejas' }" @click="tab = 'bandejas'" type="button">
          <i class="bi bi-collection me-1"></i> Bandejas profesionales
        </button>
        <button class="nav-link" :class="{ active: tab === 'version' }" @click="tab = 'version'" type="button">
          <i class="bi bi-code-slash me-1"></i> Version App
        </button>
      </div>
    </nav>

    <!-- TAB IPS -->
    <div v-show="tab === 'ips'">
      <div class="row g-3">
        <!-- Lista de IPS -->
        <div class="col-12 col-lg-5">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong><i class="bi bi-list-ul me-1"></i> IPS registradas</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="recargarIps">
                <i class="bi bi-arrow-clockwise"></i> Recargar
              </button>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive" style="max-height: 420px; overflow-y: auto;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Nombre</th>
                      <th>NIT</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="ipsList.length === 0">
                      <td colspan="3" class="text-center text-muted py-3">No hay IPS registradas.</td>
                    </tr>
                    <tr
                      v-for="ips in ipsList"
                      :key="ips.id"
                      :class="ips.id === ipsForm.id ? 'table-primary' : ''"
                      style="cursor:pointer"
                      @click="seleccionarIps(ips)"
                    >
                      <td>{{ ips.nombre || 'Sin nombre' }}</td>
                      <td class="text-muted small">{{ ips.nit || '—' }}</td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" @click.stop="eliminarIps(ips)" title="Eliminar">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario IPS -->
        <div class="col-12 col-lg-7">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong>{{ ipsForm.id ? 'Editar IPS' : 'Nueva IPS' }}</strong>
              <button class="btn btn-sm btn-outline-primary" @click="nuevaIps">
                <i class="bi bi-plus-circle"></i> Nueva
              </button>
            </div>
            <div class="card-body">
              <form @submit.prevent="guardarIps">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="form-label fw-bold">Nombre <span class="text-danger">*</span></label>
                    <input v-model="ipsForm.nombre" type="text" class="form-control" required placeholder="Nombre de la IPS" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">NIT</label>
                    <input v-model="ipsForm.nit" type="text" class="form-control" placeholder="NIT" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Código de habilitación</label>
                    <input v-model="ipsForm.codHab" type="text" class="form-control" placeholder="Código" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Departamento</label>
                    <input v-model="ipsForm.dpto" type="text" class="form-control" placeholder="Departamento" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Municipio</label>
                    <input v-model="ipsForm.municipio" type="text" class="form-control" placeholder="Municipio" />
                  </div>
                </div>
                <div class="mt-3 d-flex gap-2">
                  <button type="submit" class="btn btn-success" :disabled="guardandoIps">
                    <i class="bi bi-floppy-fill me-1"></i>
                    {{ guardandoIps ? 'Guardando...' : (ipsForm.id ? 'Actualizar IPS' : 'Crear IPS') }}
                  </button>
                  <button type="button" class="btn btn-outline-secondary" @click="nuevaIps">
                    <i class="bi bi-x-circle me-1"></i> Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB ADMINISTRADORES -->
    <div v-show="tab === 'admins'">
      <div class="row g-3">
        <!-- Lista de admins -->
        <div class="col-12 col-lg-5">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <strong><i class="bi bi-people-fill me-1"></i> Administradores</strong>
              <button class="btn btn-sm btn-outline-secondary" @click="recargarAdmins">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive" style="max-height: 420px; overflow-y: auto;">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>IPS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="adminsList.length === 0">
                      <td colspan="4" class="text-center text-muted py-3">No hay administradores.</td>
                    </tr>
                    <tr v-for="admin in adminsList" :key="admin.id">
                      <td>{{ admin.nombre }}</td>
                      <td class="small text-muted">{{ admin.email }}</td>
                      <td class="small">
                        <span v-if="getIpsNombre(admin.ipsId)" class="badge bg-primary">{{ getIpsNombre(admin.ipsId) }}</span>
                        <span v-else class="badge bg-secondary">Sin IPS</span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" @click="eliminarAdmin(admin)" title="Eliminar administrador">
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario crear admin -->
        <div class="col-12 col-lg-7">
          <div class="card shadow-sm h-100 border-danger">
            <div class="card-header bg-danger text-white">
              <strong><i class="bi bi-person-plus-fill me-1"></i> Crear Administrador</strong>
            </div>
            <div class="card-body">
              <form @submit.prevent="crearAdmin">
                <div class="row g-3">
                  <!-- Selector IPS -->
                  <div class="col-12">
                    <label class="form-label fw-bold">IPS asignada <span class="text-danger">*</span></label>
                    <select v-model="adminForm.ipsId" class="form-select" required>
                      <option value="">— Seleccione la IPS del administrador —</option>
                      <option v-for="ips in ipsList" :key="ips.id" :value="ips.id">
                        {{ ips.nombre || ips.id }}
                      </option>
                    </select>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-bold">Nombre completo <span class="text-danger">*</span></label>
                    <input v-model="adminForm.nombre" type="text" class="form-control" required placeholder="Nombre del administrador" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-bold">Email <span class="text-danger">*</span></label>
                    <input v-model="adminForm.email" type="email" class="form-control" required placeholder="correo@ips.com" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label fw-bold">Número de documento <span class="text-danger">*</span></label>
                    <input v-model="adminForm.numDocumento" type="text" class="form-control" required placeholder="CC / NIT" />
                  </div>
                </div>
                <div class="alert alert-info mt-3 mb-2">
                  <i class="bi bi-info-circle me-1"></i>
                  Se generará una contraseña temporal. El administrador deberá cambiarla en su primer ingreso.
                </div>
                <button type="submit" class="btn btn-danger" :disabled="creandoAdmin">
                  <i class="bi bi-person-check-fill me-1"></i>
                  {{ creandoAdmin ? 'Creando...' : 'Crear Administrador' }}
                </button>
              </form>

              <!-- Resultado de creación -->
              <div v-if="adminCreado" class="alert alert-success mt-3">
                <strong><i class="bi bi-check-circle-fill me-1"></i> Administrador creado:</strong><br />
                Email: <code>{{ adminCreado.email }}</code><br />
                Contraseña temporal: <code>{{ adminCreado.tempPassword }}</code>
                <hr class="my-2" />
                <small class="text-muted">Comparte estas credenciales de forma segura. El usuario deberá cambiar la contraseña al ingresar.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-show="tab === 'bandejas'">
      <AdminEstadoProfesional />
    </div>

    <div v-show="tab === 'version'" class="row g-3">
      <div class="col-12 col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header d-flex align-items-center justify-content-between">
            <strong><i class="bi bi-gear-wide-connected me-1"></i> Configuracion de version visible</strong>
          </div>
          <div class="card-body">
            <p class="text-muted mb-3">
              Este texto se mostrara en el footer del login para todos los usuarios.
            </p>
            <form @submit.prevent="guardarVersionApp">
              <div class="mb-3">
                <label class="form-label fw-bold">Texto de version</label>
                <input
                  v-model="versionAppInput"
                  type="text"
                  class="form-control"
                  maxlength="80"
                  placeholder="Ej: Version 2.7 | 12/04/2026"
                />
                <small class="text-muted">Maximo 80 caracteres.</small>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-floppy-fill me-1"></i> Guardar version
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="restablecerVersionDefault">
                  <i class="bi bi-arrow-counterclockwise me-1"></i> Restaurar predeterminado
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="card shadow-sm h-100">
          <div class="card-header">
            <strong><i class="bi bi-eye me-1"></i> Vista previa login</strong>
          </div>
          <div class="card-body">
            <div class="p-3 border rounded bg-light small text-center">
              <span class="fw-bold">ExtramurApp</span>
              <span class="mx-1 opacity-50">|</span>
              <span>{{ versionAppPreview }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ipsApi } from "@/api/modulesApi";
import { createUser, deleteUserById, getAllUsers } from "@/api/usersApi";
import AdminEstadoProfesional from "@/views/admin_estado_profesional.vue";
import { getAppVersionText, getDefaultAppVersionText, setAppVersionText } from "@/utils/appVersion";

export default {
  name: "SuperusuarioView",
  components: {
    AdminEstadoProfesional,
  },
  data() {
    return {
      tab: "ips",
      mensaje: "",
      tipoMensaje: "ok",

      /* IPS */
      ipsList: [],
      guardandoIps: false,
      ipsForm: { id: null, nombre: "", nit: "", codHab: "", dpto: "", municipio: "" },

      /* Admins */
      adminsList: [],
      creandoAdmin: false,
      adminForm: { ipsId: "", nombre: "", email: "", numDocumento: "" },
      adminCreado: null,

      versionAppInput: "",
    };
  },

  computed: {
    versionAppPreview() {
      return String(this.versionAppInput || "").trim() || getDefaultAppVersionText();
    },
  },

  methods: {
    notificar(tipo, texto) {
      this.tipoMensaje = tipo;
      this.mensaje = texto;
      if (tipo === "ok") setTimeout(() => { this.mensaje = ""; }, 5000);
    },

    getIpsNombre(ipsId) {
      if (!ipsId) return null;
      const found = this.ipsList.find((i) => i.id === ipsId);
      return found ? (found.nombre || found.id) : ipsId;
    },

    /* ---- IPS ---- */
    async recargarIps() {
      try {
        this.ipsList = await ipsApi.list();
      } catch (e) {
        this.notificar("error", "No se pudo cargar la lista de IPS: " + e.message);
      }
    },

    nuevaIps() {
      this.ipsForm = { id: null, nombre: "", nit: "", codHab: "", dpto: "", municipio: "" };
    },

    seleccionarIps(ips) {
      this.ipsForm = {
        id: ips.id,
        nombre: ips.nombre || "",
        nit: ips.nit || "",
        codHab: ips.codHab || ips.cod_hab || "",
        dpto: ips.dpto || "",
        municipio: ips.municipio || "",
      };
    },

    async guardarIps() {
      if (!this.ipsForm.nombre.trim()) {
        this.notificar("error", "El nombre de la IPS es obligatorio.");
        return;
      }
      this.guardandoIps = true;
      try {
        const payload = {
          nombre: this.ipsForm.nombre?.trim() || "",
          nit: this.ipsForm.nit?.trim() || null,
          codHab: this.ipsForm.codHab?.trim() || null,
          dpto: this.ipsForm.dpto?.trim() || null,
          municipio: this.ipsForm.municipio?.trim() || null,
        };

        if (this.ipsForm.id) {
          await ipsApi.replace(this.ipsForm.id, payload);
          this.notificar("ok", `IPS "${this.ipsForm.nombre}" actualizada correctamente.`);
        } else {
          await ipsApi.create(payload);
          this.notificar("ok", `IPS "${this.ipsForm.nombre}" creada correctamente.`);
        }
        this.nuevaIps();
        await this.recargarIps();
      } catch (e) {
        const msg = e?.response?.data?.message || e.message;
        const detail = e?.response?.data?.detail;
        this.notificar("error", "Error al guardar la IPS: " + (detail ? `${msg} (${detail})` : msg));
      } finally {
        this.guardandoIps = false;
      }
    },

    async eliminarIps(ips) {
      if (!confirm(`¿Eliminar la IPS "${ips.nombre}"? Esta acción no se puede deshacer.`)) return;
      try {
        await ipsApi.remove(ips.id);
        this.notificar("ok", `IPS "${ips.nombre}" eliminada.`);
        await this.recargarIps();
      } catch (e) {
        this.notificar("error", "Error al eliminar: " + (e?.response?.data?.message || e.message));
      }
    },

    /* ---- Admins ---- */
    async recargarAdmins() {
      try {
        const all = await getAllUsers();
        this.adminsList = all.filter((u) => u.cargo === "admin");
      } catch (e) {
        this.notificar("error", "No se pudo cargar la lista de administradores.");
      }
    },

    async crearAdmin() {
      this.adminCreado = null;
      if (!this.adminForm.ipsId || !this.adminForm.nombre || !this.adminForm.email || !this.adminForm.numDocumento) {
        this.notificar("error", "Completa todos los campos obligatorios.");
        return;
      }
      this.creandoAdmin = true;
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
      const tempPassword = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      try {
        await createUser({
          email: this.adminForm.email.trim().toLowerCase(),
          password: tempPassword,
          nombre: this.adminForm.nombre.trim(),
          cargo: "admin",
          ipsId: this.adminForm.ipsId,
          numDocumento: this.adminForm.numDocumento.trim(),
          grupo: "0",
        });
        this.adminCreado = { email: this.adminForm.email, tempPassword };
        this.adminForm = { ipsId: "", nombre: "", email: "", numDocumento: "" };
        await this.recargarAdmins();
      } catch (e) {
        this.notificar("error", "Error al crear administrador: " + (e?.response?.data?.message || e.message));
      } finally {
        this.creandoAdmin = false;
      }
    },

    async eliminarAdmin(admin) {
      if (!admin?.id) return;
      if (!confirm(`¿Eliminar el administrador "${admin.nombre || admin.email}"?`)) return;

      try {
        await deleteUserById(admin.id);
        this.notificar("ok", `Administrador "${admin.nombre || admin.email}" eliminado.`);
        await this.recargarAdmins();
      } catch (e) {
        this.notificar("error", "Error al eliminar administrador: " + (e?.response?.data?.message || e.message));
      }
    },

    guardarVersionApp() {
      const saved = setAppVersionText(this.versionAppInput);
      this.versionAppInput = saved;
      this.notificar("ok", "Version de la app actualizada correctamente.");
    },

    restablecerVersionDefault() {
      const defaultValue = getDefaultAppVersionText();
      this.versionAppInput = setAppVersionText(defaultValue);
      this.notificar("ok", "Version restablecida al valor predeterminado.");
    },
  },

  async mounted() {
    await this.recargarIps();
    await this.recargarAdmins();
    this.versionAppInput = getAppVersionText();
  },
};
</script>

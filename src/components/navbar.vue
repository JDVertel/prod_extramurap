<template>
  <div class="app" :class="[convenioThemeClass, { 'tema-admin-dorado': isAdminUser }]">
    <nav class="navbar bg-body-tertiary fixed-top">
      <div class="container-fluid">
        <!-- Botón toggler a la izquierda -->
        <button class="navbar-toggler me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-company-brand">
          <img v-if="ipsLogoUrl && !logoLoadFailed" :src="ipsLogoUrl" alt="Logo empresa" class="navbar-company-logo"
            @error="onIpsLogoError" />
          <i v-else class="bi bi-building navbar-company-logo-fallback" aria-hidden="true"></i>
          <span class="navbar-company-name">{{ ipsNombreMostrado || "Empresa" }}</span>
        </div>
        <div class="user-info-badge">
          <h6 v-if="userData && userData.nombre" class="text-center text-capitalize blanco user-info-text">
            <span class="user-info-line user-info-line-top">{{ userData.convenio || "" }}/ {{ userData.cargo || "" }}</span>
            <span class="user-info-line user-info-line-bottom">{{ userData.nombre || "" }} </span>
          </h6>
          <h6 v-else class="text-center text-capitalize blanco user-info-text" style="opacity: 0.6;">
            Cargando...
          </h6>
        </div>

        <!-- Offcanvas desde la izquierda -->
        <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel">
          <div class="offcanvas-header">
            <div class="offcanvas-profile" id="offcanvasNavbarLabel">
              <h1 class="offcanvas-profile-name text-capitalize">Menú</h1>
            </div>

          </div>

          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3 small">
              <li class="nav-item" v-if="userData && userData.cargo === 'Fact'">
                <router-link class="nav-link" to="/sop_facturacion" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> <span class="nav-label">Facturador</span>
                </router-link>
              </li>

              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria'">
                <router-link class="nav-link" to="/sop_aux" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> <span class="nav-label">Auxiliar</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria' && esConvenioExtramural">
                <router-link class="nav-link" to="/sop_agendas" @click="onNavLinkClick">
                  <i class="bi bi-calendar2-date"></i> <span class="nav-label">Agendas</span>
                </router-link>
              </li>

              <li class="nav-item" v-if="userData && userData.cargo === 'Medico'">
                <router-link class="nav-link" to="/sop_profesional" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> <span class="nav-label">Medico</span>
                </router-link>
              </li>
                <li class="nav-item" v-if="userData && userData.cargo === 'Psicologo'">
                 <router-link class="nav-link" to="/sop_psicologo" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> <span class="nav-label">Psicologo</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Tsocial'">
                <router-link class="nav-link" to="/sop_tsocial" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> <span class="nav-label">Trabajador<br>Social</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Nutricionista'">
                <router-link class="nav-link" to="/sop_nutricionista" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> <span class="nav-label">Nutricionista</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Enfermero'">
                <router-link class="nav-link" to="/sop_enfermero" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> <span class="nav-label">Enfermer@</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Admin'">
                <router-link class="nav-link" to="/admin_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> <span class="nav-label">Informes</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Medico'">
                <router-link class="nav-link" to="/medico_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> <span class="nav-label">Informes</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria'">
                <router-link class="nav-link" to="/aux_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> <span class="nav-label">Informes</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Psicologo'">
                <router-link class="nav-link" to="/psicologo_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> <span class="nav-label">Informes</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Tsocial'">
                <router-link class="nav-link" to="/tsocial_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> <span class="nav-label">Informes</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Nutricionista'">
                <router-link class="nav-link" to="/nutricionista_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> <span class="nav-label">Informes</span>
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Enfermero'">
                <router-link class="nav-link" to="/enfermero_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> <span class="nav-label">Informes</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link class="nav-link" to="/consulta_pacientes" @click="onNavLinkClick">
                  <i class="bi bi-search"></i> <span class="nav-label">Pacientes</span>
                </router-link>
              </li>

              <template v-if="userData && userData.cargo === 'superusuario'">
                <li class="nav-item">
                  <router-link class="nav-link" to="/superusuario" @click="onNavLinkClick">
                    <i class="bi bi-shield-lock-fill"></i> <span class="nav-label">Panel<br>Super</span>
                  </router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" to="/registrousuarios" @click="onNavLinkClick">
                    <i class="bi bi-people-fill"></i> <span class="nav-label">Usuarios</span>
                  </router-link>
                </li>
              </template>

              <template v-if="userData && userData.cargo === 'admin'">
                <li class="nav-item">
                  <router-link class="nav-link" to="/admin_programavisitas" @click="onNavLinkClick">
                    <i class="bi bi-car-front"></i> <span class="nav-label">Prog<br>Visitas</span>
                  </router-link>
                </li>

                <li class="nav-item">
                  <router-link class="nav-link" to="/registrousuarios" @click="onNavLinkClick">
                    <i class="bi bi-person-fill"></i> <span class="nav-label">Usuarios</span>
                  </router-link>
                </li>

                <li class="nav-item">
                  <router-link class="nav-link" to="/admin_parametros" @click="onNavLinkClick">
                    <i class="bi bi-sliders"></i> <span class="nav-label">Parámetros</span>
                  </router-link>
                </li>

                <li class="nav-item">
                  <router-link class="nav-link" to="/admin_informes" @click="onNavLinkClick">
                    <i class="bi bi-file-earmark-medical"></i> <span class="nav-label">Informes</span>
                  </router-link>
                </li>

                <li class="nav-item">
                  <router-link class="nav-link" to="/admin_caracterizacion" @click="onNavLinkClick">
                    <i class="bi bi-file-person"></i> <span class="nav-label">Reg<br>Caract</span>
                  </router-link>
                </li>
              </template>

              <li class="nav-item" v-if="canViewEstadoProfesional">
                <router-link class="nav-link" to="/admin_estado_profesional" @click="onNavLinkClick">
                  <i class="bi bi-person-badge-fill"></i> <span class="nav-label">Profesionales<br>delegados</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link class="nav-link" to="/homeviews" @click="onNavLinkClick">
                  <i class="bi bi-house-door-fill"></i> <span class="nav-label">Home</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link class="nav-link" to="/info" @click="onNavLinkClick">
                  <i class="bi bi-info-circle"></i> <span class="nav-label">Info</span>
                </router-link>
              </li>

              <li class="nav-item">
                <router-link class="nav-link" to="/cambiar-password" @click="onNavLinkClick">
                  <i class="bi bi-key-fill"></i> <span class="nav-label">Cambiar<br>clave</span>
                </router-link>
              </li>

              <li class="nav-item">
                <button type="button" class="logout-btn" @click="logoutUser">
                  <i class="bi bi-x-circle"></i> <span class="nav-label">Salir</span>
                </button>
              </li>
            </ul>
            <div class="offcanvas-logo-footer">
              <img src="@/assets/images/logo_extramurapp.png" alt="ExtramuApp Logo" class="offcanvas-app-logo" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { ipsApi } from "@/api/modulesApi";
// En navbar.vue

export default {
  data() {
    return {
      ipsBranding: {},
      logoLoadFailed: false,
    };
  },
  methods: {
    ...mapActions(["userLogout"]),
    async logoutUser() {
      try {
        // Redirigir a logout mientras se ejecuta el logout
        this.$router.push("/logout").then(() => {
          this.userLogout();
        }).catch(() => {
          // Si la redirección falla, ejecutar logout de todas formas
          this.userLogout();
        });
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        this.userLogout();
      }
    },

    closeOffcanvas() {
      const offcanvasEl = document.getElementById("offcanvasNavbar");
      if (offcanvasEl && window.bootstrap) {
        let offcanvasInstance = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (!offcanvasInstance) {
          offcanvasInstance = new window.bootstrap.Offcanvas(offcanvasEl);
        }
        offcanvasInstance.hide();
      }
    },
    onNavLinkClick() {
      this.closeOffcanvas();
    },
    getCurrentIpsId() {
      const ipsId = String(
        this.userData?.ipsId ||
        this.userData?.ips_id ||
        this.userData?.idips ||
        this.userData?.ips ||
        this.dataips?.id ||
        this.dataips?.ipsId ||
        this.dataips?.ips_id ||
        ""
      ).trim();
      return ipsId || null;
    },
    async cargarBrandingIps() {
      const ipsId = this.getCurrentIpsId();
      if (!ipsId) return;
      try {
        const ips = await ipsApi.getById(ipsId);
        this.ipsBranding = ips && typeof ips === "object" ? ips : {};
        this.logoLoadFailed = false;
      } catch (error) {
        console.error("No fue posible cargar branding de IPS para navbar:", error);
      }
    },
    onIpsLogoError() {
      this.logoLoadFailed = true;
      console.warn("No se pudo cargar el logo de IPS. Verifica que la URL sea publica y directa a imagen:", this.ipsLogoUrl);
    },
  },
  computed: {
        esConvenioExtramural() {
          return String(this.userData?.convenio || "").trim().toLowerCase() === "extramural";
        },
    ...mapState(["userData", "dataips"]),
    ipsNombreMostrado() {
      const fromBranding = String(this.ipsBranding?.nombre || "").trim();
      if (fromBranding) return fromBranding;

      const fromDataips = String(this.dataips?.nombre || "").trim();
      if (fromDataips) return fromDataips;

      const fromUser = String(
        this.userData?.ipsNombre ||
        this.userData?.ips_name ||
        this.userData?.ips ||
        ""
      ).trim();
      return fromUser;
    },
    ipsLogoUrl() {
      const fromBranding = String(this.ipsBranding?.logoUrl || this.ipsBranding?.logo_url || "").trim();
      if (fromBranding) return fromBranding;

      const fromDataips = String(this.dataips?.logoUrl || this.dataips?.logo_url || "").trim();
      if (fromDataips) return fromDataips;
      return "";
    },
    ipsColorInstitucional() {
      const fromBranding = String(this.ipsBranding?.colorInstitucional || this.ipsBranding?.color_institucional || "").trim();
      if (fromBranding) return fromBranding;

      const fromDataips = String(this.dataips?.colorInstitucional || this.dataips?.color_institucional || "").trim();
      return fromDataips || "#0d6efd";
    },
    ipsSubtleStyle() {
      const color = this.ipsColorInstitucional;
      return {
        background: color,
        borderColor: `${color}CC`,
        boxShadow: `inset 0 0 0 1px ${color}`,
        color: "#ffffff",
      };
    },
    convenioThemeClass() {
      const convenio = String(this.userData?.convenio || "").trim().toLowerCase();

      if (convenio === "e basicos") return "tema-ebasicos";
      if (convenio === "pic") return "tema-pic";
      return "";
    },
    isAdminUser() {
      const cargo = String(this.userData?.cargo || "").trim().toLowerCase();
      return cargo === "admin" || cargo === "administrador";
    },
    canViewEstadoProfesional() {
      const cargo = String(this.userData?.cargo || "").trim().toLowerCase();
      return Boolean(this.userData && (this.userData.numDocumento || cargo === "admin" || cargo === "administrador" || cargo === "superusuario"));
    },
  },
  watch: {
    userData: {
      immediate: true,
      deep: true,
      handler() {
        this.cargarBrandingIps();
      },
    },
  },
};
</script>

<style scoped>
/* Mantener colores de fondo originales y mejorar visualización */
.navbar.bg-body-tertiary {
  background: linear-gradient(
    90deg,
    #0b4f7d 0%,
    #0369a1 18%,
    #0ea5e9 34%,
    #38bdf8 50%,
    #0ea5e9 66%,
    #0369a1 82%,
    #0b4f7d 100%
  ) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0.36rem 0 !important;
}

.tema-ebasicos .navbar.bg-body-tertiary {
  background: linear-gradient(
    90deg,
    #0f766e 0%,
    #0d9488 18%,
    #14b8a6 34%,
    #5eead4 50%,
    #14b8a6 66%,
    #0d9488 82%,
    #0f766e 100%
  ) !important;
}

.tema-pic .navbar.bg-body-tertiary {
  background: linear-gradient(
    90deg,
    #9a3412 0%,
    #c2410c 18%,
    #f97316 34%,
    #fdba74 50%,
    #f97316 66%,
    #c2410c 82%,
    #9a3412 100%
  ) !important;
}

.tema-admin-dorado .navbar.bg-body-tertiary {
  background: linear-gradient(
    90deg,
    #6f4e00 0%,
    #8b6508 16%,
    #b8860b 34%,
    #d4af37 50%,
    #b8860b 66%,
    #8b6508 84%,
    #6f4e00 100%
  ) !important;
}

.container-fluid {
  padding: 0 0.3rem !important;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.navbar-toggler {
  padding: 0.18rem 0.35rem !important;
  width: auto;
  height: auto;
  border: 2px solid #fff !important;
  border-radius: 5px;
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

.offcanvas {
  background: #0369a1 !important;
  width: fit-content !important;
  min-width: 116px;
  max-width: min(76vw, 190px);
}

.tema-ebasicos .offcanvas {
  background: #0d9488 !important;
}

.tema-pic .offcanvas {
  background: #c2410c !important;
}

.tema-admin-dorado .offcanvas {
  background: #8b6508 !important;
}

.offcanvas-body {
  padding: 0.35rem 0.25rem !important;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.offcanvas-body .navbar-nav {
  flex: 1 1 auto;
  min-height: 0;
  padding-right: 0 !important;
  width: max-content;
  min-width: 100%;
  max-width: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start !important;
  gap: 0.28rem;
}

.offcanvas-header {
  position: relative;
  justify-content: center;
  padding: 0.55rem 0.3rem 0.4rem !important;
}

.offcanvas-header .btn-close {
  position: absolute;
  right: 0.3rem;
  top: 50%;
  transform: translateY(-50%);
}

.offcanvas-profile {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.3rem;
  width: 100%;
}

.offcanvas-app-logo {
  width: 86px;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 0;
  background: transparent;
  padding: 0;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.42));
}

.offcanvas-profile-icon {
  color: #fff;
  font-size: 1.9rem;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-shadow: 1px 1px 4px #000;
  flex-shrink: 0;
}

.offcanvas-profile-name {
  color: #fff;
  text-shadow: 1px 1px 4px #000;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin: 0 !important;
  line-height: 1;
  text-align: center;
}

.offcanvas-title,
.offcanvas-header h6 {
  color: #fff;
  text-shadow: 1px 1px 4px #000;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 !important;
}

.navbar-nav .nav-link,
.navbar-nav strong,
.navbar-nav .nav-item {
  color: #fff !important;
  text-shadow: 0 1px 3px rgba(15, 23, 42, 0.5), 0 2px 5px rgba(0, 0, 0, 0.28);
  font-size: 0.31rem;
  font-weight: 400;
  letter-spacing: 0.01em;
  padding: 0.28rem 0.24rem !important;
  margin: 0.1rem 0 !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.06rem;
  min-height: 48px;
  text-align: center;
  width: 100%;
  min-width: max-content;
  line-height: 1.1;
  overflow: hidden;
  white-space: normal;
  text-overflow: ellipsis;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: none;
  transition: all 0.18s ease;
}

.offcanvas-body .navbar-nav .nav-link,
.offcanvas-body .navbar-nav .logout-btn {
  text-align: center !important;
  align-items: center !important;
  justify-content: center !important;
}

.offcanvas-body .navbar-nav > .nav-item {
  margin: 0 !important;
}

.offcanvas-body .navbar-nav > .nav-item + .nav-item {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 0.2rem;
}

.nav-label {
  display: block;
  line-height: 1.08;
  white-space: nowrap;
}

.offcanvas-logo-footer {
  margin-top: auto;
  padding: 0.65rem 0.2rem 0.35rem;
  display: flex;
  justify-content: center;
}

.navbar-nav .nav-link.router-link-exact-active {
  color: #FFC107 !important;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.75), 0 1px 4px rgba(15, 23, 42, 0.35);
  box-shadow: inset 0 0 0 1px rgba(255, 193, 7, 0.5), 0 2px 6px rgba(15, 23, 42, 0.18);
  transition: all 0.2s ease;
}

.tema-admin-dorado .navbar-nav .nav-link.router-link-exact-active {
  color: #FFC107 !important;
  background: rgba(255, 255, 255, 0.2);
}

.navbar-nav i {
  font-size: 1.15rem;
  margin-right: 0;
  vertical-align: middle;
  flex-shrink: 0;
  text-shadow: 0 1px 3px rgba(15, 23, 42, 0.55), 0 2px 5px rgba(0, 0, 0, 0.32);
}

.logout-btn {
  background: none;
  border: none;
  color: #fff !important;
  text-shadow: 0 1px 3px rgba(15, 23, 42, 0.5), 0 2px 5px rgba(0, 0, 0, 0.28);
  font-size: 0.31rem;
  font-weight: 400;
  padding: 0.28rem 0.24rem !important;
  margin: 0.1rem 0 !important;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.06rem;
  min-height: 48px;
  transition: all 0.18s ease;
  width: 100%;
  min-width: max-content;
  text-align: center;
  justify-self: stretch;
  line-height: 1.1;
  overflow: hidden;
  white-space: normal;
  text-overflow: ellipsis;
}

.navbar-nav .nav-link:hover,
.logout-btn:hover {
  color: #ffffff !important;
  background: rgba(14, 165, 233, 0.26);
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgba(186, 230, 253, 0.5);
  transform: translateY(-1px);
}

.tema-admin-dorado .navbar-nav .nav-link:hover,
.tema-admin-dorado .logout-btn:hover {
  background: rgba(255, 215, 128, 0.28);
  box-shadow: inset 0 0 0 1px rgba(255, 234, 173, 0.58);
}

.blanco {
  color: #fff !important;
  text-shadow: 1px 1px 4px #000;
  font-size: 0.85rem;
}

.navbar-company-brand {
  flex: 1 1 auto;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  text-align: center;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  white-space: nowrap;
}

.navbar-company-logo {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.92);
  padding: 3px;
  flex-shrink: 0;
}

.navbar-company-logo-fallback {
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #0f172a;
  flex-shrink: 0;
}

.navbar-company-name {
  min-width: 0;
  max-width: min(58vw, 720px);
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 1.08rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.user-info-badge {
  display: flex;
  align-items: center;
  gap: 0;
  border: none;
  border-radius: 0;
  padding: 0;
  background: transparent;
  max-width: 210px;
}

.user-info-icon {
  color: #fff;
  font-size: 1.3rem;
  flex-shrink: 0;
  text-shadow: 1px 1px 4px #000;
}

.user-info-text {
  margin: 0 !important;
  line-height: 1.15;
  font-size: 0.84rem;
}

.user-info-line {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .navbar.bg-body-tertiary {
    padding: 0.24rem 0 !important;
  }

  .offcanvas {
    width: fit-content !important;
    min-width: 84px;
    max-width: min(82vw, 160px);
  }

  .offcanvas-body {
    padding: 0.2rem !important;
    padding-bottom: 1.4rem !important;
  }

  .offcanvas-body .navbar-nav {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.3rem;
    padding-right: 0 !important;
    width: max-content;
    min-width: 100%;
    max-width: 150px;
  }

  .offcanvas-body .navbar-nav .nav-item {
    margin: 0 !important;
    border-top: none;
    padding-top: 0;
  }

  .navbar-nav .nav-link,
  .logout-btn {
    min-height: 42px;
    padding: 0.24rem 0.14rem !important;
    margin: 0 !important;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.08rem;
    text-align: center;
    font-size: 0.078rem;
    font-weight: 300;
    text-shadow: 0 1px 2px rgba(15, 23, 42, 0.28);
    line-height: 1.02;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    overflow-wrap: normal;
    word-break: normal;
    hyphens: none;
  }

  .navbar-nav .nav-link i,
  .logout-btn i {
    font-size: 1.13rem;
    margin-right: 0;
  }

  .navbar-nav .nav-link.router-link-exact-active {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 193, 7, 0.55);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.75), 0 1px 4px rgba(15, 23, 42, 0.35);
  }

  .navbar-company-brand {
    gap: 7px;
  }

  .navbar-company-logo,
  .navbar-company-logo-fallback {
    width: 36px;
    height: 36px;
    border-radius: 7px;
  }

  .navbar-company-name {
    max-width: 46vw;
    font-size: 0.86rem;
  }

  .user-info-badge {
    width: auto;
    min-height: auto;
    max-width: 92px;
    border-radius: 0;
    padding: 0;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    text-align: left;
  }

  .user-info-icon {
    font-size: 2rem;
  }

  .user-info-text {
    font-size: 0.62rem;
    font-weight: 400;
    width: auto;
  }

  .user-info-line-top {
    display: none;
  }

  .user-info-line-bottom {
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.1;
  }
}

@media (max-width: 480px) {
  .navbar.bg-body-tertiary {
    padding: 0.2rem 0 !important;
  }

  .offcanvas {
    width: fit-content !important;
    min-width: 79px;
    max-width: min(86vw, 150px);
  }

  .offcanvas-body .navbar-nav {
    gap: 0.24rem;
  }

  .navbar-nav .nav-link,
  .logout-btn {
    min-height: 37px;
    font-size: 0.073rem;
    font-weight: 300;
    padding: 0.2rem 0.1rem !important;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(15, 23, 42, 0.28);
  }

  .navbar-nav .nav-link i,
  .logout-btn i {
    font-size: 1.05rem;
  }

  .navbar-company-logo,
  .navbar-company-logo-fallback {
    width: 32px;
    height: 32px;
  }

  .navbar-company-name {
    max-width: 42vw;
    font-size: 0.72rem;
  }

  .user-info-badge {
    width: auto;
    min-height: auto;
    max-width: 84px;
    padding: 0;
  }

  .user-info-icon {
    font-size: 1.8rem;
  }

  .user-info-text {
    font-size: 0.54rem;
    font-weight: 400;
  }

  .offcanvas-app-logo {
    width: 69px;
  }

  .offcanvas-profile-name {
    font-size: 0.9rem;
    font-weight: 600;
  }
}
</style>

<template>
  <div class="app" :class="{ 'tema-ebasicos': userData && userData.convenio === 'E Basicos' }">
    <nav class="navbar bg-body-tertiary fixed-top">
      <div class="container-fluid">
        <!-- Botón toggler a la izquierda -->
        <button class="navbar-toggler me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <img src="@/assets/images/logo_extramurapp.png" alt="ExtramuApp Logo" class="navbar-logo" />
        <div class="user-info-badge">
          <h6 v-if="userData && userData.nombre" class="text-start text-capitalize blanco user-info-text">
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
              <i class="bi bi-grid-fill offcanvas-profile-icon"></i>
              <h1 class="offcanvas-profile-name text-capitalize">Menú</h1>
            </div>

            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>

          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li class="nav-item" v-if="userData && userData.cargo === 'Fact'">
                <router-link class="nav-link" to="/sop_facturacion" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Facturador
                </router-link>
              </li>

              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria'">
                <router-link class="nav-link" to="/sop_aux" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Auxiliar
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria' && userData.convenio !== 'E Basicos'">
                <router-link class="nav-link" to="/sop_agendas" @click="onNavLinkClick">
                  <i class="bi bi-calendar2-date"></i> Agendas
                </router-link>
              </li>

              <li class="nav-item" v-if="userData && userData.cargo === 'Medico'">
                <router-link class="nav-link" to="/sop_profesional" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Medico
                </router-link>
              </li>
                <li class="nav-item" v-if="userData && userData.cargo === 'Psicologo'">
                 <router-link class="nav-link" to="/sop_psicologo" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Psicologo
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Tsocial'">
                <router-link class="nav-link" to="/sop_tsocial" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Trabajador Social
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Enfermero'">
                <router-link class="nav-link" to="/sop_enfermero" @click="onNavLinkClick">
                  <i class="bi bi-person-circle"></i> Enfermer@
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Admin'">
                <router-link class="nav-link" to="/admin_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> Informes
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Medico'">
                <router-link class="nav-link" to="/medico_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> Informes
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Auxiliar de enfermeria'">
                <router-link class="nav-link" to="/aux_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> Informes
                </router-link>
              </li>
              <li class="nav-item" v-if="userData && userData.cargo === 'Enfermero'">
                <router-link class="nav-link" to="/enfermero_informes" @click="onNavLinkClick">
                  <i class="bi bi-bar-chart-fill"></i> Informes
                </router-link>
              </li>

              <li class="nav-item">
                <router-link class="nav-link" to="/consulta_pacientes" @click="onNavLinkClick">
                  <i class="bi bi-search"></i> Pacientes
                </router-link>
              </li>

              <template v-if="userData && userData.cargo === 'superusuario'">
                <li class="nav-item">
                  <router-link class="nav-link" to="/superusuario" @click="onNavLinkClick">
                    <i class="bi bi-shield-lock-fill"></i> Panel Super
                  </router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" to="/registrousuarios" @click="onNavLinkClick">
                    <i class="bi bi-people-fill"></i> Usuarios
                  </router-link>
                </li>
              </template>

              <template v-if="userData && userData.cargo === 'admin'">
                <li class="nav-item">
                  <router-link class="nav-link" to="/admin_programavisitas" @click="onNavLinkClick">
                    <i class="bi bi-car-front"></i> Prog Visitas
                  </router-link>
                </li>

                <li class="nav-item">
                  <router-link class="nav-link" to="/registrousuarios" @click="onNavLinkClick">
                    <i class="bi bi-person-fill"></i> Usuarios
                  </router-link>
                </li>

                <li class="nav-item">
                  <router-link class="nav-link" to="/admin_parametros" @click="onNavLinkClick">
                    <i class="bi bi-sliders"></i> Parámetros
                  </router-link>
                </li>

                <li class="nav-item">
                  <router-link class="nav-link" to="/admin_informes" @click="onNavLinkClick">
                    <i class="bi bi-file-earmark-medical"></i> Informes
                  </router-link>
                </li>

                <li class="nav-item">
                  <router-link class="nav-link" to="/admin_caracterizacion" @click="onNavLinkClick">
                    <i class="bi bi-file-person"></i> Reg Caract
                  </router-link>
                </li>
              </template>

              <li class="nav-item">
                <router-link class="nav-link" to="/homeviews" @click="onNavLinkClick">
                  <i class="bi bi-house-door-fill"></i> Home
                </router-link>
              </li>

              <li class="nav-item">
                <router-link class="nav-link" to="/info" @click="onNavLinkClick">
                  <i class="bi bi-info-circle"></i> Info
                </router-link>
              </li>

              <li class="nav-item">
                <router-link class="nav-link" to="/cambiar-password" @click="onNavLinkClick">
                  <i class="bi bi-key-fill"></i> Cambiar contraseña
                </router-link>
              </li>

              <li class="nav-item">
                <button type="button" class="logout-btn" @click="logoutUser">
                  <i class="bi bi-x-circle"></i> Salir
                </button>
              </li>
            </ul>
            <div class="sidebar-version" style="
                position: absolute;
                bottom: 5px;
                left: 0;
                width: 100%;
                text-align: center;
                font-size: 0.65rem;
                color: #333;
                opacity: 0.7;
              ">
              <p style="margin: 0; padding: 0;">Version 2.6  25/03/2026</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
// En navbar.vue

export default {
  methods: {
    ...mapActions(["userLogout"]),
    clearLocalStorage() {
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
    },
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
  },
  computed: {
    ...mapState(["uid", "userData"]),
  },
};
</script>

<style scoped>
/* Mantener colores de fondo originales y mejorar visualización */
.navbar.bg-body-tertiary {
  background: linear-gradient(
    90deg,
    #5b21b6 0%,
    #6d28d9 18%,
    #8b5cf6 34%,
    #f3ecff 50%,
    #8b5cf6 66%,
    #6d28d9 82%,
    #5b21b6 100%
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
    #e6fffa 50%,
    #14b8a6 66%,
    #0d9488 82%,
    #0f766e 100%
  ) !important;
}

.container-fluid {
  padding: 0 0.3rem !important;
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
  background: linear-gradient(
    180deg,
    #5b21b6 0%,
    #6d28d9 24%,
    #8b5cf6 48%,
    #c4b5fd 72%,
    #f3ecff 88%,
    #ffffff 100%
  ) !important;
  width: 146px !important;
}

.tema-ebasicos .offcanvas {
  background: linear-gradient(
    180deg,
    #0f766e 0%,
    #0d9488 24%,
    #14b8a6 48%,
    #99f6e4 72%,
    #e6fffa 88%,
    #ffffff 100%
  ) !important;
}

.offcanvas-body {
  padding: 0.35rem 0.25rem !important;
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
  text-shadow: 1px 1px 4px #000;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  padding: 0.32rem 0.55rem !important;
  margin: 0.32rem 0 !important;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  line-height: 1.1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.navbar-nav .nav-link.router-link-exact-active {
  color: #ffc107 !important;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  transition: all 0.2s ease;
}

.navbar-nav i {
  font-size: 0.9rem;
  margin-right: 0.2em;
  vertical-align: middle;
  flex-shrink: 0;
}

.sidebar-version {
  color: #bbb !important;
  font-size: 0.65rem !important;
  padding: 0 !important;
  margin: 0 !important;
}

.logout-btn {
  background: none;
  border: none;
  color: #fff !important;
  text-shadow: 1px 1px 4px #000;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.32rem 0.55rem !important;
  margin: 0.32rem 0 !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.2s ease;
  width: 100%;
  text-align: left;
  line-height: 1.1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.logout-btn:hover {
  color: #ff6b6b !important;
}

.blanco {
  color: #fff !important;
  text-shadow: 1px 1px 4px #000;
  font-size: 0.85rem;
}

.navbar-logo {
  height: 42px;
  width: auto;
  object-fit: contain;
  margin: 0 0.25rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
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
    width: 136px !important;
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
  }

  .offcanvas-body .navbar-nav .nav-item {
    margin: 0 !important;
  }

  .navbar-nav .nav-link,
  .logout-btn {
    min-height: 70px;
    padding: 0.35rem 0.2rem !important;
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
    font-size: 0.54rem;
    font-weight: 400;
    line-height: 1.1;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .navbar-nav .nav-link i,
  .logout-btn i {
    font-size: 1.9rem;
    margin-right: 0;
  }

  .navbar-nav .nav-link.router-link-exact-active {
    background: rgba(255, 193, 7, 0.18);
    border-color: rgba(255, 193, 7, 0.45);
  }

  .navbar-logo {
    height: 36px;
    margin: 0px 0.18rem;
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
    width: 126px !important;
  }

  .offcanvas-body .navbar-nav {
    gap: 0.24rem;
  }

  .navbar-nav .nav-link,
  .logout-btn {
    min-height: 66px;
    font-size: 0.5rem;
    font-weight: 400;
    padding: 0.28rem 0.14rem !important;
  }

  .navbar-nav .nav-link i,
  .logout-btn i {
    font-size: 1.75rem;
  }

  .navbar-logo {
    height: 32px;
    margin: 0px 0.12rem;
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

  .offcanvas-profile-icon {
    font-size: 1.6rem;
    width: 38px;
    height: 38px;
  }

  .offcanvas-profile-name {
    font-size: 0.9rem;
    font-weight: 600;
  }
}
</style>

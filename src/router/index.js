import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes = [
  /* Soportes */
  {
    path: "/",
    name: "home",
    component: () => import("../views/dashboard.vue"),
    meta: { hideNavbar: true }
  },
  /* Rutas equipo */

  {
    path: "/homeviews",
    name: "homeviews",
    component: () => import("../views/HomeView.vue"),
  },

  /* --------------------------------------------- */

  {
    path: "/sop_encuesta",
    name: "sop_encuesta",
    component: () => import("../views/sop_encuesta.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_agendas",
    name: "sop_agendas",
    component: () => import("../views/sop_agendas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_facturacion",
    name: "sop_facturacion",
    component: () => import("../views/sop_facturacion.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/sop_aux",
    name: "sop_aux",
    component: () => import("../views/sop_aux.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_agendamiento/:idEncuesta/:tipo",
    name: "sop_agendamiento",
    component: () => import("../views/sop_agendamiento.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_profesional",
    name: "sop_profesional",
    component: () => import("../views/sop_profesional.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/sop_enfermero",
    name: "sop_enfermero",
    component: () => import("../views/sop_enfermero.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_psicologo",
    name: "sop_psicologo",
    component: () => import("../views/sop_psicologo.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_tsocial",
    name: "sop_tsocial",
    component: () => import("../views/sop_tsocial.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_nutricionista",
    name: "sop_nutricionista",
    component: () => import("../views/sop_nutricionista.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sop_caracterizacion/:idEncuesta",
    name: "sop_caracterizacion",
    component: () => import("../views/sop_caracterizacion.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/sop_cups/:idEncuesta",
    name: "sop_cups",
    component: () => import("../views/sop_cups.vue"),
    meta: { requiresAuth: true },
  },
  /* Admin */
  {
    path: "/admin_encuestas",
    name: "admin_encuestas",
    component: () => import("../views/admin_encuestas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_parametros",
    name: "admin_parametros",
    component: () =>
      import("../views/admin_parametros.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/consulta_pacientes",
    name: "consulta_pacientes",
    component: () =>
      import("../views/consulta_pacientes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/aux_informes",
    name: "aux_informes",
    component: () => import("../views/aux_informes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_informes",
    name: "admin_informes",
    component: () => import("../views/admin_informes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/medico_informes",
    name: "medico_informes",
    component: () => import("../views/medico_informes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/enfermero_informes",
    name: "enfermero_informes",
    component: () => import("../views/enfermero_informes.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_ips",
    name: "admin_ips",
    component: () => import("../views/admin_ips.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_programavisitas",
    name: "admin_programavisitas",
    component: () =>
      import("../views/admin_programavisitas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_registrousuarios",
    name: "admin_registrousuarios",
    component: () => import("../views/registrousuarios.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin_caracterizacion",
    name: "admin_caracterizacion",
    component: () => import("../views/admin_caracterizacion.vue"),
    meta: { requiresAuth: true },
  },




  /* Login y registro */
  {
    path: "/login",
    name: "login",
    component: () => import("../views/login.vue"),
    meta: { hideNavbar: true }
  },
  {
    path: "/registrousuarios",
    name: "registrousuarios",
    component: () => import("../views/registrousuarios.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/info",
    name: "info",
    component: () => import("../views/info.vue"),
    meta: { requiresAuth: true },
  },

  {
    path: "/logout",
    name: "logout",
    component: () => import("../views/logout.vue"),
    meta: { hideNavbar: true }
  },
  {
    path: "/cambiar-password",
    name: "cambiar_password",
    component: () => import("../views/cambiar_password.vue"),
    meta: { requiresAuth: true },
  },
  /* Superusuario */
  {
    path: "/superusuario",
    name: "superusuario",
    component: () => import("../views/superusuario.vue"),
    meta: { requiresAuth: true, requiresSuperUser: true },
  },

  /* Ruta catch-all para redirigir rutas no definidas */
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Mantener posición del scroll cuando navegas hacia atrás
    if (savedPosition) {
      return savedPosition;
    } else {
      return { left: 0, top: 0 };
    }
  }
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const loggedIn = !!token;

  // Si está logueado y debe cambiar contraseña, forzar la ruta (excepto si ya está en ella o en logout/login)
  if (loggedIn && to.name !== "cambiar_password" && to.name !== "logout" && to.name !== "login") {
    try {
      const raw = localStorage.getItem("userData");
      const userData = raw ? JSON.parse(raw) : {};
      if (userData?.mustChangePassword) {
        return next({ name: "cambiar_password", query: { required: "true" } });
      }
    } catch (_) {}
  }

  console.log(`[Router] Navegando de ${from.name} a ${to.name} - Token: ${loggedIn ? 'SÍ' : 'NO'}`);

  // Si la ruta requiere autenticación, validar token
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!loggedIn) {
      console.warn(`[Router] NO autenticado en ruta protegida ${to.name}: redirigiendo a login`);
      next("/login");
    } else {
      // Verificar rol superusuario si la ruta lo exige
      if (to.matched.some((record) => record.meta.requiresSuperUser)) {
        try {
          const raw = localStorage.getItem("userData");
          const userData = raw ? JSON.parse(raw) : {};
          if (userData?.cargo !== "superusuario") {
            console.warn(`[Router] Acceso denegado a ${to.name}: requiere superusuario`);
            return next("/");
          }
        } catch (_) {
          return next("/");
        }
      }
      // Token existe, permitir navegación
      console.log(`[Router] Autenticado - permitiendo acceso a ${to.name}`);
      next();
    }
  } else {
    // Rutas públicas (login, logout, etc)
    console.log(`[Router] Ruta pública ${to.name} - permitiendo acceso`);
    next();
  }
});
export default router;

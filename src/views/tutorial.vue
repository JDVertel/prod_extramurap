<template>
  <div class="container-fluid mt-5 pt-3 tutorial-page" :style="{ '--role-color': manual.color }">
    <div class="tutorial-hero">
      <div class="tutorial-hero-icon">
        <i :class="['bi', manual.icono]"></i>
      </div>
      <div>
        <p class="tutorial-kicker mb-1">Tutorial personalizado</p>
        <h3 class="mb-1">{{ manual.titulo }}</h3>
        <p class="mb-0 tutorial-resumen">{{ manual.resumen }}</p>
        <div class="tutorial-meta mt-2">
          <span class="badge role-badge">
            <i class="bi bi-person-badge me-1"></i>{{ cargoActual || "Sin cargo" }}
          </span>
          <span v-if="convenioActual" class="badge convenio-badge">
            <i class="bi bi-diagram-3 me-1"></i>{{ convenioActual }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="manual.flujoResumen?.length" class="tutorial-section mt-4">
      <h5 class="section-title"><i class="bi bi-signpost-2-fill me-2"></i>Mapa del flujo</h5>
      <div class="flujo-mapa">
        <div
          v-for="(etapa, idx) in manual.flujoResumen"
          :key="`flujo-${idx}`"
          class="flujo-chip"
        >
          <span class="flujo-chip-num">{{ idx + 1 }}</span>
          <span>{{ etapa }}</span>
          <i v-if="idx < manual.flujoResumen.length - 1" class="bi bi-chevron-right flujo-arrow"></i>
        </div>
      </div>
    </div>

    <div class="tutorial-section mt-4">
      <h5 class="section-title"><i class="bi bi-grid-1x2-fill me-2"></i>Tus modulos</h5>
      <div class="row g-3">
        <div
          v-for="modulo in manual.modulos"
          :key="modulo.ruta + modulo.nombre"
          class="col-6 col-md-4 col-lg-3"
        >
          <button type="button" class="modulo-card" @click="irA(modulo.ruta)">
            <span class="modulo-icon" :style="{ background: manual.color }">
              <i :class="['bi', modulo.icono]"></i>
            </span>
            <strong>{{ modulo.nombre }}</strong>
            <small>{{ modulo.desc }}</small>
          </button>
        </div>
      </div>
    </div>

    <div
      v-for="(seccion, index) in manual.secciones"
      :key="`sec-${index}`"
      class="tutorial-section mt-4"
    >
      <h5 class="section-title">
        <i :class="['bi', seccion.icono, 'me-2']" :style="{ color: seccion.color || manual.color }"></i>
        {{ seccion.titulo }}
      </h5>
      <p v-if="seccion.intro" class="section-intro">{{ seccion.intro }}</p>

      <div v-if="seccion.imagenKey" class="tutorial-visual mb-3">
        <div class="visual-panel" :data-visual="seccion.imagenKey">
          <div class="visual-illustration" :class="`visual-${seccion.imagenKey}`">
            <template v-if="seccion.imagenKey === 'bandeja'">
              <div class="fake-card">
                <span class="fake-dot"></span>
                <span class="fake-line w-60"></span>
                <span class="fake-line w-40"></span>
                <div class="fake-actions">
                  <i class="bi bi-calendar2-check" title="Caract"></i>
                  <i class="bi bi-heart-pulse" title="Cups"></i>
                  <i class="bi bi-gear-fill highlight" title="Gest"></i>
                </div>
              </div>
              <div class="fake-card soft">
                <span class="fake-dot"></span>
                <span class="fake-line w-50"></span>
                <span class="fake-line w-35"></span>
              </div>
            </template>
            <template v-else-if="seccion.imagenKey === 'flujo'">
              <div class="flow-step" v-for="n in 4" :key="`flow-${n}`">
                <span class="flow-num">{{ n }}</span>
                <i
                  :class="[
                    'bi',
                    n === 1 ? 'bi-search' : n === 2 ? 'bi-clipboard2-check' : n === 3 ? 'bi-heart-pulse' : 'bi-check2-circle',
                  ]"
                ></i>
              </div>
            </template>
            <template v-else-if="seccion.imagenKey === 'caracterizacion'">
              <div class="vital-chip" v-for="item in vitalChips" :key="item.icono">
                <i :class="['bi', item.icono]"></i>
                <small>{{ item.label }}</small>
              </div>
            </template>
            <template v-else>
              <i class="bi bi-clipboard2-pulse visual-fallback-icon"></i>
            </template>
          </div>
          <p class="visual-caption mb-0">Vista guiada de esta seccion</p>
        </div>
      </div>

      <div v-if="seccion.pasos?.length" class="pasos-grid">
        <div
          v-for="(paso, pIndex) in seccion.pasos"
          :key="`paso-${index}-${pIndex}`"
          class="paso-card"
        >
          <div class="paso-num" :style="{ background: seccion.color || manual.color }">
            {{ pIndex + 1 }}
          </div>
          <div class="paso-body">
            <div class="paso-title">
              <i :class="['bi', paso.icono, 'me-2']"></i>{{ paso.titulo }}
            </div>
            <p class="mb-0">{{ paso.texto }}</p>
            <ul v-if="paso.detalle?.length" class="paso-detalle">
              <li v-for="(item, dIndex) in paso.detalle" :key="`det-${index}-${pIndex}-${dIndex}`">
                {{ item }}
              </li>
            </ul>
            <div v-if="paso.alerta" class="paso-alerta">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ paso.alerta }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="seccion.tips?.length" class="tips-box mt-2">
        <div v-for="(tip, tIndex) in seccion.tips" :key="`tip-${index}-${tIndex}`" class="tip-item">
          <i class="bi bi-check-circle-fill me-2"></i>
          <span>{{ tip }}</span>
        </div>
      </div>
    </div>

    <div class="tutorial-footer mt-4 mb-3">
      <router-link to="/info" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-info-circle me-1"></i> Ver informacion general
      </router-link>
      <router-link to="/homeviews" class="btn btn-primary btn-sm">
        <i class="bi bi-house-door me-1"></i> Ir a Home
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getManualForCargo } from "@/constants/manualUsuario";

export default {
  name: "TutorialView",
  data() {
    return {
      vitalChips: [
        { icono: "bi-speedometer2", label: "Peso/Talla" },
        { icono: "bi-heart-pulse", label: "Tension" },
        { icono: "bi-thermometer-half", label: "Temp" },
        { icono: "bi-eye", label: "Visual" },
        { icono: "bi-shield-plus", label: "Vacunas" },
      ],
    };
  },
  computed: {
    ...mapState(["userData"]),
    cargoActual() {
      return String(this.userData?.cargo || "").trim();
    },
    convenioActual() {
      return String(this.userData?.convenio || "").trim();
    },
    manual() {
      return getManualForCargo(this.cargoActual);
    },
  },
  methods: {
    irA(ruta) {
      if (!ruta) return;
      this.$router.push(ruta);
    },
  },
};
</script>

<style scoped>
.tutorial-page {
  max-width: 980px;
}

.tutorial-hero {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1.15rem 1.25rem;
  border-radius: 16px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--role-color) 18%, #fff), #ffffff);
  border: 1px solid color-mix(in srgb, var(--role-color) 35%, #e5e7eb);
}

.tutorial-hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--role-color);
  color: #fff;
  font-size: 1.7rem;
  flex-shrink: 0;
}

.tutorial-kicker {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--role-color);
}

.tutorial-resumen {
  color: #334155;
  line-height: 1.5;
}

.tutorial-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.role-badge {
  background: var(--role-color);
}

.convenio-badge {
  background: #0f172a;
}

.section-title {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.85rem;
}

.section-intro {
  color: #475569;
  line-height: 1.5;
  margin-top: -0.35rem;
  margin-bottom: 0.9rem;
}

.flujo-mapa {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  align-items: center;
}

.flujo-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 0.35rem 0.65rem 0.35rem 0.35rem;
  font-size: 0.82rem;
  color: #334155;
  font-weight: 600;
}

.flujo-chip-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--role-color, #0f766e);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 0.72rem;
}

.flujo-arrow {
  color: #94a3b8;
  margin-left: 0.15rem;
}

.paso-detalle {
  margin: 0.55rem 0 0;
  padding-left: 1.1rem;
  color: #334155;
  font-size: 0.9rem;
}

.paso-detalle li {
  margin-bottom: 0.2rem;
}

.paso-alerta {
  margin-top: 0.55rem;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  font-size: 0.86rem;
}

.vital-chip {
  min-width: 78px;
  background: #fff;
  border: 1px solid #99f6e4;
  border-radius: 12px;
  padding: 0.55rem 0.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  color: #0f766e;
}

.vital-chip i {
  font-size: 1.15rem;
}

.vital-chip small {
  font-size: 0.68rem;
  font-weight: 700;
}

.modulo-card {
  width: 100%;
  height: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 0.9rem;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.modulo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.modulo-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 1.1rem;
}

.modulo-card strong {
  font-size: 0.92rem;
  color: #0f172a;
}

.modulo-card small {
  color: #64748b;
  line-height: 1.3;
}

.pasos-grid {
  display: grid;
  gap: 0.75rem;
}

.paso-card {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  padding: 0.85rem 0.95rem;
}

.paso-num {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.paso-title {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.2rem;
}

.paso-body p {
  color: #475569;
  font-size: 0.94rem;
  line-height: 1.45;
}

.tips-box {
  border-radius: 14px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 0.85rem 1rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.2rem;
  color: #78350f;
  margin-bottom: 0.4rem;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item i {
  color: #ca8a04;
  margin-top: 0.15rem;
}

.tutorial-visual {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.visual-panel {
  padding: 1rem;
}

.visual-illustration {
  min-height: 140px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ecfeff, #f0fdfa);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
}

.fake-card {
  width: min(220px, 46%);
  background: #0f766e;
  color: #ecfdf5;
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: 0 8px 18px rgba(15, 118, 110, 0.25);
}

.fake-card.soft {
  background: #14b8a6;
  opacity: 0.85;
}

.fake-dot {
  display: block;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  margin-bottom: 0.45rem;
}

.fake-line {
  display: block;
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.45);
  margin-bottom: 0.35rem;
}

.w-60 { width: 60%; }
.w-50 { width: 50%; }
.w-40 { width: 40%; }
.w-35 { width: 35%; }

.fake-actions {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.55rem;
}

.fake-actions i {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  display: grid;
  place-items: center;
}

.fake-actions i.highlight {
  background: #fbbf24;
  color: #78350f;
}

.flow-step {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #99f6e4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  color: #0f766e;
  font-size: 1.2rem;
}

.flow-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #0f766e;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.visual-caption {
  margin-top: 0.65rem;
  font-size: 0.82rem;
  color: #64748b;
  text-align: center;
}

.tutorial-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

@media (max-width: 640px) {
  .tutorial-hero {
    flex-direction: column;
  }

  .visual-illustration {
    flex-wrap: wrap;
  }
}
</style>

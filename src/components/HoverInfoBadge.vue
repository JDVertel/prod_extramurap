<template>
  <span
    class="hover-info-badge"
    @mouseenter="visible = true"
    @mouseleave="visible = false"
  >
    <span
      :class="['badge', badgeClass]"
      tabindex="0"
      @focus="visible = true"
      @blur="visible = false"
    >
      <slot />
    </span>

    <div v-if="visible && bodyLines.length" class="hover-info-popover" role="tooltip">
      <div class="hover-info-popover__title">{{ titleLine }}</div>
      <div class="hover-info-popover__body">
        <div v-for="(line, index) in bodyLines" :key="`${index}-${line}`" class="hover-info-popover__line">
          {{ line }}
        </div>
      </div>
    </div>
  </span>
</template>

<script>
export default {
  name: "HoverInfoBadge",
  props: {
    badgeClass: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  computed: {
    lines() {
      return String(this.content || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    },
    titleLine() {
      return this.lines[0] || "Detalle";
    },
    bodyLines() {
      return this.lines.slice(1);
    },
  },
};
</script>

<style scoped>
.hover-info-badge {
  position: relative;
  display: inline-flex;
}

.hover-info-badge .badge {
  cursor: help;
}

.hover-info-popover {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
  min-width: 280px;
  max-width: min(420px, 80vw);
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.18);
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
  color: #0f172a;
  z-index: 1100;
  text-align: left;
}

.hover-info-popover::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  border-width: 7px;
  border-style: solid;
  border-color: #ffffff transparent transparent transparent;
}

.hover-info-popover__title {
  font-weight: 700;
  font-size: 0.82rem;
  margin-bottom: 6px;
  color: #1e3a8a;
}

.hover-info-popover__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 220px;
  overflow-y: auto;
}

.hover-info-popover__line {
  font-size: 0.78rem;
  line-height: 1.3;
}

@media (max-width: 576px) {
  .hover-info-popover {
    left: 0;
    transform: none;
    min-width: 240px;
    max-width: min(320px, 88vw);
  }

  .hover-info-popover::after {
    left: 24px;
    transform: none;
  }
}
</style>
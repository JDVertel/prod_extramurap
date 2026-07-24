<template>
    <p class="text-center text-muted mb-2 profesional-grupo-info">
        <i class="bi bi-people-fill"></i> Grupo: <strong>{{ grupoTexto }}</strong>
    </p>
</template>

<script>
import { mapState } from "vuex";
import { formatearGruposFacturador } from "@/utils/grupoUtils.js";

export default {
    name: "ProfesionalGrupoInfo",
    props: {
        esEstadoView: {
            type: Boolean,
            default: false,
        },
        grupoOverride: {
            type: String,
            default: "",
        },
    },
    computed: {
        ...mapState(["userData"]),
        grupoTexto() {
            const override = String(this.grupoOverride || "").trim();
            if (override) return override;

            const grupo = this.esEstadoView
                ? String(this.$route?.query?.profesionalGrupo || "").trim()
                : String(this.userData?.grupo || "").trim();

            if (!grupo) return "-";

            const cargo = String(this.userData?.cargo || "").trim().toLowerCase();
            if (cargo === "fact" || cargo === "facturador") {
                return formatearGruposFacturador(grupo);
            }

            return grupo;
        },
    },
};
</script>

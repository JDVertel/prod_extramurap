<template>
  <div>
    <div class="container">
      <img :src="logo" alt="Logo Extramuralapp" class="logo" />
      <p class="text-center">Facilitando la salud, mejorando vidas</p>
      <div>
        <button class="btn btn-success" @click="$router.push({ name: 'login' })">
          Ir a Login
        </button>
      </div>
    </div>

    <footer>
      <p>By BigDataManagements.SAS</p>
    </footer>
  </div>
</template>

<script>
import logo from "../assets/images/logo_extramurapp.png";
export default {
  data() {
    return {
      logo,
    };
  },
};
</script>

<style>
.logo {
  max-width: 100%;
  height: auto;
  display: block;
  /* Opcional: elimina el espacio debajo de la imagen */
}
</style>

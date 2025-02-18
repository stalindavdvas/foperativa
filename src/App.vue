<template>
  <div class="app-container">
    <!-- Sidebar -->
    <Sidebar :active-page="activePage" @navigate="setActivePage" />

    <!-- Main Content -->
    <MainContent :active-page="activePage" />
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import MainContent from './components/MainContent.vue';

export default {
  components: { Sidebar, MainContent },
  data() {
    return {
      activePage: 'home', // Página activa por defecto
    };
  },
  methods: {
    setActivePage(page) {
      this.activePage = page;
    },
  },
};
</script>

<style>
.app-container {
  display: flex;
  height: 100vh;
}

/* Estilos generales */
body {
  margin: 0;
  font-family: Arial, sans-serif;
}
</style>
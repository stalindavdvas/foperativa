<template>
  <main class="main-content">
    <component :is="currentView" />
  </main>
</template>

<script>
import HomePage from '../views/Home.vue';
import SimplexPage from '../views/SimplexPage.vue';
import GranMPage from '../views/GranMP.vue';
import DosFasesMPage from '../views/DosFasesP.vue';
import DualPage from '../views/DualP.vue';
import EsqNor from '../views/EsquinaNoroesteP.vue';
import CosMin from '../views/CostoMinimoP.vue';
import VogelPage from '../views/VogelP.vue';
import CaminoCortoPage from '../views/CaminoCortoP.vue';
import FlujoMaximoPage from '../views/FlujoMaximoP.vue';
import FlujoCostoMinPage from '../views/FlujoCostoMinP.vue';
import ArbolPage from '../views/ArbolExpansionP.vue';
import MochilaPage from '../views/MochilaP.vue';


export default {
  components: { HomePage, SimplexPage,GranMPage,DosFasesMPage,DualPage, CosMin,EsqNor,VogelPage,CaminoCortoPage,FlujoMaximoPage,ArbolPage,FlujoCostoMinPage,MochilaPage },
  props: ['activePage'],
  computed: {
    currentView() {
     switch (this.activePage) {
        case 'home':
          return 'HomePage';
        case 'simplex':
          return 'SimplexPage';
        case 'granm':
          return 'GranMPage';
        case 'dosfases':
          return 'DosFasesMPage';
        case 'dual':
          return 'DualPage';
        case 'esquina':
          return 'EsqNor';
        case 'costo-minimo':
          return 'CosMin';
        case 'vogel':
          return 'VogelPage';
        case 'caminocorto':
          return 'CaminoCortoPage';
        case 'flujomaximo':
          return 'FlujoMaximoPage';
        case 'arbol':
          return 'ArbolPage';
        case 'flujominimo':
          return 'FlujoCostoMinPage';
        case 'mochila':
          return 'MochilaPage';

 
        default:
          return 'HomePage';
      }
    },
  },
};
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
  border-left: 1px solid #ddd;
}
</style>
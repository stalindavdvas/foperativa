import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'

const app = createApp(App);

// Configurar la variable global correctamente en Vue 3
app.config.globalProperties.$apiBaseUrl = 'http://54.88.65.255:5000';
//app.config.globalProperties.$apiBaseUrl = 'http://localhost:5000';
app.use(router).mount('#app');

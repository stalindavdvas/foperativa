import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.prototype.$apiBaseUrl = 'http://44.201.148.12:5000';
createApp(App).use(router).mount('#app')

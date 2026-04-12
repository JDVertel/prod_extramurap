import * as usersApi from "./api/usersApi";
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { installAlertInterceptor, installToast } from './services/toast'
import { initGlobalTableSort } from './utils/globalTableSort'
import './assets/main.css'


const app = createApp(App)

app.use(store);
app.use(router);
installToast(app);
installAlertInterceptor();
// Registrar usersApi en app.config.globalProperties
app.config.globalProperties.$api = {
	...usersApi,
};
app.mount('#app');

initGlobalTableSort();

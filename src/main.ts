import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useThemeStore, applyThemeClass } from "./stores/theme";
import "./styles.css";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
applyThemeClass(useThemeStore().theme);
app.mount("#app");

import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import zhTw from "element-plus/es/locale/lang/zh-tw";
//import { useVehicleStore } from "./stores/vehicles";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 在 mount 前檢查數據
//const vehicleStore = useVehicleStore();
//console.log("初始車輛數據:", vehicleStore.allVehicles);

app.use(pinia);
app.use(router);
app.use(ElementPlus, {
  locale: zhTw,
});

app.mount("#app");

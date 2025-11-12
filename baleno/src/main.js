import { createApp } from "vue";
import { createPinia } from "pinia";
import Antd from "ant-design-vue";
import router from "./router";
import App from "./App.vue";
import "ant-design-vue/dist/reset.css";
import "./style.css";

// 配置 dayjs
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";

dayjs.locale("zh-tw");

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Antd);

app.mount("#app");

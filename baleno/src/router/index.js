import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import VehicleList from "../views/VehicleList.vue";
import VehicleDetail from "../views/VehicleDetail.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/vehicles",
    name: "VehicleList",
    component: VehicleList,
  },
  {
    path: "/vehicles/:id",
    name: "VehicleDetail",
    component: VehicleDetail,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

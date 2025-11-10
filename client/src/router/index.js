import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import VehicleList from "../views/VehicleList.vue";
import MaintenanceHistory from "../views/MaintenanceHistory.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/dashboard/:phone",
    name: "DashboardByPhone",
    component: Dashboard,
    props: true,
  },
  {
    path: "/vehicles",
    name: "VehicleList",
    component: VehicleList,
  },
  {
    path: "/maintenance",
    name: "MaintenanceHistory",
    component: MaintenanceHistory,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

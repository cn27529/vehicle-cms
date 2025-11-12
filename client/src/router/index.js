import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import VehicleList from "../views/VehicleList.vue";
import MaintenanceHistory from "../views/MaintenanceHistory.vue";
import Statistics from "../views/Statistics.vue";

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
    path: "/vehicles/:phone",
    name: "VehicleListByPhone",
    component: VehicleList,
    props: true,
  },
  {
    path: "/maintenance",
    name: "MaintenanceHistory",
    component: MaintenanceHistory,
  },
  {
    path: "/maintenance/:phone",
    name: "MaintenanceHistoryByPhone",
    component: MaintenanceHistory,
    props: true,
  },
  {
    path: "/statistics",
    name: "Statistics",
    component: Statistics,
  },
  {
    path: "/statistics/:phone",
    name: "StatisticsByPhone",
    component: Statistics,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

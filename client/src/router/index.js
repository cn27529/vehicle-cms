import { createRouter, createWebHistory } from "vue-router";
import VehicleList from "@/views/VehicleList.vue";
import VehicleDetail from "@/views/VehicleDetail.vue";
import MaintenanceView from "@/views/MaintenanceView.vue";
import MyCar from "@/views/MyCar.vue";

const routes = [
  {
    path: "/",
    redirect: "/admin/vehicles"
  },
  {
    path: "/admin/vehicles",
    name: "VehicleList",
    component: VehicleList
  },
  {
    path: "/admin/vehicles/:id",
    name: "VehicleDetail",
    component: VehicleDetail
  },
  {
    path: "/admin/maintenance/:vehicleId",
    name: "MaintenanceView",
    component: MaintenanceView
  },
  {
    path: "/myvehicles/:plateNumber",
    name: "MyCar",
    component: MyCar
  },
  {
    path: "/mycar",
    name: "MyCarDemo",
    component: MyCar
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
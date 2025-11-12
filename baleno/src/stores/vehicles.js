import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { vehicleService, maintenanceService } from "../services/vehicleService";

export const useVehicleStore = defineStore("vehicles", () => {
  const vehicles = ref([]);
  const loading = ref(false);
  const currentEditingVehicle = ref(null);
  const error = ref(null);

  // 計算屬性
  const totalVehicles = computed(() => vehicles.value.length);

  // 獲取車輛的方法 - 修正這裡
  const getVehicleById = (id) => {
    return vehicles.value.find(
      (vehicle) =>
        vehicle.vehicle_info?.license_plate === id ||
        vehicle.id === id ||
        vehicle.vehicle_info?.vin === id
    );
  };

  // 獲取車輛詳細資訊（從 API）
  const loadVehicleById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const vehicle = await vehicleService.getVehicleById(id);

      // 更新本地車輛列表中的該車輛
      const index = vehicles.value.findIndex((v) => v.id === id);
      if (index !== -1) {
        vehicles.value[index] = vehicle;
      } else {
        vehicles.value.push(vehicle);
      }

      return vehicle;
    } catch (err) {
      error.value = "載入車輛資料失敗";
      console.error("載入車輛資料失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions
  const loadVehicles = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await vehicleService.getVehicles();
      vehicles.value = data;
    } catch (err) {
      error.value = "載入車輛資料失敗";
      console.error("載入車輛資料失敗:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateVehicle = async (vehicleId, updatedData) => {
    error.value = null;
    try {
      const updatedVehicle = await vehicleService.updateVehicle(
        vehicleId,
        updatedData
      );

      // 更新本地狀態
      const index = vehicles.value.findIndex((v) => v.id === vehicleId);
      if (index !== -1) {
        vehicles.value[index] = updatedVehicle;
      }

      return updatedVehicle;
    } catch (err) {
      error.value = "更新車輛失敗";
      console.error("更新車輛失敗:", err);
      throw err;
    }
  };

  const addVehicle = async (vehicleData) => {
    error.value = null;
    try {
      const newVehicle = await vehicleService.createVehicle(vehicleData);
      vehicles.value.push(newVehicle);
      return newVehicle;
    } catch (err) {
      error.value = "新增車輛失敗";
      console.error("新增車輛失敗:", err);
      throw err;
    }
  };

  const deleteVehicle = async (vehicleId) => {
    error.value = null;
    try {
      await vehicleService.deleteVehicle(vehicleId);

      // 從本地狀態移除
      const index = vehicles.value.findIndex((v) => v.id === vehicleId);
      if (index !== -1) {
        vehicles.value.splice(index, 1);
      }

      return true;
    } catch (err) {
      error.value = "刪除車輛失敗";
      console.error("刪除車輛失敗:", err);
      throw err;
    }
  };

  const updateVehicleMileage = async (vehicleId, currentMileage) => {
    error.value = null;
    try {
      const updatedVehicle = await vehicleService.updateVehicleMileage(
        vehicleId,
        currentMileage
      );

      // 更新本地狀態
      const index = vehicles.value.findIndex((v) => v.id === vehicleId);
      if (index !== -1) {
        vehicles.value[index] = updatedVehicle;
      }

      return updatedVehicle;
    } catch (err) {
      error.value = "更新里程失敗";
      console.error("更新里程失敗:", err);
      throw err;
    }
  };

  const addMaintenanceRecord = async (vehicleId, recordData) => {
    error.value = null;
    try {
      // 這裡需要先找到對應的保養項目 ID
      const vehicle = getVehicleById(vehicleId);
      if (!vehicle) {
        throw new Error("車輛不存在");
      }

      const maintenanceItem = vehicle.maintenance_records.find(
        (item) => item.item_en === recordData.item_en
      );

      if (!maintenanceItem) {
        throw new Error("保養項目不存在");
      }

      const updatedVehicle = await maintenanceService.addServiceHistory(
        vehicleId,
        maintenanceItem.id,
        recordData
      );

      // 更新本地狀態
      const index = vehicles.value.findIndex((v) => v.id === vehicleId);
      if (index !== -1) {
        vehicles.value[index] = updatedVehicle;
      }

      return updatedVehicle;
    } catch (err) {
      error.value = "新增保養記錄失敗";
      console.error("新增保養記錄失敗:", err);
      throw err;
    }
  };

  const setEditingVehicle = (vehicle) => {
    currentEditingVehicle.value = vehicle
      ? JSON.parse(JSON.stringify(vehicle))
      : null;
  };

  // 確保所有方法都有正確導出
  return {
    vehicles,
    loading,
    error,
    totalVehicles,
    currentEditingVehicle,

    // 方法
    getVehicleById, // 確保這個方法被導出
    loadVehicleById,
    loadVehicles,
    updateVehicle,
    addVehicle,
    deleteVehicle,
    updateVehicleMileage,
    addMaintenanceRecord,
    setEditingVehicle,
  };
});

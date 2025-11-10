import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { vehicleService } from "@/services/vehicleService";

export const useVehicleStore = defineStore("vehicles", () => {
  const vehicles = ref([]);
  const loading = ref(false);

  const fetchVehicles = async () => {
    loading.value = true;
    try {
      vehicles.value = await vehicleService.getVehicles();
    } catch (error) {
      console.error("取得車輛資料失敗:", error);
    } finally {
      loading.value = false;
    }
  };

  const getVehicleByPlate = (plateNumber) => {
    return vehicles.value.find(vehicle => 
      vehicle.vehicle_info.license_plate.replace(/-/g, "") === plateNumber.replace(/-/g, "")
    );
  };

  const updateMaintenanceRecord = async (plateNumber, recordData) => {
    try {
      await vehicleService.addMaintenanceRecord(plateNumber, recordData);
      await fetchVehicles(); // 刷新資料
    } catch (error) {
      console.error("更新保養記錄失敗:", error);
      throw error;
    }
  };

  const addServiceHistory = async (plateNumber, itemEn, serviceData) => {
    try {
      await vehicleService.addServiceHistory(plateNumber, itemEn, serviceData);
      await fetchVehicles(); // 刷新資料
    } catch (error) {
      console.error("新增服務歷史失敗:", error);
      throw error;
    }
  };

  // 計算統計資訊
  const getMaintenanceStats = (vehicle) => {
    if (!vehicle) return {};
    
    const totalRecords = vehicle.maintenance_records.length;
    const completedServices = vehicle.maintenance_records.reduce((count, record) => {
      return count + record.service_history.filter(service => service.service_date).length;
    }, 0);
    
    const upcomingMaintenance = vehicle.maintenance_records.filter(record => {
      return record.next_due_mileage && 
             record.next_due_mileage - vehicle.vehicle_info.current_mileage <= 1000;
    });

    return {
      totalRecords,
      completedServices,
      upcomingMaintenance: upcomingMaintenance.length
    };
  };

  return {
    vehicles,
    loading,
    fetchVehicles,
    getVehicleByPlate,
    updateMaintenanceRecord,
    addServiceHistory,
    getMaintenanceStats
  };
});
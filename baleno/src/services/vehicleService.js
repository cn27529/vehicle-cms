import api from "./api";

/**
 * 車輛相關 API
 */
export const vehicleService = {
  // 獲取所有車輛
  async getVehicles() {
    const response = await api.get("/vehicles");
    return response.data;
  },

  // 根據 ID 獲取車輛
  async getVehicleById(id) {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // 新增車輛
  async createVehicle(vehicleData) {
    const response = await api.post("/vehicles", vehicleData);
    return response.data;
  },

  // 更新車輛
  async updateVehicle(id, vehicleData) {
    const response = await api.put(`/vehicles/${id}`, vehicleData);
    return response.data;
  },

  // 更新車輛部分資訊
  async patchVehicle(id, updates) {
    const response = await api.patch(`/vehicles/${id}`, updates);
    return response.data;
  },

  // 刪除車輛
  async deleteVehicle(id) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  // 更新車輛里程
  async updateVehicleMileage(id, currentMileage) {
    const response = await api.patch(`/vehicles/${id}`, {
      vehicle_info: {
        current_mileage: currentMileage,
        last_updated: new Date().toISOString().split("T")[0],
      },
    });
    return response.data;
  },
};

/**
 * 保養記錄相關 API
 */
export const maintenanceService = {
  // 獲取車輛的所有保養記錄
  async getMaintenanceRecords(vehicleId) {
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    return vehicle.maintenance_records || [];
  },

  // 新增保養項目
  async addMaintenanceItem(vehicleId, maintenanceItem) {
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    const maintenanceRecords = vehicle.maintenance_records || [];

    const newItem = {
      id: Date.now(), // 簡單的 ID 生成
      ...maintenanceItem,
    };

    maintenanceRecords.push(newItem);

    const response = await vehicleService.updateVehicle(vehicleId, {
      ...vehicle,
      maintenance_records: maintenanceRecords,
    });

    return response;
  },

  // 更新保養項目
  async updateMaintenanceItem(vehicleId, itemId, updates) {
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    const maintenanceRecords = vehicle.maintenance_records || [];

    const itemIndex = maintenanceRecords.findIndex(
      (item) => item.id === itemId
    );
    if (itemIndex === -1) {
      throw new Error("保養項目不存在");
    }

    maintenanceRecords[itemIndex] = {
      ...maintenanceRecords[itemIndex],
      ...updates,
    };

    const response = await vehicleService.updateVehicle(vehicleId, {
      ...vehicle,
      maintenance_records: maintenanceRecords,
    });

    return response;
  },

  // 新增服務記錄
  async addServiceHistory(vehicleId, itemId, serviceRecord) {
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    const maintenanceRecords = vehicle.maintenance_records || [];

    const itemIndex = maintenanceRecords.findIndex(
      (item) => item.id === itemId
    );
    if (itemIndex === -1) {
      throw new Error("保養項目不存在");
    }

    const newServiceRecord = {
      id: Date.now(),
      ...serviceRecord,
    };

    if (!maintenanceRecords[itemIndex].service_history) {
      maintenanceRecords[itemIndex].service_history = [];
    }

    maintenanceRecords[itemIndex].service_history.push(newServiceRecord);

    // 更新下次保養里程
    if (maintenanceRecords[itemIndex].interval_km) {
      maintenanceRecords[itemIndex].next_due_mileage =
        serviceRecord.service_mileage +
        maintenanceRecords[itemIndex].interval_km;
    }

    const response = await vehicleService.updateVehicle(vehicleId, {
      ...vehicle,
      maintenance_records: maintenanceRecords,
    });

    return response;
  },

  // 刪除服務記錄
  async deleteServiceHistory(vehicleId, itemId, serviceRecordId) {
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    const maintenanceRecords = vehicle.maintenance_records || [];

    const itemIndex = maintenanceRecords.findIndex(
      (item) => item.id === itemId
    );
    if (itemIndex === -1) {
      throw new Error("保養項目不存在");
    }

    const serviceHistory = maintenanceRecords[itemIndex].service_history || [];
    const recordIndex = serviceHistory.findIndex(
      (record) => record.id === serviceRecordId
    );

    if (recordIndex === -1) {
      throw new Error("服務記錄不存在");
    }

    serviceHistory.splice(recordIndex, 1);

    const response = await vehicleService.updateVehicle(vehicleId, {
      ...vehicle,
      maintenance_records: maintenanceRecords,
    });

    return response;
  },
};

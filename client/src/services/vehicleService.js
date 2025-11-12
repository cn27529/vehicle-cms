import api from "./api";

// 模拟 API 调用
const simulateApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// 根据环境变量选择数据源
const isJsonServerMode = import.meta.env.VITE_AUTH_MODE === "jsonserver";

export const vehicleService = {
  // 获取所有车辆 - 修正版本
  async getVehicles() {
    console.log(
      "🚗 getVehicles - 当前模式:",
      isJsonServerMode ? "json-server" : "mock"
    );

    if (isJsonServerMode) {
      try {
        console.log("🚗 正在从 JSON Server 获取数据...");
        const response = await api.get("/vehicles");
        console.log("🚗 JSON Server 响应:", response.data);

        // 确保返回的是数组格式
        const data = Array.isArray(response.data) ? response.data : [];
        console.log("🚗 处理后的数据:", data);
        return data;
      } catch (error) {
        console.error("🚗 JSON Server 错误:", error);
        console.error("🚗 错误详情:", error.response?.data || error.message);
        return [];
      }
    } else {
      // Mock 模式
      try {
        console.log("🚗 正在从本地 JSON 获取数据...");
        const response = await fetch("/src/data/car_example_data.json");
        const data = await response.json();
        console.log("🚗 Mock 数据:", data);

        // 确保返回 vehicles 数组
        return data.vehicles || [];
      } catch (error) {
        console.error("🚗 Mock 数据错误:", error);
        return [];
      }
    }
  },

  // 获取单个车辆信息
  async getVehicle(licensePlate) {
    if (isJsonServerMode) {
      try {
        // 先获取所有车辆，然后过滤
        const response = await api.get("/vehicles");
        const vehicle = response.data.find(
          (v) => v.vehicle_info?.license_plate === licensePlate
        );
        return vehicle || null;
      } catch (error) {
        console.error("获取车辆错误:", error);
        return null;
      }
    } else {
      try {
        const response = await fetch("/src/data/car_example_data.json");
        const data = await response.json();
        const vehicle = data.vehicles.find(
          (v) => v.vehicle_info.license_plate === licensePlate
        );
        return vehicle || null;
      } catch (error) {
        console.error("获取车辆错误:", error);
        return null;
      }
    }
  },

  // 获取单个车辆信息
  async getVehicle(licensePlate) {
    if (isJsonServerMode) {
      const response = await api.get(
        `/vehicles?vehicle_info.license_plate=${licensePlate}`
      );
      return simulateApiCall(response.data[0] || null);
    } else {
      const response = await fetch("/src/data/car_example_data.json");
      const data = await response.json();
      const vehicle = data.vehicles.find(
        (v) => v.vehicle_info.license_plate === licensePlate
      );
      return simulateApiCall(vehicle);
    }
  },

  // 更新车辆信息
  async updateVehicle(licensePlate, vehicleData) {
    if (isJsonServerMode) {
      const response = await api.get(
        `/vehicles?vehicle_info.license_plate=${licensePlate}`
      );
      const existingData = response.data;

      if (existingData.length > 0) {
        const updateResponse = await api.patch(
          `/vehicles/${existingData[0].id}`,
          vehicleData
        );
        return simulateApiCall(updateResponse.data);
      }
      return simulateApiCall({ success: false, error: "Vehicle not found" });
    } else {
      return simulateApiCall({ success: true, data: vehicleData });
    }
  },

  // 添加保养记录 - 包含里程计算逻辑
  async addMaintenanceRecord(licensePlate, itemType, recordData) {
    if (!VALID_MAINTENANCE_TYPES.includes(itemType)) {
      return simulateApiCall({
        success: false,
        error: `Invalid item type. Must be one of: ${VALID_MAINTENANCE_TYPES.join(
          ", "
        )}`,
      });
    }

    if (isJsonServerMode) {
      // 先获取车辆
      const vehicleResponse = await api.get(
        `/vehicles?vehicle_info.license_plate=${licensePlate}`
      );
      const vehicles = vehicleResponse.data;

      if (vehicles.length === 0) {
        return simulateApiCall({ success: false, error: "Vehicle not found" });
      }

      const vehicle = vehicles[0];
      const serviceMileage = recordData.service_mileage;

      if (!serviceMileage) {
        return simulateApiCall({
          success: false,
          error: "service_mileage is required",
        });
      }

      // 1. 更新车辆当前里程
      if (vehicle.vehicle_info) {
        vehicle.vehicle_info.current_mileage = serviceMileage;
        vehicle.vehicle_info.last_updated = new Date()
          .toISOString()
          .split("T")[0];
      } else {
        vehicle.current_mileage = serviceMileage;
        vehicle.last_updated = new Date().toISOString().split("T")[0];
      }

      // 确保 maintenance_records 存在
      if (!vehicle.maintenance_records) {
        vehicle.maintenance_records = {};
      }

      // 确保对应的保养项目存在
      if (!vehicle.maintenance_records[itemType]) {
        vehicle.maintenance_records[itemType] = {
          item_en: itemType,
          item_zh: itemType,
          category: "未分類",
          interval_km: this.getDefaultInterval(itemType),
          service_type: ["check"],
          service_history: [],
        };
      }

      const maintenanceItem = vehicle.maintenance_records[itemType];

      // 确保 service_history 数组存在
      if (!maintenanceItem.service_history) {
        maintenanceItem.service_history = [];
      }

      // 准备保养记录
      const maintenanceRecord = {
        ...recordData,
        service_date:
          recordData.service_date || new Date().toISOString().split("T")[0],
        reminder:
          recordData.reminder !== undefined ? recordData.reminder : true,
      };

      // 添加新记录
      maintenanceItem.service_history.push(maintenanceRecord);

      // 2. 计算下次保养里程（如果不是电瓶）
      if (itemType !== "battery" && maintenanceItem.interval_km > 0) {
        maintenanceItem.next_due_mileage =
          serviceMileage + maintenanceItem.interval_km;
      } else if (itemType === "battery") {
        // 电瓶不需要基于里程的提醒
        maintenanceItem.next_due_mileage = 0;
      }

      // 更新到服务器
      const updateResponse = await api.patch(
        `/vehicles/${vehicle.id}`,
        vehicle
      );

      return simulateApiCall({
        success: true,
        data: updateResponse.data,
      });
    } else {
      // Mock 模式也包含相同的逻辑
      return simulateApiCall({
        success: true,
        data: {
          itemType,
          ...recordData,
          // 在 mock 模式下返回计算后的数据，但不实际保存
          calculated_next_due_mileage:
            recordData.service_mileage + this.getDefaultInterval(itemType),
          updated_current_mileage: recordData.service_mileage,
        },
      });
    }
  },

  // 获取保养统计
  async getMaintenanceStats(licensePlate) {
    let vehicle;

    if (isJsonServerMode) {
      const response = await api.get(
        `/vehicles?vehicle_info.license_plate=${licensePlate}`
      );
      const vehicles = response.data;
      vehicle = vehicles[0];
    } else {
      const response = await fetch("/src/data/car_example_data.json");
      const data = await response.json();
      vehicle = data.vehicles.find(
        (v) => v.vehicle_info.license_plate === licensePlate
      );
    }

    const stats = {
      totalCost: 0,
      serviceCount: 0,
      upcomingServices: 0,
      recentServices: [],
    };

    if (vehicle && vehicle.maintenance_records) {
      Object.values(vehicle.maintenance_records).forEach((item) => {
        if (item.service_history) {
          item.service_history.forEach((history) => {
            if (history.cost) {
              stats.totalCost += Number(history.cost) || 0;
            }
            if (history.service_date) {
              stats.serviceCount++;

              // 检查是否为最近3个月的服务
              const serviceDate = new Date(history.service_date);
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

              if (serviceDate > threeMonthsAgo) {
                stats.recentServices.push({
                  ...item,
                  ...history,
                });
              }
            }
          });
        }

        // 检查即将到期的服务
        const currentMileage = vehicle.vehicle_info?.current_mileage;
        if (item.next_due_mileage && currentMileage) {
          const mileageDiff = item.next_due_mileage - currentMileage;
          if (mileageDiff <= 2000 && mileageDiff > 0) {
            stats.upcomingServices++;
          }
        }
      });
    }

    return simulateApiCall(stats);
  },

  // 获取有效的保养项目类型
  getValidMaintenanceTypes() {
    return VALID_MAINTENANCE_TYPES;
  },

  // 获取默认保养间隔
  getDefaultInterval(itemType) {
    const intervalMap = {
      engine_oil: 7500,
      transmission_fluid: 40000,
      cabin_air_filter: 10000,
      engine_air_filter: 40000,
      spark_plugs: 40000,
      coolant: 40000,
      battery: 0,
      engine_mount: 80000,
      shock_absorbers: 80000,
      brake_fluid: 30000,
      fuel_injector: 40000,
      turbocharger: 40000,
      exhaust_system: 20000,
      light_bulb: 30000,
      tires: 10000,
      air_flow_sensor: 30000,
      others: 0,
    };
    return intervalMap[itemType] || 0;
  },
};

export default vehicleService;

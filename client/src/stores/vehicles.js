import { defineStore } from "pinia";
import { ref, computed } from "vue";
import vehicleService from "../services/vehicleService";

export const useVehicleStore = defineStore("vehicles", () => {
  const vehicles = ref([]);
  const selectedVehicleId = ref("");
  const selectedPhone = ref("");
  const loading = ref(false);
  const error = ref(null);

  // 根据环境变量选择数据源
  const isJsonServerMode = import.meta.env.VITE_AUTH_MODE === "jsonserver";

  // 初始化 - 加载车辆数据
  const initialize = async () => {
    try {
      loading.value = true;
      error.value = null;
      console.log("🔄 Store 初始化开始...");

      if (isJsonServerMode) {
        console.log("🔄 使用 JSON Server 模式");
        await loadVehiclesFromAPI();
      } else {
        console.log("🔄 使用 Mock 模式");
        await loadVehiclesFromLocal();
      }

      console.log("✅ Store 初始化完成，车辆数量:", vehicles.value.length);
    } catch (err) {
      console.error("❌ Store 初始化错误:", err);
      error.value = err.message || "加载车辆数据失败";
      vehicles.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 从 API 加载车辆数据
  const loadVehiclesFromAPI = async () => {
    try {
      console.log("📡 从 API 加载车辆数据...");
      const data = await vehicleService.getVehicles();
      console.log("📡 API 返回数据:", data);

      if (Array.isArray(data)) {
        vehicles.value = data;
        console.log("✅ API 数据加载成功，车辆数量:", vehicles.value.length);
      } else {
        console.warn("⚠️ API 返回的数据不是数组:", data);
        vehicles.value = [];
      }
    } catch (err) {
      console.error("❌ API 数据加载失败:", err);
      throw err;
    }
  };

  // 从本地 JSON 加载车辆数据
  // 从本地 JSON 加载车辆数据
  const loadVehiclesFromLocal = async () => {
    try {
      console.log("📁 从本地 JSON 加载车辆数据...");
      const response = await fetch("/src/data/car_example_data.json");
      const data = await response.json();
      console.log("📁 本地 JSON 数据:", data);

      // 调试数据结构
      console.log("📁 数据 keys:", Object.keys(data));
      console.log("📁 vehicles 属性:", data.vehicles);
      console.log("📁 vehicles 类型:", typeof data.vehicles);
      console.log("📁 vehicles 是数组吗:", Array.isArray(data.vehicles));

      // 修正数据提取逻辑
      if (data.vehicles && Array.isArray(data.vehicles)) {
        vehicles.value = data.vehicles;
        console.log("✅ 本地数据加载成功，车辆数量:", vehicles.value.length);
      } else if (Array.isArray(data)) {
        // 如果数据本身就是数组（向后兼容）
        vehicles.value = data;
        console.log(
          "✅ 本地数据加载成功（直接数组），车辆数量:",
          vehicles.value.length
        );
      } else {
        console.warn("⚠️ 无法识别的数据结构:", data);
        vehicles.value = [];
      }
    } catch (err) {
      console.error("❌ 本地数据加载失败:", err);
      throw err;
    }
  };

  // 获取所有车辆
  const allVehicles = computed(() => {
    console.log("📊 allVehicles computed:", vehicles.value.length, "vehicles");
    return vehicles.value;
  });

  // 根据手机号码获取车辆
  const vehiclesByPhone = computed(() => {
    if (!selectedPhone.value) {
      console.log("📊 vehiclesByPhone: 无选中手机，返回所有车辆");
      return vehicles.value;
    }

    const filtered = vehicles.value.filter((vehicle) => {
      const phone = vehicle.vehicle_info?.phone || vehicle.phone;
      return phone === selectedPhone.value;
    });

    console.log(
      "📊 vehiclesByPhone: 按手机过滤，结果:",
      filtered.length,
      "vehicles"
    );
    return filtered;
  });

  // 获取当前选中车辆
  const currentVehicle = computed(() => {
    if (!selectedVehicleId.value) {
      const filteredVehicles = selectedPhone.value
        ? vehiclesByPhone.value
        : vehicles.value;
      const vehicle = filteredVehicles[0] || {};
      console.log("📊 currentVehicle: 无选中车辆，返回第一个:", vehicle);
      return vehicle;
    }

    const vehicle =
      vehicles.value.find(
        (vehicle) =>
          (vehicle.vehicle_info &&
            vehicle.vehicle_info.license_plate === selectedVehicleId.value) ||
          vehicle.license_plate === selectedVehicleId.value
      ) || {};

    console.log(
      "📊 currentVehicle: 按ID查找:",
      selectedVehicleId.value,
      "结果:",
      vehicle
    );
    return vehicle;
  });

  // 设置选中手机号码
  const setSelectedPhone = (phone) => {
    console.log("🎯 设置选中手机:", phone);
    selectedPhone.value = phone;
    selectedVehicleId.value = "";
  };

  // 设置选中车辆
  const setSelectedVehicle = (vehicleId) => {
    console.log("🎯 设置选中车辆:", vehicleId);
    selectedVehicleId.value = vehicleId;
  };

  // 添加新车辆
  const addVehicle = async (vehicleData) => {
    if (isJsonServerMode) {
      // JSON Server 模式：调用 API
      try {
        loading.value = true;
        const result = await vehicleService.addVehicle(vehicleData);
        if (result.success) {
          await loadVehiclesFromAPI(); // 重新加载数据
        }
        return result;
      } catch (err) {
        error.value = err.message || "添加车辆失败";
        return { success: false, error: error.value };
      } finally {
        loading.value = false;
      }
    } else {
      // Mock 模式：直接添加到本地状态
      vehicles.value.push(vehicleData);
      return { success: true, data: vehicleData };
    }
  };

  // 更新车辆信息
  const updateVehicle = async (licensePlate, updatedData) => {
    if (isJsonServerMode) {
      // JSON Server 模式：调用 API
      try {
        loading.value = true;
        const result = await vehicleService.updateVehicle(
          licensePlate,
          updatedData
        );
        if (result.success) {
          await loadVehiclesFromAPI(); // 重新加载数据
        }
        return result;
      } catch (err) {
        error.value = err.message || "更新车辆信息失败";
        return { success: false, error: error.value };
      } finally {
        loading.value = false;
      }
    } else {
      // Mock 模式：更新本地状态
      const index = vehicles.value.findIndex(
        (vehicle) =>
          (vehicle.vehicle_info &&
            vehicle.vehicle_info.license_plate === licensePlate) ||
          vehicle.license_plate === licensePlate
      );
      if (index !== -1) {
        vehicles.value[index] = { ...vehicles.value[index], ...updatedData };
        return { success: true, data: vehicles.value[index] };
      }
      return { success: false, error: "车辆未找到" };
    }
  };

  // 添加保养记录
  const addMaintenanceRecord = async (licensePlate, itemKey, record) => {
    if (isJsonServerMode) {
      // JSON Server 模式：调用 API
      try {
        loading.value = true;
        const result = await vehicleService.addMaintenanceRecord(
          licensePlate,
          itemKey,
          record
        );
        if (result.success) {
          await loadVehiclesFromAPI(); // 重新加载数据
        }
        return result;
      } catch (err) {
        error.value = err.message || "添加保养记录失败";
        return { success: false, error: error.value };
      } finally {
        loading.value = false;
      }
    } else {
      // Mock 模式：更新本地状态
      const vehicle = vehicles.value.find(
        (v) =>
          (v.vehicle_info && v.vehicle_info.license_plate === licensePlate) ||
          v.license_plate === licensePlate
      );

      if (vehicle && vehicle.maintenance_records) {
        if (!vehicle.maintenance_records[itemKey]) {
          vehicle.maintenance_records[itemKey] = {
            item_en: itemKey,
            item_zh: getItemChineseName(itemKey),
            category: getItemCategory(itemKey),
            interval_km: 0,
            next_due_mileage: 0,
            service_type: ["check"],
            service_history: [],
          };
        }

        vehicle.maintenance_records[itemKey].service_history.push({
          service_date: new Date().toISOString().split("T")[0],
          service_mileage:
            vehicle.vehicle_info?.current_mileage || vehicle.current_mileage,
          state: "ok",
          note: record.note || "",
          service_location: record.service_location || "",
          cost: record.cost || 0,
          technician: record.technician || "",
          reminder: false,
        });

        // 更新下次保养里程（如果不是电瓶）
        if (itemKey !== "battery") {
          const currentMileage =
            vehicle.vehicle_info?.current_mileage || vehicle.current_mileage;
          const interval =
            vehicle.maintenance_records[itemKey].interval_km || 0;
          if (interval > 0) {
            vehicle.maintenance_records[itemKey].next_due_mileage =
              currentMileage + interval;
          }
        }

        return { success: true, data: vehicle };
      }
      return { success: false, error: "车辆未找到" };
    }
  };

  // 获取保养统计
  const getMaintenanceStats = async (licensePlate) => {
    if (isJsonServerMode) {
      // JSON Server 模式：调用 API
      try {
        loading.value = true;
        const stats = await vehicleService.getMaintenanceStats(licensePlate);
        return stats;
      } catch (err) {
        error.value = err.message || "获取保养统计失败";
        return null;
      } finally {
        loading.value = false;
      }
    } else {
      // Mock 模式：更新本地状态
      const vehicle = vehicles.value.find(
        (v) =>
          (v.vehicle_info && v.vehicle_info.license_plate === licensePlate) ||
          v.license_plate === licensePlate
      );

      if (vehicle) {
        const serviceMileage = record.service_mileage;

        if (!serviceMileage) {
          return { success: false, error: "service_mileage is required" };
        }

        // 1. 更新当前里程
        if (vehicle.vehicle_info) {
          vehicle.vehicle_info.current_mileage = serviceMileage;
          vehicle.vehicle_info.last_updated = new Date()
            .toISOString()
            .split("T")[0];
        } else {
          vehicle.current_mileage = serviceMileage;
          vehicle.last_updated = new Date().toISOString().split("T")[0];
        }

        // 2. 确保保养记录存在
        if (!vehicle.maintenance_records) {
          vehicle.maintenance_records = {};
        }

        if (!vehicle.maintenance_records[itemKey]) {
          vehicle.maintenance_records[itemKey] = {
            item_en: itemKey,
            item_zh: getItemChineseName(itemKey),
            category: getItemCategory(itemKey),
            interval_km: getDefaultInterval(itemKey),
            service_type: ["check"],
            service_history: [],
          };
        }

        const maintenanceItem = vehicle.maintenance_records[itemKey];

        // 3. 添加保养记录
        maintenanceItem.service_history.push({
          service_date:
            record.service_date || new Date().toISOString().split("T")[0],
          service_mileage: serviceMileage,
          state: record.state || "ok",
          note: record.note || "",
          service_location: record.service_location || "",
          cost: record.cost || 0,
          technician: record.technician || "",
          reminder: record.reminder !== undefined ? record.reminder : true,
        });

        // 4. 计算下次保养里程
        if (itemKey !== "battery" && maintenanceItem.interval_km > 0) {
          maintenanceItem.next_due_mileage =
            serviceMileage + maintenanceItem.interval_km;
        }

        return { success: true, data: vehicle };
      }
    }
  };

  // 获取车主的所有手机号码
  const getAllPhones = computed(() => {
    const phones = new Set();
    vehicles.value.forEach((vehicle) => {
      const phone = vehicle.vehicle_info?.phone || vehicle.phone;
      if (phone && typeof phone === "string" && phone.length === 10) {
        phones.add(phone);
      }
    });
    return Array.from(phones);
  });

  // 根据手机号码获取车主姓名
  const getOwnerNameByPhone = (phone) => {
    const vehicle = vehicles.value.find((v) => {
      const vehiclePhone = v.vehicle_info?.phone || v.phone;
      return vehiclePhone === phone;
    });
    return vehicle?.vehicle_info?.name || vehicle?.name || "未知车主";
  };

  // 计算电瓶下次检查日期（基于最近一次更换记录）
  const getBatteryNextDueDate = (batteryRecord) => {
    if (!batteryRecord || !batteryRecord.service_history) return null;

    const recentService = batteryRecord.service_history
      .filter((history) => history.service_date)
      .sort((a, b) => new Date(b.service_date) - new Date(a.service_date))[0];

    if (!recentService) return null;

    const lastServiceDate = new Date(recentService.service_date);
    const nextDueDate = new Date(lastServiceDate);
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 2);

    return nextDueDate;
  };

  // 检查电瓶是否需要检查
  const isBatteryDueForCheck = (batteryRecord) => {
    const nextDueDate = getBatteryNextDueDate(batteryRecord);
    if (!nextDueDate) return false;

    return new Date() >= nextDueDate;
  };

  // 辅助函数 - 获取项目中文名称
  const getItemChineseName = (itemKey) => {
    const nameMap = {
      engine_oil: "引擎機油",
      transmission_fluid: "變速箱油",
      cabin_air_filter: "冷氣濾網",
      engine_air_filter: "引擎空氣濾網",
      spark_plugs: "火星塞",
      coolant: "冷卻液",
      radiator: "水箱",
      battery: "電瓶",
      engine_mount: "引擎腳",
      shock_absorbers: "避震器",
      brake_fluid: "煞車油",
      fuel_injector: "噴油嘴",
      turbocharger: "渦輪增壓器",
      exhaust_system: "排氣系統",
      light_bulb: "車燈",
      tires: "輪胎",
      air_flow_sensor: "空氣流量計",
    };
    return nameMap[itemKey] || itemKey;
  };

  // 辅助函数 - 获取项目分类
  const getItemCategory = (itemKey) => {
    const categoryMap = {
      engine_oil: "引擎",
      transmission_fluid: "傳動",
      cabin_air_filter: "空調",
      engine_air_filter: "進氣系統",
      spark_plugs: "引擎",
      coolant: "冷卻系統",
      radiator: "冷卻系統",
      battery: "電系",
      engine_mount: "底盤",
      shock_absorbers: "底盤",
      brake_fluid: "制動系統",
      fuel_injector: "進氣系統",
      turbocharger: "引擎",
      exhaust_system: "排氣系統",
      light_bulb: "電系",
      tires: "底盤",
      air_flow_sensor: "進氣系統",
    };
    return categoryMap[itemKey] || "其他";
  };

  // 重置错误状态
  const clearError = () => {
    error.value = null;
  };

  return {
    vehicles,
    selectedVehicleId,
    selectedPhone,
    loading,
    error,
    allVehicles,
    vehiclesByPhone,
    currentVehicle,
    initialize,
    setSelectedPhone,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    addMaintenanceRecord,
    getMaintenanceStats,
    getOwnerNameByPhone,
    getBatteryNextDueDate,
    isBatteryDueForCheck,
    clearError,
  };
});

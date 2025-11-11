import { defineStore } from "pinia";
import { ref, computed } from "vue";
import carData from "../data/car_example_data.json";

export const useVehicleStore = defineStore("vehicles", () => {
  const vehicles = ref(carData);
  const selectedVehicleId = ref("");
  const selectedPhone = ref("");

  // 获取所有车辆
  const allVehicles = computed(() => vehicles.value);

  // 根据手机号码获取车辆
  const vehiclesByPhone = computed(() => {
    if (!selectedPhone.value) return vehicles.value;

    return vehicles.value.filter((vehicle) => {
      const phone = vehicle.vehicle_info?.phone || vehicle.phone;
      return phone === selectedPhone.value;
    });
  });

  // 获取当前选中车辆
  const currentVehicle = computed(() => {
    if (!selectedVehicleId.value) {
      const filteredVehicles = selectedPhone.value
        ? vehiclesByPhone.value
        : vehicles.value;
      return filteredVehicles[0] || {};
    }

    return (
      vehicles.value.find(
        (vehicle) =>
          (vehicle.vehicle_info &&
            vehicle.vehicle_info.license_plate === selectedVehicleId.value) ||
          vehicle.license_plate === selectedVehicleId.value
      ) || {}
    );
  });

  // 设置选中手机号码
  const setSelectedPhone = (phone) => {
    selectedPhone.value = phone;
    // 重置选中的车辆
    selectedVehicleId.value = "";
  };

  // 设置选中车辆
  const setSelectedVehicle = (vehicleId) => {
    selectedVehicleId.value = vehicleId;
  };

  // 添加新车辆
  const addVehicle = (vehicleData) => {
    vehicles.value.push(vehicleData);
  };

  // 更新车辆信息
  const updateVehicle = (licensePlate, updatedData) => {
    const index = vehicles.value.findIndex(
      (vehicle) =>
        (vehicle.vehicle_info &&
          vehicle.vehicle_info.license_plate === licensePlate) ||
        vehicle.license_plate === licensePlate
    );
    if (index !== -1) {
      vehicles.value[index] = { ...vehicles.value[index], ...updatedData };
    }
  };

  // 添加保养记录
  const addMaintenanceRecord = (licensePlate, itemKey, record) => {
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
          service_type: ["check"], // 默認改為陣列
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
        const interval = vehicle.maintenance_records[itemKey].interval_km || 0;
        if (interval > 0) {
          vehicle.maintenance_records[itemKey].next_due_mileage =
            currentMileage + interval;
        }
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

    // 获取最近的更换记录
    const recentService = batteryRecord.service_history
      .filter((history) => history.service_date)
      .sort((a, b) => new Date(b.service_date) - new Date(a.service_date))[0];

    if (!recentService) return null;

    // 电瓶建议2年检查一次
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

  return {
    vehicles,
    selectedVehicleId,
    selectedPhone,
    allVehicles,
    vehiclesByPhone,
    currentVehicle,
    getAllPhones,
    setSelectedPhone,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    addMaintenanceRecord,
    getOwnerNameByPhone,
    getBatteryNextDueDate,
    isBatteryDueForCheck,
  };
});

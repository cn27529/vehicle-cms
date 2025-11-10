import { ref } from "vue";

// 模拟 API 调用
const simulateApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const vehicleService = {
  // 获取所有车辆
  async getVehicles() {
    const response = await fetch("/src/data/car_example_data.json");
    const data = await response.json();
    return simulateApiCall(data);
  },

  // 获取单个车辆信息
  async getVehicle(licensePlate) {
    const response = await fetch("/src/data/car_example_data.json");
    const data = await response.json();
    const vehicle = data.find(
      (v) =>
        (v.vehicle_info && v.vehicle_info.license_plate === licensePlate) ||
        v.license_plate === licensePlate
    );
    return simulateApiCall(vehicle);
  },

  // 更新车辆信息
  async updateVehicle(licensePlate, vehicleData) {
    return simulateApiCall({ success: true, data: vehicleData });
  },

  // 添加保养记录
  async addMaintenanceRecord(licensePlate, recordData) {
    return simulateApiCall({ success: true, data: recordData });
  },

  // 获取保养统计
  async getMaintenanceStats(licensePlate) {
    const response = await fetch("/src/data/car_example_data.json");
    const data = await response.json();
    const vehicle = data.find(
      (v) =>
        (v.vehicle_info && v.vehicle_info.license_plate === licensePlate) ||
        v.license_plate === licensePlate
    );

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
              stats.totalCost += history.cost;
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
        const currentMileage =
          vehicle.vehicle_info?.current_mileage || vehicle.current_mileage;
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
};

export default vehicleService;

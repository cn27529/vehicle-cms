import dayjs from "dayjs";

class VehicleService {
  constructor() {
    this.storageKey = "vehicle-maintenance-data";
    this.initSampleData();
  }

  initSampleData() {
    if (!localStorage.getItem(this.storageKey)) {
      // 使用您提供的實際資料
      const sampleData = [
        {
          vehicle_info: {
            brand: "Suzuki",
            model: "BALENO",
            year: 2018,
            engine_code: "K10C",
            color: "blue",
            manufacture_date: "2019-03-28",
            current_mileage: 106150,
            license_plate: "BDE-9373",
            purchase_date: "2024-06-05",
            last_updated: "2025-10-03",
            phone: "0912345678"
          },
          maintenance_records: [
            // ... 您提供的完整保養記錄資料
          ]
        }
      ];
      localStorage.setItem(this.storageKey, JSON.stringify(sampleData));
    }
  }

  async getVehicles() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return JSON.parse(data) || [];
    } catch (error) {
      console.error("取得車輛資料失敗:", error);
      return [];
    }
  }

  async getVehicleByPlate(plateNumber) {
    const vehicles = await this.getVehicles();
    return vehicles.find(vehicle => 
      vehicle.vehicle_info.license_plate.replace(/-/g, "") === plateNumber.replace(/-/g, "")
    );
  }

  async updateVehicle(vehicleData) {
    try {
      const vehicles = await this.getVehicles();
      const index = vehicles.findIndex(v => 
        v.vehicle_info.license_plate === vehicleData.vehicle_info.license_plate
      );
      if (index !== -1) {
        vehicles[index] = vehicleData;
        localStorage.setItem(this.storageKey, JSON.stringify(vehicles));
        return vehicleData;
      }
      throw new Error("車輛不存在");
    } catch (error) {
      console.error("更新車輛資料失敗:", error);
      throw error;
    }
  }

  async addMaintenanceRecord(plateNumber, recordData) {
    const vehicle = await this.getVehicleByPlate(plateNumber);
    if (vehicle) {
      const recordIndex = vehicle.maintenance_records.findIndex(
        r => r.item_en === recordData.item_en
      );
      
      if (recordIndex !== -1) {
        // 更新現有記錄
        vehicle.maintenance_records[recordIndex] = recordData;
      } else {
        // 新增記錄
        vehicle.maintenance_records.push(recordData);
      }
      
      vehicle.vehicle_info.last_updated = dayjs().format("YYYY-MM-DD");
      return await this.updateVehicle(vehicle);
    }
    throw new Error("車輛不存在");
  }

  async addServiceHistory(plateNumber, itemEn, serviceData) {
    const vehicle = await this.getVehicleByPlate(plateNumber);
    if (vehicle) {
      const record = vehicle.maintenance_records.find(r => r.item_en === itemEn);
      if (record) {
        const newService = {
          ...serviceData,
          service_date: serviceData.service_date || dayjs().format("YYYY-MM-DD")
        };
        record.service_history.push(newService);
        
        // 更新下次保養里程
        if (record.interval_km && serviceData.service_mileage) {
          record.next_due_mileage = parseInt(serviceData.service_mileage) + parseInt(record.interval_km);
        }
        
        vehicle.vehicle_info.last_updated = dayjs().format("YYYY-MM-DD");
        return await this.updateVehicle(vehicle);
      }
      throw new Error("保養項目不存在");
    }
    throw new Error("車輛不存在");
  }
}

export const vehicleService = new VehicleService();
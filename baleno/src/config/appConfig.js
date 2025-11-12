/**
 * 應用程式配置
 */
export const APP_CONFIG = {
  appName: "汽車保養管理系統",
  version: "1.0.0",

  // 保養項目分類配置
  maintenanceCategories: {
    引擎: { color: "red", icon: "tool" },
    傳動: { color: "orange", icon: "setting" },
    空調: { color: "blue", icon: "cloud" },
    進氣系統: { color: "green", icon: "filter" },
    冷卻系統: { color: "cyan", icon: "fire" },
    電系: { color: "purple", icon: "thunderbolt" },
    底盤: { color: "geekblue", icon: "car" },
    制動系統: { color: "volcano", icon: "alert" },
    排氣系統: { color: "magenta", icon: "rocket" },
  },

  // 預設保養項目
  defaultMaintenanceItems: [
    {
      item_en: "engine_oil",
      item_zh: "引擎機油",
      category: "引擎",
      interval_km: 7500,
      service_type: "replace",
    },
    {
      item_en: "transmission_fluid",
      item_zh: "變速箱油",
      category: "傳動",
      interval_km: 40000,
      service_type: "replace",
    },
    // ... 其他預設項目
  ],

  // 車輛品牌選項
  vehicleBrands: [
    "Suzuki",
    "Toyota",
    "Honda",
    "Mitsubishi",
    "Nissan",
    "Mazda",
    "Ford",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "其他",
  ],
};

/**
 * 本地儲存金鑰
 */
export const STORAGE_KEYS = {
  VEHICLES: "vehicles_data",
  CURRENT_VEHICLE: "current_vehicle",
  USER_PREFERENCES: "user_preferences",
};

/**
 * API 端點配置
 * 實際專案中這些會指向真實的後端 API
 */
export const API_ENDPOINTS = {
  // 車輛相關
  VEHICLES: "/api/vehicles",
  VEHICLE_DETAIL: "/api/vehicles/:id",

  // 保養記錄相關
  MAINTENANCE_RECORDS: "/api/vehicles/:id/maintenance",
  SERVICE_HISTORY: "/api/vehicles/:id/history",

  // 檔案相關
  UPLOAD_FILE: "/api/upload",
};

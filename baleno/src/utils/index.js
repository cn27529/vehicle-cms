import { computed } from "vue";

/**
 * 計算保養項目狀態
 */
export const calculateMaintenanceStatus = (item, currentMileage) => {
  if (!item.next_due_mileage) return "unknown";

  const remaining = item.next_due_mileage - currentMileage;

  if (remaining <= 0) return "overdue";
  if (remaining <= 1000) return "due_soon";
  return "normal";
};

/**
 * 格式化日期
 */
export const formatDate = (dateString, format = "YYYY/MM/DD") => {
  if (!dateString) return "-";

  // 簡單的日期格式化，實際專案中可以使用 dayjs
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return format.replace("YYYY", year).replace("MM", month).replace("DD", day);
};

/**
 * 計算下次保養里程
 */
export const calculateNextDueMileage = (lastServiceMileage, interval) => {
  if (!lastServiceMileage || !interval) return null;
  return lastServiceMileage + interval;
};

/**
 * 過濾需要保養的項目
 */
export const getDueMaintenanceItems = (maintenanceRecords, currentMileage) => {
  return maintenanceRecords.filter((item) => {
    if (!item.next_due_mileage) return false;
    return currentMileage >= item.next_due_mileage;
  });
};

/**
 * 獲取分類顏色
 */
export const getCategoryColor = (category) => {
  const colorMap = {
    引擎: "red",
    傳動: "orange",
    空調: "blue",
    進氣系統: "green",
    冷卻系統: "cyan",
    電系: "purple",
    底盤: "geekblue",
    制動系統: "volcano",
    排氣系統: "magenta",
  };
  return colorMap[category] || "default";
};

/**
 * 計算總花費
 */
export const calculateTotalCost = (maintenanceRecords) => {
  let total = 0;
  maintenanceRecords.forEach((item) => {
    item.service_history.forEach((history) => {
      total += history.cost || 0;
    });
  });
  return total;
};

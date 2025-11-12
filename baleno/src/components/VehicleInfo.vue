<template>
  <div class="vehicle-info">
    <a-card title="車輛基本資訊">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="品牌">{{ vehicle.vehicle_info.brand }}</a-descriptions-item>
            <a-descriptions-item label="車型">{{ vehicle.vehicle_info.model }}</a-descriptions-item>
            <a-descriptions-item label="年份">{{ vehicle.vehicle_info.year }}</a-descriptions-item>
            <a-descriptions-item label="顏色">{{ vehicle.vehicle_info.color }}</a-descriptions-item>
          </a-descriptions>
        </a-col>
        
        <a-col :span="8">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="引擎編號">{{ vehicle.vehicle_info.engine_code }}</a-descriptions-item>
            <a-descriptions-item label="車牌號碼">{{ vehicle.vehicle_info.license_plate }}</a-descriptions-item>
            <a-descriptions-item label="VIN">{{ vehicle.vehicle_info.vin }}</a-descriptions-item>
            <a-descriptions-item label="目前里程">{{ vehicle.vehicle_info.current_mileage.toLocaleString() }} km</a-descriptions-item>
          </a-descriptions>
        </a-col>
        
        <a-col :span="8">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="製造日期">{{ formatDate(vehicle.vehicle_info.manufacture_date) }}</a-descriptions-item>
            <a-descriptions-item label="購買日期">{{ formatDate(vehicle.vehicle_info.purchase_date) }}</a-descriptions-item>
            <a-descriptions-item label="購買價格">NT$ {{ vehicle.vehicle_info.purchase_price.toLocaleString() }}</a-descriptions-item>
            <a-descriptions-item label="最後更新">{{ formatDate(vehicle.vehicle_info.last_updated) }}</a-descriptions-item>
          </a-descriptions>
        </a-col>
      </a-row>
    </a-card>

    <a-card title="保養統計" class="stats-card">
      <a-row :gutter="16">
        <a-col :span="6" class="stat-item">
          <div class="stat-label">總保養項目</div>
          <div class="stat-value">{{ totalMaintenanceItems }}</div>
        </a-col>
        <a-col :span="6" class="stat-item">
          <div class="stat-label">已完成保養</div>
          <div class="stat-value">{{ completedServices }}</div>
        </a-col>
        <a-col :span="6" class="stat-item">
          <div class="stat-label">待保養項目</div>
          <div class="stat-value text-warning">{{ pendingServices }}</div>
        </a-col>
        <a-col :span="6" class="stat-item">
          <div class="stat-label">總花費</div>
          <div class="stat-value">NT$ {{ totalCost }}</div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  vehicle: {
    type: Object,
    required: true
  }
});

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return dateString.split('-').join('/');
};

// 總保養項目
const totalMaintenanceItems = computed(() => {
  try {
    const records = getMaintenanceRecords();
    return Array.isArray(records) ? records.length : 0;
  } catch (error) {
    return 0;
  }
});

// 已完成保養
const completedServices = computed(() => {
  try {
    const records = getMaintenanceRecords();
    if (!Array.isArray(records)) return 0;
    
    let count = 0;
    records.forEach(item => {
      const history = item?.service_history;
      if (Array.isArray(history)) {
        history.forEach(service => {
          if (service?.status === 'ok') {
            count++;
          }
        });
      }
    });
    return count;
  } catch (error) {
    return 0;
  }
  return 0;
});

// 待保養項目
const pendingServices = computed(() => {
  try {
    const records = getMaintenanceRecords();
    if (!Array.isArray(records)) return 0;
    
    const currentMileage = getVehicleMileage();
    let pendingCount = 0;
    
    records.forEach(item => {
      const dueMileage = Number(item?.next_due_mileage);
      if (dueMileage && currentMileage >= dueMileage) {
        pendingCount++;
      }
    });
    
    return pendingCount;
  } catch (error) {
    return 0;
  }
});

// 總花費
const totalCost = computed(() => {
  try {
    const records = getMaintenanceRecords();
    if (!Array.isArray(records)) return 0;
    
    let total = 0;
    records.forEach(item => {
      const history = item?.service_history;
      if (Array.isArray(history)) {
        history.forEach(service => {
          const cost = Number(service?.cost);
          if (!isNaN(cost)) {
            total += cost;
          }
        });
      }
    });
    
    return total;
  } catch (error) {
    return 0;
  }
});
</script>

<style scoped>
.stats-card {
  margin-top: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.text-warning {
  color: #faad14;
}
</style>
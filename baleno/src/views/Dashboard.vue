<template>
  <div class="dashboard">
    <div class="page-header">
      <h1>儀表板</h1>
      <p>車輛保養狀況總覽</p>
    </div>

    <!-- 統計卡片 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <car-outlined class="stat-icon" />
            <div class="stat-info">
              <div class="stat-number">{{ safeTotalVehicles }}</div>
              <div class="stat-label">總車輛數</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <warning-outlined class="stat-icon overdue" />
            <div class="stat-info">
              <div class="stat-number overdue">{{ safeOverdueMaintenanceCount }}</div>
              <div class="stat-label">逾期保養</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <clock-circle-outlined class="stat-icon due-soon" />
            <div class="stat-info">
              <div class="stat-number due-soon">{{ safeDueSoonMaintenanceCount }}</div>
              <div class="stat-label">即將到期</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <dollar-outlined class="stat-icon cost" />
            <div class="stat-info">
              <div class="stat-number">NT$ {{ safeTotalCost.toLocaleString() }}</div>
              <div class="stat-label">總保養花費</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 主要內容 -->
    <a-row :gutter="16" class="content-row">
      <!-- 需要立即保養的項目 -->
      <a-col :span="12">
        <a-card title="需要立即保養的項目" class="maintenance-card">
          <template #extra>
            <span class="badge count-badge">{{ safeUrgentMaintenance.length }}</span>
          </template>
          <a-list
            :data-source="safeUrgentMaintenance"
            :loading="loading"
            :locale="{ emptyText: '目前沒有需要立即保養的項目' }"
          >
            <template #renderItem="{ item }">
              <a-list-item class="maintenance-item overdue">
                <a-list-item-meta
                  :title="`${item.vehicleName} - ${item.itemName}`"
                  :description="`目前里程: ${item.currentMileage.toLocaleString()} km | 應保養里程: ${item.dueMileage.toLocaleString()} km`"
                />
                <template #actions>
                  <a-button type="primary" size="small" @click="goToVehicle(item.vehicleId)">
                    處理
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <!-- 即將到期的保養項目 -->
      <a-col :span="12">
        <a-card title="即將到期的保養項目" class="maintenance-card">
          <template #extra>
            <span class="badge count-badge warning">{{ safeDueSoonMaintenance.length }}</span>
          </template>
          <a-list
            :data-source="safeDueSoonMaintenance"
            :loading="loading"
            :locale="{ emptyText: '目前沒有即將到期的保養項目' }"
          >
            <template #renderItem="{ item }">
              <a-list-item class="maintenance-item due-soon">
                <a-list-item-meta
                  :title="`${item.vehicleName} - ${item.itemName}`"
                  :description="`目前里程: ${item.currentMileage.toLocaleString()} km | 應保養里程: ${item.dueMileage.toLocaleString()} km`"
                />
                <template #actions>
                  <a-button type="default" size="small" @click="goToVehicle(item.vehicleId)">
                    查看
                  </a-button>
                </template>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近保養記錄 -->
    <a-row :gutter="16" class="content-row">
      <a-col :span="24">
        <a-card title="最近保養記錄" class="recent-card">
          <a-timeline>
            <a-timeline-item
              v-for="record in safeRecentServiceRecords"
              :key="record.id"
              :color="getTimelineColor(record.status)"
            >
              <div class="timeline-record">
                <div class="record-header">
                  <strong>{{ record.vehicleName }} - {{ record.itemName }}</strong>
                  <span class="record-date">{{ formatDate(record.serviceDate) }}</span>
                </div>
                <div class="record-details">
                  <span class="mileage">里程: {{ record.serviceMileage.toLocaleString() }} km</span>
                  <span v-if="record.cost > 0" class="cost">花費: NT$ {{ record.cost.toLocaleString() }}</span>
                  <span class="category-tag">
                    <a-tag :color="getCategoryColor(record.category)" size="small">
                      {{ record.category }}
                    </a-tag>
                  </span>
                </div>
                <div v-if="record.note" class="record-note">
                  {{ record.note }}
                </div>
              </div>
            </a-timeline-item>
          </a-timeline>
          <div v-if="safeRecentServiceRecords.length === 0" class="empty-timeline">
            <a-empty description="尚無保養記錄" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 車輛列表 -->
    <a-row :gutter="16" class="content-row">
      <a-col :span="24">
        <a-card title="車輛列表" class="vehicles-card">
          <a-table
            :data-source="safeVehicles"
            :columns="vehicleColumns"
            :loading="loading"
            :pagination="{ pageSize: 5 }"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'vehicle'">
                <div class="vehicle-info">
                  <strong>{{ getVehicleBrand(record) }} {{ getVehicleModel(record) }}</strong>
                  <div class="vehicle-details">
                    {{ getVehicleYear(record) }}年 | {{ getVehicleColor(record) }} | {{ getVehicleLicensePlate(record) }}
                  </div>
                </div>
              </template>
              <template v-else-if="column.key === 'mileage'">
                {{ getVehicleMileage(record).toLocaleString() }} km
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getVehicleStatus(record).color">
                  {{ getVehicleStatus(record).text }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-button type="link" size="small" @click="goToVehicle(record.id)">
                  查看詳情
                </a-button>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { 
  CarOutlined, 
  WarningOutlined, 
  ClockCircleOutlined, 
  DollarOutlined 
} from "@ant-design/icons-vue";
import { useVehicleStore } from "../stores/vehicles";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

const router = useRouter();
const vehicleStore = useVehicleStore();
const loading = ref(false);

// 安全的數據訪問函數
const getSafeVehicles = () => {
  try {
    return vehicleStore.vehicles || [];
  } catch (error) {
    console.error('獲取車輛數據失敗:', error);
    return [];
  }
};

const getVehicleInfo = (vehicle) => {
  return vehicle?.vehicle_info || {};
};

const getMaintenanceRecords = (vehicle) => {
  return vehicle?.maintenance_records || [];
};

// 安全的計算屬性
const safeVehicles = computed(() => getSafeVehicles());
const safeTotalVehicles = computed(() => safeVehicles.value.length);

// 計算總保養花費
const safeTotalCost = computed(() => {
  try {
    let total = 0;
    safeVehicles.value.forEach(vehicle => {
      const maintenanceRecords = getMaintenanceRecords(vehicle);
      maintenanceRecords.forEach(item => {
        const serviceHistory = item?.service_history || [];
        serviceHistory.forEach(history => {
          total += Number(history?.cost) || 0;
        });
      });
    });
    return total;
  } catch (error) {
    console.error('計算總花費失敗:', error);
    return 0;
  }
});

// 計算逾期保養項目
const safeUrgentMaintenance = computed(() => {
  try {
    const overdueItems = [];
    
    safeVehicles.value.forEach(vehicle => {
      const vehicleInfo = getVehicleInfo(vehicle);
      const currentMileage = Number(vehicleInfo.current_mileage) || 0;
      const maintenanceRecords = getMaintenanceRecords(vehicle);
      
      maintenanceRecords.forEach(item => {
        const dueMileage = Number(item.next_due_mileage);
        if (dueMileage && currentMileage >= dueMileage) {
          overdueItems.push({
            vehicleId: vehicle.id,
            vehicleName: `${vehicleInfo.brand || ''} ${vehicleInfo.model || ''}`.trim() || '未知車輛',
            itemName: item.item_zh || item.item_en || '未知項目',
            currentMileage: currentMileage,
            dueMileage: dueMileage,
            category: item.category || '其他'
          });
        }
      });
    });
    
    return overdueItems;
  } catch (error) {
    console.error('計算逾期保養項目失敗:', error);
    return [];
  }
});

// 計算即將到期項目（1000公里內）
const safeDueSoonMaintenance = computed(() => {
  try {
    const dueSoonItems = [];
    
    safeVehicles.value.forEach(vehicle => {
      const vehicleInfo = getVehicleInfo(vehicle);
      const currentMileage = Number(vehicleInfo.current_mileage) || 0;
      const maintenanceRecords = getMaintenanceRecords(vehicle);
      
      maintenanceRecords.forEach(item => {
        const dueMileage = Number(item.next_due_mileage);
        if (dueMileage) {
          const remaining = dueMileage - currentMileage;
          if (remaining > 0 && remaining <= 1000) {
            dueSoonItems.push({
              vehicleId: vehicle.id,
              vehicleName: `${vehicleInfo.brand || ''} ${vehicleInfo.model || ''}`.trim() || '未知車輛',
              itemName: item.item_zh || item.item_en || '未知項目',
              currentMileage: currentMileage,
              dueMileage: dueMileage,
              remaining: remaining,
              category: item.category || '其他'
            });
          }
        }
      });
    });
    
    return dueSoonItems;
  } catch (error) {
    console.error('計算即將到期項目失敗:', error);
    return [];
  }
});

// 統計數量
const safeOverdueMaintenanceCount = computed(() => safeUrgentMaintenance.value.length);
const safeDueSoonMaintenanceCount = computed(() => safeDueSoonMaintenance.value.length);

// 最近服務記錄
const safeRecentServiceRecords = computed(() => {
  try {
    const allRecords = [];
    
    safeVehicles.value.forEach(vehicle => {
      const vehicleInfo = getVehicleInfo(vehicle);
      const maintenanceRecords = getMaintenanceRecords(vehicle);
      
      maintenanceRecords.forEach(item => {
        const serviceHistory = item?.service_history || [];
        serviceHistory.forEach(history => {
          if (history?.service_date && history?.service_mileage) {
            allRecords.push({
              id: `${vehicle.id}-${item.id}-${history.id}`,
              vehicleId: vehicle.id,
              vehicleName: `${vehicleInfo.brand || ''} ${vehicleInfo.model || ''}`.trim() || '未知車輛',
              itemName: item.item_zh || item.item_en || '未知項目',
              serviceDate: history.service_date,
              serviceMileage: Number(history.service_mileage) || 0,
              cost: Number(history.cost) || 0,
              note: history.note,
              status: history.status,
              category: item.category || '其他'
            });
          }
        });
      });
    });
    
    // 按日期排序，最新的在前面，只取最近10筆
    return allRecords
      .sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate))
      .slice(0, 10);
  } catch (error) {
    console.error('計算最近服務記錄失敗:', error);
    return [];
  }
});

// 車輛表格列定義
const vehicleColumns = [
  {
    title: "車輛資訊",
    key: "vehicle",
    width: "25%"
  },
  {
    title: "目前里程",
    key: "mileage",
    width: "15%"
  },
  {
    title: "保養狀態",
    key: "status",
    width: "20%"
  },
  {
    title: "最後更新",
    key: "last_updated",
    width: "15%"
  },
  {
    title: "操作",
    key: "actions",
    width: "15%"
  }
];

// 安全的車輛信息獲取方法
const getVehicleBrand = (vehicle) => {
  return getVehicleInfo(vehicle).brand || '未知品牌';
};

const getVehicleModel = (vehicle) => {
  return getVehicleInfo(vehicle).model || '未知型號';
};

const getVehicleYear = (vehicle) => {
  return getVehicleInfo(vehicle).year || '未知';
};

const getVehicleColor = (vehicle) => {
  return getVehicleInfo(vehicle).color || '未知顏色';
};

const getVehicleLicensePlate = (vehicle) => {
  return getVehicleInfo(vehicle).license_plate || '未知車牌';
};

const getVehicleMileage = (vehicle) => {
  return Number(getVehicleInfo(vehicle).current_mileage) || 0;
};

const getVehicleLastUpdated = (vehicle) => {
  return getVehicleInfo(vehicle).last_updated || '-';
};

// 方法
const getVehicleStatus = (vehicle) => {
  try {
    const vehicleInfo = getVehicleInfo(vehicle);
    const currentMileage = Number(vehicleInfo.current_mileage) || 0;
    const maintenanceRecords = getMaintenanceRecords(vehicle);
    
    let overdueCount = 0;
    let dueSoonCount = 0;

    maintenanceRecords.forEach(item => {
      const dueMileage = Number(item.next_due_mileage);
      if (dueMileage) {
        if (currentMileage >= dueMileage) {
          overdueCount++;
        } else if (currentMileage >= dueMileage - 1000) {
          dueSoonCount++;
        }
      }
    });

    if (overdueCount > 0) {
      return { text: `逾期(${overdueCount})`, color: "red" };
    } else if (dueSoonCount > 0) {
      return { text: `即將到期(${dueSoonCount})`, color: "orange" };
    } else {
      return { text: "正常", color: "green" };
    }
  } catch (error) {
    console.error('獲取車輛狀態失敗:', error);
    return { text: "未知", color: "gray" };
  }
};

const getTimelineColor = (status) => {
  switch (status) {
    case "ok":
    case "completed":
      return "green";
    case "replaced":
      return "blue";
    default:
      return "gray";
  }
};

const getCategoryColor = (category) => {
  const colors = {
    "引擎": "red",
    "傳動": "orange",
    "空調": "blue",
    "進氣系統": "green",
    "冷卻系統": "cyan",
    "電系": "purple",
    "底盤": "geekblue",
    "制動系統": "volcano",
    "排氣系統": "magenta"
  };
  return colors[category] || "default";
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return dayjs(dateString).format("YYYY/MM/DD");
  } catch (error) {
    return dateString;
  }
};

const goToVehicle = (vehicleId) => {
  if (vehicleId) {
    router.push(`/vehicles/${vehicleId}`);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await vehicleStore.loadVehicles();
  } catch (error) {
    message.error("載入車輛資料失敗");
    console.error('載入車輛資料錯誤:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* 樣式保持不變 */
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  color: #1890ff;
  margin-bottom: 8px;
  font-size: 28px;
}

.page-header p {
  color: #666;
  font-size: 16px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px;
}

.stat-icon {
  font-size: 36px;
  margin-right: 16px;
  color: #1890ff;
}

.stat-icon.overdue {
  color: #ff4d4f;
}

.stat-icon.due-soon {
  color: #fa8c16;
}

.stat-icon.cost {
  color: #52c41a;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-number.overdue {
  color: #ff4d4f;
}

.stat-number.due-soon {
  color: #fa8c16;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.content-row {
  margin-bottom: 24px;
}

.maintenance-card,
.recent-card,
.vehicles-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge.count-badge {
  background: #ff4d4f;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.badge.count-badge.warning {
  background: #fa8c16;
}

.maintenance-item {
  border-left: 4px solid transparent;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
}

.maintenance-item.overdue {
  border-left-color: #ff4d4f;
  background-color: #fff2f0;
}

.maintenance-item.due-soon {
  border-left-color: #fa8c16;
  background-color: #fffbe6;
}

.timeline-record {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-date {
  color: #666;
  font-size: 12px;
}

.record-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.record-note {
  font-size: 12px;
  color: #888;
  font-style: italic;
  border-left: 2px solid #e8e8e8;
  padding-left: 8px;
}

.empty-timeline {
  padding: 40px 0;
}

.vehicle-info {
  line-height: 1.4;
}

.vehicle-details {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

:deep(.ant-timeline-item-tail) {
  border-left: 2px solid #f0f0f0;
}

:deep(.ant-timeline-item-head) {
  width: 12px;
  height: 12px;
}
</style>
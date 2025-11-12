<template>
  <div class="vehicle-detail" v-if="vehicle && !loading">
    <div class="page-header">
      <a-button @click="$router.back()" class="back-button">
        <arrow-left-outlined />
        返回
      </a-button>
      <div class="header-content">
        <h1>{{ vehicle.vehicle_info.brand }} {{ vehicle.vehicle_info.model }}</h1>
        <p>車牌: {{ vehicle.vehicle_info.license_plate }} | VIN: {{ vehicle.vehicle_info.vin }}</p>
      </div>
    </div>

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="info" tab="基本資訊">
        <VehicleInfo :vehicle="vehicle" />
      </a-tab-pane>
      <a-tab-pane key="maintenance" tab="保養記錄">
        <MaintenanceTable 
          :maintenance-records="vehicle.maintenance_records"
          :current-mileage="vehicle.vehicle_info.current_mileage"
          @update-mileage="handleUpdateMileage"
          @add-record="handleAddRecord"
        />
      </a-tab-pane>
      <a-tab-pane key="history" tab="服務歷史">
        <ServiceHistory :maintenance-records="vehicle.maintenance_records" />
      </a-tab-pane>
    </a-tabs>

    <!-- 更新里程模態框 -->
    <a-modal
      v-model:open="showMileageModal"
      title="更新目前里程"
      @ok="updateCurrentMileage"
      @cancel="showMileageModal = false"
    >
      <a-form layout="vertical">
        <a-form-item label="目前里程 (km)">
          <a-input-number
            v-model:value="newMileage"
            :min="vehicle.vehicle_info.current_mileage"
            :max="999999"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
  
  <div v-else-if="loading" class="loading-container">
    <a-spin size="large" tip="載入中..." />
  </div>
  
  <a-empty v-else description="找不到車輛資料" />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import { useVehicleStore } from "../stores/vehicles";
import { message } from "ant-design-vue";
import VehicleInfo from "../components/VehicleInfo.vue";
import MaintenanceTable from "../components/MaintenanceTable.vue";
import ServiceHistory from "../components/ServiceHistory.vue";

const route = useRoute();
const router = useRouter();
const vehicleStore = useVehicleStore();
const activeTab = ref("info");
const showMileageModal = ref(false);
const newMileage = ref(0);
const loading = ref(false);

// 使用計算屬性獲取車輛資料
const vehicle = computed(() => {
  if (!vehicleStore.getVehicleById) {
    console.error("getVehicleById 方法不存在");
    return null;
  }
  return vehicleStore.getVehicleById(route.params.id);
});

const handleUpdateMileage = () => {
  if (vehicle.value) {
    newMileage.value = vehicle.value.vehicle_info.current_mileage;
    showMileageModal.value = true;
  }
};

const updateCurrentMileage = async () => {
  if (vehicle.value && newMileage.value) {
    try {
      await vehicleStore.updateVehicleMileage(vehicle.value.id, newMileage.value);
      message.success("里程更新成功");
      showMileageModal.value = false;
    } catch (error) {
      message.error("里程更新失敗");
      console.error(error);
    }
  }
};

const handleAddRecord = async (recordData) => {
  try {
    await vehicleStore.addMaintenanceRecord(vehicle.value.id, recordData);
    message.success("保養記錄新增成功");
  } catch (error) {
    message.error("保養記錄新增失敗");
    console.error(error);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    // 如果本地沒有車輛資料，先載入
    if (!vehicle.value) {
      await vehicleStore.loadVehicles();
    }
    
    // 如果還是找不到車輛，嘗試從 API 載入
    if (!vehicle.value) {
      await vehicleStore.loadVehicleById(route.params.id);
    }
    
    // 如果仍然找不到，顯示錯誤
    if (!vehicle.value) {
      message.warning("找不到指定的車輛");
      router.push("/vehicles");
    }
  } catch (error) {
    message.error("載入車輛資料時發生錯誤");
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.vehicle-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}

.back-button {
  margin-right: 16px;
}

.header-content h1 {
  margin-bottom: 4px;
  color: #1890ff;
}

.header-content p {
  color: #666;
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}
</style>
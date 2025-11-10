<template>
  <div class="maintenance-view" v-if="vehicle">
    <a-page-header
      :title="`保養管理 - ${vehicle.plateNumber}`"
      @back="() => $router.push('/admin/vehicles')"
      class="page-header"
    >
      <template #extra>
        <a-button type="primary" @click="showMaintenanceForm = true">
          新增保養記錄
        </a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :span="24">
        <a-card title="保養記錄管理">
          <template #extra>
            <a-space>
              <a-input-search
                v-model:value="searchText"
                placeholder="搜尋服務項目..."
                style="width: 200px"
                @search="handleSearch"
              />
              <a-select
                v-model:value="statusFilter"
                placeholder="狀態篩選"
                style="width: 120px"
                @change="handleFilter"
              >
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="pending">待處理</a-select-option>
                <a-select-option value="completed">已完成</a-select-option>
                <a-select-option value="cancelled">已取消</a-select-option>
              </a-select>
            </a-space>
          </template>

          <MaintenanceForm
  :visible="showMaintenanceForm"
  :maintenance-data="editingMaintenance"
  @update:visible="showMaintenanceForm = $event"
  @submit="handleMaintenanceSubmit"
/>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <a-col :xs="24" :lg="12">
        <a-card title="統計資訊">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="總保養次數">
              {{ vehicle.maintenance.length }}
            </a-descriptions-item>
            <a-descriptions-item label="待處理項目">
              <a-tag color="orange">
                {{ pendingCount }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="已完成項目">
              <a-tag color="green">
                {{ completedCount }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="總費用">
              <strong>NT$ {{ totalCost.toLocaleString() }}</strong>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="即將到期的保養">
          <a-list
            v-if="upcomingMaintenance.length > 0"
            :data-source="upcomingMaintenance"
            size="small"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :description="`下次保養: ${formatDate(item.nextDueDate)}`"
                >
                  <template #title>
                    <a-tag color="orange">{{ item.service }}</a-tag>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          <a-empty v-else description="無即將到期的保養" />
        </a-card>
      </a-col>
    </a-row>

    <MaintenanceForm
      v-model:visible="showMaintenanceForm"
      :maintenance-data="editingMaintenance"
      @submit="handleMaintenanceSubmit"
    />
  </div>
  <div v-else class="loading-container">
    <a-spin size="large" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useVehicleStore } from "@/stores/vehicles";
import MaintenanceTable from "@/components/MaintenanceTable.vue";
import MaintenanceForm from "@/components/MaintenanceForm.vue";
import { formatDate, getDaysUntilDue } from "@/utils/dateFormatter";

const route = useRoute();
const vehicleStore = useVehicleStore();
const { getVehicleById, updateMaintenance } = vehicleStore;

const vehicle = computed(() => getVehicleById(route.params.vehicleId));
const showMaintenanceForm = ref(false);
const editingMaintenance = ref(null);
const searchText = ref("");
const statusFilter = ref("");

onMounted(() => {
  if (!vehicle.value) {
    vehicleStore.fetchVehicles();
  }
});

const filteredMaintenance = computed(() => {
  let filtered = vehicle.value?.maintenance || [];
  
  if (searchText.value) {
    filtered = filtered.filter(item =>
      item.service.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.value.toLowerCase())
    );
  }
  
  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value);
  }
  
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
});

const pendingCount = computed(() => 
  vehicle.value?.maintenance.filter(m => m.status === "pending").length || 0
);

const completedCount = computed(() => 
  vehicle.value?.maintenance.filter(m => m.status === "completed").length || 0
);

const totalCost = computed(() => 
  vehicle.value?.maintenance
    .filter(m => m.status === "completed")
    .reduce((sum, item) => sum + (item.cost || 0), 0) || 0
);

const upcomingMaintenance = computed(() => {
  if (!vehicle.value) return [];
  
  return vehicle.value.maintenance
    .filter(item => item.nextDueDate && getDaysUntilDue(item.nextDueDate) <= 30)
    .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
    .slice(0, 5);
});

const handleSearch = () => {
  // 搜尋邏輯已在 computed 中處理
};

const handleFilter = () => {
  // 篩選邏輯已在 computed 中處理
};

const handleEditMaintenance = (maintenance) => {
  editingMaintenance.value = maintenance;
  showMaintenanceForm.value = true;
};

const handleDeleteMaintenance = (maintenance) => {
  // 實現刪除邏輯
  console.log("刪除保養記錄:", maintenance);
};

const handleMaintenanceSubmit = async (maintenanceData) => {
  try {
    await updateMaintenance(route.params.vehicleId, maintenanceData);
    showMaintenanceForm.value = false;
    editingMaintenance.value = null;
  } catch (error) {
    console.error("更新保養記錄失敗:", error);
  }
};
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.page-header {
  background: #fff;
  margin-bottom: 16px;
}
</style>
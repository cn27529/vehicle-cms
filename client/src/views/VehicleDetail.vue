<template>
  <div class="vehicle-detail" v-if="vehicle">
    <a-page-header
      :title="`車輛詳情 - ${vehicle.plateNumber}`"
      @back="() => $router.push('/admin/vehicles')"
      class="page-header"
    >
      <template #extra>
        <a-button @click="goToMaintenance">保養管理</a-button>
        <a-button type="primary" @click="showMaintenanceForm = true">
          新增保養記錄
        </a-button>
      </template>
    </a-page-header>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="12">
        <VehicleInfo :vehicle="vehicle" />
      </a-col>
      <a-col :xs="24" :lg="12">
        <ServiceHistory :maintenance-data="vehicle.maintenance" />
      </a-col>
    </a-row>

    <a-card title="保養記錄總覽" style="margin-top: 16px">
      <MaintenanceTable 
        :maintenance-data="vehicle.maintenance"
        :show-actions="true"
        @edit="handleEditMaintenance"
        @delete="handleDeleteMaintenance"
      />
    </a-card>

    <MaintenanceForm
  :visible="showMaintenanceForm"
  :maintenance-data="editingMaintenance"
  @update:visible="showMaintenanceForm = $event"
  @submit="handleMaintenanceSubmit"
/>
  </div>
  <div v-else class="loading-container">
    <a-spin size="large" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVehicleStore } from "@/stores/vehicles";
import VehicleInfo from "@/components/VehicleInfo.vue";
import MaintenanceTable from "@/components/MaintenanceTable.vue";
import ServiceHistory from "@/components/ServiceHistory.vue";
import MaintenanceForm from "@/components/MaintenanceForm.vue";

const route = useRoute();
const router = useRouter();
const vehicleStore = useVehicleStore();
const { getVehicleById, updateMaintenance } = vehicleStore;

const vehicle = computed(() => getVehicleById(route.params.id));
const showMaintenanceForm = ref(false);
const editingMaintenance = ref(null);

onMounted(() => {
  if (!vehicle.value) {
    vehicleStore.fetchVehicles();
  }
});

const goToMaintenance = () => {
  router.push(`/admin/maintenance/${route.params.id}`);
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
    await updateMaintenance(route.params.id, maintenanceData);
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
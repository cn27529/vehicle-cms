<template>
  <div class="my-car" v-if="vehicle">
    <a-page-header
      :title="`我的車輛 - ${vehicle.vehicle_info.license_plate}`"
      class="page-header"
    >
      <template #extra>
        <a-button @click="refreshData">
          <template #icon><reload-outlined /></template>
          重新整理
        </a-button>
      </template>
    </a-page-header>

    <a-alert
      v-if="upcomingMaintenance.length > 0"
      message="有即將到期的保養項目"
      :description="`共有 ${upcomingMaintenance.length} 個項目需要關注`"
      type="warning"
      show-icon
      style="margin-bottom: 16px"
    />

    <a-row :gutter="16">
      <a-col :xs="24" :lg="8">
        <a-card title="車輛概況" class="overview-card">
          <a-statistic
            title="目前里程"
            :value="vehicle.vehicle_info.current_mileage"
            suffix="公里"
          />
          <a-divider />
          <a-statistic
            title="保養項目"
            :value="vehicle.maintenance_records.length"
          />
          <a-divider />
          <a-statistic
            title="即將到期"
            :value="upcomingMaintenance.length"
            class="pending-count"
          />
        </a-card>
        
        <a-card title="快速統計" style="margin-top: 16px">
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="引擎相關">
              {{ getCategoryCount('引擎') }} 項
            </a-descriptions-item>
            <a-descriptions-item label="底盤相關">
              {{ getCategoryCount('底盤') }} 項
            </a-descriptions-item>
            <a-descriptions-item label="電系相關">
              {{ getCategoryCount('電系') }} 項
            </a-descriptions-item>
            <a-descriptions-item label="最後更新">
              {{ formatDate(vehicle.vehicle_info.last_updated) }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="16">
        <VehicleInfo :vehicle="vehicle" />
      </a-col>
    </a-row>

    <a-tabs v-model:activeKey="activeTab" style="margin-top: 16px">
      <a-tab-pane key="maintenance" tab="保養項目">
        <MaintenanceTable 
          :maintenance-data="vehicle.maintenance_records"
          :current-mileage="vehicle.vehicle_info.current_mileage"
        />
      </a-tab-pane>
      
      <a-tab-pane key="upcoming" tab="即將到期">
        <a-card title="即將到期的保養項目">
          <a-list
            v-if="upcomingMaintenance.length > 0"
            :data-source="upcomingMaintenance"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta
                  :description="item.category"
                >
                  <template #title>
                    <a-space>
                      <strong>{{ item.item_zh }}</strong>
                      <a-tag color="orange">
                        剩 {{ item.next_due_mileage - vehicle.vehicle_info.current_mileage }} 公里
                      </a-tag>
                    </a-space>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <span>到期里程: {{ item.next_due_mileage }} 公里</span>
                </template>
              </a-list-item>
            </template>
          </a-list>
          <a-empty v-else description="暫無即將到期的保養項目" />
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
  <div v-else class="not-found">
    <a-result
      status="404"
      title="車輛未找到"
      sub-title="抱歉，找不到對應的車輛資訊。請檢查網址是否正確。"
    >
      <template #extra>
        <a-button type="primary" @click="$router.push('/')">
          返回首頁
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useVehicleStore } from "@/stores/vehicles";
import VehicleInfo from "@/components/VehicleInfo.vue";
import MaintenanceTable from "@/components/MaintenanceTable.vue";
import { ReloadOutlined } from "@ant-design/icons-vue";
import { formatDate } from "@/utils/dateFormatter";

const route = useRoute();
const vehicleStore = useVehicleStore();
const { getVehicleByPlate, fetchVehicles } = vehicleStore;

const activeTab = ref("maintenance");
const vehicle = computed(() => {
  const plateNumber = route.params.plateNumber;
  return plateNumber ? getVehicleByPlate(plateNumber) : getVehicleByPlate("BDE-9373");
});

const upcomingMaintenance = computed(() => {
  if (!vehicle.value) return [];
  
  return vehicle.value.maintenance_records
    .filter(item => 
      item.next_due_mileage && 
      item.next_due_mileage - vehicle.value.vehicle_info.current_mileage <= 1000
    )
    .sort((a, b) => a.next_due_mileage - b.next_due_mileage);
});

const getCategoryCount = (category) => {
  if (!vehicle.value) return 0;
  return vehicle.value.maintenance_records.filter(item => item.category === category).length;
};

onMounted(() => {
  if (!vehicle.value) {
    fetchVehicles();
  }
});

const refreshData = () => {
  fetchVehicles();
};
</script>
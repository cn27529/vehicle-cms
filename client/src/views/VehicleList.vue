<template>
  <div class="vehicle-list">
    <a-page-header
      title="車輛管理"
      sub-title="管理所有保修車輛"
      class="page-header"
    >
      <template #extra>
        <a-button type="primary" @click="showAddModal = true">
          <template #icon><plus-outlined /></template>
          新增車輛
        </a-button>
      </template>
    </a-page-header>

    <a-table
      :columns="columns"
      :data-source="vehicles"
      :loading="loading"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'plateNumber'">
          <router-link :to="`/admin/vehicles/${record.id}`">
            {{ record.plateNumber }}
          </router-link>
        </template>
        <template v-else-if="column.key === 'owner'">
          {{ record.owner.name }}
        </template>
        <template v-else-if="column.key === 'vehicleInfo'">
          {{ record.vehicleInfo.make }} {{ record.vehicleInfo.model }} ({{ record.vehicleInfo.year }})
        </template>
        <template v-else-if="column.key === 'maintenanceCount'">
          <a-tag>
            {{ record.maintenance.length }} 筆記錄
          </a-tag>
        </template>
        <template v-else-if="column.key === 'lastService'">
          {{ getLastServiceDate(record) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button size="small" @click="viewVehicle(record)">查看</a-button>
            <a-button size="small" type="primary" @click="manageMaintenance(record)">
              保養管理
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增車輛模態框 -->
    <a-modal
      v-model:open="showAddModal"
      title="新增車輛"
      @ok="handleAddVehicle"
      @cancel="showAddModal = false"
    >
      <a-form :model="newVehicle" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="車牌號碼" required>
              <a-input v-model:value="newVehicle.plateNumber" placeholder="例: ABC-1234" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="廠牌" required>
              <a-input v-model:value="newVehicle.make" placeholder="例: Toyota" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="車型" required>
              <a-input v-model:value="newVehicle.model" placeholder="例: Camry" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="年份" required>
              <a-input-number
                v-model:value="newVehicle.year"
                :min="1990"
                :max="2024"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="VIN碼">
          <a-input v-model:value="newVehicle.vin" placeholder="車輛識別號碼" />
        </a-form-item>
        <a-form-item label="目前里程">
          <a-input-number
            v-model:value="newVehicle.mileage"
            :min="0"
            style="width: 100%"
          >
            <template #addonAfter>公里</template>
          </a-input-number>
        </a-form-item>
        <a-divider>車主資訊</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="姓名" required>
              <a-input v-model:value="newVehicle.ownerName" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="電話" required>
              <a-input v-model:value="newVehicle.ownerPhone" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item label="Email">
          <a-input v-model:value="newVehicle.ownerEmail" type="email" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useVehicleStore } from "@/stores/vehicles";
import { PlusOutlined } from "@ant-design/icons-vue";
import { formatDate } from "@/utils/dateFormatter";

const router = useRouter();
const vehicleStore = useVehicleStore();
const { vehicles, loading, fetchVehicles, addVehicle } = vehicleStore;

const showAddModal = ref(false);
const newVehicle = ref({
  plateNumber: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  vin: "",
  mileage: 0,
  ownerName: "",
  ownerPhone: "",
  ownerEmail: ""
});

const columns = [
  {
    title: "車牌號碼",
    dataIndex: "plateNumber",
    key: "plateNumber",
    sorter: true
  },
  {
    title: "車主",
    dataIndex: "owner",
    key: "owner"
  },
  {
    title: "車輛資訊",
    dataIndex: "vehicleInfo",
    key: "vehicleInfo"
  },
  {
    title: "保養記錄",
    dataIndex: "maintenanceCount",
    key: "maintenanceCount"
  },
  {
    title: "最後服務",
    dataIndex: "lastService",
    key: "lastService"
  },
  {
    title: "操作",
    key: "actions",
    width: 200
  }
];

onMounted(() => {
  fetchVehicles();
});

const getLastServiceDate = (vehicle) => {
  if (vehicle.maintenance.length === 0) return "無記錄";
  const lastService = vehicle.maintenance
    .filter(m => m.status === "completed")
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  return lastService ? formatDate(lastService.date) : "無完成記錄";
};

const viewVehicle = (vehicle) => {
  router.push(`/admin/vehicles/${vehicle.id}`);
};

const manageMaintenance = (vehicle) => {
  router.push(`/admin/maintenance/${vehicle.id}`);
};

const handleAddVehicle = async () => {
  try {
    const vehicleData = {
      plateNumber: newVehicle.value.plateNumber,
      owner: {
        name: newVehicle.value.ownerName,
        phone: newVehicle.value.ownerPhone,
        email: newVehicle.value.ownerEmail
      },
      vehicleInfo: {
        make: newVehicle.value.make,
        model: newVehicle.value.model,
        year: newVehicle.value.year,
        vin: newVehicle.value.vin,
        mileage: newVehicle.value.mileage
      },
      maintenance: []
    };

    await addVehicle(vehicleData);
    showAddModal.value = false;
    
    // 重置表單
    Object.keys(newVehicle.value).forEach(key => {
      if (key === "year") {
        newVehicle.value[key] = new Date().getFullYear();
      } else if (key === "mileage") {
        newVehicle.value[key] = 0;
      } else {
        newVehicle.value[key] = "";
      }
    });
  } catch (error) {
    console.error("新增車輛失敗:", error);
  }
};

const handleTableChange = (pagination, filters, sorter) => {
  console.log("表格變化:", pagination, filters, sorter);
};
</script>

<style scoped>
.page-header {
  background: #fff;
  margin-bottom: 16px;
  padding: 16px 24px;
}
</style>
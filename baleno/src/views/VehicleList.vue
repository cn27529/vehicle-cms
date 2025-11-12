<template>
  <div class="vehicle-list">
    <div class="page-header">
      <div class="header-actions">
        <h1>車輛管理</h1>
        <a-button type="primary" @click="showAddModal = true">
          <plus-outlined />
          新增車輛
        </a-button>
      </div>
    </div>

    <a-table
      :data-source="vehicles"
      :loading="loading"
      :columns="columns"
      :pagination="{ pageSize: 10 }"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'vehicle'">
          <div class="vehicle-info">
            <strong>{{ record.vehicle_info.brand }} {{ record.vehicle_info.model }}</strong>
            <div class="vehicle-details">
              {{ record.vehicle_info.year }}年 | {{ record.vehicle_info.color }} | 
              {{ record.vehicle_info.license_plate }}
            </div>
          </div>
        </template>
        
        <template v-else-if="column.key === 'mileage'">
          {{ record.vehicle_info.current_mileage.toLocaleString() }} km
        </template>

        <template v-else-if="column.key === 'status'">
          <a-tag :color="getVehicleStatus(record).color">
            {{ getVehicleStatus(record).text }}
          </a-tag>
        </template>
        
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="viewVehicle(record)">
              <eye-outlined />
              查看
            </a-button>
            <a-button type="link" size="small" @click="editVehicle(record)">
              <edit-outlined />
              編輯
            </a-button>
            <a-popconfirm
              title="確定要刪除這輛車嗎？"
              @confirm="deleteVehicle(record)"
            >
              <a-button type="link" size="small" danger>
                <delete-outlined />
                刪除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增車輛模態框 -->
    <a-modal
      v-model:open="showAddModal"
      title="新增車輛"
      width="600px"
      @ok="handleAddVehicle"
      @cancel="handleCancelAdd"
      :confirm-loading="addingVehicle"
    >
      <a-form 
        :model="newVehicle" 
        layout="vertical"
        :rules="formRules"
        ref="addFormRef"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="品牌" name="brand">
              <a-select 
                v-model:value="newVehicle.brand" 
                placeholder="選擇品牌"
                show-search
              >
                <a-select-option 
                  v-for="brand in vehicleBrands" 
                  :key="brand"
                  :value="brand"
                >
                  {{ brand }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="車型" name="model">
              <a-input v-model:value="newVehicle.model" placeholder="輸入車型" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="車牌號碼" name="license_plate">
              <a-input v-model:value="newVehicle.license_plate" placeholder="輸入車牌號碼" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="年份" name="year">
              <a-input-number 
                v-model:value="newVehicle.year" 
                :min="1990" 
                :max="new Date().getFullYear()"
                style="width: 100%"
                placeholder="選擇年份"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="顏色" name="color">
              <a-input v-model:value="newVehicle.color" placeholder="輸入顏色" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="引擎編號" name="engine_code">
              <a-input v-model:value="newVehicle.engine_code" placeholder="輸入引擎編號" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="VIN碼" name="vin">
              <a-input v-model:value="newVehicle.vin" placeholder="輸入VIN碼" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目前里程 (km)" name="current_mileage">
              <a-input-number 
                v-model:value="newVehicle.current_mileage" 
                :min="0"
                :max="999999"
                style="width: 100%"
                placeholder="輸入目前里程"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="購買日期" name="purchase_date">
              <a-date-picker 
                v-model:value="newVehicle.purchase_date" 
                style="width: 100%"
                value-format="YYYY-MM-DD"
                placeholder="選擇購買日期"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="購買價格" name="purchase_price">
              <a-input-number 
                v-model:value="newVehicle.purchase_price" 
                :min="0"
                style="width: 100%"
                placeholder="輸入購買價格"
                :formatter="value => `NT$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="value => value.replace(/NT\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 編輯車輛模態框 -->
    <a-modal
      v-model:open="showEditModal"
      title="編輯車輛資訊"
      width="600px"
      @ok="handleEditVehicle"
      @cancel="handleCancelEdit"
      :confirm-loading="editingVehicle"
    >
      <a-form 
        v-if="editingVehicleData"
        :model="editingVehicleData" 
        layout="vertical"
        :rules="formRules"
        ref="editFormRef"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="品牌" name="brand">
              <a-select 
                v-model:value="editingVehicleData.brand" 
                placeholder="選擇品牌"
                show-search
              >
                <a-select-option 
                  v-for="brand in vehicleBrands" 
                  :key="brand"
                  :value="brand"
                >
                  {{ brand }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="車型" name="model">
              <a-input v-model:value="editingVehicleData.model" placeholder="輸入車型" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="車牌號碼" name="license_plate">
              <a-input 
                v-model:value="editingVehicleData.license_plate" 
                placeholder="輸入車牌號碼" 
                disabled
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="年份" name="year">
              <a-input-number 
                v-model:value="editingVehicleData.year" 
                :min="1990" 
                :max="new Date().getFullYear()"
                style="width: 100%"
                placeholder="選擇年份"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="顏色" name="color">
              <a-input v-model:value="editingVehicleData.color" placeholder="輸入顏色" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="引擎編號" name="engine_code">
              <a-input v-model:value="editingVehicleData.engine_code" placeholder="輸入引擎編號" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="VIN碼" name="vin">
              <a-input v-model:value="editingVehicleData.vin" placeholder="輸入VIN碼" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="目前里程 (km)" name="current_mileage">
              <a-input-number 
                v-model:value="editingVehicleData.current_mileage" 
                :min="0"
                :max="999999"
                style="width: 100%"
                placeholder="輸入目前里程"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="購買日期" name="purchase_date">
              <a-date-picker 
                v-model:value="editingVehicleData.purchase_date" 
                style="width: 100%"
                value-format="YYYY-MM-DD"
                placeholder="選擇購買日期"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="購買價格" name="purchase_price">
              <a-input-number 
                v-model:value="editingVehicleData.purchase_price" 
                :min="0"
                style="width: 100%"
                placeholder="輸入購買價格"
                :formatter="value => `NT$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="value => value.replace(/NT\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { 
  PlusOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons-vue";
import { useVehicleStore } from "../stores/vehicles";
import { message } from "ant-design-vue";
import dayjs from "dayjs";

const router = useRouter();
const vehicleStore = useVehicleStore();
const loading = ref(false);
const showAddModal = ref(false);
const showEditModal = ref(false);
const addingVehicle = ref(false);
const editingVehicle = ref(false);
const addFormRef = ref();
const editFormRef = ref();

const vehicles = computed(() => vehicleStore.vehicles);

const vehicleBrands = [
  "Suzuki", "Toyota", "Honda", "Mitsubishi", "Nissan", 
  "Mazda", "Ford", "BMW", "Mercedes-Benz", "Audi", "其他"
];

const newVehicle = ref({
  brand: "",
  model: "",
  license_plate: "",
  year: new Date().getFullYear(),
  color: "",
  engine_code: "",
  vin: "",
  current_mileage: 0,
  purchase_date: null,
  purchase_price: 0
});

const editingVehicleData = ref(null);

const formRules = {
  brand: [{ required: true, message: '請選擇品牌' }],
  model: [{ required: true, message: '請輸入車型' }],
  license_plate: [{ required: true, message: '請輸入車牌號碼' }],
  year: [{ required: true, message: '請選擇年份' }],
  vin: [{ required: true, message: '請輸入VIN碼' }]
};

const columns = [
  {
    title: "車輛資訊",
    key: "vehicle",
    width: "25%"
  },
  {
    title: "引擎編號",
    dataIndex: ["vehicle_info", "engine_code"],
    key: "engine"
  },
  {
    title: "VIN",
    dataIndex: ["vehicle_info", "vin"],
    key: "vin",
    width: "15%"
  },
  {
    title: "目前里程",
    key: "mileage",
    width: "10%"
  },
  {
    title: "狀態",
    key: "status",
    width: "10%"
  },
  {
    title: "最後更新",
    dataIndex: ["vehicle_info", "last_updated"],
    key: "last_updated",
    width: "12%"
  },
  {
    title: "操作",
    key: "actions",
    width: "18%"
  }
];

const getVehicleStatus = (vehicle) => {
  try {
    // 確保 vehicle 對象存在且有必要的屬性
    if (!vehicle || !vehicle.vehicle_info) {
      return { text: "資料不完整", color: "gray" };
    }

    const vehicleInfo = vehicle.vehicle_info;
    const currentMileage = Number(vehicleInfo.current_mileage) || 0;
    
    // 確保 maintenance_records 存在且是陣列
    const maintenanceRecords = vehicle.maintenance_records || [];
    
    let overdueCount = 0;
    let dueSoonCount = 0;

    // 安全地遍歷保養記錄
    maintenanceRecords.forEach(item => {
      if (item && item.next_due_mileage) {
        const dueMileage = Number(item.next_due_mileage);
        if (currentMileage >= dueMileage) {
          overdueCount++;
        } else if (currentMileage >= dueMileage - 1000) {
          dueSoonCount++;
        }
      }
    });

    if (overdueCount > 0) {
      return { text: `待保養(${overdueCount})`, color: "red" };
    } else if (dueSoonCount > 0) {
      return { text: `即將到期(${dueSoonCount})`, color: "orange" };
    } else {
      return { text: "正常", color: "green" };
    }
  } catch (error) {
    console.error('計算車輛狀態時發生錯誤:', error);
    return { text: "狀態未知", color: "gray" };
  }
};

const viewVehicle = (vehicle) => {
  router.push(`/vehicles/${vehicle.vehicle_info.license_plate}`);
};

const editVehicle = (vehicle) => {
  editingVehicleData.value = {
    ...vehicle.vehicle_info,
    id: vehicle.id
  };
  showEditModal.value = true;
};

const deleteVehicle = async (vehicle) => {
  try {
    const success = await vehicleStore.deleteVehicle(vehicle.vehicle_info.license_plate);
    if (success) {
      message.success("車輛刪除成功");
    } else {
      message.error("車輛刪除失敗");
    }
  } catch (error) {
    message.error("刪除車輛時發生錯誤");
    console.error(error);
  }
};

const handleAddVehicle = async () => {
  try {
    await addFormRef.value.validate();
    
    addingVehicle.value = true;
    
    const vehicleData = {
      vehicle_info: {
        ...newVehicle.value,
        manufacture_date: newVehicle.value.purchase_date,
        last_updated: dayjs().format("YYYY-MM-DD")
      },
      maintenance_records: [] // 初始為空，後續可以添加預設保養項目
    };

    await vehicleStore.addVehicle(vehicleData);
    
    message.success("車輛新增成功");
    showAddModal.value = false;
    resetAddForm();
  } catch (error) {
    if (error.errorFields) {
      message.warning("請填寫完整的車輛資訊");
    } else {
      message.error("新增車輛失敗");
      console.error(error);
    }
  } finally {
    addingVehicle.value = false;
  }
};

const handleEditVehicle = async () => {
  try {
    await editFormRef.value.validate();
    
    editingVehicle.value = true;
    
    const updatedData = {
      vehicle_info: {
        ...editingVehicleData.value,
        last_updated: dayjs().format("YYYY-MM-DD")
      }
    };

    const success = await vehicleStore.updateVehicle(
      editingVehicleData.value.license_plate, 
      updatedData
    );
    
    if (success) {
      message.success("車輛資訊更新成功");
      showEditModal.value = false;
    } else {
      message.error("車輛資訊更新失敗");
    }
  } catch (error) {
    if (error.errorFields) {
      message.warning("請填寫完整的車輛資訊");
    } else {
      message.error("更新車輛資訊失敗");
      console.error(error);
    }
  } finally {
    editingVehicle.value = false;
  }
};

const handleCancelAdd = () => {
  showAddModal.value = false;
  resetAddForm();
};

const handleCancelEdit = () => {
  showEditModal.value = false;
  editingVehicleData.value = null;
};

const resetAddForm = () => {
  newVehicle.value = {
    brand: "",
    model: "",
    license_plate: "",
    year: new Date().getFullYear(),
    color: "",
    engine_code: "",
    vin: "",
    current_mileage: 0,
    purchase_date: null,
    purchase_price: 0
  };
  addFormRef.value?.clearValidate();
};

onMounted(async () => {
  loading.value = true;
  await vehicleStore.loadVehicles();
  loading.value = false;
});
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.vehicle-info {
  line-height: 1.4;
}

.vehicle-details {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

:deep(.ant-table-thead > tr > th) {
  background-color: #fafafa;
  font-weight: 600;
}
</style>
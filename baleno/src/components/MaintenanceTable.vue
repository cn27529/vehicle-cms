<template>
  <div class="maintenance-table">
    <div class="table-header">
      <a-space>
        <a-button type="primary" @click="showAddModal = true">
          <plus-outlined />
          新增保養記錄
        </a-button>
        <a-button @click="$emit('update-mileage')">
          <edit-outlined />
          更新里程
        </a-button>
      </a-space>
      <div class="current-mileage">
        目前里程: <strong>{{ currentMileage.toLocaleString() }} km</strong>
      </div>
    </div>

    <a-table
      :data-source="maintenanceRecords"
      :columns="columns"
      :pagination="false"
      row-key="item_en"
      class="maintenance-records-table"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'item'">
          <div>
            <strong>{{ record.item_zh }}</strong>
            <div class="item-en">{{ record.item_en }}</div>
          </div>
        </template>
        
        <template v-else-if="column.key === 'category'">
          <a-tag :color="getCategoryColor(record.category)">
            {{ record.category }}
          </a-tag>
        </template>
        
        <template v-else-if="column.key === 'status'">
          <div :class="getStatusClass(record)">
            <a-tag :color="getStatusColor(record)">
              {{ getStatusText(record) }}
            </a-tag>
            <div class="next-due">
              下次: {{ record.next_due_mileage ? record.next_due_mileage.toLocaleString() + ' km' : 'N/A' }}
            </div>
          </div>
        </template>
        
        <template v-else-if="column.key === 'last_service'">
          <div v-if="lastService(record)">
            {{ formatDate(lastService(record).service_date) }}
            <div class="service-mileage">
              {{ lastService(record).service_mileage.toLocaleString() }} km
            </div>
          </div>
          <span v-else class="no-data">尚未保養</span>
        </template>
        
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="viewHistory(record)">
              <history-outlined />
              歷史
            </a-button>
            <a-button type="link" size="small" @click="addServiceRecord(record)">
              <plus-outlined />
              記錄
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增保養記錄模態框 -->
    <a-modal
      v-model:open="showAddModal"
      title="新增保養記錄"
      width="600px"
      @ok="handleAddRecord"
      @cancel="handleCancelAdd"
    >
      <a-form :model="newRecord" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="保養項目" required>
              <a-select v-model:value="newRecord.item_en" placeholder="選擇保養項目">
                <a-select-option 
                  v-for="item in maintenanceRecords" 
                  :key="item.item_en"
                  :value="item.item_en"
                >
                  {{ item.item_zh }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="服務日期" required>
              <a-date-picker 
                v-model:value="newRecord.service_date" 
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="服務里程" required>
              <a-input-number
                v-model:value="newRecord.service_mileage"
                :min="0"
                :max="999999"
                style="width: 100%"
                placeholder="輸入服務時的里程"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="花費">
              <a-input-number
                v-model:value="newRecord.cost"
                :min="0"
                style="width: 100%"
                placeholder="NT$"
              />
            </a-form-item>
          </a-col>
        </a-row>
        
        <a-form-item label="備註">
          <a-textarea
            v-model:value="newRecord.note"
            placeholder="輸入備註資訊"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { PlusOutlined, EditOutlined, HistoryOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";

// 定義 props
const props = defineProps({
  maintenanceRecords: {
    type: Array,
    default: () => []
  },
  currentMileage: {
    type: Number,
    default: 0
  }
});

// 定義 emits
const emit = defineEmits(['update-mileage', 'add-record']);

const showAddModal = ref(false);
const newRecord = ref({
  item_en: "",
  service_date: null,
  service_mileage: null,
  cost: null,
  note: ""
});

const columns = [
  {
    title: "保養項目",
    key: "item",
    width: "20%"
  },
  {
    title: "分類",
    key: "category",
    width: "12%"
  },
  {
    title: "保養週期",
    dataIndex: "interval_km",
    key: "interval",
    width: "10%",
    render: (text) => text ? `${text.toLocaleString()} km` : "視需要"
  },
  {
    title: "狀態",
    key: "status",
    width: "20%"
  },
  {
    title: "最後服務",
    key: "last_service",
    width: "15%"
  },
  {
    title: "操作",
    key: "actions",
    width: "15%"
  }
];

// 安全的方法
const lastService = (record) => {
  try {
    if (!record?.service_history || !Array.isArray(record.service_history) || record.service_history.length === 0) {
      return null;
    }
    
    // 找到最新的服務記錄
    const validRecords = record.service_history
      .filter(history => history?.service_date)
      .sort((a, b) => new Date(b.service_date) - new Date(a.service_date));
    
    return validRecords.length > 0 ? validRecords[0] : null;
  } catch (error) {
    console.error('獲取最後服務記錄失敗:', error);
    return null;
  }
};

const getStatusClass = (record) => {
  try {
    const nextDue = record?.next_due_mileage;
    if (!nextDue) return "status-unknown";
    
    const remaining = nextDue - props.currentMileage;
    if (remaining <= 0) return "status-overdue";
    if (remaining <= 1000) return "status-due-soon";
    return "status-ok";
  } catch (error) {
    return "status-unknown";
  }
};

const getStatusColor = (record) => {
  const statusClass = getStatusClass(record);
  switch (statusClass) {
    case "status-overdue": return "red";
    case "status-due-soon": return "orange";
    case "status-ok": return "green";
    default: return "blue";
  }
};

const getStatusText = (record) => {
  const statusClass = getStatusClass(record);
  switch (statusClass) {
    case "status-overdue": return "已逾期";
    case "status-due-soon": return "即將到期";
    case "status-ok": return "正常";
    default: return "未知";
  }
};

const getCategoryColor = (category) => {
  try {
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
  } catch (error) {
    return "default";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return dayjs(dateString).format("YYYY/MM/DD");
  } catch (error) {
    return dateString;
  }
};

const viewHistory = (record) => {
  console.log("查看歷史:", record);
};

const addServiceRecord = (record) => {
  try {
    newRecord.value.item_en = record?.item_en || "";
    showAddModal.value = true;
  } catch (error) {
    console.error('設置服務記錄失敗:', error);
  }
};

const handleAddRecord = () => {
  try {
    if (newRecord.value.item_en && newRecord.value.service_date && newRecord.value.service_mileage) {
      const record = {
        ...newRecord.value,
        service_date: dayjs(newRecord.value.service_date).format("YYYY-MM-DD"),
        status: "ok",
        reminder: false
      };
      
      emit('add-record', record);
      showAddModal.value = false;
      newRecord.value = {
        item_en: "",
        service_date: null,
        service_mileage: null,
        cost: null,
        note: ""
      };
    }
  } catch (error) {
    console.error('新增記錄失敗:', error);
  }
};

const handleCancelAdd = () => {
  showAddModal.value = false;
  newRecord.value = {
    item_en: "",
    service_date: null,
    service_mileage: null,
    cost: null,
    note: ""
  };
};
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.current-mileage {
  font-size: 16px;
}

.item-en {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.next-due {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.service-mileage {
  font-size: 12px;
  color: #666;
}

.no-data {
  color: #999;
  font-style: italic;
}

.status-overdue {
  color: #ff4d4f;
}

.status-due-soon {
  color: #fa8c16;
}

.status-ok {
  color: #52c41a;
}

.status-unknown {
  color: #1890ff;
}
</style>
<template>
  <a-table
    :columns="columns"
    :data-source="maintenanceData"
    :pagination="false"
    row-key="item_en"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'item_zh'">
        <div>
          <strong>{{ record.item_zh }}</strong>
          <div style="font-size: 12px; color: #666">{{ record.item_en }}</div>
        </div>
      </template>
      <template v-else-if="column.key === 'category'">
        <a-tag :color="getCategoryColor(record.category)">
          {{ record.category }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'next_due_mileage'">
        <span :class="getDueStatusClass(record, currentMileage)">
          {{ record.next_due_mileage || '-' }}
          <div v-if="record.next_due_mileage" style="font-size: 12px; color: #666">
            (剩 {{ record.next_due_mileage - currentMileage }} 公里)
          </div>
        </span>
      </template>
      <template v-else-if="column.key === 'last_service'">
        <div v-if="lastService(record)">
          {{ formatDate(lastService(record).service_date) }}
          <div style="font-size: 12px; color: #666">
            {{ lastService(record).service_mileage }} 公里
          </div>
        </div>
        <span v-else>-</span>
      </template>
      <template v-else-if="column.key === 'service_type'">
        <a-tag :color="record.service_type === 'replace' ? 'blue' : 'green'">
          {{ record.service_type === 'replace' ? '更換' : '檢查' }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'actions' && showActions">
        <a-space>
          <a-button size="small" @click="emit('view', record)">查看</a-button>
          <a-button size="small" type="primary" @click="emit('addService', record)">
            新增服務
          </a-button>
        </a-space>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { formatDate } from "@/utils/dateFormatter";

const props = defineProps({
  maintenanceData: {
    type: Array,
    default: () => []
  },
  currentMileage: {
    type: Number,
    default: 0
  },
  showActions: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["view", "addService"]);

const columns = [
  {
    title: "保養項目",
    dataIndex: "item_zh",
    key: "item_zh",
    width: 200
  },
  {
    title: "分類",
    dataIndex: "category",
    key: "category",
    width: 120
  },
  {
    title: "服務類型",
    dataIndex: "service_type",
    key: "service_type",
    width: 100
  },
  {
    title: "保養間隔",
    dataIndex: "interval_km",
    key: "interval_km",
    width: 120,
    render: (value) => value ? `${value} 公里` : '-'
  },
  {
    title: "下次保養里程",
    dataIndex: "next_due_mileage",
    key: "next_due_mileage",
    width: 150
  },
  {
    title: "最後服務",
    dataIndex: "last_service",
    key: "last_service",
    width: 150
  },
  {
    title: "服務次數",
    dataIndex: "service_count",
    key: "service_count",
    width: 100,
    render: (_, record) => record.service_history.length
  }
];

if (props.showActions) {
  columns.push({
    title: "操作",
    key: "actions",
    width: 150
  });
}

const getCategoryColor = (category) => {
  const colors = {
    '引擎': 'red',
    '傳動': 'orange',
    '空調': 'blue',
    '進氣系統': 'green',
    '冷卻系統': 'cyan',
    '電系': 'purple',
    '底盤': 'geekblue',
    '制動系統': 'volcano',
    '排氣系統': 'gold'
  };
  return colors[category] || 'default';
};

const lastService = (record) => {
  const services = record.service_history
    .filter(service => service.service_date)
    .sort((a, b) => new Date(b.service_date) - new Date(a.service_date));
  return services[0];
};

const getDueStatusClass = (record, currentMileage) => {
  if (!record.next_due_mileage) return '';
  
  const remaining = record.next_due_mileage - currentMileage;
  if (remaining <= 0) return 'due-now';
  if (remaining <= 500) return 'due-soon';
  return '';
};
</script>

<style scoped>
.due-soon {
  color: #faad14;
  font-weight: bold;
}

.due-now {
  color: #ff4d4f;
  font-weight: bold;
}
</style>
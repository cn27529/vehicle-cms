<template>
  <a-card :title="`${record.item_zh} - 服務歷史`" class="service-history-card">
    <a-list
      :data-source="sortedServiceHistory"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <a-space>
                <span>{{ formatDate(item.service_date) }}</span>
                <a-tag v-if="item.state" :color="getStateColor(item.state)">
                  {{ item.state === 'ok' ? '正常' : item.state }}
                </a-tag>
                <a-tag v-if="item.cost">NT$ {{ item.cost }}</a-tag>
              </a-space>
            </template>
            <template #description>
              <div>
                <div>里程: {{ item.service_mileage }} 公里</div>
                <div v-if="item.note">備註: {{ item.note }}</div>
                <div v-if="item.technician">技師: {{ item.technician }}</div>
                <div v-if="item.service_location">服務地點: {{ item.service_location }}</div>
              </div>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-button size="small" @click="emit('edit', item)">編輯</a-button>
          </template>
        </a-list-item>
      </template>
    </a-list>
    
    <template #extra>
      <a-button type="primary" @click="emit('add')">新增服務記錄</a-button>
    </template>
  </a-card>
</template>

<script setup>
import { computed } from "vue";
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from "@ant-design/icons-vue";
import { formatDate } from "@/utils/dateFormatter";

const props = defineProps({
  record: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["add", "edit"]);

const sortedServiceHistory = computed(() => {
  return [...props.record.service_history]
    .filter(service => service.service_date || service.service_mileage)
    .sort((a, b) => {
      const dateA = new Date(a.service_date || '2000-01-01');
      const dateB = new Date(b.service_date || '2000-01-01');
      return dateB - dateA;
    });
});

const getStateColor = (state) => {
  const colors = {
    'ok': 'green',
    'warning': 'orange',
    'error': 'red'
  };
  return colors[state] || 'default';
};
</script>
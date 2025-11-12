<template>
  <div class="service-history">
    <a-card title="服務歷史記錄">
      <a-timeline mode="alternate">
        <a-timeline-item
          v-for="event in timelineEvents"
          :key="event.id"
          :color="getEventColor(event)"
        >
          <div class="timeline-event">
            <div class="event-header">
              <strong>{{ event.item_zh }}</strong>
              <span class="event-date">{{ formatDate(event.service_date) }}</span>
            </div>
            <div class="event-details">
              <span class="mileage">里程: {{ event.service_mileage.toLocaleString() }} km</span>
              <span v-if="event.cost" class="cost">花費: NT$ {{ event.cost.toLocaleString() }}</span>
            </div>
            <div v-if="event.note" class="event-note">
              {{ event.note }}
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
      
      <div v-if="timelineEvents.length === 0" class="empty-timeline">
        <a-empty description="尚無服務記錄" />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { computed } from "vue";
import dayjs from "dayjs";

// 定義 props
const props = defineProps({
  maintenanceRecords: {
    type: Array,
    default: () => []
  }
});

// 計算時間軸事件
const timelineEvents = computed(() => {
  try {
    const events = [];
    const records = props.maintenanceRecords || [];
    
    records.forEach(record => {
      const serviceHistory = record?.service_history || [];
      
      serviceHistory.forEach(history => {
        if (history?.service_date && history?.service_mileage) {
          events.push({
            id: `${record.item_en}-${history.service_date}`,
            item_zh: record.item_zh || record.item_en || '未知項目',
            item_en: record.item_en,
            category: record.category || '其他',
            service_date: history.service_date,
            service_mileage: Number(history.service_mileage) || 0,
            cost: Number(history.cost) || 0,
            note: history.note,
            status: history.status
          });
        }
      });
    });
    
    // 按日期排序，最新的在前面
    return events.sort((a, b) => new Date(b.service_date) - new Date(a.service_date));
  } catch (error) {
    console.error('計算時間軸事件失敗:', error);
    return [];
  }
});

const getEventColor = (event) => {
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
    
    return colors[event.category] || "gray";
  } catch (error) {
    return "gray";
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
</script>

<style scoped>
.timeline-event {
  background: white;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.event-date {
  color: #666;
  font-size: 12px;
}

.event-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.event-note {
  font-size: 12px;
  color: #888;
  font-style: italic;
  border-left: 2px solid #e8e8e8;
  padding-left: 8px;
}

.empty-timeline {
  padding: 40px 0;
}
</style>
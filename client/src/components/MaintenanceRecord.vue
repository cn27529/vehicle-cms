<template>
  <div class="maintenance-record">
    <el-card shadow="hover">
      <template #header>
        <div class="record-header">
          <span class="record-title">{{ record.item_zh || "未知項目" }}</span>
          <div class="service-types" v-if="hasServiceTypes">
            <el-tag
              v-for="serviceType in serviceTypes"
              :key="serviceType"
              :type="getServiceTypeTag(serviceType)"
              size="small"
              class="service-type-tag"
            >
              {{ getServiceTypeText(serviceType) }}
            </el-tag>
          </div>
          <div class="no-service-types" v-else>
            <el-tag type="info" size="small">未設定服務類型</el-tag>
          </div>
        </div>
      </template>

      <div class="record-content">
        <div class="record-info">
          <div class="info-row">
            <span class="info-label">分類：</span>
            <el-tag :type="getCategoryTagType(record.category)" size="small">
              {{ record.category || "未分類" }}
            </el-tag>
          </div>
          <div
            class="info-row"
            v-if="record.interval_km && record.interval_km > 0"
          >
            <span class="info-label">保養間隔：</span>
            <span>{{ record.interval_km.toLocaleString() }} km</span>
          </div>
          <div
            class="info-row"
            v-if="record.next_due_mileage && record.next_due_mileage > 0"
          >
            <span class="info-label">下次保養：</span>
            <span :class="getDueMileageClass(record.next_due_mileage)">
              {{ record.next_due_mileage.toLocaleString() }} km
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">服務類型：</span>
            <span class="service-type-text">{{
              getServiceTypeDisplayText()
            }}</span>
          </div>
        </div>

        <div class="service-history">
          <div class="history-header">
            <span>服務記錄 ({{ serviceHistoryCount }})</span>
            <el-button
              type="primary"
              text
              size="small"
              @click="addServiceRecord"
            >
              <i class="el-icon-plus"></i>
              新增記錄
            </el-button>
          </div>

          <div class="history-list">
            <div
              v-for="(history, index) in sortedServiceHistory"
              :key="getHistoryKey(history, index)"
              class="history-item"
            >
              <div class="history-date">
                {{ formatDate(history.service_date) }}
              </div>
              <div class="history-details">
                <div class="history-mileage">
                  里程：{{ (history.service_mileage || 0).toLocaleString() }} km
                </div>
                <div class="history-note" v-if="history.note">
                  {{ history.note }}
                </div>
                <div class="history-technician" v-if="history.technician">
                  技師：{{ history.technician }}
                </div>
                <div class="history-cost" v-if="history.cost > 0">
                  ¥{{ history.cost }}
                </div>
                <div class="history-state" v-if="history.state">
                  <el-tag :type="getStateTagType(history.state)" size="small">
                    {{ getStateText(history.state) }}
                  </el-tag>
                </div>
              </div>
              <div class="history-actions">
                <el-button
                  type="text"
                  size="small"
                  @click="editRecord(history)"
                >
                  編輯
                </el-button>
              </div>
            </div>

            <div v-if="serviceHistoryCount === 0" class="empty-history">
              <i class="el-icon-document"></i>
              <p>暫無服務記錄</p>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  name: "MaintenanceRecord",
  props: {
    record: {
      type: Object,
      required: true,
    },
    currentMileage: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    // 安全處理 service_type - 處理空陣列和未定義情況
    const serviceTypes = computed(() => {
      if (!props.record.service_type) return [];
      if (Array.isArray(props.record.service_type)) {
        return props.record.service_type.filter(type => type && type.trim().length > 0);
      }
      // 向後兼容字串格式
      if (typeof props.record.service_type === 'string') {
        return props.record.service_type.split('|').filter(type => type && type.trim().length > 0);
      }
      return [];
    });

    // 檢查是否有有效的服務類型
    const hasServiceTypes = computed(() => {
      return serviceTypes.value.length > 0;
    });

    // 安全地處理 service_history
    const serviceHistory = computed(() => {
      return props.record.service_history || [];
    });

    const serviceHistoryCount = computed(() => {
      return serviceHistory.value.length;
    });

    const sortedServiceHistory = computed(() => {
      if (!serviceHistory.value || serviceHistory.value.length === 0) return [];
      
      return serviceHistory.value
        .filter(history => history.service_date || history.service_mileage)
        .sort((a, b) => {
          if (a.service_date && b.service_date) {
            return new Date(b.service_date) - new Date(a.service_date);
          }
          return (b.service_mileage || 0) - (a.service_mileage || 0);
        });
    });

    const getServiceTypeTag = (serviceType) => {
      const types = {
        replace: "danger",
        check: "warning",
        clean: "success",
        repair: "info",
        inspect: "primary",
        adjust: "success",
        custom: "info",
      };
      return types[serviceType] || "info";
    };

    const getServiceTypeText = (serviceType) => {
      const texts = {
        replace: "更換",
        check: "檢查",
        clean: "清潔",
        repair: "維修",
        inspect: "檢測",
        adjust: "調整",
        custom: "自訂",
      };
      return texts[serviceType] || serviceType;
    };

    // 獲取完整的服務類型顯示文字 - 安全處理
    const getServiceTypeDisplayText = () => {
      if (!hasServiceTypes.value) return '未設定';
      return serviceTypes.value.map(type => getServiceTypeText(type)).join(' + ');
    };

    // 其他方法保持不變...
    const getCategoryTagType = (category) => {
      if (!category) return "info";
      const types = {
        "引擎": "danger",
        "傳動": "warning",
        "空調": "success",
        "進氣系統": "info",
        "冷卻系統": "",
        "電系": "success",
        "底盤": "warning",
        "制動系統": "danger",
        "排氣系統": "info",
      };
      return types[category] || "info";
    };

    const getDueMileageClass = (nextDueMileage) => {
      if (!nextDueMileage || nextDueMileage <= 0) return 'due-neutral';
      if (props.record.item_en === 'battery') return 'due-neutral';
      
      const currentMileage = props.currentMileage || 0;
      const mileageDiff = nextDueMileage - currentMileage;
      
      if (mileageDiff <= 1000) return "due-soon";
      if (mileageDiff <= 3000) return "due-near";
      return "due-far";
    };

    const getStateTagType = (state) => {
      if (!state) return "info";
      const types = {
        "ok": "success",
        "replace": "warning",
        "check": "info",
      };
      return types[state] || "info";
    };

    const getStateText = (state) => {
      if (!state) return "";
      const texts = {
        "ok": "正常",
        "replace": "需更換",
        "check": "需檢查",
      };
      return texts[state] || state;
    };

    const formatDate = (dateString) => {
      if (!dateString) return "日期未知";
      try {
        return new Date(dateString).toLocaleDateString("zh-TW");
      } catch (error) {
        console.warn('日期格式錯誤:', dateString, error);
        return "日期格式錯誤";
      }
    };

    const getHistoryKey = (history, index) => {
      return `${history.service_date || ''}-${history.service_mileage || ''}-${index}`;
    };

    const addServiceRecord = () => {
      emit("add-record", props.record.item_en);
    };

    const editRecord = (history) => {
      emit("edit-record", {
        item: props.record.item_en,
        history: history,
      });
    };

    return {
      serviceTypes,
      hasServiceTypes,
      serviceHistory,
      serviceHistoryCount,
      sortedServiceHistory,
      getServiceTypeTag,
      getServiceTypeText,
      getServiceTypeDisplayText,
      getCategoryTagType,
      getDueMileageClass,
      getStateTagType,
      getStateText,
      formatDate,
      getHistoryKey,
      addServiceRecord,
      editRecord,
    };
  },
};
</script>

<style scoped>
.maintenance-record {
  margin-bottom: 16px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-title {
  font-weight: 500;
  font-size: 16px;
}

.service-types {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.no-service-types {
  margin-left: 8px;
}

.service-type-tag {
  margin-left: 4px;
}

.record-content {
  padding: 8px 0;
}

.record-info {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.service-type-text {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

/* 當沒有服務類型時的特殊樣式 */
.service-type-text:empty::before {
  content: "未設定";
  color: #909399;
  font-style: italic;
}

.due-soon {
  color: #f56c6c;
  font-weight: 500;
}

.due-near {
  color: #e6a23c;
}

.due-far {
  color: #67c23a;
}

.due-neutral {
  color: #909399;
}

.service-history {
  margin-top: 16px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-date {
  min-width: 100px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.history-details {
  flex: 1;
  margin: 0 12px;
}

.history-mileage {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.history-note {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.history-technician {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.history-cost {
  font-size: 14px;
  font-weight: 500;
  color: #e6a23c;
  margin-bottom: 4px;
}

.history-state {
  margin-top: 4px;
}

.history-actions {
  min-width: 60px;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: #c0c4cc;
}

.empty-history i {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-history p {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .service-types {
    align-self: flex-start;
  }

  .no-service-types {
    margin-left: 8px;
  }

  .history-item {
    flex-direction: column;
  }

  .history-date {
    min-width: auto;
    margin-bottom: 8px;
  }

  .history-details {
    margin: 0 0 8px 0;
    width: 100%;
  }

  .history-actions {
    align-self: flex-end;
  }

  .info-row {
    flex-wrap: wrap;
  }

  .info-label {
    min-width: 60px;
  }
}
</style>

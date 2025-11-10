<template>
  <div class="maintenance-record">
    <el-card shadow="hover">
      <template #header>
        <div class="record-header">
          <el-icon><Edit /></el-icon>
          <span class="record-title">{{ record.item_zh }}</span>
          <el-tag :type="getServiceTypeTag(record.service_type)" size="small">
            {{ getServiceTypeDisplayText(record.service_type) }}
          </el-tag>
        </div>
      </template>

      <div class="record-content">
        <div class="record-info">
          <div class="info-row">
            <span class="info-label">分類：</span>
            <el-tag :type="getCategoryTagType(record.category)" size="small">
              {{ record.category }}
            </el-tag>
          </div>
          <div class="info-row" v-if="record.interval_km">
            <span class="info-label">保養間隔：</span>
            <span>{{ record.interval_km.toLocaleString() }} km</span>
          </div>
          <div class="info-row" v-if="record.next_due_mileage">
            <span class="info-label">下次保養：</span>
            <span :class="getDueMileageClass(record.next_due_mileage)">
              {{ record.next_due_mileage.toLocaleString() }} km
            </span>
          </div>
        </div>

        <div class="service-history">
          <div class="history-header">
            <span>服務記錄</span>
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
              :key="index"
              class="history-item"
            >
              <div class="history-date">
                {{ formatDate(history.service_date) }}
              </div>
              <div class="history-details">
                <div class="history-mileage">
                  里程：{{ history.service_mileage?.toLocaleString() }} km
                </div>
                <div class="history-note" v-if="history.note">
                  {{ history.note }}
                </div>
                <div class="history-cost" v-if="history.cost > 0">
                  ¥{{ history.cost }}
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

            <div v-if="sortedServiceHistory.length === 0" class="empty-history">
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
  },
  setup(props, { emit }) {

    // 處理 service_type 多重值 - 安全處理
    const serviceTypes = computed(() => {
      if (!props.record.service_type) return [];
      try {
        return props.record.service_type.split('|').filter(type => type && type.trim());
      } catch (error) {
        console.warn('解析服務類型錯誤:', error);
        return [props.record.service_type];
      }
    });

    // 安全地處理 service_history
    const serviceHistory = computed(() => {
      return props.record.service_history || [];
    });


    const serviceHistoryCount = computed(() => {
      return serviceHistory.value.length;
    });

    const sortedServiceHistory = computed(() => {
      if (!props.record.service_history) return [];

      return props.record.service_history
        .filter((history) => history.service_date || history.service_mileage)
        .sort((a, b) => {
          // 按日期排序，日期为空时按里程排序
          if (a.service_date && b.service_date) {
            return new Date(b.service_date) - new Date(a.service_date);
          }
          return (b.service_mileage || 0) - (a.service_mileage || 0);
        });
    });

    // 新增：獲取完整的服務類型顯示文字
    const getServiceTypeDisplayText = (serviceType) => {
      if (!serviceType) return '';
      try {
        const types = serviceType.split('|').filter(type => type && type.trim());
        //return types.map(type => getServiceTypeText(type)).join(' + ');
        return types.map(type => getServiceTypeText(type)).join(' 、 ');
      } catch (error) {
        console.warn('解析服務類型顯示文字錯誤:', error);
        return getServiceTypeText(serviceType);
      }
    };

    const getServiceTypeTag = (serviceType) => {
      const types = {
        replace: "danger",
        check: "warning",
        clean: "success",
        repair: "info",
      };
      return types[serviceType] || "info";
    };

    const getServiceTypeText = (serviceType) => {
      const texts = {
        replace: "更換",
        check: "檢查",
        clean: "清潔",
        repair: "維修",
      };
      return texts[serviceType] || serviceType;
    };

    const getCategoryTagType = (category) => {
      const types = {
        引擎: "danger",
        傳動: "warning",
        空調: "success",
        進氣系統: "info",
        冷卻系統: "",
        電系: "success",
        底盤: "warning",
        制動系統: "danger",
        排氣系統: "info",
      };
      return types[category] || "info";
    };

    // 在 getDueMileageClass 方法中添加電瓶的特殊處理
    const getDueMileageClass = (nextDueMileage) => {
      // 如果是电瓶，不显示里程相关提示
      if (props.record.item_en === "battery") {
        return "due-neutral";
      }

      const currentMileage = props.currentMileage || 0;
      const mileageDiff = nextDueMileage - currentMileage;

      if (mileageDiff <= 1000) return "due-soon";
      if (mileageDiff <= 3000) return "due-near";
      return "due-far";
    };

    // 添加電瓶下次檢查日期的顯示
    const batteryNextDueDate = computed(() => {
      if (props.record.item_en !== "battery") return null;
      // 这里可以调用 store 的 getBatteryNextDueDate 方法
      return null; // 实际实现中需要从 props 或 store 获取
    });

    const formatDate = (dateString) => {
      if (!dateString) return "日期未知";
      return new Date(dateString).toLocaleDateString("zh-TW");
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
      serviceHistory,
      serviceHistoryCount,
      sortedServiceHistory,
      getServiceTypeTag,
      getServiceTypeText,
      getServiceTypeDisplayText,
      getCategoryTagType,
      getDueMileageClass,
      formatDate,
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

.history-cost {
  font-size: 14px;
  font-weight: 500;
  color: #e6a23c;
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

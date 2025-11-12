<template>
  <el-card class="metric-card" shadow="hover">
    <div class="metric-content">
      <div class="metric-header">
        <div class="metric-icon" :class="type">
          <el-icon>
            <component :is="getIconComponent(icon)" />
          </el-icon>
        </div>
        <div class="metric-title">{{ title }}</div>
      </div>
      
      <div class="metric-value">
        <span class="value" :class="valueSize">
          {{ formattedValue }}
        </span>
        <span class="unit">{{ unit }}</span>
      </div>
      
      <div class="metric-trend" v-if="trend !== undefined">
        <el-tag 
          :type="getTrendType(trend)" 
          size="small"
          class="trend-tag"
        >
          <el-icon v-if="trend > 0">
            <Top />
          </el-icon>
          <el-icon v-else-if="trend < 0">
            <Bottom />
          </el-icon>
          <span v-else>-</span>
          {{ Math.abs(trend) }}%
        </el-tag>
        <span class="trend-label">{{ trendLabel }}</span>
      </div>
      
      <div class="metric-footer" v-if="description">
        {{ description }}
      </div>
    </div>
  </el-card>
</template>

<script>
import { computed } from 'vue'
import { 
  Calendar, 
  Money, 
  TrendCharts, 
  Timer,
  Top, 
  Bottom,
  Odometer,
  Tools,
  AlarmClock,
  DataAnalysis
} from '@element-plus/icons-vue'

export default {
  name: 'MetricCard',
  components: {
    Top,
    Bottom
  },
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'data'
    },
    type: {
      type: String,
      default: 'default'
    },
    trend: {
      type: Number,
      default: undefined
    },
    trendLabel: {
      type: String,
      default: ''
    },
    format: {
      type: String,
      default: 'number' // 'number', 'currency', 'percent'
    },
    description: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    // 格式化數值
    const formattedValue = computed(() => {
      const value = props.value
      
      switch (props.format) {
        case 'currency':
          return `¥${Number(value).toLocaleString()}`
        case 'percent':
          return `${value}%`
        default:
          return Number(value).toLocaleString()
      }
    })

    // 數值大小類名
    const valueSize = computed(() => {
      const strValue = formattedValue.value.toString()
      if (strValue.length >= 8) return 'size-small'
      if (strValue.length >= 6) return 'size-medium'
      return 'size-large'
    })

    // 獲取圖標組件
    const getIconComponent = (iconName) => {
      const iconMap = {
        calendar: Calendar,
        money: Money,
        'trend-charts': TrendCharts,
        timer: Timer,
        odometer: Odometer,
        tools: Tools,
        'alarm-clock': AlarmClock,
        data: DataAnalysis
      }
      return iconMap[iconName] || DataAnalysis
    }

    // 獲取趨勢類型
    const getTrendType = (trend) => {
      if (trend > 0) {
        // 對於花費類指標，上升是負面的
        if (props.title.includes('花費') || props.title.includes('金額') || props.title.includes('成本')) {
          return 'danger'
        }
        return 'success'
      } else if (trend < 0) {
        if (props.title.includes('花費') || props.title.includes('金額') || props.title.includes('成本')) {
          return 'success'
        }
        return 'danger'
      }
      return 'info'
    }

    return {
      formattedValue,
      valueSize,
      getIconComponent,
      getTrendType
    }
  }
}
</script>

<style scoped>
.metric-card {
  height: 140px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.metric-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.metric-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.metric-icon.default {
  background: #ecf5ff;
  color: #409eff;
}

.metric-icon.success {
  background: #f0f9e8;
  color: #67c23a;
}

.metric-icon.warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.metric-icon.danger {
  background: #fef0f0;
  color: #f56c6c;
}

.metric-icon i {
  font-size: 16px;
}

.metric-title {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.metric-value {
  flex: 1;
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
}

.value {
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.value.size-large {
  font-size: 28px;
}

.value.size-medium {
  font-size: 24px;
}

.value.size-small {
  font-size: 20px;
}

.unit {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
  margin-bottom: 2px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 6px;
}

.trend-tag {
  border: none;
  font-size: 12px;
}

.trend-label {
  font-size: 12px;
  color: #909399;
}

.metric-footer {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .metric-card {
    height: 120px;
  }
  
  .value.size-large {
    font-size: 24px;
  }
  
  .value.size-medium {
    font-size: 20px;
  }
  
  .value.size-small {
    font-size: 18px;
  }
  
  .metric-header {
    margin-bottom: 8px;
  }
  
  .metric-icon {
    width: 28px;
    height: 28px;
  }
  
  .metric-icon i {
    font-size: 14px;
  }
  
  .metric-title {
    font-size: 13px;
  }
}
</style>

<template>
  <div class="stat-card" :class="type">
    <div class="stat-icon" :class="type">
      <i :class="iconClass"></i>
    </div>
    <div class="stat-content">
      <div class="stat-value">{{ formattedValue }}</div>
      <div class="stat-title">{{ title }}</div>
      <div class="stat-unit" v-if="unit">{{ unit }}</div>
    </div>
    <div class="stat-trend" v-if="trend">
      <i :class="trendIcon" :style="{ color: trendColor }"></i>
      <span :style="{ color: trendColor }">{{ trend }}</span>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  name: "StatCard",
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [Number, String],
      required: true,
    },
    unit: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "data-board",
    },
    type: {
      type: String,
      default: "default",
    },
    trend: {
      type: String,
      default: "",
    },
    trendType: {
      type: String,
      default: "up", // 'up', 'down', 'neutral'
    },
  },
  setup(props) {
    const iconClass = computed(() => {
      return `el-icon-${props.icon}`;
    });

    const formattedValue = computed(() => {
      if (typeof props.value === "number") {
        return props.value.toLocaleString();
      }
      return props.value;
    });

    const trendIcon = computed(() => {
      const icons = {
        up: "el-icon-top",
        down: "el-icon-bottom",
        neutral: "el-icon-minus",
      };
      return icons[props.trendType] || "el-icon-minus";
    });

    const trendColor = computed(() => {
      const colors = {
        up: "#f56c6c",
        down: "#67c23a",
        neutral: "#909399",
      };
      return colors[props.trendType] || "#909399";
    });

    return {
      iconClass,
      formattedValue,
      trendIcon,
      trendColor,
    };
  },
};
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  position: relative;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
}

.stat-icon.mileage {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.cost {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.service {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.upcoming {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.default {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #e6a23c;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 2px;
}

.stat-unit {
  font-size: 12px;
  color: #c0c4cc;
}

.stat-trend {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  font-size: 12px;
}

.stat-trend i {
  margin-right: 2px;
  font-size: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stat-card {
    padding: 15px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
    margin-right: 12px;
  }
  
  .stat-value {
    font-size: 20px;
  }
  
  .stat-title {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
    margin-right: 10px;
  }
  
  .stat-value {
    font-size: 18px;
  }
}
</style>
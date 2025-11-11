<template>
  <el-card class="vehicle-info-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span>車輛資訊</span>
        <el-button type="primary" text @click="editVehicle">
          <el-icon><Edit /></el-icon>
          編輯
        </el-button>
      </div>
    </template>
    
    <div class="vehicle-info-content">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8">
          <div class="info-item">
            <label>品牌</label>
            <div class="info-value">{{ vehicleBrand }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8">
          <div class="info-item">
            <label>型號</label>
            <div class="info-value">{{ vehicleModel }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8">
          <div class="info-item">
            <label>年份</label>
            <div class="info-value">{{ vehicleYear }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8">
          <div class="info-item">
            <label>顏色</label>
            <div class="info-value">{{ vehicleColor }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8">
          <div class="info-item">
            <label>牌照</label>
            <div class="info-value">{{ licensePlate }}</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="8">
          <div class="info-item">
            <label>引擎代碼</label>
            <div class="info-value">{{ engineCode }}</div>
          </div>
        </el-col>
        <el-col :xs="24">
          <div class="info-item">
            <label>製造日期</label>
            <div class="info-value">{{ manufactureDate }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script>
import { computed } from "vue";

export default {
  name: "VehicleInfo",
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const vehicleBrand = computed(() => {
      return props.vehicle.vehicle_info?.brand || props.vehicle.vehicle_info?.make || "未知";
    });
    
    const vehicleModel = computed(() => {
      return props.vehicle.vehicle_info?.model || "未知";
    });
    
    const vehicleYear = computed(() => {
      return props.vehicle.vehicle_info?.year || "未知";
    });
    
    const vehicleColor = computed(() => {
      return props.vehicle.vehicle_info?.color || "未知";
    });
    
    const licensePlate = computed(() => {
      return props.vehicle.vehicle_info?.license_plate || props.vehicle.license_plate || "未知";
    });
    
    const engineCode = computed(() => {
      return props.vehicle.vehicle_info?.engine_code || "未知";
    });
    
    const manufactureDate = computed(() => {
      return props.vehicle.vehicle_info?.manufacture_date || "未知";
    });
    
    const editVehicle = () => {
      console.log("編輯車輛資訊");
      // 這裡可以觸發編輯車輛的對話框或頁面
    };
    
    return {
      vehicleBrand,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      licensePlate,
      engineCode,
      manufactureDate,
      editVehicle,
    };
  },
};
</script>

<style scoped>
.vehicle-info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-info-content {
  padding: 10px 0;
}

.info-item {
  margin-bottom: 16px;
}

.info-item label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

@media (max-width: 768px) {
  .info-item {
    margin-bottom: 12px;
  }
}
</style>
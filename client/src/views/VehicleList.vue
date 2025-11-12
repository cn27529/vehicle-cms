<template>
  <div class="vehicle-list-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-alert :title="error" type="error" show-icon :closable="false" />
      <el-button
        @click="retryInitialize"
        type="primary"
        style="margin-top: 20px"
      >
        重新加载
      </el-button>
    </div>

    <!-- 正常内容 -->
    <div v-else>
      <!-- 车主信息显示 -->
        <div
          v-if="ownerPhone && filteredVehicles.length > 0" class="owner-info">
          <el-card shadow="never">
            <div class="owner-content">
              <div class="owner-avatar">
                <el-avatar :size="60" :src="ownerAvatar">
                  {{ ownerName.charAt(0) }}
                </el-avatar>
              </div>
              <div class="owner-details">
                <h3>{{ ownerName }}</h3>
                <p class="owner-phone">
                  <el-icon><Phone /></el-icon>
                  {{ ownerPhone }}
                </p>
                <p class="vehicle-count">
                  共 {{ filteredVehicles.length }} 台車輛
                </p>
              </div>
              <div class="owner-actions">
                <el-button type="primary" @click="contactOwner">
                  <el-icon><Phone /></el-icon>
                  聯繫車主
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

      <el-card>
        <template #header>
          <div class="card-header">
            <span>車輛列表</span>
            <div class="header-info">
              <el-tag type="info">共 {{ allVehicles.length }} 台車輛</el-tag>
              <el-button type="primary" @click="addVehicle">
                <el-icon><Plus /></el-icon>
                新增車輛
              </el-button>
            </div>
          </div>
        </template>

        

        <!-- 车辆筛选 - 改成跟 Dashboard.vue 一样的车辆选择器 -->
        <div class="vehicle-filter">
          <el-select
            v-model="selectedVehicleId"
            placeholder="選擇車輛"
            clearable
            @change="handleVehicleChange"
            style="width: 100%; max-width: 400px"
          >
            <el-option
              v-for="vehicle in allVehicles"
              :key="getVehicleKey(vehicle)"
              :label="getVehicleLabel(vehicle)"
              :value="getVehicleKey(vehicle)"
            />
          </el-select>

          <div class="filter-info" v-if="selectedVehicleId">
            <el-tag type="primary">
              已選擇: {{ getSelectedVehicleLabel }}
            </el-tag>
            <el-button
              @click="clearSelection"
              type="text"
              style="margin-left: 8px"
            >
              清除選擇
            </el-button>
          </div>
        </div>

        <div class="vehicle-grid">
          <el-card
            v-for="vehicle in displayedVehicles"
            :key="getVehicleKey(vehicle)"
            class="vehicle-card"
            shadow="hover"
          >
            <template #header>
              <div class="vehicle-card-header">
                <span class="vehicle-name">
                  {{ getVehicleBrand(vehicle) }}
                  {{ getVehicleModel(vehicle) }} - {{ getVehicleKey(vehicle) }}
                </span>
                <el-tag :type="getVehicleStatus(vehicle)">
                  {{ getVehicleStatusText(vehicle) }}
                </el-tag>
              </div>
            </template>

            <div class="vehicle-info">
              <div class="info-item">
                <el-icon><Avatar /></el-icon>
                <span>{{ getOwnerName(vehicle) }}</span>
                &nbsp;&nbsp;<el-icon><Phone /></el-icon>
                <span>{{ getOwnerPhone(vehicle) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Odometer /></el-icon>
                <span
                  >{{ getCurrentMileage(vehicle).toLocaleString() }} km</span
                >
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ getVehicleYear(vehicle) }} 年</span>
              </div>
            </div>
            <div class="vehicle-actions">
              <el-button
                type="primary"
                text
                @click="viewOwnerVehicles(vehicle)"
              >
                車輛儀表板
              </el-button>
              <el-button
                type="success"
                text
                @click="viewMaintananceVehicles(vehicle)"
              >
                查看保養記錄
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 无车辆提示 -->
        <div v-if="displayedVehicles.length === 0" class="no-vehicles">
          <el-empty
            :description="
              selectedVehicleId ? '未找到選擇的車輛' : '暫無車輛信息'
            "
          >
            <el-button type="primary" @click="clearSelection"
              >查看所有車輛</el-button
            >
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useVehicleStore } from "../stores/vehicles";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "VehicleList",
  props: {
    phone: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const route = useRoute();
    const vehicleStore = useVehicleStore();
    const router = useRouter();
    const selectedVehicleId = ref("");
    const loading = ref(true);
    const error = ref(null);

    // 加入車主手機號碼計算屬性
    const ownerPhone = computed(() => {
      // 優先從 props 獲取（路由配置了 props: true）
      if (props.phone) {
        return props.phone;
      }
      // 備用從路由參數獲取
      return route.params.phone || "";
    });

    const allVehicles = computed(() => {
      return vehicleStore.allVehicles;
    });

    // 修改 filteredVehicles 計算屬性
    const filteredVehicles = computed(() => {
      if (ownerPhone.value) {
        // 如果有手機參數，只顯示該車主的車輛
        return allVehicles.value.filter(
          (vehicle) => getOwnerPhone(vehicle) === ownerPhone.value
        );
      }
      return allVehicles.value;
    });

    // 显示的车辆 - 使用 filteredVehicles 而不是 allVehicles
    const displayedVehicles = computed(() => {
      if (!selectedVehicleId.value) {
        return filteredVehicles.value;  // 改為 filteredVehicles
      } else {
        const vehicle = filteredVehicles.value.find(  // 改為 filteredVehicles
          (v) => getVehicleKey(v) === selectedVehicleId.value
        );
        return vehicle ? [vehicle] : [];
      }
    });

    // 获取选中车辆的显示标签
    const getSelectedVehicleLabel = computed(() => {
      if (!selectedVehicleId.value) return "";
      const vehicle = filteredVehicles.value.find(  // 改為 filteredVehicles
        (v) => getVehicleKey(v) === selectedVehicleId.value
      );
      return vehicle ? getVehicleLabel(vehicle) : "";
    });

    // 初始化数据
    const initialize = async () => {
      try {
        loading.value = true;
        error.value = null;
        console.log("🚗 VehicleList 初始化开始...");
        console.log("📱 当前手机参数:", ownerPhone.value);

        // 确保 store 已初始化
        if (vehicleStore.allVehicles.length === 0) {
          console.log("🚗 Store 未初始化，开始初始化...");
          await vehicleStore.initialize();
        }

        console.log(
          "🚗 VehicleList 初始化完成，车辆数量:",
          vehicleStore.allVehicles.length
        );
        console.log(
          "🚗 过滤后的车辆数量:",
          filteredVehicles.value.length
        );
      } catch (err) {
        console.error("🚗 VehicleList 初始化错误:", err);
        error.value = err.message || "加载车辆数据失败";
      } finally {
        loading.value = false;
      }
    };

    // 重新加载
    const retryInitialize = () => {
      initialize();
    };

    // 车辆信息获取方法 - 与 Dashboard.vue 完全一致
    const getVehicleKey = (vehicle) => {
      return vehicle.vehicle_info?.license_plate || vehicle.license_plate || "";
    };

    const getVehicleLabel = (vehicle) => {
      if (vehicle.vehicle_info) {
        return `${vehicle.vehicle_info.brand || vehicle.vehicle_info.make} ${
          vehicle.vehicle_info.model
        } - ${vehicle.vehicle_info.license_plate}`;
      }
      return `${vehicle.make} ${vehicle.model} - ${vehicle.license_plate}`;
    };

    const getVehicleBrand = (vehicle) => {
      if (vehicle.vehicle_info) {
        return (
          vehicle.vehicle_info.brand || vehicle.vehicle_info.make || "未知"
        );
      }
      return vehicle.make || "未知";
    };

    const getVehicleModel = (vehicle) => {
      if (vehicle.vehicle_info) {
        return vehicle.vehicle_info.model || "未知";
      }
      return vehicle.model || "未知";
    };

    const getVehicleYear = (vehicle) => {
      if (vehicle.vehicle_info) {
        return vehicle.vehicle_info.year || "未知";
      }
      return vehicle.year || "未知";
    };

    const getCurrentMileage = (vehicle) => {
      if (vehicle.vehicle_info) {
        return vehicle.vehicle_info.current_mileage || 0;
      }
      return vehicle.current_mileage || 0;
    };

    const getOwnerName = (vehicle) => {
      if (vehicle.vehicle_info) {
        return vehicle.vehicle_info.name || "未知車主";
      }
      return vehicle.name || "未知車主";
    };

    const getOwnerPhone = (vehicle) => {
      if (vehicle.vehicle_info) {
        return vehicle.vehicle_info.phone || "未知";
      }
      return vehicle.phone || "未知";
    };

    const getVehicleStatus = (vehicle) => {
      const mileage = getCurrentMileage(vehicle);
      if (mileage > 200000) return "danger";
      if (mileage > 100000) return "warning";
      return "success";
    };

    const getVehicleStatusText = (vehicle) => {
      const mileage = getCurrentMileage(vehicle);
      if (mileage > 200000) return "高里程";
      if (mileage > 100000) return "中里程";
      return "低里程";
    };

    // 查看车辆
    const viewOwnerVehicles = (vehicle) => {
      const phone = getOwnerPhone(vehicle);
      if (phone && phone.length === 10) {
        console.log("👥 查看车主所有车辆:", phone);
        router.push(`/dashboard/${phone}`);
      }
    };

    const viewMaintananceVehicles = (vehicle) => {
      const phone = getOwnerPhone(vehicle);
      if (phone && phone.length === 10) {
        console.log("👥 查看车主保養記錄:", phone);
        router.push(`/maintanance/${phone}`);
      }
    };

    const handleVehicleChange = (vehicleId) => {
      console.log("🔍 选择车辆:", vehicleId);
      selectedVehicleId.value = vehicleId;
    };

    const clearSelection = () => {
      selectedVehicleId.value = "";
    };

    const addVehicle = () => {
      console.log("➕ 新增車輛");
    };

    const contactOwner = () => {
      if (ownerPhone.value) {
        window.location.href = `tel:${ownerPhone.value}`;
      }
    };

    // 加入車主信息計算屬性
    const ownerName = computed(() => {
      if (ownerPhone.value && filteredVehicles.value.length > 0) {
        return getOwnerName(filteredVehicles.value[0]);
      }
      return "";
    });

    const ownerAvatar = computed(() => {
      return "";
    });

    onMounted(() => {
      console.log("🚗 VehicleList 组件挂载");
      initialize();
    });

    // 监听路由参数变化
    watch(() => route.params.phone, (newPhone) => {
      if (newPhone) {
        console.log('🔧 手机号码变化:', newPhone)
        initialize()
      }
    })

    return {
      ownerPhone,
      filteredVehicles,
      contactOwner,
      ownerName,
      ownerAvatar,
      selectedVehicleId,
      allVehicles,
      displayedVehicles,
      loading,
      error,
      getVehicleKey,
      getVehicleLabel,
      getVehicleBrand,
      getVehicleModel,
      getVehicleYear,
      getCurrentMileage,
      getOwnerName,
      getOwnerPhone,
      getSelectedVehicleLabel,
      getVehicleStatus,
      getVehicleStatusText,
      viewOwnerVehicles,
      viewMaintananceVehicles,
      handleVehicleChange,
      clearSelection,
      addVehicle,
      retryInitialize,
    };
  },
};
</script>

<style scoped>
.vehicle-list-container {
  padding: 20px;
}

.owner-info {
  margin-bottom: 20px;
}

.owner-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.owner-avatar {
  margin-right: 20px;
}

.owner-details h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
}

.owner-phone {
  margin: 0 0 4px 0;
  color: #606266;
  display: flex;
  align-items: center;
}

.owner-phone i {
  margin-right: 6px;
}

.vehicle-count {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.owner-actions {
  margin-left: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vehicle-filter {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-info {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.vehicle-card {
  transition: all 0.3s ease;
}

.vehicle-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.vehicle-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-name {
  font-weight: 500;
  font-size: 16px;
}

.vehicle-info {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.info-item i {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}

.vehicle-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.no-vehicles {
  padding: 40px 0;
}

/* 加载和错误状态样式 */
.loading-container {
  padding: 20px;
}

.error-container {
  padding: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .vehicle-grid {
    grid-template-columns: 1fr;
  }

  .vehicle-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .vehicle-actions {
    flex-direction: column;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .vehicle-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-info {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

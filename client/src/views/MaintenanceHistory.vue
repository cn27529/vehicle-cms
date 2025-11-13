<template>
  <div class="maintenance-history-container">
    
    <!-- 在正常内容區域添加車主信息 -->
<div v-if="ownerPhone && filteredVehicles.length > 0" class="owner-info">
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
          <span>保養記錄</span>
          <el-button type="primary" @click="addMaintenanceRecord">
            <el-icon><Plus /></el-icon>
            新增保養記錄
          </el-button>
        </div>
      </template>

      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <el-select
              v-model="selectedVehicleId"
              placeholder="選擇車輛"
              style="width: 100%"
              @change="handleVehicleChange"
            >
              <el-option
                v-for="vehicle in vehicles"
                :key="getVehicleKey(vehicle)"
                :label="getVehicleLabel(vehicle)"
                :value="getVehicleKey(vehicle)"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-select
              v-model="selectedCategory"
              placeholder="選擇分類"
              style="width: 100%"
              @change="handleCategoryChange"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="category in categories"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="開始日期"
              end-placeholder="結束日期"
              style="width: 100%"
              @change="handleDateChange"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 车辆信息概览 -->
      <div
        class="vehicle-overview"
        v-if="currentVehicle && Object.keys(currentVehicle).length > 0"
      >
        <el-card shadow="never" class="overview-card">
          <div class="overview-content">
            <div class="vehicle-basic-info">
              <h3>
                {{ getVehicleBrand(currentVehicle) }}
                {{ getVehicleModel(currentVehicle) }} -
                {{ getVehicleKey(currentVehicle) }}
              </h3>
              <el-icon><Odometer /></el-icon>
              <span
                >&nbsp;{{
                  getCurrentMileage(currentVehicle).toLocaleString()
                }}
                km</span
              >
            </div>
            <div class="maintenance-stats">
              <div class="stat-item">
                <span class="stat-value">{{ totalMaintenanceCount }}</span>
                <span class="stat-label">總保養次數</span>
              </div>
              <div class="stat-item">
                <span class="stat-value"
                  >¥{{ totalCost.toLocaleString() }}</span
                >
                <span class="stat-label">總花費</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{
                  lastMaintenanceDate || "無記錄"
                }}</span>
                <span class="stat-label">最後保養</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="maintenance-list">
        <div v-if="filteredRecords.length > 0">
          <MaintenanceRecord
            v-for="record in filteredRecords"
            :key="record.item_en"
            :record="record"
            :current-mileage="getCurrentMileage(currentVehicle)"
            @add-record="handleAddRecord"
            @edit-record="handleEditRecord"
          />
        </div>
        <div v-else class="empty-state">
          <el-empty
            description="暫無保養記錄"
            v-if="currentVehicle && Object.keys(currentVehicle).length > 0"
          >
            <el-button type="primary" @click="addMaintenanceRecord"
              >新增保養記錄</el-button
            >
          </el-empty>
          <el-empty description="請選擇車輛" v-else>
            <el-button type="primary" @click="$router.push('/vehicles')"
              >查看車輛列表</el-button
            >
          </el-empty>
        </div>
      </div>

      <!-- 分类统计 -->
      <el-card
        class="category-stats"
        shadow="never"
        v-if="filteredRecords.length > 0"
      >
        <template #header>
          <div class="section-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>保養分類統計</span>
          </div>
        </template>
        <div class="stats-content">
          <el-row :gutter="20">
            <el-col
              :xs="12"
              :sm="6"
              v-for="stat in categoryStats"
              :key="stat.category"
            >
              <div class="category-stat-item">
                <div class="category-name">{{ stat.category }}</div>
                <div class="category-count">{{ stat.count }} 次</div>
                <div class="category-cost">
                  ¥{{ stat.cost.toLocaleString() }}
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onErrorCaptured } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVehicleStore } from "../stores/vehicles";
import { ElMessage } from "element-plus";
import MaintenanceRecord from "../components/MaintenanceRecord.vue";

export default {
  name: "MaintenanceHistory",
  components: {
    MaintenanceRecord,
  },
  props: {
    phone: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    console.log("🔧 MaintenanceHistory setup 开始执行");
    const route = useRoute();
    const vehicleStore = useVehicleStore();
    const router = useRouter();
    const componentError = ref(null);
    
    // 从路由参数获取手机号码
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

    onErrorCaptured((err) => {
      console.error("❌ 组件错误捕获:", err);
      componentError.value = err.message;
      return false;
    });

    const selectedVehicleId = ref("");
    const selectedCategory = ref("");
    const dateRange = ref([]);
    const loading = ref(true);
    const error = ref(null);

    // 初始化数据
    // 修改後的 initialize 方法 - 與 Dashboard.vue 保持一致
    const initialize = async () => {
      try {
        console.log("🔄 MaintenanceHistory 初始化开始...");
        loading.value = true;
        error.value = null;

        //const store = getVehicleStore();

        // 與 Dashboard.vue 相同的初始化邏輯
        console.log("🔧 Store 初始化开始...");
        
        await vehicleStore.initialize()
        console.log("🔧 Store 初始化完成，车辆数量:", vehicleStore.allVehicles.length);

        // 设置选中的手机号码
        if (ownerPhone.value) {
          vehicleStore.setSelectedPhone(ownerPhone.value);
          console.log("🔧 设置选中手机:", ownerPhone.value);
        }

        // 设置默认选中的车辆
        if (filteredVehicles.value.length > 0) {
          selectedVehicleId.value = getVehicleKey(filteredVehicles.value[0]);
          vehicleStore.setSelectedVehicle(selectedVehicleId.value);
          console.log("🔧 设置默认车辆:", selectedVehicleId.value);
        }
        
      } catch (err) {
        console.error("❌ MaintenanceHistory 初始化错误:", err);
        error.value = err.message || "加载数据失败";
        componentError.value = err.message;
      } finally {
        loading.value = false;
      }
    };

    // 重新加载
    const retryInitialize = () => {
      initialize();
    };

    // 显示返回按钮的条件
    const showBackButton = computed(() => {
      return !!ownerPhone.value;
    });

    const goToVehicleList = () => {
      router.push('/vehicles')
    }

    const contactOwner = () => {
      if (ownerPhone.value) {
        window.location.href = `tel:${ownerPhone.value}`
      }
    }

    // 车主姓名
    const ownerName = computed(() => {      
      if (ownerPhone.value) {
        return vehicleStore.getOwnerNameByPhone(ownerPhone.value);
      }
      return "";
    });

    // 重新加载页面
    const reloadPage = () => {
      window.location.reload();
    };

    // 返回上一页
    const goBack = () => {
      if (ownerPhone.value) {
        router.push(`/dashboard/${ownerPhone.value}`);
      } else {
        router.push("/vehicles");
      }
    };

    // 计算属性
    const vehicles = computed(() => {
      console.log('🔧 vehicles computed:', vehicleStore.allVehicles)
      return vehicleStore.allVehicles
    })

    // 根据手机号码过滤车辆
    const filteredVehicles = computed(() => {
      let result = []
      if (ownerPhone.value) {
        result = vehicleStore.vehiclesByPhone
      } else {
        result = vehicles.value
      }
      console.log('🔧 filteredVehicles:', result)
      return result
    })

    const currentVehicle = computed(() => {
      const vehicle = vehicleStore.currentVehicle
      console.log('🔧 currentVehicle:', vehicle)
      return vehicle
    })

    // 安全地获取所有保养记录
    const allMaintenanceRecords = computed(() => {
      const vehicle = currentVehicle.value;
      if (!vehicle || !vehicle.maintenance_records) {
        console.log("📝 没有保养记录数据");
        return [];
      }

      try {
        const records = Object.values(vehicle.maintenance_records);
        console.log("📝 保养记录数量:", records.length);
        return records;
      } catch (err) {
        console.error("❌ 获取保养记录错误:", err);
        return [];
      }
    });

    // 分类统计
    const categories = computed(() => {
      try {
        const uniqueCategories = new Set();
        allMaintenanceRecords.value.forEach((record) => {
          if (record.category) {
            uniqueCategories.add(record.category);
          }
        });
        const categoriesArray = Array.from(uniqueCategories);
        console.log("📊 可用分类:", categoriesArray);
        return categoriesArray;
      } catch (err) {
        console.error("❌ 获取分类错误:", err);
        return [];
      }
    });

    // 过滤后的记录
    const filteredRecords = computed(() => {
      try {
        let records = allMaintenanceRecords.value;

        // 按分类过滤
        if (selectedCategory.value) {
          records = records.filter(
            (record) => record.category === selectedCategory.value
          );
          console.log(
            "🔍 按分类过滤:",
            selectedCategory.value,
            "结果:",
            records.length
          );
        }

        // 按日期过滤
        if (dateRange.value && dateRange.value.length === 2) {
          const [startDate, endDate] = dateRange.value;
          records = records.filter((record) => {
            if (!record.service_history) return false;
            return record.service_history.some((history) => {
              if (!history.service_date) return false;
              const serviceDate = new Date(history.service_date);
              return serviceDate >= startDate && serviceDate <= endDate;
            });
          });
          console.log(
            "📅 按日期过滤:",
            dateRange.value,
            "结果:",
            records.length
          );
        }

        console.log("👀 最终显示记录:", records.length);
        return records;
      } catch (err) {
        console.error("❌ 过滤记录错误:", err);
        return [];
      }
    });

    // 统计信息 - 安全处理
    const totalMaintenanceCount = computed(() => {
      try {
        let count = 0;
        allMaintenanceRecords.value.forEach((record) => {
          if (record.service_history) {
            count += record.service_history.filter(
              (history) => history.service_date
            ).length;
          }
        });
        console.log("💰 总保养次数:", count);
        return count;
      } catch (err) {
        console.error("❌ 计算总次数错误:", err);
        return 0;
      }
    });

    const totalCost = computed(() => {
      try {
        let cost = 0;
        allMaintenanceRecords.value.forEach((record) => {
          if (record.service_history) {
            record.service_history.forEach((history) => {
              if (history.cost) {
                cost += Number(history.cost) || 0;
              }
            });
          }
        });
        console.log("💰 总花费:", cost);
        return cost;
      } catch (err) {
        console.error("❌ 计算总花费错误:", err);
        return 0;
      }
    });

    const lastMaintenanceDate = computed(() => {
      try {
        let lastDate = null;
        allMaintenanceRecords.value.forEach((record) => {
          if (record.service_history) {
            record.service_history.forEach((history) => {
              if (history.service_date) {
                const serviceDate = new Date(history.service_date);
                if (!lastDate || serviceDate > lastDate) {
                  lastDate = serviceDate;
                }
              }
            });
          }
        });
        const result = lastDate ? formatDate(lastDate) : null;
        console.log("📅 最后保养日期:", result);
        return result;
      } catch (err) {
        console.error("❌ 计算最后日期错误:", err);
        return null;
      }
    });

    const categoryStats = computed(() => {
      try {
        const stats = {};

        allMaintenanceRecords.value.forEach((record) => {
          const category = record.category;
          if (!stats[category]) {
            stats[category] = {
              category: category,
              count: 0,
              cost: 0,
            };
          }

          if (record.service_history) {
            record.service_history.forEach((history) => {
              if (history.service_date) {
                stats[category].count++;
              }
              if (history.cost) {
                stats[category].cost += Number(history.cost) || 0;
              }
            });
          }
        });

        const result = Object.values(stats);
        console.log("📊 分类统计:", result);
        return result;
      } catch (err) {
        console.error("❌ 计算分类统计错误:", err);
        return [];
      }
    });

    // 方法
    const getVehicleKey = (vehicle) => {
      if (!vehicle) return "";
      return vehicle.vehicle_info?.license_plate || vehicle.license_plate || "";
    };

    const getVehicleLabel = (vehicle) => {
      if (!vehicle) return "未知车辆";
      if (vehicle.vehicle_info) {
        return `${
          vehicle.vehicle_info.brand || vehicle.vehicle_info.make || ""
        } ${vehicle.vehicle_info.model || ""} - ${
          vehicle.vehicle_info.license_plate || ""
        }`.trim();
      }
      return `${vehicle.make || ""} ${vehicle.model || ""} - ${
        vehicle.license_plate || ""
      }`.trim();
    };

    const getVehicleBrand = (vehicle) => {
      if (!vehicle) return "未知";
      return (
        vehicle.vehicle_info?.brand ||
        vehicle.vehicle_info?.make ||
        vehicle.make ||
        "未知"
      );
    };

    const getVehicleModel = (vehicle) => {
      if (!vehicle) return "未知";
      return vehicle.vehicle_info?.model || vehicle.model || "未知";
    };

    const getCurrentMileage = (vehicle) => {
      if (!vehicle) return 0;
      return (
        Number(vehicle.vehicle_info?.current_mileage) ||
        Number(vehicle.current_mileage) ||
        0
      );
    };

    const formatDate = (date) => {
      if (!date) return "未知日期";
      try {
        if (typeof date === "string") {
          date = new Date(date);
        }
        return date.toLocaleDateString("zh-TW");
      } catch (error) {
        console.warn("日期格式錯誤:", date, error);
        return "日期格式錯誤";
      }
    };

    const handleVehicleChange = () => {
      if (selectedVehicleId.value) {
        vehicleStore.setSelectedVehicle(selectedVehicleId.value)
      }
    }

    const handleCategoryChange = () => {
      console.log("🔍 分类筛选:", selectedCategory.value);
    };

    const handleDateChange = () => {
      console.log("📅 日期筛选:", dateRange.value);
    };

    const handleAddRecord = (itemKey) => {
      ElMessage.info(`準備新增 ${itemKey} 的保養記錄`);
    };

    const handleEditRecord = (record) => {
      ElMessage.info(`準備編輯 ${record.item_zh} 的記錄`);
    };

    const addMaintenanceRecord = () => {
      ElMessage.info("準備新增保養記錄");
    };

    onMounted(() => {
      console.log('🔧 MaintenanceHistory mounted')
      console.log('🔧 環境變量 VITE_AUTH_MODE:', import.meta.env.VITE_AUTH_MODE);
      console.log('🔧 環境變量 VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('🔧 路由参数:', route.params)
      console.log('🔧 Props 参数:', props)     
      initialize()
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
      selectedVehicleId,
      selectedCategory,
      dateRange,      
      currentVehicle,
      categories,
      filteredRecords,
      totalMaintenanceCount,
      totalCost,
      lastMaintenanceDate,
      categoryStats,      
      showBackButton,
      loading,
      error,
      componentError,
      getVehicleKey,
      getVehicleLabel,
      getVehicleBrand,
      getVehicleModel,
      getCurrentMileage,
      formatDate,
      handleVehicleChange,
      handleCategoryChange,
      handleDateChange,
      handleAddRecord,
      handleEditRecord,
      addMaintenanceRecord,
      goBack,
      retryInitialize,
      reloadPage,
    };
  },
};
</script>

<style scoped>
.maintenance-history-container {
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

.vehicle-selector {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.vehicle-count-badge {
  flex-shrink: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  padding: 0;
  margin-right: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.vehicle-overview {
  margin-bottom: 24px;
}

.overview-card {
  border: 1px solid #e6e6e6;
}

.overview-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-basic-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 18px;
}

.vehicle-basic-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.maintenance-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
}

.maintenance-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.empty-state {
  padding: 40px 0;
}

.category-stats {
  margin-top: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.section-header i {
  margin-right: 8px;
  font-size: 18px;
}

.stats-content {
  padding: 16px 0;
}

.category-stat-item {
  text-align: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
  margin-bottom: 16px;
}

.category-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.category-count {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.category-cost {
  font-size: 14px;
  color: #67c23a;
}

/* 加载和错误状态样式 */
.loading-container {
  padding: 20px;
}

.error-container {
  padding: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .maintenance-history-container {
    padding: 10px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .filter-section {
    padding: 12px;
  }

  .overview-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .maintenance-stats {
    width: 100%;
    justify-content: space-around;
  }

  .stat-item {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .maintenance-stats {
    flex-direction: column;
    gap: 16px;
  }

  .category-stat-item {
    padding: 12px;
    margin-bottom: 12px;
  }
}
</style>
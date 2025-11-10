<template>
  <div class="maintenance-history-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>保養記錄</span>
          <el-button type="primary" @click="addMaintenanceRecord">
            <i class="el-icon-plus"></i>
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
      <div class="vehicle-overview" v-if="currentVehicle">
        <el-card shadow="never" class="overview-card">
          <div class="overview-content">
            <div class="vehicle-basic-info">
              <h3>{{ getVehicleBrand(currentVehicle) }} {{ getVehicleModel(currentVehicle) }}</h3>
              <p>牌照: {{ getVehicleKey(currentVehicle) }} | 當前里程: {{ getCurrentMileage(currentVehicle).toLocaleString() }} km</p>
            </div>
            <div class="maintenance-stats">
              <div class="stat-item">
                <span class="stat-value">{{ totalMaintenanceCount }}</span>
                <span class="stat-label">總保養次數</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">¥{{ totalCost }}</span>
                <span class="stat-label">總花費</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ lastMaintenanceDate || '無記錄' }}</span>
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
            @add-record="handleAddRecord"
            @edit-record="handleEditRecord"
          />
        </div>
        <div v-else class="empty-state">
          <el-empty description="暫無保養記錄">
            <el-button type="primary" @click="addMaintenanceRecord">新增保養記錄</el-button>
          </el-empty>
        </div>
      </div>

      <!-- 分类统计 -->
      <el-card class="category-stats" shadow="never" v-if="filteredRecords.length > 0">
        <template #header>
          <div class="section-header">
            <i class="el-icon-data-analysis"></i>
            <span>保養分類統計</span>
          </div>
        </template>
        <div class="stats-content">
          <el-row :gutter="20">
            <el-col :xs="12" :sm="6" v-for="stat in categoryStats" :key="stat.category">
              <div class="category-stat-item">
                <div class="category-name">{{ stat.category }}</div>
                <div class="category-count">{{ stat.count }} 次</div>
                <div class="category-cost">¥{{ stat.cost }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useVehicleStore } from '../stores/vehicles'
import MaintenanceRecord from '../components/MaintenanceRecord.vue'

export default {
  name: 'MaintenanceHistory',
  components: {
    MaintenanceRecord
  },
  setup() {
    const vehicleStore = useVehicleStore()
    const selectedVehicleId = ref('')
    const selectedCategory = ref('')
    const dateRange = ref([])
    
    const vehicles = computed(() => vehicleStore.allVehicles)
    const currentVehicle = computed(() => {
      if (!selectedVehicleId.value) {
        return vehicles.value[0] || {}
      }
      return vehicleStore.currentVehicle
    })

    // 获取所有保养记录
    const allMaintenanceRecords = computed(() => {
      if (!currentVehicle.value.maintenance_records) return []
      return Object.values(currentVehicle.value.maintenance_records)
    })

    // 分类统计
    const categories = computed(() => {
      const uniqueCategories = new Set()
      allMaintenanceRecords.value.forEach(record => {
        if (record.category) {
          uniqueCategories.add(record.category)
        }
      })
      return Array.from(uniqueCategories)
    })

    // 过滤后的记录
    const filteredRecords = computed(() => {
      let records = allMaintenanceRecords.value

      // 按分类过滤
      if (selectedCategory.value) {
        records = records.filter(record => record.category === selectedCategory.value)
      }

      // 按日期过滤
      if (dateRange.value && dateRange.value.length === 2) {
        const [startDate, endDate] = dateRange.value
        records = records.filter(record => {
          if (!record.service_history) return false
          return record.service_history.some(history => {
            if (!history.service_date) return false
            const serviceDate = new Date(history.service_date)
            return serviceDate >= startDate && serviceDate <= endDate
          })
        })
      }

      return records
    })

    // 统计信息
    const totalMaintenanceCount = computed(() => {
      let count = 0
      allMaintenanceRecords.value.forEach(record => {
        if (record.service_history) {
          count += record.service_history.filter(history => history.service_date).length
        }
      })
      return count
    })

    const totalCost = computed(() => {
      let cost = 0
      allMaintenanceRecords.value.forEach(record => {
        if (record.service_history) {
          record.service_history.forEach(history => {
            if (history.cost) {
              cost += history.cost
            }
          })
        }
      })
      return cost
    })

    const lastMaintenanceDate = computed(() => {
      let lastDate = null
      allMaintenanceRecords.value.forEach(record => {
        if (record.service_history) {
          record.service_history.forEach(history => {
            if (history.service_date) {
              const serviceDate = new Date(history.service_date)
              if (!lastDate || serviceDate > lastDate) {
                lastDate = serviceDate
              }
            }
          })
        }
      })
      return lastDate ? formatDate(lastDate) : null
    })

    const categoryStats = computed(() => {
      const stats = {}
      
      allMaintenanceRecords.value.forEach(record => {
        const category = record.category
        if (!stats[category]) {
          stats[category] = {
            category: category,
            count: 0,
            cost: 0
          }
        }
        
        if (record.service_history) {
          record.service_history.forEach(history => {
            if (history.service_date) {
              stats[category].count++
            }
            if (history.cost) {
              stats[category].cost += history.cost
            }
          })
        }
      })
      
      return Object.values(stats)
    })

    // 方法
    const getVehicleKey = (vehicle) => {
      return vehicle.vehicle_info?.license_plate || vehicle.license_plate
    }

    const getVehicleLabel = (vehicle) => {
      if (vehicle.vehicle_info) {
        return `${vehicle.vehicle_info.brand || vehicle.vehicle_info.make} ${vehicle.vehicle_info.model} - ${vehicle.vehicle_info.license_plate}`
      }
      return `${vehicle.make} ${vehicle.model} - ${vehicle.license_plate}`
    }

    const getVehicleBrand = (vehicle) => {
      return vehicle.vehicle_info?.brand || vehicle.vehicle_info?.make || '未知'
    }

    const getVehicleModel = (vehicle) => {
      return vehicle.vehicle_info?.model || '未知'
    }

    const getCurrentMileage = (vehicle) => {
      return vehicle.vehicle_info?.current_mileage || vehicle.current_mileage || 0
    }

    const formatDate = (date) => {
      if (!date) return '未知日期'
      if (typeof date === 'string') {
        date = new Date(date)
      }
      return date.toLocaleDateString('zh-TW')
    }

    const handleVehicleChange = () => {
      vehicleStore.setSelectedVehicle(selectedVehicleId.value)
    }

    const handleCategoryChange = () => {
      // 分类改变时自动更新显示
      console.log('分类筛选:', selectedCategory.value)
    }

    const handleDateChange = () => {
      // 日期改变时自动更新显示
      console.log('日期筛选:', dateRange.value)
    }

    const handleAddRecord = (itemKey) => {
      console.log('新增記錄:', itemKey)
      // 这里可以打开新增记录的对话框
      ElMessage.info(`準備新增 ${itemKey} 的保養記錄`)
    }

    const handleEditRecord = (record) => {
      console.log('編輯記錄:', record)
      // 这里可以打开编辑记录的对话框
      ElMessage.info(`準備編輯 ${record.item_zh} 的記錄`)
    }

    const addMaintenanceRecord = () => {
      console.log('新增保養記錄')
      ElMessage.info('準備新增保養記錄')
    }

    onMounted(() => {
      if (vehicles.value.length > 0) {
        selectedVehicleId.value = getVehicleKey(vehicles.value[0])
        handleVehicleChange()
      }
    })

    // 监听车辆数据变化
    watch(vehicles, (newVehicles) => {
      if (newVehicles.length > 0 && !selectedVehicleId.value) {
        selectedVehicleId.value = getVehicleKey(newVehicles[0])
        handleVehicleChange()
      }
    })

    return {
      selectedVehicleId,
      selectedCategory,
      dateRange,
      vehicles,
      currentVehicle,
      categories,
      filteredRecords,
      totalMaintenanceCount,
      totalCost,
      lastMaintenanceDate,
      categoryStats,
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
      addMaintenanceRecord
    }
  }
}
</script>

<style scoped>
.maintenance-history-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  color: #409EFF;
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
}

.category-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.category-count {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 4px;
}

.category-cost {
  font-size: 14px;
  color: #67c23a;
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
  }
}
</style>
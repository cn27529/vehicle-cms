<template>
  <div class="dashboard-container">
    <!-- 车主信息显示 -->
    <div v-if="ownerPhone" class="owner-info">
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
              <i class="el-icon-phone"></i>
              {{ ownerPhone }}
            </p>
            <p class="vehicle-count">
              共 {{ filteredVehicles.length }} 台車輛
            </p>
          </div>
          <div class="owner-actions">
            <el-button type="primary" @click="contactOwner">
              <i class="el-icon-phone"></i>
              聯繫車主
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 顶部车辆选择器 -->
    <div class="vehicle-selector">
      <el-select 
        v-model="selectedVehicleId" 
        placeholder="选择车辆" 
        @change="handleVehicleChange"
        style="width: 100%; max-width: 400px;"
      >
        <el-option
          v-for="vehicle in filteredVehicles"
          :key="getVehicleKey(vehicle)"
          :label="getVehicleLabel(vehicle)"
          :value="getVehicleKey(vehicle)"
        />
      </el-select>
      
      <div class="vehicle-count-badge" v-if="filteredVehicles.length > 1">
        <el-tag type="info">
          第 {{ currentVehicleIndex + 1 }} / {{ filteredVehicles.length }} 台
        </el-tag>
      </div>
    </div>

    <!-- 主要仪表板内容 -->
    <div class="dashboard-content" v-if="filteredVehicles.length > 0">
      <!-- 车辆概览卡片 -->
      <div class="overview-cards">
        <el-row :gutter="20">
          <el-col :xs="12" :sm="6">
            <StatCard
              title="当前里程"
              :value="currentMileage"
              unit="km"
              icon="odometer"
              type="mileage"
            />
          </el-col>
          <el-col :xs="12" :sm="6">
            <StatCard
              title="近期保养"
              :value="recentServicesCount"
              unit="次"
              icon="tools"
              type="service"
            />
          </el-col>
          <el-col :xs="12" :sm="6">
            <StatCard
              title="即将到期"
              :value="upcomingServicesCount"
              unit="项"
              icon="alarm-clock"
              type="upcoming"
            />
          </el-col>
          <el-col :xs="12" :sm="6">
            <StatCard
              title="年度花费"
              :value="totalCostThisYear"
              unit="元"
              icon="money"
              type="cost"
            />
          </el-col>
        </el-row>
      </div>

      <el-row :gutter="20">
        <!-- 左侧内容 -->
        <el-col :xs="24" :lg="16">
          <!-- 车辆信息 -->
          <VehicleInfo :vehicle="currentVehicle" />

          <!-- 即将到期保养项目 -->
          <el-card class="dashboard-section" shadow="hover">
            <template #header>
              <div class="section-header">
                <i class="el-icon-warning-outline"></i>
                <span>即将到期保养项目</span>
                <el-tag type="danger" size="small">{{ upcomingServicesCount }} 项</el-tag>
              </div>
            </template>
            <div class="service-list">
              <div 
                v-for="service in upcomingServices" 
                :key="service.item_en"
                class="service-item"
              >
                <div class="service-info">
                  <div class="service-name">{{ service.item_zh }}</div>
                  <div class="service-due">
                    {{ getDueText(service) }}
                  </div>
                </div>
                <div class="service-category">
                  <el-tag :type="getCategoryTagType(service.category)" size="small">
                    {{ service.category }}
                  </el-tag>
                </div>
              </div>
              <div v-if="upcomingServices.length === 0" class="empty-state">
                <i class="el-icon-success"></i>
                <p>暂无即将到期的保养项目</p>
              </div>
            </div>
          </el-card>

          <!-- 近期保养记录 -->
          <el-card class="dashboard-section" shadow="hover">
            <template #header>
              <div class="section-header">
                <i class="el-icon-time"></i>
                <span>近期保养记录</span>
                <el-tag type="info" size="small">{{ recentServices.length }} 笔</el-tag>
              </div>
            </template>
            <div class="service-list">
              <div 
                v-for="record in recentServices" 
                :key="`${record.item_en}-${record.service_date}`"
                class="service-item"
              >
                <div class="service-info">
                  <div class="service-name">{{ record.item_zh }}</div>
                  <div class="service-date">{{ formatDate(record.service_date) }}</div>
                  <div class="service-mileage">里程: {{ (record.service_mileage || 0).toLocaleString() }} km</div>
                  <div class="service-note" v-if="record.note">{{ record.note }}</div>
                </div>
                <div class="service-cost">
                  <span v-if="record.cost > 0">¥{{ record.cost }}</span>
                  <el-tag v-else type="info" size="small">免费</el-tag>
                </div>
              </div>
              <div v-if="recentServices.length === 0" class="empty-state">
                <i class="el-icon-document"></i>
                <p>暂无近期保养记录</p>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧内容 -->
        <el-col :xs="24" :lg="8">
          <!-- 保养提醒 -->
          <el-card class="dashboard-section" shadow="hover">
            <template #header>
              <div class="section-header">
                <i class="el-icon-bell"></i>
                <span>保养提醒</span>
              </div>
            </template>
            <div class="reminder-list">
              <div class="reminder-item" v-for="reminder in maintenanceReminders" :key="reminder.type">
                <div class="reminder-icon" :class="reminder.type">
                  <i :class="reminder.icon"></i>
                </div>
                <div class="reminder-content">
                  <div class="reminder-title">{{ reminder.title }}</div>
                  <div class="reminder-desc">{{ reminder.description }}</div>
                </div>
                <div class="reminder-action">
                  <el-button type="primary" size="small" @click="handleReminderAction(reminder)">
                    {{ reminder.action }}
                  </el-button>
                </div>
              </div>
              <div v-if="maintenanceReminders.length === 0" class="empty-state">
                <i class="el-icon-success"></i>
                <p>暂无保养提醒</p>
              </div>
            </div>
          </el-card>

          <!-- 未曾保养项目 -->
          <el-card class="dashboard-section" shadow="hover">
            <template #header>
              <div class="section-header">
                <el-icon><Warning /></el-icon>
                <span>未曾保养项目</span>
                <el-tag type="warning" size="small">{{ neverMaintainedItems.length }} 项</el-tag>
              </div>
            </template>
            <div class="service-list">
              <div 
                v-for="item in neverMaintainedItems" 
                :key="item.item_en"
                class="service-item never-maintained"
              >
                <div class="service-icon">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="service-info">
                  <div class="service-name">{{ item.item_zh }}</div>
                  <div class="service-type" v-if="getServiceTypes(item.service_type).length > 0">
                    <el-tag 
                      v-for="serviceType in getServiceTypes(item.service_type)" 
                      :key="serviceType"
                      :type="getServiceTypeTag(serviceType)" 
                      size="mini"
                      class="service-type-tag"
                    >
                      {{ getServiceTypeText(serviceType) }}
                    </el-tag>
                  </div>
                  <div class="no-service-types" v-else>
                    <el-tag type="info" size="mini">未設定服務類型</el-tag>
                  </div>
                </div>
                <div class="service-category">
                  <el-tag :type="getCategoryTagType(item.category)" size="small">
                    {{ item.category || '未分類' }}
                  </el-tag>
                </div>
              </div>
              <div v-if="neverMaintainedItems.length === 0" class="empty-state">
                <el-icon><SuccessFilled /></el-icon>
                <p>所有项目都有保养记录</p>
              </div>
            </div>
          </el-card>

          <!-- 快速操作 -->
          <el-card class="dashboard-section" shadow="hover">
            <template #header>
              <div class="section-header">
                <i class="el-icon-operation"></i>
                <span>快速操作</span>
              </div>
            </template>
            <div class="quick-actions">
              <el-button type="primary" class="quick-action-btn" @click="addMaintenanceRecord">
                <i class="el-icon-plus"></i>
                新增保养记录
              </el-button>
              <el-button class="quick-action-btn" @click="updateMileage">
                <i class="el-icon-edit"></i>
                更新里程
              </el-button>
              <el-button class="quick-action-btn" @click="viewAllRecords">
                <i class="el-icon-document"></i>
                查看所有记录
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 无车辆提示 -->
    <div v-else class="no-vehicles">
      <el-empty description="未找到该车主的车辆信息">
        <el-button type="primary" @click="goToVehicleList">查看所有车辆</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicleStore } from '../stores/vehicles'
import VehicleInfo from '../components/VehicleInfo.vue'
import StatCard from '../components/StatCard.vue'
import { Warning, SuccessFilled } from '@element-plus/icons-vue'

export default {
  name: 'Dashboard',
  components: {
    VehicleInfo,
    StatCard,
    Warning,
    SuccessFilled
  },
  props: {
    phone: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const vehicleStore = useVehicleStore()
    const selectedVehicleId = ref('')

    // 从路由参数获取手机号码
    const ownerPhone = computed(() => props.phone || route.params.phone || '')

    // 计算属性
    const vehicles = computed(() => vehicleStore.allVehicles)
    const filteredVehicles = computed(() => {
      if (ownerPhone.value) {
        return vehicleStore.vehiclesByPhone
      }
      return vehicles.value
    })

    const currentVehicle = computed(() => vehicleStore.currentVehicle)

    const currentMileage = computed(() => {
      const vehicle = currentVehicle.value
      if (!vehicle || Object.keys(vehicle).length === 0) return 0
      return vehicle.vehicle_info?.current_mileage || vehicle.current_mileage || 0
    })

    const upcomingServices = computed(() => {
      const vehicle = currentVehicle.value
      if (!vehicle || !vehicle.maintenance_records) return []
      
      const services = []
      const currentMileageVal = currentMileage.value
      
      Object.values(vehicle.maintenance_records).forEach(item => {
        if (item.next_due_mileage && item.next_due_mileage > 0) {
          const mileageDiff = item.next_due_mileage - currentMileageVal
          if (mileageDiff <= 2000) {
            services.push({
              ...item,
              dueInDays: Math.ceil(mileageDiff / 50)
            })
          }
        }
      })
      
      return services.sort((a, b) => a.next_due_mileage - b.next_due_mileage)
    })

    const upcomingServicesCount = computed(() => upcomingServices.value.length)

    // 近期保养记录 - 按日期倒序排列，最新的在前面
    const recentServices = computed(() => {
      const vehicle = currentVehicle.value
      if (!vehicle || !vehicle.maintenance_records) return []
      
      const allServices = []
      Object.values(vehicle.maintenance_records).forEach(item => {
        if (item.service_history && item.service_history.length > 0) {
          item.service_history.forEach(history => {
            if (history.service_date) {
              allServices.push({
                ...item,
                ...history,
                // 添加排序用的时间戳
                timestamp: new Date(history.service_date).getTime()
              })
            }
          })
        }
      })
      
      // 按日期倒序排列，最新的在前面
      return allServices
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8) // 显示最近8条记录
    })

    const recentServicesCount = computed(() => recentServices.value.length)

    const totalCostThisYear = computed(() => {
      const vehicle = currentVehicle.value
      if (!vehicle || !vehicle.maintenance_records) return 0
      
      const currentYear = new Date().getFullYear()
      let total = 0
      
      Object.values(vehicle.maintenance_records).forEach(item => {
        if (item.service_history) {
          item.service_history.forEach(history => {
            if (history.service_date && history.service_date.startsWith(currentYear.toString()) && history.cost) {
              total += history.cost
            }
          })
        }
      })
      
      return total
    })

    // 未曾保养项目 - service_history 为空数组
    const neverMaintainedItems = computed(() => {
      const vehicle = currentVehicle.value
      if (!vehicle || !vehicle.maintenance_records) return []
      
      return Object.values(vehicle.maintenance_records)
        .filter(item => {
          // 检查 service_history 是否为空数组或不存在
          return !item.service_history || item.service_history.length === 0
        })
        .sort((a, b) => a.item_zh.localeCompare(b.item_zh)) // 按中文名称排序
    })

    const maintenanceReminders = computed(() => {
      const reminders = []
      const currentMileageVal = currentMileage.value
      const vehicle = currentVehicle.value
      
      if (!vehicle || !vehicle.maintenance_records) return reminders
      
      // 检查机油更换提醒
      const engineOil = vehicle.maintenance_records.engine_oil
      if (engineOil) {
        const lastService = engineOil.service_history?.[engineOil.service_history.length - 1]
        if (lastService && lastService.service_mileage) {
          const nextServiceMileage = lastService.service_mileage + (engineOil.interval_km || 0)
          if (currentMileageVal >= nextServiceMileage - 500) {
            reminders.push({
              type: 'oil',
              icon: 'el-icon-refresh',
              title: '机油需要更换',
              description: `建议在 ${nextServiceMileage.toLocaleString()} 公里时更换机油`,
              action: '记录更换'
            })
          }
        }
      }
      
      // 检查轮胎调位提醒
      const tires = vehicle.maintenance_records.tires
      if (tires) {
        const lastService = tires.service_history?.[tires.service_history.length - 1]
        if (lastService && lastService.service_mileage) {
          const nextRotationMileage = lastService.service_mileage + (tires.interval_km || 10000)
          if (currentMileageVal >= nextRotationMileage - 500) {
            reminders.push({
              type: 'tire',
              icon: 'el-icon-set-up',
              title: '建议轮胎调位',
              description: '轮胎已行驶较长时间，建议进行调位检查',
              action: '记录调位'
            })
          }
        }
      }
      
      return reminders
    })

    // 方法
    const getVehicleKey = (vehicle) => {
      return vehicle.vehicle_info?.license_plate || vehicle.license_plate || ''
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
      if (!vehicle) return 0
      return vehicle.vehicle_info?.current_mileage || vehicle.current_mileage || 0
    }

    const currentVehicleIndex = computed(() => {
      return filteredVehicles.value.findIndex(vehicle => 
        getVehicleKey(vehicle) === selectedVehicleId.value
      )
    })

    const getCategoryTagType = (category) => {
      if (!category) return "info"
      const types = {
        '引擎': 'danger',
        '傳動': 'warning',
        '空調': 'success',
        '進氣系統': 'info',
        '冷卻系統': '',
        '電系': 'success',
        '底盤': 'warning',
        '制動系統': 'danger',
        '排氣系統': 'info'
      }
      return types[category] || 'info'
    }

    const getDueText = (service) => {
      const currentMileageVal = currentMileage.value
      const mileageDiff = service.next_due_mileage - currentMileageVal
      
      if (mileageDiff <= 0) {
        return '已到期'
      } else if (mileageDiff <= 500) {
        return `即将到期 (${service.next_due_mileage.toLocaleString()} km)`
      } else {
        return `预计 ${Math.ceil(mileageDiff / 50)} 天后 (${service.next_due_mileage.toLocaleString()} km)`
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '未知日期'
      try {
        return new Date(dateString).toLocaleDateString('zh-CN')
      } catch (error) {
        console.warn('日期格式錯誤:', dateString, error)
        return '日期格式錯誤'
      }
    }

    // 處理 service_type 多重值 - 安全處理空陣列
    const getServiceTypes = (serviceType) => {
      if (!serviceType) return []
      // 如果是陣列直接返回
      if (Array.isArray(serviceType)) {
        return serviceType.filter(type => type && type.trim().length > 0)
      }
      // 向後兼容：如果還是字串就分割
      if (typeof serviceType === 'string') {
        return serviceType.split('|').filter(type => type && type.trim().length > 0)
      }
      return []
    }

    const getServiceTypeTag = (serviceType) => {
      const types = {
        replace: "danger",
        check: "warning",
        clean: "success",
        repair: "info",
        inspect: "primary",
        adjust: "success",
        custom: "info",
      }
      return types[serviceType] || "info"
    }

    const getServiceTypeText = (serviceType) => {
      const texts = {
        replace: "更換",
        check: "檢查",
        clean: "清潔",
        repair: "維修",
        inspect: "檢測",
        adjust: "調整",
        custom: "自訂",
      }
      return texts[serviceType] || serviceType
    }

    const handleVehicleChange = () => {
      if (selectedVehicleId.value) {
        vehicleStore.setSelectedVehicle(selectedVehicleId.value)
      }
    }

    const handleReminderAction = (reminder) => {
      console.log('处理提醒:', reminder)
    }

    const addMaintenanceRecord = () => {
      console.log('新增保养记录')
    }

    const updateMileage = () => {
      console.log('更新里程')
    }

    const viewAllRecords = () => {
      router.push('/maintenance')
    }

    const goToVehicleList = () => {
      router.push('/vehicles')
    }

    const contactOwner = () => {
      if (ownerPhone.value) {
        window.location.href = `tel:${ownerPhone.value}`
      }
    }

    const ownerName = computed(() => {
      if (ownerPhone.value) {
        return vehicleStore.getOwnerNameByPhone(ownerPhone.value)
      }
      return currentVehicle.value.vehicle_info?.name || currentVehicle.value.name || '車主'
    })

    const ownerAvatar = computed(() => {
      return ''
    })

    // 生命周期
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
      ownerPhone,
      ownerName,
      ownerAvatar,
      vehicles,
      filteredVehicles,
      currentVehicle,
      currentVehicleIndex,
      currentMileage,
      upcomingServices,
      upcomingServicesCount,
      recentServices,
      recentServicesCount,
      totalCostThisYear,
      neverMaintainedItems,
      maintenanceReminders,
      getVehicleKey,
      getVehicleLabel,
      getVehicleBrand,
      getVehicleModel,
      getCurrentMileage,
      getCategoryTagType,
      getDueText,
      formatDate,
      getServiceTypes,
      getServiceTypeTag,
      getServiceTypeText,
      handleVehicleChange,
      handleReminderAction,
      addMaintenanceRecord,
      updateMileage,
      viewAllRecords,
      goToVehicleList,
      contactOwner
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
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

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
}

.overview-cards {
  margin-bottom: 20px;
}

.dashboard-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  gap: 8px;
}

.service-list {
  max-height: 400px;
  overflow-y: auto;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.service-item:last-child {
  border-bottom: none;
}

.service-info {
  flex: 1;
}

.service-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.service-due, .service-date, .service-mileage {
  font-size: 12px;
  color: #909399;
}

.service-note {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  font-style: italic;
}

.service-category, .service-cost {
  margin-left: 15px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #c0c4cc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-state i {
  font-size: 48px;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reminder-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.reminder-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.reminder-icon.oil {
  background: #e6a23c;
}

.reminder-icon.tire {
  background: #67c23a;
}

.reminder-content {
  flex: 1;
}

.reminder-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.reminder-desc {
  font-size: 12px;
  color: #909399;
}

.reminder-action {
  margin-left: 12px;
}

/* 未曾保养项目特殊样式 */
.service-item.never-maintained {
  border-left: 3px solid #e6a23c;
  background-color: #fdf6ec;
  display: flex;
  align-items: center;
  padding: 12px;
}

.service-icon {
  margin-right: 12px;
  color: #e6a23c;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.service-type {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.service-type-tag {
  margin-right: 4px;
}

.no-service-types {
  margin-top: 4px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action-btn {
  width: 100%;
  justify-content: flex-start;
  padding: 12px 16px;
}

.no-vehicles {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .owner-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .owner-avatar {
    margin-right: 0;
  }
  
  .owner-actions {
    margin-left: 0;
  }
  
  .vehicle-selector {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .service-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .service-item.never-maintained {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .service-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }
  
  .service-category, .service-cost {
    margin-left: 0;
    margin-top: 8px;
  }
  
  .reminder-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .reminder-action {
    margin-left: 0;
    margin-top: 12px;
    width: 100%;
  }
  
  .reminder-action .el-button {
    width: 100%;
  }
  
  .service-type {
    justify-content: flex-start;
  }
}
</style>
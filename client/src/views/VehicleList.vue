<template>
  <div class="vehicle-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>車輛列表</span>
          <el-button type="primary" @click="addVehicle">
            <i class="el-icon-plus"></i>
            新增車輛
          </el-button>
        </div>
      </template>
      
      <!-- 车主筛选 -->
      <div class="owner-filter">
        <el-select 
          v-model="selectedOwner" 
          placeholder="選擇車主" 
          clearable
          style="width: 300px;"
          @change="handleOwnerChange"
        >
          <el-option
            v-for="phone in allPhones"
            :key="phone"
            :label="`${getOwnerNameByPhone(phone)} (${phone})`"
            :value="phone"
          />
        </el-select>
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
                {{ getVehicleBrand(vehicle) }} {{ getVehicleModel(vehicle) }}
              </span>
              <el-tag :type="getVehicleStatus(vehicle)">
                {{ getVehicleStatusText(vehicle) }}
              </el-tag>
            </div>
          </template>
          
          <div class="vehicle-info">
            <div class="info-item">
              <i class="el-icon-user"></i>
              <span>{{ getOwnerName(vehicle) }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-phone"></i>
              <span>{{ getOwnerPhone(vehicle) }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-ticket"></i>
              <span>{{ getVehicleKey(vehicle) }}</span>
            </div>
            <div class="info-item">
              <i class="el-icon-odometer"></i>
              <span>{{ getCurrentMileage(vehicle).toLocaleString() }} km</span>
            </div>
            <div class="info-item">
              <i class="el-icon-date"></i>
              <span>{{ getVehicleYear(vehicle) }} 年</span>
            </div>
          </div>
          
          <div class="vehicle-actions">
            <el-button type="primary" text @click="viewVehicle(vehicle)">
              查看詳情
            </el-button>
            <el-button type="success" text @click="viewOwnerVehicles(vehicle)">
              查看車主所有車輛
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 无车辆提示 -->
      <div v-if="displayedVehicles.length === 0" class="no-vehicles">
        <el-empty description="未找到車輛信息">
          <el-button type="primary" @click="selectedOwner = ''">查看所有車輛</el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useVehicleStore } from '../stores/vehicles'
import { useRouter } from 'vue-router'

export default {
  name: 'VehicleList',
  setup() {
    const vehicleStore = useVehicleStore()
    const router = useRouter()
    const selectedOwner = ref('')
    
    const allPhones = computed(() => vehicleStore.getAllPhones)
    
    const allVehicles = computed(() => vehicleStore.allVehicles)
    
    const displayedVehicles = computed(() => {
      if (!selectedOwner.value) return allVehicles.value
      
      return allVehicles.value.filter(vehicle => {
        const phone = getOwnerPhone(vehicle)
        return phone === selectedOwner.value
      })
    })
    
    const getVehicleKey = (vehicle) => {
      return vehicle.vehicle_info?.license_plate || vehicle.license_plate
    }
    
    const getVehicleBrand = (vehicle) => {
      return vehicle.vehicle_info?.brand || vehicle.vehicle_info?.make || '未知'
    }
    
    const getVehicleModel = (vehicle) => {
      return vehicle.vehicle_info?.model || '未知'
    }
    
    const getVehicleYear = (vehicle) => {
      return vehicle.vehicle_info?.year || '未知'
    }
    
    const getCurrentMileage = (vehicle) => {
      return vehicle.vehicle_info?.current_mileage || vehicle.current_mileage || 0
    }
    
    const getOwnerName = (vehicle) => {
      return vehicle.vehicle_info?.name || vehicle.name || '未知'
    }
    
    const getOwnerPhone = (vehicle) => {
      return vehicle.vehicle_info?.phone || vehicle.phone || '未知'
    }
    
    const getOwnerNameByPhone = (phone) => {
      return vehicleStore.getOwnerNameByPhone(phone)
    }
    
    const getVehicleStatus = (vehicle) => {
      const mileage = getCurrentMileage(vehicle)
      if (mileage > 200000) return 'danger'
      if (mileage > 100000) return 'warning'
      return 'success'
    }
    
    const getVehicleStatusText = (vehicle) => {
      const mileage = getCurrentMileage(vehicle)
      if (mileage > 200000) return '高里程'
      if (mileage > 100000) return '中里程'
      return '低里程'
    }
    
    const viewVehicle = (vehicle) => {
      const licensePlate = getVehicleKey(vehicle)
      vehicleStore.setSelectedVehicle(licensePlate)
      router.push('/dashboard')
    }
    
    const viewOwnerVehicles = (vehicle) => {
      const phone = getOwnerPhone(vehicle)
      if (phone && phone.length === 10) {
        router.push(`/dashboard/${phone}`)
      }
    }
    
    const handleOwnerChange = (phone) => {
      selectedOwner.value = phone
    }
    
    const addVehicle = () => {
      console.log('新增車輛')
    }

    onMounted(() => {
      console.log('車輛列表載入完成，車輛數量:', allVehicles.value.length)
      console.log('車輛資料:', allVehicles.value)
    })
    
    return {
      selectedOwner,
      allPhones,
      displayedVehicles,
      getVehicleKey,
      getVehicleBrand,
      getVehicleModel,
      getVehicleYear,
      getCurrentMileage,
      getOwnerName,
      getOwnerPhone,
      getOwnerNameByPhone,
      getVehicleStatus,
      getVehicleStatusText,
      viewVehicle,
      viewOwnerVehicles,
      handleOwnerChange,
      addVehicle
    }
  }
}
</script>

<style scoped>
.vehicle-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.owner-filter {
  margin-bottom: 20px;
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
  
  .owner-filter {
    display: flex;
    justify-content: center;
  }
}
</style>
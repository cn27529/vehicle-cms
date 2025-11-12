<template>
  <div class="statistics-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-alert :title="error" type="error" show-icon :closable="false" />
      <el-button @click="retryInitialize" type="primary" style="margin-top: 20px">
        重新加载
      </el-button>
    </div>

    <!-- 正常内容 -->
    <div v-else>
      <!-- 页面标题和筛选 -->
      <div class="page-header">
        <h1>統計數據</h1>
        <div class="filter-controls">
          <el-select v-model="selectedYear" placeholder="選擇年份" @change="handleYearChange">
            <el-option
              v-for="year in availableYears"
              :key="year"
              :label="`${year} 年`"
              :value="year"
            />
          </el-select>
          <el-select v-model="selectedVehicleId" placeholder="選擇車輛" @change="handleVehicleChange">
            <el-option label="全部車輛" value="" />
            <el-option
              v-for="vehicle in vehicles"
              :key="getVehicleKey(vehicle)"
              :label="getVehicleLabel(vehicle)"
              :value="getVehicleKey(vehicle)"
            />
          </el-select>
        </div>
      </div>

      <!-- 关键指标卡片 -->
      <el-row :gutter="20" class="key-metrics">
        <el-col :xs="12" :sm="6">
          <MetricCard
            title="年度保養次數"
            :value="annualStats.totalCount"
            unit="次"
            icon="calendar"
            :trend="annualStats.countTrend"
            trend-label="較去年"
          />
        </el-col>
        <el-col :xs="12" :sm="6">
          <MetricCard
            title="年度保養金額"
            :value="annualStats.totalCost"
            unit="元"
            icon="money"
            :trend="annualStats.costTrend"
            trend-label="較去年"
            format="currency"
          />
        </el-col>
        <el-col :xs="12" :sm="6">
          <MetricCard
            title="平均單次花費"
            :value="annualStats.averageCost"
            unit="元"
            icon="trend-charts"
            :trend="annualStats.avgCostTrend"
            trend-label="較去年"
            format="currency"
          />
        </el-col>
        <el-col :xs="12" :sm="6">
          <MetricCard
            title="保養頻率"
            :value="annualStats.frequency"
            unit="天/次"
            icon="timer"
            :trend="annualStats.frequencyTrend"
            trend-label="較去年"
          />
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-section">
        <!-- 月度花费趋势 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <el-icon><TrendCharts /></el-icon>
                <span>月度保養花費趨勢</span>
              </div>
            </template>
            <div class="chart-container">
              <MonthlyCostChart :data="monthlyCostData" />
            </div>
          </el-card>
        </el-col>

        <!-- 保养分类分布 -->
        <el-col :xs="24" :lg="12">
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <el-icon><PieChart /></el-icon>
                <span>保養分類金額分布</span>
              </div>
            </template>
            <div class="chart-container">
              <CategoryDistributionChart :data="categoryDistributionData" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 详细统计表格 -->
      <el-row :gutter="20" class="detailed-stats">
        <el-col :xs="24">
          <el-card class="stats-card">
            <template #header>
              <div class="stats-header">
                <el-icon><DataBoard /></el-icon>
                <span>詳細統計數據</span>
              </div>
            </template>
            
            <!-- 分类统计 -->
            <div class="category-stats-section">
              <h3>保養分類統計</h3>
              <el-table :data="categoryStats" stripe>
                <el-table-column prop="category" label="分類" width="150">
                  <template #default="{ row }">
                    <el-tag :type="getCategoryTagType(row.category)">
                      {{ row.category }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="count" label="次數" width="100" align="center">
                  <template #default="{ row }">
                    {{ row.count }} 次
                  </template>
                </el-table-column>
                <el-table-column prop="totalCost" label="總金額" width="120" align="right">
                  <template #default="{ row }">
                    ¥{{ row.totalCost.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="averageCost" label="平均金額" width="120" align="right">
                  <template #default="{ row }">
                    ¥{{ row.averageCost.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="percentage" label="占比" width="100" align="center">
                  <template #default="{ row }">
                    {{ row.percentage }}%
                  </template>
                </el-table-column>
                <el-table-column label="趨勢" width="120" align="center">
                  <template #default="{ row }">
                    <el-tag 
                      :type="row.trend >= 0 ? 'success' : 'danger'" 
                      size="small"
                    >
                      <el-icon v-if="row.trend > 0"><Top /></el-icon>
                      <el-icon v-else-if="row.trend < 0"><Bottom /></el-icon>
                      {{ Math.abs(row.trend) }}%
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 月度详细数据 -->
            <div class="monthly-stats-section">
              <h3>月度詳細數據</h3>
              <el-table :data="monthlyDetailedData" stripe>
                <el-table-column prop="month" label="月份" width="100" fixed>
                  <template #default="{ row }">
                    {{ row.month }}月
                  </template>
                </el-table-column>
                <el-table-column prop="count" label="保養次數" width="100" align="center" />
                <el-table-column prop="totalCost" label="總金額" width="120" align="right">
                  <template #default="{ row }">
                    ¥{{ row.totalCost.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="averageCost" label="平均金額" width="120" align="right">
                  <template #default="{ row }">
                    ¥{{ row.averageCost.toLocaleString() }}
                  </template>
                </el-table-column>
                <el-table-column prop="majorCategory" label="主要分類" width="120">
                  <template #default="{ row }">
                    <el-tag size="small" v-if="row.majorCategory">
                      {{ row.majorCategory }}
                    </el-tag>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="highestCostItem" label="最高花費項目" min-width="150">
                  <template #default="{ row }">
                    <div v-if="row.highestCostItem">
                      <div>{{ row.highestCostItem.name }}</div>
                      <div class="cost-detail">¥{{ row.highestCostItem.cost.toLocaleString() }}</div>
                    </div>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 保养提醒和建议 -->
      <el-row :gutter="20" class="insights-section">
        <el-col :xs="24" :lg="12">
          <el-card class="insight-card">
            <template #header>
              <div class="insight-header">
                <el-icon><Sunny /></el-icon>
                <span>保養洞察</span>
              </div>
            </template>
            <div class="insight-content">
              <div 
                v-for="insight in maintenanceInsights" 
                :key="insight.type"
                class="insight-item"
                :class="insight.type"
              >
                <div class="insight-icon">
                  <el-icon>
                    <component :is="insight.icon" />
                  </el-icon>
                </div>
                <div class="insight-text">
                  <div class="insight-title">{{ insight.title }}</div>
                  <div class="insight-desc">{{ insight.description }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="12">
          <el-card class="insight-card">
            <template #header>
              <div class="insight-header">
                <el-icon><Star /></el-icon>
                <span>優化建議</span>
              </div>
            </template>
            <div class="insight-content">
              <div 
                v-for="suggestion in optimizationSuggestions" 
                :key="suggestion.id"
                class="suggestion-item"
              >
                <div class="suggestion-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="suggestion-text">
                  <div class="suggestion-title">{{ suggestion.title }}</div>
                  <div class="suggestion-desc">{{ suggestion.description }}</div>
                  <div class="suggestion-savings" v-if="suggestion.estimatedSavings">
                    預計節省: ¥{{ suggestion.estimatedSavings.toLocaleString() }}/年
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVehicleStore } from '../stores/vehicles'
import MetricCard from '../components/MetricCard.vue'
import MonthlyCostChart from '../components/charts/MonthlyCostChart.vue'
import CategoryDistributionChart from '../components/charts/CategoryDistributionChart.vue'
import { 
  TrendCharts, 
  PieChart, 
  DataBoard, 
  Sunny, 
  Star, 
  Top, 
  Bottom,
  Money,
  Timer,
  Warning
} from '@element-plus/icons-vue'

export default {
  name: 'Statistics',
  components: {
    MetricCard,
    MonthlyCostChart,
    CategoryDistributionChart,
    TrendCharts,
    PieChart,
    DataBoard,
    Sunny,
    Star,
    Top,
    Bottom
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
    
    const selectedYear = ref(new Date().getFullYear())
    const selectedVehicleId = ref('')
    const loading = ref(true)
    const error = ref(null)

    // 可用年份（最近3年）
    const availableYears = computed(() => {
      const currentYear = new Date().getFullYear()
      return [currentYear - 2, currentYear - 1, currentYear]
    })

    // 从路由参数获取手机号码
    const ownerPhone = computed(() => {
      if (props.phone) {
        return props.phone
      }
      return route.params.phone || ''
    })

    // 初始化数据
    const initialize = async () => {
      try {
        loading.value = true
        error.value = null
        
        // 确保 store 已初始化
        if (vehicleStore.allVehicles.length === 0) {
          await vehicleStore.initialize()
        }
        
        // 设置选中的手机号码
        if (ownerPhone.value) {
          vehicleStore.setSelectedPhone(ownerPhone.value)
        }
        
      } catch (err) {
        console.error('Statistics 初始化错误:', err)
        error.value = err.message || '加载数据失败'
      } finally {
        loading.value = false
      }
    }

    // 重新加载
    const retryInitialize = () => {
      initialize()
    }

    // 计算属性
    const vehicles = computed(() => {
      if (ownerPhone.value) {
        return vehicleStore.vehiclesByPhone
      }
      return vehicleStore.allVehicles
    })

    // 年度统计数据
    const annualStats = computed(() => {
      // 这里需要实现具体的统计逻辑
      // 暂时返回模拟数据
      return {
        totalCount: 24,
        totalCost: 58600,
        averageCost: 2442,
        frequency: 45,
        countTrend: 8.3,
        costTrend: -12.5,
        avgCostTrend: -5.2,
        frequencyTrend: -15.7
      }
    })

    // 月度花费数据
    const monthlyCostData = computed(() => {
      return [
        { month: '1月', cost: 5200, count: 3 },
        { month: '2月', cost: 3200, count: 2 },
        { month: '3月', cost: 4800, count: 2 },
        { month: '4月', cost: 6500, count: 3 },
        { month: '5月', cost: 4200, count: 2 },
        { month: '6月', cost: 5800, count: 3 },
        { month: '7月', cost: 3900, count: 2 },
        { month: '8月', cost: 7200, count: 4 },
        { month: '9月', cost: 4500, count: 2 },
        { month: '10月', cost: 5100, count: 3 },
        { month: '11月', cost: 4700, count: 2 },
        { month: '12月', cost: 4300, count: 2 }
      ]
    })

    // 分类分布数据
    const categoryDistributionData = computed(() => {
      return [
        { name: '引擎系統', value: 18600, percentage: 31.7 },
        { name: '制動系統', value: 12400, percentage: 21.2 },
        { name: '輪胎保養', value: 9800, percentage: 16.7 },
        { name: '空調系統', value: 7500, percentage: 12.8 },
        { name: '電系保養', value: 6300, percentage: 10.8 },
        { name: '其他', value: 4000, percentage: 6.8 }
      ]
    })

    // 分类统计
    const categoryStats = computed(() => {
      return [
        { category: '引擎系統', count: 8, totalCost: 18600, averageCost: 2325, percentage: 31.7, trend: 5.2 },
        { category: '制動系統', count: 5, totalCost: 12400, averageCost: 2480, percentage: 21.2, trend: -3.8 },
        { category: '輪胎保養', count: 4, totalCost: 9800, averageCost: 2450, percentage: 16.7, trend: 12.1 },
        { category: '空調系統', count: 3, totalCost: 7500, averageCost: 2500, percentage: 12.8, trend: -8.5 },
        { category: '電系保養', count: 2, totalCost: 6300, averageCost: 3150, percentage: 10.8, trend: 15.3 },
        { category: '其他', count: 2, totalCost: 4000, averageCost: 2000, percentage: 6.8, trend: -2.1 }
      ]
    })

    // 月度详细数据
    const monthlyDetailedData = computed(() => {
      return monthlyCostData.value.map(monthData => ({
        month: monthData.month.replace('月', ''),
        count: monthData.count,
        totalCost: monthData.cost,
        averageCost: Math.round(monthData.cost / monthData.count),
        majorCategory: getMajorCategory(monthData.month),
        highestCostItem: getHighestCostItem(monthData.month)
      }))
    })

    // 保养洞察
    const maintenanceInsights = computed(() => {
      return [
        {
          type: 'saving',
          icon: Money,
          title: '保養花費下降',
          description: '今年度保養總花費較去年減少12.5%，節省約¥8,400'
        },
        {
          type: 'frequency',
          icon: Timer,
          title: '保養頻率優化',
          description: '保養間隔從53天縮短至45天，車輛狀況更穩定'
        },
        {
          type: 'category',
          icon: PieChart,
          title: '引擎保養佔比最高',
          description: '引擎系統保養佔總花費31.7%，建議定期檢查'
        },
        {
          type: 'alert',
          icon: Warning,
          title: '電系保養成本上升',
          description: '電系保養成本較去年增加15.3%，建議檢查電池狀況'
        }
      ]
    })

    // 优化建议
    const optimizationSuggestions = computed(() => {
      return [
        {
          id: 1,
          title: '定期輪胎調位',
          description: '每10,000公里進行輪胎調位，可延長輪胎使用壽命',
          estimatedSavings: 1200
        },
        {
          id: 2,
          title: '預約保養套餐',
          description: '選擇年度保養套餐，可享受85折優惠',
          estimatedSavings: 3500
        },
        {
          id: 3,
          title: '自備機油',
          description: '自備指定品牌機油，可節省工時費用',
          estimatedSavings: 800
        },
        {
          id: 4,
          title: '合併保養項目',
          description: '將小項目合併進行，減少工時費用',
          estimatedSavings: 1500
        }
      ]
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

    const getCategoryTagType = (category) => {
      const types = {
        '引擎系統': 'danger',
        '制動系統': 'warning',
        '輪胎保養': 'success',
        '空調系統': 'info',
        '電系保養': 'primary',
        '其他': ''
      }
      return types[category] || 'info'
    }

    const getMajorCategory = (month) => {
      // 模拟数据 - 实际应该根据真实数据计算
      const categories = ['引擎系統', '制動系統', '輪胎保養', '空調系統']
      return categories[Math.floor(Math.random() * categories.length)]
    }

    const getHighestCostItem = (month) => {
      // 模拟数据
      const items = [
        { name: '更換機油', cost: 2500 },
        { name: '剎車片更換', cost: 3200 },
        { name: '輪胎更換', cost: 4800 },
        { name: '電瓶更換', cost: 2800 }
      ]
      return items[Math.floor(Math.random() * items.length)]
    }

    const handleYearChange = (year) => {
      console.log('選擇年份:', year)
      // 重新加載該年度的數據
    }

    const handleVehicleChange = (vehicleId) => {
      console.log('選擇車輛:', vehicleId)
      // 重新加載該車輛的數據
    }

    onMounted(() => {
      initialize()
    })

    return {
      selectedYear,
      selectedVehicleId,
      availableYears,
      vehicles,
      annualStats,
      monthlyCostData,
      categoryDistributionData,
      categoryStats,
      monthlyDetailedData,
      maintenanceInsights,
      optimizationSuggestions,
      loading,
      error,
      getVehicleKey,
      getVehicleLabel,
      getCategoryTagType,
      getMajorCategory,
      getHighestCostItem,
      handleYearChange,
      handleVehicleChange,
      retryInitialize
    }
  }
}
</script>

<style scoped>
/* 样式部分保持不变 */
.statistics-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.key-metrics {
  margin-bottom: 24px;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.chart-header i {
  margin-right: 8px;
  font-size: 18px;
}

.chart-container {
  height: 320px;
  padding: 16px 0;
}

.detailed-stats {
  margin-bottom: 24px;
}

.stats-header {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.stats-header i {
  margin-right: 8px;
  font-size: 18px;
}

.category-stats-section,
.monthly-stats-section {
  margin-bottom: 32px;
}

.category-stats-section h3,
.monthly-stats-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.cost-detail {
  font-size: 12px;
  color: #909399;
}

.insights-section {
  margin-bottom: 24px;
}

.insight-header {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.insight-header i {
  margin-right: 8px;
  font-size: 18px;
}

.insight-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.insight-item.saving {
  border-left-color: #67c23a;
  background: #f0f9e8;
}

.insight-item.frequency {
  border-left-color: #409eff;
  background: #ecf5ff;
}

.insight-item.category {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.insight-item.alert {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.insight-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #606266;
}

.insight-text {
  flex: 1;
}

.insight-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.insight-desc {
  font-size: 14px;
  color: #606266;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #f8f9fa;
}

.suggestion-icon {
  margin-right: 12px;
  color: #e6a23c;
  font-size: 18px;
}

.suggestion-text {
  flex: 1;
}

.suggestion-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.suggestion-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.suggestion-savings {
  font-size: 12px;
  color: #67c23a;
  font-weight: 500;
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
  .statistics-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .filter-controls {
    width: 100%;
    flex-direction: column;
  }
  
  .chart-card {
    height: auto;
  }
  
  .chart-container {
    height: 280px;
  }
  
  .insight-item,
  .suggestion-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .insight-icon,
  .suggestion-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>

<template>
  <div ref="chartContainer" class="category-distribution-chart">
    <!-- 如果沒有數據顯示空狀態 -->
    <div v-if="!chartData || chartData.length === 0" class="empty-chart">
      <el-empty description="暫無數據" :image-size="80" />
    </div>
    
    <!-- 圖表容器 -->
    <div v-else id="categoryDistributionChart" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'CategoryDistributionChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '保養分類金額分布'
    }
  },
  setup(props) {
    const chartContainer = ref(null)
    let chartInstance = null

    // 顏色配置
    const colorPalette = [
      '#5470c6', '#91cc75', '#fac858', '#ee6666', 
      '#73c0de', '#3ba272', '#fc8452', '#9a60b4',
      '#ea7ccc', '#ff9f7f'
    ]

    // 圖表配置
    const getChartOption = () => {
      const total = props.data.reduce((sum, item) => sum + item.value, 0)
      
      return {
        title: {
          text: props.title,
          left: 'center',
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: function(params) {
            const percentage = ((params.value / total) * 100).toFixed(1)
            return `
              ${params.marker} ${params.name}<br/>
              金額: ¥${params.value.toLocaleString()}<br/>
              占比: ${percentage}%
            `
          }
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 20,
          bottom: 20,
          textStyle: {
            fontSize: 10
          }
        },
        series: [
          {
            name: '保養分類',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['40%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center',
              formatter: '{b}\n{c}元\n({d}%)'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold',
                formatter: function(params) {
                  const percentage = ((params.value / total) * 100).toFixed(1)
                  return `${params.name}\n¥${params.value.toLocaleString()}\n${percentage}%`
                }
              }
            },
            labelLine: {
              show: false
            },
            data: props.data.map((item, index) => ({
              name: item.name,
              value: item.value,
              percentage: item.percentage,
              itemStyle: {
                color: colorPalette[index % colorPalette.length]
              }
            }))
          }
        ]
      }
    }

    // 初始化圖表
    const initChart = () => {
      if (!chartContainer.value) return
      
      chartInstance = echarts.init(document.getElementById('categoryDistributionChart'))
      chartInstance.setOption(getChartOption())
      
      // 響應式調整
      window.addEventListener('resize', handleResize)
    }

    // 處理窗口大小變化
    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize()
      }
    }

    // 更新圖表數據
    const updateChart = () => {
      if (chartInstance && props.data && props.data.length > 0) {
        chartInstance.setOption(getChartOption())
      }
    }

    onMounted(() => {
      if (props.data && props.data.length > 0) {
        setTimeout(() => {
          initChart()
        }, 100)
      }
    })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
      }
      window.removeEventListener('resize', handleResize)
    })

    // 監聽數據變化
    watch(() => props.data, (newData) => {
      if (newData && newData.length > 0) {
        if (!chartInstance) {
          setTimeout(() => {
            initChart()
          }, 100)
        } else {
          updateChart()
        }
      }
    }, { deep: true })

    return {
      chartContainer
    }
  }
}
</script>

<style scoped>
.category-distribution-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.empty-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}
</style>

<template>
  <div ref="chartContainer" class="monthly-cost-chart">
    <!-- 如果沒有數據顯示空狀態 -->
    <div v-if="!chartData || chartData.length === 0" class="empty-chart">
      <el-empty description="暫無數據" :image-size="80" />
    </div>
    
    <!-- 圖表容器 -->
    <div v-else id="monthlyCostChart" style="width: 100%; height: 100%;"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

export default {
  name: 'MonthlyCostChart',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '月度保養花費趨勢'
    }
  },
  setup(props) {
    const chartContainer = ref(null)
    let chartInstance = null

    // 圖表配置
    const getChartOption = () => {
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
          trigger: 'axis',
          formatter: function(params) {
            let result = `${params[0].axisValue}<br/>`
            params.forEach(param => {
              const value = param.seriesType === 'bar' 
                ? `¥${param.value.toLocaleString()}`
                : `${param.value}次`
              result += `${param.marker} ${param.seriesName}: ${value}<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['保養花費', '保養次數'],
          top: 30
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '20%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: props.data.map(item => item.month),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '金額 (元)',
            position: 'left',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#5470c6'
              }
            },
            axisLabel: {
              formatter: '¥{value}'
            }
          },
          {
            type: 'value',
            name: '次數',
            position: 'right',
            axisLine: {
              show: true,
              lineStyle: {
                color: '#91cc75'
              }
            }
          }
        ],
        series: [
          {
            name: '保養花費',
            type: 'bar',
            yAxisIndex: 0,
            data: props.data.map(item => item.cost),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#5470c6' },
                { offset: 1, color: '#83a0ff' }
              ])
            },
            emphasis: {
              focus: 'series'
            }
          },
          {
            name: '保養次數',
            type: 'line',
            yAxisIndex: 1,
            data: props.data.map(item => item.count),
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              color: '#91cc75',
              width: 3
            },
            itemStyle: {
              color: '#91cc75'
            },
            emphasis: {
              focus: 'series'
            }
          }
        ]
      }
    }

    // 初始化圖表
    const initChart = () => {
      if (!chartContainer.value) return
      
      chartInstance = echarts.init(document.getElementById('monthlyCostChart'))
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
.monthly-cost-chart {
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

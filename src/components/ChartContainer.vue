<template>
  <div class="chart-container">
    <div ref="chartRef" :style="{ width: '100%', height: '100%' }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

interface Props {
  option: echarts.EChartsOption
  theme?: string
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light'
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value, props.theme)
  chart.setOption(props.option)
}

const resizeChart = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})

watch(() => props.option, (newOption) => {
  chart?.setOption(newOption)
}, { deep: true })

watch(() => props.theme, () => {
  if (chart) {
    chart.dispose()
    initChart()
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
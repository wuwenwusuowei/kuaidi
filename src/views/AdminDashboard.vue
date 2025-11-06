<template>
  <div class="admin-dashboard">
    <!-- 用户统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon active-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.activeUsers }}</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon new-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.newUsersToday }}</div>
              <div class="stat-label">今日新增用户</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon banned-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.bannedUsers || 0 }}</div>
              <div class="stat-label">封禁用户数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 订单统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon order-icon">
              <el-icon><List /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">总订单数</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon completed-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.completedOrders }}</div>
              <div class="stat-label">已完成订单</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon pending-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.pendingOrders }}</div>
              <div class="stat-label">待处理订单</div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon today-order-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.todayOrders }}</div>
              <div class="stat-label">今日新增订单</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>订单趋势</h3>
              <el-select v-model="orderTimeRange" size="small" style="width: 120px" @change="loadOrderTrendData">
                <el-option label="近7天" value="7" />
                <el-option label="近30天" value="30" />
                <el-option label="近90天" value="90" />
              </el-select>
            </div>
            <div class="chart-container">
              <ChartContainer v-if="orderTrendData.dates.length > 0" :option="orderTrendOption" />
              <div v-else class="chart-placeholder">
                <el-icon><DataAnalysis /></el-icon>
                <p>加载订单趋势数据...</p>
              </div>
            </div>
          </div>
        </el-col>
        
        <el-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>用户分布</h3>
            </div>
            <div class="chart-container">
              <ChartContainer v-if="userDistributionData.statusDistribution.length > 0" :option="userDistributionOption" />
              <div v-else class="chart-placeholder">
                <el-icon><PieChart /></el-icon>
                <p>加载用户分布数据...</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { AdminService } from '../services/adminService'
import ChartContainer from '../components/ChartContainer.vue'
import { User, Document, CircleCheck, Clock, TrendCharts, UserFilled, Calendar, Money, Warning, List, DataAnalysis, PieChart } from '@element-plus/icons-vue'

const orderTimeRange = ref('7')
const loading = ref(true)

const stats = reactive({
  totalUsers: 0,
  totalOrders: 0,
  activeUsers: 0,
  completedOrders: 0,
  pendingOrders: 0,
  newUsersToday: 0,
  todayOrders: 0,
  todayRevenue: 0,
  bannedUsers: 0
})

// 图表数据
const orderTrendData = reactive({
  dates: [] as string[],
  orderCounts: [] as number[]
})

const userDistributionData = reactive({
  statusDistribution: [] as Array<{ name: string; value: number }>,
  registrationStats: {
    total: 0,
    recent: 0,
    old: 0
  }
})

// 订单趋势图表配置
const orderTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}<br/>{a}: {c} 单'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: orderTrendData.dates.map(date => date.split('-').slice(1).join('/')),
    axisLabel: {
      rotate: 45
    }
  },
  yAxis: {
    type: 'value',
    name: '订单数'
  },
  series: [{
    name: '订单数量',
    type: 'line',
    data: orderTrendData.orderCounts,
    smooth: true,
    itemStyle: {
      color: '#409EFF'
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0, color: 'rgba(64, 158, 255, 0.3)'
        }, {
          offset: 1, color: 'rgba(64, 158, 255, 0.05)'
        }]
      }
    }
  }]
}))

// 用户分布图表配置
const userDistributionOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: 'center'
  },
  series: [{
    name: '用户分布',
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: false,
      position: 'center'
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    labelLine: {
      show: false
    },
    data: userDistributionData.statusDistribution
  }]
}))

const loadDashboardData = async () => {
  try {
    loading.value = true
    const dashboardData = await AdminService.getDashboardData()
    
    // 更新统计数据
    Object.assign(stats, dashboardData)
  } catch (error) {
    console.error('加载仪表板数据失败:', error)
    ElMessage.error('加载数据失败，使用模拟数据')
    
    // 使用模拟数据作为备选
    stats.totalUsers = 1250
    stats.totalOrders = 890
    stats.activeUsers = 342
    stats.completedOrders = 650
    stats.pendingOrders = 240
    stats.newUsersToday = 12
    stats.todayOrders = 45
    stats.todayRevenue = 1280
    stats.bannedUsers = 8
  } finally {
    loading.value = false
  }
}

const loadOrderTrendData = async () => {
  try {
    const days = parseInt(orderTimeRange.value)
    const trendData = await AdminService.getOrderTrendData(days)
    
    Object.assign(orderTrendData, trendData)
  } catch (error) {
    console.error('加载订单趋势数据失败:', error)
    ElMessage.error('加载订单趋势数据失败')
    
    // 使用模拟数据
    const days = parseInt(orderTimeRange.value)
    const dates = []
    const counts = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
      counts.push(Math.floor(Math.random() * 20) + 5)
    }
    
    orderTrendData.dates = dates
    orderTrendData.orderCounts = counts
  }
}

const loadUserDistributionData = async () => {
  try {
    const distributionData = await AdminService.getUserDistributionData()
    
    Object.assign(userDistributionData, distributionData)
  } catch (error) {
    console.error('加载用户分布数据失败:', error)
    ElMessage.error('加载用户分布数据失败')
    
    // 使用模拟数据
    userDistributionData.statusDistribution = [
      { name: '活跃', value: Math.floor(Math.random() * 100) + 50 },
      { name: '七天未登录', value: Math.floor(Math.random() * 30) + 20 },
      { name: '一个月未登录', value: Math.floor(Math.random() * 40) + 10 },
      { name: '半年未登录', value: Math.floor(Math.random() * 20) + 5 },
      { name: '长期不登录', value: Math.floor(Math.random() * 15) + 3 },
      { name: '从未登录', value: Math.floor(Math.random() * 10) + 1 },
      { name: '已封禁', value: Math.floor(Math.random() * 10) + 1 }
    ]
  }
}

onMounted(async () => {
  await loadDashboardData()
  await loadOrderTrendData()
  await loadUserDistributionData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 0;
}

.stats-cards {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.user-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.active-icon { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.new-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.banned-icon { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
.order-icon { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); }
.completed-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.pending-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.today-order-icon { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); }
.revenue-icon { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #9ca3af;
}

.chart-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.recent-activity {
  margin-bottom: 24px;
}

.activity-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.activity-list {
  space-y: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #6b7280;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #9ca3af;
}
</style>
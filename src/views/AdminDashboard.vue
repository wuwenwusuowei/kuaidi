<template>
  <div class="admin-dashboard">
    <!-- 统计卡片 -->
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
            <div class="stat-icon order-icon">
              <el-icon><Document /></el-icon>
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
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>订单趋势</h3>
              <el-select v-model="orderTimeRange" size="small" style="width: 120px">
                <el-option label="近7天" value="7d" />
                <el-option label="近30天" value="30d" />
                <el-option label="近90天" value="90d" />
              </el-select>
            </div>
            <div class="chart-container">
              <!-- 这里可以集成图表库 -->
              <div class="chart-placeholder">
                <el-icon><DataAnalysis /></el-icon>
                <p>订单趋势图表</p>
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
              <div class="chart-placeholder">
                <el-icon><PieChart /></el-icon>
                <p>用户分布图表</p>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activity">
      <div class="activity-card">
        <div class="card-header">
          <h3>最近活动</h3>
          <el-button type="primary" text size="small">查看全部</el-button>
        </div>
        <div class="activity-list">
          <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
            <div class="activity-icon">
              <el-icon><component :is="activity.icon" /></el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { AdminService } from '../services/adminService'
import { User, Document, CircleCheck, Clock } from '@element-plus/icons-vue'

const orderTimeRange = ref('7d')
const loading = ref(true)

const stats = reactive({
  totalUsers: 0,
  totalOrders: 0,
  activeUsers: 0,
  completedOrders: 0,
  pendingOrders: 0,
  newUsersToday: 0
})

const recentActivities = ref([])

const loadDashboardData = async () => {
  try {
    loading.value = true
    const dashboardData = await AdminService.getDashboardData()
    
    // 更新统计数据
    Object.assign(stats, dashboardData)
    
    // 生成最近活动数据
    recentActivities.value = [
      {
        id: 1,
        icon: 'User',
        title: `今日新增 ${dashboardData.newUsersToday} 位用户`,
        time: '刚刚更新'
      },
      {
        id: 2,
        icon: 'Document',
        title: `待处理订单 ${dashboardData.pendingOrders} 个`,
        time: '实时数据'
      },
      {
        id: 3,
        icon: 'CircleCheck',
        title: `已完成订单 ${dashboardData.completedOrders} 个`,
        time: '实时数据'
      },
      {
        id: 4,
        icon: 'Clock',
        title: `活跃用户 ${dashboardData.activeUsers} 位`,
        time: '实时数据'
      }
    ]
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
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
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
.order-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.completed-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.pending-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

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
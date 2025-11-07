<template>
  <div class="task-hall-container">
    <!-- 任务大厅页面 - 包含3D星空效果和任务筛选功能（GitHub已上传版本） -->
    <!-- 校园风格页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <el-button 
            type="primary" 
            @click="goBack" 
            class="back-btn"
            :icon="ArrowLeft"
            size="small"
          >
            返回
          </el-button>
          <div class="header-title">
            <h1>任务大厅</h1>
            <p>浏览可接单的代领任务</p>
          </div>
        </div>
        <div class="header-stats">
          <span class="stat-item">
            <span class="stat-number">{{ filteredTasks.length }}</span>
            <span class="stat-label">可接任务</span>
          </span>
        </div>
      </div>
    </div>
    
    <div class="task-hall-content">
      <!-- 搜索和筛选区域 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索快递标题或描述"
              prefix-icon="Search"
              clearable
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterCompany" placeholder="快递公司" clearable>
              <el-option label="顺丰" value="顺丰" />
              <el-option label="中通" value="中通" />
              <el-option label="圆通" value="圆通" />
              <el-option label="申通" value="申通" />
              <el-option label="韵达" value="韵达" />
              <el-option label="京东" value="京东" />
              <el-option label="邮政" value="邮政" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filterSize" placeholder="物品尺寸" clearable>
              <el-option label="小件" value="小件" />
              <el-option label="中件" value="中件" />
              <el-option label="大件" value="大件" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="refreshTasks">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 任务列表 -->
      <div class="task-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-result icon="info" title="正在加载任务" sub-title="请稍候...">
            <template #extra>
              <el-button type="primary" :loading="true">加载中</el-button>
            </template>
          </el-result>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredTasks.length === 0" class="empty-state">
          <el-empty description="暂无待接单任务" />
        </div>

        <!-- 任务列表 -->
        <div v-else class="task-grid">
          <el-card 
            v-for="task in filteredTasks" 
            :key="task.id"
            class="task-card"
            shadow="hover"
          >
            <template #header>
              <div class="task-header">
                <div class="task-title">
                  <h3>{{ task.title }}</h3>
                  <el-tag 
                    v-if="task.urgent" 
                    type="danger" 
                    size="small"
                  >
                    加急
                  </el-tag>
                </div>
                <div class="task-price">
                  <span class="price">¥{{ task.price.toFixed(2) }}</span>
                </div>
              </div>
            </template>

            <div class="task-content">
              <div class="task-info">
                <div class="info-item">
                  <el-icon><Box /></el-icon>
                  <span>{{ task.expressCompany }} - {{ task.trackingNumber }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ task.pickupLocation }} → {{ task.deliveryLocation }}</span>
                </div>

                <div class="info-item">
                  <el-icon><Timer /></el-icon>
                  <span>送达：{{ formatTime(task.deliveryTime) }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ task.description }}</span>
                </div>
              </div>

              <div class="task-meta">
                <div class="meta-item">
                  <span>重量：{{ task.weight }}kg</span>
                  <span>尺寸：{{ task.size }}</span>
                </div>
                <div class="meta-item">
                  <span>联系电话：{{ task.contactPhone }}</span>
                </div>
                <div class="meta-item">
                  <span>发布者：{{ task.requesterName || '用户' }}</span>
                </div>
              </div>
            </div>

            <template #footer>
              <div class="task-actions">
                <el-button 
                  type="primary" 
                  size="large"
                  @click="showTaskDetail(task)"
                >
                  查看详情
                </el-button>
                <el-button 
                  type="success" 
                  size="large"
                  @click="handleAcceptTask(task.id)"
                  :loading="acceptingTaskId === task.id"
                  :disabled="task.requesterId === authStore.user?.id"
                >
                  {{ task.requesterId === authStore.user?.id ? '自己的订单' : '立即接单' }}
                </el-button>
              </div>
            </template>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="selectedTask?.title"
      width="600px"
    >
      <div v-if="selectedTask" class="task-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="快递公司">
            {{ selectedTask.expressCompany }}
          </el-descriptions-item>
          <el-descriptions-item label="快递单号">
            {{ selectedTask.trackingNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="物品描述">
            {{ selectedTask.description }}
          </el-descriptions-item>
          <el-descriptions-item label="物品重量">
            {{ selectedTask.weight }}公斤
          </el-descriptions-item>
          <el-descriptions-item label="物品尺寸">
            {{ selectedTask.size }}
          </el-descriptions-item>
          <el-descriptions-item label="取件地点">
            {{ selectedTask.pickupLocation }}
          </el-descriptions-item>
          <el-descriptions-item label="送达地点">
            {{ selectedTask.deliveryLocation }}
          </el-descriptions-item>

          <el-descriptions-item label="送达时间">
            {{ formatTime(selectedTask.deliveryTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ selectedTask.contactPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="取件码">
            {{ selectedTask.pickupCode || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="任务费用">
            <span class="detail-price">¥{{ selectedTask.price.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="发布者">
            {{ selectedTask.requesterName || '用户' }}
          </el-descriptions-item>
          <el-descriptions-item label="发布者">
            {{ selectedTask.requesterName || '用户' }}
          </el-descriptions-item>
          <el-descriptions-item label="发布者">
            {{ selectedTask.requesterName || '用户' }}
          </el-descriptions-item>
          <el-descriptions-item label="发布者">
            {{ selectedTask.requesterName || '用户' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleAcceptTask(selectedTask?.id)"
          :loading="acceptingTaskId === selectedTask?.id"
          :disabled="selectedTask?.requesterId === authStore.user?.id"
        >
          {{ selectedTask?.requesterId === authStore.user?.id ? '自己的订单' : '确认接单' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<!-- 任务大厅页面已成功上传到GitHub仓库 - 最后更新时间: 2025-11-07 -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '../stores/order'
import { useAuthStore } from '../stores/auth'
import type { Order } from '../stores/order'
import {
  Search,
  Refresh,
  Box,
  Location,
  Clock,
  Timer,
  Document,
  ArrowLeft
} from '@element-plus/icons-vue'

const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()

// 搜索和筛选
const searchKeyword = ref('')
const filterCompany = ref('')
const filterSize = ref('')

// 任务相关
const tasks = ref<Order[]>([])
const selectedTask = ref<Order | null>(null)
const detailDialogVisible = ref(false)
const acceptingTaskId = ref<string | null>(null)
const loading = ref(true)

// 过滤后的任务列表
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    // 搜索关键词匹配
    const keywordMatch = !searchKeyword.value || 
      task.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      task.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    
    // 快递公司筛选
    const companyMatch = !filterCompany.value || task.expressCompany === filterCompany.value
    
    // 物品尺寸筛选
    const sizeMatch = !filterSize.value || task.size === filterSize.value
    
    return keywordMatch && companyMatch && sizeMatch
  })
})

// 格式化时间
const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 返回
const goBack = () => {
  router.push('/home')
}

// 刷新任务列表
const refreshTasks = async () => {
  try {
    loading.value = true
    const pendingOrders = await orderStore.getPendingOrders()
    
    if (Array.isArray(pendingOrders)) {
      tasks.value = pendingOrders
      if (pendingOrders.length > 0) {
        ElMessage.success(`已加载 ${pendingOrders.length} 个待接单任务`)
      } else {
        ElMessage.info('暂无待接单任务')
      }
    } else {
      tasks.value = []
      ElMessage.warning('获取任务列表失败，请检查网络连接')
    }
  } catch (error) {
    console.error('刷新任务列表失败:', error)
    ElMessage.error('刷新任务列表失败，请稍后重试')
    // 使用模拟数据作为备用
    tasks.value = []
  } finally {
    loading.value = false
  }
}

// 显示任务详情
const showTaskDetail = (task: Order) => {
  selectedTask.value = task
  detailDialogVisible.value = true
}

// 接单处理
const handleAcceptTask = async (taskId?: string) => {
  if (!taskId) return
  
  try {
    acceptingTaskId.value = taskId
    
    // 找到对应的任务
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) {
      ElMessage.error('任务不存在')
      return
    }
    
    // 检查是否是自己的订单
    if (task.requesterId === authStore.user?.id) {
      ElMessage.error('不能接取自己的订单')
      return
    }
    
    await ElMessageBox.confirm('确定要接取这个任务吗？', '确认接单', {
      confirmButtonText: '确定接单',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.acceptOrder(taskId)
    
    ElMessage.success('接单成功！请及时联系用户并完成取件')
    detailDialogVisible.value = false
    refreshTasks()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '接单失败')
    }
  } finally {
    acceptingTaskId.value = null
  }
}

// 初始化加载任务列表
onMounted(async () => {
  await refreshTasks()
})
</script>

<style scoped>
.task-hall-container {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #0a0a2a 0%, 
    #1a1a4a 25%, 
    #2a2a6a 50%, 
    #3a3a8a 75%, 
    #4a4aaa 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* 真实星空背景 - 深蓝色夜空 */
.task-hall-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    #0a0a2a 0%, 
    #1a1a4a 25%, 
    #2a2a6a 50%, 
    #3a3a8a 75%, 
    #4a4aaa 100%
  );
  z-index: 0;
}

/* 真实星空效果 - 使用重复背景图案创建繁星效果 */
.task-hall-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    /* 银河效果 */
    radial-gradient(ellipse at 50% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(255, 255, 255, 0.03) 0%, transparent 40%),
    
    /* 密集的星星背景 - 使用重复图案 */
    radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle, rgba(255, 255, 255, 0.6) 2px, transparent 2px),
    radial-gradient(circle, rgba(255, 255, 255, 0.4) 3px, transparent 3px);
  background-size: 
    100% 100%, 100% 100%, 
    100px 100px, 150px 150px, 200px 200px;
  background-repeat: repeat;
  animation: starTwinkle 8s ease-in-out infinite;
  z-index: 0;
}

/* 星座效果 - 使用额外的伪元素创建明显的星座图案 */
.task-hall-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    /* 北斗七星 - 勺子形状，特别明亮 */
    radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 1) 4px, transparent 4px),
    radial-gradient(circle at 20% 22%, rgba(255, 255, 255, 0.9) 3px, transparent 3px),
    radial-gradient(circle at 25% 19%, rgba(255, 255, 255, 1) 4px, transparent 4px),
    radial-gradient(circle at 30% 16%, rgba(255, 255, 255, 0.9) 3px, transparent 3px),
    radial-gradient(circle at 35% 13%, rgba(255, 255, 255, 1) 4px, transparent 4px),
    radial-gradient(circle at 40% 10%, rgba(255, 255, 255, 0.9) 3px, transparent 3px),
    radial-gradient(circle at 45% 7%, rgba(255, 255, 255, 1) 4px, transparent 4px),
    
    /* 猎户座 - 腰带三颗星特别明亮 */
    radial-gradient(circle at 70% 35%, rgba(255, 255, 255, 1) 5px, transparent 5px),
    radial-gradient(circle at 73% 40%, rgba(255, 255, 255, 1) 5px, transparent 5px),
    radial-gradient(circle at 76% 45%, rgba(255, 255, 255, 1) 5px, transparent 5px),
    radial-gradient(circle at 79% 50%, rgba(255, 255, 255, 0.9) 3px, transparent 3px),
    radial-gradient(circle at 82% 55%, rgba(255, 255, 255, 0.9) 3px, transparent 3px),
    
    /* 仙后座 - W形状 */
    radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 1) 4px, transparent 4px),
    radial-gradient(circle at 82% 25%, rgba(255, 255, 255, 0.9) 3px, transparent 3px),
    radial-gradient(circle at 79% 30%, rgba(255, 255, 255, 1) 4px, transparent 4px),
    radial-gradient(circle at 82% 35%, rgba(255, 255, 255, 0.9) 3px, transparent 3px),
    radial-gradient(circle at 85% 40%, rgba(255, 255, 255, 1) 4px, transparent 4px);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  animation: constellationGlow 15s ease-in-out infinite;
  z-index: 0;
}

@keyframes starTwinkle {
  0%, 100% { 
    opacity: 0.7; 
    filter: brightness(0.8);
  }
  25% { 
    opacity: 0.9; 
    filter: brightness(1.1);
  }
  50% { 
    opacity: 0.8; 
    filter: brightness(0.9);
  }
  75% { 
    opacity: 1; 
    filter: brightness(1.2);
  }
}

@keyframes starDrift {
  0% { 
    background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
  }
  100% { 
    background-position: 0% 0%, 0% 0%, 100% 100%, 150% 150%, 200% 200%;
  }
}

@keyframes constellationGlow {
  0%, 100% { 
    opacity: 0.6;
    filter: blur(0px);
  }
  50% { 
    opacity: 0.9;
    filter: blur(1px);
  }
}

.page-header {
  background: linear-gradient(135deg, 
    rgba(20, 20, 40, 0.9) 0%, 
    rgba(30, 30, 60, 0.8) 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(100, 100, 255, 0.3);
  border: 1px solid rgba(100, 100, 255, 0.3);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #7B68EE, #9370DB);
  border-radius: 16px 16px 0 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 返回按钮样式 */
:deep(.back-btn) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  backdrop-filter: blur(10px);
}

:deep(.back-btn:hover) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.header-title h1 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-title p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.header-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #FF7E82;
  margin-bottom: 4px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.task-hall-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.filter-section {
  background: linear-gradient(135deg, 
    rgba(20, 20, 40, 0.9) 0%, 
    rgba(30, 30, 60, 0.8) 100%);
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(100, 100, 255, 0.3);
  border: 1px solid rgba(100, 100, 255, 0.3);
}

.task-list {
  min-height: 500px;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 80px 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
}

.task-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, 
    rgba(40, 40, 80, 0.9) 0%, 
    rgba(60, 60, 100, 0.8) 100%);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 15px rgba(120, 120, 255, 0.2);
  border: 1px solid rgba(120, 120, 255, 0.3);
}

.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #7B68EE, #9370DB);
}

.task-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 
    0 15px 40px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(120, 120, 255, 0.4);
  border-color: rgba(150, 150, 255, 0.5);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px 0;
}

.task-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-title h3 {
  margin: 0;
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.price {
  color: #FF7E82;
  font-size: 24px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.task-content {
  margin-bottom: 20px;
  padding: 0 24px;
}

.task-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.info-item .el-icon {
  color: #4A90E2;
  font-size: 16px;
}

.task-meta {
  background: linear-gradient(135deg, 
    rgba(74, 144, 226, 0.15) 0%, 
    rgba(255, 126, 130, 0.1) 100%);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.meta-item:not(:last-child) {
  margin-bottom: 8px;
}

.task-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 0 24px 20px;
}

.task-detail {
  max-height: 400px;
  overflow-y: auto;
}

.detail-price {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 20px;
}

:deep(.el-card__header) {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

:deep(.el-card__body) {
  padding-top: 0;
}

:deep(.el-descriptions__label) {
  width: 100px;
  font-weight: 600;
}

:deep(.el-button) {
  border-radius: 12px !important;
  font-weight: 600;
  padding: 12px 24px;
  font-size: 14px;
  border: none !important;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4A90E2 0%, #3A7BD5 100%) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.4);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.6);
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #FF7E82 0%, #FF6B6B 100%) !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(255, 126, 130, 0.4);
}

:deep(.el-button--success:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 126, 130, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-stats {
    gap: 20px;
  }
  
  .task-actions {
    flex-direction: column;
  }
}
</style>
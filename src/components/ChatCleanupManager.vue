<template>
  <div class="chat-cleanup-manager">
    <el-card header="聊天记录清理管理" class="cleanup-card">
      <!-- 清理统计 -->
      <div class="stats-section">
        <el-descriptions title="清理统计" :column="2" border>
          <el-descriptions-item label="待清理订单">
            <el-tag type="info">{{ pendingCleanupCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="待清理消息">
            <el-tag type="warning">{{ pendingMessageCount }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="清理保留天数">
            <el-input-number 
              v-model="retentionDays" 
              :min="1" 
              :max="30" 
              size="small"
              @change="refreshStats"
            />
          </el-descriptions-item>
          <el-descriptions-item label="上次清理时间">
            <span>{{ lastCleanupTime || '未清理过' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="actions-section">
        <el-button 
          type="primary" 
          @click="cleanupAll" 
          :loading="cleaning"
          :disabled="pendingCleanupCount === 0"
        >
          <el-icon><Delete /></el-icon>
          清理所有已完成订单 ({{ pendingCleanupCount }}个)
        </el-button>
        
        <el-button 
          type="warning" 
          @click="showPendingList = !showPendingList"
        >
          <el-icon><View /></el-icon>
          查看待清理列表
        </el-button>
      </div>

      <!-- 待清理列表 -->
      <div v-if="showPendingList" class="pending-list-section">
        <el-table 
          :data="pendingCleanupList" 
          stripe 
          size="small"
          v-loading="loading"
        >
          <el-table-column prop="order_title" label="订单标题" min-width="200">
            <template #default="{ row }">
              <el-tooltip :content="row.order_id" placement="top">
                <span>{{ row.order_title }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="order_status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.order_status)">
                {{ getStatusText(row.order_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="order_completed_time" label="完成时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.order_completed_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="message_count" label="消息数量" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.message_count }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
              <el-button 
                type="danger" 
                size="small" 
                @click="cleanupSingle(row.order_id)"
                :loading="cleaningSingle === row.order_id"
              >
                清理
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 清理结果 -->
      <div v-if="cleanupResult" class="result-section">
        <el-alert 
          :title="`清理完成：删除了 ${cleanupResult.deleted_messages} 条消息和 ${cleanupResult.deleted_sessions} 个会话`"
          type="success" 
          :closable="false"
          show-icon
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, View } from '@element-plus/icons-vue'
import { ChatService } from '../services/chatService'

// 响应式数据
const retentionDays = ref(7)
const pendingCleanupList = ref<any[]>([])
const pendingCleanupCount = ref(0)
const pendingMessageCount = ref(0)
const lastCleanupTime = ref('')
const showPendingList = ref(false)
const loading = ref(false)
const cleaning = ref(false)
const cleaningSingle = ref<string>('')
const cleanupResult = ref<any>(null)

// 生命周期
onMounted(() => {
  refreshStats()
})

// 刷新统计信息
const refreshStats = async () => {
  try {
    loading.value = true
    
    // 获取已完成订单的聊天记录
    const result = await ChatService.getCompletedOrderChats()
    
    if (result.success && result.data) {
      pendingCleanupList.value = result.data
      pendingCleanupCount.value = result.data.length
      pendingMessageCount.value = result.data.reduce((sum: number, item: any) => sum + (item.message_count || 0), 0)
    }
  } catch (error) {
    console.error('获取清理统计失败:', error)
    ElMessage.error('获取清理统计失败')
  } finally {
    loading.value = false
  }
}

// 清理所有完成订单
const cleanupAll = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要清理所有完成超过 ${retentionDays.value} 天的订单聊天记录吗？\n这将删除 ${pendingMessageCount.value} 条消息。`,
      '确认清理',
      {
        confirmButtonText: '确定清理',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    cleaning.value = true
    cleanupResult.value = null
    
    const result = await ChatService.manualCleanupChatMessages(null, retentionDays.value)
    
    if (result.success && result.data) {
      cleanupResult.value = result.data
      ElMessage.success(`清理完成：删除了 ${result.data.deleted_messages} 条消息`)
      await refreshStats()
      lastCleanupTime.value = new Date().toLocaleString('zh-CN')
    } else {
      ElMessage.error(result.error || '清理失败')
    }
  } catch (error) {
    console.error('清理失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('清理失败')
    }
  } finally {
    cleaning.value = false
  }
}

// 清理单个订单
const cleanupSingle = async (orderId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要清理这个订单的聊天记录吗？',
      '确认清理',
      {
        confirmButtonText: '确定清理',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    cleaningSingle.value = orderId
    
    const result = await ChatService.manualCleanupChatMessages(orderId)
    
    if (result.success && result.data) {
      ElMessage.success(`清理完成：删除了 ${result.data.deleted_messages} 条消息`)
      await refreshStats()
    } else {
      ElMessage.error(result.error || '清理失败')
    }
  } catch (error) {
    console.error('清理失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('清理失败')
    }
  } finally {
    cleaningSingle.value = ''
  }
}

// 工具函数
const getStatusType = (status: string) => {
  const types: any = {
    'completed': 'success',
    'cancelled': 'danger',
    'failed': 'warning',
    'pending': 'info',
    'accepted': 'primary'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: any = {
    'completed': '已完成',
    'cancelled': '已取消',
    'failed': '已失败',
    'pending': '待处理',
    'accepted': '已接单'
  }
  return texts[status] || status
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  return new Date(timeStr).toLocaleString('zh-CN')
}
</script>

<style scoped>
.chat-cleanup-manager {
  max-width: 1000px;
  margin: 20px auto;
}

.cleanup-card {
  margin: 20px;
}

.stats-section {
  margin-bottom: 20px;
}

.actions-section {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pending-list-section {
  margin-top: 20px;
}

.result-section {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .chat-cleanup-manager {
    margin: 10px;
  }
  
  .cleanup-card {
    margin: 10px;
  }
  
  .actions-section {
    flex-direction: column;
  }
}
</style>
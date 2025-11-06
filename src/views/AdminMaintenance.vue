<template>
  <div class="admin-maintenance">
    <div class="page-header">
      <h2>系统维护</h2>
      <p>管理系统维护操作和日志</p>
    </div>

    <!-- 维护操作卡片 -->
    <div class="maintenance-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="6">
          <div class="maintenance-card" @click="executeMaintenance('clear_cache')">
            <div class="card-icon">
              <el-icon><Delete /></el-icon>
            </div>
            <div class="card-content">
              <h3>清理缓存</h3>
              <p>清理系统缓存数据，提升系统性能</p>
            </div>
            <div class="card-status" :class="{ running: isRunning('clear_cache') }">
              {{ getStatusText('clear_cache') }}
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="6">
          <div class="maintenance-card" @click="executeMaintenance('export_data')">
            <div class="card-icon">
              <el-icon><Download /></el-icon>
            </div>
            <div class="card-content">
              <h3>导出数据</h3>
              <p>导出系统数据备份</p>
            </div>
            <div class="card-status" :class="{ running: isRunning('export_data') }">
              {{ getStatusText('export_data') }}
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="6">
          <div class="maintenance-card" @click="executeMaintenance('restart_system')">
            <div class="card-icon">
              <el-icon><Refresh /></el-icon>
            </div>
            <div class="card-content">
              <h3>重启系统</h3>
              <p>重启系统服务</p>
            </div>
            <div class="card-status" :class="{ running: isRunning('restart_system') }">
              {{ getStatusText('restart_system') }}
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="6">
          <div class="maintenance-card" @click="executeMaintenance('display_info')">
            <div class="card-icon">
              <el-icon><InfoFilled /></el-icon>
            </div>
            <div class="card-content">
              <h3>系统信息</h3>
              <p>查看系统运行状态信息</p>
            </div>
            <div class="card-status" :class="{ running: isRunning('display_info') }">
              {{ getStatusText('display_info') }}
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 维护日志 -->
    <div class="maintenance-logs">
      <el-card>
        <template #header>
          <div class="log-header">
            <h3>维护日志</h3>
            <div class="log-actions">
              <el-button @click="refreshLogs" :loading="loading">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
              <el-button @click="clearLogs" type="danger" plain>
                <el-icon><Delete /></el-icon>
                清空日志
              </el-button>
            </div>
          </div>
        </template>

        <el-table :data="logs" v-loading="loading" style="width: 100%">
          <el-table-column prop="action" label="操作类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getActionType(row.action)">
                {{ getActionText(row.action) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="user_id" label="操作人" width="120">
            <template #default="{ row }">
              {{ row.user_id ? '管理员' : '系统' }}
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" @click="viewLogDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="日志详情" width="600px">
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getActionType(currentLog.action)">
              {{ getActionText(currentLog.action) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作描述">{{ currentLog.description }}</el-descriptions-item>
          <el-descriptions-item label="操作状态">
            <el-tag :type="getStatusType(currentLog.status)">
              {{ getStatusText(currentLog.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentLog.user_id ? '管理员' : '系统' }}</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ formatDate(currentLog.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(currentLog.updated_at) }}</el-descriptions-item>
          <el-descriptions-item label="元数据" v-if="currentLog.metadata">
            <pre>{{ JSON.stringify(currentLog.metadata, null, 2) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Download, Refresh, InfoFilled } from '@element-plus/icons-vue'
import { SystemMaintenanceService, type SystemLog } from '../services/systemMaintenanceService'

// 维护操作状态
const runningOperations = ref<Set<string>>(new Set())

// 日志数据
const logs = ref<SystemLog[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 日志详情
const detailDialogVisible = ref(false)
const currentLog = ref<SystemLog | null>(null)

// 检查操作是否正在运行
const isRunning = (operation: string) => runningOperations.value.has(operation)

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '等待中',
    running: '运行中',
    success: '成功',
    failed: '失败',
    completed: '已完成'
  }
  return statusMap[status] || status
}

// 获取操作类型对应的标签类型
const getActionType = (action: string) => {
  const typeMap: Record<string, string> = {
    clear_cache: 'warning',
    export_data: 'success',
    restart_system: 'danger',
    display_info: 'info'
  }
  return typeMap[action] || 'info'
}

// 获取操作文本
const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    clear_cache: '清理缓存',
    export_data: '导出数据',
    restart_system: '重启系统',
    display_info: '系统信息'
  }
  return textMap[action] || action
}

// 获取状态类型对应的标签类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'info',
    running: 'warning',
    success: 'success',
    failed: 'danger',
    completed: 'success'
  }
  return typeMap[status] || 'info'
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 执行维护操作
const executeMaintenance = async (operation: string) => {
  if (runningOperations.value.has(operation)) {
    ElMessage.warning('该操作正在执行中，请稍候')
    return
  }

  try {
    runningOperations.value.add(operation)
    
    const descriptions: Record<string, string> = {
      clear_cache: '清理系统缓存数据',
      export_data: '导出系统数据备份',
      restart_system: '重启系统服务',
      display_info: '查看系统运行状态信息'
    }

    const result = await SystemMaintenanceService.executeMaintenance(operation, descriptions[operation])
    
    if (result) {
      ElMessage.success('维护操作执行成功')
      await refreshLogs()
    } else {
      ElMessage.error('维护操作执行失败')
    }
  } catch (error) {
    console.error('执行维护操作失败:', error)
    ElMessage.error('执行维护操作失败')
  } finally {
    runningOperations.value.delete(operation)
  }
}

// 刷新日志
const refreshLogs = async () => {
  try {
    loading.value = true
    const result = await SystemMaintenanceService.getLogs(currentPage.value, pageSize.value)
    logs.value = result.data
    total.value = result.total
  } catch (error) {
    console.error('获取维护日志失败:', error)
    ElMessage.error('获取维护日志失败')
  } finally {
    loading.value = false
  }
}

// 清空日志
const clearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有维护日志吗？此操作不可恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const success = await SystemMaintenanceService.clearLogs()
    if (success) {
      ElMessage.success('日志清空成功')
      await refreshLogs()
    } else {
      ElMessage.error('日志清空失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空日志失败:', error)
      ElMessage.error('清空日志失败')
    }
  }
}

// 查看日志详情
const viewLogDetail = (log: SystemLog) => {
  currentLog.value = log
  detailDialogVisible.value = true
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  refreshLogs()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  refreshLogs()
}

onMounted(() => {
  refreshLogs()
})
</script>

<style scoped>
.admin-maintenance {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.maintenance-cards {
  margin-bottom: 24px;
}

.maintenance-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
}

.maintenance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #3b82f6;
}

.maintenance-card.running {
  border-color: #f59e0b;
}

.card-icon {
  text-align: center;
  margin-bottom: 12px;
}

.card-icon .el-icon {
  font-size: 32px;
  color: #3b82f6;
}

.card-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.card-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
  line-height: 1.4;
}

.card-status {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
}

.card-status.running {
  background: #fef3c7;
  color: #d97706;
}

.maintenance-logs {
  margin-top: 24px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.log-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.log-detail pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
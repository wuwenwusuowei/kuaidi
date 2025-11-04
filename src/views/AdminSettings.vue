<template>
  <div class="admin-settings">
    <div class="page-header">
      <h2>系统设置</h2>
      <p>管理系统基本配置和参数</p>
    </div>

    <!-- 系统配置卡片 -->
    <div class="settings-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="12">
          <div class="setting-card">
            <div class="card-header">
              <h3>基本设置</h3>
            </div>
            <div class="card-content">
              <el-form :model="basicSettings" label-width="120px">
                <el-form-item label="平台名称">
                  <el-input v-model="basicSettings.platformName" placeholder="请输入平台名称" />
                </el-form-item>
                <el-form-item label="平台描述">
                  <el-input 
                    v-model="basicSettings.platformDescription" 
                    type="textarea" 
                    :rows="3"
                    placeholder="请输入平台描述" 
                  />
                </el-form-item>
                <el-form-item label="客服电话">
                  <el-input v-model="basicSettings.customerServicePhone" placeholder="请输入客服电话" />
                </el-form-item>
                <el-form-item label="客服邮箱">
                  <el-input v-model="basicSettings.customerServiceEmail" placeholder="请输入客服邮箱" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveBasicSettings" :loading="saving">
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="12">
          <div class="setting-card">
            <div class="card-header">
              <h3>订单设置</h3>
            </div>
            <div class="card-content">
              <el-form :model="orderSettings" label-width="120px">
                <el-form-item label="自动取消时间">
                  <el-input-number 
                    v-model="orderSettings.autoCancelMinutes" 
                    :min="10" 
                    :max="1440" 
                    controls-position="right"
                  />
                  <span style="margin-left: 8px">分钟</span>
                </el-form-item>
                <el-form-item label="自动完成时间">
                  <el-input-number 
                    v-model="orderSettings.autoCompleteHours" 
                    :min="1" 
                    :max="168" 
                    controls-position="right"
                  />
                  <span style="margin-left: 8px">小时</span>
                </el-form-item>
                <el-form-item label="最大订单金额">
                  <el-input-number 
                    v-model="orderSettings.maxOrderAmount" 
                    :min="0" 
                    :max="10000" 
                    :precision="2"
                    controls-position="right"
                  />
                  <span style="margin-left: 8px">元</span>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveOrderSettings" :loading="saving">
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <el-col :xs="24" :lg="12">
          <div class="setting-card">
            <div class="card-header">
              <h3>通知设置</h3>
            </div>
            <div class="card-content">
              <el-form :model="notificationSettings" label-width="120px">
                <el-form-item label="新订单通知">
                  <el-switch v-model="notificationSettings.newOrderNotification" />
                </el-form-item>
                <el-form-item label="订单完成通知">
                  <el-switch v-model="notificationSettings.orderCompleteNotification" />
                </el-form-item>
                <el-form-item label="系统公告">
                  <el-switch v-model="notificationSettings.systemAnnouncement" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveNotificationSettings" :loading="saving">
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="12">
          <div class="setting-card">
            <div class="card-header">
              <h3>系统维护</h3>
            </div>
            <div class="card-content">
              <div class="maintenance-actions">
                <el-button type="warning" @click="clearCache" :loading="maintenanceLoading">
                  清除缓存
                </el-button>
                <el-button type="info" @click="exportData" :loading="maintenanceLoading">
                  导出数据
                </el-button>
                <el-button type="danger" @click="systemRestart" :loading="maintenanceLoading">
                  系统重启
                </el-button>
              </div>
              
              <div class="system-info" style="margin-top: 20px">
                <h4>系统信息</h4>
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item label="版本号">v1.0.0</el-descriptions-item>
                  <el-descriptions-item label="最后启动">{{ systemInfo.lastStartup }}</el-descriptions-item>
                  <el-descriptions-item label="运行时间">{{ systemInfo.uptime }}</el-descriptions-item>
                  <el-descriptions-item label="数据库">正常</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const saving = ref(false)
const maintenanceLoading = ref(false)

// 基本设置
const basicSettings = reactive({
  platformName: '校园快递代领平台',
  platformDescription: '专业的校园快递代领服务平台',
  customerServicePhone: '400-123-4567',
  customerServiceEmail: 'service@campus-express.com'
})

// 订单设置
const orderSettings = reactive({
  autoCancelMinutes: 30,
  autoCompleteHours: 24,
  maxOrderAmount: 500
})

// 通知设置
const notificationSettings = reactive({
  newOrderNotification: true,
  orderCompleteNotification: true,
  systemAnnouncement: true
})

// 系统信息
const systemInfo = reactive({
  lastStartup: new Date().toLocaleString('zh-CN'),
  uptime: '1天2小时30分钟'
})

// 保存基本设置
const saveBasicSettings = async () => {
  try {
    saving.value = true
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('基本设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 保存订单设置
const saveOrderSettings = async () => {
  try {
    saving.value = true
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('订单设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 保存通知设置
const saveNotificationSettings = async () => {
  try {
    saving.value = true
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('通知设置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 清除缓存
const clearCache = async () => {
  try {
    await ElMessageBox.confirm('确定要清除系统缓存吗？', '提示', {
      type: 'warning'
    })
    
    maintenanceLoading.value = true
    // 模拟清除缓存操作
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('缓存清除成功')
  } catch {
    // 用户取消
  } finally {
    maintenanceLoading.value = false
  }
}

// 导出数据
const exportData = async () => {
  try {
    maintenanceLoading.value = true
    // 模拟导出操作
    await new Promise(resolve => setTimeout(resolve, 3000))
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    maintenanceLoading.value = false
  }
}

// 系统重启
const systemRestart = async () => {
  try {
    await ElMessageBox.confirm('确定要重启系统吗？重启期间服务将不可用。', '警告', {
      type: 'warning',
      confirmButtonText: '确定重启',
      cancelButtonText: '取消'
    })
    
    maintenanceLoading.value = true
    // 模拟重启操作
    await new Promise(resolve => setTimeout(resolve, 5000))
    ElMessage.success('系统重启成功')
  } catch {
    // 用户取消
  } finally {
    maintenanceLoading.value = false
  }
}

onMounted(() => {
  // 加载设置数据
  loadSettings()
})

const loadSettings = () => {
  // 模拟加载设置数据
  console.log('加载系统设置')
}
</script>

<style scoped>
.admin-settings {
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

.settings-cards {
  margin-bottom: 24px;
}

.setting-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.card-content {
  padding: 20px;
}

.maintenance-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.system-info h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
</style>
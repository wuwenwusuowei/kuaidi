<template>
  <div class="admin-settings">
    <div class="page-header">
      <h2>系统设置</h2>
      <p>管理系统基本配置</p>
    </div>

    <!-- 基本设置卡片 -->
    <div class="settings-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="8">
          <div class="setting-card">
            <div class="card-header">
              <h3>基本设置</h3>
            </div>
            <div class="card-content">
              <el-form :model="basicSettings" label-width="120px">
                <el-form-item label="客服电话">
                  <el-input v-model="basicSettings.customerServicePhone" placeholder="请输入客服电话" />
                </el-form-item>
                <el-form-item label="客服邮箱">
                  <el-input v-model="basicSettings.customerServiceEmail" placeholder="请输入客服邮箱" />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="8">
          <div class="setting-card">
            <div class="card-header">
              <h3>订单设置</h3>
            </div>
            <div class="card-content">
              <el-form :model="basicSettings" label-width="140px">
                <el-form-item label="自动取消时间">
                  <el-input-number v-model="basicSettings.orderAutoCancelMinutes" :min="10" :max="1440" />
                  <span style="margin-left: 8px;">分钟</span>
                </el-form-item>
                <el-form-item label="最大订单金额">
                  <el-input-number v-model="basicSettings.maxOrderAmount" :min="10" :max="500" :precision="2" />
                  <span style="margin-left: 8px;">元</span>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :lg="8">
          <div class="setting-card">
            <div class="card-header">
              <h3>系统日志设置</h3>
            </div>
            <div class="card-content">
              <el-form :model="basicSettings" label-width="120px">
                <el-form-item label="日志保留天数">
                  <el-input-number v-model="basicSettings.logRetentionDays" :min="7" :max="365" />
                  <span style="margin-left: 8px;">天</span>
                </el-form-item>
                <el-form-item label="启用操作日志">
                  <el-switch v-model="basicSettings.enableOperationLog" />
                </el-form-item>
                <el-form-item label="启用错误日志">
                  <el-switch v-model="basicSettings.enableErrorLog" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveBasicSettings" :loading="saving" style="width: 100%;">
                    保存所有设置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 设置说明 -->
    <div class="settings-info-card">
      <el-card>
        <template #header>
          <h3>设置说明</h3>
        </template>
        <div class="settings-info">
          <p><strong>基本设置：</strong>客服电话和邮箱信息将显示在帮助页面中。</p>
          <p><strong>订单设置：</strong>自动取消时间指订单无人接单后自动取消的时间。</p>
          <p><strong>系统日志设置：</strong>日志保留天数控制日志的存储时长；操作日志记录用户操作行为；错误日志记录系统异常信息。</p>
          <p><strong>保存设置后</strong>，所有相关功能将立即生效。</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { SystemSettingsService, type SystemSettings } from '../services/systemSettingsService'

const saving = ref(false)

// 基本设置
const basicSettings = reactive({
  // 基本设置
  customerServicePhone: '400-123-4567',
  customerServiceEmail: 'service@campus-express.com',
  
  // 订单设置
  orderAutoCancelMinutes: 30,
  maxOrderAmount: 50.00,
  
  // 系统日志设置
  logRetentionDays: 30,
  enableOperationLog: true,
  enableErrorLog: true
})

// 保存基本设置
const saveBasicSettings = async () => {
  try {
    saving.value = true
    
    // 验证输入
    if (!basicSettings.customerServicePhone || !basicSettings.customerServiceEmail) {
      ElMessage.error('客服电话和邮箱不能为空')
      return
    }
    
    if (basicSettings.orderAutoCancelMinutes <= 0) {
      ElMessage.error('自动取消时间必须大于0')
      return
    }
    
    if (basicSettings.maxOrderAmount <= 0) {
      ElMessage.error('最大订单金额必须大于0')
      return
    }
    
    if (basicSettings.logRetentionDays < 7 || basicSettings.logRetentionDays > 365) {
      ElMessage.error('日志保留天数必须在7到365天之间')
      return
    }
    
    // 使用系统设置服务保存所有设置
    const settings: SystemSettings = {
      customerServicePhone: basicSettings.customerServicePhone,
      customerServiceEmail: basicSettings.customerServiceEmail,
      orderAutoCancelMinutes: basicSettings.orderAutoCancelMinutes,
      maxOrderAmount: basicSettings.maxOrderAmount,
      logRetentionDays: basicSettings.logRetentionDays,
      enableOperationLog: basicSettings.enableOperationLog,
      enableErrorLog: basicSettings.enableErrorLog
    }
    
    const success = await SystemSettingsService.saveSettings(settings)
    
    if (success) {
      ElMessage.success('系统设置保存成功')
    } else {
      ElMessage.error('保存失败，请重试')
    }
  } catch (error) {
    console.error('保存系统设置异常:', error)
    ElMessage.error('保存失败，请检查网络连接')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // 加载设置数据
  loadSettings()
})

const loadSettings = async () => {
  try {
    // 使用系统设置服务加载所有设置
    const settings = await SystemSettingsService.getSettings()
    
    // 更新表单数据
    basicSettings.customerServicePhone = settings.customerServicePhone
    basicSettings.customerServiceEmail = settings.customerServiceEmail
    basicSettings.orderAutoCancelMinutes = settings.orderAutoCancelMinutes
    basicSettings.maxOrderAmount = settings.maxOrderAmount
    basicSettings.logRetentionDays = settings.logRetentionDays
    basicSettings.enableOperationLog = settings.enableOperationLog
    basicSettings.enableErrorLog = settings.enableErrorLog
  } catch (error) {
    console.error('加载系统设置失败:', error)
    ElMessage.warning('加载系统设置失败，使用默认值')
  }
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

.settings-info p {
  margin: 8px 0;
  color: #666;
  line-height: 1.5;
}

.settings-info-card {
  margin-top: 24px;
}

.settings-info-card .el-card__header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.settings-info-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.settings-info-card {
  margin-top: 24px;
}

.settings-info-card .el-card__header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.settings-info-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.settings-info-card {
  margin-top: 24px;
}

.settings-info-card .el-card__header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.settings-info-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.settings-info-card {
  margin-top: 24px;
}

.settings-info-card .el-card__header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.settings-info-card h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
</style>
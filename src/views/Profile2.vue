<template>
  <div class="profile-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="left-section">
          <el-button 
            type="primary" 
            :icon="ArrowLeft" 
            @click="goBack" 
            size="default"
            class="back-btn"
            plain
          >
            返回
          </el-button>
          <div class="logo">
            <h2>校园快递代领平台</h2>
          </div>
        </div>
        <div class="user-info">
          <el-dropdown>
            <span class="user-dropdown">
              <el-avatar :size="32" :src="authStore.user?.avatar" class="user-avatar">
                {{ authStore.user?.nickname?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ authStore.user?.nickname }}</span>
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToHome">
                  <el-icon><House /></el-icon>
                  返回首页
                </el-dropdown-item>
                <el-dropdown-item @click="goToPaymentSettings">
                  <el-icon><CreditCard /></el-icon>
                  支付设置
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <!-- Redesigned layout with modern card-based design and professional styling -->
      <div class="profile-wrapper">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1 class="page-title">个人中心</h1>
          <p class="page-subtitle">管理您的个人信息和账户设置</p>
        </div>

        <!-- 用户信息卡片 -->
        <div class="profile-card info-card">
          <div class="card-header-section">
            <div class="card-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="card-title-section">
              <h2 class="card-title">基本信息</h2>
              <p class="card-subtitle">查看您的账户基本信息</p>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">用户名</span>
              <span class="info-value">{{ authStore.user?.username }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">昵称</span>
              <span class="info-value">{{ authStore.user?.nickname }}</span>
            </div>
          </div>
        </div>

        <!-- 修改昵称卡片 -->
        <div class="profile-card edit-card">
          <div class="card-header-section">
            <div class="card-icon edit-icon">
              <el-icon><Edit /></el-icon>
            </div>
            <div class="card-title-section">
              <h2 class="card-title">修改昵称</h2>
              <p class="card-subtitle">更新您的昵称以供其他用户显示</p>
            </div>
          </div>

          <el-form :model="nicknameForm" :rules="nicknameRules" ref="nicknameFormRef" label-width="auto" class="form-content">
            <el-form-item label="新昵称" prop="nickname">
              <el-input 
                v-model="nicknameForm.nickname" 
                placeholder="请输入新昵称（2-20个字符）"
                clearable
                maxlength="20"
              />
            </el-form-item>
            <div class="form-actions">
              <el-button type="primary" @click="updateNickname" :loading="nicknameLoading" class="action-btn">
                保存昵称
              </el-button>
              <el-button @click="resetNickname" class="action-btn secondary">
                取消
              </el-button>
            </div>
          </el-form>
        </div>

        <!-- 修改密码卡片 -->
        <div class="profile-card edit-card">
          <div class="card-header-section">
            <div class="card-icon password-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="card-title-section">
              <h2 class="card-title">修改密码</h2>
              <p class="card-subtitle">定期修改密码以保护您的账户安全</p>
            </div>
          </div>

          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="auto" class="form-content">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                placeholder="请输入新密码（6-20个字符）"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
            <div class="form-actions">
              <el-button type="primary" @click="updatePassword" :loading="passwordLoading" class="action-btn">
                更新密码
              </el-button>
              <el-button @click="resetPassword" class="action-btn secondary">
                取消
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { ArrowDown, User, Edit, Lock, ArrowLeft, House, CreditCard, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 修改昵称表单
const nicknameFormRef = ref()
const nicknameForm = reactive({
  nickname: authStore.user?.nickname || ''
})
const nicknameLoading = ref(false)

// 修改密码表单
const passwordFormRef = ref()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)

// 昵称验证规则
const nicknameRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 密码验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 修改昵称
const updateNickname = async () => {
  try {
    await nicknameFormRef.value.validate()
    
    nicknameLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户信息
    authStore.updateUserInfo({
      nickname: nicknameForm.nickname
    })
    
    ElMessage.success('昵称修改成功')
    nicknameFormRef.value.resetFields()
  } catch (error) {
    console.error('修改昵称失败:', error)
  } finally {
    nicknameLoading.value = false
  }
}

// 修改密码
const updatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    
    passwordLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 这里应该调用实际的修改密码API
    ElMessage.success('密码修改成功')
    passwordFormRef.value.resetFields()
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

// 返回首页
const goToHome = () => {
  router.push('/home')
}

// 导航到支付设置
const goToPaymentSettings = () => {
  router.push('/payment-settings')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    authStore.logout()
    ElMessage.success('退出成功')
    router.push('/')
  } catch {
    // 用户取消操作
  }
}

const resetNickname = () => {
  nicknameFormRef.value.resetFields()
}

const resetPassword = () => {
  passwordFormRef.value.resetFields()
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.header {
  background: white;
  border-bottom: 1px solid #e4e7eb;
  padding: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  height: 64px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
}

.logo h2 {
  color: #0052cc;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #4A90E2;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  transform: translateY(-1px);
}

.user-avatar {
  background: linear-gradient(135deg, #4A90E2, #FF7E82) !important;
  color: white !important;
  font-weight: 600;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.main-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 20px;
}

.profile-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 页面标题样式 */
.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #0a0e27;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 16px;
  color: #8c92a0;
  margin: 0;
}

/* 卡片样式 */
.profile-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.profile-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e8e8e8;
}

.card-header-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.card-icon.edit-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-icon.password-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.card-title-section {
  flex: 1;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #0a0e27;
  margin: 0 0 4px 0;
}

.card-subtitle {
  font-size: 14px;
  color: #8c92a0;
  margin: 0;
}

/* 信息展示网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 14px;
  color: #8c92a0;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #0a0e27;
  font-weight: 600;
}

/* 表单样式 */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

:deep(.el-form-item__label) {
  color: #595959 !important;
  font-weight: 600;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.action-btn {
  flex: 1;
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
}

:deep(.action-btn.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

:deep(.action-btn.el-button--primary:hover) {
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

:deep(.action-btn.secondary) {
  background: #f5f7fa;
  color: #595959;
}

:deep(.action-btn.secondary:hover) {
  background: #eaeef2;
  color: #0a0e27;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 20px;
  }

  .main-content {
    padding: 40px 16px;
  }

  .profile-card {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>

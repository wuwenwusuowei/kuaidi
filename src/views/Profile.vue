<template>
  <div class="profile-container">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <h2>校园快递代领平台</h2>
        </div>
        <div class="user-info">
          <el-dropdown>
            <span class="user-dropdown">
              <span class="username">{{ authStore.user?.nickname }}</span>
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToHome">返回首页</el-dropdown-item>
                <el-dropdown-item @click="goToPaymentSettings">支付设置</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <div class="profile-card">
        <h2 class="profile-title">个人中心</h2>
        
        <!-- 用户信息展示 -->
        <div class="user-info-section">
          <h3>基本信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ authStore.user?.username }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ authStore.user?.nickname }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 修改昵称 -->
        <div class="edit-section">
          <h3>修改昵称</h3>
          <el-form :model="nicknameForm" :rules="nicknameRules" ref="nicknameFormRef" label-width="80px">
            <el-form-item label="新昵称" prop="nickname">
              <el-input v-model="nicknameForm.nickname" placeholder="请输入新昵称" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateNickname" :loading="nicknameLoading">
                修改昵称
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 修改密码 -->
        <div class="edit-section">
          <h3>修改密码</h3>
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="80px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updatePassword" :loading="passwordLoading">
                修改密码
              </el-button>
            </el-form-item>
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
import { ArrowDown } from '@element-plus/icons-vue'

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
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: var(--bg-light);
}

.header {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
}

.logo h2 {
  color: var(--primary-color);
  margin: 0;
  font-weight: 600;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: var(--bg-light);
}

.username {
  font-weight: 500;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.user-info-section {
  margin-bottom: 40px;
}

.user-info-section h3 {
  margin-bottom: 16px;
  color: #333;
  font-size: 18px;
}

.edit-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.edit-section h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}
</style>
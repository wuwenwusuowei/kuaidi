<template>
  <div class="login-container">
    <!-- 校园风格背景装饰 -->
    <div class="campus-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>
    
    <div class="login-card">
      <!-- 品牌LOGO区域 -->
      <div class="brand-section">
        <div class="brand-logo">
          <div class="logo-icon">🚀</div>
          <h1 class="brand-title">校园快跑</h1>
        </div>
        <p class="brand-subtitle">Campus Express Runner</p>
      </div>

      <!-- 登录注册切换 -->
      <div class="login-tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          登录
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          注册
        </button>
      </div>

      <!-- 登录表单 -->
      <div v-if="activeTab === 'login'" class="form-container">
        <el-form 
          :model="loginForm" 
          :rules="loginRules" 
          ref="loginFormRef"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-button 
            type="primary" 
            size="large" 
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form>
      </div>

      <!-- 注册表单 -->
      <div v-if="activeTab === 'register'" class="form-container">
        <el-form 
          :model="registerForm" 
          :rules="registerRules" 
          ref="registerFormRef"
          class="register-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              size="large"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item prop="nickname">
            <el-input
              v-model="registerForm.nickname"
              placeholder="请输入昵称"
              size="large"
              prefix-icon="Edit"
            />
          </el-form-item>
          
          <!-- 移除角色选择，所有用户都可以发布需求和接单 -->
          
          <el-button 
            type="primary" 
            size="large" 
            class="register-btn"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form>
      </div>

      <div class="help-info">
        <h3>使用帮助</h3>
        <p><strong>注册账号：</strong> 请使用真实信息注册，方便后续联系</p>
        <p><strong>忘记密码：</strong> 请联系管理员重置密码</p>
        <p><strong>支付功能：</strong> 接单员需先设置收款二维码才能接收支付</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)

// 登录表单
const loginFormRef = ref()
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册表单
const registerFormRef = ref()
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '昵称长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  // 移除角色验证规则，所有用户都可以发布需求和接单
}

// 登录处理
const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    await authStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功')
    
    // 所有用户都跳转到主页
    router.push('/home')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    await authStore.register(
      registerForm.username,
      registerForm.password,
      registerForm.nickname
    )
    
    ElMessage.success('注册成功')
    
    // 所有用户都跳转到主页
    router.push('/home')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 校园风格背景 */
.campus-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
  opacity: 0.9;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 30px 30px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 品牌LOGO样式 */
.brand-section {
  text-align: center;
  margin-bottom: 30px;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 32px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--success-color) 100%);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.brand-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
  letter-spacing: 1px;
}

.brand-subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 登录注册切换 */
.login-tabs {
  display: flex;
  margin-bottom: 30px;
  background: var(--bg-light);
  border-radius: 10px;
  padding: 4px;
}

.tab-button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
}

.tab-button.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 表单样式 */
.form-container {
  margin-bottom: 20px;
}

.login-btn, .register-btn {
  width: 100%;
  margin-top: 10px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: var(--primary-color) !important;
  border: none !important;
  border-radius: 10px !important;
}

.login-btn:hover, .register-btn:hover {
  background: var(--primary-hover) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 帮助信息 */
.help-info {
  border-top: 1px solid var(--border-color);
  padding-top: 20px;
  background: var(--bg-light);
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
}

.help-info h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--primary-color);
  font-weight: 600;
}

.help-info p {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.help-info p strong {
  color: var(--primary-color);
}

/* Element Plus 组件样式覆盖 */
:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  border-radius: 10px !important;
  padding: 12px 16px;
  background: white;
  border: 1px solid var(--border-color) !important;
}

:deep(.el-input__inner) {
  font-size: 14px;
}

:deep(.el-input__prefix) {
  margin-right: 8px;
}

:deep(.el-icon) {
  color: var(--primary-color);
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--primary-color) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1) !important;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    margin: 20px;
    padding: 30px 24px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .tab-button {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .logo-icon {
    font-size: 28px;
    width: 40px;
    height: 40px;
  }
}

/* 加载动画 */
.loading-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
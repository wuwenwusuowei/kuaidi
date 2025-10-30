<template>
  <div class="home-container">
    <!-- 星空风格背景装饰 -->
    <div class="starry-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
      <div class="floating-elements">
        <div class="floating-element element-1">📦</div>
        <div class="floating-element element-2">🚀</div>
        <div class="floating-element element-3">🎯</div>
        <div class="floating-element element-4">⭐</div>
        <div class="floating-element element-5">🌙</div>
        <div class="floating-element element-6">☀️</div>
        <div class="floating-element element-7">✨</div>
        <div class="floating-element element-8">🌟</div>
        <div class="floating-element element-9">💫</div>
      </div>
      <!-- 流星特效 -->
      <div class="meteor-shower">
        <div class="meteor meteor-1"></div>
        <div class="meteor meteor-2"></div>
        <div class="meteor meteor-3"></div>
        <div class="meteor meteor-4"></div>
        <div class="meteor meteor-5"></div>
      </div>
    </div>
    
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">🚀</div>
          <h2>校园快跑</h2>
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
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="goToPaymentSettings">
                  <el-icon><CreditCard /></el-icon>
                  支付设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
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
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1>欢迎回来，{{ authStore.user?.nickname }}！</h1>
          <p>校园快递代领，让生活更便捷</p>
        </div>
      </div>

      <!-- 功能卡片区域 -->
      <div class="feature-cards">
        <h3 class="section-title">核心功能</h3>
        <el-row :gutter="20">
          <!-- 所有用户通用功能 -->
          <el-col :xs="12" :sm="6">
            <el-card class="feature-card" shadow="hover" @click="goToPublish">
              <div class="card-content">
                <div class="card-icon publish">
                  <el-icon size="32"><DocumentAdd /></el-icon>
                </div>
                <h3>发布需求</h3>
                <p>发布快递代领需求</p>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card class="feature-card" shadow="hover" @click="goToTaskHall">
              <div class="card-content">
                <div class="card-icon task">
                  <el-icon size="32"><Search /></el-icon>
                </div>
                <h3>任务大厅</h3>
                <p>浏览可接单任务</p>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card class="feature-card" shadow="hover" @click="goToMyOrders">
              <div class="card-content">
                <div class="card-icon orders">
                  <el-icon size="32"><Tickets /></el-icon>
                </div>
                <h3>我的订单</h3>
                <p>查看管理订单</p>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card class="feature-card" shadow="hover" @click="goToHelp">
              <div class="card-content">
                <div class="card-icon help">
                  <el-icon size="32"><QuestionFilled /></el-icon>
                </div>
                <h3>使用帮助</h3>
                <p>平台使用指南</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>


    </el-main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { useOrderStore } from '../stores/order'
import { ref, onMounted, computed } from 'vue'
import {
  ArrowDown,
  DocumentAdd,
  Search,
  Tickets,
  QuestionFilled,
  User,
  CreditCard,
  SwitchButton,
  Plus
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const orderStore = useOrderStore()
const loading = ref(false)

// 订单统计
const orderStats = computed(() => {
  if (!authStore.user) {
    return { todayOrders: 0, pendingOrders: 0, completedOrders: 0 }
  }
  
  const userOrders = orderStore.orders.filter(order => 
    order.requesterId === authStore.user!.id || order.delivererId === authStore.user!.id
  )
  
  // 今日订单（创建日期为今天的订单）
  const today = new Date().toISOString().split('T')[0]
  const todayOrders = userOrders.filter(order => 
    order.createdAt.startsWith(today)
  ).length
  
  // 待处理订单（pending, accepted, picking, delivering, awaiting_payment）
  const pendingOrders = userOrders.filter(order => 
    ['pending', 'accepted', 'picking', 'delivering', 'awaiting_payment'].includes(order.status)
  ).length
  
  // 已完成订单
  const completedOrders = userOrders.filter(order => 
    order.status === 'completed'
  ).length
  
  return { todayOrders, pendingOrders, completedOrders }
})

// 加载订单数据
const loadOrderData = async () => {
  if (!authStore.user) return
  
  loading.value = true
  try {
    await Promise.all([
      orderStore.getUserOrders(),
      orderStore.getDelivererOrders()
    ])
  } catch (error) {
    console.error('加载订单数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrderData()
})

// 导航到发布页面
const goToPublish = () => {
  router.push('/publish')
}

// 导航到我的订单
const goToMyOrders = () => {
  router.push('/orders')
}

// 导航到任务大厅
const goToTaskHall = () => {
  router.push('/task-hall')
}

// 导航到我的任务
const goToMyTasks = () => {
  router.push('/orders')
}

// 导航到帮助
const goToHelp = () => {
  router.push('/help')
}

// 导航到个人中心
const goToProfile = () => {
  router.push('/profile')
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
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #1a1a2e 0%, 
    #16213e 30%, 
    #0f3460 70%, 
    #4A90E2 100%);
  position: relative;
  overflow: hidden;
}

/* 星空风格背景装饰 */
.starry-background {
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
  background: linear-gradient(135deg, 
    rgba(74, 144, 226, 0.3) 0%, 
    rgba(255, 126, 130, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 100%);
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 20% 40%, rgba(255, 255, 255, 0.6) 1px, transparent 1px),
    radial-gradient(circle at 30% 60%, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    radial-gradient(circle at 60% 10%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.5) 1px, transparent 1px),
    radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
    radial-gradient(circle at 90% 70%, rgba(255, 255, 255, 0.3) 1px, transparent 1px);
  background-size: 100px 100px, 150px 150px, 200px 200px, 250px 250px, 
                  120px 120px, 180px 180px, 220px 220px, 280px 280px;
  animation: twinkle 8s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.floating-element {
  position: absolute;
  font-size: 24px;
  animation: float 6s ease-in-out infinite;
  opacity: 0.7;
  z-index: 1;
}

.element-1 {
  top: 15%;
  left: 8%;
  animation-delay: 0s;
  font-size: 26px;
  z-index: 10;
}

.element-2 {
  top: 85%;
  left: 12%;
  animation-delay: 1.5s;
  font-size: 24px;
  z-index: 10;
}

.element-3 {
  top: 25%;
  left: 88%;
  animation-delay: 3s;
  font-size: 22px;
  z-index: 10;
}

.element-4 {
  top: 85%;
  left: 85%;
  animation-delay: 4.5s;
  font-size: 28px;
  z-index: 10;
}

.element-5 {
  top: 10%;
  left: 65%;
  animation-delay: 2s;
  font-size: 32px;
  opacity: 0.9;
  z-index: 10;
}

.element-6 {
  top: 80%;
  left: 70%;
  animation-delay: 5s;
  font-size: 26px;
  z-index: 10;
}

.element-7 {
  top: 40%;
  left: 15%;
  animation-delay: 3.5s;
  font-size: 24px;
  z-index: 10;
}

.element-8 {
  top: 60%;
  left: 92%;
  animation-delay: 6s;
  font-size: 30px;
  opacity: 0.8;
  z-index: 10;
}

.element-9 {
  top: 45%;
  left: 75%;
  animation-delay: 1s;
  font-size: 22px;
  z-index: 10;
}

.element-10 {
  top: 45%;
  left: 75%;
  animation-delay: 4s;
  font-size: 25px;
}

/* 流星特效 */
.meteor-shower {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.meteor {
  position: absolute;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0) 0%, 
    rgba(255, 255, 255, 0.3) 30%, 
    rgba(255, 255, 255, 0.6) 50%, 
    rgba(255, 255, 255, 0.3) 70%, 
    rgba(255, 255, 255, 0) 100%);
  filter: blur(1px);
  animation: meteor 10s ease-out infinite;
  opacity: 0;
}

.meteor::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 3px;
  height: 3px;
  background: #FFFFFF;
  border-radius: 50%;
  filter: blur(1px);
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.8);
  animation: meteorHead 10s ease-out infinite;
}

.meteor-1 {
  top: 15%;
  left: -100px;
  animation-delay: 0s;
}

.meteor-2 {
  top: 35%;
  left: -150px;
  animation-delay: 2s;
}

.meteor-3 {
  top: 65%;
  left: -120px;
  animation-delay: 4s;
}

.meteor-4 {
  top: 25%;
  left: -180px;
  animation-delay: 6s;
}

.meteor-5 {
  top: 75%;
  left: -200px;
  animation-delay: 8s;
}

@keyframes meteor {
  0% {
    transform: translateX(0) translateY(0) rotate(30deg);
    opacity: 0;
    width: 0;
  }
  10% {
    opacity: 0.8;
    width: 150px;
  }
  20% {
    opacity: 1;
    width: 200px;
  }
  50% {
    opacity: 0.8;
    width: 180px;
  }
  80% {
    opacity: 0.3;
    width: 120px;
  }
  100% {
    transform: translateX(120vw) translateY(60vh) rotate(30deg);
    opacity: 0;
    width: 60px;
  }
}

@keyframes meteorHead {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  10% {
    opacity: 0.8;
    transform: scale(0.8);
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.9);
  }
  80% {
    opacity: 0.3;
    transform: scale(0.6);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

/* 顶部导航栏 */
.header {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(15px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 24px;
  background: linear-gradient(135deg, #4A90E2, #FF7E82);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

.logo h2 {
  margin: 0;
  font-weight: 700;
  font-size: 22px;
  background: linear-gradient(135deg, #4A90E2, #FF7E82);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}

/* 用户信息 */
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

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 欢迎区域 */
.welcome-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.98) 100%);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #4A90E2, #FF7E82);
}

.welcome-content h1 {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #333;
  background: linear-gradient(135deg, #4A90E2, #FF7E82);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-content p {
  font-size: 18px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

/* 功能卡片区域 */
.feature-cards {
  margin-bottom: 40px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 40px 0;
  text-align: center;
  position: relative;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #4A90E2, #FF7E82);
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.5);
}

.feature-card {
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 200px;
  border: none;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #4A90E2, #FF7E82);
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 1);
}

.card-content {
  text-align: center;
  padding: 36px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1;
}

.card-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: white;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.card-icon::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  background: inherit;
  filter: blur(12px);
  opacity: 0.4;
  z-index: -1;
}

.feature-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.card-icon.publish {
  background: linear-gradient(135deg, #4A90E2, #6BA8E9) !important;
}

.card-icon.task {
  background: linear-gradient(135deg, #FF7E82, #FF9AA2) !important;
}

.card-icon.orders {
  background: linear-gradient(135deg, #FFB74D, #FFCC80) !important;
}

.card-icon.help {
  background: linear-gradient(135deg, #9575CD, #B39DDB) !important;
}

.card-content h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #4A90E2, #FF7E82);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-content p {
  color: #666;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 500;
}



/* Element Plus 组件样式覆盖 */
:deep(.el-button) {
  border-radius: 12px !important;
  font-weight: 600;
  padding: 14px 28px;
  font-size: 15px;
  border: none !important;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4A90E2, #6BA8E9) !important;
  color: white !important;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #3A80D2, #5B98D9) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #FF7E82, #FF9AA2) !important;
  color: white !important;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #EE6E72, #EE8A92) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 126, 130, 0.4);
}

:deep(.el-button--info) {
  background: linear-gradient(135deg, #9575CD, #B39DDB) !important;
  color: white !important;
}

:deep(.el-button--info:hover) {
  background: linear-gradient(135deg, #8565BD, #A38DCB) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(149, 117, 205, 0.4);
}

:deep(.el-dropdown-menu) {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
}

:deep(.el-dropdown-menu__item) {
  font-size: 14px !important;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background: rgba(74, 144, 226, 0.1) !important;
  color: #4A90E2 !important;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .stats-section {
    gap: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .feature-card {
    height: 140px;
    margin-bottom: 16px;
  }
  
  .card-content {
    padding: 20px 12px;
  }
  
  .card-icon {
    width: 48px;
    height: 48px;
  }
  
  .card-content h3 {
    font-size: 14px;
  }
  
  .card-content p {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 20px 16px;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .logo h2 {
    font-size: 18px;
  }
  
  .welcome-content h1 {
    font-size: 24px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  animation: fadeInUp 0.6s ease forwards;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }
</style>

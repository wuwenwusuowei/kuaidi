<template>
  <div class="payment-settings-container">
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
                <el-dropdown-item @click="navigateToHome">
                  <el-icon><House /></el-icon>
                  返回首页
                </el-dropdown-item>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><UserFilled /></el-icon>
                  个人中心
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

    <!-- 页面加载状态 -->
    <div v-if="pageLoading" class="page-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else class="payment-settings-content">
      <!-- Redesigned with modern card layout and professional styling -->
      <div class="settings-wrapper">
        <!-- 页面标题 -->
        <div class="page-header-section">
          <h1 class="settings-title">收款信息设置</h1>
          <p class="settings-subtitle">配置您的收款方式，方便用户支付订单</p>
        </div>

        <!-- 设置卡片 -->
        <el-card class="settings-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <h3>收款账户配置</h3>
              </div>
              <el-button type="primary" @click="savePaymentInfo" class="save-btn">
                <el-icon><Check /></el-icon>
                保存设置
              </el-button>
            </div>
          </template>

          <el-form :model="paymentForm" label-width="140px" class="settings-form">
            <!-- 微信支付设置 -->
            <div class="payment-section">
              <div class="section-header">
                <div class="section-icon wechat-icon">
                  <span>📱</span>
                </div>
                <div class="section-title">
                  <h4>微信支付</h4>
                  <p>添加您的微信收款信息</p>
                </div>
              </div>

              <div class="section-content">
                <el-form-item label="微信昵称">
                  <el-input 
                    v-model="paymentForm.wechatNickname" 
                    placeholder="请输入您的微信昵称"
                    maxlength="50"
                    clearable
                    class="form-input"
                  />
                </el-form-item>

                <el-form-item label="微信收款码">
                  <div class="qr-code-upload">
                    <el-upload
                      class="qr-uploader"
                      action="#"
                      :show-file-list="false"
                      :before-upload="beforeQRCodeUpload"
                      @click="() => setUploadType('wechat')"
                      accept="image/*"
                      drag
                    >
                      <div v-if="paymentForm.wechatQRCodeUrl" class="qr-code-preview">
                        <div v-if="wechatQRCodeLoading" class="qr-code-loading">
                          <el-icon class="loading-icon"><Loading /></el-icon>
                          <span>加载中...</span>
                        </div>
                        <img 
                          :src="paymentForm.wechatQRCodeUrl" 
                          class="qr-code-image" 
                          @loadstart="wechatQRCodeLoading = true"
                          @load="wechatQRCodeLoading = false"
                          @error="wechatQRCodeLoading = false"
                          v-show="!wechatQRCodeLoading"
                        />
                        <div class="qr-code-overlay">
                          <span class="qr-code-text">点击更换二维码</span>
                        </div>
                      </div>
                      <div v-else class="qr-code-placeholder">
                        <el-icon class="upload-icon"><Picture /></el-icon>
                        <div class="upload-text">上传微信收款码</div>
                        <div class="upload-hint">支持 JPG、PNG，不超过 2MB</div>
                      </div>
                    </el-upload>
                  </div>
                </el-form-item>
              </div>
            </div>

            <el-divider />

            <!-- 支付宝设置 -->
            <div class="payment-section">
              <div class="section-header">
                <div class="section-icon alipay-icon">
                  <span>💳</span>
                </div>
                <div class="section-title">
                  <h4>支付宝</h4>
                  <p>添加您的支付宝收款信息</p>
                </div>
              </div>

              <div class="section-content">
                <el-form-item label="支付宝账号">
                  <el-input 
                    v-model="paymentForm.alipayAccount" 
                    placeholder="请输入您的支付宝账号"
                    maxlength="100"
                    clearable
                    class="form-input"
                  />
                </el-form-item>

                <el-form-item label="支付宝收款码">
                  <div class="qr-code-upload">
                    <el-upload
                      class="qr-uploader"
                      action="#"
                      :show-file-list="false"
                      :before-upload="beforeQRCodeUpload"
                      @click="() => setUploadType('alipay')"
                      accept="image/*"
                      drag
                    >
                      <div v-if="paymentForm.alipayQRCodeUrl" class="qr-code-preview">
                        <div v-if="alipayQRCodeLoading" class="qr-code-loading">
                          <el-icon class="loading-icon"><Loading /></el-icon>
                          <span>加载中...</span>
                        </div>
                        <img 
                          :src="paymentForm.alipayQRCodeUrl" 
                          class="qr-code-image" 
                          @loadstart="alipayQRCodeLoading = true"
                          @load="alipayQRCodeLoading = false"
                          @error="alipayQRCodeLoading = false"
                          v-show="!alipayQRCodeLoading"
                        />
                        <div class="qr-code-overlay">
                          <span class="qr-code-text">点击更换二维码</span>
                        </div>
                      </div>
                      <div v-else class="qr-code-placeholder">
                        <el-icon class="upload-icon"><Picture /></el-icon>
                        <div class="upload-text">上传支付宝收款码</div>
                        <div class="upload-hint">支持 JPG、PNG，不超过 2MB</div>
                      </div>
                    </el-upload>
                  </div>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </el-card>

        <!-- 预览卡片 -->
        <el-card class="preview-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <h3>收款码预览</h3>
              </div>
            </div>
          </template>

          <div class="preview-content">
            <div v-if="paymentForm.wechatQRCodeUrl || paymentForm.alipayQRCodeUrl" class="preview-grid">
              <div v-if="paymentForm.wechatQRCodeUrl" class="preview-item">
                <div class="preview-header">
                  <span class="preview-badge wechat">微信</span>
                  <h4>微信收款码</h4>
                </div>
                <div class="preview-qr-code-container">
                  <div v-if="previewWechatQRCodeLoading" class="preview-qr-code-loading">
                    <el-icon class="loading-icon"><Loading /></el-icon>
                  </div>
                  <img 
                    :src="paymentForm.wechatQRCodeUrl" 
                    class="preview-qr-code" 
                    @loadstart="previewWechatQRCodeLoading = true"
                    @load="previewWechatQRCodeLoading = false"
                    @error="previewWechatQRCodeLoading = false"
                    v-show="!previewWechatQRCodeLoading"
                  />
                </div>
                <p class="preview-info">昵称：<strong>{{ paymentForm.wechatNickname || '未设置' }}</strong></p>
              </div>
              
              <div v-if="paymentForm.alipayQRCodeUrl" class="preview-item">
                <div class="preview-header">
                  <span class="preview-badge alipay">支付宝</span>
                  <h4>支付宝收款码</h4>
                </div>
                <div class="preview-qr-code-container">
                  <div v-if="previewAlipayQRCodeLoading" class="preview-qr-code-loading">
                    <el-icon class="loading-icon"><Loading /></el-icon>
                  </div>
                  <img 
                    :src="paymentForm.alipayQRCodeUrl" 
                    class="preview-qr-code" 
                    @loadstart="previewAlipayQRCodeLoading = true"
                    @load="previewAlipayQRCodeLoading = false"
                    @error="previewAlipayQRCodeLoading = false"
                    v-show="!previewAlipayQRCodeLoading"
                  />
                </div>
                <p class="preview-info">账号：<strong>{{ paymentForm.alipayAccount || '未设置' }}</strong></p>
              </div>
            </div>
            
            <div v-else class="empty-preview">
              <el-empty description="暂无收款码设置，请先上传收款二维码" />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading, Check, Picture, ArrowDown, ArrowLeft, House, UserFilled, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import { UserPaymentService } from '../services/userPaymentService'
import type { UserPaymentInfo } from '../services/userPaymentService'

const router = useRouter()
const authStore = useAuthStore()

// 支付表单数据
const paymentForm = ref({
  wechatNickname: '',
  wechatQRCodeUrl: '',
  alipayAccount: '',
  alipayQRCodeUrl: ''
})

// 页面加载状态
const pageLoading = ref(true)

// 二维码加载状态
const wechatQRCodeLoading = ref(false)
const alipayQRCodeLoading = ref(false)

// 预览区域二维码加载状态
const previewWechatQRCodeLoading = ref(false)
const previewAlipayQRCodeLoading = ref(false)

// 当前上传类型（微信或支付宝）
const currentUploadType = ref<'wechat' | 'alipay'>('wechat')

// 返回上一页
const goBack = () => {
  router.back()
}

// 返回首页
const navigateToHome = () => {
  router.push('/home')
}

// 导航到个人中心
const goToProfile = () => {
  router.push('/profile')
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

// 上传前验证
const beforeQRCodeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  
  // 处理文件上传
  handleQRCodeUpload(file)
  return false // 阻止默认上传行为
}

// 处理文件上传
const handleQRCodeUpload = async (file: File) => {
  try {
    // 将图片转换为Base64进行二维码检测和保存
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string
        
        // 二维码检测逻辑
        const isQRCodeValid = await validateQRCode(base64, currentUploadType.value)
        
        if (!isQRCodeValid) {
          ElMessage.error('请上传有效的收款二维码图片')
          return
        }
        
        // 检测通过，直接使用Base64作为支付信息
        if (currentUploadType.value === 'wechat') {
          paymentForm.value.wechatQRCodeUrl = base64
          wechatQRCodeLoading.value = true
          previewWechatQRCodeLoading.value = true
        } else {
          paymentForm.value.alipayQRCodeUrl = base64
          alipayQRCodeLoading.value = true
          previewAlipayQRCodeLoading.value = true
        }
        
        ElMessage.success('二维码上传成功，请点击保存按钮完成设置')
        
      } catch (error) {
        console.error('二维码检测失败:', error)
        ElMessage.error('二维码检测失败，请重新上传')
      }
    }
    
    reader.onerror = () => {
      ElMessage.error('文件读取失败，请重新上传')
    }
    
    reader.readAsDataURL(file)
    
  } catch (error) {
    console.error('上传二维码失败:', error)
    ElMessage.error('上传二维码失败')
  }
}

// 二维码验证函数
const validateQRCode = async (base64Data: string, type: 'wechat' | 'alipay'): Promise<boolean> => {
  try {
    // 创建临时图像用于检测
    const img = new Image()
    
    return new Promise((resolve) => {
      img.onload = () => {
        // 基础验证：检查图像尺寸和比例
        const width = img.width
        const height = img.height
        
        console.log('图片尺寸:', width, 'x', height)
        
        // 二维码应该近似正方形，但放宽限制
        const aspectRatio = width / height
        const isSquare = aspectRatio >= 0.7 && aspectRatio <= 1.3  // 放宽到0.7-1.3
        
        // 最小尺寸要求，放宽限制
        const isSizeValid = width >= 50 && height >= 50  // 降低到50x50
        
        console.log('尺寸验证:', { isSquare, isSizeValid })
        
        // 简单的颜色检测：二维码应该包含深色和浅色区域
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          console.log('Canvas不支持，只做基础验证')
          resolve(isSquare && isSizeValid)
          return
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0)
        
        // 更多采样点，更准确地检测二维码特征
        const samplePoints = [
          { x: 0.1, y: 0.1 }, { x: 0.2, y: 0.2 }, { x: 0.3, y: 0.3 },
          { x: 0.7, y: 0.1 }, { x: 0.8, y: 0.2 }, { x: 0.9, y: 0.3 },
          { x: 0.1, y: 0.7 }, { x: 0.2, y: 0.8 }, { x: 0.3, y: 0.9 },
          { x: 0.7, y: 0.7 }, { x: 0.8, y: 0.8 }, { x: 0.9, y: 0.9 },
          { x: 0.5, y: 0.5 }
        ]
        
        let darkPoints = 0
        let lightPoints = 0
        
        samplePoints.forEach(point => {
          const x = Math.floor(point.x * width)
          const y = Math.floor(point.y * height)
          const pixelData = ctx.getImageData(x, y, 1, 1).data
          
          // 计算亮度
          const brightness = (pixelData[0] + pixelData[1] + pixelData[2]) / 3
          
          if (brightness < 100) {  // 深色点
            darkPoints++
          } else if (brightness > 200) {  // 浅色点
            lightPoints++
          }
        })
        
        console.log('颜色检测结果:', { darkPoints, lightPoints, totalPoints: samplePoints.length })
        
        // 放宽条件：只要有深色点和浅色点的对比，就认为是二维码
        const hasQRCodeFeatures = darkPoints >= 2 && lightPoints >= 2
        
        console.log('最终验证结果:', { isSquare, isSizeValid, hasQRCodeFeatures })
        
        // 放宽验证：只要满足基础尺寸要求，就认为可能是二维码
        const isLikelyQRCode = isSizeValid && (hasQRCodeFeatures || isSquare)
        
        console.log('是否通过验证:', isLikelyQRCode)
        
        resolve(isLikelyQRCode)
      }
      
      img.onerror = () => {
        console.log('图片加载失败')
        resolve(false)
      }
      
      img.src = base64Data
    })
    
  } catch (error) {
    console.error('二维码验证错误:', error)
    return false
  }
}

// 设置上传类型
const setUploadType = (type: 'wechat' | 'alipay') => {
  currentUploadType.value = type
}

// 保存支付信息
const savePaymentInfo = async () => {
  try {
    if (!authStore.user) {
      ElMessage.error('请先登录')
      return
    }

    // 验证至少设置了一种支付方式
    if (!paymentForm.value.wechatQRCodeUrl && !paymentForm.value.alipayQRCodeUrl) {
      ElMessage.error('请至少设置一种收款方式')
      return
    }

    const updateData: Partial<UserPaymentInfo> = {
      wechat_nickname: paymentForm.value.wechatNickname,
      wechat_qr_code_url: paymentForm.value.wechatQRCodeUrl,
      alipay_account: paymentForm.value.alipayAccount,
      alipay_qr_code_url: paymentForm.value.alipayQRCodeUrl
    }

    const result = await UserPaymentService.updateUserPaymentInfo(
      authStore.user.id,
      updateData
    )

    if (result.success) {
      // 清除缓存，确保下次读取最新数据
      UserPaymentService.clearPaymentInfoCache(authStore.user.id)
      ElMessage.success('支付信息保存成功')
      
      // 重新加载支付信息，确保显示最新数据
      loadUserPaymentInfo()
    } else {
      ElMessage.error('保存失败：' + result.error)
    }
  } catch (error: any) {
    console.error('保存支付信息失败:', error)
    ElMessage.error('保存失败')
  }
}

// 加载用户支付信息
const loadUserPaymentInfo = async () => {
  try {
    console.log('开始加载支付信息...')
    pageLoading.value = true
    
    if (!authStore.user) {
      console.log('用户未登录，跳过加载支付信息')
      pageLoading.value = false
      return
    }

    console.log('获取用户支付信息，用户ID:', authStore.user.id)
    
    // 清除缓存，确保获取最新数据
    UserPaymentService.clearPaymentInfoCache(authStore.user.id)
    
    const result = await UserPaymentService.getUserPaymentInfo(authStore.user.id)
    
    console.log('支付信息获取结果:', result)
    
    if (result.success && result.data) {
      console.log('设置支付表单数据')
      paymentForm.value.wechatNickname = result.data.wechat_nickname || ''
      paymentForm.value.alipayAccount = result.data.alipay_account || ''
      
      // 设置二维码URL - 强制重新加载
      if (result.data && result.data.wechat_qr_code_url) {
        console.log('设置微信二维码URL')
        wechatQRCodeLoading.value = true
        previewWechatQRCodeLoading.value = true
        
        // 直接设置二维码URL，使用时间戳强制重新加载
        paymentForm.value.wechatQRCodeUrl = result.data.wechat_qr_code_url
        
        // 设置加载状态为false（图片会自行触发加载事件）
        setTimeout(() => {
          wechatQRCodeLoading.value = false
          previewWechatQRCodeLoading.value = false
        }, 1000)
      } else {
        console.log('没有微信二维码URL')
        paymentForm.value.wechatQRCodeUrl = ''
        wechatQRCodeLoading.value = false
        previewWechatQRCodeLoading.value = false
      }
      
      if (result.data && result.data.alipay_qr_code_url) {
        console.log('设置支付宝二维码URL')
        alipayQRCodeLoading.value = true
        previewAlipayQRCodeLoading.value = true
        
        // 直接设置二维码URL，使用时间戳强制重新加载
        paymentForm.value.alipayQRCodeUrl = result.data.alipay_qr_code_url
        
        // 设置加载状态为false（图片会自行触发加载事件）
        setTimeout(() => {
          alipayQRCodeLoading.value = false
          previewAlipayQRCodeLoading.value = false
        }, 1000)
      } else {
        console.log('没有支付宝二维码URL')
        paymentForm.value.alipayQRCodeUrl = ''
        alipayQRCodeLoading.value = false
        previewAlipayQRCodeLoading.value = false
      }
    } else {
      console.log('支付信息获取失败或没有数据')
      // 清空表单数据
      paymentForm.value.wechatQRCodeUrl = ''
      paymentForm.value.alipayQRCodeUrl = ''
      wechatQRCodeLoading.value = false
      alipayQRCodeLoading.value = false
      previewWechatQRCodeLoading.value = false
      previewAlipayQRCodeLoading.value = false
    }
  } catch (error) {
    console.error('加载支付信息失败:', error)
    ElMessage.error('加载支付信息失败，请检查网络连接')
  } finally {
    console.log('支付信息加载完成')
    pageLoading.value = false
  }
}

onMounted(async () => {
  console.log('PaymentSettings组件挂载')
  
  // 先检查认证状态
  await authStore.checkAuth()
  console.log('认证状态检查完成，用户:', authStore.user)
  
  // 然后加载支付信息
  loadUserPaymentInfo()
})
</script>

<style scoped>
.payment-settings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: white;
  border-bottom: 1px solid #e4e7eb;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-header-title {
  font-size: 18px;
  font-weight: 700;
  color: #0a0e27;
}

/* 顶部导航栏样式 */
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

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
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

/* 页面加载状态 */
.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
}

.page-loading .loading-icon {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

.payment-settings-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.settings-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 页面标题 */
.page-header-section {
  text-align: center;
  margin-bottom: 20px;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  color: #0a0e27;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.settings-subtitle {
  font-size: 16px;
  color: #8c92a0;
  margin: 0;
}

/* 卡片样式 */
.settings-card,
.preview-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.settings-card:hover,
.preview-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #e8e8e8;
}

:deep(.el-card__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0a0e27;
  margin: 0;
}

.save-btn {
  height: 40px;
  border-radius: 8px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.save-btn:hover {
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

/* 表单样式 */
.settings-form {
  padding: 24px 0;
}

.payment-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.section-icon.wechat-icon {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}

.section-icon.alipay-icon {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.section-title {
  flex: 1;
}

.section-title h4 {
  font-size: 18px;
  font-weight: 700;
  color: #0a0e27;
  margin: 0 0 4px 0;
}

.section-title p {
  font-size: 14px;
  color: #8c92a0;
  margin: 0;
}

.section-content {
  margin-left: 66px;
}

:deep(.el-form-item__label) {
  color: #595959 !important;
  font-weight: 600;
  font-size: 15px;
}

.form-input {
  height: 40px;
}

:deep(.form-input .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.form-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea;
}

/* 二维码上传 */
.qr-code-upload {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.qr-uploader {
  width: 200px;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.qr-uploader:hover {
  border-color: #667eea;
  background: #f8faff;
}

.qr-code-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.qr-code-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.qr-code-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 10px;
}

.qr-code-preview:hover .qr-code-overlay {
  opacity: 1;
}

.qr-code-text {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.qr-code-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c92a0;
}

.upload-icon {
  font-size: 32px;
  color: #b2b9c1;
  margin-bottom: 8px;
}

.upload-text {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #0a0e27;
}

.upload-hint {
  font-size: 12px;
  color: #b2b9c1;
  margin-top: 4px;
}

.qr-code-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  z-index: 10;
}

.qr-code-loading .loading-icon {
  font-size: 24px;
  color: #667eea;
  margin-bottom: 8px;
  animation: spin 1s linear infinite;
}

.qr-code-loading span {
  font-size: 12px;
  color: #595959;
}

/* 预览卡片 */
.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.preview-item {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: #fafbfc;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.preview-item:hover {
  background: #f8faff;
  border-color: #e0e6ff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.preview-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-badge.wechat {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #0052cc;
}

.preview-badge.alipay {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  color: #ff6b00;
}

.preview-item h4 {
  font-size: 16px;
  font-weight: 700;
  color: #0a0e27;
  margin: 0;
}

.preview-qr-code-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 16px auto;
}

.preview-qr-code {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.preview-qr-code-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  z-index: 10;
}

.preview-qr-code-loading .loading-icon {
  font-size: 20px;
  color: #667eea;
  animation: spin 1s linear infinite;
}

.preview-info {
  margin-top: 12px;
  font-size: 14px;
  color: #595959;
}

.preview-info strong {
  color: #0a0e27;
  font-weight: 600;
}

.empty-preview {
  text-align: center;
  padding: 40px 20px;
}

@media (max-width: 768px) {
  .page-header-section {
    text-align: left;
  }

  .settings-title {
    font-size: 24px;
  }

  .payment-settings-content {
    padding: 20px;
  }

  .section-content {
    margin-left: 0;
  }

  .preview-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .qr-code-upload {
    flex-direction: column;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>

<template>
  <div class="payment-settings-container">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-header-title">支付设置</span>
      </template>
    </el-page-header>

    <!-- 页面加载状态 -->
    <div v-if="pageLoading" class="page-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else class="payment-settings-content">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <h3>收款信息设置</h3>
            <el-button type="primary" @click="savePaymentInfo">保存设置</el-button>
          </div>
        </template>

        <el-form :model="paymentForm" label-width="120px">
          <!-- 微信支付设置 -->
          <el-divider content-position="left">微信支付</el-divider>
          
          <el-form-item label="微信昵称">
            <el-input 
              v-model="paymentForm.wechatNickname" 
              placeholder="请输入您的微信昵称"
              maxlength="50"
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
                  <el-icon size="40"><Plus /></el-icon>
                  <div class="upload-text">上传微信收款码</div>
                </div>
              </el-upload>
              <div class="upload-tips">
                <p>• 请上传清晰的微信收款二维码图片</p>
                <p>• 支持 JPG、PNG 格式，大小不超过 2MB</p>
              </div>
            </div>
          </el-form-item>

          <!-- 支付宝设置 -->
          <el-divider content-position="left">支付宝</el-divider>
          
          <el-form-item label="支付宝账号">
            <el-input 
              v-model="paymentForm.alipayAccount" 
              placeholder="请输入您的支付宝账号"
              maxlength="100"
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
                  <el-icon size="40"><Plus /></el-icon>
                  <div class="upload-text">上传支付宝收款码</div>
                </div>
              </el-upload>
              <div class="upload-tips">
                <p>• 请上传清晰的支付宝收款二维码图片</p>
                <p>• 支持 JPG、PNG 格式，大小不超过 2MB</p>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 预览区域 -->
      <el-card class="preview-card">
        <template #header>
          <h3>收款码预览</h3>
        </template>
        
        <div class="preview-content">
          <div v-if="paymentForm.wechatQRCodeUrl" class="preview-item">
            <h4>微信收款码</h4>
            <div class="preview-qr-code-container">
              <div v-if="previewWechatQRCodeLoading" class="preview-qr-code-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <span>加载中...</span>
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
            <p class="preview-info">昵称：{{ paymentForm.wechatNickname || '未设置' }}</p>
          </div>
          
          <div v-if="paymentForm.alipayQRCodeUrl" class="preview-item">
            <h4>支付宝收款码</h4>
            <div class="preview-qr-code-container">
              <div v-if="previewAlipayQRCodeLoading" class="preview-qr-code-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <span>加载中...</span>
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
            <p class="preview-info">账号：{{ paymentForm.alipayAccount || '未设置' }}</p>
          </div>
          
          <div v-if="!paymentForm.wechatQRCodeUrl && !paymentForm.alipayQRCodeUrl" class="empty-preview">
            <el-empty description="暂无收款码设置" />
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Loading } from '@element-plus/icons-vue'
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
    // 将图片转换为Base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      
      if (currentUploadType.value === 'wechat') {
        paymentForm.value.wechatQRCodeUrl = base64
      } else {
        paymentForm.value.alipayQRCodeUrl = base64
      }
      
      ElMessage.success('二维码上传成功')
    }
    reader.readAsDataURL(file)
    
  } catch (error) {
    console.error('上传二维码失败:', error)
    ElMessage.error('上传二维码失败')
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
      ElMessage.success('支付信息保存成功')
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
    const result = await UserPaymentService.getUserPaymentInfo(authStore.user.id)
    
    console.log('支付信息获取结果:', result)
    
    if (result.success && result.data) {
      console.log('设置支付表单数据')
      paymentForm.value.wechatNickname = result.data.wechat_nickname || ''
      paymentForm.value.alipayAccount = result.data.alipay_account || ''
      
      // 设置二维码URL - 强制重新加载
      if (result.data.wechat_qr_code_url) {
        console.log('设置微信二维码URL:', result.data.wechat_qr_code_url)
        wechatQRCodeLoading.value = true
        previewWechatQRCodeLoading.value = true
        // 先设置为空，再设置URL，强制图片重新加载
        paymentForm.value.wechatQRCodeUrl = ''
        // 使用setTimeout替代nextTick
        setTimeout(() => {
          paymentForm.value.wechatQRCodeUrl = result.data.wechat_qr_code_url
        }, 50)
      } else {
        console.log('没有微信二维码URL')
        paymentForm.value.wechatQRCodeUrl = ''
        wechatQRCodeLoading.value = false
        previewWechatQRCodeLoading.value = false
      }
      
      if (result.data.alipay_qr_code_url) {
        console.log('设置支付宝二维码URL:', result.data.alipay_qr_code_url)
        alipayQRCodeLoading.value = true
        previewAlipayQRCodeLoading.value = true
        // 先设置为空，再设置URL，强制图片重新加载
        paymentForm.value.alipayQRCodeUrl = ''
        // 使用setTimeout替代nextTick
        setTimeout(() => {
          paymentForm.value.alipayQRCodeUrl = result.data.alipay_qr_code_url
        }, 50)
      } else {
        console.log('没有支付宝二维码URL')
        paymentForm.value.alipayQRCodeUrl = ''
        alipayQRCodeLoading.value = false
        previewAlipayQRCodeLoading.value = false
      }
    } else {
      console.log('支付信息获取失败或没有数据')
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
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 400px;
}

.page-header-title {
  font-size: 18px;
  font-weight: 600;
}

/* 页面加载状态样式 */
.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
}

.page-loading .loading-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

.page-loading span {
  font-size: 16px;
  color: #666;
}

.payment-settings-content {
  margin-top: 20px;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qr-code-upload {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.qr-uploader {
  width: 200px;
  height: 200px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
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
}

.qr-code-preview:hover .qr-code-overlay {
  opacity: 1;
}

.qr-code-text {
  color: white;
  font-size: 14px;
}

.qr-code-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #8c939d;
}

.upload-text {
  margin-top: 10px;
  font-size: 14px;
}

.upload-tips {
  flex: 1;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.preview-card {
  margin-top: 20px;
}

.preview-content {
  display: flex;
  gap: 40px;
  justify-content: center;
}

.preview-item {
  text-align: center;
}

.preview-item h4 {
  margin-bottom: 15px;
  color: #333;
}

.preview-qr-code-container {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.preview-qr-code {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.preview-info {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

/* 预览区域二维码加载状态样式 */
.preview-qr-code-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  z-index: 10;
}

.preview-qr-code-loading .loading-icon {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 8px;
  animation: spin 1s linear infinite;
}

.preview-qr-code-loading span {
  font-size: 14px;
  color: #666;
}

.empty-preview {
  width: 100%;
  text-align: center;
}

/* 二维码加载状态样式 */
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
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  z-index: 10;
}

.loading-icon {
  font-size: 24px;
  color: #409EFF;
  margin-bottom: 8px;
  animation: spin 1s linear infinite;
}

.qr-code-loading span {
  font-size: 14px;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .qr-code-upload {
    flex-direction: column;
  }
  
  .preview-content {
    flex-direction: column;
    align-items: center;
  }
}
</style>
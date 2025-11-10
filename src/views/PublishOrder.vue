<template>
  <div class="publish-container">
    <!-- 发布需求页面 - 包含太阳系行星动画和发布流程（GitHub已上传版本） -->
    <!-- 首页的繁星背景 -->
    <div class="starry-bg"></div>
    
    <!-- 太阳系行星轨道 -->
    <div class="planet-orbit mercury-orbit">
      <div class="planet mercury"></div>
    </div>
    <div class="planet-orbit venus-orbit">
      <div class="planet venus"></div>
    </div>
    <div class="planet-orbit earth-orbit">
      <div class="planet earth"></div>
    </div>
    <div class="planet-orbit mars-orbit">
      <div class="planet mars"></div>
    </div>
    <div class="planet-orbit jupiter-orbit">
      <div class="planet jupiter"></div>
    </div>
    <div class="planet-orbit saturn-orbit">
      <div class="planet saturn"></div>
    </div>
    <div class="planet-orbit uranus-orbit">
      <div class="planet uranus"></div>
    </div>
    <div class="planet-orbit neptune-orbit">
      <div class="planet neptune"></div>
    </div>
    
    <!-- 火箭模型 - 横向飞行动画 -->
    <div class="rocket-container">
      <div class="rocket">
        <!-- 火箭主体 -->
        <div class="rocket-body">
          <!-- 火箭头部 -->
          <div class="rocket-nose"></div>
          <!-- 火箭窗口 -->
          <div class="rocket-window"></div>
        </div>
        <!-- 火箭尾翼 -->
        <div class="rocket-fins">
          <div class="fin fin-top"></div>
          <div class="fin fin-bottom"></div>
        </div>
        <!-- 火箭火焰 -->
        <div class="rocket-flame">
          <div class="flame flame-1"></div>
        </div>
      </div>
    </div>
    
    <!-- 修复返回按钮 - 使用自定义按钮确保点击事件可靠 -->
    <div class="custom-header">
      <button 
        class="back-button" 
        @click="goBack"
      >
        ← 返回
      </button>
      <span class="page-header-title">发布代领需求</span>
    </div>

    <div class="publish-content">
      <el-steps :active="currentStep" align-center class="publish-steps">
        <el-step title="快递信息" description="填写快递基本信息" />
        <el-step title="取送信息" description="设置取件和送达信息" />
        <el-step title="确认发布" description="确认信息并发布" />
      </el-steps>

      <!-- 步骤1：快递信息 -->
      <div v-if="currentStep === 0" class="step-content">
        <el-form 
          :model="form" 
          :rules="rules" 
          ref="step1FormRef"
          label-width="120px"
          class="publish-form"
        >
          <el-form-item label="快递标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入快递标题，如：顺丰快递代取"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="快递公司" prop="expressCompany">
            <el-select v-model="form.expressCompany" placeholder="请选择快递公司">
              <el-option label="顺丰" value="顺丰" />
              <el-option label="中通" value="中通" />
              <el-option label="圆通" value="圆通" />
              <el-option label="申通" value="申通" />
              <el-option label="韵达" value="韵达" />
              <el-option label="京东" value="京东" />
              <el-option label="邮政" value="邮政" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>

          <el-form-item label="快递单号" prop="trackingNumber">
            <el-input
              v-model="form.trackingNumber"
              placeholder="请输入快递单号"
            />
          </el-form-item>

          <el-form-item label="物品描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请描述快递物品，如：书籍、衣物、电子产品等"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="物品重量" prop="weight">
            <el-input-number
              v-model="form.weight"
              :min="0.1"
              :max="20"
              :step="0.1"
              controls-position="right"
            />
            <span class="unit">公斤</span>
          </el-form-item>

          <el-form-item label="物品尺寸" prop="size">
            <el-radio-group v-model="form.size">
              <el-radio label="小件">小件（文件、小包裹）</el-radio>
              <el-radio label="中件">中件（书包大小）</el-radio>
              <el-radio label="大件">大件（行李箱大小）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="是否加急" prop="urgent">
            <el-switch
              v-model="form.urgent"
              active-text="加急"
              inactive-text="普通"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2：取送信息 -->
      <div v-if="currentStep === 1" class="step-content">
        <el-form 
          :model="form" 
          :rules="rules" 
          ref="step2FormRef"
          label-width="120px"
          class="publish-form"
        >
          <el-form-item label="快递所在位置" prop="pickupLocation">
            <el-input
              v-model="form.pickupLocation"
              placeholder="请输入快递具体位置，如：学校东门快递点3号货架"
            />
          </el-form-item>

          <el-form-item label="快递要放在哪里" prop="deliveryLocation">
            <el-input
              v-model="form.deliveryLocation"
              placeholder="请输入送达具体位置，如：学生宿舍3号楼201室门口"
            />
          </el-form-item>



          <el-form-item label="送达时间" prop="deliveryTime">
            <el-date-picker
              v-model="form.deliveryTime"
              type="datetime"
              placeholder="选择送达时间"
              value-format="YYYY-MM-DD HH:mm"
              :disabled-date="disabledDate"
            />
          </el-form-item>

          <el-form-item label="用户手机号码" prop="contactPhone">
            <el-input
              v-model="form.contactPhone"
              placeholder="请输入您的手机号码"
              maxlength="11"
            />
          </el-form-item>

          <el-form-item label="取件码" prop="pickupCode">
            <el-input
              v-model="form.pickupCode"
              placeholder="请输入取件码（如快递柜取件码、货架编号等）"
              maxlength="20"
            />
          </el-form-item>

          <el-form-item label="用户愿意支付的金额" prop="price">
            <el-input-number
              v-model="form.price"
              :min="1"
              :max="50"
              :step="1"
              controls-position="right"
              placeholder="请输入您愿意支付的金额"
            />
            <span class="unit">元</span>
          </el-form-item>

          <!-- 费用设置 -->
          <div class="price-estimate">
            <h3>费用设置</h3>
            <div class="price-details">
              <div class="price-item">
                <span>您愿意支付的金额：</span>
                <span class="total-amount">¥{{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="price-tip">
                <el-alert 
                  title="建议金额：小件1-2元，中件4-5元，大件8-15元" 
                  type="info" 
                  :closable="false"
                  show-icon
                />
              </div>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 步骤3：确认发布 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="confirm-info">
          <h3>请确认发布信息</h3>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="快递标题">{{ form.title }}</el-descriptions-item>
            <el-descriptions-item label="快递公司">{{ form.expressCompany }}</el-descriptions-item>
            <el-descriptions-item label="快递单号">{{ form.trackingNumber }}</el-descriptions-item>
            <el-descriptions-item label="物品描述">{{ form.description }}</el-descriptions-item>
            <el-descriptions-item label="物品重量">{{ form.weight }}公斤</el-descriptions-item>
            <el-descriptions-item label="物品尺寸">{{ form.size }}</el-descriptions-item>
            <el-descriptions-item label="快递所在位置">{{ form.pickupLocation }}</el-descriptions-item>
            <el-descriptions-item label="快递要放在哪里">{{ form.deliveryLocation }}</el-descriptions-item>

            <el-descriptions-item label="送达时间">{{ form.deliveryTime }}</el-descriptions-item>
            <el-descriptions-item label="用户手机号码">{{ form.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="取件码">{{ form.pickupCode || '无' }}</el-descriptions-item>
            <el-descriptions-item label="是否加急">{{ form.urgent ? '是' : '否' }}</el-descriptions-item>
            <el-descriptions-item label="用户愿意支付的金额">
              <span class="confirm-price">¥{{ totalPrice.toFixed(2) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <!-- 导航按钮 -->
      <div class="step-actions">
        <el-button 
          v-if="currentStep > 0" 
          @click="prevStep"
        >
          上一步
        </el-button>
        
        <el-button 
          v-if="currentStep < 2" 
          type="primary" 
          @click="nextStep"
        >
          下一步
        </el-button>
        
        <el-button 
          v-if="currentStep === 2" 
          type="primary" 
          :loading="loading"
          @click="handlePublish"
        >
          确认发布
        </el-button>
      </div>
    </div>
  </div>
</template>

<!-- 发布需求页面已成功上传到GitHub仓库 - 最后更新时间: 2025-11-07 -->

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '../stores/order'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const orderStore = useOrderStore()

const currentStep = ref(0)
const loading = ref(false)
const step1FormRef = ref<FormInstance>()
const step2FormRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  title: '',
  expressCompany: '',
  trackingNumber: '',
  description: '',
  weight: 1,
  size: '小件',
  urgent: false,
  pickupLocation: '',
  deliveryLocation: '',
  deliveryTime: '',
  contactPhone: '',
  pickupCode: '',
  price: 2
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入快递标题', trigger: 'blur' }
  ],
  expressCompany: [
    { required: true, message: '请选择快递公司', trigger: 'change' }
  ],
  trackingNumber: [
    { required: true, message: '请输入快递单号', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入物品描述', trigger: 'blur' }
  ],
  weight: [
    { required: true, message: '请输入物品重量', trigger: 'blur' }
  ],
  size: [
    { required: true, message: '请选择物品尺寸', trigger: 'change' }
  ],
  pickupLocation: [
    { required: true, message: '请输入取件地点', trigger: 'blur' }
  ],
  deliveryLocation: [
    { required: true, message: '请输入送达地点', trigger: 'blur' }
  ],

  deliveryTime: [
    { required: true, message: '请选择送达时间', trigger: 'change' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入愿意支付的金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '金额不能低于1元', trigger: 'blur' },
    { type: 'number', max: 50, message: '金额不能超过50元', trigger: 'blur' }
  ],
  pickupCode: [
    { required: false, message: '请输入取件码', trigger: 'blur' },
    { max: 20, message: '取件码不能超过20个字符', trigger: 'blur' }
  ]
}

// 费用计算
const totalPrice = computed(() => form.price || 2)

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

// 返回
const goBack = () => {
  console.log('返回按钮被点击，正在导航到首页...')
  router.push('/home')
}

// 下一步
const nextStep = async () => {
  try {
    if (currentStep.value === 0) {
      await step1FormRef.value?.validate()
    } else if (currentStep.value === 1) {
      await step2FormRef.value?.validate()
      
      // 检查送达时间是否合理
      if (form.deliveryTime && new Date(form.deliveryTime) <= new Date()) {
        ElMessage.error('送达时间必须晚于当前时间')
        return
      }
    }
    
    currentStep.value++
  } catch (error) {
    ElMessage.error('请完善表单信息')
  }
}

// 上一步
const prevStep = () => {
  currentStep.value--
}

// 发布订单
const handlePublish = async () => {
  try {
    loading.value = true
    
    const orderData = {
      title: form.title,
      description: form.description,
      pickupLocation: form.pickupLocation,
      deliveryLocation: form.deliveryLocation,

      deliveryTime: form.deliveryTime,
      price: totalPrice.value,
      contactPhone: form.contactPhone,
      pickupCode: form.pickupCode,
      expressCompany: form.expressCompany,
      trackingNumber: form.trackingNumber,
      weight: form.weight,
      size: form.size,
      urgent: form.urgent
    }
    
    console.log('前端发送的订单数据:', JSON.stringify(orderData, null, 2))
    
    await orderStore.createOrder(orderData)
    
    ElMessage.success('发布成功！等待代领员接单')
    router.push('/home')
  } catch (error: any) {
    ElMessage.error(error.message || '发布失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 全局样式覆盖 - 不使用scoped，确保优先级最高 */
.publish-container .el-input__inner,
.publish-container .el-textarea__inner,
.publish-container .el-select .el-input__inner {
  border-radius: 12px !important;
  border: 1px solid rgba(74, 144, 226, 0.3) !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
  outline: none !important;
}

.publish-container .el-input__inner:focus,
.publish-container .el-textarea__inner:focus,
.publish-container .el-select .el-input__inner:focus {
  border-color: #4A90E2 !important;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15) !important;
  background: rgba(255, 255, 255, 1) !important;
  transform: translateY(-1px) !important;
}
/* 强制样式覆盖 - 使用更具体的选择器 */
.publish-container :deep(.el-input__inner),
.publish-container :deep(.el-textarea__inner) {
  border-radius: 12px !important;
  border: 1px solid rgba(74, 144, 226, 0.3) !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
}

.publish-container :deep(.el-input__inner:focus),
.publish-container :deep(.el-textarea__inner:focus) {
  border-color: #4A90E2 !important;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15) !important;
  background: rgba(255, 255, 255, 1) !important;
  transform: translateY(-1px) !important;
}
.publish-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 25%, #2a2a6a 50%, #3a3a8a 75%, #4a4aaa 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* 太阳系星空背景 - 完全复制首页的繁星效果 */
.publish-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(74, 144, 226, 0.3) 0%, 
    rgba(255, 126, 130, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 100%);
  z-index: 0;
  pointer-events: none !important;
}

/* 首页的繁星图案 */
.publish-container .starry-bg {
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
  z-index: 0;
  pointer-events: none !important;
}

/* 太阳 - 往左边移动一点 */
.publish-container::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 12.5%;
  width: 80px;
  height: 80px;
  margin-top: -40px;
  background: radial-gradient(circle, #FFD700 0%, #FF8C00 50%, #FF4500 100%);
  border-radius: 50%;
  box-shadow: 
    0 0 60px #FFD700,
    0 0 120px rgba(255, 215, 0, 0.5),
    0 0 200px rgba(255, 140, 0, 0.3);
  animation: sunGlow 8s ease-in-out infinite;
  z-index: 1;
  pointer-events: none !important;
}

/* 行星轨道和行星 - 以太阳为中心 */
.publish-container .planet-orbit {
  position: absolute;
  top: 50%;
  right: 15%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50%, -50%);
  pointer-events: none !important;
}

.publish-container .planet {
  position: absolute;
  border-radius: 50%;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  pointer-events: none !important;
  /* 设置行星初始位置在轨道右侧（0度位置） */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 水星 */
.publish-container .mercury-orbit {
  width: 100px;
  height: 100px;
}

.publish-container .mercury {
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #A9A9A9, #696969);
  animation: orbitMercury 3s linear infinite;
}

/* 金星 */
.publish-container .venus-orbit {
  width: 140px;
  height: 140px;
}

.publish-container .venus {
  width: 12px;
  height: 12px;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  animation: orbitVenus 6s linear infinite;
}

/* 地球 */
.publish-container .earth-orbit {
  width: 180px;
  height: 180px;
}

.publish-container .earth {
  width: 14px;
  height: 14px;
  background: linear-gradient(45deg, #1E90FF, #00BFFF);
  animation: orbitEarth 10s linear infinite;
}

/* 火星 */
.publish-container .mars-orbit {
  width: 220px;
  height: 220px;
}

.publish-container .mars {
  width: 10px;
  height: 10px;
  background: linear-gradient(45deg, #FF4500, #DC143C);
  animation: orbitMars 15s linear infinite;
}

/* 木星 */
.publish-container .jupiter-orbit {
  width: 280px;
  height: 280px;
}

.publish-container .jupiter {
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, #FFA500, #FF8C00);
  animation: orbitJupiter 25s linear infinite;
}

/* 土星 */
.publish-container .saturn-orbit {
  width: 340px;
  height: 340px;
}

.publish-container .saturn {
  width: 18px;
  height: 18px;
  background: linear-gradient(45deg, #FFD700, #DAA520);
  animation: orbitSaturn 35s linear infinite;
}

/* 天王星 */
.publish-container .uranus-orbit {
  width: 400px;
  height: 400px;
}

.publish-container .uranus {
  width: 16px;
  height: 16px;
  background: linear-gradient(45deg, #00CED1, #20B2AA);
  animation: orbitUranus 45s linear infinite;
}

/* 海王星 */
.publish-container .neptune-orbit {
  width: 460px;
  height: 460px;
}

.publish-container .neptune {
  width: 15px;
  height: 15px;
  background: linear-gradient(45deg, #4169E1, #0000CD);
  animation: orbitNeptune 60s linear infinite;
}

/* 动画定义 */
@keyframes sunGlow {
  0%, 100% { 
    box-shadow: 
      0 0 60px #FFD700,
      0 0 120px rgba(255, 215, 0, 0.5),
      0 0 200px rgba(255, 140, 0, 0.3);
  }
  50% { 
    box-shadow: 
      0 0 80px #FFD700,
      0 0 160px rgba(255, 215, 0, 0.7),
      0 0 240px rgba(255, 140, 0, 0.5);
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* 行星轨道动画 - 真正围绕太阳转 */
@keyframes orbitMercury {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(50px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(50px) rotate(-360deg); }
}

@keyframes orbitVenus {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(70px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(70px) rotate(-360deg); }
}

@keyframes orbitEarth {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(90px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(90px) rotate(-360deg); }
}

@keyframes orbitMars {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(110px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(110px) rotate(-360deg); }
}

@keyframes orbitJupiter {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(140px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(140px) rotate(-360deg); }
}

@keyframes orbitSaturn {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(170px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(170px) rotate(-360deg); }
}

@keyframes orbitUranus {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(200px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(200px) rotate(-360deg); }
}

@keyframes orbitNeptune {
  0% { transform: translate(-50%, -50%) rotate(0deg) translateX(230px) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg) translateX(230px) rotate(-360deg); }
}

/* 自定义头部样式 - 确保返回按钮可点击 */
.custom-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 9999 !important;
  pointer-events: auto !important;
}

.back-button {
  color: white !important;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  position: relative;
  z-index: 10000 !important;
  pointer-events: auto !important;
  cursor: pointer !important;
  display: inline-block;
  text-decoration: none;
  outline: none;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

.page-header-title {
  font-size: 18px;
  font-weight: 600;
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}



@keyframes starTwinkle {
  0%, 100% { 
    opacity: 0.9; 
    filter: brightness(1);
  }
  25% { 
    opacity: 1; 
    filter: brightness(1.3);
  }
  50% { 
    opacity: 0.95; 
    filter: brightness(1.1);
  }
  75% { 
    opacity: 1; 
    filter: brightness(1.4);
  }
}

@keyframes starDrift {
  0% { 
    background-position: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%;
  }
  100% { 
    background-position: 0% 0%, 0% 0%, 100% 100%, 150% 150%, 200% 200%;
  }
}

@keyframes constellationGlow {
  0%, 100% { 
    opacity: 0.6;
    filter: blur(0px);
  }
  50% { 
    opacity: 0.9;
    filter: blur(1px);
  }
}

.page-header-title {
  font-size: 18px;
  font-weight: 600;
  color: white !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.publish-content {
  max-width: 800px;
  margin: 30px auto 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.98) 100%);
  border-radius: 20px;
  padding: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.publish-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #4A90E2, #FF7E82);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.5);
}

/* 添加星空装饰元素 */
.publish-content::after {
  content: '';
  position: absolute;
  top: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  z-index: 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
}

.publish-steps {
  margin-bottom: 50px;
}

:deep(.el-steps) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

:deep(.el-steps)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #4A90E2, #FF7E82);
}

:deep(.el-step__head) {
  color: #4A90E2;
}

:deep(.el-step__head.is-process) {
  color: #4A90E2;
  border-color: #4A90E2;
}

:deep(.el-step__title) {
  font-size: 16px;
  font-weight: 700;
  color: #2c3e50;
  transition: all 0.3s ease;
}

:deep(.el-step__title.is-process) {
  color: #4A90E2;
  text-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
}

:deep(.el-step__description) {
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

:deep(.el-step__description.is-process) {
  color: #4A90E2;
}

.step-content {
  min-height: 400px;
}

.publish-form {
  max-width: 600px;
  margin: 0 auto;
}

:deep(.el-form-item__label) {
  font-weight: 700;
  color: #2c3e50;
  font-size: 15px;
  margin-bottom: 8px;
  display: block;
}

/* 重要字段特殊样式 */
:deep(.el-form-item:has([prop="title"])) .el-form-item__label::before,
:deep(.el-form-item:has([prop="contactPhone"])) .el-form-item__label::before {
  content: '⭐';
  margin-right: 6px;
  font-size: 12px;
}

:deep(.el-form-item:has([prop="title"])) .el-input__inner,
:deep(.el-form-item:has([prop="contactPhone"])) .el-input__inner {
  border-left: 3px solid #4A90E2 !important;
  background: linear-gradient(90deg, rgba(74, 144, 226, 0.05) 0%, rgba(255, 255, 255, 0.98) 100%) !important;
}

/* 统一表单元素样式 - 使用最具体的选择器 */
/* 彻底修复输入框嵌套边框问题 */
/* 1. 完全重置Element UI的输入框样式 */
.publish-container :deep(.el-input) {
  --el-input-border-color: transparent !important;
  --el-input-hover-border-color: transparent !important;
  --el-input-focus-border-color: transparent !important;
  --el-input-bg-color: transparent !important;
  --el-input-text-color: #333 !important;
}

.publish-container :deep(.el-input .el-input__wrapper) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
  border-radius: 0 !important;
  outline: none !important;
  min-height: auto !important;
}

.publish-container :deep(.el-input .el-input__wrapper.is-focus) {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* 火箭模型样式 */
.rocket-container {
  position: fixed;
  top: 20%;
  left: -100px;
  width: 100px;
  height: 80px;
  z-index: 0;
  pointer-events: none;
  animation: rocketFly 10s ease-in-out infinite;
}

.rocket {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 火箭主体 - 平放设计 */
.rocket-body {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 70px;
  height: 30px;
  background: linear-gradient(90deg, #FF6B6B, #FFE66D);
  border-radius: 4px 8px 8px 4px;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

/* 火箭头部 - 平放设计 */
.rocket-nose {
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  border-left: 20px solid #FF6B6B;
}

/* 火箭窗口 - 平放设计 */
.rocket-window {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #4ECDC4;
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(78, 205, 196, 0.8);
}

/* 火箭尾翼 - 平放设计 */
.rocket-fins {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 40px;
}

.fin {
  position: absolute;
  background: #FF6B6B;
}

.fin-top {
  top: 0;
  left: 0;
  width: 15px;
  height: 20px;
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.fin-bottom {
  bottom: 0;
  left: 0;
  width: 15px;
  height: 20px;
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
}

/* 火箭火焰 - 真实毛笔刷尾焰效果 */
.rocket-flame {
  position: absolute;
  left: -85px;
  top: 50%;
  transform: translateY(-50%);
  width: 100px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.flame {
  position: relative;
  animation: realBrushFlame 1.5s ease-in-out infinite alternate;
}

.flame-1 {
  width: 90px;
  height: 35px;
  background: 
    radial-gradient(ellipse 50px 30px at 85% 50%, 
      rgba(255, 255, 200, 0.9) 0%,
      rgba(255, 220, 120, 0.8) 25%,
      rgba(255, 180, 60, 0.7) 50%,
      rgba(255, 120, 20, 0.5) 75%,
      rgba(200, 80, 0, 0.3) 90%,
      transparent 100%
    );
  border-radius: 0 0 20px 0;
  filter: blur(4px) contrast(1.3) brightness(1.2);
  box-shadow: 
    0 0 25px rgba(255, 220, 120, 0.7),
    0 0 50px rgba(255, 180, 60, 0.5),
    0 0 75px rgba(255, 120, 20, 0.3);
  transform-origin: left center;
  z-index: 3;
  /* 模拟毛笔刷的毛边效果 */
  mask: radial-gradient(ellipse 60px 35px at 85% 50%, 
    black 0%, 
    rgba(0, 0, 0, 0.8) 30%, 
    rgba(0, 0, 0, 0.4) 60%, 
    transparent 90%
  );
}

/* 真实毛笔刷火焰动画 - 圆润毛笔效果 */
@keyframes realBrushFlame {
  0% {
    transform: scaleX(1) scaleY(0.85);
    opacity: 0.9;
    filter: blur(4px) contrast(1.2) brightness(1.1);
    mask: radial-gradient(ellipse 55px 32px at 83% 50%, 
      black 0%, 
      rgba(0, 0, 0, 0.8) 28%, 
      rgba(0, 0, 0, 0.4) 58%, 
      transparent 88%
    );
  }
  25% {
    transform: scaleX(1.08) scaleY(0.78);
    opacity: 0.95;
    filter: blur(5px) contrast(1.4) brightness(1.3);
    mask: radial-gradient(ellipse 58px 30px at 86% 50%, 
      black 0%, 
      rgba(0, 0, 0, 0.8) 32%, 
      rgba(0, 0, 0, 0.4) 62%, 
      transparent 92%
    );
  }
  50% {
    transform: scaleX(1.12) scaleY(0.82);
    opacity: 1;
    filter: blur(3.5px) contrast(1.5) brightness(1.4);
    mask: radial-gradient(ellipse 52px 33px at 88% 50%, 
      black 0%, 
      rgba(0, 0, 0, 0.8) 26%, 
      rgba(0, 0, 0, 0.4) 56%, 
      transparent 86%
    );
  }
  75% {
    transform: scaleX(1.05) scaleY(0.88);
    opacity: 0.92;
    filter: blur(4.5px) contrast(1.2) brightness(1.25);
    mask: radial-gradient(ellipse 56px 29px at 84% 50%, 
      black 0%, 
      rgba(0, 0, 0, 0.8) 30%, 
      rgba(0, 0, 0, 0.4) 60%, 
      transparent 90%
    );
  }
  100% {
    transform: scaleX(1.1) scaleY(0.8);
    opacity: 0.88;
    filter: blur(3.8px) contrast(1.4) brightness(1.15);
    mask: radial-gradient(ellipse 54px 31px at 87% 50%, 
      black 0%, 
      rgba(0, 0, 0, 0.8) 29%, 
      rgba(0, 0, 0, 0.4) 59%, 
      transparent 89%
    );
  }
}

/* 火箭飞行动画 - 平放飞行 */
@keyframes rocketFly {
  0% {
    left: -100px;
    top: 20%;
    transform: translateY(-50%);
  }
  25% {
    top: 15%;
  }
  50% {
    top: 25%;
  }
  75% {
    top: 18%;
  }
  100% {
    left: calc(100vw + 100px);
    top: 20%;
    transform: translateY(-50%);
  }
}



.publish-container :deep(.el-input .el-input__wrapper:hover) {
  border: none !important;
  box-shadow: none !important;
}

/* 2. 只在内层输入框应用我们的样式 */
.publish-container :deep(.el-input .el-input__inner) {
  border-radius: 12px !important;
  border: 1px solid rgba(74, 144, 226, 0.3) !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
  outline: none !important;
  width: 100% !important;
}

.publish-container :deep(.el-input .el-input__inner:focus) {
  border-color: #4A90E2 !important;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15) !important;
  background: rgba(255, 255, 255, 1) !important;
  transform: translateY(-1px) !important;
}

/* 3. 文本域样式 */
.publish-container :deep(.el-textarea .el-textarea__wrapper) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}

.publish-container :deep(.el-textarea .el-textarea__inner) {
  border-radius: 12px !important;
  border: 1px solid rgba(74, 144, 226, 0.3) !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
  outline: none !important;
}

.publish-container :deep(.el-textarea .el-textarea__inner:focus) {
  border-color: #4A90E2 !important;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15) !important;
  background: rgba(255, 255, 255, 1) !important;
  transform: translateY(-1px) !important;
}

/* 4. 选择框样式 */
.publish-container :deep(.el-select .el-input__wrapper) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0 !important;
}

.publish-container :deep(.el-select .el-input__inner) {
  border-radius: 12px !important;
  border: 1px solid rgba(74, 144, 226, 0.3) !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.98) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  padding: 12px 16px !important;
  font-size: 14px !important;
  outline: none !important;
}

.publish-container :deep(.el-select .el-input__inner:focus) {
  border-color: #4A90E2 !important;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15) !important;
  background: rgba(255, 255, 255, 1) !important;
  transform: translateY(-1px) !important;
}

.publish-container :deep(.el-select) {
  width: 100% !important;
}

:deep(.el-radio-group) {
  width: 100%;
  padding: 12px 0;
}

:deep(.el-radio) {
  margin-right: 24px;
  margin-bottom: 12px;
}

:deep(.el-radio__label) {
  font-size: 14px;
  color: #2c3e50;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: #4A90E2;
  background: #4A90E2;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #4A90E2;
  font-weight: 600;
}

:deep(.el-switch) {
  --el-switch-on-color: #4A90E2;
  --el-switch-border-color: rgba(74, 144, 226, 0.3);
}

:deep(.el-switch.is-checked) {
  box-shadow: 0 0 8px rgba(74, 144, 226, 0.4);
}

.unit {
  margin-left: 10px;
  color: #666;
  font-weight: 600;
}

.price-estimate {
  margin-top: 40px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.08) 0%, rgba(255, 126, 130, 0.05) 100%);
  border-radius: 16px;
  border: 1px solid rgba(74, 144, 226, 0.2);
  backdrop-filter: blur(10px);
}

.price-estimate h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 700;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #666;
  font-size: 14px;
}

.price-total {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid rgba(74, 144, 226, 0.3);
  font-weight: 700;
  color: #333;
  font-size: 16px;
}

.total-amount {
  color: #4A90E2;
  font-size: 20px;
}

.confirm-info {
  max-width: 600px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.confirm-info h3 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #4A90E2, #FF7E82);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.confirm-price {
  color: #4A90E2;
  font-weight: 700;
  font-size: 20px;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 50px;
}

:deep(.el-button) {
  border-radius: 12px !important;
  font-weight: 600;
  padding: 14px 32px;
  font-size: 16px;
  border: none !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4A90E2 0%, #6BA8E9 50%, #4A90E2 100%) !important;
  color: white !important;
  background-size: 200% 100%;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(74, 144, 226, 0.5);
  background-position: 100% 0;
}

:deep(.el-button--primary:active) {
  transform: translateY(-1px);
}

:deep(.el-button--default) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%) !important;
  color: #4A90E2 !important;
  border: 2px solid rgba(74, 144, 226, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.el-button--default:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.2);
  border-color: #4A90E2 !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 0.95) 100%) !important;
}

/* 按钮加载动画 */
:deep(.el-button.is-loading) {
  position: relative;
}

:deep(.el-button.is-loading::before) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .publish-content {
    padding: 30px 20px;
    margin: 20px auto 0;
  }
  
  :deep(.el-steps) {
    padding: 20px;
  }
  
  .step-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  :deep(.el-button) {
    width: 100%;
  }
}
</style>
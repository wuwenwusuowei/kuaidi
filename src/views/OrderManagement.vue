<template>
  <div class="order-management-container">
    <!-- 星空风格背景装饰 -->
    <div class="starry-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>
    
    <!-- 校园风格页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <el-button 
            type="primary" 
            @click="goBack" 
            class="back-btn"
            :icon="ArrowLeft"
            size="small"
          >
            返回
          </el-button>
          <div class="header-title">
            <h1>订单管理</h1>
            <p>查看和管理所有订单</p>
          </div>
        </div>
        <div class="header-stats">
          <span class="stat-item">
            <span class="stat-number">{{ filteredOrders.length }}</span>
            <span class="stat-label">总订单</span>
          </span>
          <span class="stat-item">
            <span class="stat-number">{{ getPendingOrdersCount }}</span>
            <span class="stat-label">待处理</span>
          </span>
        </div>
      </div>
    </div>
    
    <div class="order-management-content">
      <!-- 状态筛选 -->
      <div class="status-filter">
        <el-radio-group v-model="activeStatus" @change="filterOrders">
          <el-radio-button label="all">全部订单</el-radio-button>
          <el-radio-button label="pending">待接单</el-radio-button>
          <el-radio-button label="accepted">已接单</el-radio-button>
          <el-radio-button label="picking">取件中</el-radio-button>
          <el-radio-button label="delivering">配送中</el-radio-button>
          <el-radio-button label="completed">已完成</el-radio-button>
          <el-radio-button label="cancelled">已取消</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 订单列表 -->
      <div class="order-list">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-result icon="info" title="正在加载订单" sub-title="请稍候...">
            <template #extra>
              <el-button type="primary" :loading="true">加载中</el-button>
            </template>
          </el-result>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredOrders.length === 0" class="empty-state">
          <el-empty :description="emptyDescription" />
        </div>

        <!-- 订单列表 -->
        <div v-else class="order-items">
          <el-card 
            v-for="order in filteredOrders" 
            :key="order.id"
            class="order-item"
            shadow="hover"
          >
            <template #header>
              <div class="order-header">
                <div class="order-title">
                  <h3>{{ order.title }}</h3>
                  <el-tag :type="getStatusType(order.status)" size="small">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                  <el-tag v-if="order.urgent" type="danger" size="small">加急</el-tag>
                </div>
                <div class="order-price">
                  <span class="price">¥{{ order.price.toFixed(2) }}</span>
                </div>
              </div>
            </template>

            <div class="order-content">
              <!-- 订单基本信息 -->
              <div class="order-info">
                <div class="info-row">
                  <span class="label">快递公司：</span>
                  <span>{{ order.expressCompany }}</span>
                </div>
                <div class="info-row">
                  <span class="label">取送地点：</span>
                  <span>{{ order.pickupLocation }} → {{ order.deliveryLocation }}</span>
                </div>

                <div class="info-row">
                  <span class="label">送达时间：</span>
                  <span>{{ formatTime(order.deliveryTime) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">联系电话：</span>
                  <span>{{ order.contactPhone }}</span>
                </div>
                <div v-if="order.delivererId" class="info-row">
                  <span class="label">接单员：</span>
                  <span>{{ delivererInfoCache[order.delivererId] || `接单员(${order.delivererId.substring(0, 8)})` }}</span>
                </div>
              </div>

              <!-- 订单进度时间轴 -->
              <div class="order-timeline">
                <el-timeline>
                  <el-timeline-item
                    timestamp="创建订单"
                    :type="order.status !== 'pending' ? 'primary' : 'info'"
                    placement="top"
                  >
                    <p>{{ formatTime(order.createdAt) }}</p>
                  </el-timeline-item>
                  
                  <el-timeline-item
                    v-if="order.status !== 'pending'"
                    timestamp="已接单"
                    :type="order.status !== 'accepted' ? 'primary' : 'info'"
                    placement="top"
                  >
                    <p v-if="order.status !== 'pending'">{{ formatTime(order.updatedAt) }}</p>
                  </el-timeline-item>
                  
                  <el-timeline-item
                    v-if="order.status === 'picking' || order.status === 'delivering' || order.status === 'completed'"
                    timestamp="取件中"
                    :type="order.status !== 'picking' ? 'primary' : 'info'"
                    placement="top"
                  >
                    <p v-if="order.status !== 'accepted'">代领员正在取件</p>
                  </el-timeline-item>
                  
                  <el-timeline-item
                    v-if="order.status === 'delivering' || order.status === 'awaiting_payment' || order.status === 'completed'"
                    timestamp="配送中"
                    :type="order.status !== 'delivering' ? 'primary' : 'info'"
                    placement="top"
                  >
                    <p v-if="order.status !== 'picking'">代领员正在配送</p>
                  </el-timeline-item>
                  
                  <el-timeline-item
                    v-if="order.status === 'awaiting_payment' || order.status === 'completed'"
                    timestamp="待支付"
                    :type="order.status !== 'awaiting_payment' ? 'primary' : 'warning'"
                    placement="top"
                  >
                    <p v-if="order.status === 'awaiting_payment'">等待用户支付</p>
                  </el-timeline-item>
                  
                  <el-timeline-item
                    v-if="order.status === 'completed'"
                    timestamp="已完成"
                    type="success"
                    placement="top"
                  >
                    <p>订单已完成</p>
                  </el-timeline-item>
                  
                  <el-timeline-item
                    v-if="order.status === 'cancelled'"
                    timestamp="已取消"
                    type="danger"
                    placement="top"
                  >
                    <p>订单已取消</p>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>

            <template #footer>
              <div class="order-actions">
                <!-- 订单发布者操作 -->
                <template v-if="order.requesterId === authStore.user?.id">
                  <el-button 
                    v-if="order.status === 'pending'"
                    type="danger" 
                    size="small"
                    @click="handleCancelOrder(order.id)"
                  >
                    取消订单
                  </el-button>
                  <el-button 
                    v-if="order.status === 'delivering'"
                    type="success" 
                    size="small"
                    @click="handlePayment(order)"
                  >
                    发起支付
                  </el-button>
                  <el-button 
                    v-if="order.status === 'awaiting_payment'"
                    type="success" 
                    size="small"
                    @click="handlePayment(order)"
                  >
                    发起支付
                  </el-button>
                  <el-button 
                    v-if="order.status === 'completed'"
                    type="primary" 
                    size="small"
                    @click="handleRateOrder(order)"
                  >
                    评价代领员
                  </el-button>
                  <!-- 联系沟通按钮 - 只在订单进行中显示 -->
                  <el-button 
                    v-if="order.status === 'accepted' || order.status === 'picking' || order.status === 'delivering' || order.status === 'awaiting_payment'"
                    type="primary" 
                    size="small"
                    @click="openChatWindow(order)"
                    class="chat-btn"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    联系沟通
                  </el-button>
                  
                  <el-button 
                    type="default" 
                    size="small"
                    @click="showOrderDetail(order)"
                  >
                    查看详情
                  </el-button>
                </template>

                <!-- 代领员操作 -->
                <template v-else-if="order.delivererId === authStore.user?.id">
                  <el-button 
                    v-if="order.status === 'accepted'"
                    type="primary" 
                    size="small"
                    @click="handleUpdateStatus(order.id, 'picking')"
                  >
                    开始取件
                  </el-button>
                  <el-button 
                    v-if="order.status === 'picking'"
                    type="success" 
                    size="small"
                    @click="handleUpdateStatus(order.id, 'delivering')"
                  >
                    开始配送
                  </el-button>
                  <el-button 
                    v-if="order.status === 'delivering'"
                    type="warning" 
                    size="small"
                    @click="handleUpdateStatus(order.id, 'awaiting_payment')"
                  >
                    完成配送
                  </el-button>
                  <el-button 
                    v-if="order.status === 'awaiting_payment'"
                    type="success" 
                    size="small"
                    @click="handleCompletePayment(order)"
                  >
                    确认支付完成
                  </el-button>
                  <!-- 联系沟通按钮 - 只在订单进行中显示 -->
                  <el-button 
                    v-if="order.status === 'accepted' || order.status === 'picking' || order.status === 'delivering' || order.status === 'awaiting_payment'"
                    type="primary" 
                    size="small"
                    @click="openChatWindow(order)"
                    class="chat-btn"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    联系沟通
                  </el-button>
                  
                  <el-button 
                    type="default" 
                    size="small"
                    @click="showOrderDetail(order)"
                  >
                    查看详情
                  </el-button>
                </template>

                <!-- 其他用户查看 -->
                <template v-else>
                  <!-- 联系沟通按钮 - 只在订单进行中显示 -->
                  <el-button 
                    v-if="order.status === 'accepted' || order.status === 'picking' || order.status === 'delivering' || order.status === 'awaiting_payment'"
                    type="primary" 
                    size="small"
                    @click="openChatWindow(order)"
                    class="chat-btn"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                    联系沟通
                  </el-button>
                  
                  <el-button 
                    type="default" 
                    size="small"
                    @click="showOrderDetail(order)"
                  >
                    查看详情
                  </el-button>
                </template>
              </div>
            </template>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="selectedOrder?.title"
      width="900px"
      class="order-detail-dialog"
    >
      <div v-if="selectedOrder" class="order-detail">
        <!-- 订单信息标签页 -->
        <el-tabs v-model="activeDetailTab" type="card">
          <!-- 订单信息标签页 -->
          <el-tab-pane label="订单信息" name="info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="订单状态">
                <el-tag :type="getStatusType(selectedOrder.status)">
                  {{ getStatusText(selectedOrder.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="订单金额">
                <span class="detail-price">¥{{ selectedOrder.price.toFixed(2) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="快递公司">{{ selectedOrder.expressCompany }}</el-descriptions-item>
              <el-descriptions-item label="快递单号">{{ selectedOrder.trackingNumber }}</el-descriptions-item>
              <el-descriptions-item label="物品描述">{{ selectedOrder.description }}</el-descriptions-item>
              <el-descriptions-item label="物品重量">{{ selectedOrder.weight }}公斤</el-descriptions-item>
              <el-descriptions-item label="物品尺寸">{{ selectedOrder.size }}</el-descriptions-item>
              <el-descriptions-item label="取件地点">{{ selectedOrder.pickupLocation }}</el-descriptions-item>
              <el-descriptions-item label="送达地点">{{ selectedOrder.deliveryLocation }}</el-descriptions-item>
              <el-descriptions-item label="送达时间">{{ formatTime(selectedOrder.deliveryTime) }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ selectedOrder.contactPhone }}</el-descriptions-item>
              <el-descriptions-item label="取件码">{{ selectedOrder.pickupCode || '无' }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatTime(selectedOrder.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatTime(selectedOrder.updatedAt) }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- 聊天功能标签页 -->
          <el-tab-pane label="联系沟通" name="chat">
            <div class="chat-section">
              <div class="chat-header-info">
                <h4>订单沟通</h4>
                <p class="chat-tip">
                  与{{ getChatPartnerName(selectedOrder) }}沟通订单详情
                </p>
              </div>
              
              <!-- 聊天窗口 -->
              <ChatWindow
                v-if="selectedOrder && authStore.user"
                :order-id="selectedOrder.id"
                :current-user-id="authStore.user.id"
                :other-user-id="getChatPartnerId(selectedOrder)"
                :other-user-name="getChatPartnerName(selectedOrder)"
                :chat-title="`订单沟通 - ${selectedOrder.title}`"
                @close="closeChat"
                @message-sent="handleMessageSent"
                @message-received="handleMessageReceived"
              />
              
              <!-- 未登录提示 -->
              <div v-else class="chat-login-prompt">
                <el-result icon="info" title="请先登录" sub-title="登录后即可与对方沟通">
                  <template #extra>
                    <el-button type="primary" @click="goToLogin">立即登录</el-button>
                  </template>
                </el-result>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 支付对话框 -->
    <el-dialog
      v-model="paymentDialogVisible"
      :title="`支付订单费用 - ¥${currentPaymentOrder?.price.toFixed(2)}`"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div v-if="currentPaymentOrder" class="payment-dialog">
        <!-- 支付状态显示 -->
        <div class="payment-status">
          <el-steps :active="paymentStatus === 'pending' ? 1 : paymentStatus === 'paid' ? 2 : 3" align-center>
            <el-step title="扫码支付" description="使用微信扫描二维码" />
            <el-step title="支付成功" description="等待系统确认" />
            <el-step title="完成" description="订单支付完成" />
          </el-steps>
        </div>

        <!-- 加载状态 -->
        <div v-if="paymentStatus === 'pending' && !delivererPaymentInfo" class="loading-section">
          <el-result icon="info" title="正在加载支付信息" sub-title="请稍候...">
            <template #extra>
              <el-button type="primary" :loading="true">加载中</el-button>
            </template>
          </el-result>
        </div>

        <!-- 支付二维码 -->
        <div v-else-if="paymentStatus === 'pending' && delivererPaymentInfo" class="qr-code-section">
          <div class="qr-code-container">
            <div v-if="paymentQRCodeLoading" class="qr-code-loading">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>二维码加载中...</span>
            </div>
            <img 
              :src="paymentQRCodeUrl" 
              alt="微信支付二维码" 
              class="qr-code" 
              @load="paymentQRCodeLoading = false"
              @error="paymentQRCodeLoading = false"
              v-show="!paymentQRCodeLoading"
            />
            <p class="qr-code-tip">请使用{{ delivererPaymentInfo?.wechat_qr_code_url ? '微信' : '支付宝' }}扫描二维码完成支付</p>
            <p class="payment-amount">支付金额：¥{{ currentPaymentOrder.price.toFixed(2) }}</p>
            <p class="payment-note">备注：订单 {{ currentPaymentOrder.title }}</p>
          </div>
          
          <!-- 接单人信息 -->
          <div class="deliverer-info">
            <h4>收款人信息</h4>
            <p v-if="delivererPaymentInfo?.wechat_qr_code_url">
              微信昵称：{{ delivererPaymentInfo?.wechat_nickname || '微信用户' }}
            </p>
            <p v-if="delivererPaymentInfo?.alipay_qr_code_url && !delivererPaymentInfo?.wechat_qr_code_url">
              支付宝账号：{{ delivererPaymentInfo?.alipay_account || '支付宝用户' }}
            </p>
            <p class="contact-tip">支付完成后请截图保存凭证，如有问题请联系接单人</p>
          </div>
        </div>

        <!-- 支付成功提示 -->
        <div v-else-if="paymentStatus === 'paid'" class="payment-success">
          <el-result icon="success" title="支付成功" sub-title="请等待接单人确认收款">
            <template #extra>
              <el-button type="primary" @click="confirmPayment">关闭</el-button>
            </template>
          </el-result>
        </div>

        <!-- 操作按钮 -->
        <div class="payment-actions">
          <el-button 
            v-if="paymentStatus === 'pending' && delivererPaymentInfo" 
            @click="handleConfirmPayment" 
            type="primary"
          >
            我已支付完成
          </el-button>
          <el-button 
            v-if="paymentStatus === 'pending'" 
            @click="cancelPayment"
            :disabled="!delivererPaymentInfo"
          >
            取消支付
          </el-button>
          <el-button v-if="paymentStatus === 'paid'" type="primary" @click="confirmPayment">关闭</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '../stores/order'
import { useAuthStore } from '../stores/auth'
import { PaymentService } from '../services/paymentService'
import { UserPaymentService } from '../services/userPaymentService'
import { UserService } from '../services/userService'
import ChatWindow from '../components/ChatWindow.vue'
import type { Order } from '../stores/order'
import { Loading, ArrowLeft, ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()
const orderStore = useOrderStore()
const authStore = useAuthStore()

// 状态筛选
const activeStatus = ref('all')

// 订单相关
const orders = ref<Order[]>([])
const selectedOrder = ref<Order | null>(null)
const detailDialogVisible = ref(false)
const loading = ref(true)

// 聊天相关
const activeDetailTab = ref('info') // 默认显示订单信息标签页

// 支付相关
const paymentDialogVisible = ref(false)
const currentPaymentOrder = ref<Order | null>(null)
const delivererPaymentInfo = ref<any>(null)
const paymentStatus = ref<'pending' | 'paid' | 'confirmed'>('pending')
const paymentQRCodeUrl = ref('')
const paymentQRCodeLoading = ref(false)
const paymentTimer = ref<NodeJS.Timeout | null>(null)

// 接单员信息缓存
const delivererInfoCache = reactive<Record<string, string>>({})

// 过滤后的订单列表
const filteredOrders = computed(() => {
  let filtered = orders.value
  
  if (activeStatus.value !== 'all') {
    filtered = filtered.filter(order => order.status === activeStatus.value)
  }
  
  // 自定义排序逻辑：未完成的订单在最上面，然后按更新时间倒序排列
  return filtered.sort((a, b) => {
    // 定义订单状态优先级：未完成的在前，已完成的在后
    const statusPriority = {
      'pending': 1,
      'accepted': 2,
      'picking': 3,
      'delivering': 4,
      'awaiting_payment': 5,
      'completed': 6,
      'cancelled': 7
    }
    
    // 先按状态优先级排序（未完成的在前）
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status]
    }
    
    // 相同状态的按更新时间倒序排列（最新的在前）
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

// 空状态描述
const emptyDescription = computed(() => {
  if (activeStatus.value === 'all') {
    return '暂无订单'
  }
  return `暂无${getStatusText(activeStatus.value)}的订单`
})

// 待处理订单数量
const getPendingOrdersCount = computed(() => {
  return orders.value.filter(order => 
    ['pending', 'accepted', 'picking', 'delivering', 'awaiting_payment'].includes(order.status)
  ).length
})

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    pending: 'info',
    accepted: 'primary',
    picking: 'warning',
    delivering: 'warning',
    awaiting_payment: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    pending: '待接单',
    accepted: '已接单',
    picking: '取件中',
    delivering: '配送中',
    awaiting_payment: '待支付',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

// 格式化时间
const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 返回
const goBack = () => {
  router.push('/home')
}

// 筛选订单
const filterOrders = () => {
  // 过滤逻辑已在 computed 中实现
}

// 显示订单详情
const showOrderDetail = (order: Order) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
  // 重置为订单信息标签页
  activeDetailTab.value = 'info'
}

// 获取聊天对象ID
const getChatPartnerId = (order: Order): string => {
  if (!authStore.user) return ''
  
  // 如果当前用户是委托人，则聊天对象是接单员
  if (order.requesterId === authStore.user.id) {
    return order.delivererId || ''
  }
  
  // 如果当前用户是接单员，则聊天对象是委托人
  if (order.delivererId === authStore.user.id) {
    return order.requesterId
  }
  
  return ''
}

// 获取聊天对象名称
const getChatPartnerName = (order: Order): string => {
  if (!authStore.user) return '对方'
  
  // 如果当前用户是委托人，则聊天对象是接单员
  if (order.requesterId === authStore.user.id) {
    return order.delivererId ? `接单员(${order.delivererId.substring(0, 8)})` : '接单员'
  }
  
  // 如果当前用户是接单员，则聊天对象是委托人
  if (order.delivererId === authStore.user.id) {
    return `委托人(${order.requesterId.substring(0, 8)})`
  }
  
  return '对方'
}

// 关闭聊天
const closeChat = () => {
  // 可以添加一些清理逻辑
  console.log('聊天窗口已关闭')
}

// 处理消息发送事件
const handleMessageSent = (message: any) => {
  console.log('消息发送成功:', message)
  ElMessage.success('消息发送成功')
}

// 处理消息接收事件
const handleMessageReceived = (message: any) => {
  console.log('收到新消息:', message)
  // 可以在这里添加通知逻辑，比如显示桌面通知或播放声音
}

// 打开聊天窗口
const openChatWindow = (order: Order) => {
  if (!authStore.user) {
    ElMessage.error('请先登录')
    return
  }
  
  // 检查订单状态，只有非待接单和非已取消的订单才能聊天
  if (order.status === 'pending' || order.status === 'cancelled') {
    ElMessage.warning('该订单当前无法进行沟通')
    return
  }
  
  // 设置当前订单为聊天订单
  selectedOrder.value = order
  
  // 切换到聊天标签页
  activeDetailTab.value = 'chat'
  
  // 打开详情对话框（会自动显示聊天标签页）
  detailDialogVisible.value = true
  
  ElMessage.success('已打开聊天窗口，开始沟通吧！')
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 取消订单
const handleCancelOrder = async (orderId: string) => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '取消订单', {
      confirmButtonText: '确定取消',
      cancelButtonText: '再想想',
      type: 'warning'
    })
    
    await orderStore.cancelOrder(orderId)
    ElMessage.success('订单已取消')
    loadOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

// 更新订单状态
const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
  try {
    const statusText = getStatusText(status)
    await ElMessageBox.confirm(`确定要将订单状态更新为"${statusText}"吗？`, '更新状态', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.updateOrderStatus(orderId, status)
    ElMessage.success('状态更新成功')
    loadOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '状态更新失败')
    }
  }
}

// 评价订单
const handleRateOrder = (order: Order) => {
  ElMessage.info('评价功能开发中...')
}

// 委托人发起支付（显示二维码）
const handlePayment = async (order: Order) => {
  try {
    if (!authStore.user) {
      ElMessage.error('请先登录')
      return
    }

    if (!order.delivererId) {
      ElMessage.error('订单尚未被接单，无法支付')
      return
    }

    // 检查当前用户是否是委托人
    if (order.requesterId !== authStore.user.id) {
      ElMessage.error('只有委托人可以进行支付操作')
      return
    }

    // 立即显示支付对话框，提升用户体验
    delivererPaymentInfo.value = null
    currentPaymentOrder.value = order
    paymentStatus.value = 'pending'
    paymentDialogVisible.value = true

    // 异步加载支付信息（不阻塞界面显示）
    const loadPaymentInfo = async () => {
      try {
        // 获取接单人的支付信息
        const paymentInfoResult = await UserPaymentService.getUserPaymentInfo(order.delivererId)
        if (!paymentInfoResult.success) {
          ElMessage.error('获取接单人支付信息失败：' + (paymentInfoResult.error || '网络错误'))
          paymentDialogVisible.value = false
          return
        }
        
        if (!paymentInfoResult.data) {
          ElMessage.error('接单人尚未设置支付信息，请联系接单人')
          paymentDialogVisible.value = false
          return
        }

        delivererPaymentInfo.value = paymentInfoResult.data

        // 检查接单人是否设置了收款二维码
        if (!paymentInfoResult.data.wechat_qr_code_url && !paymentInfoResult.data.alipay_qr_code_url) {
          ElMessage.error('接单人未设置收款二维码，请联系接单人协商支付方式')
          paymentDialogVisible.value = false
          return
        }

        // 使用接单人的微信收款二维码（优先使用微信）
        if (paymentInfoResult.data.wechat_qr_code_url) {
          paymentQRCodeUrl.value = paymentInfoResult.data.wechat_qr_code_url
        } else if (paymentInfoResult.data.alipay_qr_code_url) {
          paymentQRCodeUrl.value = paymentInfoResult.data.alipay_qr_code_url
        }

        // 并行执行数据库操作
        const [paymentResult, statusResult] = await Promise.all([
          PaymentService.createPayment(
            order.id,
            authStore.user.id,
            order.delivererId,
            order.price
          ),
          orderStore.updateOrderStatus(order.id, 'awaiting_payment')
        ])

        if (!paymentResult.success) {
          ElMessage.error('创建支付记录失败')
          paymentDialogVisible.value = false
          return
        }

        // 设置支付二维码到数据库（不阻塞界面）
        PaymentService.setPaymentQRCode(paymentResult.data!.id, paymentQRCodeUrl.value)
          .catch(error => console.warn('设置支付二维码失败:', error))

      } catch (error: any) {
        console.error('加载支付信息失败:', error)
        ElMessage.error('加载支付信息失败')
        paymentDialogVisible.value = false
      }
    }

    // 启动异步加载
    loadPaymentInfo()

  } catch (error: any) {
    console.error('发起支付失败:', error)
    ElMessage.error('发起支付失败')
    paymentDialogVisible.value = false
  }
}

// 接单员确认支付完成
const handleCompletePayment = async (order: Order) => {
  try {
    if (!authStore.user) {
      ElMessage.error('请先登录')
      return
    }

    // 检查当前用户是否是接单员
    if (order.delivererId !== authStore.user.id) {
      ElMessage.error('只有接单员可以确认支付完成')
      return
    }

    await ElMessageBox.confirm('确认已收到款项并完成订单吗？', '确认支付完成', {
      confirmButtonText: '确认完成',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 更新订单状态为已完成
    await orderStore.updateOrderStatus(order.id, 'completed')
    
    // 更新支付状态为已确认
    const paymentResult = await PaymentService.getPaymentByOrderId(order.id)
    if (paymentResult.success && paymentResult.data) {
      await PaymentService.updatePaymentStatus(paymentResult.data.id, 'confirmed')
    }

    ElMessage.success('支付确认完成！订单已完成')
    
    // 重新加载订单列表
    loadOrders()

  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('确认支付完成失败:', error)
      ElMessage.error('确认支付完成失败')
    }
  }
}

// 委托人手动确认支付完成
const handleConfirmPayment = async () => {
  try {
    if (!currentPaymentOrder.value) return
    
    await ElMessageBox.confirm(
      '请确认您已完成扫码支付。支付完成后请截图保存凭证。',
      '确认支付完成',
      {
        confirmButtonText: '我已支付完成',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 更新支付状态为已支付
    paymentStatus.value = 'paid'
    
    // 更新订单状态为待确认
    await orderStore.updateOrderStatus(currentPaymentOrder.value.id, 'awaiting_payment')
    
    ElMessage.success('支付确认成功！请等待接单人确认收款')
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('确认支付失败:', error)
      ElMessage.error('确认支付失败')
    }
  }
}

// 关闭支付对话框（委托人支付后关闭）
const confirmPayment = () => {
  paymentDialogVisible.value = false
  ElMessage.info('支付流程已开始，请等待接单人确认收款')
}

// 取消支付
const cancelPayment = () => {
  if (paymentTimer.value) {
    clearInterval(paymentTimer.value)
    paymentTimer.value = null
  }
  paymentDialogVisible.value = false
  ElMessage.info('支付已取消')
}

// 强制删除订单
const handleForceDelete = async (orderId: string) => {
  try {
    await ElMessageBox.confirm('确定要强制删除这个订单吗？此操作不可逆！', '强制删除订单', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    })
    
    // 调用订单服务的删除方法
    // 这里需要先实现订单服务的删除功能
    // 暂时使用取消订单的方法
    await orderStore.cancelOrder(orderId)
    ElMessage.success('订单已删除')
    
    // 重新加载订单列表
    loadOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error)
      ElMessage.error(error.message || '删除订单失败')
    }
  }
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (paymentTimer.value) {
    clearInterval(paymentTimer.value)
    paymentTimer.value = null
  }
})

// 获取接单员昵称
const getDelivererNickname = async (delivererId: string) => {
  try {
    // 如果缓存中已有数据，直接返回
    if (delivererInfoCache[delivererId]) {
      return delivererInfoCache[delivererId]
    }
    
    // 从数据库获取用户信息
    const result = await UserService.getUserById(delivererId)
    if (result.success && result.data) {
      const nickname = result.data.nickname
      // 更新缓存
      delivererInfoCache[delivererId] = nickname
      return nickname
    }
    
    return null
  } catch (error) {
    console.error('获取接单员昵称失败:', error)
    return null
  }
}

// 批量预加载接单员信息
const preloadDelivererInfo = async (orders: Order[]) => {
  try {
    // 收集所有需要查询的接单员ID
    const delivererIds = orders
      .filter(order => order.delivererId && !delivererInfoCache[order.delivererId])
      .map(order => order.delivererId)
      .filter((id): id is string => id !== undefined)
    
    if (delivererIds.length === 0) return
    
    // 批量获取用户信息
    const result = await UserService.getUsersByIds(delivererIds)
    if (result.success && result.data) {
      // 更新缓存
      result.data.forEach(user => {
        delivererInfoCache[user.id] = user.nickname
      })
    }
  } catch (error) {
    console.error('预加载接单员信息失败:', error)
  }
}

// 加载订单列表
const loadOrders = async () => {
  try {
    loading.value = true
    
    // 检查用户是否已登录
    if (!authStore.user) {
      ElMessage.warning('请先登录以查看订单')
      orders.value = []
      return
    }
    
    // 显示用户发布的所有订单和接单的订单
    const userOrders = await orderStore.getUserOrders()
    const delivererOrders = await orderStore.getDelivererOrders()
    
    console.log('用户订单结果:', userOrders)
    console.log('代领订单结果:', delivererOrders)
    
    // 确保都是数组，防止undefined
    const userOrdersArray = Array.isArray(userOrders) ? userOrders : []
    const delivererOrdersArray = Array.isArray(delivererOrders) ? delivererOrders : []
    
    // 合并并去重
    const allOrders = [...userOrdersArray, ...delivererOrdersArray]
    const uniqueOrders = allOrders.filter((order, index, self) => 
      index === self.findIndex(o => o.id === order.id)
    )
    
    console.log('合并后的订单列表:', uniqueOrders)
    
    orders.value = uniqueOrders
    
    // 预加载接单员信息（不阻塞界面）
    preloadDelivererInfo(uniqueOrders)
    
    if (uniqueOrders.length === 0) {
      ElMessage.info('暂无订单数据')
    }
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败，请检查网络连接')
    orders.value = []
  } finally {
    loading.value = false
  }
}

// 初始化加载订单列表
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-management-container {
  min-height: 100vh;
  background: transparent; /* 移除原有背景，让星空背景显示 */
  padding: 0;
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
  pointer-events: none !important;
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
  pointer-events: none !important;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 1) 1px, transparent 1px),
    radial-gradient(circle at 20% 40%, rgba(255, 255, 255, 0.9) 1px, transparent 1px),
    radial-gradient(circle at 30% 60%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    radial-gradient(circle at 60% 10%, rgba(255, 255, 255, 0.9) 1px, transparent 1px),
    radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
    radial-gradient(circle at 90% 70%, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
  background-size: 100px 100px, 150px 150px, 200px 200px, 250px 250px, 
                  120px 120px, 180px 180px, 220px 220px, 280px 280px;
  animation: twinkle 8s ease-in-out infinite;
  pointer-events: none !important;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.order-management-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(64, 158, 255, 0.05) 2px, transparent 2px),
    radial-gradient(circle at 90% 80%, rgba(103, 194, 58, 0.05) 2px, transparent 2px);
  background-size: 50px 50px;
  z-index: 0;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-title h1 {
  margin: 0 0 4px 0;
  font-size: 32px;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #409EFF, #67C23A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-title p {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.header-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 主要内容区域 */
.order-management-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  position: relative;
  z-index: 1;
}

/* 状态筛选 */
.status-filter {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.el-radio-group) {
  width: 100%;
}

:deep(.el-radio-button) {
  flex: 1;
}

:deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: 12px !important;
  font-size: 14px;
  font-weight: 600;
  padding: 16px 20px;
  border: 2px solid transparent !important;
  transition: all 0.3s ease;
}

:deep(.el-radio-button__inner:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: linear-gradient(135deg, #409EFF 0%, #337AB7 100%) !important;
  border-color: #409EFF !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 订单列表 */
.order-list {
  min-height: 500px;
}

.empty-state {
  background: white;
  border-radius: 16px;
  padding: 80px 20px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 订单卡片样式 */
.order-item {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.order-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
}

.order-item:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
}

:deep(.el-card__header) {
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.order-title {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.order-title h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.price {
  color: var(--primary-color);
  font-size: 24px;
  font-weight: 700;
}

:deep(.el-card__body) {
  padding: 24px;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 20px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-row {
  display: flex;
  align-items: flex-start;
}

.label {
  color: #666;
  font-weight: 600;
  min-width: 100px;
  font-size: 14px;
}

.info-row span:last-child {
  color: #333;
  font-size: 14px;
  flex: 1;
}

.order-timeline {
  max-height: 200px;
  overflow-y: auto;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(103, 194, 58, 0.03) 100%);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

:deep(.el-timeline-item__timestamp) {
  font-weight: 600;
  color: #666;
  font-size: 12px;
}

:deep(.el-timeline-item__node) {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-timeline-item__content) {
  font-size: 14px;
  color: #333;
}

:deep(.el-card__footer) {
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.order-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 订单详情对话框 */
.order-detail {
  max-height: 500px;
  overflow-y: auto;
}

.detail-price {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 18px;
}

:deep(.el-descriptions__label) {
  width: 100px;
  font-weight: 600;
  color: #666;
}

:deep(.el-descriptions__content) {
  color: #333;
}

/* 支付对话框样式 */
.payment-dialog {
  text-align: center;
}

.payment-status {
  margin-bottom: 30px;
}

:deep(.el-step__title) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.el-step__description) {
  font-size: 12px;
  color: #666;
}

.qr-code-section {
  margin: 20px 0;
}

.qr-code-container {
  margin-bottom: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 10px;
  background: white;
}

.qr-code-tip {
  margin: 10px 0 5px 0;
  color: #666;
  font-size: 14px;
}

.payment-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 10px 0;
}

.deliverer-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: left;
}

.deliverer-info h4 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.deliverer-info p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.contact-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.payment-success {
  margin: 30px 0;
}

.payment-actions {
  margin-top: 20px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-left {
    flex-direction: column;
    gap: 12px;
  }
  
  .header-stats {
    gap: 20px;
  }
  
  .order-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .order-actions {
    flex-direction: column;
  }
  
  .order-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .order-header {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .order-management-content {
    padding: 20px 16px;
  }
  
  .header-content {
    padding: 16px;
  }
  
  .header-title h1 {
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  :deep(.el-radio-button__inner) {
    font-size: 12px;
    padding: 8px 12px;
  }
}

/* 加载状态 */
.loading-state {
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 订单详情对话框样式 */
.order-detail-dialog {
  max-height: 80vh;
}

.order-detail-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.order-detail-dialog :deep(.el-tabs) {
  height: 100%;
}

.order-detail-dialog :deep(.el-tabs__content) {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

/* 聊天区域样式 */
.chat-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header-info {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.chat-header-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chat-tip {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.chat-login-prompt {
  text-align: center;
  padding: 40px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-detail-dialog {
    width: 95% !important;
    max-width: 95% !important;
  }
  
  .order-detail-dialog :deep(.el-tabs__content) {
    padding: 16px;
    max-height: 400px;
  }
}
</style>
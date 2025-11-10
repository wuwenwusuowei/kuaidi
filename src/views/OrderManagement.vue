<template>
  <div class="order-management-container">
    <!-- Starry sky background with Aurora effect -->
    <div class="starry-background">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
      <!-- Aurora Borealis Background - Smooth ethereal light formations -->
    <div class="aurora-container">
      <!-- Extremely soft curved aurora beams - flowing northern lights effect -->
      <div class="aurora-veil aurora-main"></div>
      <div class="aurora-veil aurora-secondary"></div>
      <div class="aurora-veil aurora-tertiary"></div>
      <div class="aurora-veil aurora-quaternary"></div>
      <div class="aurora-veil aurora-quinary"></div>
      <div class="aurora-veil aurora-senary"></div>
      <!-- Background ethereal ambient glow -->
      <div class="aurora-glow"></div>
    </div>
    </div>
    
    <!-- Page header -->
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
      <!-- Combined filter card with star-themed styling -->
      <div class="combined-filter-card">
        <div class="filter-header">
          <h3 class="filter-title">✨ 筛选条件</h3>
          <div class="filter-stats">
            <span class="stat-badge">{{ filteredOrders.length }} 个订单</span>
          </div>
        </div>
        
        <div class="filter-content">
          <div class="status-filter-section">
            <span class="filter-label">📊 状态：</span>
            <el-radio-group v-model="activeStatus" @change="filterOrders" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="pending">待接单</el-radio-button>
              <el-radio-button label="accepted">已接单</el-radio-button>
              <el-radio-button label="picking">取件中</el-radio-button>
              <el-radio-button label="delivering">配送中</el-radio-button>
              <el-radio-button label="completed">已完成</el-radio-button>
              <el-radio-button label="cancelled">已取消</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="date-filter-section">
            <span class="filter-label">📅 日期：</span>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="filterOrdersByDate"
              size="small"
              style="width: 280px;"
            />
          </div>
        </div>
      </div>

      <!-- Order list -->
      <div class="order-list">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <el-result icon="info" title="正在加载订单" sub-title="请稍候...">
            <template #extra>
              <el-button type="primary" :loading="true">加载中</el-button>
            </template>
          </el-result>
        </div>

        <!-- Empty state -->
        <div v-else-if="pagedOrders.length === 0" class="empty-state">
          <el-empty :description="emptyDescription" />
        </div>

        <!-- Order items -->
        <div v-else class="order-items">
          <div 
            v-for="order in pagedOrders" 
            :key="order.id"
            class="order-card"
          >
            <div class="order-card-header">
              <div class="order-title-section">
                <h3 class="order-title">{{ order.title }}</h3>
                <div class="order-tags">
                  <el-tag :type="getStatusType(order.status)" size="small">
                    {{ getStatusText(order.status) }}
                  </el-tag>
                  <el-tag v-if="order.urgent" type="danger" size="small">🔥 加急</el-tag>
                </div>
              </div>
              <div class="order-price-badge">
                <span class="price-label">价格</span>
                <span class="price-amount">¥{{ order.price.toFixed(2) }}</span>
              </div>
            </div>

            <div class="order-card-body">
              <div class="order-details">
                <div class="detail-row">
                  <span class="detail-label">📦 快递公司：</span>
                  <span class="detail-value">{{ order.expressCompany }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">📍 取送地点：</span>
                  <span class="detail-value">{{ order.pickupLocation }} → {{ order.deliveryLocation }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">⏰ 送达时间：</span>
                  <span class="detail-value">{{ formatTime(order.deliveryTime) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">📞 联系电话：</span>
                  <span class="detail-value">{{ order.contactPhone }}</span>
                </div>
                <div v-if="order.delivererId" class="detail-row">
                  <span class="detail-label">👤 接单员：</span>
                  <span class="detail-value">{{ delivererInfoCache[order.delivererId] || `接单员(${order.delivererId.substring(0, 8)})` }}</span>
                </div>
              </div>

              <div class="order-actions">
                <el-button 
                  v-if="order.status === 'pending'"
                  type="danger" 
                  size="small"
                  @click="cancelOrder(order.id)"
                >
                  取消
                </el-button>
                <el-button 
                  type="info" 
                  size="small"
                  @click="viewDetails(order)"
                >
                  详情
                </el-button>
                <el-button 
                  v-if="order.requesterId === authStore.user?.id && order.status === 'delivering'"
                  type="success" 
                  size="small"
                  @click="handlePayment(order)"
                >
                  发起支付
                </el-button>
                <el-button 
                  v-if="order.requesterId === authStore.user?.id && order.status === 'awaiting_payment'"
                  type="success" 
                  size="small"
                  @click="handlePayment(order)"
                >
                  发起支付
                </el-button>
                <el-button 
                  v-if="order.requesterId === authStore.user?.id && order.status === 'completed'"
                  type="primary" 
                  size="small"
                  @click="handleRateOrder(order)"
                >
                  评价代领员
                </el-button>
                <el-button 
                  v-if="order.delivererId === authStore.user?.id && order.status === 'accepted'"
                  type="primary" 
                  size="small"
                  @click="handleUpdateStatus(order.id, 'picking')"
                >
                  开始取件
                </el-button>
                <el-button 
                  v-if="order.delivererId === authStore.user?.id && order.status === 'picking'"
                  type="success" 
                  size="small"
                  @click="handleUpdateStatus(order.id, 'delivering')"
                >
                  开始配送
                </el-button>
                <el-button 
                  v-if="order.delivererId === authStore.user?.id && order.status === 'delivering'"
                  type="warning" 
                  size="small"
                  @click="handleUpdateStatus(order.id, 'awaiting_payment')"
                >
                  完成配送
                </el-button>
                <el-button 
                  v-if="order.delivererId === authStore.user?.id && order.status === 'awaiting_payment'"
                  type="success" 
                  size="small"
                  @click="handleCompletePayment(order)"
                >
                  确认支付完成
                </el-button>
                <el-button 
                  v-if="order.status !== 'pending' && order.status !== 'cancelled'"
                  type="default" 
                  size="small"
                  @click="openChatWindow(order)"
                  class="chat-btn"
                >
                  <el-icon><ChatDotRound /></el-icon>
                  联系沟通
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div v-if="filteredOrders.length > pageSize" class="pagination-container">
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[2]"
              :total="filteredOrders.length"
              layout="prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
            
            <!-- 自定义跳转组件 -->
            <div class="custom-jumper">
              <span class="jumper-label">跳转至</span>
              <input
                v-model="jumperInput"
                type="number"
                min="1"
                :max="totalPages"
                class="jumper-input"
                placeholder="页码"
                @keyup.enter="handleJumper"
              />
              <button class="jumper-button" @click="handleJumper">
                跳转
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order detail dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="selectedOrder?.title"
      width="900px"
      class="order-detail-dialog"
    >
      <div v-if="selectedOrder" class="order-detail">
        <el-tabs v-model="activeDetailTab" type="card">
          <!-- Order info tab -->
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

          <!-- Chat tab -->
          <el-tab-pane label="联系沟通" name="chat">
            <div class="chat-section">
              <div class="chat-header-info">
                <h4>订单沟通</h4>
                <p class="chat-tip">
                  与{{ getChatPartnerName(selectedOrder) }}沟通订单详情
                </p>
              </div>
              
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

    <!-- Payment dialog -->
    <el-dialog
      v-model="paymentDialogVisible"
      :title="`支付订单费用 - ¥${currentPaymentOrder?.price.toFixed(2)}`"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div v-if="currentPaymentOrder" class="payment-dialog">
        <div class="payment-status">
          <el-steps :active="paymentStatus === 'pending' ? 1 : paymentStatus === 'paid' ? 2 : 3" align-center>
            <el-step title="扫码支付" description="使用微信扫描二维码" />
            <el-step title="支付成功" description="等待系统确认" />
            <el-step title="完成" description="订单支付完成" />
          </el-steps>
        </div>

        <div v-if="paymentStatus === 'pending' && !delivererPaymentInfo" class="loading-section">
          <el-result icon="info" title="正在加载支付信息" sub-title="请稍候...">
            <template #extra>
              <el-button type="primary" :loading="true">加载中</el-button>
            </template>
          </el-result>
        </div>

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

        <div v-else-if="paymentStatus === 'paid'" class="payment-success">
          <el-result icon="success" title="支付成功" sub-title="请等待接单人确认收款">
            <template #extra>
              <el-button type="primary" @click="confirmPayment">关闭</el-button>
            </template>
          </el-result>
        </div>

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

const activeStatus = ref('all')
const dateRange = ref<[Date, Date] | null>(null)
const orders = ref<Order[]>([])
const selectedOrder = ref<Order | null>(null)
const detailDialogVisible = ref(false)
const loading = ref(true)
const activeDetailTab = ref('info')
const paymentDialogVisible = ref(false)
const currentPaymentOrder = ref<Order | null>(null)
const delivererPaymentInfo = ref<any>(null)
const paymentStatus = ref<'pending' | 'paid' | 'confirmed'>('pending')
const paymentQRCodeUrl = ref('')
const paymentQRCodeLoading = ref(false)
const paymentTimer = ref<NodeJS.Timeout | null>(null)
const delivererInfoCache = reactive<Record<string, string>>({})

// 分页相关变量
const currentPage = ref(1)
const pageSize = ref(2) // 默认每页显示2个订单
const jumperInput = ref('') // 跳转输入框

// 分页数据计算
const pagedOrders = computed(() => {
  if (filteredOrders.value.length === 0) return []
  
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  return filteredOrders.value.slice(startIndex, endIndex)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize.value)
})

const filteredOrders = computed(() => {
  let filtered = orders.value
  
  if (activeStatus.value !== 'all') {
    filtered = filtered.filter(order => order.status === activeStatus.value)
  }

  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
  }
  
  return filtered.sort((a, b) => {
    const statusPriority: Record<Order['status'], number> = {
      'pending': 1,
      'accepted': 2,
      'picking': 3,
      'delivering': 4,
      'awaiting_payment': 5,
      'completed': 6,
      'cancelled': 7
    }
    
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status]
    }
    
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

const emptyDescription = computed(() => {
  if (activeStatus.value === 'all' && !dateRange.value) {
    return '暂无订单'
  }
  let description = ''
  if (activeStatus.value !== 'all') {
    description += `${getStatusText(activeStatus.value)}的订单`
  }
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    if (description) description += '，'
    description += `在 ${formatTime(dateRange.value[0].toISOString()).split(' ')[0]} 至 ${formatTime(dateRange.value[1].toISOString()).split(' ')[0]} 期间的订单`
  }
  if (!description) description = '订单'
  return `暂无${description}`
})

const getPendingOrdersCount = computed(() => {
  return orders.value.filter(order => 
    ['pending', 'accepted', 'picking', 'delivering', 'awaiting_payment'].includes(order.status)
  ).length
})

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

const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => {
  router.push('/home')
}

const filterOrders = () => {}

const filterOrdersByDate = () => {}

// 分页相关方法
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 处理跳转
const handleJumper = () => {
  if (!jumperInput.value) {
    ElMessage.warning('请输入页码')
    return
  }

  const page = parseInt(jumperInput.value)
  
  if (isNaN(page) || page < 1) {
    ElMessage.warning('请输入有效的页码')
    jumperInput.value = ''
    return
  }

  if (page > totalPages.value) {
    ElMessage.warning(`页码不能超过总页数 ${totalPages.value}`)
    jumperInput.value = ''
    return
  }

  currentPage.value = page
  jumperInput.value = ''
  
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  ElMessage.success(`已跳转到第 ${page} 页`)
}

const showOrderDetail = (order: Order) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
  activeDetailTab.value = 'info'
}

const getChatPartnerId = (order: Order): string => {
  if (!authStore.user) return ''
  if (order.requesterId === authStore.user.id) {
    return order.delivererId || ''
  }
  if (order.delivererId === authStore.user.id) {
    return order.requesterId
  }
  return ''
}

const getChatPartnerName = (order: Order): string => {
  if (!authStore.user) return '对方'
  if (order.requesterId === authStore.user.id) {
    return order.delivererId ? `接单员(${order.delivererId.substring(0, 8)})` : '接单员'
  }
  if (order.delivererId === authStore.user.id) {
    return `委托人(${order.requesterId.substring(0, 8)})`
  }
  return '对方'
}

const closeChat = () => {
  console.log('Chat window closed')
}

const handleMessageSent = (message: any) => {
  console.log('Message sent successfully:', message)
  ElMessage.success('消息发送成功')
}

const handleMessageReceived = (message: any) => {
  console.log('New message received:', message)
}

const openChatWindow = (order: Order) => {
  if (!authStore.user) {
    ElMessage.error('请先登录')
    return
  }
  
  if (order.status === 'pending' || order.status === 'cancelled') {
    ElMessage.warning('该订单当前无法进行沟通')
    return
  }
  
  selectedOrder.value = order
  activeDetailTab.value = 'chat'
  detailDialogVisible.value = true
  ElMessage.success('已打开聊天窗口，开始沟通吧！')
}

const goToLogin = () => {
  router.push('/login')
}

const cancelOrder = async (orderId: string) => {
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

const handleRateOrder = (order: Order) => {
  ElMessage.info('评价功能开发中...')
}

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

    if (order.requesterId !== authStore.user.id) {
      ElMessage.error('只有委托人可以进行支付操作')
      return
    }

    delivererPaymentInfo.value = null
    currentPaymentOrder.value = order
    paymentStatus.value = 'pending'
    paymentDialogVisible.value = true

    const loadPaymentInfo = async () => {
      try {
        const paymentInfoResult = await UserPaymentService.getUserPaymentInfo(order.delivererId || '')
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

        if (!paymentInfoResult.data.wechat_qr_code_url && !paymentInfoResult.data.alipay_qr_code_url) {
          ElMessage.error('接单人未设置收款二维码，请联系接单人协商支付方式')
          paymentDialogVisible.value = false
          return
        }

        if (paymentInfoResult.data.wechat_qr_code_url) {
          paymentQRCodeUrl.value = paymentInfoResult.data.wechat_qr_code_url
        } else if (paymentInfoResult.data.alipay_qr_code_url) {
          paymentQRCodeUrl.value = paymentInfoResult.data.alipay_qr_code_url
        }

        const [paymentResult, statusResult] = await Promise.all([
          PaymentService.createPayment(
            order.id,
            authStore.user?.id || '',
            order.delivererId || '',
            order.price
          ),
          orderStore.updateOrderStatus(order.id, 'awaiting_payment')
        ])

        if (!paymentResult.success) {
          ElMessage.error('创建支付记录失败')
          paymentDialogVisible.value = false
          return
        }

        PaymentService.setPaymentQRCode(paymentResult.data!.id, paymentQRCodeUrl.value)
          .catch(error => console.warn('Setting payment QR code failed:', error))

      } catch (error: any) {
        console.error('Failed to load payment info:', error)
        ElMessage.error('加载支付信息失败')
        paymentDialogVisible.value = false
      }
    }

    loadPaymentInfo()

  } catch (error: any) {
    console.error('Initiating payment failed:', error)
    ElMessage.error('发起支付失败')
    paymentDialogVisible.value = false
  }
}

const handleCompletePayment = async (order: Order) => {
  try {
    if (!authStore.user) {
      ElMessage.error('请先登录')
      return
    }

    if (order.delivererId !== authStore.user.id) {
      ElMessage.error('只有代领员可以确认支付完成')
      return
    }

    await ElMessageBox.confirm('确认已收到款项并完成订单吗？', '确认支付完成', {
      confirmButtonText: '确认完成',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await orderStore.updateOrderStatus(order.id, 'completed')
    
    const paymentResult = await PaymentService.getPaymentByOrderId(order.id)
    if (paymentResult.success && paymentResult.data) {
      await PaymentService.updatePaymentStatus(paymentResult.data.id, 'confirmed')
    }

    ElMessage.success('支付确认完成！订单已完成')
    loadOrders()

  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Confirming payment completion failed:', error)
      ElMessage.error('确认支付完成失败')
    }
  }
}

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
    
    paymentStatus.value = 'paid'
    await orderStore.updateOrderStatus(currentPaymentOrder.value.id, 'awaiting_payment')
    ElMessage.success('支付确认成功！请等待接单人确认收款')
    
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Confirming payment failed:', error)
      ElMessage.error('确认支付失败')
    }
  }
}

const confirmPayment = () => {
  paymentDialogVisible.value = false
  ElMessage.info('支付流程已开始，请等待接单人确认收款')
}

const cancelPayment = () => {
  if (paymentTimer.value) {
    clearInterval(paymentTimer.value)
    paymentTimer.value = null
  }
  paymentDialogVisible.value = false
  ElMessage.info('支付已取消')
}

onUnmounted(() => {
  if (paymentTimer.value) {
    clearInterval(paymentTimer.value)
    paymentTimer.value = null
  }
})

const getDelivererNickname = async (delivererId: string) => {
  try {
    if (delivererInfoCache[delivererId]) {
      return delivererInfoCache[delivererId]
    }
    
    const result = await UserService.getUserById(delivererId)
    if (result.success && result.data) {
      const nickname = result.data.nickname
      delivererInfoCache[delivererId] = nickname
      return nickname
    }
    
    return null
  } catch (error) {
    console.error('Failed to get deliverer nickname:', error)
    return null
  }
}

const preloadDelivererInfo = async (orders: Order[]) => {
  try {
    const delivererIds = orders
      .filter(order => order.delivererId && !delivererInfoCache[order.delivererId])
      .map(order => order.delivererId)
      .filter((id): id is string => id !== undefined)
    
    if (delivererIds.length === 0) return
    
    const result = await UserService.getUsersByIds(delivererIds)
    if (result.success && result.data) {
      result.data.forEach(user => {
        delivererInfoCache[user.id] = user.nickname
      })
    }
  } catch (error) {
    console.error('Failed to preload deliverer info:', error)
  }
}

const loadOrders = async () => {
  try {
    loading.value = true
    
    if (!authStore.user) {
      ElMessage.warning('请先登录以查看订单')
      orders.value = []
      return
    }
    
    const userOrders = await orderStore.getUserOrders()
    const delivererOrders = await orderStore.getDelivererOrders()
    
    const userOrdersArray = Array.isArray(userOrders) ? userOrders : []
    const delivererOrdersArray = Array.isArray(delivererOrders) ? delivererOrders : []
    
    const allOrders = [...userOrdersArray, ...delivererOrdersArray]
    const uniqueOrders = allOrders.filter((order, index, self) => 
      index === self.findIndex(o => o.id === order.id)
    )
    
    orders.value = uniqueOrders
    preloadDelivererInfo(uniqueOrders)
    
    if (uniqueOrders.length === 0) {
      ElMessage.info('暂无订单数据')
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
    ElMessage.error('加载订单失败，请检查网络连接')
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

const editOrder = (order: Order) => {
  router.push({ name: 'PublishOrder', params: { orderId: order.id } })
}

const viewDetails = (order: Order) => {
  showOrderDetail(order)
}
</script>

<style scoped>
.order-management-container {
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #0a0a2a 0%, 
    #1a1a4a 30%, 
    #2a2a6a 70%, 
    #4A90E2 100%);
  position: relative;
  overflow: hidden;
  padding-bottom: 40px;
}

/* Starry background matching Homepage and PublishOrder */
.starry-background {
  position: fixed;
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
    rgba(52, 152, 219, 0.2) 50%, 
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

/* Aurora Borealis Effect - Static flowing ethereal light formations */
.aurora-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.aurora-veil {
  position: absolute;
  mix-blend-mode: screen;
  transform-origin: center;
  border-radius: 95% / 70%;
}

/* Main prominent curved aurora beam - static ribbon-like flow */
.aurora-main {
  top: 15%;
  left: 20%;
  width: 60%;
  height: 35%;
  background: linear-gradient(
    130deg,
    transparent 0%,
    rgba(25, 118, 83, 0.08) 5%,   /* Ultra subtle start */
    rgba(25, 118, 83, 0.2) 15%,   /* Gentle fade in */
    rgba(76, 175, 80, 0.45) 35%,  /* Smooth peak */
    rgba(76, 175, 80, 0.65) 50%,  /* Ribbon-like intensity */
    rgba(76, 175, 80, 0.45) 65%,  /* Smooth fade out */
    rgba(25, 118, 83, 0.2) 85%,   /* Gentle transition */
    rgba(25, 118, 83, 0.08) 95%,  /* Ultra subtle end */
    transparent 100%
  );
  filter: blur(32px);
  transform: translateY(-4px) rotate(8deg) skewX(-5deg) scaleX(1.3);
  box-shadow: 
    0 0 100px rgba(76, 175, 80, 0.25),
    0 0 200px rgba(76, 175, 80, 0.15);
}

/* Secondary aurora beam - static flowing ribbon */
.aurora-secondary {
  top: 25%;
  left: 10%;
  width: 50%;
  height: 35%;
  background: linear-gradient(
    150deg,
    transparent 0%,
    rgba(39, 174, 96, 0.06) 5%,   /* Ultra subtle start */
    rgba(39, 174, 96, 0.18) 15%,  /* Gentle fade in */
    rgba(102, 187, 106, 0.35) 35%, /* Smooth peak */
    rgba(102, 187, 106, 0.55) 50%, /* Ribbon-like intensity */
    rgba(102, 187, 106, 0.35) 65%, /* Smooth fade out */
    rgba(39, 174, 96, 0.18) 85%,  /* Gentle transition */
    rgba(39, 174, 96, 0.06) 95%,  /* Ultra subtle end */
    transparent 100%
  );
  filter: blur(30px);
  transform: translateY(-6px) rotate(-5deg) skewX(8deg) scaleX(1.25);
  box-shadow: 
    0 0 90px rgba(102, 187, 106, 0.2),
    0 0 180px rgba(102, 187, 106, 0.1);
}

/* Tertiary aurora beam - static flowing ribbon */
.aurora-tertiary {
  top: 8%;
  left: 50%;
  width: 45%;
  height: 28%;
  background: linear-gradient(
    110deg,
    transparent 0%,
    rgba(102, 187, 106, 0.06) 5%,  /* Ultra subtle start */
    rgba(102, 187, 106, 0.18) 15%, /* Gentle fade in */
    rgba(143, 188, 143, 0.35) 35%, /* Smooth peak */
    rgba(143, 188, 143, 0.55) 50%, /* Ribbon-like intensity */
    rgba(143, 188, 143, 0.35) 65%, /* Smooth fade out */
    rgba(102, 187, 106, 0.18) 85%, /* Gentle transition */
    rgba(102, 187, 106, 0.06) 95%, /* Ultra subtle end */
    transparent 100%
  );
  filter: blur(28px);
  transform: translateY(-8px) rotate(2deg) skewX(-8deg) scaleX(1.2);
  box-shadow: 
    0 0 80px rgba(143, 188, 143, 0.2),
    0 0 160px rgba(143, 188, 143, 0.1);
}

/* Quaternary aurora beam - static flowing ribbon */
.aurora-quaternary {
  top: 50%;
  left: 5%;
  width: 55%;
  height: 25%;
  background: linear-gradient(
    170deg,
    transparent 0%,
    rgba(22, 160, 133, 0.06) 5%,   /* Ultra subtle start */
    rgba(22, 160, 133, 0.18) 15%,  /* Gentle fade in */
    rgba(39, 174, 96, 0.35) 35%,   /* Smooth peak */
    rgba(39, 174, 96, 0.55) 50%,   /* Ribbon-like intensity */
    rgba(39, 174, 96, 0.35) 65%,   /* Smooth fade out */
    rgba(22, 160, 133, 0.18) 85%,  /* Gentle transition */
    rgba(22, 160, 133, 0.06) 95%,  /* Ultra subtle end */
    transparent 100%
  );
  filter: blur(29px);
  transform: translateY(-5px) rotate(12deg) skewX(-2deg) scaleX(1.3);
  box-shadow: 
    0 0 85px rgba(39, 174, 96, 0.15),
    0 0 170px rgba(39, 174, 96, 0.08);
}

/* Quinary aurora beam - static flowing ribbon */
.aurora-quinary {
  top: 40%;
  left: 60%;
  width: 35%;
  height: 30%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(46, 204, 113, 0.06) 5%,   /* Ultra subtle start */
    rgba(46, 204, 113, 0.18) 15%,  /* Gentle fade in */
    rgba(174, 213, 129, 0.35) 35%, /* Smooth peak */
    rgba(174, 213, 129, 0.55) 50%, /* Ribbon-like intensity */
    rgba(174, 213, 129, 0.35) 65%, /* Smooth fade out */
    rgba(46, 204, 113, 0.18) 85%,  /* Gentle transition */
    rgba(46, 204, 113, 0.06) 95%,  /* Ultra subtle end */
    transparent 100%
  );
  filter: blur(27px);
  transform: translateY(-7px) rotate(-8deg) skewX(5deg) scaleX(1.25);
  box-shadow: 
    0 0 75px rgba(174, 213, 129, 0.15),
    0 0 150px rgba(174, 213, 129, 0.08);
}

/* Senary aurora beam - static flowing ribbon */
.aurora-senary {
  top: 25%;
  left: 65%;
  width: 30%;
  height: 35%;
  background: linear-gradient(
    80deg,
    transparent 0%,
    rgba(52, 152, 219, 0.12) 10%,   /* Ultra subtle blue-green at edges */
    rgba(52, 152, 219, 0.22) 25%,   /* Gentle transition */
    rgba(139, 195, 74, 0.45) 40%,   /* Softer light green center */
    rgba(139, 195, 74, 0.6) 50%,    /* Peak intensity */
    rgba(139, 195, 74, 0.45) 60%,   /* Symmetric gradient */
    rgba(52, 152, 219, 0.22) 75%,   /* Gentle transition */
    rgba(52, 152, 219, 0.12) 90%,   /* Ultra subtle end */
    transparent 100%
  );
  filter: blur(26px);
  transform: translateY(-3px) rotate(25deg) skewX(-6deg) scaleX(1.15);
  box-shadow: 
    0 0 70px rgba(139, 195, 74, 0.2),
    0 0 140px rgba(139, 195, 74, 0.1);
}

/* Static background ethereal ambient glow */
.aurora-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at top,
    transparent 0%,
    rgba(139, 195, 74, 0.06) 10%,
    rgba(139, 195, 74, 0.1) 20%,
    rgba(76, 175, 80, 0.08) 35%,
    rgba(39, 174, 96, 0.04) 50%,
    transparent 100%
  );
  filter: blur(50px);
  opacity: 0.75;
}



@keyframes twinkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.page-header {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(25px);
  border-radius: 0 0 16px 16px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #4A90E2, #6BA8E9, #8BC34A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.header-title p {
  margin: 4px 0 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.header-stats {
  display: flex;
  gap: 32px;
  align-items: center;
}

.stat-item {
  text-align: center;
  padding: 12px 24px;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.1), rgba(255, 126, 130, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.2);
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #4A90E2;
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.order-management-content {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.combined-filter-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 3px solid rgba(74, 144, 226, 0.3);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.filter-stats {
  display: flex;
  align-items: center;
}

.stat-badge {
  background: rgba(74, 144, 226, 0.2);
  color: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(74, 144, 226, 0.3);
}

.filter-content {
  display: flex;
  gap: 24px;
  align-items: center;
}

.status-filter-section,
.date-filter-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.el-radio-button__inner) {
  border-radius: 6px !important;
  font-weight: 500;
  padding: 6px 12px !important;
  font-size: 12px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.15s ease !important;
  backdrop-filter: blur(8px);
  margin: 2px;
}

:deep(.el-radio-button:not(.is-active) .el-radio-button__inner:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: linear-gradient(135deg, #4A90E2, #6BA8E9) !important;
  border-color: rgba(74, 144, 226, 0.6) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.25);
  transform: translateY(-1px);
}

.order-list {
  margin-top: 32px;
}

.loading-state,
.empty-state {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 60px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  text-align: center;
  position: relative;
  z-index: 2;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.order-items {
  display: grid;
  gap: 20px;
}

.order-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.order-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #4A90E2, #FF7E82);
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

.order-card-header {
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.08), rgba(255, 126, 130, 0.06));
  padding: 20px;
  border-bottom: 1px solid rgba(74, 144, 226, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.order-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.order-tags {
  display: flex;
  gap: 8px;
}

.order-price-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.4), rgba(107, 168, 233, 0.3), rgba(139, 195, 74, 0.2));
  color: rgba(255, 255, 255, 0.95);
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
  white-space: nowrap;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.price-label {
  font-size: 12px;
  opacity: 0.9;
}

.price-amount {
  font-size: 20px;
}

.order-card-body {
  padding: 20px;
}

.order-details {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid rgba(74, 144, 226, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  min-width: 140px;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.detail-value {
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.order-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

:deep(.el-button) {
  border-radius: 8px !important;
  font-weight: 600;
  border: none !important;
  transition: all 0.3s ease;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4A90E2, #6BA8E9, #8BC34A) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.5);
}

:deep(.el-button--danger) {
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E, #FFA8A8) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-button--danger:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
}

:deep(.el-button--info) {
  background: linear-gradient(135deg, #9575CD, #B39DDB, #D1C4E9) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #4CAF50, #66BB6A, #81C784) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-button--warning) {
  background: linear-gradient(135deg, #FF9800, #FFA726, #FFB74D) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.back-btn {
  border-radius: 12px !important;
  padding: 12px 24px !important;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-stats {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }
  
  .order-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-price-badge {
    align-self: flex-end;
  }
  
  .order-actions {
    flex-direction: column;
  }
  
  :deep(.el-button) {
    width: 100%;
  }
}

/* 分页样式 */
.pagination-container {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.pagination {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

/* 在大屏幕上保持在同一行 */
@media (min-width: 768px) {
  .pagination {
    flex-wrap: nowrap;
    justify-content: center;
  }
}

:deep(.el-pagination) {
  color: rgba(255, 255, 255, 0.9);
}

:deep(.el-pagination__total) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-pagination__jump) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-pagination__sizes) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-pagination button) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-pagination button:hover) {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-pagination button:disabled) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: rgba(74, 144, 226, 0.2) !important;
  border-color: rgba(74, 144, 226, 0.3) !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background: rgba(74, 144, 226, 0.3) !important;
  border-color: rgba(74, 144, 226, 0.5) !important;
}

:deep(.el-pagination .number) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-pagination .number:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-pagination .number.active) {
  background: linear-gradient(135deg, #4A90E2, #6BA8E9) !important;
  border-color: rgba(74, 144, 226, 0.6) !important;
  color: white !important;
}

:deep(.el-pagination .el-select .el-input .el-input__inner) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-pagination .el-select .el-input .el-input__inner:hover) {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-pagination .el-select .el-input .el-input__inner:focus) {
  border-color: #4A90E2 !important;
}

/* 自定义跳转组件样式 */
.custom-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.jumper-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.jumper-input {
  width: 80px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-align: center;
  transition: all 0.3s ease;
}

.jumper-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.jumper-input:focus {
  outline: none;
  border-color: #4A90E2;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.jumper-button {
  padding: 8px 16px;
  background: linear-gradient(135deg, #4A90E2, #6BA8E9);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.jumper-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
  background: linear-gradient(135deg, #6BA8E9, #8BC34A);
}

.jumper-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-jumper {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .jumper-input {
    width: 100%;
  }
  
  .jumper-button {
    width: 100%;
    padding: 10px;
  }
}
</style>

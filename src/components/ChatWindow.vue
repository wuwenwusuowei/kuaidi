<template>
  <div class="chat-window-container">
    <!-- 聊天窗口头部 -->
    <div class="chat-header">
      <div class="chat-title">
        <h3>{{ chatTitle }}</h3>
      </div>
      <div class="header-actions">
        <el-button 
          type="text" 
          @click="refreshMessages"
          :loading="refreshing"
          class="refresh-btn"
          title="刷新消息"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button 
          type="text" 
          @click="$emit('close')"
          class="close-btn"
          :icon="Close"
        />
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" ref="messageListRef">
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="['message-item', message.sender_id === currentUserId ? 'sent' : 'received']"
      >
        <div class="message-avatar">
          <el-avatar 
            :size="32" 
            :src="message.sender_avatar"
            :alt="message.sender_nickname"
          >
            {{ message.sender_nickname?.charAt(0) }}
          </el-avatar>
        </div>
        <div class="message-content">
          <div class="message-bubble">
            <p class="message-text">{{ message.content }}</p>
            <span class="message-time">{{ formatMessageTime(message.created_at) }}</span>
          </div>
          <div class="message-status">
            <el-icon v-if="message.is_read && message.sender_id === currentUserId" class="read-icon">
              <Check />
            </el-icon>
          </div>
        </div>
      </div>
      
      <!-- 加载更多 -->
      <div v-if="hasMoreMessages" class="load-more">
        <el-button 
          type="text" 
          @click="loadMoreMessages"
          :loading="loadingMore"
          size="small"
        >
          加载更多消息
        </el-button>
      </div>
    </div>

    <!-- 消息输入框 -->
    <div class="message-input">
      <div class="input-container">
        <el-input
          v-model="newMessage"
          type="textarea"
          :rows="2"
          placeholder="输入消息..."
          :maxlength="500"
          show-word-limit
          @keydown.enter.exact.prevent="sendMessage"
        />
        <div class="input-actions">
          <el-button-group>
            <el-button 
              type="primary" 
              @click="sendMessage"
              :disabled="!newMessage.trim()"
              :loading="sending"
            >
              发送
            </el-button>
            <el-button 
              type="default" 
              @click="clearMessage"
            >
              清空
            </el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Check, Refresh } from '@element-plus/icons-vue'
import { ChatService } from '../services/chatService'
import type { Message } from '../services/chatService'

interface Props {
  orderId: string
  currentUserId: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  chatTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  chatTitle: '聊天窗口'
})

const emit = defineEmits<{
  close: []
  messageSent: [message: Message]
  messageReceived: [message: Message]
}>()

// 响应式数据
const messages = ref<Message[]>([])
const newMessage = ref('')
const sending = ref(false)
const loadingMore = ref(false)
const hasMoreMessages = ref(false)
const refreshing = ref(false)
const messageListRef = ref<HTMLElement>()

// 聊天频道
let messageChannel: any = null
// 轮询定时器
let pollInterval: any = null
// 最后消息时间
let lastMessageTime = ref('')

// 计算属性
const chatTitle = computed(() => {
  return props.chatTitle || `与${props.otherUserName}的对话`
})

// 生命周期
onMounted(async () => {
  await loadMessages()
  startPolling()
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

// 监听订单ID变化
watch(() => props.orderId, async (newOrderId, oldOrderId) => {
  if (newOrderId && newOrderId !== oldOrderId) {
    // 重新加载新订单的消息
    await loadMessages()
  }
})

// 加载消息
const loadMessages = async () => {
  try {
    const result = await ChatService.getOrderMessages(props.orderId, props.currentUserId)
    
    if (result.success && result.data) {
      messages.value = result.data
      scrollToBottom()
    } else {
      ElMessage.error(result.error || '加载消息失败')
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    ElMessage.error('加载消息失败')
  }
}

// 加载更多消息（分页功能）
const loadMoreMessages = async () => {
  if (loadingMore.value) return
  
  try {
    loadingMore.value = true
    // 这里可以实现分页加载逻辑
    // 暂时简单实现为重新加载所有消息
    await loadMessages()
  } catch (error) {
    console.error('加载更多消息失败:', error)
    ElMessage.error('加载更多消息失败')
  } finally {
    loadingMore.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  
  try {
    sending.value = true
    
    const result = await ChatService.sendMessage(
      props.orderId,
      props.currentUserId,
      props.otherUserId,
      newMessage.value.trim()
    )
    
    if (result.success && result.data) {
      // 添加新消息到列表
      messages.value.push(result.data)
      
      // 清空输入框
      newMessage.value = ''
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
      
      // 触发消息发送事件（父组件会显示成功提示）
      emit('messageSent', result.data)
    } else {
      ElMessage.error(result.error || '发送消息失败')
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
  }
}

// 清空消息
const clearMessage = () => {
  newMessage.value = ''
}

// 手动刷新消息
const refreshMessages = async () => {
  if (refreshing.value) return
  
  try {
    refreshing.value = true
    console.log('开始手动刷新消息...')
    await loadMessages()
    ElMessage.success('消息已刷新')
  } catch (error) {
    console.error('刷新消息失败:', error)
    ElMessage.error('刷新消息失败')
  } finally {
    refreshing.value = false
  }
}

// 设置实时订阅
const setupRealtimeSubscription = () => {
  // 先取消之前的订阅
  if (messageChannel) {
    ChatService.unsubscribe(messageChannel)
  }
  
  // 订阅消息
  messageChannel = ChatService.subscribeToMessages(props.orderId, (payload) => {
    console.log('收到实时消息更新:', payload)
    
    // 确保有新的消息数据
    if (payload.new) {
      console.log('新消息数据:', payload.new)
      
      // 检查是否已经存在该消息，避免重复添加
      const messageExists = messages.value.some(msg => msg.id === payload.new.id)
      if (!messageExists) {
        console.log('添加新消息到列表')
        messages.value.push(payload.new)
        scrollToBottom()
        
        // 触发消息接收事件
        emit('messageReceived', payload.new)
      } else {
        console.log('消息已存在，跳过添加')
      }
    }
  })
  
  // 添加连接状态监听
  if (messageChannel) {
    messageChannel
      .on('system', { event: 'disconnect' }, () => {
        console.log('实时连接断开，尝试重新连接...')
        // 5秒后尝试重新连接
        setTimeout(() => {
          setupRealtimeSubscription()
        }, 5000)
      })
      .on('system', { event: 'connected' }, () => {
        console.log('实时连接已建立')
      })
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 启动轮询检查新消息
const startPolling = () => {
  // 设置最后消息时间
  if (messages.value.length > 0) {
    lastMessageTime.value = messages.value[messages.value.length - 1].created_at
  }
  
  // 每5秒检查一次新消息
  pollInterval = setInterval(async () => {
    await checkForNewMessages()
  }, 5000)
}

// 检查新消息
const checkForNewMessages = async () => {
  try {
    console.log('开始自动检查新消息...')
    const result = await ChatService.getOrderMessages(props.orderId, props.currentUserId)
    
    if (result.success && result.data) {
      console.log('获取到消息数据，数量:', result.data.length)
      
      // 检查是否有新消息（比较消息数量或最后消息ID）
      const currentMessageCount = messages.value.length
      const newMessageCount = result.data.length
      
      if (newMessageCount > currentMessageCount) {
        console.log(`发现新消息: 当前${currentMessageCount}条，新获取${newMessageCount}条`)
        
        // 完全替换消息列表，确保顺序正确
        messages.value = result.data
        scrollToBottom()
        
        // 触发消息接收事件（只触发最新的消息）
        if (newMessageCount > currentMessageCount) {
          const newMessages = result.data.slice(currentMessageCount)
          newMessages.forEach(msg => {
            emit('messageReceived', msg)
          })
        }
      } else {
        console.log('没有发现新消息')
      }
    } else {
      console.log('获取消息失败:', result.error)
    }
  } catch (error) {
    console.error('检查新消息失败:', error)
  }
}

// 格式化消息时间
const formatMessageTime = (timeStr: string) => {
  const date = new Date(timeStr)
  const now = new Date()
  
  // 如果是今天，显示时间
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 如果是昨天，显示昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 其他情况显示日期和时间
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.chat-window-container {
  display: flex;
  flex-direction: column;
  height: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

/* 聊天头部 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn {
  color: #666;
  font-size: 14px;
}

.refresh-btn:hover {
  color: #1890ff;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #52c41a;
}

.status-dot.offline {
  background: #d9d9d9;
}

.status-text {
  font-size: 12px;
  color: #666;
}

.close-btn {
  color: #666;
  font-size: 16px;
}

.close-btn:hover {
  color: #333;
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
}

.message-item.sent {
  flex-direction: row-reverse;
}

.message-item.received {
  flex-direction: row;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-item.sent .message-content {
  align-items: flex-end;
}

.message-item.received .message-content {
  align-items: flex-start;
}

.message-bubble {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.message-item.sent .message-bubble {
  background: #1890ff;
  color: white;
}

.message-item.received .message-bubble {
  background: white;
  color: #333;
}

.message-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  display: block;
}

.message-status {
  height: 16px;
}

.read-icon {
  color: #1890ff;
  font-size: 12px;
}

.message-item.sent .read-icon {
  color: rgba(255, 255, 255, 0.7);
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 16px 0;
}

/* 消息输入框 */
.message-input {
  border-top: 1px solid #e9ecef;
  padding: 16px;
  background: white;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

/* 滚动条样式 - 更细更美观 */
.message-list::-webkit-scrollbar {
  width: 4px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: #d1d1d1;
  border-radius: 2px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: #b8b8b8;
}

/* Firefox 滚动条样式 */
.message-list {
  scrollbar-width: thin;
  scrollbar-color: #d1d1d1 transparent;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-window-container {
    height: 400px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .chat-header {
    padding: 12px 16px;
  }
  
  .message-list {
    padding: 12px;
  }
  
  .message-input {
    padding: 12px;
  }
}
</style>
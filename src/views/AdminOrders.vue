<template>
  <div class="admin-orders">
    <div class="page-header">
      <h2>订单管理</h2>
      <p>管理系统所有订单信息</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="toolbar">
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索订单号、快递单号、用户"
          prefix-icon="Search"
          style="width: 300px"
          clearable
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-section">
        <el-select v-model="filterStatus" placeholder="订单状态" clearable @change="handleFilter">
          <el-option label="待接单" value="pending" />
          <el-option label="已接单" value="accepted" />
          <el-option label="配送中" value="delivering" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
        />
        
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-table">
      <el-table
        :data="orderList"
        v-loading="loading"
        style="width: 100%"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
      >
        <el-table-column prop="order_number" label="订单号" width="100" />
        
        <el-table-column prop="tracking_number" label="快递单号" width="140" />
        
        <el-table-column prop="requester.username" label="发布者" width="100">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.requester?.avatar_url" :alt="row.requester?.username">
                {{ row.requester?.username?.charAt(0) }}
              </el-avatar>
              <span style="margin-left: 8px">{{ row.requester?.username }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="deliverer.username" label="接单者" width="100">
          <template #default="{ row }">
            <div v-if="row.deliverer" class="user-info">
              <el-avatar :size="32" :src="row.deliverer?.avatar_url" :alt="row.deliverer?.username">
                {{ row.deliverer?.username?.charAt(0) }}
              </el-avatar>
              <span style="margin-left: 8px">{{ row.deliverer?.username }}</span>
            </div>
            <span v-else style="color: #999">未接单</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="price" label="金额" width="80">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="pickup_location" label="取件地点" min-width="150" show-overflow-tooltip />
        
        <el-table-column prop="delivery_location" label="送达地点" min-width="150" show-overflow-tooltip />
        
        <el-table-column prop="created_at" label="创建时间" width="200" sortable>
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewOrderDetail(row)">
              详情
            </el-button>
            
            <el-button 
              size="small" 
              type="primary"
              @click="updateOrderStatus(row)"
              :disabled="row.status === 'completed' || row.status === 'cancelled'"
            >
              状态
            </el-button>
            
            <el-button 
              size="small" 
              type="danger"
              @click="handleDeleteOrder(row)"
              :disabled="row.status !== 'pending'"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`订单详情 - ${selectedOrder?.order_number}`"
      width="700px"
    >
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.order_number }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">{{ selectedOrder.tracking_number }}</el-descriptions-item>
          <el-descriptions-item label="发布者">
            <div class="user-info">
              <el-avatar :size="32" :src="selectedOrder.requester?.avatar_url">
                {{ selectedOrder.requester?.username?.charAt(0) }}
              </el-avatar>
              <span style="margin-left: 8px">{{ selectedOrder.requester?.username }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="接单者">
            <div v-if="selectedOrder.deliverer" class="user-info">
              <el-avatar :size="32" :src="selectedOrder.deliverer?.avatar_url">
                {{ selectedOrder.deliverer?.username?.charAt(0) }}
              </el-avatar>
              <span style="margin-left: 8px">{{ selectedOrder.deliverer?.username }}</span>
            </div>
            <span v-else style="color: #999">未接单</span>
          </el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ selectedOrder.price }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedOrder.status)">
              {{ getStatusText(selectedOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="取件地点" :span="2">{{ selectedOrder.pickup_location }}</el-descriptions-item>
          <el-descriptions-item label="送达地点" :span="2">{{ selectedOrder.delivery_location }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(selectedOrder.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(selectedOrder.updated_at) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ selectedOrder.notes || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          type="primary" 
          @click="updateOrderStatus(selectedOrder)"
          :disabled="selectedOrder?.status === 'completed' || selectedOrder?.status === 'cancelled'"
        >
          修改状态
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改状态对话框 -->
    <el-dialog
      v-model="statusDialogVisible"
      title="修改订单状态"
      width="400px"
    >
      <div v-if="selectedOrder" class="status-form">
        <el-form :model="statusForm" label-width="80px">
          <el-form-item label="当前状态">
            <el-tag :type="getStatusType(selectedOrder.status)">
              {{ getStatusText(selectedOrder.status) }}
            </el-tag>
          </el-form-item>
          
          <el-form-item label="新状态">
            <el-select v-model="statusForm.newStatus" placeholder="选择新状态">
              <el-option label="待接单" value="pending" />
              <el-option label="已接单" value="accepted" />
              <el-option label="配送中" value="delivering" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="statusForm.notes"
              type="textarea"
              :rows="3"
              placeholder="请输入状态变更备注（可选）"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStatusChange" :loading="statusLoading">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AdminService } from '../services/adminService'

// 响应式数据
const loading = ref(false)
const statusLoading = ref(false)
const searchKeyword = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orderList = ref([])
const selectedOrder = ref(null)
const detailDialogVisible = ref(false)
const statusDialogVisible = ref(false)

const statusForm = reactive({
  newStatus: '',
  notes: ''
})

// 状态映射
const statusMap = {
  pending: { text: '待接单', type: 'warning' },
  accepted: { text: '已接单', type: 'info' },
  picking: { text: '取件中', type: 'info' },
  delivering: { text: '配送中', type: 'primary' },
  awaiting_payment: { text: '等待支付确认', type: 'warning' },
  completed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'danger' }
}

const getStatusText = (status: string) => {
  return statusMap[status]?.text || status
}

const getStatusType = (status: string) => {
  return statusMap[status]?.type || 'info'
}

// 加载订单数据
const loadOrders = async () => {
  try {
    loading.value = true
    const result = await AdminService.getOrders(
      currentPage.value,
      pageSize.value,
      filterStatus.value
    )
    
    orderList.value = result.orders
    total.value = result.total
    
    // 应用搜索筛选
    if (searchKeyword.value) {
      orderList.value = orderList.value.filter(order => 
        order.order_number?.includes(searchKeyword.value) ||
        order.tracking_number?.includes(searchKeyword.value) ||
        order.requester?.username?.includes(searchKeyword.value) ||
        order.deliverer?.username?.includes(searchKeyword.value)
      )
    }
    
    // 应用日期筛选
    if (dateRange.value && dateRange.value.length === 2) {
      const [startDate, endDate] = dateRange.value
      orderList.value = orderList.value.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= startDate && orderDate <= endDate
      })
    }
    
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadOrders()
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
  loadOrders()
}

// 日期筛选处理
const handleDateChange = () => {
  currentPage.value = 1
  loadOrders()
}

// 分页处理
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  loadOrders()
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  loadOrders()
}

// 刷新数据
const refreshData = () => {
  loadOrders()
}

// 查看订单详情
const viewOrderDetail = (order: any) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
}

// 修改订单状态
const updateOrderStatus = (order: any) => {
  selectedOrder.value = order
  statusForm.newStatus = order.status
  statusForm.notes = ''
  statusDialogVisible.value = true
}

// 确认状态修改
const confirmStatusChange = async () => {
  if (!statusForm.newStatus) {
    ElMessage.warning('请选择新状态')
    return
  }
  
  try {
    statusLoading.value = true
    
    await AdminService.updateOrderStatus(selectedOrder.value.id, statusForm.newStatus)
    
    ElMessage.success('订单状态更新成功')
    
    // 更新本地数据
    selectedOrder.value.status = statusForm.newStatus
    
    // 刷新列表
    loadOrders()
    
    statusDialogVisible.value = false
    detailDialogVisible.value = false
    
  } catch (error) {
    console.error('更新订单状态失败:', error)
    ElMessage.error('更新订单状态失败')
  } finally {
    statusLoading.value = false
  }
}

// 删除订单
const handleDeleteOrder = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 "${order.order_number}" 吗？此操作不可恢复，只能删除未接单的订单。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    try {
      loading.value = true
      await AdminService.deleteOrder(order.id)
      
      ElMessage.success('订单删除成功')
      
      // 刷新列表
      loadOrders()
      
    } catch (error) {
      console.error('删除订单失败:', error)
      ElMessage.error(error.message || '删除订单失败')
    } finally {
      loading.value = false
    }
    
  } catch (confirmError) {
    // 用户取消了删除操作
    ElMessage.info('已取消删除')
  }
}

// 日期格式化
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 初始化加载
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.admin-orders {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.order-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.order-detail {
  padding: 20px 0;
}

.status-form {
  padding: 20px 0;
}
</style>
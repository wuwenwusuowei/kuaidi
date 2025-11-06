<template>
  <div class="admin-users">
    <div class="page-header">
      <h2>用户管理</h2>
      <p>管理系统所有注册用户</p>
    </div>

    <!-- 搜索和筛选 -->
    <div class="toolbar">
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用户名、邮箱或手机号"
          prefix-icon="Search"
          style="width: 300px"
          clearable
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-section">
        <el-select v-model="filterStatus" placeholder="用户状态" clearable @change="handleFilter">
          <el-option label="未封禁" value="active" />
          <el-option label="活跃" value="active_recent" />
          <el-option label="七天未登录" value="7" />
          <el-option label="一个月未登录" value="30" />
          <el-option label="半年未登录" value="180" />
          <el-option label="长期不登录" value="365" />
          <el-option label="已封禁" value="suspended" />
        </el-select>
        
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-table">
      <el-table
        :data="userList"
        v-loading="loading"
        style="width: 100%"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
      >
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" :alt="row.username">
              {{ row.username?.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        
        <el-table-column prop="username" label="用户名" width="120" sortable />
        
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        
        <el-table-column prop="phone" label="手机号" width="130" />
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row)">
              {{ getCombinedStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="created_at" label="注册时间" width="160" sortable>
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="last_login" label="最后登录" width="160">
          <template #default="{ row }">
            {{ formatDate(row.last_login) || '从未登录' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewUserDetail(row)">
              查看
            </el-button>
            
            <el-button 
              size="small" 
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="toggleUserStatus(row)"
            >
              {{ row.status === 'active' ? '封禁' : '解封' }}
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

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
    >
      <div v-if="selectedUser" class="user-detail">
        <div class="user-info">
          <el-avatar :size="80" :src="selectedUser.avatar" :alt="selectedUser.username">
            {{ selectedUser.username?.charAt(0) }}
          </el-avatar>
          
          <div class="user-details">
            <h3>{{ selectedUser.username }}</h3>
            <p><strong>邮箱：</strong>{{ selectedUser.email }}</p>
            <p><strong>手机号：</strong>{{ selectedUser.phone || '未设置' }}</p>
            <p><strong>注册时间：</strong>{{ formatDate(selectedUser.created_at) }}</p>
            <p><strong>最后登录：</strong>{{ formatDate(selectedUser.last_login) || '从未登录' }}</p>
            <p><strong>状态：</strong>
              <el-tag :type="getStatusTagType(selectedUser)">
                {{ getCombinedStatus(selectedUser) }}
              </el-tag>
            </p>
          </div>
        </div>
        
        <div class="user-stats">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ selectedUser.order_count || 0 }}</div>
                <div class="stat-label">发布订单</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ selectedUser.completed_orders || 0 }}</div>
                <div class="stat-label">完成订单</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">¥{{ selectedUser.total_spent || 0 }}</div>
                <div class="stat-label">总消费</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button 
          type="primary" 
          :loading="statusLoading"
          @click="toggleUserStatus(selectedUser)"
        >
          {{ selectedUser?.status === 'active' ? '封禁用户' : '解封用户' }}
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
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userList = ref([])
const selectedUser = ref(null)
const detailDialogVisible = ref(false)

// 加载用户数据
const loadUsers = async () => {
  try {
    loading.value = true
    const result = await AdminService.getUsers(
      currentPage.value,
      pageSize.value,
      searchKeyword.value
    )
    
    userList.value = result.users
    total.value = result.total
    
    // 应用统一状态筛选
    if (filterStatus.value) {
      userList.value = userList.value.filter(user => {
        // 首先检查封禁状态
        if (filterStatus.value === 'suspended') {
          return user.status === 'suspended'
        } else if (filterStatus.value === 'active') {
          // 未封禁状态：包括所有非封禁用户
          return user.status === 'active'
        } else {
          // 登录状态筛选：只对未封禁用户生效
          if (user.status === 'suspended') return false
          
          const loginStatus = getLoginStatus(user.last_login)
          
          if (filterStatus.value === 'active_recent') {
            return loginStatus === '活跃'
          } else if (filterStatus.value === '7') {
            return loginStatus === '七天未登录'
          } else if (filterStatus.value === '30') {
            return loginStatus === '一个月未登录'
          } else if (filterStatus.value === '180') {
            return loginStatus === '半年未登录'
          } else if (filterStatus.value === '365') {
            return loginStatus === '长期不登录（大于一年）'
          }
        }
        return true
      })
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
  loadUsers()
}

// 分页处理
const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize
  currentPage.value = 1
  loadUsers()
}

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage
  loadUsers()
}

// 刷新数据
const refreshData = () => {
  loadUsers()
}

// 查看用户详情
const viewUserDetail = (user: any) => {
  selectedUser.value = user
  detailDialogVisible.value = true
}

// 切换用户状态
const toggleUserStatus = async (user: any) => {
  try {
    statusLoading.value = true
    
    const newStatus = user.status === 'active' ? 'suspended' : 'active'
    const actionText = newStatus === 'active' ? '解封' : '封禁'
    
    let reason = ''
    
    if (newStatus === 'suspended') {
      // 封禁时需要输入原因
      const result = await ElMessageBox.prompt(
        `请输入封禁用户 "${user.username}" 的原因：`,
        '封禁用户',
        {
          confirmButtonText: '确认封禁',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPlaceholder: '请输入封禁原因...',
          inputValidator: (value) => {
            if (!value || value.trim().length === 0) {
              return '封禁原因不能为空'
            }
            return true
          }
        }
      )
      reason = result.value
    } else {
      // 解封时确认操作
      await ElMessageBox.confirm(
        `确定要解封用户 "${user.username}" 吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    }
    
    await AdminService.updateUserStatus(user.id, newStatus, reason)
    
    ElMessage.success(`${actionText}用户成功`)
    
    // 更新本地数据
    user.status = newStatus
    
    if (detailDialogVisible.value) {
      selectedUser.value = { ...selectedUser.value, status: newStatus }
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新用户状态失败:', error)
      ElMessage.error('操作失败')
    }
  } finally {
    statusLoading.value = false
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

// 获取登录状态（基于最后登录时间）
const getLoginStatus = (lastLogin: string) => {
  if (!lastLogin) return '从未登录'
  
  const lastLoginDate = new Date(lastLogin)
  const now = new Date()
  const timeDiff = now.getTime() - lastLoginDate.getTime()
  
  // 计算时间差（毫秒）
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  
  if (daysDiff <= 7) {
    return '活跃'
  } else if (daysDiff <= 30) {
    return '七天未登录'
  } else if (daysDiff <= 180) {
    return '一个月未登录'
  } else if (daysDiff <= 365) {
    return '半年未登录'
  } else {
    return '长期不登录（大于一年）'
  }
}

// 获取统一状态显示
const getCombinedStatus = (user: any) => {
  if (user.status === 'suspended') {
    return '已封禁'
  }
  
  return getLoginStatus(user.last_login)
}

// 获取状态标签类型
const getStatusTagType = (user: any) => {
  if (user.status === 'suspended') {
    return 'danger'
  }
  
  const loginStatus = getLoginStatus(user.last_login)
  if (loginStatus === '活跃') {
    return 'success'
  } else if (loginStatus === '七天未登录') {
    return 'warning'
  } else if (loginStatus === '一个月未登录') {
    return 'warning'
  } else if (loginStatus === '半年未登录') {
    return 'info'
  } else {
    return 'info'
  }
}

// 初始化加载
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
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

.user-table {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.user-detail {
  padding: 20px 0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.user-details h3 {
  margin: 0 0 12px 0;
  font-size: 20px;
  color: #1f2937;
}

.user-details p {
  margin: 8px 0;
  color: #6b7280;
}

.user-stats {
  border-top: 1px solid #f3f4f6;
  padding-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}
</style>
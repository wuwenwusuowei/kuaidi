<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <h3 v-show="!isCollapsed">后台管理</h3>
        <el-icon @click="toggleSidebar" class="collapse-btn">
          <Fold v-if="!isCollapsed" />
          <Expand v-else />
        </el-icon>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        router
        class="admin-menu"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>仪表板</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-button type="danger" text @click="handleLogout" class="logout-btn">
          <el-icon><SwitchButton /></el-icon>
          <span v-show="!isCollapsed">退出登录</span>
        </el-button>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="top-nav">
        <div class="nav-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>后台管理</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="nav-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :src="userAvatar" />
              <span class="username">管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">个人信息</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 页面内容 -->
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const userAvatar = ref('')

const activeMenu = computed(() => route.path)

const pageTitles = {
  '/admin/dashboard': '仪表板',
  '/admin/users': '用户管理',
  '/admin/orders': '订单管理',
  '/admin/settings': '系统设置'
}

const currentPageTitle = computed(() => {
  return pageTitles[route.path] || '后台管理'
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
    
    authStore.setAdmin(false)
    ElMessage.success('已退出登录')
    router.push('/admin/login')
  } catch {
    // 用户取消
  }
}

const goToProfile = () => {
  // 跳转到个人信息页面
  ElMessage.info('个人信息功能开发中')
}

// 检查管理员权限
watch(() => authStore.isAdmin, (isAdmin) => {
  if (!isAdmin && route.path.startsWith('/admin')) {
    router.push('/admin/login')
  }
}, { immediate: true })
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

.sidebar {
  width: 240px;
  background: #001529;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-collapsed {
  width: 64px;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #001f3d;
  color: white;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.collapse-btn {
  cursor: pointer;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: white;
}

.admin-menu {
  flex: 1;
  border: none;
  background: transparent;
}

:deep(.admin-menu .el-menu-item),
:deep(.admin-menu .el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.8);
  background: transparent !important;
}

:deep(.admin-menu .el-menu-item:hover),
:deep(.admin-menu .el-sub-menu__title:hover) {
  color: white;
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.admin-menu .el-menu-item.is-active) {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1) !important;
}

:deep(.admin-menu .el-icon) {
  color: inherit;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #001f3d;
}

.logout-btn {
  width: 100%;
  color: rgba(255, 255, 255, 0.8) !important;
}

.logout-btn:hover {
  color: #ff4d4f !important;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-nav {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.3s;
}

.user-info:hover {
  background: #f5f5f5;
}

.username {
  font-weight: 500;
  color: #262626;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>
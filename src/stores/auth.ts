import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginForm, RegisterForm } from '../types/database'
import { AuthService } from '../services/authService'
import { ChatService } from '../services/chatService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isAdmin = ref(false)
  const loading = ref(false)

  // 获取当前标签页的唯一标识符（使用sessionStorage保存）
  const getCurrentTabId = (): string => {
    // 首先尝试从sessionStorage获取现有的标签页ID
    let tabId = sessionStorage.getItem('current_tab_id')
    
    if (!tabId) {
      // 生成新的标签页ID
      tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      
      // 保存到sessionStorage中
      sessionStorage.setItem('current_tab_id', tabId)
      
      console.log('为新标签页生成ID:', tabId)
    }
    
    return tabId
  }

  // 生成会话存储的键名（标签页隔离）
  const getSessionKey = (key: string): string => {
    const tabId = getCurrentTabId()
    return `${tabId}_${key}`
  }

  // 从sessionStorage同步到Pinia状态
  const syncStateFromStorage = () => {
    try {
      const userData = sessionStorage.getItem(getSessionKey('auth_user'))
      const isAuthenticatedData = sessionStorage.getItem(getSessionKey('is_authenticated'))
      const isAdminData = sessionStorage.getItem(getSessionKey('is_admin'))
      
      // 优先使用用户数据来判断认证状态
      if (userData) {
        user.value = JSON.parse(userData)
        isAuthenticated.value = true
        console.log('从存储恢复用户会话:', user.value?.username)
      } else {
        // 如果没有用户数据，则根据认证状态数据来设置
        if (isAuthenticatedData) {
          isAuthenticated.value = JSON.parse(isAuthenticatedData)
        }
      }
      
      if (isAdminData) {
        isAdmin.value = JSON.parse(isAdminData)
      }
      
      console.log('状态同步完成:', { 
        hasUser: !!user.value, 
        isAuthenticated: isAuthenticated.value,
        isAdmin: isAdmin.value 
      })
    } catch (error) {
      console.warn('从存储同步状态失败:', error)
    }
  }

  // 同步Pinia状态到sessionStorage
  const syncStateToStorage = () => {
    try {
      if (user.value) {
        sessionStorage.setItem(getSessionKey('auth_user'), JSON.stringify(user.value))
        sessionStorage.setItem(getSessionKey('is_authenticated'), JSON.stringify(true))
        sessionStorage.setItem(getSessionKey('is_admin'), JSON.stringify(isAdmin.value))
        console.log('保存用户会话到存储:', user.value.username)
      } else {
        // 清除所有认证相关的存储数据
        sessionStorage.removeItem(getSessionKey('auth_user'))
        sessionStorage.removeItem(getSessionKey('is_authenticated'))
        sessionStorage.removeItem(getSessionKey('is_admin'))
        
        // 清除标签页ID（完全清理会话）
        sessionStorage.removeItem('current_tab_id')
        
        console.log('清除用户会话')
      }
    } catch (error) {
      console.warn('保存状态到存储失败:', error)
    }
  }

  // 初始化会话管理
  const initSessionManagement = () => {
    // 首次加载时从存储同步状态
    syncStateFromStorage()
    
    console.log('会话管理已初始化，当前标签页ID:', getCurrentTabId())
  }

  // 用户登录
  const login = async (username: string, password: string) => {
    loading.value = true
    try {
      const result = await AuthService.login({ username, password })
      
      if (result.success && result.data) {
        user.value = result.data
        isAuthenticated.value = true
        syncStateToStorage() // 同步到存储
        
        // 更新在线状态
        try {
          await ChatService.updateOnlineStatus(result.data.id, true)
        } catch (error) {
          console.warn('更新在线状态失败:', error)
        }
        
        console.log('登录成功，用户:', result.data.username)
        return { success: true }
      } else {
        throw new Error(result.error || '登录失败')
      }
    } catch (error: any) {
      // 检查是否是封禁错误，如果是则直接抛出
      if (error.message && error.message.includes('账号已被封禁')) {
        console.warn('用户被封禁:', error.message)
        throw error
      }
      
      // 其他数据库认证失败，回退到模拟数据（开发阶段）
      console.warn('数据库认证失败，使用模拟数据:', error.message)
      return await fallbackLogin(username, password)
    } finally {
      loading.value = false
    }
  }

  // 模拟登录（开发阶段备用）
  const fallbackLogin = async (username: string, password: string) => {
    // 模拟数据已清空，直接抛出错误
    throw new Error('用户名或密码错误')
  }

  // 用户注册
  const register = async (username: string, password: string, nickname: string, campus?: string) => {
    loading.value = true
    try {
      const result = await AuthService.register({ username, password, nickname, campus })
      
      if (result.success && result.data) {
        user.value = result.data
        isAuthenticated.value = true
        syncStateToStorage() // 同步到存储
        
        // 更新在线状态
        try {
          await ChatService.updateOnlineStatus(result.data.id, true)
        } catch (error) {
          console.warn('更新在线状态失败:', error)
        }
        
        console.log('注册成功，用户:', result.data.username)
        return { success: true }
      } else {
        throw new Error(result.error || '注册失败')
      }
    } catch (error: any) {
      // 如果数据库注册失败，回退到模拟数据
      console.warn('数据库注册失败，使用模拟数据:', error.message)
      return await fallbackRegister({ username, password, nickname, campus })
    } finally {
      loading.value = false
    }
  }

  // 模拟注册（开发阶段备用）
  const fallbackRegister = async (form: RegisterForm) => {
    // 简单的模拟注册逻辑
    const newUser: User = {
      id: Date.now().toString(),
      username: form.username,
      nickname: form.nickname,
      avatar_url: '',
      balance: 0.00,
      email: '',
      campus: form.campus || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    user.value = newUser
    isAuthenticated.value = true
    syncStateToStorage() // 同步到存储
    
    console.log('模拟注册成功，用户:', newUser.username)
    return { success: true }
  }

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const result = await AuthService.getCurrentUser()
      
      if (result.success && result.data) {
        user.value = result.data
        isAuthenticated.value = true
        syncStateToStorage() // 同步到存储
      } else {
        // 如果后端检查失败，回退到存储检查
        syncStateFromStorage()
      }
    } catch (error) {
      console.warn('检查认证状态失败:', error)
      // 回退到存储检查
      syncStateFromStorage()
    }
  }

  // 登出
  const logout = async () => {
    // 更新在线状态为离线
    if (user.value) {
      try {
        await ChatService.updateOnlineStatus(user.value.id, false)
      } catch (error) {
        console.warn('更新在线状态失败:', error)
      }
    }
    
    try {
      await AuthService.logout()
    } catch (error) {
      console.warn('Supabase登出失败:', error)
    }
    
    user.value = null
    isAuthenticated.value = false
    isAdmin.value = false
    
    // 从存储中清除数据
    syncStateToStorage()
    
    console.log('用户已登出')
  }

  // 更新用户信息
  const updateUser = (userInfo: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userInfo }
      syncStateToStorage() // 同步到存储
    }
  }

  // 更新用户信息（别名，与Profile.vue中保持一致）
  const updateUserInfo = (userInfo: Partial<User>) => {
    updateUser(userInfo)
  }

  // 管理员权限管理
  const setAdmin = (admin: boolean) => {
    isAdmin.value = admin
    syncStateToStorage() // 同步到存储
  }

  // 检查管理员权限
  const checkAdmin = () => {
    syncStateFromStorage() // 从存储同步状态
    return isAdmin.value
  }

  // 初始化时检查管理员权限
  const initAuth = () => {
    // 初始化会话管理
    initSessionManagement()
    
    // 检查认证状态
    checkAuth()
    checkAdmin()
    
    console.log('认证系统已初始化，当前标签页ID:', getCurrentTabId())
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    updateUserInfo,
    setAdmin,
    checkAdmin,
    initAuth
  }
})
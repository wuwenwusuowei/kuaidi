import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, LoginForm, RegisterForm } from '../types/database'
import { AuthService } from '../services/authService'
import { ChatService } from '../services/chatService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)

  // 模拟用户数据（开发阶段备用）
  const mockUsers = []

  // 用户登录
  const login = async (username: string, password: string) => {
    loading.value = true
    try {
      const result = await AuthService.login({ username, password })
      
      if (result.success && result.data) {
        user.value = result.data
        isAuthenticated.value = true
        localStorage.setItem('auth_user', JSON.stringify(result.data))
        
        // 更新在线状态
        try {
          await ChatService.updateOnlineStatus(result.data.id, true)
        } catch (error) {
          console.warn('更新在线状态失败:', error)
        }
        
        return { success: true }
      } else {
        throw new Error(result.error || '登录失败')
      }
    } catch (error: any) {
      // 如果数据库认证失败，回退到模拟数据（开发阶段）
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
  const register = async (username: string, password: string, nickname: string) => {
    loading.value = true
    try {
      const result = await AuthService.register({ username, password, nickname })
      
      if (result.success && result.data) {
        user.value = result.data
        isAuthenticated.value = true
        localStorage.setItem('auth_user', JSON.stringify(result.data))
        
        // 更新在线状态
        try {
          await ChatService.updateOnlineStatus(result.data.id, true)
        } catch (error) {
          console.warn('更新在线状态失败:', error)
        }
        
        return { success: true }
      } else {
        throw new Error(result.error || '注册失败')
      }
    } catch (error: any) {
      // 如果数据库注册失败，回退到模拟数据
      console.warn('数据库注册失败，使用模拟数据:', error.message)
      return await fallbackRegister({ username, password, nickname })
    } finally {
      loading.value = false
    }
  }

  // 模拟注册（开发阶段备用）
  const fallbackRegister = async (form: RegisterForm) => {
    // 检查用户名是否已存在
    if (mockUsers.some(u => u.username === form.username)) {
      throw new Error('用户名已存在')
    }
    
    // 模拟注册成功
    const newUser: User = {
      id: Date.now().toString(),
      username: form.username,
      nickname: form.nickname,
      avatar_url: '',
      balance: 0.00,
      phone: '',
      email: '',
      campus: form.campus || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockUsers.push(newUser)
    user.value = newUser
    isAuthenticated.value = true
    localStorage.setItem('auth_user', JSON.stringify(newUser))
    
    return { success: true }
  }

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const result = await AuthService.getCurrentUser()
      
      if (result.success && result.data) {
        user.value = result.data
        isAuthenticated.value = true
      } else {
        // 回退到本地存储检查
        const savedUser = localStorage.getItem('auth_user')
        if (savedUser) {
          user.value = JSON.parse(savedUser)
          isAuthenticated.value = true
        }
      }
    } catch (error) {
      console.warn('检查认证状态失败:', error)
      // 回退到本地存储检查
      const savedUser = localStorage.getItem('auth_user')
      if (savedUser) {
        user.value = JSON.parse(savedUser)
        isAuthenticated.value = true
      }
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
    localStorage.removeItem('auth_user')
  }

  // 更新用户信息
  const updateUser = (userInfo: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userInfo }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  // 更新用户信息（别名，与Profile.vue中保持一致）
  const updateUserInfo = (userInfo: Partial<User>) => {
    updateUser(userInfo)
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    updateUser,
    updateUserInfo
  }
})
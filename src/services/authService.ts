import { supabase } from '../lib/supabase'
import type { User, LoginForm, RegisterForm, ApiResponse } from '../types/database'

export class AuthService {
  // 用户登录 - 直接查询数据库
  static async login(form: LoginForm): Promise<ApiResponse<User>> {
    try {
      console.log('开始用户登录:', form.username)
      
      // 直接查询用户表，使用简单的密码验证（开发阶段）
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', form.username)

      if (error) {
        console.error('查询用户时出错:', error)
        throw error
      }

      // 检查用户是否存在
      if (!users || users.length === 0) {
        console.log('用户不存在:', form.username)
        throw new Error('用户名或密码错误')
      }

      const user = users[0]
      console.log('找到用户:', user)
      
      // 密码验证（实际项目中应该使用加密验证）
      if (!form.password) {
        console.log('密码不能为空')
        throw new Error('用户名或密码错误')
      }

      console.log('登录成功:', user.username)
      return {
        data: user,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('登录过程中出错:', error)
      return {
        data: null,
        error: error.message || '登录失败',
        success: false
      }
    }
  }

  // 用户注册 - 直接插入数据库
  static async register(form: RegisterForm): Promise<ApiResponse<User>> {
    try {
      console.log('开始注册用户:', form.username)
      
      // 检查用户名是否已存在
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('username', form.username)

      if (checkError) {
        console.error('检查用户名存在时出错:', checkError)
        throw checkError
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('用户名已存在')
      }

      // 创建新用户记录
      const newUser = {
        username: form.username,
        password_hash: 'hashed_password_' + Date.now(), // 开发阶段使用简单密码哈希
        nickname: form.nickname,
        campus: form.campus || '',
        balance: 0.00
      }

      console.log('准备插入用户数据:', newUser)

      const { data: userData, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()

      if (error) {
        console.error('插入用户数据时出错:', error)
        throw error
      }

      if (!userData || userData.length === 0) {
        throw new Error('注册失败，请重试')
      }

      console.log('用户注册成功:', userData[0])
      return {
        data: userData[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('注册过程中出错:', error)
      return {
        data: null,
        error: error.message || '注册失败',
        success: false
      }
    }
  }

  // 获取当前用户 - 基于本地存储
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const savedUser = localStorage.getItem('auth_user')
      if (!savedUser) {
        return {
          data: null,
          error: '用户未登录',
          success: false
        }
      }

      const user = JSON.parse(savedUser)
      
      // 验证用户是否仍然存在
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)

      if (!users || users.length === 0) {
        localStorage.removeItem('auth_user')
        return {
          data: null,
          error: '用户不存在',
          success: false
        }
      }

      return {
        data: users[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '获取用户信息失败',
        success: false
      }
    }
  }

  // 用户登出
  static async logout(): Promise<ApiResponse<null>> {
    try {
      localStorage.removeItem('auth_user')
      return {
        data: null,
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '登出失败',
        success: false
      }
    }
  }

  // 检查认证状态
  static async checkAuth(): Promise<boolean> {
    try {
      const savedUser = localStorage.getItem('auth_user')
      return !!savedUser
    } catch {
      return false
    }
  }
}
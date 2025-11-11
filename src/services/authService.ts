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
      
      // 检查用户状态
      if (user.status === 'suspended') {
        console.log('用户已被封禁:', form.username)
        throw new Error('您的账号已被封禁，请联系管理员')
      }
      
      // 严格的密码验证 - 修复安全漏洞
      if (!form.password) {
        console.log('密码不能为空')
        throw new Error('密码不能为空')
      }

      // 检查数据库中是否存储了密码（开发阶段）
      if (!user.password_hash) {
        console.log('用户密码哈希不存在')
        throw new Error('账户密码设置异常，请联系管理员')
      }

      // 严格密码验证（区分大小写，完全匹配）
      // 注意：实际项目中应该使用 bcrypt 或类似加密库进行验证
      const isPasswordCorrect = this.validatePassword(form.password, user.password_hash)
      
      if (!isPasswordCorrect) {
        console.log('密码验证失败:', form.username)
        throw new Error('密码错误')
      }

      console.log('密码验证成功，登录成功:', user.username)
      
      // 更新用户的最后登录时间
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('更新最后登录时间失败:', updateError)
      } else {
        console.log('更新最后登录时间成功')
      }
      
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

  // 密码验证方法（开发阶段简化版本）
  private static validatePassword(inputPassword: string, storedHash: string): boolean {
    // 开发阶段：简单的密码验证（实际项目应该使用加密验证）
    // 检查密码是否匹配（区分大小写，完全匹配）
    
    if (storedHash.startsWith('hashed_password_')) {
      // 从哈希中提取原始密码进行验证（开发阶段简化版本）
      // 实际项目中应该使用：await bcrypt.compare(inputPassword, storedHash)
      
      // 检查哈希格式：hashed_password_时间戳_实际密码
      const hashParts = storedHash.split('_')
      if (hashParts.length >= 4) {
        // 提取原始密码（哈希的最后一个部分）
        const originalPassword = hashParts.slice(3).join('_')
        
        // 严格密码验证：区分大小写，完全匹配
        return inputPassword === originalPassword
      }
      
      // 兼容旧格式：hashed_password_时间戳
      // 开发阶段默认密码为 '123456'
      return inputPassword === '123456'
    }
    
    return false
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

      // 验证密码强度
      if (!form.password || form.password.length < 6) {
        throw new Error('密码长度至少需要6个字符')
      }

      // 创建新用户记录，使用更安全的密码哈希格式
      const newUser = {
        username: form.username,
        password_hash: this.generatePasswordHash(form.password), // 使用实际密码生成哈希
        nickname: form.nickname,
        campus: form.campus || '',
        balance: 0.00,
        status: 'active',
        credit_score: 100,
        total_orders: 0,
        avg_rating: 5.00
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

  // 密码哈希生成方法（开发阶段简化版本）
  private static generatePasswordHash(password: string): string {
    // 开发阶段：简单的密码哈希（实际项目应该使用bcrypt或其他加密库）
    // 实际项目中应该使用：await bcrypt.hash(password, 12)
    
    // 这里使用简单的时间戳格式，但会包含实际密码信息用于验证
    return `hashed_password_${Date.now()}_${password}`
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
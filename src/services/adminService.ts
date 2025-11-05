import { supabase } from '../lib/supabase'
import type { User, Order, Transaction } from '../types/database'

// 管理员登录凭据（开发阶段使用）
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}

export class AdminService {
  // 管理员登录验证
  static async adminLogin(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 开发阶段使用固定凭据
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        return { success: true }
      }
      
      // 生产环境可以连接数据库验证管理员权限
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('id, username, role')
      //   .eq('username', username)
      //   .eq('password_hash', password) // 实际应该使用加密验证
      //   .eq('role', 'admin')
      //   .single()
      
      // if (error || !data) {
      //   return { success: false, error: '用户名或密码错误' }
      // }
      
      return { success: false, error: '用户名或密码错误' }
    } catch (error) {
      console.error('管理员登录验证失败:', error)
      return { success: false, error: '登录验证失败' }
    }
  }

  // 获取用户统计数据
  static async getUserStats() {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, created_at')
        
      if (error) throw error
      
      const totalUsers = users?.length || 0
      // 使用注册时间来判断活跃用户（30天内注册的用户视为活跃）
      const activeUsers = users?.filter(user => {
        const createdDate = new Date(user.created_at)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return createdDate > thirtyDaysAgo
      }).length || 0
      
      return {
        totalUsers,
        activeUsers,
        newUsersToday: users?.filter(user => {
          const today = new Date()
          const userDate = new Date(user.created_at)
          return userDate.toDateString() === today.toDateString()
        }).length || 0
      }
    } catch (error) {
      console.error('获取用户统计数据失败:', error)
      throw error
    }
  }

  // 获取订单统计数据
  static async getOrderStats() {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, status, created_at')
        
      if (error) throw error
      
      const totalOrders = orders?.length || 0
      const completedOrders = orders?.filter(order => order.status === 'completed').length || 0
      
      return {
        totalOrders,
        completedOrders,
        pendingOrders: orders?.filter(order => order.status === 'pending').length || 0
      }
    } catch (error) {
      console.error('获取订单统计数据失败:', error)
      throw error
    }
  }

  // 获取所有用户列表
  static async getUsers(page: number = 1, pageSize: number = 10, search: string = '') {
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })
      
      if (search) {
        query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
      }
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      // 为每个用户添加默认状态（因为数据库中没有status字段）
      const usersWithStatus = (data || []).map(user => ({
        ...user,
        status: 'active' // 默认所有用户都是活跃状态
      }))
      
      return {
        users: usersWithStatus,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  // 获取所有订单列表
  static async getOrders(page: number = 1, pageSize: number = 10, status: string = '') {
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          publisher:users!orders_publisher_id_fkey(username, avatar),
          receiver:users!orders_receiver_id_fkey(username, avatar)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })
      
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      return {
        orders: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      throw error
    }
  }

  // 获取交易记录
  static async getTransactions(page: number = 1, pageSize: number = 10) {
    try {
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      
      const { data, error, count } = await supabase
        .from('transactions')
        .select(`
          *,
          user:users!transactions_user_id_fkey(username)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return {
        transactions: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    } catch (error) {
      console.error('获取交易记录失败:', error)
      throw error
    }
  }

  // 更新用户状态（由于数据库中没有status字段，此方法仅用于演示）
  static async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    try {
      // 由于数据库中没有status字段，这里只返回成功信息
      // 在实际应用中，如果需要用户状态管理，需要在数据库中添加status字段
      console.log(`模拟更新用户 ${userId} 状态为: ${status}`)
      
      // 返回模拟的成功响应
      return { id: userId, status }
    } catch (error) {
      console.error('更新用户状态失败:', error)
      throw error
    }
  }

  // 更新订单状态
  static async updateOrderStatus(orderId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
      
      if (error) throw error
      return data?.[0]
    } catch (error) {
      console.error('更新订单状态失败:', error)
      throw error
    }
  }

  // 获取系统概览数据
  static async getDashboardData() {
    try {
      const [userStats, orderStats] = await Promise.all([
        this.getUserStats(),
        this.getOrderStats()
      ])
      
      return {
        ...userStats,
        ...orderStats
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error)
      throw error
    }
  }
}
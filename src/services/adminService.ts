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
        .select('id, created_at, last_login, status')
        
      if (error) throw error
      
      const totalUsers = users?.length || 0
      
      // 使用最后登录时间来判断活跃用户（最近7天内登录过的用户视为活跃）
      const activeUsers = users?.filter(user => {
        if (!user.last_login) return false
        const lastLogin = new Date(user.last_login)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return lastLogin > sevenDaysAgo
      }).length || 0
      
      // 获取封禁用户数（状态为 'suspended' 的用户）
      const bannedUsers = users?.filter(user => user.status === 'suspended').length || 0
      
      return {
        totalUsers,
        activeUsers,
        newUsersToday: users?.filter(user => {
          const today = new Date()
          const userDate = new Date(user.created_at)
          return userDate.toDateString() === today.toDateString()
        }).length || 0,
        bannedUsers
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
      
      // 获取今日新增订单数
      const todayOrders = orders?.filter(order => {
        const today = new Date()
        const orderDate = new Date(order.created_at)
        return orderDate.toDateString() === today.toDateString()
      }).length || 0
      
      return {
        totalOrders,
        completedOrders,
        pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
        todayOrders
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
      
      // 使用数据库中的真实状态字段
      const usersWithStatus = (data || []).map(user => ({
        ...user,
        status: user.status || 'active' // 如果数据库中没有状态，默认设为活跃
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
          requester:users!orders_requester_id_fkey(username, avatar_url),
          deliverer:users!orders_deliverer_id_fkey(username, avatar_url)
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

  // 更新用户状态
  static async updateUserStatus(userId: string, status: 'active' | 'suspended', reason?: string) {
    try {
      const updateData: any = { status }
      
      if (status === 'suspended') {
        updateData.suspension_reason = reason || '违反平台规则'
        updateData.suspended_at = new Date().toISOString()
      } else {
        updateData.suspension_reason = null
        updateData.suspended_at = null
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
      
      if (error) throw error
      
      // 记录系统日志
      await supabase
        .from('system_logs')
        .insert({
          action: 'update_user_status',
          description: `更新用户状态为: ${status}${reason ? `, 原因: ${reason}` : ''}`,
          user_id: userId
        })
      
      return data?.[0]
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

  // 删除订单（仅限未接单的订单）
  static async deleteOrder(orderId: string) {
    try {
      // 首先检查订单状态，只有未接单的订单才能删除
      const { data: order, error: checkError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()
      
      if (checkError) throw checkError
      
      if (!order) {
        throw new Error('订单不存在')
      }
      
      // 只有待接单的订单可以删除
      if (order.status !== 'pending') {
        throw new Error('只能删除未接单的订单')
      }
      
      // 执行删除操作
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
      
      if (deleteError) throw deleteError
      
      // 记录系统日志
      await supabase
        .from('system_logs')
        .insert({
          action: 'delete_order',
          description: `管理员删除未接单订单: ${orderId}`,
          target_id: orderId
        })
      
      return { success: true }
    } catch (error) {
      console.error('删除订单失败:', error)
      throw error
    }
  }

  // 获取订单趋势数据
  static async getOrderTrendData(days: number = 7) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, created_at, status')
        .gte('created_at', startDate.toISOString())
        
      if (error) throw error
      
      // 按日期分组统计订单数量
      const dateMap = new Map()
      const dates = []
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)
        dateMap.set(dateStr, 0)
      }
      
      orders?.forEach(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0]
        if (dateMap.has(orderDate)) {
          dateMap.set(orderDate, dateMap.get(orderDate) + 1)
        }
      })
      
      return {
        dates: dates,
        orderCounts: dates.map(date => dateMap.get(date))
      }
    } catch (error) {
      console.error('获取订单趋势数据失败:', error)
      throw error
    }
  }

  // 获取用户分布数据
  static async getUserDistributionData() {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, status, last_login, created_at')
        
      if (error) throw error
      
      // 根据最后登录时间计算用户状态分布
      const now = new Date()
      const statusCounts = {
        active: 0,        // 活跃（7天内登录）
        sevenDays: 0,    // 七天未登录
        oneMonth: 0,     // 一个月未登录
        sixMonths: 0,    // 半年未登录
        oneYear: 0,      // 长期不登录（大于一年）
        suspended: 0,    // 已封禁
        neverLogin: 0    // 从未登录
      }
      
      users?.forEach(user => {
        // 首先检查封禁状态
        if (user.status === 'suspended') {
          statusCounts.suspended++
          return
        }
        
        // 检查登录状态
        if (!user.last_login) {
          statusCounts.neverLogin++
          return
        }
        
        const lastLoginDate = new Date(user.last_login)
        const timeDiff = now.getTime() - lastLoginDate.getTime()
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= 7) {
          statusCounts.active++
        } else if (daysDiff <= 30) {
          statusCounts.sevenDays++
        } else if (daysDiff <= 180) {
          statusCounts.oneMonth++
        } else if (daysDiff <= 365) {
          statusCounts.sixMonths++
        } else {
          statusCounts.oneYear++
        }
      })
      
      return {
        statusDistribution: [
          { name: '活跃', value: statusCounts.active },
          { name: '七天未登录', value: statusCounts.sevenDays },
          { name: '一个月未登录', value: statusCounts.oneMonth },
          { name: '半年未登录', value: statusCounts.sixMonths },
          { name: '长期不登录', value: statusCounts.oneYear },
          { name: '从未登录', value: statusCounts.neverLogin },
          { name: '已封禁', value: statusCounts.suspended }
        ],
        registrationStats: {
          total: users?.length || 0,
          recent: users?.filter(user => {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            return new Date(user.created_at) > thirtyDaysAgo
          }).length || 0,
          old: (users?.length || 0) - (users?.filter(user => {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            return new Date(user.created_at) > thirtyDaysAgo
          }).length || 0)
        }
      }
    } catch (error) {
      console.error('获取用户分布数据失败:', error)
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
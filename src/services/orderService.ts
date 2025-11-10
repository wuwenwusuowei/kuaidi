import { supabase } from '../lib/supabase'
import type { Order, ApiResponse } from '../types/database'

export class OrderService {
  // 创建订单（带网络重试机制）
  static async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Order>> {
    const maxRetries = 3
    const retryDelay = 1000 // 1秒
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 生成订单号
        const orderNumber = 'ORD' + Date.now().toString()
        
        // 确保所有字段都正确传递到数据库
        const newOrder = {
          ...orderData,
          order_number: orderNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('准备插入数据库的订单数据 (尝试', attempt, '):', JSON.stringify(newOrder, null, 2))

        const { data, error } = await supabase
          .from('orders')
          .insert(newOrder)
          .select()

        if (error) throw error

        if (!data || data.length === 0) {
          throw new Error('创建订单失败')
        }

        console.log('订单创建成功:', data[0])
        return {
          data: data[0],
          error: null,
          success: true
        }
      } catch (error: any) {
        console.warn('创建订单失败 (尝试', attempt, '/', maxRetries, '):', error)
        
        // 如果是网络错误，等待后重试
        if (attempt < maxRetries && (error.code === '' || error.message.includes('Failed to fetch'))) {
          console.log('网络连接问题，等待', retryDelay * attempt, 'ms后重试...')
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          continue
        }
        
        // 最后一次尝试或非网络错误
        return {
          data: null,
          error: error.message || '创建订单失败',
          success: false
        }
      }
    }
    
    return {
      data: null,
      error: '创建订单失败：重试次数已用完',
      success: false
    }
  }

  // 获取所有订单
  static async getAllOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '获取订单失败',
        success: false
      }
    }
  }

  // 获取待接单的订单
  static async getPendingOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '获取待接单订单失败',
        success: false
      }
    }
  }

  // 获取用户发布的订单（带重试机制）
  static async getUserOrders(userId: string): Promise<ApiResponse<Order[]>> {
    const maxRetries = 3
    const retryDelay = 1000 // 1秒
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('requester_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        return {
          data: data || [],
          error: null,
          success: true
        }
      } catch (error: any) {
        console.warn(`获取用户订单失败 (尝试 ${attempt}/${maxRetries}):`, error)
        
        // 如果是最后一次尝试，返回错误
        if (attempt === maxRetries) {
          return {
            data: null,
            error: error.message || '获取用户订单失败',
            success: false
          }
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
    
    return {
      data: null,
      error: '获取用户订单失败：重试次数已用完',
      success: false
    }
  }

  // 获取代领员接单的订单（带重试机制）
  static async getDelivererOrders(userId: string): Promise<ApiResponse<Order[]>> {
    const maxRetries = 3
    const retryDelay = 1000 // 1秒
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('deliverer_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        return {
          data: data || [],
          error: null,
          success: true
        }
      } catch (error: any) {
        console.warn(`获取代领订单失败 (尝试 ${attempt}/${maxRetries}):`, error)
        
        // 如果是最后一次尝试，返回错误
        if (attempt === maxRetries) {
          return {
            data: null,
            error: error.message || '获取代领订单失败',
            success: false
          }
        }
        
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
    
    return {
      data: null,
      error: '获取代领订单失败：重试次数已用完',
      success: false
    }
  }

  // 接单
  static async acceptOrder(orderId: string, delivererId: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          deliverer_id: delivererId,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('status', 'pending')
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('接单失败，订单可能已被接单')
      }

      return {
        data: data[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '接单失败',
        success: false
      }
    }
  }

  // 更新订单状态
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<ApiResponse<Order>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      // 根据状态设置相应的时间戳
      if (status === 'picking') {
        updateData.picked_up_at = new Date().toISOString()
      } else if (status === 'delivering') {
        updateData.delivered_at = new Date().toISOString()
      } else if (status === 'awaiting_payment') {
        updateData.delivered_at = new Date().toISOString()
      } else if (status === 'completed') {
        updateData.delivered_at = new Date().toISOString()
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('更新订单状态失败')
      }

      return {
        data: data[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '更新订单状态失败',
        success: false
      }
    }
  }

  // 取消订单（专用方法）
  static async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
    try {
      // 首先检查订单是否存在且可以取消
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) {
        throw new Error('订单不存在')
      }

      // 检查订单状态是否可以取消
      if (orderData.status === 'completed' || orderData.status === 'cancelled') {
        throw new Error('订单无法取消')
      }

      // 执行取消操作
      const updateData = {
        status: 'cancelled' as const,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('取消订单失败')
      }

      return {
        data: data[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '取消订单失败',
        success: false
      }
    }
  }

  // 根据ID获取订单
  static async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '获取订单详情失败',
        success: false
      }
    }
  }
}
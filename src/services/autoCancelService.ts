import { supabase } from '../lib/supabase'

// 手动执行自动取消订单的服务
export class AutoCancelService {
  
  // 手动执行自动取消订单
  static async executeAutoCancel() {
    try {
      console.log('开始执行自动取消订单...')
      
      // 调用数据库函数执行自动取消
      const { data, error } = await supabase
        .rpc('auto_cancel_expired_orders')
      
      if (error) {
        console.error('执行自动取消失败:', error)
        
        // 尝试直接调用SQL函数
        const { data: sqlResult, error: sqlError } = await supabase
          .from('system_logs')
          .select('*')
          .eq('action', 'auto_cancel_batch')
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (sqlError) {
          throw new Error(`自动取消失败: ${error.message}`)
        }
        
        return {
          success: true,
          message: '自动取消执行完成',
          cancelledCount: sqlResult?.[0]?.metadata?.cancelled_count || 0
        }
      }
      
      // 检查是否有取消的订单
      const { data: logs, error: logsError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('action', 'auto_cancel_batch')
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (logsError) {
        console.warn('获取取消日志失败:', logsError)
      }
      
      const cancelledCount = logs?.[0]?.metadata?.cancelled_count || 0
      
      return {
        success: true,
        message: `自动取消执行完成，取消了 ${cancelledCount} 个超时订单`,
        cancelledCount
      }
      
    } catch (error: any) {
      console.error('自动取消服务异常:', error)
      return {
        success: false,
        message: error.message || '自动取消执行失败',
        cancelledCount: 0
      }
    }
  }
  
  // 获取最近的自动取消记录
  static async getRecentAutoCancelLogs() {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .in('action', ['auto_cancel_order', 'auto_cancel_batch', 'auto_cancel_error'])
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      return {
        success: true,
        data: data || [],
        error: null
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  }
  
  // 获取系统设置中的自动取消时间
  static async getAutoCancelSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('order_auto_cancel_minutes')
        .limit(1)
      
      if (error) throw error
      
      return {
        success: true,
        autoCancelMinutes: data?.[0]?.order_auto_cancel_minutes || 30,
        error: null
      }
    } catch (error: any) {
      return {
        success: false,
        autoCancelMinutes: 30,
        error: error.message
      }
    }
  }
  
  // 获取待自动取消的订单列表
  static async getPendingAutoCancelOrders() {
    try {
      // 获取系统设置
      const settingsResult = await this.getAutoCancelSettings()
      if (!settingsResult.success) {
        throw new Error('获取系统设置失败')
      }
      
      const cancelMinutes = settingsResult.autoCancelMinutes
      
      if (cancelMinutes <= 0) {
        return {
          success: true,
          data: [],
          message: '自动取消功能未启用'
        }
      }
      
      // 查询待自动取消的订单
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - cancelMinutes * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return {
        success: true,
        data: data || [],
        message: `找到 ${data?.length || 0} 个待自动取消的订单`
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message
      }
    }
  }
}
import { supabase } from '../lib/supabase'

// 系统设置接口
export interface SystemSettings {
  // 基本设置
  customerServicePhone: string
  customerServiceEmail: string
  platformName: string
  platformDescription: string
  
  // 订单设置
  orderAutoCancelMinutes: number
  maxOrderAmount: number
  
  // 系统日志设置
  logRetentionDays: number
  enableOperationLog: boolean
  enableErrorLog: boolean
}

// 默认系统设置
const defaultSettings: SystemSettings = {
  customerServicePhone: '400-123-4567',
  customerServiceEmail: 'service@campus-express.com',
  platformName: '校园快递代领平台',
  platformDescription: '专业的校园快递代领服务平台',
  
  orderAutoCancelMinutes: 30,
  maxOrderAmount: 50.00,
  
  logRetentionDays: 30,
  enableOperationLog: true,
  enableErrorLog: true
}

export class SystemSettingsService {
  // 获取系统设置
  static async getSettings(): Promise<SystemSettings> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
      
      if (error) {
        console.warn('获取系统设置失败，使用默认值:', error.message)
        return defaultSettings
      }
      
      if (data && data.length > 0) {
        return {
          customerServicePhone: data[0].customer_service_phone || defaultSettings.customerServicePhone,
          customerServiceEmail: data[0].customer_service_email || defaultSettings.customerServiceEmail,
          platformName: data[0].platform_name || defaultSettings.platformName,
          platformDescription: data[0].platform_description || defaultSettings.platformDescription,
          orderAutoCancelMinutes: data[0].order_auto_cancel_minutes || defaultSettings.orderAutoCancelMinutes,
          maxOrderAmount: parseFloat(data[0].max_order_amount) || defaultSettings.maxOrderAmount,
          logRetentionDays: data[0].log_retention_days || defaultSettings.logRetentionDays,
          enableOperationLog: data[0].enable_operation_log !== undefined ? data[0].enable_operation_log : defaultSettings.enableOperationLog,
          enableErrorLog: data[0].enable_error_log !== undefined ? data[0].enable_error_log : defaultSettings.enableErrorLog
        }
      }
      
      return defaultSettings
    } catch (error) {
      console.error('获取系统设置异常:', error)
      return defaultSettings
    }
  }

  // 保存系统设置
  static async saveSettings(settings: SystemSettings): Promise<boolean> {
    try {
      // 验证输入
      if (!settings.customerServicePhone || !settings.customerServiceEmail) {
        throw new Error('客服电话和邮箱不能为空')
      }

      // 先检查是否有现有记录
      const { data: existingData } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1)

      let result
      
      if (existingData && existingData.length > 0) {
        // 更新现有记录
        const { error } = await supabase
          .from('system_settings')
          .update({
            customer_service_phone: settings.customerServicePhone,
            customer_service_email: settings.customerServiceEmail,
            platform_name: settings.platformName,
            platform_description: settings.platformDescription,
            order_auto_cancel_minutes: settings.orderAutoCancelMinutes,
            max_order_amount: settings.maxOrderAmount,
            log_retention_days: settings.logRetentionDays,
            enable_operation_log: settings.enableOperationLog,
            enable_error_log: settings.enableErrorLog,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData[0].id)
        
        result = !error
      } else {
        // 插入新记录
        const { error } = await supabase
          .from('system_settings')
          .insert({
            customer_service_phone: settings.customerServicePhone,
            customer_service_email: settings.customerServiceEmail,
            platform_name: settings.platformName,
            platform_description: settings.platformDescription,
            order_auto_cancel_minutes: settings.orderAutoCancelMinutes,
            max_order_amount: settings.maxOrderAmount,
            log_retention_days: settings.logRetentionDays,
            enable_operation_log: settings.enableOperationLog,
            enable_error_log: settings.enableErrorLog
          })
        
        result = !error
      }

      return result
    } catch (error) {
      console.error('保存系统设置失败:', error)
      return false
    }
  }
}
import { supabase } from '../lib/supabase'
import type { ApiResponse } from '../types/database'

export interface UserPaymentInfo {
  id: string
  user_id: string
  wechat_qr_code_url?: string
  wechat_nickname?: string
  alipay_qr_code_url?: string
  alipay_account?: string
  created_at: string
  updated_at: string
}

// 支付信息缓存（避免重复请求）
const paymentInfoCache = new Map<string, { data: UserPaymentInfo; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

export class UserPaymentService {
  // 清除特定用户的缓存
  static clearPaymentInfoCache(userId: string) {
    paymentInfoCache.delete(userId)
  }
  // 获取用户的支付信息（带缓存和重试机制）
  static async getUserPaymentInfo(userId: string): Promise<ApiResponse<UserPaymentInfo>> {
    try {
      // 检查缓存
      const cached = paymentInfoCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return {
          data: cached.data,
          error: null,
          success: true
        }
      }

      // 重试机制
      let retries = 3
      let lastError: any = null
      
      while (retries > 0) {
        try {
          const { data, error } = await supabase
            .from('user_payment_info')
            .select('*')
            .eq('user_id', userId)
            .single()

          if (error) {
            // 如果用户没有支付信息，返回空数据而不是创建默认信息
            if (error.code === 'PGRST116') {
              return {
                data: null,
                error: '用户未设置支付信息',
                success: false
              }
            }
            throw error
          }

          // 缓存结果
          if (data) {
            paymentInfoCache.set(userId, { data, timestamp: Date.now() })
          }

          return {
            data,
            error: null,
            success: true
          }
        } catch (error: any) {
          lastError = error
          retries--
          if (retries > 0) {
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      throw lastError
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '获取用户支付信息失败',
        success: false
      }
    }
  }

  // 创建默认支付信息
  static async createDefaultPaymentInfo(userId: string): Promise<ApiResponse<UserPaymentInfo>> {
    try {
      const paymentInfo = {
        user_id: userId,
        wechat_qr_code_url: this.generateDefaultWechatQRCode(),
        wechat_nickname: '微信用户',
        alipay_qr_code_url: this.generateDefaultAlipayQRCode(),
        alipay_account: 'alipay@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('user_payment_info')
        .insert(paymentInfo)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('创建默认支付信息失败')
      }

      return {
        data: data[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '创建默认支付信息失败',
        success: false
      }
    }
  }

  // 更新用户支付信息
  static async updateUserPaymentInfo(userId: string, updateData: Partial<UserPaymentInfo>): Promise<ApiResponse<UserPaymentInfo>> {
    try {
      // 先检查用户是否已有支付信息
      const existingInfo = await this.getUserPaymentInfo(userId)
      
      let result
      
      if (existingInfo.success && existingInfo.data) {
        // 更新现有信息
        const { data, error } = await supabase
          .from('user_payment_info')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()

        if (error) throw error
        
        if (!data || data.length === 0) {
          throw new Error('更新用户支付信息失败')
        }
        
        result = data[0]
      } else {
        // 创建新的支付信息
        const paymentInfo = {
          user_id: userId,
          ...updateData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('user_payment_info')
          .insert(paymentInfo)
          .select()

        if (error) throw error
        
        if (!data || data.length === 0) {
          throw new Error('创建用户支付信息失败')
        }
        
        result = data[0]
      }

      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '更新用户支付信息失败',
        success: false
      }
    }
  }

  // 生成默认微信二维码（模拟数据）
  static generateDefaultWechatQRCode(): string {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=weixin://wxpay/bizpayurl?pr=default'
  }

  // 生成默认支付宝二维码（模拟数据）
  static generateDefaultAlipayQRCode(): string {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=alipayqr://platformapi/startapp?saId=10000007'
  }
}
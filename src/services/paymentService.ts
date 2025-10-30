import { supabase } from '../lib/supabase'
import type { ApiResponse } from '../types/database'

export interface PaymentInfo {
  id: string
  order_id: string
  payer_id: string
  payee_id: string
  amount: number
  status: 'pending' | 'paid' | 'confirmed' | 'cancelled'
  payment_method: 'wechat' | 'alipay' | 'balance'
  qr_code_url?: string
  transaction_id?: string
  created_at: string
  paid_at?: string
  confirmed_at?: string
}

export class PaymentService {
  // 创建支付记录
  static async createPayment(orderId: string, payerId: string, payeeId: string, amount: number): Promise<ApiResponse<PaymentInfo>> {
    try {
      const paymentData = {
        order_id: orderId,
        payer_id: payerId,
        payee_id: payeeId,
        amount,
        status: 'pending',
        payment_method: 'wechat',
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('创建支付记录失败')
      }

      return {
        data: data[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '创建支付记录失败',
        success: false
      }
    }
  }

  // 获取订单的支付信息
  static async getPaymentByOrderId(orderId: string): Promise<ApiResponse<PaymentInfo>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
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
        error: error.message || '获取支付信息失败',
        success: false
      }
    }
  }

  // 更新支付状态
  static async updatePaymentStatus(paymentId: string, status: PaymentInfo['status']): Promise<ApiResponse<PaymentInfo>> {
    try {
      const updateData: any = {
        status
      }

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString()
      } else if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('更新支付状态失败')
      }

      return {
        data: data[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '更新支付状态失败',
        success: false
      }
    }
  }

  // 设置支付二维码
  static async setPaymentQRCode(paymentId: string, qrCodeUrl: string): Promise<ApiResponse<PaymentInfo>> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update({
          qr_code_url: qrCodeUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error('设置支付二维码失败')
      }

      return {
        data: data[0],
        error: null,
        success: true
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message || '设置支付二维码失败',
        success: false
      }
    }
  }

  // 模拟生成微信支付二维码（实际项目中应该调用微信支付API）
  static generateWechatQRCode(amount: number, orderNumber: string): string {
    // 这里模拟生成二维码URL，实际项目中应该调用微信支付API
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/'
    const qrContent = `weixin://wxpay/bizpayurl?pr=${orderNumber}&amount=${amount * 100}`
    return `${baseUrl}?size=200x200&data=${encodeURIComponent(qrContent)}`
  }
}
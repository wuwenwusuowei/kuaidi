import { supabase } from '../lib/supabase'
import type { ApiResponse } from '../types/database'

// 消息接口
export interface Message {
  id: string
  order_id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  message_type: 'text' | 'image' | 'file' | 'system'
  created_at: string
}

// 聊天会话接口
export interface ChatSession {
  id: string
  order_id: string
  user1_id: string
  user2_id: string
  last_message: string
  last_message_at: string
  unread_count_user1: number
  unread_count_user2: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 在线状态接口
export interface OnlineStatus {
  user_id: string
  is_online: boolean
  last_seen_at: string
  updated_at: string
}

export class ChatService {
  // 发送消息
  static async sendMessage(
    orderId: string,
    senderId: string,
    receiverId: string,
    content: string,
    messageType: 'text' | 'image' | 'file' | 'system' = 'text'
  ): Promise<ApiResponse<Message>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: content,
          message_type: messageType,
          is_read: false
        })
        .select()
        .single()

      if (error) throw error

      return {
        data,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('发送消息失败:', error)
      return {
        data: null,
        error: error.message || '发送消息失败',
        success: false
      }
    }
  }

  // 获取订单的聊天消息（带重试机制）
  static async getOrderMessages(orderId: string, currentUserId: string): Promise<ApiResponse<Message[]>> {
    const maxRetries = 3
    const retryDelay = 1000
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 使用数据库函数获取消息（会自动标记为已读）
        const { data, error } = await supabase
          .rpc('get_order_messages', {
            p_order_id: orderId,
            p_current_user_id: currentUserId
          })

        if (error) throw error

        return {
          data: data || [],
          error: null,
          success: true
        }
      } catch (error: any) {
        console.error(`获取订单消息失败 (尝试 ${attempt}/${maxRetries}):`, error)
        
        if (attempt === maxRetries) {
          return {
            data: null,
            error: error.message || '获取消息失败',
            success: false
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
    
    return {
      data: null,
      error: '获取消息失败',
      success: false
    }
  }

  // 获取用户的聊天会话列表
  static async getUserChatSessions(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_chat_sessions', { user_uuid: userId })

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('获取用户聊天会话失败:', error)
      return {
        data: null,
        error: error.message || '获取聊天会话失败',
        success: false
      }
    }
  }

  // 标记消息为已读
  static async markMessagesAsRead(messageIds: string[]): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)

      if (error) throw error

      return {
        data: undefined,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('标记消息为已读失败:', error)
      return {
        data: undefined,
        error: error.message || '标记消息为已读失败',
        success: false
      }
    }
  }

  // 获取或创建聊天会话
  static async getOrCreateChatSession(
    orderId: string,
    user1Id: string,
    user2Id: string
  ): Promise<ApiResponse<ChatSession>> {
    try {
      // 先尝试获取现有会话
      const { data: existingSession, error: queryError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('order_id', orderId)
        .eq('user1_id', user1Id)
        .eq('user2_id', user2Id)
        .single()

      if (!queryError && existingSession) {
        return {
          data: existingSession,
          error: null,
          success: true
        }
      }

      // 创建新会话
      const { data: newSession, error: insertError } = await supabase
        .from('chat_sessions')
        .insert({
          order_id: orderId,
          user1_id: user1Id,
          user2_id: user2Id,
          is_active: true
        })
        .select()
        .single()

      if (insertError) throw insertError

      return {
        data: newSession,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('获取或创建聊天会话失败:', error)
      return {
        data: null,
        error: error.message || '获取或创建聊天会话失败',
        success: false
      }
    }
  }

  // 更新用户在线状态
  static async updateOnlineStatus(userId: string, isOnline: boolean): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('online_status')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen_at: new Date().toISOString()
        })

      if (error) throw error

      return {
        data: undefined,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('更新在线状态失败:', error)
      return {
        data: undefined,
        error: error.message || '更新在线状态失败',
        success: false
      }
    }
  }

  // 获取用户在线状态
  static async getUserOnlineStatus(userId: string): Promise<ApiResponse<OnlineStatus>> {
    try {
      const { data, error } = await supabase
        .from('online_status')
        .select('user_id, is_online, last_seen_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        // 如果表不存在或记录不存在，返回默认状态
        if (error.code === 'PGRST116' || error.message.includes('relation')) {
          return {
            data: {
              user_id: userId,
              is_online: false,
              last_seen_at: new Date().toISOString()
            },
            error: null,
            success: true
          }
        }
        throw error
      }

      return {
        data: data || {
          user_id: userId,
          is_online: false,
          last_seen_at: new Date().toISOString()
        },
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('获取用户在线状态失败:', error)
      // 返回默认的离线状态
      return {
        data: {
          user_id: userId,
          is_online: false,
          last_seen_at: new Date().toISOString()
        },
        error: null,
        success: true
      }
    }
  }

  // 订阅消息实时更新
  static subscribeToMessages(orderId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`
        },
        callback
      )
      .subscribe((status) => {
        console.log('实时订阅状态:', status)
      })
    
    return channel
  }

  // 订阅在线状态实时更新
  static subscribeToOnlineStatus(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`online_status:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'online_status',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  }

  // 取消订阅
  static unsubscribe(channel: any) {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }

  // 获取已完成订单的聊天记录
  static async getCompletedOrderChats(): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_completed_order_chats')

      if (error) throw error

      return {
        data: data || [],
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('获取已完成订单聊天记录失败:', error)
      return {
        data: null,
        error: error.message || '获取已完成订单聊天记录失败',
        success: false
      }
    }
  }

  // 手动清理聊天记录
  static async manualCleanupChatMessages(orderId?: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('manual_cleanup_chat_messages', { 
          p_order_id: orderId || null
        })

      if (error) throw error

      return {
        data: data || { deleted_messages: 0, deleted_sessions: 0 },
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('清理聊天记录失败:', error)
      return {
        data: null,
        error: error.message || '清理聊天记录失败',
        success: false
      }
    }
  }

  // 自动清理聊天记录
  static async autoCleanupChatMessages(): Promise<ApiResponse<number>> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_chat_messages_by_order_status')

      if (error) throw error

      return {
        data: data || 0,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('自动清理聊天记录失败:', error)
      return {
        data: null,
        error: error.message || '自动清理聊天记录失败',
        success: false
      }
    }
  }
}
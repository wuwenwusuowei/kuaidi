import { supabase } from '../lib/supabase'
import type { ApiResponse } from '../types/database'

export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar_url?: string
  phone?: string
  email?: string
  campus?: string
}

export class UserService {
  // 根据用户ID获取用户信息
  static async getUserById(userId: string): Promise<ApiResponse<UserInfo>> {
    try {
      console.log('开始获取用户信息:', userId)
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, nickname, avatar_url, phone, email, campus')
        .eq('id', userId)

      if (error) {
        console.error('查询用户信息时出错:', error)
        throw error
      }

      // 检查用户是否存在
      if (!users || users.length === 0) {
        console.log('用户不存在:', userId)
        throw new Error('用户不存在')
      }

      const user = users[0]
      console.log('获取用户信息成功:', user.nickname)
      
      return {
        data: user,
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('获取用户信息过程中出错:', error)
      return {
        data: null,
        error: error.message || '获取用户信息失败',
        success: false
      }
    }
  }

  // 批量获取用户信息
  static async getUsersByIds(userIds: string[]): Promise<ApiResponse<UserInfo[]>> {
    try {
      if (userIds.length === 0) {
        return {
          data: [],
          error: null,
          success: true
        }
      }

      console.log('开始批量获取用户信息:', userIds)
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, nickname, avatar_url, phone, email, campus')
        .in('id', userIds)

      if (error) {
        console.error('批量查询用户信息时出错:', error)
        throw error
      }

      console.log('批量获取用户信息成功:', users?.length)
      
      return {
        data: users || [],
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('批量获取用户信息过程中出错:', error)
      return {
        data: [],
        error: error.message || '批量获取用户信息失败',
        success: false
      }
    }
  }

  // 根据昵称搜索用户
  static async searchUsersByNickname(nickname: string): Promise<ApiResponse<UserInfo[]>> {
    try {
      console.log('开始搜索用户:', nickname)
      
      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, nickname, avatar_url, phone, email, campus')
        .ilike('nickname', `%${nickname}%`)
        .limit(10)

      if (error) {
        console.error('搜索用户时出错:', error)
        throw error
      }

      console.log('搜索用户成功:', users?.length)
      
      return {
        data: users || [],
        error: null,
        success: true
      }
    } catch (error: any) {
      console.error('搜索用户过程中出错:', error)
      return {
        data: [],
        error: error.message || '搜索用户失败',
        success: false
      }
    }
  }
}
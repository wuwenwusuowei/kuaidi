import { createClient } from '@supabase/supabase-js'

// 环境变量验证和错误处理
const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  // 开发环境检查
  if (import.meta.env.DEV) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables are not set in development mode')
    }
  }
  
  // 生产环境严格检查
  if (import.meta.env.PROD) {
    if (!supabaseUrl) {
      console.error('VITE_SUPABASE_URL is required for production')
      throw new Error('VITE_SUPABASE_URL is required')
    }
    if (!supabaseAnonKey) {
      console.error('VITE_SUPABASE_ANON_KEY is required for production')
      throw new Error('VITE_SUPABASE_ANON_KEY is required')
    }
  }
  
  return { supabaseUrl, supabaseAnonKey }
}

const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit' // 使用隐式流程避免邮箱验证
  },
  global: {
    headers: {
      'X-Client-Info': 'kuaidi2-admin'
    }
  },
  db: {
    schema: 'public'
  },
  // 添加超时和重试配置
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
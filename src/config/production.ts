// 生产环境配置
export const productionConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // 验证配置
  validate() {
    if (!this.supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is required for production')
    }
    if (!this.supabaseAnonKey) {
      throw new Error('VITE_SUPABASE_ANON_KEY is required for production')
    }
    return true
  }
}
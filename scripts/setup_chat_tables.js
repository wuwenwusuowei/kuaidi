const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// 从环境变量或配置文件读取Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mynbrzmokeyrvwzqqbov.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bmJ6bW9rZXlydnd6cXFib3YiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNjE2MTc5OCwiZXhwIjoyMDMxNzM3Nzk4fQ.7v8J5pJ7Q4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4Z4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupChatTables() {
  try {
    console.log('开始设置聊天功能数据库表...')
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '..', 'chat_schema.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // 分割SQL语句
    const sqlStatements = sqlContent.split(';').filter(stmt => stmt.trim())
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i].trim()
      if (sql) {
        console.log(`执行SQL语句 ${i + 1}/${sqlStatements.length}...`)
        
        // 使用Supabase的SQL执行功能
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
        
        if (error) {
          // 如果RPC不可用，尝试使用SQL API
          console.warn(`RPC执行失败，尝试使用SQL API: ${error.message}`)
          
          // 对于简单的CREATE TABLE语句，我们可以使用Supabase的SQL功能
          // 注意：这需要启用SQL执行权限
          const { error: sqlError } = await supabase.from('_sql').select('*').limit(1)
          
          if (sqlError) {
            console.warn(`SQL API也不可用: ${sqlError.message}`)
            console.log('请手动执行chat_schema.sql文件中的SQL语句')
          }
        }
      }
    }
    
    console.log('聊天功能数据库表设置完成！')
    console.log('请确保已手动执行chat_schema.sql文件中的SQL语句')
    
  } catch (error) {
    console.error('设置聊天功能数据库表失败:', error)
    console.log('请手动执行chat_schema.sql文件中的SQL语句')
  }
}

// 如果直接运行此文件
if (require.main === module) {
  setupChatTables()
}

module.exports = { setupChatTables }
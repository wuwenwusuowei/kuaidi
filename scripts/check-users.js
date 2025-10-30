// 查询用户表数据
const supabaseUrl = 'https://mynbrzmokeyrvwzqqbov.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bmJyem1va2V5cnZ3enFxYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDQ5ODcsImV4cCI6MjA3NjgyMDk4N30.kbhaLH5G0ppAUiDjyBBXPRxYlQRpDWH8BZETx0f4lJc'

async function checkUsers() {
  console.log('🔍 查询用户表数据...\n')
  
  try {
    // 查询所有用户
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const users = await response.json()
      
      console.log(`✅ 查询成功！当前用户表中有 ${users.length} 个账户\n`)
      
      if (users.length > 0) {
        console.log('📋 用户列表：')
        users.forEach((user, index) => {
          console.log(`\n${index + 1}. 用户信息：`)
          console.log(`   ID: ${user.id}`)
          console.log(`   用户名: ${user.username}`)
          console.log(`   昵称: ${user.nickname}`)
          console.log(`   校区: ${user.campus || '未设置'}`)
          console.log(`   余额: ¥${user.balance}`)
          console.log(`   信用分: ${user.credit_score}`)
          console.log(`   总订单数: ${user.total_orders}`)
          console.log(`   平均评分: ${user.avg_rating}`)
          console.log(`   创建时间: ${user.created_at}`)
        })
      } else {
        console.log('❌ 用户表为空，没有注册成功的用户')
      }
      
    } else {
      console.log('❌ 查询失败:', response.status, response.statusText)
      const errorText = await response.text()
      console.log('错误详情:', errorText)
      
      if (response.status === 401) {
        console.log('\n⚠️  可能是RLS策略阻止访问，需要先执行数据库迁移脚本')
      } else if (response.status === 404) {
        console.log('\n⚠️  用户表可能不存在，需要先执行数据库迁移脚本')
      }
    }
    
  } catch (error) {
    console.log('❌ 查询过程中出错:', error.message)
  }
}

checkUsers()
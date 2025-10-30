import('node-fetch').then(fetch => {
  // 测试Supabase连接和操作
  const supabaseUrl = 'https://mynbrzmokeyrvwzqqbov.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bmJyem1va2V5cnZ3enFxYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDQ5ODcsImV4cCI6MjA3NjgyMDk4N30.kbhaLH5G0ppAUiDjyBBXPRxYlQRpDWH8BZETx0f4lJc'

  async function testConnection() {
    console.log('测试Supabase连接...')
    
    try {
      // 测试查询用户表
      const response = await fetch.default(`${supabaseUrl}/rest/v1/users?select=*`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ 数据库连接成功')
        console.log('当前用户数量:', data.length)
        console.log('用户列表:', data.map(u => ({ id: u.id, username: u.username })))
      } else {
        console.log('❌ 数据库连接失败:', response.status, response.statusText)
        const errorText = await response.text()
        console.log('错误详情:', errorText)
      }
    } catch (error) {
      console.log('❌ 连接测试出错:', error.message)
    }
  }

  async function testInsert() {
    console.log('\n测试插入用户数据...')
    
    try {
      const testUser = {
        username: 'testuser_' + Date.now(),
        password_hash: 'test_hash',
        nickname: '测试用户',
        campus: '清华大学',
        balance: 0.00,
        credit_score: 100,
        total_orders: 0,
        avg_rating: 5.00
      }

      const response = await fetch.default(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(testUser)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ 用户插入成功')
        console.log('插入的用户:', data[0])
      } else {
        console.log('❌ 用户插入失败:', response.status, response.statusText)
        const errorText = await response.text()
        console.log('错误详情:', errorText)
      }
    } catch (error) {
      console.log('❌ 插入测试出错:', error.message)
    }
  }

  async function runTests() {
    await testConnection()
    await testInsert()
  }

  runTests()
}).catch(err => {
  console.log('需要安装node-fetch: npm install node-fetch')
})
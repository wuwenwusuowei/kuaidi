// 测试聊天功能数据库函数
const { createClient } = require('@supabase/supabase-js')

// 从环境变量或配置文件中读取Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mynbrzmokeyrvwzqqbov.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bmJiem1va2V5cnZ3enFxYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwMDAwMDAsImV4cCI6MjA0NTU3NjAwMH0.placeholder'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testChatFunction() {
  console.log('开始测试聊天功能数据库函数...')
  
  try {
    // 1. 测试获取订单消息函数
    console.log('\n1. 测试 get_order_messages 函数...')
    
    // 首先获取一个存在的订单ID
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1)
    
    if (ordersError) {
      console.error('获取订单失败:', ordersError)
      return
    }
    
    if (orders.length === 0) {
      console.log('没有找到订单，请先创建订单')
      return
    }
    
    const orderId = orders[0].id
    console.log('使用订单ID:', orderId)
    
    // 获取一个存在的用户ID
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError) {
      console.error('获取用户失败:', usersError)
      return
    }
    
    if (users.length === 0) {
      console.log('没有找到用户，请先创建用户')
      return
    }
    
    const userId = users[0].id
    console.log('使用用户ID:', userId)
    
    // 测试函数调用
    const { data: messages, error: funcError } = await supabase
      .rpc('get_order_messages', {
        order_uuid: orderId,
        current_user_uuid: userId
      })
    
    if (funcError) {
      console.error('函数调用失败:', funcError)
      console.log('错误详情:', JSON.stringify(funcError, null, 2))
    } else {
      console.log('函数调用成功!')
      console.log('返回消息数量:', messages?.length || 0)
    }
    
    // 2. 测试获取用户聊天会话函数
    console.log('\n2. 测试 get_user_chat_sessions 函数...')
    
    const { data: sessions, error: sessionsError } = await supabase
      .rpc('get_user_chat_sessions', {
        user_uuid: userId
      })
    
    if (sessionsError) {
      console.error('获取聊天会话失败:', sessionsError)
    } else {
      console.log('获取聊天会话成功!')
      console.log('会话数量:', sessions?.length || 0)
    }
    
    console.log('\n测试完成!')
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
}

// 运行测试
testChatFunction()
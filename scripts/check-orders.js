// 查询订单表数据
const supabaseUrl = 'https://mynbrzmokeyrvwzqqbov.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bmJyem1va2V5cnZ3enFxYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDQ5ODcsImV4cCI6MjA3NjgyMDk4N30.kbhaLH5G0ppAUiDjyBBXPRxYlQRpDWH8BZETx0f4lJc'

async function checkOrders() {
  console.log('🔍 查询订单表数据...\n')
  
  try {
    // 查询所有订单
    const response = await fetch(`${supabaseUrl}/rest/v1/orders?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const orders = await response.json()
      
      console.log(`✅ 查询成功！当前订单表中有 ${orders.length} 个订单\n`)
      
      if (orders.length > 0) {
        console.log('📋 订单列表：')
        orders.forEach((order, index) => {
          console.log(`\n${index + 1}. 订单信息：`)
          console.log(`   订单号: ${order.order_number}`)
          console.log(`   标题: ${order.title}`)
          console.log(`   快递公司: ${order.express_company}`)
          console.log(`   取件位置: ${order.pickup_location}`)
          console.log(`   送达位置: ${order.delivery_location}`)
          console.log(`   联系电话: ${order.contact_phone}`)
          console.log(`   价格: ¥${order.price}`)
          console.log(`   状态: ${order.status}`)
          console.log(`   创建时间: ${order.created_at}`)
        })
      } else {
        console.log('❌ 订单表为空，没有发布的订单')
      }
      
    } else {
      console.log('❌ 查询失败:', response.status, response.statusText)
      const errorText = await response.text()
      console.log('错误详情:', errorText)
    }
    
  } catch (error) {
    console.log('❌ 查询过程中出错:', error.message)
  }
}

checkOrders()
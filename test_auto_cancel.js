// 测试超时自动取消订单功能
const { AutoCancelService } = await import('./src/services/autoCancelService.ts')

async function testAutoCancel() {
  console.log('=== 开始测试超时自动取消订单功能 ===\n')

  // 1. 获取系统设置
  console.log('1. 获取自动取消设置...')
  const settings = await AutoCancelService.getAutoCancelSettings()
  if (settings.success) {
    console.log(`✅ 获取成功: 自动取消时间设置为 ${settings.autoCancelMinutes} 分钟`)
  } else {
    console.log(`❌ 获取失败: ${settings.error}`)
  }
  console.log()

  // 2. 获取待自动取消的订单
  console.log('2. 检查待自动取消的订单...')
  const pendingOrders = await AutoCancelService.getPendingAutoCancelOrders()
  if (pendingOrders.success) {
    console.log(`✅ 检查完成: ${pendingOrders.message}`)
    if (pendingOrders.data && pendingOrders.data.length > 0) {
      console.log('待取消订单列表:')
      pendingOrders.data.forEach((order, index) => {
        const createdTime = new Date(order.created_at).toLocaleString('zh-CN')
        const now = new Date()
        const diffMinutes = Math.floor((now - new Date(order.created_at)) / (1000 * 60))
        console.log(`   ${index + 1}. ${order.title} - 创建于: ${createdTime} (${diffMinutes}分钟前)`)
      })
    }
  } else {
    console.log(`❌ 检查失败: ${pendingOrders.error}`)
  }
  console.log()

  // 3. 获取最近的自动取消记录
  console.log('3. 查看最近的自动取消记录...')
  const recentLogs = await AutoCancelService.getRecentAutoCancelLogs()
  if (recentLogs.success) {
    console.log(`✅ 获取成功: 找到 ${recentLogs.data?.length || 0} 条记录`)
    if (recentLogs.data && recentLogs.data.length > 0) {
      console.log('最近5条记录:')
      recentLogs.data.slice(0, 5).forEach((log, index) => {
        const time = new Date(log.created_at).toLocaleString('zh-CN')
        console.log(`   ${index + 1}. [${time}] ${log.action} - ${log.description}`)
      })
    }
  } else {
    console.log(`❌ 获取失败: ${recentLogs.error}`)
  }
  console.log()

  // 4. 手动执行自动取消
  console.log('4. 手动执行自动取消...')
  const result = await AutoCancelService.executeAutoCancel()
  if (result.success) {
    console.log(`✅ 执行成功: ${result.message}`)
    console.log(`   取消订单数量: ${result.cancelledCount}`)
  } else {
    console.log(`❌ 执行失败: ${result.message}`)
  }
  console.log()

  // 5. 再次检查系统日志确认结果
  console.log('5. 验证执行结果...')
  const updatedLogs = await AutoCancelService.getRecentAutoCancelLogs()
  if (updatedLogs.success && updatedLogs.data) {
    const newLogs = updatedLogs.data.filter(log => 
      !recentLogs.data?.some(oldLog => oldLog.id === log.id)
    )
    
    if (newLogs.length > 0) {
      console.log('✅ 发现新的自动取消记录:')
      newLogs.forEach(log => {
        const time = new Date(log.created_at).toLocaleString('zh-CN')
        console.log(`   [${time}] ${log.action} - ${log.description}`)
        if (log.metadata && log.metadata.cancelled_count) {
          console.log(`     取消数量: ${log.metadata.cancelled_count}`)
        }
      })
    } else {
      console.log('ℹ️  没有发现新的自动取消记录')
    }
  }

  console.log('\n=== 测试完成 ===')
}

// 运行测试
testAutoCancel().catch(error => {
  console.error('测试过程中发生错误:', error)
})
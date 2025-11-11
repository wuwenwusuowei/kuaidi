// 测试自动取消订单功能
// 在浏览器控制台中运行此代码

async function testAutoCancel() {
    try {
        console.log('开始测试自动取消功能...')
        
        // 确保 AutoCancelService 在全局作用域中可用
        if (typeof window.AutoCancelService === 'undefined') {
            console.error('AutoCancelService 未定义，请确保应用已正确加载')
            return
        }
        
        // 执行自动取消
        const result = await window.AutoCancelService.executeAutoCancel()
        console.log('自动取消执行结果:', result)
        
        // 查看待取消订单
        const pendingOrders = await window.AutoCancelService.getPendingAutoCancelOrders()
        console.log('待取消订单列表:', pendingOrders)
        
        console.log('测试完成！')
        
    } catch (error) {
        console.error('测试过程中出现错误:', error)
    }
}

// 简化测试函数
async function quickTest() {
    try {
        console.log('快速测试自动取消...')
        const result = await window.AutoCancelService.executeAutoCancel()
        console.log('✅ 自动取消功能正常:', result)
    } catch (error) {
        console.error('❌ 自动取消功能异常:', error)
    }
}

// 添加到全局作用域以便在控制台调用
window.testAutoCancel = testAutoCancel
window.quickTest = quickTest

console.log('测试函数已加载，输入以下命令进行测试:')
console.log('testAutoCancel() - 完整测试')
console.log('quickTest() - 快速测试')
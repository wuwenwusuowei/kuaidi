// 简单的自动取消功能测试脚本
// 在浏览器控制台中运行

console.log('🎯 自动取消功能测试开始...');

// 测试函数
async function testAutoCancel() {
    try {
        console.log('1️⃣ 检查 AutoCancelService 是否可用...');
        
        // 检查服务是否已加载
        if (typeof AutoCancelService === 'undefined') {
            console.error('❌ AutoCancelService 未定义，请刷新页面重试');
            return;
        }
        
        console.log('✅ AutoCancelService 可用');
        
        // 2. 查看待取消订单
        console.log('\n2️⃣ 查看待取消订单...');
        try {
            const pendingOrders = await AutoCancelService.getPendingAutoCancelOrders();
            console.log(`📋 找到 ${pendingOrders.length} 个待取消订单:`);
            pendingOrders.forEach((order, index) => {
                console.log(`   ${index + 1}. ${order.order_number} - ${order.description} (${order.status})`);
            });
        } catch (error) {
            console.log('⚠️ 获取待取消订单失败，可能没有符合条件的订单');
        }
        
        // 3. 执行自动取消
        console.log('\n3️⃣ 执行自动取消...');
        try {
            const result = await AutoCancelService.executeAutoCancel();
            console.log('✅ 自动取消执行结果:', result);
        } catch (error) {
            console.error('❌ 自动取消执行失败:', error.message || error);
        }
        
        console.log('\n🎉 测试完成！');
        
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    }
}

// 添加到全局作用域
window.testAutoCancel = testAutoCancel;

console.log('🚀 测试函数已加载，在控制台中输入: testAutoCancel()');
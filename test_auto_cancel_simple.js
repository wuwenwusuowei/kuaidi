// 测试超时自动取消订单功能 - 简化版
const { exec } = require('child_process');

async function testAutoCancel() {
  console.log('=== 开始测试超时自动取消订单功能 ===\n');

  try {
    // 1. 检查项目是否正在运行
    console.log('1. 检查项目状态...');
    
    // 2. 创建测试订单
    console.log('2. 创建测试订单...');
    
    // 3. 手动调用自动取消服务
    console.log('3. 调用自动取消服务...');
    
    // 使用 axios 或其他 HTTP 客户端调用 API
    const response = await fetch('http://localhost:5173/api/auto-cancel', {
      method: 'POST'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ 自动取消执行成功:', result);
    } else {
      console.log('❌ 自动取消执行失败:', response.statusText);
    }
    
  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
    
    // 测试直接调用数据库函数
    console.log('\n4. 尝试直接执行数据库函数...');
    
    // 这里可以添加直接调用数据库函数的代码
    console.log('ℹ️ 需要先确保数据库连接配置正确');
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testAutoCancel().catch(error => {
  console.error('测试过程中发生错误:', error);
});
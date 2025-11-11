// 数据库连接测试脚本
const { createClient } = require('@supabase/supabase-js');

// 配置信息
const supabaseUrl = 'https://mynbrzmokeyrvwzqqbov.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15bmJyem1va2V5cnZ3enFxYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNDQ5ODcsImV4cCI6MjA3NjgyMDk4N30.kbhaLH5G0ppAUiDjyBBXPRxYlQRpDWH8BZETx0f4lJc';

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit'
  },
  global: {
    headers: {
      'X-Client-Info': 'connection-test'
    }
  }
});

async function testConnection() {
  console.log('开始测试数据库连接...');
  
  try {
    // 测试连接超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('连接超时（10秒）')), 10000);
    });
    
    const queryPromise = supabase.from('users').select('count').limit(1);
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    
    if (result.error) {
      console.error('❌ 数据库查询失败:', result.error.message);
      return false;
    }
    
    console.log('✅ 数据库连接成功');
    console.log('📊 用户数量:', result.data?.[0]?.count || '未知');
    return true;
    
  } catch (error) {
    console.error('❌ 数据库连接异常:', error.message);
    
    // 检查网络连接
    console.log('🔍 检查网络连接...');
    try {
      const networkTest = await fetch('https://mynbrzmokeyrvwzqqbov.supabase.co', { 
        method: 'HEAD',
        timeout: 5000 
      });
      console.log('✅ 网络连接正常');
    } catch (networkError) {
      console.error('❌ 网络连接异常:', networkError.message);
    }
    
    return false;
  }
}

// 运行测试
async function runTests() {
  console.log('=== 数据库连接测试 ===\n');
  
  // 测试1：基本连接
  console.log('测试1: 基本连接测试');
  await testConnection();
  
  console.log('\n测试2: 重试机制测试（3次重试）');
  for (let i = 1; i <= 3; i++) {
    console.log(`\n重试 ${i}/3:`);
    const success = await testConnection();
    if (success) break;
    
    if (i < 3) {
      console.log('等待2秒后重试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

// 执行测试
runTests().catch(console.error);
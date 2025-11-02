/**
 * 测试生产环境的环境变量配置
 */

async function testProductionEnvironment() {
  console.log('🔍 测试生产环境配置...\n');
  
  // 1. 测试基本的API响应
  console.log('1. 测试基本API响应...');
  try {
    const response = await fetch('https://deeptalk-seven.vercel.app/api/chat/message', {
      method: 'OPTIONS'
    });
    console.log(`✅ API端点可访问 (状态码: ${response.status})`);
  } catch (error) {
    console.log('❌ API端点不可访问:', error.message);
    return;
  }
  
  // 2. 测试环境变量配置（通过错误信息推断）
  console.log('\n2. 测试环境变量配置...');
  
  // 测试JWT_SECRET
  try {
    const response = await fetch('https://deeptalk-seven.vercel.app/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid'
      },
      body: JSON.stringify({ message: 'test' })
    });
    
    const result = await response.json();
    
    if (result.message && result.message.includes('jwt malformed')) {
      console.log('✅ JWT_SECRET 已配置（JWT验证正常工作）');
    } else if (result.message && result.message.includes('JWT_SECRET')) {
      console.log('❌ JWT_SECRET 未配置');
    } else {
      console.log('⚠️  JWT配置状态未知:', result.message);
    }
  } catch (error) {
    console.log('❌ JWT测试失败:', error.message);
  }
  
  console.log('\n📋 诊断完成');
}

testProductionEnvironment().catch(console.error);
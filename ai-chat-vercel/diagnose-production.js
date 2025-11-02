/**
 * 生产环境诊断脚本
 * 用于检查Vercel部署的环境变量配置
 */

// 测试环境变量配置的API端点
async function testEnvironmentConfig() {
  try {
    const response = await fetch('https://deeptalk-seven.vercel.app/api/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'test'
      })
    });
    
    const result = await response.json();
    console.log('Auth API Response:', result);
    
    // 检查是否返回了环境变量相关的错误
    if (result.message && result.message.includes('JWT_SECRET')) {
      console.log('❌ JWT_SECRET 环境变量未配置');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('测试环境配置失败:', error);
    return false;
  }
}

// 测试GLM API配置
async function testGLMConfig() {
  try {
    // 发送一个简单的消息测试GLM配置
    const response = await fetch('https://deeptalk-seven.vercel.app/api/chat/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({
        message: 'test'
      })
    });
    
    const result = await response.json();
    console.log('Chat API Response:', result);
    
    // 检查错误信息
    if (result.message && result.message.includes('GLM_API_KEY')) {
      console.log('❌ GLM_API_KEY 环境变量未配置');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('测试GLM配置失败:', error);
    return false;
  }
}

// 主诊断函数
async function diagnoseProduction() {
  console.log('🔍 开始诊断生产环境配置...\n');
  
  console.log('1. 测试认证配置...');
  const authOk = await testEnvironmentConfig();
  
  console.log('\n2. 测试GLM API配置...');
  const glmOk = await testGLMConfig();
  
  console.log('\n📋 诊断结果:');
  console.log(`认证配置: ${authOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`GLM配置: ${glmOk ? '✅ 正常' : '❌ 异常'}`);
  
  if (!authOk || !glmOk) {
    console.log('\n🔧 修复建议:');
    console.log('请在Vercel项目设置中配置以下环境变量:');
    
    if (!authOk) {
      console.log('- JWT_SECRET: 用于JWT token签名的密钥');
      console.log('- GITHUB_CLIENT_ID: GitHub OAuth应用ID');
      console.log('- GITHUB_CLIENT_SECRET: GitHub OAuth应用密钥');
    }
    
    if (!glmOk) {
      console.log('- GLM_API_KEY: GLM-4.6 API密钥');
      console.log('- KV_REST_API_URL: Vercel KV数据库URL');
      console.log('- KV_REST_API_TOKEN: Vercel KV数据库Token');
    }
  }
}

// 运行诊断
diagnoseProduction().catch(console.error);
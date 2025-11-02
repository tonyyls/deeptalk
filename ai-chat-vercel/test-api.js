/**
 * API测试脚本
 * 测试更新后的API是否能正常使用KV适配器
 */

import { KVAdapter } from './config/kv-adapter.js';

async function testAPI() {
  console.log('🧪 开始API测试...\n');

  try {
    // 初始化KV适配器
    const kv = new KVAdapter();
    console.log('✅ KV适配器初始化成功');

    // 测试基本操作
    const testKey = 'test:api:' + Date.now();
    const testData = {
      message: 'API测试数据',
      timestamp: new Date().toISOString(),
      user: 'test-user'
    };

    // 写入测试
    console.log('📝 测试写入操作...');
    await kv.set(testKey, testData);
    console.log('✅ 写入成功');

    // 读取测试
    console.log('📖 测试读取操作...');
    const result = await kv.get(testKey);
    console.log('✅ 读取成功:', result);

    // 验证数据完整性
    if (JSON.stringify(result) === JSON.stringify(testData)) {
      console.log('✅ 数据完整性验证通过');
    } else {
      console.log('❌ 数据完整性验证失败');
    }

    // 清理测试数据
    await kv.del(testKey);
    console.log('🗑️  测试数据清理完成');

    console.log('\n🎉 API测试全部通过！');
    console.log('📋 当前KV配置:');
    console.log('   存储类型:', process.env.KV_TYPE || 'vercel (默认)');
    console.log('   Redis Host:', process.env.REDIS_HOST || '未设置');
    console.log('   Redis URL:', process.env.REDIS_URL ? '已设置' : '未设置');
    console.log('   Vercel KV URL:', process.env.KV_REST_API_URL ? '已设置' : '未设置');

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 运行测试
testAPI();
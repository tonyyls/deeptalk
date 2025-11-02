/**
 * 测试KV适配器的列表操作修复
 */

import kv from './config/kv-adapter.js';

async function testKVListOperations() {
  console.log('🔍 测试KV适配器的列表操作...\n');
  
  try {
    // 设置环境变量为vercel模式
    process.env.KV_TYPE = 'vercel';
    
    const testKey = 'test_list_' + Date.now();
    
    console.log('1. 测试 lpush 操作...');
    const length1 = await kv.lpush(testKey, 'item1');
    console.log(`✅ lpush 成功，列表长度: ${length1}`);
    
    const length2 = await kv.lpush(testKey, 'item2');
    console.log(`✅ lpush 成功，列表长度: ${length2}`);
    
    console.log('\n2. 测试 lrange 操作...');
    const items = await kv.lrange(testKey, 0, -1);
    console.log(`✅ lrange 成功，获取到 ${items.length} 个元素:`, items);
    
    console.log('\n3. 测试 llen 操作...');
    const length = await kv.llen(testKey);
    console.log(`✅ llen 成功，列表长度: ${length}`);
    
    console.log('\n4. 清理测试数据...');
    await kv.del(testKey);
    console.log('✅ 测试数据已清理');
    
    console.log('\n🎉 所有列表操作测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testKVListOperations();
/**
 * Redis连接测试脚本
 * 用于验证Redis配置是否正确
 */

import kvAdapter from './config/kv-adapter.js';
import { validateRedisConfig, detectRedisPreset, getAvailablePresets } from './config/redis-config.js';

/**
 * 测试Redis连接和基本操作
 */
async function testRedisConnection() {
  console.log('🔍 开始Redis连接测试...\n');

  try {
    // 1. 检测配置
    console.log('📋 检测Redis配置...');
    const kvType = process.env.KV_TYPE || 'vercel';
    console.log(`   存储类型: ${kvType}`);

    if (kvType === 'redis') {
      const preset = process.env.REDIS_PRESET || detectRedisPreset();
      console.log(`   Redis预设: ${preset}`);
      
      const validation = validateRedisConfig(preset);
      if (validation.valid) {
        console.log(`   ✅ 配置验证通过: ${validation.name}`);
        console.log(`   📝 描述: ${validation.description}`);
      } else {
        console.log(`   ❌ 配置验证失败: ${validation.error}`);
        console.log(`   📋 需要的环境变量: ${validation.requiredVars.join(', ')}`);
        return;
      }
    }

    // 2. 测试基本操作
    console.log('\n🧪 测试基本KV操作...');
    
    const testKey = 'test:redis:connection';
    const testValue = {
      timestamp: new Date().toISOString(),
      message: 'Redis连接测试成功！',
      data: {
        number: 42,
        boolean: true,
        array: [1, 2, 3]
      }
    };

    // 写入测试
    console.log('   📝 测试写入操作...');
    await kvAdapter.set(testKey, testValue);
    console.log('   ✅ 写入成功');

    // 读取测试
    console.log('   📖 测试读取操作...');
    const retrievedValue = await kvAdapter.get(testKey);
    console.log('   ✅ 读取成功');
    console.log('   📄 读取的数据:', JSON.stringify(retrievedValue, null, 2));

    // 验证数据完整性
    if (JSON.stringify(testValue) === JSON.stringify(retrievedValue)) {
      console.log('   ✅ 数据完整性验证通过');
    } else {
      console.log('   ❌ 数据完整性验证失败');
    }

    // 存在性测试
    console.log('   🔍 测试键存在性检查...');
    const exists = await kvAdapter.exists(testKey);
    console.log(`   ✅ 键存在性检查: ${exists ? '存在' : '不存在'}`);

    // 删除测试
    console.log('   🗑️  测试删除操作...');
    await kvAdapter.del(testKey);
    console.log('   ✅ 删除成功');

    // 验证删除
    const existsAfterDelete = await kvAdapter.exists(testKey);
    console.log(`   ✅ 删除验证: ${existsAfterDelete ? '仍存在' : '已删除'}`);

    // 3. 测试过期功能
    console.log('\n⏰ 测试过期功能...');
    const expireKey = 'test:redis:expire';
    await kvAdapter.set(expireKey, { message: '这条数据会过期' });
    await kvAdapter.expire(expireKey, 2); // 2秒后过期
    console.log('   ✅ 设置过期时间: 2秒');
    
    console.log('   ⏳ 等待3秒...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const expiredExists = await kvAdapter.exists(expireKey);
    console.log(`   ✅ 过期验证: ${expiredExists ? '未过期' : '已过期'}`);

    // 4. 测试哈希表操作（如果支持）
    if (kvType === 'redis') {
      console.log('\n🗂️  测试哈希表操作...');
      const hashKey = 'test:redis:hash';
      
      await kvAdapter.hset(hashKey, 'field1', { value: 'test1' });
      await kvAdapter.hset(hashKey, 'field2', { value: 'test2' });
      console.log('   ✅ 哈希表写入成功');
      
      const field1Value = await kvAdapter.hget(hashKey, 'field1');
      console.log('   ✅ 哈希表读取成功:', field1Value);
      
      const allFields = await kvAdapter.hgetall(hashKey);
      console.log('   ✅ 获取所有字段:', allFields);
      
      // 清理哈希表
      await kvAdapter.del(hashKey);
    }

    console.log('\n🎉 所有测试通过！Redis连接正常工作。');

  } catch (error) {
    console.error('\n❌ Redis测试失败:', error);
    console.error('   错误详情:', error.message);
    
    // 提供故障排除建议
    console.log('\n🔧 故障排除建议:');
    console.log('   1. 检查环境变量配置');
    console.log('   2. 验证Redis服务是否运行');
    console.log('   3. 确认网络连接');
    console.log('   4. 检查认证信息');
  } finally {
    // 关闭连接
    await kvAdapter.close();
    console.log('\n🔌 Redis连接已关闭');
  }
}

/**
 * 显示配置信息
 */
function showConfigInfo() {
  console.log('📋 当前配置信息:');
  console.log('================');
  
  const kvType = process.env.KV_TYPE || 'vercel';
  console.log(`存储类型: ${kvType}`);
  
  if (kvType === 'redis') {
    console.log(`Redis URL: ${process.env.REDIS_URL ? '已设置' : '未设置'}`);
    console.log(`Redis Host: ${process.env.REDIS_HOST || '未设置'}`);
    console.log(`Redis Port: ${process.env.REDIS_PORT || '未设置'}`);
    console.log(`Redis Password: ${process.env.REDIS_PASSWORD ? '已设置' : '未设置'}`);
    console.log(`Redis Username: ${process.env.REDIS_USERNAME || '未设置'}`);
    console.log(`Redis Preset: ${process.env.REDIS_PRESET || '自动检测'}`);
  } else {
    console.log(`KV REST API URL: ${process.env.KV_REST_API_URL ? '已设置' : '未设置'}`);
    console.log(`KV REST API Token: ${process.env.KV_REST_API_TOKEN ? '已设置' : '未设置'}`);
  }
  
  console.log('================\n');
}

/**
 * 显示可用的Redis预设
 */
function showAvailablePresets() {
  console.log('🎛️  可用的Redis预设:');
  console.log('==================');
  
  const presets = getAvailablePresets();
  presets.forEach(preset => {
    console.log(`\n${preset.name} (${preset.key}):`);
    console.log(`  描述: ${preset.description}`);
    console.log(`  需要的环境变量: ${preset.requiredVars.join(', ')}`);
    console.log(`  配置示例:`);
    Object.entries(preset.example).forEach(([key, value]) => {
      console.log(`    ${key}=${value}`);
    });
  });
  
  console.log('==================\n');
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Redis测试脚本');
    console.log('用法: node test-redis.js [选项]');
    console.log('');
    console.log('选项:');
    console.log('  --config, -c     显示当前配置信息');
    console.log('  --presets, -p    显示可用的Redis预设');
    console.log('  --help, -h       显示帮助信息');
    console.log('');
    console.log('示例:');
    console.log('  node test-redis.js           # 运行连接测试');
    console.log('  node test-redis.js --config  # 显示配置信息');
    console.log('  node test-redis.js --presets # 显示Redis预设');
    return;
  }
  
  if (args.includes('--config') || args.includes('-c')) {
    showConfigInfo();
    return;
  }
  
  if (args.includes('--presets') || args.includes('-p')) {
    showAvailablePresets();
    return;
  }
  
  // 默认运行测试
  showConfigInfo();
  await testRedisConnection();
}

// 运行主函数
main().catch(console.error);
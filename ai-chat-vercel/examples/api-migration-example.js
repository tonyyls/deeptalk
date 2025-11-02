/**
 * API迁移示例：从@vercel/kv迁移到Redis适配器
 * 
 * 这个文件展示了如何将现有的API从直接使用@vercel/kv
 * 迁移到使用Redis适配器，实现KV存储的灵活切换
 */

// ========== 迁移前（使用@vercel/kv）==========
// import { kv } from '@vercel/kv';

// export default async function handler(req, res) {
//   // 直接使用@vercel/kv
//   const conversations = await kv.get(`user:${userId}:conversations`);
//   await kv.set(`user:${userId}:conversations`, data);
//   await kv.del(`conversation:${conversationId}`);
// }

// ========== 迁移后（使用Redis适配器）==========
import { KVAdapter } from '../config/kv-adapter.js';

// 初始化KV适配器（支持自动切换）
const kvAdapter = new KVAdapter();

/**
 * 示例API处理函数
 * 展示如何使用Redis适配器替代@vercel/kv
 */
export default async function handler(req, res) {
  try {
    const userId = 'user123';
    const conversationId = 'conv456';

    // ========== 基本KV操作 ==========
    
    // 1. 获取数据（替代 kv.get）
    const conversations = await kvAdapter.get(`user:${userId}:conversations`);
    console.log('获取对话列表:', conversations);

    // 2. 存储数据（替代 kv.set）
    const newConversation = {
      id: conversationId,
      title: '新对话',
      messages: [],
      createdAt: new Date().toISOString()
    };
    await kvAdapter.set(`conversation:${conversationId}`, newConversation);
    console.log('保存对话成功');

    // 3. 设置过期时间（替代 kv.setex）
    await kvAdapter.setex(`temp:${conversationId}`, 3600, { temp: true });
    console.log('设置临时数据，1小时后过期');

    // 4. 删除数据（替代 kv.del）
    await kvAdapter.del(`temp:${conversationId}`);
    console.log('删除临时数据');

    // 5. 检查键是否存在（替代 kv.exists）
    const exists = await kvAdapter.exists(`conversation:${conversationId}`);
    console.log('对话是否存在:', exists);

    // ========== 哈希表操作 ==========
    
    // 6. 哈希表操作（用于用户设置等）
    const userKey = `user:${userId}:profile`;
    
    // 设置哈希字段
    await kvAdapter.hset(userKey, 'name', 'John Doe');
    await kvAdapter.hset(userKey, 'email', 'john@example.com');
    
    // 获取哈希字段
    const userName = await kvAdapter.hget(userKey, 'name');
    console.log('用户名:', userName);
    
    // 获取所有哈希字段
    const userProfile = await kvAdapter.hgetall(userKey);
    console.log('用户资料:', userProfile);

    // ========== 批量操作 ==========
    
    // 7. 批量获取（如果适配器支持）
    const keys = [`conversation:${conversationId}`, userKey];
    const results = await Promise.all(keys.map(key => kvAdapter.get(key)));
    console.log('批量获取结果:', results);

    res.status(200).json({
      success: true,
      message: 'Redis适配器测试成功',
      data: {
        conversations,
        userProfile,
        exists
      }
    });

  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

// ========== 迁移指南 ==========
/**
 * 迁移步骤：
 * 
 * 1. 替换导入语句：
 *    从: import { kv } from '@vercel/kv';
 *    到: import { KVAdapter } from '../config/kv-adapter.js';
 * 
 * 2. 初始化适配器：
 *    const kvAdapter = new KVAdapter();
 * 
 * 3. 替换方法调用：
 *    kv.get(key) → kvAdapter.get(key)
 *    kv.set(key, value) → kvAdapter.set(key, value)
 *    kv.del(key) → kvAdapter.del(key)
 *    kv.exists(key) → kvAdapter.exists(key)
 * 
 * 4. 配置环境变量：
 *    - 使用Vercel KV: KV_TYPE=vercel
 *    - 使用Redis: KV_TYPE=redis + Redis连接参数
 * 
 * 5. 测试兼容性：
 *    运行现有测试确保功能正常
 */

// ========== 性能优化建议 ==========
/**
 * 1. 连接池：Redis适配器自动管理连接池
 * 2. 批量操作：使用Promise.all进行并发操作
 * 3. 缓存策略：合理设置过期时间
 * 4. 错误处理：添加重试机制和降级策略
 * 5. 监控：添加性能监控和日志记录
 */
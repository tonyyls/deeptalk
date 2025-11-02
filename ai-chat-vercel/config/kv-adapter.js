/**
 * KV数据库适配器
 * 支持@vercel/kv和Redis之间的无缝切换
 */

import { createClient } from 'redis';

/**
 * KV适配器类
 * 提供统一的KV操作接口，支持多种后端存储
 */
class KVAdapter {
  constructor() {
    this.client = null;
    this.type = process.env.KV_TYPE || 'vercel'; // 'vercel' | 'redis' | 'memory'
    this.initialized = false;
    // 内存存储
    this.memoryStore = new Map();
  }

  /**
   * 初始化KV客户端
   */
  async init() {
    if (this.initialized) return;

    try {
      if (this.type === 'redis') {
        await this.initRedisClient();
      } else if (this.type === 'memory') {
        await this.initMemoryStore();
      } else {
        await this.initVercelKV();
      }
      this.initialized = true;
      console.log(`KV Adapter initialized with type: ${this.type}`);
    } catch (error) {
      console.error('Failed to initialize KV adapter:', error);
      throw error;
    }
  }

  /**
   * 初始化内存存储
   */
  async initMemoryStore() {
    console.log('Using in-memory storage for development');
    // 内存存储不需要特殊初始化
  }

  /**
   * 初始化Redis客户端
   */
  async initRedisClient() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379');
    const redisPassword = process.env.REDIS_PASSWORD;
    const redisUsername = process.env.REDIS_USERNAME;

    let clientConfig;

    if (redisUrl) {
      // 使用完整的Redis URL（支持Upstash、Redis Cloud等）
      clientConfig = { url: redisUrl };
    } else {
      // 使用分离的配置参数
      clientConfig = {
        socket: {
          host: redisHost,
          port: redisPort,
        }
      };

      if (redisPassword) {
        clientConfig.password = redisPassword;
      }

      if (redisUsername) {
        clientConfig.username = redisUsername;
      }
    }

    this.client = createClient(clientConfig);

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await this.client.connect();
  }

  /**
   * 初始化Vercel KV客户端
   */
  async initVercelKV() {
    const { kv } = await import('@vercel/kv');
    this.client = kv;
  }

  /**
   * 获取值
   * @param {string} key - 键名
   * @returns {Promise<any>} 值
   */
  async get(key) {
    await this.init();

    if (this.type === 'memory') {
      return this.memoryStore.get(key) || null;
    } else if (this.type === 'redis') {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } else {
      return await this.client.get(key);
    }
  }

  /**
   * 设置值
   * @param {string} key - 键名
   * @param {any} value - 值
   * @param {object} options - 选项（如过期时间）
   * @returns {Promise<string>} 操作结果
   */
  async set(key, value, options = {}) {
    await this.init();

    if (this.type === 'memory') {
      this.memoryStore.set(key, value);
      // 内存存储暂不支持过期时间
      return 'OK';
    } else if (this.type === 'redis') {
      const serializedValue = JSON.stringify(value);
      if (options.ex) {
        return await this.client.setEx(key, options.ex, serializedValue);
      } else {
        return await this.client.set(key, serializedValue);
      }
    } else {
      return await this.client.set(key, value, options);
    }
  }

  /**
   * 删除键
   * @param {string} key - 键名
   * @returns {Promise<number>} 删除的键数量
   */
  async del(key) {
    await this.init();

    if (this.type === 'memory') {
      const existed = this.memoryStore.has(key);
      this.memoryStore.delete(key);
      return existed ? 1 : 0;
    } else if (this.type === 'redis') {
      return await this.client.del(key);
    } else {
      return await this.client.del(key);
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 键名
   * @returns {Promise<boolean>} 是否存在
   */
  async exists(key) {
    await this.init();

    if (this.type === 'memory') {
      return this.memoryStore.has(key);
    } else if (this.type === 'redis') {
      const result = await this.client.exists(key);
      return result === 1;
    } else {
      const value = await this.client.get(key);
      return value !== null;
    }
  }

  /**
   * 设置过期时间
   * @param {string} key - 键名
   * @param {number} seconds - 过期时间（秒）
   * @returns {Promise<boolean>} 是否成功
   */
  async expire(key, seconds) {
    await this.init();

    if (this.type === 'redis') {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } else {
      // Vercel KV 不直接支持expire，需要重新设置值
      const value = await this.client.get(key);
      if (value !== null) {
        return await this.client.set(key, value, { ex: seconds });
      }
      return false;
    }
  }

  /**
   * 获取匹配模式的所有键
   * @param {string} pattern - 匹配模式
   * @returns {Promise<string[]>} 键列表
   */
  async keys(pattern) {
    await this.init();

    if (this.type === 'memory') {
      const allKeys = Array.from(this.memoryStore.keys());
      if (pattern === '*') {
        return allKeys;
      }
      // 简单的模式匹配
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return allKeys.filter(key => regex.test(key));
    } else if (this.type === 'redis') {
      return await this.client.keys(pattern);
    } else {
      // Vercel KV 不支持keys操作，这是一个限制
      console.warn('Vercel KV does not support keys() operation');
      return [];
    }
  }

  /**
   * 哈希表操作 - 设置字段
   * @param {string} key - 哈希表键名
   * @param {string} field - 字段名
   * @param {any} value - 值
   * @returns {Promise<number>} 操作结果
   */
  async hset(key, field, value) {
    await this.init();

    if (this.type === 'redis') {
      return await this.client.hSet(key, field, JSON.stringify(value));
    } else {
      // 在Vercel KV中模拟哈希表操作
      const hashKey = `${key}:${field}`;
      return await this.client.set(hashKey, value);
    }
  }

  /**
   * 哈希表操作 - 获取字段
   * @param {string} key - 哈希表键名
   * @param {string} field - 字段名
   * @returns {Promise<any>} 字段值
   */
  async hget(key, field) {
    await this.init();

    if (this.type === 'redis') {
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } else {
      // 在Vercel KV中模拟哈希表操作
      const hashKey = `${key}:${field}`;
      return await this.client.get(hashKey);
    }
  }

  /**
   * 哈希表操作 - 获取所有字段
   * @param {string} key - 哈希表键名
   * @returns {Promise<object>} 所有字段和值
   */
  async hgetall(key) {
    await this.init();

    if (this.type === 'redis') {
      const result = await this.client.hGetAll(key);
      const parsed = {};
      for (const [field, value] of Object.entries(result)) {
        parsed[field] = JSON.parse(value);
      }
      return parsed;
    } else {
      // Vercel KV 不支持hgetall，这是一个限制
      console.warn('Vercel KV does not support hgetall() operation');
      return {};
    }
  }

  /**
   * 列表操作：向列表左侧推入元素
   * @param {string} key - 列表键名
   * @param {any} value - 要推入的值
   * @returns {Promise<number>} 列表长度
   */
  async lpush(key, value) {
    await this.init();

    if (this.type === 'redis') {
      return await this.client.lPush(key, JSON.stringify(value));
    } else {
      // Vercel KV不支持列表，使用数组模拟
      const list = await this.get(key) || [];
      list.unshift(value);
      await this.set(key, list);
      return list.length;
    }
  }

  /**
   * 列表操作：获取列表范围内的元素
   * @param {string} key - 列表键名
   * @param {number} start - 起始索引
   * @param {number} stop - 结束索引
   * @returns {Promise<Array>} 元素数组
   */
  async lrange(key, start, stop) {
    await this.init();

    if (this.type === 'redis') {
      const result = await this.client.lRange(key, start, stop);
      return result.map(item => {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      });
    } else {
      // Vercel KV不支持列表，使用数组模拟
      const list = await this.get(key) || [];
      if (start < 0) start = Math.max(0, list.length + start);
      if (stop < 0) stop = list.length + stop;
      return list.slice(start, stop + 1);
    }
  }

  /**
   * 列表操作：向列表右侧推入元素
   * @param {string} key - 列表键名
   * @param {any} value - 要推入的值
   * @returns {Promise<number>} 列表长度
   */
  async rpush(key, value) {
    await this.init();

    if (this.type === 'redis') {
      return await this.client.rPush(key, JSON.stringify(value));
    } else {
      // Vercel KV不支持列表，使用数组模拟
      const list = await this.get(key) || [];
      list.push(value);
      await this.set(key, list);
      return list.length;
    }
  }

  /**
   * 列表操作：获取列表长度
   * @param {string} key - 列表键名
   * @returns {Promise<number>} 列表长度
   */
  async llen(key) {
    await this.init();

    if (this.type === 'redis') {
      return await this.client.lLen(key);
    } else {
      // Vercel KV不支持列表，使用数组模拟
      const list = await this.get(key) || [];
      return list.length;
    }
  }

  /**
   * 关闭连接
   */
  async close() {
    if (this.type === 'redis' && this.client) {
      await this.client.quit();
    }
    this.initialized = false;
  }
}

// 创建全局实例
const kvAdapter = new KVAdapter();

export default kvAdapter;
# Redis配置指南

## 🎯 概述

DeepTalk支持多种KV存储方案，你可以选择：
- **Vercel KV**（默认）：基于Upstash Redis的托管服务
- **Redis**：使用任何Redis服务提供商或自建Redis

## 🚀 快速切换到Redis

### 1. 设置存储类型

在环境变量中设置：
```bash
KV_TYPE=redis
```

### 2. 选择Redis服务提供商

我们支持以下Redis服务：

#### 🌟 Upstash Redis（推荐）
**优势**：无服务器、边缘优化、与Vercel完美集成

```bash
KV_TYPE=redis
REDIS_URL=redis://default:your-password@your-endpoint.upstash.io:6379
REDIS_PRESET=upstash
```

**获取方式**：
1. 访问 [Upstash Console](https://console.upstash.com/)
2. 创建Redis数据库
3. 复制Redis URL

#### ☁️ Redis Cloud
**优势**：Redis官方托管服务，功能完整

```bash
KV_TYPE=redis
REDIS_HOST=redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=your-password
REDIS_TLS=true
REDIS_PRESET=redisCloud
```

**获取方式**：
1. 访问 [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. 创建数据库实例
3. 获取连接信息

#### 🚄 Railway Redis
**优势**：简单部署，开发友好

```bash
KV_TYPE=redis
REDIS_URL=redis://default:password@redis.railway.internal:6379
REDIS_PRESET=railway
```

#### 🎨 Render Redis
**优势**：免费额度，易于使用

```bash
KV_TYPE=redis
REDIS_URL=redis://red-xxxxxxxxxxxxx:6379
REDIS_PRESET=render
```

#### ☁️ AWS ElastiCache
**优势**：AWS生态集成，高性能

```bash
KV_TYPE=redis
REDIS_HOST=your-cluster.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PRESET=elasticache
```

#### 🇨🇳 阿里云Redis
**优势**：国内访问速度快

```bash
KV_TYPE=redis
REDIS_HOST=r-bp1xxxxxxxxxxxxx.redis.rds.aliyuncs.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_PRESET=aliyun
```

#### 🇨🇳 腾讯云Redis
**优势**：国内服务，稳定可靠

```bash
KV_TYPE=redis
REDIS_HOST=crs-xxxxxxxxx.tencentcdb.com
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_PRESET=tencent
```

#### 🏠 自建Redis服务器
**优势**：完全控制，成本可控

```bash
KV_TYPE=redis
REDIS_HOST=your-server.com
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your-password
REDIS_PRESET=selfHosted
```

## 📋 在Vercel中配置Redis

### 方法1：通过Vercel Dashboard

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

**基础配置**：
```
KV_TYPE = redis
```

**选择配置方式**：

**方式A：使用Redis URL（推荐）**
```
REDIS_URL = redis://default:password@your-host:6379
REDIS_PRESET = upstash
```

**方式B：使用分离参数**
```
REDIS_HOST = your-host
REDIS_PORT = 6379
REDIS_PASSWORD = your-password
REDIS_PRESET = redisCloud
```

### 方法2：通过Vercel CLI

```bash
# 设置存储类型
vercel env add KV_TYPE

# 设置Redis URL
vercel env add REDIS_URL

# 设置预设类型
vercel env add REDIS_PRESET

# 重新部署
vercel --prod
```

## 🔧 本地开发配置

### 1. 创建.env文件

```bash
cp .env.example .env
```

### 2. 编辑.env文件

```bash
# 切换到Redis
KV_TYPE=redis

# 配置Redis连接（选择一种方式）
REDIS_URL=redis://localhost:6379
# 或者
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. 启动本地Redis（可选）

如果你想在本地测试Redis：

```bash
# 使用Docker
docker run -d -p 6379:6379 redis:alpine

# 或使用Homebrew (macOS)
brew install redis
brew services start redis
```

## 🧪 测试Redis连接

创建测试脚本来验证Redis连接：

```javascript
// test-redis.js
import kvAdapter from './config/kv-adapter.js';

async function testRedis() {
  try {
    // 测试写入
    await kvAdapter.set('test:key', { message: 'Hello Redis!' });
    console.log('✅ Redis写入成功');

    // 测试读取
    const value = await kvAdapter.get('test:key');
    console.log('✅ Redis读取成功:', value);

    // 测试删除
    await kvAdapter.del('test:key');
    console.log('✅ Redis删除成功');

    console.log('🎉 Redis连接测试通过！');
  } catch (error) {
    console.error('❌ Redis连接测试失败:', error);
  } finally {
    await kvAdapter.close();
  }
}

testRedis();
```

运行测试：
```bash
node test-redis.js
```

## 📊 性能对比

| 服务商 | 延迟 | 可用性 | 价格 | 推荐场景 |
|--------|------|--------|------|----------|
| Vercel KV | 极低 | 99.9% | 免费额度 | Vercel项目 |
| Upstash | 极低 | 99.9% | 按请求付费 | 无服务器应用 |
| Redis Cloud | 低 | 99.99% | 按内存付费 | 企业应用 |
| Railway | 中 | 99.9% | 固定价格 | 个人项目 |
| 自建 | 可变 | 自控 | 服务器成本 | 完全控制 |

## ❌ 常见问题

### 错误：Redis connection failed

**原因**：Redis连接配置错误
**解决**：
1. 检查`REDIS_URL`或`REDIS_HOST`是否正确
2. 验证密码和端口
3. 确认网络连接

### 错误：Missing Redis environment variables

**原因**：缺少必需的环境变量
**解决**：
1. 检查`.env`文件配置
2. 确认Vercel环境变量设置
3. 参考上面的配置示例

### 错误：Redis authentication failed

**原因**：认证信息错误
**解决**：
1. 检查`REDIS_PASSWORD`
2. 验证`REDIS_USERNAME`（Redis 6.0+）
3. 确认ACL权限设置

## 🔄 从Vercel KV迁移到Redis

### 1. 数据导出（可选）

如果需要迁移现有数据，可以创建迁移脚本：

```javascript
// migrate-data.js
import { kv } from '@vercel/kv';
import kvAdapter from './config/kv-adapter.js';

async function migrateData() {
  // 注意：这需要根据你的具体数据结构调整
  console.log('开始数据迁移...');
  
  // 这里添加你的迁移逻辑
  // 由于Vercel KV不支持keys()操作，你需要知道具体的键名
  
  console.log('数据迁移完成！');
}

migrateData();
```

### 2. 切换配置

```bash
# 更新环境变量
KV_TYPE=redis
REDIS_URL=your-redis-url
```

### 3. 重新部署

```bash
vercel --prod
```

## 🔐 安全建议

1. **使用TLS连接**：生产环境务必启用TLS
2. **强密码**：使用复杂的Redis密码
3. **网络隔离**：限制Redis访问来源
4. **定期备份**：设置自动备份策略
5. **监控告警**：配置性能和可用性监控

## 📞 获取帮助

如果遇到配置问题：

1. 检查Redis服务商的文档
2. 查看Vercel的Functions日志
3. 运行本地测试脚本
4. 提交GitHub Issue获取支持

---

**提示**：Redis配置更新后会立即生效，无需重新构建应用！
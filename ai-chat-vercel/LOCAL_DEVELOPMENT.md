# 本地开发环境配置

本文档说明如何在本地环境中运行和调试 AI Chat 应用，无需 GitHub 登录即可测试聊天功能。

## 快速开始

### 1. 环境配置

项目已包含 `.env.local` 文件，其中配置了本地开发所需的环境变量：

```bash
# 开发模式标识
NODE_ENV=development
SKIP_AUTH=true

# 模拟 GitHub OAuth2 配置
GITHUB_CLIENT_ID=mock_client_id
GITHUB_CLIENT_SECRET=mock_client_secret

# JWT 密钥（本地开发用）
JWT_SECRET=your-local-jwt-secret-key-for-development-only

# GLM-4.6 API 配置（需要真实的 API Key）
GLM_API_KEY=your-glm-api-key-here
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions

# KV 存储配置（使用内存存储）
KV_TYPE=memory

# 应用配置
APP_NAME=AI Chat (本地开发)
APP_URL=http://localhost:5173
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 GLM API Key

**重要：** 要测试聊天功能，您需要配置真实的 GLM-4.6 API Key：

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册账号并获取 API Key
3. 在 `.env.local` 文件中替换 `GLM_API_KEY` 的值

### 4. 启动本地开发服务器

```bash
# 使用本地开发模式启动（跳过 GitHub 认证）
npm run dev:local

# 或者使用普通开发模式（需要 GitHub 认证）
npm run dev
```

### 5. 访问应用

打开浏览器访问：http://localhost:5173

## 开发模式特性

### 自动登录

在本地开发模式下，应用会自动使用模拟用户身份：

- **用户ID**: dev-user-001
- **用户名**: dev-user
- **显示名称**: 开发测试用户
- **邮箱**: dev@example.com

### 功能支持

本地开发环境支持所有聊天相关功能：

- ✅ 发送消息和接收 AI 回复
- ✅ 流式响应（实时显示 AI 回复）
- ✅ 对话历史记录
- ✅ 模型选择（GLM-4.6）
- ✅ 消息时间戳和 Token 使用统计
- ✅ 对话管理（新建、删除、重命名）

### 数据存储

本地开发环境使用内存存储，数据在服务器重启后会丢失。这适合开发和测试，不会产生持久化数据。

## 生产环境部署

本地开发配置仅在开发环境生效，不会影响生产环境的 GitHub 认证流程。

部署到生产环境时：

```bash
# 构建生产版本
npm run build

# 部署到 Vercel
vercel --prod
```

## 故障排除

### 1. 聊天功能不工作

检查 GLM API Key 是否正确配置：

```bash
# 检查环境变量
echo $GLM_API_KEY
```

### 2. 认证问题

确保环境变量正确设置：

```bash
# 检查开发模式配置
echo $NODE_ENV        # 应该是 development
echo $SKIP_AUTH       # 应该是 true
```

### 3. 端口冲突

如果 5173 端口被占用，Vite 会自动选择其他端口。查看终端输出获取实际端口号。

## 技术细节

### 认证绕过机制

在 `api/auth/verify.js` 中，当检测到开发模式时会返回模拟用户信息：

```javascript
if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
  // 返回模拟用户数据
}
```

### 环境变量优先级

1. `.env.local` - 本地开发配置（最高优先级）
2. `.env` - 默认配置
3. 系统环境变量

## 安全注意事项

- 本地开发配置仅在 `NODE_ENV=development` 时生效
- 生产环境必须使用真实的 GitHub OAuth2 认证
- 不要将 `.env.local` 文件提交到版本控制系统
- GLM API Key 应该保密，不要分享给他人
# DeepTalk - AI聊天应用

基于GLM-4.6的智能聊天应用，支持GitHub OAuth2登录，采用Vue3 + TypeScript + Node.js技术栈开发。

## 🌟 功能特性

- 🤖 **智能对话**: 基于GLM-4.6大语言模型的智能聊天
- 🔐 **安全认证**: GitHub OAuth2登录系统
- 💬 **对话管理**: 支持多对话创建、切换和历史记录
- 🎨 **现代UI**: 响应式设计，支持深色模式
- ☁️ **云端部署**: 支持Vercel一键部署
- 📱 **移动适配**: 完美适配移动端设备

## 🏗️ 技术架构

### 前端技术栈
- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Vite** - 快速的前端构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Pinia** - Vue状态管理库
- **Vue Router** - Vue官方路由管理器

### 后端技术栈
- **Node.js** - JavaScript运行时环境
- **Express** - Web应用框架
- **Vercel Functions** - 无服务器函数
- **JWT** - JSON Web Token认证
- **Axios** - HTTP客户端

### 存储方案
- **Vercel KV** - 键值存储（生产环境）
- **Redis** - 内存数据库（可选）
- **内存存储** - 本地开发环境

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd deeptalk
   ```

2. **安装依赖**
   ```bash
   cd ai-chat-vercel
   npm install
   ```

3. **环境配置**
   ```bash
   # 复制环境变量模板
   cp .env.example .env
   
   # 编辑环境变量（参考下方配置说明）
   nano .env
   ```

4. **启动开发服务器**
   ```bash
   # 启动完整的本地开发环境（前端+后端）
   npm run dev:local
   
   # 或者分别启动
   npm run server:dev  # 后端API服务器 (端口3001)
   npm run client:dev  # 前端开发服务器 (端口3000)
   ```

5. **访问应用**
   - 前端地址: http://localhost:3000
   - 后端API: http://localhost:3001

### 环境变量配置

创建 `.env` 文件并配置以下变量：

```bash
# 基础配置
NODE_ENV=development
APP_NAME=DeepTalk
APP_URL=http://localhost:3000

# GitHub OAuth2配置
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/callback

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
JWT_EXPIRES_IN=7d

# GLM-4.6 AI服务配置
GLM_API_KEY=your_glm_api_key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions

# 存储配置
KV_TYPE=memory  # 本地开发使用内存存储

# 功能开关
ENABLE_REGISTRATION=true
ENABLE_CHAT_HISTORY=true
ENABLE_USER_SETTINGS=true
SKIP_AUTH=true  # 本地开发跳过认证

# 限制配置
MAX_MESSAGE_LENGTH=4000
MAX_CONVERSATIONS_PER_USER=50
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

## 📦 部署到Vercel

### 前置准备

1. **注册Vercel账号**: https://vercel.com
2. **安装Vercel CLI**: `npm install -g vercel`
3. **登录Vercel**: `vercel login`

### 部署步骤

1. **进入项目目录**
   ```bash
   cd ai-chat-vercel
   ```

2. **执行部署**
   ```bash
   vercel --prod
   ```

3. **配置生产环境变量**
   
   在Vercel控制台中配置以下环境变量：
   
   ```bash
   # 基础配置
   NODE_ENV=production
   APP_NAME=DeepTalk
   APP_URL=https://your-domain.vercel.app
   
   # GitHub OAuth2配置
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=https://your-domain.vercel.app/api/auth/callback
   
   # JWT配置
   JWT_SECRET=your_production_jwt_secret_key
   JWT_EXPIRES_IN=7d
   
   # GLM-4.6 AI服务配置
   GLM_API_KEY=your_glm_api_key
   GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
   
   # Vercel KV存储配置
   KV_TYPE=vercel
   KV_REST_API_URL=your_vercel_kv_url
   KV_REST_API_TOKEN=your_vercel_kv_token
   
   # 功能配置
   ENABLE_REGISTRATION=true
   ENABLE_CHAT_HISTORY=true
   ENABLE_USER_SETTINGS=true
   # 注意：生产环境不要设置SKIP_AUTH=true
   ```

### 配置第三方服务

#### 1. GitHub OAuth应用

1. 访问 GitHub Settings > Developer settings > OAuth Apps
2. 创建新的OAuth应用
3. 设置回调URL: `https://your-domain.vercel.app/api/auth/callback`
4. 获取Client ID和Client Secret

#### 2. GLM-4.6 API

1. 访问智谱AI开放平台: https://open.bigmodel.cn
2. 注册账号并创建API Key
3. 将API Key配置到环境变量

#### 3. Vercel KV存储

1. 在Vercel项目设置中添加KV存储
2. 获取KV_REST_API_URL和KV_REST_API_TOKEN
3. 配置到环境变量

## 🛠️ 开发指南

### 项目结构

```
ai-chat-vercel/
├── api/                    # Vercel Functions API
│   ├── auth/              # 认证相关API
│   ├── chat/              # 聊天相关API
│   └── user/              # 用户相关API
├── src/                   # 前端源码
│   ├── components/        # Vue组件
│   ├── pages/            # 页面组件
│   ├── stores/           # Pinia状态管理
│   ├── utils/            # 工具函数
│   └── types/            # TypeScript类型定义
├── public/               # 静态资源
├── config/               # 配置文件
└── server/               # 本地开发服务器
```

### 开发命令

```bash
# 开发环境
npm run dev:local          # 启动完整开发环境
npm run server:dev         # 仅启动后端服务器
npm run client:dev         # 仅启动前端服务器

# 构建和预览
npm run build             # 构建生产版本
npm run preview           # 预览生产构建
npm run preview:local     # 本地预览（跳过认证）

# 代码检查
npm run type-check        # TypeScript类型检查
```

### 本地开发注意事项

1. **端口配置**: 前端默认3000端口，后端API默认3001端口
2. **认证跳过**: 本地开发时设置`SKIP_AUTH=true`跳过GitHub认证
3. **存储方式**: 本地开发使用内存存储，重启后数据会丢失
4. **热重载**: 前端支持热重载，后端修改需要重启服务器

## 🔧 故障排除

### 常见问题

1. **API 500错误**
   - 确保同时启动了前端和后端服务器
   - 使用`npm run dev:local`而不是`npm run dev`

2. **认证失败**
   - 检查GitHub OAuth配置
   - 确认回调URL设置正确
   - 验证Client ID和Secret

3. **构建失败**
   - 检查TypeScript类型错误
   - 确认所有依赖已正确安装
   - 清除node_modules重新安装

4. **部署问题**
   - 确认Vercel环境变量配置
   - 检查API函数是否正确部署
   - 查看Vercel部署日志

### 调试技巧

1. **查看日志**
   ```bash
   # 本地开发日志
   npm run dev:local
   
   # Vercel部署日志
   vercel logs
   ```

2. **环境变量检查**
   ```bash
   # 检查本地环境变量
   cat .env
   
   # 检查Vercel环境变量
   vercel env ls
   ```

## 📄 许可证

MIT License

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：

- 创建Issue
- 发送邮件
- 加入讨论群

---

**注意**: 请妥善保管API密钥和敏感信息，不要将其提交到代码仓库中。
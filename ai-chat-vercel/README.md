# DeepTalk - AI智能聊天应用

基于GLM-4.6的现代化AI聊天应用，支持GitHub OAuth2登录，专为Vercel部署优化。

## ✨ 特性

- 🤖 **智能对话**: 集成GLM-4.6大语言模型，提供高质量AI对话体验
- 🔐 **GitHub登录**: 支持GitHub OAuth2一键登录，安全便捷
- 💬 **对话管理**: 创建、删除、重命名多个对话会话
- 🎨 **现代UI**: 基于Vue 3 + TailwindCSS的响应式设计
- ⚡ **高性能**: Vite构建，Vercel全球CDN加速
- 🌙 **主题切换**: 支持明暗主题切换
- 📱 **移动适配**: 完美适配桌面和移动设备

## 🛠 技术栈

### 前端
- **框架**: Vue 3 + Composition API
- **类型系统**: TypeScript
- **构建工具**: Vite
- **样式框架**: TailwindCSS
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **图标**: Heroicons

### 后端
- **运行时**: Vercel Serverless Functions (Node.js 18)
- **认证**: GitHub OAuth2
- **数据存储**: Vercel KV (Redis)
- **AI服务**: GLM-4.6 API

### 部署
- **平台**: Vercel
- **域名**: 自定义域名支持
- **SSL**: 自动HTTPS
- **CDN**: 全球边缘网络

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-chat-vercel
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入以下配置：

```bash
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

# Vercel KV存储配置
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=your_kv_rest_api_token
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📦 部署到Vercel

### 1. 安装Vercel CLI

```bash
npm i -g vercel
```

### 2. 登录Vercel

```bash
vercel login
```

### 3. 部署项目

```bash
vercel --prod
```

### 4. 配置环境变量

在Vercel Dashboard中配置所有必需的环境变量。

## 🔧 开发脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 类型检查
npm run type-check
```

## 📁 项目结构

```
ai-chat-vercel/
├── api/                          # Vercel Serverless Functions
│   ├── auth/                     # 认证相关API
│   ├── chat/                     # 聊天相关API
│   └── user/                     # 用户相关API
├── src/                          # Vue前端源码
│   ├── components/               # Vue组件
│   ├── pages/                    # 页面组件
│   ├── stores/                   # Pinia状态管理
│   ├── utils/                    # 工具函数
│   ├── types/                    # TypeScript类型定义
│   └── router/                   # 路由配置
├── public/                       # 静态资源
├── vercel.json                   # Vercel配置
├── package.json                  # 项目配置
├── vite.config.ts               # Vite配置
├── tailwind.config.js           # TailwindCSS配置
└── tsconfig.json                # TypeScript配置
```

## 🔑 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth应用ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth应用密钥 | ✅ |
| `GITHUB_CALLBACK_URL` | GitHub OAuth回调URL | ✅ |
| `JWT_SECRET` | JWT签名密钥 | ✅ |
| `GLM_API_KEY` | GLM-4.6 API密钥 | ✅ |
| `KV_REST_API_URL` | Vercel KV存储URL | ✅ |
| `KV_REST_API_TOKEN` | Vercel KV存储Token | ✅ |

## 🔒 安全配置

- GitHub OAuth2标准认证流程
- JWT Token安全验证
- CSRF保护
- API速率限制
- 输入参数验证
- 安全HTTP头配置

## 📊 性能优化

- 代码分割和懒加载
- 静态资源压缩
- CDN全球加速
- 边缘计算优化
- 缓存策略配置

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

如果您遇到任何问题或有任何建议，请：

1. 查看 [Issues](../../issues) 页面
2. 创建新的 Issue
3. 联系开发团队

---

**DeepTalk** - 让AI对话更智能，让交流更自然 🚀
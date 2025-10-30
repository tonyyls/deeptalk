# AI Chat App - Vercel 部署指南

## 📋 部署概述

本项目包含前端（Vue 3）和后端（Node.js + Express）两部分，推荐的部署方案：

- **前端**：部署到 Vercel（完美支持）
- **后端**：部署到 Railway 或 Render（推荐）

## 🚀 前端部署到 Vercel

### 1. 准备工作

确保你的项目已推送到 GitHub 仓库。

### 2. Vercel 部署步骤

#### 2.1 连接 GitHub 仓库

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 `ai-chat-app` 仓库
5. 点击 "Import"

#### 2.2 配置构建设置

在 Vercel 项目设置中：

```bash
# Framework Preset
Framework: Vue.js

# Root Directory
Root Directory: frontend

# Build Command
Build Command: npm run build

# Output Directory
Output Directory: dist

# Install Command
Install Command: npm install
```

#### 2.3 环境变量配置

在 Vercel 项目的 Settings → Environment Variables 中添加：

```bash
# API 基础 URL（后端部署后的域名）
VITE_API_BASE_URL=https://your-backend-domain.com

# 其他前端环境变量
NODE_ENV=production
```

### 3. 创建 vercel.json 配置文件

在 `frontend/` 目录下创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🖥️ 后端部署选项

### 推荐方案 1：Railway 部署

#### 1. 准备 Railway 部署

1. 访问 [Railway](https://railway.app)
2. 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的仓库

#### 2. 配置 Railway

```bash
# Root Directory
Root Directory: backend

# Start Command
Start Command: npm start

# Build Command
Build Command: npm install
```

#### 3. 环境变量配置

在 Railway 项目设置中添加所有后端环境变量：

```bash
# 服务器配置
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app

# 数据库配置（Railway 会自动提供 PostgreSQL）
DATABASE_URL=${{Postgres.DATABASE_URL}}

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-railway-app.railway.app/api/auth/github/callback

# GLM-4.6 API
GLM_API_KEY=your_glm_api_key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 推荐方案 2：Render 部署

#### 1. Render 部署步骤

1. 访问 [Render](https://render.com)
2. 连接 GitHub 账号
3. 点击 "New" → "Web Service"
4. 选择你的仓库

#### 2. 配置 Render

```bash
# Name
Name: ai-chat-app-backend

# Root Directory
Root Directory: backend

# Build Command
Build Command: npm install

# Start Command
Start Command: npm start

# Environment
Environment: Node
```

#### 3. 环境变量配置

在 Render 的 Environment 标签页中添加相同的环境变量。

## 🔧 GitHub OAuth 配置更新

部署完成后，需要更新 GitHub OAuth 应用设置：

### 1. 访问 GitHub Developer Settings

1. 登录 GitHub
2. 访问 Settings → Developer settings → OAuth Apps
3. 选择你的 OAuth 应用

### 2. 更新回调 URL

```bash
# Homepage URL
https://your-vercel-app.vercel.app

# Authorization callback URL
https://your-backend-domain.com/api/auth/github/callback
```

## 📝 部署后配置清单

### 1. 更新前端环境变量

确保前端的 `VITE_API_BASE_URL` 指向正确的后端域名：

```bash
# Vercel 环境变量
VITE_API_BASE_URL=https://your-backend-domain.com
```

### 2. 更新后端环境变量

```bash
# 后端环境变量
FRONTEND_URL=https://your-vercel-app.vercel.app
CORS_ORIGIN=https://your-vercel-app.vercel.app
GITHUB_CALLBACK_URL=https://your-backend-domain.com/api/auth/github/callback
```

### 3. 数据库迁移

如果使用 Railway 的 PostgreSQL：

```bash
# 在 Railway 控制台中运行
npm run migrate
```

## 🧪 部署后测试步骤

### 1. 功能测试清单

- [ ] 前端页面正常加载
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] GitHub OAuth 登录
- [ ] AI 聊天功能
- [ ] 聊天历史记录
- [ ] 用户个人资料

### 2. 测试命令

```bash
# 测试后端 API
curl https://your-backend-domain.com/api/health

# 测试 GitHub OAuth 配置
curl https://your-backend-domain.com/api/auth/github/config
```

## 🚨 常见问题解决

### 1. CORS 错误

确保后端的 `CORS_ORIGIN` 设置为前端的 Vercel 域名。

### 2. GitHub OAuth 错误

检查 GitHub OAuth 应用的回调 URL 是否与后端域名匹配。

### 3. 环境变量问题

确保所有必需的环境变量都已在部署平台中正确设置。

### 4. 数据库连接问题

如果使用 Railway，确保使用 `${{Postgres.DATABASE_URL}}` 变量。

## 📊 部署成本估算

### Vercel（前端）
- **Hobby Plan**: 免费
- 包含：100GB 带宽/月，无限部署

### Railway（后端）
- **Developer Plan**: $5/月
- 包含：$5 使用额度，PostgreSQL 数据库

### Render（后端替代方案）
- **Free Plan**: 免费（有限制）
- **Starter Plan**: $7/月

## 🔄 自动部署配置

### 1. Vercel 自动部署

Vercel 会自动监听 GitHub 仓库的 `main` 分支变更并重新部署。

### 2. Railway 自动部署

Railway 也支持自动部署，推送到 `main` 分支即可触发。

## 📈 性能优化建议

### 1. 前端优化

```bash
# 在 frontend/vite.config.ts 中添加
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['tdesign-vue-next']
        }
      }
    }
  }
})
```

### 2. 后端优化

确保在生产环境中启用压缩和缓存：

```javascript
// 在 backend/src
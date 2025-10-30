# 快速开始指南

## 概述

本指南将帮助您快速搭建和运行 AI 聊天应用。该应用使用 Vite + Vue 3 + TDesign 作为前端，Node.js 作为后端，集成 GLM-4.6 API 提供 AI 对话功能。

## 系统要求

### 必需软件
- **Node.js**: >= 18.0.0 (推荐 LTS 版本)
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **Git**: 最新版本

### 推荐开发工具
- **VS Code**: 推荐安装 Vue 3 插件
- **Chrome/Firefox**: 用于调试和测试

### 操作系统支持
- macOS 10.15+
- Windows 10+
- Linux (Ubuntu 18.04+)

## 环境准备

### 1. 克隆项目
```bash
git clone <repository-url>
cd deeptalk
```

### 2. 安装依赖

#### 后端依赖安装
```bash
cd backend
npm install
```

#### 前端依赖安装
```bash
cd ../frontend
npm install
```

### 3. 环境变量配置

#### 后端环境变量
在 `backend` 目录下创建 `.env` 文件：

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DATABASE_URL=sqlite:./data/app.db
# 生产环境使用 PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/deeptalk

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# GitHub OAuth 配置
GITHUB_CLIENT_ID=your-github-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-app-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# GLM-4.6 API 配置
GLM_API_KEY=your-glm-api-key
GLM_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# CORS 配置
FRONTEND_URL=http://localhost:5173

# 日志配置
LOG_LEVEL=debug
```

#### 前端环境变量
在 `frontend` 目录下创建 `.env` 文件：

```bash
# API 配置
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_BASE_URL=ws://localhost:3000

# GitHub OAuth 配置
VITE_GITHUB_CLIENT_ID=your-github-oauth-app-client-id

# 应用配置
VITE_APP_TITLE=DeepTalk AI Chat
VITE_APP_VERSION=1.0.0
```

## 第三方服务配置

### 1. GitHub OAuth 应用设置

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: DeepTalk AI Chat
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. 创建后获取 `Client ID` 和 `Client Secret`
5. 将这些值填入环境变量文件

### 2. GLM-4.6 API 配置

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册账号并完成实名认证
3. 创建 API Key
4. 将 API Key 填入后端环境变量 `GLM_API_KEY`

## 数据库设置

### 开发环境 (SQLite)
```bash
cd backend
npm run db:migrate
npm run db:seed  # 可选：插入测试数据
```

### 生产环境 (PostgreSQL)
```bash
# 安装 PostgreSQL
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库
createdb deeptalk

# 运行迁移
cd backend
npm run db:migrate:prod
```

## 启动应用

### 开发模式

#### 1. 启动后端服务
```bash
cd backend
npm run dev
```
后端服务将在 `http://localhost:3000` 启动

#### 2. 启动前端服务
```bash
cd frontend
npm run dev
```
前端服务将在 `http://localhost:5173` 启动

### 生产模式

#### 1. 构建前端
```bash
cd frontend
npm run build
```

#### 2. 启动后端（包含静态文件服务）
```bash
cd backend
npm run start
```

## 项目结构

```
deeptalk/
├── backend/                 # 后端 Node.js 应用
│   ├── src/
│   │   ├── controllers/     # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── middleware/     # 中间件
│   │   ├── services/       # 业务逻辑服务
│   │   ├── utils/          # 工具函数
│   │   └── app.js          # 应用入口
│   ├── migrations/         # 数据库迁移文件
│   ├── seeds/              # 数据库种子文件
│   ├── tests/              # 测试文件
│   ├── package.json
│   └── .env
├── frontend/               # 前端 Vue 3 应用
│   ├── src/
│   │   ├── components/     # Vue 组件
│   │   ├── views/          # 页面视图
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── services/       # API 服务
│   │   ├── utils/          # 工具函数
│   │   ├── styles/         # 样式文件
│   │   └── main.js         # 应用入口
│   ├── public/             # 静态资源
│   ├── package.json
│   └── .env
└── specs/                  # 项目规格文档
    └── 001-ai-chat-app/
```

## 开发工作流

### 1. 代码规范
```bash
# 安装代码规范工具
npm install -g eslint prettier

# 运行代码检查
npm run lint

# 自动修复代码格式
npm run lint:fix
```

### 2. 测试
```bash
# 后端测试
cd backend
npm run test
npm run test:watch    # 监听模式
npm run test:coverage # 覆盖率报告

# 前端测试
cd frontend
npm run test
npm run test:ui       # 可视化测试界面
```

### 3. 构建和部署
```bash
# 构建前端
cd frontend
npm run build

# 构建后端（如果需要）
cd backend
npm run build

# 运行生产版本
npm run start
```

## 常见问题

### 1. 端口冲突
如果默认端口被占用，可以修改环境变量：
```bash
# 后端
PORT=3001

# 前端
VITE_PORT=5174
```

### 2. 数据库连接失败
检查数据库配置和权限：
```bash
# 检查 SQLite 文件权限
ls -la backend/data/

# 检查 PostgreSQL 连接
psql -h localhost -U username -d deeptalk
```

### 3. GitHub OAuth 回调失败
确保回调 URL 配置正确：
- 开发环境: `http://localhost:3000/api/auth/github/callback`
- 生产环境: `https://yourdomain.com/api/auth/github/callback`

### 4. GLM API 调用失败
检查 API Key 和网络连接：
```bash
# 测试 API 连接
curl -H "Authorization: Bearer your-api-key" \
     https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### 5. 前端构建失败
清理缓存并重新安装依赖：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 开发技巧

### 1. 热重载开发
```bash
# 同时启动前后端（推荐使用 concurrently）
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

### 2. API 调试
使用内置的 API 文档：
- 访问 `http://localhost:3000/api/docs` 查看 Swagger 文档

### 3. 数据库管理
```bash
# 查看数据库状态
cd backend
npm run db:status

# 重置数据库
npm run db:reset

# 创建新迁移
npm run db:migration:create add_new_feature
```

### 4. 日志查看
```bash
# 实时查看日志
cd backend
tail -f logs/app.log

# 或使用 PM2（生产环境）
pm2 logs deeptalk
```

## 性能优化

### 1. 前端优化
```bash
# 分析构建包大小
cd frontend
npm run build:analyze

# 启用 gzip 压缩
npm install compression
```

### 2. 后端优化
```bash
# 启用 Redis 缓存（可选）
npm install redis
# 配置环境变量 REDIS_URL

# 数据库连接池优化
# 在 database.js 中配置连接池参数
```

## 部署指南

### 1. Docker 部署
```bash
# 构建镜像
docker build -t deeptalk .

# 运行容器
docker run -p 3000:3000 -e NODE_ENV=production deeptalk
```

### 2. PM2 部署
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status
```

### 3. Nginx 配置
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 监控和维护

### 1. 健康检查
访问 `http://localhost:3000/api/health` 检查服务状态

### 2. 日志监控
```bash
# 设置日志轮转
npm install winston-daily-rotate-file

# 配置错误报告（可选）
npm install @sentry/node
```

### 3. 性能监控
```bash
# 安装性能监控工具
npm install clinic
clinic doctor -- node src/app.js
```

## 获取帮助

- **文档**: 查看 `docs/` 目录下的详细文档
- **API 参考**: `http://localhost:3000/api/docs`
- **问题反馈**: 在项目仓库创建 Issue
- **社区支持**: 加入项目讨论群

## 下一步

1. 阅读 [API 文档](./contracts.md) 了解接口详情
2. 查看 [数据模型](./data-model.md) 了解数据结构
3. 参考 [研究文档](./research.md) 了解技术选型
4. 开始开发您的第一个功能！
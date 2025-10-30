# Vercel部署配置文档

## 1. 项目配置概述

本文档详细说明了AI聊天应用在Vercel平台的部署配置，包括项目结构、环境变量、构建配置和部署流程。

## 2. vercel.json配置

```json
{
  "version": 2,
  "name": "ai-chat-vercel",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["hkg1", "sin1", "nrt1"]
}
```

## 3. 环境变量配置

### 3.1 必需环境变量

```bash
# GitHub OAuth2配置
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-domain.vercel.app/api/auth/github/callback

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

### 3.2 可选环境变量

```bash
# 应用配置
APP_NAME=AI聊天应用
APP_DESCRIPTION=基于GLM-4.6的智能聊天应用
APP_URL=https://your-domain.vercel.app

# 功能开关
ENABLE_REGISTRATION=true
ENABLE_CHAT_HISTORY=true
ENABLE_USER_SETTINGS=true

# 限制配置
MAX_MESSAGE_LENGTH=4000
MAX_CONVERSATIONS_PER_USER=50
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# 日志配置
LOG_LEVEL=info
ENABLE_DEBUG_LOGS=false
```

## 4. package.json配置

```json
{
  "name": "ai-chat-vercel",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "vercel-build": "npm run build"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "@vue/composition-api": "^1.7.2",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "@heroicons/vue": "^2.0.18",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "typescript": "^5.2.0",
    "vue-tsc": "^1.8.25",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "@types/node": "^20.10.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 5. Vite配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@heroicons/vue']
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

## 6. TailwindCSS配置

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}
```

## 7. TypeScript配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 8. 部署流程

### 8.1 自动部署设置

1. **连接GitHub仓库**
   ```bash
   # 在Vercel Dashboard中连接GitHub仓库
   # 选择ai-chat-vercel仓库
   # 配置自动部署分支为main
   ```

2. **环境变量配置**
   ```bash
   # 在Vercel Dashboard -> Settings -> Environment Variables
   # 添加所有必需的环境变量
   # 区分Production、Preview、Development环境
   ```

3. **域名配置**
   ```bash
   # 在Vercel Dashboard -> Settings -> Domains
   # 添加自定义域名
   # 配置DNS记录指向Vercel
   ```

### 8.2 手动部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel账户
vercel login

# 初始化项目
vercel

# 部署到生产环境
vercel --prod

# 查看部署状态
vercel ls

# 查看部署日志
vercel logs
```

### 8.3 本地开发环境

```bash
# 安装依赖
npm install

# 创建本地环境变量文件
cp .env.example .env.local

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 9. 性能优化配置

### 9.1 缓存策略

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 9.2 压缩配置

```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x",
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

## 10. 监控和日志

### 10.1 Vercel Analytics

```javascript
// 在main.ts中添加
import { inject } from '@vercel/analytics'

inject()
```

### 10.2 错误监控

```javascript
// 在Serverless Functions中添加错误处理
export default async function handler(req, res) {
  try {
    // 业务逻辑
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ 
      error: 'Internal Server Error',
      timestamp: new Date().toISOString()
    })
  }
}
```

## 11. 安全配置

### 11.1 CORS配置

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://your-domain.vercel.app"
        },
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        }
      ]
    }
  ]
}
```

### 11.2 安全头配置

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 12. 故障排除

### 12.1 常见问题

1. **构建失败**
   - 检查Node.js版本是否为18+
   - 确认所有依赖都已正确安装
   - 检查TypeScript类型错误

2. **API调用失败**
   - 验证环境变量是否正确配置
   - 检查Serverless Function的运行时配置
   - 查看Vercel Function日志

3. **认证问题**
   - 确认GitHub OAuth应用配置正确
   - 检查回调URL是否匹配
   - 验证JWT密钥配置

### 12.2 调试工具

```bash
# 查看部署日志
vercel logs [deployment-url]

# 本地调试Serverless Functions
vercel dev

# 检查环境变量
vercel env ls

# 查看项目信息
vercel inspect [deployment-url]
```

---

**总结**: 这个配置文档提供了完整的Vercel部署指南，确保AI聊天应用能够在Vercel平台上稳定运行，具备良好的性能和安全性。
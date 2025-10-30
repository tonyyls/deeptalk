# 技术研究

## 研究任务

### GLM-4.6 API 集成
**状态**: 待处理
**优先级**: 高
**估算时间**: 4-6小时

**问题**: 如何集成 GLM-4.6 API 实现流式对话功能
**方法**: 
1. 研究 GLM-4.6 API 文档和调用示例
2. 实现基础 API 调用功能
3. 实现流式响应处理
4. 测试 API 稳定性和性能

**发现**: 
- GLM-4.6 支持流式调用，使用 `stream: true` 参数
- API 端点: `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- 需要 API Key 进行身份验证
- 支持 thinking 模式提升推理能力

**决策**: 使用官方 API 进行集成，采用流式调用提升用户体验

### WebSocket vs Server-Sent Events
**状态**: 待处理
**优先级**: 高
**估算时间**: 2-3小时

**问题**: 选择合适的实时通信技术实现流式响应
**方法**:
1. 比较 WebSocket 和 SSE 的优缺点
2. 评估在 Vue 3 + Node.js 环境下的实现复杂度
3. 考虑浏览器兼容性和连接稳定性

**发现**: 
- SSE 更适合单向数据流（服务器到客户端）
- WebSocket 支持双向通信但复杂度更高
- SSE 有更好的自动重连机制

**决策**: 使用 Server-Sent Events 实现流式响应，简化实现复杂度

### GitHub OAuth 集成
**状态**: 待处理
**优先级**: 中
**估算时间**: 3-4小时

**问题**: 实现 GitHub OAuth 身份验证流程
**方法**:
1. 研究 GitHub OAuth Apps 配置
2. 实现 OAuth 授权码流程
3. 处理用户信息获取和存储
4. 实现 JWT token 管理

**发现**: 
- 需要在 GitHub 创建 OAuth App
- 授权流程: 重定向 → 授权码 → 访问令牌
- 可获取用户基本信息（用户名、头像、邮箱）

**决策**: 使用标准 OAuth 2.0 流程，结合 JWT 进行会话管理

### 数据库选择和设计
**状态**: 待处理
**优先级**: 中
**估算时间**: 2-3小时

**问题**: 选择合适的数据库存储聊天历史和用户信息
**方法**:
1. 评估 SQLite vs PostgreSQL 的适用场景
2. 设计数据库表结构
3. 考虑数据迁移和扩展性

**发现**: 
- SQLite 适合开发和小规模部署
- PostgreSQL 适合生产环境和高并发场景
- 需要考虑聊天记录的存储优化

**决策**: 开发环境使用 SQLite，生产环境支持 PostgreSQL

### Vue 3 + TDesign 组件集成
**状态**: 待处理
**优先级**: 中
**估算时间**: 2-3小时

**问题**: 如何有效使用 TDesign 组件构建聊天界面
**方法**:
1. 研究 TDesign Vue 3 组件库
2. 设计聊天界面布局和交互
3. 实现响应式设计
4. 优化组件性能

**发现**: 
- TDesign 提供丰富的 Vue 3 组件
- 支持主题定制和响应式布局
- 有完整的设计规范和最佳实践

**决策**: 使用 TDesign 作为主要 UI 组件库，确保界面一致性

## 技术选择

### 前端框架
**选择**: Vite + Vue 3 + TDesign
**理由**: 
- Vite 提供快速的开发体验和构建性能
- Vue 3 Composition API 提供更好的代码组织
- TDesign 提供企业级 UI 组件和设计规范
**替代方案**: React + Ant Design, Angular + Material
**权衡**: Vue 3 学习曲线相对平缓，TDesign 有良好的中文文档支持

### 后端技术
**选择**: Node.js + Express/Fastify
**理由**: 
- 与前端技术栈统一，降低开发复杂度
- 丰富的 npm 生态系统
- 良好的异步处理能力
**替代方案**: Python Flask/FastAPI, Go Gin
**权衡**: JavaScript 全栈开发效率高，但性能不如编译型语言

### 状态管理
**选择**: Pinia
**理由**: 
- Vue 3 官方推荐的状态管理库
- TypeScript 支持良好
- 更简洁的 API 设计
**替代方案**: Vuex, 原生 reactive
**权衡**: Pinia 是 Vuex 的继任者，有更好的开发体验

### 数据库
**选择**: SQLite (开发) + PostgreSQL (生产)
**理由**: 
- SQLite 零配置，适合快速开发
- PostgreSQL 功能强大，适合生产环境
- 两者都有良好的 Node.js 支持
**替代方案**: MongoDB, MySQL
**权衡**: 关系型数据库更适合结构化的聊天数据

### AI API
**选择**: GLM-4.6
**理由**: 
- 国内访问稳定，无需代理
- 支持流式响应和工具调用
- 中文处理能力强
**替代方案**: OpenAI GPT-4, Claude
**权衡**: 国产化优势，但生态系统相对较小

## 原型和概念验证

### GLM-4.6 API 调用原型
**目标**: 验证 API 调用和流式响应处理
**结果**: 待实现
**代码**: 
```javascript
// 基础 API 调用示例
const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: 'glm-4.6',
    messages: [{ role: 'user', content: message }],
    stream: true,
    max_tokens: 65536,
    temperature: 1.0
  })
});
```

### 流式响应处理原型
**目标**: 实现前端流式文本显示
**结果**: 待实现
**代码**: 
```javascript
// Server-Sent Events 处理
const eventSource = new EventSource('/api/chat/stream');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 更新 UI 显示流式文本
};
```

### GitHub OAuth 流程原型
**目标**: 验证 OAuth 授权和用户信息获取
**结果**: 待实现
**代码**: 
```javascript
// OAuth 重定向 URL 构建
const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
```
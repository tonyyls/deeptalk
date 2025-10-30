# Tasks: AI 聊天应用

**Feature**: AI 聊天应用 - 类似 Kimi 的流式对话应用  
**Input**: 设计文档来自 `/specs/001-ai-chat-app/`  
**Prerequisites**: plan.md (技术栈、库、结构), spec.md (用户故事), data-model.md (实体), contracts.md (API), research.md (技术决策), quickstart.md (测试场景)

**技术栈** (基于 plan.md):
- **前端**: Vite + Vue 3 + Composition API + TDesign + Pinia + Vue Router 4 + Axios + TypeScript
- **后端**: Node.js 18+ + Express.js + JWT + GitHub OAuth + GLM-4.6 API
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **实时通信**: Server-Sent Events (SSE) - 官方推荐架构决策

**组织方式**: 任务按用户故事分组，实现独立开发、测试和部署

## 格式说明: `[ID] [P?] [Story] 描述`

- **[P]**: 可并行运行的任务（不同文件，无依赖关系）
- **[Story]**: 任务所属用户故事（US1, US2, US3, US4）
- 包含确切的文件路径

## 项目结构 (基于 plan.md 架构)

```
ai-chat-app/
├── backend/
│   ├── src/
│   │   ├── models/          # 数据模型 (User, Conversation, Message, ChatSession)
│   │   ├── services/        # 业务逻辑 (GLMService, AuthService, MessageService)
│   │   ├── controllers/     # 控制器 (认证、消息、对话、流式)
│   │   ├── middleware/      # 中间件 (JWT认证、错误处理、验证)
│   │   ├── routes/          # 路由 (auth, messages, conversations, stream)
│   │   └── utils/           # 工具 (数据库、日志、响应格式)
│   ├── migrations/          # 数据库迁移脚本
│   └── tests/              # 后端测试
├── frontend/
│   ├── src/
│   │   ├── components/      # Vue 组件 (ChatMessage, ChatInput, LoginButton)
│   │   ├── views/          # 页面视图 (ChatView, LoginView)
│   │   ├── stores/         # Pinia 状态管理 (auth, chat, conversation)
│   │   ├── services/       # API 服务 (chatService, authService, streamService)
│   │   └── utils/          # 前端工具 (认证、错误处理)
│   └── tests/              # 前端测试
└── docs/                   # 项目文档
```

---

## 阶段 1: 设置 (项目初始化)

**目标**: 创建项目基础结构和配置，遵循 plan.md 架构决策

### 设置任务

- [ ] T001 在 /Users/yulsh/Desktop/deeptalk/ 创建 ai-chat-app 项目根目录
- [ ] T002 [P] 在 ai-chat-app/backend/ 初始化 Node.js 项目，创建 package.json (Node.js 18+)
- [ ] T003 [P] 在 ai-chat-app/frontend/ 初始化 Vite + Vue 3 + TypeScript 项目
- [ ] T004 [P] 在 ai-chat-app/backend/ 安装后端依赖：express, cors, helmet, dotenv, jsonwebtoken, bcryptjs, sqlite3, pg, axios
- [ ] T005 [P] 在 ai-chat-app/frontend/ 安装前端依赖：vue, vue-router, pinia, tdesign-vue-next, axios, typescript, @types/node
- [ ] T006 [P] 创建 ai-chat-app/backend/.env.example 环境变量模板文件 (GLM_API_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET)
- [ ] T007 [P] 创建 ai-chat-app/frontend/.env.example 环境变量模板文件 (VITE_API_BASE_URL, VITE_GITHUB_CLIENT_ID)
- [ ] T008 [P] 在 ai-chat-app/backend/src/ 创建基础目录结构 (models, services, controllers, middleware, routes, utils)
- [ ] T009 [P] 在 ai-chat-app/frontend/src/ 创建基础目录结构 (components, views, stores, services, utils)
- [ ] T010 [P] 创建 ai-chat-app/README.md 项目说明文档 (基于 quickstart.md)
- [ ] T011 [P] 创建 ai-chat-app/.gitignore 忽略文件配置 (.env, node_modules, dist)
- [ ] T012 [P] 在 ai-chat-app/backend/src/app.js 创建 Express 应用入口文件

---

## 阶段 2: 基础设施 (阻塞先决条件)

**目标**: 建立所有用户故事需要的共享基础设施，遵循 plan.md 数据库和架构决策

### 数据库和模型 (基于 data-model.md)

- [ ] T013 在 ai-chat-app/backend/migrations/001_create_users.sql 创建用户表迁移 (id, github_id, username, email, avatar_url, created_at, updated_at)
- [ ] T014 [P] 在 ai-chat-app/backend/migrations/002_create_conversations.sql 创建对话表迁移 (id, user_id, title, created_at, updated_at)
- [ ] T015 [P] 在 ai-chat-app/backend/migrations/003_create_messages.sql 创建消息表迁移 (id, conversation_id, role, content, created_at)
- [ ] T016 [P] 在 ai-chat-app/backend/migrations/004_create_chat_sessions.sql 创建聊天会话表迁移 (id, conversation_id, session_data, created_at)
- [ ] T017 在 ai-chat-app/backend/src/utils/database.js 创建数据库连接和迁移工具 (SQLite开发/PostgreSQL生产)
- [ ] T018 [P] 在 ai-chat-app/backend/src/models/User.js 创建用户模型 (GitHub OAuth 字段)
- [ ] T019 [P] 在 ai-chat-app/backend/src/models/Conversation.js 创建对话模型
- [ ] T020 [P] 在 ai-chat-app/backend/src/models/Message.js 创建消息模型 (支持 user/assistant 角色)
- [ ] T021 [P] 在 ai-chat-app/backend/src/models/ChatSession.js 创建聊天会话模型

### 中间件和工具 (基于 contracts.md)

- [ ] T022 [P] 在 ai-chat-app/backend/src/middleware/auth.js 创建JWT认证中间件 (Bearer Token)
- [ ] T023 [P] 在 ai-chat-app/backend/src/middleware/errorHandler.js 创建错误处理中间件
- [ ] T024 [P] 在 ai-chat-app/backend/src/middleware/validation.js 创建请求验证中间件
- [ ] T025 [P] 在 ai-chat-app/backend/src/middleware/rateLimiter.js 创建API限流中间件 (防止GLM API滥用)
- [ ] T026 [P] 在 ai-chat-app/backend/src/utils/logger.js 创建日志工具
- [ ] T027 [P] 在 ai-chat-app/backend/src/utils/response.js 创建统一响应格式工具

### 前端基础 (基于 plan.md 前端架构)

- [ ] T028 [P] 在 ai-chat-app/frontend/src/services/api.js 创建 Axios API 客户端 (Bearer Token 认证)
- [ ] T029 [P] 在 ai-chat-app/frontend/src/utils/auth.js 创建认证工具函数 (JWT 处理)
- [ ] T030 [P] 在 ai-chat-app/frontend/src/stores/auth.js 创建认证状态管理 (Pinia)
- [ ] T031 [P] 在 ai-chat-app/frontend/src/router/index.js 创建 Vue Router 4 配置
- [ ] T032 [P] 在 ai-chat-app/frontend/src/App.vue 创建根组件 (TDesign 主题)
- [ ] T033 [P] 在 ai-chat-app/frontend/src/main.js 创建应用入口文件 (Vue 3 + Pinia + TDesign)

---

## 阶段 3: US1 - 基础AI对话 (P1) 🎯 MVP核心

**故事目标**: 用户可以发送文本消息并接收AI回复  
**独立测试**: 发送消息 "你好" → 接收AI回复 → 显示在聊天界面  
**MVP价值**: 提供最基本的AI聊天功能

### 后端实现 (基于 research.md GLM-4.6 集成)

- [ ] T034 [US1] 在 ai-chat-app/backend/src/services/MessageService.js 创建消息服务类 (CRUD 操作)
- [ ] T035 [US1] 在 ai-chat-app/backend/src/services/GLMService.js 创建GLM-4.6 API集成服务 (非流式调用)
- [ ] T036 [US1] 在 ai-chat-app/backend/src/controllers/MessageController.js 创建消息控制器 (发送/接收)
- [ ] T037 [US1] 在 ai-chat-app/backend/src/routes/messages.js 创建消息路由 (POST /api/messages)
- [ ] T038 [US1] 在 ai-chat-app/backend/src/app.js 中注册消息路由

### 前端实现 (基于 plan.md 前端架构 - Vue 3 + TDesign + Pinia)

- [ ] T039 [P] [US1] 在 ai-chat-app/frontend/src/stores/chat.js 创建聊天状态管理 (Pinia)
- [ ] T040 [P] [US1] 在 ai-chat-app/frontend/src/services/chatService.js 创建聊天API服务 (Axios)
- [ ] T041 [P] [US1] 在 ai-chat-app/frontend/src/components/ChatMessage.vue 创建消息组件 (TDesign)
- [ ] T042 [P] [US1] 在 ai-chat-app/frontend/src/components/ChatInput.vue 创建输入组件 (TDesign Input + Button)
- [ ] T043 [US1] 在 ai-chat-app/frontend/src/views/ChatView.vue 创建聊天主界面 (Composition API)
- [ ] T044 [US1] 在 ai-chat-app/frontend/src/router/index.js 中添加聊天路由

### 集成测试

- [ ] T045 [US1] 测试基础对话流程：发送消息 → GLM-4.6 AI回复 → TDesign界面显示

---

## 阶段 4: US2 - 流式AI对话 (P2)

**故事目标**: 用户可以看到AI回复的实时生成过程  
**独立测试**: 发送消息 → 观察AI回复逐字显示 → 完成后停止流式显示  
**依赖**: US1 (基础对话功能)  
**架构决策**: 使用 SSE 而非 WebSocket (基于 plan.md 决策记录)

### 后端流式响应 (基于 research.md SSE 技术选择)

- [ ] T046 [US2] 在 ai-chat-app/backend/src/services/GLMService.js 中添加流式调用方法 (GLM-4.6 streaming)
- [ ] T047 [US2] 在 ai-chat-app/backend/src/controllers/StreamController.js 创建SSE流式控制器
- [ ] T048 [US2] 在 ai-chat-app/backend/src/routes/stream.js 创建SSE流式路由 (GET /api/stream/chat)
- [ ] T049 [US2] 在 ai-chat-app/backend/src/app.js 中注册流式路由

### 前端流式显示 (基于 plan.md SSE 架构决策)

- [ ] T050 [P] [US2] 在 ai-chat-app/frontend/src/services/streamService.js 创建SSE客户端服务 (EventSource)
- [ ] T051 [P] [US2] 在 ai-chat-app/frontend/src/stores/chat.js 中添加流式状态管理 (Pinia)
- [ ] T052 [US2] 在 ai-chat-app/frontend/src/components/ChatMessage.vue 中添加流式显示逻辑 (逐字动画)
- [ ] T053 [US2] 在 ai-chat-app/frontend/src/views/ChatView.vue 中集成流式响应

### 集成测试

- [ ] T054 [US2] 测试流式对话：发送消息 → SSE 逐字显示 → 验证完整回复

---

## 阶段 5: US3 - GitHub登录 (P3)

**故事目标**: 用户可以通过GitHub账户登录应用  
**独立测试**: 点击GitHub登录 → OAuth授权 → 返回应用并显示用户信息  
**并行开发**: 可与US1/US2并行开发  
**架构**: JWT + GitHub OAuth 2.0 (基于 plan.md 认证架构)

### 后端认证 (基于 contracts.md GitHub OAuth 端点)

- [ ] T055 [P] [US3] 在 ai-chat-app/backend/src/services/AuthService.js 创建认证服务 (JWT 生成/验证)
- [ ] T056 [P] [US3] 在 ai-chat-app/backend/src/services/GitHubService.js 创建GitHub OAuth服务 (OAuth 2.0 流程)
- [ ] T057 [P] [US3] 在 ai-chat-app/backend/src/controllers/AuthController.js 创建认证控制器
- [ ] T058 [US3] 在 ai-chat-app/backend/src/routes/auth.js 创建认证路由 (GET /auth/github, GET /auth/github/callback)
- [ ] T059 [US3] 在 ai-chat-app/backend/src/app.js 中注册认证路由

### 前端认证 (基于 plan.md 前端架构)

- [ ] T060 [P] [US3] 在 ai-chat-app/frontend/src/services/authService.js 创建认证API服务
- [ ] T061 [P] [US3] 在 ai-chat-app/frontend/src/components/LoginButton.vue 创建登录按钮组件 (TDesign Button)
- [ ] T062 [P] [US3] 在 ai-chat-app/frontend/src/views/LoginView.vue 创建登录页面 (TDesign Layout)
- [ ] T063 [US3] 在 ai-chat-app/frontend/src/router/index.js 中添加认证路由守卫
- [ ] T064 [US3] 在 ai-chat-app/frontend/src/stores/auth.js 中完善用户状态管理 (Pinia 持久化)

### 集成测试

- [ ] T065 [US3] 测试GitHub登录流程：登录 → OAuth授权 → JWT Token → 保持登录状态

---

## 阶段 6: US4 - 聊天历史管理 (P4)

**故事目标**: 用户可以查看历史对话、创建新对话、在对话间切换  
**独立测试**: 创建多个对话 → 在对话列表中切换 → 验证历史记录正确加载  
**依赖**: US1 (消息功能) + US3 (用户认证)

### 后端对话管理 (基于 data-model.md Conversation 实体)

- [ ] T066 [US4] 在 ai-chat-app/backend/src/services/ConversationService.js 创建对话服务 (CRUD + 历史查询)
- [ ] T067 [US4] 在 ai-chat-app/backend/src/controllers/ConversationController.js 创建对话控制器
- [ ] T068 [US4] 在 ai-chat-app/backend/src/routes/conversations.js 创建对话路由 (GET, POST, PUT, DELETE /api/conversations)
- [ ] T069 [US4] 在 ai-chat-app/backend/src/app.js 中注册对话路由

### 前端对话管理 (基于 plan.md 前端架构)

- [ ] T070 [P] [US4] 在 ai-chat-app/frontend/src/stores/conversation.js 创建对话状态管理 (Pinia)
- [ ] T071 [P] [US4] 在 ai-chat-app/frontend/src/services/conversationService.js 创建对话API服务
- [ ] T072 [P] [US4] 在 ai-chat-app/frontend/src/components/ConversationList.vue 创建对话列表组件 (TDesign List)
- [ ] T073 [P] [US4] 在 ai-chat-app/frontend/src/components/ConversationItem.vue 创建对话项组件 (TDesign ListItem)
- [ ] T074 [US4] 在 ai-chat-app/frontend/src/views/ChatView.vue 中集成对话管理功能
- [ ] T075 [US4] 在 ai-chat-app/frontend/src/stores/chat.js 中添加多对话支持

### 集成测试

- [ ] T076 [US4] 测试对话管理：创建对话 → 发送消息 → 切换对话 → 验证历史记录

---

## 阶段 7: 完善 (错误处理和性能优化)

**目标**: 提升用户体验和系统稳定性，遵循 plan.md 质量保证要求

### 错误处理和用户体验

- [ ] T077 [P] 在 ai-chat-app/frontend/src/components/ErrorBoundary.vue 创建错误边界组件 (TDesign Alert)
- [ ] T078 [P] 在 ai-chat-app/frontend/src/components/LoadingSpinner.vue 创建加载指示器组件 (TDesign Loading)
- [ ] T079 [P] 在 ai-chat-app/backend/src/middleware/rateLimiter.js 完善API限流中间件 (GLM API 保护)
- [ ] T080 [P] 在 ai-chat-app/frontend/src/utils/errorHandler.js 创建前端错误处理工具

### 性能优化 (基于 plan.md 性能要求)

- [ ] T081 [P] 在 ai-chat-app/frontend/src/components/ 中为大组件添加懒加载 (Vue 3 Suspense)
- [ ] T082 [P] 在 ai-chat-app/backend/src/services/ 中添加数据库查询优化 (索引、分页)
- [ ] T083 [P] 在 ai-chat-app/frontend/src/stores/ 中添加状态持久化 (localStorage)

### 部署准备

- [ ] T084 [P] 创建 ai-chat-app/docker-compose.yml 容器编排文件 (PostgreSQL + Redis)
- [ ] T085 [P] 创建 ai-chat-app/backend/Dockerfile 后端容器配置 (Node.js 18+)
- [ ] T086 [P] 创建 ai-chat-app/frontend/Dockerfile 前端容器配置 (Nginx + Vite build)

---

## 依赖关系和执行顺序

### 阻塞依赖
1. **阶段 1 → 阶段 2**: 项目结构必须先建立
2. **阶段 2 → US1**: 基础设施必须完成
3. **US1 → US2**: 流式功能扩展基础对话
4. **US1 + US3 → US4**: 历史管理需要消息和认证功能

### 并行执行机会
- **US3 (GitHub登录)** 可与 **US1/US2** 并行开发
- 标记 **[P]** 的任务可以并行执行
- 前端和后端任务大部分可以并行开发

### MVP 范围 (最小可行产品)
- **阶段 1-2**: 基础设施 (32个任务)
- **US1**: 基础AI对话 (12个任务)
- **总计**: 44个任务，约2周开发时间

### 增量交付计划
1. **第1周**: 完成设置和基础设施 → 可运行的空应用
2. **第2周**: 完成US1 → MVP可演示基础对话
3. **第3周**: 完成US2 → 流式对话体验
4. **第4周**: 完成US3+US4 → 完整功能应用

---

## 测试验收标准

**US1 测试**:
- 发送消息 "你好" → 接收GLM-4.6 AI回复 → TDesign界面正确显示
- 发送空消息 → 显示错误提示
- AI服务不可用 → 显示友好错误信息

**US2 测试**:
- 发送消息 → 观察AI回复通过SSE逐字显示 → 完成后停止流式
- 流式过程中刷新页面 → 恢复到完整回复状态

**US3 测试**:
- 点击GitHub登录 → OAuth授权 → 返回并显示用户信息
- 刷新页面 → JWT Token保持登录状态
- 登出 → 清除用户状态和Token

**US4 测试**:
- 创建新对话 → 发送消息 → 切换到另一对话 → 返回验证历史
- 对话列表显示正确的标题和时间
- 删除对话 → 从列表中移除

---

## 总结

**总任务数**: 86个任务  
**用户故事任务分布**:
- 设置阶段: 12个任务
- 基础设施: 21个任务  
- US1 (基础对话): 12个任务
- US2 (流式对话): 9个任务
- US3 (GitHub登录): 11个任务
- US4 (历史管理): 11个任务
- 完善阶段: 10个任务

**技术架构一致性**: ✅ 完全基于 plan.md 的架构决策
- SSE 流式响应 (而非 WebSocket)
- Pinia 状态管理 (而非 Vuex)  
- SQLite/PostgreSQL 数据库策略
- Vue 3 + TDesign + TypeScript 前端栈
- Node.js + Express + JWT + GitHub OAuth 后端栈

**并行机会**: 约65%的任务可并行执行  
**MVP范围**: US1 (44个任务，约2周开发时间)  
**关键里程碑**: 每个用户故事完成后都有可独立演示的功能增量

**下一步**: 按照阶段顺序开始实施，优先完成MVP (US1)以快速验证核心价值假设。所有任务现在完全基于 plan.md 的技术架构决策和 contracts.md 的API设计。
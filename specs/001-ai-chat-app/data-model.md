# 数据模型

## 实体

### User (用户)
**描述**: 代表应用的用户，通过 GitHub OAuth 进行身份验证

**属性**:
- `id`: UUID - 用户唯一标识符
- `github_id`: INTEGER - GitHub 用户 ID
- `username`: VARCHAR(255) - GitHub 用户名
- `display_name`: VARCHAR(255) - 显示名称
- `avatar_url`: TEXT - 头像 URL
- `email`: VARCHAR(255) - 邮箱地址
- `created_at`: TIMESTAMP - 创建时间
- `updated_at`: TIMESTAMP - 最后更新时间
- `last_login_at`: TIMESTAMP - 最后登录时间

**关系**:
- 一对多 Conversation - 用户可以有多个对话
- 一对多 Message - 用户可以发送多条消息

**约束**:
- `github_id` 必须唯一
- `username` 必须唯一
- `email` 可以为空（GitHub 用户可能不公开邮箱）

**验证规则**:
- `username` 必须符合 GitHub 用户名规范
- `avatar_url` 必须是有效的 URL
- `email` 如果不为空，必须是有效的邮箱格式

### Conversation (对话)
**描述**: 代表一个独立的聊天会话，包含多条消息

**属性**:
- `id`: UUID - 对话唯一标识符
- `user_id`: UUID - 所属用户 ID (外键)
- `title`: VARCHAR(255) - 对话标题
- `created_at`: TIMESTAMP - 创建时间
- `updated_at`: TIMESTAMP - 最后更新时间
- `message_count`: INTEGER - 消息数量
- `is_archived`: BOOLEAN - 是否已归档
- `last_message_at`: TIMESTAMP - 最后一条消息时间

**关系**:
- 多对一 User - 对话属于特定用户
- 一对多 Message - 对话包含多条消息

**约束**:
- `user_id` 不能为空
- `title` 不能为空
- `message_count` 默认为 0

**验证规则**:
- `title` 长度不超过 255 字符
- `message_count` 必须大于等于 0
- `last_message_at` 不能早于 `created_at`

### Message (消息)
**描述**: 代表聊天中的单条消息，可以是用户发送或 AI 回复

**属性**:
- `id`: UUID - 消息唯一标识符
- `conversation_id`: UUID - 所属对话 ID (外键)
- `role`: ENUM('user', 'assistant') - 消息角色
- `content`: TEXT - 消息内容
- `created_at`: TIMESTAMP - 创建时间
- `updated_at`: TIMESTAMP - 最后更新时间
- `token_count`: INTEGER - 令牌数量
- `is_streaming`: BOOLEAN - 是否为流式消息
- `stream_completed`: BOOLEAN - 流式消息是否完成
- `metadata`: JSON - 额外元数据

**关系**:
- 多对一 Conversation - 消息属于特定对话
- 多对一 User (间接) - 通过对话关联到用户

**约束**:
- `conversation_id` 不能为空
- `role` 必须是 'user' 或 'assistant'
- `content` 不能为空
- `token_count` 默认为 0

**验证规则**:
- `content` 长度不超过 100,000 字符
- `token_count` 必须大于等于 0
- 如果 `is_streaming` 为 true，`stream_completed` 默认为 false

### ChatSession (聊天会话)
**描述**: 代表当前活跃的聊天会话状态，用于管理实时连接

**属性**:
- `id`: UUID - 会话唯一标识符
- `user_id`: UUID - 用户 ID (外键)
- `conversation_id`: UUID - 当前对话 ID (外键)
- `connection_id`: VARCHAR(255) - WebSocket/SSE 连接 ID
- `is_active`: BOOLEAN - 是否活跃
- `created_at`: TIMESTAMP - 创建时间
- `last_activity_at`: TIMESTAMP - 最后活动时间
- `client_info`: JSON - 客户端信息

**关系**:
- 多对一 User - 会话属于特定用户
- 多对一 Conversation - 会话关联到特定对话

**约束**:
- `user_id` 不能为空
- `connection_id` 必须唯一
- `is_active` 默认为 true

**验证规则**:
- 每个用户同时只能有一个活跃会话
- `last_activity_at` 不能早于 `created_at`

## 关系图

```
User (1) ──────── (N) Conversation (1) ──────── (N) Message
 │                                                      │
 │                                                      │
 └─── (1) ──────── (N) ChatSession ──── (N) ──── (1) ──┘
```

## 数据流

### 用户注册和登录流程
1. 用户通过 GitHub OAuth 授权
2. 系统获取 GitHub 用户信息
3. 检查用户是否已存在（基于 github_id）
4. 如果不存在，创建新的 User 记录
5. 更新 last_login_at 时间戳
6. 创建 JWT token 返回给客户端

### 创建新对话流程
1. 验证用户身份（JWT token）
2. 创建新的 Conversation 记录
3. 设置默认标题（如"新对话"）
4. 返回对话 ID 给客户端
5. 客户端跳转到新对话界面

### 发送消息流程
1. 用户发送消息到指定对话
2. 创建 Message 记录（role: 'user'）
3. 更新 Conversation 的 message_count 和 last_message_at
4. 调用 GLM-4.6 API 获取 AI 回复
5. 创建 Message 记录（role: 'assistant'，is_streaming: true）
6. 通过 SSE 流式推送 AI 回复内容
7. 完成后设置 stream_completed: true

### 加载聊天历史流程
1. 验证用户身份
2. 查询用户的所有 Conversation 记录
3. 按 last_message_at 降序排列
4. 对于特定对话，查询其所有 Message 记录
5. 按 created_at 升序排列返回消息列表

### 实时会话管理流程
1. 用户连接时创建 ChatSession 记录
2. 记录连接 ID 和客户端信息
3. 定期更新 last_activity_at
4. 用户断开连接时设置 is_active: false
5. 清理过期的非活跃会话

## 索引策略

### 主要索引
- `users.github_id` - 唯一索引，用于 OAuth 登录查询
- `users.username` - 唯一索引，用于用户名查询
- `conversations.user_id` - 复合索引，用于查询用户的对话列表
- `conversations.updated_at` - 索引，用于按时间排序
- `messages.conversation_id` - 复合索引，用于查询对话的消息
- `messages.created_at` - 索引，用于按时间排序消息
- `chat_sessions.user_id` - 索引，用于查询用户的活跃会话
- `chat_sessions.connection_id` - 唯一索引，用于连接管理

### 复合索引
- `(conversations.user_id, conversations.updated_at DESC)` - 优化用户对话列表查询
- `(messages.conversation_id, messages.created_at ASC)` - 优化对话消息查询
- `(chat_sessions.user_id, chat_sessions.is_active)` - 优化活跃会话查询

## 数据迁移策略

### 版本控制
- 使用数据库迁移文件管理表结构变更
- 每个迁移文件包含 up 和 down 操作
- 迁移文件按时间戳命名

### 备份策略
- 生产环境每日自动备份
- 重要迁移前手动备份
- 保留最近 30 天的备份文件

### 扩展性考虑
- 消息表可能需要分表（按时间或对话 ID）
- 考虑使用 Redis 缓存热点数据
- 大量历史消息可考虑归档到对象存储
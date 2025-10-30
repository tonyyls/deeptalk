# API 合同

## 概述

本文档定义了 AI 聊天应用的前后端 API 合同，包括 RESTful API 端点、WebSocket/SSE 连接、数据格式和错误处理规范。

## 基础配置

### 基础 URL
- 开发环境: `http://localhost:3000/api`
- 生产环境: `https://api.deeptalk.com/api`

### 认证方式
- JWT Bearer Token
- Header: `Authorization: Bearer <token>`

### 内容类型
- Request: `application/json`
- Response: `application/json`
- SSE: `text/event-stream`

## 认证端点

### GitHub OAuth 登录
```http
GET /auth/github
```

**描述**: 重定向到 GitHub OAuth 授权页面

**响应**:
- `302 Redirect` - 重定向到 GitHub OAuth

---

### GitHub OAuth 回调
```http
GET /auth/github/callback?code={code}&state={state}
```

**参数**:
- `code` (string): GitHub 授权码
- `state` (string): CSRF 保护状态

**响应**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "username": "github_username",
      "display_name": "Display Name",
      "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    }
  }
}
```

---

### 验证 Token
```http
GET /auth/verify
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "github_username",
      "display_name": "Display Name",
      "avatar_url": "https://avatars.githubusercontent.com/u/123456"
    }
  }
}
```

## 对话管理端点

### 获取对话列表
```http
GET /conversations
Authorization: Bearer <token>
```

**查询参数**:
- `page` (number, optional): 页码，默认 1
- `limit` (number, optional): 每页数量，默认 20，最大 100
- `archived` (boolean, optional): 是否包含已归档对话，默认 false

**响应**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid-string",
        "title": "对话标题",
        "message_count": 10,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z",
        "last_message_at": "2024-01-01T12:00:00Z",
        "is_archived": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

---

### 创建新对话
```http
POST /conversations
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "title": "新对话标题"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid-string",
      "title": "新对话标题",
      "message_count": 0,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "last_message_at": null,
      "is_archived": false
    }
  }
}
```

---

### 获取对话详情
```http
GET /conversations/{conversation_id}
Authorization: Bearer <token>
```

**路径参数**:
- `conversation_id` (string): 对话 ID

**响应**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid-string",
      "title": "对话标题",
      "message_count": 10,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "last_message_at": "2024-01-01T12:00:00Z",
      "is_archived": false
    }
  }
}
```

---

### 更新对话
```http
PUT /conversations/{conversation_id}
Authorization: Bearer <token>
Content-Type: application/json
```

**路径参数**:
- `conversation_id` (string): 对话 ID

**请求体**:
```json
{
  "title": "更新后的标题",
  "is_archived": false
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid-string",
      "title": "更新后的标题",
      "message_count": 10,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T13:00:00Z",
      "last_message_at": "2024-01-01T12:00:00Z",
      "is_archived": false
    }
  }
}
```

---

### 删除对话
```http
DELETE /conversations/{conversation_id}
Authorization: Bearer <token>
```

**路径参数**:
- `conversation_id` (string): 对话 ID

**响应**:
```json
{
  "success": true,
  "message": "对话已删除"
}
```

## 消息管理端点

### 获取对话消息
```http
GET /conversations/{conversation_id}/messages
Authorization: Bearer <token>
```

**路径参数**:
- `conversation_id` (string): 对话 ID

**查询参数**:
- `page` (number, optional): 页码，默认 1
- `limit` (number, optional): 每页数量，默认 50，最大 100
- `before` (string, optional): 获取指定消息 ID 之前的消息

**响应**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid-string",
        "role": "user",
        "content": "用户发送的消息",
        "created_at": "2024-01-01T12:00:00Z",
        "token_count": 10,
        "is_streaming": false,
        "stream_completed": true
      },
      {
        "id": "uuid-string",
        "role": "assistant",
        "content": "AI 回复的消息",
        "created_at": "2024-01-01T12:00:05Z",
        "token_count": 25,
        "is_streaming": false,
        "stream_completed": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "has_more": false
    }
  }
}
```

---

### 发送消息
```http
POST /conversations/{conversation_id}/messages
Authorization: Bearer <token>
Content-Type: application/json
```

**路径参数**:
- `conversation_id` (string): 对话 ID

**请求体**:
```json
{
  "content": "用户发送的消息内容",
  "stream": true
}
```

**参数说明**:
- `content` (string): 消息内容，必填，最大 10000 字符
- `stream` (boolean): 是否启用流式响应，默认 true

**响应**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "uuid-string",
      "role": "user",
      "content": "用户发送的消息内容",
      "created_at": "2024-01-01T12:00:00Z",
      "token_count": 15,
      "is_streaming": false,
      "stream_completed": true
    },
    "ai_message_id": "uuid-string"
  }
}
```

## 流式响应端点

### AI 消息流式响应
```http
GET /conversations/{conversation_id}/messages/{message_id}/stream
Authorization: Bearer <token>
Accept: text/event-stream
```

**路径参数**:
- `conversation_id` (string): 对话 ID
- `message_id` (string): AI 消息 ID

**SSE 事件格式**:

**开始事件**:
```
event: start
data: {"message_id": "uuid-string", "timestamp": "2024-01-01T12:00:00Z"}
```

**内容事件**:
```
event: content
data: {"delta": "AI回复的", "message_id": "uuid-string"}
```

```
event: content
data: {"delta": "部分内容", "message_id": "uuid-string"}
```

**完成事件**:
```
event: complete
data: {"message_id": "uuid-string", "total_tokens": 50, "timestamp": "2024-01-01T12:00:10Z"}
```

**错误事件**:
```
event: error
data: {"error": "API调用失败", "code": "GLM_API_ERROR", "message_id": "uuid-string"}
```

## 用户管理端点

### 获取用户信息
```http
GET /user/profile
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "github_username",
      "display_name": "Display Name",
      "avatar_url": "https://avatars.githubusercontent.com/u/123456",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "last_login_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

---

### 更新用户信息
```http
PUT /user/profile
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "display_name": "新的显示名称"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "github_username",
      "display_name": "新的显示名称",
      "avatar_url": "https://avatars.githubusercontent.com/u/123456",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T13:00:00Z",
      "last_login_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

## 错误处理

### 标准错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息",
    "details": "详细错误信息（可选）",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### HTTP 状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或 Token 无效 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 请求格式正确但语义错误 |
| 429 | Too Many Requests | 请求频率限制 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 上游服务错误（如 GLM API） |
| 503 | Service Unavailable | 服务暂时不可用 |

### 错误代码

#### 认证错误 (AUTH_*)
- `AUTH_TOKEN_MISSING`: Token 缺失
- `AUTH_TOKEN_INVALID`: Token 无效
- `AUTH_TOKEN_EXPIRED`: Token 已过期
- `AUTH_GITHUB_ERROR`: GitHub OAuth 错误
- `AUTH_PERMISSION_DENIED`: 权限不足

#### 验证错误 (VALIDATION_*)
- `VALIDATION_REQUIRED_FIELD`: 必填字段缺失
- `VALIDATION_INVALID_FORMAT`: 格式错误
- `VALIDATION_LENGTH_EXCEEDED`: 长度超限
- `VALIDATION_INVALID_UUID`: UUID 格式错误

#### 资源错误 (RESOURCE_*)
- `RESOURCE_NOT_FOUND`: 资源不存在
- `RESOURCE_ALREADY_EXISTS`: 资源已存在
- `RESOURCE_ACCESS_DENIED`: 资源访问被拒绝

#### 业务逻辑错误 (BUSINESS_*)
- `BUSINESS_CONVERSATION_LIMIT`: 对话数量限制
- `BUSINESS_MESSAGE_TOO_LONG`: 消息过长
- `BUSINESS_RATE_LIMIT`: 频率限制

#### 外部服务错误 (EXTERNAL_*)
- `EXTERNAL_GLM_API_ERROR`: GLM API 调用失败
- `EXTERNAL_GLM_API_TIMEOUT`: GLM API 超时
- `EXTERNAL_GLM_API_QUOTA`: GLM API 配额不足
- `EXTERNAL_GITHUB_API_ERROR`: GitHub API 错误

#### 系统错误 (SYSTEM_*)
- `SYSTEM_DATABASE_ERROR`: 数据库错误
- `SYSTEM_INTERNAL_ERROR`: 系统内部错误
- `SYSTEM_SERVICE_UNAVAILABLE`: 服务不可用

### 错误处理示例

#### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_REQUIRED_FIELD",
    "message": "缺少必填字段",
    "details": "字段 'content' 是必填的",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "AUTH_TOKEN_EXPIRED",
    "message": "Token 已过期",
    "details": "请重新登录获取新的 Token",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "对话不存在",
    "details": "对话 ID 'uuid-string' 不存在或已被删除",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### 502 Bad Gateway
```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_GLM_API_ERROR",
    "message": "AI 服务暂时不可用",
    "details": "GLM API 返回错误，请稍后重试",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## 频率限制

### 限制规则
- 认证端点: 10 次/分钟/IP
- 消息发送: 30 次/分钟/用户
- 其他 API: 100 次/分钟/用户
- SSE 连接: 5 个/用户

### 限制响应头
```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1640995200
```

### 超限响应
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RATE_LIMIT",
    "message": "请求频率超限",
    "details": "每分钟最多发送 30 条消息",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## WebSocket 连接（备选方案）

### 连接端点
```
ws://localhost:3000/ws?token=<jwt_token>
```

### 消息格式

#### 客户端发送消息
```json
{
  "type": "send_message",
  "data": {
    "conversation_id": "uuid-string",
    "content": "用户消息内容"
  }
}
```

#### 服务端响应消息
```json
{
  "type": "message_created",
  "data": {
    "message": {
      "id": "uuid-string",
      "role": "user",
      "content": "用户消息内容",
      "created_at": "2024-01-01T12:00:00Z"
    }
  }
}
```

#### AI 流式响应
```json
{
  "type": "ai_response_start",
  "data": {
    "message_id": "uuid-string",
    "conversation_id": "uuid-string"
  }
}
```

```json
{
  "type": "ai_response_delta",
  "data": {
    "message_id": "uuid-string",
    "delta": "AI回复的部分内容"
  }
}
```

```json
{
  "type": "ai_response_complete",
  "data": {
    "message_id": "uuid-string",
    "total_tokens": 50
  }
}
```
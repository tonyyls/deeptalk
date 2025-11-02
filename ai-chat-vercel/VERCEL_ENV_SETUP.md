# Vercel 环境变量配置指南

## 🎯 重要提示

**更新环境变量后无需重新打包！** Vercel 会自动应用新的环境变量配置，这是平台的一个重要优势。

## 概述

本指南将帮助您在 Vercel 平台上配置 DeepTalk AI 聊天应用所需的环境变量。**重要提示：更新环境变量后无需重新打包，Vercel 会自动应用新配置。**

## 🚀 快速配置步骤

### 1. 访问 Vercel 控制台

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的 `deeptalk` 项目
3. 点击项目名称进入项目详情页
4. 点击 **Settings** 标签
5. 在左侧菜单中选择 **Environment Variables**

### 2. 配置必需的环境变量

#### GitHub OAuth 配置（必需）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GITHUB_CLIENT_ID` | `您的GitHub OAuth App Client ID` | 从GitHub OAuth应用获取 |
| `GITHUB_CLIENT_SECRET` | `您的GitHub OAuth App Client Secret` | 从GitHub OAuth应用获取 |
| `GITHUB_CALLBACK_URL` | `https://您的域名/api/auth/callback` | OAuth回调地址 |

#### JWT 配置（推荐）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `JWT_SECRET` | `至少32位的随机字符串` | 用于JWT签名的密钥 |
| `JWT_EXPIRES_IN` | `7d` | JWT过期时间 |

#### Vercel KV 数据库配置（必需）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `KV_REST_API_URL` | `https://your-kv-instance.upstash.io` | KV数据库REST API地址 |
| `KV_REST_API_TOKEN` | `您的KV REST API Token` | KV数据库访问令牌 |

#### GLM AI 配置（可选）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GLM_API_KEY` | `您的GLM API密钥` | 智谱AI API密钥 |
| `GLM_API_URL` | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | GLM API地址 |

## 📋 详细配置步骤

### 步骤 1: 创建 Vercel KV 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 在项目页面，点击 **Storage** 标签
3. 点击 **Create Database**
4. 选择 **KV** 数据库类型
5. 填写数据库信息：
   - **Database Name**: `deeptalk-kv`
   - **Region**: 选择离您用户最近的区域
6. 点击 **Create** 创建数据库
7. 创建完成后，点击数据库名称进入详情页
8. 在 **Settings** 标签中找到 **REST API** 部分
9. 复制 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`

### 步骤 2: 创建 GitHub OAuth 应用

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **New OAuth App**
3. 填写应用信息：
   - **Application name**: `DeepTalk AI Chat`
   - **Homepage URL**: `https://您的Vercel域名`
   - **Authorization callback URL**: `https://您的Vercel域名/api/auth/callback`
4. 点击 **Register application**
5. 复制 **Client ID** 和 **Client Secret**

### 步骤 3: 在 Vercel 中添加环境变量

1. 在 Vercel 项目的 Environment Variables 页面
2. 点击 **Add New** 按钮
3. 逐一添加以下变量：

```bash
# 必需配置 - KV数据库
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=your_kv_rest_api_token

# 必需配置 - GitHub OAuth
GITHUB_CLIENT_ID=Ov23liJhqKKGJJJJJJJJ
GITHUB_CLIENT_SECRET=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=https://deeptalk-hax4yhx6q-tonyyls-projects.vercel.app/api/auth/callback

# 推荐配置
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_for_security
JWT_EXPIRES_IN=7d

# 可选配置（AI功能）
GLM_API_KEY=your_glm_api_key_here
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
```

### 步骤 4: 选择环境

为每个环境变量选择适用的环境：
- ✅ **Production** (生产环境)
- ✅ **Preview** (预览环境，可选)
- ✅ **Development** (开发环境，可选)

## 🔄 更新配置

### 无需重新部署的更新

当您需要更换 GitHub OAuth 应用信息时：

1. 在 Vercel Dashboard 中更新对应的环境变量
2. 点击 **Save** 保存
3. **环境变量会立即生效，无需重新部署！**

### 需要重新部署的情况

只有在以下情况下才需要重新部署：
- 修改了代码文件
- 更新了 `package.json` 依赖
- 修改了 `vercel.json` 配置

## 🧪 测试配置

配置完成后，您可以通过以下方式测试：

1. 访问您的应用首页
2. 点击 **GitHub 登录** 按钮
3. 如果配置正确，会跳转到 GitHub 授权页面
4. 授权后应该能成功登录应用

## ❌ 常见错误排查

### 错误：Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN

**原因**: 缺少 Vercel KV 数据库环境变量
**解决**: 
1. 在 Vercel Dashboard 中创建 KV 数据库实例
2. 获取 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`
3. 在 Vercel 项目环境变量中添加这两个值

### 错误：GitHub OAuth configuration missing

**原因**: 缺少 `GITHUB_CLIENT_ID` 或 `GITHUB_CLIENT_SECRET`
**解决**: 确保在 Vercel 环境变量中正确配置了这两个值

### 错误：Invalid client_id

**原因**: GitHub OAuth App 的 Client ID 不正确
**解决**: 
1. 检查 GitHub OAuth App 设置
2. 确保 Client ID 复制正确
3. 更新 Vercel 环境变量中的 `GITHUB_CLIENT_ID`

### 错误：Redirect URI mismatch

**原因**: GitHub OAuth App 的回调地址与实际不符
**解决**:
1. 在 GitHub OAuth App 设置中更新 Authorization callback URL
2. 确保格式为：`https://您的域名/api/auth/callback`

## 🔐 安全建议

1. **定期更换密钥**: 建议每3-6个月更换一次 JWT_SECRET
2. **限制 OAuth 权限**: GitHub OAuth 只请求必要的权限（user:email）
3. **监控访问日志**: 定期检查 Vercel 的访问日志
4. **备份配置**: 将环境变量配置保存在安全的地方

## 📞 获取帮助

如果遇到配置问题：

1. 检查 Vercel 的 Functions 日志
2. 查看浏览器开发者工具的网络请求
3. 参考本项目的 README.md 文档
4. 提交 GitHub Issue 获取技术支持

---

**提示**: 环境变量更新后会立即生效，这是 Vercel 的一个重要优势，让您可以快速调整配置而无需重新构建整个应用！
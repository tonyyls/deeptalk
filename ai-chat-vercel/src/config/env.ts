/**
 * 环境配置管理
 * 提供默认值和环境变量的统一管理
 */

// 获取环境变量的辅助函数
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    // 客户端环境，从window对象获取
    return (window as any).__ENV__?.[key] || defaultValue
  }
  // 构建时环境，从import.meta.env获取
  return (import.meta as any).env?.[key] || defaultValue
}

// 获取当前部署的域名
const getCurrentDomain = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // 在构建时使用环境变量或默认值
  return getEnvVar('VITE_APP_URL', 'https://deeptalk-hax4yhx6q-tonyyls-projects.vercel.app')
}

// GitHub OAuth 配置
export const GITHUB_CONFIG = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liJhqKKGJJJJJJJJ', // 请替换为您的实际 Client ID
  callbackUrl: `${getCurrentDomain()}/api/auth/callback`,
  scope: 'user:email',
  authUrl: 'https://github.com/login/oauth/authorize'
} as const

// API 配置
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || getCurrentDomain(),
  timeout: 30000,
  retryAttempts: 3
} as const

// JWT 配置
export const JWT_CONFIG = {
  secret: import.meta.env.VITE_JWT_SECRET || 'your_super_secret_jwt_key_at_least_32_characters_long_for_security',
  expiresIn: '7d'
} as const

// GLM API 配置
export const GLM_CONFIG = {
  apiKey: import.meta.env.VITE_GLM_API_KEY || '', // 需要用户配置
  apiUrl: import.meta.env.VITE_GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4.6',
  maxTokens: 2000,
  temperature: 0.7
} as const

// 应用配置
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'DeepTalk',
  description: import.meta.env.VITE_APP_DESCRIPTION || '基于GLM-4.6的智能聊天应用',
  url: getCurrentDomain(),
  version: '1.0.0'
} as const

// 功能开关
export const FEATURE_FLAGS = {
  enableRegistration: import.meta.env.VITE_ENABLE_REGISTRATION !== 'false',
  enableChatHistory: import.meta.env.VITE_ENABLE_CHAT_HISTORY !== 'false',
  enableUserSettings: import.meta.env.VITE_ENABLE_USER_SETTINGS !== 'false',
  enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true'
} as const

// 限制配置
export const LIMITS = {
  maxMessageLength: parseInt(import.meta.env.VITE_MAX_MESSAGE_LENGTH || '4000'),
  maxConversationsPerUser: parseInt(import.meta.env.VITE_MAX_CONVERSATIONS_PER_USER || '50'),
  rateLimitRequestsPerMinute: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS_PER_MINUTE || '60')
} as const

// 开发环境检查
export const isDevelopment = import.meta.env.DEV
export const isProduction = import.meta.env.PROD

// 环境变量验证
export const validateEnvironment = () => {
  const errors: string[] = []
  
  if (!GLM_CONFIG.apiKey && isProduction) {
    errors.push('GLM_API_KEY is required in production')
  }
  
  if (!GITHUB_CONFIG.clientId.startsWith('Ov23li') && isProduction) {
    errors.push('GITHUB_CLIENT_ID is required in production')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 导出所有配置
export const ENV_CONFIG = {
  github: GITHUB_CONFIG,
  api: API_CONFIG,
  jwt: JWT_CONFIG,
  glm: GLM_CONFIG,
  app: APP_CONFIG,
  features: FEATURE_FLAGS,
  limits: LIMITS,
  isDevelopment,
  isProduction,
  validate: validateEnvironment
} as const

export default ENV_CONFIG
/**
 * 应用常量定义
 */

// 应用信息
export const APP_INFO = {
  name: 'AI Chat',
  version: '1.0.0',
  description: '基于GLM-4.6的智能聊天应用',
  author: 'AI Chat Team',
  repository: 'https://github.com/your-username/ai-chat-vercel'
} as const

// API配置
export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
} as const

// 聊天配置
export const CHAT_CONFIG = {
  maxMessageLength: 4000,
  maxConversationTitle: 100,
  defaultModel: 'glm-4.6',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  messagePageSize: 50,
  conversationPageSize: 20
} as const

// 支持的AI模型
export const AI_MODELS = [
  {
    id: 'glm-4.6',
    name: 'GLM-4.6',
    description: '最新的GLM-4.6模型，性能更强',
    maxTokens: 4000,
    contextWindow: 8192
  },
  {
    id: 'glm-4',
    name: 'GLM-4',
    description: '稳定的GLM-4模型',
    maxTokens: 2000,
    contextWindow: 4096
  }
] as const

// 主题配置
export const THEME_CONFIG = {
  themes: ['light', 'dark', 'auto'] as const,
  defaultTheme: 'auto' as const
}

// 语言配置
export const LANGUAGE_CONFIG = {
  languages: [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' }
  ],
  defaultLanguage: 'zh-CN'
} as const

// 字体大小配置
export const FONT_SIZE_CONFIG = {
  sizes: [
    { id: 'small', name: '小', className: 'text-sm' },
    { id: 'medium', name: '中', className: 'text-base' },
    { id: 'large', name: '大', className: 'text-lg' }
  ],
  defaultSize: 'medium'
} as const

// 本地存储键名
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  authUser: 'auth_user',
  theme: 'theme',
  language: 'language',
  fontSize: 'font_size',
  chatSettings: 'chat_settings',
  sidebarCollapsed: 'sidebar_collapsed'
} as const

// 路由路径
export const ROUTES = {
  home: '/',
  login: '/login',
  chat: '/chat',
  profile: '/profile',
  settings: '/settings',
  about: '/about',
  authCallback: '/auth/callback',
  authError: '/auth/error'
} as const

// 错误消息
export const ERROR_MESSAGES = {
  networkError: '网络连接失败，请检查网络设置',
  authRequired: '请先登录',
  tokenExpired: '登录已过期，请重新登录',
  permissionDenied: '权限不足',
  serverError: '服务器错误，请稍后再试',
  invalidInput: '输入内容无效',
  messageEmpty: '消息内容不能为空',
  messageTooLong: '消息内容过长',
  conversationNotFound: '对话不存在',
  userNotFound: '用户不存在'
} as const

// 成功消息
export const SUCCESS_MESSAGES = {
  loginSuccess: '登录成功',
  logoutSuccess: '已退出登录',
  profileUpdated: '资料更新成功',
  settingsUpdated: '设置保存成功',
  conversationCreated: '对话创建成功',
  conversationRenamed: '对话重命名成功',
  conversationDeleted: '对话删除成功',
  messageSent: '消息发送成功',
  copied: '已复制到剪贴板'
} as const

// 正则表达式
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  conversationTitle: /^.{1,100}$/
} as const

// 动画配置
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  }
} as const

// 响应式断点
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// 颜色配置
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
} as const
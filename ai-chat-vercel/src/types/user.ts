/**
 * 用户相关类型定义
 */

export interface User {
  id: string
  githubId: number
  username: string
  displayName: string
  avatarUrl: string
  email?: string
  bio?: string
  location?: string
  website?: string
  createdAt: string
  lastLoginAt: string
  settings?: UserSettings
  stats?: UserStats
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  fontSize: 'small' | 'medium' | 'large'
  chatSettings: ChatSettings
  notifications: NotificationSettings
  privacy: PrivacySettings
  accessibility: AccessibilitySettings
}

export interface ChatSettings {
  model: 'glm-4.6' | 'glm-4'
  temperature: number
  maxTokens: number
  streamResponse: boolean
  showTimestamp: boolean
  showTokenUsage: boolean
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  sound: boolean
}

export interface PrivacySettings {
  showEmail: boolean
  showProfile: boolean
  allowDataCollection: boolean
}

export interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  screenReader: boolean
}

export interface UserStats {
  totalConversations: number
  totalMessages: number
  joinedAt: string
}

export interface AuthResponse {
  success: boolean
  token: string
  user: User
}

export interface TokenVerificationResponse {
  success: boolean
  valid: boolean
  user: User
  tokenInfo: {
    issuedAt: string
    expiresAt: string
    issuer: string
    audience: string
  }
}
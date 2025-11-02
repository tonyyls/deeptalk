import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/user'
import { authApi } from '@/utils/api'

/**
 * 认证状态管理
 * 处理用户登录、登出和认证状态
 */
export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userDisplayName = computed(() => user.value?.displayName || user.value?.username || '')
  const userAvatar = computed(() => user.value?.avatarUrl || '')

  /**
   * 初始化认证状态
   * 从本地存储恢复用户会话
   */
  async function initAuth() {
    try {
      loading.value = true
      error.value = null

      // 开发模式下自动设置模拟用户身份
      const debugInfo = {
        isDev: import.meta.env.DEV,
        hostname: window.location.hostname,
        shouldUseMock: import.meta.env.DEV && window.location.hostname === 'localhost'
      }
      console.log('🔍 检查开发模式:', debugInfo)
      
      // 暴露调试信息到window对象
      if (typeof window !== 'undefined') {
        (window as any).authDebug = debugInfo
      }
      
      if (import.meta.env.DEV && window.location.hostname === 'localhost') {
        const mockUser = {
          id: 'dev-user-001',
          userId: 'dev-user-001',
          username: 'dev-user',
          displayName: '开发测试用户',
          email: 'dev@example.com',
          avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4',
          githubId: 12345,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        }
        
        const mockToken = 'dev-mock-token-' + Date.now()
        
        // 设置认证状态
        user.value = mockUser
        token.value = mockToken
        
        // 保存到本地存储
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('auth_user', JSON.stringify(mockUser))
        
        console.log('✅ 开发模式：使用模拟用户身份', mockUser)
        return
      }

      // 从localStorage获取token
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')

      if (savedToken && savedUser) {
        token.value = savedToken
        user.value = JSON.parse(savedUser)

        // 验证token是否仍然有效
        try {
          await verifyToken()
        } catch (err) {
          // Token无效，清除本地存储
          await logout()
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
      error.value = '认证初始化失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 验证token有效性
   */
  async function verifyToken() {
    if (!token.value) {
      throw new Error('No token available')
    }

    try {
      const response = await authApi.verifyToken(token.value)
      if (response.valid && response.user) {
        user.value = response.user
        return response
      } else {
        throw new Error('Token verification failed')
      }
    } catch (err) {
      console.error('Token verification error:', err)
      throw err
    }
  }

  /**
   * 处理登录回调
   * 从URL参数中获取token和用户信息
   */
  async function handleAuthCallback(callbackToken: string, callbackUser: string) {
    try {
      loading.value = true
      error.value = null

      // 解析用户信息
      const userData = JSON.parse(decodeURIComponent(callbackUser))
      
      // 设置认证状态
      token.value = callbackToken
      user.value = userData

      // 保存到本地存储
      localStorage.setItem('auth_token', callbackToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))

      return { success: true }
    } catch (err) {
      console.error('Auth callback error:', err)
      error.value = '登录回调处理失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 处理GitHub OAuth回调
   * 兼容AuthCallback.vue中的方法调用
   */
  async function handleCallback(code: string, state?: string) {
    try {
      loading.value = true
      error.value = null

      // 调用后端API处理回调
      const response = await fetch(`/api/auth/callback?code=${code}&state=${state || ''}`)
      
      if (!response.ok) {
        throw new Error('认证回调失败')
      }

      // 检查是否是重定向响应
      if (response.redirected) {
        // 从重定向URL中提取token和用户信息
        const url = new URL(response.url)
        const callbackToken = url.searchParams.get('token')
        const callbackUser = url.searchParams.get('user')
        
        if (callbackToken && callbackUser) {
          await handleAuthCallback(callbackToken, callbackUser)
        } else {
          throw new Error('回调参数缺失')
        }
      } else {
        // 处理JSON响应
        const data = await response.json()
        if (data.token && data.user) {
          token.value = data.token
          user.value = data.user
          
          // 保存到本地存储
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('auth_user', JSON.stringify(data.user))
        } else {
          throw new Error('认证数据无效')
        }
      }

      return { success: true }
    } catch (err) {
      console.error('GitHub callback error:', err)
      error.value = err instanceof Error ? err.message : '认证回调失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 启动GitHub OAuth登录流程
   */
  async function loginWithGitHub() {
    try {
      loading.value = true
      error.value = null

      // 重定向到GitHub OAuth API
      window.location.href = '/api/auth/github'
    } catch (err) {
      console.error('GitHub login error:', err)
      error.value = 'GitHub登录失败'
      loading.value = false
    }
  }

  /**
   * GitHub登录方法别名
   * 兼容Login.vue中的方法调用
   */
  async function githubLogin() {
    return await loginWithGitHub()
  }

  /**
   * 登出
   */
  async function logout() {
    try {
      loading.value = true
      
      // 清除状态
      user.value = null
      token.value = null
      error.value = null

      // 清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      return { success: true }
    } catch (err) {
      console.error('Logout error:', err)
      error.value = '登出失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  function updateUser(userData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
      // 更新本地存储
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
  }

  /**
   * 清除错误状态
   */
  function clearError() {
    error.value = null
  }

  /**
   * 获取认证头
   */
  function getAuthHeader() {
    return token.value ? `Bearer ${token.value}` : null
  }

  return {
    // 状态
    user,
    token,
    loading,
    error,
    
    // 计算属性
    isAuthenticated,
    userDisplayName,
    userAvatar,
    
    // 方法
    initAuth,
    verifyToken,
    handleAuthCallback,
    handleCallback,
    loginWithGitHub,
    githubLogin,
    logout,
    updateUser,
    clearError,
    getAuthHeader
  }
})
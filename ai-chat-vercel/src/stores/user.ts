import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserSettings } from '@/types/user'
import { userApi } from '@/utils/api'
import { useAuthStore } from './auth'

/**
 * 用户状态管理
 * 处理用户资料、设置和统计信息
 */
export const useUserStore = defineStore('user', () => {
  // 状态
  const profile = ref<User | null>(null)
  const settings = ref<UserSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const hasProfile = computed(() => !!profile.value)
  const displayName = computed(() => profile.value?.displayName || profile.value?.username || '')
  const avatarUrl = computed(() => profile.value?.avatarUrl || '')
  const userStats = computed(() => profile.value?.stats || null)

  /**
   * 获取用户资料
   */
  async function fetchProfile() {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      const response = await userApi.getProfile(authHeader)
      profile.value = response.user
      
      // 同步到auth store
      authStore.updateUser(response.user)

      return response
    } catch (err) {
      console.error('Fetch profile error:', err)
      error.value = '获取用户资料失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新用户资料
   */
  async function updateProfile(updates: Partial<User>) {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      const response = await userApi.updateProfile(authHeader, updates)
      profile.value = response.user
      
      // 同步到auth store
      authStore.updateUser(response.user)

      return response
    } catch (err) {
      console.error('Update profile error:', err)
      error.value = '更新用户资料失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取用户设置
   */
  async function fetchSettings() {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      const response = await userApi.getSettings(authHeader)
      settings.value = response.settings

      return response
    } catch (err) {
      console.error('Fetch settings error:', err)
      error.value = '获取用户设置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新用户设置
   */
  async function updateSettings(updates: Partial<UserSettings>) {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      const response = await userApi.updateSettings(authHeader, updates)
      settings.value = response.settings

      return response
    } catch (err) {
      console.error('Update settings error:', err)
      error.value = '更新用户设置失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取主题设置
   */
  const theme = computed(() => settings.value?.theme || 'auto')

  /**
   * 获取语言设置
   */
  const language = computed(() => settings.value?.language || 'zh-CN')

  /**
   * 获取聊天设置
   */
  const chatSettings = computed(() => settings.value?.chatSettings || {
    model: 'glm-4.6',
    temperature: 0.7,
    maxTokens: 2000,
    streamResponse: true,
    showTimestamp: true,
    showTokenUsage: false
  })

  /**
   * 应用主题设置
   */
  function applyTheme(newTheme: 'light' | 'dark' | 'auto') {
    const root = document.documentElement
    
    if (newTheme === 'auto') {
      // 根据系统偏好设置主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', newTheme === 'dark')
    }
  }

  /**
   * 监听系统主题变化
   */
  function watchSystemTheme() {
    if (theme.value === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (theme.value === 'auto') {
          document.documentElement.classList.toggle('dark', e.matches)
        }
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      // 返回清理函数
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }

  /**
   * 初始化用户数据
   */
  async function initUserData() {
    try {
      await Promise.all([
        fetchProfile(),
        fetchSettings()
      ])
      
      // 应用主题设置
      applyTheme(theme.value)
      
      // 监听系统主题变化
      watchSystemTheme()
      
    } catch (err) {
      console.error('Init user data error:', err)
      // 不抛出错误，允许应用继续运行
    }
  }

  /**
   * 清除错误状态
   */
  function clearError() {
    error.value = null
  }

  /**
   * 重置用户状态
   */
  function resetUserState() {
    profile.value = null
    settings.value = null
    loading.value = false
    error.value = null
  }

  return {
    // 状态
    profile,
    settings,
    loading,
    error,
    
    // 计算属性
    hasProfile,
    displayName,
    avatarUrl,
    userStats,
    theme,
    language,
    chatSettings,
    
    // 方法
    fetchProfile,
    updateProfile,
    fetchSettings,
    updateSettings,
    applyTheme,
    watchSystemTheme,
    initUserData,
    clearError,
    resetUserState
  }
})
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

/**
 * 主题状态管理
 * 处理应用主题切换和持久化
 */

export type Theme = 'light' | 'dark' | 'auto'

export const useThemeStore = defineStore('theme', () => {
  // 状态
  const theme = ref<Theme>('auto')
  const systemTheme = ref<'light' | 'dark'>('light')

  // 计算属性
  const currentTheme = computed(() => {
    if (theme.value === 'auto') {
      return systemTheme.value
    }
    return theme.value
  })

  const isDark = computed(() => currentTheme.value === 'dark')

  /**
   * 初始化主题
   */
  function initTheme() {
    // 从localStorage获取保存的主题设置
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      theme.value = savedTheme
    }

    // 检测系统主题
    updateSystemTheme()

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateSystemTheme)

    // 应用主题
    applyTheme()
  }

  /**
   * 更新系统主题检测
   */
  function updateSystemTheme() {
    systemTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  /**
   * 设置主题
   */
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    applyTheme()
  }

  /**
   * 应用主题到DOM
   */
  function applyTheme() {
    const root = document.documentElement
    
    if (currentTheme.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 更新meta标签的theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme.value === 'dark' ? '#1f2937' : '#ffffff')
    }
  }

  /**
   * 切换主题
   */
  function toggleTheme() {
    const themes: Theme[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  /**
   * 获取主题图标
   */
  function getThemeIcon() {
    switch (theme.value) {
      case 'light':
        return 'sun'
      case 'dark':
        return 'moon'
      case 'auto':
        return 'monitor'
      default:
        return 'monitor'
    }
  }

  /**
   * 获取主题显示名称
   */
  function getThemeLabel() {
    switch (theme.value) {
      case 'light':
        return '浅色模式'
      case 'dark':
        return '深色模式'
      case 'auto':
        return '跟随系统'
      default:
        return '跟随系统'
    }
  }

  // 监听主题变化，自动应用
  watch([theme, systemTheme], () => {
    applyTheme()
  })

  return {
    // 状态
    theme,
    systemTheme,
    
    // 计算属性
    currentTheme,
    isDark,
    
    // 方法
    initTheme,
    setTheme,
    toggleTheme,
    getThemeIcon,
    getThemeLabel
  }
})
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header />
    
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="space-y-8">
        <!-- 页面标题 -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            设置
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            管理您的应用偏好和配置
          </p>
        </div>

        <!-- AI模型设置 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <CpuChipIcon class="w-6 h-6 mr-2" />
              AI模型配置
            </h2>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- 默认模型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                默认AI模型
              </label>
              <select
                v-model="settings.defaultModel"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                @change="handleSettingChange"
              >
                <option v-for="model in availableModels" :key="model.id" :value="model.id">
                  {{ model.name }} - {{ model.description }}
                </option>
              </select>
            </div>

            <!-- 创意度设置 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                创意度 (Temperature): {{ settings.temperature }}
              </label>
              <input
                v-model.number="settings.temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                @input="handleSettingChange"
              />
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>保守 (0)</span>
                <span>平衡 (1)</span>
                <span>创意 (2)</span>
              </div>
            </div>

            <!-- 最大回复长度 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最大回复长度: {{ settings.maxTokens }} tokens
              </label>
              <input
                v-model.number="settings.maxTokens"
                type="range"
                min="100"
                max="4000"
                step="100"
                class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                @input="handleSettingChange"
              />
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>简短 (100)</span>
                <span>中等 (2000)</span>
                <span>详细 (4000)</span>
              </div>
            </div>

            <!-- 流式响应 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  流式响应
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  实时显示AI回复内容
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.streamResponse"
                  type="checkbox"
                  class="sr-only peer"
                  @change="handleSettingChange"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- 界面偏好 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <PaintBrushIcon class="w-6 h-6 mr-2" />
              界面偏好
            </h2>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- 主题设置 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                主题模式
              </label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="theme in themeOptions"
                  :key="theme.value"
                  type="button"
                  class="flex flex-col items-center p-4 border-2 rounded-lg transition-colors duration-200"
                  :class="currentTheme === theme.value 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
                  @click="handleThemeChange(theme.value)"
                >
                  <component :is="theme.icon" class="w-8 h-8 mb-2" />
                  <span class="text-sm font-medium">{{ theme.label }}</span>
                </button>
              </div>
            </div>

            <!-- 语言设置 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                界面语言
              </label>
              <select
                v-model="settings.language"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                @change="handleSettingChange"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
                <option value="ko-KR">한국어</option>
              </select>
            </div>

            <!-- 字体大小 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                字体大小
              </label>
              <select
                v-model="settings.fontSize"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                @change="handleSettingChange"
              >
                <option value="small">小 (14px)</option>
                <option value="medium">中 (16px)</option>
                <option value="large">大 (18px)</option>
                <option value="extra-large">特大 (20px)</option>
              </select>
            </div>

            <!-- 紧凑模式 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  紧凑模式
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  减少界面元素间距，显示更多内容
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.compactMode"
                  type="checkbox"
                  class="sr-only peer"
                  @change="handleSettingChange"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- 聊天设置 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ChatBubbleLeftRightIcon class="w-6 h-6 mr-2" />
              聊天设置
            </h2>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- 显示时间戳 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  显示时间戳
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  在消息旁显示发送时间
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.showTimestamp"
                  type="checkbox"
                  class="sr-only peer"
                  @change="handleSettingChange"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- 显示Token使用量 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  显示Token使用量
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  显示每条消息的Token消耗
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.showTokenUsage"
                  type="checkbox"
                  class="sr-only peer"
                  @change="handleSettingChange"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- 自动保存对话 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  自动保存对话
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  自动保存聊天记录到云端
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.autoSave"
                  type="checkbox"
                  class="sr-only peer"
                  @change="handleSettingChange"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- 快捷键 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                发送消息快捷键
              </label>
              <select
                v-model="settings.sendShortcut"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                @change="handleSettingChange"
              >
                <option value="enter">Enter</option>
                <option value="ctrl-enter">Ctrl + Enter</option>
                <option value="shift-enter">Shift + Enter</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BellIcon class="w-6 h-6 mr-2" />
              通知设置
            </h2>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- 桌面通知 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  桌面通知
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  接收系统桌面通知
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.desktopNotifications"
                  type="checkbox"
                  class="sr-only peer"
                  @change="handleNotificationChange"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <!-- 声音提醒 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  声音提醒
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  新消息时播放提示音
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="settings.soundNotifications"
                  type="checkbox"
                  class="sr-only peer"
                  @change="handleSettingChange"
                />
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <DocumentArrowDownIcon class="w-6 h-6 mr-2" />
              数据管理
            </h2>
          </div>
          
          <div class="p-6 space-y-6">
            <!-- 导出数据 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  导出聊天记录
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  下载所有对话数据为JSON格式
                </p>
              </div>
              <button
                type="button"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
                @click="handleExportData"
                :disabled="exporting"
              >
                <span v-if="exporting">导出中...</span>
                <span v-else>导出数据</span>
              </button>
            </div>

            <!-- 清除缓存 -->
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  清除本地缓存
                </h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  清除浏览器中的临时数据
                </p>
              </div>
              <button
                type="button"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                @click="handleClearCache"
              >
                清除缓存
              </button>
            </div>
          </div>
        </div>

        <!-- 保存按钮 -->
        <div class="flex justify-end">
          <button
            type="button"
            class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleSaveSettings"
            :disabled="saving"
          >
            <span v-if="saving">保存中...</span>
            <span v-else>保存设置</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import {
  CpuChipIcon,
  PaintBrushIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  DocumentArrowDownIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useNotificationStore } from '@/stores/notification'
import { AI_MODELS } from '@/utils/constants'
import Header from '@/components/layout/Header.vue'

/**
 * 设置页面组件
 * 管理用户的各种偏好设置
 */

const authStore = useAuthStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()

const { user } = storeToRefs(authStore)
const { theme: currentTheme } = storeToRefs(themeStore)
const { updateUser } = authStore
const { setTheme } = themeStore
const { showSuccess, showError } = notificationStore

// 组件状态
const saving = ref(false)
const exporting = ref(false)

// 设置数据
const settings = ref({
  // AI模型设置
  defaultModel: 'glm-4.6',
  temperature: 0.7,
  maxTokens: 2000,
  streamResponse: true,
  
  // 界面偏好
  language: 'zh-CN',
  fontSize: 'medium',
  compactMode: false,
  
  // 聊天设置
  showTimestamp: true,
  showTokenUsage: false,
  autoSave: true,
  sendShortcut: 'enter',
  
  // 通知设置
  desktopNotifications: false,
  soundNotifications: true
})

// 可用模型列表
const availableModels = AI_MODELS

// 主题选项
const themeOptions = [
  { value: 'light', label: '浅色', icon: SunIcon },
  { value: 'dark', label: '深色', icon: MoonIcon },
  { value: 'auto', label: '自动', icon: ComputerDesktopIcon }
]

/**
 * 处理设置变更
 */
function handleSettingChange() {
  // 实时保存设置到本地存储
  localStorage.setItem('app-settings', JSON.stringify(settings.value))
}

/**
 * 处理主题变更
 */
function handleThemeChange(theme: string) {
  setTheme(theme as 'light' | 'dark' | 'auto')
  showSuccess(`已切换到${themeOptions.find(t => t.value === theme)?.label}主题`)
}

/**
 * 处理通知设置变更
 */
async function handleNotificationChange() {
  if (settings.value.desktopNotifications) {
    // 请求通知权限
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        settings.value.desktopNotifications = false
        showError('通知权限被拒绝')
        return
      }
    }
  }
  handleSettingChange()
}

/**
 * 保存设置到服务器
 */
async function handleSaveSettings() {
  if (!user.value) return

  saving.value = true
  try {
    await updateUser({
      settings: {
        ...user.value.settings,
        ...settings.value
      }
    })
    
    showSuccess('设置已保存')
  } catch (error) {
    console.error('保存设置失败:', error)
    showError('保存设置失败，请重试')
  } finally {
    saving.value = false
  }
}

/**
 * 导出数据
 */
async function handleExportData() {
  exporting.value = true
  try {
    // 这里应该调用API获取用户数据
    const data = {
      user: user.value,
      settings: settings.value,
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deeptalk-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showSuccess('数据导出成功')
  } catch (error) {
    console.error('导出数据失败:', error)
    showError('导出数据失败，请重试')
  } finally {
    exporting.value = false
  }
}

/**
 * 清除缓存
 */
function handleClearCache() {
  try {
    // 清除localStorage中的缓存数据（保留重要设置）
    const importantKeys = ['app-settings', 'auth-token', 'theme']
    const allKeys = Object.keys(localStorage)
    
    allKeys.forEach(key => {
      if (!importantKeys.includes(key)) {
        localStorage.removeItem(key)
      }
    })
    
    // 清除sessionStorage
    sessionStorage.clear()
    
    showSuccess('缓存已清除')
  } catch (error) {
    console.error('清除缓存失败:', error)
    showError('清除缓存失败')
  }
}

/**
 * 初始化设置
 */
function initializeSettings() {
  // 从本地存储加载设置
  const savedSettings = localStorage.getItem('app-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      Object.assign(settings.value, parsed)
    } catch (error) {
      console.error('解析保存的设置失败:', error)
    }
  }
  
  // 从用户数据加载设置
  if (user.value?.settings) {
    Object.assign(settings.value, user.value.settings)
  }
}

/**
 * 监听设置变化，自动保存到本地
 */
watch(settings, () => {
  handleSettingChange()
}, { deep: true })

/**
 * 组件挂载
 */
onMounted(() => {
  initializeSettings()
})
</script>

<style scoped>
/* 滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark .slider::-webkit-slider-thumb {
  background: #60a5fa;
}

.dark .slider::-moz-range-thumb {
  background: #60a5fa;
}
</style>
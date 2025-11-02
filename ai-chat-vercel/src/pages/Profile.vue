<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- 头部导航 -->
    <Header />

    <!-- 主要内容 -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          个人资料
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          管理您的账户信息和偏好设置
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧：用户信息卡片 -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <!-- 用户头像和基本信息 -->
            <div class="text-center">
              <div class="relative inline-block">
                <img
                  :src="user?.avatar || '/default-avatar.png'"
                  :alt="displayName"
                  class="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
                />
                <div class="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-700 rounded-full" />
              </div>
              
              <h2 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {{ displayName }}
              </h2>
              
              <p class="text-gray-600 dark:text-gray-400">
                {{ user?.email }}
              </p>
              
              <div class="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <CalendarIcon class="w-4 h-4" />
                <span>加入于 {{ formatDate(user?.createdAt) }}</span>
              </div>
            </div>

            <!-- GitHub 信息 -->
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  GitHub 账户
                </span>
                <a
                  :href="`https://github.com/${user?.username}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
              
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                @{{ user?.username }}
              </p>
            </div>
          </div>

          <!-- 统计信息 -->
          <div class="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              使用统计
            </h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <ChatBubbleLeftRightIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">对话数量</span>
                </div>
                <span class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ userStats.conversationCount }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <PaperAirplaneIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">消息数量</span>
                </div>
                <span class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ userStats.messageCount }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <CpuChipIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Token使用</span>
                </div>
                <span class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ formatNumber(userStats.totalTokens) }}
                </span>
              </div>
              
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <ClockIcon class="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">最后活跃</span>
                </div>
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  {{ formatRelativeTime(userStats.lastActiveAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：详细信息和设置 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 账户信息 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                账户信息
              </h3>
            </div>
            
            <div class="p-6 space-y-6">
              <!-- 用户名 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  用户名
                </label>
                <div class="flex items-center space-x-3">
                  <input
                    v-model="profileForm.username"
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    :disabled="!editMode"
                  />
                  <button
                    v-if="!editMode"
                    type="button"
                    class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    @click="editMode = true"
                  >
                    <PencilIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- 邮箱 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  邮箱地址
                </label>
                <input
                  :value="user?.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  disabled
                />
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  邮箱地址来自您的GitHub账户，无法修改
                </p>
              </div>

              <!-- 个人简介 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  个人简介
                </label>
                <textarea
                  v-model="profileForm.bio"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  :disabled="!editMode"
                  placeholder="介绍一下自己..."
                />
              </div>

              <!-- 操作按钮 -->
              <div v-if="editMode" class="flex items-center space-x-3">
                <button
                  type="button"
                  class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
                  :disabled="saving"
                  @click="handleSaveProfile"
                >
                  <span v-if="saving">保存中...</span>
                  <span v-else>保存更改</span>
                </button>
                
                <button
                  type="button"
                  class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
                  @click="handleCancelEdit"
                >
                  取消
                </button>
              </div>
            </div>
          </div>

          <!-- 偏好设置 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                偏好设置
              </h3>
            </div>
            
            <div class="p-6 space-y-6">
              <!-- 主题设置 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  主题偏好
                </label>
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="theme in themeOptions"
                    :key="theme.value"
                    type="button"
                    class="flex flex-col items-center p-3 border-2 rounded-lg transition-colors duration-200"
                    :class="currentTheme === theme.value 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
                    @click="handleThemeChange(theme.value)"
                  >
                    <component :is="theme.icon" class="w-6 h-6 mb-2" />
                    <span class="text-sm font-medium">{{ theme.label }}</span>
                  </button>
                </div>
              </div>

              <!-- 语言设置 */
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  界面语言
                </label>
                <select
                  v-model="profileForm.language"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>

              <!-- 字体大小 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  字体大小
                </label>
                <select
                  v-model="profileForm.fontSize"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="small">小</option>
                  <option value="medium">中</option>
                  <option value="large">大</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 危险操作 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800">
            <div class="px-6 py-4 border-b border-red-200 dark:border-red-800">
              <h3 class="text-lg font-semibold text-red-600 dark:text-red-400">
                危险操作
              </h3>
            </div>
            
            <div class="p-6">
              <div class="flex items-start space-x-4">
                <ExclamationTriangleIcon class="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    删除账户
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    删除您的账户将永久移除所有数据，包括对话历史、设置等。此操作不可撤销。
                  </p>
                  <button
                    type="button"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                    @click="showDeleteConfirm = true"
                  >
                    删除账户
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 删除确认模态框 -->
    <Modal
      v-model:show="showDeleteConfirm"
      title="确认删除账户"
      size="sm"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <ExclamationTriangleIcon class="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              您确定要删除账户吗？此操作将：
            </p>
            <ul class="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>永久删除所有对话历史</li>
              <li>清除所有个人设置</li>
              <li>注销GitHub授权</li>
              <li>无法恢复任何数据</li>
            </ul>
          </div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p class="text-sm text-red-700 dark:text-red-400 font-medium">
            请输入 "DELETE" 来确认删除操作：
          </p>
          <input
            v-model="deleteConfirmText"
            type="text"
            class="mt-2 w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="输入 DELETE"
          />
        </div>
      </div>
      
      <template #footer>
        <div class="flex items-center justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
            @click="showDeleteConfirm = false"
          >
            取消
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="deleteConfirmText !== 'DELETE' || deleting"
            @click="handleDeleteAccount"
          >
            <span v-if="deleting">删除中...</span>
            <span v-else>确认删除</span>
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CpuChipIcon,
  ClockIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useNotificationStore } from '@/stores/notification'
import { formatDate, formatNumber, formatRelativeTime } from '@/utils/helpers'
import Header from '@/components/layout/Header.vue'
import Modal from '@/components/common/Modal.vue'
import type { UserStats } from '@/types/user'

/**
 * 个人资料页面组件
 * 显示和编辑用户信息、偏好设置等
 */

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()

const { user, displayName } = storeToRefs(authStore)
const { theme: currentTheme } = storeToRefs(themeStore)
const { updateUser, deleteAccount } = authStore
const { setTheme } = themeStore
const { showSuccess, showError } = notificationStore

// 组件状态
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')

// 表单数据
const profileForm = ref({
  username: '',
  bio: '',
  language: 'zh-CN',
  fontSize: 'medium'
})

// 用户统计数据
const userStats = ref<UserStats>({
  conversationCount: 0,
  messageCount: 0,
  totalTokens: 0,
  lastActiveAt: new Date().toISOString()
})

// 主题选项
const themeOptions = [
  { value: 'light', label: '浅色', icon: SunIcon },
  { value: 'dark', label: '深色', icon: MoonIcon },
  { value: 'auto', label: '自动', icon: ComputerDesktopIcon }
]

/**
 * 处理保存个人资料
 */
async function handleSaveProfile() {
  if (!user.value) return

  saving.value = true
  try {
    await updateUser({
      username: profileForm.value.username,
      bio: profileForm.value.bio,
      settings: {
        ...user.value.settings,
        language: profileForm.value.language,
        fontSize: profileForm.value.fontSize
      }
    })
    
    editMode.value = false
    showSuccess('个人资料已更新')
  } catch (error) {
    console.error('更新个人资料失败:', error)
    showError('更新个人资料失败，请重试')
  } finally {
    saving.value = false
  }
}

/**
 * 处理取消编辑
 */
function handleCancelEdit() {
  editMode.value = false
  // 重置表单数据
  if (user.value) {
    profileForm.value.username = user.value.username
    profileForm.value.bio = user.value.bio || ''
    profileForm.value.language = user.value.settings?.language || 'zh-CN'
    profileForm.value.fontSize = user.value.settings?.fontSize || 'medium'
  }
}

/**
 * 处理主题变更
 */
function handleThemeChange(theme: string) {
  setTheme(theme as 'light' | 'dark' | 'auto')
  showSuccess(`已切换到${themeOptions.find(t => t.value === theme)?.label}主题`)
}

/**
 * 处理删除账户
 */
async function handleDeleteAccount() {
  if (deleteConfirmText.value !== 'DELETE') return

  deleting.value = true
  try {
    await deleteAccount()
    showSuccess('账户已删除')
    router.push('/')
  } catch (error) {
    console.error('删除账户失败:', error)
    showError('删除账户失败，请重试')
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
    deleteConfirmText.value = ''
  }
}

/**
 * 加载用户统计数据
 */
async function loadUserStats() {
  try {
    // 这里应该调用API获取用户统计数据
    // const stats = await userApi.getStats()
    // userStats.value = stats
    
    // 模拟数据
    userStats.value = {
      conversationCount: 12,
      messageCount: 156,
      totalTokens: 45230,
      lastActiveAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('加载用户统计失败:', error)
  }
}

/**
 * 初始化表单数据
 */
function initializeForm() {
  if (user.value) {
    profileForm.value.username = user.value.username
    profileForm.value.bio = user.value.bio || ''
    profileForm.value.language = user.value.settings?.language || 'zh-CN'
    profileForm.value.fontSize = user.value.settings?.fontSize || 'medium'
  }
}

/**
 * 组件挂载
 */
onMounted(() => {
  initializeForm()
  loadUserStats()
})
</script>

<style scoped>
/* 确保头像边框在深色模式下正确显示 */
.dark .border-white {
  border-color: rgb(55 65 81);
}
</style>
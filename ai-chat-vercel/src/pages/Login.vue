<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6 sm:space-y-8">
      <!-- 头部 -->
      <div class="text-center">
        <RouterLink
          to="/"
          class="inline-flex items-center space-x-2 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200"
        >
          <ChatBubbleLeftRightIcon class="h-10 w-10" />
          <span>DeepTalk</span>
        </RouterLink>
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          欢迎回来
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          使用GitHub账号登录，开始您的AI对话之旅
        </p>
      </div>

      <!-- 登录卡片 -->
      <div class="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-6">
        <!-- GitHub登录按钮 -->
        <button
          type="button"
          class="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          :disabled="authStore.loading"
          @click="handleGitHubLogin"
        >
          <div class="flex items-center space-x-3">
            <!-- GitHub图标 -->
            <svg
              class="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
            
            <!-- 加载状态 -->
            <LoadingSpinner
              v-if="authStore.loading"
              size="small"
              class="text-white"
            />
            
            <!-- 按钮文本 -->
            <span v-if="!authStore.loading">
              使用 GitHub 登录
            </span>
            <span v-else>
              正在登录...
            </span>
          </div>
        </button>

        <!-- 错误信息 -->
        <div
          v-if="authStore.error"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div class="flex items-center">
            <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2" />
            <p class="text-sm text-red-800 dark:text-red-400">
              {{ authStore.error }}
            </p>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              为什么选择GitHub登录？
            </span>
          </div>
        </div>

        <!-- 优势说明 -->
        <div class="space-y-4">
          <div class="flex items-start space-x-3">
            <ShieldCheckIcon class="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                安全可靠
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                使用OAuth2.0标准，无需存储您的密码
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <BoltIcon class="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                快速便捷
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                一键登录，无需注册新账号
              </p>
            </div>
          </div>
          
          <div class="flex items-start space-x-3">
            <UserIcon class="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                个性化体验
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400">
                自动获取您的头像和用户名
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部链接 -->
      <div class="text-center space-y-2">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          还没有GitHub账号？
          <a
            href="https://github.com/join"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
          >
            立即注册
          </a>
        </p>
        
        <p class="text-xs text-gray-500 dark:text-gray-500">
          登录即表示您同意我们的
          <RouterLink
            to="/terms"
            class="text-primary-600 hover:text-primary-500 transition-colors duration-200"
          >
            服务条款
          </RouterLink>
          和
          <RouterLink
            to="/privacy"
            class="text-primary-600 hover:text-primary-500 transition-colors duration-200"
          >
            隐私政策
          </RouterLink>
        </p>
      </div>

      <!-- 返回首页 -->
      <div class="text-center">
        <RouterLink
          to="/"
          class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeftIcon class="h-4 w-4 mr-1" />
          返回首页
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BoltIcon,
  UserIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

/**
 * 登录页面组件
 * 提供GitHub OAuth登录功能
 */

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const { isAuthenticated } = storeToRefs(authStore)
const { githubLogin, clearError } = authStore
const { showError } = notificationStore

/**
 * 处理GitHub登录
 */
async function handleGitHubLogin() {
  try {
    clearError()
    await githubLogin()
  } catch (error) {
    console.error('GitHub登录失败:', error)
    showError('登录失败，请重试')
  }
}

/**
 * 检查登录状态
 */
onMounted(() => {
  // 如果已经登录，重定向到聊天页面
  if (isAuthenticated.value) {
    router.push('/chat')
  }
  
  // 清除之前的错误
  clearError()
})
</script>

<style scoped>
/* 渐变动画 */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-br {
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

/* 按钮悬停效果 */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* 卡片阴影动画 */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* 深色模式下的卡片阴影 */
.dark .shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
</style>
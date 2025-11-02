<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
    <div class="max-w-md w-full text-center space-y-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full">
          <ChatBubbleLeftRightIcon class="w-10 h-10 text-primary-600 dark:text-primary-400" />
        </div>
        
        <div class="space-y-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            正在处理登录...
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            请稍候，我们正在验证您的身份
          </p>
          
          <LoadingSpinner size="large" />
          
          <div class="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 0ms" />
            <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 150ms" />
            <div class="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>
      </div>

      <!-- 成功状态 -->
      <div v-else-if="success" class="space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full">
          <CheckCircleIcon class="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        
        <div class="space-y-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            登录成功！
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            欢迎回来，{{ user?.name || user?.login }}
          </p>
          
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p class="text-sm text-green-800 dark:text-green-400">
              正在跳转到聊天页面...
            </p>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full">
          <XCircleIcon class="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        
        <div class="space-y-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            登录失败
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            很抱歉，登录过程中出现了问题
          </p>
          
          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex items-center">
              <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
              <p class="text-sm text-red-800 dark:text-red-400">
                {{ errorMessage }}
              </p>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
              @click="retryLogin"
            >
              <ArrowPathIcon class="w-4 h-4 mr-2" />
              重试登录
            </button>
            
            <RouterLink
              to="/"
              class="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <HomeIcon class="w-4 h-4 mr-2" />
              返回首页
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>如果页面长时间未响应，请尝试刷新页面</p>
        <p>或联系技术支持获取帮助</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

/**
 * 认证回调页面组件
 * 处理GitHub OAuth回调并完成登录流程
 */

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const { user } = storeToRefs(authStore)
const { handleCallback, handleAuthCallback } = authStore
const { showSuccess, showError } = notificationStore

// 组件状态
const loading = ref(true)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')

/**
 * 处理认证回调
 */
async function processCallback() {
  try {
    loading.value = true
    error.value = false
    
    // 获取URL参数
    const token = route.query.token as string
    const userParam = route.query.user as string
    const code = route.query.code as string
    const state = route.query.state as string
    const errorParam = route.query.error as string
    
    // 检查是否有错误参数
    if (errorParam) {
      throw new Error(getErrorMessage(errorParam))
    }
    
    // 优先处理直接token回调（新的OAuth流程）
    if (token && userParam) {
      try {
        // 解析用户信息（URL编码的JSON字符串）
        const userInfo = JSON.parse(decodeURIComponent(userParam))
        
        // 使用auth store的handleAuthCallback方法
        await authStore.handleAuthCallback(token, userParam)
        
        // 登录成功
        success.value = true
        showSuccess('登录成功！')
        
        // 延迟跳转到聊天页面
        setTimeout(() => {
          const redirect = route.query.redirect as string
          router.push(redirect || '/chat')
        }, 2000)
        
        return
      } catch (parseError) {
        console.error('解析用户信息失败:', parseError)
        throw new Error('用户信息格式错误')
      }
    }
    
    // 处理传统的code回调（兼容旧流程）
    if (code) {
      // 处理回调
      await handleCallback(code, state)
      
      // 登录成功
      success.value = true
      showSuccess('登录成功！')
      
      // 延迟跳转到聊天页面
      setTimeout(() => {
        const redirect = route.query.redirect as string
        router.push(redirect || '/chat')
      }, 2000)
      
      return
    }
    
    // 如果既没有token也没有code，抛出错误
    throw new Error('缺少授权码或令牌，请重新登录')
    
  } catch (err) {
    console.error('认证回调处理失败:', err)
    
    error.value = true
    errorMessage.value = err instanceof Error ? err.message : '未知错误'
    showError('登录失败：' + errorMessage.value)
  } finally {
    loading.value = false
  }
}

/**
 * 获取错误信息
 */
function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'access_denied': '用户拒绝了授权请求',
    'invalid_request': '请求参数无效',
    'unauthorized_client': '客户端未授权',
    'unsupported_response_type': '不支持的响应类型',
    'invalid_scope': '请求的权限范围无效',
    'server_error': '服务器内部错误',
    'temporarily_unavailable': '服务暂时不可用'
  }
  
  return errorMessages[errorCode] || `认证错误：${errorCode}`
}

/**
 * 重试登录
 */
function retryLogin() {
  router.push('/login')
}

/**
 * 组件挂载时处理回调
 */
onMounted(() => {
  // 检查是否已经登录
  if (authStore.isAuthenticated) {
    success.value = true
    loading.value = false
    
    setTimeout(() => {
      const redirect = route.query.redirect as string
      router.push(redirect || '/chat')
    }, 1000)
    
    return
  }
  
  // 处理认证回调
  processCallback()
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

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
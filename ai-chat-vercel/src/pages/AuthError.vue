<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- 错误卡片 -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <!-- 错误图标 -->
        <div class="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon class="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        <!-- 错误标题 -->
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          登录失败
        </h1>

        <!-- 错误描述 -->
        <div class="space-y-4 mb-8">
          <p class="text-gray-600 dark:text-gray-400">
            {{ errorMessage }}
          </p>
          
          <div v-if="errorDetails" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p class="text-sm text-red-700 dark:text-red-400 font-mono">
              {{ errorDetails }}
            </p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="space-y-3">
          <!-- 重试登录 -->
          <button
            type="button"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            @click="handleRetryLogin"
          >
            <ArrowPathIcon class="w-5 h-5" />
            <span>重试登录</span>
          </button>

          <!-- 返回首页 -->
          <RouterLink
            to="/"
            class="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <HomeIcon class="w-5 h-5" />
            <span>返回首页</span>
          </RouterLink>
        </div>

        <!-- 帮助信息 -->
        <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
            如果问题持续存在，请尝试以下解决方案：
          </p>
          
          <div class="text-left space-y-2">
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                检查网络连接是否正常
              </p>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                清除浏览器缓存和Cookie
              </p>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                确保GitHub账户状态正常
              </p>
            </div>
            
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                尝试使用其他浏览器或无痕模式
              </p>
            </div>
          </div>
        </div>

        <!-- 联系支持 -->
        <div class="mt-6">
          <p class="text-xs text-gray-400 dark:text-gray-500">
            仍有问题？
            <a
              href="mailto:support@deeptalk.ai"
              class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              联系技术支持
            </a>
          </p>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          © 2024 DeepTalk. 保留所有权利。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

/**
 * 认证错误页面组件
 * 显示登录失败的错误信息和处理选项
 */

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('登录过程中发生了未知错误，请重试。')
const errorDetails = ref('')

/**
 * 处理重试登录
 */
function handleRetryLogin() {
  router.push('/login')
}

/**
 * 解析错误信息
 */
function parseError() {
  const error = route.query.error as string
  const errorDescription = route.query.error_description as string
  const state = route.query.state as string

  // 根据错误类型设置相应的错误消息
  switch (error) {
    case 'access_denied':
      errorMessage.value = '您拒绝了授权请求。要使用DeepTalk，需要授权访问您的GitHub账户信息。'
      break
    
    case 'invalid_request':
      errorMessage.value = '登录请求无效。请重试登录流程。'
      break
    
    case 'unauthorized_client':
      errorMessage.value = '应用程序未获得授权。请联系技术支持。'
      break
    
    case 'unsupported_response_type':
      errorMessage.value = '不支持的响应类型。请联系技术支持。'
      break
    
    case 'invalid_scope':
      errorMessage.value = '请求的权限范围无效。请联系技术支持。'
      break
    
    case 'server_error':
      errorMessage.value = 'GitHub服务器发生错误。请稍后重试。'
      break
    
    case 'temporarily_unavailable':
      errorMessage.value = 'GitHub服务暂时不可用。请稍后重试。'
      break
    
    case 'invalid_client':
      errorMessage.value = '应用程序配置错误。请联系技术支持。'
      break
    
    case 'invalid_grant':
      errorMessage.value = '授权码无效或已过期。请重新登录。'
      break
    
    case 'redirect_uri_mismatch':
      errorMessage.value = '回调地址不匹配。请联系技术支持。'
      break
    
    default:
      if (errorDescription) {
        errorMessage.value = `登录失败：${errorDescription}`
      } else if (error) {
        errorMessage.value = `登录失败：${error}`
      }
      break
  }

  // 设置错误详情
  if (error || errorDescription || state) {
    const details = []
    if (error) details.push(`错误代码: ${error}`)
    if (errorDescription) details.push(`错误描述: ${errorDescription}`)
    if (state) details.push(`状态: ${state}`)
    errorDetails.value = details.join('\n')
  }
}

/**
 * 组件挂载时解析错误信息
 */
onMounted(() => {
  parseError()
  
  // 清除认证状态中的错误
  authStore.clearErrors()
})
</script>

<style scoped>
/* 确保错误详情文本可以正确换行 */
.font-mono {
  white-space: pre-line;
  word-break: break-word;
}
</style>
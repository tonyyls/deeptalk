<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- 头部导航 -->
    <Header />

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 英雄区域 -->
      <div class="text-center mb-16">
        <div class="mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full mb-6">
            <ChatBubbleLeftRightIcon class="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span class="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              DeepTalk
            </span>
          </h1>
          <p class="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            与AI进行深度对话，探索无限可能
          </p>
          <p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            基于最新的GLM-4.6模型，为您提供智能、流畅、个性化的AI对话体验
          </p>
        </div>

        <!-- CTA按钮 -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <RouterLink
            v-if="!isAuthenticated"
            to="/login"
            class="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-medium rounded-xl hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <UserPlusIcon class="w-6 h-6 mr-2" />
            开始使用
          </RouterLink>
          
          <RouterLink
            v-else
            to="/chat"
            class="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-medium rounded-xl hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ChatBubbleLeftRightIcon class="w-6 h-6 mr-2" />
            开始对话
          </RouterLink>

          <a
            href="#features"
            class="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-lg font-medium rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <InformationCircleIcon class="w-6 h-6 mr-2" />
            了解更多
          </a>
        </div>
      </div>

      <!-- 特性展示 -->
      <section id="features" class="mb-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            为什么选择 DeepTalk？
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            我们致力于提供最优质的AI对话体验
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <!-- 特性卡片 -->
          <div
            v-for="feature in features"
            :key="feature.title"
            class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            <div class="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl mb-6">
              <component :is="feature.icon" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {{ feature.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </section>

      <!-- 使用统计 -->
      <section class="mb-16">
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg">
          <div class="text-center mb-6 sm:mb-8">
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              用户信赖的选择
            </h2>
            <p class="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              数据说明一切
            </p>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="text-center"
            >
              <div class="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {{ stat.value }}
              </div>
              <div class="text-gray-600 dark:text-gray-300">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 快速开始 -->
      <section class="text-center">
        <div class="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-white">
          <h2 class="text-3xl sm:text-4xl font-bold mb-4">
            准备好开始了吗？
          </h2>
          <p class="text-xl mb-8 opacity-90">
            只需几秒钟，即可开始您的AI对话之旅
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <RouterLink
              v-if="!isAuthenticated"
              to="/login"
              class="inline-flex items-center px-8 py-4 bg-white text-primary-600 text-lg font-medium rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <ArrowRightIcon class="w-6 h-6 mr-2" />
              立即开始
            </RouterLink>
            
            <RouterLink
              v-else
              to="/chat"
              class="inline-flex items-center px-8 py-4 bg-white text-primary-600 text-lg font-medium rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <ChatBubbleLeftRightIcon class="w-6 h-6 mr-2" />
              进入聊天
            </RouterLink>

            <RouterLink
              to="/about"
              class="inline-flex items-center px-8 py-4 bg-transparent text-white text-lg font-medium rounded-xl border-2 border-white hover:bg-white hover:text-primary-600 transition-all duration-200"
            >
              了解更多
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2024 DeepTalk. 基于 GLM-4.6 构建</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BoltIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CpuChipIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/layout/Header.vue'

/**
 * 首页组件
 * 展示应用介绍、特性和引导用户开始使用
 */

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

// 特性列表
const features = [
  {
    icon: SparklesIcon,
    title: '智能对话',
    description: '基于GLM-4.6模型，提供自然流畅的对话体验，理解上下文，给出精准回答。'
  },
  {
    icon: BoltIcon,
    title: '实时响应',
    description: '支持流式响应，实时显示AI思考过程，让对话更加生动有趣。'
  },
  {
    icon: ShieldCheckIcon,
    title: '安全可靠',
    description: '采用GitHub OAuth认证，保护用户隐私，所有数据传输均经过加密处理。'
  },
  {
    icon: CpuChipIcon,
    title: '多模型支持',
    description: '支持多种AI模型选择，满足不同场景下的对话需求。'
  },
  {
    icon: GlobeAltIcon,
    title: '响应式设计',
    description: '完美适配各种设备，无论是桌面端还是移动端都能获得最佳体验。'
  },
  {
    icon: UserGroupIcon,
    title: '个性化体验',
    description: '支持对话历史管理、个性化设置，打造专属于您的AI助手。'
  }
]

// 使用统计
const stats = [
  { value: '10K+', label: '活跃用户' },
  { value: '100K+', label: '对话次数' },
  { value: '99.9%', label: '可用性' },
  { value: '24/7', label: '在线服务' }
]
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

/* 卡片悬停效果 */
.hover\:-translate-y-2:hover {
  transform: translateY(-8px);
}

/* 按钮悬停效果 */
.hover\:scale-105:hover {
  transform: scale(1.05);
}
</style>
<template>
  <header class="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- 左侧：Logo 和导航 -->
        <div class="flex items-center space-x-8">
          <!-- Logo -->
          <RouterLink
            to="/"
            class="flex items-center space-x-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            <ChatBubbleLeftRightIcon class="h-8 w-8" />
            <span>DeepTalk</span>
          </RouterLink>

          <!-- 桌面端导航 -->
          <nav class="hidden md:flex space-x-6">
            <RouterLink
              to="/"
              class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              active-class="text-primary-600 dark:text-primary-400"
            >
              首页
            </RouterLink>
            <RouterLink
              v-if="isAuthenticated"
              to="/chat"
              class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              active-class="text-primary-600 dark:text-primary-400"
            >
              聊天
            </RouterLink>
            <RouterLink
              to="/about"
              class="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              active-class="text-primary-600 dark:text-primary-400"
            >
              关于
            </RouterLink>
          </nav>
        </div>

        <!-- 右侧：主题切换、用户菜单 -->
        <div class="flex items-center space-x-4">
          <!-- 主题切换按钮 -->
          <button
            type="button"
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md transition-colors duration-200"
            @click="toggleTheme"
            :title="`切换到${themeStore.theme === 'light' ? '深色' : '浅色'}主题`"
          >
            <SunIcon
              v-if="themeStore.isDark"
              class="h-5 w-5"
            />
            <MoonIcon
              v-else
              class="h-5 w-5"
            />
          </button>

          <!-- 用户菜单 -->
          <div
            v-if="isAuthenticated"
            class="relative"
          >
            <!-- 用户头像按钮 -->
            <button
              type="button"
              class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              @click="showUserMenu = !showUserMenu"
            >
              <img
                :src="user?.avatar || '/default-avatar.png'"
                :alt="displayName"
                class="h-8 w-8 rounded-full"
              />
              <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ displayName }}
              </span>
              <ChevronDownIcon class="h-4 w-4 text-gray-500" />
            </button>

            <!-- 下拉菜单 -->
            <Transition
              name="dropdown"
              appear
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                @click="showUserMenu = false"
              >
                <div class="py-1">
                  <RouterLink
                    to="/profile"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <UserIcon class="h-4 w-4 mr-3" />
                    个人资料
                  </RouterLink>
                  <RouterLink
                    to="/settings"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <CogIcon class="h-4 w-4 mr-3" />
                    设置
                  </RouterLink>
                  <hr class="my-1 border-gray-200 dark:border-gray-600" />
                  <button
                    type="button"
                    class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    @click="handleLogout"
                  >
                    <ArrowRightOnRectangleIcon class="h-4 w-4 mr-3" />
                    退出登录
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 登录按钮 -->
          <RouterLink
            v-else
            to="/login"
            class="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            登录
          </RouterLink>

          <!-- 移动端菜单按钮 -->
          <button
            type="button"
            class="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md"
            @click="showMobileMenu = !showMobileMenu"
          >
            <Bars3Icon
              v-if="!showMobileMenu"
              class="h-6 w-6"
            />
            <XMarkIcon
              v-else
              class="h-6 w-6"
            />
          </button>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <Transition
        name="mobile-menu"
        appear
      >
        <div
          v-if="showMobileMenu"
          class="md:hidden border-t border-gray-200 dark:border-gray-700 py-4"
        >
          <nav class="space-y-2">
            <RouterLink
              to="/"
              class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md"
              active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
              @click="showMobileMenu = false"
            >
              首页
            </RouterLink>
            <RouterLink
              v-if="isAuthenticated"
              to="/chat"
              class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md"
              active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
              @click="showMobileMenu = false"
            >
              聊天
            </RouterLink>
            <RouterLink
              to="/about"
              class="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-md"
              active-class="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900"
              @click="showMobileMenu = false"
            >
              关于
            </RouterLink>
          </nav>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  ChatBubbleLeftRightIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useNotificationStore } from '@/stores/notification'

/**
 * 头部导航组件
 * 包含Logo、导航菜单、主题切换、用户菜单等功能
 */

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()

const { isAuthenticated, user, displayName } = storeToRefs(authStore)
const { logout } = authStore
const { toggleTheme } = themeStore
const { showSuccess } = notificationStore

// 响应式状态
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

/**
 * 处理退出登录
 */
async function handleLogout() {
  try {
    await logout()
    showSuccess('已成功退出登录')
    router.push('/')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

/**
 * 点击外部关闭菜单
 */
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showUserMenu.value = false
  }
  if (!target.closest('.md\\:hidden')) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 移动端菜单动画 */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
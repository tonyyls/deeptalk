import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Vue Router配置
 * 定义应用的路由规则和导航守卫
 */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue'),
    meta: { requiresAuth: false, hideForAuth: true }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('@/pages/AuthCallback.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/error',
    name: 'AuthError',
    component: () => import('@/pages/AuthError.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/pages/Chat.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:conversationId',
    name: 'ChatConversation',
    component: () => import('@/pages/Chat.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/Home.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由切换时的滚动行为
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * 全局前置守卫
 * 处理路由权限验证
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 开发模式下允许直接访问所有页面
  const isDevelopment = import.meta.env.DEV && window.location.hostname === 'localhost'
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated && !isDevelopment) {
      // 未认证用户重定向到登录页
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // 已认证用户访问登录页时重定向到聊天页
  if (to.meta.hideForAuth && authStore.isAuthenticated) {
    next({ name: 'Chat' })
    return
  }
  
  // 开发模式下，如果访问根路径，直接跳转到聊天页面
  if (isDevelopment && to.path === '/') {
    next({ name: 'Chat' })
    return
  }
  
  next()
})

/**
 * 全局后置钩子
 * 处理页面标题等
 */
router.afterEach((to) => {
  // 设置页面标题
  const baseTitle = 'AI Chat'
  if (to.meta.title) {
    document.title = `${to.meta.title} - ${baseTitle}`
  } else {
    document.title = baseTitle
  }
})

export default router
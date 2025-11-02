<template>
  <div id="app" class="h-full">
    <!-- 路由视图 -->
    <RouterView />
    
    <!-- 全局通知组件 -->
    <Teleport to="body">
      <NotificationContainer />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import NotificationContainer from '@/components/common/NotificationContainer.vue'

/**
 * 主应用组件
 * 负责应用的整体布局和全局状态初始化
 */

const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(async () => {
  // 初始化主题
  themeStore.initTheme()
  
  // 尝试从本地存储恢复用户会话
  await authStore.initAuth()
})
</script>

<style scoped>
/* 组件特定样式 */
</style>
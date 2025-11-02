<template>
  <!-- 简洁的消息提示容器 -->
  <div
    class="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    aria-live="assertive"
  >
    <div class="w-full px-4 py-1">
      <TransitionGroup
        name="notification-top"
        tag="div"
        class="space-y-1"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="flex justify-center pointer-events-auto"
        >
          <div
            :class="[
              'px-4 py-2 rounded text-sm text-white font-medium max-w-md text-center relative',
              {
                'bg-green-500': notification.type === 'success',
                'bg-red-500': notification.type === 'error',
                'bg-yellow-500': notification.type === 'warning',
                'bg-blue-500': notification.type === 'info'
              }
            ]"
          >
            <!-- 消息内容 -->
            <span v-if="notification.title && notification.message">
              {{ notification.title }}: {{ notification.message }}
            </span>
            <span v-else-if="notification.title">
              {{ notification.title }}
            </span>
            <span v-else-if="notification.message">
              {{ notification.message }}
            </span>

            <!-- 简单的关闭按钮 -->
            <button
              type="button"
              class="absolute -top-1 -right-1 w-5 h-5 bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full flex items-center justify-center text-white text-xs transition-colors"
              @click="handleRemoveNotification(notification.id)"
              aria-label="关闭"
            >
              ×
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notification'
import { watch, onUnmounted, ref } from 'vue'

/**
 * 简洁的消息提示组件
 * 显示简单的toast消息提示，支持自动关闭功能
 */

const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const { removeNotification } = notificationStore

// 存储定时器的Map，用于清理
const timers = ref(new Map<string, NodeJS.Timeout>())

/**
 * 设置自动关闭定时器
 */
function setupAutoClose(notificationId: string, duration: number) {
  // 清除已存在的定时器
  if (timers.value.has(notificationId)) {
    clearTimeout(timers.value.get(notificationId)!)
  }
  
  // 设置新的定时器
  const timer = setTimeout(() => {
    removeNotification(notificationId)
    timers.value.delete(notificationId)
  }, duration)
  
  timers.value.set(notificationId, timer)
}

/**
 * 手动移除通知并清理定时器
 */
function handleRemoveNotification(notificationId: string) {
  // 清除对应的定时器
  if (timers.value.has(notificationId)) {
    clearTimeout(timers.value.get(notificationId)!)
    timers.value.delete(notificationId)
  }
  
  // 移除通知
  removeNotification(notificationId)
}

// 跟踪已处理的通知ID
const processedNotificationIds = ref(new Set<string>())

/**
 * 监听通知变化，为新通知设置自动关闭
 */
watch(
  notifications,
  (newNotifications) => {
    // 为新增的通知设置自动关闭
    newNotifications.forEach(notification => {
      if (!processedNotificationIds.value.has(notification.id)) {
        // 标记为已处理
        processedNotificationIds.value.add(notification.id)
        
        // 只有非持久化通知且有duration才自动关闭
        if (!notification.persistent && notification.duration && notification.duration > 0) {
          setupAutoClose(notification.id, notification.duration)
        }
      }
    })
    
    // 清理已移除通知的定时器和处理记录
    const currentNotificationIds = new Set(newNotifications.map(n => n.id))
    timers.value.forEach((timer, notificationId) => {
      if (!currentNotificationIds.has(notificationId)) {
        clearTimeout(timer)
        timers.value.delete(notificationId)
        processedNotificationIds.value.delete(notificationId)
      }
    })
  },
  { deep: true, immediate: true }
)

/**
 * 组件卸载时清理所有定时器
 */
onUnmounted(() => {
  timers.value.forEach(timer => {
    clearTimeout(timer)
  })
  timers.value.clear()
})
</script>

<style scoped>
/* 简洁的消息提示动画 */
.notification-top-enter-active,
.notification-top-leave-active {
  transition: all 0.3s ease;
}

.notification-top-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-top-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-top-move {
  transition: transform 0.3s ease;
}
</style>
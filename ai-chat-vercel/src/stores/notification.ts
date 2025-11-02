import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 通知状态管理
 * 处理应用内通知和消息提示
 */

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  style?: 'primary' | 'secondary' | 'danger'
}

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref<Notification[]>([])

  /**
   * 添加通知
   */
  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newNotification: Notification = {
      id,
      duration: 5000, // 默认5秒
      persistent: false,
      ...notification
    }

    notifications.value.push(newNotification)

    // 注意：自动关闭逻辑现在由 NotificationContainer 组件处理
    // 这样可以更好地管理定时器的清理和用户交互

    return id
  }

  /**
   * 移除通知
   */
  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * 清除所有通知
   */
  function clearAllNotifications() {
    notifications.value = []
  }

  /**
   * 显示成功通知
   */
  function showSuccess(title: string, message?: string, duration?: number) {
    return addNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }

  /**
   * 显示错误通知
   */
  function showError(title: string, message?: string, persistent = false) {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? 0 : 8000 // 8秒
    })
  }

  /**
   * 显示警告通知
   */
  function showWarning(title: string, message?: string, duration?: number) {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || 6000
    })
  }

  /**
   * 显示信息通知
   */
  function showInfo(title: string, message?: string, duration?: number) {
    return addNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }

  /**
   * 显示确认通知
   */
  function showConfirm(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) {
    const actions: NotificationAction[] = [
      {
        label: '确认',
        action: () => {
          onConfirm()
          removeNotification(id)
        },
        style: 'primary'
      },
      {
        label: '取消',
        action: () => {
          if (onCancel) onCancel()
          removeNotification(id)
        },
        style: 'secondary'
      }
    ]

    const id = addNotification({
      type: 'warning',
      title,
      message,
      persistent: true,
      actions
    })

    return id
  }

  /**
   * 显示加载通知
   */
  function showLoading(title: string, message?: string) {
    return addNotification({
      type: 'info',
      title,
      message,
      persistent: true
    })
  }

  /**
   * 更新通知
   */
  function updateNotification(id: string, updates: Partial<Notification>) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      Object.assign(notification, updates)
    }
  }

  return {
    // 状态
    notifications,
    
    // 方法
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showLoading,
    updateNotification
  }
})
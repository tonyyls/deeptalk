<template>
  <div class="h-screen flex bg-gray-50/50 dark:bg-gray-950">
    <!-- 侧边栏 -->
    <Sidebar
      :is-open="sidebarOpen"
      @close="sidebarOpen = false"
    />

    <!-- 主要内容区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 头部工具栏 -->
      <header class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 px-2 sm:px-4 py-2 sm:py-3">
        <div class="flex items-center justify-between">
          <!-- 左侧：菜单按钮和对话标题 -->
          <div class="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <button
              type="button"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md lg:hidden"
              @click="sidebarOpen = true"
            >
              <Bars3Icon class="h-6 w-6" />
            </button>
            
            <div class="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <ChatBubbleLeftRightIcon class="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <h1 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {{ currentConversation?.title || '新对话' }}
              </h1>
            </div>
          </div>

          <!-- 右侧：操作按钮 -->
          <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <!-- 新建对话按钮 -->
            <button
              type="button"
              class="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
              @click="handleNewConversation"
              title="新建对话"
            >
              <PlusIcon class="h-4 w-4 sm:h-5 sm:w-5" />
            </button>



            <!-- 设置按钮 -->
            <button
              type="button"
              class="hidden sm:block p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
              @click="showChatSettings = true"
              title="聊天设置"
            >
              <CogIcon class="h-5 w-5" />
            </button>

            <!-- 用户菜单 -->
            <div class="relative">
              <button
                type="button"
                class="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 hover:scale-105"
                @click="showUserMenu = !showUserMenu"
              >
                <img
                  :src="user?.avatarUrl || '/default-avatar.png'"
                  :alt="displayName"
                  class="h-6 w-6 rounded-full"
                />
                <ChevronDownIcon class="h-4 w-4 text-gray-500 hidden sm:block" />
              </button>

              <!-- 用户下拉菜单 -->
              <Transition name="dropdown">
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
          </div>
        </div>
      </header>

      <!-- 聊天内容区域 -->
      <main class="flex-1 flex flex-col min-h-0 chat-background">
        <!-- 消息列表 -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 relative"
        >
          <!-- 欢迎消息 -->
          <div
            v-if="messages.length === 0"
            class="flex flex-col items-center justify-center h-full text-center space-y-6"
          >
            <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
              <ChatBubbleLeftRightIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div class="space-y-4 max-w-md">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                开始新的对话
              </h2>
              <p class="text-gray-600 dark:text-gray-400">
                我是您的AI助手，可以帮助您解答问题、提供建议或进行有趣的对话。
              </p>
              
              <!-- 快捷建议 -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-6">
                <button
                  v-for="suggestion in quickSuggestions"
                  :key="suggestion"
                  type="button"
                  class="p-3 sm:p-4 text-left bg-white dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/70 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-200 hover:shadow-sm"
                  @click="handleSuggestionClick(suggestion)"
                >
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ suggestion }}
                  </p>
                </button>
              </div>
            </div>
          </div>

          <!-- 消息列表 - 使用自定义MessageItem组件 -->
          <div v-else class="flex-1 overflow-y-auto p-4 space-y-4">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message-item"
            >
              <MessageItem
                :message="message"
                :is-loading="chatStore.streamingMessageId === message.id"
                :show-token-usage="chatSettings.showTokenUsage"
                :reasoning-status="reasoningStatus"
                :on-regenerate="() => handleRegenerateMessage(message)"
              />
            </div>
          </div>
        </div>

        <!-- 消息输入区域 -->
        <div class="message-input-background">
          <MessageInput
            ref="messageInputRef"
            :disabled="chatStore.sending"
            :show-model-select="false"
            :show-settings="false"
            @send="handleSendMessage"
          />
        </div>
      </main>
    </div>

    <!-- 聊天设置模态框 -->
    <ChatSettings
      v-model:show="showChatSettings"
      :settings="chatSettings"
      @save="handleSaveSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Bars3Icon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  CogIcon,
  UserIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  CpuChipIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useNotificationStore } from '@/stores/notification'
import { scrollToBottom } from '@/utils/helpers'
import { Chat } from '@tdesign-vue-next/chat'
import Sidebar from '@/components/layout/Sidebar.vue'
import MessageItem from '@/components/chat/MessageItem.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import ChatSettings from '@/components/chat/ChatSettings.vue'
import type { Message } from '@/types/chat'
import type { ChatSettings as ChatSettingsType } from '@/types/user'

// 注册TDesign Chat组件
const TChat = Chat

/**
 * 聊天页面组件
 * 主要的聊天界面，包含消息列表、输入框、侧边栏等
 */

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const notificationStore = useNotificationStore()

const { user } = storeToRefs(authStore)
const { messages, currentConversation, reasoningStatus } = storeToRefs(chatStore)
const { logout } = authStore
const { 
  fetchConversations, 
  selectConversation, 
  createConversation, 
  sendMessage, 
  clearCurrentConversation 
} = chatStore
const { showSuccess, showError } = notificationStore

// 组件状态
const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const showChatSettings = ref(false)
const messagesContainer = ref<HTMLElement>()
const messageInputRef = ref()

// 聊天设置
const chatSettings = ref<ChatSettingsType>({
  model: 'glm-4.6',
  temperature: 0.7,
  maxTokens: 2000,
  streamResponse: true,
  showTimestamp: true,
  showTokenUsage: false
})

// 快捷建议
const quickSuggestions = [
  '你好，请介绍一下自己',
  '帮我写一个Python程序',
  '解释一下什么是人工智能',
  '推荐一些学习资源'
]

/**
 * 计算用户显示名称
 */
const displayName = computed(() => {
  return user.value?.displayName || user.value?.username || '用户'
})

/**
 * 生成头像组件
 */
const generateAvatar = (role: string) => {
  if (role === 'user') {
    // 如果用户有头像URL，使用真实头像
    if (user.value?.avatarUrl) {
      return user.value.avatarUrl
    }
    // 否则使用用户图标
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#3B82F6"/>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
      </svg>
    `)
  } else {
    // AI assistant with tech-style icon
    return 'data:image/svg+xml;base64,' + btoa(`<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" /><stop offset="50%" style="stop-color:#3730a3;stop-opacity:1" /><stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" /></linearGradient><linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" /><stop offset="100%" style="stop-color:#a78bfa;stop-opacity:1" /></linearGradient></defs><circle cx="16" cy="16" r="16" fill="url(#aiGradient)"/><g stroke="#ffffff" stroke-width="0.5" opacity="0.3"><line x1="6" y1="10" x2="12" y2="16"/><line x1="6" y1="22" x2="12" y2="16"/><line x1="12" y1="16" x2="20" y2="12"/><line x1="12" y1="16" x2="20" y2="20"/><line x1="20" y1="12" x2="26" y2="16"/><line x1="20" y1="20" x2="26" y2="16"/></g><g fill="#ffffff" opacity="0.4"><circle cx="6" cy="10" r="1"/><circle cx="6" cy="22" r="1"/><circle cx="12" cy="16" r="1.5"/><circle cx="20" cy="12" r="1"/><circle cx="20" cy="20" r="1"/><circle cx="26" cy="16" r="1"/></g><g transform="translate(16,16)"><path d="M-6,-4 C-6,-6 -4,-8 -2,-8 C0,-8 2,-6 2,-4 C4,-4 6,-2 6,0 C6,2 4,4 2,4 C2,6 0,8 -2,8 C-4,8 -6,6 -6,4 C-8,4 -10,2 -10,0 C-10,-2 -8,-4 -6,-4 Z" fill="url(#brainGradient)" opacity="0.9"/><g stroke="#ffffff" stroke-width="0.5" fill="none" opacity="0.6"><path d="M-4,-2 Q-2,-3 0,-2 Q2,-1 4,-2"/><path d="M-4,0 Q-2,1 0,0 Q2,1 4,0"/><path d="M-4,2 Q-2,3 0,2 Q2,3 4,2"/></g><g stroke="#ffffff" stroke-width="0.3" opacity="0.5"><rect x="-1" y="-1" width="2" height="2" fill="none"/><line x1="-3" y1="0" x2="-1" y2="0"/><line x1="1" y1="0" x2="3" y2="0"/><line x1="0" y1="-3" x2="0" y2="-1"/><line x1="0" y1="1" x2="0" y2="3"/></g></g><circle cx="16" cy="16" r="15" fill="none" stroke="#ffffff" stroke-width="0.5" opacity="0.2"/></svg>
    `)
  }
}

/**
 * 适配消息数据为 TDesign Chat 格式
 */
const chatData = computed(() => {
  const chatMessages = messages.value.map(message => {
    // TDesign Chat 需要的基础数据格式
    const baseMessage = {
      id: message.id,
      role: message.role,
      content: message.content || '', // 确保content不为空
      timestamp: message.timestamp,
      avatar: generateAvatar(message.role),
      username: message.role === 'user' 
        ? displayName.value
        : 'AI助手',
      // TDesign Chat 特定属性
      type: 'text', // 统一使用text类型，让TDesign Chat自己处理markdown
      error: message.error,
      usage: message.usage
    }

    // 为AI消息添加reasoning字段支持思维链
    if (message.role === 'assistant') {
      const reasoningContent = generateReasoningContent(message)
      const result = {
        ...baseMessage,
        // 如果有思考过程，添加reasoning字段
        ...(reasoningContent ? { reasoning: reasoningContent } : {})
      }
      
      return result
    }

    return baseMessage
  })

  return chatMessages
})

/**
 * 生成AI消息的思维链内容
 */
function generateReasoningContent(message: Message): string {
  // 如果消息包含实际的思考过程内容，使用它
  if (message.reasoning?.content) {
    return message.reasoning.content
  }
  
  // 否则返回空字符串，不显示思考过程
  return ''
}

/**
 * TDesign Chat 配置
 */
const chatConfig = computed(() => ({
  // 启用 Markdown 渲染
  enableMarkdown: true,
  // 显示时间戳
  showTimestamp: chatSettings.value.showTimestamp,
  // 显示用户名
  showUsername: true,
  // 显示头像
  showAvatar: true,
  // 自定义样式
  theme: 'light', // 可以根据系统主题动态切换
  // AI思考状态
  textLoading: (() => {
    if (chatStore.streamingMessageId) {
      // 根据思考状态显示不同文本
      switch (reasoningStatus.value) {
        case 'thinking':
          return '正在思考'
        case 'completed':
          return '已深度思考'
        default:
          return '正在思考'
      }
    }
    return false
  })(),
  // ChatReasoning 特定配置
  reasoning: {
    // 思维链折叠面板配置
    collapsePanelProps: {
      // 默认折叠状态
      defaultValue: [],
      // 手风琴模式（一次只能展开一个）
      accordion: false,
      // 面板头部样式
      headerStyle: {
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#64748b'
      },
      // 面板内容样式
      contentStyle: {
        backgroundColor: '#ffffff',
        padding: '12px 16px',
        borderRadius: '0 0 8px 8px',
        border: '1px solid #e2e8f0',
        borderTop: 'none'
      }
    },
    // 思维链头部配置
    header: '💭 AI思考过程',
    // 思维链右侧内容
    headerRightContent: '展开查看详情'
  },
  // 消息气泡样式
  bubbleStyle: {
    user: {
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
      borderRadius: '18px 18px 4px 18px',
      padding: '12px 16px',
      maxWidth: '70%',
      marginLeft: 'auto',
      marginRight: '0'
    },
    assistant: {
      backgroundColor: '#F3F4F6',
      color: '#1F2937',
      borderRadius: '18px 18px 18px 4px',
      padding: '12px 16px',
      maxWidth: '85%',
      marginLeft: '0',
      marginRight: 'auto'
    }
  }
}))



/**
 * 处理发送消息
 */
async function handleSendMessage(content: string) {
  if (!(content || '').trim()) return

  try {
    await sendMessage(content, chatSettings.value)
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom(messagesContainer.value)
    })
  } catch (error) {
    console.error('发送消息失败:', error)
    showError('发送消息失败，请重试')
  }
}

/**
 * 处理建议点击
 */
function handleSuggestionClick(suggestion: string) {
  messageInputRef.value?.focus()
  handleSendMessage(suggestion)
}

/**
 * 处理新建对话
 */
async function handleNewConversation() {
  try {
    const conversation = await createConversation()
    router.push(`/chat/${conversation.id}`)
    showSuccess('已创建新对话')
    
    // 关闭侧边栏（移动端）
    sidebarOpen.value = false
  } catch (error) {
    console.error('创建对话失败:', error)
    showError('创建对话失败，请重试')
  }
}

/**
 * 处理模型变更
 */
function handleModelChange(model: string) {
  chatSettings.value.model = model as 'glm-4.6' | 'glm-4'
}

/**
 * 处理保存设置
 */
function handleSaveSettings(settings: ChatSettingsType) {
  chatSettings.value = { ...settings }
  // 这里可以保存到用户设置中
}

/**
 * 处理重新生成消息和复制消息
 */
async function handleRegenerateMessage(message: Message) {
  if (!message.content) return

  try {
    // 找到用户的原始消息
    const messageIndex = messages.value.findIndex(m => m.id === message.id)
    if (messageIndex > 0) {
      const userMessage = messages.value[messageIndex - 1]
      if (userMessage.role === 'user') {
        // 移除当前AI消息
        messages.value.splice(messageIndex, 1)
        // 重新发送用户消息
        await sendMessage(userMessage.content, chatSettings.value)
      }
    }
  } catch (error) {
    console.error('重新生成失败:', error)
    showError('重新生成失败，请重试')
  }
}

/**
 * 处理复制消息
 */
async function handleCopyMessage(message: Message) {
  try {
    await navigator.clipboard.writeText(message.content)
    showSuccess('消息已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    showError('复制失败，请重试')
  }
}

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
}

/**
 * 监听路由变化
 */
watch(() => route.params.conversationId, async (newId) => {
  if (newId && typeof newId === 'string') {
    try {
      await selectConversation(newId)
    } catch (error) {
      console.error('加载对话失败:', error)
      showError('加载对话失败')
      router.push('/chat')
    }
  } else {
    clearCurrentConversation()
  }
})

/**
 * 组件挂载时的初始化
 */
onMounted(async () => {
  // 获取对话列表
  try {
    await fetchConversations()
  } catch (error) {
    console.error('获取对话列表失败:', error)
  }

  // 如果有对话ID，加载对应对话
  const conversationId = route.params.conversationId
  if (conversationId && typeof conversationId === 'string') {
    try {
      await selectConversation(conversationId)
    } catch (error) {
      console.error('加载对话失败:', error)
      showError('加载对话失败')
      router.push('/chat')
    }
  }

  // 添加点击外部关闭菜单的监听器
  document.addEventListener('click', handleClickOutside)
})

/**
 * 组件卸载时的清理
 */
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

/**
 * 监听消息变化，自动滚动到底部
 */
watch(messages, () => {
  nextTick(() => {
    scrollToBottom(messagesContainer.value)
  })
}, { deep: true })

// 在组件挂载时添加调试信息
onMounted(() => {
  console.log('Chat组件挂载，当前消息数据:', {
    messagesCount: messages.value.length,
    messages: messages.value,
    currentConversation: currentConversation.value,
    streamingMessageId: chatStore.streamingMessageId,
    reasoningStatus: reasoningStatus.value
  })
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

/* 消息动画 */
.message-enter-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-move {
  transition: transform 0.3s ease;
}

/* 聊天背景 */
.chat-background {
  background: linear-gradient(135deg, 
    rgba(249, 250, 251, 0.8) 0%, 
    rgba(243, 244, 246, 0.6) 50%, 
    rgba(249, 250, 251, 0.8) 100%
  );
}

.dark .chat-background {
  background: linear-gradient(135deg, 
    rgba(17, 24, 39, 0.8) 0%, 
    rgba(31, 41, 55, 0.6) 50%, 
    rgba(17, 24, 39, 0.8) 100%
  );
}

/* 消息输入区域背景 */
.message-input-background {
  @apply bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm;
  @apply border-t border-gray-200/50 dark:border-gray-700/50;
  background: linear-gradient(to top,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(249, 250, 251, 0.9) 100%
  );
}

.dark .message-input-background {
  background: linear-gradient(to top,
    rgba(31, 41, 55, 0.95) 0%,
    rgba(17, 24, 39, 0.9) 100%
  );
}

/* 消息气泡增强效果 */
  .t-chat__message-bubble {
  @apply shadow-sm;
  transition: all 0.2s ease-in-out;
}

.t-chat__message-bubble:hover {
  @apply shadow-md;
  transform: translateY(-1px);
}

/* AI助手消息特殊样式 */
.t-chat__text--assistant {
  position: relative;
}

/* 主要消息内容样式 - 简洁白色背景 */
.t-chat__text--assistant .t-chat__text__content {
  /* 纯白色背景 */
  background: #ffffff !important;
  
  /* 简洁圆角边框 */
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  border-radius: 16px !important;
  padding: 16px 20px !important;
  
  /* 轻微阴影增加层次感 */
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 4px rgba(0, 0, 0, 0.02) !important;
  
  position: relative;
  color: #1f2937;
}

/* 悬停效果 */
.t-chat__text--assistant .t-chat__text__content:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease-out;
}

/* 用户消息样式增强 */
.t-chat__text--user .t-chat__text__content {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%) !important;
  border-radius: 16px 16px 4px 16px !important;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.25), 0 2px 8px rgba(25, 118, 210, 0.15) !important;
  border: none !important;
  padding: 14px 18px !important;
}

/* 暗色主题适配 */
.dark .t-chat__text--assistant .t-chat__text__content {
  /* 暗色主题简洁背景 */
  background: #1f2937 !important;
  
  /* 暗色主题边框 */
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  
  /* 暗色主题阴影 */
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 1px 4px rgba(0, 0, 0, 0.1) !important;
  
  color: #e5e7eb !important;
}

/* 暗色主题悬停效果 */
.dark .t-chat__text--assistant .t-chat__text__content:hover {
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.2);
}

.dark .t-chat__text--user .t-chat__text__content {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3), 0 2px 8px rgba(37, 99, 235, 0.2) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .t-chat__text--assistant .t-chat__text__content {
    padding: 14px 16px !important;
    border-radius: 14px !important;
  }
  
  .dark .t-chat__text--assistant .t-chat__text__content {
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.25),
      0 1px 4px rgba(0, 0, 0, 0.15) !important;
  }
}

@media (max-width: 640px) {
  .t-chat__text--assistant .t-chat__text__content {
    padding: 12px 14px !important;
    border-radius: 12px !important;
  }
  
  .t-chat__text--user .t-chat__text__content {
    padding: 12px 14px !important;
    border-radius: 12px !important;
  }
  
  .dark .t-chat__text--assistant .t-chat__text__content {
    box-shadow: 
      0 2px 6px rgba(0, 0, 0, 0.2),
      0 1px 3px rgba(0, 0, 0, 0.1) !important;
  }
}

/* 消息动画效果 */
.t-chat__message {
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dark .t-chat__text--user .t-chat__text__content {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%) !important;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3), 0 2px 8px rgba(37, 99, 235, 0.2) !important;
}

/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #374151;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}

/* 现代化的聊天背景 */
.chat-background {
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.02) 0%, transparent 50%);
}

.dark .chat-background {
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
}

/* 消息输入区域背景 */
.message-input-background {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(229, 231, 235, 0.5);
}

.dark .message-input-background {
  background: rgba(17, 24, 39, 0.8);
  border-top: 1px solid rgba(75, 85, 99, 0.5);
}

/* 下拉菜单动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* 按钮悬停效果增强 */
button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* 消息项动画 */
.message-item {
  animation: messageAppear 0.4s ease-out;
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
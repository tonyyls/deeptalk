<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out',
      {
        'translate-x-0': isOpen,
        '-translate-x-full': !isOpen
      }
    ]"
  >
    <!-- 侧边栏头部 -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        对话历史
      </h2>
      <button
        type="button"
        class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md lg:hidden"
        @click="$emit('close')"
      >
        <XMarkIcon class="h-5 w-5" />
      </button>
    </div>

    <!-- 新建对话按钮 -->
    <div class="p-4">
      <button
        type="button"
        class="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
        @click="handleNewConversation"
        :disabled="chatStore.loading"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        新建对话
      </button>
    </div>

    <!-- 对话列表 -->
    <div class="flex-1 overflow-y-auto px-4 pb-4">
      <div
        v-if="chatStore.loading && conversations.length === 0"
        class="flex items-center justify-center py-8"
      >
        <LoadingSpinner size="small" text="加载中..." />
      </div>

      <div
        v-else-if="conversations.length === 0"
        class="text-center py-8 text-gray-500 dark:text-gray-400"
      >
        <ChatBubbleLeftRightIcon class="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p class="text-sm">暂无对话历史</p>
        <p class="text-xs mt-1">开始新的对话吧！</p>
      </div>

      <div
        v-else
        class="space-y-2"
      >
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          :class="[
            'group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200',
            {
              'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300': currentConversation?.id === conversation.id,
              'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300': currentConversation?.id !== conversation.id
            }
          ]"
          @click="handleSelectConversation(conversation.id)"
        >
          <!-- 对话图标 -->
          <ChatBubbleLeftIcon class="h-5 w-5 mr-3 flex-shrink-0" />
          
          <!-- 对话标题 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">
              {{ conversation.title }}
            </p>
            <p class="text-xs opacity-75 truncate">
              {{ formatTime(conversation.updatedAt) }}
            </p>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <!-- 重命名按钮 -->
            <button
              type="button"
              class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              @click.stop="handleRenameConversation(conversation)"
              :title="重命名对话"
            >
              <PencilIcon class="h-4 w-4" />
            </button>
            
            <!-- 删除按钮 -->
            <button
              type="button"
              class="p-1 text-gray-400 hover:text-red-600 rounded"
              @click.stop="handleDeleteConversation(conversation)"
              :title="删除对话"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 重命名对话模态框 -->
    <Modal
      v-model:show="showRenameModal"
      title="重命名对话"
      size="small"
    >
      <div class="space-y-4">
        <div>
          <label
            for="conversation-title"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            对话标题
          </label>
          <input
            id="conversation-title"
            v-model="renameTitle"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="请输入新的对话标题"
            maxlength="100"
            @keyup.enter="confirmRename"
          />
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="w-full sm:w-auto sm:ml-3 inline-flex justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          @click="confirmRename"
          :disabled="!(renameTitle || '').trim() || chatStore.loading"
        >
          确认
        </button>
        <button
          type="button"
          class="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          @click="showRenameModal = false"
        >
          取消
        </button>
      </template>
    </Modal>
  </aside>

  <!-- 移动端遮罩 -->
  <Transition
    name="overlay"
    appear
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      @click="$emit('close')"
    />
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  XMarkIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import { useChatStore } from '@/stores/chat'
import { useNotificationStore } from '@/stores/notification'
import { formatTime } from '@/utils/helpers'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Modal from '@/components/common/Modal.vue'
import type { Conversation } from '@/types/chat'

/**
 * 侧边栏组件
 * 显示对话历史和管理功能
 */

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()

const router = useRouter()
const chatStore = useChatStore()
const notificationStore = useNotificationStore()

const { conversations, currentConversation } = storeToRefs(chatStore)
const { 
  fetchConversations, 
  createConversation, 
  selectConversation, 
  renameConversation, 
  deleteConversation 
} = chatStore
const { showSuccess, showError, showConfirm } = notificationStore

// 重命名相关状态
const showRenameModal = ref(false)
const renameTitle = ref('')
const renamingConversation = ref<Conversation | null>(null)

/**
 * 处理新建对话
 */
async function handleNewConversation() {
  try {
    const conversation = await createConversation()
    router.push(`/chat/${conversation.id}`)
    showSuccess('已创建新对话')
  } catch (error) {
    console.error('创建对话失败:', error)
    showError('创建对话失败，请重试')
  }
}

/**
 * 处理选择对话
 */
async function handleSelectConversation(conversationId: string) {
  try {
    await selectConversation(conversationId)
    router.push(`/chat/${conversationId}`)
  } catch (error) {
    console.error('选择对话失败:', error)
    showError('加载对话失败，请重试')
  }
}

/**
 * 处理重命名对话
 */
function handleRenameConversation(conversation: Conversation) {
  renamingConversation.value = conversation
  renameTitle.value = conversation.title
  showRenameModal.value = true
}

/**
 * 确认重命名
 */
async function confirmRename() {
  if (!renamingConversation.value || !(renameTitle.value || '').trim()) {
    return
  }

  try {
    await renameConversation(renamingConversation.value.id, (renameTitle.value || '').trim())
    showRenameModal.value = false
    showSuccess('对话已重命名')
  } catch (error) {
    console.error('重命名对话失败:', error)
    showError('重命名失败，请重试')
  }
}

/**
 * 处理删除对话
 */
function handleDeleteConversation(conversation: Conversation) {
  showConfirm(
    '确认删除对话？',
    `确定要删除对话"${conversation.title}"吗？此操作无法撤销。`,
    [
      {
        label: '删除',
        style: 'danger',
        action: () => confirmDelete(conversation.id)
      },
      {
        label: '取消',
        style: 'secondary',
        action: () => {}
      }
    ]
  )
}

/**
 * 确认删除对话
 */
async function confirmDelete(conversationId: string) {
  try {
    await deleteConversation(conversationId)
    
    // 如果删除的是当前对话，跳转到聊天首页
    if (currentConversation.value?.id === conversationId) {
      router.push('/chat')
    }
    
    showSuccess('对话已删除')
  } catch (error) {
    console.error('删除对话失败:', error)
    showError('删除失败，请重试')
  }
}
</script>

<style scoped>
/* 遮罩动画 */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
<template>
  <div
    :class="[
      'flex w-full mb-4 px-4 group transition-all duration-200',
      {
        'justify-end': message.role === 'user',
        'justify-start': message.role === 'assistant'
      }
    ]"
  >
    <div
      :class="[
        'flex max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] space-x-2 sm:space-x-3',
        {
          'flex-row-reverse space-x-reverse': message.role === 'user'
        }
      ]"
    >
      <!-- 头像 -->
      <div class="flex-shrink-0">
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
            {
              'bg-blue-500 hover:bg-blue-600': message.role === 'user',
              'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600': message.role === 'assistant'
            }
          ]"
        >
          <UserIcon
            v-if="message.role === 'user'"
            class="w-4 h-4 text-white"
          />
          <CpuChipIcon
            v-else
            class="w-4 h-4 text-gray-600 dark:text-gray-300"
          />
        </div>
      </div>

      <!-- 消息内容 -->
      <div class="flex-1 min-w-0">
        <!-- 消息气泡 -->
        <div
          :class="[
            'relative px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl transition-all duration-200 group-hover:shadow-sm',
            {
              'bg-blue-500 text-white rounded-br-sm': message.role === 'user',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-sm': message.role === 'assistant'
            }
          ]"
        >
          <!-- AI思考内容区域 -->
          <div
            v-if="message.role === 'assistant' && message.reasoning?.content"
            class="mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
          >
            <!-- 思考内容头部 -->
            <button
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200"
              @click="reasoningExpanded = !reasoningExpanded"
            >
              <span class="flex items-center space-x-2">
                <span v-if="props.reasoningStatus === 'thinking'" class="animate-spin">⚪</span>
                <span v-else-if="props.reasoningStatus === 'completed'">✅</span>
                <span v-else>💭</span>
                <span>{{
                  props.reasoningStatus === 'thinking' ? '正在深度思考' :
                  props.reasoningStatus === 'completed' ? '已经深度思考' :
                  'AI思考过程'
                }}</span>
              </span>
              <ChevronDownIcon
                :class="[
                  'w-4 h-4 transition-transform duration-200',
                  { 'rotate-180': reasoningExpanded }
                ]"
              />
            </button>
            
            <!-- 思考内容 -->
            <div
              v-if="reasoningExpanded"
              class="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600"
            >
              <div 
                class="prose prose-sm max-w-none leading-relaxed dark:prose-invert prose-gray [&>p]:mb-2 [&>p:last-child]:mb-0"
                v-html="formattedReasoningContent"
              />
            </div>
          </div>

          <!-- 消息文本 -->
          <div
            v-if="message.content"
            class="prose prose-sm max-w-none leading-relaxed"
            :class="{
              'prose-invert text-white [&>*]:text-white': message.role === 'user',
              'dark:prose-invert prose-gray': message.role === 'assistant'
            }"
          >
            <div
              v-if="message.role === 'assistant'"
              v-html="formattedContent"
              class="text-gray-800 dark:text-gray-100 [&>p]:mb-2 [&>p:last-child]:mb-0"
            />
            <p
              v-else
              class="whitespace-pre-wrap break-words m-0 text-white"
            >
              {{ message.content }}
            </p>
          </div>

          <!-- 加载状态 - 已隐藏 -->
          <!--
          <div
            v-if="isLoading"
            class="flex items-center space-x-3 text-gray-500 dark:text-gray-400"
          >
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 0ms" />
              <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 150ms" />
              <div class="w-2 h-2 bg-current rounded-full animate-bounce" style="animation-delay: 300ms" />
            </div>
            <span class="text-sm">
              {{ props.reasoningStatus === 'thinking' ? '正在深度思考' : props.reasoningStatus === 'completed' ? '思考完成' : '正在思考...' }}
            </span>
          </div>
          -->

          <!-- 错误状态 -->
          <div
            v-if="message.error"
            class="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2"
          >
            <ExclamationTriangleIcon class="w-4 h-4 flex-shrink-0" />
            <span class="text-sm">{{ message.error }}</span>
          </div>
        </div>

        <!-- 消息元信息 -->
        <div
          :class="[
            'flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-gray-500 px-1',
            {
              'flex-row-reverse': message.role === 'user'
            }
          ]"
        >
          <!-- 时间戳 -->
          <span>{{ formatTime(message.timestamp) }}</span>

          <!-- 操作按钮 -->
          <div
            v-if="!isLoading"
            class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <!-- 复制按钮 -->
            <button
              type="button"
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
              @click="handleCopy"
              title="复制消息"
            >
              <ClipboardIcon class="w-3.5 h-3.5" />
            </button>

            <!-- 重新生成按钮（仅AI消息） -->
            <button
              v-if="message.role === 'assistant' && onRegenerate"
              type="button"
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
              @click="onRegenerate"
              title="重新生成"
            >
              <ArrowPathIcon class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Token使用信息 -->
        <div
          v-if="message.usage && showTokenUsage"
          class="mt-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg"
          :class="{
            'text-right': message.role === 'user'
          }"
        >
          <span class="font-mono text-xs">
            输入: {{ message.usage.prompt_tokens }} | 
            输出: {{ message.usage.completion_tokens }} | 
            总计: {{ message.usage.total_tokens }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  UserIcon,
  CpuChipIcon,
  ClipboardIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import { formatTime, copyToClipboard } from '@/utils/helpers'
import { useNotificationStore } from '@/stores/notification'
import type { Message } from '@/types/chat'

/**
 * 聊天消息组件
 * 显示单条聊天消息，采用DeepSeek风格的简洁设计
 */

interface Props {
  message: Message
  isLoading?: boolean
  showTokenUsage?: boolean
  reasoningStatus?: string
  onRegenerate?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  showTokenUsage: false
})

const notificationStore = useNotificationStore()
const { showSuccess, showError } = notificationStore

// 思考内容折叠状态（默认展开）
const reasoningExpanded = ref(true)

/**
 * 格式化思考内容（支持Markdown）
 */
const formattedReasoningContent = computed(() => {
  if (!props.message.reasoning?.content) return ''
  
  const content = props.message.reasoning.content
  let formattedContent = content
  
  // 代码块
  formattedContent = formattedContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 overflow-x-auto my-3 border border-gray-200 dark:border-gray-600"><code class="text-sm font-mono">${(code || '').trim()}</code></pre>`
  })
  
  // 行内代码
  formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
  
  // 粗体
  formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  
  // 斜体
  formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  
  // 链接
  formattedContent = formattedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">$1</a>')
  
  // 列表项（无序列表）
  formattedContent = formattedContent.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
  
  // 列表项（有序列表）
  formattedContent = formattedContent.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
  
  // 换行
  formattedContent = formattedContent.replace(/\n/g, '<br>')
  
  return formattedContent
})

/**
 * 格式化消息内容（支持Markdown）
 * 使用防抖优化流式渲染性能
 */
const formattedContent = computed(() => {
  if (!props.message.content) return ''
  
  // 对于流式输出，如果内容还在增长且没有完成，使用简单的文本渲染
  // 只有在消息完成后才进行复杂的Markdown渲染
  const content = props.message.content
  
  // 如果消息正在加载中，直接返回纯文本（提高性能）
  if (props.isLoading) {
    return content.replace(/\n/g, '<br>')
  }
  
  // 消息完成后进行完整的Markdown渲染
  let formattedContent = content
  
  // 代码块
  formattedContent = formattedContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto my-3 border border-gray-200 dark:border-gray-700"><code class="text-sm font-mono">${(code || '').trim()}</code></pre>`
  })
  
  // 行内代码
  formattedContent = formattedContent.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
  
  // 粗体
  formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  
  // 斜体
  formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  
  // 链接
  formattedContent = formattedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2">$1</a>')
  
  // 换行
  formattedContent = formattedContent.replace(/\n/g, '<br>')
  
  return formattedContent
})

/**
 * 复制消息内容
 */
async function handleCopy() {
  try {
    await copyToClipboard(props.message.content)
    showSuccess('消息已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    showError('复制失败，请重试')
  }
}
</script>

<style scoped>
/* 消息动画 */
.message-enter-active {
  transition: all 0.3s ease-out;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* 代码块样式优化 */
:deep(pre) {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.875rem;
  line-height: 1.5;
}

:deep(code) {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
}

/* 链接样式优化 */
:deep(a) {
  word-break: break-all;
  transition: color 0.2s ease;
}

/* 列表样式优化 */
:deep(ul), :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

:deep(li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

/* 引用样式优化 */
:deep(blockquote) {
  border-left: 3px solid #e5e7eb;
  padding-left: 1rem;
  margin: 0.75rem 0;
  font-style: italic;
  color: #6b7280;
  background: #f9fafb;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

:deep(.dark blockquote) {
  border-left-color: #4b5563;
  color: #9ca3af;
  background: #1f2937;
}

/* 段落间距优化 */
:deep(p) {
  line-height: 1.6;
  margin: 0.5rem 0;
}

:deep(p:first-child) {
  margin-top: 0;
}

:deep(p:last-child) {
  margin-bottom: 0;
}
</style>
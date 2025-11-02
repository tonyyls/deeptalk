<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- 输入区域 -->
      <div class="relative">
        <div
          class="flex items-end space-x-3 bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 border border-gray-200 dark:border-gray-600 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-colors duration-200"
        >
          <!-- 文本输入框 -->
          <div class="flex-1 min-w-0">
            <textarea
              ref="textareaRef"
              v-model="inputMessage"
              class="w-full bg-transparent border-0 resize-none focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              :placeholder="placeholder"
              :rows="rows"
              :maxlength="maxLength"
              :disabled="disabled"
              @keydown="handleKeydown"
              @input="handleInput"
              @paste="handlePaste"
            />
          </div>

          <!-- 发送按钮 -->
          <button
            type="button"
            :class="[
              'flex-shrink-0 p-2 rounded-xl transition-all duration-200',
              {
                'bg-primary-600 text-white hover:bg-primary-700 shadow-md': canSend,
                'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed': !canSend
              }
            ]"
            :disabled="!canSend"
            @click="handleSend"
            :title="canSend ? '发送消息 (Ctrl+Enter)' : '请输入消息内容'"
          >
            <PaperAirplaneIcon
              :class="[
                'w-5 h-5 transition-transform duration-200',
                {
                  'rotate-45': canSend
                }
              ]"
            />
          </button>
        </div>

        <!-- 字符计数 -->
        <div
          v-if="showCharCount"
          class="absolute -top-6 right-0 text-xs text-gray-500 dark:text-gray-400"
        >
          {{ inputMessage.length }}/{{ maxLength }}
        </div>
      </div>

      <!-- 功能提示 -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-2 sm:space-y-0">
        <div class="flex items-center space-x-4">
          <span class="hidden sm:inline">按 Ctrl+Enter 发送</span>
          <span class="hidden sm:inline">按 Shift+Enter 换行</span>
          <span class="sm:hidden">点击发送按钮或按 Enter 发送</span>
        </div>
        
        <div class="flex items-center justify-between sm:justify-end space-x-2">
          <!-- 模型选择 -->
          <select
            v-if="showModelSelect"
            v-model="selectedModel"
            class="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            @change="$emit('model-change', selectedModel)"
          >
            <option
              v-for="model in availableModels"
              :key="model.id"
              :value="model.id"
            >
              {{ model.name }}
            </option>
          </select>

          <!-- 设置按钮 -->
          <button
            v-if="showSettings"
            type="button"
            class="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
            @click="$emit('settings-click')"
            title="聊天设置"
          >
            <CogIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 快捷建议已移除 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { PaperAirplaneIcon, CogIcon } from '@heroicons/vue/24/outline'
import { AI_MODELS, CHAT_CONFIG } from '@/utils/constants'

/**
 * 聊天输入组件
 * 处理用户消息输入和发送
 */

interface Props {
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  showCharCount?: boolean
  showModelSelect?: boolean
  showSettings?: boolean
  suggestions?: string[]
  modelValue?: string
}

interface Emits {
  (e: 'send', message: string): void
  (e: 'model-change', model: string): void
  (e: 'settings-click'): void
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: '输入你的消息...',
  maxLength: CHAT_CONFIG.MAX_MESSAGE_LENGTH,
  showCharCount: false,
  showModelSelect: false,
  showSettings: false,
  suggestions: () => [
    '你好，请介绍一下自己',
    '帮我写一个简单的Python程序',
    '解释一下什么是人工智能',
    '推荐一些学习编程的资源'
  ],
  modelValue: ''
})

const emit = defineEmits<Emits>()

// 响应式状态
const textareaRef = ref<HTMLTextAreaElement>()
const inputMessage = ref(props.modelValue || '')
const selectedModel = ref(AI_MODELS[0].id)
const rows = ref(1)

// 可用模型列表
const availableModels = AI_MODELS

/**
 * 是否可以发送消息
 */
const canSend = computed(() => {
  return !props.disabled && (inputMessage.value || '').trim().length > 0
})

/**
 * 监听输入变化
 */
watch(inputMessage, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue !== inputMessage.value) {
    inputMessage.value = newValue || ''
  }
})

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  // Ctrl+Enter 发送消息
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    handleSend()
    return
  }

  // Shift+Enter 换行
  if (event.shiftKey && event.key === 'Enter') {
    return
  }

  // Enter 发送消息（可选）
  if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
    event.preventDefault()
    handleSend()
    return
  }
}

/**
 * 处理输入事件
 */
function handleInput() {
  adjustTextareaHeight()
}

/**
 * 处理粘贴事件
 */
function handlePaste(event: ClipboardEvent) {
  // 可以在这里处理特殊的粘贴逻辑，比如图片上传等
  nextTick(() => {
    adjustTextareaHeight()
  })
}

/**
 * 调整文本框高度
 */
function adjustTextareaHeight() {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  textarea.style.height = 'auto'
  
  const lineHeight = 24 // 假设行高为24px
  const maxHeight = lineHeight * 6 // 最大6行
  const scrollHeight = textarea.scrollHeight
  
  if (scrollHeight <= maxHeight) {
    textarea.style.height = `${scrollHeight}px`
    rows.value = Math.max(1, Math.ceil(scrollHeight / lineHeight))
  } else {
    textarea.style.height = `${maxHeight}px`
    rows.value = 6
  }
}

/**
 * 处理发送消息
 */
function handleSend() {
  if (!canSend.value) return

  const message = (inputMessage.value || '').trim()
  if (message) {
    emit('send', message)
    inputMessage.value = ''
    
    // 重置文本框高度
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
        rows.value = 1
      }
    })
  }
}

/**
 * 处理建议点击
 */
function handleSuggestionClick(suggestion: string) {
  inputMessage.value = suggestion
  nextTick(() => {
    textareaRef.value?.focus()
    adjustTextareaHeight()
  })
}

/**
 * 聚焦输入框
 */
function focus() {
  textareaRef.value?.focus()
}

/**
 * 清空输入
 */
function clear() {
  inputMessage.value = ''
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      rows.value = 1
    }
  })
}

// 暴露方法给父组件
defineExpose({
  focus,
  clear
})
</script>

<style scoped>
/* 文本框样式 */
textarea {
  min-height: 24px;
  line-height: 24px;
}

/* 滚动条样式 */
textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark textarea::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark textarea::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
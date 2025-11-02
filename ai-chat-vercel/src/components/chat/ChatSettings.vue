<template>
  <Modal
    v-model:show="isVisible"
    title="聊天设置"
    size="medium"
    @close="handleClose"
  >
    <div class="space-y-6">
      <!-- AI模型设置 -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          AI模型
        </h4>
        <div class="space-y-3">
          <div
            v-for="model in availableModels"
            :key="model.id"
            class="flex items-start space-x-3"
          >
            <input
              :id="`model-${model.id}`"
              v-model="localSettings.model"
              type="radio"
              :value="model.id"
              class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <div class="flex-1">
              <label
                :for="`model-${model.id}`"
                class="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
              >
                {{ model.name }}
              </label>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ model.description }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">
                最大Token: {{ model.maxTokens.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 温度设置 -->
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          创造性 (Temperature)
        </label>
        <div class="space-y-2">
          <input
            v-model.number="localSettings.temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>保守 (0)</span>
            <span class="font-medium">{{ localSettings.temperature }}</span>
            <span>创新 (2)</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            较低的值使输出更加确定和一致，较高的值使输出更加随机和创造性
          </p>
        </div>
      </div>

      <!-- 最大Token数设置 -->
      <div>
        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          最大回复长度 (Max Tokens)
        </label>
        <div class="space-y-2">
          <input
            v-model.number="localSettings.maxTokens"
            type="range"
            :min="100"
            :max="4000"
            step="100"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>简短 (100)</span>
            <span class="font-medium">{{ localSettings.maxTokens }}</span>
            <span>详细 (4000)</span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            控制AI回复的最大长度，较高的值允许更长的回复
          </p>
        </div>
      </div>

      <!-- 流式响应设置 -->
      <div>
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">
              流式响应
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              实时显示AI的回复过程
            </p>
          </div>
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              {
                'bg-primary-600': localSettings.streamResponse,
                'bg-gray-200 dark:bg-gray-700': !localSettings.streamResponse
              }
            ]"
            @click="localSettings.streamResponse = !localSettings.streamResponse"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                {
                  'translate-x-5': localSettings.streamResponse,
                  'translate-x-0': !localSettings.streamResponse
                }
              ]"
            />
          </button>
        </div>
      </div>

      <!-- 显示时间戳设置 -->
      <div>
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">
              显示时间戳
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              在消息中显示发送时间
            </p>
          </div>
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              {
                'bg-primary-600': localSettings.showTimestamp,
                'bg-gray-200 dark:bg-gray-700': !localSettings.showTimestamp
              }
            ]"
            @click="localSettings.showTimestamp = !localSettings.showTimestamp"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                {
                  'translate-x-5': localSettings.showTimestamp,
                  'translate-x-0': !localSettings.showTimestamp
                }
              ]"
            />
          </button>
        </div>
      </div>

      <!-- 显示Token使用情况设置 -->
      <div>
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">
              显示Token使用情况
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              显示每条消息的Token消耗统计
            </p>
          </div>
          <button
            type="button"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              {
                'bg-primary-600': localSettings.showTokenUsage,
                'bg-gray-200 dark:bg-gray-700': !localSettings.showTokenUsage
              }
            ]"
            @click="localSettings.showTokenUsage = !localSettings.showTokenUsage"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                {
                  'translate-x-5': localSettings.showTokenUsage,
                  'translate-x-0': !localSettings.showTokenUsage
                }
              ]"
            />
          </button>
        </div>
      </div>

      <!-- 预设模板 -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
          快速设置
        </h4>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            class="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            @click="applyPreset('balanced')"
          >
            <div class="font-medium text-sm text-gray-900 dark:text-white">
              平衡模式
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              适合日常对话
            </div>
          </button>
          
          <button
            type="button"
            class="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            @click="applyPreset('creative')"
          >
            <div class="font-medium text-sm text-gray-900 dark:text-white">
              创意模式
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              适合创作和头脑风暴
            </div>
          </button>
          
          <button
            type="button"
            class="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            @click="applyPreset('precise')"
          >
            <div class="font-medium text-sm text-gray-900 dark:text-white">
              精确模式
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              适合技术问答
            </div>
          </button>
          
          <button
            type="button"
            class="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            @click="applyPreset('concise')"
          >
            <div class="font-medium text-sm text-gray-900 dark:text-white">
              简洁模式
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              简短精炼的回复
            </div>
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="w-full sm:w-auto sm:ml-3 inline-flex justify-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        @click="handleSave"
      >
        保存设置
      </button>
      <button
        type="button"
        class="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
        @click="handleClose"
      >
        取消
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/components/common/Modal.vue'
import { AI_MODELS, CHAT_CONFIG } from '@/utils/constants'
import { useNotificationStore } from '@/stores/notification'
import type { ChatSettings } from '@/types/user'

/**
 * 聊天设置组件
 * 配置AI模型、温度、Token等参数
 */

interface Props {
  show: boolean
  settings: ChatSettings
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'save', settings: ChatSettings): void
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const notificationStore = useNotificationStore()
const { showSuccess } = notificationStore

// 本地设置副本
const localSettings = ref<ChatSettings>({ ...props.settings })
const isVisible = ref(props.show)

// 可用模型列表
const availableModels = AI_MODELS

/**
 * 监听显示状态变化
 */
watch(() => props.show, (newValue) => {
  isVisible.value = newValue
  if (newValue) {
    // 重置本地设置
    localSettings.value = { ...props.settings }
  }
})

watch(isVisible, (newValue) => {
  emit('update:show', newValue)
})

/**
 * 应用预设配置
 */
function applyPreset(preset: string) {
  switch (preset) {
    case 'balanced':
      localSettings.value = {
        ...localSettings.value,
        temperature: 0.7,
        maxTokens: 2000,
        streamResponse: true
      }
      break
    case 'creative':
      localSettings.value = {
        ...localSettings.value,
        temperature: 1.2,
        maxTokens: 3000,
        streamResponse: true
      }
      break
    case 'precise':
      localSettings.value = {
        ...localSettings.value,
        temperature: 0.3,
        maxTokens: 2000,
        streamResponse: false
      }
      break
    case 'concise':
      localSettings.value = {
        ...localSettings.value,
        temperature: 0.5,
        maxTokens: 500,
        streamResponse: false
      }
      break
  }
  
  showSuccess(`已应用${getPresetName(preset)}设置`)
}

/**
 * 获取预设名称
 */
function getPresetName(preset: string): string {
  const names: Record<string, string> = {
    balanced: '平衡模式',
    creative: '创意模式',
    precise: '精确模式',
    concise: '简洁模式'
  }
  return names[preset] || preset
}

/**
 * 保存设置
 */
function handleSave() {
  emit('save', { ...localSettings.value })
  isVisible.value = false
  showSuccess('聊天设置已保存')
}

/**
 * 关闭设置
 */
function handleClose() {
  isVisible.value = false
  emit('close')
}
</script>

<style scoped>
/* 滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-webkit-slider-track {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
}

.slider::-moz-range-track {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  border: none;
}

.dark .slider::-webkit-slider-track {
  background: #374151;
}

.dark .slider::-moz-range-track {
  background: #374151;
}
</style>
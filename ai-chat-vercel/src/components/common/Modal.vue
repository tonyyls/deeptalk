<template>
  <Teleport to="body">
    <Transition
      name="modal"
      appear
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- 背景遮罩 -->
        <div
          class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <Transition
            name="modal-backdrop"
            appear
          >
            <div
              v-if="show"
              class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              @click="handleBackdropClick"
            />
          </Transition>

          <!-- 垂直居中技巧 -->
          <span
            class="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >&#8203;</span>

          <!-- 模态框内容 -->
          <Transition
            name="modal-content"
            appear
          >
            <div
              v-if="show"
              :class="[
                'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle',
                {
                  'sm:max-w-sm sm:w-full': size === 'small',
                  'sm:max-w-lg sm:w-full': size === 'medium',
                  'sm:max-w-2xl sm:w-full': size === 'large',
                  'sm:max-w-4xl sm:w-full': size === 'extra-large'
                }
              ]"
            >
              <!-- 头部 -->
              <div
                v-if="$slots.header || title"
                class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <slot name="header">
                      <h3
                        id="modal-title"
                        class="text-lg leading-6 font-medium text-gray-900"
                      >
                        {{ title }}
                      </h3>
                    </slot>
                  </div>
                  
                  <button
                    v-if="closable"
                    type="button"
                    class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    @click="handleClose"
                  >
                    <span class="sr-only">关闭</span>
                    <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <!-- 内容 -->
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
                <slot />
              </div>

              <!-- 底部 -->
              <div
                v-if="$slots.footer"
                class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse"
              >
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

/**
 * 模态框组件
 * 用于显示弹出式内容
 */

interface Props {
  show: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'extra-large'
  closable?: boolean
  closeOnBackdrop?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'update:show', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'medium',
  closable: true,
  closeOnBackdrop: true
})

const emit = defineEmits<Emits>()

/**
 * 处理关闭事件
 */
function handleClose() {
  emit('close')
  emit('update:show', false)
}

/**
 * 处理背景点击
 */
function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}
</script>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 背景遮罩动画 */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

/* 内容动画 */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s ease;
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: translateY(-50px) scale(0.95);
}
</style>
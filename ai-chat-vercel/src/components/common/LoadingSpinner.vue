<template>
  <div
    :class="[
      'flex items-center justify-center',
      {
        'h-screen': fullScreen,
        'h-32': !fullScreen && !inline,
        'inline-flex': inline
      }
    ]"
  >
    <div class="flex flex-col items-center space-y-3">
      <!-- 旋转加载器 -->
      <div
        :class="[
          'animate-spin rounded-full border-2 border-gray-300',
          {
            'h-12 w-12 border-t-primary-600': size === 'large',
            'h-8 w-8 border-t-primary-600': size === 'medium',
            'h-6 w-6 border-t-primary-600': size === 'small',
            'h-4 w-4 border-t-primary-600': size === 'tiny'
          }
        ]"
      />
      
      <!-- 加载文本 -->
      <p
        v-if="text && !inline"
        :class="[
          'text-gray-600',
          {
            'text-lg': size === 'large',
            'text-base': size === 'medium',
            'text-sm': size === 'small' || size === 'tiny'
          }
        ]"
      >
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 加载旋转器组件
 * 用于显示加载状态
 */

interface Props {
  size?: 'tiny' | 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
  inline?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  text: '',
  fullScreen: false,
  inline: false
})
</script>
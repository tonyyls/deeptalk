import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// 引入 TDesign Chat 组件
import TDesignChat from '@tdesign-vue-next/chat'
// 引入 TDesign Chat 样式
import '@tdesign-vue-next/chat/es/style/index.css'

/**
 * Vue 3应用程序入口文件
 * 初始化Vue应用、Pinia状态管理和路由
 */

const app = createApp(App)
const pinia = createPinia()

// 注册插件
app.use(pinia)
app.use(router)
app.use(TDesignChat)

// 挂载应用
app.mount('#app')
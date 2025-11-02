import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Conversation, Message } from '@/types/chat'
import { chatApi } from '@/utils/api'
import { useAuthStore } from './auth'

/**
 * 聊天状态管理
 * 处理对话、消息和AI聊天功能
 */
export const useChatStore = defineStore('chat', () => {
  // 状态
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const sending = ref(false)
  const error = ref<string | null>(null)
  const streamingMessageId = ref<string | null>(null)
  
  // 思考状态管理
  const reasoningStatus = ref<'idle' | 'thinking' | 'completed'>('idle')

  // 计算属性
  const hasConversations = computed(() => conversations.value.length > 0)
  const currentConversationId = computed(() => currentConversation.value?.id || null)
  const sortedConversations = computed(() => 
    [...conversations.value].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  )

  /**
   * 获取用户的所有对话
   */
  async function fetchConversations() {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      const response = await chatApi.getConversations(authHeader)
      conversations.value = response.conversations || []
      
      return response
    } catch (err) {
      console.error('Fetch conversations error:', err)
      error.value = '获取对话列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建新对话
   */
  async function createConversation(title?: string, initialMessage?: string) {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      // 如果没有提供标题，生成默认标题
      const conversationTitle = title?.trim() || `新对话 ${new Date().toLocaleString('zh-CN', { 
        month: 'numeric', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`

      const response = await chatApi.createConversation(authHeader, {
        title: conversationTitle,
        initialMessage
      })

      const newConversation = response.conversation
      conversations.value.unshift(newConversation)
      currentConversation.value = newConversation
      messages.value = []

      return newConversation
    } catch (err) {
      console.error('Create conversation error:', err)
      error.value = '创建对话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 选择当前对话
   */
  async function selectConversation(conversationId: string) {
    try {
      loading.value = true
      error.value = null

      const conversation = conversations.value.find(c => c.id === conversationId)
      if (!conversation) {
        throw new Error('对话不存在')
      }

      currentConversation.value = conversation
      
      // TODO: 从API获取对话消息
      // 这里使用模拟数据
      messages.value = []

      return conversation
    } catch (err) {
      console.error('Select conversation error:', err)
      error.value = '选择对话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 重命名对话
   */
  async function renameConversation(conversationId: string, newTitle: string) {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      await chatApi.updateConversation(authHeader, {
        conversationId,
        title: (newTitle || '').trim()
      })

      // 更新本地状态
      const conversation = conversations.value.find(c => c.id === conversationId)
      if (conversation) {
        conversation.title = (newTitle || '').trim()
        conversation.updatedAt = new Date().toISOString()
      }

      if (currentConversation.value?.id === conversationId) {
        currentConversation.value.title = (newTitle || '').trim()
        currentConversation.value.updatedAt = new Date().toISOString()
      }

      return { success: true }
    } catch (err) {
      console.error('Rename conversation error:', err)
      error.value = '重命名对话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除对话
   */
  async function deleteConversation(conversationId: string) {
    try {
      loading.value = true
      error.value = null

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      await chatApi.deleteConversation(authHeader, conversationId)

      // 更新本地状态
      conversations.value = conversations.value.filter(c => c.id !== conversationId)
      
      if (currentConversation.value?.id === conversationId) {
        currentConversation.value = null
        messages.value = []
      }

      return { success: true }
    } catch (err) {
      console.error('Delete conversation error:', err)
      error.value = '删除对话失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 发送消息
   */
  async function sendMessage(content: string, settings: any = {}) {
    // 解构设置参数，提供默认值
    const {
      model = 'glm-4.6',
      temperature = 0.7,
      maxTokens = 2000,
      streamResponse = true,
      showTimestamp = true,
      showTokenUsage = false
    } = settings;
    
    console.log(`[${new Date().toISOString()}] Frontend sendMessage called with:`, {
      model,
      temperature,
      maxTokens,
      streamResponse,
      showTimestamp,
      showTokenUsage
    });
    
    try {
      sending.value = true
      error.value = null
      
      // 重置思考状态
      reasoningStatus.value = 'idle'

      const authStore = useAuthStore()
      const authHeader = authStore.getAuthHeader()
      
      if (!authHeader) {
        throw new Error('未认证')
      }

      // 添加用户消息到界面
      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: (content || '').trim(),
        timestamp: new Date().toISOString(),
        userId: authStore.user?.id || ''
      }
      
      messages.value.push(userMessage)

      // 创建AI消息占位符（用于流式更新）
      const aiMessageId = `msg_${Date.now()}_ai`
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        userId: 'ai'
      }

      if (streamResponse) {
        console.log(`[${new Date().toISOString()}] Using streaming response...`);
        // 添加AI消息占位符到界面
        messages.value.push(aiMessage)
        
        // 设置当前正在加载的消息ID
        loading.value = true
        streamingMessageId.value = aiMessageId

        const requestData = {
          message: (content || '').trim(),
          conversationId: currentConversation.value?.id,
          model: {
            model,
            temperature,
            maxTokens,
            streamResponse,
            showTimestamp,
            showTokenUsage
          }
        };
        
        console.log(`[${new Date().toISOString()}] Sending streaming request:`, requestData);

        // 使用流式API
        return new Promise<any>((resolve, reject) => {
          console.log(`[${new Date().toISOString()}] Starting stream API call...`);
          chatApi.sendMessageStream(
            authHeader,
            requestData,
            // onContent - 实时更新AI消息内容
            (deltaContent: string) => {
              console.log(`[${new Date().toISOString()}] Frontend received content:`, deltaContent.length, 'chars, content:', JSON.stringify(deltaContent));
              const messageIndex = messages.value.findIndex(m => m.id === aiMessageId)
              if (messageIndex !== -1) {
                console.log(`[${new Date().toISOString()}] Updating message at index:`, messageIndex, 'current length:', messages.value[messageIndex].content.length);
                messages.value[messageIndex].content += deltaContent
                console.log(`[${new Date().toISOString()}] Updated message length:`, messages.value[messageIndex].content.length);
              } else {
                console.warn(`[${new Date().toISOString()}] Could not find message with ID:`, aiMessageId);
              }
            },
            // onComplete - 流式响应完成
            (response: any) => {
              console.log(`[${new Date().toISOString()}] Frontend stream completed:`, response);
              // 清除加载状态
              loading.value = false
              streamingMessageId.value = null
              streamingMessageId.value = null
              
              // 更新思考状态为已完成
              if (reasoningStatus.value === 'thinking') {
                reasoningStatus.value = 'completed'
              }
              
              // 更新对话信息
              if (currentConversation.value) {
                currentConversation.value.updatedAt = new Date().toISOString()
                currentConversation.value.messageCount = (currentConversation.value.messageCount || 0) + 2
              }
              resolve(response)
            },
            // onError - 处理错误
            (errorMsg: string) => {
              console.error(`[${new Date().toISOString()}] Frontend stream error:`, errorMsg);
              // 清除加载状态
              loading.value = false
              streamingMessageId.value = null
              error.value = errorMsg
              // 移除失败的消息
              messages.value = messages.value.filter(m => m.id !== userMessage.id && m.id !== aiMessageId)
              reject(new Error(errorMsg))
            },
            // onReasoning - 处理思考过程
            (reasoningContent: string) => {
              console.log(`[${new Date().toISOString()}] Frontend received reasoning:`, reasoningContent.length, 'chars');
              
              // 第一次收到思考内容时，更新状态为 thinking
              if (reasoningStatus.value === 'idle') {
                reasoningStatus.value = 'thinking'
              }
              
              const messageIndex = messages.value.findIndex(m => m.id === aiMessageId)
              if (messageIndex !== -1) {
                // 初始化reasoning字段
                if (!messages.value[messageIndex].reasoning) {
                  messages.value[messageIndex].reasoning = {
                    content: '',
                    title: '思考过程',
                    collapsible: true,
                    defaultExpanded: false
                  }
                }
                // 累积思考过程内容
                messages.value[messageIndex].reasoning.content += reasoningContent
                console.log(`[${new Date().toISOString()}] Updated reasoning length:`, messages.value[messageIndex].reasoning.content.length);
              } else {
                console.warn(`[${new Date().toISOString()}] Could not find message for reasoning with ID:`, aiMessageId);
              }
            }
          )
        })
      } else {
        console.log(`[${new Date().toISOString()}] Using non-streaming response...`);

        // 使用普通API
        const response = await chatApi.sendMessage(authHeader, {
          message: (content || '').trim(),
          conversationId: currentConversation.value?.id,
          model: {
            model,
            temperature,
            maxTokens,
            streamResponse: false,
            showTimestamp,
            showTokenUsage
          }
        })

        // 添加AI回复到界面
        if (response.messages && response.messages.length > 1) {
          const aiResponseMessage = response.messages[1] // AI回复消息
          messages.value.push(aiResponseMessage)
        }

        // 更新对话信息
        if (currentConversation.value) {
          currentConversation.value.updatedAt = new Date().toISOString()
          currentConversation.value.messageCount = (currentConversation.value.messageCount || 0) + 2
        }

        return response
      }
    } catch (err) {
      console.error('Send message error:', err)
      error.value = '发送消息失败'
      
      // 移除失败的用户消息
      messages.value = messages.value.filter(m => m.id !== `msg_${Date.now()}_user`)
      
      throw err
    } finally {
      sending.value = false
    }
  }

  /**
   * 清除当前对话
   */
  function clearCurrentConversation() {
    currentConversation.value = null
    messages.value = []
  }

  /**
   * 清除错误状态
   */
  function clearError() {
    error.value = null
  }

  /**
   * 重置聊天状态
   */
  function resetChatState() {
    conversations.value = []
    currentConversation.value = null
    messages.value = []
    loading.value = false
    sending.value = false
    error.value = null
    reasoningStatus.value = 'idle'
  }

  return {
    // 状态
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    error,
    streamingMessageId,
    reasoningStatus,
    
    // 计算属性
    hasConversations,
    currentConversationId,
    sortedConversations,
    
    // 方法
    fetchConversations,
    createConversation,
    selectConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
    clearCurrentConversation,
    clearError,
    resetChatState
  }
})
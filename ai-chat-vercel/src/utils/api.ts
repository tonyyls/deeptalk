import axios from 'axios'
import type { 
  TokenVerificationResponse,
  User,
  UserSettings
} from '@/types/user'
import type {
  ChatRequest,
  ChatResponse,
  ConversationRequest,
  ConversationUpdateRequest,
  ConversationsResponse,
  ConversationResponse,
  MessageRequest,
  MessageResponse
} from '@/types/chat'

/**
 * API工具类
 * 封装所有API请求
 */

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加全局请求处理
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 统一错误处理
    const errorMessage = error.response?.data?.message || error.message || '请求失败'
    console.error('API Error:', errorMessage)
    return Promise.reject(new Error(errorMessage))
  }
)

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 验证token
   */
  async verifyToken(token: string): Promise<TokenVerificationResponse> {
    return apiClient.post('/auth/verify', { token })
  },

  /**
   * GitHub OAuth登录
   */
  loginWithGitHub(): void {
    window.location.href = '/api/auth/github'
  }
}

/**
 * 聊天相关API
 */
export const chatApi = {
  /**
   * 获取对话列表
   */
  async getConversations(authHeader: string, page = 1, limit = 20): Promise<ConversationsResponse> {
    return apiClient.get('/chat/conversations', {
      headers: { Authorization: authHeader },
      params: { page, limit }
    })
  },

  /**
   * 创建新对话
   */
  async createConversation(authHeader: string, data: ConversationRequest): Promise<ConversationResponse> {
    return apiClient.post('/chat/conversations', data, {
      headers: { Authorization: authHeader }
    })
  },

  /**
   * 更新对话
   */
  async updateConversation(authHeader: string, data: ConversationUpdateRequest): Promise<ConversationResponse> {
    return apiClient.put('/chat/conversations', data, {
      headers: { Authorization: authHeader }
    })
  },

  /**
   * 删除对话
   */
  async deleteConversation(authHeader: string, conversationId: string): Promise<{ success: boolean }> {
    return apiClient.delete('/chat/conversations', {
      headers: { Authorization: authHeader },
      params: { conversationId }
    })
  },

  /**
   * 发送消息
   */
  async sendMessage(authHeader: string, data: MessageRequest): Promise<MessageResponse> {
    return apiClient.post('/chat/message', data, {
      headers: { Authorization: authHeader }
    })
  },

  /**
   * 发送流式消息
   * 使用Server-Sent Events处理实时响应
   */
  async sendMessageStream(
    authHeader: string, 
    data: MessageRequest,
    onContent: (content: string) => void,
    onComplete: (response: MessageResponse) => void,
    onError: (error: string) => void,
    onReasoning?: (reasoning: string) => void
  ): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Frontend: Starting fetch request to /api/chat/message`);
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(data)
      })

      console.log(`[${new Date().toISOString()}] Frontend: Fetch response status:`, response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      console.log(`[${new Date().toISOString()}] Frontend: Starting to read stream...`);
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      let chunkCount = 0

      while (true) {
        const { done, value } = await reader.read()
        chunkCount++
        
        if (done) {
          console.log(`[${new Date().toISOString()}] Frontend: Stream ended after ${chunkCount} chunks, total content length:`, fullContent.length);
          // 流式响应正常结束，如果还没有调用onComplete，则构造一个默认响应
          if (fullContent) {
            const completeResponse: MessageResponse = {
              success: true,
              messages: [
                {
                  id: `msg_${Date.now()}_complete`,
                  role: 'assistant',
                  content: fullContent,
                  timestamp: new Date().toISOString()
                }
              ],
              conversationId: '',
              usage: undefined
            }
            onComplete(completeResponse)
          }
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        console.log(`[${new Date().toISOString()}] Frontend: Received chunk ${chunkCount}:`, chunk.length, 'bytes');
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim()
              console.log(`[${new Date().toISOString()}] Frontend: Processing line:`, jsonStr.substring(0, 100) + (jsonStr.length > 100 ? '...' : ''));
              
              if (jsonStr === '[DONE]') {
                console.log(`[${new Date().toISOString()}] Frontend: Received [DONE] signal`);
                // 流式响应完成
                return
              }
              
              const data = JSON.parse(jsonStr)
              
              if (data.type === 'start') {
                // 流式响应开始，可以在这里添加开始指示器
                console.log(`[${new Date().toISOString()}] Frontend: Stream started:`, data.message)
              } else if (data.type === 'reasoning' && data.content) {
                // 处理思考过程内容
                console.log(`[${new Date().toISOString()}] Frontend: Received reasoning:`, data.content.length, 'chars');
                if (onReasoning) {
                  onReasoning(data.content)
                }
              } else if (data.type === 'content' && data.content) {
                fullContent += data.content
                // 立即调用onContent，确保实时更新
                console.log(`[${new Date().toISOString()}] Frontend: Calling onContent with:`, data.content.length, 'chars, content:', JSON.stringify(data.content));
                onContent(data.content)
              } else if (data.type === 'done') {
                console.log(`[${new Date().toISOString()}] Frontend: Received done signal:`, data);
                // 流式响应完成，构造完整响应
                const completeResponse: MessageResponse = {
                  success: true,
                  messages: [
                    {
                      id: `msg_${Date.now()}_complete`,
                      role: 'assistant',
                      content: fullContent,
                      timestamp: new Date().toISOString(),
                      usage: data.usage
                    }
                  ],
                  conversationId: data.conversationId || '',
                  usage: data.usage
                }
                onComplete(completeResponse)
                return
              } else if (data.type === 'complete') {
                // 兼容旧的完成信号
                console.log(`[${new Date().toISOString()}] Frontend: Received complete signal:`, data);
                onComplete(data.response)
                return
              } else if (data.type === 'error') {
                console.error(`[${new Date().toISOString()}] Frontend: Received error:`, data.error);
                onError(data.error || '发送消息失败')
                return
              }
            } catch (e) {
              console.warn(`[${new Date().toISOString()}] Frontend: 解析流式数据失败:`, line, e)
            }
          }
        }
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Frontend: 流式消息发送失败:`, error)
      onError(error instanceof Error ? error.message : '发送消息失败')
    }
  }
}

/**
 * 用户相关API
 */
export const userApi = {
  /**
   * 获取用户资料
   */
  async getProfile(authHeader: string): Promise<{ success: boolean; user: User }> {
    return apiClient.get('/user/profile', {
      headers: { Authorization: authHeader }
    })
  },

  /**
   * 更新用户资料
   */
  async updateProfile(authHeader: string, data: Partial<User>): Promise<{ success: boolean; user: User }> {
    return apiClient.put('/user/profile', data, {
      headers: { Authorization: authHeader }
    })
  },

  /**
   * 获取用户设置
   */
  async getSettings(authHeader: string): Promise<{ success: boolean; settings: UserSettings }> {
    return apiClient.get('/user/settings', {
      headers: { Authorization: authHeader }
    })
  },

  /**
   * 更新用户设置
   */
  async updateSettings(authHeader: string, settings: Partial<UserSettings>): Promise<{ success: boolean; settings: UserSettings }> {
    return apiClient.put('/user/settings', { settings }, {
      headers: { Authorization: authHeader }
    })
  }
}

/**
 * 通用API错误处理
 */
export function handleApiError(error: any): string {
  if (error.response) {
    // 服务器响应错误
    const status = error.response.status
    const message = error.response.data?.message || error.response.data?.error || '服务器错误'
    
    switch (status) {
      case 400:
        return `请求错误: ${message}`
      case 401:
        return '未授权，请重新登录'
      case 403:
        return '权限不足'
      case 404:
        return '请求的资源不存在'
      case 429:
        return '请求过于频繁，请稍后再试'
      case 500:
        return '服务器内部错误'
      default:
        return `请求失败 (${status}): ${message}`
    }
  } else if (error.request) {
    // 网络错误
    return '网络连接失败，请检查网络设置'
  } else {
    // 其他错误
    return error.message || '未知错误'
  }
}

export default apiClient
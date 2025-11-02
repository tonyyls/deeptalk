/**
 * 聊天相关类型定义
 */

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  userId?: string
  model?: string
  usage?: TokenUsage
  error?: string
  reasoning?: ReasoningData
}

export interface ReasoningData {
  content: string
  title?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

export interface Conversation {
  id: string
  title: string
  userId: string
  createdAt: string
  updatedAt: string
  messageCount: number
  messages?: Message[]
  lastMessage?: {
    content: string
    timestamp: string
  }
}

export interface TokenUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface ChatRequest {
  message: string
  conversationId?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatResponse {
  success: boolean
  messages: Message[]
  conversationId: string
  usage?: TokenUsage
}

export interface ConversationRequest {
  title: string
  initialMessage?: string
}

export interface ConversationUpdateRequest {
  conversationId: string
  title?: string
}

export interface ConversationsResponse {
  success: boolean
  conversations: Conversation[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ConversationResponse {
  success: boolean
  conversation: Conversation
}

export interface MessageRequest {
  message: string
  conversationId?: string
  model?: string | {
    model: string
    temperature?: number
    maxTokens?: number
    streamResponse?: boolean
    showTimestamp?: boolean
    showTokenUsage?: boolean
  }
}

export interface MessageResponse {
  success: boolean
  messages: Message[]
  conversationId: string
  usage?: TokenUsage
}
import { verifyToken } from '../auth/verify.js';
import kv from '../../config/kv-adapter.js';

/**
 * 聊天消息处理API
 * 处理用户消息并调用GLM-4.6 API获取AI回复
 */
export default async function handler(req, res) {
  console.log(`[${new Date().toISOString()}] ===== MESSAGE API CALLED =====`);
  console.log(`[${new Date().toISOString()}] Method: ${req.method}`);
  console.log(`[${new Date().toISOString()}] Body:`, JSON.stringify(req.body, null, 2));
  
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 验证用户身份
    let user;
    try {
      user = await verifyToken(req);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: error.message
      });
    }

    const { message, conversationId, model } = req.body;

    // 模型名称映射函数
    const normalizeModelName = (modelName) => {
      const modelMap = {
        'glm-4-6': 'glm-4.6',
        'glm-4-plus': 'glm-4-plus',
        'glm-4-air': 'glm-4-air',
        'glm-4-airx': 'glm-4-airx',
        'glm-4-flash': 'glm-4-flash'
      };
      return modelMap[modelName] || modelName;
    };

    // 解析模型配置 - 支持字符串和对象格式
    let modelName, temperature, maxTokens, streamResponse;
    
    if (typeof model === 'string') {
      // 向后兼容：字符串格式
      modelName = normalizeModelName(model);
      temperature = 0.7;
      maxTokens = 2000;
      streamResponse = false;
      console.log(`[${new Date().toISOString()}] Model config (string): ${modelName}, streamResponse: ${streamResponse}`);
    } else if (typeof model === 'object' && model !== null) {
      // 新格式：对象格式
      const rawModelName = model.model || 'glm-4.6';
      modelName = normalizeModelName(rawModelName);
      temperature = typeof model.temperature === 'number' ? 
        Math.max(0, Math.min(2, model.temperature)) : 0.7;
      maxTokens = typeof model.maxTokens === 'number' ? 
        Math.max(1, Math.min(8000, model.maxTokens)) : 2000;
      streamResponse = Boolean(model.streamResponse);
      console.log(`[${new Date().toISOString()}] Model config (object): ${modelName}, streamResponse: ${streamResponse}, original: ${model.streamResponse}`);
    } else {
      // 默认值
      modelName = 'glm-4.6';
      temperature = 0.7;
      maxTokens = 2000;
      streamResponse = false;
      console.log(`[${new Date().toISOString()}] Model config (default): ${modelName}, streamResponse: ${streamResponse}`);
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid message',
        message: 'Message content is required and must be a non-empty string'
      });
    }

    // 检查GLM API配置
    const glmApiKey = process.env.GLM_API_KEY;
    const glmApiUrl = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    // 检查API密钥是否配置（允许本地开发使用模拟密钥）
    if (!glmApiKey || glmApiKey === 'your-glm-api-key-here') {
      return res.status(500).json({ 
        error: 'GLM API not configured',
        message: '请在 .env 文件中配置 GLM_API_KEY。本地开发可使用模拟密钥，生产环境请访问 https://open.bigmodel.cn/ 获取真实API Key。',
        code: 'API_KEY_NOT_CONFIGURED'
      });
    }

    // 从Vercel KV获取对话历史
    let conversationHistory = [];
    if (conversationId) {
      try {
        // 验证对话是否存在且属于当前用户
        const conversation = await kv.get(`conversation:${conversationId}`);
        if (!conversation || conversation.userId !== user.userId) {
          return res.status(403).json({ 
            error: 'Access denied',
            message: 'Conversation not found or access denied'
          });
        }

        // 获取对话消息历史
        const messageIds = await kv.lrange(`conversation_messages:${conversationId}`, -10, -1) || [];
        for (const messageId of messageIds) {
          const message = await kv.get(`message:${messageId}`);
          if (message) {
            conversationHistory.push({
              role: message.role,
              content: message.content
            });
          }
        }
      } catch (error) {
        console.error('Failed to get conversation history:', error);
        // 继续执行，使用空历史
      }
    }

    // 构建GLM API请求
    const glmRequest = {
      model: modelName,
      messages: [
        ...conversationHistory,
        {
          role: 'user',
          content: message.trim()
        }
      ],
      temperature: temperature,
      max_tokens: maxTokens,
      stream: streamResponse
    };

    // 根据模型版本添加思考过程控制参数
    if (modelName.includes('glm-4.6')) {
      // GLM-4.6 使用 enable_thinking 参数
      glmRequest.enable_thinking = true;
    } else if (modelName.includes('glm-4.5')) {
      // GLM-4.5 使用 thinking 对象参数
      glmRequest.thinking = { type: 'enabled' };
    }

    console.log(`[${new Date().toISOString()}] GLM API Request:`, {
      model: modelName,
      stream: streamResponse,
      messageCount: glmRequest.messages.length,
      temperature,
      maxTokens,
      thinking: glmRequest.thinking
    });
    
    console.log(`[${new Date().toISOString()}] Full GLM Request Body:`, JSON.stringify(glmRequest, null, 2));

    // 调用GLM API
    const glmResponse = await fetch(glmApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${glmApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(glmRequest),
    });

    if (!glmResponse.ok) {
      const errorData = await glmResponse.json().catch(() => ({}));
      console.error('GLM API error:', errorData);
      
      // 处理特定的API错误
      if (glmResponse.status === 401) {
        return res.status(500).json({ 
          error: 'GLM API认证失败',
          message: 'API Key无效或已过期。请检查 .env.local 文件中的 GLM_API_KEY 配置。访问 https://open.bigmodel.cn/ 获取有效的API Key。',
          code: 'API_KEY_INVALID',
          details: errorData.error?.message || '令牌验证失败'
        });
      }
      
      return res.status(500).json({ 
        error: 'AI service error',
        message: errorData.error?.message || 'Failed to get AI response',
        code: 'GLM_API_ERROR'
      });
    }

    // 处理流式响应
    if (streamResponse) {
      console.log(`[${new Date().toISOString()}] Starting streaming response...`);
      
      // 设置流式响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

      // 发送初始连接确认信号
      const startSignal = JSON.stringify({ type: 'start', message: 'Stream started' });
      console.log(`[${new Date().toISOString()}] Sending start signal:`, startSignal);
      res.write(`data: ${startSignal}\n\n`);
      if (res.flush) {
        res.flush();
      }

      let aiMessage = '';
      let usage = null;

      try {
        const reader = glmResponse.body.getReader();
        const decoder = new TextDecoder();
        console.log(`[${new Date().toISOString()}] GLM response reader created, starting to read stream...`);

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log(`[${new Date().toISOString()}] GLM stream ended`);
            break;
          }

          const chunk = decoder.decode(value);
          console.log(`[${new Date().toISOString()}] Received chunk:`, chunk.length, 'bytes');
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              console.log(`[${new Date().toISOString()}] GLM Response Line:`, data);
              
              if (data === '[DONE]') {
                console.log(`[${new Date().toISOString()}] Received [DONE] signal`);
                break;
              }

              try {
                const parsed = JSON.parse(data);
                console.log(`[${new Date().toISOString()}] Parsed GLM Response:`, JSON.stringify(parsed, null, 2));
                
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const delta = parsed.choices[0].delta;
                  console.log(`[${new Date().toISOString()}] Delta content:`, delta);
                  
                  // 处理思考过程内容 (GLM-4.6)
                  if (delta.reasoning_content) {
                    console.log(`[${new Date().toISOString()}] Found reasoning_content:`, delta.reasoning_content);
                    console.log(`[${new Date().toISOString()}] Sending reasoning:`, delta.reasoning_content.length, 'chars');
                    const reasoningData = JSON.stringify({ 
                      content: delta.reasoning_content, 
                      type: 'reasoning' 
                    });
                    res.write(`data: ${reasoningData}\n\n`);
                    if (res.flush) {
                      res.flush();
                    }
                  }
                  
                  // 处理正常回答内容
                  if (delta.content) {
                    console.log(`[${new Date().toISOString()}] Found content:`, delta.content);
                    aiMessage += delta.content;
                    // 发送流式数据到客户端
                    console.log(`[${new Date().toISOString()}] Sending content:`, delta.content.length, 'chars, content:', JSON.stringify(delta.content));
                    const contentData = JSON.stringify({ content: delta.content, type: 'content' });
                    res.write(`data: ${contentData}\n\n`);
                    // 立即刷新响应流，确保数据立即发送到客户端
                    if (res.flush) {
                      res.flush();
                    }
                  }
                }
                if (parsed.usage) {
                  usage = parsed.usage;
                  console.log(`[${new Date().toISOString()}] Received usage:`, usage);
                }
              } catch (e) {
                console.warn(`[${new Date().toISOString()}] Failed to parse GLM response:`, data, e.message);
              }
            }
          }
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Stream processing error:`, error);
        res.write(`data: ${JSON.stringify({ error: 'Stream processing failed', type: 'error' })}\n\n`);
        if (res.flush) {
          res.flush();
        }
        res.end();
        return;
      }

      // 确定最终的conversationId
      let finalConversationId = conversationId;
      if (!finalConversationId) {
        finalConversationId = `conv_${Date.now()}_${user.userId}`;
      }

      // 发送完成信号
      const doneSignal = { 
        type: 'done', 
        usage, 
        conversationId: finalConversationId 
      };
      console.log(`[${new Date().toISOString()}] Sending done signal:`, doneSignal);
      console.log(`[${new Date().toISOString()}] Total AI message length:`, aiMessage.length, 'chars');
      res.write(`data: ${JSON.stringify(doneSignal)}\n\n`);
      if (res.flush) {
        res.flush();
      }
      res.end();

      // 异步保存消息
      setImmediate(async () => {
        console.log(`[${new Date().toISOString()}] Saving messages asynchronously...`);
        await saveMessages(user, message, aiMessage, modelName, usage, finalConversationId);
      });

      return;
    }

    // 非流式响应处理
    console.log(`[${new Date().toISOString()}] Processing non-streaming response...`);
    const glmData = await glmResponse.json();
    
    if (!glmData.choices || glmData.choices.length === 0) {
      return res.status(500).json({ 
        error: 'Invalid AI response',
        message: 'No response from AI service'
      });
    }

    const aiMessage = glmData.choices[0].message.content;

    // 构建消息对象
    const userMessageObj = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
      userId: user.userId
    };

    const aiMessageObj = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date().toISOString(),
      model: modelName,
      usage: glmData.usage
    };

    // 保存消息到Vercel KV
    let finalConversationId = conversationId;
    
    // 如果没有提供conversationId，创建新对话
    if (!finalConversationId) {
      finalConversationId = `conv_${Date.now()}_${user.userId}`;
      const newConversation = {
        id: finalConversationId,
        title: message.trim().substring(0, 50) + (message.length > 50 ? '...' : ''),
        userId: user.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
      };
      
      await kv.set(`conversation:${finalConversationId}`, newConversation);
      await kv.lpush(`user_conversations:${user.userId}`, finalConversationId);
    }

    try {
      // 保存用户消息
      await kv.set(`message:${userMessageObj.id}`, userMessageObj);
      await kv.lpush(`conversation_messages:${finalConversationId}`, userMessageObj.id);
      
      // 保存AI消息
      await kv.set(`message:${aiMessageObj.id}`, aiMessageObj);
      await kv.lpush(`conversation_messages:${finalConversationId}`, aiMessageObj.id);
      
      // 更新对话的消息计数和最后更新时间
      const conversation = await kv.get(`conversation:${finalConversationId}`);
      if (conversation) {
        conversation.messageCount = (conversation.messageCount || 0) + 2;
        conversation.updatedAt = new Date().toISOString();
        conversation.lastMessage = {
          content: aiMessage.substring(0, 100) + (aiMessage.length > 100 ? '...' : ''),
          timestamp: aiMessageObj.timestamp
        };
        await kv.set(`conversation:${finalConversationId}`, conversation);
      }
      
      console.log('Messages saved successfully:', finalConversationId);
    } catch (error) {
      console.error('Failed to save messages:', error);
      // 继续执行，不阻断响应
    }

    // 返回响应
    res.status(200).json({
      success: true,
      messages: [userMessageObj, aiMessageObj],
      conversationId: finalConversationId,
      usage: glmData.usage
    });

  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process chat message'
    });
  }
}

/**
 * 保存消息到数据库
 */
async function saveMessages(user, userMessage, aiMessage, modelName, usage, conversationId) {
  try {
    // 构建消息对象
    const userMessageObj = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: userMessage.trim(),
      timestamp: new Date().toISOString(),
      userId: user.userId
    };

    const aiMessageObj = {
      id: `msg_${Date.now()}_ai`,
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date().toISOString(),
      model: modelName,
      usage: usage
    };

    // 保存消息到Vercel KV
    let finalConversationId = conversationId;
    
    // 如果没有提供conversationId，创建新对话
    if (!finalConversationId) {
      finalConversationId = `conv_${Date.now()}_${user.userId}`;
      const newConversation = {
        id: finalConversationId,
        title: userMessage.trim().substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
        userId: user.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0
      };
      
      await kv.set(`conversation:${finalConversationId}`, newConversation);
      await kv.lpush(`user_conversations:${user.userId}`, finalConversationId);
    }

    // 保存用户消息
    await kv.set(`message:${userMessageObj.id}`, userMessageObj);
    await kv.lpush(`conversation_messages:${finalConversationId}`, userMessageObj.id);
    
    // 保存AI消息
    await kv.set(`message:${aiMessageObj.id}`, aiMessageObj);
    await kv.lpush(`conversation_messages:${finalConversationId}`, aiMessageObj.id);
    
    // 更新对话的消息计数和最后更新时间
    const conversation = await kv.get(`conversation:${finalConversationId}`);
    if (conversation) {
      conversation.messageCount = (conversation.messageCount || 0) + 2;
      conversation.updatedAt = new Date().toISOString();
      conversation.lastMessage = {
        content: aiMessage.substring(0, 100) + (aiMessage.length > 100 ? '...' : ''),
        timestamp: aiMessageObj.timestamp
      };
      await kv.set(`conversation:${finalConversationId}`, conversation);
    }
    
    console.log('Messages saved successfully:', finalConversationId);
    return { userMessageObj, aiMessageObj, conversationId: finalConversationId };
  } catch (error) {
    console.error('Failed to save messages:', error);
    throw error;
  }
}
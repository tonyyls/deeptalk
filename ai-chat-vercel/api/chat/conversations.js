import { verifyToken } from '../auth/verify.js';
import kv from '../../config/kv-adapter.js';

/**
 * 对话管理API
 * 处理对话的创建、获取、更新、删除操作
 */
export default async function handler(req, res) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
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

    switch (req.method) {
      case 'GET':
        return await getConversations(req, res, user);
      case 'POST':
        return await createConversation(req, res, user);
      case 'PUT':
        return await updateConversation(req, res, user);
      case 'DELETE':
        return await deleteConversation(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Conversations API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process conversation request'
    });
  }
}

/**
 * 获取用户的所有对话
 */
async function getConversations(req, res, user) {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // 从Vercel KV获取用户对话列表
    const conversationIds = await kv.lrange(`user_conversations:${user.userId}`, 0, -1) || [];
    
    if (conversationIds.length === 0) {
      return res.status(200).json({
        success: true,
        conversations: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0
        }
      });
    }

    // 批量获取对话详情
    const conversations = [];
    for (const convId of conversationIds) {
      try {
        const conversation = await kv.get(`conversation:${convId}`);
        if (conversation) {
          conversations.push(conversation);
        }
      } catch (error) {
        console.error(`Failed to get conversation ${convId}:`, error);
      }
    }

    // 按更新时间排序
    conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // 分页处理
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedConversations = conversations.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      conversations: paginatedConversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: conversations.length,
        totalPages: Math.ceil(conversations.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      error: 'Failed to get conversations',
      message: error.message
    });
  }
}

/**
 * 创建新对话
 */
async function createConversation(req, res, user) {
  try {
    const { title, initialMessage } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid title',
        message: 'Conversation title is required'
      });
    }

    const conversation = {
      id: `conv_${Date.now()}_${user.userId}`,
      title: title.trim(),
      userId: user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      messages: []
    };

    // 保存对话到Vercel KV
    await kv.set(`conversation:${conversation.id}`, conversation);
    
    // 将对话ID添加到用户对话列表
    await kv.lpush(`user_conversations:${user.userId}`, conversation.id);
    
    console.log('Creating conversation:', conversation.id);

    res.status(201).json({
      success: true,
      conversation: conversation
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ 
      error: 'Failed to create conversation',
      message: error.message
    });
  }
}

/**
 * 更新对话信息（如重命名）
 */
async function updateConversation(req, res, user) {
  try {
    const { conversationId, title } = req.body;

    if (!conversationId) {
      return res.status(400).json({ 
        error: 'Conversation ID required',
        message: 'conversationId is required for update'
      });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid title',
        message: 'New title is required'
      });
    }

    // 从Vercel KV获取并更新对话
    const existingConversation = await kv.get(`conversation:${conversationId}`);
    if (!existingConversation) {
      return res.status(404).json({ 
        error: 'Conversation not found',
        message: 'The specified conversation does not exist'
      });
    }

    // 检查对话是否属于当前用户
    if (existingConversation.userId !== user.userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You do not have permission to update this conversation'
      });
    }

    const updatedConversation = {
      ...existingConversation,
      title: title.trim(),
      updatedAt: new Date().toISOString()
    };

    // 保存更新后的对话
    await kv.set(`conversation:${conversationId}`, updatedConversation);

    console.log('Updating conversation:', conversationId);

    res.status(200).json({
      success: true,
      conversation: updatedConversation
    });

  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ 
      error: 'Failed to update conversation',
      message: error.message
    });
  }
}

/**
 * 删除对话
 */
async function deleteConversation(req, res, user) {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ 
        error: 'Conversation ID required',
        message: 'conversationId is required for deletion'
      });
    }

    // 从Vercel KV获取对话信息
    const existingConversation = await kv.get(`conversation:${conversationId}`);
    if (!existingConversation) {
      return res.status(404).json({ 
        error: 'Conversation not found',
        message: 'The specified conversation does not exist'
      });
    }

    // 检查对话是否属于当前用户
    if (existingConversation.userId !== user.userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You do not have permission to delete this conversation'
      });
    }

    // 删除对话数据
    await kv.del(`conversation:${conversationId}`);
    
    // 从用户对话列表中移除
    await kv.lrem(`user_conversations:${user.userId}`, 0, conversationId);
    
    // 删除对话的所有消息
    const messageIds = await kv.lrange(`conversation_messages:${conversationId}`, 0, -1) || [];
    for (const messageId of messageIds) {
      await kv.del(`message:${messageId}`);
    }
    await kv.del(`conversation_messages:${conversationId}`);

    console.log('Deleting conversation:', conversationId);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
      conversationId: conversationId
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ 
      error: 'Failed to delete conversation',
      message: error.message
    });
  }
}
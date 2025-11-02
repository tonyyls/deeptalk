import { verifyToken } from '../auth/verify.js';
import kv from '../../config/kv-adapter.js';

/**
 * 用户资料管理API
 * 处理用户资料的获取和更新
 */
export default async function handler(req, res) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
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
        return await getUserProfile(req, res, user);
      case 'PUT':
        return await updateUserProfile(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('User profile API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process user profile request'
    });
  }
}

/**
 * 获取用户资料
 */
async function getUserProfile(req, res, user) {
  try {
    // 从Vercel KV获取完整用户资料
    const storedUser = await kv.get(`user:${user.userId}`);
    
    if (!storedUser) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found in database'
      });
    }

    // 获取用户统计信息
    const conversationIds = await kv.lrange(`user_conversations:${user.userId}`, 0, -1) || [];
    let totalMessages = 0;
    
    // 计算总消息数
    for (const convId of conversationIds) {
      const messageIds = await kv.lrange(`conversation_messages:${convId}`, 0, -1) || [];
      totalMessages += messageIds.length;
    }

    const userProfile = {
      ...storedUser,
      settings: storedUser.settings || {
        theme: 'light',
        language: 'zh-CN',
        notifications: {
          email: false,
          push: false
        },
        privacy: {
          showEmail: false,
          showProfile: true
        }
      },
      stats: {
        totalConversations: conversationIds.length,
        totalMessages: totalMessages,
        joinedAt: storedUser.createdAt
      }
    };

    res.status(200).json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get user profile',
      message: error.message
    });
  }
}

/**
 * 更新用户资料
 */
async function updateUserProfile(req, res, user) {
  try {
    const { 
      displayName, 
      bio, 
      location, 
      website, 
      settings 
    } = req.body;

    // 验证输入数据
    const updates = {};

    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.length > 100) {
        return res.status(400).json({ 
          error: 'Invalid display name',
          message: 'Display name must be a string with max 100 characters'
        });
      }
      updates.displayName = displayName.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 500) {
        return res.status(400).json({ 
          error: 'Invalid bio',
          message: 'Bio must be a string with max 500 characters'
        });
      }
      updates.bio = bio.trim();
    }

    if (location !== undefined) {
      if (typeof location !== 'string' || location.length > 100) {
        return res.status(400).json({ 
          error: 'Invalid location',
          message: 'Location must be a string with max 100 characters'
        });
      }
      updates.location = location.trim();
    }

    if (website !== undefined) {
      if (typeof website !== 'string' || website.length > 200) {
        return res.status(400).json({ 
          error: 'Invalid website',
          message: 'Website must be a string with max 200 characters'
        });
      }
      // 简单的URL验证
      if (website && !website.match(/^https?:\\/\\/.+/)) {
        return res.status(400).json({ 
          error: 'Invalid website URL',
          message: 'Website must be a valid HTTP/HTTPS URL'
        });
      }
      updates.website = website.trim();
    }

    if (settings !== undefined) {
      if (typeof settings !== 'object' || settings === null) {
        return res.status(400).json({ 
          error: 'Invalid settings',
          message: 'Settings must be an object'
        });
      }
      updates.settings = settings;
    }

    updates.updatedAt = new Date().toISOString();

    // 更新用户资料到Vercel KV
    const storedUser = await kv.get(`user:${user.userId}`);
    if (!storedUser) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found in database'
      });
    }

    const updatedUser = {
      ...storedUser,
      ...updates
    };

    await kv.set(`user:${user.userId}`, updatedUser);
    console.log('User profile updated:', user.userId);

    // 返回更新后的用户资料
    const updatedProfile = {
      id: user.userId,
      username: user.username,
      ...updates
    };

    res.status(200).json({
      success: true,
      user: updatedProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update user profile',
      message: error.message
    });
  }
}
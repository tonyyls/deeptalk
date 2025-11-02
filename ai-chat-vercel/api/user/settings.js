import { verifyToken } from '../auth/verify.js';
import kv from '../../config/kv-adapter.js';

/**
 * 用户设置管理API
 * 处理用户设置的获取和更新
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
        return await getUserSettings(req, res, user);
      case 'PUT':
        return await updateUserSettings(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('User settings API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process user settings request'
    });
  }
}

/**
 * 获取用户设置
 */
async function getUserSettings(req, res, user) {
  try {
    // 从Vercel KV获取用户设置
    const storedUser = await kv.get(`user:${user.userId}`);
    const userSettings = storedUser?.settings;
    
    const defaultSettings = {
      theme: 'light', // light, dark, auto
      language: 'zh-CN', // zh-CN, en-US
      fontSize: 'medium', // small, medium, large
      chatSettings: {
        model: 'glm-4.6',
        temperature: 0.7,
        maxTokens: 2000,
        streamResponse: false,
        showTimestamp: true,
        showTokenUsage: false
      },
      notifications: {
        email: false,
        push: false,
        sound: true
      },
      privacy: {
        showEmail: false,
        showProfile: true,
        allowDataCollection: false
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReader: false
      }
    };

    // 合并默认设置和用户设置
    const finalSettings = {
      ...defaultSettings,
      ...userSettings
    };

    res.status(200).json({
      success: true,
      settings: finalSettings
    });

  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({ 
      error: 'Failed to get user settings',
      message: error.message
    });
  }
}

/**
 * 更新用户设置
 */
async function updateUserSettings(req, res, user) {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid settings',
        message: 'Settings object is required'
      });
    }

    // 验证设置字段
    const validatedSettings = {};

    // 主题设置
    if (settings.theme !== undefined) {
      if (!['light', 'dark', 'auto'].includes(settings.theme)) {
        return res.status(400).json({ 
          error: 'Invalid theme',
          message: 'Theme must be one of: light, dark, auto'
        });
      }
      validatedSettings.theme = settings.theme;
    }

    // 语言设置
    if (settings.language !== undefined) {
      if (!['zh-CN', 'en-US'].includes(settings.language)) {
        return res.status(400).json({ 
          error: 'Invalid language',
          message: 'Language must be one of: zh-CN, en-US'
        });
      }
      validatedSettings.language = settings.language;
    }

    // 字体大小设置
    if (settings.fontSize !== undefined) {
      if (!['small', 'medium', 'large'].includes(settings.fontSize)) {
        return res.status(400).json({ 
          error: 'Invalid font size',
          message: 'Font size must be one of: small, medium, large'
        });
      }
      validatedSettings.fontSize = settings.fontSize;
    }

    // 聊天设置
    if (settings.chatSettings !== undefined) {
      const chatSettings = {};
      
      if (settings.chatSettings.model !== undefined) {
        if (!['glm-4.6', 'glm-4'].includes(settings.chatSettings.model)) {
          return res.status(400).json({ 
            error: 'Invalid model',
            message: 'Model must be one of: glm-4.6, glm-4'
          });
        }
        chatSettings.model = settings.chatSettings.model;
      }

      if (settings.chatSettings.temperature !== undefined) {
        const temp = parseFloat(settings.chatSettings.temperature);
        if (isNaN(temp) || temp < 0 || temp > 2) {
          return res.status(400).json({ 
            error: 'Invalid temperature',
            message: 'Temperature must be a number between 0 and 2'
          });
        }
        chatSettings.temperature = temp;
      }

      if (settings.chatSettings.maxTokens !== undefined) {
        const tokens = parseInt(settings.chatSettings.maxTokens);
        if (isNaN(tokens) || tokens < 100 || tokens > 4000) {
          return res.status(400).json({ 
            error: 'Invalid max tokens',
            message: 'Max tokens must be a number between 100 and 4000'
          });
        }
        chatSettings.maxTokens = tokens;
      }

      if (settings.chatSettings.streamResponse !== undefined) {
        chatSettings.streamResponse = Boolean(settings.chatSettings.streamResponse);
      }

      if (settings.chatSettings.showTimestamp !== undefined) {
        chatSettings.showTimestamp = Boolean(settings.chatSettings.showTimestamp);
      }

      if (settings.chatSettings.showTokenUsage !== undefined) {
        chatSettings.showTokenUsage = Boolean(settings.chatSettings.showTokenUsage);
      }

      if (Object.keys(chatSettings).length > 0) {
        validatedSettings.chatSettings = chatSettings;
      }
    }

    // 通知设置
    if (settings.notifications !== undefined) {
      const notifications = {};
      
      if (settings.notifications.email !== undefined) {
        notifications.email = Boolean(settings.notifications.email);
      }
      
      if (settings.notifications.push !== undefined) {
        notifications.push = Boolean(settings.notifications.push);
      }
      
      if (settings.notifications.sound !== undefined) {
        notifications.sound = Boolean(settings.notifications.sound);
      }

      if (Object.keys(notifications).length > 0) {
        validatedSettings.notifications = notifications;
      }
    }

    // 隐私设置
    if (settings.privacy !== undefined) {
      const privacy = {};
      
      if (settings.privacy.showEmail !== undefined) {
        privacy.showEmail = Boolean(settings.privacy.showEmail);
      }
      
      if (settings.privacy.showProfile !== undefined) {
        privacy.showProfile = Boolean(settings.privacy.showProfile);
      }
      
      if (settings.privacy.allowDataCollection !== undefined) {
        privacy.allowDataCollection = Boolean(settings.privacy.allowDataCollection);
      }

      if (Object.keys(privacy).length > 0) {
        validatedSettings.privacy = privacy;
      }
    }

    // 无障碍设置
    if (settings.accessibility !== undefined) {
      const accessibility = {};
      
      if (settings.accessibility.highContrast !== undefined) {
        accessibility.highContrast = Boolean(settings.accessibility.highContrast);
      }
      
      if (settings.accessibility.reducedMotion !== undefined) {
        accessibility.reducedMotion = Boolean(settings.accessibility.reducedMotion);
      }
      
      if (settings.accessibility.screenReader !== undefined) {
        accessibility.screenReader = Boolean(settings.accessibility.screenReader);
      }

      if (Object.keys(accessibility).length > 0) {
        validatedSettings.accessibility = accessibility;
      }
    }

    validatedSettings.updatedAt = new Date().toISOString();

    // 保存设置到Vercel KV
    const storedUser = await kv.get(`user:${user.userId}`);
    if (!storedUser) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User profile not found in database'
      });
    }

    // 合并现有设置和新设置
    const updatedSettings = {
      ...storedUser.settings,
      ...validatedSettings
    };

    const updatedUser = {
      ...storedUser,
      settings: updatedSettings,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.userId}`, updatedUser);
    console.log('User settings updated:', user.userId);

    res.status(200).json({
      success: true,
      settings: updatedSettings,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({ 
      error: 'Failed to update user settings',
      message: error.message
    });
  }
}
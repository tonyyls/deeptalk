import jwt from 'jsonwebtoken';
import kv from '../../config/kv-adapter.js';

/**
 * GitHub OAuth2回调处理
 * 处理GitHub返回的授权码，获取用户信息并生成JWT token
 */
export default async function handler(req, res) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ 
        error: 'Authorization code missing',
        message: 'GitHub authorization code is required'
      });
    }

    // GitHub OAuth配置 - 完全依赖环境变量
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production_for_security';

    // 检查必需的环境变量
    const missingVars = [];
    if (!clientId) missingVars.push('GITHUB_CLIENT_ID');
    if (!clientSecret) missingVars.push('GITHUB_CLIENT_SECRET');

    if (missingVars.length > 0) {
      return res.status(500).json({ 
        error: 'Server configuration missing',
        message: `Missing environment variables: ${missingVars.join(', ')}`,
        instructions: {
          step1: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          step2: 'Add the missing environment variables with your GitHub OAuth App credentials',
          step3: 'Environment variables will be applied automatically without redeployment',
          missingVariables: missingVars
        }
      });
    }

    // 1. 使用授权码获取访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({ 
        error: 'Failed to get access token',
        message: tokenData.error_description || 'GitHub OAuth failed'
      });
    }

    // 2. 使用访问令牌获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();

    if (!userData.id) {
      return res.status(400).json({ 
        error: 'Failed to get user data',
        message: 'Unable to retrieve user information from GitHub'
      });
    }

    // 3. 构建用户对象
    const user = {
      id: `user_${userData.id}`,
      githubId: userData.id,
      username: userData.login,
      displayName: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      email: userData.email,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // 4. 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        githubId: user.githubId,
        username: user.username 
      },
      jwtSecret,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'ai-chat-vercel',
        audience: 'ai-chat-users'
      }
    );

    // 5. 将用户信息存储到Vercel KV
    try {
      // 存储用户信息
      await kv.set(`user:${user.id}`, user);
      
      // 创建GitHub ID到用户ID的映射
      await kv.set(`github:${user.githubId}`, user.id);
      
      // 存储用户会话
      const sessionId = `session:${user.id}:${Date.now()}`;
      await kv.set(sessionId, {
        userId: user.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
      }, { ex: 7 * 24 * 60 * 60 }); // 设置过期时间
      
      console.log('User data stored successfully:', user.id);
    } catch (kvError) {
      console.error('Failed to store user data:', kvError);
      // 继续执行，不阻断登录流程
    }

    // 6. 返回成功响应
    const response = {
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        email: user.email
      }
    };

    // 动态获取前端应用URL
    const getFrontendUrl = () => {
      // 优先使用环境变量
      if (process.env.APP_URL) {
        return process.env.APP_URL;
      }
      
      // 从请求头获取origin
      if (req.headers.origin) {
        return req.headers.origin;
      }
      
      // 从请求头获取host并构建URL
      if (req.headers.host) {
        const protocol = req.headers.host.includes('vercel.app') || req.headers.host.includes('localhost') === false ? 'https' : 'http';
        return `${protocol}://${req.headers.host}`;
      }
      
      // 最后的fallback
      return 'http://localhost:3000';
    };
    
    const frontendUrl = getFrontendUrl();
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(response.user))}`;
    
    res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    
    // 动态获取前端应用URL（错误处理）
    const getFrontendUrl = () => {
      if (process.env.APP_URL) return process.env.APP_URL;
      if (req.headers.origin) return req.headers.origin;
      if (req.headers.host) {
        const protocol = req.headers.host.includes('vercel.app') || req.headers.host.includes('localhost') === false ? 'https' : 'http';
        return `${protocol}://${req.headers.host}`;
      }
      return 'http://localhost:3000';
    };
    
    const frontendUrl = getFrontendUrl();
    const errorUrl = `${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`;
    
    res.redirect(302, errorUrl);
  }
}
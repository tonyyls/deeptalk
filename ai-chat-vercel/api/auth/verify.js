import jwt from 'jsonwebtoken';
import kv from '../../config/kv-adapter.js';

/**
 * JWT token验证API
 * 验证用户token的有效性
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

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 开发模式绕过认证
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
      const mockUser = {
        id: 'dev-user-001',
        githubId: 12345,
        username: 'dev-user',
        displayName: '开发测试用户',
        avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4',
        email: 'dev@example.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        user: mockUser,
        message: '开发模式：使用模拟用户身份'
      });
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.body.token;

    if (!token) {
      return res.status(401).json({ 
        error: 'Token missing',
        message: 'Authorization token is required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'JWT secret not configured'
      });
    }

    // 验证JWT token
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'ai-chat-vercel',
      audience: 'ai-chat-users'
    });

    // 检查token是否过期
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    // 从Vercel KV获取最新用户信息
    let user;
    try {
      user = await kv.get(`user:${decoded.userId}`);
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found',
          message: 'User data not found in database'
        });
      }
    } catch (kvError) {
      console.error('Failed to fetch user data:', kvError);
      // 如果KV查询失败，使用token中的基本信息
      user = {
        id: decoded.userId,
        githubId: decoded.githubId,
        username: decoded.username,
      };
    }

    res.status(200).json({
      success: true,
      valid: true,
      user: user,
      tokenInfo: {
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        issuer: decoded.iss,
        audience: decoded.aud
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token is malformed or invalid'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again'
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Token verification failed'
    });
  }
}

/**
 * JWT验证中间件函数
 * 用于其他API路由的认证检查
 */
export async function verifyToken(req) {
  // 开发模式绕过认证
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true') {
    return {
      userId: 'dev-user-001',
      githubId: 12345,
      username: 'dev-user',
      displayName: '开发测试用户',
      avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4',
      email: 'dev@example.com'
    };
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    throw new Error('Token missing');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT secret not configured');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'ai-chat-vercel',
      audience: 'ai-chat-users'
    });

    return {
      userId: decoded.userId,
      githubId: decoded.githubId,
      username: decoded.username
    };
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}
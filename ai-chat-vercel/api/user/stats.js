import { verifyToken } from '../auth/verify.js';
import kv from '../../config/kv-adapter.js';

/**
 * 用户统计API
 * 提供平台用户数量统计信息
 */
export default async function handler(req, res) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 验证用户身份（可选：根据需要决定是否需要管理员权限）
    let user;
    try {
      user = await verifyToken(req);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: '需要登录才能查看统计信息'
      });
    }

    // 获取用户统计信息
    const stats = await getUserStats();
    
    return res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('User stats API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: '获取用户统计信息失败'
    });
  }
}

/**
 * 获取用户统计信息
 * @returns {Promise<Object>} 统计数据对象
 */
async function getUserStats() {
  try {
    // 获取所有用户数据
    const allUsers = await getAllUsers();
    
    // 计算各种统计数据
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const activeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let totalUsers = 0;
    let todayNewUsers = 0;
    let weekNewUsers = 0;
    let monthNewUsers = 0;
    let activeUsers = 0;

    for (const user of allUsers) {
      if (!user || !user.createdAt) continue;
      
      totalUsers++;
      
      const createdAt = new Date(user.createdAt);
      const lastLoginAt = user.lastLoginAt ? new Date(user.lastLoginAt) : createdAt;
      
      // 今日新增用户
      if (createdAt >= todayStart) {
        todayNewUsers++;
      }
      
      // 本周新增用户
      if (createdAt >= weekStart) {
        weekNewUsers++;
      }
      
      // 本月新增用户
      if (createdAt >= monthStart) {
        monthNewUsers++;
      }
      
      // 活跃用户（最近7天有登录）
      if (lastLoginAt >= activeThreshold) {
        activeUsers++;
      }
    }

    return {
      total: totalUsers,
      newUsers: {
        today: todayNewUsers,
        thisWeek: weekNewUsers,
        thisMonth: monthNewUsers
      },
      activeUsers: {
        last7Days: activeUsers
      },
      growth: {
        dailyGrowthRate: totalUsers > 0 ? ((todayNewUsers / totalUsers) * 100).toFixed(2) : '0.00',
        weeklyGrowthRate: totalUsers > 0 ? ((weekNewUsers / totalUsers) * 100).toFixed(2) : '0.00',
        monthlyGrowthRate: totalUsers > 0 ? ((monthNewUsers / totalUsers) * 100).toFixed(2) : '0.00'
      },
      engagement: {
        activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : '0.00'
      }
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    throw error;
  }
}

/**
 * 获取所有用户数据
 * @returns {Promise<Array>} 用户数组
 */
async function getAllUsers() {
  try {
    const users = [];
    
    // 由于KV存储的限制，我们需要通过扫描来获取所有用户
    // 这里使用一个简化的方法，在实际生产环境中可能需要更高效的索引策略
    
    // 尝试获取用户索引（如果存在）
    let userIndex;
    try {
      userIndex = await kv.get('user:index');
    } catch (error) {
      console.log('No user index found, will scan for users');
    }
    
    if (userIndex && Array.isArray(userIndex)) {
      // 如果有用户索引，直接使用
      for (const userId of userIndex) {
        try {
          const user = await kv.get(`user:${userId}`);
          if (user) {
            users.push(user);
          }
        } catch (error) {
          console.warn(`Failed to get user ${userId}:`, error);
        }
      }
    } else {
      // 如果没有索引，尝试扫描（这是一个备用方案）
      // 注意：这种方法在大量用户时效率较低
      console.log('Scanning for users (this may be slow with many users)');
      
      // 尝试一些常见的用户ID模式
      for (let i = 1; i <= 10000; i++) {
        try {
          const user = await kv.get(`user:${i}`);
          if (user) {
            users.push(user);
          }
        } catch (error) {
          // 忽略不存在的用户
        }
        
        // 如果连续100个ID都不存在，可能已经扫描完了
        if (i > 100 && users.length === 0) {
          break;
        }
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

/**
 * 更新用户索引（在用户注册时调用）
 * @param {string} userId 用户ID
 */
export async function updateUserIndex(userId) {
  try {
    let userIndex = await kv.get('user:index') || [];
    if (!Array.isArray(userIndex)) {
      userIndex = [];
    }
    
    if (!userIndex.includes(userId)) {
      userIndex.push(userId);
      await kv.set('user:index', userIndex);
    }
  } catch (error) {
    console.error('Error updating user index:', error);
  }
}
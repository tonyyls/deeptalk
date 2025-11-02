/**
 * Redis配置文件
 * 支持多种Redis服务提供商的配置
 */

/**
 * Redis配置预设
 * 包含常见Redis服务提供商的配置模板
 */
export const redisPresets = {
  // Upstash Redis (推荐用于Vercel)
  upstash: {
    name: 'Upstash Redis',
    description: 'Serverless Redis for edge computing',
    envVars: ['REDIS_URL'],
    getConfig: () => ({
      url: process.env.REDIS_URL,
      // Upstash特定配置
      retry_delay_on_failover: 100,
      max_retry_delay: 1000,
    }),
    example: {
      REDIS_URL: 'redis://default:your-password@your-endpoint.upstash.io:6379'
    }
  },

  // Redis Cloud
  redisCloud: {
    name: 'Redis Cloud',
    description: 'Fully managed Redis service',
    envVars: ['REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'],
    getConfig: () => ({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        tls: process.env.REDIS_TLS === 'true',
      },
      password: process.env.REDIS_PASSWORD,
      // Redis Cloud特定配置
      retry_delay_on_failover: 100,
      max_retry_delay: 2000,
    }),
    example: {
      REDIS_HOST: 'redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com',
      REDIS_PORT: '12345',
      REDIS_PASSWORD: 'your-password',
      REDIS_TLS: 'true'
    }
  },

  // AWS ElastiCache
  elasticache: {
    name: 'AWS ElastiCache',
    description: 'Amazon managed Redis service',
    envVars: ['REDIS_HOST', 'REDIS_PORT'],
    getConfig: () => ({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      // ElastiCache通常不需要密码（在VPC内）
      // 如果启用了AUTH，添加password配置
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    }),
    example: {
      REDIS_HOST: 'your-cluster.cache.amazonaws.com',
      REDIS_PORT: '6379',
      // REDIS_PASSWORD: 'optional-auth-token'
    }
  },

  // 阿里云Redis
  aliyun: {
    name: '阿里云Redis',
    description: '阿里云ApsaraDB for Redis',
    envVars: ['REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'],
    getConfig: () => ({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD,
      // 阿里云特定配置
      retry_delay_on_failover: 100,
      max_retry_delay: 1500,
    }),
    example: {
      REDIS_HOST: 'r-bp1xxxxxxxxxxxxx.redis.rds.aliyuncs.com',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: 'your-password'
    }
  },

  // 腾讯云Redis
  tencent: {
    name: '腾讯云Redis',
    description: '腾讯云TencentDB for Redis',
    envVars: ['REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'],
    getConfig: () => ({
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD,
      // 腾讯云特定配置
      retry_delay_on_failover: 100,
      max_retry_delay: 1500,
    }),
    example: {
      REDIS_HOST: 'crs-xxxxxxxxx.tencentcdb.com',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: 'your-password'
    }
  },

  // 自建Redis服务器
  selfHosted: {
    name: '自建Redis',
    description: 'Self-hosted Redis server',
    envVars: ['REDIS_HOST', 'REDIS_PORT'],
    getConfig: () => ({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      ...(process.env.REDIS_USERNAME && { username: process.env.REDIS_USERNAME }),
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
      // 自建服务器配置
      retry_delay_on_failover: 100,
      max_retry_delay: 1000,
    }),
    example: {
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_USERNAME: 'default', // Redis 6.0+ ACL用户名（可选）
      REDIS_PASSWORD: 'your-password' // 可选
    }
  },

  // Railway Redis
  railway: {
    name: 'Railway Redis',
    description: 'Railway managed Redis service',
    envVars: ['REDIS_URL'],
    getConfig: () => ({
      url: process.env.REDIS_URL,
    }),
    example: {
      REDIS_URL: 'redis://default:password@redis.railway.internal:6379'
    }
  },

  // Render Redis
  render: {
    name: 'Render Redis',
    description: 'Render managed Redis service',
    envVars: ['REDIS_URL'],
    getConfig: () => ({
      url: process.env.REDIS_URL,
    }),
    example: {
      REDIS_URL: 'redis://red-xxxxxxxxxxxxx:6379'
    }
  }
};

/**
 * 获取Redis配置
 * @param {string} preset - 预设名称
 * @returns {object} Redis客户端配置
 */
export function getRedisConfig(preset = 'upstash') {
  const presetConfig = redisPresets[preset];
  
  if (!presetConfig) {
    throw new Error(`Unknown Redis preset: ${preset}. Available presets: ${Object.keys(redisPresets).join(', ')}`);
  }

  // 检查必需的环境变量
  const missingVars = presetConfig.envVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.trim() === '';
  });

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables for ${presetConfig.name}: ${missingVars.join(', ')}`);
  }

  return presetConfig.getConfig();
}

/**
 * 自动检测Redis配置类型
 * 根据环境变量自动选择合适的预设
 * @returns {string} 检测到的预设名称
 */
export function detectRedisPreset() {
  // 检查是否有REDIS_URL（优先使用URL格式）
  if (process.env.REDIS_URL) {
    const url = process.env.REDIS_URL.toLowerCase();
    
    if (url.includes('upstash.io')) {
      return 'upstash';
    } else if (url.includes('railway.internal')) {
      return 'railway';
    } else if (url.includes('render.com')) {
      return 'render';
    } else {
      return 'selfHosted'; // 通用URL格式
    }
  }

  // 检查分离的配置参数
  if (process.env.REDIS_HOST) {
    const host = process.env.REDIS_HOST.toLowerCase();
    
    if (host.includes('redislabs.com') || host.includes('cloud.redislabs.com')) {
      return 'redisCloud';
    } else if (host.includes('cache.amazonaws.com')) {
      return 'elasticache';
    } else if (host.includes('redis.rds.aliyuncs.com')) {
      return 'aliyun';
    } else if (host.includes('tencentcdb.com')) {
      return 'tencent';
    } else {
      return 'selfHosted';
    }
  }

  // 默认返回upstash（最适合Vercel）
  return 'upstash';
}

/**
 * 验证Redis连接配置
 * @param {string} preset - 预设名称
 * @returns {object} 验证结果
 */
export function validateRedisConfig(preset) {
  try {
    const config = getRedisConfig(preset);
    const presetInfo = redisPresets[preset];
    
    return {
      valid: true,
      preset: preset,
      name: presetInfo.name,
      description: presetInfo.description,
      config: config,
      requiredVars: presetInfo.envVars
    };
  } catch (error) {
    return {
      valid: false,
      preset: preset,
      error: error.message,
      requiredVars: redisPresets[preset]?.envVars || []
    };
  }
}

/**
 * 获取所有可用的Redis预设信息
 * @returns {object} 预设信息列表
 */
export function getAvailablePresets() {
  return Object.entries(redisPresets).map(([key, preset]) => ({
    key,
    name: preset.name,
    description: preset.description,
    requiredVars: preset.envVars,
    example: preset.example
  }));
}
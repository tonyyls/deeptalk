/**
 * 生产环境配置
 * 包含所有必要的环境变量和默认值
 */

export const PRODUCTION_CONFIG = {
  // GitHub OAuth配置
  GITHUB_CLIENT_ID: 'Ov23liJhqKKGJJJJJJJJ', // 请替换为您的实际Client ID
  GITHUB_CLIENT_SECRET: '', // 需要在Vercel环境变量中配置
  GITHUB_CALLBACK_URL: 'https://deeptalk-hax4yhx6q-tonyyls-projects.vercel.app/api/auth/callback',
  
  // JWT配置
  JWT_SECRET: 'your_super_secret_jwt_key_at_least_32_characters_long_for_security',
  JWT_EXPIRES_IN: '7d',
  
  // GLM API配置
  GLM_API_KEY: '', // 需要在Vercel环境变量中配置
  GLM_API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  
  // 应用配置
  APP_NAME: 'DeepTalk',
  APP_URL: 'https://deeptalk-hax4yhx6q-tonyyls-projects.vercel.app',
  
  // 功能开关
  ENABLE_REGISTRATION: true,
  ENABLE_CHAT_HISTORY: true,
  ENABLE_USER_SETTINGS: true
};

/**
 * 获取环境变量值，支持默认值
 * @param {string} key - 环境变量键名
 * @param {string} defaultValue - 默认值
 * @returns {string} 环境变量值或默认值
 */
export function getEnvVar(key, defaultValue = '') {
  return process.env[key] || PRODUCTION_CONFIG[key] || defaultValue;
}

/**
 * 验证必需的环境变量
 * @returns {Object} 验证结果
 */
export function validateConfig() {
  const required = [
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'JWT_SECRET'
  ];
  
  const missing = [];
  const warnings = [];
  
  for (const key of required) {
    const value = getEnvVar(key);
    if (!value || value.includes('your_') || value.includes('please_')) {
      missing.push(key);
    }
  }
  
  // 检查可选但推荐的配置
  if (!getEnvVar('GLM_API_KEY')) {
    warnings.push('GLM_API_KEY not configured - AI chat functionality will be limited');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
}
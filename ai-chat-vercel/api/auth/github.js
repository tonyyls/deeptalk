/**
 * GitHub OAuth2登录处理
 * 重定向到GitHub授权页面
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

    // GitHub OAuth配置 - 完全依赖环境变量
    const clientId = process.env.GITHUB_CLIENT_ID;
    
    // 动态获取回调URL
    const getCallbackUrl = () => {
      // 优先使用环境变量
      if (process.env.GITHUB_CALLBACK_URL) {
        return process.env.GITHUB_CALLBACK_URL;
      }
      
      // 从请求头动态构建
      if (req.headers.origin) {
        return `${req.headers.origin}/api/auth/callback`;
      }
      
      if (req.headers.host) {
        const protocol = req.headers.host.includes('vercel.app') || req.headers.host.includes('localhost') === false ? 'https' : 'http';
        return `${protocol}://${req.headers.host}/api/auth/callback`;
      }
      
      // 默认使用固定的生产地址
      return 'https://deeptalk-seven.vercel.app/api/auth/callback';
    };
    
    const callbackUrl = getCallbackUrl();

    // 如果没有配置Client ID，返回配置指南
    if (!clientId) {
      return res.status(500).json({ 
        error: 'GitHub OAuth configuration missing',
        message: 'Please configure GITHUB_CLIENT_ID in Vercel environment variables',
        instructions: {
          step1: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          step2: 'Add GITHUB_CLIENT_ID with your GitHub OAuth App Client ID',
          step3: 'Add GITHUB_CLIENT_SECRET with your GitHub OAuth App Client Secret',
          step4: 'Redeploy will happen automatically after saving environment variables'
        }
      });
    }

    // 生成随机state参数防止CSRF攻击
    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);

    // 构建GitHub OAuth授权URL
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', clientId);
    githubAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    githubAuthUrl.searchParams.set('scope', 'user:email');
    githubAuthUrl.searchParams.set('state', state);

    // 重定向到GitHub授权页面
    res.redirect(302, githubAuthUrl.toString());

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to initiate GitHub OAuth flow'
    });
  }
}
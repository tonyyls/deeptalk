/**
 * 本地开发服务器
 * 用于在开发环境中处理API路由
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 动态导入API路由
async function setupRoutes() {
  try {
    // 聊天消息路由
    console.log('Loading chat message handler...');
    const { default: chatMessageHandler } = await import('../api/chat/message.js');
    app.post('/api/chat/message', chatMessageHandler);
    console.log('✅ Chat message route loaded');
    
    // 聊天对话路由
    console.log('Loading chat conversations handler...');
    const { default: chatConversationsHandler } = await import('../api/chat/conversations.js');
    app.get('/api/chat/conversations', chatConversationsHandler);
    app.post('/api/chat/conversations', chatConversationsHandler);
    app.put('/api/chat/conversations/:id', chatConversationsHandler);
    app.delete('/api/chat/conversations/:id', chatConversationsHandler);
    console.log('✅ Chat conversations routes loaded');
    
    console.log('✅ All API routes loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load API routes:', error);
    console.error('Error stack:', error.stack);
  }
}

// 启动服务器
async function startServer() {
  await setupRoutes();
  
  // 健康检查端点
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // 404处理 - 必须在所有路由之后
  app.use('/api', (req, res) => {
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path 
    });
  });

  // 错误处理中间件
  app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  });
  
  app.listen(PORT, () => {
    console.log(`🚀 Development API server running on http://localhost:${PORT}`);
    console.log(`📡 CORS enabled for: http://localhost:3000`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);
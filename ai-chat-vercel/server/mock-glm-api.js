/**
 * 模拟GLM API服务
 * 用于本地开发环境，提供模拟的AI响应
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// 模拟的AI响应内容
const mockResponses = [
  "你好！我是DeepTalk AI助手，很高兴为您服务。我可以帮助您解答问题、进行对话交流。请问有什么我可以帮助您的吗？",
  "感谢您使用DeepTalk！我是一个AI助手，专门设计来与用户进行智能对话。我可以回答各种问题，提供信息，或者只是和您聊天。",
  "您好！我是基于大语言模型的AI助手。我可以帮助您处理文本相关的任务，回答问题，或者进行创意讨论。有什么我可以为您做的吗？",
  "欢迎使用DeepTalk AI聊天应用！我是您的智能对话伙伴，可以就各种话题与您交流。请随时告诉我您想聊什么。",
  "很高兴见到您！我是DeepTalk的AI助手，拥有广泛的知识库，可以帮助您解决问题或进行有趣的对话。"
];

// 获取随机响应
function getRandomResponse(userMessage) {
  // 根据用户消息内容选择合适的响应
  if (userMessage.includes('你好') || userMessage.includes('hello') || userMessage.includes('hi')) {
    return mockResponses[0];
  }
  
  if (userMessage.includes('介绍') || userMessage.includes('自己')) {
    return mockResponses[1];
  }
  
  // 默认随机选择
  const randomIndex = Math.floor(Math.random() * mockResponses.length);
  return mockResponses[randomIndex];
}

// 模拟流式响应
function createStreamResponse(message, res) {
  const response = getRandomResponse(message);
  const words = response.split('');
  let index = 0;

  // 发送开始信号
  res.write(`data: {"choices":[{"delta":{"content":""},"index":0}]}\n\n`);

  const interval = setInterval(() => {
    if (index < words.length) {
      const chunk = {
        choices: [{
          delta: {
            content: words[index]
          },
          index: 0
        }]
      };
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      index++;
    } else {
      // 发送结束信号
      const endChunk = {
        choices: [{
          delta: {},
          index: 0,
          finish_reason: "stop"
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: response.length,
          total_tokens: 10 + response.length
        }
      };
      res.write(`data: ${JSON.stringify(endChunk)}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
      clearInterval(interval);
    }
  }, 50); // 每50ms发送一个字符
}

// GLM API兼容的聊天接口
app.post('/api/paas/v4/chat/completions', (req, res) => {
  console.log('Mock GLM API called:', req.body);
  
  const { messages, stream = false } = req.body;
  const userMessage = messages[messages.length - 1]?.content || '';

  if (stream) {
    // 流式响应
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    createStreamResponse(userMessage, res);
  } else {
    // 非流式响应
    const response = getRandomResponse(userMessage);
    
    res.json({
      id: `chatcmpl-mock-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'glm-4.6-mock',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: response.length,
        total_tokens: 10 + response.length
      }
    });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mock-glm-api' });
});

app.listen(PORT, () => {
  console.log(`🤖 Mock GLM API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/paas/v4/chat/completions`);
});

export default app;
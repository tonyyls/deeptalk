import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat/message', async (req, res) => {
  console.log('收到请求:', req.body);
  
  const { message, model } = req.body;
  const { model: modelName, temperature = 0.7, maxTokens = 1000, streamResponse = false } = model;

  // 设置流式响应头
  if (streamResponse) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 发送开始信号
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Stream started' })}\n\n`);
  }

  // 构建GLM请求
  const glmRequest = {
    model: modelName,
    messages: [{ role: 'user', content: message }],
    stream: streamResponse,
    max_tokens: maxTokens,
    temperature
  };

  // 添加思考过程控制参数
  if (modelName.includes('glm-4.6') || modelName.includes('glm-4.5')) {
    glmRequest.thinking = { type: 'enabled' };
  }

  console.log('GLM请求:', JSON.stringify(glmRequest, null, 2));

  try {
    const glmResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GLM_API_KEY}`
      },
      body: JSON.stringify(glmRequest)
    });

    console.log('GLM响应状态:', glmResponse.status);

    if (!glmResponse.ok) {
      const errorText = await glmResponse.text();
      console.error('GLM API错误:', errorText);
      return res.status(500).json({ error: 'GLM API error' });
    }

    if (streamResponse) {
      const reader = glmResponse.body.getReader();
      const decoder = new TextDecoder();
      
      console.log('开始处理流式响应...');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('流式响应结束');
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('收到[DONE]信号');
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              
              if (delta) {
                if (delta.reasoning_content) {
                  console.log('🧠 发送思考内容:', delta.reasoning_content);
                  res.write(`data: ${JSON.stringify({
                    content: delta.reasoning_content,
                    type: 'reasoning'
                  })}\n\n`);
                }
                
                if (delta.content) {
                  console.log('💬 发送回答内容:', delta.content);
                  res.write(`data: ${JSON.stringify({
                    content: delta.content,
                    type: 'content'
                  })}\n\n`);
                }
              }
              
              if (parsed.usage) {
                console.log('📊 使用统计:', parsed.usage);
              }
            } catch (e) {
              console.warn('解析失败:', data, e.message);
            }
          }
        }
      }
      
      // 发送结束信号
      res.write(`data: ${JSON.stringify({ type: 'done', usage: null })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('请求失败:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = 3002;
app.listen(port, () => {
  console.log(`测试服务器运行在 http://localhost:${port}`);
});
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testGLMThinking() {
  const glmRequest = {
    model: 'glm-4.6',
    messages: [
      {
        role: 'user',
        content: '请详细解释一下为什么天空是蓝色的，从物理学角度分析光的散射原理。'
      }
    ],
    thinking: { type: 'enabled' },
    stream: true,
    max_tokens: 1000,
    temperature: 0.7
  };

  console.log('发送GLM API请求:', JSON.stringify(glmRequest, null, 2));

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GLM_API_KEY}`
      },
      body: JSON.stringify(glmRequest)
    });

    console.log('GLM API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GLM API错误:', errorText);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    console.log('开始读取流式响应...');
    
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
                console.log('🧠 思考内容:', delta.reasoning_content);
              }
              
              if (delta.content) {
                console.log('💬 回答内容:', delta.content);
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
  } catch (error) {
    console.error('请求失败:', error);
  }
}

testGLMThinking();
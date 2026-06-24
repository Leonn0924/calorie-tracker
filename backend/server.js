const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 启用 CORS
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '代理服务器运行正常' });
});

// 代理 Token Plan / DashScope API
app.post('/api/llm', async (req, res) => {
  try {
    const { apiEndpoint, apiKey, modelName, messages, maxTokens, temperature } = req.body;

    // 验证必需参数
    if (!apiEndpoint || !apiKey || !modelName) {
      return res.status(400).json({
        error: '缺少必需参数：apiEndpoint, apiKey, modelName'
      });
    }

    console.log(`[代理请求] 模型：${modelName}, 端点：${apiEndpoint}`);
    console.log('[代理请求] 消息:', JSON.stringify(messages));

    // 转发请求到目标 API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        max_tokens: maxTokens || 512,
        temperature: temperature || 0.3,
      }),
    });

    console.log('[代理响应] 状态码:', response.status);

    // 先获取原始文本
    const responseText = await response.text();
    console.log('[代理响应] 原始文本:', responseText);

    // 尝试解析 JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[代理错误] JSON 解析失败:', parseError);
      console.error('[代理错误] 原始响应:', responseText);
      return res.status(500).json({
        error: 'API 返回了无效的 JSON',
        rawResponse: responseText.substring(0, 500), // 只返回前 500 字符
        status: response.status,
      });
    }

    res.json(data);
  } catch (error) {
    console.error('[代理错误]:', error);
    res.status(500).json({
      error: '代理请求失败',
      message: error.message,
      stack: process.env.DEBUG ? error.stack : undefined,
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   热量管理工具 - API 代理服务器          ║
╠════════════════════════════════════════╣
║   运行在：http://localhost:${PORT}          ║
║   代理端点：POST /api/llm               ║
║   健康检查：GET /health                  ║
╚════════════════════════════════════════╝
  `);
});

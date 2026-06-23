# 热量管理工具 - API 代理服务器

本地 API 代理服务器，用于解决浏览器 CORS 跨域问题。

## 快速启动

```bash
cd backend
npm install
npm start
```

代理服务器将运行在：`http://localhost:3001`

## 使用方法

### 1. 启动代理服务器

```bash
cd /Users/lishengxuan_1/Desktop/project/热量记录/backend
npm start
```

### 2. 配置前端

在前端设置页面配置：

- **API 端点**：你实际的 API 端点（如 Token Plan 或 DashScope）
- **API Key**：你的 API Key
- **模型名称**：如 `qwen-plus`

### 3. 测试连接

点击"测试连接"按钮，前端会通过代理服务器发送请求。

## 端点说明

### 健康检查
```
GET http://localhost:3001/health
```

### 代理请求
```
POST http://localhost:3001/api/llm
```

请求体：
```json
{
  "apiEndpoint": "https://your-api-endpoint.com/v1/chat/completions",
  "apiKey": "your-api-key",
  "modelName": "qwen-plus",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."}
  ],
  "maxTokens": 512,
  "temperature": 0.3
}
```

## 注意事项

1. **必须先启动代理服务器**才能使用 AI 功能
2. 代理服务器只在本地运行，不会上传任何数据
3. API Key 仅存储在浏览器本地，代理服务器不保存

# AI Roulette API 文档

> Base URL: `https://yanchiceshi-production.up.railway.app`

---

## 接口总览

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/sources` | 获取可用供应商列表 |
| `GET` | `/api/models` | 获取模型列表 |
| `GET` | `/api/latency` | 测试单模型延迟 |
| `POST` | `/api/latency/batch` | 批量测试延迟 |
| `POST` | `/v1/chat/completions` | **代理转发** — 调用任意供应商模型 |
| `GET` | `/v1/models` | **代理转发** — 获取供应商模型列表 |
| `GET` | `/api/usage` | 查询 Token 用量统计 |
| `GET` | `/api/usage/recent` | 查询最近用量记录 |
| `GET` | `/health` | 健康检查 |

> 所有涉及 AI 调用的接口响应都附带 `_billing` 计费字段。

---

## 计费说明

每个 AI 调用接口的响应末尾都会附带 `_billing` 字段：

```json
"_billing": {
  "source": "moonshot",
  "model": "moonshot-v1-8k",
  "provider": "moonshot",
  "tokens": {
    "prompt": 8,
    "completion": 5,
    "total": 13
  },
  "latency": 388,
  "cost": "0.0013 MON"
}
```

| 字段 | 说明 |
|------|------|
| `tokens.prompt` | 输入 Token 数 |
| `tokens.completion` | 输出 Token 数 |
| `tokens.total` | 总 Token 数 |
| `latency` | 服务端处理延迟（ms） |
| `cost` | 本次请求费用（MON） |

**计费公式**：`1 token = 0.0001 MON`

---

## 1. 代理转发 — 聊天补全

### `POST /v1/chat/completions`

通过我们的 API 调用任意供应商的模型，兼容 OpenAI 格式。自动记录 Token 消耗并返回计费信息。

**请求参数：**

- **Header** 或 **Query** 指定供应商（二选一）：
  - `X-Source: moonshot`（Header）
  - `?source=moonshot`（Query）

- **Body**：标准 OpenAI Chat Completions 格式

**请求示例：**
```bash
curl -X POST https://yanchiceshi-production.up.railway.app/v1/chat/completions?source=moonshot \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [{"role": "user", "content": "你好"}],
    "max_tokens": 20
  }'
```

**响应示例：**
```json
{
  "id": "chatcmpl-699edd49cf88c783890c0e53",
  "object": "chat.completion",
  "created": 1772019017,
  "model": "moonshot-v1-8k",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Hi there! How can" },
      "finish_reason": "length"
    }
  ],
  "usage": {
    "prompt_tokens": 8,
    "completion_tokens": 5,
    "total_tokens": 13
  },
  "_billing": {
    "source": "moonshot",
    "model": "moonshot-v1-8k",
    "provider": "moonshot",
    "tokens": { "prompt": 8, "completion": 5, "total": 13 },
    "latency": 388,
    "cost": "0.0013 MON"
  }
}
```

---

## 2. 代理转发 — 模型列表

### `GET /v1/models`

获取指定供应商的原始模型列表（直接转发上游响应）。

**请求参数：**

- `X-Source: moonshot`（Header）或 `?source=moonshot`（Query）

**请求示例：**
```
GET /v1/models?source=moonshot
```

---

## 3. 获取可用供应商

### `GET /api/sources`

**响应示例：**
```json
{
  "success": true,
  "sources": [
    { "id": "commonstack", "label": "CommonStack" },
    { "id": "moonshot", "label": "Moonshot (Kimi)" },
    { "id": "qiniu", "label": "七牛云" },
    { "id": "zhipu", "label": "智谱 (GLM)" },
    { "id": "siliconflow", "label": "硅基流动" },
    { "id": "stepfun", "label": "阶跃星辰" }
  ]
}
```

---

## 4. 获取模型列表

### `GET /api/models`

获取所有供应商的模型列表，按供应商分组返回。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source` | string | 否 | 指定供应商 ID，不传则返回全部 |

**请求示例：**
```
GET /api/models
GET /api/models?source=moonshot
```

**响应示例（全部）：**
```json
{
  "success": true,
  "sources": [
    { "id": "commonstack", "label": "CommonStack" },
    { "id": "moonshot", "label": "Moonshot (Kimi)" }
  ],
  "totalCount": 128,
  "bySource": {
    "commonstack": [
      {
        "id": "deepseek/deepseek-chat",
        "name": "deepseek-chat",
        "provider": "deepseek",
        "source": "commonstack",
        "displayId": "commonstack::deepseek/deepseek-chat"
      }
    ],
    "moonshot": [
      {
        "id": "moonshot-v1-8k",
        "name": "moonshot-v1-8k",
        "provider": "moonshot",
        "source": "moonshot",
        "displayId": "moonshot::moonshot-v1-8k"
      }
    ]
  }
}
```

---

## 5. 测试单模型延迟

### `GET /api/latency`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source` | string | 是 | 供应商 ID |
| `model` | string | 是 | 模型 ID |

**请求示例：**
```
GET /api/latency?source=moonshot&model=moonshot-v1-8k
```

**响应示例：**
```json
{
  "success": true,
  "result": {
    "model": "moonshot-v1-8k",
    "provider": "moonshot",
    "source": "moonshot",
    "totalTime": 347,
    "promptTokens": 15,
    "completionTokens": 2,
    "totalTokens": 17,
    "success": true
  },
  "_billing": {
    "source": "moonshot",
    "model": "moonshot-v1-8k",
    "provider": "moonshot",
    "tokens": { "prompt": 15, "completion": 2, "total": 17 },
    "latency": 347,
    "cost": "0.0017 MON"
  }
}
```

---

## 6. 批量测试延迟

### `POST /api/latency/batch`

供应商之间并行，同一供应商内串行，保证延迟数据准确。

**请求体：**
```json
{
  "targets": [
    { "source": "moonshot", "modelId": "moonshot-v1-8k" },
    { "source": "qiniu", "modelId": "deepseek-v3" }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `targets` | array | 是 | 测试目标，最多 50 个 |
| `targets[].source` | string | 是 | 供应商 ID |
| `targets[].modelId` | string | 是 | 模型 ID |

**响应示例：**
```json
{
  "success": true,
  "count": 2,
  "successCount": 2,
  "results": [
    {
      "model": "moonshot-v1-8k",
      "provider": "moonshot",
      "source": "moonshot",
      "totalTime": 347,
      "promptTokens": 15,
      "completionTokens": 2,
      "totalTokens": 17,
      "success": true
    }
  ],
  "_billing": {
    "totalRequests": 2,
    "tokens": { "prompt": 30, "completion": 4, "total": 34 },
    "cost": "0.0034 MON"
  }
}
```

> 结果按延迟升序排列，失败的排在最后。

---

## 7. Token 用量统计

### `GET /api/usage`

查询历史 Token 消耗汇总，按供应商分组。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source` | string | 否 | 筛选供应商 |
| `start` | string | 否 | 起始日期，如 `2026-02-01` |
| `end` | string | 否 | 结束日期，如 `2026-02-28` |

**请求示例：**
```
GET /api/usage
GET /api/usage?source=moonshot
GET /api/usage?start=2026-02-25&end=2026-02-26
```

**响应示例：**
```json
{
  "success": true,
  "totalRequests": 42,
  "totalTokens": {
    "prompt": 630,
    "completion": 210,
    "total": 840
  },
  "bySource": [
    {
      "source": "moonshot",
      "requests": 15,
      "promptTokens": 225,
      "completionTokens": 75,
      "totalTokens": 300,
      "avgLatency": 355
    },
    {
      "source": "commonstack",
      "requests": 27,
      "promptTokens": 405,
      "completionTokens": 135,
      "totalTokens": 540,
      "avgLatency": 892
    }
  ]
}
```

---

## 8. 最近用量记录

### `GET /api/usage/recent`

返回最近 N 条用量明细。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `limit` | number | 否 | 返回条数，默认 20，最多 100 |

**请求示例：**
```
GET /api/usage/recent
GET /api/usage/recent?limit=5
```

**响应示例：**
```json
{
  "success": true,
  "count": 2,
  "logs": [
    {
      "id": "cm5abc123",
      "createdAt": "2026-02-25T11:10:17.000Z",
      "source": "moonshot",
      "model": "moonshot-v1-8k",
      "provider": "moonshot",
      "promptTokens": 8,
      "completionTokens": 5,
      "totalTokens": 13,
      "latency": 388,
      "success": true,
      "error": null,
      "callerIp": "::1"
    }
  ]
}
```

---

## 9. 健康检查

### `GET /health`

```json
{
  "status": "ok",
  "sources": 6
}
```

---

## 错误响应

```json
{
  "success": false,
  "error": "错误信息描述"
}
```

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |
| 502 | 上游供应商请求失败（代理转发） |

---

## 供应商 ID 对照表

| ID | 名称 | API 端点 |
|----|------|----------|
| `commonstack` | CommonStack | `api.commonstack.ai` |
| `moonshot` | Moonshot (Kimi) | `api.moonshot.cn` |
| `qiniu` | 七牛云 | `api.qnaigc.com` |
| `zhipu` | 智谱 (GLM) | `open.bigmodel.cn` |
| `siliconflow` | 硅基流动 | `api.siliconflow.cn` |
| `stepfun` | 阶跃星辰 | `api.stepfun.com` |
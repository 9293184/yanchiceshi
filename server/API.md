# AI Roulette API 文档

> Base URL: `http://localhost:3001`（本地）  
> 部署后替换为 Railway 分配的域名

---

## 1. 获取可用供应商

### `GET /api/sources`

返回当前已配置 API Key 的供应商列表。

**请求示例：**
```
GET /api/sources
```

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

## 2. 获取模型列表

### `GET /api/models`

获取所有供应商的模型列表，按供应商分组返回。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source` | string | 否 | 指定供应商 ID，如 `commonstack`、`moonshot` 等。不传则返回全部 |

**请求示例：**
```
GET /api/models
GET /api/models?source=moonshot
```

**响应示例（全部供应商）：**
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

**响应示例（指定供应商）：**
```json
{
  "success": true,
  "source": "moonshot",
  "count": 5,
  "models": [
    {
      "id": "moonshot-v1-8k",
      "name": "moonshot-v1-8k",
      "provider": "moonshot",
      "source": "moonshot",
      "displayId": "moonshot::moonshot-v1-8k"
    }
  ]
}
```

---

## 3. 测试单模型延迟

### `GET /api/latency`

对指定模型发起一次 chat completion 请求，返回响应延迟。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `source` | string | 是 | 供应商 ID |
| `model` | string | 是 | 模型 ID（如 `deepseek/deepseek-chat`） |

**请求示例：**
```
GET /api/latency?source=moonshot&model=moonshot-v1-8k
```

**响应示例（成功）：**
```json
{
  "success": true,
  "result": {
    "model": "moonshot-v1-8k",
    "provider": "moonshot",
    "source": "moonshot",
    "totalTime": 347,
    "success": true
  }
}
```

**响应示例（失败）：**
```json
{
  "success": true,
  "result": {
    "model": "some-model",
    "provider": "unknown",
    "source": "commonstack",
    "totalTime": 5023,
    "success": false,
    "error": "HTTP 404: model not found"
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `model` | string | 模型 ID |
| `provider` | string | 模型供应商（从模型 ID 解析） |
| `source` | string | API 供应商 |
| `totalTime` | number | 响应延迟（毫秒） |
| `success` | boolean | 请求是否成功 |
| `error` | string? | 失败时的错误信息 |

---

## 4. 批量测试延迟

### `POST /api/latency/batch`

批量测试多个模型的延迟。供应商之间并行，同一供应商内串行，保证延迟数据准确。

**请求体（JSON）：**

```json
{
  "targets": [
    { "source": "moonshot", "modelId": "moonshot-v1-8k" },
    { "source": "commonstack", "modelId": "deepseek/deepseek-chat" },
    { "source": "qiniu", "modelId": "deepseek-v3" }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `targets` | array | 是 | 测试目标数组，最多 50 个 |
| `targets[].source` | string | 是 | 供应商 ID |
| `targets[].modelId` | string | 是 | 模型 ID |

**请求示例：**
```bash
curl -X POST http://localhost:3001/api/latency/batch \
  -H "Content-Type: application/json" \
  -d '{
    "targets": [
      { "source": "moonshot", "modelId": "moonshot-v1-8k" },
      { "source": "qiniu", "modelId": "deepseek-v3" }
    ]
  }'
```

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
      "success": true
    },
    {
      "model": "deepseek-v3",
      "provider": "qiniu",
      "source": "qiniu",
      "totalTime": 892,
      "success": true
    }
  ]
}
```

> 结果按延迟从小到大排序，失败的排在最后。

---

## 5. 健康检查

### `GET /health`

用于 Railway 等平台的健康检查。

**响应示例：**
```json
{
  "status": "ok",
  "sources": 6
}
```

---

## 错误响应

所有接口在出错时返回统一格式：

```json
{
  "success": false,
  "error": "错误信息描述"
}
```

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 400 | 请求参数错误（缺少必填参数等） |
| 500 | 服务器内部错误 |

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

---
# AI Roulette Gateway API 文档

> 参考 sub2api 架构设计的 AI API 网关
>
> Base URL: `http://localhost:3001`

---

## 核心特性

- **多供应商代理** — 10 个 AI 供应商，统一接入
- **双模式 Key 管理** — 支持 Header 传入 Key（即时）或数据库存储 Key（持久化）
- **账号池轮换** — 多个 Key 随机负载均衡，失败自动切换下一个可用 Key
- **双格式支持** — OpenAI 兼容格式 + Anthropic Messages 格式
- **SSE 流式转发** — 支持 `stream: true`，逐行透传 + 实时 Usage 提取
- **自动重试** — 429/5xx 错误指数退避重试，Key 错误自动轮换或透传
- **协议适配** — OpenAI 兼容 / Anthropic Messages / Gemini generateContent
- **Usage 追踪** — 每次调用记录到 PostgreSQL

---

## 接口总览

### Gateway v2 核心接口

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| `POST` | `/v1/chat/completions` | **代理转发** — OpenAI 格式聊天补全 | API Key（Header 或 DB）|
| `POST` | `/v1/messages` | **代理转发** — Anthropic Messages 格式 | API Key（Header 或 DB）|
| `GET` | `/v1/models` | **代理转发** — 模型列表 | API Key（Header 或 DB）|
| `GET` | `/v1/providers` | 获取所有供应商列表 | 无 |

### Key 管理接口

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| `GET` | `/v1/keys` | 列出已存储的 API Key（脱敏） | 无 |
| `POST` | `/v1/keys` | 添加 API Key 到数据库 | 无 |
| `DELETE` | `/v1/keys/:id` | 删除存储的 Key | 无 |
| `PATCH` | `/v1/keys/:id` | 启用/禁用 Key | 无 |

### 旧版接口（兼容）

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| `GET` | `/api/sources` | 获取可用供应商列表 | 无 |
| `GET` | `/api/models` | 获取模型列表（内部） | 无 |
| `GET` | `/api/latency` | 测试单模型延迟 | 无 |
| `POST` | `/api/latency/batch` | 批量测试延迟 | 无 |
| `GET` | `/api/usage` | Token 用量统计 | 无 |
| `GET` | `/api/usage/recent` | 最近用量记录 | 无 |
| `GET` | `/health` | 健康检查 | 无 |

---

## 供应商列表

### 国际供应商（参考 sub2api）

| ID | 名称 | Base URL | 协议 | 鉴权方式 |
|----|------|----------|------|----------|
| `openai` | OpenAI | `https://api.openai.com/v1` | OpenAI 兼容 | `Authorization: Bearer <key>` |
| `anthropic` | Anthropic (Claude) | `https://api.anthropic.com/v1` | Anthropic Messages | `x-api-key: <key>` |
| `gemini` | Google Gemini | `https://generativelanguage.googleapis.com` | Gemini generateContent | `x-goog-api-key: <key>` |
| `deepseek` | DeepSeek | `https://api.deepseek.com/v1` | OpenAI 兼容 | `Authorization: Bearer <key>` |

### 国内供应商

| ID | 名称 | Base URL | 协议 | 鉴权方式 |
|----|------|----------|------|----------|
| `commonstack` | CommonStack | `https://api.commonstack.ai/v1` | OpenAI 兼容 | `Authorization: Bearer <key>` |
| `moonshot` | Moonshot (Kimi) | `https://api.moonshot.cn/v1` | OpenAI 兼容 | `Authorization: Bearer <key>` |
| `qiniu` | 七牛云 | `https://api.qnaigc.com/v1` | OpenAI 兼容 | `Authorization: Bearer <key>` |
| `zhipu` | 智谱 (GLM) | `https://open.bigmodel.cn/api/paas/v4` | OpenAI 兼容 | `Authorization: Bearer <key>` |
| `siliconflow` | 硅基流动 | `https://api.siliconflow.cn/v1` | OpenAI 兼容 | `Authorization: Bearer <key>` |
| `stepfun` | 阶跃星辰 | `https://api.stepfun.com/v1` | OpenAI 兼容 | `Authorization: Bearer <key>` |

### 三种协议对比（参考 sub2api 架构）

| 维度 | OpenAI 兼容 | Anthropic | Gemini |
|------|------------|-----------|--------|
| **鉴权 Header** | `Authorization: Bearer <key>` | `x-api-key: <key>` | `x-goog-api-key: <key>` |
| **请求路径** | `/v1/chat/completions` | `/v1/messages` | `/v1beta/models/{model}:generateContent` |
| **流式路径** | 同上 + `stream: true` | 同上 + `stream: true` | `...:{model}:streamGenerateContent?alt=sse` |
| **Usage 字段** | `usage.prompt_tokens` | `usage.input_tokens` | `usageMetadata.promptTokenCount` |
| **额外 Header** | 无 | `anthropic-version: 2023-06-01` | 无 |
| **适用供应商** | OpenAI, DeepSeek, 所有国内供应商 | Anthropic | Google Gemini |

---

## 1. 代理转发 — OpenAI 格式聊天补全

### `POST /v1/chat/completions`

支持两种 Key 传入方式：
1. **Header 传入**（即时）— 通过 `Authorization` 或 `x-api-key` header
2. **数据库存储**（持久化）— 提前通过 `/v1/keys` 存储，请求时自动使用

如果同时存在多个存储的 Key，系统会**随机选择**（负载均衡），失败时**自动切换**到下一个可用 Key。

### 请求 Header

| Header | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 可选* | `Bearer <你的API Key>` — 即时传入 Key |
| `x-api-key` | 可选* | 替代 `Authorization` 的方式 |
| `X-Source` | **是** | 供应商 ID（如 `openai`, `anthropic`, `gemini` 等） |
| `Content-Type` | 是 | `application/json` |

> *如果未传入 Key，系统会从数据库中随机选择该供应商的可用 Key（账号池轮换）

### 请求示例

**OpenAI / DeepSeek / 国内供应商（OpenAI 兼容协议）：**
```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Authorization: Bearer sk-你的OpenAI-Key" \
  -H "X-Source: openai" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

**Anthropic (Claude)：**
```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "x-api-key: sk-ant-你的Anthropic-Key" \
  -H "X-Source: anthropic" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5-20250514",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

**Google Gemini：**
```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "x-api-key: AIza你的Gemini-Key" \
  -H "X-Source: gemini" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**流式请求（任何供应商）：**
```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Authorization: Bearer sk-你的Key" \
  -H "X-Source: siliconflow" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-V3",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```

### 响应示例（非流式）

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Hello! How can I help?" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 8,
    "completion_tokens": 7,
    "total_tokens": 15
  },
  "_billing": {
    "source": "openai",
    "model": "gpt-4o",
    "provider": "openai",
    "tokens": { "prompt": 8, "completion": 7, "total": 15 },
    "latency": 520
  }
}
```

### 响应示例（流式 SSE）

```
data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"!"}}]}

data: {"id":"chatcmpl-abc","choices":[{"delta":{}}],"usage":{"prompt_tokens":8,"completion_tokens":2,"total_tokens":10}}

data: [DONE]
```

### 错误响应

```json
{
  "error": {
    "message": "需要 Authorization: Bearer <key> 或 x-api-key header 传入 API Key",
    "type": "authentication_error"
  }
}
```

| HTTP 状态码 | type | 说明 |
|------------|------|------|
| 400 | `invalid_request_error` | 缺少参数、供应商未配置 |
| 401 | `authentication_error` | 未传入 API Key |
| 401/402/403 | (上游透传) | Key 无效/余额不足/权限不足 |
| 429 | (上游透传) | 限流（会自动重试） |
| 502 | `upstream_error` | 上游网络错误 |

---

## 2. 代理转发 — Anthropic Messages 格式

### `POST /v1/messages`

支持 Anthropic Messages API 格式，适用于需要 Claude 特性的场景（thinking、tool use、多模态等）。

**格式转换**：
- **Anthropic 供应商** → 直接转发 Messages 格式
- **其他供应商** → 自动转换为 OpenAI 格式，响应再转回 Messages 格式

### 请求 Header

| Header | 必填 | 说明 |
|--------|------|------|
| `x-api-key` | 可选* | API Key（即时传入或从 DB 读取） |
| `X-Source` | **是** | 供应商 ID |
| `Content-Type` | 是 | `application/json` |

> *如果未传入 Key，系统会从数据库中随机选择该供应商的可用 Key

### 请求示例

```bash
curl -X POST http://localhost:3001/v1/messages \
  -H "x-api-key: sk-ant-你的Key" \
  -H "X-Source: anthropic" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
```

**使用数据库存储的 Key（无需传入 Header）：**
```bash
curl -X POST http://localhost:3001/v1/messages?source=commonstack \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4.1",
    "max_tokens": 100,
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "system": "You are a helpful assistant"
  }'
```

### 响应示例

```json
{
  "id": "msg_01XYZ",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Hello! How can I help you today?"
    }
  ],
  "model": "claude-3-5-sonnet-20241022",
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 10,
    "output_tokens": 8
  }
}
```

---

## 3. Key 管理接口

### `GET /v1/keys` — 列出已存储的 Key

```bash
curl http://localhost:3001/v1/keys
```

**响应：**
```json
{
  "success": true,
  "count": 2,
  "keys": [
    {
      "id": "cmmhrpzaq0001km0o9j34gmp1",
      "provider": "commonstack",
      "keyPreview": "ak-2e7***f37a",
      "label": "黑客松免费额度",
      "isActive": true,
      "lastUsedAt": "2026-03-08T12:00:00.000Z",
      "createdAt": "2026-03-08T10:00:00.000Z"
    },
    {
      "id": "cmmhrpzaq0002km0o9j34gmp2",
      "provider": "openai",
      "keyPreview": "sk-abc***xyz",
      "label": null,
      "isActive": true,
      "lastUsedAt": null,
      "createdAt": "2026-03-08T11:00:00.000Z"
    }
  ]
}
```

### `POST /v1/keys` — 添加 Key

```bash
curl -X POST http://localhost:3001/v1/keys \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "commonstack",
    "apiKey": "ak-2e74796623b8faa67898c5b99048e0a171382d1e7b8916964da6d65d72eaf37a",
    "label": "黑客松免费额度"
  }'
```

**响应：**
```json
{
  "success": true,
  "id": "cmmhrpzaq0001km0o9j34gmp1",
  "provider": "commonstack"
}
```

### `DELETE /v1/keys/:id` — 删除 Key

```bash
curl -X DELETE http://localhost:3001/v1/keys/cmmhrpzaq0001km0o9j34gmp1
```

### `PATCH /v1/keys/:id` — 启用/禁用 Key

```bash
curl -X PATCH http://localhost:3001/v1/keys/cmmhrpzaq0001km0o9j34gmp1 \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

---

## 4. 账号池轮换机制

当数据库中存储了多个相同供应商的 Key 时，系统会自动实现账号池轮换：

### 工作流程

```
请求到达（未传入 Key）
  ↓
从 DB 随机选择该供应商的一个可用 Key
  ↓
发送请求
  ↓
如果返回 401/403（Key 失败）
  ↓
记录失败的 Key，排除它
  ↓
随机选择下一个可用 Key
  ↓
重试请求（最多 3 次）
```

### 特性

- **负载均衡**：随机选择 Key，避免单个 Key 过载
- **自动切换**：Key 失败时自动切换到下一个
- **排除失败**：已失败的 Key 不会被重复使用
- **使用追踪**：每次使用自动更新 `lastUsedAt`

### 示例场景

假设你存储了 3 个 CommonStack Key：
```bash
# 添加第 1 个 Key
curl -X POST http://localhost:3001/v1/keys \
  -d '{"provider":"commonstack","apiKey":"ak-key1...","label":"Key 1"}'

# 添加第 2 个 Key
curl -X POST http://localhost:3001/v1/keys \
  -d '{"provider":"commonstack","apiKey":"ak-key2...","label":"Key 2"}'

# 添加第 3 个 Key
curl -X POST http://localhost:3001/v1/keys \
  -d '{"provider":"commonstack","apiKey":"ak-key3...","label":"Key 3"}'
```

现在调用 API 时不传入 Key：
```bash
curl -X POST http://localhost:3001/v1/chat/completions?source=commonstack \
  -d '{"model":"openai/gpt-4.1","messages":[{"role":"user","content":"hi"}]}'
```

系统会：
1. 随机选择 Key 1、2 或 3
2. 如果选中的 Key 失败（401/403），自动切换到另一个
3. 最多尝试 3 个 Key，直到成功或全部失败

---

## 5. 代理转发 — 模型列表

### `GET /v1/models`

| Header | 必填 | 说明 |
|--------|------|------|
| `Authorization` | **是** | `Bearer <你的API Key>` |
| `X-Source` | **是** | 供应商 ID |

```bash
curl http://localhost:3001/v1/models \
  -H "Authorization: Bearer sk-你的Key" \
  -H "X-Source: openai"
```

---

## 3. 获取可用供应商

### `GET /api/sources`

```json
{
  "success": true,
  "sources": [
    { "id": "openai", "label": "OpenAI" },
    { "id": "anthropic", "label": "Anthropic (Claude)" },
    { "id": "gemini", "label": "Google Gemini" },
    { "id": "deepseek", "label": "DeepSeek" },
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

## 4–9. 其他接口

以下接口与之前相同，无需 API Key（使用服务端 .env 配置的 Key）：

| 接口 | 说明 |
|------|------|
| `GET /api/models` | 获取模型列表（按供应商分组） |
| `GET /api/latency` | 测试单模型延迟 |
| `POST /api/latency/batch` | 批量测试延迟 |
| `GET /api/usage` | Token 用量统计 |
| `GET /api/usage/recent` | 最近用量记录 |
| `GET /health` | 健康检查 |

---

## 架构设计（参考 sub2api）

### 请求流程

```
客户端
  │  Authorization: Bearer sk-xxx
  │  X-Source: openai
  │  Body: { model, messages, stream? }
  ▼
┌───────────────────────────────────────┐
│  Gateway (index.ts)                     │
│  1. 提取 source + apiKey                 │
│  2. 调用 forwardChatCompletion()         │
└─────────────────┴─────────────────────┘
                  │
                  ▼
┌───────────────────────────────────────┐
│  gateway.ts                              │
│  3. extractApiKey() ─ 从 Header 拿 Key   │
│  4. getProvider() ─ 根据 source 查配置   │
│  5. transformRequestBody() ─ 模型映射    │
│  6. filterClientHeaders() ─ 安全过滤     │
│  7. injectAuthHeaders(h, apiKey)          │
│     ─ 清除客户端鉴权头                    │
│     ─ 注入 Bearer/x-api-key/x-goog-api-key│
│     ─ 注入固定 Header (anthropic-version)  │
│  8. buildUrl() ─ 构建上游 URL            │
│     ─ OpenAI: /v1/chat/completions       │
│     ─ Anthropic: /v1/messages             │
│     ─ Gemini: /v1beta/models/{m}:action   │
│  9. fetch() ─ 发送上游请求               │
│ 10. 重试循环 (429/5xx 指数退避)          │
└─────────────────┴─────────────────────┘
                  │
          ┌───────┴───────┐
          ▼               ▼
    非流式响应         SSE 流式响应
    JSON + _billing   逐行转发 + Usage 提取
          │               │
          └───────┬───────┘
                  ▼
           logUsage() ─ 记录到 PostgreSQL
```

### 重试策略（参考 sub2api 的 shouldRetryUpstreamError）

| 上游状态码 | 行为 | 说明 |
|------------|------|------|
| 429 | 指数退避重试 | 限流，等待后重试 |
| 500+ | 指数退避重试 | 服务端错误 |
| 401/402/403 | **直接透传** | Key 错误，返回给用户 |
| 网络错误 | 指数退避重试 | 连接失败 |

- 最大重试 3 次，总时间预算 30s
- 退避延迟：1s → 2s → 4s（上限 8s）

### 文件结构

```
server/src/
├── providers.ts   # 供应商抽象层（Provider 接口 + 3 个实现类）
├── gateway.ts     # 核心代理网关（转发 + 重试 + SSE）
├── index.ts       # Express 路由
├── sources.ts     # 旧版供应商配置（/api/* 接口使用）
├── services.ts    # 模型列表/延迟测试服务
└── db.ts          # PostgreSQL + Usage 追踪
```

### Provider 类层级

```
Provider (接口)
├── OpenAICompatProvider   # OpenAI/DeepSeek/所有国内供应商
├── AnthropicProvider      # Anthropic Claude
│   ├─ URL: /chat/completions → /messages
│   ├─ Header: x-api-key + anthropic-version
│   ├─ Body: max_output_tokens → max_tokens
│   └─ Usage: input_tokens / output_tokens
└── GeminiProvider         # Google Gemini
    ├─ URL: /v1beta/models/{model}:generateContent
    ├─ Stream URL: ...streamGenerateContent?alt=sse
    ├─ Header: x-goog-api-key
    └─ Usage: usageMetadata.promptTokenCount
```
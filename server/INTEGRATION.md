# visurf API 集成指南

> 如何将 visurf 作为 AI 网关集成到你的应用（OpenClow、LangChain、自定义客户端等）

**部署地址**: `https://yanchiceshi-production.up.railway.app`

---

## 快速开始

visurf 提供两种 API 格式，兼容主流 AI 框架：

1. **OpenAI 兼容格式** — `/v1/chat/completions`
2. **Anthropic Messages 格式** — `/v1/messages`

支持 10 个 AI 供应商：OpenAI、Anthropic、Gemini、DeepSeek、CommonStack、Moonshot、七牛云、智谱、硅基流动、阶跃星辰

---

## 方案 1：OpenAI 兼容格式（推荐）

### 适用场景
- OpenClow
- LangChain
- LlamaIndex
- 任何支持 OpenAI API 的客户端

### 配置参数

| 参数 | 值 |
|------|-----|
| **Base URL** | `https://yanchiceshi-production.up.railway.app/v1` |
| **API Key** | 可选（如果在 visurf 数据库中预存了 Key） |
| **自定义 Header** | `X-Source: <供应商ID>` 或通过 query 参数 `?source=<供应商ID>` |

### 供应商 ID 列表

| 供应商 | ID | 示例模型 |
|--------|-----|----------|
| OpenAI | `openai` | `gpt-4o`, `gpt-4o-mini` |
| Anthropic | `anthropic` | `claude-3-5-sonnet-20241022` |
| Google Gemini | `gemini` | `gemini-2.0-flash-exp` |
| DeepSeek | `deepseek` | `deepseek-chat` |
| CommonStack | `commonstack` | `openai/gpt-4.1` |
| Moonshot (Kimi) | `moonshot` | `moonshot-v1-8k` |
| 七牛云 | `qiniu` | `qwen-plus` |
| 智谱 (GLM) | `zhipu` | `glm-4-plus` |
| 硅基流动 | `siliconflow` | `deepseek-ai/DeepSeek-V3` |
| 阶跃星辰 | `stepfun` | `step-1-8k` |

### 配置示例

#### OpenClow 配置

```json
{
  "providers": [
    {
      "id": "visurf-commonstack",
      "name": "visurf CommonStack Gateway",
      "type": "openai",
      "base_url": "https://yanchiceshi-production.up.railway.app/v1",
      "api_key": "not-needed-if-stored",
      "default_headers": {
        "X-Source": "commonstack"
      },
      "models": ["openai/gpt-4.1", "openai/gpt-4o-mini"]
    },
    {
      "id": "visurf-deepseek",
      "name": "visurf DeepSeek Gateway",
      "type": "openai",
      "base_url": "https://yanchiceshi-production.up.railway.app/v1",
      "api_key": "not-needed-if-stored",
      "default_headers": {
        "X-Source": "deepseek"
      },
      "models": ["deepseek-chat", "deepseek-reasoner"]
    }
  ]
}
```

#### LangChain (Python) 配置

```python
from langchain_openai import ChatOpenAI

# 使用 CommonStack 供应商
llm = ChatOpenAI(
    base_url="https://yanchiceshi-production.up.railway.app/v1",
    api_key="not-needed-if-stored",  # 如果在 visurf 数据库中预存了 Key
    model="openai/gpt-4.1",
    default_headers={"X-Source": "commonstack"}
)

# 或者通过 query 参数指定供应商
llm = ChatOpenAI(
    base_url="https://yanchiceshi-production.up.railway.app/v1?source=commonstack",
    api_key="not-needed-if-stored",
    model="openai/gpt-4.1"
)

response = llm.invoke("Hello, world!")
print(response.content)
```

#### curl 测试

```bash
# 使用预存的 Key（无需传入 Authorization）
curl -X POST https://yanchiceshi-production.up.railway.app/v1/chat/completions \
  -H "X-Source: commonstack" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4.1",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'

# 或者即时传入 Key
curl -X POST https://yanchiceshi-production.up.railway.app/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "X-Source: openai" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 方案 2：Anthropic Messages 格式

### 适用场景
- 需要 Claude 特性（thinking、tool use、多模态）
- Anthropic SDK
- 自定义客户端

### 配置参数

| 参数 | 值 |
|------|-----|
| **Base URL** | `https://yanchiceshi-production.up.railway.app/v1` |
| **Endpoint** | `/messages` |
| **API Key Header** | `x-api-key` |
| **自定义 Header** | `X-Source: <供应商ID>` |

### 配置示例

#### Anthropic SDK (Python)

```python
import anthropic

client = anthropic.Anthropic(
    base_url="https://yanchiceshi-production.up.railway.app/v1",
    api_key="not-needed-if-stored",  # 如果在 visurf 数据库中预存了 Key
    default_headers={"X-Source": "anthropic"}
)

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude!"}
    ]
)

print(message.content)
```

#### curl 测试

```bash
curl -X POST https://yanchiceshi-production.up.railway.app/v1/messages \
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

---

## 方案 3：通过 Query 参数指定供应商

如果你的客户端不支持自定义 Header，可以通过 URL query 参数指定供应商：

```
https://yanchiceshi-production.up.railway.app/v1/chat/completions?source=commonstack
https://yanchiceshi-production.up.railway.app/v1/messages?source=anthropic
```

### 示例

```bash
curl -X POST "https://yanchiceshi-production.up.railway.app/v1/chat/completions?source=deepseek" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## API Key 管理

### 选项 1：即时传入 Key（推荐用于测试）

每次请求时通过 `Authorization` header 传入：

```bash
curl -X POST https://yanchiceshi-production.up.railway.app/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "X-Source: openai" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"hi"}]}'
```

### 选项 2：预存到数据库（推荐用于生产）

提前将 API Key 存储到 visurf 数据库，之后请求时无需传入 Key：

#### 1. 添加 Key

```bash
curl -X POST https://yanchiceshi-production.up.railway.app/v1/keys \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "commonstack",
    "apiKey": "ak-your-key-here",
    "label": "生产环境 Key"
  }'
```

#### 2. 查看已存储的 Key

```bash
curl https://yanchiceshi-production.up.railway.app/v1/keys
```

#### 3. 使用预存的 Key（无需传入 Authorization）

```bash
curl -X POST https://yanchiceshi-production.up.railway.app/v1/chat/completions \
  -H "X-Source: commonstack" \
  -d '{"model":"openai/gpt-4.1","messages":[{"role":"user","content":"hi"}]}'
```

### 账号池轮换

如果你存储了多个相同供应商的 Key，visurf 会自动：
- **随机选择** Key（负载均衡）
- **失败自动切换**到下一个可用 Key
- **排除失败** Key，避免重复使用

---

## 完整配置模板

### OpenClow 完整配置

```json
{
  "name": "visurf AI Gateway",
  "description": "通过 visurf 访问 10 个 AI 供应商",
  "providers": [
    {
      "id": "visurf-commonstack",
      "type": "openai",
      "base_url": "https://yanchiceshi-production.up.railway.app/v1",
      "api_key": "dummy",
      "default_headers": {"X-Source": "commonstack"},
      "models": ["openai/gpt-4.1", "openai/gpt-4o-mini"]
    },
    {
      "id": "visurf-deepseek",
      "type": "openai",
      "base_url": "https://yanchiceshi-production.up.railway.app/v1",
      "api_key": "dummy",
      "default_headers": {"X-Source": "deepseek"},
      "models": ["deepseek-chat", "deepseek-reasoner"]
    },
    {
      "id": "visurf-anthropic",
      "type": "anthropic",
      "base_url": "https://yanchiceshi-production.up.railway.app/v1",
      "api_key": "dummy",
      "default_headers": {"X-Source": "anthropic"},
      "models": ["claude-3-5-sonnet-20241022"]
    },
    {
      "id": "visurf-gemini",
      "type": "openai",
      "base_url": "https://yanchiceshi-production.up.railway.app/v1",
      "api_key": "dummy",
      "default_headers": {"X-Source": "gemini"},
      "models": ["gemini-2.0-flash-exp"]
    },
    {
      "id": "visurf-siliconflow",
      "type": "openai",
      "base_url": "https://yanchiceshi-production.up.railway.app/v1",
      "api_key": "dummy",
      "default_headers": {"X-Source": "siliconflow"},
      "models": ["deepseek-ai/DeepSeek-V3", "Qwen/Qwen2.5-72B-Instruct"]
    }
  ]
}
```

### LangChain 多供应商配置

```python
from langchain_openai import ChatOpenAI

# 配置多个供应商
providers = {
    "commonstack": ChatOpenAI(
        base_url="https://yanchiceshi-production.up.railway.app/v1",
        api_key="dummy",
        model="openai/gpt-4.1",
        default_headers={"X-Source": "commonstack"}
    ),
    "deepseek": ChatOpenAI(
        base_url="https://yanchiceshi-production.up.railway.app/v1",
        api_key="dummy",
        model="deepseek-chat",
        default_headers={"X-Source": "deepseek"}
    ),
    "siliconflow": ChatOpenAI(
        base_url="https://yanchiceshi-production.up.railway.app/v1",
        api_key="dummy",
        model="deepseek-ai/DeepSeek-V3",
        default_headers={"X-Source": "siliconflow"}
    )
}

# 使用
response = providers["deepseek"].invoke("解释量子计算")
print(response.content)
```

---

## 测试步骤

### 1. 测试连接

```bash
curl https://yanchiceshi-production.up.railway.app/health
```

**预期响应**：
```json
{
  "status": "ok",
  "providers": 10,
  "providerList": ["openai", "anthropic", "gemini", ...]
}
```

### 2. 查看可用供应商

```bash
curl https://yanchiceshi-production.up.railway.app/v1/providers
```

### 3. 测试聊天补全（使用预存的 Key）

```bash
curl -X POST https://yanchiceshi-production.up.railway.app/v1/chat/completions \
  -H "X-Source: commonstack" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-4.1",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 50
  }'
```

### 4. 测试流式响应

```bash
curl -X POST https://yanchiceshi-production.up.railway.app/v1/chat/completions \
  -H "X-Source: deepseek" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Count to 5"}],
    "stream": true
  }'
```

---

## 常见问题

### Q: 如何知道哪些供应商可用？
```bash
curl https://yanchiceshi-production.up.railway.app/v1/providers
```

### Q: 如何查看已存储的 Key？
```bash
curl https://yanchiceshi-production.up.railway.app/v1/keys
```

### Q: 如果我的客户端不支持自定义 Header 怎么办？
使用 query 参数：`?source=commonstack`

### Q: 支持流式响应吗？
支持，设置 `"stream": true` 即可。

### Q: 如何处理多个 Key 的负载均衡？
在数据库中存储多个相同供应商的 Key，visurf 会自动随机选择并在失败时切换。

### Q: 支持哪些模型？
每个供应商支持的模型不同，请参考各供应商的官方文档。常见模型：
- OpenAI: `gpt-4o`, `gpt-4o-mini`
- Anthropic: `claude-3-5-sonnet-20241022`
- DeepSeek: `deepseek-chat`, `deepseek-reasoner`
- Gemini: `gemini-2.0-flash-exp`

---

## 技术支持

- **API 文档**: `server/API.md`
- **部署地址**: `https://yanchiceshi-production.up.railway.app`
- **GitHub**: https://github.com/9293184/yanchiceshi

如有问题，请查看完整 API 文档或提交 Issue。

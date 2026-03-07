# CommonStack API 价格表

> 数据来源：CommonStack.ai 平台（2026-02-25 采集）
> API 端点：`https://api.commonstack.ai/v1`

---

## 模型价格总览

按 **输入价格** 从低到高排列。价格单位：$/M tokens（每百万 token 美元）。

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) | 缓存输入 ($/M) | 缓存输出 ($/M) |
|------|:--:|:-:|:-:|:-:|:-:|
| OpenAI: GPT OSS 120B | 128K | $0.05 | $0.25 | — | — |
| OpenAI: GPT 4o Mini | 128K | $0.15 | $0.6 | — | $0.08 |
| Grok Fast 4-1 Non-Reasoning | 2M | $0.2 | $0.5 | — | $0.05 |
| xAI: Grok 4.1 Fast Reasoning | 2M | $0.2 | $0.5 | — | $0.05 |
| xAI: Grok Code Fast 1 | 256K | $0.2 | $1.5 | — | $0.02 |
| DeepSeek: DeepSeek V3.2 | 128K | $0.269 | $0.4 | — | $0.1345 |
| DeepSeek: DeepSeek V3.1 | 128K | $0.2 235B A22B Instruct | 1M | $0.3 | $1.5 | — | — |
| Google: Gemini 2.5 Flash | 1M | $0.3 | $2.5 | — | $0.03 |
| MiniMax: MiniMax M2.1 | 205K | $0.3 | $1.2 | — | $0.03 |
| MiniMax: MiniMax M2 | 200K | $0.3 | $1.2 | — | $0.03 |
| Qwen3 Coder 480B A35B Instruct | 262K | $0.33 | $1.65 | — | — |
| Qwen3.5 397B A17B | 262K | $0.6 | $3.6 | — | — |
| Zhipu: GLM 4.6 | 205K | $0.6 | $2.2 | — | $0.11 |
| Moonshot: Kimi K2 | 256K | $0.6 | $2.5 | — | — |
| Moonshot: Kimi K2 Thinking | 256K | $0.6 | $2.5 | — | $0.15 |
| Moonshot: Kimi K2.5 | 262K | $0.66 | $3.3 | — | $0.11 |
| DeepSeek: DeepSeek R1 0528 | 164K | $0.7 | $2.5 | — | $0.35 |
| Seedance 1.5 | 100K | $1 | $1 | $1 | $0.1 |
| Zhipu: GLM 5 | 203K | $1 | $3.2 | — | $0.2 |
| Google: Gemini 2.5 Pro | 1M | $1.25 | $10 | — | $0.125 |
| OpenAI: GPT 5 | 400K | $1.25 | $10 | — | $0.125 |
| OpenAI: GPT 5.2 | 400K | $1.75 | $14 | $0.175 | $0.175 |
| Google: Gemini 3.1 Pro Preview | 1M | $2 | $12 | $0.375 | $0.2 |
| Google: Nano Banana Pro | 66K | $2 | $12 | $0.375 | $0.2 |
| Google: Gemini 3 Pro Preview | 1M | $2 | $12 | — | $0.2 |
| Anthropic: Claude Sonnet 4.6 | 1M | $3 | $15 | $3.75 | $0.3 |
| Anthropic: Claude Sonnet 4.5 | 1M | $3 | $15 | $3.75 | $0.3 |
| Anthropic: Claude Opus 4.5 | 200K | $5 | $25 | $6.25 | $0.5 |
| Anthropic: Claude Opus 4.6 | 1M | $5 | $25 | $6.25 | $0.5 |

---

## 按供应商分组

### OpenAI

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| GPT OSS 120B | 128K | $0.05 | $0.25 |
| GPT 4o Mini | 128K | $0.15 | $0.6 |
| GPT 5 | 400K | $1.25 | $10 |
| GPT 5.2 | 400K | $1.75 | $14 |

### xAI (Grok)

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| Grok Fast 4-1 Non-Reasoning | 2M | $0.2 | $0.5 |
| Grok 4.1 Fast Reasoning | 2M | $0.2 | $0.5 |
| Grok Code Fast 1 | 256K | $0.2 | $1.5 |

### DeepSeek

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| DeepSeek V3.2 | 128K | $0.269 | $0.4 |
| DeepSeek V3.1 | 128K | $0.27 | $1 |
| DeepSeek R1 0528 | 164K | $0.7 | $2.5 |

### Google

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| Nano Banana | 33K | $0.3 | $2.5 |
| Gemini 3 Flash | 1M | $0.3 | $2.5 |
| Gemini 2.5 Flash | 1M | $0.3 | $2.5 |
| Gemini 2.5 Pro | 1M | $1.25 | $10 |
| Nano Banana Pro | 66K | $2 | $12 |
| Gemini 3.1 Pro Preview | 1M | $2 | $12 |
| Gemini 3 Pro Preview | 1M | $2 | $12 |

### Qwen（通义千问）

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| Qwen3 235B A22B Instruct | 1M | $0.3 | $1.5 |
| Qwen3 Coder 480B A35B Instruct | 262K | $0.33 | $1.65 |
| Qwen3.5 397B A17B | 262K | $0.6 | $3.6 |

### MiniMax

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| MiniMax M2.5 | 205K | $0.3 | $1.2 |
| MiniMax M2.1 | 205K | $0.3 | $1.2 |
| MiniMax M2 | 200K | $0.3 | $1.2 |

### Moonshot (Kimi)

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| Kimi K2 | 256K | $0.6 | $2.5 |
| Kimi K2 Thinking | 256K | $0.6 | $2.5 |
| Kimi K2.5 | 262K | $0.66 | $3.3 |

### Zhipu（智谱）

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| GLM 4.6 | 205K | $0.6 | $2.2 |
| GLM 5 | 203K | $1 | $3.2 |

### Anthropic (Claude)

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| Claude Sonnet 4.6 | 1M | $3 | $15 |
| Claude Sonnet 4.5 | 1M | $3 | $15 |
| Claude Opus 4.5 | 200K | $5 | $25 |
| Claude Opus 4.6 | 1M | $5 | $25 |

### 其他

| 模型 | 上下文 | 输入 ($/M) | 输出 ($/M) |
|------|:--:|:-:|:-:|
| Seedance 1.5 | 100K | $1 | $1 |

---

## 性价比 Top 10

| 排名 | 模型 | 输入 ($/M) | 输出 ($/M) | 亮点 |
|:--:|------|:-:|:-:|------|
| 1 | GPT OSS 120B | $0.05 | $0.25 | 最便宜，120B 开源 |
| 2 | GPT 4o Mini | $0.15 | $0.6 | OpenAI 轻量 |
| 3 | Grok Fast 4-1 | $0.2 | $0.5 | 2M 上下文 |
| 4 | Grok Code Fast 1 | $0.2 | $1.5 | 编程专用 |
| 5 | DeepSeek V3.2 | $0.269 | $0.4 | 输出最便宜之一 |
| 6 | Gemini 3 Flash | $0.3 | $2.5 | 1M 上下文 |
| 7 | MiniMax M2.5 | $0.3 | $1.2 | 性价比好 |
| 8 | Qwen3 235B A22B | $0.3 | $1.5 | 1M 上下文 |
| 9 | Qwen3 Coder 480B | $0.33 | $1.65 | 编程专用 |
| 10 | Kimi K2 | $0.6 | $2.5 | 编程+Agent |

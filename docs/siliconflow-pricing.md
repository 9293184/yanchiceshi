# 硅基流动 (SiliconFlow) API 价格表

> 数据来源：硅基流动官网（2026-02-25 采集）
> API 端点：`https://api.siliconflow.cn/v1`
> 价格单位：元 / 百万 tokens（¥/M tokens）

---

## 一、免费模型（9B 及以下）

以下模型 **输入输出均免费**，有并发限制，个人使用足够。

| 模型 | 说明 |
|------|------|
| PaddlePaddle/PaddleOCR-VL-1.5 | OCR |
| PaddlePaddle/PaddleOCR-VL | OCR |
| deepseek-ai/DeepSeek-OCR | OCR |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | DeepSeek R1 蒸馏 7B |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B | DeepSeek R1 蒸馏 8B |
| THUDM/GLM-4.1V-9B-Thinking | GLM 视觉推理 9B |
| THUDM/GLM-Z1-9B-0414 | GLM 推理 9B |
| THUDM/GLM-4-9B-0414 | GLM 9B |
| THUDM/glm-4-9b-chat | GLM 对话 9B |
| Qwen/Qwen3-8B | Qwen3 8B |
| Qwen/Qwen2.5-7B-Instruct | Qwen2.5 7B |
| Qwen/Qwen2.5-Coder-7B-Instruct | Qwen2.5 编程 7B |
| Qwen/Qwen2-7B-Instruct | Qwen2 7B |
| tencent/Hunyuan-MT-7B | 腾讯混元翻译 7B |
| internlm/internlm2_5-7b-chat | InternLM 7B |

---

## 二、收费语言模型

按 **输入价格** 从低到高排列。

### 轻量级（输入 < 1 元/M）

| 模型 | 输入 (¥/M) | 输出 (¥/M) |
|------|:-:|:-:|
| Pro/Qwen/Qwen2.5-Coder-7B-Instruct | 0.35 | 0.35 |
| Pro/Qwen/Qwen2.5-VL-7B-Instruct | 0.35 | 0.35 |
| Pro/Qwen/Qwen2.5-7B-Instruct | 0.35 | 0.35 |
| Pro/Qwen/Qwen2-7B-Instruct | 0.35 | 0.35 |
| inclusionAI/Ling-mini-2.0 | 0.50 | 2.00 |
| Qwen/Qwen3-VL-8B-Instruct | 0.50 | 2.00 |
| Qwen/Qwen3-VL-8B-Thinking | 0.50 | 5.00 |
| Qwen/Qwen3-14B | 0.50 | 2.00 |
| Pro/THUDM/glm-4-9b-chat | 0.60 | 0.60 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 0.70 | 0.70 |
| Qwen/Qwen2.5-14B-Instruct | 0.70 | 0.70 |
| stepfun-ai/Step-3.5-Flash | 0.70 | 2.10 |
| Qwen/Qwen3-VL-30B-A3B-Instruct | 0.70 | 2.80 |
| Qwen/Qwen3-VL-30B-A3B-Thinking | 0.70 | 2.80 |
| Qwen/Qwen3-Omni-30B-A3B-Instruct | 0.70 | 2.80 |
| Qwen/Qwen3-Omni-30B-A3B-Thinking | 0.70 | 2.80 |
| Qwen/Qwen3-Omni-30B-A3B-Captioner | 0.70 | 2.80 |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 0.70 | 2.80 |
| Qwen/Qwen3-30B-A3B-Instruct-2507 | 0.70 | 2.80 |
| Qwen/Qwen3-30B-A3B-Thinking-2507 | 0.70 | 2.80 |
| deepseek-ai/deepseek-vl2 | 0.99 | 0.99 |

### 中等（输入 1~2 元/M）

| 模型 | 输入 (¥/M) | 输出 (¥/M) |
|------|:-:|:-:|
| zai-org/GLM-4.6V | 1.00 | 3.00 |
| inclusionAI/Ling-flash-2.0 | 1.00 | 4.00 |
| inclusionAI/Ring-flash-2.0 | 1.00 | 4.00 |
| Qwen/Qwen3-VL-32B-Instruct | 1.00 | 4.00 |
| Qwen/Qwen3-VL-32B-Thinking | 1.00 | 10.00 |
| Kwaipilot/KAT-Dev | 1.00 | 4.00 |
| Qwen/Qwen3-Next-80B-A3B-Instruct | 1.00 | 4.00 |
| Qwen/Qwen3-Next-80B-A3B-Thinking | 1.00 | 4.00 |
| tencent/Hunyuan-A13B-Instruct | 1.00 | 4.00 |
| Qwen/Qwen3-32B | 1.00 | 4.00 |
| Qwen/QwQ-32B | 1.00 | 4.00 |
| ascend-tribe/pangu-pro-moe | 1.00 | 4.00 |
| THUDM/GLM-Z1-32B-0414 | 1.00 | 4.00 |
| zai-org/GLM-4.5V | 1.00 | 6.00 |
| zai-org/GLM-4.5-Air | 1.00 | 6.00 |
| Qwen/Qwen2.5-Coder-32B-Instruct | 1.26 | 1.26 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B | 1.26 | 1.26 |
| Qwen/Qwen2.5-32B-Instruct | 1.26 | 1.26 |
| deepseek-ai/DeepSeek-V2.5 | 1.33 | 1.33 |
| ByteDance-Seed/Seed-OSS-36B-Instruct | 1.50 | 4.00 |
| Qwen/Qwen2.5-VL-32B-Instruct | 1.89 | 1.89 |
| THUDM/GLM-4-32B-0414 | 1.89 | 1.89 |

### 大模型（输入 2~4 元/M）

| 模型 | 输入 (¥/M) | 输出 (¥/M) |
|------|:-:|:-:|
| deepseek-ai/DeepSeek-V3.2 | 2.00 | 3.00 |
| Pro/deepseek-ai/DeepSeek-V3.2 | 2.00 | 3.00 |
| Pro/deepseek-ai/DeepSeek-V3 | 2.00 | 8.00 |
| deepseek-ai/DeepSeek-V3 | 2.00 | 8.00 |
| baidu/ERNIE-4.5-300B-A47B | 2.00 | 8.00 |
| Pro/MiniMaxAI/MiniMax-M2.5 | 2.10 | 8.40 |
| Pro/MiniMaxAI/MiniMax-M2.1 | 2.10 | 8.40 |
| Qwen/Qwen3-VL-235B-A22B-Instruct | 2.50 | 10.00 |
| Qwen/Qwen3-VL-235B-A22B-Thinking | 2.50 | 10.00 |
| Qwen/Qwen3-235B-A22B-Thinking-2507 | 2.50 | 10.00 |
| Qwen/Qwen3-235B-A22B-Instruct-2507 | 2.50 | 10.00 |
| zai-org/GLM-4.6 | 3.50 | 14.00 |
| Qwen/Qwen2.5-72B-Instruct | 4.13 | 4.13 |
| Qwen/Qwen2.5-VL-72B-Instruct | 4.13 | 4.13 |
| Qwen/Qwen2.5-72B-Instruct-128K | 4.13 | 4.13 |
| Qwen/Qwen2-VL-72B-Instruct | 4.13 | 4.13 |

### 旗舰模型（输入 4+ 元/M）

| 模型 | 输入 (¥/M) | 输出 (¥/M) |
|------|:-:|:-:|
| Pro/deepseek-ai/DeepSeek-V3.1-Terminus | 4.00 | 12.00 |
| deepseek-ai/DeepSeek-V3.1-Terminus | 4.00 | 12.00 |
| Pro/moonshotai/Kimi-K2-Instruct-0905 | 4.00 | 16.00 |
| Pro/moonshotai/Kimi-K2-Thinking | 4.00 | 16.00 |
| Pro/deepseek-ai/DeepSeek-R1 | 4.00 | 16.00 |
| Pro/zai-org/GLM-4.7 | 4.00 | 16.00 |
| moonshotai/Kimi-K2-Thinking | 4.00 | 16.00 |
| moonshotai/Kimi-K2-Instruct-0905 | 4.00 | 16.00 |
| deepseek-ai/DeepSeek-R1 | 4.00 | 16.00 |
| Pro/moonshotai/Kimi-K2.5 | 4.00 | 21.00 |
| Pro/zai-org/GLM-5 | 4.00 | 22.00 |
| Qwen/Qwen3-Coder-480B-A35B-Instruct | 8.00 | 16.00 |

---

## 三、模型微调

| 模型 | 训练 (¥/M tokens) | 推理 (¥/M tokens) |
|------|:-:|:-:|
| Qwen/Qwen2.5-7B-Instruct | ¥3.50 | ¥0.53 |
| Qwen/Qwen2.5-14B-Instruct | ¥7.00 | ¥1.05 |
| Qwen/Qwen2.5-32B-Instruct | ¥12.60 | ¥1.89 |
| Qwen/Qwen2.5-72B-Instruct | ¥41.30 | ¥6.20 |

---

## 四、批量处理

| 模型 | 输入 (¥/M tokens) | 输出 (¥/M tokens) |
|------|:-:|:-:|
| deepseek-ai/DeepSeek-R1 | ¥2.00 | ¥8.00 |
| deepseek-ai/DeepSeek-V3 | ¥1.00 | ¥4.00 |
| Qwen/QwQ-32B | ¥0.50 | ¥2.00 |

---

## 五、性价比 Top 10（收费模型）

| 排名 | 模型 | 输入 (¥/M) | 输出 (¥/M) | 亮点 |
|:--:|------|:-:|:-:|------|
| 1 | Pro/Qwen2.5-7B 系列 | 0.35 | 0.35 | 最便宜收费模型 |
| 2 | Qwen3-14B | 0.50 | 2.00 | 小巧强大 |
| 3 | Qwen3-VL-8B-Instruct | 0.50 | 2.00 | 视觉理解 |
| 4 | Pro/glm-4-9b-chat | 0.60 | 0.60 | 输入输出同价 |
| 5 | Qwen3-30B-A3B 系列 | 0.70 | 2.80 | MoE 高效 |
| 6 | Qwen3-Coder-30B-A3B | 0.70 | 2.80 | 编程专用 |
| 7 | Step-3.5-Flash | 0.70 | 2.10 | 阶跃星辰 |
| 8 | Qwen3-32B | 1.00 | 4.00 | 通用强模型 |
| 9 | DeepSeek-V3.2 | 2.00 | 3.00 | 最新 DeepSeek |
| 10 | DeepSeek-R1 | 4.00 | 16.00 | 顶级推理 |

---

## 六、关键说明

- **免费模型**：9B 及以下模型永久免费，有并发限制
- **Pro 版本**：部分模型有 Pro 版本，价格相同但提供更高并发和稳定性
- **LoRA 微调**：支持 Qwen2.5 系列 LoRA 微调后托管
- **新用户**：注册赠送 14 元免费额度
- **批量处理**：支持离线批量推理，价格与在线一致

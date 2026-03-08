/**
 * messages.ts — Anthropic Messages API 格式支持
 *
 * 参考 sub2api 的 GeminiMessagesCompatService 设计：
 * - 接收 Anthropic Messages 格式请求
 * - 根据供应商转换格式（Anthropic 直接转发，其他转换）
 * - 返回 Anthropic Messages 格式响应
 */

import type { Request, Response } from 'express';
import type { SourceId } from './providers.js';
import { getProvider, extractApiKey } from './providers.js';
import { getRandomApiKey } from './keystore.js';
import { logUsage } from './db.js';

// ─── Anthropic Messages 类型定义 ──────────────────────

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; [key: string]: any }>;
}

interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  system?: string;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
  stream?: boolean;
  metadata?: Record<string, any>;
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{ type: 'text'; text: string }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// ─── 格式转换函数 ────────────────────────────────────

/**
 * 将 Anthropic Messages 格式转换为 OpenAI Chat Completions 格式
 * 用于非 Anthropic 供应商（OpenAI、Gemini 等）
 */
function convertMessagesToOpenAI(req: AnthropicRequest): Record<string, any> {
  const messages: Array<{ role: string; content: string }> = [];

  // 添加 system message
  if (req.system) {
    messages.push({ role: 'system', content: req.system });
  }

  // 转换 messages
  for (const msg of req.messages) {
    let content: string;
    if (typeof msg.content === 'string') {
      content = msg.content;
    } else {
      // 合并多个 content blocks
      content = msg.content
        .filter(block => block.type === 'text' && block.text)
        .map(block => block.text)
        .join('\n');
    }
    messages.push({ role: msg.role, content });
  }

  return {
    model: req.model,
    messages,
    max_tokens: req.max_tokens,
    temperature: req.temperature,
    top_p: req.top_p,
    stop: req.stop_sequences,
    stream: req.stream,
  };
}

/**
 * 将 OpenAI Chat Completions 响应转换为 Anthropic Messages 格式
 */
function convertOpenAIToMessages(
  openaiResponse: Record<string, any>,
  model: string
): AnthropicResponse {
  const choice = openaiResponse.choices?.[0];
  const message = choice?.message;
  const content = message?.content || '';

  return {
    id: openaiResponse.id || `msg-${Date.now()}`,
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: content }],
    model,
    stop_reason: choice?.finish_reason === 'length' ? 'max_tokens' : 'end_turn',
    stop_sequence: null,
    usage: {
      input_tokens: openaiResponse.usage?.prompt_tokens || 0,
      output_tokens: openaiResponse.usage?.completion_tokens || 0,
    },
  };
}

// ─── 主处理函数 ──────────────────────────────────────

/**
 * 处理 /v1/messages 请求（Anthropic Messages 格式）
 */
export async function handleMessagesRequest(
  req: Request,
  res: Response,
  source: SourceId
): Promise<void> {
  const startTime = performance.now();
  const body = req.body as AnthropicRequest;

  // 验证必需字段
  if (!body.model || !body.messages || !body.max_tokens) {
    res.status(400).json({
      type: 'error',
      error: {
        type: 'invalid_request_error',
        message: '需要 model, messages 和 max_tokens 字段',
      },
    });
    return;
  }

  // 获取 API Key
  const userProvidedKey = extractApiKey(req);
  let apiKey = userProvidedKey;
  const failedKeys: string[] = [];

  if (!apiKey) {
    apiKey = (await getRandomApiKey(source, failedKeys)) ?? undefined;
  }
  if (!apiKey) {
    res.status(401).json({
      type: 'error',
      error: {
        type: 'authentication_error',
        message: '需要 x-api-key header 或在系统中预存该供应商的 Key',
      },
    });
    return;
  }

  const provider = getProvider(source);
  if (!provider) {
    res.status(400).json({
      type: 'error',
      error: {
        type: 'invalid_request_error',
        message: `供应商 "${source}" 未配置`,
      },
    });
    return;
  }

  // 根据供应商类型处理请求
  const isAnthropicNative = source === 'anthropic';
  const requestBody = isAnthropicNative ? body : convertMessagesToOpenAI(body);
  const transformedBody = provider.transformRequestBody(requestBody as Record<string, unknown>);

  // 构建请求
  const headers = provider.injectAuthHeaders(
    { 'Content-Type': 'application/json' },
    apiKey
  );

  // Anthropic 使用 /v1/messages，其他用 /chat/completions
  const endpoint = isAnthropicNative ? '/messages' : '/chat/completions';
  const url = provider.buildUrl(endpoint);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(transformedBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!upstream.ok) {
      const errorData = await upstream.text();
      res.status(upstream.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(errorData);
      return;
    }

    // 处理响应
    if (body.stream) {
      // 流式响应：直接透传（Anthropic SSE 格式）
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = upstream.body?.getReader();
      if (!reader) {
        res.status(500).json({
          type: 'error',
          error: { type: 'api_error', message: '无法读取流式响应' },
        });
        return;
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value, { stream: true }));
      }
      res.end();
    } else {
      // 非流式响应
      const data = await upstream.json();
      const latencyMs = Math.round(performance.now() - startTime);

      // 如果是非 Anthropic 供应商，转换响应格式
      const response = isAnthropicNative
        ? data
        : convertOpenAIToMessages(data, body.model);

      // 记录用量
      const usage = response.usage || data.usage;
      if (usage) {
        logUsage({
          source,
          model: body.model,
          provider: source,
          promptTokens: usage.input_tokens || usage.prompt_tokens || 0,
          completionTokens: usage.output_tokens || usage.completion_tokens || 0,
          totalTokens:
            (usage.input_tokens || usage.prompt_tokens || 0) +
            (usage.output_tokens || usage.completion_tokens || 0),
          latency: latencyMs,
          success: true,
        });
      }

      res.json(response);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    const message =
      err instanceof Error ? err.message : '请求失败';
    res.status(502).json({
      type: 'error',
      error: { type: 'api_error', message },
    });
  }
}

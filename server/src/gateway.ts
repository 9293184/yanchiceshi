/**
 * gateway.ts — 核心代理网关
 *
 * 参考 sub2api 的 GatewayService.Forward 设计：
 * 1. 请求预处理（模型映射、字段适配）
 * 2. Header 注入（清除客户端鉴权 → 注入上游凭证）
 * 3. 重试 + Key 轮换（指数退避）
 * 4. SSE 流式响应透传（逐行转发 + Usage 提取）
 * 5. 非流式响应处理
 */

import type { Request, Response } from 'express';
import type { Provider, SourceId, Usage } from './providers.js';
import { getProvider, filterClientHeaders, extractApiKey } from './providers.js';
import { logUsage } from './db.js';
import { getFirstApiKey, getRandomApiKey } from './keystore.js';

// ─── 配置常量 ───────────────────────────────────────────

const MAX_RETRY_ATTEMPTS = 3;
const MAX_RETRY_ELAPSED_MS = 30_000; // 总重试时间预算
const STREAM_DATA_TIMEOUT_MS = 60_000; // SSE 流数据超时
const FETCH_TIMEOUT_MS = 30_000; // 单次 fetch 超时（30s）
const MODELS_FETCH_TIMEOUT_MS = 15_000; // /models 请求超时（15s）

/** 指数退避延迟（参考 sub2api 的 retryBackoffDelay） */
function retryBackoffDelay(attempt: number): number {
  // 1s, 2s, 4s ...
  return Math.min(1000 * Math.pow(2, attempt - 1), 8000);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── 日志脱敏（参考 sub2api 的 sanitizeUpstreamErrorMessage） ──

/** 从错误消息中移除敏感信息（API Key、Token 等） */
function sanitizeLogMessage(msg: string): string {
  return msg
    // Bearer token: sk-xxx...xxx → sk-***
    .replace(/(?:Bearer\s+|sk-|ak-|AIza)[A-Za-z0-9_\-]{6,}/gi, (match) => {
      const prefix = match.slice(0, Math.min(6, match.length));
      return `${prefix}***`;
    })
    // x-api-key / x-goog-api-key values
    .replace(/(?:api[_-]?key["':\s=]+)[A-Za-z0-9_\-]{6,}/gi, (match) => {
      const idx = match.search(/[A-Za-z0-9_\-]{6,}$/);
      if (idx > 0) return match.slice(0, idx) + '***';
      return match;
    });
}

// ─── ForwardResult ──────────────────────────────────────

export interface ForwardResult {
  success: boolean;
  statusCode: number;
  usage: Usage;
  latencyMs: number;
  firstTokenMs?: number;
  stream: boolean;
  error?: string;
  retryAttempts: number;
}

// ─── 核心转发函数 ────────────────────────────────────────

/**
 * 代理转发 /v1/chat/completions 请求
 *
 * 完整流程（参考 sub2api Forward）：
 * 1. 提取用户传入的 API Key
 * 2. 获取 Provider
 * 3. 预处理请求体
 * 4. 重试循环：构建请求 → 发送 → 错误处理
 * 5. 流式/非流式响应处理
 */
export async function forwardChatCompletion(
  req: Request,
  res: Response,
  source: SourceId,
): Promise<ForwardResult> {
  const startTime = performance.now();

  // 1. 提取 API Key：优先用户传入，其次从 DB 读取
  const userProvidedKey = extractApiKey(req);
  let apiKey = userProvidedKey;
  const failedKeys: string[] = []; // 记录失败的 key，用于账号池轮换
  
  if (!apiKey) {
    // 尝试从 DB 获取该供应商存储的 Key（账号池轮换）
    apiKey = await getRandomApiKey(source, failedKeys) ?? undefined;
  }
  if (!apiKey) {
    res.status(401).json({ error: { message: '需要 Authorization header 传入 API Key，或在系统中预存该供应商的 Key', type: 'authentication_error' } });
    return makeErrorResult(startTime, 401, 'Missing API key');
  }

  const provider = getProvider(source);
  if (!provider) {
    res.status(400).json({ error: { message: `供应商 "${source}" 未配置`, type: 'invalid_request_error' } });
    return makeErrorResult(startTime, 400, `Provider "${source}" not configured`);
  }

  // 2. 预处理请求体
  const rawBody = req.body as Record<string, unknown>;
  if (!rawBody.model || !rawBody.messages) {
    res.status(400).json({ error: { message: '需要 model 和 messages 字段', type: 'invalid_request_error' } });
    return makeErrorResult(startTime, 400, 'Missing model or messages');
  }

  const body = provider.transformRequestBody(rawBody);
  const isStream = !!body.stream;
  const originalModel = rawBody.model as string;

  // 3. 构建安全 Header（参考 sub2api 的 buildUpstreamRequest）
  const safeClientHeaders = filterClientHeaders(req.headers as Record<string, string>);

  // 4. 重试循环（仅对服务端错误重试，Key 错误直接返回给用户）
  const maxRetries = provider.config.maxRetries ?? MAX_RETRY_ATTEMPTS;
  let lastError: string | undefined;
  let retryAttempts = 0;
  let upstreamResponse: globalThis.Response | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    retryAttempts = attempt;
    const elapsed = performance.now() - startTime;
    if (elapsed > MAX_RETRY_ELAPSED_MS) {
      console.warn(`[gateway] ${source} 重试超时 (${Math.round(elapsed)}ms > ${MAX_RETRY_ELAPSED_MS}ms)`);
      break;
    }

    // 构建上游请求 Header — 注入用户传入的 Key
    const headers = provider.injectAuthHeaders({
      ...safeClientHeaders,
      'Content-Type': 'application/json',
    }, apiKey);

    // Gemini 需要特殊 URL（参考 sub2api: /v1beta/models/{model}:generateContent）
    let url: string;
    if (provider.config.protocol === 'gemini' && 'buildGeminiUrl' in provider) {
      url = (provider as any).buildGeminiUrl(body.model as string, isStream);
    } else {
      url = provider.buildUrl('/chat/completions');
    }

    // 单次请求超时控制（参考 sub2api 的 context deadline）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      upstreamResponse = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      lastError = controller.signal.aborted ? `请求超时 (${FETCH_TIMEOUT_MS}ms)` : rawMsg;
      console.error(`[gateway] ${source} 网络错误 (attempt ${attempt}):`, sanitizeLogMessage(lastError));
      if (attempt < maxRetries) {
        await sleep(retryBackoffDelay(attempt));
        continue;
      }
      break;
    } finally {
      clearTimeout(timeoutId);
    }

    // 请求成功（2xx/3xx）
    if (upstreamResponse.status < 400) {
      break;
    }

    // 错误处理
    const status = upstreamResponse.status;
    lastError = `HTTP ${status}`;

    // 可重试错误（仅 429/5xx）+ 指数退避
    if (provider.shouldRetry(status) && attempt < maxRetries) {
      const delay = retryBackoffDelay(attempt);
      console.log(`[gateway] ${source} 重试 (${status}), 等待 ${delay}ms`);
      await sleep(delay);
      continue;
    }

    // 401/403 等 Key 错误：如果是从 DB 获取的 key，尝试轮换到下一个 key
    if (!userProvidedKey && (status === 401 || status === 403) && attempt < maxRetries) {
      console.log(`[gateway] ${source} Key 失败 (${status}), 尝试轮换到下一个 key`);
      failedKeys.push(apiKey);
      const nextKey = await getRandomApiKey(source, failedKeys);
      if (nextKey) {
        apiKey = nextKey;
        console.log(`[gateway] ${source} 已轮换到新 key`);
        await sleep(retryBackoffDelay(attempt));
        continue;
      }
      console.warn(`[gateway] ${source} 无可用 key，停止重试`);
    }
    // 用户提供的 key 失败，或无更多可用 key，直接返回错误
    break;
  }

  // 5. 没有拿到响应 → 502
  if (!upstreamResponse) {
    res.status(502).json({
      error: { message: `上游请求失败: ${lastError}`, type: 'upstream_error' },
    });
    return makeErrorResult(startTime, 502, lastError, retryAttempts);
  }

  // 6. 上游返回错误 → 透传
  if (upstreamResponse.status >= 400) {
    try {
      const errData = await upstreamResponse.text();
      res.status(upstreamResponse.status);
      res.setHeader('Content-Type', upstreamResponse.headers.get('content-type') || 'application/json');
      res.send(errData);
    } catch {
      res.status(upstreamResponse.status).json({
        error: { message: `上游错误: ${lastError}`, type: 'upstream_error' },
      });
    }
    return makeErrorResult(startTime, upstreamResponse.status, lastError, retryAttempts);
  }

  // 7. 成功响应 — 流式 or 非流式
  if (isStream) {
    return handleStreamingResponse(provider, upstreamResponse, res, source, originalModel, startTime, retryAttempts);
  } else {
    return handleNonStreamingResponse(provider, upstreamResponse, res, source, originalModel, startTime, retryAttempts);
  }
}

// ─── 非流式响应处理 ──────────────────────────────────────

async function handleNonStreamingResponse(
  provider: Provider,
  upstream: globalThis.Response,
  res: Response,
  source: SourceId,
  originalModel: string,
  startTime: number,
  retryAttempts: number,
): Promise<ForwardResult> {
  const data = await upstream.json() as Record<string, unknown>;
  const latencyMs = Math.round(performance.now() - startTime);
  const usage = provider.extractUsage(data);

  // 透传上游响应头（安全过滤）
  passUpstreamHeaders(upstream, res);

  // 附带 billing 信息
  const parts = originalModel.split('/');
  const providerName = parts.length > 1 ? parts[0] : source;

  logUsage({
    source,
    model: originalModel,
    provider: providerName,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    latency: latencyMs,
    success: true,
  });

  res.status(upstream.status).json({
    ...data,
    _billing: {
      source,
      model: originalModel,
      provider: providerName,
      tokens: { prompt: usage.promptTokens, completion: usage.completionTokens, total: usage.totalTokens },
      latency: latencyMs,
    },
  });

  return {
    success: true,
    statusCode: upstream.status,
    usage,
    latencyMs,
    stream: false,
    retryAttempts,
  };
}

// ─── SSE 流式响应处理（参考 sub2api handleStreamingResponse）──

async function handleStreamingResponse(
  provider: Provider,
  upstream: globalThis.Response,
  res: Response,
  source: SourceId,
  originalModel: string,
  startTime: number,
  retryAttempts: number,
): Promise<ForwardResult> {
  // 设置 SSE 响应头（参考 sub2api）
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲

  const usage: Usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  let firstTokenMs: number | undefined;
  let clientDisconnected = false;

  // 监听客户端断开
  res.on('close', () => {
    clientDisconnected = true;
  });

  const body = upstream.body;
  if (!body) {
    res.end();
    return makeErrorResult(startTime, 200, 'No response body', retryAttempts);
  }

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 按行处理（SSE 以 \n\n 分隔事件）
      const lines = buffer.split('\n');
      // 保留最后一行（可能不完整）
      buffer = lines.pop() || '';

      for (const line of lines) {
        // 从 SSE data 行中提取 usage（参考 sub2api 的 parseSSEUsage）
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();

          // 记录首 token 时间
          if (firstTokenMs === undefined && dataStr !== '[DONE]') {
            firstTokenMs = Math.round(performance.now() - startTime);
          }

          // 尝试从每个 SSE 事件中提取 usage
          if (dataStr !== '[DONE]') {
            try {
              const chunk = JSON.parse(dataStr) as Record<string, unknown>;
              const chunkUsage = chunk.usage as Record<string, number> | undefined;
              if (chunkUsage) {
                // 最后一个 chunk 通常包含完整 usage
                usage.promptTokens = chunkUsage.prompt_tokens || usage.promptTokens;
                usage.completionTokens = chunkUsage.completion_tokens || usage.completionTokens;
                usage.totalTokens = chunkUsage.total_tokens || usage.totalTokens;
              }
            } catch {
              // 解析失败忽略，正常的 SSE 数据
            }
          }
        }

        // 转发给客户端（参考 sub2api：即使客户端断开也继续 drain 上游流拿 usage）
        if (!clientDisconnected) {
          try {
            res.write(line + '\n');
          } catch {
            clientDisconnected = true;
          }
        }
      }

      // 刷出（参考 sub2api 的 flusher.Flush）
      if (!clientDisconnected) {
        try {
          res.flushHeaders();
        } catch {
          clientDisconnected = true;
        }
      }
    }

    // 处理缓冲区中剩余的数据
    if (buffer.trim()) {
      if (!clientDisconnected) {
        try {
          res.write(buffer + '\n');
        } catch {
          clientDisconnected = true;
        }
      }
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error(`[gateway] ${source} SSE 流读取错误:`, sanitizeLogMessage(errMsg));
  } finally {
    reader.releaseLock();
  }

  if (!clientDisconnected) {
    res.end();
  }

  const latencyMs = Math.round(performance.now() - startTime);
  if (!usage.totalTokens) {
    usage.totalTokens = usage.promptTokens + usage.completionTokens;
  }

  // 记录用量
  const parts = originalModel.split('/');
  const providerName = parts.length > 1 ? parts[0] : source;

  logUsage({
    source,
    model: originalModel,
    provider: providerName,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    latency: latencyMs,
    success: true,
  });

  return {
    success: true,
    statusCode: 200,
    usage,
    latencyMs,
    firstTokenMs,
    stream: true,
    retryAttempts,
  };
}

// ─── 代理转发 /v1/models ────────────────────────────────

export async function forwardModels(
  req: Request,
  res: Response,
  source: SourceId,
): Promise<void> {
  let apiKey = extractApiKey(req);
  if (!apiKey) {
    // 使用账号池轮换随机选择一个可用 key
    apiKey = await getRandomApiKey(source) ?? undefined;
  }
  if (!apiKey) {
    res.status(401).json({ error: { message: '需要 Authorization header 传入 API Key，或在系统中预存该供应商的 Key', type: 'authentication_error' } });
    return;
  }

  const provider = getProvider(source);
  if (!provider) {
    res.status(400).json({ error: { message: `供应商 "${source}" 未配置`, type: 'invalid_request_error' } });
    return;
  }

  const headers = provider.injectAuthHeaders({}, apiKey);
  const url = provider.buildUrl('/models');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MODELS_FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(url, { headers, signal: controller.signal });
    const data = await upstream.json();
    passUpstreamHeaders(upstream, res);
    res.status(upstream.status).json(data);
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const msg = controller.signal.aborted ? `请求超时 (${MODELS_FETCH_TIMEOUT_MS}ms)` : rawMsg;
    res.status(502).json({
      error: { message: msg, type: 'upstream_error' },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── 工具函数 ────────────────────────────────────────────

/** 透传安全的上游响应头 */
function passUpstreamHeaders(upstream: globalThis.Response, res: Response) {
  const safe = [
    'x-request-id',
    'x-ratelimit-limit-requests',
    'x-ratelimit-remaining-requests',
    'x-ratelimit-limit-tokens',
    'x-ratelimit-remaining-tokens',
    'x-ratelimit-reset-requests',
    'x-ratelimit-reset-tokens',
  ];
  for (const key of safe) {
    const val = upstream.headers.get(key);
    if (val) res.setHeader(key, val);
  }
}

function makeErrorResult(
  startTime: number,
  statusCode: number,
  error?: string,
  retryAttempts = 0,
): ForwardResult {
  return {
    success: false,
    statusCode,
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    latencyMs: Math.round(performance.now() - startTime),
    stream: false,
    error,
    retryAttempts,
  };
}

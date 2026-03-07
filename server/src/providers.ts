/**
 * providers.ts — 供应商抽象层
 *
 * 参考 sub2api 的 Account + GatewayService 设计，为每个 AI API 供应商定义：
 * 1. 鉴权方式（Bearer Token / x-api-key / 自定义）
 * 2. 请求 URL 构建
 * 3. Header 注入（白名单透传 + 鉴权头替换）
 * 4. 请求体预处理（字段适配、模型映射）
 * 5. 响应解析（Usage 提取）
 */

// ─── 类型定义 ──────────────────────────────────────────

export type SourceId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'deepseek'
  | 'commonstack'
  | 'moonshot'
  | 'qiniu'
  | 'zhipu'
  | 'siliconflow'
  | 'stepfun';

/** 鉴权方式 */
export type AuthScheme =
  | 'bearer'          // Authorization: Bearer <key>  (OpenAI 兼容)
  | 'x-api-key'       // x-api-key: <key>  (Anthropic)
  | 'x-goog-api-key'  // x-goog-api-key: <key>  (Gemini)
  | 'custom';         // 自定义鉴权（留扩展口）

/** 供应商协议类型 */
export type ProtocolType =
  | 'openai'        // OpenAI Chat Completions 兼容
  | 'anthropic'     // Anthropic Messages API
  | 'gemini'        // Google Gemini generateContent API
  | 'custom';       // 自定义协议

/** 供应商配置（不再持有 Key — Key 由用户请求传入） */
export interface ProviderConfig {
  id: SourceId;
  label: string;
  baseUrl: string;
  protocol: ProtocolType;
  auth: AuthScheme;

  /** 模型映射表：请求模型名 → 上游实际模型名 */
  modelMapping?: Record<string, string>;

  /** 额外固定 Header（如 anthropic-version） */
  extraHeaders?: Record<string, string>;

  /** 最大重试次数（默认 2） */
  maxRetries?: number;

  /** 并发限制（默认无限制） */
  concurrency?: number;
}

// ─── Provider 接口 ──────────────────────────────────────

export interface Provider {
  readonly config: ProviderConfig;

  /** 构建上游请求 URL */
  buildUrl(path: string): string;

  /** 注入鉴权 Header — apiKey 由用户传入 */
  injectAuthHeaders(headers: Record<string, string>, apiKey: string): Record<string, string>;

  /** 预处理请求体（模型映射、字段适配） */
  transformRequestBody(body: Record<string, unknown>): Record<string, unknown>;

  /** 从响应中提取 Usage */
  extractUsage(data: Record<string, unknown>): Usage;

  /** 判断某个 HTTP 状态码是否应该触发重试 */
  shouldRetry(statusCode: number): boolean;
}

export interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// ─── 客户端 Header 白名单（参考 sub2api 的 allowedHeaders） ──────

const PASSTHROUGH_HEADERS = new Set([
  'content-type',
  'accept',
  'accept-encoding',
  'user-agent',
]);

/** 危险 Header — 必须在转发前清除（参考 sub2api 的安全机制） */
const STRIP_HEADERS = new Set([
  'authorization',
  'x-api-key',
  'x-goog-api-key',
  'cookie',
  'host',
]);

/** 从客户端请求中过滤出安全的 Header */
export function filterClientHeaders(
  clientHeaders: Record<string, string | string[] | undefined>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(clientHeaders)) {
    const lower = key.toLowerCase();
    if (STRIP_HEADERS.has(lower)) continue;
    if (!PASSTHROUGH_HEADERS.has(lower)) continue;
    if (value) {
      result[key] = Array.isArray(value) ? value[0] : value;
    }
  }
  return result;
}

// ─── OpenAI 兼容供应商基类 ──────────────────────────────

class OpenAICompatProvider implements Provider {
  constructor(public readonly config: ProviderConfig) {}

  buildUrl(path: string): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    return `${base}${path}`;
  }

  injectAuthHeaders(headers: Record<string, string>, apiKey: string): Record<string, string> {
    // 参考 sub2api: 先清除客户端鉴权头，再注入用户传入的凭证
    const result = { ...headers };
    delete result['authorization'];
    delete result['Authorization'];
    delete result['x-api-key'];

    switch (this.config.auth) {
      case 'bearer':
        result['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'x-api-key':
        result['x-api-key'] = apiKey;
        break;
      case 'x-goog-api-key':
        result['x-goog-api-key'] = apiKey;
        break;
    }

    // 注入供应商固定 Header（如 anthropic-version）
    if (this.config.extraHeaders) {
      Object.assign(result, this.config.extraHeaders);
    }

    // 确保 Content-Type
    if (!result['Content-Type'] && !result['content-type']) {
      result['Content-Type'] = 'application/json';
    }

    return result;
  }

  transformRequestBody(body: Record<string, unknown>): Record<string, unknown> {
    const result = { ...body };

    // 模型映射（参考 sub2api 的 GetMappedModel）
    if (result.model && this.config.modelMapping) {
      const mapped = this.config.modelMapping[result.model as string];
      if (mapped) {
        result.model = mapped;
      }
    }

    return result;
  }

  extractUsage(data: Record<string, unknown>): Usage {
    const usage = (data.usage || {}) as Record<string, number>;
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    return {
      promptTokens,
      completionTokens,
      totalTokens: usage.total_tokens || promptTokens + completionTokens,
    };
  }

  /** 参考 sub2api 的 shouldRetryUpstreamError */
  shouldRetry(statusCode: number): boolean {
    // 429 = 限流，500+ = 服务端错误
    return statusCode === 429 || statusCode >= 500;
  }
}

// ─── Anthropic 供应商（留扩展口） ──────────────────────

class AnthropicProvider extends OpenAICompatProvider {
  constructor(config: ProviderConfig) {
    super({
      ...config,
      protocol: 'anthropic',
      auth: 'x-api-key',
      extraHeaders: {
        ...config.extraHeaders,
        'anthropic-version': '2023-06-01',
      },
    });
  }

  buildUrl(path: string): string {
    // Anthropic 的路径不同：/v1/messages 而不是 /v1/chat/completions
    const base = this.config.baseUrl.replace(/\/$/, '');
    if (path === '/chat/completions') {
      return `${base}/messages`;
    }
    return `${base}${path}`;
  }

  transformRequestBody(body: Record<string, unknown>): Record<string, unknown> {
    // Anthropic 格式与 OpenAI 不同，需要转换
    // 参考 sub2api: max_output_tokens → max_tokens
    const result = super.transformRequestBody(body);

    if (result.max_output_tokens) {
      result.max_tokens = result.max_output_tokens;
      delete result.max_output_tokens;
    }

    // 如果没有 max_tokens 默认给一个
    if (!result.max_tokens) {
      result.max_tokens = 4096;
    }

    return result;
  }

  extractUsage(data: Record<string, unknown>): Usage {
    // Anthropic 的 usage 格式
    const usage = (data.usage || {}) as Record<string, number>;
    const promptTokens = usage.input_tokens || 0;
    const completionTokens = usage.output_tokens || 0;
    return {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
  }
}

// ─── Gemini 供应商（参考 sub2api 的 GeminiMessagesCompatService） ──

class GeminiProvider extends OpenAICompatProvider {
  constructor(config: ProviderConfig) {
    super({
      ...config,
      protocol: 'gemini',
      auth: 'x-goog-api-key',
    });
  }

  buildUrl(path: string): string {
    // 参考 sub2api: Gemini 的 URL 格式完全不同
    // /v1beta/models/{model}:generateContent
    // /v1beta/models/{model}:streamGenerateContent?alt=sse
    // 但我们在 gateway 层统一用 /chat/completions 路径
    // 实际 model 和 stream 在 buildGeminiUrl() 中处理
    const base = this.config.baseUrl.replace(/\/$/, '');
    if (path === '/chat/completions') {
      // 占位 — 实际 URL 在 gateway 的 forwardChatCompletion 中根据 model+stream 构建
      return `${base}/v1beta/models`;
    }
    if (path === '/models') {
      return `${base}/v1beta/models`;
    }
    return `${base}${path}`;
  }

  /** Gemini 专用：根据 model 和 stream 构建完整 URL */
  buildGeminiUrl(model: string, stream: boolean): string {
    const base = this.config.baseUrl.replace(/\/$/, '');
    const action = stream ? 'streamGenerateContent' : 'generateContent';
    const url = `${base}/v1beta/models/${model}:${action}`;
    return stream ? `${url}?alt=sse` : url;
  }

  injectAuthHeaders(headers: Record<string, string>, apiKey: string): Record<string, string> {
    // 参考 sub2api: Gemini 用 x-goog-api-key
    const result = { ...headers };
    delete result['authorization'];
    delete result['Authorization'];
    delete result['x-api-key'];
    delete result['x-goog-api-key'];

    result['x-goog-api-key'] = apiKey;

    if (this.config.extraHeaders) {
      Object.assign(result, this.config.extraHeaders);
    }

    if (!result['Content-Type'] && !result['content-type']) {
      result['Content-Type'] = 'application/json';
    }

    return result;
  }

  transformRequestBody(body: Record<string, unknown>): Record<string, unknown> {
    // OpenAI 格式 → Gemini generateContent 格式
    // 参考 sub2api 的 convertClaudeMessagesToGeminiGenerateContent
    const mapped = super.transformRequestBody(body);
    const messages = mapped.messages as Array<Record<string, unknown>> | undefined;
    if (!messages || !Array.isArray(messages)) return mapped;

    const out: Record<string, unknown> = {};

    // 1. 提取 system message → systemInstruction
    const systemMsgs: string[] = [];
    const chatMsgs: Array<Record<string, unknown>> = [];
    for (const msg of messages) {
      if (msg.role === 'system') {
        const text = typeof msg.content === 'string' ? msg.content : '';
        if (text.trim()) systemMsgs.push(text);
      } else {
        chatMsgs.push(msg);
      }
    }
    if (systemMsgs.length > 0) {
      out.systemInstruction = {
        parts: [{ text: systemMsgs.join('\n') }],
      };
    }

    // 2. messages → contents
    const contents: Array<Record<string, unknown>> = [];
    for (const msg of chatMsgs) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      const parts: Array<Record<string, unknown>> = [];

      if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      } else if (Array.isArray(msg.content)) {
        // OpenAI multimodal content blocks
        for (const block of msg.content as Array<Record<string, unknown>>) {
          if (block.type === 'text' && typeof block.text === 'string') {
            parts.push({ text: block.text });
          } else if (block.type === 'image_url' && block.image_url) {
            const imageUrl = block.image_url as Record<string, string>;
            const url = imageUrl.url || '';
            // data:image/png;base64,xxx → inlineData
            const dataMatch = url.match(/^data:(image\/[^;]+);base64,(.+)$/);
            if (dataMatch) {
              parts.push({
                inlineData: { mimeType: dataMatch[1], data: dataMatch[2] },
              });
            }
          }
        }
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }
    out.contents = contents;

    // 3. generationConfig（参考 sub2api 的 convertClaudeGenerationConfig）
    const genConfig: Record<string, unknown> = {};
    if (mapped.max_tokens != null) genConfig.maxOutputTokens = mapped.max_tokens;
    if (mapped.temperature != null) genConfig.temperature = mapped.temperature;
    if (mapped.top_p != null) genConfig.topP = mapped.top_p;
    if (mapped.stop) {
      genConfig.stopSequences = Array.isArray(mapped.stop) ? mapped.stop : [mapped.stop];
    }
    if (Object.keys(genConfig).length > 0) {
      out.generationConfig = genConfig;
    }

    return out;
  }

  extractUsage(data: Record<string, unknown>): Usage {
    // Gemini 的 usage 格式：usageMetadata
    const meta = (data.usageMetadata || data.usage || {}) as Record<string, number>;
    const promptTokens = meta.promptTokenCount || meta.prompt_tokens || 0;
    const completionTokens = meta.candidatesTokenCount || meta.completion_tokens || 0;
    const totalTokens = meta.totalTokenCount || meta.total_tokens || promptTokens + completionTokens;
    return { promptTokens, completionTokens, totalTokens };
  }
}

// ─── Provider 注册表（所有供应商都注册，Key 由用户传入） ──────

const PROVIDER_REGISTRY: Record<SourceId, {
  baseUrl: string;
  label: string;
  protocol: ProtocolType;
  auth: AuthScheme;
  extraHeaders?: Record<string, string>;
  modelMapping?: Record<string, string>;
}> = {
  // ── 国际供应商（参考 sub2api） ──
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    label: 'OpenAI',
    protocol: 'openai',
    auth: 'bearer',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    label: 'Anthropic (Claude)',
    protocol: 'anthropic',
    auth: 'x-api-key',
    extraHeaders: { 'anthropic-version': '2023-06-01' },
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com',
    label: 'Google Gemini',
    protocol: 'gemini',
    auth: 'x-goog-api-key',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    label: 'DeepSeek',
    protocol: 'openai',
    auth: 'bearer',
  },
  // ── 国内供应商 ──
  commonstack: {
    baseUrl: 'https://api.commonstack.ai/v1',
    label: 'CommonStack',
    protocol: 'openai',
    auth: 'bearer',
  },
  moonshot: {
    baseUrl: 'https://api.moonshot.cn/v1',
    label: 'Moonshot (Kimi)',
    protocol: 'openai',
    auth: 'bearer',
  },
  qiniu: {
    baseUrl: 'https://api.qnaigc.com/v1',
    label: '七牛云',
    protocol: 'openai',
    auth: 'bearer',
  },
  zhipu: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    label: '智谱 (GLM)',
    protocol: 'openai',
    auth: 'bearer',
  },
  siliconflow: {
    baseUrl: 'https://api.siliconflow.cn/v1',
    label: '硅基流动',
    protocol: 'openai',
    auth: 'bearer',
  },
  stepfun: {
    baseUrl: 'https://api.stepfun.com/v1',
    label: '阶跃星辰',
    protocol: 'openai',
    auth: 'bearer',
  },
};

/** 所有 Provider 实例（启动时全部创建，不依赖 .env） */
const providers = new Map<SourceId, Provider>();

for (const [id, reg] of Object.entries(PROVIDER_REGISTRY) as [SourceId, typeof PROVIDER_REGISTRY[SourceId]][]) {
  const config: ProviderConfig = {
    id,
    label: reg.label,
    baseUrl: reg.baseUrl,
    protocol: reg.protocol,
    auth: reg.auth,
    extraHeaders: reg.extraHeaders,
    modelMapping: reg.modelMapping,
    maxRetries: 2,
  };

  switch (reg.protocol) {
    case 'anthropic':
      providers.set(id, new AnthropicProvider(config));
      break;
    case 'gemini':
      providers.set(id, new GeminiProvider(config));
      break;
    case 'openai':
    default:
      providers.set(id, new OpenAICompatProvider(config));
      break;
  }
}

// ─── 导出 ──────────────────────────────────────────────

export function getProvider(id: SourceId): Provider | undefined {
  return providers.get(id);
}

export function getAllProviders(): Map<SourceId, Provider> {
  return providers;
}

export function getAvailableProviders(): { id: SourceId; label: string }[] {
  return Array.from(providers.entries()).map(([id, p]) => ({
    id,
    label: p.config.label,
  }));
}

/** 从请求中提取用户传入的 API Key */
export function extractApiKey(req: { headers: Record<string, string | string[] | undefined> }): string | undefined {
  // 优先: Authorization: Bearer <key>
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (auth) {
    const val = Array.isArray(auth) ? auth[0] : auth;
    const parts = val.split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1].trim();
    }
  }
  // 其次: x-api-key header
  const xApiKey = req.headers['x-api-key'];
  if (xApiKey) {
    return (Array.isArray(xApiKey) ? xApiKey[0] : xApiKey).trim();
  }
  return undefined;
}

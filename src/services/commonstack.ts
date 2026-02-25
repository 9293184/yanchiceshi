// ============ 多源 API 配置 ============

export type ApiSource = 'commonstack' | 'moonshot' | 'qiniu' | 'zhipu' | 'siliconflow' | 'stepfun';

interface ApiConfig {
  key: string;
  baseUrl: string;
  label: string;
}

const API_SOURCES: Record<ApiSource, ApiConfig> = {
  commonstack: {
    key: import.meta.env.VITE_COMMONSTACK_API_KEY as string,
    baseUrl: '/api/commonstack/v1',
    label: 'CommonStack',
  },
  moonshot: {
    key: import.meta.env.VITE_MOONSHOT_API_KEY as string,
    baseUrl: '/api/moonshot/v1',
    label: 'Moonshot (Kimi)',
  },
  qiniu: {
    key: import.meta.env.VITE_QINIU_API_KEY as string,
    baseUrl: '/api/qiniu/v1',
    label: '七牛云',
  },
  zhipu: {
    key: import.meta.env.VITE_ZHIPU_API_KEY as string,
    baseUrl: '/api/zhipu/v4',
    label: '智谱 (GLM)',
  },
  siliconflow: {
    key: import.meta.env.VITE_SILICONFLOW_API_KEY as string,
    baseUrl: '/api/siliconflow/v1',
    label: '硅基流动',
  },
  stepfun: {
    key: import.meta.env.VITE_STEPFUN_API_KEY as string,
    baseUrl: '/api/stepfun/v1',
    label: '阶跃星辰',
  },
};

export function getAvailableSources(): { id: ApiSource; label: string }[] {
  return (Object.entries(API_SOURCES) as [ApiSource, ApiConfig][])
    .filter(([, cfg]) => !!cfg.key)
    .map(([id, cfg]) => ({ id, label: cfg.label }));
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  source: ApiSource;        // 来自哪个 API 源
  displayId: string;        // 用于去重和显示的唯一 ID
}

export interface LatencyResult {
  model: string;
  provider: string;
  source: ApiSource;
  ttft: number | null;       // Time to First Token (ms)
  tps: number | null;        // Tokens per Second
  totalTime: number;         // 总响应时间 (ms)
  success: boolean;
  error?: string;
  response?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface RouteNode {
  model: string;
  provider: string;
  source: ApiSource;
  latency: number;
  tps: number;
  score: number;
}

// 从指定 API 源获取模型列表
export async function fetchModels(source: ApiSource): Promise<ModelInfo[]> {
  const cfg = API_SOURCES[source];
  if (!cfg.key) return [];

  const res = await fetch(`${cfg.baseUrl}/models`, {
    headers: { Authorization: `Bearer ${cfg.key}` },
  });
  if (!res.ok) throw new Error(`获取 ${cfg.label} 模型列表失败: ${res.status}`);
  const json = await res.json();

  // 兼容两种返回格式
  let rawList: { id: string }[] = [];
  if (Array.isArray(json.data)) {
    rawList = json.data;
  } else if (json.data && Array.isArray(json.data.data)) {
    rawList = json.data.data;
  }

  return rawList.map((m) => {
    const parts = m.id.split('/');
    return {
      id: m.id,
      provider: parts.length > 1 ? parts[0] : source,
      name: parts.length > 1 ? parts.slice(1).join('/') : m.id,
      source,
      displayId: `${source}::${m.id}`,
    };
  });
}

// 从所有可用源获取模型
export async function fetchAllModels(): Promise<ModelInfo[]> {
  const sources = getAvailableSources();
  const results = await Promise.allSettled(sources.map((s) => fetchModels(s.id)));
  const all: ModelInfo[] = [];
  results.forEach((r) => {
    if (r.status === 'fulfilled') all.push(...r.value);
  });
  return all;
}

// 测试单个模型延迟
export async function testModelLatency(model: ModelInfo): Promise<LatencyResult> {
  const cfg = API_SOURCES[model.source];
  const startTime = performance.now();

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'user', content: 'Say "hello" in one word.' }],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    const totalTime = performance.now() - startTime;

    if (!res.ok) {
      const errBody = await res.text();
      return {
        model: model.id,
        provider: model.provider,
        source: model.source,
        ttft: null,
        tps: null,
        totalTime,
        success: false,
        error: `HTTP ${res.status}: ${errBody.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const usage = data.usage || {};
    const content = data.choices?.[0]?.message?.content || '';

    return {
      model: model.id,
      provider: model.provider,
      source: model.source,
      ttft: usage.ttft ?? null,
      tps: usage.tps ?? null,
      totalTime: Math.round(totalTime),
      success: true,
      response: content,
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
    };
  } catch (err) {
    const totalTime = performance.now() - startTime;
    return {
      model: model.id,
      provider: model.provider,
      source: model.source,
      ttft: null,
      tps: null,
      totalTime: Math.round(totalTime),
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// 批量测试并计算最优路径
export function calculateOptimalRoute(results: LatencyResult[]): RouteNode[] {
  const successful = results.filter((r) => r.success && r.totalTime > 0);

  if (successful.length === 0) return [];

  // 评分公式：score = (1 / totalTime) * tps_bonus
  // totalTime 越小越好，tps 越大越好
  const maxTps = Math.max(...successful.map((r) => r.tps || 1));
  const minTime = Math.min(...successful.map((r) => r.totalTime));

  const scored: RouteNode[] = successful.map((r) => {
    const timeScore = minTime / r.totalTime; // 0~1，越接近1越快
    const tpsScore = (r.tps || 1) / maxTps;  // 0~1，越接近1越快
    const score = timeScore * 0.6 + tpsScore * 0.4; // 加权

    return {
      model: r.model,
      provider: r.provider,
      source: r.source,
      latency: r.totalTime,
      tps: r.tps || 0,
      score: Math.round(score * 100) / 100,
    };
  });

  // 按 score 降序排列
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

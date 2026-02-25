import { API_SOURCES, type ApiSource, type ApiConfig } from './sources.js';
import { logUsage } from './db.js';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  source: ApiSource;
  displayId: string;
}

export interface LatencyResult {
  model: string;
  provider: string;
  source: ApiSource;
  totalTime: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  success: boolean;
  error?: string;
}

// 从指定供应商获取模型列表
export async function fetchModels(source: ApiSource): Promise<ModelInfo[]> {
  const cfg = API_SOURCES[source];
  if (!cfg) return [];

  const res = await fetch(`${cfg.baseUrl}/models`, {
    headers: { Authorization: `Bearer ${cfg.key}` },
  });
  if (!res.ok) throw new Error(`获取 ${cfg.label} 模型列表失败: ${res.status}`);
  const json = await res.json() as Record<string, unknown>;

  let rawList: { id: string }[] = [];
  if (Array.isArray(json.data)) {
    rawList = json.data;
  } else if (json.data && typeof json.data === 'object' && Array.isArray((json.data as Record<string, unknown>).data)) {
    rawList = (json.data as Record<string, unknown>).data as { id: string }[];
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

// 从所有可用供应商获取模型
export async function fetchAllModels(): Promise<ModelInfo[]> {
  const sources = Object.keys(API_SOURCES) as ApiSource[];
  const results = await Promise.allSettled(sources.map((s) => fetchModels(s)));
  const all: ModelInfo[] = [];
  results.forEach((r) => {
    if (r.status === 'fulfilled') all.push(...r.value);
  });
  return all;
}

// 测试单个模型延迟
export async function testModelLatency(source: ApiSource, modelId: string): Promise<LatencyResult> {
  const cfg = API_SOURCES[source];
  if (!cfg) {
    return { model: modelId, provider: 'unknown', source, totalTime: 0, promptTokens: 0, completionTokens: 0, totalTokens: 0, success: false, error: 'Source not configured' };
  }

  const parts = modelId.split('/');
  const provider = parts.length > 1 ? parts[0] : source;
  const startTime = performance.now();

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Say "hello" in one word.' }],
        max_tokens: 10,
        temperature: 0,
      }),
    });

    const totalTime = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const errBody = await res.text();
      const result: LatencyResult = { model: modelId, provider, source, totalTime, promptTokens: 0, completionTokens: 0, totalTokens: 0, success: false, error: `HTTP ${res.status}: ${errBody.slice(0, 200)}` };
      logUsage({ source, model: modelId, provider, promptTokens: 0, completionTokens: 0, totalTokens: 0, latency: totalTime, success: false, error: result.error });
      return result;
    }

    const data = await res.json() as Record<string, unknown>;
    const usage = (data.usage || {}) as Record<string, number>;
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || promptTokens + completionTokens;

    const result: LatencyResult = { model: modelId, provider, source, totalTime, promptTokens, completionTokens, totalTokens, success: true };
    logUsage({ source, model: modelId, provider, promptTokens, completionTokens, totalTokens, latency: totalTime, success: true });
    return result;
  } catch (err) {
    const totalTime = Math.round(performance.now() - startTime);
    const errMsg = err instanceof Error ? err.message : String(err);
    const result: LatencyResult = { model: modelId, provider, source, totalTime, promptTokens: 0, completionTokens: 0, totalTokens: 0, success: false, error: errMsg };
    logUsage({ source, model: modelId, provider, promptTokens: 0, completionTokens: 0, totalTokens: 0, latency: totalTime, success: false, error: errMsg });
    return result;
  }
}

// 批量测试延迟（供应商间并行，供应商内串行）
export async function testLatencyBatch(
  targets: { source: ApiSource; modelId: string }[]
): Promise<LatencyResult[]> {
  // 按 source 分组
  const bySource = new Map<ApiSource, { source: ApiSource; modelId: string }[]>();
  for (const t of targets) {
    if (!bySource.has(t.source)) bySource.set(t.source, []);
    bySource.get(t.source)!.push(t);
  }

  const allResults: LatencyResult[] = [];

  const tasks = Array.from(bySource.values()).map(async (group) => {
    for (const t of group) {
      const result = await testModelLatency(t.source, t.modelId);
      allResults.push(result);
    }
  });

  await Promise.all(tasks);

  // 按延迟排序
  allResults.sort((a, b) => {
    if (a.success && !b.success) return -1;
    if (!a.success && b.success) return 1;
    return a.totalTime - b.totalTime;
  });

  return allResults;
}

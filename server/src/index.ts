import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getAvailableSources, API_SOURCES } from './sources.js';
import { fetchAllModels, fetchModels, testLatencyBatch, testModelLatency } from './services.js';
import { prisma, getUsageStats, logUsage } from './db.js';
import type { ApiSource } from './sources.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3001;

// ============ GET /api/models ============
// 获取所有供应商的模型列表
// 可选 query: ?source=commonstack 只获取指定供应商
app.get('/api/models', async (req, res) => {
  try {
    const source = req.query.source as ApiSource | undefined;

    if (source) {
      const models = await fetchModels(source);
      res.json({ success: true, source, count: models.length, models });
    } else {
      const models = await fetchAllModels();
      // 按供应商分组
      const bySource: Record<string, typeof models> = {};
      for (const m of models) {
        if (!bySource[m.source]) bySource[m.source] = [];
        bySource[m.source].push(m);
      }
      res.json({
        success: true,
        sources: getAvailableSources(),
        totalCount: models.length,
        bySource,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ GET /api/latency ============
// 测试单个模型延迟
// query: ?source=commonstack&model=deepseek/deepseek-chat
app.get('/api/latency', async (req, res) => {
  try {
    const source = req.query.source as ApiSource;
    const modelId = req.query.model as string;

    if (!source || !modelId) {
      res.status(400).json({ success: false, error: '需要 source 和 model 参数' });
      return;
    }

    const result = await testModelLatency(source, modelId);
    const billing = {
      source,
      model: modelId,
      provider: result.provider,
      tokens: { prompt: result.promptTokens, completion: result.completionTokens, total: result.totalTokens },
      latency: result.totalTime,
      cost: `${(result.totalTokens * 0.0001).toFixed(4)} MON`,
    };
    res.json({ success: true, result, _billing: billing });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ POST /api/latency/batch ============
// 批量测试延迟
// body: { targets: [{ source: "commonstack", modelId: "deepseek/deepseek-chat" }, ...] }
app.post('/api/latency/batch', async (req, res) => {
  try {
    const { targets } = req.body as { targets: { source: ApiSource; modelId: string }[] };

    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      res.status(400).json({ success: false, error: '需要 targets 数组' });
      return;
    }

    if (targets.length > 50) {
      res.status(400).json({ success: false, error: '单次最多测试 50 个模型' });
      return;
    }

    const results = await testLatencyBatch(targets);
    const totalTokensAll = results.reduce((sum, r) => sum + r.totalTokens, 0);
    const billing = {
      totalRequests: results.length,
      tokens: {
        prompt: results.reduce((sum, r) => sum + r.promptTokens, 0),
        completion: results.reduce((sum, r) => sum + r.completionTokens, 0),
        total: totalTokensAll,
      },
      cost: `${(totalTokensAll * 0.0001).toFixed(4)} MON`,
    };
    res.json({
      success: true,
      count: results.length,
      successCount: results.filter((r) => r.success).length,
      results,
      _billing: billing,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ GET /api/sources ============
// 获取可用供应商列表
app.get('/api/sources', (_req, res) => {
  res.json({ success: true, sources: getAvailableSources() });
});

// ============ GET /api/usage ============
// 查询 Token 用量统计
// 可选 query: ?source=commonstack&start=2026-02-01&end=2026-02-28
app.get('/api/usage', async (req, res) => {
  try {
    const source = req.query.source as string | undefined;
    const start = req.query.start as string | undefined;
    const end = req.query.end as string | undefined;

    const stats = await getUsageStats({
      source: source || undefined,
      startDate: start ? new Date(start) : undefined,
      endDate: end ? new Date(end) : undefined,
    });

    res.json({ success: true, ...stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ GET /api/usage/recent ============
// 最近 N 条用量记录
app.get('/api/usage/recent', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const logs = await prisma.usageLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ POST /v1/chat/completions ============
// 代理转发：用户通过我们的 API 访问各供应商的模型
// Header: X-Source: moonshot (指定供应商)
// Body: 标准 OpenAI 格式 { model, messages, ... }
app.post('/v1/chat/completions', async (req, res) => {
  const startTime = performance.now();
  try {
    const source = (req.headers['x-source'] || req.query.source) as ApiSource;
    if (!source) {
      res.status(400).json({ error: '需要 X-Source header 或 ?source= 参数指定供应商' });
      return;
    }

    const cfg = API_SOURCES[source];
    if (!cfg) {
      res.status(400).json({ error: `供应商 "${source}" 未配置或不可用` });
      return;
    }

    const body = req.body;
    if (!body.model || !body.messages) {
      res.status(400).json({ error: '需要 model 和 messages 字段' });
      return;
    }

    const upstream = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const totalTime = Math.round(performance.now() - startTime);
    const data = await upstream.json() as Record<string, unknown>;

    // 解析 token 用量
    const usage = (data.usage || {}) as Record<string, number>;
    const parts = (body.model as string).split('/');
    const provider = parts.length > 1 ? parts[0] : source;
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || promptTokens + completionTokens;

    // 记录到数据库
    logUsage({
      source,
      model: body.model,
      provider,
      promptTokens,
      completionTokens,
      totalTokens,
      latency: totalTime,
      success: upstream.ok,
      error: upstream.ok ? undefined : `HTTP ${upstream.status}`,
      callerIp: req.ip,
    });

    // 在响应中附带计费信息
    const billing = {
      source,
      model: body.model,
      provider,
      tokens: { prompt: promptTokens, completion: completionTokens, total: totalTokens },
      latency: totalTime,
      cost: `${(totalTokens * 0.0001).toFixed(4)} MON`,
    };

    res.status(upstream.status).json({ ...data as object, _billing: billing });
  } catch (err) {
    const totalTime = Math.round(performance.now() - startTime);
    res.status(502).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ GET /v1/models ============
// 代理转发：获取指定供应商的模型列表
app.get('/v1/models', async (req, res) => {
  try {
    const source = (req.headers['x-source'] || req.query.source) as ApiSource;
    if (!source) {
      res.status(400).json({ error: '需要 X-Source header 或 ?source= 参数指定供应商' });
      return;
    }

    const cfg = API_SOURCES[source];
    if (!cfg) {
      res.status(400).json({ error: `供应商 "${source}" 未配置或不可用` });
      return;
    }

    const upstream = await fetch(`${cfg.baseUrl}/models`, {
      headers: { Authorization: `Bearer ${cfg.key}` },
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ 健康检查 ============
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', sources: getAvailableSources().length });
});

app.listen(PORT, () => {
  const sources = getAvailableSources();
  console.log(`🚀 AI Roulette API 已启动: http://localhost:${PORT}`);
  console.log(`📡 已配置 ${sources.length} 个供应商: ${sources.map((s) => s.label).join(', ')}`);
  console.log(`\n接口列表:`);
  console.log(`  GET  /api/sources              — 获取可用供应商`);
  console.log(`  GET  /api/models               — 获取所有模型`);
  console.log(`  GET  /api/models?source=xxx     — 获取指定供应商模型`);
  console.log(`  GET  /api/latency?source=xxx&model=xxx — 测试单模型延迟`);
  console.log(`  POST /api/latency/batch         — 批量测试延迟`);
  console.log(`  GET  /api/usage                 — Token 用量统计`);
  console.log(`  GET  /api/usage/recent          — 最近用量记录`);
  console.log(`  POST /v1/chat/completions       — 代理转发 (X-Source header)`);
  console.log(`  GET  /v1/models                 — 代理获取模型列表`);
  console.log(`  GET  /health                    — 健康检查`);
});

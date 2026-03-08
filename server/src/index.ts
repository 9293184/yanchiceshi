import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getAvailableSources, API_SOURCES, getKey, rotateKey } from './sources.js';
import { fetchAllModels, fetchModels, testLatencyBatch, testModelLatency } from './services.js';
import { prisma, getUsageStats, logUsage } from './db.js';
import type { ApiSource } from './sources.js';
import { getAvailableProviders, type SourceId } from './providers.js';
import { forwardChatCompletion, forwardModels } from './gateway.js';
import { getDefaultUserId, addApiKey, listApiKeys, deleteApiKey, toggleApiKey } from './keystore.js';
import { handleMessagesRequest } from './messages.js';

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
// 代理转发（新版 Gateway — 参考 sub2api 架构）
// 支持：重试/Key轮换/SSE流式/Usage追踪
// Header: X-Source: moonshot (指定供应商)
// Body: 标准 OpenAI 格式 { model, messages, stream?, ... }
app.post('/v1/chat/completions', async (req, res) => {
  const source = (req.headers['x-source'] || req.query.source) as SourceId;
  if (!source) {
    res.status(400).json({ error: { message: '需要 X-Source header 或 ?source= 参数指定供应商', type: 'invalid_request_error' } });
    return;
  }

  try {
    const result = await forwardChatCompletion(req, res, source);
    if (result.retryAttempts > 1) {
      console.log(`[gateway] ${source} 完成: ${result.success ? 'OK' : 'FAIL'} | ` +
        `重试${result.retryAttempts}次 | ${result.latencyMs}ms`);
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: { message: err instanceof Error ? err.message : String(err), type: 'upstream_error' } });
    }
  }
});

// ============ POST /v1/messages ============
// Anthropic Messages API 格式支持
// 支持 Claude 特性：thinking、tool use 等
// Header: X-Source: anthropic (指定供应商)
// Body: Anthropic Messages 格式 { model, messages, max_tokens, system?, ... }
app.post('/v1/messages', async (req, res) => {
  const source = (req.headers['x-source'] || req.query.source) as SourceId;
  if (!source) {
    res.status(400).json({
      type: 'error',
      error: {
        type: 'invalid_request_error',
        message: '需要 X-Source header 或 ?source= 参数指定供应商',
      },
    });
    return;
  }

  try {
    await handleMessagesRequest(req, res, source);
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({
        type: 'error',
        error: {
          type: 'api_error',
          message: err instanceof Error ? err.message : String(err),
        },
      });
    }
  }
});

// ============ GET /v1/models ============
// 代理转发（新版 Gateway）
app.get('/v1/models', async (req, res) => {
  const source = (req.headers['x-source'] || req.query.source) as SourceId;
  if (!source) {
    res.status(400).json({ error: { message: '需要 X-Source header 或 ?source= 参数指定供应商', type: 'invalid_request_error' } });
    return;
  }

  try {
    await forwardModels(req, res, source);
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: { message: err instanceof Error ? err.message : String(err), type: 'upstream_error' } });
    }
  }
});

// ============ GET /v1/keys ============
// 列出当前用户存储的所有 API Key（脱敏显示）
app.get('/v1/keys', async (_req, res) => {
  try {
    const keys = await listApiKeys();
    res.json({ success: true, count: keys.length, keys });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ POST /v1/keys ============
// 添加一个供应商的 API Key
// body: { provider: "openai", apiKey: "sk-xxx", label?: "我的Key" }
app.post('/v1/keys', async (req, res) => {
  try {
    const { provider, apiKey, label } = req.body as { provider: SourceId; apiKey: string; label?: string };
    if (!provider || !apiKey) {
      res.status(400).json({ success: false, error: '需要 provider 和 apiKey 字段' });
      return;
    }
    const key = await addApiKey(provider, apiKey, label);
    res.json({ success: true, id: key.id, provider: key.provider });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ DELETE /v1/keys/:id ============
// 删除一个存储的 Key
app.delete('/v1/keys/:id', async (req, res) => {
  try {
    await deleteApiKey(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ PATCH /v1/keys/:id ============
// 启用/禁用一个 Key
// body: { isActive: true/false }
app.patch('/v1/keys/:id', async (req, res) => {
  try {
    const { isActive } = req.body as { isActive: boolean };
    if (typeof isActive !== 'boolean') {
      res.status(400).json({ success: false, error: '需要 isActive 字段 (boolean)' });
      return;
    }
    await toggleApiKey(req.params.id, isActive);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) });
  }
});

// ============ GET /v1/providers ============
// 获取所有 Gateway v2 供应商列表（含国际供应商，Key 由用户传入）
app.get('/v1/providers', (_req, res) => {
  const providers = getAvailableProviders();
  res.json({ success: true, count: providers.length, providers });
});

// ============ 健康检查 ============
app.get('/health', (_req, res) => {
  const legacySources = getAvailableSources();
  const providers = getAvailableProviders();
  res.json({
    status: 'ok',
    legacySources: legacySources.length,
    providers: providers.length,
    providerList: providers.map(p => p.id),
  });
});

app.listen(PORT, '0.0.0.0', () => {
  const legacySources = getAvailableSources();
  const providers = getAvailableProviders();
  console.log(`🚀 AI Roulette API 已启动: http://0.0.0.0:${PORT}`);
  console.log(`📡 旧版供应商 (env key): ${legacySources.length} 个 — ${legacySources.map((s) => s.label).join(', ')}`);
  console.log(`🌐 Gateway v2 供应商: ${providers.length} 个 — ${providers.map((p) => p.label).join(', ')}`);
  console.log(`\n接口列表:`);
  console.log(`  GET  /api/sources              — 获取旧版供应商`);
  console.log(`  GET  /api/models               — 获取所有模型`);
  console.log(`  GET  /api/latency?source&model  — 测试单模型延迟`);
  console.log(`  POST /api/latency/batch         — 批量测试延迟`);
  console.log(`  GET  /api/usage                 — Token 用量统计`);
  console.log(`  GET  /api/usage/recent          — 最近用量记录`);
  console.log(`  GET  /v1/providers              — Gateway v2 供应商列表`);
  console.log(`  GET  /v1/keys                   — 列出已存储的 API Key（脱敏）`);
  console.log(`  POST /v1/keys                   — 添加 API Key { provider, apiKey, label? }`);
  console.log(`  DELETE /v1/keys/:id             — 删除 API Key`);
  console.log(`  PATCH  /v1/keys/:id             — 启用/禁用 Key { isActive }`);
  console.log(`  POST /v1/chat/completions       — 代理转发 OpenAI 格式 (X-Source + Auth) [Gateway v2]`);
  console.log(`  POST /v1/messages               — 代理转发 Anthropic Messages 格式 (支持 Claude 特性)`);
  console.log(`  GET  /v1/models                 — 代理获取模型列表 [Gateway v2]`);
  console.log(`  GET  /health                    — 健康检查`);
});

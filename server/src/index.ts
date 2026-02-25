import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getAvailableSources } from './sources.js';
import { fetchAllModels, fetchModels, testLatencyBatch, testModelLatency } from './services.js';
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
    res.json({ success: true, result });
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
    res.json({
      success: true,
      count: results.length,
      successCount: results.filter((r) => r.success).length,
      results,
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
  console.log(`  GET  /health                    — 健康检查`);
});

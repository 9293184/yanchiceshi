import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchAllModels,
  testModelLatency,
  calculateOptimalRoute,
  getAvailableSources,
  type ApiSource,
  type ModelInfo,
  type LatencyResult,
  type RouteNode,
} from '../services/commonstack';

type TestPhase = 'idle' | 'loading-models' | 'selecting' | 'testing' | 'done';

const SOURCE_CONFIG: Record<string, { label: string; color: string; border: string; bg: string }> = {
  commonstack: { label: 'CommonStack', color: 'from-cyan-500 to-blue-500', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5' },
  moonshot:    { label: 'Moonshot (Kimi)', color: 'from-sky-400 to-indigo-500', border: 'border-sky-500/30', bg: 'bg-sky-500/5' },
  qiniu:       { label: '七牛云', color: 'from-rose-500 to-orange-500', border: 'border-rose-500/30', bg: 'bg-rose-500/5' },
  zhipu:       { label: '智谱 (GLM)', color: 'from-blue-600 to-violet-600', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
  siliconflow: { label: '硅基流动', color: 'from-emerald-500 to-teal-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' },
  stepfun:     { label: '阶跃星辰', color: 'from-amber-500 to-yellow-500', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
};

export default function Roulette() {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<LatencyResult[]>([]);
  const [currentTesting, setCurrentTesting] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteNode[]>([]);
  const [spinAngle, setSpinAngle] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const spinRef = useRef<number | null>(null);
  const modelMap = useRef<Map<string, ModelInfo>>(new Map());

  // 加载所有 API 源的模型列表
  const loadModels = useCallback(async () => {
    setPhase('loading-models');
    setError(null);
    try {
      const sources = getAvailableSources();
      if (sources.length === 0) {
        setError('未配置任何 API Key，请在 .env 中添加');
        setPhase('idle');
        return;
      }
      const list = await fetchAllModels();
      setModels(list);
      const map = new Map<string, ModelInfo>();
      list.forEach((m) => map.set(m.displayId, m));
      modelMap.current = map;
      // 每个源默认选前 4 个
      const defaultSet = new Set<string>();
      const bySrc = new Map<string, ModelInfo[]>();
      list.forEach((m) => {
        if (!bySrc.has(m.source)) bySrc.set(m.source, []);
        bySrc.get(m.source)!.push(m);
      });
      bySrc.forEach((srcModels) => {
        srcModels.slice(0, 4).forEach((m) => defaultSet.add(m.displayId));
      });
      setSelectedModels(defaultSet);
      setPhase('selecting');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载模型失败');
      setPhase('idle');
    }
  }, []);

  const toggleModel = (displayId: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(displayId)) next.delete(displayId);
      else next.add(displayId);
      return next;
    });
  };

  const toggleSourceAll = (source: ApiSource) => {
    const sourceModels = models.filter((m) => m.source === source);
    const allSelected = sourceModels.every((m) => selectedModels.has(m.displayId));
    setSelectedModels((prev) => {
      const next = new Set(prev);
      sourceModels.forEach((m) => {
        if (allSelected) next.delete(m.displayId);
        else next.add(m.displayId);
      });
      return next;
    });
  };

  // 轮盘旋转动画
  useEffect(() => {
    if (phase === 'testing') {
      const animate = () => {
        setSpinAngle((a) => a + 3);
        spinRef.current = requestAnimationFrame(animate);
      };
      spinRef.current = requestAnimationFrame(animate);
    } else {
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
    }
    return () => {
      if (spinRef.current) cancelAnimationFrame(spinRef.current);
    };
  }, [phase]);

  // 开始测试（按供应商并行，供应商内串行）
  const startTest = async () => {
    if (selectedModels.size === 0) return;
    setPhase('testing');
    setResults([]);
    setRoute([]);
    setError(null);

    const allResults: LatencyResult[] = [];
    const displayIds = Array.from(selectedModels);

    // 按 source 分组
    const bySource = new Map<string, string[]>();
    for (const id of displayIds) {
      const model = modelMap.current.get(id);
      if (!model) continue;
      if (!bySource.has(model.source)) bySource.set(model.source, []);
      bySource.get(model.source)!.push(id);
    }

    // 每个供应商一个串行队列，所有供应商并行跑
    const tasks = Array.from(bySource.values()).map(async (ids) => {
      for (const displayId of ids) {
        const model = modelMap.current.get(displayId);
        if (!model) continue;
        setCurrentTesting(displayId);
        const result = await testModelLatency(model);
        allResults.push(result);
        setResults([...allResults]);
      }
    });

    await Promise.all(tasks);

    setCurrentTesting(null);
    const optimalRoute = calculateOptimalRoute(allResults);
    setRoute(optimalRoute);
    setPhase('done');
  };

  const reset = () => {
    setPhase('selecting');
    setResults([]);
    setRoute([]);
    setCurrentTesting(null);
  };

  // 按 source 分组
  const modelsBySource = models.reduce<Record<string, ModelInfo[]>>((acc, m) => {
    if (!acc[m.source]) acc[m.source] = [];
    acc[m.source].push(m);
    return acc;
  }, {});

  // 按 source 分组结果
  const resultsBySource = results.reduce<Record<string, LatencyResult[]>>((acc, r) => {
    if (!acc[r.source]) acc[r.source] = [];
    acc[r.source].push(r);
    return acc;
  }, {});

  // 按 source 分组路由
  const routeBySource = route.reduce<Record<string, RouteNode[]>>((acc, r) => {
    if (!acc[r.source]) acc[r.source] = [];
    acc[r.source].push(r);
    return acc;
  }, {});

  const providerColors: Record<string, string> = {
    openai: 'bg-green-500', anthropic: 'bg-orange-500', google: 'bg-blue-500',
    deepseek: 'bg-purple-500', meta: 'bg-indigo-500', mistral: 'bg-red-500',
    qwen: 'bg-teal-500', minimax: 'bg-yellow-500', xai: 'bg-pink-500',
    moonshotai: 'bg-sky-500', 'zai-org': 'bg-emerald-500',
  };
  const getProviderColor = (p: string) => providerColors[p.toLowerCase()] || 'bg-gray-500';

  const sources = Object.keys(modelsBySource) as ApiSource[];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-lg font-bold">
              🎰
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Roulette</h1>
              <p className="text-xs text-gray-400">MotoMap 延迟探测轮盘</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getAvailableSources().map((s) => (
              <span key={s.id} className={`text-[10px] px-2 py-1 rounded-full bg-gradient-to-r ${SOURCE_CONFIG[s.id]?.color || 'from-gray-500 to-gray-600'} text-white`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 初始状态 */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="text-8xl mb-8">🎰</div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI 模型延迟轮盘
            </h2>
            <p className="text-gray-400 mb-8 text-center max-w-lg">
              轮询测试各个 AI 模型的延迟，找出最快响应路径。
              <br />
              测试结果将作为 MotoMap 地图边的 cost 数据源。
            </p>
            <button
              onClick={loadModels}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-semibold text-lg hover:opacity-90 transition cursor-pointer"
            >
              开始探测 →
            </button>
          </div>
        )}

        {/* 加载中 */}
        {phase === 'loading-models' && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="animate-spin text-6xl mb-6">⚙️</div>
            <p className="text-gray-400">正在获取可用模型列表...</p>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-400">❌ {error}</p>
          </div>
        )}

        {/* ========== 选择模型：按供应商分开 ========== */}
        {phase === 'selecting' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">选择测试模型</h2>
                <p className="text-gray-400 text-sm mt-1">
                  已选 {selectedModels.size} / {models.length} 个模型 · {sources.length} 个供应商
                </p>
              </div>
              <button
                onClick={startTest}
                disabled={selectedModels.size === 0}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                🎰 开始轮盘测试 ({selectedModels.size})
              </button>
            </div>

            {/* 每个供应商一个独立卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sources.map((source) => {
                const cfg = SOURCE_CONFIG[source] || { label: source, color: 'from-gray-500 to-gray-600', border: 'border-gray-700', bg: 'bg-gray-900' };
                const srcModels = modelsBySource[source] || [];
                const selectedCount = srcModels.filter((m) => selectedModels.has(m.displayId)).length;
                const allSelected = selectedCount === srcModels.length;

                // 按 provider 分组
                const byProvider = srcModels.reduce<Record<string, ModelInfo[]>>((acc, m) => {
                  if (!acc[m.provider]) acc[m.provider] = [];
                  acc[m.provider].push(m);
                  return acc;
                }, {});

                return (
                  <div key={source} className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
                    {/* 供应商标题 */}
                    <div className={`px-5 py-3 bg-gradient-to-r ${cfg.color} flex items-center justify-between`}>
                      <div>
                        <h3 className="font-bold text-white">{cfg.label}</h3>
                        <p className="text-xs text-white/70">{srcModels.length} 个模型 · 已选 {selectedCount}</p>
                      </div>
                      <button
                        onClick={() => toggleSourceAll(source)}
                        className="text-xs px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition text-white cursor-pointer"
                      >
                        {allSelected ? '取消全选' : '全选'}
                      </button>
                    </div>

                    {/* 模型列表 */}
                    <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
                      {Object.entries(byProvider).map(([provider, pModels]) => (
                        <div key={provider}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${getProviderColor(provider)}`} />
                            <span className="text-xs font-semibold uppercase text-gray-400">{provider}</span>
                            <span className="text-[10px] text-gray-600">({pModels.length})</span>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {pModels.map((m) => (
                              <button
                                key={m.displayId}
                                onClick={() => toggleModel(m.displayId)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition cursor-pointer text-sm ${
                                  selectedModels.has(m.displayId)
                                    ? 'border-white/20 bg-white/10'
                                    : 'border-transparent bg-white/[0.03] hover:bg-white/[0.06]'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                                  selectedModels.has(m.displayId)
                                    ? 'border-white bg-white text-gray-900'
                                    : 'border-gray-600'
                                }`}>
                                  {selectedModels.has(m.displayId) && '✓'}
                                </div>
                                <span className="truncate text-gray-200">{m.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== 测试中 / 结果：按供应商分开 ========== */}
        {(phase === 'testing' || phase === 'done') && (
          <div className="space-y-8">
            {/* 顶部总进度 + 全局最优排行 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 轮盘 */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">
                  {phase === 'testing' ? '🎰 测试中...' : '✅ 测试完成'}
                </h3>
                <div className="relative w-40 h-40 mb-4">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {Array.from(selectedModels).map((displayId, i) => {
                      const total = selectedModels.size;
                      const angle = (360 / total) * i + spinAngle;
                      const rad = (angle * Math.PI) / 180;
                      const x = 100 + 70 * Math.cos(rad);
                      const y = 100 + 70 * Math.sin(rad);
                      const model = modelMap.current.get(displayId);
                      const result = results.find((r) => r.model === model?.id && r.source === model?.source);
                      const isActive = currentTesting === displayId;
                      const fill = result ? (result.success ? '#22c55e' : '#ef4444') : isActive ? '#06b6d4' : '#374151';
                      return (
                        <circle key={displayId} cx={x} cy={y} r={isActive ? 12 : 8} fill={fill} opacity={isActive ? 1 : 0.7} />
                      );
                    })}
                    <circle cx="100" cy="100" r="22" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
                    <text x="100" y="105" textAnchor="middle" fill="#9ca3af" fontSize="11" fontWeight="bold">
                      {phase === 'testing' ? `${results.length}/${selectedModels.size}` : '完成'}
                    </text>
                  </svg>
                </div>
                {currentTesting && (
                  <p className="text-cyan-400 text-xs animate-pulse truncate max-w-full">
                    {modelMap.current.get(currentTesting)?.name || currentTesting}
                  </p>
                )}
                <div className="w-full mt-3">
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${(results.length / Math.max(selectedModels.size, 1)) * 100}%` }} />
                  </div>
                </div>
                {phase === 'done' && (
                  <button onClick={reset} className="mt-4 w-full px-4 py-2 border border-gray-700 rounded-lg text-sm hover:bg-gray-800 transition cursor-pointer">
                    🔄 重新测试
                  </button>
                )}
              </div>

              {/* 全局最优排行 Top 5 */}
              {phase === 'done' && route.length > 0 && (
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">🏆 全局最优路径（跨供应商）</h3>
                  <div className="space-y-2">
                    {route.slice(0, 5).map((node, i) => {
                      const srcCfg = SOURCE_CONFIG[node.source];
                      return (
                        <div key={`${node.source}::${node.model}`}
                          className={`flex items-center gap-3 p-3 rounded-xl border ${
                            i === 0 ? 'border-yellow-500/50 bg-yellow-500/5' : i === 1 ? 'border-gray-400/30 bg-gray-400/5' : i === 2 ? 'border-orange-700/30 bg-orange-700/5' : 'border-gray-800'
                          }`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-gray-400 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-gray-700 text-gray-300'
                          }`}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold truncate">{node.model.split('/').pop()}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded bg-gradient-to-r ${srcCfg?.color || 'from-gray-600 to-gray-700'} text-white`}>
                                {srcCfg?.label || node.source}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{node.provider}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono text-cyan-400">{node.latency}ms</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {route[0] && (
                    <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                      <p className="text-sm text-gray-300">
                        <span className="text-cyan-400 font-bold">最快：</span>{' '}
                        <span className="text-white font-semibold">{route[0].model.split('/').pop()}</span>
                        <span className="text-cyan-400 font-mono ml-2">{route[0].latency}ms</span>
                        <span className="text-gray-500 text-xs ml-2">via {SOURCE_CONFIG[route[0].source]?.label || route[0].source}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 每个供应商独立的结果卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sources.map((source) => {
                const cfg = SOURCE_CONFIG[source] || { label: source, color: 'from-gray-500 to-gray-600', border: 'border-gray-700', bg: 'bg-gray-900' };
                const srcResults = resultsBySource[source] || [];
                const srcRoute = routeBySource[source] || [];
                const srcSelectedCount = Array.from(selectedModels).filter((id) => modelMap.current.get(id)?.source === source).length;
                const successCount = srcResults.filter((r) => r.success).length;
                const failCount = srcResults.filter((r) => !r.success).length;
                const currentModel = currentTesting ? modelMap.current.get(currentTesting) : null;
                const isTestingThisSource = currentModel?.source === source;

                return (
                  <div key={source} className={`rounded-2xl border ${cfg.border} overflow-hidden`}>
                    {/* 供应商标题 */}
                    <div className={`px-5 py-3 bg-gradient-to-r ${cfg.color} flex items-center justify-between`}>
                      <div>
                        <h3 className="font-bold text-white">{cfg.label}</h3>
                        <p className="text-xs text-white/70">
                          {srcResults.length}/{srcSelectedCount} 已测
                          {successCount > 0 && <span> · ✅ {successCount}</span>}
                          {failCount > 0 && <span> · ❌ {failCount}</span>}
                        </p>
                      </div>
                      {srcRoute[0] && (
                        <div className="text-right">
                          <p className="text-xs text-white/70">最快</p>
                          <p className="text-sm font-bold text-white">{srcRoute[0].latency}ms</p>
                        </div>
                      )}
                    </div>

                    {/* 结果表格 */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800/50 text-gray-500 text-xs">
                            <th className="px-3 py-2 text-left">#</th>
                            <th className="px-3 py-2 text-left">模型</th>
                            <th className="px-3 py-2 text-right">延迟</th>
                          </tr>
                        </thead>
                        <tbody>
                          {srcResults.map((r, i) => (
                            <tr key={`${r.source}::${r.model}`} className="border-b border-gray-800/30 hover:bg-white/[0.02] transition">
                              <td className="px-3 py-2 text-gray-600 text-xs">{i + 1}</td>
                              <td className="px-3 py-2 text-xs truncate max-w-[180px]">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${getProviderColor(r.provider)}`} />
                                {r.model.split('/').pop()}
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-xs">
                                {r.success ? (
                                  <span className={r.totalTime < 1000 ? 'text-green-400' : r.totalTime < 3000 ? 'text-yellow-400' : 'text-red-400'}>
                                    {r.totalTime}ms
                                  </span>
                                ) : <span className="text-red-400" title={r.error}>❌</span>}
                              </td>
                            </tr>
                          ))}
                          {isTestingThisSource && currentModel && (
                            <tr className="bg-cyan-500/5">
                              <td className="px-3 py-2 text-gray-600 text-xs">{srcResults.length + 1}</td>
                              <td className="px-3 py-2 text-xs text-cyan-400 animate-pulse">{currentModel.name}</td>
                              <td className="px-3 py-2 text-xs text-cyan-400 animate-pulse text-right">⏳</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {srcResults.length === 0 && !isTestingThisSource && (
                      <div className="px-4 py-8 text-center text-gray-600 text-sm">
                        {phase === 'testing' ? '等待测试...' : '无测试结果'}
                      </div>
                    )}

                    {/* 供应商内统计 */}
                    {phase === 'done' && srcResults.length > 0 && (() => {
                      const ok = srcResults.filter((r) => r.success);
                      if (ok.length === 0) return null;
                      return (
                        <div className="px-4 py-3 border-t border-gray-800/30 flex gap-4 text-xs text-gray-500">
                          <span>平均 <span className="text-gray-300 font-mono">{Math.round(ok.reduce((s, r) => s + r.totalTime, 0) / ok.length)}ms</span></span>
                          <span>最快 <span className="text-green-400 font-mono">{Math.min(...ok.map((r) => r.totalTime))}ms</span></span>
                          <span>最慢 <span className="text-red-400 font-mono">{Math.max(...ok.map((r) => r.totalTime))}ms</span></span>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import 'dotenv/config';

export type ApiSource = 'commonstack' | 'moonshot' | 'qiniu' | 'zhipu' | 'siliconflow' | 'stepfun';

export interface ApiConfig {
  key: string;
  baseUrl: string;
  label: string;
}

const raw: Record<ApiSource, { envKey: string; baseUrl: string; label: string }> = {
  commonstack:  { envKey: 'VITE_COMMONSTACK_API_KEY',  baseUrl: 'https://api.commonstack.ai/v1',           label: 'CommonStack' },
  moonshot:     { envKey: 'VITE_MOONSHOT_API_KEY',     baseUrl: 'https://api.moonshot.cn/v1',              label: 'Moonshot (Kimi)' },
  qiniu:        { envKey: 'VITE_QINIU_API_KEY',        baseUrl: 'https://api.qnaigc.com/v1',              label: '七牛云' },
  zhipu:        { envKey: 'VITE_ZHIPU_API_KEY',        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',   label: '智谱 (GLM)' },
  siliconflow:  { envKey: 'VITE_SILICONFLOW_API_KEY',  baseUrl: 'https://api.siliconflow.cn/v1',          label: '硅基流动' },
  stepfun:      { envKey: 'VITE_STEPFUN_API_KEY',      baseUrl: 'https://api.stepfun.com/v1',             label: '阶跃星辰' },
};

export const API_SOURCES: Partial<Record<ApiSource, ApiConfig>> = {};

for (const [id, cfg] of Object.entries(raw) as [ApiSource, typeof raw[ApiSource]][]) {
  const key = process.env[cfg.envKey];
  if (key) {
    API_SOURCES[id] = { key, baseUrl: cfg.baseUrl, label: cfg.label };
  }
}

export function getAvailableSources() {
  return (Object.entries(API_SOURCES) as [ApiSource, ApiConfig][]).map(([id, cfg]) => ({
    id,
    label: cfg.label,
  }));
}

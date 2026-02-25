import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

export async function logUsage(data: {
  source: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latency: number;
  success: boolean;
  error?: string;
  callerIp?: string;
}) {
  try {
    await prisma.usageLog.create({ data });
  } catch (err) {
    console.error('写入 UsageLog 失败:', err);
  }
}

export async function getUsageStats(options?: {
  source?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: Record<string, unknown> = {};
  if (options?.source) where.source = options.source;
  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options?.startDate) (where.createdAt as Record<string, unknown>).gte = options.startDate;
    if (options?.endDate) (where.createdAt as Record<string, unknown>).lte = options.endDate;
  }

  const [totalRequests, totalTokens, bySource] = await Promise.all([
    prisma.usageLog.count({ where }),
    prisma.usageLog.aggregate({
      where,
      _sum: { promptTokens: true, completionTokens: true, totalTokens: true },
    }),
    prisma.usageLog.groupBy({
      by: ['source'],
      where,
      _count: true,
      _sum: { promptTokens: true, completionTokens: true, totalTokens: true },
      _avg: { latency: true },
    }),
  ]);

  return {
    totalRequests,
    totalTokens: {
      prompt: totalTokens._sum.promptTokens || 0,
      completion: totalTokens._sum.completionTokens || 0,
      total: totalTokens._sum.totalTokens || 0,
    },
    bySource: bySource.map((s) => ({
      source: s.source,
      requests: s._count,
      promptTokens: s._sum.promptTokens || 0,
      completionTokens: s._sum.completionTokens || 0,
      totalTokens: s._sum.totalTokens || 0,
      avgLatency: Math.round(s._avg.latency || 0),
    })),
  };
}

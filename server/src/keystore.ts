/**
 * keystore.ts — API Key 存储服务
 *
 * 参考 sub2api 的 Account + Credentials 设计：
 * - 每条 UserApiKey = 一个供应商的凭证
 * - 单用户模式：所有请求归属 defaultUser
 * - Key 存储在 DB，gateway 转发时自动从 DB 读取
 */

import { prisma } from './db.js';
import type { SourceId } from './providers.js';

// ─── 默认用户（单用户模式） ─────────────────────────────

const DEFAULT_USER_NAME = 'default';
let defaultUserId: string | null = null;

/** 获取或创建默认用户，返回 userId */
export async function getDefaultUserId(): Promise<string> {
  if (defaultUserId) return defaultUserId;

  let user = await prisma.user.findFirst({
    where: { name: DEFAULT_USER_NAME },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { name: DEFAULT_USER_NAME },
    });
    console.log(`[keystore] 已创建默认用户: ${user.id}`);
  }

  defaultUserId = user.id;
  return defaultUserId!;
}

// ─── Key CRUD ────────────────────────────────────────────

/** 为默认用户添加一个供应商的 API Key */
export async function addApiKey(provider: SourceId, apiKey: string, label?: string) {
  const userId = await getDefaultUserId();
  return prisma.userApiKey.upsert({
    where: {
      userId_provider_apiKey: { userId, provider, apiKey },
    },
    update: { isActive: true, label: label ?? undefined },
    create: { userId, provider, apiKey, label },
  });
}

/** 获取默认用户某个供应商的所有活跃 Key */
export async function getApiKeys(provider: SourceId): Promise<string[]> {
  const userId = await getDefaultUserId();
  const keys = await prisma.userApiKey.findMany({
    where: { userId, provider, isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { apiKey: true },
  });
  return keys.map(k => k.apiKey);
}

/** 获取默认用户某个供应商的第一个活跃 Key（用于 gateway 自动填充） */
export async function getFirstApiKey(provider: SourceId): Promise<string | null> {
  const userId = await getDefaultUserId();
  const key = await prisma.userApiKey.findFirst({
    where: { userId, provider, isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, apiKey: true },
  });
  if (!key) return null;

  // 更新 lastUsedAt（参考 sub2api 的 UpdateLastUsed）
  prisma.userApiKey.update({
    where: { id: key.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {}); // fire-and-forget

  return key.apiKey;
}

/**
 * 从账号池中随机选择一个可用 Key（账号轮换）
 * 参考 sub2api 的账号选择逻辑，支持：
 * - 随机选择（负载均衡）
 * - 排除已失败的 key（通过 excludeKeys 参数）
 * - 自动更新 lastUsedAt
 */
export async function getRandomApiKey(
  provider: SourceId,
  excludeKeys: string[] = []
): Promise<string | null> {
  const userId = await getDefaultUserId();
  const keys = await prisma.userApiKey.findMany({
    where: {
      userId,
      provider,
      isActive: true,
      apiKey: { notIn: excludeKeys },
    },
    select: { id: true, apiKey: true },
  });

  if (keys.length === 0) return null;

  // 随机选择一个 key（负载均衡）
  const selected = keys[Math.floor(Math.random() * keys.length)];

  // 更新 lastUsedAt
  prisma.userApiKey.update({
    where: { id: selected.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return selected.apiKey;
}

/** 列出默认用户所有已存储的 Key（脱敏） */
export async function listApiKeys() {
  const userId = await getDefaultUserId();
  const keys = await prisma.userApiKey.findMany({
    where: { userId },
    orderBy: [{ provider: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      provider: true,
      apiKey: true,
      label: true,
      isActive: true,
      lastUsedAt: true,
      createdAt: true,
    },
  });

  return keys.map(k => ({
    id: k.id,
    provider: k.provider,
    keyPreview: maskKey(k.apiKey),
    label: k.label,
    isActive: k.isActive,
    lastUsedAt: k.lastUsedAt,
    createdAt: k.createdAt,
  }));
}

/** 删除一个 Key */
export async function deleteApiKey(id: string) {
  return prisma.userApiKey.delete({ where: { id } });
}

/** 禁用/启用一个 Key */
export async function toggleApiKey(id: string, isActive: boolean) {
  return prisma.userApiKey.update({
    where: { id },
    data: { isActive },
  });
}

// ─── 工具函数 ────────────────────────────────────────────

/** 脱敏显示 Key：sk-abc123...xyz → sk-abc***xyz */
function maskKey(key: string): string {
  if (key.length <= 10) return '***';
  return `${key.slice(0, 6)}***${key.slice(-4)}`;
}

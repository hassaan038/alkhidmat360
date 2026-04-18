import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetch a SystemConfig value by key.
 * Returns the defaultValue (default: null) when the key does not exist.
 */
export async function getConfig(key, defaultValue = null) {
  const record = await prisma.systemConfig.findUnique({
    where: { key },
  });

  if (!record) return defaultValue;
  return record.value;
}

/**
 * Upsert a SystemConfig value by key.
 */
export async function setConfig(key, value, userId = null) {
  const record = await prisma.systemConfig.upsert({
    where: { key },
    update: {
      value: String(value),
      updatedBy: userId ?? null,
    },
    create: {
      key,
      value: String(value),
      updatedBy: userId ?? null,
    },
  });

  return record;
}

export default {
  getConfig,
  setConfig,
};

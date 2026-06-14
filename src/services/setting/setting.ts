import prisma from "@/lib/prisma";
import {
  withDefaults,
  type StoreSettings,
} from "@/app/admin/setting/data";

const SINGLETON_ID = 1;

// The store settings, merged over the defaults (so newly added keys resolve).
export async function getSettings(): Promise<StoreSettings> {
  const row = await prisma.setting.findUnique({ where: { id: SINGLETON_ID } });
  return withDefaults(row?.data as Partial<StoreSettings> | null);
}

// Persist the full settings blob to the singleton row.
export async function updateSettings(
  data: StoreSettings
): Promise<StoreSettings> {
  const merged = withDefaults(data);
  const row = await prisma.setting.upsert({
    where: { id: SINGLETON_ID },
    update: { data: merged },
    create: { id: SINGLETON_ID, data: merged },
  });
  return withDefaults(row.data as Partial<StoreSettings>);
}

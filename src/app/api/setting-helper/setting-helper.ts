import type { StoreSettings } from "@/app/admin/setting/data";

const settingApi = "/api/setting";

export async function getSettings(): Promise<StoreSettings> {
  const res = await fetch(settingApi);
  if (!res.ok) {
    throw new Error("Failed to fetch settings");
  }
  return await res.json();
}

export async function saveSettings(settings: StoreSettings): Promise<StoreSettings> {
  const res = await fetch(settingApi, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error("Failed to save settings");
  }
  return await res.json();
}

import { authorize } from "@/lib/rbac";
import { getSettings, updateSettings } from "@/services/setting/setting";
import { logAudit } from "@/services/audit/audit";

export async function GET() {
  const authz = await authorize("settings:view");
  if (!authz.ok) return authz.response;

  const settings = await getSettings();
  return Response.json(settings);
}

export async function PUT(req: Request) {
  const authz = await authorize("settings:update");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const settings = await updateSettings(body);
  const { name, email, role } = authz.user;
  await logAudit({
    action: "Updated store settings",
    category: "settings",
    actor: { name, email, role },
  });
  return Response.json(settings);
}

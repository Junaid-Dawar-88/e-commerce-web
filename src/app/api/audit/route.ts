import { authorize } from "@/lib/rbac";
import { getAuditLogs } from "@/services/audit/audit";

// Audit logs live under the Settings page, so reading them needs settings:read.
export async function GET() {
  const authz = await authorize("settings:view");
  if (!authz.ok) return authz.response;

  const logs = await getAuditLogs();
  return Response.json(logs);
}

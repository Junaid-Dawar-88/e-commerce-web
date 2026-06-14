const auditApi = "/api/audit";

export async function getAuditLogs() {
  const res = await fetch(auditApi);

  if (!res.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  return await res.json();
}

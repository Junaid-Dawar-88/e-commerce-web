import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import type { AuditInput } from "@/types/audit";

export async function getAuditLogs(limit = 50) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Record an action. The actor defaults to the signed-in user; pass `actor`
// explicitly for events that happen outside a request session (e.g. login).
// Never throws — auditing must not break the operation it is recording.
export async function logAudit(input: AuditInput) {
  try {
    let actor = input.actor;
    if (!actor) {
      const user = await getCurrentUser();
      actor = { name: user?.name, email: user?.email, role: user?.role };
    }
    return await prisma.auditLog.create({
      data: {
        action: input.action,
        category: input.category ?? "system",
        target: input.target ?? "",
        actorName: actor?.name?.trim() || "System",
        actorEmail: actor?.email ?? "",
        actorRole: actor?.role ?? "",
      },
    });
  } catch (err) {
    console.error("[audit] failed to record:", err);
    return null;
  }
}

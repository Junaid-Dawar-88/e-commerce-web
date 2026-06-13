import prisma from "@/lib/prisma";

// Lightweight health check / keep-alive. Runs a trivial query so a scheduled
// pinger can keep the Neon compute from auto-suspending. Always dynamic so it
// is never cached.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, time: new Date().toISOString() });
  } catch (err) {
    console.error("[health] db ping failed:", err);
    return Response.json({ ok: false }, { status: 503 });
  }
}

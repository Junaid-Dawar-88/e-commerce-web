import { authorize } from "@/lib/rbac";
import {
  deleteNotification,
  setNotificationRead,
} from "@/services/notification/notification";

// Next.js 16: `params` is a promise and must be awaited.
// Notification `id` is a cuid string, so it is used as-is.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("notifications:update");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const body = await req.json();
  const notification = await setNotificationRead(id, body.read ?? true);
  return Response.json(notification);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authz = await authorize("notifications:delete");
  if (!authz.ok) return authz.response;

  const { id } = await params;
  const notification = await deleteNotification(id);
  return Response.json(notification);
}

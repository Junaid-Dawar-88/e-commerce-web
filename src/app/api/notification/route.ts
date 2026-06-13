import { authorize } from "@/lib/rbac";
import {
  createNotification,
  getNotifications,
  markAllNotificationsRead,
} from "@/services/notification/notification";

export async function GET() {
  const authz = await authorize("notification:read");
  if (!authz.ok) return authz.response;

  const notifications = await getNotifications();
  return Response.json(notifications);
}

export async function POST(req: Request) {
  const authz = await authorize("notification:write");
  if (!authz.ok) return authz.response;

  const body = await req.json();
  const notification = await createNotification(body);
  return Response.json(notification, { status: 201 });
}

// Mark every notification as read.
export async function PATCH() {
  const authz = await authorize("notification:write");
  if (!authz.ok) return authz.response;

  const notifications = await markAllNotificationsRead();
  return Response.json(notifications);
}

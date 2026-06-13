import { NotificationInput } from "@/types/notification";

const notificationApi = "/api/notification";

export async function getNotifications() {
  const res = await fetch(notificationApi);

  if (!res.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return await res.json();
}

export async function addNotification(notification: NotificationInput) {
  const res = await fetch(notificationApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notification),
  });

  if (!res.ok) {
    throw new Error("Failed to add notification");
  }

  return await res.json();
}

export async function markNotificationRead(id: string, read = true) {
  const res = await fetch(`${notificationApi}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ read }),
  });

  if (!res.ok) {
    throw new Error("Failed to update notification");
  }

  return await res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(notificationApi, { method: "PATCH" });

  if (!res.ok) {
    throw new Error("Failed to update notifications");
  }

  return await res.json();
}

export async function deleteNotification(id: string) {
  const res = await fetch(`${notificationApi}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete notification");
  }

  return await res.json();
}

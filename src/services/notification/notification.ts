import prisma from "@/lib/prisma";
import { NotificationInput } from "@/types/notification";

export async function getNotifications() {
  return prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createNotification(input: NotificationInput) {
  return prisma.notification.create({
    data: {
      category: input.category,
      tone: input.tone,
      title: input.title,
      lines: input.lines ?? [],
    },
  });
}

export async function setNotificationRead(id: string, read: boolean) {
  return prisma.notification.update({
    where: { id },
    data: { read },
  });
}

export async function markAllNotificationsRead() {
  await prisma.notification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  return getNotifications();
}

export async function deleteNotification(id: string) {
  return prisma.notification.delete({
    where: { id },
  });
}

import type { NotifCategory, NotifTone } from "@/generated/prisma/enums";

// Single source of truth — mirrors the Prisma `Notification` model.
export type { NotifCategory, NotifTone };

export type NotificationInput = {
  category?: NotifCategory;
  tone?: NotifTone;
  title: string;
  lines?: string[];
};

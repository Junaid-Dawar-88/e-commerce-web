-- CreateEnum
CREATE TYPE "NotifCategory" AS ENUM ('orders', 'payments', 'users', 'system');

-- CreateEnum
CREATE TYPE "NotifTone" AS ENUM ('success', 'warning', 'error', 'info');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyPush" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySms" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyPush" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySms" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "category" "NotifCategory" NOT NULL DEFAULT 'system',
    "tone" "NotifTone" NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "lines" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_read_idx" ON "notifications"("read");

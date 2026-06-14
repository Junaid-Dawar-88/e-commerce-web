-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'system';

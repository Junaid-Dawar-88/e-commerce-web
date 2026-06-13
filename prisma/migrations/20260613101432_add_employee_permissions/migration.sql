-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

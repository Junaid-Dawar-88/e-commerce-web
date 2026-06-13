-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('Active', 'Draft', 'Out_of_stock');

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "picture" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "seller" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "stock" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'Active',
    "description" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

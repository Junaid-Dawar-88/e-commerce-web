import prisma from "@/lib/prisma";
import { Product } from "@/types/product";

// Shape the writable fields once so create + update stay in sync.
function productData(product: Product) {
  return {
    picture: product.picture,
    name: product.name,
    sku: product.sku,
    category: product.category,
    seller: product.seller,
    price: product.price,
    stock: product.stock,
    status: product.status,
    description: product.description,
    categoryId: product.categoryId,
    subcategoryId: product.subcategoryId,
  };
}

export async function getProducts() {
  return prisma.product.findMany({
    include: { categoryRel: true, subcategoryRel: true },
  });
}

export async function getProduct(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: { categoryRel: true, subcategoryRel: true },
  });
}

export async function createProduct(product: Product) {
  return prisma.product.create({
    data: productData(product),
  });
}

export async function updateProduct(id: number, product: Product) {
  return prisma.product.update({
    where: { id },
    data: productData(product),
  });
}

export async function deleteProduct(id: number) {
  return prisma.product.delete({
    where: { id },
  });
}

import prisma from "@/lib/prisma";
import { Category } from "@/types/category";

// Shape the writable fields once so create + update stay in sync.
function categoryData(category: Category) {
  return {
    image: category.image,
    name: category.name,
    slug: category.slug,
    description: category.description,
    status: category.status,
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    include: { subcategories: true },
  });
}

export async function getCategory(id: number) {
  return prisma.category.findUnique({
    where: { id },
    include: { subcategories: { orderBy: { name: "asc" } } },
  });
}

export async function createCategory(category: Category) {
  return prisma.category.create({
    data: categoryData(category),
  });
}

export async function updateCategory(id: number, category: Category) {
  return prisma.category.update({
    where: { id },
    data: categoryData(category),
  });
}

export async function deleteCategory(id: number) {
  return prisma.category.delete({
    where: { id },
  });
}

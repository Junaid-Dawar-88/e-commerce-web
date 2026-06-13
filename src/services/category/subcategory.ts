import prisma from "@/lib/prisma";
import { Subcategory } from "@/types/category";

// Shape the writable fields once so create + update stay in sync.
function subcategoryData(subcategory: Subcategory) {
  return {
    image: subcategory.image,
    name: subcategory.name,
    slug: subcategory.slug,
    description: subcategory.description,
    status: subcategory.status,
    categoryId: subcategory.categoryId,
  };
}

export async function getSubcategories() {
  return prisma.subcategory.findMany({
    include: { category: true },
  });
}

export async function createSubcategory(subcategory: Subcategory) {
  return prisma.subcategory.create({
    data: subcategoryData(subcategory),
  });
}

export async function updateSubcategory(id: number, subcategory: Subcategory) {
  return prisma.subcategory.update({
    where: { id },
    data: subcategoryData(subcategory),
  });
}

export async function deleteSubcategory(id: number) {
  return prisma.subcategory.delete({
    where: { id },
  });
}

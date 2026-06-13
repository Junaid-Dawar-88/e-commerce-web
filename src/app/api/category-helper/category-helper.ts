import { Category, Subcategory } from "@/types/category";

const categoryApi = "/api/category";
const subcategoryApi = "/api/subcategory";

/* -------------------------------- Category -------------------------------- */

export async function getCategories() {
  const res = await fetch(categoryApi);

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return await res.json();
}

export async function addCategory(category: Category) {
  const res = await fetch(categoryApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  if (!res.ok) {
    throw new Error("Failed to add category");
  }

  return await res.json();
}

export async function updateCategory(id: number, category: Category) {
  const res = await fetch(`${categoryApi}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });

  if (!res.ok) {
    throw new Error("Failed to update category");
  }

  return await res.json();
}

export async function deleteCategory(id: number) {
  const res = await fetch(`${categoryApi}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete category");
  }

  return await res.json();
}

/* ------------------------------ Subcategory ------------------------------- */

export async function getSubcategories() {
  const res = await fetch(subcategoryApi);

  if (!res.ok) {
    throw new Error("Failed to fetch subcategories");
  }

  return await res.json();
}

export async function addSubcategory(subcategory: Subcategory) {
  const res = await fetch(subcategoryApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subcategory),
  });

  if (!res.ok) {
    throw new Error("Failed to add subcategory");
  }

  return await res.json();
}

export async function updateSubcategory(id: number, subcategory: Subcategory) {
  const res = await fetch(`${subcategoryApi}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subcategory),
  });

  if (!res.ok) {
    throw new Error("Failed to update subcategory");
  }

  return await res.json();
}

export async function deleteSubcategory(id: number) {
  const res = await fetch(`${subcategoryApi}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete subcategory");
  }

  return await res.json();
}

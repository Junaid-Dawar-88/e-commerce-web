import { Product } from "@/types/product";

const productApi = "/api/product";

export async function getProducts() {
  const res = await fetch(productApi);

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return await res.json();
}

export async function addProduct(product: Product) {
  const res = await fetch(productApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    throw new Error("Failed to add product");
  }

  return await res.json();
}

export async function updateProduct(id: number, product: Product) {
  const res = await fetch(`${productApi}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  if (!res.ok) {
    throw new Error("Failed to update product");
  }

  return await res.json();
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${productApi}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete product");
  }

  return await res.json();
}
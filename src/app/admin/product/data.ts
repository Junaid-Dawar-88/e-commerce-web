// Product types now come from the single source of truth in `@/types/product`.
// Real data is loaded from the API; this seed is just the initial empty state.
import type { Product } from "@/types/product";

export type { Product, ProductStatus } from "@/types/product";

export const products: Product[] = [];

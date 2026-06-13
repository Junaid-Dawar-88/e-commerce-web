// Category view-model types + mappers from the API rows.

export type CategoryStatus = 'active' | 'inactive'

export type Subcategory = {
  id: string
  image: string
  name: string
  slug: string
  description: string
  products: number
  status: CategoryStatus
}

export type Category = {
  id: string
  image: string
  name: string
  slug: string
  description: string
  products: number
  status: CategoryStatus
  subcategories: Subcategory[]
}

export const categories: Category[] = []

// Shapes returned by the API (mirror the Prisma models).
export type SubcategoryRow = {
  id: number
  image: string
  name: string
  slug: string
  description: string
  status: CategoryStatus
  categoryId: number
}

export type CategoryRow = {
  id: number
  image: string
  name: string
  slug: string
  description: string
  status: CategoryStatus
  subcategories?: SubcategoryRow[]
}

export function mapSubcategory(row: SubcategoryRow): Subcategory {
  return {
    id: String(row.id),
    image: row.image || '📦',
    name: row.name,
    slug: row.slug,
    description: row.description,
    products: 0,
    status: row.status,
  }
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: String(row.id),
    image: row.image || '📦',
    name: row.name,
    slug: row.slug,
    description: row.description,
    products: 0,
    status: row.status,
    subcategories: (row.subcategories ?? []).map(mapSubcategory),
  }
}

import { ProductsTable } from '@/components/product/products-table'

export default function ProductsPage() {
  return (
    <div className="flex h-full flex-col gap-6">
      <header className="shrink-0">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Manage your catalog — stock, pricing, and availability.
        </p>
      </header>

      <ProductsTable className="min-h-0 flex-1" />
    </div>
  )
}

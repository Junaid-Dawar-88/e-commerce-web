import { notFound } from 'next/navigation'
import { getCategory } from '@/services/category/category'
import { mapCategory, type CategoryRow } from '@/app/admin/categories/data'
import { CategoryDetail } from '@/components/category/category-detail'

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()

  const row = await getCategory(numericId)
  if (!row) notFound()

  return <CategoryDetail category={mapCategory(row as CategoryRow)} />
}

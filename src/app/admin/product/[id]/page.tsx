import { notFound } from 'next/navigation'
import { getProduct } from '@/services/product/product'
import { ProductDetail } from '@/components/product/product-detail'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()

  const product = await getProduct(numericId)
  if (!product) notFound()

  return <ProductDetail product={product} />
}

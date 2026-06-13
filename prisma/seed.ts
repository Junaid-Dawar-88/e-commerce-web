import { config } from 'dotenv'
// .env.local wins when present; otherwise fall back to .env.
config({ path: '.env.local' })
config({ path: '.env' })

import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

const employees = [
  {
    id: 'EMP001',
    name: 'Sara Mehmood',
    email: 'sara.employee@store.com',
    password: 'Employee@123',
    phone: '+92 300 1112233',
    role: 'Store Manager',
    department: 'Operations',
    status: 'active' as const,
    salary: 120000,
    city: 'Karachi',
    state: 'Sindh',
    country: 'Pakistan',
  },
  {
    id: 'EMP002',
    name: 'Hamza Sheikh',
    email: 'hamza.employee@store.com',
    password: 'Hamza@123',
    phone: '+92 301 2223344',
    role: 'Cashier',
    department: 'Sales',
    status: 'active' as const,
    salary: 55000,
    city: 'Lahore',
    state: 'Punjab',
    country: 'Pakistan',
  },
  {
    id: 'EMP003',
    name: 'Nida Aslam',
    email: 'nida.employee@store.com',
    password: 'Nida@123',
    phone: '+92 302 3334455',
    role: 'Support Agent',
    department: 'Customer Support',
    status: 'on_leave' as const,
    salary: 60000,
    city: 'Islamabad',
    state: 'ICT',
    country: 'Pakistan',
  },
  {
    id: 'EMP004',
    name: 'Bilal Ahmed',
    email: 'bilal.employee@store.com',
    password: 'Bilal@123',
    phone: '+92 303 4445566',
    role: 'Warehouse Staff',
    department: 'Logistics',
    status: 'inactive' as const,
    salary: 48000,
    city: 'Faisalabad',
    state: 'Punjab',
    country: 'Pakistan',
  },
]

// Storefront categories. Idempotent via the unique slug.
const categories = [
  { name: 'Shoes', slug: 'shoes', description: 'Sneakers, runners and boots.' },
  { name: 'Clothing', slug: 'clothing', description: 'Everyday apparel and outerwear.' },
  { name: 'Accessories', slug: 'accessories', description: 'Finishing touches.' },
]

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=70`

// Demo catalog. `category` is the denormalized display name; `categorySlug`
// links to the real Category row created above.
const products = [
  // Shoes
  { name: 'Classic Court Sneakers', categorySlug: 'shoes', price: '89.00', stock: '40', picture: img('photo-1542291026-7eec264c27ff'), description: 'Timeless low-top sneakers with a cushioned sole for all-day comfort.' },
  { name: 'Trail Running Shoes', categorySlug: 'shoes', price: '119.00', stock: '25', picture: img('photo-1460353581641-37baddab0fa2'), description: 'Lightweight runners with grippy outsoles built for the trail.' },
  { name: 'Everyday Canvas Shoes', categorySlug: 'shoes', price: '59.00', stock: '60', picture: img('photo-1525966222134-fcfa99b8ae77'), description: 'Breathable canvas slip-ons that pair with anything.' },
  { name: 'Performance Trainers', categorySlug: 'shoes', price: '129.00', stock: '18', picture: img('photo-1595950653106-6c9ebd614d3a'), description: 'Responsive trainers engineered for the gym and the street.' },
  // Clothing
  { name: 'Essential Cotton Tee', categorySlug: 'clothing', price: '24.00', stock: '120', picture: img('photo-1521572163474-6864f9cf17ab'), description: 'Soft, pre-shrunk cotton tee in a relaxed everyday fit.' },
  { name: 'Fleece Pullover Hoodie', categorySlug: 'clothing', price: '64.00', stock: '50', picture: img('photo-1556821840-3a63f95609a7'), description: 'Cozy brushed-fleece hoodie with a roomy front pocket.' },
  { name: 'Denim Jacket', categorySlug: 'clothing', price: '98.00', stock: '30', picture: img('photo-1551028719-00167b16eac5'), description: 'A wardrobe staple — structured denim with a vintage wash.' },
  { name: 'Slim-Fit Jeans', categorySlug: 'clothing', price: '79.00', stock: '45', picture: img('photo-1542272604-787c3835535d'), description: 'Stretch denim with a modern slim cut that moves with you.' },
  // Accessories
  { name: 'Minimalist Watch', categorySlug: 'accessories', price: '149.00', stock: '20', picture: img('photo-1523275335684-37898b6baf30'), description: 'Clean dial, leather strap, and a scratch-resistant face.' },
  { name: 'Polarized Sunglasses', categorySlug: 'accessories', price: '69.00', stock: '70', picture: img('photo-1511499767150-a48a237f0083'), description: 'UV400 polarized lenses in a lightweight frame.' },
  { name: 'Everyday Backpack', categorySlug: 'accessories', price: '89.00', stock: '35', picture: img('photo-1553062407-98eeb64c6a62'), description: 'Water-resistant pack with a padded laptop sleeve.' },
  { name: 'Classic Baseball Cap', categorySlug: 'accessories', price: '29.00', stock: '90', picture: img('photo-1588850561407-ed78c282e89b'), description: 'Adjustable cotton-twill cap with a curved brim.' },
]

async function main() {
  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: emp,
      create: emp,
    })
  }
  console.log(`Seeded ${employees.length} employees.`)

  // Categories — idempotent on slug.
  const slugToId = new Map<string, number>()
  for (const cat of categories) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    })
    slugToId.set(cat.slug, row.id)
  }
  console.log(`Seeded ${categories.length} categories.`)

  // Products — additive & idempotent: create each demo product only when one
  // with the same name doesn't already exist, so we never duplicate on re-run
  // and never clobber products created from the admin dashboard.
  let created = 0
  let n = 1
  for (const p of products) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } })
    if (!exists) {
      await prisma.product.create({
        data: {
          picture: p.picture,
          name: p.name,
          sku: `SKU-${String(n).padStart(4, '0')}`,
          category: categories.find((c) => c.slug === p.categorySlug)!.name,
          seller: 'Your Store',
          price: p.price,
          stock: p.stock,
          status: 'Active',
          description: p.description,
          categoryId: slugToId.get(p.categorySlug) ?? null,
        },
      })
      created++
    }
    n++
  }
  console.log(`Seeded ${created} new products (${products.length - created} already present).`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })

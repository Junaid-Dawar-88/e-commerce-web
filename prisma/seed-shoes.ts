// One-off seed: creates a "Shoes" category and a product for each image in
// public/shoes (shoe-1.jpeg ... shoe-N.jpeg). Idempotent — re-running replaces
// the Shoes products rather than duplicating them.
//
//   npx tsx prisma/seed-shoes.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const IMAGE_COUNT = 31;
const SELLER = "B-4 Brand";

// Rotating, human-readable product names so each card reads like a real listing.
const NAMES = [
  "All-Day Comfort Sandal",
  "B-4 Court Sneaker",
  "Trail Runner Pro",
  "Urban Strap Sandal",
  "Classic Slide",
  "Velcro Sport Sandal",
  "Street Runner",
  "Casual Walk Sneaker",
  "Active Trainer",
  "Daily Comfort Sandal",
  "Retro Court Shoe",
  "Flex Running Shoe",
  "Outdoor Strap Sandal",
  "City Sneaker",
  "Marathon Runner",
  "Easy Slip-On",
  "Adventure Sandal",
  "Pro Gym Trainer",
  "Lightweight Runner",
  "Everyday Sneaker",
  "Beach Strap Sandal",
  "Cushion Walk Shoe",
  "Sport Flex Sandal",
  "Classic Lace Sneaker",
  "Trail Grip Shoe",
  "Comfy Casual Sandal",
  "Speed Runner",
  "Premium Court Sneaker",
  "Summer Slide Sandal",
  "Athletic Trainer",
  "All-Terrain Sneaker",
];

// A spread of price points / stock so the catalog looks natural.
const PRICES = ["34.99", "39.99", "44.99", "49.99", "54.99", "59.99", "64.99", "29.99"];
const STOCKS = ["25", "40", "12", "8", "60", "33", "5", "18"];

async function main() {
  // Upsert the category so re-runs reuse the same row.
  const category = await prisma.category.upsert({
    where: { slug: "shoes" },
    update: { image: "/shoes/shoe-2.jpeg", status: "active" },
    create: {
      name: "Shoes",
      slug: "shoes",
      image: "/shoes/shoe-2.jpeg",
      description: "Comfortable sandals, sneakers and trainers for all-day wear.",
      status: "active",
    },
  });
  console.log(`Category "Shoes" ready (id=${category.id})`);

  // Clear any previously seeded Shoes products to stay idempotent.
  const removed = await prisma.product.deleteMany({
    where: { categoryId: category.id },
  });
  if (removed.count) console.log(`Removed ${removed.count} existing Shoes products`);

  for (let i = 1; i <= IMAGE_COUNT; i++) {
    const name = NAMES[(i - 1) % NAMES.length];
    await prisma.product.create({
      data: {
        picture: `/shoes/shoe-${i}.jpeg`,
        name,
        sku: `SHOE-${String(i).padStart(3, "0")}`,
        category: "Shoes",
        categoryId: category.id,
        seller: SELLER,
        price: PRICES[i % PRICES.length],
        stock: STOCKS[i % STOCKS.length],
        status: "Active",
        description: `${name} by ${SELLER} — all-day comfort, durable build, and a clean modern look.`,
      },
    });
  }

  const total = await prisma.product.count({ where: { categoryId: category.id } });
  console.log(`Seeded ${total} Shoes products.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

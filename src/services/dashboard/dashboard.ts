import prisma from "@/lib/prisma";
import {
  CHART_FILLS,
  type DashboardData,
  type OrderStatus,
} from "@/app/admin/dashboard/data";

// Amounts/prices are stored as strings — coerce safely to a number.
const num = (v: string | number | null | undefined) => Number(v) || 0;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Month-over-month percentage change, guarding against divide-by-zero.
function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// The dashboard's "recent orders" badge keys off payment status.
function paymentToStatus(p: string): OrderStatus {
  if (p === "paid") return "paid";
  if (p === "refunded") return "refunded";
  return "pending";
}

// Aggregate every dashboard widget from live data. Pulls from the same
// Order / Product / Customer tables the related admin pages read, so the
// numbers here always agree with those pages.
export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const thisMonthStart = new Date(year, month, 1);
  const lastMonthStart = new Date(year, month - 1, 1);

  const [orders, products, customers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, customer: true },
    }),
    prisma.product.findMany({ select: { id: true, category: true } }),
    prisma.customer.findMany({ select: { createdAt: true } }),
  ]);

  const productCategory = new Map(products.map((p) => [p.id, p.category || "Other"]));
  const active = orders.filter((o) => o.status !== "cancelled");
  const totalRevenue = active.reduce((s, o) => s + num(o.amount), 0);

  // ---- KPI metrics (this month vs. last month) ----
  let revThis = 0, revLast = 0;
  let ordThis = 0, ordLast = 0;
  let activeThis = 0, activeLast = 0;
  for (const o of orders) {
    const c = new Date(o.createdAt);
    const isThis = c >= thisMonthStart;
    const isLast = c >= lastMonthStart && c < thisMonthStart;
    if (isThis) ordThis += 1;
    else if (isLast) ordLast += 1;
    if (o.status !== "cancelled") {
      const amt = num(o.amount);
      if (isThis) { revThis += amt; activeThis += 1; }
      else if (isLast) { revLast += amt; activeLast += 1; }
    }
  }

  const custThis = customers.filter((c) => new Date(c.createdAt) >= thisMonthStart).length;
  const custLast = customers.filter((c) => {
    const d = new Date(c.createdAt);
    return d >= lastMonthStart && d < thisMonthStart;
  }).length;

  const avgOrder = active.length ? totalRevenue / active.length : 0;
  const aovThis = activeThis ? revThis / activeThis : 0;
  const aovLast = activeLast ? revLast / activeLast : 0;

  // ---- Revenue & orders by month (Jan → current month) ----
  const monthRevenue = new Array(12).fill(0);
  const monthOrders = new Array(12).fill(0);
  for (const o of active) {
    const c = new Date(o.createdAt);
    if (c.getFullYear() === year) {
      monthRevenue[c.getMonth()] += num(o.amount);
      monthOrders[c.getMonth()] += 1;
    }
  }
  const revenueSeries = [];
  for (let m = 0; m <= month; m++) {
    revenueSeries.push({ month: MONTHS[m], revenue: monthRevenue[m], orders: monthOrders[m] });
  }

  // ---- Units sold per category (top 5) ----
  const catUnits = new Map<string, number>();
  for (const o of active) {
    for (const it of o.items) {
      const cat =
        it.productId != null ? productCategory.get(it.productId) ?? "Other" : "Other";
      catUnits.set(cat, (catUnits.get(cat) ?? 0) + it.qty);
    }
  }
  const categorySeries = [...catUnits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, sales], i) => ({
      category,
      sales,
      fill: CHART_FILLS[i % CHART_FILLS.length],
    }));

  // ---- Orders per day, last 7 days ----
  const startDay = new Date(year, month, now.getDate() - 6);
  startDay.setHours(0, 0, 0, 0);
  const dayCounts = new Array(7).fill(0);
  for (const o of orders) {
    const offset = Math.floor((new Date(o.createdAt).getTime() - startDay.getTime()) / 86_400_000);
    if (offset >= 0 && offset <= 6) dayCounts[offset] += 1;
  }
  const ordersByDay = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    ordersByDay.push({ day: DAYS[d.getDay()], orders: dayCounts[i] });
  }

  // ---- Recent orders (latest 5) ----
  const recentOrders = orders.slice(0, 5).map((o) => ({
    id: `#${o.id.slice(-8).toUpperCase()}`,
    customer: o.customer?.name ?? "Customer",
    email: o.customer?.email ?? "",
    amount: num(o.amount),
    status: paymentToStatus(o.paymentStatus),
    date: new Date(o.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));

  // ---- Top products by units sold (with MoM trend) ----
  type Agg = { name: string; sold: number; revenue: number; soldThis: number; soldLast: number };
  const prodAgg = new Map<string, Agg>();
  for (const o of active) {
    const c = new Date(o.createdAt);
    const isThis = c >= thisMonthStart;
    const isLast = c >= lastMonthStart && c < thisMonthStart;
    for (const it of o.items) {
      const key = it.productId != null ? `p${it.productId}` : `n:${it.name}`;
      const a = prodAgg.get(key) ?? { name: it.name, sold: 0, revenue: 0, soldThis: 0, soldLast: 0 };
      a.sold += it.qty;
      a.revenue += it.qty * num(it.price);
      if (isThis) a.soldThis += it.qty;
      else if (isLast) a.soldLast += it.qty;
      prodAgg.set(key, a);
    }
  }
  const topProducts = [...prodAgg.values()]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map((a) => ({
      name: a.name,
      sold: a.sold,
      revenue: a.revenue,
      trend: pctDelta(a.soldThis, a.soldLast),
    }));

  return {
    metrics: {
      revenue: { value: totalRevenue, delta: pctDelta(revThis, revLast) },
      orders: { value: orders.length, delta: pctDelta(ordThis, ordLast) },
      customers: { value: customers.length, delta: pctDelta(custThis, custLast) },
      avgOrder: { value: avgOrder, delta: pctDelta(aovThis, aovLast) },
    },
    revenueSeries,
    categorySeries,
    ordersByDay,
    recentOrders,
    topProducts,
  };
}

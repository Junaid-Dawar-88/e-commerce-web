import prisma from "@/lib/prisma";
import { CHART_FILLS } from "@/app/admin/dashboard/data";
import type {
  ChannelSlice,
  Period,
  Reports,
  ReportSummary,
  SeriesPoint,
} from "@/app/admin/report/data";

const num = (v: string | number | null | undefined) => Number(v) || 0;
const DAY = 86_400_000;

type OrderRow = {
  amount: string;
  status: string;
  paymentStatus: string;
  seller: string;
  createdAt: Date;
};
type CustomerRow = { createdAt: Date };

const isActive = (o: OrderRow) => o.status !== "cancelled";
const isRefunded = (o: OrderRow) => o.paymentStatus === "refunded";

function pctDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Sum revenue / order count / refunds for orders within [start, end).
function tally(orders: OrderRow[], start: Date, end: Date) {
  let revenue = 0;
  let count = 0;
  let refunds = 0;
  for (const o of orders) {
    const c = o.createdAt;
    if (c >= start && c < end) {
      count += 1;
      if (isRefunded(o)) refunds += 1;
      if (isActive(o)) revenue += num(o.amount);
    }
  }
  return { revenue, orders: count, refunds };
}

function newCustomers(customers: CustomerRow[], start: Date, end: Date) {
  return customers.filter((c) => c.createdAt >= start && c.createdAt < end).length;
}

// Summary KPIs for the current window vs. an equally long preceding window.
function summarize(
  orders: OrderRow[],
  customers: CustomerRow[],
  start: Date,
  end: Date
): ReportSummary {
  const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
  const cur = tally(orders, start, end);
  const prev = tally(orders, prevStart, start);
  const curCustomers = newCustomers(customers, start, end);
  const prevCustomers = newCustomers(customers, prevStart, start);

  const aov = cur.orders ? cur.revenue / cur.orders : 0;
  const prevAov = prev.orders ? prev.revenue / prev.orders : 0;
  const refundRate = cur.orders ? Math.round((cur.refunds / cur.orders) * 1000) / 10 : 0;

  return {
    revenue: cur.revenue,
    orders: cur.orders,
    customers: curCustomers,
    aov,
    refundRate,
    revenueDelta: pctDelta(cur.revenue, prev.revenue),
    ordersDelta: pctDelta(cur.orders, prev.orders),
    customersDelta: pctDelta(curCustomers, prevCustomers),
    aovDelta: pctDelta(aov, prevAov),
  };
}

// Revenue grouped by the order's seller (top 5) within [start, end).
function channels(orders: OrderRow[], start: Date, end: Date): ChannelSlice[] {
  const map = new Map<string, number>();
  for (const o of orders) {
    if (o.createdAt >= start && o.createdAt < end && isActive(o)) {
      const seller = o.seller?.trim() || "Direct";
      map.set(seller, (map.get(seller) ?? 0) + num(o.amount));
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({ name, value, fill: CHART_FILLS[i % CHART_FILLS.length] }));
}

function bucketSeries(
  orders: OrderRow[],
  buckets: { start: Date; end: Date; label: string }[]
): SeriesPoint[] {
  return buckets.map((b) => ({ label: b.label, ...tally(orders, b.start, b.end) }));
}

// Build the three period reports (daily / weekly / monthly) in one pass.
export async function getReportData(): Promise<Reports> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const [orders, customers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        amount: true,
        status: true,
        paymentStatus: true,
        seller: true,
        createdAt: true,
      },
    }),
    prisma.customer.findMany({ select: { createdAt: true } }),
  ]);

  // --- Daily: last 7 calendar days ---
  const todayStart = startOfDay(now);
  const dailyBuckets = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(todayStart.getTime() - (6 - i) * DAY);
    const end = new Date(start.getTime() + DAY);
    return { start, end, label: start.toLocaleDateString("en-US", { weekday: "short" }) };
  });
  const dailyStart = dailyBuckets[0].start;

  // --- Weekly: last 7 weeks (weeks start on Sunday) ---
  const thisWeekStart = new Date(todayStart.getTime() - todayStart.getDay() * DAY);
  const weeklyBuckets = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(thisWeekStart.getTime() - (6 - i) * 7 * DAY);
    const end = new Date(start.getTime() + 7 * DAY);
    return { start, end, label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  });
  const weeklyStart = weeklyBuckets[0].start;

  // --- Monthly: year to date ---
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyBuckets = Array.from({ length: month + 1 }, (_, m) => ({
    start: new Date(year, m, 1),
    end: new Date(year, m + 1, 1),
    label: MONTHS[m],
  }));
  const yearStart = new Date(year, 0, 1);

  return {
    daily: {
      summary: summarize(orders, customers, dailyStart, now),
      series: bucketSeries(orders, dailyBuckets),
      channels: channels(orders, dailyStart, now),
    },
    weekly: {
      summary: summarize(orders, customers, weeklyStart, now),
      series: bucketSeries(orders, weeklyBuckets),
      channels: channels(orders, weeklyStart, now),
    },
    monthly: {
      summary: summarize(orders, customers, yearStart, now),
      series: bucketSeries(orders, monthlyBuckets),
      channels: channels(orders, yearStart, now),
    },
  };
}

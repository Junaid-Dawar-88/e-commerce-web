'use client'

import { Printer, Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Order } from '@/app/admin/order/data'

const STORE = {
  name: 'My Store',
  address: '123 Commerce Street, Karachi, Pakistan',
  email: 'support@mystore.com',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
}
const paymentLabels: Record<string, string> = {
  paid: 'Paid', cod: 'Cash on Delivery', unpaid: 'Unpaid', refunded: 'Refunded',
}

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const subtotalOf = (order: Order) => order.items.reduce((s, it) => s + it.price * it.qty, 0)

const statusPill: Record<string, { fg: string; bg: string }> = {
  pending: { fg: '#b45309', bg: '#fef3c7' },
  processing: { fg: '#0369a1', bg: '#e0f2fe' },
  shipped: { fg: '#6d28d9', bg: '#ede9fe' },
  delivered: { fg: '#047857', bg: '#d1fae5' },
  cancelled: { fg: '#be123c', bg: '#ffe4e6' },
}

/** Self-contained, print-friendly HTML used for both the modal preview and the print window. */
function invoiceHTML(order: Order) {
  const subtotal = subtotalOf(order)
  const pill = statusPill[order.status]
  const rows = order.items
    .map(
      (it) => `
      <tr>
        <td>
          <div class="it-name">${it.name}</div>
          <div class="it-var">${it.variant}</div>
        </td>
        <td class="num">${it.qty}</td>
        <td class="num">${usd(it.price)}</td>
        <td class="num bold">${usd(it.price * it.qty)}</td>
      </tr>`
    )
    .join('')

  return `
  <style>
    .invoice-doc { background:#fff; color:#171717; font-family: ui-sans-serif, system-ui, sans-serif; width:100%; margin:0 auto; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.06); }
    .invoice-doc * { box-sizing:border-box; }
    .invoice-doc .head { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; padding:32px 40px; background:linear-gradient(135deg,#6d4aff 0%,#8b5cf6 100%); color:#fff; }
    .invoice-doc .head h1 { font-size:30px; letter-spacing:.04em; margin:0; font-weight:700; }
    .invoice-doc .head .num { font-size:13px; opacity:.85; margin-top:4px; }
    .invoice-doc .co { text-align:right; font-size:12px; line-height:1.6; opacity:.95; }
    .invoice-doc .co strong { display:block; font-size:16px; margin-bottom:2px; }
    .invoice-doc .body { padding:32px 40px; }
    .invoice-doc .meta { display:flex; gap:40px; flex-wrap:wrap; padding-bottom:24px; border-bottom:1px solid #eee; }
    .invoice-doc .label { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#999; margin-bottom:4px; }
    .invoice-doc .strong { font-weight:600; font-size:14px; }
    .invoice-doc .pill { display:inline-block; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:600; color:${pill.fg}; background:${pill.bg}; }
    .invoice-doc .parties { display:flex; gap:40px; flex-wrap:wrap; padding:24px 0; }
    .invoice-doc .parties > div { flex:1; min-width:180px; }
    .invoice-doc .h { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#999; margin-bottom:8px; }
    .invoice-doc .name { font-weight:600; font-size:15px; }
    .invoice-doc .muted { color:#666; font-size:13px; line-height:1.5; margin-top:2px; }
    .invoice-doc table { width:100%; border-collapse:collapse; table-layout:fixed; margin-top:8px; font-size:13px; }
    .invoice-doc col.c-desc { width:auto; } .invoice-doc col.c-qty { width:56px; } .invoice-doc col.c-price { width:100px; } .invoice-doc col.c-amt { width:110px; }
    .invoice-doc th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:#999; padding:10px 8px; border-bottom:2px solid #eee; }
    .invoice-doc td { padding:14px 8px; border-bottom:1px solid #f3f3f3; vertical-align:top; }
    .invoice-doc th.num, .invoice-doc td.num { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
    .invoice-doc td.bold { font-weight:600; }
    .invoice-doc .it-name { font-weight:600; }
    .invoice-doc .it-var { color:#999; font-size:12px; margin-top:2px; }
    .invoice-doc .totals { margin-left:auto; width:280px; margin-top:20px; font-size:13px; }
    .invoice-doc .totals .row { display:flex; justify-content:space-between; padding:6px 0; }
    .invoice-doc .totals .muted { color:#888; }
    .invoice-doc .totals .grand { border-top:2px solid #eee; margin-top:8px; padding-top:12px; font-weight:700; font-size:18px; }
    .invoice-doc .pay { margin-top:28px; padding:14px 16px; background:#f7f7f8; border-radius:10px; font-size:13px; color:#444; }
    .invoice-doc .foot { margin-top:24px; text-align:center; color:#aaa; font-size:12px; }
  </style>
  <div class="invoice-doc">
    <div class="head">
      <div>
        <h1>INVOICE</h1>
        <div class="num">${order.id}</div>
      </div>
      <div class="co">
        <strong>${STORE.name}</strong>
        ${STORE.address}<br/>
        ${STORE.email}
      </div>
    </div>

    <div class="body">
      <div class="meta">
        <div><div class="label">Invoice No.</div><div class="strong">${order.id}</div></div>
        <div><div class="label">Date</div><div class="strong">${order.date}</div></div>
        <div><div class="label">Status</div><span class="pill">${statusLabels[order.status]}</span></div>
      </div>

      <div class="parties">
        <div>
          <div class="h">Bill To</div>
          <div class="name">${order.customer}</div>
          <div class="muted">${order.email}</div>
        </div>
        <div>
          <div class="h">Ship To</div>
          <div class="muted">${order.shippingAddress}</div>
        </div>
      </div>

      <table>
        <colgroup><col class="c-desc"/><col class="c-qty"/><col class="c-price"/><col class="c-amt"/></colgroup>
        <thead>
          <tr><th>Description</th><th class="num">Qty</th><th class="num">Unit Price</th><th class="num">Amount</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="totals">
        <div class="row"><span class="muted">Subtotal</span><span>${usd(subtotal)}</span></div>
        <div class="row"><span class="muted">Shipping</span><span>Free</span></div>
        <div class="row grand"><span>Total</span><span>${usd(order.amount)}</span></div>
      </div>

      <div class="pay">
        <strong>Payment</strong> · ${order.paymentMethod} — ${paymentLabels[order.paymentStatus]}
      </div>

      <div class="foot">Thank you for shopping with ${STORE.name}!</div>
    </div>
  </div>`
}

function printInvoice(order: Order) {
  const w = window.open('', '_blank', 'width=820,height=920')
  if (!w) return
  w.document.write(`
    <html>
      <head>
        <title>Invoice ${order.id}</title>
        <style>@page { margin: 14mm; } body { margin:0; background:#fff; }</style>
      </head>
      <body onload="window.focus(); window.print();">
        ${invoiceHTML(order)}
      </body>
    </html>`)
  w.document.close()
}

function exportPdf(order: Order) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const M = 40
  const right = 555
  let y = 60

  doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(23)
  doc.text('INVOICE', M, y)
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(140)
  doc.text(order.id, M, y + 16)
  doc.setDrawColor(109, 74, 255).setLineWidth(3)
  doc.line(M, y + 24, M + 40, y + 24)

  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(23)
  doc.text(STORE.name, right, y, { align: 'right' })
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(120)
  doc.text(STORE.address, right, y + 14, { align: 'right' })
  doc.text(STORE.email, right, y + 26, { align: 'right' })

  y += 64
  doc.setFontSize(10).setTextColor(23)
  doc.text(`Date: ${order.date}`, M, y)
  doc.text(`Status: ${statusLabels[order.status]}`, M, y + 14)

  y += 44
  doc.setFont('helvetica', 'bold').setTextColor(140).setFontSize(9)
  doc.text('BILL TO', M, y)
  doc.text('SHIP TO', 300, y)
  doc.setFont('helvetica', 'normal').setTextColor(40).setFontSize(10)
  doc.text(order.customer, M, y + 15)
  doc.text(order.email, M, y + 28)
  doc.text(doc.splitTextToSize(order.shippingAddress, 240), 300, y + 15)

  y += 56
  doc.setDrawColor(225).setLineWidth(1).line(M, y, right, y)
  y += 16
  doc.setFont('helvetica', 'bold').setTextColor(140).setFontSize(9)
  doc.text('DESCRIPTION', M, y)
  doc.text('QTY', 360, y, { align: 'right' })
  doc.text('PRICE', 450, y, { align: 'right' })
  doc.text('AMOUNT', right, y, { align: 'right' })
  y += 8
  doc.line(M, y, right, y)
  y += 18

  doc.setFont('helvetica', 'normal')
  order.items.forEach((it) => {
    doc.setTextColor(23).setFontSize(10).text(it.name, M, y)
    doc.setTextColor(140).setFontSize(8).text(it.variant, M, y + 11)
    doc.setTextColor(23).setFontSize(10)
    doc.text(String(it.qty), 360, y, { align: 'right' })
    doc.text(usd(it.price), 450, y, { align: 'right' })
    doc.text(usd(it.price * it.qty), right, y, { align: 'right' })
    y += 30
  })

  doc.setDrawColor(225).line(M, y, right, y)
  y += 20
  const labelX = 450
  doc.setTextColor(120).setFontSize(10)
  doc.text('Subtotal', labelX, y, { align: 'right' })
  doc.setTextColor(23).text(usd(subtotalOf(order)), right, y, { align: 'right' })
  y += 16
  doc.setTextColor(120).text('Shipping', labelX, y, { align: 'right' })
  doc.setTextColor(23).text('Free', right, y, { align: 'right' })
  y += 22
  doc.setFont('helvetica', 'bold').setFontSize(13)
  doc.text('Total', labelX, y, { align: 'right' })
  doc.text(usd(order.amount), right, y, { align: 'right' })

  y += 40
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(80)
  doc.text(`Payment: ${order.paymentMethod} — ${paymentLabels[order.paymentStatus]}`, M, y)

  doc.setTextColor(160).setFontSize(10)
  doc.text(`Thank you for shopping with ${STORE.name}!`, M, 800)

  doc.save(`invoice-${order.id.replace('#', '')}.pdf`)
}

export function InvoiceDialog({
  order,
  onOpenChange,
}: {
  order: Order | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>Invoice {order?.id}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto bg-muted/40 p-5">
          {order && <div dangerouslySetInnerHTML={{ __html: invoiceHTML(order) }} />}
        </div>

        <DialogFooter className="gap-2 border-t p-4 sm:gap-2">
          <Button variant="outline" onClick={() => order && printInvoice(order)}>
            <Printer className="size-4" />
            Print
          </Button>
          <Button onClick={() => order && exportPdf(order)}>
            <Download className="size-4" />
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

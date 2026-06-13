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
import type { Payment } from '@/app/admin/payment/data'

const STORE = {
  name: 'My Store',
  address: '123 Commerce Street, Karachi, Pakistan',
  email: 'support@mystore.com',
}

const statusLabels: Record<string, string> = {
  paid: 'Paid', pending: 'Pending', failed: 'Failed', refunded: 'Refunded',
}
const statusPill: Record<string, { fg: string; bg: string }> = {
  paid: { fg: '#047857', bg: '#d1fae5' },
  pending: { fg: '#b45309', bg: '#fef3c7' },
  failed: { fg: '#be123c', bg: '#ffe4e6' },
  refunded: { fg: '#6d28d9', bg: '#ede9fe' },
}

const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function receiptHTML(p: Payment) {
  const pill = statusPill[p.status]
  return `
  <style>
    .rcpt { background:#fff; color:#171717; font-family: ui-sans-serif, system-ui, sans-serif; width:100%; margin:0 auto; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.06); }
    .rcpt * { box-sizing:border-box; }
    .rcpt .head { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; padding:30px 36px; background:linear-gradient(135deg,#0ea5e9 0%,#6d4aff 100%); color:#fff; }
    .rcpt .head h1 { font-size:24px; letter-spacing:.04em; margin:0; font-weight:700; }
    .rcpt .head .sub { font-size:13px; opacity:.9; margin-top:4px; }
    .rcpt .co { text-align:right; font-size:12px; line-height:1.6; opacity:.95; }
    .rcpt .co strong { display:block; font-size:16px; margin-bottom:2px; }
    .rcpt .body { padding:30px 36px; }
    .rcpt .amount { text-align:center; padding:8px 0 24px; border-bottom:1px solid #eee; }
    .rcpt .amount .big { font-size:38px; font-weight:700; letter-spacing:-.02em; }
    .rcpt .amount .pill { display:inline-block; margin-top:8px; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:600; color:${pill.fg}; background:${pill.bg}; }
    .rcpt .grid { display:flex; flex-wrap:wrap; gap:20px 40px; padding:24px 0; border-bottom:1px solid #eee; }
    .rcpt .grid > div { flex:1; min-width:160px; }
    .rcpt .label { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#999; margin-bottom:4px; }
    .rcpt .val { font-weight:600; font-size:14px; }
    .rcpt .muted { color:#666; font-size:13px; }
    .rcpt .split { margin-top:20px; }
    .rcpt .split .row { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; }
    .rcpt .split .muted { color:#888; }
    .rcpt .split .net { border-top:2px solid #eee; margin-top:8px; padding-top:12px; font-weight:700; font-size:16px; }
    .rcpt .foot { margin-top:24px; text-align:center; color:#aaa; font-size:12px; }
  </style>
  <div class="rcpt">
    <div class="head">
      <div>
        <h1>PAYMENT RECEIPT</h1>
        <div class="sub">${p.id}</div>
      </div>
      <div class="co">
        <strong>${STORE.name}</strong>
        ${STORE.address}<br/>
        ${STORE.email}
      </div>
    </div>
    <div class="body">
      <div class="amount">
        <div class="big">${usd(p.amount)}</div>
        <span class="pill">${statusLabels[p.status]}</span>
      </div>

      <div class="grid">
        <div><div class="label">Transaction ID</div><div class="val">${p.id}</div></div>
        <div><div class="label">Order ID</div><div class="val">${p.orderId}</div></div>
        <div><div class="label">Date</div><div class="val">${p.dateLong}</div></div>
      </div>
      <div class="grid">
        <div><div class="label">Customer</div><div class="val">${p.customer}</div><div class="muted">${p.email}</div></div>
        <div><div class="label">Payment Method</div><div class="val">${p.method}</div></div>
        <div><div class="label">Billing Address</div><div class="muted">${p.billingAddress}</div></div>
      </div>

      <div class="split">
        <div class="row"><span class="muted">Gross Amount</span><span>${usd(p.amount)}</span></div>
        <div class="row"><span class="muted">Platform Fee (10%)</span><span>-${usd(p.platformFee)}</span></div>
        <div class="row net"><span>Seller Earnings</span><span>${usd(p.sellerEarnings)}</span></div>
      </div>

      <div class="foot">This is a system-generated receipt from ${STORE.name}.</div>
    </div>
  </div>`
}

export function printReceipt(p: Payment) {
  const w = window.open('', '_blank', 'width=820,height=920')
  if (!w) return
  w.document.write(`<html><head><title>Receipt ${p.id}</title><style>@page{margin:14mm}body{margin:0;background:#fff}</style></head><body onload="window.focus();window.print();">${receiptHTML(p)}</body></html>`)
  w.document.close()
}

export function downloadReceiptPdf(p: Payment) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const M = 40
  const right = 555
  let y = 60

  doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(23)
  doc.text('PAYMENT RECEIPT', M, y)
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(140)
  doc.text(p.id, M, y + 16)

  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(23)
  doc.text(STORE.name, right, y, { align: 'right' })
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(120)
  doc.text(STORE.address, right, y + 14, { align: 'right' })
  doc.text(STORE.email, right, y + 26, { align: 'right' })

  y += 60
  doc.setDrawColor(225).line(M, y, right, y)
  y += 30
  doc.setFont('helvetica', 'bold').setFontSize(30).setTextColor(23)
  doc.text(usd(p.amount), 297, y, { align: 'center' })
  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(110)
  doc.text(statusLabels[p.status], 297, y + 20, { align: 'center' })
  y += 44
  doc.setDrawColor(225).line(M, y, right, y)

  const field = (label: string, value: string, x: number, yy: number) => {
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(150).text(label.toUpperCase(), x, yy)
    doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(30).text(value, x, yy + 14)
  }

  y += 28
  field('Order ID', p.orderId, M, y)
  field('Method', p.method, 230, y)
  field('Date', p.dateLong, 400, y)
  y += 44
  field('Customer', p.customer, M, y)
  field('Email', p.email, 230, y)
  y += 44
  field('Billing Address', p.billingAddress, M, y)

  y += 40
  doc.setDrawColor(225).line(M, y, right, y)
  y += 22
  const lx = 400
  doc.setFontSize(11).setTextColor(120).text('Gross Amount', lx, y, { align: 'right' })
  doc.setTextColor(23).text(usd(p.amount), right, y, { align: 'right' })
  y += 16
  doc.setTextColor(120).text('Platform Fee (10%)', lx, y, { align: 'right' })
  doc.setTextColor(23).text(`-${usd(p.platformFee)}`, right, y, { align: 'right' })
  y += 22
  doc.setFont('helvetica', 'bold').setFontSize(13)
  doc.text('Seller Earnings', lx, y, { align: 'right' })
  doc.text(usd(p.sellerEarnings), right, y, { align: 'right' })

  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(160)
  doc.text(`This is a system-generated receipt from ${STORE.name}.`, 297, 800, { align: 'center' })

  doc.save(`receipt-${p.id}.pdf`)
}

export function ReceiptDialog({
  payment,
  onOpenChange,
}: {
  payment: Payment | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={!!payment} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>Receipt {payment?.id}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto bg-muted/40 p-5">
          {payment && <div dangerouslySetInnerHTML={{ __html: receiptHTML(payment) }} />}
        </div>
        <DialogFooter className="gap-2 border-t p-4 sm:gap-2">
          <Button variant="outline" onClick={() => payment && printReceipt(payment)}>
            <Printer className="size-4" /> Print
          </Button>
          <Button onClick={() => payment && downloadReceiptPdf(payment)}>
            <Download className="size-4" /> Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { jsPDF } from 'jspdf';
import { fmt, fmtDate } from './helpers';

export const generateBill = (order, user) => {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  const W    = doc.internal.pageSize.getWidth();
  const M    = 18;
  let   y    = 0;

  // ── Header band ──────────────────────────────────────────
  doc.setFillColor(26, 58, 107);
  doc.rect(0, 0, W, 42, 'F');
  doc.setFillColor(249, 115, 22);
  doc.rect(0, 42, W, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24); doc.setTextColor(255, 255, 255);
  doc.text('QuickBuy 🛒', M, 18);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 210, 255);
  doc.text('Your trusted shopping destination', M, 26);
  doc.text('support@quickbuy.in  |  +91 98765 43210', M, 33);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(249, 115, 22);
  doc.text('TAX INVOICE', W - M, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.setTextColor(200, 220, 255);
  doc.text(`Order #${order.orderNumber}`, W - M, 24, { align: 'right' });
  doc.text(fmtDate(order.createdAt), W - M, 31, { align: 'right' });

  y = 56;

  // ── Bill-to & Order info boxes ────────────────────────────
  doc.setFillColor(247, 249, 252);
  doc.roundedRect(M, y, (W - M * 2) / 2 - 6, 44, 4, 4, 'F');
  doc.roundedRect(W / 2 + 3, y, (W - M * 2) / 2 - 3, 44, 4, 4, 'F');

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 120, 150);
  doc.text('BILL TO', M + 4, y + 8);
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
  doc.text(order.shippingAddress?.fullName || user?.name || '', M + 4, y + 17);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(70, 90, 120);
  doc.text(order.shippingAddress?.address || '', M + 4, y + 25);
  doc.text(`${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.zipCode}`, M + 4, y + 32);
  doc.text(`Ph: ${order.shippingAddress?.phone}`, M + 4, y + 39);

  const rx = W / 2 + 7;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(100, 120, 150);
  doc.text('ORDER DETAILS', rx, y + 8);
  const rows = [
    ['Order No.', `#${order.orderNumber}`],
    ['Date', fmtDate(order.createdAt)],
    ['Payment', order.paymentMethod],
    ['Status', order.orderStatus],
  ];
  rows.forEach(([k, v], i) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(80, 100, 130);
    doc.text(k, rx, y + 17 + i * 7);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text(v, W - M - 4, y + 17 + i * 7, { align: 'right' });
  });

  y += 54;

  // ── Items table ───────────────────────────────────────────
  doc.setFillColor(26, 58, 107);
  doc.rect(M, y, W - M * 2, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(255, 255, 255);
  doc.text('Product', M + 3, y + 5.5);
  doc.text('Qty', W - 68, y + 5.5);
  doc.text('Unit Price', W - 50, y + 5.5);
  doc.text('Amount', W - M, y + 5.5, { align: 'right' });
  y += 10;

  (order.items || []).forEach((item, idx) => {
    if (idx % 2 === 0) { doc.setFillColor(250, 252, 255); doc.rect(M, y - 3, W - M * 2, 9, 'F'); }
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(20, 30, 50);
    const t = item.title?.length > 52 ? item.title.slice(0, 52) + '…' : item.title;
    doc.text(t, M + 3, y + 3);
    doc.text(String(item.quantity), W - 68, y + 3);
    doc.text(fmt(item.price), W - 50, y + 3);
    doc.text(fmt(item.price * item.quantity), W - M, y + 3, { align: 'right' });
    y += 10;
  });

  y += 4;
  doc.setDrawColor(220, 230, 240); doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 7;

  // ── Totals ────────────────────────────────────────────────
  const tRow = (label, val, bold = false, color = [60, 80, 110]) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 10 : 9); doc.setTextColor(...color);
    doc.text(label, W - 75, y);
    doc.text(val, W - M, y, { align: 'right' });
    y += 7;
  };
  tRow('Subtotal:', fmt(order.subtotal));
  tRow('Shipping & Handling:', order.shippingCost === 0 ? 'FREE' : fmt(order.shippingCost));
  tRow('GST (18%):', fmt(order.tax));
  doc.setDrawColor(26, 58, 107); doc.line(W - 75, y, W - M, y); y += 5;
  tRow('TOTAL AMOUNT:', fmt(order.totalAmount), true, [26, 58, 107]);

  // ── Footer ────────────────────────────────────────────────
  const fY = doc.internal.pageSize.getHeight() - 24;
  doc.setFillColor(247, 249, 252);
  doc.rect(0, fY - 4, W, 30, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(26, 58, 107);
  doc.text('Thank you for shopping with QuickBuy! 🛒', W / 2, fY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 140, 165);
  doc.text('This is a computer-generated invoice. No signature required.', W / 2, fY + 11, { align: 'center' });
  doc.text('For support: support@quickbuy.in | Return policy: 7 days from delivery', W / 2, fY + 17, { align: 'center' });

  doc.save(`QuickBuy-Invoice-${order.orderNumber}.pdf`);
};

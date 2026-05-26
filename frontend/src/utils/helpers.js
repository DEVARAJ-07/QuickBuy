export const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

export const truncate = (s, n = 55) => s?.length > n ? s.slice(0, n) + '...' : (s || '');

export const calcTotals = (items = []) => {
  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
  const tax      = Math.round(subtotal * 0.18);
  const shipping = subtotal >= 999 ? 0 : 99;
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
};

export const statusBadge = (s) => ({
  Pending:    'badge-warning',
  Processing: 'badge-info',
  Shipped:    'badge-primary',
  Delivered:  'badge-success',
  Cancelled:  'badge-error',
}[s] || 'badge-info');

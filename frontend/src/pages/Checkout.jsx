import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../store/slices/orderSlice';
import { clearCart } from '../store/slices/cartSlice';
import { generateBill } from '../utils/pdfBill';
import { fmt, calcTotals } from '../utils/helpers';
import './Checkout.css';

const METHODS = [
  { id:'COD',     icon:'💵', label:'Cash on Delivery' },
  { id:'UPI',     icon:'📱', label:'UPI / Google Pay / PhonePe' },
  { id:'Card',    icon:'💳', label:'Credit / Debit Card' },
  { id:'NetBanking', icon:'🏦', label:'Net Banking' },
];

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items }  = useSelector(s => s.cart);
  const { user }   = useSelector(s => s.auth);
  const { loading } = useSelector(s => s.orders);
  const [method, setMethod] = useState('COD');
  const [placed, setPlaced] = useState(null);
  const [errs,   setErrs]   = useState({});
  const [form,   setForm]   = useState({
    fullName: user?.name || '', phone: user?.phone || '',
    address: '', city: '', state: '', zipCode: '',
  });

  const { subtotal, tax, shipping, total } = calcTotals(items);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) e.phone = 'Enter 10-digit number';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (!form.zipCode.trim() || !/^\d{6}$/.test(form.zipCode)) e.zipCode = '6-digit PIN required';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    const orderData = {
      shippingAddress: form,
      paymentMethod: method,
      items: items.map(i => ({ product: i.product._id, title: i.product.title, image: i.product.images?.[0], price: i.price, quantity: i.quantity })),
      subtotal, tax, shippingCost: shipping,
    };

    const result = await dispatch(placeOrder(orderData));
    if (placeOrder.fulfilled.match(result)) {
      const order = result.payload;
      setPlaced(order);
      dispatch(clearCart());
    }
  };

  const f = (key) => e => setForm(p => ({ ...p, [key]: e.target.value }));

  // ── Success Screen ─────────────────────────────────────────
  if (placed) return (
    <div className="checkout-page page-enter">
      <div className="container">
        <div className="order-success">
          <div className="success-icon">🎉</div>
          <h1>Order Placed Successfully!</h1>
          <p>Your order <strong>#{placed.orderNumber}</strong> has been placed and will be processed soon.</p>
          <div className="success-summary">
            <div><span>Order ID</span><strong>#{placed.orderNumber}</strong></div>
            <div><span>Payment</span><strong>{placed.paymentMethod}</strong></div>
            <div><span>Items</span><strong>{placed.items?.length}</strong></div>
            <div><span>Total</span><strong>{fmt(placed.totalAmount)}</strong></div>
          </div>
          <div className="success-actions">
            <button className="btn btn-primary btn-lg" onClick={() => generateBill(placed, user)} id="download-invoice">
              📄 Download Invoice PDF
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/orders')} id="view-orders">
              📦 View My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="checkout-page page-enter">
      <div className="container">
        <h1 className="sec-title">Checkout</h1>
        <p className="sec-sub" style={{marginBottom:'2rem'}}>Complete your order</p>

        <form className="checkout-layout" onSubmit={handleSubmit}>
          {/* Left */}
          <div className="checkout-left">
            {/* Shipping */}
            <div className="checkout-card">
              <h2 className="checkout-section-title">📦 Shipping Address</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className={`form-input ${errs.fullName?'input-err':''}`} value={form.fullName} onChange={f('fullName')} placeholder="John Doe" id="fullName"/>
                  {errs.fullName && <p className="form-error">{errs.fullName}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input className={`form-input ${errs.phone?'input-err':''}`} value={form.phone} onChange={f('phone')} placeholder="10-digit number" maxLength={10} id="phone"/>
                  {errs.phone && <p className="form-error">{errs.phone}</p>}
                </div>
                <div className="form-group span2">
                  <label className="form-label">Address *</label>
                  <textarea className={`form-input ${errs.address?'input-err':''}`} value={form.address} onChange={f('address')} rows={2} placeholder="House no., Street, Area…" id="address"/>
                  {errs.address && <p className="form-error">{errs.address}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input className={`form-input ${errs.city?'input-err':''}`} value={form.city} onChange={f('city')} placeholder="Mumbai" id="city"/>
                  {errs.city && <p className="form-error">{errs.city}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input className={`form-input ${errs.state?'input-err':''}`} value={form.state} onChange={f('state')} placeholder="Maharashtra" id="state"/>
                  {errs.state && <p className="form-error">{errs.state}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">PIN Code *</label>
                  <input className={`form-input ${errs.zipCode?'input-err':''}`} value={form.zipCode} onChange={f('zipCode')} placeholder="400001" maxLength={6} id="pinCode"/>
                  {errs.zipCode && <p className="form-error">{errs.zipCode}</p>}
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="checkout-card">
              <h2 className="checkout-section-title">💳 Payment Method</h2>
              <div className="payment-methods">
                {METHODS.map(m => (
                  <label key={m.id} className={`payment-method ${method===m.id?'selected':''}`}>
                    <input type="radio" name="payment" value={m.id} checked={method===m.id} onChange={() => setMethod(m.id)} />
                    <span className="method-icon">{m.icon}</span>
                    <span className="method-label">{m.label}</span>
                    {method===m.id && <span className="method-check">✓</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="checkout-right">
            <div className="checkout-card">
              <h2 className="checkout-section-title">🛒 Order Summary</h2>
              <div className="co-items">
                {items.map(i => (
                  <div key={i.product._id} className="co-item">
                    <img src={i.product.images?.[0]} alt={i.product.title} className="co-item-img"
                      onError={e=>e.target.src=`https://picsum.photos/seed/${i.product._id}/50/50`}
                    />
                    <div className="co-item-info">
                      <p className="co-item-name">{i.product.title}</p>
                      <p className="co-item-qty">Qty: {i.quantity}</p>
                    </div>
                    <p className="co-item-price">{fmt(i.price * i.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="divider"/>
              <div className="co-rows">
                <div className="co-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="co-row"><span>GST (18%)</span><span>{fmt(tax)}</span></div>
                <div className="co-row"><span>Shipping</span><span style={{color:shipping===0?'var(--success)':undefined}}>{shipping===0?'FREE':fmt(shipping)}</span></div>
              </div>
              <div className="divider"/>
              <div className="co-total"><span>Total</span><span>{fmt(total)}</span></div>
              <button type="submit" className="btn btn-accent btn-lg btn-full co-submit" disabled={loading} id="place-order-btn">
                {loading ? <span className="spinner spinner-sm"/> : '🎉'} Place Order · {fmt(total)}
              </button>
              <p className="co-secure">🔒 Payments are 100% secure & encrypted</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

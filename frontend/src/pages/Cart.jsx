import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { fetchCart, removeCart, updateCart, clearCart } from '../store/slices/cartSlice';
import { fmt, calcTotals } from '../utils/helpers';
import './Cart.css';

export default function Cart() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items, loading } = useSelector(s => s.cart);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  if (loading) return <div className="loading-box"><div className="spinner"/><p>Loading cart…</p></div>;

  const { subtotal, tax, shipping, total } = calcTotals(items);

  if (items.length === 0) return (
    <div className="cart-page page-enter">
      <div className="container">
        <div className="empty" style={{paddingTop:'4rem'}}>
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add items to your cart to see them here</p>
          <Link to="/products" className="btn btn-primary btn-lg" style={{marginTop:'1.5rem'}}>
            <ShoppingBag size={18}/> Start Shopping
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <div className="cart-head">
          <h1 className="sec-title">My <span>Cart</span></h1>
          <p className="sec-sub">{items.length} item{items.length!==1?'s':''}</p>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map(item => (
              <div key={item.product._id} className="cart-item">
                <Link to={`/products/${item.product._id}`} className="cart-item-img">
                  <img src={item.product.images?.[0]} alt={item.product.title}
                    onError={e=>e.target.src=`https://picsum.photos/seed/${item.product._id}/120/120`}
                  />
                </Link>
                <div className="cart-item-info">
                  <p className="cart-item-brand">{item.product.brand}</p>
                  <Link to={`/products/${item.product._id}`} className="cart-item-title">{item.product.title}</Link>
                  <p className="cart-item-price">{fmt(item.price)}</p>
                </div>
                <div className="cart-item-qty">
                  <button className="qty-btn" onClick={() => dispatch(updateCart({ productId: item.product._id, quantity: Math.max(1, item.quantity - 1) }))} disabled={item.quantity <= 1}><Minus size={14}/></button>
                  <span className="qty-val">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => dispatch(updateCart({ productId: item.product._id, quantity: item.quantity + 1 }))} disabled={item.quantity >= item.product.stock}><Plus size={14}/></button>
                </div>
                <div className="cart-item-total">
                  <p>{fmt(item.price * item.quantity)}</p>
                  <button className="cart-remove" onClick={() => dispatch(removeCart(item.product._id))} title="Remove"><Trash2 size={17}/></button>
                </div>
              </div>
            ))}

            <div className="cart-actions-row">
              <Link to="/products" className="btn btn-ghost btn-sm">← Continue Shopping</Link>
              <button className="btn btn-ghost btn-sm" style={{color:'var(--error)'}} onClick={() => dispatch(clearCart())}>🗑 Clear Cart</button>
            </div>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal ({items.length} items)</span><span>{fmt(subtotal)}</span></div>
              <div className="summary-row"><span>GST (18%)</span><span>{fmt(tax)}</span></div>
              <div className="summary-row">
                <span>Shipping</span>
                <span style={{color:shipping===0?'var(--success)':undefined}}>{shipping === 0 ? '🚚 FREE' : fmt(shipping)}</span>
              </div>
              {shipping > 0 && <p className="free-ship-hint">Add {fmt(999 - subtotal)} more for free shipping</p>}
            </div>
            <div className="divider"/>
            <div className="summary-total"><span>Total Amount</span><span>{fmt(total)}</span></div>
            <p className="summary-tax-note">Inclusive of all taxes</p>
            <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate('/checkout')} id="checkout-btn">
              Proceed to Checkout <ArrowRight size={18}/>
            </button>
            <div className="cart-secure">🔒 100% Secure Checkout · All payment methods accepted</div>
          </div>
        </div>
      </div>
    </div>
  );
}

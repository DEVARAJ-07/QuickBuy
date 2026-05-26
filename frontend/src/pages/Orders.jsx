import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrders, cancelOrder } from '../store/slices/orderSlice';
import { generateBill } from '../utils/pdfBill';
import { fmt, fmtDate, statusBadge } from '../utils/helpers';
import { ChevronDown, ChevronUp, Download, X } from 'lucide-react';
import './Orders.css';

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(s => s.orders);
  const { user } = useSelector(s => s.auth);
  const [open, setOpen] = useState(null);

  useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

  if (loading) return <div className="loading-box"><div className="spinner"/><p>Loading orders…</p></div>;

  if (orders.length === 0) return (
    <div className="orders-page page-enter">
      <div className="container">
        <div className="empty" style={{paddingTop:'4rem'}}>
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Place your first order to see it here</p>
          <Link to="/products" className="btn btn-primary btn-lg" style={{marginTop:'1.5rem'}}>Start Shopping</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="orders-page page-enter">
      <div className="container">
        <div style={{marginBottom:'2rem'}}>
          <h1 className="sec-title">My <span>Orders</span></h1>
          <p className="sec-sub">{orders.length} order{orders.length!==1?'s':''} placed</p>
        </div>

        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header" onClick={() => setOpen(p => p===order._id?null:order._id)}>
                <div className="order-meta">
                  <div>
                    <p className="order-num">Order #{order.orderNumber}</p>
                    <p className="order-date">{fmtDate(order.createdAt)}</p>
                  </div>
                  <span className={`badge ${statusBadge(order.orderStatus)}`}>{order.orderStatus}</span>
                  <div className="order-pay-method">
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="order-total">{fmt(order.totalAmount)}</div>
                </div>
                <div className="order-header-right">
                  <div className="order-preview-imgs">
                    {order.items?.slice(0,3).map((it,i)=>(
                      <img key={i} src={it.image} alt={it.title}
                        className="order-preview-img"
                        onError={e=>e.target.src=`https://picsum.photos/seed/${i}/40/40`}
                      />
                    ))}
                  </div>
                  {open===order._id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
              </div>

              {open===order._id && (
                <div className="order-body">
                  {/* Items */}
                  <div className="order-items">
                    {order.items?.map((item,i)=>(
                      <div key={i} className="order-item">
                        <img src={item.image} alt={item.title} className="oi-img"
                          onError={e=>e.target.src=`https://picsum.photos/seed/${i}/60/60`}
                        />
                        <div className="oi-info">
                          <p className="oi-title">{item.title}</p>
                          <p className="oi-qty">Qty: {item.quantity} × {fmt(item.price)}</p>
                        </div>
                        <p className="oi-total">{fmt(item.price*item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Address + Totals */}
                  <div className="order-detail-grid">
                    <div className="order-address">
                      <h4>📍 Delivery Address</h4>
                      <p>{order.shippingAddress?.fullName}</p>
                      <p>{order.shippingAddress?.address}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}</p>
                      <p>📞 {order.shippingAddress?.phone}</p>
                    </div>
                    <div className="order-totals">
                      <h4>💰 Amount Breakdown</h4>
                      <div className="ot-row"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                      <div className="ot-row"><span>GST (18%)</span><span>{fmt(order.tax)}</span></div>
                      <div className="ot-row"><span>Shipping</span><span>{order.shippingCost===0?'FREE':fmt(order.shippingCost)}</span></div>
                      <div className="ot-row total"><span>Total</span><span>{fmt(order.totalAmount)}</span></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="order-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => generateBill(order, user)} id={`invoice-${order._id}`}>
                      <Download size={15}/> Download Invoice PDF
                    </button>
                    {['Pending','Processing'].includes(order.orderStatus) && (
                      <button className="btn btn-ghost btn-sm" style={{color:'var(--error)',border:'1px solid var(--error)'}}
                        onClick={() => { if(window.confirm('Cancel this order?')) dispatch(cancelOrder(order._id)); }}
                        id={`cancel-${order._id}`}
                      >
                        <X size={15}/> Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

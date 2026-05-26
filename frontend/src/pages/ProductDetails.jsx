import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, Star, ArrowLeft, Shield, Truck, RefreshCw, Share2 } from 'lucide-react';
import { fetchProductById, clearProduct, addReview } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/authSlice';
import { fmt, fmtDate } from '../utils/helpers';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector(s => s.products);
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const [qty,      setQty]      = useState(1);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [tab,      setTab]      = useState('desc');
  const [review,   setReview]   = useState({ rating: 5, comment: '' });
  const [adding,   setAdding]   = useState(false);
  const inWishlist = user?.wishlist?.includes(id);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearProduct());
  }, [id, dispatch]);

  if (loading) return <div className="loading-box"><div className="spinner"/><p>Loading product…</p></div>;
  if (!product) return null;

  const handleAdd = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: qty }));
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await dispatch(addToCart({ productId: product._id, quantity: qty }));
    navigate('/cart');
  };

  const handleReview = async e => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    await dispatch(addReview({ id: product._id, data: review }));
    setReview({ rating: 5, comment: '' });
  };

  const stars = n => Array.from({length:5}, (_,i) => (
    <span key={i} style={{color: i < n ? '#f59e0b' : '#d1d5db', fontSize:'1.1rem'}}>★</span>
  ));

  return (
    <div className="pd-page page-enter">
      <div className="container">
        <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img">
              <img src={product.images?.[imgIdx] || product.images?.[0]}
                alt={product.title}
                onError={e => e.target.src = `https://picsum.photos/seed/${product._id}/500/500`}
              />
              {product.discount > 0 && <div className="pd-disc-badge">{product.discount}% OFF</div>}
            </div>
            {product.images?.length > 1 && (
              <div className="pd-thumbs">
                {product.images.map((img, i) => (
                  <button key={i} className={`pd-thumb ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)}>
                    <img src={img} alt="" onError={e => e.target.src=`https://picsum.photos/seed/${i}/80/80`}/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <div className="pd-brand">{product.brand}</div>
            <h1 className="pd-title">{product.title}</h1>

            <div className="pd-meta">
              <div className="pd-stars">{stars(Math.round(product.rating))}</div>
              <span className="pd-rat-val">{product.rating}</span>
              <span className="pd-reviews">({product.numReviews?.toLocaleString()} reviews)</span>
              {product.isTrending && <span className="badge badge-accent">🔥 Trending</span>}
            </div>

            <div className="pd-price-row">
              <span className="price" style={{fontSize:'1.8rem'}}>{fmt(product.price)}</span>
              {product.originalPrice > product.price && <>
                <span className="price-old" style={{fontSize:'1rem'}}>{fmt(product.originalPrice)}</span>
                <span className="price-off">Save {fmt(product.originalPrice - product.price)}</span>
              </>}
            </div>

            <p className="pd-stock">
              {product.stock > 10 ? <span style={{color:'var(--success)'}}>✅ In Stock</span>
               : product.stock > 0  ? <span style={{color:'var(--warning)'}}>⚠️ Only {product.stock} left!</span>
               : <span style={{color:'var(--error)'}}>❌ Out of Stock</span>}
            </p>

            {/* Qty */}
            <div className="pd-qty">
              <label className="filter-label">Quantity</label>
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => setQty(q=>Math.max(1,q-1))}>−</button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q=>Math.min(product.stock,q+1))}>+</button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pd-actions">
              <button className="btn btn-primary btn-lg" onClick={handleAdd} disabled={adding||!product.stock} id="pd-add-cart">
                {adding ? <span className="spinner spinner-sm"/> : <ShoppingCart size={20}/>}
                Add to Cart
              </button>
              <button className="btn btn-accent btn-lg" onClick={handleBuyNow} disabled={!product.stock} id="pd-buy-now">
                Buy Now
              </button>
              <button className={`pd-wish-btn ${inWishlist?'active':''}`} onClick={() => isAuthenticated ? dispatch(toggleWishlist(product._id)) : navigate('/login')} title="Wishlist">
                <Heart size={20} fill={inWishlist?'currentColor':'none'}/>
              </button>
            </div>

            {/* Guarantees */}
            <div className="pd-guarantees">
              {[
                [<Truck size={16}/>, 'Free delivery on orders above ₹999'],
                [<Shield size={16}/>, '1-year brand warranty'],
                [<RefreshCw size={16}/>, '7-day easy returns'],
              ].map(([ic, text], i) => (
                <div key={i} className="guarantee-item">{ic}<span>{text}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pd-tabs-section">
          <div className="pd-tabs">
            {[['desc','Description'],['specs','Specifications'],['reviews','Reviews']].map(([k,l]) => (
              <button key={k} className={`pd-tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === 'desc' && (
            <div className="tab-panel">
              <p>{product.description}</p>
              {product.tags?.length > 0 && (
                <div className="pd-tags">
                  {product.tags.map(t => <span key={t} className="pd-tag">#{t}</span>)}
                </div>
              )}
            </div>
          )}

          {tab === 'specs' && (
            <div className="tab-panel">
              <table className="specs-table">
                <tbody>
                  {[['Brand',product.brand],['Category',product.category],['Stock',`${product.stock} units`],['Rating',`${product.rating}/5 ★`],['Reviews',product.numReviews?.toLocaleString()]].map(([k,v])=>(
                    <tr key={k}><th>{k}</th><td>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="tab-panel">
              {/* Write review */}
              {isAuthenticated ? (
                <form className="review-form" onSubmit={handleReview}>
                  <h3>Write a Review</h3>
                  <div className="form-group">
                    <label className="form-label">Your Rating</label>
                    <select className="form-input" value={review.rating} onChange={e => setReview(p=>({...p,rating:+e.target.value}))}>
                      {[5,4,3,2,1].map(n=><option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Comment</label>
                    <textarea className="form-input" rows={3} value={review.comment} onChange={e=>setReview(p=>({...p,comment:e.target.value}))} required placeholder="Share your experience…"/>
                  </div>
                  <button type="submit" className="btn btn-primary" id="submit-review">Submit Review</button>
                </form>
              ) : (
                <div className="review-login"><Link to="/login" className="btn btn-outline">Login to write a review</Link></div>
              )}

              {/* Reviews List */}
              {product.reviews?.length === 0 ? (
                <p style={{color:'var(--text-3)',marginTop:'1.5rem'}}>No reviews yet. Be the first!</p>
              ) : (
                <div className="reviews-list">
                  {product.reviews.map(r => (
                    <div key={r._id} className="review-item">
                      <div className="review-header">
                        <div className="review-avatar">{r.name?.[0]}</div>
                        <div>
                          <p className="review-name">{r.name}</p>
                          <p className="review-date">{fmtDate(r.createdAt)}</p>
                        </div>
                        <div className="review-stars">{stars(r.rating)}</div>
                      </div>
                      <p className="review-comment">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

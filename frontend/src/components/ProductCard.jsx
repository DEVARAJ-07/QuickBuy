import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/authSlice';
import { fmt, truncate } from '../utils/helpers';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const [adding, setAdding] = useState(false);
  const inWishlist = user?.wishlist?.includes(product._id);

  const handleAdd = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    setAdding(false);
  };

  const handleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    dispatch(toggleWishlist(product._id));
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating) ? '★' : '☆');

  return (
    <div className="pcard">
      <Link to={`/products/${product._id}`} className="pcard-link">
        {/* Image */}
        <div className="pcard-img-wrap">
          <img src={product.images?.[0]} alt={product.title} className="pcard-img"
            onError={e => { e.target.src = `https://picsum.photos/seed/${product._id}/400/400` }}
          />
          {/* Discount badge */}
          {product.discount > 0 && (
            <span className="pcard-discount">{product.discount}% OFF</span>
          )}
          {/* Badges */}
          <div className="pcard-badges">
            {product.isTrending  && <span className="badge badge-accent">🔥 Trending</span>}
            {product.stock < 10  && product.stock > 0 && <span className="badge badge-error">Only {product.stock} left</span>}
            {product.stock === 0 && <span className="badge badge-error">Out of Stock</span>}
          </div>
          {/* Hover overlay */}
          <div className="pcard-overlay">
            <Link to={`/products/${product._id}`} className="overlay-btn" onClick={e => e.stopPropagation()}>
              <Eye size={16} /> Quick View
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="pcard-info">
          <p className="pcard-brand">{product.brand}</p>
          <h3 className="pcard-title">{truncate(product.title, 50)}</h3>
          <div className="pcard-rating">
            <span className="pcard-stars">{stars.join('')}</span>
            <span className="pcard-rating-val">{product.rating}</span>
            <span className="pcard-reviews">({product.numReviews?.toLocaleString()})</span>
          </div>
          <div className="pcard-price-row">
            <span className="price">{fmt(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="price-old">{fmt(product.originalPrice)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="pcard-actions">
        <button
          className={`btn btn-primary btn-sm pcard-add ${adding ? 'loading' : ''}`}
          onClick={handleAdd} disabled={adding || product.stock === 0} id={`add-${product._id}`}
        >
          {adding ? <span className="spinner spinner-sm" /> : <ShoppingCart size={15} />}
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button
          className={`pcard-wish ${inWishlist ? 'wished' : ''}`}
          onClick={handleWish} title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          id={`wish-${product._id}`}
        >
          <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Zap, Shield, Truck, HeadphonesIcon, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import './Home.css';

const SLIDES = [
  {
    title: 'Latest iPhones', subtitle: 'Up to 15% OFF', tag: '🔥 New Arrival',
    img: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&q=80',
    bg: 'linear-gradient(135deg,#1a3a6b 0%,#0f2447 100%)', link: '/products?category=Phones',
  },
  {
    title: 'Gaming Laptops', subtitle: 'Starts ₹89,990', tag: '⚡ Best Deals',
    img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=700&q=80',
    bg: 'linear-gradient(135deg,#7c3aed 0%,#3730a3 100%)', link: '/products?category=Laptops',
  },
  {
    title: 'Premium Audio', subtitle: 'Sony WH-1000XM5', tag: '🎵 Top Rated',
    img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=700&q=80',
    bg: 'linear-gradient(135deg,#064e3b 0%,#065f46 100%)', link: '/products?category=Audio',
  },
  {
    title: 'Fashion Picks', subtitle: 'Trendy & Affordable', tag: '👗 Hot Styles',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
    bg: 'linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)', link: '/products?category=Fashion',
  },
];

const CATS = [
  { name: 'Phones',      icon: '📱', color: '#3b82f6' },
  { name: 'Laptops',     icon: '💻', color: '#8b5cf6' },
  { name: 'Audio',       icon: '🎧', color: '#10b981' },
  { name: 'Wearables',   icon: '⌚', color: '#f59e0b' },
  { name: 'Gaming',      icon: '🎮', color: '#ef4444' },
  { name: 'Cameras',     icon: '📷', color: '#ec4899' },
  { name: 'Electronics', icon: '🖥️', color: '#06b6d4' },
  { name: 'Fashion',     icon: '👟', color: '#f97316' },
  { name: 'Books',       icon: '📚', color: '#84cc16' },
  { name: 'Home',        icon: '🏠', color: '#a78bfa' },
  { name: 'Tablets',     icon: '📱', color: '#fb923c' },
  { name: 'Storage',     icon: '💾', color: '#38bdf8' },
];

const FEATURES = [
  { icon: <Truck size={28} />, title: 'Free Delivery', desc: 'On orders above ₹999 across India', color: '#3b82f6' },
  { icon: <Shield size={28} />, title: '100% Authentic', desc: 'All products are genuine & warranted', color: '#10b981' },
  { icon: <Zap size={28} />, title: '24hr Dispatch', desc: 'Same-day dispatch for in-stock items', color: '#f97316' },
  { icon: <HeadphonesIcon size={28} />, title: '24/7 Support', desc: 'Dedicated customer care anytime', color: '#8b5cf6' },
];

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: featured, loading } = useSelector(s => s.products);
  const [slide,  setSlide]  = useState(0);
  const [search, setSearch] = useState('');
  const timerRef = useRef();

  useEffect(() => {
    dispatch(fetchProducts({ featured: true, limit: 8 }));
  }, [dispatch]);

  useEffect(() => {
    timerRef.current = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 4500);
    return () => clearInterval(timerRef.current);
  }, []);

  const nextSlide = () => { clearInterval(timerRef.current); setSlide(p => (p + 1) % SLIDES.length) };
  const prevSlide = () => { clearInterval(timerRef.current); setSlide(p => (p - 1 + SLIDES.length) % SLIDES.length) };

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const cur = SLIDES[slide];

  return (
    <div className="home page-enter">

      {/* ── Hero Slider ─────────────────────────────────────── */}
      <section className="hero" style={{ background: cur.bg }}>
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-tag">{cur.tag}</span>
            <h1 className="hero-title">{cur.title}</h1>
            <p className="hero-sub">{cur.subtitle}</p>
            <div className="hero-actions">
              <Link to={cur.link} className="btn btn-accent btn-lg">Shop Now <ArrowRight size={18} /></Link>
              <Link to="/products" className="btn btn-ghost btn-lg" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.4)', border: '2px solid' }}>
                All Products
              </Link>
            </div>
          </div>
          <div className="hero-img-wrap">
            <img key={slide} src={cur.img} alt={cur.title} className="hero-img" />
          </div>
        </div>

        {/* Slider controls */}
        <button className="slide-btn slide-prev" onClick={prevSlide}><ChevronLeft size={22} /></button>
        <button className="slide-btn slide-next" onClick={nextSlide}><ChevronRight size={22} /></button>
        <div className="slide-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`dot ${i === slide ? 'active' : ''}`}
              onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* ── Search Bar ──────────────────────────────────────── */}
      <section className="home-search-section">
        <div className="container">
          <form className="home-search" onSubmit={handleSearch}>
            <span className="home-search-icon">🔍</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for iPhone, headphones, shoes, books…"
              className="home-search-input" id="home-search"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="home-features">
        <div className="container">
          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon" style={{ background: f.color + '18', color: f.color }}>{f.icon}</div>
                <div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────── */}
      <section className="home-section">
        <div className="container">
          <div className="home-sec-head">
            <h2 className="sec-title">Shop by <span>Category</span></h2>
            <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="cats-row">
            {CATS.map(c => (
              <Link key={c.name} to={`/products?category=${c.name}`} className="cat-chip">
                <div className="cat-chip-icon" style={{ background: c.color + '18', color: c.color }}>{c.icon}</div>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ────────────────────────────────── */}
      <section className="home-section home-featured">
        <div className="container">
          <div className="home-sec-head">
            <h2 className="sec-title">⭐ Featured <span>Products</span></h2>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm">See All</Link>
          </div>
          {loading ? (
            <div className="products-grid">
              {Array.from({length:8}).map((_,i) => (
                <div key={i} className="pcard-skeleton">
                  <div className="skeleton" style={{height:'200px'}} />
                  <div style={{padding:'1rem', display:'flex', flexDirection:'column', gap:'.5rem'}}>
                    <div className="skeleton" style={{height:'14px', width:'60%'}} />
                    <div className="skeleton" style={{height:'18px'}} />
                    <div className="skeleton" style={{height:'14px', width:'80%'}} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Promo Banner ─────────────────────────────────────── */}
      <section className="promo-banner">
        <div className="container">
          <div className="promo-inner">
            <div className="promo-text">
              <p className="promo-eyebrow">🎁 Special Offer</p>
              <h2>Get <span>18% OFF</span> on your first order!</h2>
              <p>Use code <code>QUICKBUY18</code> at checkout. Valid on all categories.</p>
              <Link to="/signup" className="btn btn-accent btn-lg" style={{marginTop:'1rem'}}>Create Account & Save</Link>
            </div>
            <div className="promo-img-col">
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80" alt="Shopping" className="promo-img" />
            </div>
          </div>
        </div>
      </section>

      {/* ── About / Stats ────────────────────────────────────── */}
      <section className="home-section home-about">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="sec-title">Why <span>QuickBuy</span>?</h2>
              <p className="sec-sub">India's most trusted e-commerce platform for premium electronics, fashion, and lifestyle products at unbeatable prices.</p>
              <ul className="about-list">
                {['30+ premium product categories','Genuine brands with full warranty','Express delivery across 500+ cities','Easy 7-day returns & refunds','Secure payment with 5 methods'].map(i => (
                  <li key={i}><span>✅</span> {i}</li>
                ))}
              </ul>
              <Link to="/products" className="btn btn-primary btn-lg" style={{marginTop:'1.5rem'}}>
                Start Shopping <ArrowRight size={18} />
              </Link>
            </div>
            <div className="about-stats">
              {[['1M+','Happy Customers'],['30+','Product Categories'],['500+','Cities Served'],['4.8★','Average Rating']].map(([v,l]) => (
                <div key={l} className="stat-box">
                  <div className="stat-val">{v}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">⚡ Quick<span>Buy</span></div>
              <p>Your one-stop shop for everything premium. Fast delivery, genuine products, best prices.</p>
              <div className="footer-socials">
                {['Facebook','Twitter','Instagram','YouTube'].map(s => (
                  <a key={s} href="#" className="social-link" aria-label={s}>{s[0]}</a>
                ))}
              </div>
            </div>
            {[
              { title: 'Quick Links', links: [['Home','/'],['Products','/products'],['Cart','/cart'],['Orders','/orders'],['Profile','/profile']] },
              { title: 'Categories', links: [['Phones','/products?category=Phones'],['Laptops','/products?category=Laptops'],['Audio','/products?category=Audio'],['Gaming','/products?category=Gaming'],['Fashion','/products?category=Fashion']] },
              { title: 'Contact', links: [['📍 Bangalore, India','#'],['📞 +91 98765 43210','#'],['✉️ support@quickbuy.in','#'],['🕐 Mon-Sat: 9AM–9PM','#']] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="footer-heading">{col.title}</h4>
                <ul className="footer-links">
                  {col.links.map(([text, href]) => <li key={text}><Link to={href}>{text}</Link></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} QuickBuy. All rights reserved. Made with ❤️ in India</p>
            <div className="footer-pay">🔒 SSL Secured &nbsp; 💳 All Payment Methods Accepted</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

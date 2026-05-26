import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Search, User, LogOut, Package, Heart, ChevronDown, Menu, X, Zap } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { selectCartCount } from '../store/slices/cartSlice';
import './Navbar.css';

const CATS = ['Phones','Laptops','Audio','Wearables','Tablets','Cameras','Gaming','Electronics','Fashion','Home','Books','Storage'];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const cartCount = useSelector(selectCartCount);

  const [scrolled,  setScrolled]  = useState(false);
  const [mobileOpen, setMobile]   = useState(false);
  const [catOpen,    setCatOpen]   = useState(false);
  const [userOpen,   setUserOpen]  = useState(false);
  const [search,     setSearch]    = useState('');
  const catRef  = useRef(); const userRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = e => {
      if (catRef.current  && !catRef.current.contains(e.target))  setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) { navigate(`/products?search=${encodeURIComponent(search.trim())}`); setSearch(''); setMobile(false); }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={() => setMobile(false)}>
          <div className="nav-logo-icon"><Zap size={16} /></div>
          Quick<span>Buy</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="nav-links">
          <NavLink to="/"        className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end>Home</NavLink>

          {/* Categories Dropdown */}
          <div className="nav-dropdown" ref={catRef}>
            <button className="nav-link nav-drop-btn" onClick={() => setCatOpen(p => !p)}>
              Categories <ChevronDown size={14} className={catOpen ? 'rotated' : ''} />
            </button>
            {catOpen && (
              <div className="dropdown-menu cats-grid">
                {CATS.map(c => (
                  <Link key={c} to={`/products?category=${c}`} className="dropdown-item"
                    onClick={() => { setCatOpen(false); setMobile(false); }}>
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/products" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Products</NavLink>
        </nav>

        {/* Search */}
        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products…" className="nav-search-input" id="nav-search"
          />
          <button type="submit" className="nav-search-btn"><Search size={16} /></button>
        </form>

        {/* Right Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="nav-icon-btn" id="cart-btn">
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount > 9 ? '9+' : cartCount}</span>}
              </Link>
              <div className="nav-dropdown" ref={userRef}>
                <button className="nav-user-btn" onClick={() => setUserOpen(p => !p)} id="user-menu-btn">
                  {user?.profileImage
                    ? <img src={`http://localhost:5000${user.profileImage}`} alt={user.name} className="nav-avatar" />
                    : <div className="nav-avatar-fallback">{user?.name?.charAt(0).toUpperCase()}</div>
                  }
                  <ChevronDown size={13} className={userOpen ? 'rotated' : ''} />
                </button>
                {userOpen && (
                  <div className="dropdown-menu user-menu">
                    <div className="user-menu-header">
                      <p className="user-menu-name">{user?.name}</p>
                      <p className="user-menu-email">{user?.email}</p>
                    </div>
                    <div className="divider" style={{margin:'0.5rem 0'}} />
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserOpen(false)}><User size={15} /> Profile</Link>
                    <Link to="/orders"  className="dropdown-item" onClick={() => setUserOpen(false)}><Package size={15} /> My Orders</Link>
                    <div className="divider" style={{margin:'0.5rem 0'}} />
                    <button className="dropdown-item danger" onClick={() => { dispatch(logout()); setUserOpen(false); navigate('/'); }}><LogOut size={15} /> Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"  className="btn btn-ghost btn-sm" id="login-btn">Login</Link>
              <Link to="/signup" className="btn btn-accent btn-sm" id="signup-btn">Sign Up</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="mobile-toggle" onClick={() => setMobile(p => !p)} id="mobile-menu-btn">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="form-input" />
            <button type="submit" className="btn btn-primary"><Search size={16} /></button>
          </form>
          <Link to="/"         className="mobile-link" onClick={() => setMobile(false)}>🏠 Home</Link>
          <Link to="/products" className="mobile-link" onClick={() => setMobile(false)}>🛍️ Products</Link>
          {CATS.map(c => (
            <Link key={c} to={`/products?category=${c}`} className="mobile-link mobile-cat" onClick={() => setMobile(false)}>{c}</Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/cart"    className="mobile-link" onClick={() => setMobile(false)}>🛒 Cart {cartCount > 0 && `(${cartCount})`}</Link>
              <Link to="/orders"  className="mobile-link" onClick={() => setMobile(false)}>📦 My Orders</Link>
              <Link to="/profile" className="mobile-link" onClick={() => setMobile(false)}>👤 Profile</Link>
              <button className="mobile-link danger" onClick={() => { dispatch(logout()); setMobile(false); navigate('/'); }}>🚪 Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"  className="mobile-link" onClick={() => setMobile(false)}>🔑 Login</Link>
              <Link to="/signup" className="mobile-link" onClick={() => setMobile(false)}>✨ Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

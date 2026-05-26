import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts, setFilters, resetFilters } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import './Products.css';

const CATS = ['Phones','Laptops','Audio','Wearables','Tablets','Cameras','Gaming','Electronics','Fashion','Home','Books','Storage'];
const SORTS = [['newest','Newest First'],['price_asc','Price: Low → High'],['price_desc','Price: High → Low'],['rating','Top Rated']];

export default function Products() {
  const dispatch = useDispatch();
  const [sp] = useSearchParams();
  const { items, total, pages, loading, filters } = useSelector(s => s.products);
  const [page, setPage] = useState(1);
  const [sidebar, setSidebar] = useState(false);
  const [localFilters, setLocal] = useState({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' });

  // Sync URL params
  useEffect(() => {
    const cat = sp.get('category') || '';
    const q   = sp.get('search') || '';
    const f   = { ...localFilters, category: cat, search: q };
    setLocal(f);
    setPage(1);
    dispatch(fetchProducts({ ...f, page: 1, limit: 12 }));
  }, [sp.get('category'), sp.get('search')]);

  const applyFilters = (f = localFilters, pg = 1) => {
    setPage(pg);
    dispatch(fetchProducts({ ...f, page: pg, limit: 12 }));
    setSidebar(false);
  };

  const handleChange = key => e => setLocal(p => ({ ...p, [key]: e.target.value }));

  const handleReset = () => {
    const f = { search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' };
    setLocal(f);
    applyFilters(f, 1);
  };

  const handleSearch = e => {
    e.preventDefault();
    applyFilters(localFilters, 1);
  };

  return (
    <div className="products-page page-enter">
      <div className="container">
        {/* Header */}
        <div className="prod-page-head">
          <div>
            <h1 className="sec-title">Our <span>Products</span></h1>
            <p className="sec-sub">{total} products found</p>
          </div>
          <div className="prod-head-actions">
            <select className="form-input prod-sort" value={localFilters.sort} onChange={e => { const f={...localFilters,sort:e.target.value}; setLocal(f); applyFilters(f,1); }}>
              {SORTS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <button className="btn btn-outline btn-sm" onClick={() => setSidebar(p=>!p)} id="filter-btn">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="prod-layout">
          {/* Sidebar */}
          <aside className={`prod-sidebar ${sidebar ? 'open' : ''}`}>
            <div className="sidebar-head">
              <h3>Filters</h3>
              <div style={{display:'flex',gap:'.5rem'}}>
                <button className="btn btn-ghost btn-sm" onClick={handleReset}>Reset</button>
                <button className="sidebar-close" onClick={() => setSidebar(false)}><X size={18} /></button>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="filter-group">
              <label className="filter-label">Search</label>
              <div style={{display:'flex',gap:'.5rem'}}>
                <input className="form-input" placeholder="Product name…" value={localFilters.search} onChange={handleChange('search')} />
                <button type="submit" className="btn btn-primary btn-sm"><Search size={15}/></button>
              </div>
            </form>

            {/* Category */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <div className="filter-cats">
                <button className={`fcat ${!localFilters.category ? 'active' : ''}`} onClick={() => { const f={...localFilters,category:''}; setLocal(f); applyFilters(f,1); }}>All</button>
                {CATS.map(c => (
                  <button key={c} className={`fcat ${localFilters.category===c ? 'active' : ''}`}
                    onClick={() => { const f={...localFilters,category:c}; setLocal(f); applyFilters(f,1); }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-group">
              <label className="filter-label">Price Range (₹)</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem'}}>
                <input className="form-input" type="number" placeholder="Min" value={localFilters.minPrice} onChange={handleChange('minPrice')} />
                <input className="form-input" type="number" placeholder="Max" value={localFilters.maxPrice} onChange={handleChange('maxPrice')} />
              </div>
              <button className="btn btn-primary btn-sm btn-full" style={{marginTop:'.5rem'}} onClick={() => applyFilters(localFilters,1)}>Apply Price</button>
            </div>
          </aside>

          {/* Grid */}
          <div className="prod-main">
            {loading ? (
              <div className="products-grid">
                {Array.from({length:12}).map((_,i)=>(
                  <div key={i} style={{background:'var(--bg-card)',borderRadius:'var(--radius)',overflow:'hidden',border:'1px solid var(--border)'}}>
                    <div className="skeleton" style={{height:'200px'}}/>
                    <div style={{padding:'1rem',display:'flex',flexDirection:'column',gap:'.5rem'}}>
                      <div className="skeleton" style={{height:'12px',width:'50%'}}/>
                      <div className="skeleton" style={{height:'16px'}}/>
                      <div className="skeleton" style={{height:'14px',width:'70%'}}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try different search terms or reset filters</p>
                <button className="btn btn-primary" onClick={handleReset}>Reset Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {items.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="pagination">
                    <button className="btn btn-ghost btn-sm" disabled={page===1} onClick={() => applyFilters(localFilters, page-1)}>
                      <ChevronLeft size={16}/> Prev
                    </button>
                    <div className="page-nums">
                      {Array.from({length:pages},(_,i)=>i+1).map(n=>(
                        <button key={n} className={`page-num ${n===page?'active':''}`} onClick={() => applyFilters(localFilters,n)}>{n}</button>
                      ))}
                    </div>
                    <button className="btn btn-ghost btn-sm" disabled={page===pages} onClick={() => applyFilters(localFilters, page+1)}>
                      Next <ChevronRight size={16}/>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

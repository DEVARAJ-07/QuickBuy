require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'quickbuy_secret_2024';

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Multer for profile image ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─────────────────────────────────────────────────────────────────────────────
//  IN-MEMORY DATA STORE
// ─────────────────────────────────────────────────────────────────────────────
let users = [];
let carts = {};   // { userId: [{ productId, quantity }] }
let orders = [];  // all orders
let orderCounter = 1000;

// ── 30 Products with real Unsplash images + INR prices ────────────────────────
const products = [
  {
    _id: 'p1', title: 'iPhone 15 Pro Max 256GB', category: 'Phones', brand: 'Apple',
    description: 'A17 Pro chip, titanium design, 48MP ProCamera, USB-C, Action button, and all-day battery life.',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80'],
    price: 134900, originalPrice: 149900, discount: 10, rating: 4.8, numReviews: 2847, stock: 50,
    isFeatured: true, isTrending: true, reviews: [],
  },
  {
    _id: 'p2', title: 'Samsung Galaxy S24 Ultra', category: 'Phones', brand: 'Samsung',
    description: '200MP camera, built-in S Pen, Snapdragon 8 Gen 3, 5000mAh, AI-powered features.',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80'],
    price: 124999, originalPrice: 134999, discount: 7, rating: 4.7, numReviews: 1923, stock: 35,
    isFeatured: true, isTrending: false, reviews: [],
  },
  {
    _id: 'p3', title: 'OnePlus 12 5G', category: 'Phones', brand: 'OnePlus',
    description: 'Snapdragon 8 Gen 3, Hasselblad camera, 100W SUPERVOOC, 6.82" AMOLED 120Hz display.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'],
    price: 64999, originalPrice: 69999, discount: 7, rating: 4.6, numReviews: 1456, stock: 60,
    isFeatured: false, isTrending: true, reviews: [],
  },
  {
    _id: 'p4', title: 'MacBook Pro 16" M3 Pro', category: 'Laptops', brand: 'Apple',
    description: 'M3 Pro chip, 18GB RAM, 512GB SSD, Liquid Retina XDR display, 22-hour battery.',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80'],
    price: 249900, originalPrice: 269900, discount: 7, rating: 4.9, numReviews: 1456, stock: 20,
    isFeatured: true, isTrending: true, reviews: [],
  },
  {
    _id: 'p5', title: 'Dell XPS 15 OLED', category: 'Laptops', brand: 'Dell',
    description: 'Intel Core i9, 32GB RAM, 1TB SSD, 3.5K OLED InfinityEdge display, RTX 4070.',
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80'],
    price: 189990, originalPrice: 209990, discount: 10, rating: 4.7, numReviews: 876, stock: 15,
    isFeatured: true, isTrending: false, reviews: [],
  },
  {
    _id: 'p6', title: 'ASUS ROG Zephyrus G14', category: 'Laptops', brand: 'ASUS',
    description: 'AMD Ryzen 9, RTX 4060, 16GB RAM, 1TB SSD, 14" QHD 165Hz, AniMe Matrix LED.',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80'],
    price: 149990, originalPrice: 164990, discount: 9, rating: 4.6, numReviews: 654, stock: 25,
    isFeatured: false, isTrending: true, reviews: [],
  },
  {
    _id: 'p7', title: 'Sony WH-1000XM5 Headphones', category: 'Audio', brand: 'Sony',
    description: 'Industry-leading noise cancellation, 30-hour battery, multipoint connection, premium sound.',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80'],
    price: 29990, originalPrice: 34990, discount: 14, rating: 4.7, numReviews: 3241, stock: 80,
    isFeatured: true, isTrending: true, reviews: [],
  },
  {
    _id: 'p8', title: 'Apple AirPods Pro (2nd Gen)', category: 'Audio', brand: 'Apple',
    description: 'Active Noise Cancellation, Transparency mode, Adaptive Audio, 30-hour total battery.',
    images: ['https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600&q=80'],
    price: 24900, originalPrice: 26900, discount: 7, rating: 4.7, numReviews: 7842, stock: 70,
    isFeatured: true, isTrending: true, reviews: [],
  },
  {
    _id: 'p9', title: 'JBL Flip 6 Bluetooth Speaker', category: 'Audio', brand: 'JBL',
    description: 'IP67 waterproof, 12-hour battery, PartyBoost, powerful stereo sound, USB-C charging.',
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80'],
    price: 9999, originalPrice: 12999, discount: 23, rating: 4.6, numReviews: 5621, stock: 95,
    isFeatured: false, isTrending: true, reviews: [],
  },
  {
    _id: 'p10', title: 'Apple Watch Series 9 (45mm)', category: 'Wearables', brand: 'Apple',
    description: 'S9 chip, Double Tap, Always-On Retina, crash detection, advanced health sensors.',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
    price: 44900, originalPrice: 49900, discount: 10, rating: 4.6, numReviews: 2103, stock: 45,
    isFeatured: true, isTrending: false, reviews: [],
  },
  {
    _id: 'p11', title: 'Samsung Galaxy Watch 6 Classic', category: 'Wearables', brand: 'Samsung',
    description: 'Rotating bezel, sapphire crystal glass, BioActive sensor, sleep coaching, 40hr battery.',
    images: ['https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80'],
    price: 34999, originalPrice: 41999, discount: 17, rating: 4.5, numReviews: 1234, stock: 55,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p12', title: 'iPad Pro 12.9" M2 WiFi', category: 'Tablets', brand: 'Apple',
    description: 'M2 chip, Liquid Retina XDR, Apple Pencil hover, Wi-Fi 6E, Thunderbolt 4.',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80'],
    price: 109900, originalPrice: 119900, discount: 8, rating: 4.8, numReviews: 987, stock: 25,
    isFeatured: true, isTrending: false, reviews: [],
  },
  {
    _id: 'p13', title: 'Sony A7 IV Mirrorless Camera', category: 'Cameras', brand: 'Sony',
    description: '33MP BSI sensor, 4K 60p video, real-time tracking, 10fps burst, 5-axis stabilization.',
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80'],
    price: 199990, originalPrice: 219990, discount: 9, rating: 4.9, numReviews: 654, stock: 15,
    isFeatured: true, isTrending: false, reviews: [],
  },
  {
    _id: 'p14', title: 'GoPro Hero 12 Black', category: 'Cameras', brand: 'GoPro',
    description: '5.3K video, HyperSmooth 6.0, HDR video, TimeWarp 3.0, waterproof to 10m.',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'],
    price: 39500, originalPrice: 45500, discount: 13, rating: 4.6, numReviews: 2341, stock: 40,
    isFeatured: false, isTrending: true, reviews: [],
  },
  {
    _id: 'p15', title: 'PS5 Gaming Console', category: 'Gaming', brand: 'Sony',
    description: 'Ultra-high speed SSD, 4K gaming at 120fps, DualSense haptic feedback, ray tracing.',
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80'],
    price: 54990, originalPrice: 59990, discount: 8, rating: 4.9, numReviews: 8765, stock: 10,
    isFeatured: true, isTrending: true, reviews: [],
  },
  {
    _id: 'p16', title: 'Logitech MX Master 3S Mouse', category: 'Gaming', brand: 'Logitech',
    description: '8K DPI, MagSpeed scrolling, ergonomic, multi-device, USB-C, 70-day battery.',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'],
    price: 9995, originalPrice: 11995, discount: 17, rating: 4.8, numReviews: 4502, stock: 120,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p17', title: 'LG 4K OLED TV 55" C3', category: 'Electronics', brand: 'LG',
    description: 'OLED evo panel, α9 AI processor, Dolby Vision IQ, HDMI 2.1, 120Hz, webOS 23.',
    images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80'],
    price: 129990, originalPrice: 154990, discount: 16, rating: 4.8, numReviews: 2341, stock: 12,
    isFeatured: true, isTrending: false, reviews: [],
  },
  {
    _id: 'p18', title: 'Dell 27" 4K USB-C Monitor', category: 'Electronics', brand: 'Dell',
    description: '4K IPS, 100% sRGB, 5ms, USB-C 90W, height-adjustable, flicker-free.',
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80'],
    price: 39990, originalPrice: 49990, discount: 20, rating: 4.6, numReviews: 1234, stock: 30,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p19', title: 'Samsung 1TB NVMe SSD 970 EVO', category: 'Storage', brand: 'Samsung',
    description: '3500MB/s read, V-NAND, thermal design, 5-year warranty, M.2 form factor.',
    images: ['https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=600&q=80'],
    price: 7999, originalPrice: 10999, discount: 27, rating: 4.8, numReviews: 12453, stock: 150,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p20', title: 'Anker 26800mAh 65W Power Bank', category: 'Electronics', brand: 'Anker',
    description: '65W USB-C PD, dual USB-A, LED display, recharges MacBook Pro fully twice.',
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80'],
    price: 4999, originalPrice: 6999, discount: 29, rating: 4.7, numReviews: 8934, stock: 200,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p21', title: 'Nike Air Max 270 React', category: 'Fashion', brand: 'Nike',
    description: 'Largest Air unit in heel history, React foam midsole, breathable mesh upper, all-day comfort.',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    price: 12995, originalPrice: 14995, discount: 13, rating: 4.5, numReviews: 6789, stock: 100,
    isFeatured: false, isTrending: true, reviews: [],
  },
  {
    _id: 'p22', title: 'Levi\'s 511 Slim Fit Jeans', category: 'Fashion', brand: 'Levi\'s',
    description: 'Classic slim fit, 99% cotton, mid-rise waistband, iconic 5-pocket styling, machine washable.',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
    price: 3499, originalPrice: 4999, discount: 30, rating: 4.4, numReviews: 9876, stock: 200,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p23', title: 'Ray-Ban Aviator Classic Sunglasses', category: 'Fashion', brand: 'Ray-Ban',
    description: 'Classic teardrop shaped lens, gold metal frame, crystal green lens, UV protection.',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80'],
    price: 7490, originalPrice: 8990, discount: 17, rating: 4.6, numReviews: 4321, stock: 80,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p24', title: 'Wildcraft 65L Hiking Backpack', category: 'Fashion', brand: 'Wildcraft',
    description: 'Rain cover, multiple compartments, ergonomic back support, laptop sleeve, ripstop nylon.',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
    price: 3499, originalPrice: 4999, discount: 30, rating: 4.4, numReviews: 2341, stock: 75,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p25', title: 'Prestige Induction Cooktop 2000W', category: 'Home', brand: 'Prestige',
    description: '2000W, 7 preset menus, auto shut-off, feather touch controls, Indian cooking compatible.',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80'],
    price: 2499, originalPrice: 3499, discount: 29, rating: 4.3, numReviews: 11234, stock: 150,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p26', title: 'Dyson V15 Detect Vacuum', category: 'Home', brand: 'Dyson',
    description: 'Laser detects microscopic dust, 60-min battery, HEPA filtration, LCD display, 5-stage filtration.',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
    price: 54900, originalPrice: 62900, discount: 13, rating: 4.7, numReviews: 876, stock: 20,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p27', title: 'Atomic Habits – James Clear', category: 'Books', brand: 'Penguin',
    description: 'NYT bestseller: tiny changes, remarkable results. Build good habits, break bad ones.',
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'],
    price: 599, originalPrice: 799, discount: 25, rating: 4.8, numReviews: 15234, stock: 500,
    isFeatured: false, isTrending: true, reviews: [],
  },
  {
    _id: 'p28', title: 'Rich Dad Poor Dad – Robert Kiyosaki', category: 'Books', brand: 'Simon & Schuster',
    description: '#1 personal finance book. What the rich teach their kids about money that the poor do not.',
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80'],
    price: 449, originalPrice: 599, discount: 25, rating: 4.6, numReviews: 21456, stock: 400,
    isFeatured: false, isTrending: false, reviews: [],
  },
  {
    _id: 'p29', title: 'boAt Rockerz 550 Wireless Headphone', category: 'Audio', brand: 'boAt',
    description: '20-hour playback, 50mm drivers, foldable design, padded ear cushions, made in India.',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80'],
    price: 1799, originalPrice: 3990, discount: 55, rating: 4.2, numReviews: 45678, stock: 300,
    isFeatured: false, isTrending: true, reviews: [],
  },
  {
    _id: 'p30', title: 'Mi 65W Fast Charger Adapter', category: 'Electronics', brand: 'Xiaomi',
    description: '65W turbo charging, GaN technology, USB-C & USB-A dual port, compact design, travel-friendly.',
    images: ['https://images.unsplash.com/photo-1583395838144-09b2fc61bb2d?w=600&q=80'],
    price: 1299, originalPrice: 1999, discount: 35, rating: 4.5, numReviews: 34567, stock: 500,
    isFeatured: false, isTrending: true, reviews: [],
  },
];

// ── JWT helper ─────────────────────────────────────────────────────────────────
const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const protect = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = users.find(u => u._id === decoded.id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }
    if (users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      _id: `u${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      phone: phone || '',
      profileImage: req.file ? `/uploads/${req.file.filename}` : '',
      wishlist: [],
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    const token = signToken(user._id);
    const { password: _, ...safeUser } = user;
    res.status(201).json({ success: true, message: 'Account created!', token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email?.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, message: 'Welcome back!', token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Profile
app.get('/api/auth/profile', protect, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
});

// Update Profile
app.put('/api/auth/profile', protect, upload.single('profileImage'), async (req, res) => {
  const user = req.user;
  if (req.body.name) user.name = req.body.name.trim();
  if (req.body.phone) user.phone = req.body.phone;
  if (req.file) user.profileImage = `/uploads/${req.file.filename}`;
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Toggle Wishlist
app.put('/api/auth/wishlist/:productId', protect, (req, res) => {
  const user = req.user;
  const pid = req.params.productId;
  const idx = user.wishlist.indexOf(pid);
  if (idx === -1) { user.wishlist.push(pid); }
  else { user.wishlist.splice(idx, 1); }
  const { password: _, ...safeUser } = user;
  res.json({ success: true, wishlist: user.wishlist, message: idx === -1 ? 'Added to wishlist!' : 'Removed from wishlist' });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCT ROUTES
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/products', (req, res) => {
  let result = [...products];
  const { category, search, minPrice, maxPrice, sort, featured, trending, limit, page = 1 } = req.query;

  if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (search)   result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
  if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
  if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
  if (featured === 'true') result = result.filter(p => p.isFeatured);
  if (trending === 'true') result = result.filter(p => p.isTrending);

  if (sort === 'price_asc')  result.sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
  else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = result.length;
  const pageSize = Number(limit) || 12;
  const pageNum = Number(page);
  const pages = Math.ceil(total / pageSize);
  const paginated = result.slice((pageNum - 1) * pageSize, pageNum * pageSize);

  res.json({ success: true, products: paginated, total, page: pageNum, pages });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
});

// Add Review
app.post('/api/products/:id/review', protect, (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const { rating, comment } = req.body;
  product.reviews.push({
    _id: `r${Date.now()}`,
    name: req.user.name,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString(),
  });
  // Recalculate rating
  const avg = product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length;
  product.rating = Math.round(avg * 10) / 10;
  product.numReviews = product.reviews.length;
  res.json({ success: true, product, message: 'Review added!' });
});

// ─────────────────────────────────────────────────────────────────────────────
//  CART ROUTES
// ─────────────────────────────────────────────────────────────────────────────

const getCart = (userId) => {
  if (!carts[userId]) carts[userId] = [];
  const items = carts[userId].map(item => {
    const p = products.find(pr => pr._id === item.productId);
    if (!p) return null;
    return { product: p, quantity: item.quantity, price: p.price };
  }).filter(Boolean);
  const total = items.reduce((a, i) => a + i.price * i.quantity, 0);
  return { items, total };
};

app.get('/api/cart', protect, (req, res) => {
  res.json({ success: true, cart: getCart(req.user._id) });
});

app.post('/api/cart/add', protect, (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = products.find(p => p._id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (!carts[req.user._id]) carts[req.user._id] = [];
  const existing = carts[req.user._id].find(i => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else carts[req.user._id].push({ productId, quantity });
  res.json({ success: true, cart: getCart(req.user._id), message: 'Added to cart!' });
});

app.put('/api/cart/update/:productId', protect, (req, res) => {
  const { quantity } = req.body;
  if (!carts[req.user._id]) return res.status(404).json({ success: false, message: 'Cart empty' });
  const item = carts[req.user._id].find(i => i.productId === req.params.productId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });
  item.quantity = Number(quantity);
  res.json({ success: true, cart: getCart(req.user._id) });
});

app.delete('/api/cart/remove/:productId', protect, (req, res) => {
  if (!carts[req.user._id]) return res.status(404).json({ success: false, message: 'Cart empty' });
  carts[req.user._id] = carts[req.user._id].filter(i => i.productId !== req.params.productId);
  res.json({ success: true, cart: getCart(req.user._id), message: 'Item removed' });
});

app.delete('/api/cart/clear', protect, (req, res) => {
  carts[req.user._id] = [];
  res.json({ success: true, cart: { items: [], total: 0 } });
});

// ─────────────────────────────────────────────────────────────────────────────
//  ORDER ROUTES
// ─────────────────────────────────────────────────────────────────────────────

app.post('/api/orders/create', protect, (req, res) => {
  try {
    const { shippingAddress, paymentMethod, items, subtotal, tax, shippingCost } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items in order' });
    const order = {
      _id: `order_${Date.now()}`,
      orderNumber: `QB${++orderCounter}`,
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      subtotal: subtotal || 0,
      tax: tax || 0,
      shippingCost: shippingCost || 0,
      totalAmount: (subtotal || 0) + (tax || 0) + (shippingCost || 0),
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    // Clear cart
    carts[req.user._id] = [];
    res.status(201).json({ success: true, order, message: 'Order placed!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/orders/user', protect, (req, res) => {
  const userOrders = orders.filter(o => o.user === req.user._id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, orders: userOrders });
});

app.get('/api/orders/:id', protect, (req, res) => {
  const order = orders.find(o => o._id === req.params.id && o.user === req.user._id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

app.put('/api/orders/:id/cancel', protect, (req, res) => {
  const order = orders.find(o => o._id === req.params.id && o.user === req.user._id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!['Pending', 'Processing'].includes(order.orderStatus)) {
    return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
  }
  order.orderStatus = 'Cancelled';
  res.json({ success: true, order, message: 'Order cancelled' });
});

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ success: true, message: '🛒 QuickBuy API running!', products: products.length }));

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 QuickBuy API → http://localhost:${PORT}`);
  console.log(`📦 Products loaded: ${products.length}`);
  console.log(`🛍️  Frontend:  http://localhost:5173\n`);
});

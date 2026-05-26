# QuickBuy 🛒 – Full Stack E-Commerce Application

A complete, professional full-stack e-commerce web application built with React, Node.js, Express, and MongoDB.

## 🌟 Features

- **Authentication** – JWT-based signup/login with profile image upload
- **Product Catalog** – 20 seeded products with search, filter, sort & pagination
- **Shopping Cart** – Add/remove/update with tax & shipping calculation
- **Checkout** – Shipping form + 4 payment methods
- **PDF Invoice** – Downloadable professional invoice after order placement
- **Order History** – View, expand, cancel, and download invoices
- **User Profile** – Edit info, upload avatar, view stats
- **Dark Mode** – Full dark/light theme toggle with persistence
- **Wishlist** – Save products to wishlist
- **Product Reviews** – Authenticated users can rate and review
- **Responsive** – Mobile-first, fully responsive design

## 🛠️ Tech Stack

| Frontend | Backend |
|---|---|
| React 18 + Vite | Node.js + Express |
| Redux Toolkit | MongoDB + Mongoose |
| TailwindCSS v4 | JWT + bcryptjs |
| Framer Motion | Multer (file uploads) |
| Axios | Morgan |
| jsPDF | CORS |
| React Router DOM v6 | Express Validator |
| React Hot Toast | Nodemon (dev) |
| Lucide React | |

## 📁 Project Structure

```
QuickBuy/
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth + error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded profile images
│   ├── utils/           # Seed data
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, Footer, ProductCard, HeroSlider...
    │   ├── context/     # ThemeContext
    │   ├── pages/       # Home, Products, Cart, Checkout, Orders, Profile...
    │   ├── services/    # Axios API service
    │   ├── store/       # Redux store + slices
    │   ├── utils/       # Helpers + PDF generator
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install

# Copy env file and configure
copy .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
```

`.env` contents:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/quickbuy
JWT_SECRET=your_secure_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

Start backend:
```bash
npm run dev
# Server runs at http://localhost:5000
```

### 2. Seed Products (first time only)

```
GET http://localhost:5000/api/products/seed
```
This seeds 20 sample products into MongoDB.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register user (multipart/form-data) |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/profile` | ✅ | Get user profile |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| PUT | `/api/auth/wishlist/:id` | ✅ | Toggle wishlist |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | No | List with filters + pagination |
| GET | `/api/products/:id` | No | Single product |
| POST | `/api/products/:id/review` | ✅ | Add review |
| GET | `/api/products/seed` | No | Seed 20 products (dev) |

### Cart
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | ✅ | Get user cart |
| POST | `/api/cart/add` | ✅ | Add item |
| PUT | `/api/cart/update/:id` | ✅ | Update quantity |
| DELETE | `/api/cart/remove/:id` | ✅ | Remove item |
| DELETE | `/api/cart/clear` | ✅ | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders/create` | ✅ | Place order |
| GET | `/api/orders/user` | ✅ | User's orders |
| GET | `/api/orders/:id` | ✅ | Single order |
| PUT | `/api/orders/:id/cancel` | ✅ | Cancel order |

## 🎨 Design System

- **Colors**: Dark blue (#1a3a6b) + White + Orange (#f97316)
- **Typography**: Inter + Outfit (Google Fonts)
- **Dark Mode**: Full CSS variable-based theming
- **Animations**: Framer Motion for page transitions and micro-interactions

## 📄 PDF Invoice

After placing an order, click "Download Invoice PDF" to generate a professional PDF bill with:
- QuickBuy branding
- Customer & shipping details
- Itemized product list
- Subtotal, tax, shipping, and total
- Order number and date
- Thank you message

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens stored in localStorage
- Protected routes on both frontend and backend
- File upload size limit (5MB)
- CORS configured for localhost origins

---

Built with ❤️ using React + Node.js

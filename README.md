# QITRA Haute Maison — React Native Web (Expo) + Full Backend

A complete cross-platform React Native Web e-commerce application and integrated backend API mirroring the **QITRA Haute Maison** store. Powered by **React Native**, **Expo SDK 58**, **React Native Web**, **Express**, and **Prisma ORM** connected to the production TiDB/MySQL database.

---

## 🌟 Architecture & Features

### 1. Full E-Commerce Client (React Native Web)
- **Storefront**: Hero banner, brand guarantees (Free Express Delivery, Cash on Delivery, WhatsApp Concierge), Category showcase, Featured Masterpieces, and Atelier banner.
- **Filterable Catalogue**: Search keywords, category selection (Clothes, Makeup, Jewellery, Perfume), audience filter (Men, Women, Children, Unisex), and price/date sorting.
- **Product Details**: Large showcase imagery, category/audience badges, stock indicator, price in PKR (`₨`), quantity selection, and related items.
- **Shopping Bag**: Persistent cart using `@react-native-async-storage/async-storage`, line total recalculation, free delivery threshold notification, and item controls.
- **Secure Checkout**: Full delivery address form with validation, Cash on Delivery (COD) payment method, and summary breakdown.
- **Order Confirmation**: Order number generation (`ORD-YYYYMMDD-XXXX`) and direct 1-tap WhatsApp concierge tracking link.

### 2. Complete Integrated Backend API (`server/`)
- **Prisma ORM v6.19.3** connected to the TiDB/MySQL database via `DATABASE_URL`.
- **Express REST API** with CORS enabled for Web and Mobile clients on port `5000`:
  - `GET /api/health` — Health check endpoint
  - `GET /api/categories` — Live categories with product counts
  - `GET /api/products` — Filter products by category, gender, search query, and sorting
  - `GET /api/products/:id` — Single product details with category
  - `POST /api/products` — Create new product (Zod validated)
  - `PUT /api/products/:id` — Update existing product
  - `DELETE /api/products/:id` — Delete product
  - `GET /api/orders` — List orders with order items and products
  - `GET /api/orders/:id` — Single order details
  - `POST /api/orders` — Place order (Prisma transaction, stock decrement, order number generation, and WhatsApp dispatch trigger)
  - `PATCH /api/orders/:id` — Update order status (`PENDING`, `CONFIRMED`, `SHIPPED`, etc.)
  - `POST /api/upload` — Direct Cloudinary media upload
  - `POST /api/auth/login` — Admin login authentication via bcrypt

---

## 🚀 Quick Start Commands

```bash
cd ..\qitra-rn-web
```

### ⚡ Run Full Stack (Frontend + Backend concurrently):
```bash
npm run dev:all
```
> Starts the Express backend on `http://localhost:5000` and the React Native Web frontend on `http://localhost:8081`.

### 🖥️ Run Backend Server Only:
```bash
npm run server
```
> Starts the Express + Prisma API server at `http://localhost:5000`.

### 🌐 Run Frontend (Expo Web) Only:
```bash
npm run web
# or
npx expo start --web
```
> Starts Expo Web at `http://localhost:8081`.

### 📱 Run Native Mobile (iOS / Android):
```bash
npm run android   # Android emulator or connected phone
npm run ios       # iOS simulator (macOS required)
```

### 🗄️ Database Commands:
```bash
npm run db:generate   # Regenerate Prisma Client
npm run db:seed       # Seed categories and products to database
npm run db:push       # Push schema changes to database
```

---

## 📂 Directory Structure

```
qitra-rn-web/
├── .env                        # Database, Cloudinary, and Auth credentials
├── App.tsx                     # Root app, URL routing, toast notifications
├── app.json                    # Expo configuration
├── package.json                # Project dependencies and run scripts
├── prisma/
│   ├── schema.prisma           # Prisma MySQL schema
│   └── seed.ts                 # Database seed script
├── server/                     # Complete Express Backend
│   ├── index.ts                # Main Express server entrypoint
│   ├── prisma.ts               # PrismaClient singleton
│   ├── cloudinary.ts           # Cloudinary image upload utility
│   ├── validators.ts           # Zod validation schemas
│   ├── whatsapp.ts             # WhatsApp dispatch utility
│   └── routes/
│       ├── auth.ts             # Admin login endpoint
│       ├── categories.ts       # Categories API
│       ├── orders.ts           # Orders & checkout API
│       ├── products.ts         # Products CRUD & filter API
│       └── upload.ts           # Media upload API
└── src/                        # React Native Web Frontend
    ├── components/             # Reusable UI components (Header, Footer, ProductCard, etc.)
    ├── context/                # Persistent CartContext via AsyncStorage
    ├── data/                   # Fallback mock data
    ├── screens/                # App screens (Home, Products, Details, Cart, Checkout, Confirmation)
    ├── services/               # API client connecting to backend on port 5000
    ├── types/                  # TypeScript interfaces
    └── utils/                  # Currency & order number formatters
```

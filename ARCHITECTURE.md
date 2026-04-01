# Egypt Direct Shop - Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  http://localhost:5173 (React + Vite + Tailwind)                │
│                                                                   │
│  ┌────────────────────────────────────────┐                     │
│  │  React Components                      │                     │
│  │  ├── Pages (Products, Account, etc)    │                     │
│  │  ├── Components (ProductCard, etc)     │                     │
│  │  └── Contexts (Auth, Cart)             │                     │
│  └──────────────────┬─────────────────────┘                     │
│                     │                                             │
│  ┌──────────────────▼─────────────────────┐                     │
│  │  API Client (src/lib/api.ts)           │                     │
│  │  - Centralized API wrapper             │                     │
│  │  - Handles auth tokens                 │                     │
│  │  - Type-safe requests                  │                     │
│  └──────────────────┬─────────────────────┘                     │
└─────────────────────┼──────────────────────────────────────────┘
                      │ HTTP/JSON
                      │ (CORS enabled)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│          BACKEND API (Node.js/Express)                           │
│  http://localhost:3001                                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ middleware/                                                │ │
│  │  ├── CORS (allow localhost:5173)                          │ │
│  │  ├── JSON parser                                          │ │
│  │  ├── Auth (JWT verification)                             │ │
│  │  └── Error handler                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ api/routes/                                                │ │
│  │                                                             │ │
│  │ products.js:                                               │ │
│  │  GET  /api/products        (search, filter, sort, page)   │ │
│  │  GET  /api/products/:id    (product details + vendor)    │ │
│  │                                                             │ │
│  │ orders.js (Auth Required):                                │ │
│  │  GET  /api/orders          (user's orders)               │ │
│  │  GET  /api/orders/:id      (order details + items)       │ │
│  │  POST /api/orders          (create order)                │ │
│  │                                                             │ │
│  │ paystack.js (Auth Required):                              │ │
│  │  POST /api/payments/initialize  (create transaction)     │ │
│  │  POST /api/payments/webhook     (payment callback)       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────┬──────────────────────────────────────────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
        ▼             ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Supabase    │ │  Paystack    │ │  Resend      │
│  (Database)  │ │  (Payments)  │ │  (Email)     │
│  PostgreSQL  │ │              │ │              │
│  Auth        │ │  - Initialize│ │  - Confirm   │
│  Profiles    │ │  - Webhook   │ │  - Shipment  │
│  Products    │ │    Notify    │ │  - Delivery  │
│  Orders      │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Database Schema

### Core Tables

```
┌─────────────────────────────────────────────┐
│ categories                                   │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ name (Electronics, Fashion, Home, ...)     │
│ slug, description, image_url                │
│ created_at                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ vendors                                      │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ name (TechHub Cairo, Fashion Forward, ...)  │
│ slug, description, logo_url                 │
│ location, verified, rating, total_sales     │
│ created_at                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ products                                     │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ name, slug, description                     │
│ category_id, vendor_id                      │
│ price_egp, price_ngn                        │
│ shipping_fee_ngn, service_fee_ngn           │
│ images (array of URLs)                      │
│ in_stock, rating, review_count              │
│ created_at, updated_at                      │
└─────────────────────────────────────────────┘
        │
        └──────────────────┐
                           ▼
┌─────────────────────────────────────────────┐
│ product_variants                             │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ product_id (FK to products)                 │
│ size, color                                  │
│ in_stock, stock_count                       │
│ price_adjustment_ngn                        │
│ created_at                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ orders                                       │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ user_id (FK to auth.users)                  │
│ status (pending, paid, in_transit, ...)     │
│ subtotal_ngn, shipping_fee_ngn, service_fee │
│ total_ngn                                    │
│ shipping_address (JSONB)                    │
│ payment_method, payment_reference            │
│ created_at, updated_at                      │
└─────────────────────────────────────────────┘
        │
        │ (1 to many)
        ▼
┌─────────────────────────────────────────────┐
│ order_items                                  │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ order_id (FK)                                │
│ product_id (FK)                              │
│ variant_id (FK, optional)                    │
│ product_name, quantity                      │
│ price_ngn                                    │
│ created_at                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ profiles                                     │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ user_id (FK to auth.users, unique)          │
│ full_name, phone, avatar_url                │
│ created_at, updated_at                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ addresses                                    │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ user_id (FK)                                │
│ label, full_name, phone                     │
│ street, city, state, country                │
│ is_default                                   │
│ created_at                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ wishlists                                    │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ user_id (FK)                                │
│ product_id (FK)                             │
│ UNIQUE(user_id, product_id)                 │
│ created_at                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ cart_items                                   │
├─────────────────────────────────────────────┤
│ id (UUID)                                    │
│ user_id (FK)                                │
│ product_id (FK)                             │
│ variant_id (FK, optional)                   │
│ quantity                                     │
│ created_at                                   │
└─────────────────────────────────────────────┘
```

---

## API Flow Examples

### 1. Product Search Flow
```
User Types "shirt" in Search Box
                │
                ▼
React Component Calls:
  apiClient.getProducts({ search: "shirt" })
                │
                ▼
Frontend API Client:
  Sends: GET /api/products?search=shirt
  Headers: { "Content-Type": "application/json" }
                │
                ▼
Backend Express Route (products.js):
  1. Parse search parameter
  2. Query Supabase:
     SELECT FROM products 
     WHERE name ILIKE '%shirt%' OR description ILIKE '%shirt%'
  3. Apply filters: category, price, sort
  4. Apply pagination: OFFSET, LIMIT
                │
                ▼
Database Returns:
  - 5 matching products (e.g., T-Shirts, Polo Shirts)
  - Total count: 5
                │
                ▼
API Response: 200 OK
  {
    "products": [ {...}, {...}, ... ],
    "pagination": { "page": 1, "limit": 20, "total": 5, "pages": 1 }
  }
                │
                ▼
React Component:
  1. Receives response
  2. Maps products to JSX
  3. Renders ProductCard components
  4. Displays: "5 results for 'shirt'"
```

### 2. Order Creation & Payment Flow
```
User Clicks "Checkout"
                │
                ▼
Frontend Shows Order Summary:
  - 2x T-Shirt @ ₦12,500 = ₦25,000
  - Shipping: ₦5,000
  - Service Fee: ₦2,000
  - Total: ₦32,000
                │
                ▼
User Clicks "Pay with Paystack"
                │
                ▼
Frontend Initiates Payment:
  POST /api/payments/initialize
  {
    "email": "user@example.com",
    "amount": 32000,
    "orderId": "order-uuid",
    "metadata": { "userId": "user-uuid" }
  }
  Headers: { "Authorization": "Bearer <JWT_TOKEN>" }
                │
                ▼
Backend Processing:
  1. Verify JWT token (auth middleware)
  2. Validate amount > 0
  3. Call Paystack API:
     POST https://api.paystack.co/transaction/initialize
     {
       "email": "user@example.com",
       "amount": 3200000, // in kobo
       "metadata": { "userId": "...", "orderId": "..." }
     }
                │
                ▼
Paystack Returns:
  {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "ref_1234567890"
  }
                │
                ▼
Frontend Response: 200 OK
  Redirects user to: https://checkout.paystack.com/...
                │
                ▼
User Completes Payment on Paystack:
  - Enters card details: 4111111111111111
  - Enters OTP
  - Payment successful
    
Paystack Webhook Triggered ➡️ Backend
                │
                ▼
Backend Webhook Handler (paystack.js):
  1. Verify webhook signature
  2. Extract: reference, userId, orderId
  3. Update Database:
     UPDATE orders 
     SET status = 'paid', 
         payment_reference = 'ref_1234567890',
         payment_method = 'paystack'
     WHERE id = 'order-uuid'
  4. Create order items in database
  5. Trigger email (FUTURE)
                │
                ▼
Frontend Checks Order Status:
  GET /api/orders/order-uuid
  Response: { "status": "paid", ... }
                │
                ▼
User Sees: "Payment Successful! Order Confirmed"
           Order tracking page with status updates
```

### 3. Authentication Flow
```
User Logs In
            │
            ▼
Frontend Calls Supabase Auth:
  supabase.auth.signInWithPassword({
    email: "user@example.com",
    password: "password"
  })
            │
            ▼
Supabase Returns:
  {
    "user": { "id": "user-uuid", "email": "...", ... },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
      "expires_in": 3600,
      ...
    }
  }
            │
            ▼
Frontend Stores Token:
  useAuth context saves session.access_token
            │
            ▼
User Makes Protected API Request:
  GET /api/orders
  Headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsIn...",
    "Content-Type": "application/json"
  }
            │
            ▼
Backend Auth Middleware:
  1. Extract token from header
  2. Call: supabase.auth.getUser(token)
  3. Verifies JWT signature and expiry
  4. Returns user object
  5. Attaches user to req.user
            │
            ▼
Backend Route Handler:
  1. Access req.user.id to filter orders
  2. Query: SELECT FROM orders WHERE user_id = req.user.id
  3. Return orders (only user's own)
            │
            ▼
Response: 200 OK
  {
    "orders": [ {...}, {...} ],
    "pagination": { ... }
  }
```

---

## Data Seed Summary

### Loaded on Database Initialization

```
Categories: 5
├── Electronics (11111...)
├── Fashion (22222...)
├── Home & Garden (33333...)
├── Sports & Outdoors (44444...)
└── Books & Media (55555...)

Vendors: 5
├── TechHub Cairo (aaaaa...) - rating: 4.8
├── Fashion Forward (bbbbb...) - rating: 4.6
├── Home Essentials Plus (ccccc...) - rating: 4.5
├── Sports Pro (ddddd...) - rating: 4.7
└── Book Palace (eeeee...) - rating: 4.4

Products: 25
├── 5 Electronics (headphones, cables, power banks, lamps, mice)
├── 5 Fashion (t-shirts, jeans, shoes, dresses, jackets)
├── 5 Home & Garden (pillows, clocks, cookware, knives, pots)
├── 5 Sports (yoga mats, dumbbells, basketballs, snorkel, tents)
└── 5 Books (business, self-help, fiction, cooking, technology)

Product Variants: 20+
├── T-Shirt sizes: S, M, L, XL with colors: Black, White, Gray
├── Jeans sizes: 28, 30, 32, 34 with colors: Blue, Black
├── Shoes sizes: 7, 8, 9, 10 with colors: White, Black
└── Dresses sizes: XS, S, M, L with colors: Pink, Blue
```

---

## Technology Stack Details

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development (< 100ms HMR)
- **Tailwind CSS** with customization
- **Shadcn/UI** pre-built components
- **Bun** package manager (3x faster)

### Backend
- **Node.js v18+** runtime
- **Express 4** framework (minimal, fast)
- **Supabase JS client** for PostgreSQL
- **Winston** structured logging
- **CORS** middleware for security
- **Axios** for HTTP calls (Paystack API)

### Database
- **PostgreSQL** (managed by Supabase)
- **Row Level Security (RLS)** for data access control
- **Triggers** for automatic timestamps
- **Indexes** for search performance
- **JSONB** for flexible data (addresses)

### External Services
- **Supabase** - Auth & Database ($0-5/month)
- **Paystack** - Payments (2.95% + ₦100 per transaction)
- **Resend** - Email (free tier: 100 emails/day, $20/month paid)

---

## Security Architecture

### Authentication
- JWT tokens issued by Supabase Auth
- Verified on backend before protected routes
- Token stored in browser's memory (not localStorage)
- Auto-refresh on expiry

### Authorization
- Row Level Security (RLS) policies enforce data isolation
- Users can only see/modify their own orders, addresses
- Auth middleware verifies token before route handler

### Data Protection
- HTTPS in production (enforced by Vercel/Railway)
- Supabase Service Role Key kept in backend environment
- Paystack webhook signature verification
- CORS limits requests to frontend domain only

### Secrets Management
- `.env` files excluded from Git
- All secrets in environment variables only
- Different .env files for dev/prod
- Rotate keys regularly

---

## Performance Optimizations

### Database
- Indexes on frequently searched columns
- Pagination (20 items default) prevents large queries
- Connection pooling via Supabase
- Lazy loading of product images

### Frontend
- Code splitting by route
- Image optimization with Unsplash URLs
- Component-level code splitting
- Bun for fast dependency installation

### Backend
- Middleware stacking for efficiency
- Response caching headers (future)
- Winston logging with file rotation
- Connection pooling to Supabase

---

## Monitoring & Logging

### Frontend
- Browser console for development errors
- Network tab for API debugging
- React DevTools for component inspection

### Backend
- Winston logs to console and files
- Errors logged to `error.log`
- All requests logged to `combined.log`
- Structured JSON logging for production parsing

### Database
- Supabase dashboard for monitoring
- Query performance insights
- Real-time alerts (in paid tier)

---

## Deployment Targets

```
Frontend (React)              Backend (Express)       Database
    │                              │                     │
    ▼                              ▼                     ▼
  Vercel                      Railway/Render         Supabase
  (Automatic from Git)        (Automatic from Git)   (Already managed)
  Environment: production      Environment: prod     PostgreSQL 14
  Domain: custom.com          Domain: api.custom.com Backups: daily
  CDN: Global                 Replicas: multiple
  CI/CD: integrated           Autoscaling: enabled
```

---

**Architecture Last Updated:** April 1, 2026  
**Status:** Phase 1 Complete ✅  
**Next:** Implement frontend components for Phase 2

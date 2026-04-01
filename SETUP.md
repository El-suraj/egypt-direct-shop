# Egypt Direct Shop - Setup Guide

This guide will help you set up the complete development environment for the Egypt Direct Shop project.

## Prerequisites

- **Node.js**: v18+ (check with `node --version`)
- **Bun**: Latest version (for frontend package management)
- **Git**: For version control
- **Supabase Account**: Already configured (project exists)
- **Paystack Account**: For payment testing (optional for development)

---

## Phase 1: Environment Configuration

### 1.1 Frontend Environment Setup

The `.env` file is already configured with:
- Supabase credentials (public keys - safe to commit)
- API URL: `http://localhost:3001` (local backend)
- Paystack test key (placeholder)

⚠️ **IMPORTANT**: Never commit sensitive keys to git. The `.env.example` file shows the template structure.

### 1.2 Backend Environment Setup

1. Copy the template file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Get your Supabase Service Role Key:
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Navigate to **Project Settings** → **API**
   - Copy **Service Role Key** and paste in `backend/.env`

3. Get Paystack credentials (optional):
   - Visit [https://dashboard.paystack.com](https://dashboard.paystack.com)
   - Get test keys from Settings
   - For webhook testing, use: `https://webhook.site` for initial testing

4. For Resend emails (optional):
   - Sign up at [https://resend.com](https://resend.com)
   - Get API key from dashboard

**Your `backend/.env` should look like:**
```
SUPABASE_URL=https://hfmfebqwvokojhjqjsjd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PAYSTACK_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## Phase 2: Database Seed Data

### 2.1 Load Seed Data into Supabase

Run the seed script to populate demo data:

```bash
# Using Supabase CLI (if installed)
supabase db push

# OR using psql directly
psql -h hfmfebqwvokojhjqjsjd.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

**What gets loaded:**
- 5 Product Categories (Electronics, Fashion, Home, Sports, Books)
- 5 Vendors with ratings and sales history
- 25+ Products across all categories
- Product variants (sizes, colors)
- Database indexes for fast searching

Verify with:
```bash
# Frontend: visit http://localhost:5173/products
# Backend: curl http://localhost:3001/api/products
```

---

## Phase 3: Backend Installation & Development

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

**Expected output:** No warnings or errors

### 3.2 Start Backend Server

Development mode (auto-restart on file changes):
```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:3001
```

### 3.3 Verify Backend is Working

In a new terminal:
```bash
# Health check
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2026-04-01T..."}

# Test product endpoint
curl http://localhost:3001/api/products

# Expected response:
# {"products":[...],"pagination":{...}}
```

---

## Phase 4: Frontend Setup

### 4.1 Install Dependencies

```bash
# From root directory
bun install
```

### 4.2 Start Frontend Dev Server

```bash
bun run dev
```

Expected output:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### 4.3 Verify Frontend is Working

1. Open [http://localhost:5173](http://localhost:5173)
2. You should see the home page with hero section
3. Navigate to `/products` - should show product list with search/filter

---

## API Endpoints Reference

### Products
- `GET /api/products` - List products with search & filters
  - Query params: `search`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`
- `GET /api/products/:id` - Get single product details

### Orders (Requires Auth)
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details with items
- `POST /api/orders` - Create new order

### Payments
- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/webhook` - Handle Paystack webhooks

---

## Database Schema Overview

### Tables
- `categories` - Product categories
- `vendors` - Shop vendors
- `products` - Product listings with pricing
- `product_variants` - Sizes, colors, stock
- `orders` - Customer orders
- `order_items` - Items within orders
- `profiles` - User profiles (auto-created)
- `addresses` - Shipping addresses
- `cart_items` - Shopping cart items
- `wishlists` - User wishlists

All tables have Row Level Security (RLS) policies for data privacy.

---

## Troubleshooting

### Backend won't start
```bash
# Port 3001 already in use?
lsof -i :3001  # Find process
kill -9 <PID>

# Missing dependencies?
rm -rf node_modules package-lock.json
npm install
```

### API returns 401 Unauthorized
- Backend can't reach Supabase: Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Invalid JWT token: Frontend needs to pass auth token in header

### Products not showing
```bash
# Check if seed data loaded
curl http://localhost:3001/api/products?limit=5

# If empty, run seed script again
supabase db push  # Or use psql command above
```

### Frontend can't connect to backend
- Check backend is running: `curl http://localhost:3001/health`
- Check CORS: Frontend should be `http://localhost:5173`
- Check `VITE_API_URL` in `.env` is correct

---

## Next Steps

1. ✅ **Phase 1 Complete**: Backend framework built
2. ✅ **Phase 2 Complete**: Database populated with demo data
3. **Phase 3 Next**: Implement Paystack payment integration in frontend
4. **Phase 4 Next**: Build checkout flow with payment
5. **Phase 5 Next**: Email notifications on order confirmation
6. **Phase 6 Next**: Vendor dashboard for product management
7. **Phase 7 Next**: Admin dashboard for analytics

---

## File Structure

```
egypt-direct-shop/
├── backend/                 # Node.js Express API
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── middleware/          # Auth, validation
│   ├── api/routes/          # API endpoints
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── paystack.js
│   └── utils/
│       └── logger.js
├── src/                     # React frontend
│   ├── lib/
│   │   └── api.ts          # API client wrapper
│   ├── pages/              # Page components
│   ├── components/         # Reusable components
│   └── contexts/           # Auth, Cart contexts
├── supabase/
│   ├── migrations/         # Database schema
│   └── seed.sql           # Demo data
├── .env                    # Frontend config (local)
├── .env.example           # Frontend template
└── vite.config.ts
```

---

## Environment Variables Checklist

### Frontend (`.env`)
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase public key
- [ ] `VITE_API_URL` - Backend API URL (usually `http://localhost:3001`)
- [ ] `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public test key (optional)

### Backend (`backend/.env`)
- [ ] `SUPABASE_URL` - Same as frontend
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (from Settings → API)
- [ ] `PAYSTACK_SECRET_KEY` - Paystack secret test key (optional)
- [ ] `RESEND_API_KEY` - Resend email API key (optional)
- [ ] `PORT` - Usually `3001`
- [ ] `FRONTEND_URL` - Frontend dev URL (`http://localhost:5173`)

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review API endpoint documentation
3. Check browser console (F12) for frontend errors
4. Check terminal output for backend errors

Happy coding! 🚀

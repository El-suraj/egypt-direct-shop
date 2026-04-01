# Quick Start Guide - 5 Minute Setup

## Step 1: Backend Configuration (2 min)
```bash
cd backend
cp .env.example .env
```

**Edit `backend/.env` and add:**
```
SUPABASE_URL=https://hfmfebqwvokojhjqjsjd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...  # From Supabase Settings → API
PAYSTACK_SECRET_KEY=sk_test_...            # Optional - From Paystack dashboard
```

✅ Get Service Role Key: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API → Service Role Key

## Step 2: Install Backend Dependencies (2 min)
```bash
cd backend
npm install
```

## Step 3: Load Database Seed Data (1 min)
Choose ONE option:

**Option A: Supabase CLI**
```bash
supabase db push  # Must be in root directory
```

**Option B: PostgreSQL CLI**
```bash
psql -h hfmfebqwvokojhjqjsjd.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

**What loads:**
- 5 Categories (Electronics, Fashion, Home, Sports, Books)
- 5 Vendors with ratings
- 25+ Products with images
- Product variants (sizes, colors)

## Step 4: Start Backend (In Terminal 1)
```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on http://localhost:3001
```

## Step 5: Start Frontend (In Terminal 2)
```bash
# From root directory
bun run dev
```

**Expected Output:**
```
VITE v5.x.x ready in ...
Local: http://localhost:5173/
```

## Step 6: Verify Everything Works

### Backend Test
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}

curl http://localhost:3001/api/products?limit=5
# Should return: {"products":[...],"pagination":{...}}
```

### Frontend Test
Open [http://localhost:5173](http://localhost:5173) in browser
- ✅ Home page loads
- ✅ Navigate to `/products`
- ✅ See product list with 25+ items
- ✅ Try search: type "shirt" in search box
- ✅ Try filter: select a price range

---

## Done! 🎉

Your development environment is ready. Next steps:

1. **Test Checkout** - Add product to cart and proceed to checkout
2. **Build Payment UI** - Integrate Paystack form (see Phase 2 plan)
3. **Implement Orders** - Show user order history
4. **Add Email Notifications** - Confirm order by email

---

## Troubleshooting - Common Issues

### "Cannot find module" (backend)
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3001 already in use"
```bash
lsof -i :3001            # Find process
kill -9 <PID>            # Kill it
# Then restart: npm run dev
```

### "Products list is empty"
The seed data didn't load. Run one of these:
```bash
# Check if data is there
psql -h hfmfebqwvokojhjqjsjd.supabase.co -U postgres -d postgres << 'EOF'
SELECT COUNT(*) FROM products;
EOF

# Or reload seed data
supabase db push
```

### "CORS Error in browser console"
Make sure:
- ✅ Backend is running on `http://localhost:3001`
- ✅ `.env` has `VITE_API_URL=http://localhost:3001`
- ✅ `backend/.env` has `FRONTEND_URL=http://localhost:5173`

### "401 Unauthorized" on /orders endpoint
This is expected without a logged-in user. To test:
1. Sign up/login at [http://localhost:5173](http://localhost:5173)
2. Then API calls will include auth token automatically

---

## What's Inside

### Files Created
```
backend/                          # Node.js API server
├── server.js                      # Main Express app
├── package.json                   # Dependencies
├── .env.example                   # Template
├── middleware/auth.js             # JWT verification
└── api/routes/
    ├── products.js                # Search/filter products
    ├── orders.js                  # Create/view orders
    └── paystack.js                # Payment handling
    
src/lib/api.ts                     # Frontend API client

supabase/seed.sql                  # Database demo data

Documentation:
├── SETUP.md                       # Full setup guide
├── IMPLEMENTATION.md              # What's been built
├── API.md                         # API documentation
└── QUICK_START.md                 # This file
```

### Key Environment Variables
| Variable | Where | Value |
|----------|-------|-------|
| `VITE_API_URL` | `.env` | `http://localhost:3001` |
| `SUPABASE_SERVICE_ROLE_KEY` | `backend/.env` | 🔒 Secret key |
| `PAYSTACK_SECRET_KEY` | `backend/.env` | 🔒 Optional |

---

## API Endpoints Available

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/health` | GET | No | Health check |
| `/api/products` | GET | No | List/search products |
| `/api/products/:id` | GET | No | Get product details |
| `/api/orders` | GET | Yes | Get user orders |
| `/api/orders` | POST | Yes | Create order |
| `/api/orders/:id` | GET | Yes | Get order details |
| `/api/payments/initialize` | POST | Yes | Start payment |
| `/api/payments/webhook` | POST | No | Payment callback |

See **API.md** for full documentation with examples.

---

## Next: Phase 2 Features

After verification, we'll implement:
1. ✅ Product search/filter UI (already have backend)
2. ✅ Paystack payment integration (already have backend)
3. ✅ Order management page (already have backend)
4. Email notifications on order confirmation
5. Vendor dashboard
6. Admin dashboard

---

## Need Help?

1. **Setup.md** - Detailed troubleshooting
2. **API.md** - API documentation with examples
3. **IMPLEMENTATION.md** - What's been built and tested

---

**Status:** Phase 1 Complete ✅
**Next:** Verify everything works, then start Phase 2
**Time to test:** 5-10 minutes

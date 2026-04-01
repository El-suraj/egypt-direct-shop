# Phase 1 Implementation Checklist

Use this checklist to verify everything is properly set up and working.

---

## ✅ Pre-Requisites

- [ ] Node.js v18+ installed (`node --version`)
- [ ] Bun package manager installed (`bun --version`)
- [ ] Git installed and repository cloned
- [ ] Supabase account set up with project created
- [ ] Project ID: `hfmfebqwvokojhjqjsjd`

---

## ✅ Step 1: Environment Configuration

### Frontend
- [ ] `.env` file exists in root directory
- [ ] `.env` contains `VITE_SUPABASE_URL`
- [ ] `.env` contains `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `.env` contains `VITE_API_URL=http://localhost:3001`
- [ ] `.env.example` file created (safe template)
- [ ] `.env` is in `.gitignore` (secrets protected)

### Backend
- [ ] `backend/` directory created
- [ ] `backend/.env.example` exists (template)
- [ ] `backend/.env` created from example
- [ ] `backend/.env` contains `SUPABASE_URL`
- [ ] `backend/.env` contains `SUPABASE_SERVICE_ROLE_KEY` ✨ **from Supabase Settings**
- [ ] `backend/.env` contains `PORT=3001`
- [ ] `backend/.env` contains `FRONTEND_URL=http://localhost:5173`
- [ ] `backend/.env.local` in local copy, not committed

---

## ✅ Step 2: Backend Setup

- [ ] `backend/package.json` created with dependencies
- [ ] `backend/server.js` created (Express app)
- [ ] `backend/middleware/auth.js` created (JWT verification)
- [ ] `backend/api/routes/products.js` created (search/filter)
- [ ] `backend/api/routes/orders.js` created (CRUD)
- [ ] `backend/api/routes/paystack.js` created (payments)
- [ ] `backend/utils/logger.js` created (Winston)

Verify structure:
```bash
ls -la backend/
# Should show: package.json, server.js, .env.example, middleware/, api/, utils/
```

---

## ✅ Step 3: Dependencies Installation

### Backend
```bash
cd backend
npm install
```
- [ ] No error messages
- [ ] `node_modules/` directory created
- [ ] `package-lock.json` created
- [ ] All: express, @supabase/supabase-js, cors, winston, axios, etc.

### Frontend
```bash
cd ..  # Back to root
bun install
```
- [ ] No error messages
- [ ] `node_modules/` directory exists
- [ ] All dependencies installed

---

## ✅ Step 4: Database Setup

### Seed Data Loaded
```bash
# Option 1: Supabase CLI
supabase db push

# Option 2: PostgreSQL
psql -h hfmfebqwvokojhjqjsjd.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

Verify in Supabase:
- [ ] `categories` table has 5 rows (Electronics, Fashion, etc.)
- [ ] `vendors` table has 5 rows (TechHub, Fashion Forward, etc.)
- [ ] `products` table has 25+ rows
- [ ] `product_variants` table has 20+ rows

```bash
# Quick check (in Supabase SQL editor):
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as vendor_count FROM vendors;
```

---

## ✅ Step 5: Backend Server Startup

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on http://localhost:3001
```

Verify:
- [ ] No error in console
- [ ] Port 3001 is available (not in use)
- [ ] Server stays running (doesn't crash)

---

## ✅ Step 6: Backend API Testing

In a new terminal (while server is running):

### Health Check
```bash
curl http://localhost:3001/health
```
- [ ] Returns: `{"status":"ok","timestamp":"..."}`
- [ ] Status code: 200

### Products List
```bash
curl http://localhost:3001/api/products?limit=5
```
- [ ] Returns: `{"products":[...],"pagination":{...}}`
- [ ] Products array contains items
- [ ] Pagination info shows total > 0

### Product Detail
```bash
curl http://localhost:3001/api/products/p2222222-2222-2222-2222-222222222221
```
- [ ] Returns single product object
- [ ] Contains vendor info
- [ ] Status code: 200

### Error Handling
```bash
curl http://localhost:3001/api/products/invalid-id
```
- [ ] Returns: `{"error":"Product not found"}`
- [ ] Status code: 404

---

## ✅ Step 7: Frontend Server Startup

In a new terminal:
```bash
bun run dev
```

Expected output:
```
VITE v5.x.x ready in ... ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

Verify:
- [ ] No error in console
- [ ] Hot reload working (modify a file and see instant update)
- [ ] Server stays running

---

## ✅ Step 8: Frontend Testing

### Homepage
Open [http://localhost:5173](http://localhost:5173) in browser:
- [ ] Page loads without errors
- [ ] Hero section displays
- [ ] Navigation bar visible
- [ ] No red error messages in console (F12)

### Products Page
Navigate to [http://localhost:5173/products](http://localhost:5173/products):
- [ ] Page loads
- [ ] See list of products (should show 20+ items)
- [ ] Product cards display with images
- [ ] Pagination visible

### Search & Filter
- [ ] Search box is visible
- [ ] Type "shirt" → shows relevant products
- [ ] Type "electronics" → filters by category
- [ ] Price filter works
- [ ] Sort dropdown changes order

### Browser Console (F12)
- [ ] No red error messages
- [ ] No CORS errors
- [ ] No 404 errors for assets

### Network Tab (F12 → Network)
- [ ] API calls to `http://localhost:3001/api/products` succeed (200 status)
- [ ] Response time < 500ms
- [ ] Payload size reasonable

---

## ✅ Step 9: API Client Verification

Frontend API client (`src/lib/api.ts`):
- [ ] File exists and is properly formatted
- [ ] Contains `getProducts()` method
- [ ] Contains `getOrderDetail()` method
- [ ] Contains `createOrder()` method
- [ ] Contains `initializePayment()` method
- [ ] TypeScript compilation has no errors

Check in console:
```bash
# Build frontend to check for TypeScript errors
bun run build
```
- [ ] Build completes without errors
- [ ] `dist/` folder created

---

## ✅ Step 10: Git & Security

### Environment Files Protected
- [ ] `.env` in `.gitignore` (frontend secrets)
- [ ] `backend/.env` in `.gitignore` (backend secrets)
- [ ] `.env.example` in repository (safe template)
- [ ] `backend/.env.example` in repository (safe template)

### Git Status
```bash
git status
```
- [ ] No `.env` or `.env.local` files showing
- [ ] Only code files and examples are staged

---

## ✅ Step 11: Documentation Files Created

- [ ] `README.md` - Updated with project info
- [ ] `SETUP.md` - Complete setup guide
- [ ] `QUICK_START.md` - 5-minute quick start
- [ ] `API.md` - API endpoint documentation
- [ ] `IMPLEMENTATION.md` - Feature status
- [ ] This file (`CHECKLIST.md`)

---

## ✅ Step 12: Ready for Phase 2?

Before starting Phase 2 (Payment & Discovery), verify:

### Backend API
- [ ] `GET /api/products` works with search/filter/sort
- [ ] `GET /api/orders` (needs auth token)
- [ ] `POST /api/orders` accepts order data
- [ ] `POST /api/payments/initialize` returns Paystack URLs

### Frontend
- [ ] Products page loads and displays items
- [ ] Can search and filter products
- [ ] Authentication context working (can see login/logout)
- [ ] Cart functionality working

### Database
- [ ] Can query products from Supabase
- [ ] RLS policies allow connections
- [ ] Seed data intact (25+ products visible)

### Documentation
- [ ] Team can follow QUICK_START.md to replicate setup
- [ ] API.md has all endpoint docs
- [ ] Troubleshooting helps debug issues

---

## 📋 Quick Verification Script

Run this one-liner to test everything:

```bash
echo "=== Backend Health ===" && \
curl -s http://localhost:3001/health && \
echo -e "\n=== Product Count ===" && \
curl -s "http://localhost:3001/api/products?limit=1" | grep -o '"total":[0-9]*' && \
echo -e "\n✅ All systems operational!"
```

Expected output:
```
=== Backend Health ===
{"status":"ok","timestamp":"..."}
=== Product Count ===
"total":25
✅ All systems operational!
```

---

## ⚠️ Common Issues & Fixes

### Backend won't start
```bash
# Port 3001 in use?
lsof -i :3001
kill -9 <PID>
npm run dev

# Missing env variable?
cat backend/.env
# Verify SUPABASE_SERVICE_ROLE_KEY is set
```

### Products list empty
```bash
# Check seed data loaded
psql -h hfmfebqwvokojhjqjsjd.supabase.co -U postgres << EOF
SELECT COUNT(*) FROM products;
EOF
# Should return: 25 (or more)

# If 0, reload seed data
supabase db push
```

### CORS errors in browser
```bash
# Verify backend is running
curl http://localhost:3001/health

# Check FRONTEND_URL in backend/.env
cat backend/.env | grep FRONTEND_URL

# Should be: FRONTEND_URL=http://localhost:5173
```

### Search returns no results
```bash
# Check products exist
curl "http://localhost:3001/api/products?limit=50" | grep -o '"name"' | wc -l
# Should return number > 20
```

---

## ✅ Sign-Off Checklist

Date: _____________  
Checked by: _____________  

- [ ] All environment variables configured
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Database seed data loaded (25+ products visible)
- [ ] API endpoints tested and working
- [ ] Search/filter functionality verified
- [ ] Browser console clean (no errors)
- [ ] Documentation complete
- [ ] Ready to start Phase 2 ✨

---

## 🎯 Next Phase: What to Build

Once this checklist is complete, proceed with Phase 2:

1. **Product Listing Page** - Create `/products` component (UI for backend API)
2. **Paystack Integration** - Add payment form to checkout
3. **Order Tracking** - Display orders in `/account` page
4. **Email Notifications** - Send confirmation emails

See `IMPLEMENTATION.md` for detailed Phase 2 plan.

---

**Last Updated:** April 1, 2026  
**Status:** Phase 1 Complete ✅

# Egypt Direct Shop - E-Commerce Platform

A modern e-commerce platform connecting Egyptian sellers with Nigerian buyers. Features include product search, shopping cart, payment processing via Paystack, and order tracking.

## 🚀 Quick Start

**New to the project?** Start here: [QUICK_START.md](QUICK_START.md) (5 minutes)

**Want to understand everything?** See: [SETUP.md](SETUP.md) (comprehensive guide)

**Building the UI?** Check: [API.md](API.md) (API documentation)

**What's been built?** Review: [IMPLEMENTATION.md](IMPLEMENTATION.md) (feature checklist)

---

## 📋 Project Status

### Phase 1: Foundation ✅ COMPLETE
- ✅ Node.js/Express backend API
- ✅ Product search & filtering endpoints
- ✅ Order management endpoints
- ✅ Paystack payment integration
- ✅ Authentication middleware
- ✅ Database seed data (25+ products)
- ✅ Frontend API client wrapper

### Phase 2: Payment & Discovery (NEXT)
- [ ] Product search UI / Product listing page
- [ ] Paystack payment form integration
- [ ] Order confirmation & tracking UI
- [ ] Email notifications

### Phase 3: Advanced Features (FUTURE)
- [ ] Vendor dashboard
- [ ] Admin dashboard
- [ ] Wishlist management
- [ ] Product reviews & ratings
- [ ] User profiles & addresses

---

## 🔧 Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **Package Manager:** Bun

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth + JWT
- **Payments:** Paystack
- **Logging:** Winston
- **Package Manager:** npm

### Database
- **Provider:** Supabase (PostgreSQL + RLS)
- **ORM:** Direct SQL (Supabase JS client)
- **Schema:** 10+ tables with relationships

---

## 📦 Environment Setup

### Frontend Variables (`.env`)
```
VITE_SUPABASE_URL=https://hfmfebqwvokojhjqjsjd.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsIn...
VITE_API_URL=http://localhost:3001
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
```

### Backend Variables (`backend/.env`)
```
SUPABASE_URL=https://hfmfebqwvokojhjqjsjd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsIn...
PAYSTACK_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Get credentials from:
- **Supabase:** [app.supabase.com](https://app.supabase.com) → Settings → API → Service Role Key
- **Paystack:** [dashboard.paystack.com](https://dashboard.paystack.com) → Settings
- **Resend:** [resend.com](https://resend.com) (optional)

---

## 🚀 Running Locally

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Expected: Server on `http://localhost:3001`

### 2. Database Seed (one-time)
```bash
supabase db push
# OR
psql -h hfmfebqwvokojhjqjsjd.supabase.co -U postgres -d postgres -f supabase/seed.sql
```

### 3. Frontend Setup
```bash
bun install
bun run dev
```
Expected: App on `http://localhost:5173`

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide (start here!) |
| [SETUP.md](SETUP.md) | Detailed installation & troubleshooting |
| [API.md](API.md) | API endpoints & usage examples |
| [IMPLEMENTATION.md](IMPLEMENTATION.md) | What's been built & next steps |

---

## 🎯 Key Features

### Completed
- **Product Catalog:** 25+ products in 5 categories
- **Search & Filter:** By name, category, price, rating
- **Pagination:** Efficient data loading
- **User Authentication:** Supabase Auth integration
- **Shopping Cart:** Store locally, sync to backend
- **Order Creation:** Full order workflow
- **Payment Integration:** Paystack for NGN transactions
- **Database:** 10+ tables with proper relationships & security

### In Progress
- Product listing UI component
- Checkout flow with payment
- Order tracking page

### Planned
- Email notifications
- Vendor console
- Admin dashboard
- Product reviews
- Wishlist features

---

## 📂 Project Structure

```
egypt-direct-shop/
├── backend/                    # Node.js backend
│   ├── server.js               # Main app
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js
│   ├── api/routes/
│   │   ├── products.js         # GET /api/products
│   │   ├── orders.js           # GET|POST /api/orders
│   │   └── paystack.js         # POST /api/payments
│   └── utils/logger.js
│
├── src/                        # React frontend
│   ├── lib/api.ts              # API client wrapper
│   ├── pages/                  # Page components
│   ├── components/             # UI components
│   ├── contexts/               # Auth, Cart contexts
│   └── hooks/                  # Custom hooks
│
├── supabase/
│   ├── migrations/             # Database schema
│   └── seed.sql                # Demo data
│
├── .env                        # Frontend config
├── .env.example                # Template
├── SETUP.md                    # Setup guide
├── API.md                      # API docs
├── QUICK_START.md              # Quick start
└── IMPLEMENTATION.md           # Status & roadmap
```

---

## 🔌 API Endpoints

### Products (Public)
- `GET /api/products` - Search & list products
- `GET /api/products/:id` - Get product details

### Orders (Authenticated)
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order

### Payments
- `POST /api/payments/initialize` - Start Paystack payment
- `POST /api/payments/webhook` - Handle payment callback

**Full API docs:** See [API.md](API.md)

---

## ✅ Testing Checklist

- [ ] Backend starts: `npm run dev` in `/backend`
- [ ] Frontend starts: `bun run dev` in root
- [ ] Homepage loads at `http://localhost:5173`
- [ ] Products API works: `curl http://localhost:3001/api/products`
- [ ] Products page loads at `http://localhost:5173/products`
- [ ] Search filters work (try searching "shirt")
- [ ] No errors in browser console (F12)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Port 3001 in use?
lsof -i :3001; kill -9 <PID>

# Missing dependencies?
rm -rf node_modules; npm install
```

### Product list is empty
```bash
# Reload seed data
supabase db push  # OR see SETUP.md for psql command
```

### API errors in browser
- ✅ Verify backend is running on `:3001`
- ✅ Check `.env` has `VITE_API_URL=http://localhost:3001`
- ✅ Check CORS headers in backend

See [SETUP.md](SETUP.md) for more troubleshooting.

---

## 🔐 Security & Best Practices

- ✅ `.env` files in `.gitignore`
- ✅ Supabase RLS policies enabled
- ✅ JWT token verification on auth routes
- ✅ Webhook signature validation for Paystack
- ✅ Secrets never committed to repository
- ⚠️ Use `SUPABASE_SERVICE_ROLE_KEY` on backend only

---

## 📝 Development Workflow

1. **Feature Development:**
   - Create backend route in `backend/api/routes/`
   - Add API client method in `src/lib/api.ts`
   - Build frontend component

2. **Database Changes:**
   - Modify schema in Supabase SQL editor
   - Record migration in `supabase/migrations/`
   - Update seed data if needed

3. **Testing:**
   - Test API with curl or Postman
   - Verify frontend components
   - Check browser console & network tab

---

## 🚀 Deployment

### Frontend
- Deploy to **Vercel** (1-click from GitHub)
- Set `VITE_API_URL` to production backend URL

### Backend
- Deploy to **Railway** or **Render**
- Update `FRONTEND_URL` CORS setting
- Use production database credentials

### Database
- Already hosted on Supabase (no action needed)
- Ensure RLS policies are enabled

---

## 📞 Support & Contribution

For issues:
1. Check [SETUP.md](SETUP.md) troubleshooting section
2. Review [API.md](API.md) for endpoint details
3. Check `IMPLEMENTATION.md` for current status

---

## 📄 License

Project created for Egypt Direct Shop e-commerce platform.

---

**Last Updated:** April 1, 2026  
**Phase:** 1 (Foundation Complete) ✅  
**Next Phase:** Phase 2 (Payment & Discovery)

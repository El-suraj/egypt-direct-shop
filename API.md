# API Documentation

Base URL: `http://localhost:3001` (development)

---

## Products API

### List Products
```
GET /api/products
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | "" | Search in product name/description |
| `category` | UUID | "" | Filter by category ID |
| `minPrice` | number | 0 | Minimum price (NGN) |
| `maxPrice` | number | 999999 | Maximum price (NGN) |
| `sort` | string | "newest" | Options: newest, oldest, price_asc, price_desc, rating |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Example Request:**
```bash
curl "http://localhost:3001/api/products?search=shirt&category=22222222-2222-2222-2222-222222222222&minPrice=5000&maxPrice=50000&sort=price_asc&page=1&limit=20"
```

**Success Response (200):**
```json
{
  "products": [
    {
      "id": "p2222222-2222-2222-2222-222222222221",
      "name": "Premium Cotton T-Shirt",
      "description": "100% organic cotton comfortable t-shirt available in 8 colors",
      "price": 12500,
      "category_id": "22222222-2222-2222-2222-222222222222",
      "vendor_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      "images": [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500"
      ],
      "rating": 4.6,
      "in_stock": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch products"
}
```

---

### Get Single Product
```
GET /api/products/:id
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Product ID |

**Example Request:**
```bash
curl "http://localhost:3001/api/products/p2222222-2222-2222-2222-222222222221"
```

**Success Response (200):**
```json
{
  "id": "p2222222-2222-2222-2222-222222222221",
  "name": "Premium Cotton T-Shirt",
  "slug": "premium-cotton-tshirt",
  "description": "100% organic cotton comfortable t-shirt available in 8 colors",
  "category_id": "22222222-2222-2222-2222-222222222222",
  "vendor_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "price_ngn": 12500,
  "price_egp": 249,
  "shipping_fee_ngn": 3000,
  "service_fee_ngn": 1000,
  "images": [...],
  "rating": 4.6,
  "review_count": 234,
  "in_stock": true,
  "vendor": {
    "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    "name": "Fashion Forward",
    "rating": 4.6
  }
}
```

**Error Response (404):**
```json
{
  "error": "Product not found"
}
```

---

## Orders API

⚠️ **All order endpoints require authentication.**

### List User's Orders
```
GET /api/orders
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | "" | Filter by order status |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Example Request:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn..." \
  "http://localhost:3001/api/orders?status=paid&page=1&limit=10"
```

**Success Response (200):**
```json
{
  "orders": [
    {
      "id": "order-uuid-1",
      "status": "paid",
      "total_price": 47500,
      "created_at": "2026-04-01T10:30:00Z",
      "shipping_address": {
        "full_name": "John Doe",
        "street": "123 Main St",
        "city": "Cairo",
        "state": "Cairo Governorate"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

**Error Response (401):**
```json
{
  "error": "Missing authorization token"
}
```

---

### Get Single Order
```
GET /api/orders/:id
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Order ID |

**Example Request:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn..." \
  "http://localhost:3001/api/orders/order-uuid-1"
```

**Success Response (200):**
```json
{
  "id": "order-uuid-1",
  "user_id": "user-uuid",
  "status": "paid",
  "subtotal_ngn": 40000,
  "shipping_fee_ngn": 3000,
  "service_fee_ngn": 1500,
  "total_ngn": 44500,
  "payment_reference": "ref_1234567890",
  "payment_method": "paystack",
  "shipping_address": {...},
  "items": [
    {
      "id": "order-item-uuid",
      "product_id": "p2222222-2222-2222-2222-222222222221",
      "quantity": 2,
      "price": 12500,
      "products": {
        "name": "Premium Cotton T-Shirt",
        "images": [...]
      }
    }
  ]
}
```

---

### Create Order
```
POST /api/orders
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "p2222222-2222-2222-2222-222222222221",
      "quantity": 2,
      "price": 12500
    },
    {
      "product_id": "p2222222-2222-2222-2222-222222222222",
      "quantity": 1,
      "price": 40000
    }
  ],
  "shipping_address": {
    "full_name": "John Doe",
    "phone": "+201001234567",
    "street": "123 Main St",
    "city": "Cairo",
    "state": "Cairo Governorate"
  },
  "total_price": 64500
}
```

**Success Response (201):**
```json
{
  "id": "order-uuid-new",
  "user_id": "user-uuid",
  "status": "pending",
  "total_price": 64500,
  "created_at": "2026-04-01T10:35:00Z"
}
```

**Error Response (400):**
```json
{
  "error": "Order must contain at least one item"
}
```

---

## Payments API

### Initialize Payment
```
POST /api/payments/initialize
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "amount": 50000,
  "orderId": "order-uuid-1",
  "metadata": {
    "custom_field": "custom_value"
  }
}
```

**Success Response (200):**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "access_code_here",
  "reference": "ref_1234567890"
}
```

**Usage:**
1. Get the `authorization_url` from response
2. Redirect user to this URL
3. User completes payment on Paystack
4. Paystack redirects back to your callback URL with reference
5. Webhook automatically updates order status to "paid"

**Error Response (400):**
```json
{
  "error": "Invalid amount"
}
```

---

### Paystack Webhook
```
POST /api/payments/webhook
```

**Headers:**
```
x-paystack-signature: <SIGNATURE>
Content-Type: application/json
```

⚠️ **Internal Endpoint** - Handled automatically by Paystack, do not call directly.

When payment is successful:
1. Paystack sends webhook to this endpoint
2. Signature is verified against `PAYSTACK_SECRET_KEY`
3. Order status updated from "pending" to "paid"
4. Order items are created
5. Email notification is sent (future feature)

**Webhook Payload:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ref_1234567890",
    "metadata": {
      "userId": "user-uuid",
      "orderId": "order-uuid-1"
    }
  }
}
```

---

## Order Status Values

```
pending            - Order created, awaiting payment
purchased_egypt   - Payment received, order in Egypt warehouse
in_transit        - Order shipped from Egypt
arrived_nigeria   - Order arrived in Nigeria port
out_for_delivery  - Out for final delivery
delivered         - Delivered to customer
cancelled         - Order cancelled
```

---

## Health Check

```
GET /health
```

**Always Available** - No authentication required

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T10:30:00.000Z"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Description of what went wrong"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created (order creation) |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid auth token |
| 404 | Not Found | Product/order doesn't exist |
| 500 | Server Error | Database or server issue |

---

## Authentication

To authenticate requests that require it:

1. Get JWT token from Supabase after user login
2. Include in every request header:
   ```
   Authorization: Bearer <JWT_TOKEN>
   ```

**Token Location in Frontend:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { session } = useAuth();
  const token = session?.access_token; // Use this in requests
}
```

---

## Rate Limiting

Currently not enforced. May be added in production.

---

## CORS

Frontend at `http://localhost:5173` is allowed to call backend at `http://localhost:3001`.

For production, update `FRONTEND_URL` in `backend/.env`.

---

## Testing with cURL

### Basic product search:
```bash
curl "http://localhost:3001/api/products?search=shirt&limit=5"
```

### With authentication:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/orders
```

### POST request:
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [...],
    "shipping_address": {...},
    "total_price": 50000
  }'
```

---

**Last Updated:** April 1, 2026
**API Version:** v1
**Backend:** Node.js/Express

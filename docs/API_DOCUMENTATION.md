# FarmDirect REST API Documentation

The FarmDirect Backend provides a full RESTful API for consumer marketplace shopping, farmer inventory and fulfillment management, and administrative moderation.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Authorization

All protected endpoints require an `Authorization` header with a Bearer JWT token:
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints

#### `POST /api/auth/register/customer`
Register a consumer account.
- **Request Body:**
  ```json
  {
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "password": "Password@123",
    "phone": "+91 98765 43210"
  }
  ```
- **Response `201`:**
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "...", "name": "Priya Sharma", "email": "priya@example.com", "role": "CONSUMER" },
      "token": "eyJhbGci..."
    }
  }
  ```

#### `POST /api/auth/register/farmer`
Register a farmer account and create a linked farm profile.
- **Request Body:**
  ```json
  {
    "name": "Rajesh Patil",
    "email": "rajesh@farm.com",
    "password": "Password@123",
    "phone": "+91 98220 11111",
    "farmName": "Green Valley Organics",
    "location": "Nashik, Maharashtra",
    "description": "Organic tomato & onion growers",
    "farmSize": "25 Acres",
    "farmingType": "Certified Organic",
    "experienceYears": 18
  }
  ```

#### `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "consumer1@farmdirect.com",
    "password": "User@123"
  }
  ```

#### `GET /api/auth/me`
Fetches authenticated user identity, role, and linked profile.

---

## 2. Products & Marketplace

#### `GET /api/products`
Query parameters:
- `search`: string
- `category`: slug (e.g. `vegetables`)
- `minPrice`, `maxPrice`: number
- `organic`: `true` | `false`
- `sort`: `newest` | `price_asc` | `price_desc`
- `page`: integer (default `1`)
- `limit`: integer (default `12`)

#### `GET /api/products/:id`
Retrieves product details with farmer entity, customer reviews, traditional price comparison, and related items.

#### `POST /api/products` *(FARMER, ADMIN)*
- **Request Body:**
  ```json
  {
    "name": "Organic Vine Tomatoes",
    "categoryId": "<CATEGORY_ID>",
    "description": "Crisp red tomatoes picked daily at sunrise.",
    "price": 38,
    "estimatedMarketPrice": 65,
    "unit": "KG",
    "availableQuantity": 180,
    "minimumOrderQuantity": 1,
    "organic": true,
    "image": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea"
  }
  ```

#### `PUT /api/products/:id` *(FARMER, ADMIN)*
Update pricing, stock availability, or description.

#### `DELETE /api/products/:id` *(FARMER, ADMIN)*

---

## 3. Cart & Shopping

#### `GET /api/cart`
Returns cart items with live stock validation, fee breakdown, and grouped by farm partner.

#### `POST /api/cart/items`
- **Request Body:**
  ```json
  {
    "productId": "<PRODUCT_ID>",
    "quantity": 2
  }
  ```

#### `PUT /api/cart/items/:id`
Update quantity.

#### `DELETE /api/cart/items/:id`
Remove item.

---

## 4. Orders & Checkout

#### `POST /api/orders`
Transactional order creation with atomic stock decrement and farmer payout ledger records.
- **Request Body:**
  ```json
  {
    "addressId": "<ADDRESS_ID>",
    "paymentProvider": "RAZORPAY",
    "notes": "Leave at front desk"
  }
  ```

#### `GET /api/orders`
List orders (filtered by role: consumer sees own, farmer sees relevant items, admin sees all).

#### `GET /api/orders/:id`
Full order invoice and interactive delivery pipeline status.

#### `PUT /api/orders/:id/status` *(FARMER, ADMIN)*
Advance status: `ACCEPTED` → `PREPARING` → `IN_TRANSIT` → `DELIVERED`.

#### `PUT /api/orders/:id/cancel`
Cancels eligible order and atomically restores product inventory.

---

## 5. Payments & Razorpay

#### `POST /api/payments/create`
Generates a payment order session.

#### `POST /api/payments/verify`
Validates cryptographic payment signature and marks order status `SUCCESS`.

---

## 6. Farmer Portal

#### `GET /api/farmers/dashboard/stats`
Farmer daily revenue, total net earnings, orders count, 7-day earnings chart data, and top selling produce.

#### `GET /api/farmers/dashboard/earnings`
Detailed payout ledger showing gross produce sales, 5% platform fee deduction, and net settled amounts.

#### `PUT /api/farmers/profile`
Update public farm bio, size, and practices.

---

## 7. Admin Operations

#### `GET /api/admin/dashboard`
Marketplace GMV, net platform commission revenue, total orders, and category distribution.

#### `GET /api/admin/farmers`
Audit farm partners with status filter (`PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED`).

#### `PUT /api/admin/farmers/:id/status`
Approve or suspend farmer partner accounts.

#### `GET /api/admin/users`
User directory with activation toggle.

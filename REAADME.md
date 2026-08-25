



Absolutely. If you’re going to give this to an AI coding agent such as AnyGavity, the prompt should specify the product, architecture, database, APIs, authentication, frontend pages, backend logic, roles, validations, seed data, and deployment.

You can copy-paste the following as one master prompt:

Build a Complete Full-Stack Farm-to-Consumer Marketplace

1. PROJECT OVERVIEW

Build a production-ready full-stack web application called FarmDirect.

Problem

Multiple intermediaries between farmers and consumers reduce farmers' earnings while increasing the final price paid by consumers.

Typical supply chain:

Farmer → Local Trader → Wholesaler → Distributor → Retailer → Consumer

This platform should create a shorter supply chain:

Farmer → FarmDirect → Consumer / Restaurant / Retailer

The platform connects farmers directly with customers and businesses, allowing farmers to list agricultural products, manage inventory, receive orders and payments, while consumers can discover products, compare prices, order products and track deliveries.

The application must include:

- Frontend
- Backend
- REST API
- Database
- Authentication
- Authorization
- Farmer dashboard
- Consumer dashboard
- Admin dashboard
- Product management
- Inventory management
- Cart
- Orders
- Payments
- Delivery management
- Reviews
- Notifications
- Search and filtering
- Price transparency
- Analytics
- Responsive UI

Build the application as a real working system, NOT a static UI prototype.

---

2. RECOMMENDED TECHNOLOGY STACK

Use the following stack unless there is a strong technical reason to change it.

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- React Hook Form
- Zod
- Lucide React icons
- Recharts

Backend

- Node.js
- Express.js
- TypeScript
- REST API
- JWT authentication
- bcrypt/argon2 for password hashing
- Zod for request validation

Database

Use:

- PostgreSQL
- Prisma ORM

File/Image Storage

Use a storage abstraction that can support:

- Cloudinary OR
- AWS S3

For local development, allow local image storage/mock URLs.

Payments

Create a payment abstraction supporting:

- Razorpay for India

Do not hard-code secret keys.

Use environment variables.

Maps / Location

Create an abstraction that can support:

- Google Maps API OR OpenStreetMap

The system should support farmer and customer locations.

Deployment

Prepare the application for:

- Frontend: Vercel
- Backend: Render/Railway
- Database: PostgreSQL/Supabase/Neon

Provide ".env.example".

---

3. USER ROLES

The system must have three primary roles.

FARMER

Farmers can:

- Register
- Login
- Create farmer profile
- Add farm information
- Add products
- Upload product images
- Set prices
- Set available quantity
- Update inventory
- Receive orders
- Accept/reject orders
- Update order status
- View earnings
- View sales analytics
- View customer reviews
- Withdraw earnings
- Manage profile

CONSUMER

Consumers can:

- Register
- Login
- Browse products
- Search products
- Filter products
- View farmer profiles
- View product details
- Add products to cart
- Change quantities
- Checkout
- Make payments
- Track orders
- Cancel eligible orders
- Review products/farmers
- View order history
- Manage addresses
- Manage profile

ADMIN

Admin can:

- Login
- View platform statistics
- Manage users
- Verify farmers
- Approve/reject farmer accounts
- Manage products
- Manage categories
- Monitor orders
- Monitor payments
- Manage disputes
- Manage reviews
- View platform revenue
- View farmer earnings
- View consumer activity
- Suspend users
- View system logs

---

4. CORE USER FLOW

Farmer Flow

1. Farmer opens website.
2. Selects "Register as Farmer".
3. Creates account.
4. Completes farmer profile.
5. Adds farm location.
6. Adds products.
7. Product enters marketplace.
8. Consumer purchases product.
9. Farmer receives order notification.
10. Farmer accepts order.
11. Farmer prepares product.
12. Farmer marks order as ready.
13. Delivery is assigned.
14. Customer receives product.
15. Payment is settled.
16. Farmer sees earnings.

Consumer Flow

1. Consumer registers.
2. Consumer enters delivery address.
3. Consumer browses marketplace.
4. Searches/filter products.
5. Opens product.
6. Views farmer information.
7. Adds product to cart.
8. Proceeds to checkout.
9. Selects delivery address.
10. Selects payment method.
11. Pays.
12. Order is created.
13. Consumer tracks order.
14. Product is delivered.
15. Consumer reviews product/farmer.

---

5. WEBSITE PAGES

Public Pages

Create:

- "/"
- "/about"
- "/how-it-works"
- "/farmers"
- "/products"
- "/products/:id"
- "/categories/:slug"
- "/login"
- "/register"
- "/register/farmer"
- "/register/customer"
- "/forgot-password"

Consumer Pages

Create:

- "/shop"
- "/cart"
- "/checkout"
- "/orders"
- "/orders/:id"
- "/wishlist"
- "/addresses"
- "/profile"
- "/reviews"

Farmer Pages

Create:

- "/farmer/dashboard"
- "/farmer/products"
- "/farmer/products/new"
- "/farmer/products/:id/edit"
- "/farmer/orders"
- "/farmer/orders/:id"
- "/farmer/inventory"
- "/farmer/earnings"
- "/farmer/analytics"
- "/farmer/reviews"
- "/farmer/profile"

Admin Pages

Create:

- "/admin/dashboard"
- "/admin/users"
- "/admin/farmers"
- "/admin/products"
- "/admin/orders"
- "/admin/payments"
- "/admin/categories"
- "/admin/reviews"
- "/admin/disputes"
- "/admin/analytics"
- "/admin/settings"

---

6. DATABASE DESIGN

Use PostgreSQL with Prisma.

Create the following models.

User

Fields:

- id
- name
- email
- phone
- passwordHash
- role
- avatar
- isActive
- isVerified
- createdAt
- updatedAt

Role enum:

- FARMER
- CONSUMER
- ADMIN

---

FarmerProfile

Fields:

- id
- userId
- farmName
- description
- farmSize
- farmingType
- experienceYears
- location
- latitude
- longitude
- verificationStatus
- governmentId/reference field where appropriate
- createdAt
- updatedAt

Do not store unnecessary sensitive identity documents.

---

Address

Fields:

- id
- userId
- name
- phone
- addressLine1
- addressLine2
- city
- state
- postalCode
- latitude
- longitude
- isDefault
- createdAt

---

Category

Fields:

- id
- name
- slug
- description
- image
- isActive
- createdAt

Example categories:

- Vegetables
- Fruits
- Grains
- Pulses
- Dairy
- Organic
- Spices
- Herbs

---

Product

Fields:

- id
- farmerId
- categoryId
- name
- slug
- description
- price
- unit
- availableQuantity
- minimumOrderQuantity
- organic
- harvestDate
- image
- isActive
- createdAt
- updatedAt

Units:

- KG
- GRAM
- LITRE
- PIECE
- DOZEN
- QUINTAL

---

ProductImage

Fields:

- id
- productId
- url
- altText
- sortOrder

---

Cart

Fields:

- id
- userId
- createdAt
- updatedAt

---

CartItem

Fields:

- id
- cartId
- productId
- quantity
- priceAtAddition

---

Order

Fields:

- id
- orderNumber
- customerId
- subtotal
- deliveryFee
- platformFee
- discount
- total
- paymentStatus
- orderStatus
- deliveryAddressSnapshot
- createdAt
- updatedAt

Important:

Store an address snapshot so historical orders remain correct even if the user changes their address later.

---

OrderItem

Fields:

- id
- orderId
- productId
- farmerId
- quantity
- unitPrice
- subtotal

---

Payment

Fields:

- id
- orderId
- provider
- transactionId
- amount
- currency
- status
- paidAt
- createdAt

---

Delivery

Fields:

- id
- orderId
- deliveryPartner
- trackingNumber
- status
- estimatedDelivery
- deliveredAt
- createdAt
- updatedAt

Delivery statuses:

- PENDING
- ASSIGNED
- PICKED_UP
- IN_TRANSIT
- OUT_FOR_DELIVERY
- DELIVERED
- FAILED

---

Review

Fields:

- id
- userId
- productId
- farmerId
- orderId
- rating
- comment
- createdAt
- updatedAt

Rating:

1–5

---

Wishlist

Fields:

- id
- userId
- productId
- createdAt

---

Notification

Fields:

- id
- userId
- title
- message
- type
- isRead
- createdAt

---

FarmerPayout

Fields:

- id
- farmerId
- orderId
- amount
- platformFee
- netAmount
- status
- paidAt
- createdAt

---

7. DATABASE RELATIONSHIPS

Implement proper foreign keys.

Relationships:

User → FarmerProfile

User → Addresses

User → Orders

User → Cart

User → Reviews

User → Wishlist

User → Notifications

Farmer → Products

Farmer → Orders

Farmer → FarmerPayouts

Category → Products

Product → ProductImages

Product → CartItems

Product → OrderItems

Product → Reviews

Order → OrderItems

Order → Payment

Order → Delivery

Order → Reviews

---

8. BACKEND STRUCTURE

Use a modular architecture.

backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── farmer.controller.ts
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── delivery.controller.ts
│   │   ├── review.controller.ts
│   │   ├── notification.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── farmer.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── delivery.service.ts
│   │   ├── review.service.ts
│   │   ├── notification.service.ts
│   │   └── payout.service.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── farmer.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── order.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── delivery.routes.ts
│   │   ├── review.routes.ts
│   │   ├── notification.routes.ts
│   │   └── admin.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rateLimit.middleware.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── order.validator.ts
│   │   └── user.validator.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── pagination.ts
│   │   ├── response.ts
│   │   └── logger.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── tests/
├── package.json
├── tsconfig.json
└── .env.example

---

9. FRONTEND STRUCTURE

frontend/
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorMessage.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   └── ProductDetails.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderStatus.tsx
│   │   │   └── OrderTimeline.tsx
│   │   │
│   │   └── farmers/
│   │       ├── FarmerCard.tsx
│   │       └── FarmerProfile.tsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   ├── auth/
│   │   ├── consumer/
│   │   ├── farmer/
│   │   └── admin/
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useCart.ts
│   │   └── useOrders.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.api.ts
│   │   ├── product.api.ts
│   │   ├── cart.api.ts
│   │   ├── order.api.ts
│   │   └── farmer.api.ts
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── farmer.ts
│   │
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   └── validation.ts
│   │
│   ├── router/
│   │   └── AppRouter.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env.example

---

10. AUTHENTICATION

Implement secure authentication.

Features:

- Register
- Login
- Logout
- JWT access token
- Refresh token if appropriate
- Password hashing
- Forgot password
- Reset password
- Email verification abstraction
- Role-based access control

Protect routes.

Example:

/admin/*       → ADMIN only
/farmer/*      → FARMER only
/orders        → authenticated users
/shop          → public

Never store plain-text passwords.

Never expose password hashes through API responses.

---

11. PRODUCT MARKETPLACE

Create a polished marketplace.

Product card should show:

- Product image
- Product name
- Farmer name
- Location
- Price
- Unit
- Organic badge
- Availability
- Rating
- Add to cart button

Filters:

- Category
- Price range
- Organic
- Location
- Farmer
- Rating
- Availability

Search should support:

- Product name
- Category
- Farmer name
- Location

---

12. PRICE TRANSPARENCY FEATURE

This is one of the main differentiating features.

For every product show:

Estimated traditional consumer price: ₹60/kg

Farmer receives: ₹42/kg

FarmDirect consumer price: ₹48/kg

Farmer's share: 87.5% of selling price

Create a visual comparison:

Traditional Supply Chain

Farmer        ₹25
Trader        ₹32
Wholesaler    ₹40
Retailer      ₹60
Consumer      ₹60


FarmDirect

Farmer        ₹42
Platform      ₹6
Consumer      ₹48

Do NOT present fabricated real-world savings as factual.

Clearly label these as:

- "Example"
- "Estimated"
- "Based on platform data"

The admin should be able to configure price comparison parameters.

---

13. CART

Implement:

- Add item
- Remove item
- Increase quantity
- Decrease quantity
- Validate stock
- Calculate subtotal
- Delivery fee
- Platform fee
- Discounts
- Final total

Prevent purchasing more than available inventory.

Handle products becoming unavailable between cart and checkout.

---

14. CHECKOUT

Checkout should contain:

Step 1

Address

Step 2

Order summary

Step 3

Payment

Step 4

Order confirmation

Show:

- Items
- Quantity
- Farmer
- Price
- Delivery fee
- Platform fee
- Discount
- Total

---

15. PAYMENT SYSTEM

Implement Razorpay through a service abstraction.

Flow:

1. Customer clicks Pay.
2. Backend creates payment order.
3. Frontend opens Razorpay checkout.
4. Payment completes.
5. Backend verifies payment signature.
6. Payment status is updated.
7. Order is confirmed.

Never trust payment status supplied directly by frontend.

Use webhook support where appropriate.

Payment statuses:

- PENDING
- SUCCESS
- FAILED
- REFUNDED

Use environment variables:

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

---

16. ORDER MANAGEMENT

Order statuses:

PENDING
CONFIRMED
ACCEPTED
PREPARING
READY_FOR_PICKUP
PICKED_UP
IN_TRANSIT
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
REJECTED

Create an order timeline.

Example:

✓ Order placed
✓ Farmer accepted order
✓ Product prepared
✓ Picked up
→ In transit
○ Out for delivery
○ Delivered

---

17. FARMER DASHBOARD

Dashboard should display:

- Today's sales
- Total sales
- Pending orders
- Products
- Inventory
- Earnings
- Average rating
- Recent orders

Charts:

- Daily sales
- Weekly sales
- Monthly sales
- Top-selling products
- Revenue by category

---

18. CONSUMER DASHBOARD

Display:

- Recent orders
- Total orders
- Favorite products
- Recommended products
- Active delivery
- Saved addresses

---

19. ADMIN DASHBOARD

Display:

- Total users
- Total farmers
- Total consumers
- Total products
- Orders today
- Total sales
- Platform revenue
- Farmer payouts
- Pending farmer verification
- Pending disputes

Charts:

- Orders over time
- Revenue over time
- Farmer registrations
- Consumer registrations
- Product categories
- Platform commission

---

20. FARMER VERIFICATION

Admin can:

- View farmer applications
- Review information
- Approve farmer
- Reject farmer
- Suspend farmer

Statuses:

PENDING
VERIFIED
REJECTED
SUSPENDED

Only verified farmers should be allowed to publish products.

---

21. REVIEWS

Only customers who purchased a product should be allowed to review it.

Implement:

- 1–5 star rating
- Comment
- Product rating
- Farmer rating
- Review moderation

Prevent duplicate reviews for the same order item.

---

22. NOTIFICATIONS

Create notifications for:

Customer

- Order placed
- Payment successful
- Order accepted
- Order shipped
- Order delivered
- Order cancelled

Farmer

- New order
- Order cancelled
- Payment received
- Review received

Admin

- New farmer application
- Dispute created
- Payment issue

Initially implement in-app notifications.

Create service abstractions for future:

- Email
- SMS
- WhatsApp
- Push notifications

---

23. API DESIGN

Use REST APIs.

Example:

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/categories
POST   /api/categories

GET    /api/farmers
GET    /api/farmers/:id
PUT    /api/farmers/profile

GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:id
DELETE /api/cart/items/:id

POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id/status

POST   /api/payments/create
POST   /api/payments/verify
POST   /api/payments/webhook

GET    /api/reviews
POST   /api/reviews

GET    /api/notifications
PUT    /api/notifications/:id/read

GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/farmers
PUT    /api/admin/farmers/:id/status

Use consistent API responses:

{
  "success": true,
  "message": "Product created successfully",
  "data": {}
}

Errors:

{
  "success": false,
  "message": "Product not found",
  "error": "PRODUCT_NOT_FOUND"
}

---

24. SECURITY

Implement:

- Password hashing
- JWT authentication
- Role-based authorization
- Request validation
- Rate limiting
- CORS
- Helmet
- SQL injection protection through Prisma
- XSS protection
- Secure cookies where applicable
- Environment variables
- Input sanitization
- API error handling
- File upload validation
- Maximum image size
- Allowed image MIME types

Never expose:

- JWT secrets
- Database credentials
- Payment secrets
- Password hashes

---

25. FRONTEND DESIGN

Create a modern agricultural marketplace UI.

Design direction:

- Clean
- Modern
- Trustworthy
- Mobile-first
- Professional
- Easy for farmers with limited technical experience

Homepage sections:

1. Hero section
2. Search bar
3. Browse categories
4. Featured products
5. Verified farmers
6. How it works
7. Price transparency section
8. Benefits for farmers
9. Benefits for consumers
10. Testimonials
11. Call to action
12. Footer

Use reusable components.

Do not create every page as one giant component.

---

26. MOBILE RESPONSIVENESS

The website must work properly on:

- Mobile phones
- Tablets
- Laptops
- Desktop

Farmer dashboard especially must be mobile friendly.

Navigation should become a mobile menu.

Tables should become responsive cards on mobile.

---

27. ERROR STATES

Handle:

- Network failure
- API failure
- Empty products
- Empty cart
- Out of stock
- Invalid quantity
- Unauthorized access
- Expired session
- Payment failure
- Product deleted
- Farmer unavailable

Display friendly error messages.

Do not expose raw backend stack traces to users.

---

28. LOADING STATES

Implement:

- Skeleton loaders
- Button loading states
- Page loading states
- Product loading skeleton
- Order loading skeleton

Prevent duplicate form submissions.

---

29. DATABASE SEEDING

Create realistic demo data.

Create:

Users

- 1 admin
- 5 farmers
- 10 consumers

Farmers

Examples:

- Green Valley Farms
- Sunrise Organics
- FreshRoots Farm
- Village Harvest
- Nature's Basket Farm

Products

Examples:

- Tomato
- Potato
- Onion
- Carrot
- Spinach
- Mango
- Banana
- Rice
- Wheat
- Turmeric

Add realistic quantities and prices.

Create sample orders, reviews and notifications.

Clearly label demo credentials.

---

30. ENVIRONMENT VARIABLES

Create ".env.example".

Example:

DATABASE_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

PORT=5000

FRONTEND_URL=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MAPS_API_KEY=

Never commit ".env".

Create ".gitignore".

---

31. TESTING

Implement backend tests for:

- Registration
- Login
- Authorization
- Product creation
- Product update
- Cart
- Checkout
- Order creation
- Inventory validation
- Payment verification
- Farmer verification

Test important edge cases.

Examples:

- User attempts to buy more stock than available.
- Consumer attempts to access farmer dashboard.
- Unverified farmer attempts to publish product.
- Customer attempts duplicate review.
- Payment verification fails.
- Product becomes unavailable during checkout.

---

32. DOCUMENTATION

Create:

README.md
API_DOCUMENTATION.md
DATABASE.md
DEPLOYMENT.md

README must explain:

- Project overview
- Features
- Technology stack
- Installation
- Environment variables
- Database setup
- Prisma migration
- Seed command
- Development commands
- Production build
- Deployment

---

33. ROOT PROJECT STRUCTURE

Use this final structure:

farm-direct/
│
├── frontend/
│
├── backend/
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── README.md
├── docker-compose.yml
└── package.json

If using Docker, configure:

PostgreSQL
Backend
Frontend

---

34. IMPORTANT BUSINESS LOGIC

Implement these rules carefully.

Inventory

When an order is successfully created:

availableQuantity -= purchasedQuantity

Use database transactions so two simultaneous customers cannot purchase the same stock incorrectly.

Order cancellation

If an order is cancelled before fulfillment:

inventory += cancelledQuantity

Farmer earnings

For an order item:

gross farmer amount
= quantity × unit price

Platform commission should be configurable.

Example:

platform commission = 5%
farmer earning = gross amount - commission

Do not hard-code the commission throughout the application.

Store it in configuration.

---

35. MULTI-FARMER CART

Support a cart containing products from multiple farmers.

At checkout:

Cart
 ├── Farmer A
 │    ├── Product 1
 │    └── Product 2
 │
 └── Farmer B
      ├── Product 3
      └── Product 4

The system should either:

Option A — Recommended for MVP

Create one customer order containing multiple order items and track farmer ownership on each order item.

OR

Option B

Split the cart into separate farmer orders.

Use Option A initially unless there is a strong reason to implement separate orders.

---

36. SEARCH

Implement backend pagination.

Example:

GET /api/products?page=1&limit=20

Support:

search
category
minPrice
maxPrice
organic
farmer
location
sort
page
limit

Sorting:

- Price low to high
- Price high to low
- Rating
- Newest
- Popular

---

37. ANALYTICS

Farmer analytics:

Total Revenue
Total Orders
Average Order Value
Top Products
Sales by Date

Admin analytics:

GMV
Platform Revenue
Farmer Earnings
Orders
Active Users
New Farmers
New Customers

Do not calculate analytics only on frontend.

Provide backend aggregation endpoints.

---

38. ACCESSIBILITY

Follow good accessibility practices:

- Semantic HTML
- Keyboard navigation
- Accessible labels
- Alt text
- Proper contrast
- Focus states
- ARIA only where necessary

---

39. SEO

For public pages implement:

- Page titles
- Meta descriptions
- Open Graph metadata
- SEO-friendly URLs
- Product structured data where appropriate

---

40. DEVELOPMENT REQUIREMENTS

Do NOT create fake buttons.

Every important button should perform a real action.

Do NOT use only hard-coded arrays for marketplace data.

The marketplace must retrieve data from the backend/database.

Do NOT use localStorage as the primary database.

Do NOT put database logic inside React components.

Do NOT expose backend secrets in frontend code.

Do NOT skip validation.

Do NOT skip error handling.

---

41. IMPLEMENTATION ORDER

Build the project in this order:

Phase 1 — Foundation

- Monorepo structure
- Frontend
- Backend
- PostgreSQL
- Prisma
- Environment configuration

Phase 2 — Authentication

- Registration
- Login
- JWT
- Roles
- Protected routes

Phase 3 — Farmer

- Farmer profile
- Verification
- Product CRUD
- Inventory

Phase 4 — Marketplace

- Product listing
- Search
- Filters
- Product details
- Farmer profiles

Phase 5 — Shopping

- Cart
- Checkout
- Address management

Phase 6 — Orders

- Order creation
- Order status
- Farmer order management
- Consumer order tracking

Phase 7 — Payments

- Razorpay integration
- Payment verification
- Payment webhook
- Refund abstraction

Phase 8 — Reviews

- Product reviews
- Farmer reviews

Phase 9 — Notifications

- In-app notifications

Phase 10 — Admin

- Admin dashboard
- User management
- Farmer verification
- Product management
- Order monitoring
- Analytics

Phase 11 — Polish

- Responsive design
- Loading states
- Error states
- Accessibility
- SEO
- Testing
- Documentation

---

42. ACCEPTANCE CRITERIA

The project is complete only when the following end-to-end flow works:

Farmer Registration
       ↓
Admin Verification
       ↓
Farmer Adds Product
       ↓
Product Appears in Marketplace
       ↓
Consumer Registers
       ↓
Consumer Searches Product
       ↓
Consumer Views Farmer
       ↓
Consumer Adds Product to Cart
       ↓
Consumer Checks Out
       ↓
Payment
       ↓
Order Created
       ↓
Inventory Reduced
       ↓
Farmer Receives Order
       ↓
Farmer Accepts Order
       ↓
Order Prepared
       ↓
Delivery
       ↓
Order Delivered
       ↓
Consumer Reviews Product
       ↓
Farmer Earnings Updated
       ↓
Admin Analytics Updated

Test this complete flow before declaring the project finished.

---

43. FINAL INSTRUCTION TO THE AI CODING AGENT

You are acting as a senior full-stack software engineer.

Do not merely generate a UI mockup.

Build the actual working application with:

- React frontend
- TypeScript
- Node/Express backend
- PostgreSQL
- Prisma
- REST APIs
- Authentication
- Authorization
- Real database persistence
- Validation
- Error handling
- Payment integration abstraction
- Responsive UI
- Farmer dashboard
- Consumer dashboard
- Admin dashboard

Before finishing:

1. Install dependencies.
2. Run the application.
3. Run database migrations.
4. Seed the database.
5. Test frontend-backend connectivity.
6. Test authentication.
7. Test CRUD operations.
8. Test cart.
9. Test checkout.
10. Test order creation.
11. Test inventory updates.
12. Test role permissions.
13. Test payment flow using test credentials/mode.
14. Fix all TypeScript errors.
15. Fix all build errors.
16. Fix console errors.
17. Verify responsive layouts.
18. Verify the complete end-to-end user flow.
19. Update README with exact commands.
20. Provide a final summary of everything implemented.

If an external API requires credentials, create the integration properly using environment variables and provide a mock/development fallback so the application can still run locally without production credentials.

Prioritize a fully functional MVP first, then add enhancements.

Never claim a feature is implemented unless it actually works end-to-end.
Implementation Plan - FarmDirect Full-Stack Marketplace
FarmDirect is a production-ready full-stack direct farm-to-consumer agricultural marketplace connecting farmers directly with consumers and businesses, eliminating excessive intermediaries and offering full price transparency.

User Review Required
IMPORTANT

Database Configuration: We will configure Prisma to use SQLite by default for immediate out-of-the-box local execution and zero external daemon setup required on Windows, while preserving full compatibility with PostgreSQL via environment variables for production (Supabase/Neon/Render).

Payment Integration: A Razorpay service abstraction will be built with full test-mode support (modal integration + signature verification logic) and a mock toggle for easy developer testing without needing live merchant keys.

Proposed System Architecture

[ Frontend: React + Vite + TypeScript + Tailwind CSS + Recharts + Lucide ]
                                 │
                            REST API (JWT)
                                 ▼
[ Backend: Node.js + Express + TypeScript + Zod Validation + Middleware ]
                                 │
                            Prisma ORM
                                 ▼
                     [ Database: SQLite / PostgreSQL ]
Proposed Changes
Monorepo Setup & Root Files
[NEW] 
package.json
Root scripts (npm run dev, npm run build, npm run seed) to manage both frontend and backend concurrently.
[NEW] 
.gitignore
Standard node_modules, dist, env, prisma dev sqlite files.
[NEW] 
docker-compose.yml
Docker setup for PostgreSQL, backend, and frontend services.
Backend Components
[NEW] 
backend/package.json
Express, TypeScript, @prisma/client, prisma, jsonwebtoken, bcryptjs, cors, zod, dotenv.
[NEW] 
backend/prisma/schema.prisma
Prisma Models:
User (roles: FARMER, CONSUMER, ADMIN)
FarmerProfile (farmName, description, size, farmingType, location, coordinates, verificationStatus)
Address (street, city, state, zip, coordinates, isDefault)
Category (name, slug, description, image)
Product (farmerId, categoryId, name, slug, description, price, unit, availableQuantity, organic, harvestDate, image)
ProductImage (productId, url, altText)
Cart & CartItem
Order & OrderItem (support multi-farmer items, snapshot delivery address)
Payment (orderId, provider, transactionId, amount, status)
Delivery (orderId, trackingNumber, status, estimatedDelivery)
Review (userId, productId, farmerId, orderId, rating, comment)
Wishlist
Notification
FarmerPayout (farmerId, orderId, amount, platformFee, netAmount, status)
[NEW] 
backend/prisma/seed.ts
Populate database with:
1 Admin user (admin@farmdirect.com)
5 Farmers (Green Valley Farms, Sunrise Organics, FreshRoots Farm, Village Harvest, Nature's Basket Farm)
10 Consumers
Categories (Vegetables, Fruits, Grains, Pulses, Organic, Spices, Herbs, Dairy)
20+ realistic agricultural products with stock, pricing, and images
Realistic orders, reviews, ratings, and sample payouts.
Backend Logic & REST Controllers
src/controllers/auth.controller.ts: Register (Farmer/Consumer), Login, JWT token issuance, Me endpoint.
src/controllers/product.controller.ts: List with filtering/search/pagination, detail, CRUD for farmers.
src/controllers/farmer.controller.ts: Public profiles, farmer dashboard stats, payouts.
src/controllers/cart.controller.ts: Add, update, delete cart items, stock validation.
src/controllers/order.controller.ts: Transactional order placement with Prisma (availableQuantity -= quantity), order tracking timeline, status updates by farmers/admin.
src/controllers/payment.controller.ts: Razorpay order creation, signature verification, webhook handler, test mode fallback.
src/controllers/review.controller.ts: Post-purchase reviews (1-5 stars).
src/controllers/admin.controller.ts: Platform stats, GMV, farmer verification (approve/reject/suspend), category management.
src/controllers/notification.controller.ts: In-app notification creation & read management.
Frontend Components
[NEW] 
frontend/package.json
React 18+, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts, React Router DOM, Axios, Zod.
UI Design System & Styling
Emerald green (#10b981), warm organic tones, sleek dark/light navigation header, glassmorphism cards, dynamic status badges, mobile responsive sidebar and mobile header.
Key Pages
Public: Home (Hero, Price Transparency comparison tool, Category grid, Featured products, Top farmers, How it Works), Marketplace Shop (/products), Product Detail (/products/:id), Farmers list (/farmers), Login & Registration (/login, /register/farmer, /register/customer).
Consumer: Shop (/shop), Cart (/cart), Multi-step Checkout (/checkout), Orders & Timeline (/orders, /orders/:id), Addresses (/addresses), Profile (/profile).
Farmer: Dashboard (/farmer/dashboard), Products Manager (/farmer/products), Inventory control (/farmer/inventory), Orders fulfillment (/farmer/orders), Earnings & Payouts (/farmer/earnings), Reviews (/farmer/reviews).
Admin: Overview & GMV (/admin/dashboard), Verification queue (/admin/farmers), User management (/admin/users), Platform Orders & Payments (/admin/orders), Category manager (/admin/categories).
Specialized Features
Price Transparency Calculator: Visual side-by-side comparison of Traditional Supply Chain margins vs FarmDirect Direct model with customizable breakdown rules.
Order Timeline Tracker: Stepper component showing real-time order status progress.
Documentation
[NEW] 
docs/API_DOCUMENTATION.md
[NEW] 
docs/DATABASE.md
[NEW] 
docs/DEPLOYMENT.md
[NEW] 
README.md
Verification Plan
Automated Verification
Run npm.cmd run build in both backend and frontend to verify no TypeScript compilation errors.
Run database migration and seed script npx.cmd prisma db push and npx.cmd tsx prisma/seed.ts to ensure clean database population.
Test backend REST endpoints for Auth, Products, Orders, Cart, Payments, and Admin functions.
Manual Verification
Test complete E2E flow:
Register new farmer -> Admin verification flow -> Add new agricultural product with stock -> Product appears live on shop.
Register consumer -> Search/filter product -> View price transparency widget -> Add to cart -> Complete checkout -> View order timeline.
Farmer receives order notification -> Accepts and marks order as ready/delivered -> Farmer earnings updated.
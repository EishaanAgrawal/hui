# FarmDirect Deployment Guide

This guide covers deployment across modern cloud providers (Vercel, Render/Railway, Supabase/Neon PostgreSQL, and Docker).

---

## 1. Cloud Database Setup (PostgreSQL)

You can provision a managed PostgreSQL database on **Supabase**, **Neon**, or **Render**:

1. Create a PostgreSQL database instance.
2. Retrieve the connection string:
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
   ```
3. Update `backend/prisma/schema.prisma` provider if deploying directly to PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   ```

---

## 2. Backend Deployment (Render / Railway)

1. **Root Directory**: `backend`
2. **Build Command**: `npm install && npm run build && npx prisma generate`
3. **Start Command**: `npm start`
4. **Environment Variables**:
   ```
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   JWT_SECRET=your_production_secure_jwt_secret
   FRONTEND_URL=https://your-farmdirect-app.vercel.app
   PLATFORM_COMMISSION_PERCENTAGE=5
   RAZORPAY_KEY_ID=rzp_live_...
   RAZORPAY_KEY_SECRET=...
   ```

---

## 3. Frontend Deployment (Vercel)

1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-api.onrender.com/api
   ```

---

## 4. Docker Compose Deployment (Single Server)

To deploy PostgreSQL, Backend, and Frontend in one single command:
```bash
docker-compose up -d --build
```
This starts:
- PostgreSQL on port `5432`
- Express API server on port `5000`
- Nginx / Vite frontend on port `5173`

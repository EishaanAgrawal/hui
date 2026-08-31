import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

// Public Pages
import { Home } from '../pages/public/Home';
import { Shop } from '../pages/public/Shop';
import { ProductDetail } from '../pages/public/ProductDetail';
import { FarmersList } from '../pages/public/FarmersList';
import { FarmerDetail } from '../pages/public/FarmerDetail';
import { About } from '../pages/public/About';
import { HowItWorks } from '../pages/public/HowItWorks';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';

// Consumer Pages
import { Cart } from '../pages/consumer/Cart';
import { Checkout } from '../pages/consumer/Checkout';
import { Orders } from '../pages/consumer/Orders';
import { OrderDetail } from '../pages/consumer/OrderDetail';
import { Addresses } from '../pages/consumer/Addresses';
import { Wishlist } from '../pages/consumer/Wishlist';
import { Profile } from '../pages/consumer/Profile';


// Farmer Pages
import { FarmerDashboard } from '../pages/farmer/FarmerDashboard';
import { FarmerProducts } from '../pages/farmer/FarmerProducts';
import { FarmerOrders } from '../pages/farmer/FarmerOrders';
import { FarmerInventory } from '../pages/farmer/FarmerInventory';
import { FarmerEarnings } from '../pages/farmer/FarmerEarnings';
import { FarmerReviews } from '../pages/farmer/FarmerReviews';
import { FarmerProfile } from '../pages/farmer/FarmerProfile';
import { FarmerForecast } from '../pages/farmer/FarmerForecast';


// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminFarmers } from '../pages/admin/AdminFarmers';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminCategories } from '../pages/admin/AdminCategories';
import { AdminLogistics } from '../pages/admin/AdminLogistics';
import { DriverDashboard } from '../pages/driver/DriverDashboard';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';

import { Loader } from '../components/common/Loader';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('CONSUMER' | 'FARMER' | 'ADMIN')[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullPage message="Verifying secure farm access..." />;
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main Layout Wrapper for Public & Consumer Pages
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};


export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public / Consumer Routes with Main Navbar & Footer */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/shop"
        element={
          <Layout>
            <Shop />
          </Layout>
        }
      />
      <Route
        path="/products"
        element={
          <Layout>
            <Shop />
          </Layout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <Layout>
            <ProductDetail />
          </Layout>
        }
      />
      <Route
        path="/farmers"
        element={
          <Layout>
            <FarmersList />
          </Layout>
        }
      />
      <Route
        path="/farmers/:id"
        element={
          <Layout>
            <FarmerDetail />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <About />
          </Layout>
        }
      />
      <Route
        path="/how-it-works"
        element={
          <Layout>
            <HowItWorks />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <Layout>
            <Register />
          </Layout>
        }
      />
      <Route
        path="/register/farmer"
        element={
          <Layout>
            <Register />
          </Layout>
        }
      />
      <Route
        path="/register/customer"
        element={
          <Layout>
            <Register />
          </Layout>
        }
      />

      {/* Consumer Protected Pages */}
      <Route
        path="/cart"
        element={
          <Layout>
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <Layout>
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/orders"
        element={
          <Layout>
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <Layout>
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/addresses"
        element={
          <Layout>
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/wishlist"
        element={
          <Layout>
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          </Layout>
        }
      />

      <Route
        path="/profile"
        element={
          <Layout>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Layout>
        }
      />

      {/* Farmer Portal Pages */}
      <Route
        path="/farmer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/products"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/inventory"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/earnings"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerEarnings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/reviews"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/profile"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/forecast"
        element={
          <ProtectedRoute allowedRoles={['FARMER', 'ADMIN']}>
            <FarmerForecast />
          </ProtectedRoute>
        }
      />

      {/* Admin Portal Pages */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/farmers"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminFarmers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logistics"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLogistics />
          </ProtectedRoute>
        }
      />

      {/* Driver Portal Pages */}
      <Route
        path="/driver/dashboard"
        element={
          <Layout>
            <DriverDashboard />
          </Layout>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

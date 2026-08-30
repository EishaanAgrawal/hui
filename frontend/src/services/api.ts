import axios from 'axios';
import {
  User,
  Category,
  Product,
  CartResponse,
  Order,
  FarmerProfile,
  Review,
  NotificationItem,
  Address,
} from '../types';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmdirect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified response unwrapping & 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional auto logout or token clear on 401
      if (window.location.pathname.startsWith('/farmer') || window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('farmdirect_token');
        localStorage.removeItem('farmdirect_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data.data;
  },
  registerConsumer: async (data: any) => {
    const res = await api.post('/auth/register/customer', data);
    return res.data.data;
  },
  registerFarmer: async (data: any) => {
    const res = await api.post('/auth/register/farmer', data);
    return res.data.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};

// Products API
export const productApi = {
  getProducts: async (params?: any): Promise<{ products: Product[]; pagination: any }> => {
    const res = await api.get('/products', { params });
    return res.data.data;
  },
  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get(`/products/${id}`);
    return res.data.data;
  },
  createProduct: async (data: any): Promise<Product> => {
    const res = await api.post('/products', data);
    return res.data.data;
  },
  updateProduct: async (id: string, data: any): Promise<Product> => {
    const res = await api.put(`/products/${id}`, data);
    return res.data.data;
  },
  deleteProduct: async (id: string) => {
    const res = await api.delete(`/products/${id}`);
    return res.data.data;
  },
};

// Categories API
export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get('/categories');
    return res.data.data;
  },
  createCategory: async (data: any): Promise<Category> => {
    const res = await api.post('/categories', data);
    return res.data.data;
  },
};

// Cart API
export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const res = await api.get('/cart');
    return res.data.data;
  },
  addItem: async (productId: string, quantity: number = 1): Promise<CartResponse> => {
    const res = await api.post('/cart/items', { productId, quantity });
    return res.data.data;
  },
  updateItem: async (itemId: string, quantity: number): Promise<CartResponse> => {
    const res = await api.put(`/cart/items/${itemId}`, { quantity });
    return res.data.data;
  },
  removeItem: async (itemId: string): Promise<CartResponse> => {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data.data;
  },
  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data.data;
  },
};

// Orders API
export const orderApi = {
  createOrder: async (data: {
    addressId?: string;
    customAddress?: any;
    notes?: string;
    paymentProvider?: string;
  }): Promise<Order> => {
    const res = await api.post('/orders', data);
    return res.data.data;
  },
  getOrders: async (params?: any): Promise<Order[]> => {
    const res = await api.get('/orders', { params });
    return res.data.data;
  },
  getOrderById: async (id: string): Promise<Order> => {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data.data;
  },
  cancelOrder: async (id: string): Promise<Order> => {
    const res = await api.put(`/orders/${id}/cancel`);
    return res.data.data;
  },
};

// Payment API
export const paymentApi = {
  createPaymentOrder: async (amount: number, orderId?: string) => {
    const res = await api.post('/payments/create', { amount, orderId });
    return res.data.data;
  },
  verifyPayment: async (data: any) => {
    const res = await api.post('/payments/verify', data);
    return res.data.data;
  },
};

// Farmers API
export const farmerApi = {
  getFarmers: async (params?: any): Promise<FarmerProfile[]> => {
    const res = await api.get('/farmers', { params });
    return res.data.data;
  },
  getFarmerById: async (id: string): Promise<FarmerProfile> => {
    const res = await api.get(`/farmers/${id}`);
    return res.data.data;
  },
  updateProfile: async (data: any): Promise<FarmerProfile> => {
    const res = await api.put('/farmers/profile', data);
    return res.data.data;
  },
  getDashboardStats: async (): Promise<any> => {
    const res = await api.get('/farmers/dashboard/stats');
    return res.data.data;
  },
  getEarnings: async (): Promise<any> => {
    const res = await api.get('/farmers/dashboard/earnings');
    return res.data.data;
  },
  getMyProducts: async (): Promise<Product[]> => {
    const res = await api.get('/farmers/products');
    return res.data.data;
  },
};

// Admin API
export const adminApi = {
  getDashboardStats: async (): Promise<any> => {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },
  getFarmers: async (params?: any): Promise<FarmerProfile[]> => {
    const res = await api.get('/admin/farmers', { params });
    return res.data.data;
  },
  updateFarmerStatus: async (id: string, status: string) => {
    const res = await api.put(`/admin/farmers/${id}/status`, { status });
    return res.data.data;
  },
  getUsers: async (params?: any): Promise<User[]> => {
    const res = await api.get('/admin/users', { params });
    return res.data.data;
  },
  toggleUserStatus: async (id: string) => {
    const res = await api.put(`/admin/users/${id}/toggle-status`);
    return res.data.data;
  },
};

// Reviews API
export const reviewApi = {
  createReview: async (data: {
    productId: string;
    orderId?: string;
    rating: number;
    comment: string;
  }): Promise<Review> => {
    const res = await api.post('/reviews', data);
    return res.data.data;
  },
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const res = await api.get(`/reviews/product/${productId}`);
    return res.data.data;
  },
};

// Notifications API
export const notificationApi = {
  getNotifications: async (): Promise<{ notifications: NotificationItem[]; unreadCount: number }> => {
    const res = await api.get('/notifications');
    return res.data.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data.data;
  },
};

// User API
export const userApi = {
  getAddresses: async (): Promise<Address[]> => {
    const res = await api.get('/user/addresses');
    return res.data.data;
  },
  addAddress: async (data: any): Promise<Address> => {
    const res = await api.post('/user/addresses', data);
    return res.data.data;
  },
  deleteAddress: async (id: string) => {
    const res = await api.delete(`/user/addresses/${id}`);
    return res.data.data;
  },
  getWishlist: async (): Promise<Product[]> => {
    const res = await api.get('/user/wishlist');
    return res.data.data;
  },
  toggleWishlist: async (productId: string): Promise<{ inWishlist: boolean }> => {
    const res = await api.post('/user/wishlist/toggle', { productId });
    return res.data.data;
  },
};

// Forecast API
export const forecastApi = {
  getOverview: async (period?: number): Promise<any> => {
    const res = await api.get('/forecast/farmer/overview', { params: { period } });
    return res.data.data;
  },
};

// Route API
export const routeApi = {
  optimize: async (orderIds: string[]): Promise<any> => {
    const res = await api.post('/routes/optimize', { orderIds });
    return res.data.data;
  },
  optimizeMultiFarm: async (orderId: string): Promise<any> => {
    const res = await api.post('/routes/multi-farm', { orderId });
    return res.data.data;
  },
  save: async (data: any): Promise<any> => {
    const res = await api.post('/routes/save', data);
    return res.data.data;
  },
};

export default api;

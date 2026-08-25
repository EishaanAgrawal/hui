export type Role = 'CONSUMER' | 'FARMER' | 'ADMIN';
export type FarmerVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
  isVerified: boolean;
  farmerProfile?: FarmerProfile;
  createdAt?: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  farmName: string;
  farmerName?: string;
  avatar?: string;
  email?: string;
  description?: string;
  farmSize?: string;
  farmingType?: string;
  experienceYears?: number;
  location: string;
  latitude?: number;
  longitude?: number;
  verificationStatus: FarmerVerificationStatus;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  productsCount?: number;
  avgRating?: number;
  totalReviews?: number;
  products?: Product[];
  reviews?: Review[];
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  farmerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  estimatedMarketPrice?: number;
  farmerDirectPercentage?: number;
  traditionalMiddlemanCost?: number;
  farmerSharePercentage?: number;
  unit: string;
  availableQuantity: number;
  minimumOrderQuantity: number;
  organic: boolean;
  harvestDate?: string;
  image?: string;
  isActive: boolean;
  category?: Category;
  farmer?: FarmerProfile;
  reviewsCount?: number;
  totalReviews?: number;
  avgRating?: number;
  reviews?: Review[];
  relatedProducts?: Product[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  priceAtAddition: number;
  isAvailable?: boolean;
  itemSubtotal?: number;
}

export interface GroupedFarmerCart {
  farmerId: string;
  farmName: string;
  location: string;
  items: CartItem[];
  subtotal: number;
}

export interface CartResponse {
  cartId: string;
  items: CartItem[];
  groupedByFarmer: GroupedFarmerCart[];
  itemCount: number;
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  total: number;
  freeDeliveryThreshold: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  farmerId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  subtotal: number;
  status: string;
  product?: {
    name: string;
    image?: string;
    unit: string;
  };
  farmer?: {
    farmName: string;
    location: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddressSnapshot: string;
  deliveryAddress?: Address;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: {
    provider: string;
    transactionId?: string;
    amount: number;
    currency: string;
    status: string;
    paidAt?: string;
  };
  delivery?: {
    deliveryPartner: string;
    trackingNumber: string;
    status: string;
    estimatedDelivery?: string;
    deliveredAt?: string;
  };
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  farmerId: string;
  orderId?: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
  product?: {
    name: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FarmerPayout {
  id: string;
  farmerId: string;
  orderId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    createdAt: string;
    orderStatus: string;
  };
}

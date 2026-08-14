// src/api/types.ts

export interface PharmacyApplication {
  _id?: string;
  status?: 'pending' | 'approved' | 'rejected' | string;
  pharmacyName?: string;
  submittedAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // ✅ Replaced 'any' with 'unknown'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user' | 'pharmacy_owner';
  phone?: string;
  image?: string;
  isEmailVerified: boolean;
  pharmacyApplication?: PharmacyApplication;
  createdAt: string;
  updatedAt: string;
}

export interface Pharmacy {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  image: string;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  owner: {
    _id: string;
    fullName: string;
    email: string;
  };
  medicines: Array<{
    medicine: {
      _id: string;
      name: string;
      genericName: string;
      category: string;
    };
    price: number;
    quantity: number;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  }>;
}

export interface AuthResponse {
  message: string;
  requiresVerification?: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  category: string;
  manufacturer: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  user: User;
  pharmacy: Pharmacy | string; // ✅ Replaced 'any' with 'Pharmacy | string'
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: 'cod' | 'online' | 'bank_transfer';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  paymentDetails?: {
    transactionId?: string;
    paymentGateway?: string;
    paidAt?: string;
  };
  deliveryMethod?: 'pickup' | 'delivery';
  deliveryAddress?: {
    address: string;
    coordinates?: { lat: number; lng: number };
    instructions?: string;
    contactPhone: string;
    landmark?: string;
  };
  deliveryStatus?: 'pending' | 'processing' | 'dispatched' | 'delivered' | 'failed';
  deliveryFee?: number;
  specialInstructions?: string;
}

export interface OrderItem {
  _id: string;
  medicine: Medicine;
  quantity: number;
  price: number;
}

export interface Review {
  _id: string;
  user: User;
  pharmacy: Pharmacy | string; // ✅ Replaced 'any' with 'Pharmacy | string'
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
  updatedAt: string;
}
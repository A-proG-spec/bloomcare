export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user' | 'pharmacy_owner';
  phone?: string;
  image?: string;
  isEmailVerified: boolean;
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
  pharmacy: any;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  // Payment fields
  paymentMethod?: 'cod' | 'online' | 'bank_transfer';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  paymentDetails?: {
    transactionId?: string;
    paymentGateway?: string;
    paidAt?: string;
  };
  // Delivery fields
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
  pharmacy: any;
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
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
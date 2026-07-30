import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { orderApi } from '../../api/endpoints/order';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
  FaBox, 
  FaStore, 
  FaUser, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaCreditCard,
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaArrowLeft,
  FaShoppingBag
} from 'react-icons/fa';

const statusColors: { [key: string]: 'success' | 'warning' | 'danger' | 'info' } = {
  'Pending': 'warning',
  'Confirmed': 'info',
  'Processing': 'info',
  'Shipped': 'info',
  'Delivered': 'success',
  'Cancelled': 'danger',
};

const paymentStatusColors: { [key: string]: 'success' | 'warning' | 'danger' | 'info' } = {
  'pending': 'warning',
  'paid': 'success',
  'failed': 'danger',
  'refunded': 'info',
};

type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
type PaymentMethod = 'cod' | 'online' | 'bank_transfer';
type DeliveryMethod = 'pickup' | 'delivery';
type DeliveryStatus = 'pending' | 'processing' | 'dispatched' | 'delivered' | 'failed';

interface PaymentDetails {
  transactionId?: string;
  paymentGateway?: string;
  paidAt?: string;
}

interface DeliveryAddress {
  address: string;
  coordinates?: { lat: number; lng: number };
  instructions?: string;
  contactPhone: string;
  landmark?: string;
}

interface ExtendedOrder {
  _id: string;
  status: OrderStatus;
  orderDate: string;
  totalPrice: number;
  pharmacy?: { name: string; address: string; phone: string };
  user?: { fullName: string; email: string };
  items?: Array<{ _id: string; medicine: { name: string }; quantity: number; price: number }>;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentIntentId?: string;
  paymentDetails?: PaymentDetails;
  deliveryMethod?: DeliveryMethod;
  deliveryAddress?: DeliveryAddress;
  deliveryStatus?: DeliveryStatus;
  deliveryFee?: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedOrder, isLoading, fetchOrderDetails, cancelOrder } = useOrderStore();
  const { user } = useAuthStore();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id, fetchOrderDetails]);

  const handleCancelOrder = async () => {
    if (!id || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    setIsSubmitting(true);
    try {
      await cancelOrder(id, cancelReason);
      toast.success('Order cancelled successfully');
      setIsCancelModalOpen(false);
      await fetchOrderDetails(id);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!id) return;
    try {
      await orderApi.updateOrderStatus(id, { status });
      toast.success(`Order status updated to ${status}`);
      await fetchOrderDetails(id);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Button onClick={() => navigate('/orders')}>
          <FaArrowLeft className="mr-2" />
          Back to Orders
        </Button>
      </div>
    );
  }

  const order = selectedOrder as ExtendedOrder;
  const canCancel = ['Pending', 'Confirmed', 'Processing'].includes(order.status);
  const isAdmin = user?.role === 'admin';
  const isPharmacyOwner = user?.role === 'pharmacy_owner';

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <FaArrowLeft className="mr-2" />
        Back
      </Button>

      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-[rgb(0,88,64)] flex items-center gap-3">
          <FaShoppingBag className="w-7 h-7" />
          Order #{order._id.slice(-6)}
        </h1>
        <Badge variant={statusColors[order.status] || 'default'}>
          {order.status}
        </Badge>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-[rgb(0,88,64)] mb-3 flex items-center gap-2">
              <FaStore className="w-4 h-4" />
              Pharmacy
            </h3>
            <p className="text-lg font-medium text-[rgb(0,88,64)]">{order.pharmacy?.name}</p>
            <p className="text-sm text-gray-600">{order.pharmacy?.address}</p>
            <p className="text-sm text-gray-600">{order.pharmacy?.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-[rgb(0,88,64)] mb-3 flex items-center gap-2">
              <FaCalendarAlt className="w-4 h-4" />
              Order Info
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="text-[rgb(0,88,64)]">{new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-[rgb(0,88,64)] font-medium">{order.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-5">
        <h3 className="font-semibold text-[rgb(0,88,64)] mb-3 flex items-center gap-2">
          <FaCreditCard className="w-4 h-4" />
          Payment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="text-[rgb(0,88,64)] font-medium">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
               order.paymentMethod === 'online' ? 'Online Payment' : 
               order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <Badge variant={paymentStatusColors[order.paymentStatus || 'pending']}>
              {(order.paymentStatus || 'PENDING').toUpperCase()}
            </Badge>
          </div>
          {order.paymentDetails?.transactionId && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="text-sm text-[rgb(0,88,64)] font-mono">{order.paymentDetails.transactionId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Information */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-5">
        <h3 className="font-semibold text-[rgb(0,88,64)] mb-3 flex items-center gap-2">
          <FaTruck className="w-4 h-4" />
          Delivery Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Delivery Method</p>
            <p className="text-[rgb(0,88,64)] font-medium">
              {order.deliveryMethod === 'pickup' ? 'Pickup from Pharmacy' : 'Home Delivery'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Delivery Status</p>
            <Badge variant={order.deliveryStatus === 'delivered' ? 'success' : order.deliveryStatus === 'failed' ? 'danger' : 'info'}>
              {(order.deliveryStatus || 'PENDING').toUpperCase()}
            </Badge>
          </div>
          {order.deliveryMethod === 'delivery' && order.deliveryAddress && (
            <>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="text-[rgb(0,88,64)]">{order.deliveryAddress.address || 'Not provided'}</p>
              </div>
              {order.deliveryAddress.contactPhone && (
                <div>
                  <p className="text-sm text-gray-500">Contact Phone</p>
                  <p className="text-[rgb(0,88,64)]">{order.deliveryAddress.contactPhone}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-5">
        <h3 className="font-semibold text-[rgb(0,88,64)] mb-4 flex items-center gap-2">
          <FaBox className="w-4 h-4" />
          Items
        </h3>
        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item._id} className="flex justify-between items-center pb-4 border-b border-[rgb(236,240,239)] last:border-0">
              <div>
                <p className="font-medium text-[rgb(0,88,64)]">{item.medicine?.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-[rgb(0,88,64)]">{formatCurrency(item.price * item.quantity)}</p>
                <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t-2 border-[rgb(209,248,67)] flex justify-between">
          <span className="font-bold text-lg text-[rgb(0,88,64)]">Total:</span>
          <span className="font-bold text-lg text-[rgb(0,88,64)]">{formatCurrency(order.totalPrice)}</span>
        </div>
      </div>

      {/* Actions */}
      {canCancel && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsCancelModalOpen(true)}
          >
            Cancel Order
          </Button>
        </div>
      )}

      {/* Admin/Pharmacy Owner Actions */}
      {(isAdmin || isPharmacyOwner) && (
        <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-5">
          <h3 className="font-semibold text-[rgb(0,88,64)] mb-3 flex items-center gap-2">
            <FaUser className="w-4 h-4" />
            Admin Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            {(['Confirmed', 'Processing', 'Shipped', 'Delivered'] as OrderStatus[]).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={order.status === status ? 'primary' : 'outline'}
                onClick={() => handleUpdateStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        title="Cancel Order"
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelReason('');
        }}
        onConfirm={handleCancelOrder}
        confirmText="Cancel Order"
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          <p className="text-gray-600">Why do you want to cancel this order?</p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter your reason..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(0,88,64)] focus:border-transparent transition-all duration-200"
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
};
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { paymentApi } from '../../api/endpoints/payment';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaTruck, 
  FaStore, 
  FaArrowRight,
  FaLock,
  FaShoppingBag,
  FaPhone,
  FaMapMarkerAlt,
  FaHome,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ============================================================
// STRIPE PAYMENT FORM COMPONENT
// ============================================================
const StripePaymentForm: React.FC<{
  clientSecret: string;
  orderId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ clientSecret, orderId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true);
      console.log('✅ Stripe is ready');
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (!stripe || !elements) {
      toast.error('Stripe is not loaded. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Submit the payment form
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setPaymentError(submitError.message || 'Payment submission failed');
        onError(submitError.message || 'Payment submission failed');
        setIsLoading(false);
        return;
      }

      // Confirm the payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/orders?orderId=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setPaymentError(confirmError.message || 'Payment confirmation failed');
        onError(confirmError.message || 'Payment confirmation failed');
        setIsLoading(false);
        return;
      }

      // Payment succeeded - verify with backend
      try {
        const paymentIntentId = clientSecret.split('_secret_')[0];
        await paymentApi.verifyPayment(paymentIntentId, orderId);
        toast.success('Payment successful!');
        onSuccess();
      } catch (verifyError: any) {
        console.error('Verification error:', verifyError);
        toast.error('Payment succeeded but verification failed. Please contact support.');
        onError(verifyError.message || 'Verification failed');
      }
    } catch (error: any) {
      const msg = error.message || 'An unexpected error occurred';
      setPaymentError(msg);
      onError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 min-h-[220px]">
        {!isReady ? (
          <div className="flex flex-col justify-center items-center py-8">
            <FaSpinner className="w-8 h-8 text-[#22c55e] animate-spin" />
            <p className="text-sm text-gray-500 mt-3 font-outfit">Loading secure payment form...</p>
          </div>
        ) : (
          <>
            <PaymentElement 
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    name: '',
                    email: '',
                  },
                },
              }}
            />
            {paymentError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-outfit">{paymentError}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="text-xs text-gray-500 flex items-center gap-2 font-outfit">
        <FaLock className="w-3 h-3 text-[#22c55e]" />
        <span>Secure payment processed by Stripe. Your card details are never stored on our servers.</span>
      </div>

      <Button 
        type="submit" 
        fullWidth 
        isLoading={isLoading} 
        disabled={!stripe || !isReady}
        icon={<FaCreditCard className="w-4 h-4" />}
        className="bg-[#22c55e] hover:bg-[#16a34a]"
      >
        Pay Now
      </Button>
    </form>
  );
};

// ============================================================
// MAIN CHECKOUT COMPONENT
// ============================================================
export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { createOrder } = useOrderStore();
  const { items, getItemsByPharmacy, getTotalPrice, getTotalItems, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');

  // Handle payment verification on redirect from Stripe
  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    const orderIdParam = searchParams.get('orderId');

    if (paymentIntentId && redirectStatus === 'succeeded' && orderIdParam) {
      verifyPayment(paymentIntentId, orderIdParam);
    }
  }, [searchParams]);

  const verifyPayment = async (paymentIntentId: string, orderIdParam: string) => {
    setIsLoading(true);
    try {
      const result = await paymentApi.verifyPayment(paymentIntentId, orderIdParam);
      if (result.success) {
        toast.success('Payment verified successfully!');
        navigate(`/orders/${orderIdParam}`);
      } else {
        toast.error('Payment verification failed. Please try again.');
        navigate('/cart');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment verification failed');
      navigate('/cart');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not authenticated or cart empty
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const groupedItems = getItemsByPharmacy();
  const pharmacyIds = Object.keys(groupedItems);

const handlePlaceOrder = async () => {
  if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
    toast.error('Please enter your delivery address');
    return;
  }

  if (deliveryMethod === 'delivery' && !deliveryPhone.trim()) {
    toast.error('Please enter your phone number for delivery');
    return;
  }

  setIsSubmitting(true);
  try {
    const orderPromises = pharmacyIds.map(async (pharmacyId) => {
      const pharmacyItems = groupedItems[pharmacyId].items;
      return createOrder(
        pharmacyId,
        pharmacyItems.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
        paymentMethod // ✅ Pass payment method
      );
    });

    const orders = await Promise.all(orderPromises);

    if (paymentMethod === 'cod') {
      clearCart();
      toast.success('Order placed successfully!');
      if (orders.length === 1) {
        navigate(`/orders/${orders[0]._id}`);
      } else {
        navigate('/orders');
      }
      setIsSubmitting(false);
    } else {
      const firstOrder = orders[0];
      const paymentResult = await paymentApi.initializePayment({
        orderId: firstOrder._id,
        paymentMethod: 'card',
      });

      setClientSecret(paymentResult.clientSecret);
      setOrderId(firstOrder._id);
      setIsSubmitting(false);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to place order');
    setIsSubmitting(false);
  }
};

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show Stripe payment form if client secret is available
  if (clientSecret && orderId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-bold text-black font-outfit">Complete Payment</h1>
          <span className="text-xs bg-[#d1f843] text-black px-3 py-1 rounded-xl font-medium font-outfit">
            Secure
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 font-outfit">Order #{orderId.slice(-6)}</p>
                <p className="text-lg font-bold text-black font-outfit">
                  Total: {formatCurrency(getTotalPrice())}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaLock className="w-3 h-3 text-[#22c55e]" />
                <span className="font-outfit">Secure payment via Stripe</span>
              </div>
            </div>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#22c55e',
                  colorBackground: '#ffffff',
                  colorText: '#000000',
                  fontFamily: 'Outfit, system-ui, sans-serif',
                },
                rules: {
                  '.Input': {
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '12px',
                  },
                  '.Label': {
                    color: '#000000',
                  },
                },
              },
            }}
          >
            <StripePaymentForm
              clientSecret={clientSecret}
              orderId={orderId}
              onSuccess={() => {
                // ✅ Clear cart only after successful payment
                clearCart();
                toast.success('Payment successful!');
                navigate(`/orders/${orderId}`);
              }}
              onError={(error) => {
                toast.error(error || 'Payment failed. Please try again.');
                // Don't clear cart on error - user can retry
                setClientSecret(null);
                setOrderId(null);
              }}
            />
          </Elements>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN CHECKOUT UI (shown before Stripe form)
  // ============================================================
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-black mb-6 flex items-center gap-3 font-outfit">
        <FaShoppingBag className="w-7 h-7 text-[#22c55e]" />
        Checkout
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-semibold text-black mb-4 flex items-center gap-2 font-outfit">
              <FaShoppingBag className="w-4 h-4 text-[#22c55e]" />
              Order Summary
            </h2>
            {pharmacyIds.map((pharmacyId) => {
              const pharmacy = groupedItems[pharmacyId];
              const pharmacyTotal = pharmacy.items.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
              );

              return (
                <div key={pharmacyId} className="mb-4 last:mb-0">
                  <h3 className="font-medium text-black flex items-center gap-1 font-outfit">
                    <FaStore className="w-4 h-4 text-[#22c55e]" />
                    {pharmacy.pharmacyName}
                  </h3>
                  <div className="space-y-2 mt-2">
                    {pharmacy.items.map((item) => (
                      <div key={item.medicineId} className="flex justify-between text-sm font-outfit">
                        <span className="text-gray-600">{item.medicineName} × {item.quantity}</span>
                        <span className="font-medium text-black">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-bold">
                    <span className="text-gray-600 font-outfit">Subtotal</span>
                    <span className="text-black font-outfit">{formatCurrency(pharmacyTotal)}</span>
                  </div>
                </div>
              );
            })}
            <div className="mt-4 pt-4 border-t-2 border-[#d1f843] flex justify-between text-lg font-bold">
              <span className="text-black font-outfit">Total ({getTotalItems()} items from {pharmacyIds.length} {pharmacyIds.length === 1 ? 'pharmacy' : 'pharmacies'})</span>
              <span className="text-black font-outfit">{formatCurrency(getTotalPrice())}</span>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-semibold text-black mb-4 flex items-center gap-2 font-outfit">
              <FaTruck className="w-4 h-4 text-[#22c55e]" />
              Delivery Method
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 flex-1 text-left ${
                  deliveryMethod === 'pickup'
                    ? 'border-[#22c55e] bg-[#22c55e]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-black flex items-center gap-2 font-outfit">
                  <FaStore className="w-4 h-4 text-[#22c55e]" />
                  Pickup
                </div>
                <div className="text-sm text-gray-500 font-outfit">Collect from pharmacy</div>
                <div className="text-xs text-[#22c55e] font-medium font-outfit">Free</div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 flex-1 text-left ${
                  deliveryMethod === 'delivery'
                    ? 'border-[#22c55e] bg-[#22c55e]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-black flex items-center gap-2 font-outfit">
                  <FaHome className="w-4 h-4 text-[#22c55e]" />
                  Delivery
                </div>
                <div className="text-sm text-gray-500 font-outfit">Deliver to your address</div>
                <div className="text-xs text-gray-500 font-outfit">Fee calculated at checkout</div>
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          {deliveryMethod === 'delivery' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="font-semibold text-black mb-4 flex items-center gap-2 font-outfit">
                <FaMapMarkerAlt className="w-4 h-4 text-[#22c55e]" />
                Delivery Address
              </h2>
              <div className="space-y-4">
                <Input
                  label="Phone Number *"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  icon={<FaPhone className="w-4 h-4" />}
                />
                <Input
                  label="Delivery Address *"
                  placeholder="Enter your full address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  icon={<FaMapMarkerAlt className="w-4 h-4" />}
                />
                <Input
                  label="Special Instructions (optional)"
                  placeholder="Landmarks, gate code, etc."
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 sticky top-24">
            <h2 className="font-semibold text-black mb-4 flex items-center gap-2 font-outfit">
              <FaCreditCard className="w-4 h-4 text-[#22c55e]" />
              Payment
            </h2>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  paymentMethod === 'cod'
                    ? 'border-[#22c55e] bg-[#22c55e]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-black flex items-center gap-2 font-outfit">
                  <FaMoneyBillWave className="w-4 h-4 text-[#22c55e]" />
                  Cash on Delivery
                </div>
                <div className="text-sm text-gray-500 font-outfit">Pay when you receive</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  paymentMethod === 'online'
                    ? 'border-[#22c55e] bg-[#22c55e]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-black flex items-center gap-2 font-outfit">
                  <FaCreditCard className="w-4 h-4 text-[#22c55e]" />
                  Online Payment
                </div>
                <div className="text-sm text-gray-500 font-outfit">Pay with Card</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 font-outfit">
                  <FaLock className="w-3 h-3 text-[#22c55e]" />
                  Secure via Stripe
                </div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm font-outfit">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-black">{formatCurrency(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm font-outfit">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="text-black">{deliveryMethod === 'pickup' ? 'Free' : formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t-2 border-[#d1f843] font-outfit">
                <span className="text-black">Total</span>
                <span className="text-black">{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              className="w-full mt-6 bg-[#22c55e] hover:bg-[#16a34a]"
              isLoading={isSubmitting}
              disabled={deliveryMethod === 'delivery' && (!deliveryAddress || !deliveryPhone)}
              icon={<FaArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              {paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Pay'}
            </Button>

            {deliveryMethod === 'delivery' && (!deliveryAddress || !deliveryPhone) && (
              <p className="text-xs text-red-500 mt-2 font-outfit">Please fill in delivery details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
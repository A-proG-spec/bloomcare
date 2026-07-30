import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
  FaShoppingCart, 
  FaTrash, 
  FaPlus, 
  FaMinus, 
  FaStore, 
  FaArrowRight,
  FaCreditCard,
  FaShoppingBag
} from 'react-icons/fa';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getItemsByPharmacy,
    getTotalItems,
    getTotalPrice 
  } = useCartStore();

  const groupedItems = getItemsByPharmacy();
  const pharmacyIds = Object.keys(groupedItems);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-24 h-24 bg-[rgb(236,240,239)] rounded-full flex items-center justify-center mx-auto mb-4">
          <FaShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-[rgb(0,88,64)] mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Browse pharmacies and add medicines to your cart.</p>
        <Button onClick={() => navigate('/pharmacies')}>
          Browse Pharmacies
        </Button>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[rgb(0,88,64)] flex items-center gap-3">
          <FaShoppingCart className="w-7 h-7" />
          Your Cart
          <span className="text-sm font-normal text-gray-500">({getTotalItems()} items)</span>
        </h1>
        <Button variant="outline" size="sm" onClick={clearCart}>
          <FaTrash className="w-4 h-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      {pharmacyIds.map((pharmacyId) => {
        const pharmacy = groupedItems[pharmacyId];
        const pharmacyTotal = items
          .filter(item => item.pharmacyId === pharmacyId)
          .reduce((sum, item) => sum + item.price * item.quantity, 0);

        return (
          <div key={pharmacyId} className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-5 mb-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgb(236,240,239)]">
              <FaStore className="w-4 h-4 text-[rgb(0,88,64)]" />
              <h2 className="font-semibold text-[rgb(0,88,64)]">{pharmacy.pharmacyName}</h2>
              <span className="text-xs text-gray-500 ml-auto">{pharmacy.items.length} items</span>
            </div>

            <div className="space-y-4">
              {pharmacy.items.map((item) => (
                <div key={item.medicineId} className="flex items-center gap-4 pb-4 border-b border-[rgb(236,240,239)] last:border-0">
                  <img
                    src={item.image || 'https://via.placeholder.com/60?text=Med'}
                    alt={item.medicineName}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-[rgb(0,88,64)]">{item.medicineName}</h3>
                    <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.medicineId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-[rgb(236,240,239)] hover:bg-[rgb(0,88,64)]/10 text-gray-700 flex items-center justify-center transition-colors"
                    >
                      <FaMinus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-medium text-[rgb(0,88,64)]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.medicineId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-[rgb(236,240,239)] hover:bg-[rgb(0,88,64)]/10 text-gray-700 flex items-center justify-center transition-colors"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-[rgb(0,88,64)]">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.medicineId)}
                    className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[rgb(236,240,239)] flex justify-between">
              <span className="font-semibold text-[rgb(0,88,64)]">Pharmacy Total</span>
              <span className="font-bold text-[rgb(0,88,64)]">{formatCurrency(pharmacyTotal)}</span>
            </div>
          </div>
        );
      })}

      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-5">
        <div className="flex justify-between text-lg font-bold">
          <span>Total ({getTotalItems()} items from {pharmacyIds.length} {pharmacyIds.length === 1 ? 'pharmacy' : 'pharmacies'})</span>
          <span className="text-[rgb(0,88,64)]">{formatCurrency(getTotalPrice())}</span>
        </div>
        <Button onClick={handleCheckout} className="mt-4 w-full" size="lg">
          <FaCreditCard className="mr-2" />
          Proceed to Checkout
          <FaArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
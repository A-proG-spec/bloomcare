import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { medicineApi } from '../../api/endpoints/medicine';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';
import { 
  FaPills, 
  FaShoppingCart, 
  FaStore, 
  FaMapMarkerAlt, 
  FaStar,
  FaArrowLeft,
  FaInfoCircle
} from 'react-icons/fa';

// ✅ ADDED: Proper types
interface Medicine {
  _id: string;
  name: string;
  genericName?: string;
  category?: string;
  manufacturer?: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PharmacyAvailability {
  pharmacyId: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  price: number;
  quantity: number;
  stockStatus: string;
}

// ✅ ADDED: API Response type
interface MedicineApiResponse {
  data?: {
    medicine?: Medicine;
    availableAt?: PharmacyAvailability[];
  };
  medicine?: Medicine;
  availableAt?: PharmacyAvailability[];
}

export const MedicineDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem, getItemQuantity, items, clearCart } = useCartStore();

  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [availableAt, setAvailableAt] = useState<PharmacyAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ FIXED: Define loadMedicine BEFORE useEffect
  const loadMedicine = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await medicineApi.getMedicineById(id) as MedicineApiResponse;
      const medicineData = response?.data?.medicine || response?.medicine || response;
      const pharmaciesData = response?.data?.availableAt || response?.availableAt || [];
      
      if (!medicineData || Object.keys(medicineData).length === 0) {
        toast.error('Medicine not found');
        navigate('/medicines');
        return;
      }
      
      setMedicine(medicineData as Medicine);
      setAvailableAt(pharmaciesData);
    } catch (error: unknown) {
      // ✅ FIXED: Removed 'any' type
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Load medicine error:', err);
      toast.error(err.response?.data?.message || 'Failed to load medicine');
      navigate('/medicines');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  // ✅ FIXED: useEffect with proper dependency
  useEffect(() => {
    loadMedicine();
  }, [loadMedicine]);

  const handleAddToCart = (pharmacyId?: string, pharmacyName?: string, price?: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!pharmacyId || !price || !medicine) {
      toast.error('Please select a pharmacy first');
      return;
    }

    const currentPharmacy = items.length > 0 ? items[0].pharmacyId : null;
    const currentPharmacyName = items.length > 0 ? items[0].pharmacyName : null;

    const pharmacy = availableAt.find(p => p.pharmacyId === pharmacyId);
    if (!pharmacy || pharmacy.quantity <= 0) {
      toast.error('This medicine is out of stock at this pharmacy');
      return;
    }

    if (currentPharmacy && currentPharmacy !== pharmacyId) {
      if (!confirm(`Your cart already has items from "${currentPharmacyName}". Would you like to clear it and add this item?`)) {
        return;
      }
      clearCart();
    }

    const success = addItem({
      medicineId: medicine._id,
      medicineName: medicine.name,
      price: price,
      quantity: 1,
      image: medicine.image || '',
      pharmacyId: pharmacyId,
      pharmacyName: pharmacyName || pharmacy.name,
      stockStatus: pharmacy.stockStatus,
      maxQuantity: pharmacy.quantity,
    });

    if (success) {
      toast.success(`Added ${medicine.name} to cart`);
      setIsModalOpen(false);
    } else {
      toast.error('Failed to add to cart');
    }
  };

  const handleConfirmAddToCart = () => {
    if (!selectedPharmacy) {
      toast.error('Please select a pharmacy');
      return;
    }

    const pharmacy = availableAt.find(p => p.pharmacyId === selectedPharmacy);
    if (!pharmacy) return;

    handleAddToCart(pharmacy.pharmacyId, pharmacy.name, pharmacy.price);
  };

  const handleViewPharmacy = (pharmacyId: string) => {
    navigate(`/pharmacy/${pharmacyId}`);
  };

  const cartQuantity = getItemQuantity(id || '');
  const isInCart = cartQuantity > 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4 text-lg">Medicine not found</p>
        <Button onClick={() => navigate('/medicines')}>
          <FaArrowLeft className="mr-2" />
          Back to Medicines
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <FaArrowLeft className="mr-2" />
        Back
      </Button>

      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <img
              src={medicine.image || 'https://via.placeholder.com/400?text=Medicine'}
              alt={medicine.name}
              className="w-full h-64 md:h-80 object-cover rounded-xl"
            />
          </div>

          <div className="md:w-2/3 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-[rgb(0,88,64)]">{medicine.name}</h1>
              {medicine.genericName && (
                <p className="text-lg text-gray-600 mt-1 flex items-center gap-1">
                  <FaPills className="w-4 h-4 text-gray-400" />
                  Generic: {medicine.genericName}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {medicine.category && (
                <Badge variant="info">{medicine.category}</Badge>
              )}
              {medicine.manufacturer && (
                <Badge variant="default">{medicine.manufacturer}</Badge>
              )}
              {isInCart && (
                <Badge variant="accent">
                  <FaShoppingCart className="w-3 h-3 inline mr-1" />
                  {cartQuantity} in cart
                </Badge>
              )}
            </div>

            {medicine.description && (
              <div className="bg-[rgb(236,240,239)]/50 rounded-xl p-4">
                <h3 className="font-semibold text-[rgb(0,88,64)] mb-2 flex items-center gap-2">
                  <FaInfoCircle className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">{medicine.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-[rgb(236,240,239)]">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-500">Available at</p>
                  <p className="text-lg font-bold text-[rgb(0,88,64)]">
                    {availableAt.length} {availableAt.length === 1 ? 'pharmacy' : 'pharmacies'}
                  </p>
                </div>
                {availableAt.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Price range</p>
                    <p className="text-lg font-bold text-[rgb(0,88,64)]">
                      {formatCurrency(Math.min(...availableAt.map(p => p.price)))} -{' '}
                      {formatCurrency(Math.max(...availableAt.map(p => p.price)))}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                if (availableAt.length === 1) {
                  const pharmacy = availableAt[0];
                  handleAddToCart(pharmacy.pharmacyId, pharmacy.name, pharmacy.price);
                } else if (availableAt.length > 1) {
                  setSelectedPharmacy(null);
                  setIsModalOpen(true);
                } else {
                  toast.error('This medicine is not available at any pharmacy');
                }
              }}
              size="lg"
              className="mt-4"
              disabled={availableAt.length === 0}
            >
              <FaShoppingCart className="mr-2" />
              {availableAt.length === 0
                ? 'Not Available'
                : isInCart
                ? `Add More - ${formatCurrency(Math.min(...availableAt.map(p => p.price)))}`
                : `Add to Cart - ${formatCurrency(Math.min(...availableAt.map(p => p.price)))}`}
            </Button>
            {availableAt.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                This medicine is currently not available at any pharmacy.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Available Pharmacies */}
      {availableAt.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-[rgb(0,88,64)] mb-4 flex items-center gap-2">
            <FaStore className="w-6 h-6" />
            Available at Pharmacies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAt.map((pharmacy) => (
              <div
                key={pharmacy.pharmacyId}
                className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={pharmacy.image || 'https://via.placeholder.com/80?text=Pharmacy'}
                    alt={pharmacy.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-[rgb(0,88,64)]">{pharmacy.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                      {pharmacy.address}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600 flex items-center gap-0.5">
                        <FaStar className="w-3 h-3 text-yellow-400" />
                        {pharmacy.rating.toFixed(1)}
                      </span>
                      <Badge
                        variant={
                          pharmacy.stockStatus === 'In Stock'
                            ? 'success'
                            : pharmacy.stockStatus === 'Low Stock'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {pharmacy.stockStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-lg text-[rgb(0,88,64)]">
                        {formatCurrency(pharmacy.price)}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPharmacy(pharmacy.pharmacyId)}
                        >
                          <FaStore className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(pharmacy.pharmacyId, pharmacy.name, pharmacy.price)}
                          disabled={pharmacy.quantity <= 0}
                        >
                          <FaShoppingCart className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pharmacy Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        title={`Select Pharmacy for ${medicine?.name}`}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPharmacy(null);
        }}
        onConfirm={handleConfirmAddToCart}
        confirmText="Add to Cart"
      >
        <div className="space-y-3">
          {availableAt.map((pharm) => (
            <label
              key={pharm.pharmacyId}
              className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedPharmacy === pharm.pharmacyId
                  ? 'border-[rgb(0,88,64)] bg-[rgb(0,88,64)]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="pharmacy"
                value={pharm.pharmacyId}
                checked={selectedPharmacy === pharm.pharmacyId}
                onChange={(e) => setSelectedPharmacy(e.target.value)}
                className="sr-only"
              />
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-[rgb(0,88,64)] flex items-center gap-1">
                    <FaStore className="w-4 h-4" />
                    {pharm.name}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                    {pharm.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    Stock: {pharm.quantity > 0 ? `${pharm.quantity} available` : 'Out of stock'}
                  </p>
                </div>
                <span className="font-bold text-lg text-[rgb(0,88,64)]">
                  {formatCurrency(pharm.price)}
                </span>
              </div>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
};
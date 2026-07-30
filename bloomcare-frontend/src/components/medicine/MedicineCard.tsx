import React from 'react';
import { Link } from 'react-router-dom';
import type { Medicine } from '../../api/types';
import { Badge } from '../common/Badge';
import { useCartStore } from '../../store/cartStore';
import { FaShoppingCart, FaPlus } from 'react-icons/fa';
// ✅ REMOVED: FaPills, FaCheck

interface MedicineCardProps {
  medicine: Medicine;
  showPrice?: boolean;
  showAddButton?: boolean;
  price?: number;
  quantity?: number;
  stockStatus?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  onAddToCart?: (medicine: Medicine, pharmacyId?: string, pharmacyName?: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  showPrice = false,
  showAddButton = false,
  price,
  quantity,
  stockStatus,
  pharmacyId,
  pharmacyName,
  onAddToCart,
}) => {
  const defaultImage = 'https://via.placeholder.com/150?text=Medicine';
  const inStock = stockStatus !== 'Out of Stock' && (quantity ?? 0) > 0;
  
  const cartQuantity = useCartStore((state) => state.getItemQuantity(medicine._id));
  const isInCart = cartQuantity > 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(medicine, pharmacyId, pharmacyName);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#22c55e]/30 transition-all duration-200">
      <Link to={`/medicines/${medicine._id}`} className="block relative">
        <img
          src={medicine.image || defaultImage}
          alt={medicine.name}
          className="w-full h-48 object-cover"
        />
        {isInCart && (
          <div className="absolute top-2 right-2 bg-[#d1f843] text-black text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
            <FaShoppingCart className="w-3 h-3" />
            {cartQuantity} in cart
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link to={`/medicines/${medicine._id}`} className="block group">
          <h3 className="font-semibold text-black group-hover:text-[#22c55e] transition-colors truncate text-lg font-outfit">
            {medicine.name}
          </h3>
        </Link>
        {medicine.genericName && (
          <p className="text-xs text-gray-500 mt-1 font-outfit">{medicine.genericName}</p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {medicine.category && (
            <Badge variant="info" size="sm">
              {medicine.category}
            </Badge>
          )}
          {stockStatus && (
            <Badge variant={inStock ? 'success' : 'danger'} size="sm">
              {stockStatus}
            </Badge>
          )}
        </div>
        <div className="mt-3 flex justify-between items-center">
          {showPrice && price !== undefined ? (
            <span className="font-bold text-lg text-black font-outfit">
              ${price.toFixed(2)}
            </span>
          ) : (
            <span className="text-sm text-gray-500 font-outfit">Price varies by pharmacy</span>
          )}
          {showAddButton && onAddToCart && (
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 font-outfit ${
                isInCart
                  ? 'bg-[#d1f843] text-black hover:bg-[#bde63a]'
                  : 'bg-[#22c55e] text-white hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isInCart ? <FaPlus className="w-3 h-3" /> : <FaShoppingCart className="w-3 h-3" />}
              {isInCart ? 'Add More' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import type { Pharmacy } from '../../types/pharmacy.types';
import { FaStar, FaStore, FaMapMarkerAlt, FaPhone, FaChevronRight } from 'react-icons/fa';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  compact?: boolean;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy, compact = false }) => {
  const defaultImage = 'https://via.placeholder.com/150?text=Pharmacy';

  // ✅ Check if pharmacy is open (simplified)
  const isOpen = pharmacy.isActive;

  return (
    <Link to={`/pharmacy/${pharmacy._id}`} className="block">
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#22c55e]/30 transition-all duration-200 ${
        compact ? 'p-3' : 'p-4'
      }`}>
        <div className="flex items-start gap-3">
          {/* ✅ Pharmacy Image */}
          <img
            src={pharmacy.image || defaultImage}
            alt={pharmacy.name}
            className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} rounded-xl object-cover flex-shrink-0`}
          />
          
          <div className="flex-1 min-w-0">
            {/* ✅ Pharmacy Name */}
            <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-black truncate flex items-center gap-1`}>
              <FaStore className="w-3 h-3 text-[#22c55e] flex-shrink-0" />
              {pharmacy.name}
            </h3>
            
            {/* ✅ Address */}
            <p className="text-xs text-gray-600 truncate flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0 text-gray-400" />
              {pharmacy.address}
            </p>
            
            {/* ✅ Rating & Status */}
            <div className="flex items-center flex-wrap gap-2 mt-1.5">
              <div className="flex items-center gap-0.5">
                <FaStar className="w-3 h-3 text-yellow-400" />
                <span className="text-xs font-medium text-black">{pharmacy.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-gray-500">({pharmacy.totalReviews || 0})</span>
              </div>
              
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isOpen 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {isOpen ? 'Open' : 'Closed'}
              </span>
              
              {pharmacy.medicines && pharmacy.medicines.length > 0 && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#d1f843] rounded-full" />
                  {pharmacy.medicines.length} medicines
                </span>
              )}
            </div>

            {/* ✅ Phone (optional) */}
            {!compact && pharmacy.phone && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <FaPhone className="w-3 h-3 text-gray-400" />
                {pharmacy.phone}
              </p>
            )}
          </div>

          {/* ✅ Arrow indicator */}
          <FaChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-2" />
        </div>
      </div>
    </Link>
  );
};
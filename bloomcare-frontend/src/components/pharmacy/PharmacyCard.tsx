import React from 'react';
import { Link } from 'react-router-dom';
import type { Pharmacy } from '../../types/pharmacy.types';
import { FaStar, FaStore, FaMapMarkerAlt } from 'react-icons/fa';


interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy }) => {
  const defaultImage = 'https://via.placeholder.com/150?text=Pharmacy';

  return (
    <Link to={`/pharmacy/${pharmacy._id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-[#22c55e]/30 transition-all duration-200 p-4 h-full">
        <div className="flex items-start gap-4">
          <img
            src={pharmacy.image || defaultImage}
            alt={pharmacy.name}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-black truncate flex items-center gap-1 font-outfit">
              <FaStore className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
              {pharmacy.name}
            </h3>
            <p className="text-sm text-gray-600 truncate flex items-center gap-1 mt-0.5 font-outfit">
              <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0 text-gray-400" />
              {pharmacy.address}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <FaStar className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-black font-outfit">{pharmacy.rating.toFixed(1)}</span>
                <span className="text-xs text-gray-500 font-outfit">({pharmacy.totalReviews} reviews)</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-xl font-medium font-outfit ${
                pharmacy.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {pharmacy.isActive ? 'Open' : 'Closed'}
              </span>
            </div>
            {pharmacy.medicines && pharmacy.medicines.length > 0 && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 font-outfit">
                <span className="w-1.5 h-1.5 bg-[#d1f843] rounded-full" />
                {pharmacy.medicines.length} medicines available
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
import React from 'react';
import type { Medicine } from '../../api/types';
import { MedicineCard } from './MedicineCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { FaPills } from 'react-icons/fa';

interface MedicineListProps {
  medicines: Medicine[];
  isLoading?: boolean;
  showPrice?: boolean;
  showAddButton?: boolean;
  pharmacyId?: string;
  pharmacyName?: string;
  onAddToCart?: (medicine: Medicine, pharmacyId?: string, pharmacyName?: string) => void;
  medicineDetails?: {
    [key: string]: { price: number; quantity: number; stockStatus: string };
  };
}

export const MedicineList: React.FC<MedicineListProps> = ({
  medicines,
  isLoading = false,
  showPrice = false,
  showAddButton = false,
  pharmacyId,
  pharmacyName,
  onAddToCart,
  medicineDetails,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <FaPills className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-outfit">No medicines found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {medicines.map((medicine) => {
        const details = medicineDetails?.[medicine._id];
        return (
          <MedicineCard
            key={medicine._id}
            medicine={medicine}
            showPrice={showPrice}
            showAddButton={showAddButton}
            price={details?.price}
            quantity={details?.quantity}
            stockStatus={details?.stockStatus}
            pharmacyId={pharmacyId}
            pharmacyName={pharmacyName}
            onAddToCart={onAddToCart}
          />
        );
      })}
    </div>
  );
};
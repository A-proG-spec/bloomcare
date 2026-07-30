import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '../../api/endpoints/admin';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import { 
  FaStore, 
  FaSearch, 
  FaPowerOff, 
  FaStar, 
  FaMapMarkerAlt, 
  FaUser,
} from 'react-icons/fa';

// ✅ ADDED: Proper types for Medicine
interface Medicine {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  stockStatus: string;
}

// ✅ ADDED: Proper types for Pharmacy
interface Pharmacy {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  image?: string;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  medicines?: Medicine[];
  owner?: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

export const AdminPharmacies: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPharmacies, setTotalPharmacies] = useState(0);

  // ✅ FIXED: Use ref to prevent double execution
  const hasLoaded = useRef(false);

  const loadPharmacies = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getAllPharmacies({
        search: search || undefined,
        page,
        limit: 10,
      });
      setPharmacies(result.pharmacies || []);
      setTotalPages(result.pagination?.pages || 1);
      setTotalPharmacies(result.pagination?.total || 0);
    } catch {
      // ✅ FIXED: Removed unused 'error' variable
      toast.error('Failed to load pharmacies');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  // ✅ FIXED: Only call once on mount
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadPharmacies();
    }
  }, [loadPharmacies]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminApi.togglePharmacyStatus(id);
      toast.success(`Pharmacy ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      loadPharmacies();
    } catch {
      // ✅ FIXED: Removed unused 'error' variable
      toast.error('Failed to toggle pharmacy status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2 font-outfit">
          <FaStore className="w-6 h-6 text-[#22c55e]" />
          Pharmacy Management
        </h1>
        <span className="text-sm text-gray-500 font-outfit">Total: {totalPharmacies} pharmacies</span>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search pharmacies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all duration-200 font-outfit"
          />
        </div>
      </div>

      {/* Pharmacies Grid */}
      {pharmacies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <FaStore className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-outfit">No pharmacies found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacies.map((pharmacy) => (
            <div key={pharmacy._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-[#22c55e]/30 transition-all duration-200">
              <div className="flex items-start gap-4">
                <img
                  src={pharmacy.image || 'https://via.placeholder.com/80'}
                  alt={pharmacy.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-black flex items-center gap-1 font-outfit">
                    <FaStore className="w-4 h-4 text-[#22c55e]" />
                    {pharmacy.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate flex items-center gap-1 font-outfit">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    {pharmacy.address}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 font-outfit">
                    <FaUser className="w-3 h-3" />
                    {pharmacy.owner?.fullName || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-xl font-medium font-outfit ${
                      pharmacy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {pharmacy.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-0.5 font-outfit">
                      <FaStar className="w-3 h-3 text-yellow-400" />
                      {pharmacy.rating?.toFixed(1) || '0.0'} ({pharmacy.totalReviews || 0})
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-outfit">{pharmacy.medicines?.length || 0} medicines</span>
                <Button
                  size="sm"
                  variant={pharmacy.isActive ? 'outline' : 'primary'}
                  onClick={() => handleToggleStatus(pharmacy._id, pharmacy.isActive)}
                  icon={<FaPowerOff className="w-3 h-3" />}
                >
                  {pharmacy.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pharmacies.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 font-outfit">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
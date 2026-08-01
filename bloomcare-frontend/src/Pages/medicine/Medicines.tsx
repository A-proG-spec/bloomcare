import React, { useState, useEffect } from 'react';
import { useMedicineStore } from '../../store/medicineStore';
import {MedicineList} from '../../components/medicine/MedicineList';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FaSearch, FaFilter, FaPills } from 'react-icons/fa';

export const Medicines: React.FC = () => {
  const {
    medicines,
    isLoading,
    categories,
    manufacturers,
    fetchMedicines,
    fetchCategories,
    fetchManufacturers,
  } = useMedicineStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
  }, [fetchCategories, fetchManufacturers]);

  useEffect(() => {
    fetchMedicines({
      search: search || undefined,
      category: selectedCategory || undefined,
      manufacturer: selectedManufacturer || undefined,
      page,
      limit: 20,
    });
  }, [search, selectedCategory, selectedManufacturer, page, fetchMedicines]);

  return (
    // ✅ Added flex centering container
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div className="max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-black flex items-center gap-3">
            <FaPills className="w-6 h-6 md:w-7 md:h-7 text-[#22c55e]" />
            Medicines
          </h1>
          <span className="text-xs bg-[#d1f843] text-black px-3 py-1 rounded-xl font-medium">
            {medicines.length} available
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={<FaSearch className="w-4 h-4" />}
            />
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent bg-white transition-all duration-200"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedManufacturer}
                onChange={(e) => {
                  setSelectedManufacturer(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent bg-white transition-all duration-200"
              >
                <option value="">All Manufacturers</option>
                {manufacturers.map((mfg) => (
                  <option key={mfg} value={mfg}>
                    {mfg}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <MedicineList medicines={medicines} isLoading={isLoading} />

        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-center font-medium text-gray-600">Page {page}</span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={medicines.length < 20}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Medicines;
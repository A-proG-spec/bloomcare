import React, { useState, useEffect } from 'react';
import { useMedicineStore } from '../../store/medicineStore';
import { MedicineList } from '../../components/medicine/MedicineList';
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-[rgb(0,88,64)] flex items-center gap-3">
          <FaPills className="w-7 h-7" />
          Medicines
        </h1>
        <span className="text-xs bg-[rgb(209,248,67)] text-[rgb(0,88,64)] px-3 py-1 rounded-xl font-medium">
          {medicines.length} available
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(0,88,64)] focus:border-transparent bg-white transition-all duration-200"
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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(0,88,64)] focus:border-transparent bg-white transition-all duration-200"
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

      {/* Medicines Grid */}
      <MedicineList medicines={medicines} isLoading={isLoading} />

      {/* Pagination */}
      <div className="flex justify-center gap-2">
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
  );
};
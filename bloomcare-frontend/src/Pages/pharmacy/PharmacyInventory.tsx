import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePharmacyStore } from '../../store/pharmacyStore';
import { medicineApi } from '../../api/endpoints/medicine';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
  FaPills, 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaStore,
  FaArrowLeft,
  FaInfoCircle,
  // ✅ REMOVED: FaFilter,
  // ✅ REMOVED: FaExclamationTriangle
} from 'react-icons/fa';

interface MedicineInventory {
  _id: string;
  name: string;
  genericName?: string;
  category: string;
  manufacturer: string;
  description?: string;
  image?: string;
  price: number;
  quantity: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface AvailableMedicine {
  _id: string;
  name: string;
  category: string;
  manufacturer: string;
}

export const PharmacyInventory: React.FC = () => {
  const navigate = useNavigate();
  const { pharmacy, isLoading: isPharmacyLoading, fetchPharmacy } = usePharmacyStore();
  const [medicines, setMedicines] = useState<MedicineInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineInventory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    medicineId: '',
    price: '',
    quantity: '',
    searchMedicine: '',
  });

  const [newMedicineData, setNewMedicineData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    description: '',
    image: '',
    price: '',
    quantity: '',
  });

  const [availableMedicines, setAvailableMedicines] = useState<AvailableMedicine[]>([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);

  // ✅ FIXED: Use ref to prevent double execution
  const hasLoaded = useRef(false);

  const loadPharmacyAndInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchPharmacy();
      if (pharmacy?._id) {
        await loadInventory(pharmacy._id);
      }
    } catch (error) {
      console.error('Failed to load pharmacy:', error);
      toast.error('Failed to load pharmacy');
    } finally {
      setIsLoading(false);
    }
  }, [fetchPharmacy, pharmacy?._id]);

  const loadInventory = useCallback(async (pharmacyId: string) => {
    try {
      const result = await medicineApi.getPharmacyMedicines(pharmacyId, {
        search: search || undefined,
        inStockOnly: inStockOnly || undefined,
      });
      setMedicines(result.medicines || []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      toast.error('Failed to load inventory');
    }
  }, [search, inStockOnly]);

  // ✅ FIXED: Only call once on mount
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadPharmacyAndInventory();
    }
  }, [loadPharmacyAndInventory]);

  useEffect(() => {
    if (pharmacy?._id) {
      loadInventory(pharmacy._id);
    }
  }, [search, inStockOnly, pharmacy?._id, loadInventory]);

  const handleAddMedicine = async () => {
    if (!formData.medicineId || !formData.price || !formData.quantity) {
      toast.error('Please fill all fields');
      return;
    }

    if (!pharmacy?._id) {
      toast.error('Pharmacy not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await medicineApi.addMedicineToPharmacy({
        pharmacyId: pharmacy._id,
        medicineId: formData.medicineId,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
      });
      toast.success('Medicine added to inventory');
      setIsAddModalOpen(false);
      resetForm();
      await loadInventory(pharmacy._id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAndAddMedicine = async () => {
    const { name, category, manufacturer, price, quantity, genericName, description, image } = newMedicineData;

    if (!name || !category || !manufacturer || !price || !quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!pharmacy?._id) {
      toast.error('Pharmacy not found');
      return;
    }

    setIsSubmitting(true);
    try {
      const newMedicine = await medicineApi.createMedicine({
        name,
        genericName: genericName || undefined,
        category,
        manufacturer,
        description: description || undefined,
        image: image || undefined,
      });

      await medicineApi.addMedicineToPharmacy({
        pharmacyId: pharmacy._id,
        medicineId: newMedicine._id,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      });

      toast.success('Medicine created and added to inventory!');
      setIsCreateModalOpen(false);
      resetNewMedicineForm();
      await loadInventory(pharmacy._id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create and add medicine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedMedicine || !formData.price || !formData.quantity) {
      toast.error('Please fill all fields');
      return;
    }

    if (!pharmacy?._id) {
      toast.error('Pharmacy not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await medicineApi.updateMedicineStock({
        pharmacyId: pharmacy._id,
        medicineId: selectedMedicine._id,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
      });
      toast.success('Medicine stock updated');
      setIsEditModalOpen(false);
      resetForm();
      await loadInventory(pharmacy._id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMedicine = async (medicineId: string) => {
    if (!pharmacy?._id) {
      toast.error('Pharmacy not found');
      return;
    }

    if (!confirm('Are you sure you want to remove this medicine from your pharmacy?')) {
      return;
    }

    try {
      await medicineApi.removeMedicineFromPharmacy(pharmacy._id, medicineId);
      toast.success('Medicine removed from inventory');
      await loadInventory(pharmacy._id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to remove medicine');
    }
  };

  const handleEditClick = (medicine: MedicineInventory) => {
    setSelectedMedicine(medicine);
    setFormData({
      ...formData,
      price: medicine.price.toString(),
      quantity: medicine.quantity.toString(),
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      medicineId: '',
      price: '',
      quantity: '',
      searchMedicine: '',
    });
    setSelectedMedicine(null);
  };

  const resetNewMedicineForm = () => {
    setNewMedicineData({
      name: '',
      genericName: '',
      category: '',
      manufacturer: '',
      description: '',
      image: '',
      price: '',
      quantity: '',
    });
  };

  const searchAvailableMedicines = async (query: string) => {
    setFormData({ ...formData, searchMedicine: query });
    if (query.length < 2) {
      setAvailableMedicines([]);
      return;
    }

    setIsLoadingMedicines(true);
    try {
      const result = await medicineApi.searchMedicines(query);
      setAvailableMedicines(result);
    } catch (error) {
      console.error('Failed to search medicines:', error);
    } finally {
      setIsLoadingMedicines(false);
    }
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <Badge variant="success">In Stock</Badge>;
      case 'Low Stock':
        return <Badge variant="warning">Low Stock</Badge>;
      case 'Out of Stock':
        return <Badge variant="danger">Out of Stock</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const handleNewMedicineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMedicineData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading || isPharmacyLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)]">
        <FaStore className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[rgb(0,88,64)] mb-2">No Pharmacy Found</h2>
        <p className="text-gray-600 mb-4">
          You need to own a pharmacy to manage inventory.
        </p>
        <Button onClick={() => navigate('/apply-pharmacy')}>Apply for Pharmacy</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="outline" size="sm" onClick={() => navigate('/my-pharmacy')}>
            <FaArrowLeft className="mr-2" />
            Back to Pharmacy
          </Button>
          <h1 className="text-3xl font-bold text-[rgb(0,88,64)] mt-4 flex items-center gap-3">
            <FaPills className="w-7 h-7" />
            Inventory Management
          </h1>
          <p className="text-gray-500 text-sm">{pharmacy.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
            <FaPlus className="mr-2" />
            Add Existing
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <FaPlus className="mr-2" />
            Create New
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="inStockOnly"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="w-4 h-4 text-[rgb(0,88,64)] rounded border-gray-300 focus:ring-[rgb(0,88,64)]"
          />
          <label htmlFor="inStockOnly" className="text-sm text-gray-700">
            In Stock Only
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] overflow-hidden">
        {medicines.length === 0 ? (
          <div className="text-center py-12">
            <FaPills className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No medicines in your inventory</p>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                <FaPlus className="mr-2" />
                Add Existing
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <FaPlus className="mr-2" />
                Create New
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[rgb(236,240,239)]">
              <thead className="bg-[rgb(236,240,239)]/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(236,240,239)]">
                {medicines.map((medicine) => (
                  <tr key={medicine._id} className="hover:bg-[rgb(236,240,239)]/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={medicine.image || 'https://via.placeholder.com/40'}
                          alt={medicine.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-medium text-[rgb(0,88,64)]">{medicine.name}</p>
                          {medicine.genericName && (
                            <p className="text-xs text-gray-500">{medicine.genericName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{medicine.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{medicine.manufacturer}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[rgb(0,88,64)]">
                      {formatCurrency(medicine.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{medicine.quantity}</td>
                    <td className="px-6 py-4">{getStockBadge(medicine.stockStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(medicine)}
                        >
                          <FaEdit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRemoveMedicine(medicine._id)}
                        >
                          <FaTrash className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title="Add Existing Medicine to Inventory"
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        onConfirm={handleAddMedicine}
        confirmText="Add Medicine"
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaSearch className="w-4 h-4" />
              Search Existing Medicine
            </label>
            <Input
              placeholder="Search for medicine..."
              value={formData.searchMedicine}
              onChange={(e) => searchAvailableMedicines(e.target.value)}
              className="rounded-xl"
            />
            {isLoadingMedicines && (
              <div className="mt-2 flex justify-center">
                <LoadingSpinner />
              </div>
            )}
            {availableMedicines.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-xl">
                {availableMedicines.map((med) => (
                  <button
                    key={med._id}
                    className={`w-full px-4 py-2 text-left hover:bg-[rgb(236,240,239)] transition-colors ${
                      formData.medicineId === med._id ? 'bg-[rgb(209,248,67)]/20' : ''
                    }`}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        medicineId: med._id,
                        searchMedicine: med.name,
                      });
                      setAvailableMedicines([]);
                    }}
                  >
                    <p className="font-medium text-sm text-[rgb(0,88,64)]">{med.name}</p>
                    <p className="text-xs text-gray-500">{med.category} • {med.manufacturer}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {formData.medicineId && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price *"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                label="Quantity *"
                type="number"
                step="1"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Create New Medicine Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        title="Create New Medicine"
        onClose={() => {
          setIsCreateModalOpen(false);
          resetNewMedicineForm();
        }}
        onConfirm={handleCreateAndAddMedicine}
        confirmText="Create & Add"
        isLoading={isSubmitting}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <FaInfoCircle className="w-4 h-4" />
            Fill in the medicine details below. It will be created and added to your inventory.
          </p>

          <Input
            label="Medicine Name *"
            name="name"
            placeholder="e.g. Paracetamol 500mg"
            value={newMedicineData.name}
            onChange={handleNewMedicineChange}
            required
          />

          <Input
            label="Generic Name"
            name="genericName"
            placeholder="e.g. Paracetamol"
            value={newMedicineData.genericName}
            onChange={handleNewMedicineChange}
          />

          <Input
            label="Category *"
            name="category"
            placeholder="e.g. Pain Relief"
            value={newMedicineData.category}
            onChange={handleNewMedicineChange}
            required
          />

          <Input
            label="Manufacturer *"
            name="manufacturer"
            placeholder="e.g. Pfizer, GSK"
            value={newMedicineData.manufacturer}
            onChange={handleNewMedicineChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Brief description of the medicine"
              value={newMedicineData.description}
              onChange={handleNewMedicineChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(0,88,64)] focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
            />
          </div>

          <Input
            label="Image URL"
            name="image"
            placeholder="https://example.com/medicine.jpg"
            value={newMedicineData.image}
            onChange={handleNewMedicineChange}
          />

          <div className="border-t border-[rgb(236,240,239)] pt-4 mt-2">
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FaStore className="w-4 h-4" />
              Pharmacy Stock Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price *"
                name="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newMedicineData.price}
                onChange={handleNewMedicineChange}
                required
              />
              <Input
                label="Quantity *"
                name="quantity"
                type="number"
                step="1"
                placeholder="0"
                value={newMedicineData.quantity}
                onChange={handleNewMedicineChange}
                required
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Stock Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title="Update Medicine Stock"
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        onConfirm={handleUpdateStock}
        confirmText="Update"
        isLoading={isSubmitting}
      >
        <div className="space-y-4">
          {selectedMedicine && (
            <>
              <div>
                <h4 className="font-medium text-[rgb(0,88,64)]">{selectedMedicine.name}</h4>
                <p className="text-sm text-gray-500">{selectedMedicine.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price *"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
                <Input
                  label="Quantity *"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
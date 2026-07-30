import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api/endpoints/pharmacy';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  FaStore, 
  FaEdit, 
  FaSave, 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaClock,
  FaCamera,
  FaTimes,
  FaCheck,
  FaPowerOff
} from 'react-icons/fa';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const EditPharmacy: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
    isActive: true,
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
  });

  useEffect(() => {
    loadPharmacy();
  }, []);

  const loadPharmacy = async () => {
    try {
      const data = await pharmacyApi.getMyPharmacy();
      setFormData({
        name: data.name || '',
        address: data.address || '',
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        isActive: data.isActive ?? true,
        openingHours: {
          monday: data.openingHours?.monday || '',
          tuesday: data.openingHours?.tuesday || '',
          wednesday: data.openingHours?.wednesday || '',
          thursday: data.openingHours?.thursday || '',
          friday: data.openingHours?.friday || '',
          saturday: data.openingHours?.saturday || '',
          sunday: data.openingHours?.sunday || '',
        },
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        navigate('/apply-pharmacy');
        toast.error('You need to apply for a pharmacy first');
      } else {
        toast.error('Failed to load pharmacy data');
        navigate('/my-pharmacy');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('hours.')) {
      const day = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        openingHours: { ...prev.openingHours, [day]: value },
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { name, address, latitude, longitude, phone, email, website, isActive, openingHours } = formData;

      const updateData: any = {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        phone,
        email,
        website: website || undefined,
        isActive,
        openingHours: Object.values(openingHours).some(v => v) ? openingHours : undefined,
      };

      await pharmacyApi.updatePharmacy(updateData);

      if (selectedFile) {
        await pharmacyApi.uploadPharmacyImage(selectedFile);
      }

      toast.success('Pharmacy updated successfully');
      navigate('/my-pharmacy');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update pharmacy');
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="outline" size="sm" onClick={() => navigate('/my-pharmacy')}>
        <FaArrowLeft className="mr-2" />
        Back to Pharmacy
      </Button>

      <h1 className="text-3xl font-bold text-[rgb(0,88,64)] mt-4 mb-6 flex items-center gap-3">
        <FaEdit className="w-7 h-7" />
        Edit Pharmacy
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <FaCamera className="w-4 h-4" />
            Pharmacy Image
          </label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={imagePreview || formData.image || 'https://via.placeholder.com/100?text=Image'}
                alt="Pharmacy"
                className="w-20 h-20 rounded-xl object-cover border-2 border-[rgb(236,240,239)]"
              />
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[rgb(209,248,67)] file:text-[rgb(0,88,64)] hover:file:bg-[rgb(190,230,50)] cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Pharmacy Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Address *"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude *"
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            required
          />
          <Input
            label="Longitude *"
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Input
            label="Email *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Website (optional)"
          name="website"
          value={formData.website}
          onChange={handleChange}
        />

        <div className="flex items-center gap-3 p-3 bg-[rgb(236,240,239)]/50 rounded-xl">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 text-[rgb(0,88,64)] rounded border-gray-300 focus:ring-[rgb(0,88,64)]"
          />
          <div>
            <label className="text-sm font-medium text-[rgb(0,88,64)] flex items-center gap-2">
              <FaPowerOff className={`w-4 h-4 ${formData.isActive ? 'text-green-500' : 'text-gray-400'}`} />
              Pharmacy is active (visible to customers)
            </label>
            <p className="text-xs text-gray-500">Toggle this to show/hide your pharmacy from customers</p>
          </div>
        </div>

        <div className="border-t border-[rgb(236,240,239)] pt-4 mt-4">
          <p className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
            <FaClock className="w-4 h-4" />
            Opening Hours (optional)
          </p>
          <div className="grid grid-cols-2 gap-4">
            {DAYS.map(day => (
              <Input
                key={day}
                label={day.charAt(0).toUpperCase() + day.slice(1)}
                name={`hours.${day}`}
                placeholder="e.g. 09:00-17:00"
                value={formData.openingHours[day as keyof typeof formData.openingHours]}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-[rgb(236,240,239)]">
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            <FaSave className="mr-2" />
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/my-pharmacy')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
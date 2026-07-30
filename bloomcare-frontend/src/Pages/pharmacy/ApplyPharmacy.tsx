import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useApplicationStore } from '../../store/applicationStore';
import { pharmacyApi } from '../../api/endpoints/pharmacy';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import { 
  FaStore, 
  FaPlus, 
  FaArrowRight, 
  FaInfoCircle, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaClock,
  FaCamera,
  FaTimes,
  FaCheck,
  FaBuilding,
  FaLocationArrow
} from 'react-icons/fa';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const ApplyPharmacy: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { fetchMyApplication } = useApplicationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    pharmacyName: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('hours.')) {
      const day = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        openingHours: { ...prev.openingHours, [day]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG, GIF, WebP)');
        return;
      }
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
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    const { pharmacyName, address, latitude, longitude, phone, email, website, openingHours } = formData;

    if (!pharmacyName || !address || !latitude || !longitude || !phone || !email) {
      toast.error('Please fill all required fields');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error('Please enter valid latitude and longitude numbers');
      return;
    }

    setIsLoading(true);
    try {
      await pharmacyApi.applyForPharmacy({
        pharmacyName,
        address,
        latitude: latNum,
        longitude: lngNum,
        phone,
        email,
        website: website || undefined,
        openingHours: Object.values(openingHours).some(v => v) ? openingHours : undefined,
      });

      if (selectedFile) {
        console.log('Image selected for upload:', selectedFile.name);
      }

      toast.success('Application submitted successfully!');
      await fetchMyApplication();
      navigate('/my-application');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-[rgb(0,88,64)] flex items-center gap-3">
          <FaStore className="w-7 h-7" />
          Apply to Become a Pharmacy
        </h1>
        <span className="text-xs bg-[rgb(209,248,67)] text-[rgb(0,88,64)] px-3 py-1 rounded-xl font-medium">
          <FaPlus className="w-3 h-3 inline mr-1" />
          New Application
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-6">
        <div className="flex items-start gap-3 mb-6 p-3 bg-[rgb(236,240,239)]/50 rounded-xl">
          <FaInfoCircle className="w-5 h-5 text-[rgb(0,88,64)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[rgb(0,88,64)]">Application Process</p>
            <p className="text-xs text-gray-500">
              Fill in your pharmacy details below. Once submitted, our team will review your application 
              and notify you of the decision.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pharmacy Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
              <FaCamera className="w-4 h-4" />
              Pharmacy Image
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Pharmacy preview"
                      className="w-20 h-20 rounded-xl object-cover border-2 border-[rgb(209,248,67)]"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-[rgb(236,240,239)] border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <FaCamera className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[rgb(209,248,67)] file:text-[rgb(0,88,64)] hover:file:bg-[rgb(190,230,50)] cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Upload a photo of your pharmacy (JPG, PNG, WebP) • Max 5MB
                </p>
                {selectedFile && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <FaCheck className="w-3 h-3" />
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Pharmacy Name *"
              name="pharmacyName"
              placeholder="e.g. City Pharmacy"
              value={formData.pharmacyName}
              onChange={handleChange}
              required
            />
            <Input
              label="Address *"
              name="address"
              placeholder="e.g. 123 Main St, City"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-9 text-gray-400" />
              <Input
                label="Latitude *"
                name="latitude"
                type="number"
                step="any"
                placeholder="e.g. 9.0300"
                value={formData.latitude}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <FaLocationArrow className="absolute left-3 top-9 text-gray-400" />
              <Input
                label="Longitude *"
                name="longitude"
                type="number"
                step="any"
                placeholder="e.g. 38.7400"
                value={formData.longitude}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <FaPhone className="absolute left-3 top-9 text-gray-400" />
              <Input
                label="Phone *"
                name="phone"
                placeholder="e.g. +251 911 123456"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-9 text-gray-400" />
              <Input
                label="Email *"
                name="email"
                type="email"
                placeholder="pharmacy@example.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="relative">
            <FaGlobe className="absolute left-3 top-9 text-gray-400" />
            <Input
              label="Website (optional)"
              name="website"
              placeholder="https://www.example.com"
              value={formData.website}
              onChange={handleChange}
              className="pl-10"
            />
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

          <Button type="submit" fullWidth isLoading={isLoading} className="mt-4">
            <FaStore className="mr-2" />
            Submit Application
            <FaArrowRight className="ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
};
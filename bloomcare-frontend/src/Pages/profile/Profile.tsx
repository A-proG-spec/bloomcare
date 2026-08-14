// src/Pages/profile/Profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePharmacyStore } from '../../store/pharmacyStore';
import { authApi } from '../../api/endpoints/auth';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SafeText } from '../../components/common/SafeContent';
import toast from 'react-hot-toast';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCamera,
  FaCheckCircle,
  FaTimesCircle,
  FaStore,
  FaShieldAlt,
  FaEdit,
  FaLock,
  FaArrowRight,
  FaUserShield,
  FaIdCard,
  FaCalendarAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';

// ✅ Types
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  // ✅ Pharmacy store
  const pharmacyStore = usePharmacyStore();
  const currentPharmacy = (pharmacyStore as any).currentPharmacy || null;
  const pharmacyLoading = (pharmacyStore as any).isLoading || false;
  const fetchMyPharmacy = (pharmacyStore as any).fetchMyPharmacy || (() => {});

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // ✅ NEW: Store the selected file for upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  const fetchPharmacy = useCallback(async () => {
    if ((user?.role === 'pharmacy_owner' || user?.role === 'admin') && fetchMyPharmacy) {
      await fetchMyPharmacy();
    }
  }, [user?.role, fetchMyPharmacy]);

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ✅ Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
      setImagePreview(user.image || null);
      setSelectedImage(null);
    }
  }, [user]);

  // ✅ Fetch pharmacy if user is pharmacy owner
  useEffect(() => {
    fetchPharmacy();
  }, [fetchPharmacy]);

  // ✅ Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG, GIF, WebP)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // ✅ Store the actual file
      setSelectedImage(file);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ FIXED: handleSubmit with correct response handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Send the update with selected image
      const response = await authApi.updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        image: selectedImage || undefined,
      });

      // ✅ authApi.updateProfile() returns { user: User }
      if (response?.user) {
        // Update Zustand auth store
        updateUser(response.user);

        // Update local form state
        setFormData({
          fullName: response.user.fullName || '',
          phone: response.user.phone || '',
        });

        // Update profile image
        setImagePreview(response.user.image || null);

        // ✅ Clear selected image
        setSelectedImage(null);

        // ✅ Exit edit mode - THIS IS WHAT TRIGGERS THE VIEW TO SHOW UPDATED DATA
        setIsEditing(false);

        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile: No user data returned');
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Show loading state
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isVerified = user.isEmailVerified;
  const isPharmacyOwner = user.role === 'pharmacy_owner' || user.role === 'admin';
  const hasPharmacy = !!currentPharmacy;

  // ✅ Get member since date
  const memberSince = user.createdAt 
    ? new Date(user.createdAt) 
    : new Date();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black font-outfit flex items-center gap-3">
            <FaUser className="w-7 h-7 text-[#22c55e]" />
            My Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-outfit">
            Manage your personal information and account settings
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            icon={<FaEdit className="w-4 h-4" />}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ✅ Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={imagePreview || user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=22c55e&color=fff&size=128`}
                  alt={user.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#22c55e]"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-[#22c55e] text-white p-2 rounded-full cursor-pointer hover:bg-[#16a34a] transition-colors border-2 border-white">
                    <FaCamera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <h2 className="mt-4 text-xl font-bold text-black font-outfit">
                <SafeText text={user.fullName} />
              </h2>
              <p className="text-sm text-gray-500 font-outfit flex items-center gap-2">
                <FaEnvelope className="w-3 h-3" />
                <SafeText text={user.email} />
              </p>

              {/* ✅ Verification Status */}
              <div className="mt-4 flex items-center gap-2">
                {isVerified ? (
                  <>
                    <FaCheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 font-medium font-outfit">Email Verified</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-600 font-medium font-outfit">Email Not Verified</span>
                  </>
                )}
              </div>

              {/* ✅ Role Badge */}
              <div className="mt-3 flex items-center gap-2">
                <FaUserShield className="w-4 h-4 text-[#22c55e]" />
                <span className="text-sm font-medium text-black font-outfit capitalize">
                  {user.role === 'pharmacy_owner' ? 'Pharmacy Owner' : user.role === 'admin' ? 'Administrator' : 'Customer'}
                </span>
              </div>
            </div>

            {/* ✅ Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/change-password')}
                icon={<FaLock className="w-4 h-4" />}
              >
                Change Password
              </Button>
              
              {isPharmacyOwner && !hasPharmacy && (
                <Button
                  fullWidth
                  onClick={() => navigate('/apply-pharmacy')}
                  icon={<FaStore className="w-4 h-4" />}
                >
                  Apply for Pharmacy
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ✅ Right Column - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 font-outfit">
              <FaIdCard className="w-5 h-5 text-[#22c55e]" />
              Personal Information
            </h3>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  icon={<FaUser className="w-4 h-4" />}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  autoComplete="name"
                />
                
                <Input
                  label="Phone Number"
                  placeholder="+1234567890"
                  icon={<FaPhone className="w-4 h-4" />}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  autoComplete="tel"
                />

                <div className="pt-2 flex gap-3">
                  <Button type="submit" isLoading={isLoading}>
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: user.fullName || '',
                        phone: user.phone || '',
                      });
                      setImagePreview(user.image || null);
                      setSelectedImage(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-outfit">Full Name</p>
                    <p className="text-base font-medium text-black font-outfit">
                      <SafeText text={user.fullName} />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0">
                    <FaEnvelope className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-outfit">Email Address</p>
                    <p className="text-base font-medium text-black font-outfit">
                      <SafeText text={user.email} />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0">
                    <FaPhone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-outfit">Phone Number</p>
                    <p className="text-base font-medium text-black font-outfit">
                      <SafeText text={user.phone || 'Not provided'} />
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0">
                    <FaCalendarAlt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-outfit">Member Since</p>
                    <p className="text-base font-medium text-black font-outfit">
                      {memberSince.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0">
                    <FaShieldAlt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-outfit">Account Status</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {isVerified ? (
                        <>
                          <FaCheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600 font-outfit">Verified</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600 font-outfit">Not Verified</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Pharmacy Information */}
          {(isPharmacyOwner || user.role === 'admin') && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 font-outfit">
                <FaStore className="w-5 h-5 text-[#22c55e]" />
                Pharmacy Information
              </h3>

              {pharmacyLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : hasPharmacy ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0">
                      <FaStore className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-outfit">Pharmacy Name</p>
                      <p className="text-base font-medium text-black font-outfit">
                        <SafeText text={currentPharmacy?.name || 'N/A'} />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0">
                      <FaMapMarkerAlt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-outfit">Address</p>
                      <p className="text-base font-medium text-black font-outfit">
                        <SafeText text={currentPharmacy?.address || 'N/A'} />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] flex-shrink-0">
                      <FaPhone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-outfit">Pharmacy Phone</p>
                      <p className="text-base font-medium text-black font-outfit">
                        <SafeText text={currentPharmacy?.phone || 'N/A'} />
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/my-pharmacy')}
                      icon={<FaArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      View Pharmacy Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <FaStore className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-outfit">No pharmacy associated with this account</p>
                  {user.role === 'pharmacy_owner' && (
                    <Button
                      onClick={() => navigate('/apply-pharmacy')}
                      className="mt-4"
                      variant="outline"
                    >
                      Apply for Pharmacy
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ✅ Quick Actions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 font-outfit">
              <FaShieldAlt className="w-5 h-5 text-[#22c55e]" />
              Account Actions
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/change-password')}
                icon={<FaLock className="w-4 h-4" />}
                className="justify-center"
              >
                Change Password
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => navigate('/orders')}
                icon={<FaCheckCircle className="w-4 h-4" />}
                className="justify-center"
              >
                View Orders
              </Button>

              {!isVerified && (
                <Button
                  fullWidth
                  onClick={() => navigate('/verify-email', { state: { email: user.email } })}
                  icon={<FaEnvelope className="w-4 h-4" />}
                  className="justify-center col-span-full"
                >
                  Verify Email
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
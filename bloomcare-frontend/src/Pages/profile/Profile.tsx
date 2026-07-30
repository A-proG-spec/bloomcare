import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/endpoints';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authApi.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        image: selectedFile,
      });
      updateUser(response.user);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-black">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        {/* Profile Info Display */}
        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <img
                src={user?.image || 'https://via.placeholder.com/120'}
                alt={user?.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-green-400"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black">{user?.fullName}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  Role: {user?.role?.replace('_', ' ')}
                </p>
                {user?.phone && <p className="text-gray-600">📞 {user.phone}</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-6 mb-6">
              <img
                src={imagePreview || user?.image || 'https://via.placeholder.com/120'}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-green-400"
              />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
            </div>

            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={isLoading}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                  setImagePreview(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
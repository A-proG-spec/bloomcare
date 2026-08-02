// src/Pages/pharmacy/MyPharmacy.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api/endpoints/pharmacy';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { 
  FaStore, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe, 
  FaClock, 
  FaStar, 
  FaEdit, 
  FaArrowLeft,
  FaPills,
  FaLocationArrow,
  FaChevronDown,
  FaChevronUp,
  FaInfoCircle
} from 'react-icons/fa';

export const MyPharmacy: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    status: string;
    pharmacy: any;
    application: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOpeningHours, setShowOpeningHours] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const result = await pharmacyApi.getMyPharmacy();
      setData(result);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load your pharmacy');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = () => {
    navigate('/apply-pharmacy');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100 max-w-md mx-auto my-8">
        <p className="text-gray-500 mb-4">Unable to load data. Please try again.</p>
        <div className="flex justify-center gap-3">
          <Button onClick={loadData}>Retry</Button>
          <Button variant="outline" onClick={handleApplyClick}>
            Apply Pharmacy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* ✅ Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-[#22c55e] transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <FaStore className="w-6 h-6 text-[#22c55e]" />
            My Pharmacy
          </h1>
        </div>
        <Button onClick={handleApplyClick} size="sm" variant="outline">
          Apply Pharmacy
        </Button>
      </div>

      {/* ✅ Main Content Area */}
      {(() => {
        switch (data.status) {
          case 'approved':
            return (
              <div className="space-y-6">
                {/* ✅ Pharmacy Card */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  {/* ✅ Cover Image / Header */}
                  <div className="relative">
                    <img
                      src={data.pharmacy?.image || 'https://via.placeholder.com/800x200?text=Pharmacy'}
                      alt={data.pharmacy?.name}
                      className="w-full h-32 md:h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge variant={data.pharmacy?.isActive ? 'success' : 'danger'}>
                        {data.pharmacy?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {/* ✅ Pharmacy Info */}
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* ✅ Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          src={data.pharmacy?.image || 'https://via.placeholder.com/100?text=Pharmacy'}
                          alt={data.pharmacy?.name}
                          className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-md -mt-12"
                        />
                      </div>

                      {/* ✅ Main Info */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                              {data.pharmacy?.name}
                              <span className="text-sm font-normal text-gray-500">
                                #{data.pharmacy?._id?.slice(-6)}
                              </span>
                            </h2>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <FaStar className="w-4 h-4 text-yellow-400" />
                                <span className="font-semibold text-black">
                                  {data.pharmacy?.rating?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({data.pharmacy?.totalReviews || 0} {data.pharmacy?.totalReviews === 1 ? 'review' : 'reviews'})
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <FaPills className="w-3 h-3" />
                                {data.pharmacy?.medicines?.length || 0} medicines
                              </span>
                            </div>
                          </div>

                          {/* ✅ Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/edit-pharmacy')}
                              icon={<FaEdit className="w-3 h-3" />}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/pharmacy/${data.pharmacy?._id}`)}
                              icon={<FaStore className="w-3 h-3" />}
                            >
                              View Public
                            </Button>
                          </div>
                        </div>

                        {/* ✅ Contact Info */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-700">{data.pharmacy?.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a href={`tel:${data.pharmacy?.phone}`} className="text-[#22c55e] hover:underline">
                              {data.pharmacy?.phone}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FaEnvelope className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <a href={`mailto:${data.pharmacy?.email}`} className="text-[#22c55e] hover:underline">
                              {data.pharmacy?.email}
                            </a>
                          </div>
                          {data.pharmacy?.website && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaGlobe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <a
                                href={data.pharmacy.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#22c55e] hover:underline truncate"
                              >
                                {data.pharmacy.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* ✅ Location Coordinates */}
                        {(data.pharmacy?.latitude || data.pharmacy?.longitude) && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaLocationArrow className="w-3 h-3 text-[#22c55e]" />
                              <span>
                                <strong>Location:</strong> 
                                {data.pharmacy?.latitude && ` ${data.pharmacy.latitude.toFixed(6)}`}
                                {data.pharmacy?.longitude && `, ${data.pharmacy.longitude.toFixed(6)}`}
                              </span>
                              <button
                                onClick={() => {
                                  if (data.pharmacy?.latitude && data.pharmacy?.longitude) {
                                    window.open(
                                      `https://www.google.com/maps?q=${data.pharmacy.latitude},${data.pharmacy.longitude}`,
                                      '_blank'
                                    );
                                  }
                                }}
                                className="text-[#22c55e] hover:underline text-xs"
                              >
                                View on Map
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ✅ Opening Hours - Collapsible */}
                    {data.pharmacy?.openingHours &&
                      Object.values(data.pharmacy.openingHours).some((v) => v) && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setShowOpeningHours(!showOpeningHours)}
                            className="flex items-center justify-between w-full text-left"
                          >
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <FaClock className="w-4 h-4 text-[#22c55e]" />
                              Opening Hours
                              <span className="text-xs text-gray-400 font-normal">
                                ({Object.values(data.pharmacy.openingHours).filter(v => v).length} days)
                              </span>
                            </span>
                            <span className="text-gray-400">
                              {showOpeningHours ? (
                                <FaChevronUp className="w-4 h-4" />
                              ) : (
                                <FaChevronDown className="w-4 h-4" />
                              )}
                            </span>
                          </button>

                          <div className={`mt-3 space-y-1.5 transition-all duration-300 overflow-hidden ${
                            showOpeningHours ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}>
                            {data.pharmacy.openingHours &&
                              Object.entries(data.pharmacy.openingHours).map(([day, hours]) => {
                                if (!hours) return null;
                                const dayLabels: { [key: string]: string } = {
                                  monday: 'Monday',
                                  tuesday: 'Tuesday',
                                  wednesday: 'Wednesday',
                                  thursday: 'Thursday',
                                  friday: 'Friday',
                                  saturday: 'Saturday',
                                  sunday: 'Sunday',
                                };
                                return (
                                  <div key={day} className="flex justify-between items-center py-1.5 px-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-700 font-medium capitalize">
                                      {dayLabels[day] || day}
                                    </span>
                                    <span className="text-sm text-black font-medium">
                                      {hours}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* ✅ Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-[#22c55e]">
                      {data.pharmacy?.medicines?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Total Medicines</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-400">
                      {data.pharmacy?.rating?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-500">
                      {data.pharmacy?.totalReviews || 0}
                    </p>
                    <p className="text-xs text-gray-500">Reviews</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-bold text-purple-500">
                      {data.pharmacy?.isActive ? '✅' : '❌'}
                    </p>
                    <p className="text-xs text-gray-500">Status</p>
                  </div>
                </div>

                {/* ✅ Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => navigate('/pharmacy-inventory')}
                    icon={<FaPills className="w-4 h-4" />}
                  >
                    Manage Inventory
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/pharmacy/${data.pharmacy?._id}`)}
                    icon={<FaStore className="w-4 h-4" />}
                  >
                    View Public Profile
                  </Button>
                </div>
              </div>
            );

          case 'pending':
            return (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100 max-w-md mx-auto">
                <div className="text-5xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold text-black mb-2">Application Pending</h2>
                <p className="text-gray-600 mb-4">
                  Your pharmacy application is currently being reviewed. You will be notified once a decision is made.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Submitted on: {formatDate(data.application?.createdAt)}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button variant="outline" onClick={() => navigate('/my-application')}>
                    View Application
                  </Button>
                  <Button onClick={handleApplyClick}>
                    Apply Again / New Form
                  </Button>
                </div>
              </div>
            );

          case 'rejected':
            return (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100 max-w-md mx-auto">
                <div className="text-5xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-black mb-2">Application Rejected</h2>
                <p className="text-gray-600 mb-4">Your pharmacy application was not approved.</p>
                {data.application?.adminNotes && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-sm mx-auto text-left mb-4">
                    <p className="text-sm font-medium text-red-700 flex items-center gap-2">
                      <FaInfoCircle className="w-4 h-4" />
                      Reason
                    </p>
                    <p className="text-sm text-red-600 mt-1">{data.application.adminNotes}</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button onClick={handleApplyClick}>
                    Apply Pharmacy
                  </Button>
                </div>
              </div>
            );

          case 'none':
          default:
            return (
              <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-100 max-w-lg mx-auto p-8">
                <div className="text-6xl mb-4">🏥</div>
                <h2 className="text-2xl font-bold text-black mb-2">Register Your Pharmacy</h2>
                <p className="text-gray-600 mb-6">
                  You haven't registered a pharmacy yet. Submit your application to list your pharmacy and manage inventory.
                </p>
                <Button onClick={handleApplyClick} className="px-8 py-3 text-base">
                  Apply Pharmacy
                </Button>
              </div>
            );
        }
      })()}
    </div>
  );
};
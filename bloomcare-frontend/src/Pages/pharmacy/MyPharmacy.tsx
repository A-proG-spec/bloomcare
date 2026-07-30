// src/Pages/pharmacy/MyPharmacy.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../api/endpoints/pharmacy';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export const MyPharmacy: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    status: string;
    pharmacy: any;
    application: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Top Bar with Apply Pharmacy Button always accessible */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">My Pharmacy</h1>
        <Button onClick={handleApplyClick}>Apply Pharmacy</Button>
      </div>

      {/* Main Content Area */}
      {(() => {
        switch (data.status) {
          case 'approved':
            return (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-6">
                    <img
                      src={data.pharmacy?.image || 'https://via.placeholder.com/150?text=Pharmacy'}
                      alt={data.pharmacy?.name}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-black">{data.pharmacy?.name}</h2>
                      <p className="text-gray-600">{data.pharmacy?.address}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={data.pharmacy?.isActive ? 'success' : 'danger'}>
                          {data.pharmacy?.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          ⭐ {data.pharmacy?.rating?.toFixed(1) || '0.0'} ({data.pharmacy?.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate('/edit-pharmacy')}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/pharmacy/${data.pharmacy?._id}`)}
                    >
                      View Public
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm text-black">{data.pharmacy?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm text-black">{data.pharmacy?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="text-sm text-black">{data.pharmacy?.website || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-sm text-black">
                      {data.pharmacy?.latitude}, {data.pharmacy?.longitude}
                    </p>
                  </div>
                </div>

                {data.pharmacy?.openingHours &&
                  Object.values(data.pharmacy.openingHours).some((v) => v) && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Opening Hours</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(data.pharmacy.openingHours).map(([day, hours]) => {
                          if (!hours) return null;
                          return (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize text-gray-500">{day}</span>
                              <span className="text-black">{hours as string}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Inventory</p>
                  <p className="text-sm text-gray-600">
                    {data.pharmacy?.medicines?.length || 0} medicines available
                  </p>
                </div>
              </div>
            );

          case 'pending':
            return (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100 max-w-md mx-auto">
                <div className="text-4xl mb-4">⏳</div>
                <h2 className="text-2xl font-bold text-black mb-2">Application Pending</h2>
                <p className="text-gray-600 mb-4">
                  Your pharmacy application is currently being reviewed. You will be notified once a decision is made.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Submitted on: {formatDate(data.application?.createdAt)}
                </p>
                <div className="flex justify-center gap-3">
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
                <div className="text-4xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-black mb-2">Application Rejected</h2>
                <p className="text-gray-600 mb-4">Your pharmacy application was not approved.</p>
                {data.application?.adminNotes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm mx-auto text-left mb-4">
                    <p className="text-sm font-medium text-red-700">Reason</p>
                    <p className="text-sm text-red-600">{data.application.adminNotes}</p>
                  </div>
                )}
                <Button onClick={handleApplyClick}>Apply Pharmacy</Button>
              </div>
            );

          case 'none':
          default:
            return (
              <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-100 max-w-lg mx-auto p-8">
                <div className="text-5xl mb-4">🏥</div>
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
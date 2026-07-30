import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStore } from '../../store/applicationStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';
import { 
  FaClipboardList, 
  FaStore, 
  FaClock, 
  FaCheck, 
  FaTimes, 
  FaArrowRight,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaHourglassHalf,
  FaExclamationTriangle
} from 'react-icons/fa';

export const MyApplication: React.FC = () => {
  const navigate = useNavigate();
  const { myApplication, isLoading, fetchMyApplication } = useApplicationStore();

  useEffect(() => {
    fetchMyApplication();
  }, []);

  const getStatusBadge = (status: string) => {
    const map: { [key: string]: 'success' | 'warning' | 'danger' | 'info' } = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
    };
    return map[status] || 'info';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaHourglassHalf className="w-6 h-6 text-yellow-500" />;
      case 'approved':
        return <FaCheck className="w-6 h-6 text-green-500" />;
      case 'rejected':
        return <FaTimes className="w-6 h-6 text-red-500" />;
      default:
        return <FaInfoCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!myApplication) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-20 h-20 bg-[rgb(236,240,239)] rounded-full flex items-center justify-center mx-auto mb-4">
          <FaStore className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-[rgb(0,88,64)] mb-2">No Application Found</h2>
        <p className="text-gray-500 mb-6">You have not applied to become a pharmacy owner yet.</p>
        <Button onClick={() => navigate('/apply-pharmacy')}>
          Apply Now
          <FaArrowRight className="ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-[rgb(0,88,64)] flex items-center gap-3">
          <FaClipboardList className="w-7 h-7" />
          My Application
        </h1>
        <Badge variant={getStatusBadge(myApplication.status)}>
          {myApplication.status.toUpperCase()}
        </Badge>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-6 space-y-6">
        {/* Status Header */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[rgb(236,240,239)]/50">
          {getStatusIcon(myApplication.status)}
          <div>
            <p className="font-medium text-[rgb(0,88,64)]">
              {myApplication.status === 'pending' && 'Your application is being reviewed'}
              {myApplication.status === 'approved' && 'Your application has been approved!'}
              {myApplication.status === 'rejected' && 'Your application was not approved'}
            </p>
            <p className="text-sm text-gray-500">
              Submitted on {formatDate(myApplication.createdAt)}
            </p>
          </div>
        </div>

        {/* Pharmacy Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-[rgb(0,88,64)] flex items-center gap-2">
            <FaStore className="w-4 h-4" />
            Pharmacy Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaStore className="w-3 h-3" />
                Pharmacy Name
              </p>
              <p className="text-sm font-medium text-[rgb(0,88,64)]">{myApplication.pharmacyName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaMapMarkerAlt className="w-3 h-3" />
                Address
              </p>
              <p className="text-sm text-[rgb(0,88,64)]">{myApplication.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaPhone className="w-3 h-3" />
                Phone
              </p>
              <p className="text-sm text-[rgb(0,88,64)]">{myApplication.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaEnvelope className="w-3 h-3" />
                Email
              </p>
              <p className="text-sm text-[rgb(0,88,64)]">{myApplication.email}</p>
            </div>
          </div>
        </div>

        {/* Status Specific Messages */}
        {myApplication.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <FaClock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-700">Application Under Review</p>
              <p className="text-sm text-yellow-600">
                Your application is currently being reviewed by our team. You will be notified once a decision is made.
              </p>
            </div>
          </div>
        )}

        {myApplication.status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <FaCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">Application Approved!</p>
              <p className="text-sm text-green-600">
                Congratulations! Your pharmacy application has been approved. You can now manage your pharmacy.
              </p>
              <Button size="sm" onClick={() => navigate('/my-pharmacy')} className="mt-3">
                <FaStore className="mr-2" />
                Go to My Pharmacy
              </Button>
            </div>
          </div>
        )}

        {myApplication.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <FaExclamationTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Application Rejected</p>
              {myApplication.adminNotes && (
                <div className="mt-2 bg-white/50 rounded-lg p-3">
                  <p className="text-sm text-red-600">
                    <span className="font-medium">Reason:</span> {myApplication.adminNotes}
                  </p>
                </div>
              )}
              <Button size="sm" onClick={() => navigate('/apply-pharmacy')} className="mt-3">
                <FaArrowRight className="mr-2" />
                Reapply
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-[rgb(236,240,239)] pt-4 flex gap-3">
          {myApplication.status === 'pending' && (
            <Button variant="outline" onClick={() => navigate('/apply-pharmacy')}>
              <FaArrowRight className="mr-2" />
              View Application Form
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
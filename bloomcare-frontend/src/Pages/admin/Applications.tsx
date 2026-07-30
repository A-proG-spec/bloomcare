import React, { useCallback, useEffect, useRef, useState } from 'react';
import { adminApi } from '../../api/endpoints/admin';
import { pharmacyApi } from '../../api/endpoints/pharmacy';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { 
  FaClipboardList, 
  FaUser, 
  FaStore, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaCheck, 
  FaTimes,
  FaBuilding,
  FaMapMarkerAlt,
} from 'react-icons/fa';

interface PharmacyApplication {
  _id: string;
  pharmacyName: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  user?: {
    _id: string;
    fullName: string;
    email: string;
    image?: string;
  };
}

export const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<PharmacyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [selectedApp, setSelectedApp] = useState<PharmacyApplication | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ FIXED: Use ref to prevent double execution
  const hasLoaded = useRef(false);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getPendingApplications({ page, limit: 10 });
      setApplications(result.applications || []);
      setTotalPages(result.pagination?.pages || 1);
      setTotalApplications(result.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  // ✅ FIXED: Use ref to prevent cascading render
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadApplications();
    }
  }, [loadApplications]);

  const handleReview = (app: PharmacyApplication) => {
    setSelectedApp(app);
    setReviewStatus('approved');
    setAdminNotes('');
    setIsReviewModalOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedApp) return;
    setIsSubmitting(true);
    try {
      await pharmacyApi.reviewApplication(selectedApp._id, {
        status: reviewStatus,
        adminNotes: adminNotes || undefined,
      });
      toast.success(`Application ${reviewStatus} successfully`);
      setIsReviewModalOpen(false);
      loadApplications();
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      toast.error(err.response?.data?.message || 'Failed to review application');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2 font-outfit">
          <FaClipboardList className="w-6 h-6 text-[#22c55e]" />
          Pharmacy Applications
        </h1>
        <span className="text-sm text-gray-500 font-outfit">Total: {totalApplications} applications</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <FaStore className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-outfit">No pending applications</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Pharmacy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.user?.image || 'https://via.placeholder.com/40'}
                          alt={app.user?.fullName}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-medium text-black flex items-center gap-1 font-outfit">
                            <FaUser className="w-3 h-3 text-gray-400" />
                            {app.user?.fullName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 font-outfit">
                            <FaEnvelope className="w-3 h-3 text-gray-400" />
                            {app.user?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-black flex items-center gap-1 font-outfit">
                          <FaStore className="w-3 h-3 text-gray-400" />
                          {app.pharmacyName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 font-outfit">
                          <FaMapMarkerAlt className="w-3 h-3 text-gray-400" />
                          {app.address || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1 font-outfit">
                        <FaPhone className="w-3 h-3 text-gray-400" />
                        {app.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 font-outfit">
                        <FaEnvelope className="w-3 h-3 text-gray-400" />
                        {app.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1 font-outfit">
                      <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleReview(app)}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {applications.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 font-outfit">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        title="Review Application"
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleConfirmReview}
        confirmText={reviewStatus === 'approved' ? 'Approve' : 'Reject'}
        isLoading={isSubmitting}
        confirmVariant={reviewStatus === 'approved' ? 'primary' : 'outline'}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <FaBuilding className="w-5 h-5 text-[#22c55e]" />
            <div>
              <h4 className="font-semibold text-black font-outfit">{selectedApp?.pharmacyName}</h4>
              <p className="text-sm text-gray-600 font-outfit">{selectedApp?.user?.fullName}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2 font-outfit">Decision</label>
            <div className="flex gap-4">
              <button
                onClick={() => setReviewStatus('approved')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors font-outfit ${
                  reviewStatus === 'approved'
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCheck className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setReviewStatus('rejected')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors font-outfit ${
                  reviewStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaTimes className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2 font-outfit">Admin Notes</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about your decision..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all duration-200 font-outfit"
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
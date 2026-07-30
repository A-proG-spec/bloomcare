import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { pharmacyApi } from '../../api/endpoints/pharmacy';
import { reviewApi } from '../../api/endpoints/review';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { RatingStars } from '../../components/review/RatingStars';
import { ReviewsList } from '../../components/review/ReviewsList';
import { MedicineList } from '../../components/medicine/MedicineList';
import { Modal } from '../../components/common/Modal';
import type { Pharmacy } from '../../types/pharmacy.types';
import type { Review, Medicine } from '../../api/types';
import toast from 'react-hot-toast';
import { 
  FaStore, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaStar, 
  FaPills,
  FaClock,
  FaGlobe,
  FaArrowLeft,
  FaEdit,
  FaCalendarAlt
} from 'react-icons/fa';
// ✅ REMOVED: FaShoppingCart

// ✅ ADDED: Type for medicine details
interface MedicineDetail {
  price: number;
  quantity: number;
  stockStatus: string;
}

export const PharmacyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCartStore();

  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);

  // ✅ FIXED: Use ref to prevent double execution
  const hasLoaded = useRef(false);

  // ✅ FIXED: Define functions BEFORE useEffect with useCallback
  const loadPharmacyData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await pharmacyApi.getPharmacyById(id);
      setPharmacy(data);

      if (isAuthenticated && user?.id) {
        try {
          const userRev = await reviewApi.getUserReviewForPharmacy(id);
          setUserReview(userRev);
        } catch {
          setUserReview(null);
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to load pharmacy');
      navigate('/pharmacies');
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, user?.id, navigate]);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    try {
      const response = await reviewApi.getPharmacyReviews(id, {
        page: reviewPage,
        limit: 6,
        sortBy,
      });
      setReviews(response.data || []);
      if (response.pagination) {
        setReviewTotalPages(response.pagination.pages);
      }
    } catch {
      console.error('Failed to fetch reviews:');
    }
  }, [id, reviewPage, sortBy]);

  // ✅ FIXED: Only call once on mount
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadPharmacyData();
    }
  }, [loadPharmacyData]);

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [loadReviews]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      navigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (userReview) {
        await reviewApi.updateReview(userReview._id, {
          rating: reviewRating,
          comment: reviewComment,
        });
        toast.success('Review updated successfully');
      } else {
        await reviewApi.createReview({
          pharmacyId: id!,
          rating: reviewRating,
          comment: reviewComment,
        });
        toast.success('Review submitted successfully');
      }

      setIsReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      setReviewPage(1);
      await loadPharmacyData();
      await loadReviews();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewApi.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      setReviewPage(1);
      await loadPharmacyData();
      await loadReviews();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleUpdateReview = async (
    reviewId: string,
    data: { rating: number; comment: string }
  ) => {
    try {
      await reviewApi.updateReview(reviewId, data);
      await loadReviews();
    } catch {
      // Error handled by component
    }
  };

  const handleAddToCart = (medicine: Medicine, pharmacyId?: string, pharmacyName?: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!pharmacy || !pharmacyId) {
      toast.error('Pharmacy information missing');
      return;
    }

    const details = medicineDetails[medicine._id];
    if (!details || details.quantity <= 0) {
      toast.error('This medicine is out of stock');
      return;
    }

    const success = addItem({
      medicineId: medicine._id,
      medicineName: medicine.name,
      price: details.price,
      quantity: 1,
      image: medicine.image || '',
      pharmacyId: pharmacyId,
      pharmacyName: pharmacyName || pharmacy.name,
      stockStatus: details.stockStatus,
      maxQuantity: details.quantity,
    });

    if (success) {
      toast.success(`Added ${medicine.name} to cart`);
    } else {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4 text-lg">Pharmacy not found</p>
        <Button onClick={() => navigate('/pharmacies')}>
          <FaArrowLeft className="mr-2" />
          Back to Pharmacies
        </Button>
      </div>
    );
  }

  // ✅ FIXED: Properly typed with explicit type instead of any
  const medicineDetails: Record<string, MedicineDetail> = 
    pharmacy.medicines?.reduce((acc, med) => {
      acc[med.medicine._id] = {
        price: med.price,
        quantity: med.quantity,
        stockStatus: med.stockStatus,
      };
      return acc;
    }, {} as Record<string, MedicineDetail>) || {};

  const hasOpeningHours =
    pharmacy.openingHours &&
    Object.values(pharmacy.openingHours).some((val) => val && val.trim() !== '');

  // ✅ FIXED: Map medicines to proper Medicine type with all required fields
  const mappedMedicines: Medicine[] = pharmacy.medicines?.map((m) => ({
    _id: m.medicine._id,
    name: m.medicine.name,
    genericName: (m.medicine as { genericName?: string }).genericName || '',
    category: (m.medicine as { category?: string }).category || '',
    manufacturer: (m.medicine as { manufacturer?: string }).manufacturer || '',
    description: (m.medicine as { description?: string }).description || '',
    image: (m.medicine as { image?: string }).image || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })) || [];

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <FaArrowLeft className="mr-2" />
        Back
      </Button>

      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
          <img
            src={pharmacy.image || 'https://via.placeholder.com/200'}
            alt={pharmacy.name}
            className="w-full md:w-56 h-56 object-cover rounded-xl shadow-sm"
          />

          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h1 className="text-4xl font-bold text-[rgb(0,88,64)] mb-2 flex items-center gap-2">
                  <FaStore className="w-6 h-6" />
                  {pharmacy.name}
                </h1>
                <p className="text-gray-600 text-lg mb-1 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-4 h-4" />
                  {pharmacy.address}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <FaPhone className="w-4 h-4" />
                  {pharmacy.phone}
                </p>
              </div>
              <Badge variant={pharmacy.isActive ? 'success' : 'danger'}>
                {pharmacy.isActive ? 'Open' : 'Closed'}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-4 pt-4 border-t border-[rgb(236,240,239)]">
              <div>
                <RatingStars rating={pharmacy.rating} count={pharmacy.totalReviews} />
                <p className="text-sm text-gray-500 mt-1">
                  Based on {pharmacy.totalReviews} reviews
                </p>
              </div>
              {pharmacy.website && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1 flex items-center gap-1">
                    <FaGlobe className="w-3 h-3" />
                    Website
                  </p>
                  <a
                    href={pharmacy.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[rgb(0,88,64)] hover:text-[rgb(0,70,50)] hover:underline text-sm"
                  >
                    {pharmacy.website}
                  </a>
                </div>
              )}
            </div>

            {hasOpeningHours && (
              <div className="mt-4 pt-4 border-t border-[rgb(236,240,239)]">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaClock className="w-4 h-4" />
                  Opening Hours:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  {pharmacy.openingHours &&
                    Object.entries(pharmacy.openingHours).map(([day, hours]) => {
                      if (!hours || hours.trim() === '') return null;
                      return (
                        <div key={day}>
                          <span className="font-medium capitalize">{day}:</span> {hours}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Medicines Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[rgb(0,88,64)] flex items-center gap-2">
            <FaPills className="w-5 h-5" />
            Available Medicines ({pharmacy.medicines?.length || 0})
          </h2>
        </div>
        {mappedMedicines.length > 0 ? (
          <MedicineList
            medicines={mappedMedicines}
            showPrice={true}
            showAddButton={true}
            onAddToCart={handleAddToCart}
            pharmacyId={id}
            pharmacyName={pharmacy.name}
            medicineDetails={medicineDetails}
          />
        ) : (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)]">
            <p className="text-gray-500">No medicines available at this pharmacy yet.</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[rgb(0,88,64)] mb-1 flex items-center gap-2">
              <FaStar className="w-5 h-5" />
              Customer Reviews
            </h2>
            <p className="text-sm text-gray-600">
              {reviews.length === 0
                ? 'No reviews yet'
                : `Showing ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            onClick={() => setIsReviewModalOpen(true)}
            disabled={!isAuthenticated || !pharmacy.isActive}
          >
            <FaEdit className="mr-2" />
            {userReview ? 'Edit Review' : 'Leave Review'}
          </Button>
        </div>

        <ReviewsList
          reviews={reviews}
          isLoading={isLoading}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onDelete={handleDeleteReview}
          onUpdate={handleUpdateReview}
          canDeleteAny={user?.role === 'admin'}
          canEditOwn={isAuthenticated}
          currentUserId={user?.id}
          page={reviewPage}
          totalPages={reviewTotalPages}
          onPageChange={setReviewPage}
        />
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        title={userReview ? 'Edit Your Review' : 'Leave a Review'}
        onClose={() => {
          setIsReviewModalOpen(false);
          setReviewComment('');
          setReviewRating(5);
        }}
        onConfirm={handleSubmitReview}
        confirmText={userReview ? 'Update Review' : 'Submit Review'}
        isLoading={isSubmittingReview}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you rate this pharmacy?
            </label>
            <div className="inline-block">
              <RatingStars
                rating={reviewRating}
                onRate={setReviewRating}
                interactive={true}
                size="lg"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {reviewRating === 1 && 'Poor experience'}
              {reviewRating === 2 && 'Not great'}
              {reviewRating === 3 && 'Average'}
              {reviewRating === 4 && 'Good experience'}
              {reviewRating === 5 && 'Excellent experience'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your experience
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value.slice(0, 500))}
              placeholder="Tell us about your visit, service quality, product availability, etc..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(0,88,64)] focus:border-transparent transition-all duration-200 resize-none"
              rows={5}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {reviewComment.length}/500 characters
              </p>
              {reviewComment.length > 450 && (
                <p className="text-xs text-yellow-600">Getting close to the limit</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 flex items-center gap-2">
              <FaCalendarAlt className="w-3 h-3" />
              <span><span className="font-medium">Tip:</span> Be honest and constructive. Your review helps others make informed decisions.</span>
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
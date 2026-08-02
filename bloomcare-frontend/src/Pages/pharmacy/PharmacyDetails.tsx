import React, { useEffect, useState } from 'react';
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
import type { Review } from '../../api/types';
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
  FaShoppingCart,
  FaEdit,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadPharmacyData();
  }, [id]);

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [id, sortBy, reviewPage]);

  const loadPharmacyData = async () => {
    setIsLoading(true);
    try {
      const data = await pharmacyApi.getPharmacyById(id!);
      setPharmacy(data);

      if (isAuthenticated && user?.id) {
        try {
          const userRev = await reviewApi.getUserReviewForPharmacy(id!);
          setUserReview(userRev);
        } catch (error) {
          setUserReview(null);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load pharmacy');
      navigate('/pharmacies');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
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
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
    }
  };

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleUpdateReview = async (
    reviewId: string,
    data: { rating: number; comment: string }
  ) => {
    try {
      await reviewApi.updateReview(reviewId, data);
      await loadReviews();
    } catch (error: any) {
      throw error;
    }
  };

  const handleAddToCart = (medicine: any, pharmacyId?: string, pharmacyName?: string) => {
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
      image: medicine.image,
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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pharmacy?.name,
        text: `Check out ${pharmacy?.name} on BloomCare!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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
      <div className="text-center py-12 px-4">
        <FaStore className="w-16 h-16 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4 text-lg">Pharmacy not found</p>
        <Button onClick={() => navigate('/pharmacies')}>
          <FaArrowLeft className="mr-2" />
          Back to Pharmacies
        </Button>
      </div>
    );
  }

  const medicineDetails = pharmacy.medicines?.reduce((acc, med) => {
    acc[med.medicine._id] = {
      price: med.price,
      quantity: med.quantity,
      stockStatus: med.stockStatus,
    };
    return acc;
  }, {} as any) || {};

  const hasOpeningHours =
    pharmacy.openingHours &&
    Object.values(pharmacy.openingHours).some((val) => val && val.trim() !== '');

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      {/* ✅ Fixed Back Button - Mobile Optimized */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#22c55e] transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-400 hover:text-[#22c55e] transition-colors"
          >
            <FaShare className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFavorite}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            {isFavorite ? (
              <FaHeart className="w-5 h-5 text-red-500" />
            ) : (
              <FaRegHeart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ✅ Pharmacy Header - Mobile Optimized */}
      <div className="px-4 pt-4 pb-2">
        {/* ✅ Image with overlay */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={pharmacy.image || 'https://via.placeholder.com/400x200?text=Pharmacy'}
            alt={pharmacy.name}
            className="w-full h-48 md:h-64 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-2">
              <Badge variant={pharmacy.isActive ? 'success' : 'danger'}>
                {pharmacy.isActive ? 'Open Now' : 'Closed'}
              </Badge>
              <div className="flex items-center gap-1 text-white">
                <FaStar className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold">{pharmacy.rating.toFixed(1)}</span>
                <span className="text-xs text-white/70">({pharmacy.totalReviews})</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Pharmacy Info */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <FaStore className="w-5 h-5 text-[#22c55e]" />
            {pharmacy.name}
          </h1>
          
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-600 flex items-start gap-2">
              <FaMapMarkerAlt className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>{pharmacy.address}</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <FaPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${pharmacy.phone}`} className="hover:text-[#22c55e]">
                {pharmacy.phone}
              </a>
            </p>
            {pharmacy.website && (
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <FaGlobe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a
                  href={pharmacy.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#22c55e] hover:underline"
                >
                  {pharmacy.website.replace(/^https?:\/\//, '')}
                </a>
              </p>
            )}
          </div>

          {/* ✅ Opening Hours - Collapsible on Mobile */}
          {hasOpeningHours && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-black flex items-center gap-2">
                  <FaClock className="w-4 h-4 text-[#22c55e]" />
                  Opening Hours
                </span>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs text-[#22c55e] flex items-center gap-1"
                >
                  {showFullDescription ? 'Hide' : 'Show all'}
                  {showFullDescription ? (
                    <FaChevronUp className="w-3 h-3" />
                  ) : (
                    <FaChevronDown className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className={`mt-2 space-y-1 transition-all duration-300 ${
                showFullDescription ? 'max-h-96' : 'max-h-12 overflow-hidden'
              }`}>
                {pharmacy.openingHours &&
                  Object.entries(pharmacy.openingHours).map(([day, hours]) => {
                    if (!hours || hours.trim() === '') return null;
                    return (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{day}</span>
                        <span className="text-black font-medium">{hours}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Medicines Section */}
      <div className="px-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <FaPills className="w-5 h-5 text-[#22c55e]" />
            Available Medicines
            <span className="text-sm font-normal text-gray-500">
              ({pharmacy.medicines?.length || 0})
            </span>
          </h2>
        </div>
        
        {pharmacy.medicines && pharmacy.medicines.length > 0 ? (
          <MedicineList
            medicines={pharmacy.medicines.map((m) => m.medicine)}
            showPrice={true}
            showAddButton={true}
            onAddToCart={handleAddToCart}
            pharmacyId={id}
            pharmacyName={pharmacy.name}
            medicineDetails={medicineDetails}
          />
        ) : (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <FaPills className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No medicines available at this pharmacy yet.</p>
          </div>
        )}
      </div>

      {/* ✅ Reviews Section */}
      <div className="px-4 mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <FaStar className="w-5 h-5 text-yellow-400" />
              Customer Reviews
            </h2>
            <p className="text-sm text-gray-500">
              {reviews.length === 0
                ? 'No reviews yet'
                : `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Button
            onClick={() => setIsReviewModalOpen(true)}
            disabled={!isAuthenticated || !pharmacy.isActive}
            size="sm"
            className="w-full sm:w-auto"
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

      {/* ✅ Review Modal - Mobile Optimized */}
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate this pharmacy?
            </label>
            <div className="flex justify-center">
              <RatingStars
                rating={reviewRating}
                onRate={setReviewRating}
                interactive={true}
                size="lg"
              />
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all duration-200 resize-none"
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
        </div>
      </Modal>

      {/* ✅ Bottom Action Bar - Mobile Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Available Medicines</p>
            <p className="text-lg font-bold text-black">
              {pharmacy.medicines?.length || 0} items
            </p>
          </div>
          <Button
            onClick={() => {
              const medicinesSection = document.querySelector('[class*="Available Medicines"]');
              if (medicinesSection) {
                medicinesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex-1"
          >
            <FaShoppingCart className="mr-2" />
            Browse Medicines
          </Button>
        </div>
      </div>
    </div>
  );
};
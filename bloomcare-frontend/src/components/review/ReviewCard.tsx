import React, { useState } from 'react';
import type { Review } from '../../api/types';
import { RatingStars } from './RatingStars';
import { Modal } from '../common/Modal';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { FaUser, FaEdit, FaTrash } from 'react-icons/fa';

interface ReviewCardProps {
  review: Review;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: { rating: number; comment: string }) => Promise<void>;
  canDelete?: boolean;
  canEdit?: boolean;
  currentUserId?: string;
}

// ✅ ADDED: Type for API error response
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onDelete,
  onUpdate,
  canDelete = false,
  canEdit = false,
  currentUserId,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ FIXED: Use type assertion to access _id
  const isOwnReview = currentUserId === (review.user as { _id?: string })?._id;

  const handleSubmitEdit = async () => {
    if (!editComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdate?.(review._id, {
        rating: editRating,
        comment: editComment,
      });
      toast.success('Review updated successfully');
      setIsEditModalOpen(false);
    } catch (error: unknown) {
      // ✅ FIXED: Properly typed error
      const err = error as ApiError;
      toast.error(err.response?.data?.message || 'Failed to update review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      onDelete?.(review._id);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-[#22c55e]/30 transition-all duration-200">
        {/* Header - User Info */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3 flex-1">
            <img
              src={review.user?.image || 'https://via.placeholder.com/40'}
              alt={review.user?.fullName}
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border-2 border-[#d1f843]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-black text-sm truncate flex items-center gap-1 font-outfit">
                  <FaUser className="w-3 h-3 text-[#22c55e]" />
                  {review.user?.fullName}
                </h4>
                {isOwnReview && (
                  <span className="text-xs bg-[#d1f843] text-black px-2 py-0.5 rounded-xl font-medium font-outfit">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-outfit">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Action Menu */}
          {(canDelete || canEdit) && (
            <div className="flex gap-1">
              {canEdit && isOwnReview && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-gray-400 hover:text-[#22c55e] p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit review"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete review"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars rating={review.rating} />
        </div>

        {/* Comment */}
        <div className="mb-3">
          <p className="text-gray-700 text-sm leading-relaxed break-words font-outfit">
            {review.comment}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-outfit">
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          {review.updatedAt && review.updatedAt !== review.createdAt && (
            <p className="text-xs text-gray-400 italic font-outfit">Edited</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title="Edit Your Review"
        onClose={() => {
          setIsEditModalOpen(false);
          setEditRating(review.rating);
          setEditComment(review.comment);
        }}
        onConfirm={handleSubmitEdit}
        confirmText="Update Review"
        isLoading={isSubmitting}
        confirmVariant="accent"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2 font-outfit">
              Rating
            </label>
            <div className="inline-block">
              <RatingStars
                rating={editRating}
                onRate={setEditRating}
                interactive={true}
                size="lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2 font-outfit">
              Comment
            </label>
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all duration-200 resize-none font-outfit"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 font-outfit">
              {editComment.length}/500 characters
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
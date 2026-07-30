import React from 'react';
import type { Review } from '../../api/types';
import { ReviewCard } from './ReviewCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { FaSort, FaStar } from 'react-icons/fa';

interface ReviewsListProps {
  reviews: Review[];
  isLoading?: boolean;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  onSortChange?: (sort: 'newest' | 'oldest' | 'highest' | 'lowest') => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: { rating: number; comment: string }) => Promise<void>;
  canDeleteAny?: boolean;
  canEditOwn?: boolean;
  currentUserId?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  isLoading = false,
  sortBy = 'newest',
  onSortChange,
  onDelete,
  onUpdate,
  canDeleteAny = false,
  canEditOwn = false,
  currentUserId,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = 'No reviews yet. Be the first to review!',
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <FaStar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-outfit">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Options */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-600 flex items-center gap-1 font-outfit">
          <FaSort className="w-3 h-3" />
          Sort by:
        </span>
        <div className="flex gap-2 flex-wrap">
          {(['newest', 'oldest', 'highest', 'lowest'] as const).map((option) => (
            <button
              key={option}
              onClick={() => onSortChange?.(option)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors font-outfit ${
                sortBy === option
                  ? 'bg-[#22c55e] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option === 'newest' ? 'Newest' : 
               option === 'oldest' ? 'Oldest' : 
               option === 'highest' ? 'Highest' : 'Lowest'}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onDelete={onDelete}
            onUpdate={onUpdate}
            // ✅ FIXED: Use type assertion to access _id
            canDelete={canDeleteAny || (canEditOwn && currentUserId === (review.user as { _id?: string })?._id)}
            canEdit={canEditOwn}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700 font-outfit">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
// src/components/review/ReviewsList.tsx
import React from 'react';
import { ReviewCard } from './ReviewCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import { FaStar, FaSort } from 'react-icons/fa';

// ============================================
// ✅ TYPES - No 'any' used
// ============================================

// ✅ Import the Review type from your API types
import type { Review } from '../../api/types';

interface ReviewsListProps {
  reviews: Review[];  // ✅ Use Review[] instead of any[]
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
}

// ✅ Type for sort option
type SortOption = {
  value: 'newest' | 'oldest' | 'highest' | 'lowest';
  label: string;
};

// ✅ Sort options
const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
];

// ============================================
// ✅ Component
// ============================================

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews = [],
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
}) => {
  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  // ✅ No reviews
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <FaStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 font-outfit">No Reviews Yet</h3>
        <p className="text-gray-400 text-sm mt-1 font-outfit">
          Be the first to review this pharmacy!
        </p>
      </div>
    );
  }

  // ✅ Handle sort change with proper typing
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest';
    onSortChange?.(value);
  };

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      {onSortChange && (
        <div className="flex items-center gap-2 justify-end">
          <FaSort className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent font-outfit bg-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => {
          // ✅ Safe user ID extraction
          const user = review.user as { _id?: string; id?: string } | null | undefined;
          const userId = user?._id || user?.id || null;
          
          return (
            <ReviewCard
              key={review._id}
              review={review}
              onDelete={onDelete}
              onUpdate={onUpdate}
              canDelete={canDeleteAny || (canEditOwn && userId === currentUserId)}
              canEdit={canEditOwn && userId === currentUserId}
              currentUserId={currentUserId}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm font-outfit">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
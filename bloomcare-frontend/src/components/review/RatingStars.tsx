import React from 'react';
import { FaStar } from 'react-icons/fa';

interface RatingStarsProps {
  rating: number;
  count?: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  count,
  onRate,
  interactive = false,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const renderStar = (index: number) => {
    const filled = (hoverRating || rating) > index;
    return (
      <button
        key={index}
        onClick={() => interactive && onRate?.(index + 1)}
        onMouseEnter={() => interactive && setHoverRating(index + 1)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        disabled={!interactive}
        className={`${sizeClass} transition-colors ${
          interactive ? 'cursor-pointer' : 'cursor-default'
        }`}
        type="button"
      >
        <FaStar
          className={`${sizeClass} ${filled ? 'text-[#d1f843]' : 'text-gray-200'}`}
        />
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => renderStar(i))}
      </div>
      <span className="text-sm font-medium text-black font-outfit">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-sm text-gray-500 font-outfit">({count})</span>
      )}
    </div>
  );
};
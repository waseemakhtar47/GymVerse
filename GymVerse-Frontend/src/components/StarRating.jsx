import { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const StarRating = ({ rating, onRatingChange, size = 'md', readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  const starSize = sizeClasses[size] || sizeClasses.md;
  
  const handleMouseEnter = (index) => {
    if (!readonly) setHoverRating(index);
  };
  
  const handleMouseLeave = () => {
    if (!readonly) setHoverRating(0);
  };
  
  const handleClick = (index) => {
    if (!readonly && onRatingChange) onRatingChange(index);
  };
  
  const displayRating = hoverRating || rating;
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform hover:scale-110`}
        >
          {star <= displayRating ? (
            <StarSolidIcon className={`${starSize} text-yellow-400`} />
          ) : (
            <StarIcon className={`${starSize} text-gray-500`} />
          )}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
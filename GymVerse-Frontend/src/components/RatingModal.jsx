import { useState } from 'react';
import StarRating from './StarRating';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { gymService } from '../services/gymService';
import toast from 'react-hot-toast';

const RatingModal = ({ gym, onClose, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    try {
      await gymService.addGymRating(gym._id, rating, review);
      toast.success('Thank you for your feedback!');
      if (onRatingSubmitted) onRatingSubmitted();
      onClose();
    } catch (error) {
      console.error('Rating error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit rating';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl max-w-md w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Rate & Review</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-gray-300 mb-2">How would you rate {gym.name}?</p>
            <div className="flex justify-center">
              <StarRating rating={rating} onRatingChange={setRating} size="xl" />
            </div>
            {rating > 0 && (
              <p className="text-purple-400 text-sm mt-2">
                {rating === 5 && 'Excellent! ⭐⭐⭐⭐⭐'}
                {rating === 4 && 'Very Good! ⭐⭐⭐⭐'}
                {rating === 3 && 'Good ⭐⭐⭐'}
                {rating === 2 && 'Okay ⭐⭐'}
                {rating === 1 && 'Needs Improvement ⭐'}
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Write a review (optional)</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              placeholder="Share your experience with this gym..."
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
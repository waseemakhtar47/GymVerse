import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { XMarkIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { trainerService } from '../services/trainerService';
import toast from 'react-hot-toast';

const TrainerRatingModal = ({ trainer, onClose, onRatingSubmitted, mode = 'rate' }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [trainer]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await trainerService.getTrainerRatings(trainer._id);
      setReviews(res.data.data.ratings || []);
      setAverageRating(res.data.data.averageRating || 0);
      setTotalReviews(res.data.data.totalReviews || 0);
      setUserRating(res.data.data.userRating);
      
      if (res.data.data.userRating) {
        setRating(res.data.data.userRating.rating);
        setReview(res.data.data.userRating.review || '');
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    setSubmitting(true);
    try {
      await trainerService.addTrainerRating(trainer._id, rating, review);
      toast.success('Thank you for your feedback!');
      await fetchReviews();
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

  // If mode is 'reviews', only show reviews (no rating form)
  if (mode === 'reviews') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-white/10 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-xl font-bold text-white">Reviews for {trainer.name}</h3>
              <p className="text-gray-400 text-sm mt-1">
                {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} • {averageRating.toFixed(1)} average rating
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
          </div>

          {/* Rating Summary */}
          <div className="p-6 border-b border-white/10 bg-white/5 shrink-0">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</p>
                <div className="flex justify-center mt-2">
                  <StarRating rating={averageRating} size="md" readonly={true} />
                </div>
                <p className="text-gray-400 text-sm mt-1">Overall Rating</p>
              </div>
              <div className="flex-1">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-yellow-400 text-sm w-8">{star}★</span>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* All Reviews List */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {loadingReviews ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 ml-2">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <UserIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400">No reviews yet</p>
                <p className="text-gray-500 text-sm mt-1">Be the first to review this trainer!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                        {review.userId?.profilePic ? (
                          <img src={review.userId.profilePic} alt={review.userId.name} className="w-full h-full object-cover" />
                        ) : (
                          review.userId?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <p className="text-white font-semibold">{review.userId?.name || 'Anonymous'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={review.rating} size="sm" readonly={true} />
                            </div>
                          </div>
                          <p className="text-gray-500 text-xs flex items-center gap-1 shrink-0">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                        {review.review && (
                          <p className="text-gray-300 text-sm mt-3 leading-relaxed wrap-break-word whitespace-pre-wrap">
                            {review.review}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default mode: 'rate' - Only rating form
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl max-w-md w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              {userRating ? 'Update Your Rating' : `Rate ${trainer.name}`}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-gray-300 mb-2">How would you rate this trainer?</p>
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
              placeholder="Share your experience with this trainer..."
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : (userRating ? 'Update Rating' : 'Submit Rating')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerRatingModal;
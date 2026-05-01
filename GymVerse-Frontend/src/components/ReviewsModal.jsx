import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';
import StarRating from './StarRating';
import { gymService } from '../services/gymService';
import toast from 'react-hot-toast';

const ReviewsModal = ({ gym, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(null);
  const reviewsEndRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, [gym]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await gymService.getGymRatings(gym._id);
      setReviews(res.data.data.ratings || []);
      setAverageRating(res.data.data.averageRating || 0);
      setTotalReviews(res.data.data.totalReviews || 0);
      setUserRating(res.data.data.userRating);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-white/10 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header - Fixed */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">Reviews & Ratings</h3>
            <p className="text-gray-400 text-sm mt-1">
              {gym.name} • {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Average Rating Summary - Fixed */}
        <div className="p-6 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-white">{averageRating.toFixed(1)}</p>
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
          
          {/* User's own rating */}
          {userRating && (
            <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500">
              <p className="text-purple-400 text-sm font-medium mb-1">Your Rating</p>
              <div className="flex items-center gap-3">
                <StarRating rating={userRating.rating} size="sm" readonly={true} />
                {userRating.review && <span className="text-white text-sm line-clamp-2">{userRating.review}</span>}
              </div>
              <p className="text-gray-500 text-xs mt-1">Posted on {formatDate(userRating.createdAt)}</p>
            </div>
          )}
        </div>

        {/* Reviews List - Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 ml-3">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No reviews yet</p>
              <p className="text-gray-500 text-sm mt-2">Be the first to review this gym!</p>
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
                      {/* ✅ Review text with proper word wrapping and scrolling */}
                      {review.review && (
                        <p className="text-gray-300 text-sm mt-3 leading-relaxed wrap-break-word whitespace-pre-wrap">
                          {review.review}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={reviewsEndRef} />
            </div>
          )}
        </div>
        
        {/* Footer - Fixed */}
        <div className="p-4 border-t border-white/10 bg-gray-900 shrink-0">
          <p className="text-gray-500 text-xs text-center">
            Showing {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;
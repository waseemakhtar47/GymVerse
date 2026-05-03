import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { trainerService } from '../../services/trainerService';
import StarRating from '../../components/StarRating';
import { 
  StarIcon, 
  CalendarIcon, 
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyReviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchMyReviews();
  }, [user]);

  const fetchMyReviews = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await trainerService.getTrainerRatings(user._id);
      setReviews(res.data.data.ratings || []);
      setAverageRating(res.data.data.averageRating || 0);
      setTotalReviews(res.data.data.totalReviews || 0);
    } catch (error) {
      console.error('Failed to fetch my reviews:', error);
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

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout title="My Reviews" role="trainer">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your reviews...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Reviews" role="trainer">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Ratings & Reviews</h2>
          <p className="text-gray-400 text-sm mt-1">See what users are saying about you</p>
        </div>

        {/* Stats Cards - Only 2 cards now */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Average Rating</p>
                <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Reviews</p>
                <p className="text-2xl font-bold text-white">{totalReviews}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {totalReviews > 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-yellow-400 text-sm w-12">{star} Stars</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-semibold">All Reviews ({totalReviews})</h3>
            <p className="text-gray-400 text-sm mt-1">Reviews from users who rated you</p>
          </div>
          
          <div className="p-4">
            {totalReviews === 0 ? (
              <div className="text-center py-12">
                <UserIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">No reviews yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  When users follow and rate you, reviews will appear here
                </p>
                <button
                  onClick={() => navigate('/trainer/blogs')}
                  className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                >
                  Create engaging content →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedReviews.map((review, idx) => (
                  <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                        {review.userId?.profilePic ? (
                          <img src={review.userId.profilePic} alt={review.userId.name} className="w-full h-full object-cover" />
                        ) : (
                          review.userId?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <p className="text-white font-semibold text-lg">
                              {review.userId?.name || 'Anonymous'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={review.rating} size="sm" readonly={true} />
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                        {review.review && (
                          <p className="text-gray-300 mt-3 leading-relaxed">
                            "{review.review}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {reviews.length > 5 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition"
              >
                {showAllReviews ? 'Show less' : `View all ${reviews.length} reviews →`}
              </button>
            )}
          </div>
        </div>

        {/* Tips to get more reviews */}
        <div className="bg-linear-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-2">💡 Want more reviews?</h3>
          <p className="text-gray-400 text-sm">
            Create high-quality courses, engage with your followers, and share valuable content.
            The more value you provide, the more positive reviews you'll receive!
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate('/trainer/create-course')}
              className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700"
            >
              Create a Course
            </button>
            <button
              onClick={() => navigate('/trainer/create-blog')}
              className="px-4 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-700"
            >
              Write a Blog
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyReviews;
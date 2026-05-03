import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gymService } from '../services/gymService';
import StarRating from '../components/StarRating';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon,
  StarIcon,
  UserGroupIcon,
  WifiIcon,
  FireIcon,
  SparklesIcon,
  ArrowLeftIcon,
  UserIcon,
  EyeIcon,
  CalendarIcon,
  PencilIcon,
  CurrencyDollarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Trainers state
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [canRate, setCanRate] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // Rating Modal
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchGymDetails();
    fetchGymTrainers();
    fetchReviews();
  }, [id]);

  const fetchGymDetails = async () => {
    setLoading(true);
    try {
      const res = await gymService.getGymById(id);
      setGym(res.data.data);
    } catch (err) {
      console.error('Failed to fetch gym details:', err);
      setError('Gym not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchGymTrainers = async () => {
    setLoadingTrainers(true);
    try {
      const res = await gymService.getGymTrainers(id);
      setTrainers(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
    } finally {
      setLoadingTrainers(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await gymService.getGymRatings(id);
      setReviews(res.data.data.ratings || []);
      setAverageRating(res.data.data.averageRating || 0);
      setTotalReviews(res.data.data.totalReviews || 0);
      setUserRating(res.data.data.userRating);
      setCanRate(res.data.data.canRate || false);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleRatingSubmitted = async () => {
    await fetchReviews();
    await fetchGymDetails();
    toast.success('Rating updated successfully!');
  };

  const getFacilityIcon = (facility) => {
    const lower = facility.toLowerCase();
    if (lower.includes('wifi')) return <WifiIcon className="w-4 h-4" />;
    if (lower.includes('cardio') || lower.includes('treadmill')) return <FireIcon className="w-4 h-4" />;
    if (lower.includes('yoga') || lower.includes('zumba')) return <SparklesIcon className="w-4 h-4" />;
    return <BuildingOfficeIcon className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading gym details...</p>
        </div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">Gym not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition flex items-center gap-2">
              <ArrowLeftIcon className="w-5 h-5" />
              Back
            </button>
            {canRate && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="px-4 py-2 bg-yellow-600 rounded-lg text-white text-sm hover:bg-yellow-700 transition flex items-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Write a Review
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{gym.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={averageRating} size="sm" readonly={true} />
                <span className="text-white">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings yet'}
                </span>
                <span className="text-white/70 text-sm">({totalReviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-purple-400" />
            Gym Owner
          </h2>
          <p className="text-gray-300">{gym.ownerId?.name || 'Unknown'}</p>
          <p className="text-gray-400 text-sm mt-1">{gym.ownerId?.email}</p>
        </div>

        {/* Description */}
        {gym.description && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2">About</h2>
            <p className="text-gray-300 leading-relaxed">{gym.description}</p>
          </div>
        )}

        {/* Location */}
        {gym.address && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-purple-400" />
              Location
            </h2>
            <p className="text-gray-300">{gym.address}</p>
          </div>
        )}

        {/* Timings */}
        {gym.timings && (gym.timings.open || gym.timings.close) && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-purple-400" />
              Operating Hours
            </h2>
            <p className="text-gray-300">{gym.timings.open} - {gym.timings.close}</p>
          </div>
        )}

        {/* Contact */}
        {gym.contactNumber && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-purple-400" />
              Contact
            </h2>
            <p className="text-gray-300">{gym.contactNumber}</p>
          </div>
        )}

        {/* Pricing */}
        {gym.pricing && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-purple-400" />
              Membership Pricing
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Monthly</p>
                <p className="text-purple-400 font-bold text-lg">₹{gym.pricing.monthly}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Quarterly</p>
                <p className="text-purple-400 font-bold text-lg">₹{gym.pricing.quarterly}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Yearly</p>
                <p className="text-purple-400 font-bold text-lg">₹{gym.pricing.yearly}</p>
              </div>
            </div>
          </div>
        )}

        {/* Facilities */}
        {gym.facilities && gym.facilities.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-purple-400" />
              Facilities
            </h2>
            <div className="flex flex-wrap gap-2">
              {gym.facilities.map((facility, idx) => (
                <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm">
                  {getFacilityIcon(facility)}
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ✅ ASSOCIATED TRAINERS SECTION */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-purple-400" />
            Associated Trainers
          </h2>
          
          {loadingTrainers ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 ml-2 text-sm">Loading trainers...</p>
            </div>
          ) : trainers.length === 0 ? (
            <div className="text-center py-6">
              <UserGroupIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400 text-sm">No trainers associated with this gym yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trainers.map((trainer) => (
                <div
                  key={trainer._id}
                  onClick={() => navigate(`/trainer-profile/${trainer.trainerId?._id}`)}
                  className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden">
                      {trainer.trainerId?.profilePic ? (
                        <img src={trainer.trainerId.profilePic} alt={trainer.trainerId.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold group-hover:text-purple-400 transition">
                        {trainer.trainerId?.name || 'Unknown'}
                      </p>
                      {trainer.trainerId?.specialty && (
                        <p className="text-gray-400 text-xs">{trainer.trainerId.specialty}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Joined: {new Date(trainer.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              Member Reviews ({totalReviews})
            </h2>
            {!canRate && (
              <p className="text-gray-500 text-xs">Buy a membership to rate this gym</p>
            )}
          </div>

          {/* Average Rating Summary */}
          {totalReviews > 0 && (
            <div className="flex items-center gap-6 mb-6 pb-4 border-b border-white/10">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{averageRating.toFixed(1)}</p>
                <StarRating rating={averageRating} size="sm" readonly={true} />
                <p className="text-gray-400 text-xs mt-1">out of 5</p>
              </div>
              <div className="flex-1">
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-yellow-400 text-xs w-6">{star}★</span>
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* User's Own Rating */}
          {userRating && (
            <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500">
              <p className="text-purple-400 text-sm font-medium mb-1">Your Review</p>
              <div className="flex items-center gap-3">
                <StarRating rating={userRating.rating} size="sm" readonly={true} />
                <span className="text-white text-sm">{userRating.review || 'No review written'}</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">Posted on {formatDate(userRating.createdAt)}</p>
            </div>
          )}

          {/* All Reviews List */}
          {loadingReviews ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 ml-2 text-sm">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="w-12 h-12 mx-auto text-gray-500 mb-2" />
              <p className="text-gray-400">No reviews yet</p>
              {canRate && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="mt-3 px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700"
                >
                  Be the first to review!
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <p className="text-white font-semibold">{review.userId?.name || 'Anonymous'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} size="sm" readonly={true} />
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      {review.review && (
                        <p className="text-gray-300 text-sm mt-3 leading-relaxed">{review.review}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && gym && (
        <RatingModal
          gym={gym}
          onClose={() => setShowRatingModal(false)}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
};

export default GymDetails;
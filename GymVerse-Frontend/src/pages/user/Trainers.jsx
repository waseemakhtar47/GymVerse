import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/DashboardLayout";
import { trainerService } from "../../services/trainerService";
import StarRating from "../../components/StarRating";
import TrainerRatingModal from "../../components/TrainerRatingModal";
import {
  UserGroupIcon,
  UserIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  StarIcon,
  HeartIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const Trainers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [followingLoading, setFollowingLoading] = useState({});
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedTrainerForRating, setSelectedTrainerForRating] = useState(null);
  const [selectedTrainerForReviews, setSelectedTrainerForReviews] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const allTrainersRes = await trainerService.getAllTrainers();
      setTrainers(allTrainersRes.data.data || []);

      try {
        const followingRes = await trainerService.getFollowingTrainers();
        setFollowing(followingRes.data.data || []);
      } catch (err) {
        setFollowing([]);
      }
    } catch (error) {
      setError("Failed to load trainers");
      toast.error("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (trainerId) => {
    setFollowingLoading((prev) => ({ ...prev, [trainerId]: true }));
    try {
      const res = await trainerService.followTrainer(trainerId);
      if (res.data.data.following) {
        const trainer = trainers.find((t) => t._id === trainerId);
        setFollowing((prev) => [...prev, trainer]);
        toast.success("Now following this trainer");
      } else {
        setFollowing((prev) => prev.filter((t) => t._id !== trainerId));
        toast.success("Unfollowed trainer");
      }
      const trainersRes = await trainerService.getAllTrainers();
      setTrainers(trainersRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to follow trainer");
    } finally {
      setFollowingLoading((prev) => ({ ...prev, [trainerId]: false }));
    }
  };

  const isFollowing = (trainerId) => {
    return following.some((t) => t._id === trainerId);
  };

  const handleViewProfile = (trainerId) => {
    navigate(`/trainer-profile/${trainerId}`);
  };

  const handleRatingSubmitted = async () => {
    await fetchData();
    toast.success("Rating updated successfully!");
  };

  const getFollowingTrainers = () => {
    return trainers.filter((t) => following.some((f) => f._id === t._id));
  };

  const displayedTrainers =
    activeTab === "all" ? trainers : getFollowingTrainers();

  if (loading) {
    return (
      <DashboardLayout title="Trainers" role="user">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading trainers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fitness Trainers" role="user">
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            All Trainers ({trainers.length})
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === "following"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <HeartIcon className="w-4 h-4" />
            Following ({following.length})
          </button>
        </div>

        {trainers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <UserGroupIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Trainers Yet
            </h3>
            <p className="text-gray-400">
              There are no trainers registered yet.
            </p>
          </div>
        ) : displayedTrainers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <HeartIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Following Trainers
            </h3>
            <p className="text-gray-400">
              You are not following any trainers yet.
            </p>
            <button
              onClick={() => setActiveTab("all")}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white"
            >
              Browse Trainers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTrainers.map((trainer) => (
              <div
                key={trainer._id}
                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition"
              >
                <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {trainer.profilePic ? (
                        <img
                          src={trainer.profilePic}
                          alt={trainer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow(trainer._id);
                      }}
                      disabled={followingLoading[trainer._id]}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        isFollowing(trainer._id)
                          ? "bg-red-500/20 text-red-400"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                    >
                      {followingLoading[trainer._id] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isFollowing(trainer._id) ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg">
                    {trainer.name}
                  </h3>
                  
                  {/* ✅ Bio - Show "No bio available" if empty */}
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {trainer.bio || "No bio available"}
                  </p>
                  
                  {/* Rating Display */}
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating
                      rating={trainer.averageRating || 0}
                      size="sm"
                      readonly={true}
                    />
                    <span className="text-gray-400 text-xs">
                      {trainer.averageRating
                        ? trainer.averageRating.toFixed(1)
                        : "New"}
                    </span>
                    <span className="text-gray-500 text-xs">
                      ({trainer.totalReviews || 0}{" "}
                      {trainer.totalReviews === 1 ? "review" : "reviews"})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <VideoCameraIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">
                        {trainer.courses || 0} courses
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">
                        {trainer.blogs || 0} blogs
                      </span>
                    </div>
                  </div>
                  
                  {/* ✅ Removed hardcoded 4.9 rating */}

                  {/* Buttons Row - Rate and Reviews for following trainers */}
                  {user?.role === "user" && isFollowing(trainer._id) && (
                    <div className="flex gap-2 mt-3">
                      {/* Rate Button - Sirf rating submit karne ke liye */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrainerForRating(trainer);
                          setShowRatingModal(true);
                        }}
                        className="flex-1 py-1.5 border border-yellow-500 rounded-lg text-yellow-400 text-xs hover:bg-yellow-500/10 transition flex items-center justify-center gap-1"
                      >
                        <StarIcon className="w-3 h-3" />
                        Rate
                      </button>
                      {/* Reviews Button - Sirf reviews dekhne ke liye (Reviews tab directly open hoga) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrainerForReviews(trainer);
                          setShowReviewsModal(true);
                        }}
                        className="flex-1 py-1.5 border border-blue-500 rounded-lg text-blue-400 text-xs hover:bg-blue-500/10 transition flex items-center justify-center gap-1"
                      >
                        <EyeIcon className="w-3 h-3" />
                        Reviews
                      </button>
                    </div>
                  )}

                  {/* View Profile Button */}
                  <button
                    onClick={() => handleViewProfile(trainer._id)}
                    className="mt-3 w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trainer Rating Modal - Rate mode only */}
      {showRatingModal && selectedTrainerForRating && (
        <TrainerRatingModal
          trainer={selectedTrainerForRating}
          mode="rate"
          onClose={() => {
            setShowRatingModal(false);
            setSelectedTrainerForRating(null);
          }}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}

      {/* Trainer Reviews Modal - Reviews mode only (saare reviews dikhenge) */}
      {showReviewsModal && selectedTrainerForReviews && (
        <TrainerRatingModal
          trainer={selectedTrainerForReviews}
          mode="reviews"
          onClose={() => {
            setShowReviewsModal(false);
            setSelectedTrainerForReviews(null);
          }}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </DashboardLayout>
  );
};

export default Trainers;
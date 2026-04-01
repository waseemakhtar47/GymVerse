import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { 
  UserGroupIcon, 
  UserIcon, 
  VideoCameraIcon, 
  DocumentTextIcon,
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const Trainers = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [trainerDetails, setTrainerDetails] = useState(null);
  const [trainerCourses, setTrainerCourses] = useState([]);
  const [trainerBlogs, setTrainerBlogs] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [followingLoading, setFollowingLoading] = useState({});

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
      setError('Failed to load trainers');
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (trainerId) => {
    setFollowingLoading(prev => ({ ...prev, [trainerId]: true }));
    try {
      const res = await trainerService.followTrainer(trainerId);
      if (res.data.data.following) {
        const trainer = trainers.find(t => t._id === trainerId);
        setFollowing(prev => [...prev, trainer]);
        toast.success('Now following this trainer');
      } else {
        setFollowing(prev => prev.filter(t => t._id !== trainerId));
        toast.success('Unfollowed trainer');
      }
      const trainersRes = await trainerService.getAllTrainers();
      setTrainers(trainersRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to follow trainer');
    } finally {
      setFollowingLoading(prev => ({ ...prev, [trainerId]: false }));
    }
  };

  const isFollowing = (trainerId) => {
    return following.some(t => t._id === trainerId);
  };

  const handleViewProfile = async (trainer) => {
    setSelectedTrainer(trainer);
    setShowProfileModal(true);
    try {
      const [detailsRes, coursesRes, blogsRes] = await Promise.all([
        trainerService.getTrainerById(trainer._id),
        trainerService.getTrainerCourses(trainer._id).catch(() => ({ data: { data: [] } })),
        trainerService.getTrainerBlogs(trainer._id).catch(() => ({ data: { data: [] } }))
      ]);
      setTrainerDetails(detailsRes.data.data);
      setTrainerCourses(coursesRes.data.data || []);
      setTrainerBlogs(blogsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trainer details:', error);
    }
  };

  const getFollowingTrainers = () => {
    return trainers.filter(t => following.some(f => f._id === t._id));
  };

  const displayedTrainers = activeTab === 'all' ? trainers : getFollowingTrainers();

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
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
            All Trainers ({trainers.length})
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === 'following' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <HeartIcon className="w-4 h-4" />
            Following ({following.length})
          </button>
        </div>

        {trainers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <UserGroupIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Trainers Yet</h3>
            <p className="text-gray-400">There are no trainers registered yet.</p>
          </div>
        ) : displayedTrainers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <HeartIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Following Trainers</h3>
            <p className="text-gray-400">You are not following any trainers yet.</p>
            <button onClick={() => setActiveTab('all')} className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white">
              Browse Trainers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTrainers.map((trainer) => (
              <div key={trainer._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition cursor-pointer" onClick={() => handleViewProfile(trainer)}>
                <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {trainer.profilePic ? (
                        <img src={trainer.profilePic} alt={trainer.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFollow(trainer._id); }}
                      disabled={followingLoading[trainer._id]}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        isFollowing(trainer._id) ? 'bg-red-500/20 text-red-400' : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {followingLoading[trainer._id] ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : isFollowing(trainer._id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg">{trainer.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{trainer.bio || 'Expert fitness trainer helping people achieve their fitness goals.'}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1"><VideoCameraIcon className="w-4 h-4 text-purple-400" /><span className="text-gray-300">{trainer.courses || 0} courses</span></div>
                    <div className="flex items-center gap-1"><DocumentTextIcon className="w-4 h-4 text-blue-400" /><span className="text-gray-300">{trainer.blogs || 0} blogs</span></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3"><StarIcon className="w-4 h-4 text-yellow-500" /><span className="text-gray-300 text-sm">4.9</span><span className="text-gray-500 text-xs">({trainer.followers || 0} followers)</span></div>
                  <button onClick={(e) => { e.stopPropagation(); handleViewProfile(trainer); }} className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedTrainer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto py-8" onClick={() => setShowProfileModal(false)}>
            <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-white/10 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {selectedTrainer.profilePic ? (
                        <img src={selectedTrainer.profilePic} alt={selectedTrainer.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <div><h2 className="text-2xl font-bold text-white">{selectedTrainer.name}</h2><p className="text-white/80 text-sm">{trainerDetails?.specialty || 'Fitness Trainer'}</p></div>
                  </div>
                  <button onClick={() => setShowProfileModal(false)} className="text-white/80 hover:text-white text-xl">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg"><p className="text-2xl font-bold text-white">{trainerCourses.length}</p><p className="text-gray-400 text-sm">Courses</p></div>
                  <div className="text-center p-3 bg-white/5 rounded-lg"><p className="text-2xl font-bold text-white">{trainerBlogs.length}</p><p className="text-gray-400 text-sm">Blogs</p></div>
                  <div className="text-center p-3 bg-white/5 rounded-lg"><p className="text-2xl font-bold text-white">{selectedTrainer.followers || 0}</p><p className="text-gray-400 text-sm">Followers</p></div>
                </div>
                <div><h3 className="text-white font-semibold mb-2">About</h3><p className="text-gray-400 text-sm">{trainerDetails?.bio || 'Certified fitness trainer with expertise in strength training, nutrition, and functional fitness.'}</p></div>
                <button onClick={() => { handleFollow(selectedTrainer._id); setShowProfileModal(false); }} className={`w-full py-3 rounded-lg font-semibold transition ${isFollowing(selectedTrainer._id) ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                  {isFollowing(selectedTrainer._id) ? 'Unfollow Trainer' : 'Follow Trainer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Trainers;
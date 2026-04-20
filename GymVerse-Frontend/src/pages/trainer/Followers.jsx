import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { UserGroupIcon, UserIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Followers = () => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await trainerService.getMyFollowers();
      setFollowers(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch followers:', error);
      setError(error.response?.data?.message || 'Failed to load followers');
      toast.error('Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Followers" role="trainer">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading followers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Followers" role="trainer">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchFollowers}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Followers" role="trainer">
      <div className="space-y-6">
        {/* Stats Card */}
        <div className="bg-linear-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center gap-4">
            <UserGroupIcon className="w-12 h-12 text-purple-400" />
            <div>
              <h2 className="text-3xl font-bold text-white">{followers.length}</h2>
              <p className="text-gray-300">Total Followers</p>
            </div>
          </div>
        </div>

        {/* Followers List */}
        {followers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <UserGroupIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Followers Yet</h3>
            <p className="text-gray-400">
              Share your content and courses to gain followers!
            </p>
            <button
              onClick={() => navigate('/trainer/blogs')}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
            >
              Create a Blog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {followers.map((follower) => (
              <div
                key={follower._id}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:scale-105 transition cursor-pointer"
                onClick={() => navigate(`/trainer/follower/${follower._id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{follower.name}</h3>
                    <p className="text-gray-400 text-sm">{follower.email}</p>
                    {follower.phone && (
                      <p className="text-gray-500 text-xs mt-1">{follower.phone}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <button className="w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Followers;
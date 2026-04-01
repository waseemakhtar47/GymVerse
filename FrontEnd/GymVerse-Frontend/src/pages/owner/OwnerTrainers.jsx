import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { UserIcon, UserGroupIcon, VideoCameraIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OwnerTrainers = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await trainerService.getAllTrainers();
      setTrainers(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="All Trainers" role="owner">
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
    <DashboardLayout title="All Trainers" role="owner">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Find Trainers to Hire</h2>
          <p className="text-gray-400 text-sm mt-1">Browse through all trainers and send hiring requests</p>
        </div>

        {trainers.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <UserGroupIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Trainers Found</h3>
            <p className="text-gray-400">No trainers are registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <div key={trainer._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition cursor-pointer" onClick={() => navigate(`/trainer-profile/${trainer._id}`)}>
                <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {trainer.profilePic ? (
                        <img src={trainer.profilePic} alt={trainer.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{trainer.name}</h3>
                      <p className="text-white/80 text-sm truncate max-w-50">{trainer.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {trainer.bio && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{trainer.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <VideoCameraIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300 text-sm">{trainer.courses || 0} courses</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DocumentTextIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">{trainer.blogs || 0} blogs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">{trainer.followers || 0} followers</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/trainer-profile/${trainer._id}`); }}
                    className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View Profile & Hire
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

export default OwnerTrainers;
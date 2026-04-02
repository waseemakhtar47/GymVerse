import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { gymService } from '../../services/gymService';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ArrowRightCircleIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyGyms = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavingGym, setLeavingGym] = useState(null);

  useEffect(() => {
    fetchMyGyms();
  }, []);

  const fetchMyGyms = async () => {
    setLoading(true);
    try {
      const res = await trainerService.getMyGyms();
      setGyms(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch my gyms:', error);
      toast.error('Failed to load gyms');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGym = async (gymId, gymName) => {
    if (!confirm(`Are you sure you want to leave "${gymName}"? You will no longer be associated with this gym.`)) {
      return;
    }
    
    setLeavingGym(gymId);
    try {
      await trainerService.leaveGym(gymId);
      toast.success(`You have left ${gymName}`);
      setGyms(prev => prev.filter(g => g._id !== gymId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave gym');
    } finally {
      setLeavingGym(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Gyms" role="trainer">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your gyms...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Gyms" role="trainer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Associated Gyms</h2>
          <p className="text-gray-400 text-sm mt-1">Gyms where you are currently working</p>
        </div>

        {gyms.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Associated Gyms</h3>
            <p className="text-gray-400">You are not associated with any gym yet.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button
                onClick={() => navigate('/trainer/available-gyms')}
                className="px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
              >
                Find Gyms to Apply
              </button>
              <button
                onClick={() => navigate('/trainer/my-requests')}
                className="px-6 py-2 border border-purple-500 rounded-lg text-purple-400 hover:bg-purple-500/10"
              >
                Check Job Offers
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <div key={gym._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-green-500/30 hover:scale-105 transition">
                {/* Gym Header */}
                <div className="h-28 bg-linear-to-r from-green-600 to-emerald-600 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {gym.profilePic ? (
                        <img src={gym.profilePic} alt={gym.name} className="w-full h-full object-cover" />
                      ) : (
                        <BuildingOfficeIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{gym.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {gym.source === 'trainer' ? (
                          <span className="text-xs px-2 py-0.5 bg-blue-500/30 rounded-full flex items-center gap-1">
                            <UserPlusIcon className="w-3 h-3" />
                            Applied by you
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 bg-purple-500/30 rounded-full flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Offer accepted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Gym Details */}
                <div className="p-4">
                  {gym.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{gym.description}</p>
                  )}
                  
                  {gym.address && (
                    <div className="flex items-start gap-2 text-gray-400 text-sm mb-2">
                      <MapPinIcon className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{gym.address}</span>
                    </div>
                  )}
                  
                  {gym.timings?.open && gym.timings?.close && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{gym.timings.open} - {gym.timings.close}</span>
                    </div>
                  )}
                  
                  {gym.contactNumber && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{gym.contactNumber}</span>
                    </div>
                  )}
                  
                  {/* ✅ Owner Name Added */}
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 mb-2">
                    <UserIcon className="w-3 h-3" />
                    <span>Owner: {gym.ownerId?.name || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                    <CheckCircleIcon className="w-3 h-3 text-green-400" />
                    <span>Associated since: {new Date(gym.joinedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Facilities Tags */}
                  {gym.facilities && gym.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {gym.facilities.slice(0, 3).map((facility, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-gray-400">
                          {facility}
                        </span>
                      ))}
                      {gym.facilities.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-gray-400">
                          +{gym.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/gym-details/${gym._id}`)}
                      className="flex-1 py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition flex items-center justify-center gap-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleLeaveGym(gym._id, gym.name)}
                      disabled={leavingGym === gym._id}
                      className="flex-1 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition flex items-center justify-center gap-1"
                    >
                      <ArrowRightCircleIcon className="w-4 h-4" />
                      {leavingGym === gym._id ? 'Leaving...' : 'Leave Gym'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyGyms;
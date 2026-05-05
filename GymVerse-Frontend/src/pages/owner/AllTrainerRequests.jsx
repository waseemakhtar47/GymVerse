import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { gymService } from '../../services/gymService';
import { UserIcon, CheckIcon, XMarkIcon, BuildingOfficeIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AllTrainerRequests = () => {
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const gymsRes = await gymService.getOwnerGyms();
      const ownerGyms = gymsRes.data.data || [];
      
      const requests = [];
      for (const gym of ownerGyms) {
        try {
          const appsRes = await gymService.getGymApplications(gym._id);
          const gymApps = appsRes.data.data || [];
          gymApps.forEach(app => {
            requests.push({
              ...app,
              gymName: gym.name,
              gymId: gym._id,
            });
          });
        } catch (error) {
          if (error.response?.status === 403) {
            console.log(`Skipping gym ${gym._id} - not authorized`);
          }
        }
      }
      setAllRequests(requests);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (gymId, trainerId, status) => {
    setProcessing(`${gymId}-${trainerId}`);
    try {
      await gymService.updateApplicationStatus(gymId, trainerId, status);
      toast.success(status === 'approved' ? 'Trainer approved' : 'Application rejected');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setProcessing(null);
    }
  };

  const handleCardClick = (trainerId) => {
    if (trainerId) {
      navigate(`/trainer-profile/${trainerId}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Trainer Requests" role="owner">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading requests...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Trainer Requests" role="owner">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Trainer Applications</h2>
          <p className="text-gray-400 text-sm mt-1">Trainers who have applied to your gyms</p>
        </div>

        {allRequests.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <UserIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
            <p className="text-gray-400">No trainers have applied to your gyms yet.</p>
            <button
              onClick={() => navigate('/owner/gyms')}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
            >
              View Your Gyms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allRequests.map((request) => (
              <div 
                key={request._id} 
                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-yellow-500/30 hover:scale-[1.02] transition cursor-pointer group"
                onClick={() => handleCardClick(request.trainerId?._id)}
              >
                {/* Gym Header */}
                <div className="h-24 bg-linear-to-r from-purple-600 to-blue-600 p-4">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{request.gymName}</h3>
                      <p className="text-white/80 text-sm">Application received</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition">
                      <EyeIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Trainer Info */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-blue-500 overflow-hidden flex items-center justify-center">
                      {request.trainerId?.profilePic ? (
                        <img src={request.trainerId.profilePic} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{request.trainerId?.name || 'Unknown'}</h4>
                      <p className="text-gray-400 text-sm">{request.trainerId?.email || 'Email not available'}</p>
                    </div>
                  </div>
                  
                  {request.trainerId?.phone && (
                    <p className="text-gray-400 text-sm mb-2">📞 {request.trainerId.phone}</p>
                  )}
                  
                  {request.trainerId?.specialty && (
                    <p className="text-purple-400 text-xs mb-2">Specialty: {request.trainerId.specialty}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                    <ClockIcon className="w-3 h-3" />
                    <span>Applied on: {new Date(request.joinedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdate(request.gymId, request.trainerId._id, 'approved')}
                      disabled={processing === `${request.gymId}-${request.trainerId._id}`}
                      className="flex-1 py-2 bg-green-600 rounded-lg text-white text-sm hover:bg-green-700 transition flex items-center justify-center gap-1"
                    >
                      <CheckIcon className="w-4 h-4" />
                      {processing === `${request.gymId}-${request.trainerId._id}` ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleUpdate(request.gymId, request.trainerId._id, 'rejected')}
                      disabled={processing === `${request.gymId}-${request.trainerId._id}`}
                      className="flex-1 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition flex items-center justify-center gap-1"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Decline
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

export default AllTrainerRequests;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { gymService } from '../../services/gymService';
import { UserIcon, TrashIcon, BuildingOfficeIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AllSentRequests = () => {
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
      // ✅ Pehle owner ke apne gyms fetch karo
      const gymsRes = await gymService.getOwnerGyms();
      const ownerGyms = gymsRes.data.data || [];
      
      
      // ✅ Sirf owner ke apne gyms ke sent requests fetch karo
      const requests = [];
      for (const gym of ownerGyms) {
        try {
          const reqsRes = await gymService.getGymSentRequests(gym._id);
          const gymReqs = reqsRes.data.data || [];
          gymReqs.forEach(req => {
            requests.push({
              ...req,
              gymName: gym.name,
              gymId: gym._id,
            });
          });
        } catch (error) {
          console.error(`Failed to fetch sent requests for gym ${gym._id}:`, error);
          // Agar 403 aata hai toh skip karo (yeh gym owner ki nahi hai)
          if (error.response?.status === 403) {
            console.log(`Skipping gym ${gym._id} - not authorized`);
          }
        }
      }
      setAllRequests(requests);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load sent requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (gymId, trainerId) => {
    setProcessing(`${gymId}-${trainerId}`);
    try {
      await gymService.cancelSentRequest(gymId, trainerId);
      toast.success('Request cancelled successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Sent Hiring Requests" role="owner">
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
    <DashboardLayout title="Sent Hiring Requests" role="owner">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Pending Hiring Requests</h2>
          <p className="text-gray-400 text-sm mt-1">Requests you've sent to trainers waiting for response</p>
        </div>

        {allRequests.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <EnvelopeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
            <p className="text-gray-400">You haven't sent any hiring requests to trainers yet.</p>
            <button
              onClick={() => navigate('/owner/trainers')}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
            >
              Find Trainers to Hire
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allRequests.map((request) => (
              <div key={request._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-yellow-500/30 hover:scale-[1.02] transition">
                {/* Gym Header */}
                <div className="h-24 bg-linear-to-r from-blue-600 to-purple-600 p-4">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                    <div>
                      <h3 className="text-white font-bold text-lg">{request.gymName}</h3>
                      <p className="text-white/80 text-sm">Waiting for trainer response</p>
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
                      <h4 className="text-white font-semibold text-lg">{request.trainerId?.name}</h4>
                      <p className="text-gray-400 text-sm">{request.trainerId?.email}</p>
                    </div>
                  </div>
                  
                  {request.trainerId?.phone && (
                    <p className="text-gray-400 text-sm mb-2">📞 {request.trainerId.phone}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
                    <ClockIcon className="w-3 h-3" />
                    <span>Sent on: {new Date(request.joinedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <button
                    onClick={() => handleCancel(request.gymId, request.trainerId._id)}
                    disabled={processing === `${request.gymId}-${request.trainerId._id}`}
                    className="w-full py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    {processing === `${request.gymId}-${request.trainerId._id}` ? 'Cancelling...' : 'Cancel Request'}
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

export default AllSentRequests;
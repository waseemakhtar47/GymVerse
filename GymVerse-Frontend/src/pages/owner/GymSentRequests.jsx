import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { gymService } from '../../services/gymService';
import { UserIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GymSentRequests = () => {
  const { gymId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchData();
  }, [gymId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqsRes, gymRes] = await Promise.all([
        gymService.getGymSentRequests(gymId),
        gymService.getGymById(gymId),
      ]);
      setRequests(reqsRes.data.data || []);
      setGym(gymRes.data.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (trainerId) => {
    setProcessing(trainerId);
    try {
      await gymService.cancelSentRequest(gymId, trainerId);
      toast.success('Request cancelled');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
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
    <DashboardLayout title={`Sent Requests - ${gym?.name || 'Gym'}`} role="owner">
      <div className="space-y-6">
        <button onClick={() => navigate(`/owner/memberships/${gymId}`)} className="text-gray-400 hover:text-white transition flex items-center gap-2">
          ← Back to Gym
        </button>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <UserIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
            <p className="text-gray-400">You haven't sent any hiring requests to trainers for this gym.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div key={req._id} className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-blue-500 overflow-hidden">
                        {req.trainerId?.profilePic ? (
                          <img src={req.trainerId.profilePic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {req.trainerId?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{req.trainerId?.name}</h3>
                        <p className="text-gray-400 text-sm">{req.trainerId?.email}</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      Sent on: {new Date(req.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCancel(req.trainerId._id)}
                    disabled={processing === req.trainerId._id}
                    className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition"
                  >
                    <TrashIcon className="w-5 h-5" />
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

export default GymSentRequests;
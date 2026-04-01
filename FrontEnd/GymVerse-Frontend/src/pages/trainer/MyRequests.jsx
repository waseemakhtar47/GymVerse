import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { BuildingOfficeIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await trainerService.getMyRequests();
      setRequests(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    setProcessing(requestId);
    try {
      const res = await trainerService.updateRequestStatus(requestId, status);
      toast.success(res.data.message);
      // Remove from list immediately
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    } finally {
      setProcessing(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const historyRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <DashboardLayout title="Job Offers" role="trainer">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading offers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Job Offers" role="trainer">
      <div className="space-y-8">
        {/* Pending Offers */}
        {pendingRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">New Offers ({pendingRequests.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map((request) => (
                <div key={request._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-yellow-500/30">
                  <div className="h-24 bg-gradient-to-r from-yellow-600 to-orange-600 p-4">
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="w-8 h-8 text-white" />
                      <div>
                        <h3 className="text-white font-bold text-lg">{request.gymId?.name}</h3>
                        <p className="text-white/80 text-sm">From: {request.gymId?.ownerId?.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-400 text-sm mb-4">{request.gymId?.address}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateStatus(request._id, 'approved')}
                        disabled={processing === request._id}
                        className="flex-1 py-2 bg-green-600 rounded-lg text-white text-sm hover:bg-green-700 transition"
                      >
                        {processing === request._id ? 'Processing...' : 'Accept Offer'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(request._id, 'rejected')}
                        disabled={processing === request._id}
                        className="flex-1 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {historyRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-70">
              {historyRequests.map((request) => (
                <div key={request._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{request.gymId?.name}</h4>
                      <p className="text-gray-400 text-sm">{request.gymId?.address}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {request.status === 'approved' ? 'Accepted' : 'Declined'} on: {new Date(request.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {request.status === 'approved' ? 'Accepted' : 'Declined'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {requests.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Offers Yet</h3>
            <p className="text-gray-400">When gym owners send you offers, they'll appear here.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyRequests;
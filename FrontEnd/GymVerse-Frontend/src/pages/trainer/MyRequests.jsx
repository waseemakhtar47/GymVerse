import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { 
  BuildingOfficeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
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
      // ✅ Sirf pending requests dikhao
      const pendingRequests = (res.data.data || []).filter(r => r.status === 'pending');
      setRequests(pendingRequests);
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
      // ✅ Remove card from list immediately
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Job Offers" role="trainer">
        <div className="flex items-center justify-center min-h-100">
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Job Offers</h2>
          <p className="text-gray-400 text-sm mt-1">Review and respond to hiring requests from gym owners</p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Offers</h3>
            <p className="text-gray-400">You don't have any pending job offers at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-yellow-500/30 hover:scale-[1.02] transition">
                <div className="h-24 bg-linear-to-r from-yellow-600 to-orange-600 p-4">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                    <div>
                      <h3 className="text-white font-bold text-lg">{request.gymId?.name}</h3>
                      <p className="text-white/80 text-sm">From: {request.gymId?.ownerId?.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {request.gymId?.address && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{request.gymId.address}</span>
                    </div>
                  )}
                  {request.gymId?.contactNumber && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{request.gymId.contactNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>{request.gymId?.ownerId?.email}</span>
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-4">
                    Received on: {new Date(request.appliedAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus(request._id, 'approved')}
                      disabled={processing === request._id}
                      className="flex-1 py-2 bg-green-600 rounded-lg text-white text-sm hover:bg-green-700 transition flex items-center justify-center gap-1"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      {processing === request._id ? 'Processing...' : 'Accept Offer'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request._id, 'rejected')}
                      disabled={processing === request._id}
                      className="flex-1 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition flex items-center justify-center gap-1"
                    >
                      <XCircleIcon className="w-4 h-4" />
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

export default MyRequests;
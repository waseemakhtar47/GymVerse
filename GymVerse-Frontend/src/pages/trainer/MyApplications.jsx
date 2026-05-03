import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { BuildingOfficeIcon, XCircleIcon, ClockIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await trainerService.getMyApplications();
      // Filter out applications with null gymId
      const apps = (res.data.data || []).filter(app => app.gymId !== null);
      setApplications(apps);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReapply = async (gymId) => {
    if (!gymId) {
      toast.error('Cannot reapply to this gym');
      return;
    }
    setProcessing(gymId);
    try {
      await trainerService.applyToGym(gymId);
      toast.success('Application resubmitted successfully!');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reapply');
    } finally {
      setProcessing(null);
    }
  };

  const handleCancel = async (requestId) => {
    setProcessing(requestId);
    try {
      await trainerService.updateRequestStatus(requestId, 'rejected');
      toast.success('Application cancelled');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 flex items-center gap-1"><XCircleIcon className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 flex items-center gap-1"><ClockIcon className="w-3 h-3" /> Pending</span>;
    }
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const rejectedApps = applications.filter(a => a.status === 'rejected');
  const approvedApps = applications.filter(a => a.status === 'approved');

  if (loading) {
    return (
      <DashboardLayout title="My Applications" role="trainer">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading applications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Applications" role="trainer">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white">My Applications</h2>
          <p className="text-gray-400 text-sm mt-1">Jobs you've applied to at gyms</p>
        </div>

        {/* Pending Applications */}
        {pendingApps.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Pending ({pendingApps.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApps.map((app) => (
                <div key={app._id} className="bg-white/5 rounded-xl p-4 border border-yellow-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{app.gymId?.name || 'Unknown Gym'}</h4>
                      <p className="text-gray-400 text-sm">{app.gymId?.address || 'Address not available'}</p>
                      <p className="text-gray-500 text-xs mt-2">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(app.status)}
                      <button
                        onClick={() => handleCancel(app._id)}
                        disabled={processing === app._id}
                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Applications - Can Reapply */}
        {rejectedApps.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Rejected ({rejectedApps.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rejectedApps.map((app) => (
                <div key={app._id} className="bg-white/5 rounded-xl p-4 border border-red-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{app.gymId?.name || 'Unknown Gym'}</h4>
                      <p className="text-gray-400 text-sm">{app.gymId?.address || 'Address not available'}</p>
                      <p className="text-gray-500 text-xs mt-2">Rejected on: {new Date(app.updatedAt || app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(app.status)}
                      {app.gymId && (
                        <button
                          onClick={() => handleReapply(app.gymId._id)}
                          disabled={processing === app.gymId._id}
                          className="mt-2 text-xs bg-purple-600 px-3 py-1 rounded-lg text-white hover:bg-purple-700 flex items-center gap-1"
                        >
                          <ArrowPathIcon className="w-3 h-3" />
                          Apply Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Applications */}
        {approvedApps.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Approved ({approvedApps.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
              {approvedApps.map((app) => (
                <div key={app._id} className="bg-white/5 rounded-xl p-4 border border-green-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{app.gymId?.name || 'Unknown Gym'}</h4>
                      <p className="text-gray-400 text-sm">{app.gymId?.address || 'Address not available'}</p>
                      <p className="text-gray-500 text-xs mt-2">Approved on: {new Date(app.updatedAt || app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
            <p className="text-gray-400">Apply to gyms to see your applications here.</p>
            <button
              onClick={() => navigate('/trainer/available-gyms')}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
            >
              Find Gyms
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
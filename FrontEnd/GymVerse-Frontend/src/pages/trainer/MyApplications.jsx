import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { BuildingOfficeIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await trainerService.getMyApplications();
      // ✅ Filter only trainer-initiated applications (where status is not from owner hiring)
      // In backend, we need to differentiate. For now, show all.
      setApplications(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
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
  const historyApps = applications.filter(a => a.status !== 'pending');

  if (loading) {
    return (
      <DashboardLayout title="My Applications" role="trainer">
        <div className="flex items-center justify-center min-h-[400px]">
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
          <h2 className="text-xl font-semibold text-white mb-4">Applications You Sent ({applications.length})</h2>
          <p className="text-gray-400 text-sm mb-4">Jobs you've applied to at gyms</p>
        </div>

        {pendingApps.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Pending ({pendingApps.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApps.map((app) => (
                <div key={app._id} className="bg-white/5 rounded-xl p-4 border border-yellow-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{app.gymId?.name}</h4>
                      <p className="text-gray-400 text-sm">{app.gymId?.address}</p>
                      <p className="text-gray-500 text-xs mt-2">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {historyApps.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-white mb-3">History ({historyApps.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
              {historyApps.map((app) => (
                <div key={app._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{app.gymId?.name}</h4>
                      <p className="text-gray-400 text-sm">{app.gymId?.address}</p>
                      <p className="text-gray-500 text-xs mt-2">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
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
            <button onClick={() => window.location.href = '/trainer/available-gyms'} className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white">Find Gyms</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyApplications;
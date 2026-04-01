import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { BuildingOfficeIcon, MapPinIcon, ClockIcon, PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AvailableGyms = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gymsRes, appsRes] = await Promise.all([
        trainerService.getAvailableGyms(),
        trainerService.getMyApplications(),
      ]);
      setGyms(gymsRes.data.data || []);
      setApplications(appsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load gyms');
    } finally {
      setLoading(false);
    }
  };

  const hasApplied = (gymId) => {
    return applications.some(app => app.gymId?._id === gymId);
  };

  const getApplicationStatus = (gymId) => {
    const app = applications.find(app => app.gymId?._id === gymId);
    return app?.status;
  };

  const handleApply = async (gymId) => {
    try {
      await trainerService.applyToGym(gymId);
      toast.success('Application submitted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Find Gym Jobs" role="trainer">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading gyms...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Find Gym Jobs" role="trainer">
      <div className="space-y-6">
        {gyms.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Gyms Available</h3>
            <p className="text-gray-400">Check back later for job opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => {
              const applied = hasApplied(gym._id);
              const status = getApplicationStatus(gym._id);
              
              return (
                <div key={gym._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition">
                  <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4">
                    <h3 className="text-white font-bold text-lg">{gym.name}</h3>
                    <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="truncate">{gym.address?.substring(0, 40)}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{gym.description || 'No description'}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <ClockIcon className="w-4 h-4" />
                        <span>{gym.timings?.open} - {gym.timings?.close}</span>
                      </div>
                      {gym.contactNumber && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{gym.contactNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    {applied ? (
                      <div className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                          status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {status === 'approved' ? 'Approved!' :
                           status === 'rejected' ? 'Rejected' :
                           'Application Submitted'}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(gym._id)}
                        className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AvailableGyms;
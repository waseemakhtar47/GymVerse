import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { trainerService } from '../../services/trainerService';
import { gymService } from '../../services/gymService';
import { UserIcon, UserGroupIcon, VideoCameraIcon, DocumentTextIcon, EyeIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OwnerTrainers = () => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [ownerGyms, setOwnerGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState('');
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    fetchTrainers();
    fetchOwnerGyms();
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

  const fetchOwnerGyms = async () => {
    try {
      const res = await gymService.getOwnerGyms();
      setOwnerGyms(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch owner gyms:', error);
    }
  };

  const handleHire = async () => {
    if (!selectedGym) {
      toast.error('Please select a gym');
      return;
    }
    
    setHiring(true);
    try {
      await trainerService.applyToGym(selectedGym, selectedTrainer._id);
      toast.success(`Hiring request sent to ${selectedTrainer.name}!`);
      setShowHireModal(false);
      setSelectedGym('');
      setSelectedTrainer(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send hiring request');
    } finally {
      setHiring(false);
    }
  };

  const openHireModal = (trainer) => {
    if (ownerGyms.length === 0) {
      toast.error('You need to create a gym first before hiring trainers');
      navigate('/owner/create-gym');
      return;
    }
    setSelectedTrainer(trainer);
    setShowHireModal(true);
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
          <p className="text-gray-400 text-sm mt-1">Browse through all trainers and send hiring requests to your gyms</p>
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
              <div key={trainer._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition">
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
                  <div className="flex gap-2">
                    {/* View Profile Button */}
                    <button
                      onClick={() => navigate(`/trainer-profile/${trainer._id}`)}
                      className="flex-1 py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition flex items-center justify-center gap-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Profile
                    </button>
                    {/* Hire Button */}
                    <button
                      onClick={() => openHireModal(trainer)}
                      className="flex-1 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition flex items-center justify-center gap-1"
                    >
                      <BriefcaseIcon className="w-4 h-4" />
                      Hire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hire Modal */}
      {showHireModal && selectedTrainer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowHireModal(false)}>
          <div className="bg-gray-900 rounded-xl max-w-md w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Hire Trainer</h3>
                <button onClick={() => setShowHireModal(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400 text-sm">Trainer</p>
                <p className="text-white font-semibold">{selectedTrainer.name}</p>
                {selectedTrainer.specialty && (
                  <p className="text-gray-500 text-xs mt-1">Specialty: {selectedTrainer.specialty}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="text-gray-400 text-sm block mb-2">Select Your Gym</label>
                <select
                  value={selectedGym}
                  onChange={(e) => setSelectedGym(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 rounded-lg text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a gym...</option>
                  {ownerGyms.map(gym => (
                    <option key={gym._id} value={gym._id}>{gym.name}</option>
                  ))}
                </select>
                {ownerGyms.length === 0 && (
                  <p className="text-yellow-400 text-xs mt-2">
                    You don't have any gyms. <button onClick={() => navigate('/owner/create-gym')} className="text-purple-400 underline">Create one first</button>
                  </p>
                )}
              </div>
              
              <button
                onClick={handleHire}
                disabled={!selectedGym || hiring || ownerGyms.length === 0}
                className="w-full py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
              >
                {hiring ? 'Sending...' : 'Send Hiring Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerTrainers;
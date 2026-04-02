import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gymService } from '../services/gymService';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon,
  StarIcon,
  UserGroupIcon,
  WifiIcon,
  FireIcon,
  SparklesIcon,
  ArrowLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const GymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGymDetails();
  }, [id]);

  const fetchGymDetails = async () => {
    setLoading(true);
    try {
      const res = await gymService.getGymById(id);
      setGym(res.data.data);
    } catch (err) {
      console.error('Failed to fetch gym details:', err);
      setError('Gym not found');
    } finally {
      setLoading(false);
    }
  };

  const getFacilityIcon = (facility) => {
    const lower = facility.toLowerCase();
    if (lower.includes('wifi')) return <WifiIcon className="w-4 h-4" />;
    if (lower.includes('cardio') || lower.includes('treadmill')) return <FireIcon className="w-4 h-4" />;
    if (lower.includes('yoga') || lower.includes('zumba')) return <SparklesIcon className="w-4 h-4" />;
    return <BuildingOfficeIcon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading gym details...</p>
        </div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">Gym not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition flex items-center gap-2">
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{gym.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-white">4.8</span>
                <span className="text-white/70 text-sm">(120 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-purple-400" />
            Gym Owner
          </h2>
          <p className="text-gray-300">{gym.ownerId?.name || 'Unknown'}</p>
          <p className="text-gray-400 text-sm mt-1">{gym.ownerId?.email}</p>
        </div>

        {/* Description */}
        {gym.description && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2">About</h2>
            <p className="text-gray-300 leading-relaxed">{gym.description}</p>
          </div>
        )}

        {/* Location */}
        {gym.address && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-purple-400" />
              Location
            </h2>
            <p className="text-gray-300">{gym.address}</p>
          </div>
        )}

        {/* Timings */}
        {gym.timings && (gym.timings.open || gym.timings.close) && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-purple-400" />
              Operating Hours
            </h2>
            <p className="text-gray-300">{gym.timings.open} - {gym.timings.close}</p>
          </div>
        )}

        {/* Contact */}
        {gym.contactNumber && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-purple-400" />
              Contact
            </h2>
            <p className="text-gray-300">{gym.contactNumber}</p>
          </div>
        )}

        {/* Facilities */}
        {gym.facilities && gym.facilities.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5 text-purple-400" />
              Facilities
            </h2>
            <div className="flex flex-wrap gap-2">
              {gym.facilities.map((facility, idx) => (
                <span key={idx} className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm">
                  {getFacilityIcon(facility)}
                  {facility}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymDetails;
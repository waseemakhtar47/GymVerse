import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { gymService } from '../../services/gymService';
import { trainerService } from '../../services/trainerService';
import GymMap from '../../components/GymMap';
import LocationSearch from '../../components/LocationSearch';
import { 
  MapPinIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  BuildingOfficeIcon,
  ClockIcon,
  PhoneIcon,
  StarIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AvailableGyms = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showGymSuggestions, setShowGymSuggestions] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [applications, setApplications] = useState([]);
  
  const locationSearchRef = useRef(null);
  const gymSearchRef = useRef(null);

  useEffect(() => {
    fetchGyms();
    fetchApplications();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = gyms.filter(gym =>
        gym.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGyms(filtered);
      setSearchSuggestions(filtered.slice(0, 5));
    } else {
      setFilteredGyms(gyms);
      setSearchSuggestions([]);
    }
  }, [searchTerm, gyms]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationSearchQuery.length >= 3) {
        searchLocation(locationSearchQuery);
      } else {
        setLocationSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [locationSearchQuery]);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const res = await gymService.getAllGyms();
      setGyms(res.data.data || []);
      setFilteredGyms(res.data.data || []);
    } catch (err) {
      console.error('Error fetching gyms:', err);
      toast.error('Failed to load gyms');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await trainerService.getMyApplications();
      setApplications(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const fetchNearbyGyms = async (lng, lat) => {
    setLoading(true);
    try {
      const res = await gymService.getNearbyGyms(lng, lat, 50000);
      if (res.data.data?.length === 0) {
        fetchGyms();
      } else {
        setGyms(res.data.data || []);
        setFilteredGyms(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching nearby gyms:', err);
      fetchGyms();
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async (query) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      );
      const data = await res.json();
      setLocationSuggestions(data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      })));
      setShowLocationSuggestions(true);
    } catch (err) {
      console.error('Location search error:', err);
    }
  };

  const getUserLocation = () => {
    setGettingLocation(true);
    setLocationError(false);
    
    if (!navigator.geolocation) {
      setLocationError(true);
      setGettingLocation(false);
      toast.error('Geolocation not supported');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log('📍 Trainer location:', location);
        setUserLocation(location);
        setMapCenter(location);
        fetchNearbyGyms(location.lng, location.lat);
        setGettingLocation(false);
        setLocationError(false);
        setForceUpdate(prev => prev + 1);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError(true);
        setGettingLocation(false);
        toast.error('Unable to get your location');
      }
    );
  };

  const handleLocationSelect = (loc) => {
    setUserLocation({ lat: loc.lat, lng: loc.lng });
    setMapCenter({ lat: loc.lat, lng: loc.lng });
    fetchNearbyGyms(loc.lng, loc.lat);
    setLocationSearchQuery(loc.name.split(',')[0]);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setLocationError(false);
    setForceUpdate(prev => prev + 1);
  };

  const handleGymSelect = (gym) => {
    setSearchTerm(gym.name);
    setSearchSuggestions([]);
    setShowGymSuggestions(false);
    setSelectedGym(gym);
    
    const lat = gym.location?.coordinates?.[1];
    const lng = gym.location?.coordinates?.[0];
    if (lat && lng) {
      setMapCenter({ lat, lng });
    }
  };

  const handleGymClick = (gym) => {
    setSelectedGym(gym);
    const element = document.getElementById(`gym-${gym._id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleApply = async (gymId) => {
    try {
      await trainerService.applyToGym(gymId);
      toast.success('Application submitted successfully!');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  const hasApplied = (gymId) => {
    return applications.some(app => app.gymId?._id === gymId);
  };

  const getApplicationStatus = (gymId) => {
    const app = applications.find(app => app.gymId?._id === gymId);
    return app?.status;
  };

  const handleReset = () => {
    setSearchTerm('');
    setLocationSearchQuery('');
    setSelectedGym(null);
    setLocationSuggestions([]);
    setSearchSuggestions([]);
    setUserLocation(null);
    setMapCenter(null);
    setLocationError(false);
    fetchGyms();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (gymSearchRef.current && !gymSearchRef.current.contains(event.target)) {
        setShowGymSuggestions(false);
      }
      if (locationSearchRef.current && !locationSearchRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading && gyms.length === 0) {
    return (
      <DashboardLayout title="Find Gym Jobs" role="trainer">
        <div className="flex items-center justify-center h-125">
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
      <div className="space-y-4">
        {/* Search Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Location Search */}
          <div className="relative" ref={locationSearchRef}>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                onFocus={() => locationSearchQuery.length >= 3 && setShowLocationSuggestions(true)}
                placeholder="Search city, area, or address..."
                className="w-full pl-10 pr-10 py-3 bg-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {locationSearchQuery && (
                <button onClick={() => { setLocationSearchQuery(''); setLocationSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                {locationSuggestions.map((loc, idx) => (
                  <button key={idx} onClick={() => handleLocationSelect(loc)} className="w-full text-left px-4 py-3 hover:bg-white/10 transition border-b border-white/5 last:border-0">
                    <p className="text-white text-sm">{loc.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gym Name Search */}
          <div className="relative" ref={gymSearchRef}>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm && setShowGymSuggestions(true)}
                placeholder="Search gym by name..."
                className="w-full pl-10 pr-10 py-3 bg-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchTerm && (
                <button onClick={() => { setSearchTerm(''); setSearchSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            {showGymSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                {searchSuggestions.map((gym) => (
                  <button key={gym._id} onClick={() => handleGymSelect(gym)} className="w-full text-left px-4 py-3 hover:bg-white/10 transition border-b border-white/5 last:border-0">
                    <p className="text-white font-medium">{gym.name}</p>
                    <p className="text-gray-400 text-xs">{gym.address?.substring(0, 60)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={getUserLocation}
            disabled={gettingLocation}
            className="px-5 py-2.5 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:scale-105 transition flex items-center gap-2 disabled:opacity-50"
          >
            {gettingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Getting your location...</span>
              </>
            ) : (
              <>
                <MapPinIcon className="w-5 h-5" />
                <span>Use My Current Location</span>
              </>
            )}
          </button>
          <button onClick={handleReset} className="px-5 py-2.5 bg-gray-700 rounded-xl text-white hover:bg-gray-600 transition flex items-center gap-2">
            <XMarkIcon className="w-5 h-5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            🏋️ Found <span className="text-purple-400 font-semibold">{filteredGyms.length}</span> gyms
          </p>
          {userLocation && !locationError && (
            <p className="text-green-400 text-sm flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              Showing gyms near your location
            </p>
          )}
        </div>

        {/* Map and Gym List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-gray-900 sticky top-20">
              <GymMap
                key={forceUpdate}
                gyms={filteredGyms}
                onGymClick={handleGymClick}
                userLocation={mapCenter || userLocation}
                selectedGym={selectedGym}
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5" />
                Gyms Hiring
              </h3>
              <p className="text-gray-400 text-xs mt-1">Click on any gym to apply</p>
            </div>
            <div className="max-h-125 overflow-y-auto">
              {filteredGyms.length === 0 ? (
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="w-12 h-12 mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400">No gyms found</p>
                  <button onClick={handleReset} className="mt-3 text-purple-400 text-sm hover:text-purple-300">Clear search</button>
                </div>
              ) : (
                filteredGyms.map((gym) => {
                  const applied = hasApplied(gym._id);
                  const status = getApplicationStatus(gym._id);
                  return (
                    <div
                      key={gym._id}
                      id={`gym-${gym._id}`}
                      onClick={() => handleGymSelect(gym)}
                      className={`p-4 border-b border-white/10 cursor-pointer transition-all hover:bg-white/10 ${
                        selectedGym?._id === gym._id ? 'bg-purple-600/20 border-l-4 border-l-purple-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-base">{gym.name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            <StarIcon className="w-3 h-3 text-yellow-500" />
                            <span className="text-gray-400 text-xs">4.8</span>
                            <span className="text-gray-500 text-xs ml-1">(120 reviews)</span>
                          </div>
                          <p className="text-gray-400 text-xs mt-2 line-clamp-2">{gym.address}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {gym.timings?.open && <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" />{gym.timings.open} - {gym.timings.close}</span>}
                            {gym.contactNumber && <span className="flex items-center gap-1"><PhoneIcon className="w-3 h-3" />{gym.contactNumber}</span>}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {gym.facilities?.slice(0, 3).map((fac, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-gray-400">{fac}</span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-3">
                          {applied ? (
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Applied'}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApply(gym._id); }}
                              className="px-3 py-1 bg-purple-600 rounded-lg text-white text-xs hover:bg-purple-700"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {locationError && (
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-3 text-yellow-400 text-sm text-center">
            <p>📍 Unable to get your location. Please allow location access or search by city name above!</p>
            <button onClick={getUserLocation} className="mt-2 text-purple-400 text-xs hover:text-purple-300">Try Again</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AvailableGyms;
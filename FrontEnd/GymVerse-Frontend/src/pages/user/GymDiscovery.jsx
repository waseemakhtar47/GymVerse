import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { gymService } from '../../services/gymService';
import GymMap from '../../components/GymMap';
import LocationSearch from '../../components/LocationSearch';
import { MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';

const GymDiscovery = () => {
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.2090 }; // Delhi

  useEffect(() => {
    fetchAllGyms();
    // Don't auto-get location - let user decide
  }, []);

  const fetchAllGyms = async () => {
    setLoading(true);
    try {
      const res = await gymService.getAllGyms();
      setGyms(res.data.data || []);
      setFilteredGyms(res.data.data || []);
    } catch (err) {
      console.error('Error fetching gyms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyGyms = async (lng, lat) => {
    setLoading(true);
    try {
      const res = await gymService.getNearbyGyms(lng, lat, 10000);
      setGyms(res.data.data || []);
      setFilteredGyms(res.data.data || []);
    } catch (err) {
      console.error('Error fetching nearby gyms:', err);
      fetchAllGyms();
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    setGettingLocation(true);
    setLocationError(false);
    
    if (!navigator.geolocation) {
      setLocationError(true);
      setGettingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter(loc);
        fetchNearbyGyms(loc.lng, loc.lat);
        setGettingLocation(false);
      },
      (err) => {
        console.error('Location error:', err);
        setLocationError(true);
        setGettingLocation(false);
        // Set default location so map shows something
        setUserLocation(DEFAULT_LOCATION);
        setMapCenter(DEFAULT_LOCATION);
      }
    );
  };

  const handleLocationSelect = (loc) => {
    setUserLocation({ lat: loc.lat, lng: loc.lng });
    setMapCenter({ lat: loc.lat, lng: loc.lng });
    fetchNearbyGyms(loc.lng, loc.lat);
    setLocationError(false);
  };

  const handleReset = () => {
    setSearchTerm('');
    fetchAllGyms();
    setUserLocation(null);
    setMapCenter(null);
    setLocationError(false);
  };

  // Filter gyms by search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = gyms.filter(g =>
        g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGyms(filtered);
    } else {
      setFilteredGyms(gyms);
    }
  }, [searchTerm, gyms]);

  if (loading && gyms.length === 0) {
    return (
      <DashboardLayout title="Find Gyms Near You" role="user">
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
    <DashboardLayout title="Find Gyms Near You" role="user">
      <div className="space-y-4">
        {/* Search Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-50">
            <LocationSearch 
              onLocationSelect={handleLocationSelect}
              placeholder="Search city, area, or address..."
            />
          </div>
          
          <button
            onClick={getUserLocation}
            disabled={gettingLocation}
            className="px-5 py-2.5 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl text-white font-medium hover:scale-105 transition flex items-center gap-2 disabled:opacity-50"
          >
            {gettingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Getting...</span>
              </>
            ) : (
              <>
                <MapPinIcon className="w-5 h-5" />
                <span>My Location</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-gray-700 rounded-xl text-white hover:bg-gray-600 transition flex items-center gap-2"
          >
            <XMarkIcon className="w-5 h-5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Search by Name */}
        <input
          type="text"
          placeholder="Search gyms by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 bg-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Stats */}
        <div className="flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            🏋️ {filteredGyms.length} gym{filteredGyms.length !== 1 ? 's' : ''} found
          </p>
          {userLocation && !locationError && (
            <p className="text-green-400 text-sm flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              Showing nearby gyms
            </p>
          )}
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <GymMap
            gyms={filteredGyms}
            onGymClick={(gym) => console.log('Gym clicked:', gym.name)}
            userLocation={mapCenter || userLocation}
          />
        </div>

        {/* Gym List */}
        {filteredGyms.length > 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-semibold mb-3">📍 Gyms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {filteredGyms.map((gym) => (
                <div
                  key={gym._id}
                  className="p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition"
                >
                  <p className="text-white font-medium text-sm">{gym.name}</p>
                  <p className="text-gray-400 text-xs truncate">{gym.address || 'No address'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Error Message */}
        {locationError && (
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-3 text-yellow-400 text-sm text-center">
            <p>📍 Location access not available. Use the search bar above to find gyms anywhere!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GymDiscovery;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { gymService } from '../../services/gymService';
import toast from 'react-hot-toast';

const CreateGym = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    location: {
      coordinates: [77.5946, 12.9716] // [lng, lat] default Delhi
    },
    timings: {
      open: '06:00',
      close: '22:00'
    },
    facilities: [],
    contactNumber: '',
  });
  const [facilityInput, setFacilityInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await gymService.createGym(formData);
      toast.success('Gym created successfully!');
      navigate('/owner/gyms');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create gym');
    } finally {
      setLoading(false);
    }
  };

  const addFacility = () => {
    if (facilityInput.trim() && !formData.facilities.includes(facilityInput.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facilityInput.trim()]
      });
      setFacilityInput('');
    }
  };

  const removeFacility = (facility) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(f => f !== facility)
    });
  };

  return (
    <DashboardLayout title="Add New Gym" role="owner">
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Gym Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Opening Time</label>
              <input
                type="time"
                value={formData.timings.open}
                onChange={(e) => setFormData({
                  ...formData,
                  timings: { ...formData.timings, open: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Closing Time</label>
              <input
                type="time"
                value={formData.timings.close}
                onChange={(e) => setFormData({
                  ...formData,
                  timings: { ...formData.timings, close: e.target.value }
                })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Contact Number</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Facilities</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                placeholder="e.g., Cardio, Weights, Yoga, Pool..."
                className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button type="button" onClick={addFacility} className="px-4 py-2 bg-purple-600 rounded-lg">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.facilities.map((facility) => (
                <span key={facility} className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm flex items-center gap-1">
                  {facility}
                  <button type="button" onClick={() => removeFacility(facility)} className="ml-1 hover:text-red-400">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Location (Coordinates)</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                placeholder="Longitude (e.g., 77.5946)"
                value={formData.location.coordinates[0]}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { coordinates: [parseFloat(e.target.value), formData.location.coordinates[1]] }
                })}
                className="px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                step="any"
                placeholder="Latitude (e.g., 12.9716)"
                value={formData.location.coordinates[1]}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { coordinates: [formData.location.coordinates[0], parseFloat(e.target.value)] }
                })}
                className="px-4 py-3 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-gray-400 text-xs mt-1">Get coordinates from Google Maps</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Gym'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateGym;
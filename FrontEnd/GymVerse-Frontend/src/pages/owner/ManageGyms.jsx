import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { gymService } from "../../services/gymService";
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CreditCardIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const ManageGyms = () => {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const res = await gymService.getOwnerGyms();
      setGyms(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch gyms:", error);
      toast.error("Failed to load gyms");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all memberships and data associated with this gym.`)) return;
    try {
      await gymService.deleteGym(id);
      toast.success("Gym deleted successfully");
      fetchGyms();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete gym");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Gyms" role="owner">
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
    <DashboardLayout title="Manage Gyms" role="owner">
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Gyms</h2>
            <p className="text-gray-400 text-sm mt-1">Manage all your gyms, trainers, applications and members</p>
          </div>
          <button
            onClick={() => navigate("/owner/create-gym")}
            className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Gym
          </button>
        </div>

        {gyms.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Gyms Yet</h3>
            <p className="text-gray-400">Create your first gym to get started.</p>
            <button
              onClick={() => navigate("/owner/create-gym")}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
            >
              Create Gym
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <div
                key={gym._id}
                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-[1.02] transition-all duration-300"
              >
                {/* Gym Header */}
                <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4">
                  <h3 className="text-white font-bold text-xl">{gym.name}</h3>
                  <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate">{gym.address?.substring(0, 50)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full">
                      {gym.timings?.open} - {gym.timings?.close}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${gym.isActive ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                      {gym.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                {/* Gym Details */}
                <div className="p-4">
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {gym.description || "No description available"}
                  </p>
                  
                  {/* Contact Info */}
                  {gym.contactNumber && (
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{gym.contactNumber}</span>
                    </div>
                  )}
                  
                  {/* Facilities Tags */}
                  {gym.facilities && gym.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {gym.facilities.slice(0, 3).map((facility, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-gray-400">
                          {facility}
                        </span>
                      ))}
                      {gym.facilities.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-gray-400">
                          +{gym.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {/* View Members */}
                    <button
                      onClick={() => navigate(`/owner/memberships/${gym._id}`)}
                      className="flex items-center justify-center gap-1 py-2 bg-blue-600/20 rounded-lg text-blue-400 text-xs hover:bg-blue-600/30 transition"
                      title="View Members"
                    >
                      <UserGroupIcon className="w-3 h-3" />
                      <span>Members</span>
                    </button>
                    
                    {/* View Applications */}
                    <button
                      onClick={() => navigate(`/owner/gym-applications/${gym._id}`)}
                      className="flex items-center justify-center gap-1 py-2 bg-yellow-600/20 rounded-lg text-yellow-400 text-xs hover:bg-yellow-600/30 transition"
                      title="Job Applications"
                    >
                      <BriefcaseIcon className="w-3 h-3" />
                      <span>Applications</span>
                    </button>
                    
                    {/* View Trainers */}
                    <button
                      onClick={() => navigate(`/owner/gym-trainers/${gym._id}`)}
                      className="flex items-center justify-center gap-1 py-2 bg-purple-600/20 rounded-lg text-purple-400 text-xs hover:bg-purple-600/30 transition"
                      title="Associated Trainers"
                    >
                      <UserGroupIcon className="w-3 h-3" />
                      <span>Trainers</span>
                    </button>
                    
                    {/* Edit Gym */}
                    <button
                      onClick={() => navigate(`/owner/edit-gym/${gym._id}`)}
                      className="flex items-center justify-center gap-1 py-2 bg-green-600/20 rounded-lg text-green-400 text-xs hover:bg-green-600/30 transition"
                      title="Edit Gym"
                    >
                      <PencilIcon className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    
                    {/* Delete Gym - Full Width on New Row */}
                    <button
                      onClick={() => handleDelete(gym._id, gym.name)}
                      className="col-span-2 flex items-center justify-center gap-1 py-2 bg-red-600/20 rounded-lg text-red-400 text-xs hover:bg-red-600/30 transition mt-1"
                      title="Delete Gym"
                    >
                      <TrashIcon className="w-3 h-3" />
                      <span>Delete Gym</span>
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

export default ManageGyms;
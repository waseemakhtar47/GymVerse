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
      const res = await gymService.getAllGyms();
      setGyms(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch gyms:", error);
      toast.error("Failed to load gyms");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this gym?")) return;
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
        <button
          onClick={() => navigate("/owner/create-gym")}
          className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Gym
        </button>

        {gyms.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Gyms Yet
            </h3>
            <p className="text-gray-400">
              Create your first gym to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <div
                key={gym._id}
                className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition"
              >
                <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4">
                  <h3 className="text-white font-bold text-lg">{gym.name}</h3>
                  <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate">
                      {gym.address?.substring(0, 40)}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {gym.description || "No description"}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400 text-xs">
                      🕒 {gym.timings?.open} - {gym.timings?.close}
                    </span>
                    <span className="text-green-400 text-xs">
                      {gym.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => navigate(`/owner/memberships/${gym._id}`)}
                      className="py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition flex items-center justify-center gap-1"
                      title="View Members"
                    >
                      <UserGroupIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Members</span>
                    </button>
                    <button
                      onClick={() => navigate(`/owner/edit-gym/${gym._id}`)}
                      className="py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1"
                    >
                      <PencilIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(gym._id)}
                      className="py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition flex items-center justify-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
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
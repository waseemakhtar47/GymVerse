import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { gymService } from "../../services/gymService";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGyms: 0,
    totalMembers: 0,
    totalTrainers: 0,
    monthlyRevenue: 0,
  });
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ Use getOwnerGyms instead of getAllGyms
      const gymsRes = await gymService.getOwnerGyms();
      const allGyms = gymsRes.data.data || [];
      setGyms(allGyms.slice(0, 3));

      setStats({
        totalGyms: allGyms.length,
        totalMembers: 0,
        totalTrainers: 0,
        monthlyRevenue: 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load gyms");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGym = async (gymId, gymName) => {
    if (!confirm(`Are you sure you want to delete "${gymName}"?`)) return;
    try {
      await gymService.deleteGym(gymId);
      toast.success("Gym deleted successfully");
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete gym");
    }
  };

  const statCards = [
    {
      name: "Total Gyms",
      value: stats.totalGyms,
      icon: BuildingOfficeIcon,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Total Members",
      value: stats.totalMembers,
      icon: UserGroupIcon,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Active Trainers",
      value: stats.totalTrainers,
      icon: UserGroupIcon,
      color: "from-orange-500 to-red-500",
    },
    {
      name: "Monthly Revenue",
      value: `$${stats.monthlyRevenue}`,
      icon: CurrencyDollarIcon,
      color: "from-green-500 to-emerald-500",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Welcome Back!" role="owner">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Welcome Back, ${user?.name?.split(" ")[0]}!`}
      role="owner"
    >
      <div
        className="overflow-y-auto max-h-[calc(100vh-120px)]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:scale-105 transition"
            >
              <div
                className={`w-12 h-12 rounded-lg bg-linear-to-r ${stat.color} flex items-center justify-center mb-4`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">{stat.name}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/owner/create-gym")}
                className="w-full flex items-center justify-between p-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
              >
                <span>Add New Gym</span>
                <PlusCircleIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/owner/gyms")}
                className="w-full flex items-center justify-between p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
              >
                <span>Manage All Gyms</span>
                <BuildingOfficeIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Your Gyms</h3>
            <div
              className="space-y-3 max-h-64 overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {gyms.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  No gyms yet. Create your first gym!
                </p>
              ) : (
                gyms.map((gym) => (
                  <div key={gym._id} className="relative">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() =>
                          navigate(`/owner/memberships/${gym._id}`)
                        }
                      >
                        <p className="text-white font-medium">{gym.name}</p>
                        <p className="text-sm text-gray-400 truncate">
                          {gym.address?.substring(0, 50)}
                        </p>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === gym._id ? null : gym._id,
                            )
                          }
                          className="p-2 hover:bg-white/10 rounded-lg transition"
                        >
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        </button>

                        {openMenuId === gym._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`/owner/memberships/${gym._id}`);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition"
                            >
                              <EyeIcon className="w-4 h-4" />
                              <span>View Members</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`/owner/gym-applications/${gym._id}`);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition"
                            >
                              <UserGroupIcon className="w-4 h-4" />
                              <span>Applications</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`/owner/gym-trainers/${gym._id}`);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition"
                            >
                              <UserGroupIcon className="w-4 h-4" />
                              <span>Trainers</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                navigate(`/owner/edit-gym/${gym._id}`);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition"
                            >
                              <PencilIcon className="w-4 h-4" />
                              <span>Edit Gym</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDeleteGym(gym._id, gym.name);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition"
                            >
                              <TrashIcon className="w-4 h-4" />
                              <span>Delete Gym</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {gyms.length > 0 && (
              <button
                onClick={() => navigate("/owner/gyms")}
                className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition"
              >
                View All Gyms
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;

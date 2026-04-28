import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { gymService } from "../../services/gymService";
import { membershipService } from "../../services/membershipService";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronDownIcon,
  BriefcaseIcon,
  EnvelopeIcon,
  UsersIcon
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
    pendingApplications: 0,
    pendingSentRequests: 0
  });
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Modal states
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showTrainersModal, setShowTrainersModal] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [membersList, setMembersList] = useState([]);
  const [allActiveTrainers, setAllActiveTrainers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get owner's gyms
      const gymsRes = await gymService.getOwnerGyms();
      const ownerGyms = gymsRes.data.data || [];
      setGyms(ownerGyms.slice(0, 3));
      
      let totalMembers = 0;
      let totalTrainers = 0;
      let monthlyRevenue = 0;
      let pendingApplications = 0;
      let pendingSentRequests = 0;
      let allTrainersList = [];
      
      // Calculate stats from each gym
      for (const gym of ownerGyms) {
        // Get members for this gym
        try {
          const membersRes = await membershipService.getGymMemberships(gym._id);
          const members = membersRes.data.data || [];
          const activeMembers = members.filter(m => m.status === 'active');
          totalMembers += activeMembers.length;
          
          // Calculate revenue (sum of active memberships)
          const gymRevenue = activeMembers.reduce((sum, m) => sum + (m.paymentAmount || 0), 0);
          monthlyRevenue += gymRevenue;
        } catch (err) {
          console.error(`Failed to fetch members for gym ${gym._id}:`, err);
        }
        
        // ✅ Get trainers (approved only) and collect for combined list
        try {
          const trainersRes = await gymService.getGymTrainers(gym._id);
          const gymTrainers = trainersRes.data.data || [];
          totalTrainers += gymTrainers.length;
          
          // Add to combined list with gym name
          gymTrainers.forEach(trainer => {
            allTrainersList.push({
              ...trainer,
              gymName: gym.name,
              gymId: gym._id
            });
          });
        } catch (err) {
          console.error(`Failed to fetch trainers for gym ${gym._id}:`, err);
        }
        
        // Get pending applications (trainer-initiated)
        try {
          const appsRes = await gymService.getGymApplications(gym._id);
          pendingApplications += (appsRes.data.data || []).length;
        } catch (err) {
          console.error(`Failed to fetch applications for gym ${gym._id}:`, err);
        }
        
        // Get pending sent requests (owner-initiated)
        try {
          const sentRes = await gymService.getGymSentRequests(gym._id);
          pendingSentRequests += (sentRes.data.data || []).length;
        } catch (err) {
          console.error(`Failed to fetch sent requests for gym ${gym._id}:`, err);
        }
      }
      
      setAllActiveTrainers(allTrainersList);
      
      setStats({
        totalGyms: ownerGyms.length,
        totalMembers: totalMembers,
        totalTrainers: totalTrainers,
        monthlyRevenue: monthlyRevenue,
        pendingApplications: pendingApplications,
        pendingSentRequests: pendingSentRequests
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGymMembers = async (gym) => {
    setSelectedGym(gym);
    try {
      const membersRes = await membershipService.getGymMemberships(gym._id);
      const activeMembers = (membersRes.data.data || []).filter(m => m.status === 'active');
      setMembersList(activeMembers);
      setShowMembersModal(true);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      toast.error('Failed to load members');
    }
  };

  const handleDeleteGym = async (gymId, gymName) => {
    if (!confirm(`Are you sure you want to delete "${gymName}"? This will also delete all memberships and data associated with this gym.`)) return;
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
      onClick: () => navigate("/owner/gyms"),
      clickable: true,
      description: "Manage your gyms"
    },
    { 
      name: "Active Members", 
      value: stats.totalMembers, 
      icon: UsersIcon, 
      color: "from-purple-500 to-pink-500",
      onClick: () => {
        if (gyms.length > 0) {
          fetchGymMembers(gyms[0]);
        } else {
          toast.error("No gyms found");
          navigate("/owner/create-gym");
        }
      },
      clickable: true,
      description: "View all members"
    },
    { 
      name: "Active Trainers", 
      value: stats.totalTrainers, 
      icon: UserGroupIcon, 
      color: "from-orange-500 to-red-500",
      onClick: () => setShowTrainersModal(true),
      clickable: true,
      description: "View all trainers across your gyms"
    },
    { 
      name: "Revenue", 
      value: `₹${stats.monthlyRevenue}`, 
      icon: CurrencyDollarIcon, 
      color: "from-green-500 to-emerald-500",
      onClick: null,
      clickable: false,
      description: "Total revenue from all gyms"
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
    <>
      <DashboardLayout
        title={`Welcome Back, ${user?.name?.split(" ")[0]}!`}
        role="owner"
      >
        <div className="overflow-y-auto max-h-[calc(100vh-120px)]" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <div 
                key={stat.name} 
                onClick={stat.clickable ? stat.onClick : undefined}
                className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 transition ${
                  stat.clickable ? 'hover:scale-105 cursor-pointer group' : 'cursor-default'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg bg-linear-to-r ${stat.color} flex items-center justify-center mb-4 ${stat.clickable ? 'group-hover:scale-110' : ''} transition`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.clickable && (
                  <p className="text-gray-500 text-xs mt-2 opacity-0 group-hover:opacity-100 transition">
                    {stat.description} →
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pending Alerts */}
          {(stats.pendingApplications > 0 || stats.pendingSentRequests > 0) && (
            <div className="mb-6">
              {stats.pendingApplications > 0 && (
                <div 
                  onClick={() => navigate('/owner/trainer-requests')}
                  className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4 mb-3 cursor-pointer hover:bg-yellow-500/20 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BriefcaseIcon className="w-6 h-6 text-yellow-400" />
                      <div>
                        <p className="text-white font-semibold">{stats.pendingApplications} Pending Trainer Application{stats.pendingApplications > 1 ? 's' : ''}</p>
                        <p className="text-gray-400 text-sm">Trainers have applied to your gyms</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-yellow-600 rounded-lg text-white text-sm hover:bg-yellow-700">
                      Review →
                    </button>
                  </div>
                </div>
              )}
              
              {stats.pendingSentRequests > 0 && (
                <div 
                  onClick={() => navigate('/owner/sent-requests')}
                  className="bg-purple-500/10 border border-purple-500 rounded-xl p-4 cursor-pointer hover:bg-purple-500/20 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-white font-semibold">{stats.pendingSentRequests} Pending Hiring Request{stats.pendingSentRequests > 1 ? 's' : ''}</p>
                        <p className="text-gray-400 text-sm">Waiting for trainer response</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700">
                      View →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/owner/create-gym")}
                  className="w-full flex items-center justify-between p-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
                >
                  <span>Add New Gym</span>
                  <PlusCircleIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/owner/trainers")}
                  className="w-full flex items-center justify-between p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
                >
                  <span>Hire Trainers</span>
                  <UserGroupIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/owner/qr-verification")}
                  className="w-full flex items-center justify-between p-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition"
                >
                  <span>QR Verification</span>
                  <EyeIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Your Gyms */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Your Gyms</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {gyms.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No gyms yet. Create your first gym!</p>
                ) : (
                  gyms.map((gym) => (
                    <div key={gym._id} className="relative">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
                        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/owner/memberships/${gym._id}`)}>
                          <p className="text-white font-medium">{gym.name}</p>
                          <p className="text-sm text-gray-400 truncate">{gym.address?.substring(0, 50)}</p>
                          {gym.pricing && (
                            <p className="text-xs text-purple-400 mt-1">Starting ₹{gym.pricing.monthly}/mo</p>
                          )}
                        </div>

                        <div className="relative">
                          <button onClick={() => setOpenMenuId(openMenuId === gym._id ? null : gym._id)} className="p-2 hover:bg-white/10 rounded-lg transition">
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                          </button>

                          {openMenuId === gym._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                              <button onClick={() => { setOpenMenuId(null); navigate(`/owner/memberships/${gym._id}`); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition">
                                <UsersIcon className="w-4 h-4" />
                                <span>View Members</span>
                              </button>
                              <button onClick={() => { setOpenMenuId(null); navigate(`/owner/gym-applications/${gym._id}`); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition">
                                <BriefcaseIcon className="w-4 h-4" />
                                <span>Applications</span>
                              </button>
                              <button onClick={() => { setOpenMenuId(null); navigate(`/owner/gym-trainers/${gym._id}`); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition">
                                <UserGroupIcon className="w-4 h-4" />
                                <span>Trainers</span>
                              </button>
                              <button onClick={() => { setOpenMenuId(null); navigate(`/owner/edit-gym/${gym._id}`); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-300 hover:bg-white/10 transition">
                                <PencilIcon className="w-4 h-4" />
                                <span>Edit Gym</span>
                              </button>
                              <button onClick={() => { setOpenMenuId(null); handleDeleteGym(gym._id, gym.name); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-400 hover:bg-red-500/10 transition">
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
                <button onClick={() => navigate("/owner/gyms")} className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition">
                  View All Gyms ({stats.totalGyms}) →
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Members List Modal */}
      {showMembersModal && selectedGym && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowMembersModal(false)}>
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-white/10 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Active Members - {selectedGym.name}</h3>
                <p className="text-gray-400 text-sm mt-1">Total {membersList.length} active members</p>
              </div>
              <button onClick={() => setShowMembersModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {membersList.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No active members in this gym yet</p>
                  <p className="text-gray-500 text-sm mt-2">Share your gym QR code to get members!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {membersList.map((member) => {
                    const remainingDays = Math.ceil((new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={member._id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {member.userId?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">{member.userId?.name || 'Unknown'}</p>
                            <p className="text-gray-400 text-sm">{member.userId?.email}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 capitalize">
                                {member.plan}
                              </span>
                              <span className="text-xs text-gray-500">
                                Joined: {new Date(member.startDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-purple-400 font-semibold">₹{member.paymentAmount}</p>
                            <p className={`text-xs ${remainingDays > 7 ? 'text-green-400' : remainingDays > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {remainingDays > 0 ? `${remainingDays} days left` : 'Expired'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ All Active Trainers Modal - All gyms ke trainers ek saath */}
      {showTrainersModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowTrainersModal(false)}>
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-white/10 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">All Active Trainers</h3>
                <p className="text-gray-400 text-sm mt-1">Total {allActiveTrainers.length} trainers across all your gyms</p>
              </div>
              <button onClick={() => setShowTrainersModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {allActiveTrainers.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No active trainers in your gyms yet</p>
                  <button 
                    onClick={() => { setShowTrainersModal(false); navigate('/owner/trainers'); }}
                    className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white"
                  >
                    Find Trainers to Hire →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {allActiveTrainers.map((trainer) => (
                    <div key={trainer._id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {trainer.trainerId?.name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{trainer.trainerId?.name || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm">{trainer.trainerId?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                              {trainer.gymName}
                            </span>
                            <span className="text-xs text-gray-500">
                              Joined: {new Date(trainer.joinedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerDashboard;
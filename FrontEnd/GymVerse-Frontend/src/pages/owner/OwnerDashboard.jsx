import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { gymService } from '../../services/gymService';
import { membershipService } from '../../services/membershipService';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  PlusCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalGyms: 0,
    totalMembers: 0,
    totalTrainers: 0,
    monthlyRevenue: 0
  });
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all gyms
      const gymsRes = await gymService.getAllGyms();
      const allGyms = gymsRes.data.data || [];
      setGyms(allGyms.slice(0, 3));
      
      // Count total members from all gyms
      let totalMembers = 0;
      for (const gym of allGyms) {
        try {
          const membershipsRes = await membershipService.getGymMemberships(gym._id);
          totalMembers += membershipsRes.data.data?.length || 0;
        } catch (error) {
          console.error(`Failed to fetch memberships for gym ${gym._id}:`, error);
        }
      }
      
      setStats({
        totalGyms: allGyms.length,
        totalMembers: totalMembers,
        totalTrainers: 0, // TODO: Add trainers endpoint
        monthlyRevenue: 0 // TODO: Add revenue calculation
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Gyms', value: stats.totalGyms, icon: BuildingOfficeIcon, color: 'from-blue-500 to-cyan-500' },
    { name: 'Total Members', value: stats.totalMembers, icon: UserGroupIcon, color: 'from-purple-500 to-pink-500' },
    { name: 'Active Trainers', value: stats.totalTrainers, icon: UserGroupIcon, color: 'from-orange-500 to-red-500' },
    { name: 'Monthly Revenue', value: `$${stats.monthlyRevenue}`, icon: CurrencyDollarIcon, color: 'from-green-500 to-emerald-500' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Welcome Back!" role="owner">
        <div className="text-center text-gray-400 py-10">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Welcome Back, ${user?.name?.split(' ')[0]}!`} role="owner">
      <div className="overflow-y-auto max-h-[calc(100vh-120px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:scale-105 transition">
              <div className={`w-12 h-12 rounded-lg bg-linear-to-r ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">{stat.name}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/owner/create-gym')}
                className="w-full flex items-center justify-between p-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
              >
                <span>Add New Gym</span>
                <PlusCircleIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/owner/trainers')}
                className="w-full flex items-center justify-between p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
              >
                <span>Manage Trainers</span>
                <UserGroupIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gym Overview */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Your Gyms</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {gyms.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No gyms yet. Create your first gym!</p>
              ) : (
                gyms.map((gym) => (
                  <div key={gym._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{gym.name}</p>
                      <p className="text-sm text-gray-400">{gym.address?.substring(0, 50)}</p>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700">
                      Manage
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
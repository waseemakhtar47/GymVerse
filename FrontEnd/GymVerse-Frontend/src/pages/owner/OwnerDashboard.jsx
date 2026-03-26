import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
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

  const stats = [
    { name: 'Total Gyms', value: '3', icon: BuildingOfficeIcon, color: 'from-blue-500 to-cyan-500' },
    { name: 'Total Members', value: '847', icon: UserGroupIcon, color: 'from-purple-500 to-pink-500' },
    { name: 'Active Trainers', value: '24', icon: UserGroupIcon, color: 'from-orange-500 to-red-500' },
    { name: 'Monthly Revenue', value: '$24,500', icon: CurrencyDollarIcon, color: 'from-green-500 to-emerald-500' },
  ];

  const gyms = [
    { name: 'PowerHouse Gym', members: 342, trainers: 12, revenue: '$12,450', status: 'Active' },
    { name: 'FitZone Fitness', members: 278, trainers: 8, revenue: '$8,230', status: 'Active' },
    { name: 'Elite Training Center', members: 227, trainers: 4, revenue: '$3,820', status: 'Active' },
  ];

  const recentMemberships = [
    { name: 'John Doe', gym: 'PowerHouse Gym', plan: 'Annual', amount: '$299', date: 'Today' },
    { name: 'Jane Smith', gym: 'FitZone Fitness', plan: 'Monthly', amount: '$49', date: 'Yesterday' },
    { name: 'Mike Johnson', gym: 'Elite Training', plan: 'Quarterly', amount: '$129', date: '2 days ago' },
  ];

  return (
    <DashboardLayout title={`Welcome Back, ${user?.name?.split(' ')[0]}!`} role="owner">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition">
              <span>Add New Gym</span>
              <PlusCircleIcon className="w-5 h-5" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition">
              <span>Hire Trainer</span>
              <UserGroupIcon className="w-5 h-5" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition">
              <span>View Reports</span>
              <ChartBarIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gym Overview */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Gym Overview</h3>
          <div className="space-y-3">
            {gyms.map((gym, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{gym.name}</p>
                  <p className="text-sm text-gray-400">{gym.members} members • {gym.trainers} trainers</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">{gym.revenue}</p>
                  <span className="text-xs text-green-400">{gym.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Memberships */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Recent Memberships</h3>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-gray-400">
                <th className="p-4">Member</th>
                <th className="p-4">Gym</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentMemberships.map((membership, idx) => (
                <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white">{membership.name}</td>
                  <td className="p-4 text-gray-300">{membership.gym}</td>
                  <td className="p-4 text-gray-300">{membership.plan}</td>
                  <td className="p-4 text-green-400">{membership.amount}</td>
                  <td className="p-4 text-gray-400 text-sm">{membership.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
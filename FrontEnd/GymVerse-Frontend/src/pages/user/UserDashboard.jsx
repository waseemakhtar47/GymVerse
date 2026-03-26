import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  MagnifyingGlassIcon, 
  CalendarIcon, 
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Active Memberships', value: '2', icon: CalendarIcon, color: 'from-blue-500 to-cyan-500' },
    { name: 'Courses Enrolled', value: '3', icon: VideoCameraIcon, color: 'from-purple-500 to-pink-500' },
    { name: 'Trainers Following', value: '5', icon: ChatBubbleLeftRightIcon, color: 'from-orange-500 to-red-500' },
    { name: 'Fitness Streak', value: '12 days', icon: ArrowTrendingUpIcon, color: 'from-green-500 to-emerald-500' },
  ];

  const recentActivities = [
    { title: 'Completed Chest Workout', time: '2 hours ago', type: 'workout' },
    { title: 'New course added: Advanced Calisthenics', time: '1 day ago', type: 'course' },
    { title: 'Message from Coach John', time: '2 days ago', type: 'message' },
    { title: 'Membership renewed at FitHub Gym', time: '3 days ago', type: 'membership' },
  ];

  const recommendedGyms = [
    { name: 'PowerHouse Gym', location: 'Downtown', rating: 4.8, distance: '0.5 km' },
    { name: 'FitZone Fitness', location: 'Westside', rating: 4.6, distance: '1.2 km' },
    { name: 'Elite Training Center', location: 'North', rating: 4.9, distance: '2.0 km' },
  ];

  return (
    <DashboardLayout title="Welcome Back, Fitness Enthusiast!" role="user">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-linear-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-2">
            {user?.name?.split(' ')[0]}! 💪
          </h2>
          <p className="text-gray-300">Ready to crush your fitness goals today?</p>
        </div>
      </div>

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
        {/* Find Gyms */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Find Nearby Gyms</h3>
            <MagnifyingGlassIcon className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-3">
            {recommendedGyms.map((gym, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{gym.name}</p>
                  <p className="text-sm text-gray-400">{gym.location} • {gym.distance}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span className="text-white text-sm">{gym.rating}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition">
            Explore More Gyms
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.type === 'workout' ? 'bg-green-500/20 text-green-400' :
                  activity.type === 'course' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Recommended Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition">
              <div className="h-40 bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <VideoCameraIcon className="w-12 h-12 text-white/50" />
              </div>
              <div className="p-4">
                <h4 className="text-white font-semibold mb-1">Full Body Workout {i}</h4>
                <p className="text-sm text-gray-400 mb-3">By Trainer Alex • 12 lessons</p>
                <button className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition">
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
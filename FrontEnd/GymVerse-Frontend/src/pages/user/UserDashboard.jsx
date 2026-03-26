import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { membershipService } from '../../services/membershipService';
import { blogService } from '../../services/blogService';
import { gymService } from '../../services/gymService';
import { courseService } from '../../services/courseService';
import { trainerService } from '../../services/trainerService';
import { 
  CalendarIcon, 
  VideoCameraIcon, 
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  MapPinIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeMemberships: 0,
    enrolledCourses: 0,
    followingTrainers: 0,
    fitnessStreak: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [nearbyGyms, setNearbyGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch memberships
      const membershipsRes = await membershipService.getMyMemberships();
      const activeMemberships = membershipsRes.data.data?.filter(m => m.status === 'active').length || 0;
      
      // Fetch enrolled courses
      const coursesRes = await courseService.getMyEnrolledCourses();
      const enrolledCourses = coursesRes.data.data?.length || 0;
      
      // Fetch following trainers
      const trainersRes = await trainerService.getFollowingTrainers();
      const followingTrainers = trainersRes.data.data?.length || 0;
      
      // Fetch blogs
      const blogsRes = await blogService.getAllBlogs({ limit: 3 });
      setRecentBlogs(blogsRes.data.data || []);
      
      // Fetch nearby gyms
      try {
        const gymsRes = await gymService.getNearbyGyms(77.5946, 12.9716, 5000);
        setNearbyGyms(gymsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch gyms:', error);
      }
      
      setStats({
        activeMemberships,
        enrolledCourses,
        followingTrainers,
        fitnessStreak: 12
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Active Memberships', value: stats.activeMemberships, icon: CalendarIcon, color: 'from-blue-500 to-cyan-500' },
    { name: 'Courses Enrolled', value: stats.enrolledCourses, icon: VideoCameraIcon, color: 'from-purple-500 to-pink-500' },
    { name: 'Trainers Following', value: stats.followingTrainers, icon: UserGroupIcon, color: 'from-orange-500 to-red-500' },
    { name: 'Fitness Streak', value: `${stats.fitnessStreak} days`, icon: ArrowTrendingUpIcon, color: 'from-green-500 to-emerald-500' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Welcome Back!" role="user">
        <div className="text-center text-gray-400 py-10">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Welcome Back, ${user?.name?.split(' ')[0]}! 💪`} role="user">
      <div className="overflow-y-auto max-h-[calc(100vh-120px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-linear-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-2">
              Ready to crush your fitness goals today?
            </h2>
            <p className="text-gray-300">Track your progress, discover new gyms, and stay motivated!</p>
          </div>
        </div>

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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nearby Gyms */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Nearby Gyms</h3>
              <MapPinIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {nearbyGyms.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No gyms found nearby</p>
              ) : (
                nearbyGyms.slice(0, 5).map((gym) => (
                  <div key={gym._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{gym.name}</p>
                      <p className="text-sm text-gray-400">{gym.address?.substring(0, 50)}</p>
                    </div>
                    <button className="px-3 py-1 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700">
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Blogs */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Latest Blogs</h3>
              <BookOpenIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {recentBlogs.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No blogs available</p>
              ) : (
                recentBlogs.map((blog) => (
                  <div key={blog._id} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white font-medium">{blog.title}</p>
                    <p className="text-sm text-gray-400">By {blog.authorId?.name} • {new Date(blog.createdAt).toLocaleDateString()}</p>
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

export default UserDashboard;
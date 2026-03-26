import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { blogService } from '../../services/blogService';
import { courseService } from '../../services/courseService';
import { trainerService } from '../../services/trainerService';
import { 
  VideoCameraIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalBlogs: 0,
    monthlyEarnings: 0,
    followers: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch trainer stats
      const statsRes = await trainerService.getTrainerStats();
      const trainerStats = statsRes.data.data || {};
      
      // Fetch my blogs
      const blogsRes = await blogService.getMyBlogs();
      const myBlogs = blogsRes.data.data || [];
      setRecentBlogs(myBlogs.slice(0, 3));
      
      // Fetch my courses
      const coursesRes = await courseService.getMyCourses();
      const myCourses = coursesRes.data.data || [];
      setRecentCourses(myCourses.slice(0, 3));
      
      setStats({
        totalStudents: trainerStats.students || 0,
        totalCourses: myCourses.length,
        totalBlogs: myBlogs.length,
        monthlyEarnings: trainerStats.earnings || 0,
        followers: trainerStats.followers || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Students', value: stats.totalStudents, icon: UserGroupIcon, color: 'from-blue-500 to-cyan-500' },
    { name: 'Courses', value: stats.totalCourses, icon: VideoCameraIcon, color: 'from-purple-500 to-pink-500' },
    { name: 'Blogs', value: stats.totalBlogs, icon: DocumentTextIcon, color: 'from-orange-500 to-red-500' },
    { name: 'Followers', value: stats.followers, icon: UserGroupIcon, color: 'from-green-500 to-emerald-500' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Welcome Back!" role="trainer">
        <div className="text-center text-gray-400 py-10">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Welcome Back, Coach ${user?.name?.split(' ')[0]}!`} role="trainer">
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
                onClick={() => navigate('/trainer/create-blog')}
                className="w-full flex items-center justify-between p-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
              >
                <span>Create New Blog</span>
                <PlusCircleIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/trainer/create-course')}
                className="w-full flex items-center justify-between p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
              >
                <span>Create New Course</span>
                <VideoCameraIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Recent Courses */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Courses</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {recentCourses.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No courses yet. Create your first course!</p>
              ) : (
                recentCourses.map((course) => (
                  <div key={course._id} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white font-medium">{course.title}</p>
                    <p className="text-sm text-gray-400">{course.enrolledUsers?.length || 0} students • ${course.price}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Blogs</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {recentBlogs.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No blogs yet. Create your first blog!</p>
            ) : (
              recentBlogs.map((blog) => (
                <div key={blog._id} className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white font-medium">{blog.title}</p>
                  <p className="text-sm text-gray-400">{blog.views || 0} views • {blog.likeCount || 0} likes</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
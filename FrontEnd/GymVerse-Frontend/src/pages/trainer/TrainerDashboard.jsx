import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { 
  VideoCameraIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

const TrainerDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Total Students', value: '156', icon: UserGroupIcon, color: 'from-blue-500 to-cyan-500' },
    { name: 'Courses', value: '8', icon: VideoCameraIcon, color: 'from-purple-500 to-pink-500' },
    { name: 'Blogs', value: '24', icon: DocumentTextIcon, color: 'from-orange-500 to-red-500' },
    { name: 'Monthly Earnings', value: '$2,450', icon: CurrencyDollarIcon, color: 'from-green-500 to-emerald-500' },
  ];

  const recentCourses = [
    { title: 'Advanced Calisthenics', students: 45, revenue: '$1,125', status: 'Active' },
    { title: 'HIIT Masterclass', students: 32, revenue: '$800', status: 'Active' },
    { title: 'Yoga for Beginners', students: 28, revenue: '$420', status: 'Active' },
  ];

  const recentBlogs = [
    { title: 'Top 10 Nutrition Tips', views: 1250, likes: 89, date: '2 days ago' },
    { title: 'How to Build Muscle', views: 980, likes: 67, date: '5 days ago' },
    { title: 'Recovery Techniques', views: 756, likes: 45, date: '1 week ago' },
  ];

  return (
    <DashboardLayout title={`Welcome Back, Coach ${user?.name?.split(' ')[0]}!`} role="trainer">
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
              <span>Create New Course</span>
              <PlusCircleIcon className="w-5 h-5" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition">
              <span>Write New Blog</span>
              <DocumentTextIcon className="w-5 h-5" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition">
              <span>View Messages</span>
              <UserGroupIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recent Courses */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Courses</h3>
          <div className="space-y-3">
            {recentCourses.map((course, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{course.title}</p>
                  <p className="text-sm text-gray-400">{course.students} students • {course.revenue}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  {course.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Blogs */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Recent Blogs</h3>
        <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-gray-400">
                <th className="p-4">Title</th>
                <th className="p-4">Views</th>
                <th className="p-4">Likes</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBlogs.map((blog, idx) => (
                <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                  <td className="p-4 text-white">{blog.title}</td>
                  <td className="p-4 text-gray-300">{blog.views}</td>
                  <td className="p-4 text-gray-300">{blog.likes}</td>
                  <td className="p-4 text-gray-400 text-sm">{blog.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboard;
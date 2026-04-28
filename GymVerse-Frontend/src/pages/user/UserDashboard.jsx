import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { membershipService } from '../../services/membershipService';
import { blogService } from '../../services/blogService';
import { courseService } from '../../services/courseService';
import { trainerService } from '../../services/trainerService';
import { 
  CalendarIcon, 
  VideoCameraIcon, 
  BookOpenIcon,
  UserGroupIcon,
  UsersIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeMemberships: 0,
    enrolledCourses: 0,
    followingTrainers: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [membershipsList, setMembershipsList] = useState([]);
  const [trainersList, setTrainersList] = useState([]);
  const [showMembershipsModal, setShowMembershipsModal] = useState(false);
  const [showTrainersModal, setShowTrainersModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch memberships
      const membershipsRes = await membershipService.getMyMemberships();
      const allMemberships = membershipsRes.data.data || [];
      const activeMemberships = allMemberships.filter(m => m.status === 'active');
      setMembershipsList(activeMemberships);
      
      // Fetch enrolled courses
      const coursesRes = await courseService.getMyEnrolledCourses();
      const enrolledCourses = coursesRes.data.data || [];
      setRecentCourses(enrolledCourses.slice(0, 3));
      
      // Fetch following trainers
      const trainersRes = await trainerService.getFollowingTrainers();
      const followingTrainers = trainersRes.data.data || [];
      setTrainersList(followingTrainers);
      
      // Fetch recent blogs
      const blogsRes = await blogService.getAllBlogs({ limit: 3 });
      setRecentBlogs(blogsRes.data.data || []);
      
      setStats({
        activeMemberships: activeMemberships.length,
        enrolledCourses: enrolledCourses.length,
        followingTrainers: followingTrainers.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Only 3 stat cards now (removed fitness streak)
  const statCards = [
    { 
      name: 'Active Memberships', 
      value: stats.activeMemberships, 
      icon: CalendarIcon, 
      color: 'from-blue-500 to-cyan-500',
      onClick: () => navigate('/user/memberships'),
      clickable: true,
      description: 'View your gym memberships'
    },
    { 
      name: 'Enrolled Courses', 
      value: stats.enrolledCourses, 
      icon: VideoCameraIcon, 
      color: 'from-purple-500 to-pink-500',
      onClick: () => navigate('/user/courses'),
      clickable: true,
      description: 'Continue learning'
    },
    { 
      name: 'Following Trainers', 
      value: stats.followingTrainers, 
      icon: UserGroupIcon, 
      color: 'from-orange-500 to-red-500',
      onClick: () => setShowTrainersModal(true),
      clickable: true,
      description: 'Trainers you follow'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Welcome Back!" role="user">
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
      <DashboardLayout title={`Welcome Back, ${user?.name?.split(' ')[0]}!`} role="user">
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

          {/* Stats Grid - 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          {/* Recent Courses & Blogs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Courses */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Your Courses</h3>
                <VideoCameraIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {recentCourses.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No courses enrolled yet.</p>
                ) : (
                  recentCourses.map((course) => (
                    <div 
                      key={course._id} 
                      onClick={() => navigate(`/course-player/${course._id}`)}
                      className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                    >
                      <p className="text-white font-medium">{course.title}</p>
                      <p className="text-sm text-gray-400">By {course.trainerId?.name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${course.enrollmentDetails?.isValid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {course.enrollmentDetails?.isValid ? `${course.enrollmentDetails?.daysRemaining} days left` : 'Expired'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {recentCourses.length > 0 && (
                <button
                  onClick={() => navigate('/user/courses')}
                  className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition"
                >
                  View All Courses →
                </button>
              )}
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
                    <div 
                      key={blog._id} 
                      onClick={() => navigate('/user/blogs')}
                      className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                    >
                      <p className="text-white font-medium line-clamp-1">{blog.title}</p>
                      <p className="text-sm text-gray-400">By {blog.authorId?.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(blog.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
              {recentBlogs.length > 0 && (
                <button
                  onClick={() => navigate('/user/blogs')}
                  className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition"
                >
                  View All Blogs →
                </button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* Following Trainers Modal */}
      {showTrainersModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowTrainersModal(false)}>
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-white/10 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Trainers You Follow</h3>
                <p className="text-gray-400 text-sm mt-1">Total {trainersList.length} trainers</p>
              </div>
              <button onClick={() => setShowTrainersModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {trainersList.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">You're not following any trainers yet</p>
                  <button 
                    onClick={() => { setShowTrainersModal(false); navigate('/user/trainers'); }}
                    className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white"
                  >
                    Find Trainers to Follow →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainersList.map((trainer) => (
                    <div 
                      key={trainer._id} 
                      onClick={() => { setShowTrainersModal(false); navigate(`/trainer-profile/${trainer._id}`); }}
                      className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                          {trainer.profilePic ? (
                            <img src={trainer.profilePic} alt={trainer.name} className="w-full h-full object-cover" />
                          ) : (
                            trainer.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{trainer.name}</p>
                          <p className="text-gray-400 text-sm">{trainer.specialty || 'Fitness Trainer'}</p>
                          <p className="text-gray-500 text-xs mt-1">{trainer.followers || 0} followers</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Following</span>
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

      {/* Memberships Modal */}
      {showMembershipsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowMembershipsModal(false)}>
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-white/10 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Your Active Memberships</h3>
                <p className="text-gray-400 text-sm mt-1">Total {membershipsList.length} active memberships</p>
              </div>
              <button onClick={() => setShowMembershipsModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              {membershipsList.length === 0 ? (
                <div className="text-center py-8">
                  <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No active memberships</p>
                  <button 
                    onClick={() => { setShowMembershipsModal(false); navigate('/user/gyms'); }}
                    className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white"
                  >
                    Find Gyms Near You →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {membershipsList.map((membership) => {
                    const remainingDays = Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div 
                        key={membership._id} 
                        onClick={() => { setShowMembershipsModal(false); navigate(`/gym-details/${membership.gymId?._id}`); }}
                        className="bg-white/5 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                            <BuildingOfficeIcon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold">{membership.gymId?.name}</p>
                            <p className="text-gray-400 text-sm capitalize">{membership.plan} Plan</p>
                            <p className="text-gray-500 text-xs mt-1">
                              Valid until: {new Date(membership.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${remainingDays > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {remainingDays > 0 ? `${remainingDays} days left` : 'Expired'}
                            </span>
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
    </>
  );
};

export default UserDashboard;
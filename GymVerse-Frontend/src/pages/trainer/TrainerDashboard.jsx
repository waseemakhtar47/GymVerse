import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { blogService } from '../../services/blogService';
import { courseService } from '../../services/courseService';
import { trainerService } from '../../services/trainerService';
import StarRating from '../../components/StarRating';
import { 
  VideoCameraIcon, 
  DocumentTextIcon, 
  UserGroupIcon,
  PlusCircleIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BookOpenIcon,
  StarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalBlogs: 0,
    followers: 0,
    pendingApplications: 0,
    pendingOffers: 0,
    earnings: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Ratings & Reviews state
  const [myRatings, setMyRatings] = useState([]);
  const [myAverageRating, setMyAverageRating] = useState(0);
  const [myTotalReviews, setMyTotalReviews] = useState(0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchMyRatings();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await trainerService.getTrainerStats();
      const trainerStats = statsRes.data.data || {};
      
      const blogsRes = await blogService.getMyBlogs();
      const myBlogs = blogsRes.data.data || [];
      setRecentBlogs(myBlogs.slice(0, 3));
      
      const coursesRes = await courseService.getMyCourses();
      const myCourses = coursesRes.data.data || [];
      setRecentCourses(myCourses.slice(0, 3));
      
      await fetchStudentsList();
      
      const appsRes = await trainerService.getMyApplications();
      const pendingApps = (appsRes.data.data || []).filter(a => a.status === 'pending').length;
      
      const offersRes = await trainerService.getMyRequests();
      const pendingOffers = (offersRes.data.data || []).filter(r => r.status === 'pending').length;
      
      setStats({
        totalStudents: trainerStats.students || 0,
        totalCourses: myCourses.length,
        totalBlogs: myBlogs.length,
        followers: trainerStats.followers || 0,
        pendingApplications: pendingApps,
        pendingOffers: pendingOffers,
        earnings: trainerStats.earnings || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

 const fetchStudentsList = async () => {
  setLoadingStudents(true);
  try {
    const coursesRes = await courseService.getMyCourses();
    const myCourses = coursesRes.data.data || [];
    
    if (myCourses.length === 0) {
      setStudentsList([]);
      return;
    }
    
    const studentsMap = new Map();
    
    for (const course of myCourses) {
      if (course.enrolledUsers && course.enrolledUsers.length > 0) {
        for (const enrollment of course.enrolledUsers) {
          const userData = enrollment.userId;
          const userId = userData?._id || enrollment.userId;
          
          if (!userId) continue;
          
          const enrolledAt = enrollment.enrolledAt ? new Date(enrollment.enrolledAt) : new Date();
          const validUntil = enrollment.validUntil ? new Date(enrollment.validUntil) : new Date();
          const remainingDays = Math.ceil((validUntil - new Date()) / (1000 * 60 * 60 * 24));
          const isExpired = remainingDays <= 0;
          
          const courseEnrollment = {
            courseId: course._id,
            courseTitle: course.title,
            enrolledAt: enrolledAt,
            validUntil: validUntil,
            remainingDays: remainingDays > 0 ? remainingDays : 0,
            isExpired: isExpired,
            status: enrollment.status || (isExpired ? 'expired' : 'active')
          };
          
          if (studentsMap.has(userId)) {
            const existing = studentsMap.get(userId);
            existing.courses.push(courseEnrollment);
            existing.totalCourses = existing.courses.length;
          } else {
            studentsMap.set(userId, {
              id: userId,
              name: userData?.name || 'Student',
              email: userData?.email || 'Email not available',
              phone: userData?.phone || 'N/A',
              profilePic: userData?.profilePic || null,
              courses: [courseEnrollment],
              totalCourses: 1
            });
          }
        }
      }
    }
    
    const studentsArray = Array.from(studentsMap.values());
    studentsArray.sort((a, b) => a.name.localeCompare(b.name));
    setStudentsList(studentsArray);
  } catch (error) {
    console.error('Failed to fetch students list:', error);
    toast.error('Failed to load students list');
  } finally {
    setLoadingStudents(false);
  }
};

  const fetchMyRatings = async () => {
    if (!user?._id) return;
    setLoadingReviews(true);
    try {
      const res = await trainerService.getTrainerRatings(user._id);
      setMyRatings(res.data.data.ratings || []);
      setMyAverageRating(res.data.data.averageRating || 0);
      setMyTotalReviews(res.data.data.totalReviews || 0);
    } catch (error) {
      console.error('Failed to fetch my ratings:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    if (date instanceof Date && !isNaN(date)) {
      return date.toLocaleDateString();
    }
    return 'Recently';
  };

  if (loading) {
    return (
      <DashboardLayout title="Welcome Back!" role="trainer">
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
      <DashboardLayout title={`Welcome Back, Coach ${user?.name?.split(' ')[0]}!`} role="trainer">
        <div className="overflow-y-auto max-h-[calc(100vh-120px)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div onClick={() => navigate('/trainer/courses')} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:scale-105 transition cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <VideoCameraIcon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">My Courses</p>
              <p className="text-2xl font-bold text-white">{stats.totalCourses}</p>
              <p className="text-gray-500 text-xs mt-2 opacity-0 group-hover:opacity-100 transition">Manage your courses →</p>
            </div>
            
            <div onClick={() => navigate('/trainer/blogs')} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:scale-105 transition cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <DocumentTextIcon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">My Blogs</p>
              <p className="text-2xl font-bold text-white">{stats.totalBlogs}</p>
              <p className="text-gray-500 text-xs mt-2 opacity-0 group-hover:opacity-100 transition">Manage your blogs →</p>
            </div>
            
            <div onClick={() => navigate('/trainer/followers')} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:scale-105 transition cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-linear-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">Followers</p>
              <p className="text-2xl font-bold text-white">{stats.followers}</p>
              <p className="text-gray-500 text-xs mt-2 opacity-0 group-hover:opacity-100 transition">View your followers →</p>
            </div>
            
            <div onClick={() => setShowStudentsModal(true)} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:scale-105 transition cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-white">{stats.totalStudents}</p>
              <p className="text-gray-500 text-xs mt-2 opacity-0 group-hover:opacity-100 transition">View all students →</p>
            </div>
          </div>

          {/* Pending Alerts */}
          {(stats.pendingApplications > 0 || stats.pendingOffers > 0) && (
            <div className="mb-6">
              {stats.pendingApplications > 0 && (
                <div onClick={() => navigate('/trainer/my-applications')} className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4 mb-3 cursor-pointer hover:bg-yellow-500/20 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BriefcaseIcon className="w-6 h-6 text-yellow-400" />
                      <div>
                        <p className="text-white font-semibold">{stats.pendingApplications} Pending Application{stats.pendingApplications > 1 ? 's' : ''}</p>
                        <p className="text-gray-400 text-sm">Your applications are waiting for gym owner approval</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-yellow-600 rounded-lg text-white text-sm hover:bg-yellow-700">View →</button>
                  </div>
                </div>
              )}
              
              {stats.pendingOffers > 0 && (
                <div onClick={() => navigate('/trainer/my-requests')} className="bg-purple-500/10 border border-purple-500 rounded-xl p-4 cursor-pointer hover:bg-purple-500/20 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BuildingOfficeIcon className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-white font-semibold">{stats.pendingOffers} Job Offer{stats.pendingOffers > 1 ? 's' : ''}</p>
                        <p className="text-gray-400 text-sm">Gym owners have sent you hiring requests</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700">View →</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions & Recent Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={() => navigate('/trainer/create-blog')} className="w-full flex items-center justify-between p-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition">
                  <span>Create New Blog</span>
                  <PlusCircleIcon className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/trainer/create-course')} className="w-full flex items-center justify-between p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition">
                  <span>Create New Course</span>
                  <VideoCameraIcon className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/trainer/available-gyms')} className="w-full flex items-center justify-between p-3 bg-green-600 rounded-lg text-white hover:bg-green-700 transition">
                  <span>Find Gym Jobs</span>
                  <BriefcaseIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Courses</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {recentCourses.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No courses yet. Create your first course!</p>
                ) : (
                  recentCourses.map((course) => (
                    <div key={course._id} onClick={() => navigate('/trainer/courses')} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer">
                      <p className="text-white font-medium">{course.title}</p>
                      <p className="text-sm text-gray-400">{course.enrolledUsers?.length || 0} students enrolled</p>
                      <p className="text-purple-400 text-sm">₹{course.price}</p>
                    </div>
                  ))
                )}
              </div>
              {recentCourses.length > 0 && (
                <button onClick={() => navigate('/trainer/courses')} className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition">
                  Manage All Courses →
                </button>
              )}
            </div>
          </div>

          {/* Recent Blogs */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Blogs</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {recentBlogs.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No blogs yet. Create your first blog!</p>
              ) : (
                recentBlogs.map((blog) => (
                  <div key={blog._id} onClick={() => navigate('/trainer/blogs')} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer">
                    <p className="text-white font-medium">{blog.title}</p>
                    <p className="text-sm text-gray-400">{blog.views || 0} views • {blog.likeCount || 0} likes</p>
                  </div>
                ))
              )}
            </div>
            {recentBlogs.length > 0 && (
              <button onClick={() => navigate('/trainer/blogs')} className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition">
                Manage All Blogs →
              </button>
            )}
          </div>

          {/* My Ratings & Reviews Section */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              My Ratings & Reviews from Users
            </h3>
            
            {loadingReviews ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 ml-2">Loading your reviews...</p>
              </div>
            ) : myTotalReviews === 0 ? (
              <div className="text-center py-8">
                <StarIcon className="w-16 h-16 mx-auto text-gray-500 mb-3" />
                <p className="text-gray-400">No reviews yet</p>
                <p className="text-gray-500 text-sm mt-1">When users follow and rate you, reviews will appear here</p>
                <button onClick={() => navigate('/trainer/blogs')} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700">
                  Create engaging content to get reviews →
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-6 mb-6 pb-4 border-b border-white/10">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-white">{myAverageRating.toFixed(1)}</p>
                    <StarRating rating={myAverageRating} size="md" readonly={true} />
                    <p className="text-gray-400 text-xs mt-1">out of 5</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{myTotalReviews} {myTotalReviews === 1 ? 'review' : 'reviews'} received</p>
                    <div className="mt-3 space-y-1">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = myRatings.filter(r => Math.floor(r.rating) === star).length;
                        const percentage = myTotalReviews > 0 ? (count / myTotalReviews) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-yellow-400 text-xs w-6">{star}★</span>
                            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-gray-400 text-xs w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {(showAllReviews ? myRatings : myRatings.slice(0, 4)).map((review, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                          {review.userId?.profilePic ? (
                            <img src={review.userId.profilePic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            review.userId?.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <p className="text-white font-medium">{review.userId?.name || 'Anonymous'}</p>
                            <StarRating rating={review.rating} size="sm" readonly={true} />
                          </div>
                          {review.review && (
                            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{review.review}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(new Date(review.createdAt))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {myRatings.length > 4 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-4 w-full py-2 border border-purple-500 rounded-lg text-purple-400 text-sm hover:bg-purple-500/10 transition"
                  >
                    {showAllReviews ? 'Show less' : `View all ${myRatings.length} reviews →`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>

      {/* Students List Modal */}
      {showStudentsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowStudentsModal(false)}>
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-white/10 max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">Your Students</h3>
                <p className="text-gray-400 text-sm mt-1">Total {studentsList.length} student{studentsList.length !== 1 ? 's' : ''} enrolled in your courses</p>
              </div>
              <button onClick={() => setShowStudentsModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-400 ml-3">Loading students...</p>
                </div>
              ) : studentsList.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No students enrolled yet</p>
                  <p className="text-gray-500 text-sm mt-2">Create and promote your courses to get students!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentsList.map((student) => (
                    <div key={student.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                          {student.profilePic ? (
                            <img src={student.profilePic} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            student.name?.charAt(0).toUpperCase() || 'S'
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                              {/* ✅ Student Name - Now coming from backend */}
                              <p className="text-white font-semibold text-lg">{student.name}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-1">
                                {/* ✅ Student Email - Now coming from backend */}
                                <span className="flex items-center gap-1 text-gray-400 text-xs">
                                  <EnvelopeIcon className="w-3 h-3" />
                                  {student.email !== 'Email not available' ? student.email : 'Email not available'}
                                </span>
                                {/* ✅ Student Phone - Now coming from backend */}
                                {student.phone !== 'N/A' && student.phone && (
                                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                                    <PhoneIcon className="w-3 h-3" />
                                    {student.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpenIcon className="w-4 h-4 text-purple-400" />
                              <span className="text-white text-sm font-medium">{student.totalCourses} Course{student.totalCourses !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          
                          {/* Courses List */}
                          <div className="mt-3 space-y-2">
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Enrolled Courses:</p>
                            {student.courses.map((course, idx) => (
                              <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex flex-wrap justify-between items-start gap-2">
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium flex items-center gap-2">
                                      <BookOpenIcon className="w-4 h-4 text-purple-400" />
                                      {course.courseTitle}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                                        <CalendarIcon className="w-3 h-3" />
                                        Enrolled: {formatDate(course.enrolledAt)}
                                      </span>
                                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                                        <CalendarIcon className="w-3 h-3" />
                                        Valid until: {formatDate(course.validUntil)}
                                      </span>
                                      <span className="flex items-center gap-1 text-gray-500 text-xs">
                                        <ClockIcon className="w-3 h-3" />
                                        {course.remainingDays || 365} days remaining
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`text-xs px-2 py-1 rounded-full ${course.isExpired ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                      {course.isExpired ? 'Expired' : 'Active'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Footer */}
            {studentsList.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-gray-900/50">
                <button
                  onClick={() => navigate('/trainer/courses')}
                  className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <BookOpenIcon className="w-4 h-4" />
                  Manage Your Courses →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TrainerDashboard;
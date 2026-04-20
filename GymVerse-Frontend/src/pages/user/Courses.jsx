import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { courseService } from '../../services/courseService';
import { VideoCameraIcon, PlayIcon, StarIcon, UserIcon } from '@heroicons/react/24/outline';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allCoursesRes, enrolledRes] = await Promise.all([
        courseService.getAllCourses(),
        courseService.getMyEnrolledCourses().catch(() => ({ data: { data: [] } }))
      ]);
      setCourses(allCoursesRes.data.data || []);
      setEnrolledCourses(enrolledRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await courseService.enrollCourse(courseId);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(c => c._id === courseId);
  };

  const displayCourses = activeTab === 'all' ? courses : enrolledCourses;

  if (loading) {
    return (
      <DashboardLayout title="Courses" role="user">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fitness Courses" role="user">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            All Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-lg transition ${activeTab === 'enrolled' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            My Courses ({enrolledCourses.length})
          </button>
        </div>

        {/* Course Grid */}
        {displayCourses.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <VideoCameraIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Courses Available</h3>
            <p className="text-gray-400">{activeTab === 'all' ? 'Check back later for new fitness courses.' : 'You haven\'t enrolled in any courses yet.'}</p>
            {activeTab === 'enrolled' && (
              <button onClick={() => setActiveTab('all')} className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700">Browse Courses</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCourses.map((course) => (
              <div key={course._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition">
                <div className="h-40 bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center relative">
                  <VideoCameraIcon className="w-12 h-12 text-white/50" />
                  <span className="absolute top-3 right-3 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
                    {course.level || 'Beginner'}
                  </span>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1">{course.title}</h3>
                  
                  {/* Trainer Info with Profile Picture */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-linear-to-r from-purple-500 to-blue-500 overflow-hidden flex items-center justify-center">
                      {course.trainerId?.profilePic ? (
                        <img src={course.trainerId.profilePic} alt={course.trainerId?.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">By {course.trainerId?.name || 'Trainer'}</span>
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-300 text-sm">4.8</span>
                      <span className="text-gray-500 text-xs">({course.enrolledUsers?.length || 0} students)</span>
                    </div>
                    <span className="text-purple-400 font-bold">${course.price || 0}</span>
                  </div>
                  
                  {isEnrolled(course._id) ? (
                    <button className="w-full py-2 bg-green-600 rounded-lg text-white text-sm flex items-center justify-center gap-1">
                      <PlayIcon className="w-4 h-4" />
                      Start Learning
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      disabled={enrolling === course._id}
                      className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      {enrolling === course._id ? 'Enrolling...' : `Enroll Now - $${course.price}`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Courses;
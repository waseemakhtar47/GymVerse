import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { courseService } from '../../services/courseService';
import StarRating from '../../components/StarRating';
import CourseRatingModal from '../../components/CourseRatingModal';
import { 
  VideoCameraIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  StarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedCourseForReviews, setSelectedCourseForReviews] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseService.getMyCourses();
      setCourses(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await courseService.deleteCourse(id);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleViewReviews = (course) => {
    setSelectedCourseForReviews(course);
    setShowReviewsModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout title="My Courses" role="trainer">
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
    <DashboardLayout title="My Courses" role="trainer">
      <div className="space-y-6">
        <button
          onClick={() => navigate('/trainer/create-course')}
          className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition flex items-center gap-2 w-fit"
        >
          <VideoCameraIcon className="w-5 h-5" />
          Create New Course
        </button>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <VideoCameraIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Courses Yet</h3>
            <p className="text-gray-400">Create your first course to start teaching.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition">
                {/* Thumbnail */}
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="h-40 bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <VideoCameraIcon className="w-12 h-12 text-white/50" />
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-1 line-clamp-1">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{course.description}</p>
                  
                  {/* ✅ Real Rating Display */}
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={course.averageRating || 0} size="sm" readonly={true} />
                    <span className="text-gray-400 text-xs">
                      {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings yet'}
                    </span>
                    <span className="text-gray-500 text-xs">
                      ({course.totalReviews || 0} {course.totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-purple-400 font-bold">₹{course.price}</span>
                    <span className="text-gray-400 text-xs">{course.enrolledUsers?.length || 0} students</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* View Course Button */}
                    <button
                      onClick={() => navigate(`/course-player/${course._id}`)}
                      className="flex-1 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View
                    </button>
                    
                    {/* Reviews Button - See all student reviews */}
                    <button
                      onClick={() => handleViewReviews(course)}
                      className="flex-1 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition flex items-center justify-center gap-1"
                    >
                      <StarIcon className="w-4 h-4" />
                      Reviews
                    </button>
                    
                    {/* Edit Course Button */}
                    <button
                      onClick={() => navigate(`/trainer/edit-course/${course._id}`)}
                      className="flex-1 py-2 bg-green-600/20 rounded-lg text-green-400 text-sm hover:bg-green-600/30 transition flex items-center justify-center gap-1"
                    >
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    
                    {/* Delete Course Button */}
                    <button
                      onClick={() => handleDelete(course._id, course.title)}
                      className="flex-1 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition flex items-center justify-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Reviews Modal - Trainer can see all student reviews */}
      {showReviewsModal && selectedCourseForReviews && (
        <CourseRatingModal
          course={selectedCourseForReviews}
          mode="reviews"
          onClose={() => {
            setShowReviewsModal(false);
            setSelectedCourseForReviews(null);
          }}
          onRatingSubmitted={fetchCourses}
        />
      )}
    </DashboardLayout>
  );
};

export default MyCourses;
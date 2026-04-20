import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { courseService } from '../../services/courseService';
import { VideoCameraIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseService.deleteCourse(id);
      fetchCourses();
    } catch (error) {
      alert('Failed to delete course');
    }
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
          className="px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
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
              <div key={course._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10">
                <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4">
                  <h3 className="text-white font-bold text-lg">{course.title}</h3>
                  <p className="text-white/80 text-sm">{course.level} • {course.duration}</p>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-purple-400 font-bold">${course.price}</span>
                    <span className="text-gray-400 text-sm">{course.enrolledUsers?.length || 0} students</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-700 transition flex items-center justify-center gap-1">
                      <PencilIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
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
    </DashboardLayout>
  );
};

export default MyCourses;